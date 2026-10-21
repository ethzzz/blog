#!/usr/bin/env bash
# 博客（Astro hybrid 模式）在服务器上的构建与发布。
#
# 为什么需要这个脚本：加了 Node adapter 之后，产物分成两份、还多了一个常驻进程 ——
#   dist/client/  静态站点（绝大多数页面，由 nginx 直接发文件）
#   dist/server/  只有 solutions 两个页面在运行时渲染（内容来自 Notelab 数据库）
# 于是「把 dist 拷到 /var/www/blog」这一步已经不够了，还要管那个 Node 进程。
#
# 用法（在服务器上，root）：
#   bash /root/blog-src/ops/deploy-ssr.sh
#
# 幂等：重复跑只会重新构建并覆盖产物；pm2 进程是 restart-or-start。
# ⚠️ nginx 那一段（把 /blog/solutions/ 反代到本进程）在 ops/nginx-blog-ssr.sh，单独跑
#    —— 它要 reload nginx，和「发个版」不是一类动作，分开才不会一次搞出两个故障面。
set -euo pipefail

REPO=${REPO:-/root/blog-src}
WEB=/var/www/blog
SSR_NAME=notelab-blog-ssr
SSR_PORT=3012

# ⚠️ 服务器上只有这一条**构建路径**，但它有多个**触发者**：后台的部署任务（BlogDeployService）、
#    GitHub Actions（push 后 ssh 进来跑同一个脚本）、以及人手动跑。
#    两个构建同时 `find /var/www/blog -mindepth 1 -delete` + 覆盖写，会拼出一个半成品站点
#    （上一个还活着、下一个已经在清目录）。所以用 flock 把触发者**排成一队**：
#    后来者等着，而不是插进去。等超过 15 分钟就报错退出，别把 CI 卡到超时。
#    注：后台那侧还有自己的单线程队列 +「部署期间写入 409」—— 那些保护的是**仓库**，
#    这把锁保护的是**服务器产物**，两件事。
exec 9>/var/lock/blog-deploy.lock
flock -w 900 9 || { echo "❌ 等部署锁超时（另一个部署还在跑，见 /var/lock/blog-deploy.lock）"; exit 1; }
echo "==> 0/6 已拿到部署锁（/var/lock/blog-deploy.lock）"

echo "==> 1/6 拉取最新代码（$REPO）"
cd "$REPO"
BEFORE=$(git rev-parse HEAD)
git pull --ff-only
AFTER=$(git rev-parse HEAD)
[ "$BEFORE" = "$AFTER" ] && echo "  已是最新 $AFTER" || echo "  $BEFORE → $AFTER"

echo "==> 2/6 依赖"
# 判据是「package-lock.json 是否比 node_modules/.package-lock.json 新」，不是 git diff。
# ⚠️ 用 git diff「本次 pull 有没有改 lock」会漏：手工 pull 过、或上一次部署中途失败再跑，
#    diff 都是空的，于是新依赖永远装不上 —— 症状是 Cannot find module '@astrojs/node'，
#    而日志里还理直气壮写着「lock 未变，跳过」。
if [ ! -f node_modules/.package-lock.json ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
	echo "  依赖有变 → npm ci"
	npm ci --no-audit --no-fund
else
	echo "  依赖已是最新，跳过（省 ~40s）"
fi

echo "==> 3/6 构建（static + SSR）"
# ⚠️ 全量文章迁为 MDX 后编译内存明显上升：1536MB 会在静态页生成阶段
#    「Reached heap limit」直接崩（2026-10-21 实测，堆顶 1530MB）。
#    服务器 3.8G 内存 + 4G swap，调到 2560 留余量；再遇 OOM 先看 free -h 再调。
NODE_OPTIONS=--max-old-space-size=2560 npm run build
# ⚠️ 两个产物都要在：只有 client 说明 adapter 没生效（那么 solutions 会 404），
#    只有 server 说明静态站没生成（整站挂）。
[ -f dist/client/index.html ] || { echo "❌ 缺 dist/client/index.html（静态站没生成）"; exit 1; }
[ -f dist/server/entry.mjs ] || { echo "❌ 缺 dist/server/entry.mjs（Node adapter 没生效）"; exit 1; }
echo "  ✅ dist/client + dist/server 就绪"

echo "==> 4/6 发布静态产物到 $WEB"
# ⚠️ 复制的是 dist/client，**不是 dist** —— dist 根下可能残留上一次 static 构建的旧产物
#    （含早已改为 SSR 的 solutions/ 目录），照搬上去会让旧页面盖住新路由。
find "$WEB" -mindepth 1 -delete
cp -r dist/client/. "$WEB/"
chown -R root:www-data "$WEB"
chmod -R 755 "$WEB"
echo "  ✅ $(find "$WEB" -type f | wc -l) 个文件"

echo "==> 5/6 SSR 进程（$SSR_NAME : $SSR_PORT）"
# PRACTICE_API 指向同机的 Java（默认值就是这个，写出来是为了以后换机器时看得见）
export HOST=127.0.0.1 PORT=$SSR_PORT PRACTICE_API=${PRACTICE_API:-http://127.0.0.1:8001}
if pm2 describe "$SSR_NAME" >/dev/null 2>&1; then
  pm2 restart "$SSR_NAME" --update-env
else
  pm2 start "$REPO/dist/server/entry.mjs" --name "$SSR_NAME" --cwd "$REPO"
fi
pm2 save >/dev/null

echo "==> 探活"
for i in $(seq 1 20); do
  code=$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$SSR_PORT/blog/solutions/" || true)
  [ "$code" = "200" ] && { echo "  ✅ SSR 进程 /blog/solutions/ → 200（等待 ${i} 次）"; break; }
  sleep 0.5
  [ "$i" = "20" ] && { echo "  ❌ SSR 进程没起来（最后状态码 $code）"; pm2 logs "$SSR_NAME" --lines 20 --nostream; exit 1; }
done

echo "==> 6/6 搜索索引 + sitemap：把**已发布解答**并回去"
# 为什么每次部署都要跑：上面的 `npm run build` 里含 `pagefind --site dist/client`（搜索索引）
# 与 @astrojs/sitemap（只枚举预渲染路由）—— 两者都**不知道运行时渲染的解答页**，
# 所以构建一次就把题解从索引与 sitemap 里一起抹掉。
# 完整形态 = 构建期静态页 + 这一步抓的解答页；少跑这一步，题解就搜不到、也进不了 sitemap。
# ⚠️ REINDEX_LOCK=0：本脚本已持有部署锁，让子脚本别再抢同一把锁（否则互等到死锁）。
# ⚠️ 刻意不 fail-fast：索引没建成不影响站点本身，只影响题解能不能被搜到/被发现。
REINDEX_LOCK=0 bash "$REPO/ops/refresh-indexes.sh" \
  || echo "  ⚠️ 索引/sitemap 重建失败：站点本身没事，只是题解搜不到（可手动跑 ops/refresh-indexes.sh）"

echo
echo "完成。若 /blog/solutions/ 在公网仍 404，说明 nginx 还没把该前缀反代给本进程："
echo "  bash $REPO/ops/nginx-blog-ssr.sh"
