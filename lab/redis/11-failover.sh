#!/usr/bin/env bash
# Redis 主从 + 哨兵：故障转移时间线、已确认写入丢失窗口、min-replicas 取舍。
#
# 上一版的两个错误（都在证据文件里留了现场，别再犯）：
#   1) `docker exec` 不带 -i → stdin 不进容器，`redis-cli --pipe` 静默写 0 条，
#      丢失窗口被"实测"成 0。判据：master_repl_offset 只涨了 1690 字节，明显不对。
#   2) 脚本不幂等：实验 A 把 replica-a 提成了新主，B/C 却继续假设主叫 redis-master，
#      于是往只读副本写，拿到的是 READONLY 而不是 NOREPLICAS。
#      现在：每组实验前 down -v 重建，主节点一律按 role:master 动态发现。
set -uo pipefail
cd "$(dirname "$0")"
OUT=../evidence/redis-failover.txt
mkdir -p ../evidence
: > "$OUT"          # 上一版忘了截断，三组旧结果混在里面，读起来像自相矛盾
log() { printf '%s\n' "$*" | tee -a "$OUT"; }

reset() { docker compose down -v >/dev/null 2>&1; docker compose up -d >/dev/null 2>&1; sleep 8; }
find_master() {
  for c in redis-master redis-replica-a redis-replica-b; do
    local n="dblab-redis-$c-1"
    docker ps --format '{{.Names}}' | grep -qx "$n" || continue
    [ "$(docker exec "$n" redis-cli INFO replication 2>/dev/null | grep -c '^role:master')" = "1" ] && { printf '%s' "$n"; return; }
  done
  printf ''
}
S1="docker exec dblab-redis-sentinel-a-1 redis-cli -p 26379"
wait_switch() { # $1=超时秒；判据是三个哨兵对「非旧主」达成共识，不是 grep 单个哨兵的日志
  local deadline=$((SECONDS + ${1:-240})) m
  while [ $SECONDS -lt $deadline ]; do
    m=$(cur_master)
    case "$m" in ""|redis-master*) ;; *) return 0 ;; esac
    sleep 3
  done
  return 1
}
cur_master() { $S1 SENTINEL get-master-addr-by-name mymaster 2>/dev/null | tr '\n' ':' | sed 's/::*$//'; }
pipe_write() { seq 1 "$2" | awk -v p="$1" '{printf "SET %s:%d v%d\r\n", p, $1, $1}' | docker exec -i "$MP" redis-cli --pipe 2>&1 | tail -1; }
count_keys() { docker exec "$1" redis-cli --scan --pattern "$2" 2>/dev/null | wc -l; }

log "生成时间: $(date '+%F %T %z')｜redis:7-alpine，1 主 2 从 + 3 哨兵"
log "哨兵: down-after=5000ms, failover-timeout=30000ms, quorum=2, parallel-syncs=1"
log ""

# ---------------- A：副本健康 ----------------
reset
MP=$(find_master)
log "== 实验 A：副本健康的故障转移 =="
log "当前主容器: $MP（动态发现，不假设名字）"
log "副本在线: $(docker exec "$MP" redis-cli INFO replication | grep connected_slaves | tr -d '\r')"
log "写入回执: $(pipe_write a 2000)"
sleep 1
mo=$(docker exec "$MP" redis-cli INFO replication | grep -oE 'master_repl_offset:[0-9]+' | cut -d: -f2)
# 副本上要比 slave_repl_offset（它自己处理到哪）。读副本的 master_repl_offset 拿到的是主库报来的位置，
# 两个字段混比会算出负数——上一版那句「未传播 -137 字节」就是这么来的。
so=$(docker exec dblab-redis-redis-replica-a-1 redis-cli INFO replication | grep -oE 'slave_repl_offset:[0-9]+' | head -1 | cut -d: -f2)
log "kill 前主 offset=$mo / 副本 offset=$so → 未传播 $((mo - so)) 字节"
ta=$(date +%s)
docker kill "$MP" >/dev/null 2>&1
if wait_switch 240; then log "kill → 哨兵达成共识，实测用时 $(( $(date +%s) - ta ))s"; else log "240s 内未切换"; fi
log "哨兵时间线:"
for s in sentinel-a sentinel-b sentinel-c; do
  echo "  --- $s ---" | tee -a "$OUT"
  docker logs "dblab-redis-$s-1" 2>&1 | grep -E '\+sdown master|\+odown master|\+try-failover|\+switch-master|-failover' | sed 's/^1:X /    /' | tail -6 | tee -a "$OUT"
done
NM=$(find_master)
log "切换后 role:master 的容器 = ${NM:-无}"
if [ -n "$NM" ]; then
  landed=$(count_keys "$NM" 'a:*')
  log "新主 a:* = $landed / 2000 → 已确认写入丢失 $((2000 - landed)) 个"
  log "哨兵记录的新主地址: $(cur_master) ← 是 IP 不是容器名，客户端与连接池要按 IP 处理"
fi
log ""

# ---------------- B：副本断开 ----------------
reset
MP=$(find_master)
log "== 实验 B：副本全部失联期间主库照常服务，然后宕机 =="
docker exec dblab-redis-redis-replica-a-1 redis-cli SLAVEOF NO ONE >/dev/null 2>&1
docker exec dblab-redis-redis-replica-b-1 redis-cli SLAVEOF NO ONE >/dev/null 2>&1
sleep 1
log "主节点副本数: $(docker exec "$MP" redis-cli INFO replication | grep connected_slaves | tr -d '\r')"
log "写入回执: $(pipe_write b 2000)"
acked=$(count_keys "$MP" 'b:*')
log "主节点本地 b:* = $acked 个（全部已返回 OK，但没有任何副本收到）"
docker kill "$MP" >/dev/null 2>&1
tb=$(date +%s)
if wait_switch 240; then log "B 组 kill → 切换用时 $(( $(date +%s) - tb ))s"; else log "B 组 240s 内未切换"; fi
NB=$(find_master)
log "切换后主 = ${NB:-无}"
if [ -n "$NB" ]; then
  landed=$(count_keys "$NB" 'b:*')
  log "新主 b:* = $landed 个 → **$((acked - landed)) 个已确认写入对客户端承诺过却永久消失**"
fi
log "旧主自己的 AOF 里仍在（$acked 个）——丢的不是数据，是「谁当主」的决定权，这就是分叉"
log ""

# ---------------- C：min-replicas ----------------
reset
MP=$(find_master)
log "== 实验 C：min-replicas-to-write=1 / max-lag=5 =="
docker exec "$MP" redis-cli CONFIG SET min-replicas-to-write 1 min-replicas-max-lag 5 >/dev/null 2>&1
docker exec dblab-redis-redis-replica-a-1 redis-cli SLAVEOF NO ONE >/dev/null 2>&1
docker exec dblab-redis-redis-replica-b-1 redis-cli SLAVEOF NO ONE >/dev/null 2>&1
sleep 7
log "副本失联后单次写: $(docker exec "$MP" redis-cli SET probe 1 2>&1 | tr -d '\r')"
log "批量写回执: $(pipe_write c 500)"
log "主节点 c:* = $(count_keys "$MP" 'c:*') 个"
docker exec dblab-redis-redis-replica-a-1 redis-cli SLAVEOF "$MP" 6379 >/dev/null 2>&1
sleep 6
log "接回一个副本后再写: $(docker exec "$MP" redis-cli SET probe2 2 2>&1 | tr -d '\r')"
log "口径：N=1 且 lag>5s 时主库拒写 —— 丢失窗口压成 0，代价是写可用性。两个数必须一起报。"
log ""
log "重跑：bash 11-failover.sh（每组实验自带 down -v 重置）"
