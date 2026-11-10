---
title: '前端系列 · 总览：Next.js 社区前台与后台'
published: 2026-11-10T11:10:00+08:00
updated: 2026-11-10T11:10:00+08:00
description: '前端系列总览：Next.js App Router 页面地图、RSC/TanStack Query 数据层、登录态、OpenAPI client、SSE 与 P0a–P2b 交付范围。'
tags: [社区全栈, 前端, Next.js]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 前端系列总览。共享总览：[社区全栈实战 · 总览](/blog/posts/node-roadmap-17-express-zero-to-one-30-days/)；后端系列：[后端总览](/blog/posts/node-roadmap-23-community-fullstack-plan/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

前端不是「给接口套几个页面」，而是完整产品的一半：登录态、feed、发帖、评论、通知、管理后台、性能与部署。技术栈用 Next.js App Router，数据层用 RSC + TanStack Query，接口 client 从 OpenAPI 生成。

---

## 1. 前端系列目录

| 篇 | 主题 | 目标 |
|---|---|---|
| 前端总览 | 页面地图、数据层、契约优先 | 先读本篇 |
| [P0a](/blog/posts/community-fullstack-fe-01-p0a-app-shell/) | App Router、登录态与 feed 首屏 | 登录、feed、详情、发帖 |
| [P0b](/blog/posts/community-fullstack-fe-02-p0b-content-loop/) | 发帖、评论、点赞与通知 | 完整社区交互 |
| [P1](/blog/posts/community-fullstack-fe-03-p1-admin/) | 管理后台、审核与看板 | 审核/举报/用户 |
| [P2a](/blog/posts/community-fullstack-fe-04-p2a-quality/) | 性能、E2E 与部署 | 可上线 |
| [P2b](/blog/posts/community-fullstack-fe-05-p2b-search-ai/) | 搜索与 AI 助手交互 | 差异化 |

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

关键依赖：

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
| P0a | App Router、登录、feed、帖子详情、发帖 | 浏览器完成主链路 |
| P0b | 评论、点赞、关注、通知/SSE、乐观更新 | 完整社区交互 |
| P1 | 管理后台、审核、举报、用户、看板 | 管理员可操作 |
| P2a | 性能、E2E、部署 | 可上线、可演示 |
| P2b | 搜索、AI 助手 | 差异化体验 |

---

## 7. 与后端联调

- 同一阶段先对齐 API 契约，再各自实现。
- 后端未完成时用 MSW/mock 或 OpenAPI mock，不阻塞前端。
- 每个页面至少覆盖：加载、空态、错误、未登录。
- 联调时先看 Network：401 是登录态，403 是权限，404 是资源/路由。

下一步：[前端 P0a](/blog/posts/community-fullstack-fe-01-p0a-app-shell/)，先把登录、feed、详情、发帖跑通。
