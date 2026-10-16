#!/usr/bin/env bash
# 让**已发布的练习解答**也进站内搜索（pagefind）—— 不重建整站、不牺牲秒级发布。
#
# 背景：解答页是运行时渲染（`prerender=false`），构建产物 `dist/client` 里没有它们，
#   而 pagefind 只索引构建产物 → 题解搜不到（2026-10-16 实测：索引里 grep 题解 slug 零命中）。
# 做法：把已发布解答的 SSR HTML 抓下来放进一份**临时站点副本**，对它跑 pagefind，
#   再把生成好的 `pagefind/` 原子换进 `/var/www/blog/`。
#
# ⚠️ 三条必须守住的点：
#   1. 抓下来的 HTML **绝不能**放进 `dist/client`：那会让这些静态文件盖住 SSR 路由，
#      「改完即生效」就没了（静态快照会先命中）。所以只放临时副本里。
#   2. 与部署脚本**共用同一把锁**（/var/lock/blog-deploy.lock）：构建会重写 dist/client，
#      索引要读它 —— 并发会索引到半成品目录。
#   3. 换入用**原子 rename**（先 mv 旧的、再 mv 新的），别用 rsync 覆盖：
#      搜索只是一瞬间不可用，胜过出现一个半截索引。
#
# 用法（服务器上，root）：bash /root/blog-src/ops/reindex-search.sh
set -euo pipefail

REPO=${REPO:-/root/blog-src}
WEB=/var/www/blog
SRC=$REPO/dist/client
TMP=/tmp/blog-pagefind
API=${NOTELAB_API:-http://127.0.0.1:8001}

exec 9>/var/lock/blog-deploy.lock
# ⚠️ REINDEX_LOCK=0 表示「调用方已经持有这把锁」（deploy-ssr.sh 末尾就是这么调它的）——
#    那种情况下再 flock 一次会**互相等待到死锁**（flock 是按打开的文件描述计数的，跨进程不叠加）。
if [ "${REINDEX_LOCK:-1}" != "0" ]; then
	flock -w 900 9 || { echo "❌ 等锁超时（另一个构建/索引还在跑）"; exit 1; }
	echo "==> 已拿到部署锁"
else
	echo "==> 调用方已持锁（REINDEX_LOCK=0），跳过加锁"
fi

[ -d "$SRC" ] || { echo "❌ 没有构建产物：$SRC（先跑 ops/deploy-ssr.sh）"; exit 1; }

echo "==> 1/5 取已发布解答清单（公开只读接口）"
LIST=$(curl -sS --max-time 20 "$API/api/practice/public/solutions")
COUNT=$(printf '%s' "$LIST" | python3 -c 'import json,sys; print(len(json.load(sys.stdin).get("items",[])))' 2>/dev/null || echo "?")
echo "  已发布解答：$COUNT 条"
printf '%s' "$LIST" | python3 -c 'import json,sys
for i in json.load(sys.stdin).get("items", []):
    print(i["slug"])' > "$TMP.slugs"
[ -s "$TMP.slugs" ] || { echo "⚠️ 清单为空（或接口不可用）—— 那就只索引静态站，不抓解答"; }

echo "==> 2/5 造站点副本（硬链接：秒级、不占额外空间、不动原目录）"
rm -rf "$TMP"
cp -al "$SRC" "$TMP"

echo "==> 3/5 抓解答的 SSR HTML 进副本"
GOT=0
while read -r slug; do
	[ -n "$slug" ] || continue
	mkdir -p "$TMP/solutions/$slug"
	code=$(curl -sS --max-time 30 -o "$TMP/solutions/$slug/index.html" -w '%{http_code}' \
		--resolve haolo.cloud:443:127.0.0.1 "https://haolo.cloud/blog/solutions/$slug/")
	if [ "$code" != "200" ]; then
		echo "  ⚠️ $slug → HTTP $code（跳过）"
		rm -rf "$TMP/solutions/$slug"
		continue
	fi
	if ! grep -q 'data-pagefind-body' "$TMP/solutions/$slug/index.html"; then
		echo "  ⚠️ $slug 的 HTML 里没有 data-pagefind-body —— pagefind 会忽略整页"
	fi
	GOT=$((GOT + 1))
done < "$TMP.slugs"
echo "  抓到 $GOT 篇"
[ "$GOT" -gt 0 ] || { echo "❌ 一篇都没抓到，放弃（不动线上索引）"; exit 1; }

echo "==> 4/5 跑 pagefind（输出到副本的 pagefind-new，避免就地改硬链接的文件）"
cd "$REPO"
npx --no-install pagefind --site "$TMP" --output-subdir pagefind-new 2>&1 | tail -14
[ -f "$TMP/pagefind-new/pagefind.js" ] || { echo "❌ 没生成 pagefind.js，放弃"; exit 1; }

echo "==> 5/5 原子换入线上索引"
rm -rf "$WEB/.pagefind-new" "$WEB/pagefind.old"
cp -r "$TMP/pagefind-new" "$WEB/.pagefind-new"
if [ -d "$WEB/pagefind" ]; then mv "$WEB/pagefind" "$WEB/pagefind.old"; fi
mv "$WEB/.pagefind-new" "$WEB/pagefind"
rm -rf "$WEB/pagefind.old"
chown -R root:www-data "$WEB/pagefind"
chmod -R 755 "$WEB/pagefind"
echo "  ✅ $(du -sh "$WEB/pagefind" | cut -f1) 已换入"

echo "==> 自检：抽查抽查前 3 篇解答是否真的进了索引"
BAD=0
while read -r slug; do
	[ -n "$slug" ] || continue
	if grep -rq "$slug" "$WEB/pagefind" 2>/dev/null; then
		echo "  ✓ $slug"
	else
		echo "  ✗ $slug 不在索引里"
		BAD=1
	fi
done < <(sed -n '1,3p' "$TMP.slugs")
[ "$BAD" = "0" ] || { echo "❌ 自检失败：解答没进索引"; exit 1; }

rm -rf "$TMP"
echo "完成：已发布解答已进入站内搜索索引（不需要重建整站）"
