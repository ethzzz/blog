---
title: '前端 00：Next.js 社区前台与后台'
published: 2026-11-10T11:10:00+08:00
updated: 2026-11-10T11:10:00+08:00
description: '前端系列总览：Next.js App Router 页面地图、RSC/TanStack Query 数据层、登录态、OpenAPI client、SSE 与 01–03–13–15 交付范围。'
tags: [社区全栈, 前端, Next.js]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 前端系列总览。共享总览：[社区全栈实战 · 总览](/blog/posts/node-roadmap-17-express-zero-to-one-30-days/)；后端系列：[后端总览](/blog/posts/node-roadmap-23-community-fullstack-plan/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

前端最后会有两套页面：社区前台和管理后台。前台负责登录、feed、发帖、评论和通知，后台负责审核、举报和用户管理。技术栈用 Next.js App Router，接口 client 从 OpenAPI 生成，避免手写类型和后端对不上。

---

## 0. 前端文件地图与数据流

先写什么：布局 → 登录态 → 一个页面 → 数据请求 → 交互 → 后台。不要先做一套“万能组件库”。

| 层 | 文件 | 职责 | 以后可能怎么改 |
|---|---|---|---|
| 路由 | `app/(public)`、`(auth)`、`(admin)` | 页面分组和布局边界 | 加路由组、权限段、国际化 |
| 请求 | `lib/api.ts` | API 地址、错误、token | 换 OpenAPI 生成 client |
| 登录态 | `app/api/auth/*`、`middleware.ts` | 刷新 Cookie、路由保护 | SSO、角色路由、审计 |
| 首屏 | Server Components | 列表、详情、SEO | 流式渲染、缓存 |
| 交互 | Client Components + TanStack Query | 点赞、评论、通知 | 乐观更新、离线、多端 |
| 后台 | `app/(admin)` | 审核、举报、用户 | 表格配置、批量操作、SSO |

**数据流**：Server Component 取首屏数据；Client Component 用 Query 做交互；刷新登录态走 Route Handler；通知走 SSE。权限最终在后端再查一次。

## 1. 前端系列目录

| 篇 | 主题 | 目标 |
|---|---|---|
| 前端总览 | 页面地图、数据层、契约优先 | 先读本篇 |
| [01–03](/blog/posts/community-fullstack-fe-01-p0a-app-shell/) | App Router、登录态与 feed 首屏 | 登录、feed、详情、发帖 |
| [04–06](/blog/posts/community-fullstack-fe-02-p0b-content-loop/) | 发帖、评论、点赞与通知 | 完整社区交互 |
| [07–09](/blog/posts/community-fullstack-fe-03-p1-admin/) | 管理后台、审核与看板 | 审核/举报/用户 |
| [10–12](/blog/posts/community-fullstack-fe-04-p2a-quality/) | 性能、E2E 与部署 | 可上线 |
| [13–15](/blog/posts/community-fullstack-fe-05-p2b-search-ai/) | 搜索与 AI 助手交互 | 差异化 |

---

## 2. 页面地图

```text
/                       首页 / 推荐
/login                  登录
/register               注册
/feed                   关注流
/posts/[id]             帖子详情 + 评论
/posts/new              发帖
/users/[id]             个人主页
/notifications          通知中心
/admin                  管理看板
/admin/posts            帖子审核
/admin/reports          举报处理
/admin/users            用户管理
/admin/audit            审计日志
/search                 搜索
```

前台和管理后台共用一套登录态，但布局和权限分开：

- `app/(public)/`：社区前台。
- `app/(admin)/admin/`：管理后台，服务端校验权限。
- `app/(auth)/`：登录/注册。

---

## 3. 数据层

| 场景 | 方案 |
|---|---|
| 首屏列表/详情 | Server Component 直接 fetch |
| 搜索/分页/筛选 | URL searchParams + server fetch |
| 点赞/关注/评论 | Client Component + TanStack Query mutation |
| 通知 | SSE + TanStack Query cache |
| 管理端表格 | Server Component + form action / client mutation |
| API 类型 | 从 OpenAPI 生成 client，不手写 |

**契约优先**：后端先出 OpenAPI，前端用 `openapi-typescript` 或 `orval` 生成 client。后端字段改名时，前端构建直接报错，而不是上线后才发现。

---

## 4. 登录态

- 登录接口返回 accessToken，写内存/短期存储。
- refresh 走 httpOnly Cookie，前端不读 token。
- Next.js route handler 负责刷新和转发 Cookie：

```text
POST /api/auth/login   → 调后端登录，设置 refresh Cookie
POST /api/auth/refresh → 调后端刷新，返回新 accessToken
POST /api/auth/logout  → 清 Cookie
```

- `middleware.ts` 保护 `/feed`、`/posts/new`、`/admin`。
- 管理后台在 server layout 再校验一次权限，不能只靠前端隐藏菜单。

---

## 5. 技术栈

| 层 | 选择 |
|---|---|
| 框架 | Next.js App Router + React |
| 数据 | TanStack Query（客户端）+ RSC（首屏） |
| 样式 | Tailwind + shadcn/ui |
| 表单 | React Hook Form + Zod（或 server action + Zod） |
| API client | openapi-typescript / orval |
| 实时 | SSE（通知） |
| 测试 | Playwright |
| 部署 | Docker + Nginx/K8s Ingress |

依赖清单：

```text
next react react-dom
@tanstack/react-query
tailwindcss shadcn/ui
react-hook-form zod
openapi-typescript
playwright
```

---

## 6. 阶段范围

| 阶段 | 前端范围 | 验收 |
|---|---|---|
| 01–03 | App Router、登录、feed、帖子详情、发帖 | 浏览器完成主链路 |
| 04–06 | 评论、点赞、关注、通知/SSE、乐观更新 | 完整社区交互 |
| 07–09 | 管理后台、审核、举报、用户、看板 | 管理员可操作 |
| 10–12 | 性能、E2E、部署 | 可上线、可演示 |
| 13–15 | 搜索、AI 助手 | 差异化体验 |

---

## 7. 与后端联调

- 同一阶段先对齐 API 契约，再各自实现。
- 后端未完成时用 MSW/mock 或 OpenAPI mock，前端可以先做。
- 每个页面至少覆盖：加载、空态、错误、未登录。
- 联调时先看 Network：401 是登录态，403 是权限，404 是资源/路由。

下一步：[前端 01–03](/blog/posts/community-fullstack-fe-01-p0a-app-shell/)，先把登录、feed、详情、发帖跑通。
