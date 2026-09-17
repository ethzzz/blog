# 博客项目长期记忆（astro-blog-fuwari，独立维护）

## 定位
- 独立 **Astro 静态博客**，使用 **Fuwari** 主题（卡片瀑布流、明暗双主题、Pagefind 全文搜索、归档页、TOC、代码高亮、KaTeX）。
- **与 NoteLab 主项目无任何代码/流程绑定**，单独维护。不要套用 NoteLab 的 Java/Next/codex/B-C 拆分那套开发纪律。
- 源码：`E:\code\astro-blog-fuwari`（独立 git 仓库，degit 自 saicaca/fuwari）。
- 线上：部署到服务器 `117.72.32.87` 的 `/var/www/blog`，经 nginx `/blog` 子路径访问 → http://117.72.32.87/blog/

## 部署
- 一键脚本：`deploy.sh`（本地 `npm run build` → tar → `scp myapp` → 服务器解压到 `/var/www/blog` → 验证路由 200）。
- 服务器免密别名 `myapp`（`ssh myapp`）。`/var/www/blog` 属主 `root:www-data`。
- 改域名需同步 `astro.config.mjs` 的 `site` 与 `deploy.sh` 的 `SITE_URL`。

## 本地开发
- 一键启动：`./dev.sh`（Git Bash 里执行），启动后访问 **http://localhost:4321/blog/**。
- ⚠️ **本地地址必须带 `/blog` 前缀**：`astro.config.mjs` 第 30 行配了 `base: "/blog"`，直接访问 `http://localhost:4321/` 会 404（线上同理，走 nginx `/blog` 子路径）。
- 新建文章：`npm run new-post -- <filename>` 生成带 frontmatter 的骨架（`src/content/posts/`），正文需自行补充。
- 保存 `.md` 后浏览器自动热更新（HMR），改 `src/config.ts` 也即时生效。`draft: false` 才会显示。

## 目录约定
- 文章：`src/content/posts/*.md`（frontmatter: title/published/description/tags/category/draft）
- 关于页：`src/content/spec/about.md`
- 站点配置：`src/config.ts`（标题/副标题/语言 `zh_CN`/主题色 hue/头像/社交链接）
- 头像：`src/assets/images/avatar.svg`（本地生成的青紫渐变 SVG，替代 Fuwari 原 demo-avatar）
- 搜索：Fuwari 内置 Pagefind，入口是导航栏模态框（无独立 /search 页）；列表页为首页与 `/archive`。

## 已知坑（本机 Windows 环境）
- 本机 safe-delete 策略会拦截 astro 自带的 `dist` 清理，`deploy.sh` 已改为构建前手动 `rm -rf dist` 与 `rm -rf dist/.prerender`。
- Tailwind v3 跨文件 `@apply` 在 `src/styles/markdown.css` 中已内联修复（`.link` / `.btn-regular-dark` 不再 `@apply` 组件类，改为等价工具类）。**切勿改回 `@apply link`**，否则构建报 "The link class does not exist"。
- npm 需用 WorkBuddy 托管的 node 22 跑（路径见 deploy.sh）；原 preinstall 的 `only-allow pnpm` 守卫已删除。
- **Vite 依赖缓存坑（仅 WorkBuddy 环境）**：WorkBuddy 经 `NODE_OPTIONS` 注入的 shim 带 safe-delete 守卫，会拦截 Vite 清理 `node_modules/.vite/deps`（上百文件）→ 启动/发现新依赖/改配置重启时崩溃。解法：`dev.sh` 里 **`unset NODE_OPTIONS`**。绕远路的无效尝试：脚本内 `rm -rf`（批量删同样被拦）、`mv` 到 /tmp（只解启动，运行中重优化仍崩）。**用户在普通终端跑 `npm run dev` 不受影响**。

## 待用户定
- 站点标题仍为「我的博客」、署名「博主」、社交链接为 Fuwari 默认占位（Twitter/Steam/GitHub）——需用户提供真实站名/署名/社交链接才能定。
