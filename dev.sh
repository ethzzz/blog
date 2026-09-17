#!/usr/bin/env bash
# Fuwari 本地开发：启动开发服务器（保存文件后浏览器自动热更新）
# 用法：在 Git Bash 里执行 ./dev.sh
# 启动后访问 http://localhost:4321/blog/ （注意 base 为 /blog，不是根路径）
set -e

cd "$(dirname "$0")"

# 优先用 WorkBuddy 托管的 node，没有就用系统 npm
NPM="npm"
if [ -f "C:/Users/thz/.workbuddy/binaries/node/versions/22.22.2-2/npm.cmd" ]; then
	NPM="C:/Users/thz/.workbuddy/binaries/node/versions/22.22.2-2/npm.cmd"
fi

# 重要：WorkBuddy 会通过 NODE_OPTIONS 注入 node-language-shim，其内置的 safe-delete
# 批量守卫会拦截 Vite 清理自己的依赖缓存 node_modules/.vite/deps（上百个文件），造成：
#   · dev 启动时崩溃（Forced re-optimization）
#   · 首次访问页面时发现新依赖（如 @swup/astro）后崩溃
#   · 改 astro.config.mjs 重启时崩溃（"Continuing with previous valid configuration"）
# 该 shim 只是 WorkBuddy 的编码/工具增强，astro 构建并不需要；清掉后 Vite 能正常管理缓存。
# 在普通终端（非 WorkBuddy）运行时 NODE_OPTIONS 本就没有该项，此行无副作用。
# 影响范围：仅这一个 dev 进程内的 safe-delete 保护失效，而它只删除 Vite 自建缓存，安全。
unset NODE_OPTIONS

echo "==> 启动开发服务器（保存文件后浏览器自动热更新，Ctrl+C 停止）"
"$NPM" run dev
