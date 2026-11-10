---
title: '后端系列 · 总览：Express + NestJS 企业级社区 API'
published: 2026-11-10T10:10:00+08:00
updated: 2026-11-10T10:10:00+08:00
description: '后端系列总览：Express 公共 API + NestJS 管理/BFF 的服务边界、数据归属、API/事件契约、技术选型与 P0a–P2b 交付范围。'
tags: [社区全栈, 后端, Express, NestJS]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 后端系列总览。共享总览：[社区全栈实战 · 总览](/blog/posts/node-roadmap-17-express-zero-to-one-30-days/)；前端系列：[前端总览](/blog/posts/community-fullstack-fe-00-overview/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

后端不推倒重来：**Express 继续做公共社区 API，NestJS 只做管理/BFF**。这样既保留已有资产，又能覆盖企业招聘里高频的 NestJS、DI、Guard、Swagger、消息队列和可观测性。

---

## 1. 后端系列目录

| 篇 | 主题 | 目标 |
|---|---|---|
| 后端总览 | 边界、契约、选型 | 先读本篇 |
| [P0a](/blog/posts/node-roadmap-18-community-week-1/) | Express 最小可演示 | 认证 + 发帖 + feed |
| [P0b](/blog/posts/node-roadmap-19-community-week-2/) | 完整主链路与工程化 | 评论/点赞/关注/通知/OpenAPI/CI |
| [P1](/blog/posts/node-roadmap-20-community-week-3/) | NestJS 管理/BFF + 异步治理 | 审核/举报/RabbitMQ/可观测 |
| [P2a](/blog/posts/node-roadmap-21-community-week-4/) | 可观测、容器化与上线 | Docker/Nginx/指标/压测 |
| [P2b](/blog/posts/node-roadmap-22-community-graduation/) | K8s、搜索与毕业验收 | Helm/Meilisearch/AI 后端 |

---

## 2. 服务边界与数据归属

| 服务 | 负责 | 数据 |
|---|---|---|
| `apps/api`（Express） | 认证、用户、帖子、评论、点赞、关注、feed、通知、举报创建 | 核心社区表 + `reports` |
| `apps/admin-api`（NestJS） | 审核、举报处理、用户封禁、Dashboard、审计 | `moderation_records`、`admin_audit_logs` |
| `packages/shared` | Zod 契约、事件类型、错误码 | 无数据库 |

**跨服务调用**：管理端通过公共 API 的内部接口操作核心内容，不直接改表：

```text
GET  /internal/posts?status=
GET  /internal/posts/:id
POST /internal/posts/:id/status
GET  /internal/users?query=
POST /internal/users/:id/status
GET  /internal/reports?status=
POST /internal/reports/:id/resolve
```

内部接口用 `X-Internal-Token` 鉴权，仅内网可达；管理端不把内部接口暴露到公网。

**回退方案**：如果 P1 时间紧张，允许共享 MySQL，但保留 Prisma schema 边界和内部接口契约，不回退到「管理端直接 import 核心 repository」。

---

## 3. API 契约

### 公共 API（Express）

| 模块 | 路径 |
|---|---|
| 认证 | `POST /api/v1/auth/register`、`login`、`refresh`、`logout` |
| 用户 | `GET/PATCH /api/v1/users/me`、`POST/DELETE /api/v1/users/:id/follow` |
| 帖子 | `GET/POST /api/v1/posts`、`GET/DELETE /api/v1/posts/:id` |
| 评论 | `GET/POST /api/v1/posts/:postId/comments` |
| 点赞 | `POST/DELETE /api/v1/posts/:postId/like` |
| feed | `GET /api/v1/feed` |
| 通知 | `GET /api/v1/notifications`、`POST /read`、`GET /stream`（SSE） |
| 举报 | `POST /api/v1/reports` |
| 运维 | `/health`、`/ready`、`/metrics` |

### 管理 API（NestJS）

| 模块 | 路径 |
|---|---|
| Dashboard | `GET /api/v1/admin/dashboard/stats` |
| 帖子审核 | `GET /api/v1/admin/posts`、`POST /:id/approve`、`POST /:id/reject` |
| 评论审核 | `GET /api/v1/admin/comments`、`POST /:id/approve`、`POST /:id/reject` |
| 举报 | `GET /api/v1/admin/reports`、`POST /:id/resolve` |
| 用户 | `GET /api/v1/admin/users`、`POST /:id/ban`、`POST /:id/unban` |
| 审计 | `GET /api/v1/admin/audit-logs` |
| 运维 | `/health`、`/ready`、`/metrics` |

---

## 4. 事件与异步

| 事件 | 生产者 | 消费者 | 传输 | 用途 |
|---|---|---|---|---|
| `post.created` | api | admin-api | RabbitMQ | 审核队列 |
| `post.published` | api | search-indexer | RabbitMQ | 搜索索引 |
| `report.created` | api | admin-api | RabbitMQ | 举报队列 |
| `comment.created` | api | notification | BullMQ | 站内通知 |
| `like.created` | api | notification | BullMQ | 站内通知 |
| `follow.created` | api | notification | BullMQ | 站内通知 |

- 所有副作用先写 `outbox_events`；outbox worker 按类型路由。
- RabbitMQ 负责跨服务事件；BullMQ 负责站内通知、延迟与重试。
- 消费者用 `event_id` / `jobId` 做幂等。
- P0a/P0b 先只启用 BullMQ；RabbitMQ 在 P1 接入。

---

## 5. 技术选型

| 决策 | 选择 | 理由 |
|---|---|---|
| 公共 API | Express 5 | 保留阶段一资产；面试可讲取舍 |
| 管理/BFF | NestJS 12 | 模块/DI/Guard/Pipe/Interceptor/Swagger |
| ORM | Prisma 6.19.3 | 固定版本，避免 latest 装到 8 RC |
| 数据库 | MySQL 8 | 国内 JD 覆盖足够 |
| 缓存/限流 | ioredis | Redis 高频项 |
| 任务/事件 | BullMQ + RabbitMQ | 任务与跨服务事件分开 |
| API 文档 | OpenAPI/Swagger | 前端生成 client |
| 可观测 | OpenTelemetry + Prometheus/Grafana + Sentry | 能排障 |
| 测试 | Vitest/Supertest/Testcontainers | 单元/集成 |
| 部署 | Docker/Nginx/K8s | 上线与演示 |

关键依赖：

```text
apps/api: jsonwebtoken cookie-parser cors helmet ioredis bullmq
          zod-to-openapi swagger-ui-express prom-client
          @opentelemetry/* @sentry/node vitest supertest testcontainers

apps/admin-api: @nestjs/core @nestjs/common @nestjs/config @nestjs/swagger
                @nestjs/jwt @nestjs/passport @nestjs/throttler
                @nestjs/terminus @nestjs/microservices amqplib
```

---

## 6. 阶段范围

| 阶段 | 后端范围 | 验收 |
|---|---|---|
| P0a | monorepo、Prisma、认证、发帖、feed | 浏览器能登录、发帖、看 feed |
| P0b | 评论、点赞、关注、通知、SSE、Redis/BullMQ、OpenAPI、测试、CI | 完整主链路 + CI 绿 |
| P1 | NestJS 管理/BFF、审核/举报/用户/审计、RabbitMQ、OTel | 管理端可审核，trace 跨服务 |
| P2a | Docker、Nginx/SSE、指标、优雅关闭、压测、回滚 | 一条命令上线 + 压测报告 |
| P2b | K8s/Helm、Meilisearch、AI 后端支持 | 集群部署 + 搜索/AI 可用 |

---

## 7. 风险与回退

| 风险 | 缓解 |
|---|---|
| NestJS 与 TS 7 / nest-cli 兼容性 | 先做 1 天 spike；用 SWC 或 admin-api 单独 TS 5.9 |
| 两套后端维护成本 | NestJS 只做管理/BFF；共享契约；不复制公共 API |
| 管理端数据拆分复杂 | 回退共享 MySQL，但保留边界和内部接口 |
| 消息链路过度设计 | P1 先做一条 RabbitMQ 事件闭环，再扩 |

下一步：从 [后端 P0a](/blog/posts/node-roadmap-18-community-week-1/) 开始；前端对应 [前端总览](/blog/posts/community-fullstack-fe-00-overview/)。
