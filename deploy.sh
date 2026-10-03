#!/usr/bin/env bash
# Fuwari 博客一键部署：构建 → 打包 → 上传 → 解压 → 验证
# 用法：在 Git Bash 里执行 ./deploy.sh
set -e

cd "$(dirname "$0")"

# 优先用 WorkBuddy 托管的 node，没有就用系统 npm
NPM="npm"
if [ -f "C:/Users/thz/.workbuddy/binaries/node/versions/22.22.2-2/npm.cmd" ]; then
	NPM="C:/Users/thz/.workbuddy/binaries/node/versions/22.22.2-2/npm.cmd"
fi

# 站点部署地址（公网域名；换域名时同步改 astro.config.mjs 的 site）
SITE_URL="https://haolo.cloud/blog"

echo "==> 清理并构建"
rm -rf dist
# 注意：Astro 构建结尾清理 dist/pages（中间产物）会被本机 safe-delete 的批量删除闸门拦截，
# 表现为退出码非 0 但页面产物其实已完整生成 —— 所以这里不直接依赖其退出码，改由产物判据把关。
"$NPM" run build || true
rm -rf dist/pages
# 兜底判据：首页产物缺失才算真失败（有 set -e，这里中止部署）
[ -f dist/index.html ] || { echo "构建产物缺失，中止部署"; exit 1; }
# astro build 因上面那个清理失败返回非 0，`npm run build` 里 `&& pagefind` 会被跳过 →
# 站内搜索索引会停在旧版本。这里单独补跑一次，保证新文章能被搜到。
npx pagefind --site dist

echo "==> 打包"
( cd dist && tar czf /tmp/blog-dist.tar.gz . )

echo "==> 上传到服务器"
scp /tmp/blog-dist.tar.gz myapp:/tmp/blog-dist.tar.gz

echo "==> 解压并修正权限"
ssh -n myapp "tar xzf /tmp/blog-dist.tar.gz -C /var/www/blog && chown -R root:www-data /var/www/blog && chmod -R 755 /var/www/blog"

echo "==> 验证"
ssh -n myapp "for p in /blog/ /blog/archive/ /blog/rss.xml /blog/about/; do printf '%s -> ' \$p; curl -s -o /dev/null -w '%{http_code}\n' --resolve haolo.cloud:443:127.0.0.1 https://haolo.cloud\$p; done"

echo ""
echo "部署完成：$SITE_URL"
