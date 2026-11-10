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

这个项目不是「一个 Express 后端 + 若干文章」，而是一个完整的全栈产品：**Next.js 前台 + Express 公共 API + NestJS 管理/BFF**。为了便于学习和投递，文章拆成两套系列：

- **后端系列**：Express 公共 API、NestJS 管理/BFF、Redis、RabbitMQ、OpenAPI、可观测性、K8s。
- **前端系列**：Next.js App Router、登录态、feed、发帖、评论、通知、管理后台、性能与部署。
- **共享总览**：你正在读的这一篇，负责架构、契约、阶段节奏和两套系列的阅读顺序。

---

## 1. 项目定位

- 业务：社区/社群核心闭环——人、内容、关系、信息流、通知、治理。
- 形态：模块化单体起步，按真实边界拆出管理服务；不是一上来就微服务。
- 目标岗位：全栈工程师（Node + React/Next），兼顾 Node 后端。
- 时间预算：2–3 个月，后端 01–05 / 前端 01–03 结束就开始投递。

**项目故事**：为什么公共 API 保留 Express、为什么管理端用 NestJS、为什么用 Outbox + RabbitMQ、为什么前端不直接连库。面试时能讲清这些取舍，比列一堆库更有价值。

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
