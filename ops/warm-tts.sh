#!/usr/bin/env bash
# 博客「朗读全文」用的 kokoro TTS 预热（保持模型热页 resident）。
#
# 为什么需要这个脚本：
#   这台服务器只有 3.8G 内存、swap 已经用了 2.7G，kokoro 容器常驻约 2G。
#   长时间没人点「朗读」时，模型的热页会被内核换出去；下一次请求要先把这些页
#   从 swap 拉回来 —— 实测出现过**首块 74 秒**（刚合成过的状态下只要 2–4 秒）。
#   定时空跑一次极短合成，把这些页保持热，用户第一次点就能较快出声。
#
# 打的是容器本体（127.0.0.1:8880），不经 nginx：
#   ① 少一跳，预热结果更能代表容器状态；
#   ② API key 运行时从容器环境变量里读，不写进脚本、不进仓库（nginx 反代时注入的是同一个值）。
#
# 用法（服务器上，root）：
#   bash /root/blog-src/ops/warm-tts.sh              # 静默跑一次（无输出 = 正常）
#   bash /root/blog-src/ops/warm-tts.sh --verbose    # 打印耗时
#
# 定时（root crontab，与本机其它 ops 任务一致走 cron）：
#   * * * * * /bin/bash /root/blog-src/ops/warm-tts.sh >> /root/ops/tts-warm.log 2>&1
#
# 频率依据（2026-10-23 01:00 实测衰减曲线，脚本 /tmp/tts-decay*.sh）：
#   空闲 0s   -> 1.57s
#   空闲 60s  -> 1.56s   ← 仍在热窗口内
#   空闲 180s -> 6.2s / 19.2s（两次同条件，取决于当时的内存压力）
#   空闲 ~1h  -> 74s（线上真实出现过的首块耗时）
#   拐点在 60s~180s 之间，所以取 **1 分钟** 一次：始终待在实测过的热窗口里。
#   代价：一次 1 字合成 ≈1.5 秒 CPU，2 核机器上约 1.25%；且下面有活跃跳过，
#   真有人朗读时不会跟它抢串行队列。
#
# ⚠️ 跳过窗口必须 **小于** cron 间隔，否则上一分钟的预热会把自己下一次拦住。
#   这里 interval=60s，IDLE_WINDOW 默认 50s。
set -uo pipefail

CONTAINER=${CONTAINER:-kokoro}
ENDPOINT=${ENDPOINT:-http://127.0.0.1:8880/v1/audio/speech}
VOICE=${VOICE:-zf_xiaoxiao}   # 与 src/scripts/tts-reader.ts 里的 VOICE 保持一致
TEXT=${TEXT:-嗯}              # 1 个字，足够触发一次完整推理
MAX_TIME=${MAX_TIME:-90}      # 上一次卡住也别把后面几次 cron 堆起来
LOCK=/var/lock/tts-warm.lock
VERBOSE=""
[ "${1:-}" = "--verbose" ] && VERBOSE=1

ts() { date '+%F %T'; }

# 容器没在跑就跳过：拉起容器是 docker restart policy 的事，这里不做兜底重启
if ! docker inspect -f '{{.State.Running}}' "$CONTAINER" 2>/dev/null | grep -q true; then
	echo "$(ts) [skip] 容器 $CONTAINER 未运行"
	exit 0
fi

# 避免上一次还没返回就叠加下一次
exec 9>"$LOCK"
if ! flock -n 9; then
	[ -n "$VERBOSE" ] && echo "$(ts) [skip] 上次预热仍在进行"
	exit 0
fi

# 刚有人朗读过就跳过：模型已经是热的，这时再插一次请求只会占串行队列
# （kokoro 服务端全局串行），对正在听的人纯属添堵。
# 必须小于 cron 间隔（60s），否则会把下一次预热自己拦掉。
IDLE_WINDOW=${IDLE_WINDOW:-50}
if docker logs --since "${IDLE_WINDOW}s" "$CONTAINER" 2>&1 | grep -q 'Synthesizing'; then
	[ -n "$VERBOSE" ] && echo "$(ts) [skip] ${IDLE_WINDOW}s 内已有合成请求，无需预热"
	exit 0
fi

KEY=$(docker inspect "$CONTAINER" --format '{{range .Config.Env}}{{println .}}{{end}}' |
	sed -n 's/^KOKORO_API_KEY=//p')
if [ -z "${KEY:-}" ]; then
	echo "$(ts) [error] 取不到 KOKORO_API_KEY，跳过"
	exit 0 # 不返回非 0：cron 反复报错只会刷日志，不会自愈
fi

body="{\"model\":\"kokoro\",\"input\":\"$TEXT\",\"voice\":\"$VOICE\",\"response_format\":\"mp3\"}"
start_ms=$(date +%s%3N)
code=$(curl -s -o /dev/null -w '%{http_code}' --max-time "$MAX_TIME" \
	-X POST "$ENDPOINT" \
	-H 'Content-Type: application/json' \
	-H "Authorization: Bearer $KEY" \
	--data-binary "$body")
cost=$(( $(date +%s%3N) - start_ms ))

# 平时完全安静（只把异常写进日志，避免日志被刷爆）；--verbose 才打印每次耗时
if [ "$code" != "200" ]; then
	echo "$(ts) [fail] http=$code cost=${cost}ms"
elif [ -n "$VERBOSE" ]; then
	echo "$(ts) [ok] http=200 cost=${cost}ms"
fi
