#!/usr/bin/env bash
# 把**运行时渲染的内容（练习解答）**补进构建产物里的两份衍生索引：
#   ① 站内搜索（pagefind）：解答页不在 dist/client 里，pagefind 只索引构建产物 → 题解搜不到
#   ② sitemap：@astrojs/sitemap 只枚举预渲染路由 → sitemap 里只有聚合页 /blog/solutions/，
#      单篇题解进不去（搜索引擎只能靠文章里的内链发现它们）
#
# 为什么两件事放一个脚本：它们**消费同一份「已发布解答清单」**，而且都必须在每次构建之后补跑
# （构建会把两份索引都重置成「只有静态页」的形态）。分成两个脚本只会多一个调用点、多一处漂移。
#
# 做法：把已发布解答的 SSR HTML 抓下来放进一份**临时站点副本**，对它跑 pagefind，
#   再把生成好的 `pagefind/` 原子换进 `/var/www/blog/`；sitemap 则是就地幂等注入一段带标记的 URL 块。
#
# ⚠️ 四条必须守住的点：
#   1. 抓下来的 HTML **绝不能**放进 `dist/client`：那会让这些静态文件盖住 SSR 路由，
#      「改完即生效」就没了（静态快照会先命中）。所以只放临时副本里。
#   2. 与部署脚本**共用同一把锁**（/var/lock/blog-deploy.lock）：构建会重写 dist/client，
#      索引要读它 —— 并发会索引到半成品目录。
#   3. 换入用**原子 rename**（先 mv 旧的、再 mv 新的），别用 rsync 覆盖：
#      搜索只是一瞬间不可用，胜过出现一个半截索引。
#   4. sitemap 注入必须**幂等**：用 `<!-- notelab:solutions -->` 标记包裹，重复跑先删旧块再插，
#      否则同一份产物上跑两次会把解答 URL 叠加两遍。
#
# 用法（服务器上，root）：bash /root/blog-src/ops/refresh-indexes.sh
set -euo pipefail

REPO=${REPO:-/root/blog-src}
WEB=/var/www/blog
SRC=$REPO/dist/client
TMP=/tmp/blog-indexes
API=${NOTELAB_API:-http://127.0.0.1:8001}
SITE=${SITE:-https://haolo.cloud}

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

echo "==> 1/6 取已发布解答清单（公开只读接口）"
curl -sS --max-time 20 "$API/api/practice/public/solutions" -o "$TMP.solutions.json"
COUNT=$(python3 -c 'import json,sys; print(len(json.load(open(sys.argv[1],encoding="utf-8")).get("items",[])))' "$TMP.solutions.json" 2>/dev/null || echo "?")
echo "  已发布解答：$COUNT 条"
python3 -c 'import json,sys
for i in json.load(open(sys.argv[1], encoding="utf-8")).get("items", []):
    print(i["slug"])' "$TMP.solutions.json" > "$TMP.slugs"
[ -s "$TMP.slugs" ] || { echo "⚠️ 清单为空（或接口不可用）—— 那就只处理静态站，不抓解答"; }

echo "==> 2/6 造站点副本（硬链接：秒级、不占额外空间、不动原目录）"
rm -rf "$TMP"
cp -al "$SRC" "$TMP"

echo "==> 3/6 抓解答的 SSR HTML 进副本"
# 自检判据要用的基线：静态产物里**带 data-pagefind-body** 的页数（pagefind 只索引这类页）
STATIC_TAGGED=$(grep -rl 'data-pagefind-body' "$SRC" --include='*.html' 2>/dev/null | wc -l)
GOT=0
while read -r slug; do
	[ -n "$slug" ] || continue
	mkdir -p "$TMP/solutions/$slug"
	code=$(curl -sS --max-time 30 -o "$TMP/solutions/$slug/index.html" -w '%{http_code}' \
		--resolve haolo.cloud:443:127.0.0.1 "$SITE/blog/solutions/$slug/")
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

echo "==> 4/6 跑 pagefind（输出到副本的 pagefind-new，避免就地改硬链接的文件）"
cd "$REPO"
if ! npx --no-install pagefind --site "$TMP" --output-subdir pagefind-new > "$TMP/pagefind.log" 2>&1; then
	echo "❌ pagefind 失败："; tail -20 "$TMP/pagefind.log"; exit 1
fi
tail -10 "$TMP/pagefind.log"
[ -f "$TMP/pagefind-new/pagefind.js" ] || { echo "❌ 没生成 pagefind.js，放弃"; exit 1; }

# 自检①：页数必须 ≥「静态里带标记的页数 + 抓到的解答数」。
# ⚠️ 别用 `grep 索引目录里的 slug` 做判据 —— pagefind 的索引是压缩/编码过的，
#    题解**在索引里**也 grep 不到（2026-10-16 实测：页数 203→209 说明成功，grep 却零命中，
#    差点把一次成功判成失败）。页数才是可靠信号。
INDEXED=$(grep -oE 'Indexed [0-9]+ pages' "$TMP/pagefind.log" | grep -oE '[0-9]+' | head -1)
NEED=$((STATIC_TAGGED + GOT))
echo "  索引页数=$INDEXED（静态带标记 $STATIC_TAGGED + 解答 $GOT = 期望 ≥ $NEED）"
if [ "${INDEXED:-0}" -lt "$NEED" ]; then
	echo "❌ 索引页数不足，说明解答没被索引进去（不动线上索引）"
	exit 1
fi

echo "==> 5/6 原子换入线上搜索索引"
rm -rf "$WEB/.pagefind-new" "$WEB/pagefind.old"
cp -r "$TMP/pagefind-new" "$WEB/.pagefind-new"
if [ -d "$WEB/pagefind" ]; then mv "$WEB/pagefind" "$WEB/pagefind.old"; fi
mv "$WEB/.pagefind-new" "$WEB/pagefind"
rm -rf "$WEB/pagefind.old"
chown -R root:www-data "$WEB/pagefind"
chmod -R 755 "$WEB/pagefind"
echo "  ✅ $(du -sh "$WEB/pagefind" | cut -f1) 已换入"

echo "==> 6/6 sitemap：把解答 URL 幂等补进 sitemap-0.xml"
if [ ! -f "$WEB/sitemap-0.xml" ]; then
	echo "  ⚠️ 没有 $WEB/sitemap-0.xml（这份构建没生成 sitemap？）—— 跳过"
else
	python3 - "$WEB/sitemap-0.xml" "$TMP.solutions.json" "$SITE" <<'PY'
import json, re, sys
sm, js, site = sys.argv[1], sys.argv[2], sys.argv[3]
items = json.load(open(js, encoding="utf-8")).get("items", [])
def one(i):
    loc = f"<loc>{site}/blog/solutions/{i['slug']}/</loc>"
    # lastmod 用「最近更新」，没有就退回发布日期；两者都没有就干脆不写（空的 <lastmod> 是无效值）
    d = (i.get("updated") or i.get("published") or "").strip()
    return f"<url>{loc}" + (f"<lastmod>{d}</lastmod>" if d else "") + "</url>"
block = "<!-- notelab:solutions -->" + "".join(one(i) for i in items) + "<!-- /notelab:solutions -->"
xml = open(sm, encoding="utf-8").read()
if "</urlset>" not in xml:
    sys.exit("❌ sitemap 里找不到 </urlset>，格式不对（不动它）")
xml = re.sub(r"<!-- notelab:solutions -->.*?<!-- /notelab:solutions -->", "", xml, flags=re.S)
xml = xml.replace("</urlset>", block + "</urlset>")
open(sm, "w", encoding="utf-8").write(xml)
print(f"  注入 {len(items)} 条解答 URL")
PY
	chown root:www-data "$WEB/sitemap-0.xml"
	chmod 755 "$WEB/sitemap-0.xml"
	# 自检③：注入条数必须等于已发布条数（幂等性的保证：重复跑不会叠加），且整份 XML 仍可解析
	INJECTED=$(python3 - "$WEB/sitemap-0.xml" <<'PY'
import re, sys
xml = open(sys.argv[1], encoding="utf-8").read()
m = re.search(r"<!-- notelab:solutions -->(.*?)<!-- /notelab:solutions -->", xml, re.S)
print(len(re.findall(r"<loc>", m.group(1))) if m else 0)
PY
)
	echo "  sitemap 里的解答 URL 数=$INJECTED（应等于 $COUNT）"
	[ "$INJECTED" = "$COUNT" ] || { echo "❌ 注入条数与已发布条数不一致"; exit 1; }
	python3 -c 'import sys,xml.dom.minidom as m; m.parse(sys.argv[1]); print("  ✅ sitemap XML 可解析")' "$WEB/sitemap-0.xml"
fi

echo "==> 自检②：抽查抓取结果与线上 pagefind-entry.json"
if [ -f "$WEB/pagefind/pagefind-entry.json" ]; then
	echo "  线上 pagefind-entry.json: $(head -c 200 "$WEB/pagefind/pagefind-entry.json")"
fi
BAD=0
while read -r slug; do
	[ -n "$slug" ] || continue
	if [ -s "$TMP/solutions/$slug/index.html" ]; then
		echo "  ✓ 抓到了 $slug 的 HTML（已交给 pagefind；内容级验证见搜索实测）"
	else
		echo "  ✗ $slug 的 HTML 不在副本里"
		BAD=1
	fi
done < <(sed -n '1,3p' "$TMP.slugs")
[ "$BAD" = "0" ] || { echo "❌ 自检失败"; exit 1; }

rm -rf "$TMP"
echo "完成：已发布解答已进入站内搜索索引与 sitemap（不需要重建整站）"
