---
title: '社区全栈实战 · 00 总览：后端/前端双系列与 21+15 天路线'
published: 2026-11-10T10:00:00+08:00
updated: 2026-11-10T10:00:00+08:00
description: '一个完整社区项目拆成后端/前端两套系列：Express 公共 API + NestJS 管理/BFF + Next.js 前台，按后端 01–21、前端 01–15 的天数顺序推进并覆盖求职时间线。'
tags: [社区全栈, 总览]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 这是「社区全栈实战」总览。后端系列：[后端总览](/blog/posts/node-roadmap-23-community-fullstack-plan/)；前端系列：[前端总览](/blog/posts/community-fullstack-fe-00-overview/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

这个项目最后会是一个能跑起来的社区产品：Next.js 前台、Express 公共 API、NestJS 管理端。文章按后端和前端拆成两套，方便按岗位挑着看，也方便后面继续加内容：

- **后端系列**：Express 公共 API、NestJS 管理/BFF、Redis、RabbitMQ、OpenAPI、可观测性、K8s。
- **前端系列**：Next.js App Router、登录态、feed、发帖、评论、通知、管理后台、性能与部署。
- **共享总览**：就是这篇，先把架构、契约和阅读顺序定下来。

## 0. 怎么从 0 到 1 设计一个项目

这一节不是命令，而是“拿到一个新需求时先想什么”。后面所有代码都是这套顺序的产物。

### 0.1 先定边界，再定技术

顺序是：业务闭环 → 角色和权限 → 数据 → 接口 → 分层 → 文件。不要先选框架，再找业务往里塞。

- **业务闭环**：用户能完成哪几件事？这个项目是注册、登录、发帖、评论、点赞、关注、看 feed、收通知、后台审核。
- **角色**：普通用户、管理员、系统任务。角色决定权限和接口边界。
- **数据**：哪些对象会被反复读写？用户、帖子、评论、点赞、关注、通知。
- **接口**：每个动作对应一个 URL，先写契约再写实现。
- **分层**：HTTP、业务、数据访问分开，方便测试和替换。
- **文件**：一个文件对应一个变更理由，不按“代码多不多”拆。

### 0.2 文件设计四问

写每个文件前，先回答：

1. 这个文件为什么存在？删掉它会怎样？
2. 它只做一件事吗？属于哪一层？
3. 它依赖谁？谁依赖它？改它会影响谁？
4. 未来最可能变更的点是什么？

答不上来，说明这个文件可能不该现在建。

### 0.3 怎么把方法带走

换公司、换业务，技术栈可以变，但这套顺序不变：先边界，再契约，再做垂直切片，最后补异步和运维。后面每个模块的文件地图，都是这套顺序的具体例子。

---

## 1. 项目定位

- 业务：社区主流程——人、内容、关系、信息流、通知、治理。
- 形态：模块化单体起步，按真实边界拆出管理服务；不是一上来就微服务。
- 目标岗位：全栈工程师（Node + React/Next），兼顾 Node 后端。
- 时间预算：2–3 个月，后端 01–05 / 前端 01–03 结束就开始投递。

**项目故事**：面试时大概率会问：公共 API 为什么还用 Express？管理端为什么单独拆 NestJS？通知为什么绕一层 Outbox？这些取舍在文章里都有对应的理由，不是临时编的。

---

## 2. 双系列结构

| 系列 | 篇数 | 负责 |
|---|---|---|
| 共享总览 | 1 | 架构、契约、时间线、阅读顺序 |
| 后端系列 | 6 | Express 公共 API + NestJS 管理/BFF + 基础设施 |
| 前端系列 | 6 | Next.js 社区前台 + 管理后台 |

### 后端系列

| 篇 | 主题 | 链接 |
|---|---|---|
| 后端总览 | 服务边界、数据归属、技术选型 | [阅读](/blog/posts/node-roadmap-23-community-fullstack-plan/) |
| 01–05 | Express 公共 API 最小可演示 | [阅读](/blog/posts/node-roadmap-18-community-week-1/) |
| 06–10 | 完整社区主链路与工程化 | [阅读](/blog/posts/node-roadmap-19-community-week-2/) |
| 11–15 | NestJS 管理/BFF 与异步治理 | [阅读](/blog/posts/node-roadmap-20-community-week-3/) |
| 16–18 | 可观测、容器化与上线 | [阅读](/blog/posts/node-roadmap-21-community-week-4/) |
| 19–21 | K8s、压测与毕业验收 | [阅读](/blog/posts/node-roadmap-22-community-graduation/) |

### 前端系列

| 篇 | 主题 | 链接 |
|---|---|---|
| 前端总览 | 页面地图、数据层、契约优先 | [阅读](/blog/posts/community-fullstack-fe-00-overview/) |
| 01–03 | App Router、登录态与 feed 首屏 | [阅读](/blog/posts/community-fullstack-fe-01-p0a-app-shell/) |
| 04–06 | 发帖、评论、点赞与通知 | [阅读](/blog/posts/community-fullstack-fe-02-p0b-content-loop/) |
| 07–09 | 管理后台、审核与数据看板 | [阅读](/blog/posts/community-fullstack-fe-03-p1-admin/) |
| 10–12 | 性能、E2E 与部署 | [阅读](/blog/posts/community-fullstack-fe-04-p2a-quality/) |
| 13–15 | 搜索与 AI 助手交互 | [阅读](/blog/posts/community-fullstack-fe-05-p2b-search-ai/) |

---

## 3. 目标架构

```text
┌──────────────────────────────┐
│  apps/web (Next.js)          │
│  社区前台 + 管理后台          │
└──────────────┬───────────────┘
               │ HTTPS
┌──────────────▼───────────────┐
│  Ingress / Nginx             │
└───────┬───────────────┬──────┘
        │               │
┌───────▼──────┐  ┌─────▼─────────────┐
│ apps/api     │  │ apps/admin-api    │
│ Express 5    │  │ NestJS 12         │
│ 公共社区 API  │  │ 管理/BFF          │
└───┬───┬───┬──┘  └───┬───────────┬───┘
    │   │   │          │           │
┌───▼┐ ┌▼──┐ ┌▼──────┐ ┌▼─────┐ ┌──▼────┐
│MySQL│ │Redis│ │RabbitMQ│ │MySQL │ │RabbitMQ│
│核心 │ │缓存 │ │事件   │ │治理  │ │消费    │
└────┘ └────┘ └───────┘ └──────┘ └───────┘
```

- `apps/api`：认证、用户、帖子、评论、点赞、关注、feed、通知、举报创建。
- `apps/admin-api`：审核、举报处理、用户封禁、Dashboard、审计。
- `apps/web`：只调 API，不直接连库。
- `packages/shared`：Zod 契约、事件类型、错误码、API client。
- 事件：Outbox → RabbitMQ（跨服务）/ BullMQ（站内通知）。

---

## 4. 技术栈

| 层 | 选择 |
|---|---|
| 后端公共 API | Express 5 + TypeScript |
| 管理/BFF | NestJS 12 |
| 前端 | Next.js App Router + React + TanStack Query |
| 数据 | Prisma 6.19.3 + MySQL 8 + Redis 7 |
| 事件/任务 | RabbitMQ + BullMQ |
| 契约 | Zod + OpenAPI/Swagger |
| 可观测 | Pino + OpenTelemetry + Prometheus/Grafana + Sentry |
| 测试 | Vitest/Supertest + Playwright + Testcontainers |
| 部署 | Docker + GitHub Actions + K8s/Helm |
| 搜索/AI | Meilisearch + LLM 流式/RAG（后端 19–21 / 前端 13–15） |

**不引入**：TypeORM、GraphQL、MongoDB、Service Mesh、同时维护多套 ORM。

---

## 5. 时间线

| 后端 / 前端 | 时间 | 后端交付 | 前端交付 |
|---|---|---|---|
| 01–05 / 01–03 | 11/10–11/24 | Express 最小 API | 登录、feed、帖子详情、发帖 |
| 06–10 / 04–06 | 11/24–12/08 | 评论/点赞/关注/通知 + Redis/BullMQ/OpenAPI/测试/CI | 评论、点赞、通知、乐观更新 |
| 11–15 / 07–09 | 12/08–01/12 | NestJS 管理/BFF + RabbitMQ + 可观测性 | 管理后台、审核、举报、看板 |
| 16–18 / 10–12 | 01/12–01/29 | Docker/Nginx/指标/压测/回滚 | 性能、E2E、部署 |
| 春节 | 02/05–02/12 | 暂停重交付 | 暂停重交付 |
| 19–21 / 13–15 | 02/20–03/10 | K8s/搜索/AI 后端支持 | 搜索、AI 助手交互 |

**后端 01–05 / 前端 01–03 结束（11/24）就开始投递**，后面的阶段不作为投递前置条件。

---

## 6. 怎么读

### 6.1 代码示例怎么读

文章里的代码按“能不能直接落地”来给，不再用一句“和前面一样”带过：

- **新文件**：给完整文件，包含 import、类型和导出。建好文件后整段贴进去就能跑。
- **改已有文件**：要么重贴改完后的完整文件；要么在代码块第一行写清文件路径，并用注释标出插入锚点，例如 `// apps/api/src/app.ts`、`// 插到 app.use(express.json(...)) 之后`。片段会带上前后各一行上下文。
- **多天反复改的文件**（`app.ts`、`server.ts`、`schema.prisma`、`package.json`）：每次变更都重贴完整文件，或明确写“追加到文件末尾”“追加到某个 model 内”。
- **前端组件**：默认给完整组件文件，包含 `'use client'`、import、Props 类型和导出；只给函数体的情况会标明它属于哪个文件、放在哪个组件内。
- **配置和命令**：按原样给全，不用省略号代替关键字段。

这样读的时候不用回头翻前面的步骤，也不会出现“代码贴进去少一行 import”的情况。

### 6.2 阅读顺序

1. 先读本篇和后端总览，理解服务边界与数据归属。
2. 读前端总览，理解页面地图和契约消费方式。
3. 按阶段推进：同一阶段先定 API 契约，再分别实现后端和前端，最后联调。
4. 每篇末尾都有验收清单和下一阶段链接；不要跳阶段。

**契约优先**：后端先出 OpenAPI，前端用生成的 client；跨端联调不靠口头约定。

---

## 7. 明确不做

- 不把公共 API 重写为 NestJS。
- 不做 GraphQL、MongoDB、全量微服务、Service Mesh。
- 不在 2–3 个月内追生产级多集群 K8s。
- 不为了简历堆库；每个引入的库都要能讲清取舍。
