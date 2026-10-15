#!/usr/bin/env bash
# 给博客的 SSR 路由加 nginx 反代：/blog/solutions/** → 本机 3012（notelab-blog-ssr 进程）。
#
# 为什么只反代这一段：整站仍是 nginx 直接发静态文件（快，且不吃 Node 内存 —— 这台机器只有
# 2 核 3.9G，swap 已经吃紧）；只有解答两个页面需要运行时渲染。
#
# 用法（在服务器上，root）：
#   bash /root/blog-src/ops/nginx-blog-ssr.sh
#
# 幂等：已有该 location 就跳过。失败自动回滚（nginx -t 不通过时把备份还原）。
set -euo pipefail

PORT=${SSR_PORT:-3012}
CONF=$(grep -rlE "location +(\^~ +)?/blog" /etc/nginx/sites-enabled/ 2>/dev/null | head -1 || true)
[ -n "$CONF" ] || { echo "❌ 没找到含 /blog 的 nginx 站点配置"; exit 1; }
echo "站点配置：$CONF"

if grep -q "location \^~ /blog/solutions" "$CONF"; then
	echo "✅ 已有 /blog/solutions 反代，跳过"
	exit 0
fi

BACKUP="$CONF.bak-$(date +%Y%m%d-%H%M%S)"
cp "$CONF" "$BACKUP"
echo "已备份 → $BACKUP"

# 在第一条 location ... /blog 声明**之前**插入。用 python 而不是 sed：
# 这段要插多行且要保留缩进，sed 的追加语义在这个位置很容易插错地方。
python3 - "$CONF" "$PORT" <<'PY'
import re, sys
path, port = sys.argv[1], sys.argv[2]
src = open(path, encoding="utf-8").read()
block = """	# Notelab 练习实践解答页：内容运行时从数据库取，交给本机的 SSR 进程
	# （见 astro.config.mjs 的 @astrojs/node adapter；构建产物 dist/server/entry.mjs）
	# ⚠️ 必须排在 location /blog 之前：这两个页面走 Node，其余博客页面仍由 nginx 直接发文件。
	location ^~ /blog/solutions {
		proxy_pass http://127.0.0.1:%s;
		proxy_http_version 1.1;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
	}
""" % port
m = re.search(r"^[ \t]*location[^\n{]*/blog[^\n{]*\{", src, re.M)
if not m:
	sys.exit("找不到 location /blog 声明")
src = src[:m.start()] + block + src[m.start():]
open(path, "w", encoding="utf-8").write(src)
print("已插入反代块")
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
[ $fail -eq 0 ] && echo "全部 200" || { echo "有路由不是 200，请检查"; exit 1; }
