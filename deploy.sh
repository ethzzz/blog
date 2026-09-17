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

# 站点部署地址（换成你的域名后，记得同步改 astro.config.mjs 的 site）
SITE_URL="http://117.72.32.87/blog"

echo "==> 清理并构建"
rm -rf dist
"$NPM" run build
# Astro 清理临时目录会被本机 safe-delete 策略拦截，手动删掉
rm -rf dist/.prerender

echo "==> 打包"
( cd dist && tar czf /tmp/blog-dist.tar.gz . )

echo "==> 上传到服务器"
scp /tmp/blog-dist.tar.gz myapp:/tmp/blog-dist.tar.gz

echo "==> 解压并修正权限"
ssh -n myapp "tar xzf /tmp/blog-dist.tar.gz -C /var/www/blog && chown -R root:www-data /var/www/blog && chmod -R 755 /var/www/blog"

echo "==> 验证"
ssh -n myapp "for p in /blog/ /blog/archive/ /blog/posts/hello-world/ /blog/rss.xml /blog/about/; do printf '%s -> ' \$p; curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1\$p; done"

echo ""
echo "部署完成：$SITE_URL"
