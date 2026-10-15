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

echo "==> 1/5 拉取最新代码（$REPO）"
cd "$REPO"
BEFORE=$(git rev-parse HEAD)
git pull --ff-only
AFTER=$(git rev-parse HEAD)
[ "$BEFORE" = "$AFTER" ] && echo "  已是最新 $AFTER" || echo "  $BEFORE → $AFTER"

echo "==> 2/5 依赖"
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

echo "==> 3/5 构建（static + SSR）"
NODE_OPTIONS=--max-old-space-size=1536 npm run build
# ⚠️ 两个产物都要在：只有 client 说明 adapter 没生效（那么 solutions 会 404），
#    只有 server 说明静态站没生成（整站挂）。
[ -f dist/client/index.html ] || { echo "❌ 缺 dist/client/index.html（静态站没生成）"; exit 1; }
[ -f dist/server/entry.mjs ] || { echo "❌ 缺 dist/server/entry.mjs（Node adapter 没生效）"; exit 1; }
echo "  ✅ dist/client + dist/server 就绪"

echo "==> 4/5 发布静态产物到 $WEB"
# ⚠️ 复制的是 dist/client，**不是 dist** —— dist 根下可能残留上一次 static 构建的旧产物
#    （含早已改为 SSR 的 solutions/ 目录），照搬上去会让旧页面盖住新路由。
find "$WEB" -mindepth 1 -delete
cp -r dist/client/. "$WEB/"
chown -R root:www-data "$WEB"
chmod -R 755 "$WEB"
echo "  ✅ $(find "$WEB" -type f | wc -l) 个文件"

echo "==> 5/5 SSR 进程（$SSR_NAME : $SSR_PORT）"
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

echo
echo "完成。若 /blog/solutions/ 在公网仍 404，说明 nginx 还没把该前缀反代给本进程："
echo "  bash $REPO/ops/nginx-blog-ssr.sh"
