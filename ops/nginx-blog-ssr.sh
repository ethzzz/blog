#!/usr/bin/env bash
# 给博客的 **SSR 路由**加 nginx 反代：/blog/solutions/** 与 /blog/preview/** → 本机 3012（notelab-blog-ssr 进程）。
#
# 为什么只反代这两段：整站仍是 nginx 直接发静态文件（快，且不吃 Node 内存 —— 这台机器只有
# 2 核 3.9G，swap 已经吃紧）；只有这两类页面需要运行时渲染：
#   · /blog/solutions/**  练习解答：正文来自 Notelab 数据库（发布即生效，不需重建）
#   · /blog/preview/**    草稿预览：正文来自 Notelab 内存里的短期草稿（后台编辑器的预览 iframe）
#
# 用法（在服务器上，root）：
#   bash /root/blog-src/ops/nginx-blog-ssr.sh
#
# 幂等：**逐个前缀**判断，已有的跳过、缺的补上（2026-10-16 加预览时改的：原来一看 solutions 在就直接 exit 0，
# 那样加第二个前缀永远不生效）。失败自动回滚（nginx -t 不通过时把备份还原）。
set -euo pipefail

PORT=${SSR_PORT:-3012}
CONF=$(grep -rlE "location +(\^~ +)?/blog" /etc/nginx/sites-enabled/ 2>/dev/null | head -1 || true)
[ -n "$CONF" ] || { echo "❌ 没找到含 /blog 的 nginx 站点配置"; exit 1; }
echo "站点配置：$CONF"

# ⚠️ 备份必须放在 sites-enabled **之外**：nginx 会加载该目录下的每一个文件，
#    在里面留一个 .bak = 多一份 server 块 = nginx -t 直接报 duplicate default server，
#    而且这个错误看起来跟本次改动毫无关系（排查时要想到「谁把备份放这儿了」）。
BACKUP_DIR=/root/.nginx-backups
mkdir -p "$BACKUP_DIR"
BACKUP="$BACKUP_DIR/$(basename "$CONF").bak-$(date +%Y%m%d-%H%M%S)"
cp "$CONF" "$BACKUP"
echo "已备份 → $BACKUP"

# 用 python 而不是 sed：多行块 + 缩进 + 逐个前缀判断，sed 在这种位置上很容易插错。
python3 - "$CONF" "$PORT" <<'PY'
import re, sys
path, port = sys.argv[1], sys.argv[2]
src = open(path, encoding="utf-8").read()

# 前缀 → 注释里的说明。加一个新前缀只需要在这里加一行。
PREFIXES = [
    ("/blog/solutions", "练习实践解答页：内容运行时从数据库取"),
    ("/blog/preview", "草稿预览页：内容运行时从 Notelab 的内存短期存储取"),
]

def block(prefix, label):
    return (
        "\t# Notelab %s，交给本机的 SSR 进程\n" % label +
        "\t# （见 astro.config.mjs 的 @astrojs/node adapter；构建产物 dist/server/entry.mjs）\n" +
        "\t# ⚠️ 用 ^~ 前缀匹配：更长前缀优先，所以 /blog/solutions 与 /blog/preview 会盖住 location /blog，\n" +
        "\t#    其余博客页面仍由 nginx 直接发静态文件。\n" +
        "\tlocation ^~ %s {\n" % prefix +
        "\t\tproxy_pass http://127.0.0.1:%s;\n" % port +
        "\t\tproxy_http_version 1.1;\n" +
        "\t\tproxy_set_header Host $host;\n" +
        "\t\tproxy_set_header X-Real-IP $remote_addr;\n" +
        "\t\tproxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n" +
        "\t\tproxy_set_header X-Forwarded-Proto $scheme;\n" +
        "\t}\n"
    )

added, skipped = [], []
for prefix, label in PREFIXES:
    if re.search(r"location\s+\^~\s+%s\b" % re.escape(prefix), src):
        skipped.append(prefix)
        continue
    m = re.search(r"^[ \t]*location[^\n{]*/blog[^\n{]*\{", src, re.M)
    if not m:
        sys.exit("找不到 location /blog 声明")
    src = src[:m.start()] + block(prefix, label) + src[m.start():]
    added.append(prefix)

open(path, "w", encoding="utf-8").write(src)
print("已插入：" + (", ".join(added) if added else "（无）") + "；已存在跳过：" + (", ".join(skipped) if skipped else "（无）"))
PY

if nginx -t; then
	systemctl reload nginx
	echo "✅ nginx 已 reload"
else
	echo "❌ nginx 配置校验失败，回滚"
	cp "$BACKUP" "$CONF"
	exit 1
fi

echo "==> 验证（直连本机 443，绕过公网）"
fail=0
for p in /blog/ /blog/solutions/ /blog/solutions/algo-01-ex01-two-sum-ii/ /blog/posts/hello-world/ /blog/rss.xml; do
	printf "  %-46s → " "$p"
	code=$(curl -s -o /dev/null -w '%{http_code}' --resolve haolo.cloud:443:127.0.0.1 "https://haolo.cloud$p")
	echo "$code"
	[ "$code" = "200" ] || fail=1
done

# 预览路由：拿一个必然不存在的 token 探 —— 期待 **404 且响应体是 Astro 渲染的那一页**
# （含「预览已过期」）。只看状态码分不清「SSR 路由生效」还是「nginx 自己的 404」。
printf "  %-46s → " "/blog/preview/<bogus>"
body=$(curl -s --resolve haolo.cloud:443:127.0.0.1 "https://haolo.cloud/blog/preview/00000000000000000000000000000000/")
code=$(curl -s -o /dev/null -w '%{http_code}' --resolve haolo.cloud:443:127.0.0.1 "https://haolo.cloud/blog/preview/00000000000000000000000000000000/")
echo "$code"
if [ "$code" = "404" ] && printf '%s' "$body" | grep -q "预览已过期"; then
	echo "    ✅ 预览路由由 SSR 进程应答（不是 nginx 的默认 404）"
else
	echo "    ❌ 预览路由没走到 SSR 进程（状态码 $code）"
	fail=1
fi

[ $fail -eq 0 ] && echo "全部通过" || { echo "有路由不对，请检查"; exit 1; }
