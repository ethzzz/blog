---
title: '23 · 社区服务 0→1：阶段二 · 全栈企业化重定位（P0–P2 计划）'
published: 2026-11-10T19:00:00+08:00
updated: 2026-11-10T19:00:00+08:00
description: '按 2026 求职市场重定位：保留 Express 公共 API，新增 Next.js 前台、NestJS 管理/BFF、Redis/RabbitMQ/OpenAPI/OTel/K8s，并给出 P0a/P0b/P1/P2a/P2b 时间线。'
tags: [Node.js, 全栈, 求职, 架构规划]
category: Node全栈学习路线
draft: false
---

> [!NOTE]
> 阶段二总览（系列第 7 篇）。上一篇：[22 毕业验收](/blog/posts/node-roadmap-22-community-graduation/)；阶段一总览：[17 总览](/blog/posts/node-roadmap-17-express-zero-to-one-30-days/)；合集：[Node.js 全栈开发路线](/blog/node-roadmap/)。

阶段一的 6 篇解决的是「Express 社区后端怎么从 0 到 1」。这一篇是路线调整：**不推倒阶段一，而是把项目升级成能投全栈岗位的完整产品**，同时补上 NestJS、Redis、RabbitMQ、OpenAPI、OpenTelemetry、K8s 这些市场高频信号。

---

## 1. 为什么调整

2026 年全栈/Node 岗位的共性要求大致是：

- 前端：React / Next.js / SSR / 前后端联调
- 后端：TypeScript、Express 或 NestJS、REST、MySQL/PostgreSQL、Redis
- 异步：消息队列、重试、幂等、Outbox
- 工程：OpenAPI、测试、CI/CD、Docker/K8s
- 可观测：Pino、OpenTelemetry、Prometheus/Grafana、Sentry
- 加分：搜索、AI/LLM、支付、文件上传

阶段一已经覆盖了 Express + Prisma + MySQL + 认证 + 内容 + 通知 + Docker/CI 的后端闭环，但缺三块：

1. **可演示的全栈前端**：没有 Next.js，简历上还是「后端项目」。
2. **NestJS 企业信号**：管理/BFF 没有，JD 高频项缺失。
3. **工程深度**：OpenAPI、OpenTelemetry、RabbitMQ、K8s 还没落地。

阶段二的目标不是「库越多越好」，而是：**用一个完整产品讲清楚低耦合、可观测、可部署、可迭代**。

---

## 2. 阶段一保留什么

阶段一不重写，以下资产继续用：

- Express 5 公共 API
- Prisma 6.19.3 + MySQL 8
- Zod 校验、Pino 日志、统一错误、requestId
- BullMQ 通知任务
- Docker / Nginx / CI 骨架
- 已发布的 6 篇系列文章和代码

**阶段二只加东西，不推翻阶段一。**

---

## 3. 阶段二目标架构

```text
community/
  apps/
    api/          # Express 5 公共社区 API（阶段一迁入）
    admin-api/    # NestJS 12 管理/BFF（审核、举报、用户管理、审计）
    web/          # Next.js App Router 社区前台 + 管理后台
  packages/
    shared/       # Zod 契约、事件类型、错误码、API client
  infra/
    docker/       # 本地全栈 compose
    k8s/          # Helm/manifests
    otel/         # OpenTelemetry collector 配置
  docs/
    adr/          # 架构决策记录
```

**边界**

| 服务 | 负责 | 数据 |
|---|---|---|
| `apps/api` | 认证、用户、帖子、评论、点赞、关注、feed、通知、举报创建 | 核心社区表 + `reports` |
| `apps/admin-api` | 审核、举报处理、用户封禁、Dashboard、审计 | `moderation_records`、`admin_audit_logs` |
| `apps/web` | 社区前台 + 管理后台页面 | 不直接连库 |

- 管理端通过内部 API 操作核心内容，不跨服务直接改表。
- 跨服务事件走 Outbox → RabbitMQ；站内通知继续用 BullMQ。
- `packages/shared` 统一契约，前端 API client 从 OpenAPI 生成，避免类型漂移。

---

## 4. 技术选型

| 决策 | 选择 | 理由 |
|---|---|---|
| 公共 API | 保留 Express 5 | 阶段一资产可用；面试可讲「为什么不全用 NestJS」 |
| 管理/BFF | 新增 NestJS 12 | 模块/DI/Guard/Pipe/Interceptor/Swagger 覆盖企业 JD |
| 前端 | 新增 Next.js App Router | 全栈岗位核心要求，复用前端优势 |
| ORM | 保留 Prisma 6.19.3 | 不引入第二套 ORM；TypeORM 作为面试知识补 |
| 数据库 | 保留 MySQL 8 | 国内 JD 覆盖足够；PostgreSQL 差异作为面试知识补 |
| 缓存/限流/SSE | 新增 ioredis | Redis 是后端 JD 高频项 |
| 事件/任务 | BullMQ + RabbitMQ | BullMQ 做任务，RabbitMQ 做跨服务事件 |
| API 文档 | OpenAPI/Swagger | 契约共享、前端生成 client |
| 可观测 | OpenTelemetry + Prometheus/Grafana + Sentry | 从「能跑」到「能排障」 |
| 测试 | Vitest/Supertest/Playwright/Testcontainers | 单元/集成/E2E 都有证据 |
| 部署 | Docker + GitHub Actions + K8s/Helm | 覆盖 Docker/K8s/CI 高频要求 |
| 搜索 | Meilisearch（P2b） | 比 Elasticsearch 轻，能演示搜索闭环 |
| AI | LLM 流式/RAG（P2b） | 差异化加分，不阻塞主线 |

**明确不引入**：TypeORM、GraphQL、MongoDB、Service Mesh、同时维护多套 ORM。项目故事要聚焦，不是库展览。

**关键依赖**

| 服务 | 主要依赖 |
|---|---|
| `apps/api` | `jsonwebtoken`、`cookie-parser`、`cors`、`helmet`、`ioredis`、`bullmq`、`zod-to-openapi`、`swagger-ui-express`、`prom-client`、`@opentelemetry/*`、`@sentry/node`、`vitest`、`supertest`、`testcontainers` |
| `apps/admin-api` | `@nestjs/core`、`@nestjs/common`、`@nestjs/config`、`@nestjs/swagger`、`@nestjs/jwt`、`@nestjs/passport`、`@nestjs/throttler`、`@nestjs/terminus`、`@nestjs/microservices`、`amqplib`、`@nestjs/testing` |
| `apps/web` | `next`、`react`、`react-dom`、`@tanstack/react-query`、`tailwindcss`、`shadcn/ui`、`openapi-typescript` |

> NestJS 12 已支持 ESM、Vitest + SWC、Zod 直连；但 `nest-cli` 对 TypeScript 7 的 programmatic API 支持仍需先做 1 天 spike。若不兼容，`admin-api` 单独用 SWC 或 TS 5.9，公共 API 继续 TS 7。

---

## 5. 时间线

以 2026-11-10 为起点：

| 阶段 | 时间 | 目标 |
|---|---|---|
| P0a | 2026-11-10–11-24（2 周） | monorepo + Next.js 最小可演示 |
| P0b | 2026-11-24–12-08（2 周） | 评论/点赞/关注/通知 + Redis/BullMQ/OpenAPI/测试/CI |
| P1 | 2026-12-08–2027-01-12（5 周） | NestJS 管理/BFF + RabbitMQ + 可观测性 |
| P2a | 2027-01-12–01-29（2.5 周） | K8s/Helm + 压测 + 回滚 + ADR |
| 春节 | 2027-02-05–02-12 | 暂停重交付，面试复盘/简历/博客 |
| P2b | 2027-02-20–03-10（3 周，可选） | Meilisearch + AI 差异化 |
| 金三银四 | 2027-03–04 | 主投递窗口 |

**关键原则：P0a 结束（11/24）就开始投简历，不等 P2。**

---

## 6. 每阶段范围与验收

### P0a（11/10–11/24）：最小可演示

**范围**

- Monorepo 迁移，现有 Express API 保持可用。
- 垂直切片：认证、feed、帖子列表/详情、发帖。
- Next.js：登录/注册、feed、帖子详情、发帖、个人页。
- Docker Compose：web/api/mysql/redis。

**验收**

- 浏览器完成 注册 → 登录 → feed → 详情 → 发帖。
- 刷新页面登录态不丢；至少一条帖子在 feed 可见。
- `docker compose up` 后 web/api/mysql/redis 都可用。
- **从 11/24 开始投递**，不等全部做完。

### P0b（11/24–12/08）：工程化补齐

**范围**

- 评论/点赞/关注/通知/SSE。
- JWT/refresh Cookie/CORS/Helmet；Redis 限流/缓存/SSE Pub/Sub；BullMQ 通知。
- OpenAPI；Vitest/Supertest；Dockerfile；GitHub Actions。

**验收**

- 完整社区主链路；SSE 通知 1 秒内到达；断线可重连。
- `pnpm -r typecheck`、`test`、`build` 全绿；CI 绿。
- OpenAPI 页面可访问，前端 client 不漂移。

### P1（12/08–01/12）：企业工程信号

**范围**

- NestJS 管理/BFF：AuthGuard、PermissionsGuard、Pipe、Interceptor、ExceptionFilter、Swagger。
- 管理端：审核、举报、用户封禁、Dashboard、审计日志。
- RabbitMQ 跨服务事件 + 消费者幂等；BullMQ 补重试/积压监控。
- OpenTelemetry + Prometheus/Grafana + Sentry；trace 跨服务。
- Playwright E2E；Testcontainers 集成测试。

**验收**

- 管理端可审核帖子、处理举报、封禁用户，操作写入审计。
- 审核通过后 feed 出现，拒绝后不出现。
- 一条请求的 trace 能从 web/api 追到 admin-api/RabbitMQ 消费者。
- Grafana 有延迟/错误率/队列积压面板；Sentry 能收到错误。

### P2a（01/12–01/29）：上线与压测

**范围**

- K8s/Helm + 本地 k3d 或云 k3s；探针、HPA、Ingress。
- k6 压测；回滚演练；ADR；10 分钟演示。

**验收**

- 一条命令部署到集群；`/health`、`/ready`、`/metrics` 正常。
- 有压测报告和 5 分钟回滚步骤。
- 能不看稿讲 10 分钟：需求→架构→取舍→演示→如果重来。

### P2b（02/20–03/10，可选）：差异化

**范围**

- Meilisearch 搜索；Outbox/RabbitMQ 同步索引。
- AI 助手/内容审核：LLM 流式 + RAG。

**验收**

- 搜索可用，索引延迟可接受。
- AI 演示可开关、可 fallback。
- 做不完不影响投递；金三银四前完成即可。

---

## 7. 求职节奏

| 时间 | 动作 |
|---|---|
| 2026-11-24 | 开始投递；简历写 P0a demo + 阶段一 Express |
| 2026-12-08 | P0 完成，更新简历（全栈 + Redis/BullMQ/OpenAPI/CI） |
| 2026-12-08–2027-01-12 | P1 边做边面（NestJS/OTel/RabbitMQ） |
| 2027-01-29 | P2a 收尾，春节前完成一轮投递 |
| 2027-02-05–02-12 | 春节暂停重交付，面试复盘 |
| 2027-02-20–03-10 | P2b 加分，准备金三银四 |
| 2027-03–04 | 金三银四主战场 |

**不要把 P2 当作投递前置条件。** 项目是持续更新的简历资产，不是“做完才能找工作”的一次性作品。

---

## 8. 风险与裁剪线

| 风险 | 缓解 |
|---|---|
| NestJS + TypeScript 7 / nest-cli 兼容性 | 先做 1 天 spike；用 SWC 或 admin-api 单独 TS 5.9 |
| Monorepo 迁移破坏现有 API | 先 `git mv` 不改逻辑；每步跑 typecheck/build |
| 两套后端维护成本 | NestJS 只做管理/BFF；共享契约；不复制公共 API |
| 管理端数据拆分复杂 | 回退共享 MySQL，但保留 schema 边界和内部接口 |
| P0a 2 周偏紧 | 只做垂直切片；宁可推迟评论/点赞，不要推迟投递 |
| K8s 学习曲线 | 本地 k3d + Helm，不做多集群 |
| AI 成本/不稳定 | P2b 可选；默认 mock/可关闭 |

**裁剪线**：P0a/P0b/P1 必须完成；P2a 保 K8s + 压测 + ADR；P2b 可砍。

---

## 9. 后续文章

阶段二按里程碑追加实施记录，不提前写未实现的内容：

| 篇 | 主题 | 状态 |
|---|---|---|
| 24 | P0：Next.js 前台 + 公共 API 工程化 | 待更新 |
| 25 | P1：NestJS 管理/BFF + RabbitMQ + 可观测性 | 待更新 |
| 26 | P2：K8s + 搜索 + AI | 待更新 |
| 27+ | 会员/支付、图片/附件、推荐等业务扩展 | 待更新 |

阶段一 6 篇继续作为 Express 核心教程；阶段二只追加，不重写。这样既保留已有内容，也符合「编号只增不改、阶段只追加」的规则。
