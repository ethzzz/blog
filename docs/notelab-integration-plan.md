# 博客生成系统接入 notelab admin —— 方案评估（方案 B）

> 评估日期：2026-09-29 ｜ 状态：方案已定型，待用户确认「博客源码仓库在服务器的位置」后落地

## 1. 目标

把「资深前端工程师十年笔记」博客生成系统接入 **notelab admin（notelab-b）**，让运营在后台点一下就能产出并上线博客文章，而不是在 WorkBuddy 里手动跑 Skill。

## 2. 已核对的关键事实（避免方案跑偏）

- **notelab-b 是 Next.js 16 后台**（antd，`basePath /admin`，服务器 `/root/notelab-b`，pm2 `:3020`，nginx `location ^~ /admin`，GitHub `git@github.com:ethzzz/notelab-b.git`）。**不是 Java**。
- 真正调 LLM 的 `QwenClient`（Aliyun MaaS 网关）在 **notelab-java（:8001）**。notelab-b 里 `/api/*`（根路径）由 nginx 直连 java；只有 `/admin/api/*`（如 tts）是 notelab-b 本地 route handler。
- 新增后台页**必须同时在 Java 侧登记**：`MenuTree.MENUS`（菜单节点）+ `PageRoutes.PAGE_ROUTES`（页面路由），否则普通角色菜单看不见、页面守卫进不去。
- 博客当前部署：`deploy.sh` 在**本地**构建 → `scp` 到服务器 `/var/www/blog`。服务器只有**构建产物**，源码在本地 `E:/code/astro-blog-fuwari`。

## 3. 架构（三层，方案 B）

```
notelab-b (/admin/blog-gen 页面, antd)
   │  创建/查询/审核任务（HTTP，走现有登录校验）
   ▼
notelab-java (:8001)
   │  blog_gen_task 表（状态机）+ BlogContentController + 起草接口(QwenClient)
   ▼ 任务入队
生成 Worker（独立 Node 服务，与博客源码同机）
   消费任务 → 调起草API产出正文 → 写 posts/*.md + 聚合页 + nav
   → git commit → npm run build → 部署 /var/www/blog → 回写状态/预览链接
```

## 4. 三层职责与改动清单

| 层 | 位置 | 新增内容 |
|---|---|---|
| 前端 | notelab-b | `src/app/(admin)/blog-gen/page.tsx`（表单+任务列表+草稿预览/审核），参考 `notes`/`c-users` 页风格；Java 侧 `MenuTree.MENUS`+`PageRoutes.PAGE_ROUTES` 登记菜单/路由/权限 |
| 后端 | notelab-java | `blog_gen_task` 表（id, module, topic, count, persona, draft, status, result_urls, created_by, created_at）；`BlogContentController`（建任务/查状态/审核通过）；起草接口复用现有 `QwenClient` |
| 生成 | 生成 Worker（独立 Node 服务） | 消费任务；调 notelab-java 起草 API 产出正文；写 `src/content/posts/*.md` + 聚合页 `xxx-roadmap.astro` + `config.ts` 导航；`git commit` → `npm run build` → 部署 `/var/www/blog`；回写状态 |
| 复用 | `blog-roadmap-generator` Skill | 将现有「模块生成流程」抽成 **Worker 可调用脚本**，保留全部约定与坑（`@types` 引号、托管 node22 + `unset NODE_OPTIONS` + `rm -rf dist`、目录式 dist 输出） |

## 5. 已定决策（用户确认）

1. **草稿审核流：先草稿审核再发布**。生成先 `draft: true` → admin 在预览页看渲染效果 → 确认后 `draft: false` + 重建发布。防半成品上线。
2. **LLM 起草位置：复用 notelab-java 的 QwenClient**。密钥/额度统一管理，与现有翻译等功能同栈，不在 Worker 内另接 Qwen。

## 6. 待定项（唯一阻塞落地的输入）

**博客源码仓库在服务器上的位置**。Worker 需要一份**服务器可写的源码 clone** 来写 `.md` 并构建。当前服务器只有 `/var/www/blog`（产物）。建议二选一：
- 给博客仓库挂 GitHub remote（或服务器裸仓），Worker 在服务器 `git clone` 后写文件+构建+`git push`；
- 或 Worker 直接跑在持有源码的机器上（本地 `E:/code/astro-blog-fuwari`），由 notelab-b 经内网/Webhook 触发。

## 7. 建议落地阶段（评估通过后再执行）

- **Phase 1**：博客仓库挂 GitHub remote + 服务器 clone 一份源码；抽 `blog-roadmap-generator` 为可调用 Node 脚本（先本地打通「脚本生成+构建」）。
- **Phase 2**：notelab-java 加 `blog_gen_task` 表 + `BlogContentController` + 起草接口（复用 QwenClient）。
- **Phase 3**：生成 Worker 串起「任务→起草→写文件→构建→部署→回写」；先 `draft:true` 闭环。
- **Phase 4**：notelab-b `/admin/blog-gen` 页面 + 菜单/路由登记 + 草稿预览与「审核通过」发布。
- **Phase 5**：三项验证（HTTP 200、字节匹配、Tailwind 任意值类在生产 CSS 实际生成），对齐现有部署验收纪律。
