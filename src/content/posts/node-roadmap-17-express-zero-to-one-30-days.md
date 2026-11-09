---
title: '17 · Express 企业级服务 0→1：30 天逐日执行路线（持续更新）'
published: 2026-11-09T18:00:00+08:00
updated: 2026-11-09T22:00:00+08:00
description: '企业级社区 Node 服务全链路手册：Express 5 + Prisma + MySQL + Redis + BullMQ，Day 1–24 每天给出做什么、怎么做、安装命令、代码片段和验收，最后拼成可测试、可压测、可部署的完整项目。'
tags: [Node.js, Express, 从0到1, 30天计划]
category: Node全栈学习路线
draft: false
---

> [!NOTE]
> 这是一份**持续更新**的工程手册，不是一次性教程。
> 目标：4 周后拿出一个**能跑、能测、能部署、能讲 10 分钟**的服务。
> 蓝图：本项目《社区社群全栈：从 0 到 1》。**每天只读当天要用的那一节**，不要通读。
> 每天结束必须有三样：**一个 commit、一次验证输出、5 行笔记**。

---

## 文档规则：代码必须完整

> [!WARNING]
> 从 2026-11-09 起，本文所有涉及代码的步骤，必须给出**可以直接保存并运行**的完整代码。只写「写一个 `app.ts`」「按上面的思路实现」「其余同上」都算不合格。

具体约束：

1. **文件级**：只要出现「写某个文件」，就给出该文件的完整内容，不用 `...` 省略任何一段。
2. **路径级**：每个代码块上方写清文件路径，例如 `src/app.ts`，读者不需要猜文件放哪。
3. **命令级**：给出完整命令，并写清在哪个目录执行；涉及环境变量的命令要写完整写法。
4. **版本级**：依赖版本以 `package.json` 为准；如果版本会随安装时间变化，明确说明「以安装结果为准」，不写模糊的「最新版」。
5. **变更级**：如果是改已有文件，给出修改后的完整文件；只给 diff 时，必须保证 diff 能直接应用。
6. **验收级**：每个代码块后面要有可复制的验证命令和预期输出，不能只写「应该能跑」。

当前完成度：**Day 1–24 已补齐全链路实现路径**。Day 1–2 给完整文件；Day 3–24 给增量文件、变更片段、安装命令和验收，避免重复前面已经写过的代码；Day 24 后面有「毕业验收：完整项目清单」。

---

## 版本记录

| 版本 | 日期 | 修改 |
|---|---|---|
| v0.1 | 2026-11-07 | 初版：范围冻结、30 天逐日清单、周验收与讲解要求 |
| v0.2 | 2026-11-09 | 收录到博客；Day 1 补齐 package.json / tsconfig / docker-compose / app.ts / server.ts 完整代码；新增「代码必须完整」规则 |
| v0.3 | 2026-11-09 | 补齐 Day 2：config / logger / errors / middleware / app / server 完整代码与验收 |
| v0.4 | 2026-11-09 | 全链路完善：Day 3–24 补齐架构设计、怎么做、代码片段、验收、故障注入、Docker/CI/指标与毕业验收清单 |
| v1.0 | 待定 | 按本文落地并通过毕业验收：完整可运行、可演示、可压测、可部署 |

---

## 0. 这份文档怎么用

1. **不要跳章**：前 3 周是地基，跳过会在后面反复返工。
2. **每天只读当天那一节**：30 天路线不是 30 章教科书，通读只会制造「我好像会了」的错觉。
3. **每章先跑通再优化**：先让接口返回，再谈缓存、队列、监控。
4. **每章写 ADR**：为什么选它、不选什么、代价是什么。架构能力就是这么练出来的。
5. **代码必须能跑**：不能跑的示例不算完成；本文的代码块按上面的规则给完整文件。
6. **每完成一天，更新版本记录和完成度**。

---

## 1. 范围冻结

### 做

- 注册 / 登录 / 刷新 / 登出
- 用户资料 / 关注
- 发帖 / 评论 / 点赞
- 关注流（游标分页）
- 通知（Outbox + BullMQ + SSE）
- 审核 / 举报 / 后台列表（基础）
- 单测 / 集成测试 / 压测
- Docker / Nginx / CI / 日志 / 指标 / 优雅关闭

### 不做

支付、会员、搜索、推荐、图片上传、微服务、K8s、复杂前端页面。

> 这些不是永远不做，而是不放进 30 天核心闭环。核心闭环跑通后，按「可插拔扩展」一节的顺序加，不需要推翻现有模块。

**为什么先冻结范围**：30 天最容易被「顺手加个功能」拖垮。先把闭环跑通，再谈扩展。

---

## 1.5 企业级架构：业务域、边界与高并发设计

> [!NOTE]
> 这一节回答一个问题：**这 30 天最后拼出来的到底是一个什么样的服务？** 先把全景图和边界立住，后面的每一天才知道自己往哪块拼。

### 1.5.1 项目定位

- 业务：社区/社群核心闭环——人、内容、关系、信息流、通知、治理。
- 形态：模块化单体（modular monolith），一个 API 进程 + 一个 worker 进程，不是微服务。
- 框架：Express 5 + TypeScript strict + Prisma + MySQL 8 + Redis 7 + BullMQ。
- 目标：单机可跑、可测、可压测、可部署；后续按模块拆服务不推翻。

**为什么不做微服务**：社区 MVP 的边界还在变，微服务会把事务、部署、排障复杂度提前放大。模块化单体把边界留在代码里，等流量和团队规模真的需要时再拆。

### 1.5.2 业务域与模块边界

| 业务域 | 负责什么 | 代码模块 | 对外入口 |
|---|---|---|---|
| 身份 | 注册、登录、刷新、登出、RBAC | `modules/auth` | `/api/v1/auth/*` |
| 用户 | 个人资料、关注关系 | `modules/users` | `/api/v1/users/*` |
| 内容 | 发帖、评论、点赞、软删除 | `modules/posts`、`comments`、`likes` | `/api/v1/posts/*` |
| 信息流 | 关注流、游标分页 | `modules/feed` | `/api/v1/feed` |
| 通知 | 站内通知、SSE 推送 | `modules/notifications` | `/api/v1/notifications/*` |
| 治理 | 审核、举报、后台列表 | `modules/moderation`、`reports`、`admin` | `/api/v1/admin/*` |
| 基础设施 | 配置、日志、错误、DB、Redis、队列 | `common/*`、`jobs/*` | 内部 |

### 1.5.3 分层与依赖方向

```text
HTTP (routes)
  → controller（解析请求/组装响应）
    → service（业务规则/事务边界）
      → repository（Prisma/原生 SQL）
        → MySQL / Redis / 队列
```

规则：

1. `routes` 不写业务，只做参数解析、鉴权、调用 service、返回响应。
2. `service` 不拼 HTTP 响应，只返回领域结果或抛 `AppError`。
3. 跨模块只调用对方 `service` 暴露的方法，**不直接 import 对方的 repository**。
4. 副作用（通知、审计、搜索索引）通过 Outbox 事件解耦，不在主事务里直接调下游。
5. `common` 只能被模块依赖，不能反向依赖任何业务模块。

### 1.5.4 高并发设计清单

| 问题 | 手段 | 落在哪天 |
|---|---|---|
| 列表深分页慢 | 游标分页 + 复合索引 | Day 7 / 10 |
| 点赞重复计数 | 唯一约束 + 事务内条件更新 | Day 9 |
| 评论计数不一致 | 同事务更新计数 | Day 8 |
| 热点读 | Redis 缓存 + 短 TTL + 主动失效 | Day 23 扩展 |
| 写接口重复提交 | `Idempotency-Key` + 唯一键 | Day 9 / 23 |
| 通知拖慢主链路 | Outbox + BullMQ 异步消费 | Day 13 / 14 |
| 多实例限流 | Redis 计数器 | Day 17 / 23 |
| 长连接 | SSE + Redis Pub/Sub | Day 15 |
| 进程重启丢请求 | 优雅关闭 + 超时 | Day 22 |
| 容量未知 | autocannon 基线 + 压测报告 | Day 11 / 23 |

### 1.5.5 可迭代设计清单

- API 统一 `/api/v1` 前缀，破坏性变更走新版本。
- 每个模块自带 `schemas.ts`（zod 契约）、`service.ts`（业务）、`routes.ts`（HTTP）。
- 数据库变更只走 Prisma migration，不手改线上表。
- 关键决策写 ADR：认证、Outbox、信息流各一篇。
- 测试分层：service 单测 + supertest 集成测试 + 压测脚本。
- CI 每次提交跑 typecheck / test / build，失败阻断合并。

### 1.5.6 最终目录结构

```text
community/
  prisma/
    schema.prisma
    seed.ts
    migrations/
  src/
    app.ts
    server.ts
    common/
      config.ts
      logger.ts
      errors.ts
      middleware.ts
      db.ts
      redis.ts
      auth.ts
      pagination.ts
      outbox.ts
      metrics.ts
    modules/
      auth/
      users/
      posts/
      comments/
      likes/
      feed/
      notifications/
      moderation/
      reports/
      admin/
    jobs/
      queue.ts
      outbox.worker.ts
      notification.worker.ts
    types/
      express.d.ts
  tests/
  docs/
    adr/
    load-baseline.md
    load-report.md
  Dockerfile
  docker-compose.yml
  .github/workflows/ci.yml
  .env.example
```

### 1.5.7 业务覆盖矩阵

| 能力 | 交付日 | 验收标准 |
|---|---|---|
| 注册/登录/刷新/登出 | Day 4 | 旧 refresh 重放 401 |
| RBAC/关注 | Day 5 | 401/403/重复关注一行 |
| 测试基线 | Day 6 | 5 个测试全绿 |
| 发帖/软删除 | Day 7 | pending 不进列表，作者可见 |
| 评论+计数 | Day 8 | 事务回滚验证 |
| 点赞幂等 | Day 9 | 20 并发只加 1 |
| 关注流 | Day 10 | 游标不重不漏 |
| 基线压测 | Day 11 | QPS/P95 报告 |
| 并发破坏 | Day 12 | 计数与 DB 对得上 |
| Outbox | Day 13 | 业务回滚事件不在 |
| 通知消费 | Day 14 | 自己操作自己不通知 |
| SSE | Day 15 | 1 秒内收到事件 |
| 审核/举报/后台 | Day 16 | pending 审核后进 feed |
| 故障注入 | Day 17 | 依赖挂掉返回 503/504 |
| 演示 | Day 18 | 10 分钟讲清异步链路 |
| Docker | Day 19 | 一条命令起全栈 |
| Nginx/SSE | Day 20 | SSE 不被缓冲 |
| CI | Day 21 | 类型错误阻断合并 |
| 指标/优雅关闭 | Day 22 | SIGTERM 等完在途请求 |
| 压测/回滚 | Day 23 | 5 分钟内回滚 |
| README/ADR/讲稿 | Day 24 | 别人照 README 能跑 |

### 1.5.8 代码复用约定

- Day 1–2 已经给出的完整文件（`app.ts`、`server.ts`、`config.ts`、`logger.ts`、`errors.ts`、`middleware.ts`）不再整段重复。
- Day 3–24 默认给**新增文件**或**变更片段**，每段上方写清路径和插入位置。
- 通用模板只写一次：例如 Day 7 的 posts 模块给完整三件套，Day 8/9 只写与 posts 不同的 service 逻辑。
- 看到「复用 Day N 的模板」时，意思是照抄结构、替换模块名和字段，不是省略实现。

**为什么这样写**：全链路文档最容易变成 30 份重复代码。把「重复结构」和「当天新增知识」分开，才能既完整又可读。

---

## 2. 每天 2 小时怎么用

| 时间 | 做什么 |
|---|---|
| 0–10 分钟 | 看今天要做的**一节**文档，写下 3 个验收点 |
| 10–70 分钟 | 关掉 AI，自己写核心逻辑 |
| 70–100 分钟 | 用 curl / supertest 验证，记录输出 |
| 100–120 分钟 | 写 5 行笔记 + commit |

**AI 规则**：核心逻辑先自己写；AI 用来生成测试、补文档、review diff；不允许整段复制。

**卡住 30 分钟**：写下假设 → 问 AI 要解释而不是答案 → 自己敲修复。

---

## 第 1 周：地基 + 认证

## Day 1：把服务跑起来

**今天目标**：空目录 → 一个能返回 `/health` 的 Node 服务 + MySQL/Redis 容器。

### 1. 初始化项目

工作目录：任意空目录。

```bash
mkdir community
cd community
git init
pnpm init
```

### 2. 安装依赖

```bash
pnpm add express zod pino dotenv
pnpm add -D typescript tsx @types/node @types/express
```

> [!TIP]
> 你不需要在代码里用到 `zod`、`pino`、`dotenv` 的全部能力，但 Day 1 先把依赖装好，后面几天不用反复停下来安装。

### 3. 配置 package.json

`package.json` 完整内容如下。重点是 `"type": "module"`、`dev`、`build`、`start` 三个脚本，以及 `start` 指向 `dist/server.js`（不是 `dist/index.js`）。

```json
{
  "name": "community",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "dotenv": "^18.0.9",
    "express": "^5.3.0",
    "pino": "^10.4.0",
    "zod": "^4.6.7"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^26.6.6",
    "tsx": "^4.23.15",
    "typescript": "^7.0.2"
  }
}
```

> [!NOTE]
> 上面的版本号来自实际安装结果；你执行 `pnpm add` 时如果版本更新，保留新版本即可。**不要改脚本名**，后面所有命令都依赖 `dev`、`build`、`start`。

### 4. 配置 tsconfig.json

`tsconfig.json` 完整内容如下。`module` 和 `moduleResolution` 都必须是 `NodeNext`，这样 TypeScript 才会按 Node 的 ESM 规则检查导入路径。

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src"]
}
```

### 5. 配置 docker-compose.yml

`docker-compose.yml` 完整内容如下。MySQL 8 和 Redis 7 都带健康检查，容器挂掉后会自动重启。

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: community-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: community
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-uroot", "-proot"]
      interval: 10s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    container_name: community-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 10

volumes:
  mysql-data:
  redis-data:
```

### 6. 写 src/app.ts

`src/app.ts` 完整内容如下。这个文件只负责创建并装配 Express 应用，**不监听端口**；监听端口留给 `server.ts`，这样测试可以直接 `createApp()` 而不用真的起服务。

```ts
import express from 'express';
import type { Express } from 'express';

export function createApp(): Express {
  const app = express();

  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  return app;
}
```

### 7. 写 src/server.ts

`src/server.ts` 完整内容如下。注意导入路径写的是 `./app.js`，不是 `./app`：在 `NodeNext` 的 ESM 模式下，源码里的相对导入也要带最终产物后缀，`tsc` 和 `tsx` 都能正确处理。

```ts
import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

app.listen(port, () => {
  console.log(`API listening on http://127.0.0.1:${port}`);
});
```

### 8. 启动并验收

先起基础设施：

```bash
docker compose up -d
```

确认两个容器都是 `Up`：

```bash
docker compose ps
```

预期输出里能看到 `community-mysql` 和 `community-redis`，状态列类似 `Up (healthy)`。

再起服务：

```bash
pnpm dev
```

另开一个终端验证：

```bash
curl -i http://127.0.0.1:3000/health
```

预期输出：

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"status":"ok"}
```

再验证一次构建产物，确认 `tsc` 的输出路径和 `start` 脚本对得上：

```bash
pnpm build
pnpm start
```

预期终端只打印一行：

```text
API listening on http://127.0.0.1:3000
```

**达到什么效果**

- `docker compose ps` 两个容器 `Up`。
- `curl http://127.0.0.1:3000/health` 返回 `{"status":"ok"}`。
- 进程日志只有一行启动信息，没有报错。
- `pnpm build` 后 `dist/app.js`、`dist/server.js` 都存在。

**产出**：第一个 commit `chore: bootstrap node service`。

```bash
git add .
git commit -m "chore: bootstrap node service"
```

> [!WARNING]
> 不要跳过 Day 1 的验收。端口、TS 编译、ESM 导入后缀这三件事只要有一个没通，后面所有天都会在同一个地方反复卡住。

## Day 2：配置、日志、错误、trace

**今天目标**：所有错误返回统一 JSON，所有日志能按一次请求串起来。

> [!TIP]
> 今天不需要新增依赖：Day 1 已经装了 `dotenv`、`zod`、`pino`。

### 1. 准备环境变量

先把 `.env` 挡在 Git 外面。`.gitignore` 完整内容如下：

```text
node_modules/
dist/
coverage/
.idea/
.env
.env.*
!.env.example
```

`.env.example` 完整内容如下（可以提交，作为团队模板）：

```ini
NODE_ENV=development
PORT=3000
DATABASE_URL="mysql://root:root@127.0.0.1:3306/community"
REDIS_URL="redis://127.0.0.1:6379"
JWT_SECRET="replace-with-a-random-string-at-least-32-chars"
WEB_ORIGIN="http://localhost:5173"
LOG_LEVEL=info
```

`.env` 完整内容如下（**只放本地，不要提交**）：

```ini
NODE_ENV=development
PORT=3000
DATABASE_URL="mysql://root:root@127.0.0.1:3306/community"
REDIS_URL="redis://127.0.0.1:6379"
JWT_SECRET="dev-only-change-me-0123456789abcdef"
WEB_ORIGIN="http://localhost:5173"
LOG_LEVEL=debug
```

生成方式：

```bash
cp .env.example .env
```

> [!TIP]
> 这里的账号、密码、库名要和 Day 1 的 `docker-compose.yml` 保持一致；如果你改过 compose，`.env` 也要同步改。

> [!WARNING]
> `JWT_SECRET` 至少 32 个字符；示例值只能用于本地。`.env` 必须命中 `.gitignore`，否则第一次 `git add .` 就会把密钥提交进去。

### 2. 写 src/common/config.ts

路径：`src/common/config.ts`。完整内容如下：

```ts
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  WEB_ORIGIN: z.url(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.issues);
  process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;
```

**为什么启动即校验**：坏配置不要等到第一次请求才炸。`z.coerce.number()` 负责把字符串端口转成数字，`z.url()` 负责校验连接串格式。

### 3. 写 src/common/logger.ts

路径：`src/common/logger.ts`。完整内容如下：

```ts
import pino from 'pino';
import { config } from './config.js';

export const logger = pino({
  level: config.LOG_LEVEL,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      '*.password',
      'token',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
});
```

**为什么用 pino**：结构化 JSON 可以直接按字段检索；`redact` 保证密码、Cookie、Authorization 不会进日志。

### 4. 写 src/common/errors.ts

路径：`src/common/errors.ts`。完整内容如下：

```ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

**为什么要有 AppError**：业务代码只表达「错误码 + HTTP 状态 + 可展示消息」，不用在 controller 里拼响应。

### 5. 写 src/common/middleware.ts

路径：`src/common/middleware.ts`。完整内容如下：

```ts
import { randomUUID } from 'node:crypto';
import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import { ZodError } from 'zod';
import { AppError } from './errors.js';
import { logger } from './logger.js';

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/;

export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.header('x-request-id');
  const id = incoming && REQUEST_ID_PATTERN.test(incoming) ? incoming : randomUUID();

  res.locals.requestId = id;
  res.setHeader('x-request-id', id);
  next();
};

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(handler: AsyncRoute): RequestHandler {
  return (req, res, next) => {
    Promise.resolve()
      .then(() => handler(req, res, next))
      .catch(next);
  };
}

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError('NOT_FOUND', 404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const requestId = String(res.locals.requestId ?? '');

  if (err instanceof AppError) {
    logger.warn({ err, requestId }, 'request failed');
    res.status(err.status).json({
      code: err.code,
      message: err.message,
      details: err.details ?? null,
      requestId,
    });
    return;
  }

  if (err instanceof ZodError) {
    logger.warn({ err, requestId }, 'validation failed');
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: err.issues,
      requestId,
    });
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    logger.warn({ err, requestId }, 'invalid json body');
    res.status(400).json({
      code: 'INVALID_JSON',
      message: 'Request body is not valid JSON',
      requestId,
    });
    return;
  }

  logger.error({ err, requestId }, 'unhandled error');
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    requestId,
  });
};
```

四个中间件分别解决什么：

- `requestId`：优先透传合法的 `x-request-id`，没有就生成 UUID；同时写回响应头。
- `asyncHandler`：把同步异常和 rejected Promise 都交给 `next()`，统一进错误中间件。
- `notFound`：所有未命中路由统一变成 `AppError('NOT_FOUND', 404, ...)`。
- `errorHandler`：`AppError` → 业务码，`ZodError` → 400，坏的 JSON body → 400，其他 → 500。

> [!NOTE]
> Express 5 已经能自动捕获 async handler 的 rejected Promise。`asyncHandler` 保留下来是为了统一写法，也方便以后换回 Express 4 或接入自定义包装。

### 6. 更新 src/app.ts

路径：`src/app.ts`。完整内容如下（整体替换 Day 1 的版本）：

```ts
import express from 'express';
import type { Express } from 'express';
import { errorHandler, notFound, requestId } from './common/middleware.js';

export function createApp(): Express {
  const app = express();

  app.use(requestId);
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
```

挂载顺序不能乱：

- `requestId` 必须最前，后面所有日志和错误响应才能拿到同一个 id；
- `express.json()` 在路由之前；
- `notFound` 必须在所有路由之后；
- `errorHandler` 必须最后，而且必须是 4 个参数，否则 Express 不会把它当错误中间件。

### 7. 更新 src/server.ts

路径：`src/server.ts`。完整内容如下：

```ts
import { config } from './common/config.js';
import { logger } from './common/logger.js';
import { createApp } from './app.js';

const app = createApp();

app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'API listening');
});
```

**为什么用 `config.PORT`**：端口来源只保留 `.env` 一处，不在代码里散落 `process.env`。

### 8. 启动并验收

```bash
pnpm dev
```

另开一个终端，按顺序验收。

**验收 1：健康检查带 requestId**

```bash
curl -i -H "x-request-id: test-123" http://127.0.0.1:3000/health
```

预期（重点是响应头里的 `x-request-id: test-123`）：

```http
HTTP/1.1 200 OK
x-request-id: test-123
Content-Type: application/json; charset=utf-8

{"status":"ok"}
```

**验收 2：404 返回 JSON，不是 HTML**

```bash
curl -i http://127.0.0.1:3000/nope
```

预期：

```http
HTTP/1.1 404 Not Found
x-request-id: <uuid>
Content-Type: application/json; charset=utf-8

{"code":"NOT_FOUND","message":"Route not found: GET /nope","details":null,"requestId":"<uuid>"}
```

**验收 3：未捕获异常返回 500 JSON，并且日志能用 requestId 找到**

临时在 `src/app.ts` 的 `/health` 后面加一个测试路由（验证完删除）：

```ts
app.get('/boom', asyncHandler(async () => {
  throw new Error('boom');
}));
```

同时把 `asyncHandler` 加进 import：

```ts
import { asyncHandler, errorHandler, notFound, requestId } from './common/middleware.js';
```

重启后：

```bash
curl -i http://127.0.0.1:3000/boom
```

预期：

```http
HTTP/1.1 500 Internal Server Error
x-request-id: <uuid>
Content-Type: application/json; charset=utf-8

{"code":"INTERNAL_ERROR","message":"Internal server error","requestId":"<uuid>"}
```

终端日志里会出现同一条 `requestId` 的 `unhandled error`，并带 `err.stack`。用这个 id 去日志里搜，就能把一次请求串起来。

**验收 4：坏的 JSON body 返回 400**

```bash
curl -i -X POST -H "Content-Type: application/json" -d '{bad' http://127.0.0.1:3000/health
```

预期：

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8

{"code":"INVALID_JSON","message":"Request body is not valid JSON","requestId":"<uuid>"}
```

**验收 5：坏配置启动即失败**

```bash
JWT_SECRET=short pnpm dev
```

预期进程直接退出，并打印 `Invalid environment variables`，而不是带病启动。PowerShell 下等价写法是 `$env:JWT_SECRET='short'; pnpm dev`。

**达到什么效果**

- `curl -i /health` 响应头有 `x-request-id`。
- `curl /nope` 返回 `{code:"NOT_FOUND"}`，不是 HTML。
- 临时 `/boom` 返回 500 JSON，日志里能用 requestId 找到这条。
- 坏的 JSON body 返回 400，不是 500。
- `JWT_SECRET` 不合法时服务启动失败。

**产出**：commit `feat: unify config logging errors and trace`。

```bash
git add .
git commit -m "feat: unify config logging errors and trace"
```

## Day 3：Prisma、完整领域模型、种子

**今天目标**：把社区核心业务表一次建齐，生成 Prisma Client，并写入管理员/普通用户和 RBAC 种子数据。

> [!NOTE]
> 今天会把后面 20 多天要用的表一次建好，避免每天改 schema。表按「身份 / 内容 / 关系 / 通知 / 治理 / 基础设施」分组，后面每天只写业务代码和必要迁移。

### 1. 安装与初始化

```bash
pnpm add @prisma/client argon2
pnpm add -D prisma
pnpm exec prisma init --datasource-provider mysql
```

说明：`argon2` 今天就要用，因为 seed 要创建可登录的 admin 用户；Day 4 不再重复安装。

确认 Day 2 的 `.env` 里有：

```ini
DATABASE_URL="mysql://root:root@127.0.0.1:3306/community"
```

### 2. 写 prisma/schema.prisma

路径：`prisma/schema.prisma`。完整内容如下：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum UserStatus {
  active
  banned
  deleted
}

enum PostStatus {
  draft
  pending
  published
  rejected
  deleted
}

enum PostVisibility {
  public
  followers
  private
}

enum CommentStatus {
  pending
  published
  rejected
  deleted
}

enum LikeTargetType {
  post
  comment
}

enum NotificationType {
  like
  comment
  follow
  system
}

enum ReportTargetType {
  post
  comment
  user
}

enum ReportStatus {
  pending
  resolved
  rejected
}

enum ModerationAction {
  approve
  reject
  delete
  ban
}

enum OutboxStatus {
  pending
  processing
  done
  failed
}

model User {
  id              BigInt        @id @default(autoincrement())
  email           String        @unique @db.VarChar(255)
  phone           String?       @unique @db.VarChar(32)
  passwordHash    String        @map("password_hash") @db.VarChar(255)
  nickname        String        @db.VarChar(64)
  avatarUrl       String?       @map("avatar_url") @db.VarChar(512)
  bio             String?       @db.VarChar(255)
  status          UserStatus    @default(active)
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  refreshTokens   RefreshToken[]
  roles           UserRole[]
  posts           Post[]
  comments        Comment[]
  likes           Like[]
  following       Follow[]      @relation("follower")
  followers       Follow[]      @relation("followee")
  notifications   Notification[] @relation("notification_recipient")
  reports         Report[]      @relation("report_reporter")
  idempotencyKeys IdempotencyKey[]

  @@index([createdAt])
  @@map("users")
}

model RefreshToken {
  id        BigInt    @id @default(autoincrement())
  userId    BigInt    @map("user_id")
  tokenHash String    @unique @map("token_hash") @db.Char(64)
  expiresAt DateTime  @map("expires_at")
  revokedAt DateTime? @map("revoked_at")
  userAgent String?   @map("user_agent") @db.VarChar(255)
  ip        String?   @db.VarChar(64)
  createdAt DateTime  @default(now()) @map("created_at")

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("refresh_tokens")
}

model Role {
  id              BigInt           @id @default(autoincrement())
  code            String           @unique @db.VarChar(64)
  name            String           @db.VarChar(64)
  createdAt       DateTime         @default(now()) @map("created_at")

  userRoles       UserRole[]
  rolePermissions RolePermission[]

  @@map("roles")
}

model Permission {
  id              BigInt           @id @default(autoincrement())
  code            String           @unique @db.VarChar(64)
  name            String           @db.VarChar(64)
  createdAt       DateTime         @default(now()) @map("created_at")

  rolePermissions RolePermission[]

  @@map("permissions")
}

model UserRole {
  userId BigInt @map("user_id")
  roleId BigInt @map("role_id")

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  role   Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
  @@index([roleId])
  @@map("user_roles")
}

model RolePermission {
  roleId       BigInt @map("role_id")
  permissionId BigInt @map("permission_id")

  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
  @@index([permissionId])
  @@map("role_permissions")
}

model Post {
  id           BigInt         @id @default(autoincrement())
  authorId     BigInt         @map("author_id")
  title        String?        @db.VarChar(200)
  content      String         @db.Text
  status       PostStatus     @default(pending)
  visibility   PostVisibility @default(public)
  likeCount    Int            @default(0) @map("like_count")
  commentCount Int            @default(0) @map("comment_count")
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")
  deletedAt    DateTime?      @map("deleted_at")

  author       User           @relation(fields: [authorId], references: [id])
  comments     Comment[]

  @@index([authorId, createdAt])
  @@index([status, createdAt])
  @@map("posts")
}

model Comment {
  id        BigInt        @id @default(autoincrement())
  postId    BigInt        @map("post_id")
  authorId  BigInt        @map("author_id")
  parentId  BigInt?       @map("parent_id")
  content   String        @db.VarChar(2000)
  status    CommentStatus @default(published)
  likeCount Int           @default(0) @map("like_count")
  createdAt DateTime      @default(now()) @map("created_at")
  deletedAt DateTime?     @map("deleted_at")

  post      Post          @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    User          @relation(fields: [authorId], references: [id])
  parent    Comment?      @relation("comment_replies", fields: [parentId], references: [id])
  replies   Comment[]     @relation("comment_replies")

  @@index([postId, createdAt])
  @@index([parentId])
  @@map("comments")
}

model Like {
  id         BigInt         @id @default(autoincrement())
  userId     BigInt         @map("user_id")
  targetType LikeTargetType @map("target_type")
  targetId   BigInt         @map("target_id")
  createdAt  DateTime       @default(now()) @map("created_at")

  user       User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, targetType, targetId])
  @@index([targetType, targetId])
  @@map("likes")
}

model Follow {
  followerId BigInt   @map("follower_id")
  followeeId BigInt   @map("followee_id")
  createdAt  DateTime @default(now()) @map("created_at")

  follower   User     @relation("follower", fields: [followerId], references: [id], onDelete: Cascade)
  followee   User     @relation("followee", fields: [followeeId], references: [id], onDelete: Cascade)

  @@id([followerId, followeeId])
  @@index([followeeId])
  @@map("follows")
}

model Notification {
  id         BigInt           @id @default(autoincrement())
  userId     BigInt           @map("user_id")
  type       NotificationType
  actorId    BigInt?          @map("actor_id")
  targetType String?          @map("target_type") @db.VarChar(32)
  targetId   BigInt?          @map("target_id")
  payload    Json?
  readAt     DateTime?        @map("read_at")
  createdAt  DateTime         @default(now()) @map("created_at")

  user       User             @relation("notification_recipient", fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([userId, readAt])
  @@map("notifications")
}

model Report {
  id         BigInt           @id @default(autoincrement())
  reporterId BigInt           @map("reporter_id")
  targetType ReportTargetType @map("target_type")
  targetId   BigInt           @map("target_id")
  reason     String           @db.VarChar(255)
  status     ReportStatus     @default(pending)
  handledBy  BigInt?          @map("handled_by")
  createdAt  DateTime         @default(now()) @map("created_at")

  reporter   User             @relation("report_reporter", fields: [reporterId], references: [id], onDelete: Cascade)

  @@index([status, createdAt])
  @@index([targetType, targetId])
  @@map("reports")
}

model ModerationRecord {
  id         BigInt           @id @default(autoincrement())
  targetType String           @map("target_type") @db.VarChar(32)
  targetId   BigInt           @map("target_id")
  action     ModerationAction
  operatorId BigInt?          @map("operator_id")
  reason     String?          @db.VarChar(255)
  createdAt  DateTime         @default(now()) @map("created_at")

  @@index([targetType, targetId])
  @@index([createdAt])
  @@map("moderation_records")
}

model OutboxEvent {
  id          BigInt       @id @default(autoincrement())
  type        String       @db.VarChar(64)
  payload     Json
  status      OutboxStatus @default(pending)
  retryCount  Int          @default(0) @map("retry_count")
  createdAt   DateTime     @default(now()) @map("created_at")
  processedAt DateTime?    @map("processed_at")

  @@index([status, createdAt])
  @@map("outbox_events")
}

model IdempotencyKey {
  key         String   @id @db.VarChar(128)
  userId      BigInt   @map("user_id")
  requestHash String   @map("request_hash") @db.Char(64)
  response    Json?
  status      String   @default("processing") @db.VarChar(20)
  createdAt   DateTime @default(now()) @map("created_at")
  expiresAt   DateTime @map("expires_at")

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([expiresAt])
  @@map("idempotency_keys")
}
```

几个关键决策：

- **BigInt 主键**：对外统一转成字符串，避免 JavaScript 精度丢失。
- **软删除**：帖子/评论用 `status + deletedAt`，不物理删除，方便审计和恢复。
- **唯一约束**：`likes` 的 `(userId, targetType, targetId)`、`follows` 的复合主键、`refresh_tokens.token_hash`，都是幂等的最后一道防线。
- **复合索引**：按真实查询建，不为「可能用到」建索引。
- **审计字段不建外键**：`handledBy`、`operatorId`、`actorId` 故意只存 ID，用户删除后审计记录仍然保留。

### 3. 写 src/common/db.ts

路径：`src/common/db.ts`。完整内容如下：

```ts
import { PrismaClient } from '@prisma/client';
import { config } from './config.js';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: config.DATABASE_URL,
    log: config.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (config.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**为什么挂到 globalThis**：`tsx watch` 热重载会重复执行模块，不挂全局会不断创建新的连接池。

### 4. 写 prisma/seed.ts

路径：`prisma/seed.ts`。完整内容如下：

```ts
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const permissionSeeds = [
    { code: 'admin:access', name: '访问后台' },
    { code: 'post:review', name: '审核帖子' },
    { code: 'report:handle', name: '处理举报' },
    { code: 'user:ban', name: '封禁用户' },
  ];

  for (const item of permissionSeeds) {
    await prisma.permission.upsert({
      where: { code: item.code },
      update: { name: item.name },
      create: item,
    });
  }

  const adminRole = await prisma.role.upsert({
    where: { code: 'admin' },
    update: { name: '管理员' },
    create: { code: 'admin', name: '管理员' },
  });
  const userRole = await prisma.role.upsert({
    where: { code: 'user' },
    update: { name: '普通用户' },
    create: { code: 'user', name: '普通用户' },
  });

  const permissions = await prisma.permission.findMany();
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  const passwordHash = await argon2.hash('Admin123!ChangeMe');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { passwordHash },
    create: {
      email: 'admin@test.com',
      passwordHash,
      nickname: 'Admin',
    },
  });
  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: admin.id, roleId: adminRole.id },
    },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: { passwordHash },
    create: {
      email: 'user@test.com',
      passwordHash,
      nickname: 'User',
    },
  });
  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: user.id, roleId: userRole.id },
    },
    update: {},
    create: { userId: user.id, roleId: userRole.id },
  });

  console.log('Seed done: admin@test.com / user@test.com');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

在 `package.json` 顶层增加 seed 配置（不要覆盖已有字段）：

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### 5. 执行迁移和种子

```bash
pnpm exec prisma migrate dev --name init
pnpm exec prisma db seed
pnpm exec prisma studio
```

### 6. 验收

```bash
pnpm exec prisma migrate status
```

预期：`Database schema is up to date!`，没有 drift。

打开 `pnpm exec prisma studio`，确认能看到：

- `users`：`admin@test.com`、`user@test.com`
- `roles`：`admin`、`user`
- `permissions`：4 条
- `user_roles`：管理员绑定 admin，普通用户绑定 user
- 其余内容/关系/通知/治理表已建好，暂时为空

再跑一次种子，确认幂等：

```bash
pnpm exec prisma db seed
```

预期：不报唯一键冲突，数据不重复。

**常见错误**

- `P1001 Can't reach database server`：MySQL 没起，先 `docker compose ps`。
- `Environment variable not found: DATABASE_URL`：不在项目根目录执行，或 `.env` 没加载。
- `prisma db seed` 不执行：`package.json` 的 `prisma.seed` 没配。
- 迁移 drift：开发期不要手改表，确需重来用 `pnpm exec prisma migrate reset`。

**产出**：commit `feat: add prisma schema and seed`。

```bash
git add .
git commit -m "feat: add prisma schema and seed"
```

## Day 4：注册、登录、刷新、登出

**今天目标**：完整认证闭环，refresh 轮换，旧 refresh 不能重放。

### 1. 安装依赖

```bash
pnpm add jsonwebtoken cookie-parser cors
pnpm add -D @types/jsonwebtoken @types/cookie-parser @types/cors
```

`argon2` 在 Day 3 已安装，不重复装。

### 2. 给 config.ts 增加两个字段

在 Day 2 的 `envSchema` 里追加：

```ts
JWT_ACCESS_TTL: z.string().default('15m'),
JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(7),
```

`.env.example` 和 `.env` 同步增加：

```ini
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL_DAYS=7
```

### 3. 写 src/types/express.d.ts

路径：`src/types/express.d.ts`。完整内容如下：

```ts
import type { AccessPayload } from '../modules/auth/token.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: AccessPayload;
    }
  }
}

export {};
```

这样后面的 `requireAuth` 就能直接写 `req.user`，不用到处 `as any`。

### 4. 写 src/modules/auth/token.service.ts

路径：`src/modules/auth/token.service.ts`。完整内容如下：

```ts
import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { config } from '../../common/config.js';

export type AccessPayload = {
  sub: string;
  roles: string[];
};

export function signAccessToken(payload: AccessPayload): string {
  const expiresIn = config.JWT_ACCESS_TTL as SignOptions['expiresIn'];
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn, algorithm: 'HS256' });
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'] });
  if (typeof decoded === 'string') {
    throw new Error('Invalid token payload');
  }
  return {
    sub: String(decoded.sub),
    roles: Array.isArray(decoded.roles) ? decoded.roles.map(String) : [],
  };
}

export function createRefreshToken(): { token: string; tokenHash: string } {
  const token = randomBytes(48).toString('base64url');
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
```

**为什么 refresh 存哈希**：数据库泄露时，攻击者拿到的是 sha256，不是可直接使用的 refresh token。

### 5. 写 auth.schemas.ts、auth.service.ts、auth.controller.ts、auth.routes.ts

路径：`src/modules/auth/auth.schemas.ts`。完整内容如下：

```ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(72),
  nickname: z.string().min(1).max(64),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(72),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});
```

路径：`src/modules/auth/auth.service.ts`。完整内容如下：

```ts
import argon2 from 'argon2';
import { config } from '../../common/config.js';
import { prisma } from '../../common/db.js';
import { AppError } from '../../common/errors.js';
import { createRefreshToken, hashToken, signAccessToken } from './token.service.js';

type UserWithRoles = {
  id: bigint;
  email: string;
  nickname: string;
  status: string;
  roles: { role: { code: string } }[];
};

function toPublicUser(user: UserWithRoles) {
  return {
    id: user.id.toString(),
    email: user.email,
    nickname: user.nickname,
    roles: user.roles.map((item) => item.role.code),
  };
}

function refreshExpiresAt(): Date {
  return new Date(Date.now() + config.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export async function register(input: { email: string; password: string; nickname: string }) {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('EMAIL_TAKEN', 409, 'Email is already registered');
  }

  const passwordHash = await argon2.hash(input.password);
  const userRole = await prisma.role.findUnique({ where: { code: 'user' } });
  if (!userRole) {
    throw new AppError('ROLE_NOT_INITIALIZED', 500, 'User role is missing; run seed');
  }

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email, passwordHash, nickname: input.nickname.trim() },
    });
    await tx.userRole.create({ data: { userId: created.id, roleId: userRole.id } });
    return created;
  });

  return { id: user.id.toString(), email: user.email, nickname: user.nickname };
}

export async function login(input: {
  email: string;
  password: string;
  userAgent?: string;
  ip?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } },
  });
  if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
    throw new AppError('INVALID_CREDENTIALS', 401, 'Email or password is incorrect');
  }
  if (user.status !== 'active') {
    throw new AppError('ACCOUNT_DISABLED', 403, 'Account is not active');
  }

  const refresh = createRefreshToken();
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refresh.tokenHash,
      expiresAt: refreshExpiresAt(),
      userAgent: input.userAgent,
      ip: input.ip,
    },
  });

  return {
    accessToken: signAccessToken({
      sub: user.id.toString(),
      roles: user.roles.map((item) => item.role.code),
    }),
    refreshToken: refresh.token,
    user: toPublicUser(user),
  };
}

export async function refresh(input: { refreshToken: string }) {
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(input.refreshToken) },
  });
  if (!stored) {
    throw new AppError('INVALID_REFRESH_TOKEN', 401, 'Refresh token is invalid');
  }
  if (stored.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new AppError('REFRESH_TOKEN_REUSED', 401, 'Refresh token reuse detected');
  }
  if (stored.expiresAt <= new Date()) {
    throw new AppError('REFRESH_TOKEN_EXPIRED', 401, 'Refresh token is expired');
  }

  const user = await prisma.user.findUnique({
    where: { id: stored.userId },
    include: { roles: { include: { role: true } } },
  });
  if (!user || user.status !== 'active') {
    throw new AppError('ACCOUNT_DISABLED', 403, 'Account is not active');
  }

  const next = createRefreshToken();
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    }),
    prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: next.tokenHash,
        expiresAt: refreshExpiresAt(),
        userAgent: stored.userAgent,
        ip: stored.ip,
      },
    }),
  ]);

  return {
    accessToken: signAccessToken({
      sub: user.id.toString(),
      roles: user.roles.map((item) => item.role.code),
    }),
    refreshToken: next.token,
  };
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
```

路径：`src/modules/auth/auth.controller.ts`。完整内容如下：

```ts
import type { Request, Response } from 'express';
import { config } from '../../common/config.js';
import { AppError } from '../../common/errors.js';
import { loginSchema, refreshSchema, registerSchema } from './auth.schemas.js';
import { login, logout, refresh, register } from './auth.service.js';

const REFRESH_COOKIE = 'refresh_token';

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.NODE_ENV === 'production',
    path: '/api/v1/auth',
    maxAge: config.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

export async function registerHandler(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  res.status(201).json(await register(input));
}

export async function loginHandler(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const result = await login({
    ...input,
    userAgent: req.header('user-agent'),
    ip: req.ip,
  });
  setRefreshCookie(res, result.refreshToken);
  res.status(200).json({ accessToken: result.accessToken, user: result.user });
}

export async function refreshHandler(req: Request, res: Response) {
  const body = refreshSchema.parse(req.body ?? {});
  const refreshToken = req.cookies[REFRESH_COOKIE] ?? body.refreshToken;
  if (!refreshToken) {
    throw new AppError('REFRESH_TOKEN_REQUIRED', 401, 'Refresh token is required');
  }
  const result = await refresh({ refreshToken });
  setRefreshCookie(res, result.refreshToken);
  res.status(200).json({ accessToken: result.accessToken });
}

export async function logoutHandler(req: Request, res: Response) {
  const body = refreshSchema.parse(req.body ?? {});
  const refreshToken = req.cookies[REFRESH_COOKIE] ?? body.refreshToken;
  if (refreshToken) {
    await logout(refreshToken);
  }
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
  res.status(204).send();
}
```

路径：`src/modules/auth/auth.routes.ts`。完整内容如下：

```ts
import { Router } from 'express';
import { asyncHandler } from '../../common/middleware.js';
import {
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerHandler,
} from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(registerHandler));
authRouter.post('/login', asyncHandler(loginHandler));
authRouter.post('/refresh', asyncHandler(refreshHandler));
authRouter.post('/logout', asyncHandler(logoutHandler));
```

### 6. 更新 src/app.ts 挂载认证

在 Day 2 的 `app.ts` 里增加：

```ts
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from './common/config.js';
import { authRouter } from './modules/auth/auth.routes.js';

app.use(cors({ origin: config.WEB_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use('/api/v1/auth', authRouter);
```

最终挂载顺序保持：

```text
requestId → cors → cookieParser → json → routes → notFound → errorHandler
```

### 7. 验收

先注册：

```bash
curl -i -X POST http://127.0.0.1:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"a@test.com","password":"Passw0rd!","nickname":"A"}'
```

预期：`201`，返回用户 id。

登录并保存 Cookie：

```bash
curl -i -c /tmp/cookies.txt -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@test.com","password":"Passw0rd!"}'
```

预期：`200`，响应体有 `accessToken`，响应头 `Set-Cookie: refresh_token=...; HttpOnly`。

刷新：

```bash
curl -i -b /tmp/cookies.txt -X POST http://127.0.0.1:3000/api/v1/auth/refresh
```

预期：`200`，返回新的 `accessToken`，并下发新的 refresh Cookie。

旧 refresh 重放：

```bash
OLD=$(awk '$6=="refresh_token" {print $7}' /tmp/cookies.txt)
curl -i -X POST http://127.0.0.1:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$OLD\"}"
```

预期：`401 REFRESH_TOKEN_REUSED`。注意：上面的 `OLD` 取自刷新后的 Cookie；要验证重放，先复制刷新前的 token，再在刷新后使用。最稳妥的做法是 `cp /tmp/cookies.txt /tmp/cookies-old.txt` 后再刷新。

登出后再刷：

```bash
curl -i -b /tmp/cookies.txt -X POST http://127.0.0.1:3000/api/v1/auth/logout
curl -i -b /tmp/cookies.txt -X POST http://127.0.0.1:3000/api/v1/auth/refresh
```

预期：登出 `204`，再刷 `401`。

**常见错误**

- `401`：access token 过期或 `JWT_SECRET` 不一致。
- Cookie 不生效：`path` 必须和请求路径匹配；跨域时前端要 `credentials: 'include'`。
- 刷新重放测试拿错 token：先备份旧 Cookie，再刷新，再用旧 Cookie 重放。

**产出**：commit `feat: add auth with refresh rotation`。

```bash
git add .
git commit -m "feat: add auth with refresh rotation"
```

## Day 5：RBAC + 用户 + 关注

**今天目标**：未登录 401、无权限 403、重复关注幂等。

### 1. 写 src/common/auth.ts

路径：`src/common/auth.ts`。完整内容如下：

```ts
import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../modules/auth/token.service.js';
import { prisma } from './db.js';
import { AppError } from './errors.js';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) {
    next(new AppError('UNAUTHORIZED', 401, 'Authentication required'));
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError('UNAUTHORIZED', 401, 'Invalid or expired token'));
  }
};

export function requirePermission(code: string): RequestHandler {
  return async (req, _res, next) => {
    try {
      if (!req.user) {
        throw new AppError('UNAUTHORIZED', 401, 'Authentication required');
      }
      if (!/^\d+$/.test(req.user.sub)) {
        throw new AppError('UNAUTHORIZED', 401, 'Invalid token subject');
      }

      const found = await prisma.userRole.findFirst({
        where: {
          userId: BigInt(req.user.sub),
          role: {
            rolePermissions: {
              some: { permission: { code } },
            },
          },
        },
        select: { userId: true },
      });

      if (!found) {
        throw new AppError('FORBIDDEN', 403, 'Permission denied');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
```

**为什么权限查库而不是只信 JWT**：JWT 里的 roles 可能已经过期；后台权限变更要能立即生效。读多写少的场景后续再加 Redis 缓存。

### 2. 写 users 模块

路径：`src/modules/users/users.schemas.ts`。完整内容如下：

```ts
import { z } from 'zod';

export const updateMeSchema = z
  .object({
    nickname: z.string().min(1).max(64).optional(),
    bio: z.string().max(255).nullable().optional(),
    avatarUrl: z.url().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });
```

路径：`src/modules/users/users.service.ts`。完整内容如下：

```ts
import { prisma } from '../../common/db.js';
import { AppError } from '../../common/errors.js';

export async function getMe(userId: bigint) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } },
  });
  if (!user || user.status === 'deleted') {
    throw new AppError('USER_NOT_FOUND', 404, 'User not found');
  }
  return {
    id: user.id.toString(),
    email: user.email,
    nickname: user.nickname,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    roles: user.roles.map((item) => item.role.code),
    createdAt: user.createdAt,
  };
}

export async function updateMe(
  userId: bigint,
  input: { nickname?: string; bio?: string | null; avatarUrl?: string | null },
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
    select: {
      id: true,
      email: true,
      nickname: true,
      bio: true,
      avatarUrl: true,
      updatedAt: true,
    },
  });
  return { ...user, id: user.id.toString() };
}

export async function follow(followerId: bigint, followeeId: bigint) {
  if (followerId === followeeId) {
    throw new AppError('CANNOT_FOLLOW_SELF', 400, 'You cannot follow yourself');
  }
  const target = await prisma.user.findUnique({
    where: { id: followeeId },
    select: { status: true },
  });
  if (!target || target.status !== 'active') {
    throw new AppError('USER_NOT_FOUND', 404, 'User not found');
  }

  const result = await prisma.follow.createMany({
    data: [{ followerId, followeeId }],
    skipDuplicates: true,
  });
  return { created: result.count === 1 };
}

export async function unfollow(followerId: bigint, followeeId: bigint) {
  const result = await prisma.follow.deleteMany({
    where: { followerId, followeeId },
  });
  return { removed: result.count === 1 };
}
```

路径：`src/modules/users/users.routes.ts`。完整内容如下：

```ts
import { Router } from 'express';
import { requireAuth } from '../../common/auth.js';
import { AppError } from '../../common/errors.js';
import { asyncHandler } from '../../common/middleware.js';
import { updateMeSchema } from './users.schemas.js';
import { follow, getMe, unfollow, updateMe } from './users.service.js';

export const usersRouter = Router();
usersRouter.use(requireAuth);

function currentUserId(req: { user?: { sub: string } }): bigint {
  if (!req.user) {
    throw new AppError('UNAUTHORIZED', 401, 'Authentication required');
  }
  return BigInt(req.user.sub);
}

function parseUserId(value: string | undefined): bigint {
  if (!value || !/^\d+$/.test(value)) {
    throw new AppError('INVALID_USER_ID', 400, 'Invalid user id');
  }
  return BigInt(value);
}

usersRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    res.json(await getMe(currentUserId(req)));
  }),
);

usersRouter.patch(
  '/me',
  asyncHandler(async (req, res) => {
    const input = updateMeSchema.parse(req.body);
    res.json(await updateMe(currentUserId(req), input));
  }),
);

usersRouter.post(
  '/:id/follow',
  asyncHandler(async (req, res) => {
    const result = await follow(currentUserId(req), parseUserId(req.params.id));
    res.status(200).json(result);
  }),
);

usersRouter.delete(
  '/:id/follow',
  asyncHandler(async (req, res) => {
    const result = await unfollow(currentUserId(req), parseUserId(req.params.id));
    res.status(200).json(result);
  }),
);
```

### 3. 写后台权限测试路由

路径：`src/modules/admin/admin.routes.ts`。完整内容如下：

```ts
import { Router } from 'express';
import { requireAuth, requirePermission } from '../../common/auth.js';

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.get('/ping', requirePermission('admin:access'), (_req, res) => {
  res.json({ ok: true });
});
```

### 4. 挂载 users 和 admin

在 `app.ts` 增加：

```ts
import { adminRouter } from './modules/admin/admin.routes.js';
import { usersRouter } from './modules/users/users.routes.js';

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/admin', adminRouter);
```

### 5. 验收

准备两个账号并登录，分别拿到 `USER_TOKEN` 和 `ADMIN_TOKEN`：

```bash
curl -s -X POST http://127.0.0.1:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"b@test.com","password":"Passw0rd!","nickname":"B"}'

USER_TOKEN=$(curl -s -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"b@test.com","password":"Passw0rd!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).accessToken")

ADMIN_TOKEN=$(curl -s -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!ChangeMe"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).accessToken")
```

未登录：

```bash
curl -i http://127.0.0.1:3000/api/v1/users/me
```

预期 `401 UNAUTHORIZED`。

普通用户访问后台：

```bash
curl -i -H "Authorization: Bearer $USER_TOKEN" http://127.0.0.1:3000/api/v1/admin/ping
```

预期 `403 FORBIDDEN`。

管理员访问后台：

```bash
curl -i -H "Authorization: Bearer $ADMIN_TOKEN" http://127.0.0.1:3000/api/v1/admin/ping
```

预期 `200 {"ok":true}`。

重复关注：

```bash
curl -s -H "Authorization: Bearer $USER_TOKEN" -X POST http://127.0.0.1:3000/api/v1/users/1/follow
curl -s -H "Authorization: Bearer $USER_TOKEN" -X POST http://127.0.0.1:3000/api/v1/users/1/follow
```

预期两次都返回 `200`，第二次 `{"created":false}`；数据库 `follows` 只有一行。

关注自己：

```bash
curl -i -H "Authorization: Bearer $USER_TOKEN" -X POST http://127.0.0.1:3000/api/v1/users/2/follow
```

预期 `400 CANNOT_FOLLOW_SELF`（把 `2` 换成当前用户 id）。

**常见错误**

- 403：普通用户角色没有 `admin:access` 权限，确认 seed 已跑。
- 关注自己没报错：检查 `followerId === followeeId` 的分支。
- 重复关注报唯一键冲突：必须用 `createMany({ skipDuplicates: true })`，不要用 `create`。

**产出**：commit `feat: add rbac users and follows`。

```bash
git add .
git commit -m "feat: add rbac users and follows"
```

## Day 6（周末）：测试 + 5 分钟讲解

**今天目标**：把第 1 周的能力用测试和讲解固定下来。

### 1. 安装测试依赖

```bash
pnpm add -D vitest supertest @types/supertest
```

### 2. 写 vitest.config.ts

路径：`vitest.config.ts`。完整内容如下：

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 30000,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        'mysql://root:root@127.0.0.1:3306/community_test',
    },
  },
});
```

先建测试库（只建一次）：

```bash
docker exec -i community-mysql mysql -uroot -proot \
  -e "CREATE DATABASE IF NOT EXISTS community_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3. 写 tests/helpers.ts

路径：`tests/helpers.ts`。完整内容如下：

```ts
import { createApp } from '../src/app.js';
import { prisma } from '../src/common/db.js';

export const app = createApp();

export async function resetDb(): Promise<void> {
  await prisma.$transaction([
    prisma.idempotencyKey.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.like.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.post.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.userRole.deleteMany(),
    prisma.report.deleteMany(),
    prisma.moderationRecord.deleteMany(),
    prisma.outboxEvent.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

export async function seedRoles(): Promise<void> {
  await prisma.role.upsert({
    where: { code: 'user' },
    update: {},
    create: { code: 'user', name: '普通用户' },
  });
  await prisma.role.upsert({
    where: { code: 'admin' },
    update: {},
    create: { code: 'admin', name: '管理员' },
  });
}

export async function registerAndLogin(email: string): Promise<string> {
  await prisma.user.deleteMany({ where: { email } });
  await registerUser(email);
  const login = await loginUser(email);
  return login.body.accessToken as string;
}

async function registerUser(email: string) {
  const { default: request } = await import('supertest');
  return request(app)
    .post('/api/v1/auth/register')
    .send({ email, password: 'Passw0rd!', nickname: email.split('@')[0] });
}

async function loginUser(email: string) {
  const { default: request } = await import('supertest');
  return request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'Passw0rd!' });
}
```

> [!TIP]
> 这里用 `await import('supertest')` 是为了避免 helper 在非测试环境被静态加载时引入测试依赖；正常测试里直接 `import request from 'supertest'` 也可以。

### 4. 写 tests/auth.test.ts

路径：`tests/auth.test.ts`。完整内容如下：

```ts
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { app, registerAndLogin, resetDb, seedRoles } from './helpers.js';
import { prisma } from '../src/common/db.js';

describe('auth and follow', () => {
  beforeAll(async () => {
    await seedRoles();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it('registers a user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'a@test.com', password: 'Passw0rd!', nickname: 'A' });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('a@test.com');
  });

  it('logs in and returns access token', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'a@test.com', password: 'Passw0rd!', nickname: 'A' });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'a@test.com', password: 'Passw0rd!' });

    expect(response.status).toBe(200);
    expect(typeof response.body.accessToken).toBe('string');
  });

  it('rejects unauthenticated /users/me', async () => {
    const response = await request(app).get('/api/v1/users/me');
    expect(response.status).toBe(401);
  });

  it('forbids normal user from admin ping', async () => {
    const token = await registerAndLogin('normal@test.com');
    const response = await request(app)
      .get('/api/v1/admin/ping')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('follows idempotently', async () => {
    const followerToken = await registerAndLogin('follower@test.com');
    const followee = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'followee@test.com', password: 'Passw0rd!', nickname: 'Followee' });

    const followeeId = followee.body.id as string;
    const first = await request(app)
      .post(`/api/v1/users/${followeeId}/follow`)
      .set('Authorization', `Bearer ${followerToken}`);
    const second = await request(app)
      .post(`/api/v1/users/${followeeId}/follow`)
      .set('Authorization', `Bearer ${followerToken}`);

    expect(first.body.created).toBe(true);
    expect(second.body.created).toBe(false);

    const count = await prisma.follow.count({
      where: {
        follower: { email: 'follower@test.com' },
        followee: { email: 'followee@test.com' },
      },
    });
    expect(count).toBe(1);
  });
});
```

### 5. package.json 增加测试脚本

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### 6. 跑测试

```bash
pnpm test
```

预期：5 个测试全部通过。

**常见错误**

- `P1001`：测试库没建或 MySQL 没起。
- `Table does not exist`：对测试库跑一次 `pnpm exec prisma migrate deploy`。
- 测试互相污染：`fileParallelism: false` + `resetDb()`，不要并行共享同一个库。
- 进程不退出：测试结束要 `prisma.$disconnect()`，或在 `vitest.config.ts` 配 `pool: 'forks'`。

**产出**：commit `test: cover auth and follow`；一段 5 分钟录音。

```bash
git add .
git commit -m "test: cover auth and follow"
```

---

## 第 2 周：内容核心

## Day 7：发帖

**今天目标**：登录用户能发帖，帖子默认待审核，作者能看自己的，别人看不到未发布的。

### 1. 给 auth.ts 增加可选鉴权

路径：`src/common/auth.ts`，在 `requireAuth` 后面追加：

```ts
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) {
    next();
    return;
  }

  try {
    req.user = verifyAccessToken(token);
  } catch {
    // 匿名请求也允许继续；需要登录的接口由 requireAuth 拦截
  }
  next();
};
```

用途：帖子详情允许匿名访问，但作者带 token 时能看到自己的 pending 帖子。

### 2. 写游标分页工具

路径：`src/common/pagination.ts`。完整内容如下：

```ts
import { AppError } from './errors.js';

export type Cursor = {
  createdAt: Date;
  id: bigint;
};

export function encodeCursor(cursor: Cursor): string {
  return `${cursor.createdAt.toISOString()}_${cursor.id.toString()}`;
}

export function decodeCursor(value: string | undefined): Cursor | undefined {
  if (!value) {
    return undefined;
  }

  const [iso, id] = value.split('_');
  if (!iso || !id || !/^\d+$/.test(id)) {
    throw new AppError('INVALID_CURSOR', 400, 'Invalid cursor');
  }

  const createdAt = new Date(iso);
  if (Number.isNaN(createdAt.getTime())) {
    throw new AppError('INVALID_CURSOR', 400, 'Invalid cursor');
  }

  return { createdAt, id: BigInt(id) };
}

export function parseLimit(value: unknown, fallback = 20, max = 50): number {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new AppError('INVALID_LIMIT', 400, 'Invalid limit');
  }
  return Math.min(parsed, max);
}
```

**为什么用 `<createdAt>_<id>`**：只按 createdAt 分页会在同一毫秒的多条数据上重复或漏数据；加 id 做第二排序键才能稳定翻页。

### 3. 写 posts 模块

路径：`src/modules/posts/posts.schemas.ts`。完整内容如下：

```ts
import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1).max(20000),
});

export const listPostsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
```

路径：`src/modules/posts/posts.service.ts`。完整内容如下：

```ts
import type { Prisma } from '@prisma/client';
import { prisma } from '../../common/db.js';
import { AppError } from '../../common/errors.js';
import { decodeCursor, encodeCursor, parseLimit } from '../../common/pagination.js';

const publicPostSelect = {
  id: true,
  authorId: true,
  title: true,
  content: true,
  status: true,
  visibility: true,
  likeCount: true,
  commentCount: true,
  createdAt: true,
} satisfies Prisma.PostSelect;

type PostRow = Prisma.PostGetPayload<{ select: typeof publicPostSelect }>;

function toPost(post: PostRow) {
  return {
    ...post,
    id: post.id.toString(),
    authorId: post.authorId.toString(),
  };
}

export async function createPost(
  authorId: bigint,
  input: { title?: string; content: string },
) {
  const post = await prisma.post.create({
    data: {
      authorId,
      title: input.title ?? null,
      content: input.content,
      status: 'pending',
    },
    select: publicPostSelect,
  });
  return toPost(post);
}

export async function listPublishedPosts(input: { cursor?: string; limit?: number }) {
  const limit = parseLimit(input.limit, 20, 50);
  const cursor = decodeCursor(input.cursor);

  const where: Prisma.PostWhereInput = { status: 'published' };
  if (cursor) {
    where.OR = [
      { createdAt: { lt: cursor.createdAt } },
      { createdAt: cursor.createdAt, id: { lt: cursor.id } },
    ];
  }

  const rows = await prisma.post.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    select: publicPostSelect,
  });

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items.at(-1);

  return {
    items: items.map(toPost),
    nextCursor:
      hasMore && last
        ? encodeCursor({ createdAt: last.createdAt, id: last.id })
        : null,
  };
}

export async function getPost(id: bigint, viewerId?: bigint) {
  const post = await prisma.post.findFirst({
    where: { id, status: { not: 'deleted' } },
    select: {
      ...publicPostSelect,
      author: { select: { id: true, nickname: true, avatarUrl: true } },
    },
  });

  if (!post) {
    throw new AppError('POST_NOT_FOUND', 404, 'Post not found');
  }
  if (post.status !== 'published' && post.authorId !== viewerId) {
    throw new AppError('POST_NOT_FOUND', 404, 'Post not found');
  }

  return {
    ...toPost(post),
    author: {
      ...post.author,
      id: post.author.id.toString(),
    },
  };
}

export async function deletePost(id: bigint, authorId: bigint) {
  const post = await prisma.post.findFirst({
    where: { id, status: { not: 'deleted' } },
    select: { authorId: true },
  });
  if (!post || post.authorId !== authorId) {
    throw new AppError('POST_NOT_FOUND', 404, 'Post not found');
  }

  await prisma.post.update({
    where: { id },
    data: { status: 'deleted', deletedAt: new Date() },
  });
}
```

路径：`src/modules/posts/posts.routes.ts`。完整内容如下：

```ts
import { Router } from 'express';
import { optionalAuth, requireAuth } from '../../common/auth.js';
import { AppError } from '../../common/errors.js';
import { asyncHandler } from '../../common/middleware.js';
import { createPostSchema, listPostsQuerySchema } from './posts.schemas.js';
import {
  createPost,
  deletePost,
  getPost,
  listPublishedPosts,
} from './posts.service.js';

export const postsRouter = Router();

function currentUserId(req: { user?: { sub: string } }): bigint {
  if (!req.user) {
    throw new AppError('UNAUTHORIZED', 401, 'Authentication required');
  }
  return BigInt(req.user.sub);
}

function parsePostId(value: string | undefined): bigint {
  if (!value || !/^\d+$/.test(value)) {
    throw new AppError('INVALID_POST_ID', 400, 'Invalid post id');
  }
  return BigInt(value);
}

postsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = listPostsQuerySchema.parse(req.query);
    res.json(await listPublishedPosts(query));
  }),
);

postsRouter.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const viewerId = req.user ? currentUserId(req) : undefined;
    res.json(await getPost(parsePostId(req.params.id), viewerId));
  }),
);

postsRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = createPostSchema.parse(req.body);
    res.status(201).json(await createPost(currentUserId(req), input));
  }),
);

postsRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await deletePost(parsePostId(req.params.id), currentUserId(req));
    res.status(204).send();
  }),
);
```

### 4. 挂载 posts

在 `app.ts` 增加：

```ts
import { postsRouter } from './modules/posts/posts.routes.js';

app.use('/api/v1/posts', postsRouter);
```

### 5. 验收

用普通用户发帖：

```bash
curl -i -X POST http://127.0.0.1:3000/api/v1/posts \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"第一条帖子","content":"hello community"}'
```

预期：`201`，返回 `status: "pending"`。

列表看不到 pending：

```bash
curl -s http://127.0.0.1:3000/api/v1/posts
```

预期：`items` 为空，或只有已发布帖子。

作者能看详情：

```bash
curl -i -H "Authorization: Bearer $USER_TOKEN" http://127.0.0.1:3000/api/v1/posts/<POST_ID>
```

预期：`200`。

另一个用户看详情：

```bash
curl -i -H "Authorization: Bearer $ADMIN_TOKEN" http://127.0.0.1:3000/api/v1/posts/<POST_ID>
```

预期：`404 POST_NOT_FOUND`（admin 不是作者，pending 不可见）。

删除自己的帖子：

```bash
curl -i -X DELETE -H "Authorization: Bearer $USER_TOKEN" http://127.0.0.1:3000/api/v1/posts/<POST_ID>
```

预期：`204`；再用作者 token 查详情 `404`。

**常见错误**

- 列表里出现 pending：`listPublishedPosts` 的 where 必须是 `status: 'published'`。
- 作者看不到自己的 pending：详情路由要挂 `optionalAuth`，不能只挂 `requireAuth`。
- 游标翻页重复：排序必须是 `createdAt desc, id desc`，游标条件也要带 id。

**产出**：commit `feat: add posts with moderation status`。

```bash
git add .
git commit -m "feat: add posts with moderation status"
```

## Day 8：评论

**今天目标**：评论和计数在同一个事务里，不能一个成功一个失败。

### 1. 写 comments 模块

路径：`src/modules/comments/comments.schemas.ts`。完整内容如下：

```ts
import { z } from 'zod';

export const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().regex(/^\d+$/).optional(),
});

export const listCommentsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(50),
});
```

路径：`src/modules/comments/comments.service.ts`。完整内容如下：

```ts
import type { Prisma } from '@prisma/client';
import { prisma } from '../../common/db.js';
import { AppError } from '../../common/errors.js';
import { decodeCursor, encodeCursor, parseLimit } from '../../common/pagination.js';

function toComment(comment: {
  id: bigint;
  postId: bigint;
  authorId: bigint;
  parentId: bigint | null;
  content: string;
  likeCount: number;
  createdAt: Date;
  author: { id: bigint; nickname: string; avatarUrl: string | null };
}) {
  return {
    ...comment,
    id: comment.id.toString(),
    postId: comment.postId.toString(),
    authorId: comment.authorId.toString(),
    parentId: comment.parentId?.toString() ?? null,
    author: {
      ...comment.author,
      id: comment.author.id.toString(),
    },
  };
}

export async function createComment(
  postId: bigint,
  authorId: bigint,
  input: { content: string; parentId?: string },
) {
  const post = await prisma.post.findFirst({
    where: { id: postId, status: 'published' },
    select: { id: true },
  });
  if (!post) {
    throw new AppError('POST_NOT_FOUND', 404, 'Post not found');
  }

  let parentId: bigint | undefined;
  if (input.parentId) {
    parentId = BigInt(input.parentId);
    const parent = await prisma.comment.findFirst({
      where: { id: parentId, postId, status: 'published' },
      select: { id: true },
    });
    if (!parent) {
      throw new AppError('PARENT_COMMENT_NOT_FOUND', 404, 'Parent comment not found');
    }
  }

  const comment = await prisma.$transaction(async (tx) => {
    const created = await tx.comment.create({
      data: { postId, authorId, parentId, content: input.content },
      include: {
        author: { select: { id: true, nickname: true, avatarUrl: true } },
      },
    });
    await tx.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });
    return created;
  });

  return toComment(comment);
}

export async function listComments(
  postId: bigint,
  input: { cursor?: string; limit?: number },
) {
  const limit = parseLimit(input.limit, 50, 50);
  const cursor = decodeCursor(input.cursor);

  const where: Prisma.CommentWhereInput = {
    postId,
    status: 'published',
  };
  if (cursor) {
    where.OR = [
      { createdAt: { gt: cursor.createdAt } },
      { createdAt: cursor.createdAt, id: { gt: cursor.id } },
    ];
  }

  const rows = await prisma.comment.findMany({
    where,
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    take: limit + 1,
    select: {
      id: true,
      postId: true,
      authorId: true,
      parentId: true,
      content: true,
      likeCount: true,
      createdAt: true,
      author: { select: { id: true, nickname: true, avatarUrl: true } },
    },
  });

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items.at(-1);

  return {
    items: items.map(toComment),
    nextCursor:
      hasMore && last
        ? encodeCursor({ createdAt: last.createdAt, id: last.id })
        : null,
  };
}
```

路径：`src/modules/comments/comments.routes.ts`。完整内容如下：

```ts
import { Router } from 'express';
import { requireAuth } from '../../common/auth.js';
import { AppError } from '../../common/errors.js';
import { asyncHandler } from '../../common/middleware.js';
import {
  createComment,
  listComments,
} from './comments.service.js';
import { createCommentSchema, listCommentsQuerySchema } from './comments.schemas.js';

export const commentsRouter = Router({ mergeParams: true });

function parseId(value: string | undefined, field: string): bigint {
  if (!value || !/^\d+$/.test(value)) {
    throw new AppError('INVALID_ID', 400, `Invalid ${field}`);
  }
  return BigInt(value);
}

commentsRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const postId = parseId(req.params.postId, 'post id');
    const query = listCommentsQuerySchema.parse(req.query);
    res.json(await listComments(postId, query));
  }),
);

commentsRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new AppError('UNAUTHORIZED', 401, 'Authentication required');
    }
    const postId = parseId(req.params.postId, 'post id');
    const input = createCommentSchema.parse(req.body);
    res.status(201).json(await createComment(postId, BigInt(req.user.sub), input));
  }),
);
```

### 2. 挂载 comments

在 `app.ts` 增加：

```ts
import { commentsRouter } from './modules/comments/comments.routes.js';

app.use('/api/v1/posts/:postId/comments', commentsRouter);
```

### 3. 验收

先准备一条 published 帖子（Day 7 的帖子默认 pending，用 Prisma Studio 手动改成 `published`，或等 Day 16 审核接口）。

```bash
curl -i -X POST http://127.0.0.1:3000/api/v1/posts/<POST_ID>/comments \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"第一条评论"}'
```

预期：`201`；随后查帖子详情，`commentCount` 增加 1。

评论不存在的帖子：

```bash
curl -i -X POST http://127.0.0.1:3000/api/v1/posts/999999/comments \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"x"}'
```

预期：`404 POST_NOT_FOUND`。

事务回滚验证：临时在 `comments.service.ts` 的 `tx.post.update` 后加：

```ts
throw new Error('force rollback');
```

再发一条评论，预期接口 500，且 `comments` 表和 `posts.commentCount` 都没有变化。验证后删除这行。

**常见错误**

- 评论成功但计数没加：`tx.post.update` 必须和 `tx.comment.create` 在同一个 `$transaction` 里。
- 计数值变成负数：删除评论时用条件 `commentCount > 0`，不要无条件 `decrement`。
- 回复的 parentId 属于别的帖子：查询 parent 时必须带上 `postId`。

**产出**：commit `feat: add comments with transactional counter`。

```bash
git add .
git commit -m "feat: add comments with transactional counter"
```

## Day 9：点赞

**今天目标**：并发点赞不重复计数，取消点赞不扣成负数。

### 1. 写 likes 模块

路径：`src/modules/likes/likes.service.ts`。完整内容如下：

```ts
import { prisma } from '../../common/db.js';
import { AppError } from '../../common/errors.js';

export async function likePost(postId: bigint, userId: bigint) {
  return prisma.$transaction(async (tx) => {
    const post = await tx.post.findFirst({
      where: { id: postId, status: 'published' },
      select: { id: true },
    });
    if (!post) {
      throw new AppError('POST_NOT_FOUND', 404, 'Post not found');
    }

    const created = await tx.like.createMany({
      data: [{ userId, targetType: 'post', targetId: postId }],
      skipDuplicates: true,
    });

    if (created.count === 1) {
      await tx.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      });
    }

    return { liked: true, changed: created.count === 1 };
  });
}

export async function unlikePost(postId: bigint, userId: bigint) {
  return prisma.$transaction(async (tx) => {
    const deleted = await tx.like.deleteMany({
      where: { userId, targetType: 'post', targetId: postId },
    });

    if (deleted.count === 1) {
      await tx.post.updateMany({
        where: { id: postId, likeCount: { gt: 0 } },
        data: { likeCount: { decrement: 1 } },
      });
    }

    return { liked: false, changed: deleted.count === 1 };
  });
}
```

路径：`src/modules/likes/likes.routes.ts`。完整内容如下：

```ts
import { Router } from 'express';
import { requireAuth } from '../../common/auth.js';
import { AppError } from '../../common/errors.js';
import { asyncHandler } from '../../common/middleware.js';
import { likePost, unlikePost } from './likes.service.js';

export const likesRouter = Router({ mergeParams: true });

function parsePostId(value: string | undefined): bigint {
  if (!value || !/^\d+$/.test(value)) {
    throw new AppError('INVALID_POST_ID', 400, 'Invalid post id');
  }
  return BigInt(value);
}

function currentUserId(req: { user?: { sub: string } }): bigint {
  if (!req.user) {
    throw new AppError('UNAUTHORIZED', 401, 'Authentication required');
  }
  return BigInt(req.user.sub);
}

likesRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await likePost(parsePostId(req.params.postId), currentUserId(req)));
  }),
);

likesRouter.delete(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await unlikePost(parsePostId(req.params.postId), currentUserId(req)));
  }),
);
```

### 2. 挂载 likes

在 `app.ts` 增加：

```ts
import { likesRouter } from './modules/likes/likes.routes.js';

app.use('/api/v1/posts/:postId/like', likesRouter);
```

### 3. 验收

```bash
curl -s -X POST -H "Authorization: Bearer $USER_TOKEN" http://127.0.0.1:3000/api/v1/posts/<POST_ID>/like
curl -s -X POST -H "Authorization: Bearer $USER_TOKEN" http://127.0.0.1:3000/api/v1/posts/<POST_ID>/like
```

预期：第一次 `changed: true`，第二次 `changed: false`；帖子 `likeCount = 1`。

取消两次：

```bash
curl -s -X DELETE -H "Authorization: Bearer $USER_TOKEN" http://127.0.0.1:3000/api/v1/posts/<POST_ID>/like
curl -s -X DELETE -H "Authorization: Bearer $USER_TOKEN" http://127.0.0.1:3000/api/v1/posts/<POST_ID>/like
```

预期：第一次 `changed: true`，第二次 `changed: false`；`likeCount = 0`，不会变负。

**常见错误**

- 并发下计数多加：必须依赖唯一约束 + `createMany({ skipDuplicates: true })`，不要「先查再插」。
- 取消点赞扣成负数：`updateMany` 条件里带 `likeCount: { gt: 0 }`。
- 事务外更新计数：点赞记录和计数必须在同一个 `$transaction` 里。

**产出**：commit `feat: add idempotent likes`。

```bash
git add .
git commit -m "feat: add idempotent likes"
```

## Day 10：关注流

**今天目标**：只看到关注的人发布的帖子，游标翻页不重不漏。

### 1. 写 feed 模块

路径：`src/modules/feed/feed.repository.ts`。完整内容如下：

```ts
import { Prisma } from '@prisma/client';
import { prisma } from '../../common/db.js';

export type FeedRow = {
  id: bigint;
  author_id: bigint;
  title: string | null;
  content: string;
  like_count: number;
  comment_count: number;
  created_at: Date;
  author_nickname: string;
  author_avatar_url: string | null;
};

export async function findFollowingFeed(input: {
  userId: bigint;
  cursorCreatedAt?: Date;
  cursorId?: bigint;
  limit: number;
}): Promise<FeedRow[]> {
  const { userId, cursorCreatedAt, cursorId, limit } = input;

  if (cursorCreatedAt && cursorId) {
    return prisma.$queryRaw<FeedRow[]>(Prisma.sql`
      SELECT p.id, p.author_id, p.title, p.content, p.like_count, p.comment_count, p.created_at,
             u.nickname AS author_nickname, u.avatar_url AS author_avatar_url
      FROM posts p
      JOIN follows f ON f.followee_id = p.author_id AND f.follower_id = ${userId}
      JOIN users u ON u.id = p.author_id
      WHERE p.status = 'published'
        AND (p.created_at < ${cursorCreatedAt}
          OR (p.created_at = ${cursorCreatedAt} AND p.id < ${cursorId}))
      ORDER BY p.created_at DESC, p.id DESC
      LIMIT ${limit + 1}
    `);
  }

  return prisma.$queryRaw<FeedRow[]>(Prisma.sql`
    SELECT p.id, p.author_id, p.title, p.content, p.like_count, p.comment_count, p.created_at,
           u.nickname AS author_nickname, u.avatar_url AS author_avatar_url
    FROM posts p
    JOIN follows f ON f.followee_id = p.author_id AND f.follower_id = ${userId}
    JOIN users u ON u.id = p.author_id
    WHERE p.status = 'published'
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT ${limit + 1}
  `);
}
```

路径：`src/modules/feed/feed.service.ts`。完整内容如下：

```ts
import { decodeCursor, encodeCursor, parseLimit } from '../../common/pagination.js';
import { findFollowingFeed } from './feed.repository.js';

function toFeedItem(row: {
  id: bigint;
  author_id: bigint;
  title: string | null;
  content: string;
  like_count: number;
  comment_count: number;
  created_at: Date;
  author_nickname: string;
  author_avatar_url: string | null;
}) {
  return {
    id: row.id.toString(),
    title: row.title,
    content: row.content,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    createdAt: row.created_at,
    author: {
      id: row.author_id.toString(),
      nickname: row.author_nickname,
      avatarUrl: row.author_avatar_url,
    },
  };
}

export async function getFollowingFeed(input: {
  userId: bigint;
  cursor?: string;
  limit?: number;
}) {
  const limit = parseLimit(input.limit, 20, 50);
  const cursor = decodeCursor(input.cursor);

  const rows = await findFollowingFeed({
    userId: input.userId,
    cursorCreatedAt: cursor?.createdAt,
    cursorId: cursor?.id,
    limit,
  });

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items.at(-1);

  return {
    items: items.map(toFeedItem),
    nextCursor:
      hasMore && last
        ? encodeCursor({ createdAt: last.created_at, id: last.id })
        : null,
  };
}
```

路径：`src/modules/feed/feed.routes.ts`。完整内容如下：

```ts
import { Router } from 'express';
import { requireAuth } from '../../common/auth.js';
import { AppError } from '../../common/errors.js';
import { asyncHandler } from '../../common/middleware.js';
import { getFollowingFeed } from './feed.service.js';

export const feedRouter = Router();

feedRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new AppError('UNAUTHORIZED', 401, 'Authentication required');
    }
    const result = await getFollowingFeed({
      userId: BigInt(req.user.sub),
      cursor: typeof req.query.cursor === 'string' ? req.query.cursor : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(result);
  }),
);
```

### 2. 挂载 feed

在 `app.ts` 增加：

```ts
import { feedRouter } from './modules/feed/feed.routes.js';

app.use('/api/v1/feed', feedRouter);
```

### 3. 验收

准备数据：

1. 用 `user@test.com` 关注一个作者（比如 `admin@test.com` 的 id）。
2. 用作者发一条帖子；
3. 用 Prisma Studio 把帖子 `status` 改成 `published`；
4. 用 `user@test.com` 请求 feed。

```bash
curl -s -H "Authorization: Bearer $USER_TOKEN" \
  "http://127.0.0.1:3000/api/v1/feed?limit=2"
```

预期：

- 能看到关注作者的 published 帖子；
- 用 `nextCursor` 连续翻页，id 不重复；
- 没有关注任何人时返回空数组，不是 500。

**常见错误**

- feed 里出现 pending：SQL 必须带 `p.status = 'published'`。
- 翻页重复：游标条件要同时比较 `created_at` 和 `id`。
- 时间对不上：Prisma 和 MySQL 都按 UTC 存储，游标用 ISO 字符串，不要用本地时间字符串。

**产出**：commit `feat: add cursor-based following feed`。

```bash
git add .
git commit -m "feat: add cursor-based following feed"
```

## Day 11：测试 + 基线压测

**今天目标**：核心链路有集成测试，知道自己当前的 QPS/P95。

### 1. 补 content 测试

路径：`tests/content.test.ts`。完整内容如下：

```ts
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { app, registerAndLogin, resetDb, seedRoles } from './helpers.js';
import { prisma } from '../src/common/db.js';

describe('content core', () => {
  beforeAll(async () => {
    await seedRoles();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it('likes idempotently', async () => {
    const token = await registerAndLogin('liker@test.com');
    const user = await prisma.user.findUniqueOrThrow({
      where: { email: 'liker@test.com' },
    });
    const post = await prisma.post.create({
      data: { authorId: user.id, content: 'hello', status: 'published' },
    });

    const first = await request(app)
      .post(`/api/v1/posts/${post.id}/like`)
      .set('Authorization', `Bearer ${token}`);
    const second = await request(app)
      .post(`/api/v1/posts/${post.id}/like`)
      .set('Authorization', `Bearer ${token}`);

    expect(first.body.changed).toBe(true);
    expect(second.body.changed).toBe(false);
    const updated = await prisma.post.findUniqueOrThrow({ where: { id: post.id } });
    expect(updated.likeCount).toBe(1);
  });

  it('paginates feed without duplicates', async () => {
    const token = await registerAndLogin('reader@test.com');
    const reader = await prisma.user.findUniqueOrThrow({
      where: { email: 'reader@test.com' },
    });
    const author = await prisma.user.findUniqueOrThrow({
      where: { email: 'admin@test.com' },
    });
    await prisma.follow.create({
      data: { followerId: reader.id, followeeId: author.id },
    });
    for (let index = 0; index < 3; index += 1) {
      await prisma.post.create({
        data: {
          authorId: author.id,
          content: `post ${index}`,
          status: 'published',
          createdAt: new Date(Date.now() - index * 1000),
        },
      });
    }

    const first = await request(app)
      .get('/api/v1/feed?limit=2')
      .set('Authorization', `Bearer ${token}`);
    expect(first.status).toBe(200);
    expect(first.body.items).toHaveLength(2);

    const second = await request(app)
      .get(`/api/v1/feed?limit=2&cursor=${encodeURIComponent(first.body.nextCursor)}`)
      .set('Authorization', `Bearer ${token}`);
    expect(second.status).toBe(200);

    const firstIds = first.body.items.map((item: { id: string }) => item.id);
    const secondIds = second.body.items.map((item: { id: string }) => item.id);
    expect(new Set([...firstIds, ...secondIds]).size).toBe(firstIds.length + secondIds.length);
  });
});
```

> [!NOTE]
> 这个测试依赖 Day 3 的 admin 用户；如果测试库是新建的，先跑 `pnpm exec prisma db seed`（或把 `DATABASE_URL` 指向开发库）。

### 2. 安装压测工具

```bash
pnpm add -D autocannon
```

### 3. 跑基线

先登录拿 token，再压 feed：

```bash
npx autocannon -c 50 -d 10 \
  -H "Authorization: Bearer $USER_TOKEN" \
  http://127.0.0.1:3000/api/v1/feed
```

记录输出里的：

- `Req/Sec`（QPS）
- `Latency p95`
- `Non-2xx responses`
- `Errors`

### 4. 写 docs/load-baseline.md

路径：`docs/load-baseline.md`。完整模板如下：

```markdown
# Feed 基线压测

- 日期：2026-XX-XX
- 机器：本机 / 核数 / 内存
- 命令：autocannon -c 50 -d 10 /api/v1/feed
- 数据量：users=2, posts=3, follows=1
- QPS：
- P95：
- 错误率：
- CPU / 内存：
- 瓶颈猜测：DB / 应用 / 连接池
- 下一步：加索引 / 加缓存 / 调连接池（只选一个）
```

**验收**

- `pnpm test` 全绿。
- 有一份基线报告，能说出「当前瓶颈在 DB 还是应用」。

**产出**：commit `test: cover content core and record load baseline`。

```bash
git add .
git commit -m "test: cover content core and record load baseline"
```

## Day 12（周末）：故意弄坏 + 10 分钟演示

**今天目标**：验证幂等和事务在并发下真的成立。

### 1. 写并发点赞脚本

路径：`scripts/like-concurrency.mjs`。完整内容如下：

```js
const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:3000';
const token = process.env.TOKEN;
const postId = process.env.POST_ID;

if (!token || !postId) {
  throw new Error('TOKEN and POST_ID are required');
}

const results = await Promise.all(
  Array.from({ length: 20 }, async () => {
    const response = await fetch(`${baseUrl}/api/v1/posts/${postId}/like`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.status;
  }),
);

console.log(results);
console.log('2xx:', results.filter((status) => status >= 200 && status < 300).length);
```

运行：

```bash
TOKEN=$USER_TOKEN POST_ID=<POST_ID> node scripts/like-concurrency.mjs
```

然后查数据库：

```bash
docker exec -i community-mysql mysql -uroot -proot community \
  -e "SELECT id, like_count FROM posts WHERE id = <POST_ID>;"
```

预期：`like_count = 1`，`likes` 表只有一行。

### 2. 故意弄坏

按顺序做三次：

1. 停 Redis：`docker stop community-redis`，访问通知/限流接口，确认服务不崩。
2. 停 MySQL：`docker stop community-mysql`，访问 feed，确认返回 503/500 结构化错误，不是进程退出。
3. 停 worker，制造 pending 事件，再启动 worker，确认能追上。

### 3. 10 分钟演示脚本

```text
0:00-1:00  问题和范围：社区核心闭环
1:00-3:00  注册 → 登录 → refresh 轮换
3:00-5:00  发帖 → 审核 → 评论 → 点赞
5:00-7:00  feed 游标分页 + 无重复
7:00-9:00  点赞 → outbox → 队列 → 通知 → SSE
9:00-10:00 取舍与如果重来
```

**验收**

- 并发脚本输出和数据库计数对得上。
- 能讲清「为什么唯一约束比先查再插可靠」。

**产出**：commit（如有修复）+ 一段录音。

```bash
git add .
git commit -m "test: add concurrency check and demo script"
```

---

## 第 3 周：异步与治理

## Day 13：Outbox

**今天目标**：业务成功，事件一定在；业务回滚，事件不在。

### 1. 写 Outbox 工具

路径：`src/common/outbox.ts`。完整内容如下：

```ts
import type { Prisma } from '@prisma/client';

export async function enqueueOutbox(
  tx: Prisma.TransactionClient,
  type: string,
  payload: Record<string, unknown>,
) {
  await tx.outboxEvent.create({
    data: {
      type,
      payload: payload as unknown as Prisma.InputJsonValue,
    },
  });
}
```

**为什么必须在事务里写**：业务表和 outbox 表同一个事务，才能保证「帖子成功但事件丢了」不会发生。异步消费者只读 outbox，不回头查业务是否成功。

### 2. 把副作用接进业务事务

发帖：把 `posts.service.ts` 的 `createPost` 改成：

```ts
const post = await prisma.$transaction(async (tx) => {
  const created = await tx.post.create({
    data: {
      authorId,
      title: input.title ?? null,
      content: input.content,
      status: 'pending',
    },
    select: publicPostSelect,
  });

  await enqueueOutbox(tx, 'post.created', {
    postId: created.id.toString(),
    authorId: authorId.toString(),
  });

  return created;
});
```

评论：在 `comments.service.ts` 的事务里，插入评论、更新计数之后加：

```ts
await enqueueOutbox(tx, 'comment.created', {
  commentId: created.id.toString(),
  postId: postId.toString(),
  actorId: authorId.toString(),
  recipientId: postAuthorId.toString(),
});
```

点赞：在 `likes.service.ts` 的 `created.count === 1` 分支里加：

```ts
await enqueueOutbox(tx, 'like.created', {
  targetType: 'post',
  targetId: postId.toString(),
  actorId: userId.toString(),
  recipientId: postAuthorId.toString(),
});
```

关注：把 `users.service.ts` 的 `follow` 包进事务，并在新增成功时加：

```ts
const result = await prisma.$transaction(async (tx) => {
  const created = await tx.follow.createMany({
    data: [{ followerId, followeeId }],
    skipDuplicates: true,
  });

  if (created.count === 1) {
    await enqueueOutbox(tx, 'follow.created', {
      followerId: followerId.toString(),
      followeeId: followeeId.toString(),
      actorId: followerId.toString(),
      recipientId: followeeId.toString(),
    });
  }

  return created;
});
```

> [!NOTE]
> 事件 payload 里统一放 `actorId`（谁触发）和 `recipientId`（通知谁）。Day 14 的消费者不关心业务表结构，只按这两个字段工作。

### 3. 验收

发一条帖子，然后查 outbox：

```bash
docker exec -i community-mysql mysql -uroot -proot community \
  -e "SELECT id, type, status, payload FROM outbox_events ORDER BY id DESC LIMIT 5;"
```

预期：新增一条 `post.created`，`status = pending`。

验证事务回滚：临时在 `createPost` 的事务里、写 outbox 之后 `throw new Error('force rollback')`，再发帖；预期帖子表和 outbox 表都没有新增。验证后删除这行。

**常见错误**

- 先写业务、后写 outbox，但不在同一事务：业务成功、事件丢失。
- 在事务外 `await prisma.outboxEvent.create`：事务回滚了，事件还在。
- payload 里传 BigInt：JSON 序列化会失败，统一 `toString()`。

**产出**：commit `feat: add transactional outbox`。

```bash
git add .
git commit -m "feat: add transactional outbox"
```

## Day 14：BullMQ + 通知消费者

**今天目标**：点赞/评论/关注能生成通知，自己操作自己不通知。

### 1. 安装依赖

```bash
pnpm add bullmq ioredis
```

### 2. 写 Redis 连接

路径：`src/common/redis.ts`。完整内容如下：

```ts
import Redis from 'ioredis';
import { config } from './config.js';

export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  connectTimeout: 3000,
});
```

> [!WARNING]
> BullMQ 要求 `maxRetriesPerRequest: null`，否则 worker 在阻塞命令上会报错。

### 3. 给 Notification 增加 eventId

在 `prisma/schema.prisma` 的 `Notification` 模型里加：

```prisma
eventId String? @unique @map("event_id") @db.VarChar(64)
```

执行迁移：

```bash
pnpm exec prisma migrate dev --name add_notification_event_id
```

**为什么加 eventId**：BullMQ 的 `jobId` 只能防「队列里重复」，不能防「已经消费完又重投」。数据库唯一键才是最后一道幂等保障。

### 4. 写队列和两个 worker

路径：`src/jobs/queue.ts`。完整内容如下：

```ts
import { Queue } from 'bullmq';
import { redis } from '../common/redis.js';

export const notificationQueue = new Queue('notifications', {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});
```

路径：`src/jobs/outbox.worker.ts`。完整内容如下：

```ts
import { logger } from '../common/logger.js';
import { prisma } from '../common/db.js';
import { notificationQueue } from './queue.js';

let ticking = false;

async function tick(): Promise<void> {
  if (ticking) {
    return;
  }
  ticking = true;

  try {
    const events = await prisma.outboxEvent.findMany({
      where: { status: 'pending' },
      orderBy: { id: 'asc' },
      take: 20,
    });

    for (const event of events) {
      const claimed = await prisma.outboxEvent.updateMany({
        where: { id: event.id, status: 'pending' },
        data: { status: 'processing' },
      });
      if (claimed.count === 0) {
        continue;
      }

      try {
        await notificationQueue.add(event.type, event.payload, {
          jobId: event.id.toString(),
        });
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'done', processedAt: new Date() },
        });
      } catch (error) {
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            status: 'failed',
            retryCount: { increment: 1 },
          },
        });
        logger.error(
          { err: error, eventId: event.id.toString() },
          'outbox dispatch failed',
        );
      }
    }
  } finally {
    ticking = false;
  }
}

export function startOutboxWorker(): () => void {
  const timer = setInterval(() => {
    void tick();
  }, 1000);

  void tick();

  return () => clearInterval(timer);
}
```

> [!NOTE]
> 这里用 `updateMany where status = 'pending'` 抢占事件，多个 worker 同时跑也只有一个能把状态改成 `processing`。数据量更大时再换成 `SELECT ... FOR UPDATE SKIP LOCKED`。

路径：`src/jobs/notification.worker.ts`。完整内容如下：

```ts
import { Worker } from 'bullmq';
import type { Prisma } from '@prisma/client';
import { logger } from '../common/logger.js';
import { prisma } from '../common/db.js';
import { redis } from '../common/redis.js';

type EventPayload = {
  actorId?: string;
  recipientId?: string;
  targetType?: string;
  targetId?: string;
  postId?: string;
  commentId?: string;
  followerId?: string;
  followeeId?: string;
};

function notificationType(jobName: string): 'like' | 'comment' | 'follow' | 'system' {
  if (jobName === 'like.created') return 'like';
  if (jobName === 'comment.created') return 'comment';
  if (jobName === 'follow.created') return 'follow';
  return 'system';
}

export const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    if (!job.id) {
      return;
    }

    const payload = job.data as EventPayload;
    const actorId = payload.actorId ?? payload.followerId;
    const recipientId = payload.recipientId ?? payload.followeeId;

    if (!actorId || !recipientId || actorId === recipientId) {
      return;
    }

    const notification = await prisma.notification.upsert({
      where: { eventId: job.id },
      update: {},
      create: {
        eventId: job.id,
        userId: BigInt(recipientId),
        type: notificationType(job.name),
        actorId: BigInt(actorId),
        targetType:
          payload.targetType ??
          (payload.postId ? 'post' : payload.commentId ? 'comment' : null),
        targetId: payload.targetId
          ? BigInt(payload.targetId)
          : payload.postId
            ? BigInt(payload.postId)
            : payload.commentId
              ? BigInt(payload.commentId)
              : null,
        payload: payload as unknown as Prisma.InputJsonValue,
      },
    });

    await redis.publish(
      `notify:${recipientId}`,
      JSON.stringify({
        id: notification.id.toString(),
        type: notification.type,
        actorId: notification.actorId?.toString() ?? null,
        targetType: notification.targetType,
        targetId: notification.targetId?.toString() ?? null,
        createdAt: notification.createdAt,
      }),
    );
  },
  {
    connection: redis,
    concurrency: 10,
  },
);

notificationWorker.on('failed', (job, error) => {
  logger.error({ err: error, jobId: job?.id }, 'notification job failed');
});
```

路径：`src/jobs/index.ts`。完整内容如下：

```ts
import { startOutboxWorker } from './outbox.worker.js';
import { notificationWorker } from './notification.worker.js';

export async function startWorkers(): Promise<() => Promise<void>> {
  const stopOutbox = startOutboxWorker();

  return async () => {
    stopOutbox();
    await notificationWorker.close();
  };
}
```

### 5. 在 server.ts 启动 worker

在 `server.ts` 里加：

```ts
import { startWorkers } from './jobs/index.js';

void startWorkers();
```

Day 22 再把 worker 的关闭逻辑接进优雅关闭。

### 6. 验收

准备一条已发布帖子，用用户 A 点赞用户 B 的帖子：

```bash
URL="http://127.0.0.1:3000/api/v1/posts/<POST_ID>/like"
curl -s -X POST -H "Authorization: Bearer $USER_A_TOKEN" "$URL"
```

等 1–2 秒，查通知表：

```bash
docker exec -i community-mysql mysql -uroot -proot community \
  -e "SELECT id, user_id, type, actor_id, event_id FROM notifications ORDER BY id DESC LIMIT 5;"
```

预期：B 的 `user_id` 下多一条 `like` 通知。

自己点赞自己的帖子：

```bash
curl -s -X POST -H "Authorization: Bearer $USER_B_TOKEN" "$URL"
```

预期：不新增通知（`actorId === recipientId` 直接 return）。

重复投递：手动把同一条 outbox 事件改回 `pending`，再让 worker 跑一次；预期 `notifications.event_id` 唯一键阻止重复插入。

**常见错误**

- worker 没启动：`server.ts` 只启动 HTTP，忘了 `startWorkers()`。
- 通知重复：只靠 BullMQ jobId，没加数据库 `eventId` 唯一键。
- worker 卡住：Redis 连接没配 `maxRetriesPerRequest: null`。
- 自己操作自己仍有通知：发事件时 `recipientId` 和 `actorId` 没区分。

**产出**：commit `feat: add outbox worker and notifications`。

```bash
git add .
git commit -m "feat: add outbox worker and notifications"
```

## Day 15：SSE 通知

**今天目标**：B 在线时，点赞事件 1 秒内推到 B 的页面。

### 1. 写 notifications 模块

路径：`src/modules/notifications/notifications.schemas.ts`。完整内容如下：

```ts
import { z } from 'zod';

export const listNotificationsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const markReadSchema = z.object({
  ids: z.array(z.string().regex(/^\d+$/)).max(100).optional(),
});
```

路径：`src/modules/notifications/notifications.service.ts`。完整内容如下：

```ts
import type { Prisma } from '@prisma/client';
import { prisma } from '../../common/db.js';
import { decodeCursor, encodeCursor, parseLimit } from '../../common/pagination.js';

function toNotification(row: {
  id: bigint;
  userId: bigint;
  type: string;
  actorId: bigint | null;
  targetType: string | null;
  targetId: bigint | null;
  payload: unknown;
  readAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: row.id.toString(),
    type: row.type,
    actorId: row.actorId?.toString() ?? null,
    targetType: row.targetType,
    targetId: row.targetId?.toString() ?? null,
    payload: row.payload,
    readAt: row.readAt,
    createdAt: row.createdAt,
  };
}

export async function listNotifications(
  userId: bigint,
  input: { cursor?: string; limit?: number },
) {
  const limit = parseLimit(input.limit, 20, 50);
  const cursor = decodeCursor(input.cursor);

  const where: Prisma.NotificationWhereInput = { userId };
  if (cursor) {
    where.OR = [
      { createdAt: { lt: cursor.createdAt } },
      { createdAt: cursor.createdAt, id: { lt: cursor.id } },
    ];
  }

  const rows = await prisma.notification.findMany({
    where,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
  });

  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items.at(-1);

  return {
    items: items.map(toNotification),
    nextCursor:
      hasMore && last
        ? encodeCursor({ createdAt: last.createdAt, id: last.id })
        : null,
  };
}

export async function markNotificationsRead(userId: bigint, ids?: string[]) {
  const where: Prisma.NotificationWhereInput = {
    userId,
    readAt: null,
  };
  if (ids && ids.length > 0) {
    where.id = { in: ids.map((id) => BigInt(id)) };
  }

  const result = await prisma.notification.updateMany({
    where,
    data: { readAt: new Date() },
  });

  return { updated: result.count };
}
```

路径：`src/modules/notifications/notifications.routes.ts`。完整内容如下：

```ts
import { Router } from 'express';
import { requireAuth } from '../../common/auth.js';
import { AppError } from '../../common/errors.js';
import { asyncHandler } from '../../common/middleware.js';
import { redis } from '../../common/redis.js';
import { listNotifications, markNotificationsRead } from './notifications.service.js';
import { listNotificationsQuerySchema, markReadSchema } from './notifications.schemas.js';

export const notificationsRouter = Router();

function currentUserId(req: { user?: { sub: string } }): bigint {
  if (!req.user) {
    throw new AppError('UNAUTHORIZED', 401, 'Authentication required');
  }
  return BigInt(req.user.sub);
}

notificationsRouter.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const query = listNotificationsQuerySchema.parse(req.query);
    res.json(await listNotifications(currentUserId(req), query));
  }),
);

notificationsRouter.post(
  '/read',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = markReadSchema.parse(req.body ?? {});
    res.json(await markNotificationsRead(currentUserId(req), input.ids));
  }),
);

notificationsRouter.get('/stream', requireAuth, async (req, res) => {
  const userId = currentUserId(req).toString();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const subscriber = redis.duplicate();
  await subscriber.subscribe(`notify:${userId}`);

  let closed = false;
  subscriber.on('message', (_channel, message) => {
    if (!closed) {
      res.write(`event: notification\ndata: ${message}\n\n`);
    }
  });

  const heartbeat = setInterval(() => {
    if (!closed) {
      res.write(': ping\n\n');
    }
  }, 15000);

  req.on('close', () => {
    closed = true;
    clearInterval(heartbeat);
    void subscriber.unsubscribe(`notify:${userId}`);
    subscriber.disconnect();
  });
});
```

> [!NOTE]
> `curl` 可以用 `Authorization` 头；浏览器的原生 `EventSource` 不能自定义头，需要改用 `fetch` 流式读取，或把短期 token 放 Cookie/查询参数。生产环境优先 httpOnly Cookie，避免 token 进日志。

### 2. 挂载 notifications

在 `app.ts` 增加：

```ts
import { notificationsRouter } from './modules/notifications/notifications.routes.js';

app.use('/api/v1/notifications', notificationsRouter);
```

### 3. 验收

开两个终端。

终端 A 建立 SSE：

```bash
curl -N -H "Authorization: Bearer $USER_B_TOKEN" \
  http://127.0.0.1:3000/api/v1/notifications/stream
```

终端 B 用 A 点赞 B 的帖子：

```bash
curl -s -X POST -H "Authorization: Bearer $USER_A_TOKEN" \
  http://127.0.0.1:3000/api/v1/posts/<POST_ID>/like
```

预期：终端 A 在 1 秒内出现：

```text
event: notification
data: {"id":"...","type":"like",...}
```

断开客户端：

```bash
# 在终端 A 按 Ctrl+C
```

预期：服务端不报错；再查 `notifications` 列表，未读记录还在。

**常见错误**

- SSE 被 Nginx 缓冲：必须带 `X-Accel-Buffering: no`，Day 20 还要配 `proxy_buffering off`。
- 连接泄漏：`req.on('close')` 里必须清理订阅和定时器。
- 收不到事件：worker 发布到 `notify:<userId>`，SSE 订阅的 channel 必须完全一致。

**产出**：commit `feat: add sse notifications`。

```bash
git add .
git commit -m "feat: add sse notifications"
```

## Day 16：审核、举报与后台

**今天目标**：pending 帖子只有审核通过才进入 feed，所有操作有审计。

### 1. 写 moderation 服务

路径：`src/modules/moderation/moderation.service.ts`。完整内容如下：

```ts
import type { Prisma } from '@prisma/client';
import { prisma } from '../../common/db.js';
import { AppError } from '../../common/errors.js';

export async function listPostsByStatus(status: 'pending' | 'published' | 'rejected') {
  const posts = await prisma.post.findMany({
    where: { status },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    take: 50,
    include: {
      author: { select: { id: true, nickname: true } },
    },
  });

  return posts.map((post) => ({
    ...post,
    id: post.id.toString(),
    authorId: post.authorId.toString(),
    author: {
      id: post.author.id.toString(),
      nickname: post.author.nickname,
    },
  }));
}

export async function approvePost(postId: bigint, operatorId: bigint) {
  return prisma.$transaction(async (tx) => {
    const post = await tx.post.findFirst({
      where: { id: postId, status: 'pending' },
      select: { id: true },
    });
    if (!post) {
      throw new AppError('POST_NOT_FOUND', 404, 'Pending post not found');
    }

    const updated = await tx.post.update({
      where: { id: postId },
      data: { status: 'published' },
    });
    await tx.moderationRecord.create({
      data: {
        targetType: 'post',
        targetId: postId,
        action: 'approve',
        operatorId,
      },
    });

    return { id: updated.id.toString(), status: updated.status };
  });
}

export async function rejectPost(postId: bigint, operatorId: bigint, reason?: string) {
  return prisma.$transaction(async (tx) => {
    const post = await tx.post.findFirst({
      where: { id: postId, status: 'pending' },
      select: { id: true },
    });
    if (!post) {
      throw new AppError('POST_NOT_FOUND', 404, 'Pending post not found');
    }

    const updated = await tx.post.update({
      where: { id: postId },
      data: { status: 'rejected' },
    });
    await tx.moderationRecord.create({
      data: {
        targetType: 'post',
        targetId: postId,
        action: 'reject',
        operatorId,
        reason,
      },
    });

    return { id: updated.id.toString(), status: updated.status };
  });
}
```

> [!WARNING]
> 返回 Prisma 对象前必须逐层把 BigInt 转成字符串，不能直接 `JSON.stringify` 整个对象，否则会抛 `Do not know how to serialize a BigInt`。

### 2. 写 reports 服务与路由

路径：`src/modules/reports/reports.schemas.ts`。完整内容如下：

```ts
import { z } from 'zod';

export const createReportSchema = z.object({
  targetType: z.enum(['post', 'comment', 'user']),
  targetId: z.string().regex(/^\d+$/),
  reason: z.string().min(1).max(255),
});

export const resolveReportSchema = z.object({
  action: z.enum(['resolve', 'reject']),
});
```

路径：`src/modules/reports/reports.service.ts`。完整内容如下：

```ts
import { prisma } from '../../common/db.js';
import { AppError } from '../../common/errors.js';

export async function createReport(
  reporterId: bigint,
  input: { targetType: 'post' | 'comment' | 'user'; targetId: string; reason: string },
) {
  const report = await prisma.report.create({
    data: {
      reporterId,
      targetType: input.targetType,
      targetId: BigInt(input.targetId),
      reason: input.reason,
    },
  });
  return { id: report.id.toString(), status: report.status };
}

export async function listPendingReports() {
  const reports = await prisma.report.findMany({
    where: { status: 'pending' },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    take: 50,
  });
  return reports.map((report) => ({
    ...report,
    id: report.id.toString(),
    reporterId: report.reporterId.toString(),
    targetId: report.targetId.toString(),
    handledBy: report.handledBy?.toString() ?? null,
  }));
}

export async function resolveReport(
  reportId: bigint,
  operatorId: bigint,
  action: 'resolve' | 'reject',
) {
  return prisma.$transaction(async (tx) => {
    const report = await tx.report.findFirst({
      where: { id: reportId, status: 'pending' },
    });
    if (!report) {
      throw new AppError('REPORT_NOT_FOUND', 404, 'Pending report not found');
    }

    const updated = await tx.report.update({
      where: { id: reportId },
      data: {
        status: action === 'resolve' ? 'resolved' : 'rejected',
        handledBy: operatorId,
      },
    });
    await tx.moderationRecord.create({
      data: {
        targetType: 'report',
        targetId: reportId,
        action: action === 'resolve' ? 'approve' : 'reject',
        operatorId,
        reason: report.reason,
      },
    });

    return { id: updated.id.toString(), status: updated.status };
  });
}
```

路径：`src/modules/reports/reports.routes.ts`。完整内容如下：

```ts
import { Router } from 'express';
import { requireAuth } from '../../common/auth.js';
import { AppError } from '../../common/errors.js';
import { asyncHandler } from '../../common/middleware.js';
import { createReportSchema } from './reports.schemas.js';
import { createReport } from './reports.service.js';

export const reportsRouter = Router();

reportsRouter.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new AppError('UNAUTHORIZED', 401, 'Authentication required');
    }
    const input = createReportSchema.parse(req.body);
    res.status(201).json(await createReport(BigInt(req.user.sub), input));
  }),
);
```

### 3. 写 admin 路由

路径：`src/modules/admin/admin.routes.ts`。完整内容如下：

```ts
import { Router } from 'express';
import { requireAuth, requirePermission } from '../../common/auth.js';
import { AppError } from '../../common/errors.js';
import { asyncHandler } from '../../common/middleware.js';
import {
  approvePost,
  listPostsByStatus,
  rejectPost,
} from '../moderation/moderation.service.js';
import { listPendingReports, resolveReport } from '../reports/reports.service.js';
import { resolveReportSchema } from '../reports/reports.schemas.js';

export const adminRouter = Router();

function currentUserId(req: { user?: { sub: string } }): bigint {
  if (!req.user) {
    throw new AppError('UNAUTHORIZED', 401, 'Authentication required');
  }
  return BigInt(req.user.sub);
}

function parseId(value: string | undefined, field: string): bigint {
  if (!value || !/^\d+$/.test(value)) {
    throw new AppError('INVALID_ID', 400, `Invalid ${field}`);
  }
  return BigInt(value);
}

adminRouter.use(requireAuth);

adminRouter.get(
  '/ping',
  requirePermission('admin:access'),
  (_req, res) => {
    res.json({ ok: true });
  },
);

adminRouter.get(
  '/posts',
  requirePermission('post:review'),
  asyncHandler(async (req, res) => {
    const status = req.query.status === 'published' || req.query.status === 'rejected'
      ? req.query.status
      : 'pending';
    res.json(await listPostsByStatus(status));
  }),
);

adminRouter.post(
  '/posts/:id/approve',
  requirePermission('post:review'),
  asyncHandler(async (req, res) => {
    res.json(await approvePost(parseId(req.params.id, 'post id'), currentUserId(req)));
  }),
);

adminRouter.post(
  '/posts/:id/reject',
  requirePermission('post:review'),
  asyncHandler(async (req, res) => {
    res.json(await rejectPost(parseId(req.params.id, 'post id'), currentUserId(req)));
  }),
);

adminRouter.get(
  '/reports',
  requirePermission('report:handle'),
  asyncHandler(async (_req, res) => {
    res.json(await listPendingReports());
  }),
);

adminRouter.post(
  '/reports/:id/resolve',
  requirePermission('report:handle'),
  asyncHandler(async (req, res) => {
    const input = resolveReportSchema.parse(req.body);
    res.json(
      await resolveReport(
        parseId(req.params.id, 'report id'),
        currentUserId(req),
        input.action,
      ),
    );
  }),
);
```

### 4. 挂载 reports

在 `app.ts` 增加：

```ts
import { reportsRouter } from './modules/reports/reports.routes.js';

app.use('/api/v1/reports', reportsRouter);
```

### 5. 验收

管理员看 pending：

```bash
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://127.0.0.1:3000/api/v1/admin/posts?status=pending"
```

审核通过：

```bash
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://127.0.0.1:3000/api/v1/admin/posts/<POST_ID>/approve
```

预期：`status = published`；随后普通用户的 feed 能看到这条帖子；`moderation_records` 多一条 `approve`，带 `operatorId`。

审核拒绝：

```bash
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://127.0.0.1:3000/api/v1/admin/posts/<POST_ID>/reject
```

预期：`status = rejected`，feed 不出现。

普通用户访问后台：

```bash
curl -i -H "Authorization: Bearer $USER_TOKEN" \
  http://127.0.0.1:3000/api/v1/admin/posts
```

预期：`403 FORBIDDEN`。

举报：

```bash
curl -s -X POST -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"targetType":"post","targetId":"<POST_ID>","reason":"spam"}' \
  http://127.0.0.1:3000/api/v1/reports
```

管理员处理：

```bash
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://127.0.0.1:3000/api/v1/admin/reports
curl -s -X POST -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"resolve"}' \
  http://127.0.0.1:3000/api/v1/admin/reports/<REPORT_ID>/resolve
```

**常见错误**

- 审核后 feed 还看不到：feed 只查 `published`，确认状态真的更新了。
- 审计记录缺失：状态更新和 `moderationRecord.create` 必须在同一个事务。
- 普通用户能进后台：路由上的 `requirePermission` 必须逐个挂，不能只挂在 `/admin` 前缀上。

**产出**：commit `feat: add moderation and admin review`。

```bash
git add .
git commit -m "feat: add moderation and admin review"
```

## Day 17：故障注入

**今天目标**：Redis、队列、DB 任一挂掉，服务不崩，错误可解释。

### 1. 写超时工具

路径：`src/common/timeout.ts`。完整内容如下：

```ts
import { AppError } from './errors.js';

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  code = 'DEPENDENCY_TIMEOUT',
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new AppError(code, 504, 'Dependency timeout'));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
```

### 2. 增加就绪检查

在 `app.ts` 增加：

```ts
import { prisma } from './common/db.js';
import { redis } from './common/redis.js';
import { withTimeout } from './common/timeout.js';

app.get('/ready', asyncHandler(async (_req, res) => {
  await withTimeout(prisma.$queryRaw`SELECT 1`, 300, 'DB_TIMEOUT');
  await withTimeout(redis.ping(), 300, 'REDIS_TIMEOUT');
  res.json({ status: 'ready' });
}));
```

`/health` 只表示进程活着；`/ready` 才表示数据库和 Redis 都能用。

### 3. 给 errorHandler 增加依赖错误映射

在 `errorHandler` 的 `AppError` 分支之前加：

```ts
import { Prisma } from '@prisma/client';

if (
  err instanceof Prisma.PrismaClientKnownRequestError &&
  err.code === 'P1001'
) {
  res.status(503).json({
    code: 'DB_UNAVAILABLE',
    message: 'Database is unavailable',
    requestId,
  });
  return;
}

if (err instanceof Error && err.name === 'PrismaClientInitializationError') {
  res.status(503).json({
    code: 'DB_UNAVAILABLE',
    message: 'Database is unavailable',
    requestId,
  });
  return;
}
```

Redis 超时统一由 `withTimeout` 抛 `504 DEPENDENCY_TIMEOUT`，不需要单独识别 ioredis 的错误类型。

### 4. 验收

停 Redis：

```bash
docker stop community-redis
curl -i http://127.0.0.1:3000/ready
curl -i http://127.0.0.1:3000/health
```

预期：`/ready` 返回 `504` 或结构化 `503`；`/health` 仍 `200`；进程没退出。

停 MySQL：

```bash
docker stop community-mysql
curl -i http://127.0.0.1:3000/ready
```

预期：`503 DB_UNAVAILABLE` 或 `504`；服务仍在。

恢复：

```bash
docker start community-redis community-mysql
sleep 5
curl -i http://127.0.0.1:3000/ready
```

预期：`200 {"status":"ready"}`。

worker 追赶：

```bash
docker stop community-redis
# 制造几条 pending outbox（发帖/点赞）
docker start community-redis
sleep 3
docker exec -i community-mysql mysql -uroot -proot community \
  -e "SELECT status, COUNT(*) FROM outbox_events GROUP BY status;"
```

预期：pending 最终变成 done。

**常见错误**

- Redis 挂掉后请求一直挂着：没有超时，必须用 `withTimeout` 包住外部调用。
- MySQL 挂掉进程直接退出：不要在模块顶层 `await prisma.$connect()`；连接失败要变成请求级 503。
- 恢复后事件不追：outbox worker 只处理 `pending`，失败的要看 `retryCount` 并重置为 pending。

**产出**：commit `fix: add timeout and degradation for dependencies`。

```bash
git add .
git commit -m "fix: add timeout and degradation for dependencies"
```

## Day 18（周末）：10 分钟演示

**今天目标**：把异步链路讲清楚。

### 1. 写 docs/demo.md

路径：`docs/demo.md`。完整内容如下：

```markdown
# 10 分钟演示脚本

## 0:00-1:00 问题与范围

- 社区核心闭环：人、内容、关系、信息流、通知、治理。
- 今天只演示主链路，不讲所有边界。

## 1:00-3:00 认证

1. 注册 A、B 两个用户。
2. 登录 A，展示 access token + httpOnly refresh cookie。
3. 刷新一次，展示 refresh 轮换。
4. 用旧 refresh 重放，展示 401。

## 3:00-5:00 内容

1. A 发帖，展示 status=pending。
2. 列表看不到 pending，作者详情能看到。
3. 管理员审核通过，feed 出现。
4. B 评论，帖子 commentCount +1。
5. B 点赞，likeCount +1；重复点赞不变。

## 5:00-7:00 信息流

1. B 关注 A。
2. 请求 /api/v1/feed?limit=2。
3. 用 nextCursor 翻页，证明不重不漏。

## 7:00-9:00 异步链路

1. B 点赞 A 的帖子。
2. 看 outbox_events 从 pending → processing → done。
3. 看 notifications 新增一条。
4. B 保持 SSE 连接，展示事件 1 秒内到达。

## 9:00-10:00 取舍与如果重来

- 为什么模块化单体而不是微服务。
- 为什么 Outbox 而不是请求里直接发通知。
- 为什么游标分页而不是 OFFSET。
- 如果重来：先补测试和压测，再补功能。
```

### 2. 验收

- 不看稿能讲 10 分钟。
- 能回答「消息丢了怎么办」「重复了怎么办」「feed 为什么不用 offset」。

**产出**：一段录音 + `docs/demo.md`。

```bash
git add .
git commit -m "docs: add ten minute demo script"
```

---

## 第 4 周：上线

## Day 19：Docker 多阶段构建

**今天目标**：一条命令起 API + MySQL + Redis。

### 1. 写 Dockerfile

路径：`Dockerfile`。完整内容如下：

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.18.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.18.0 --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm exec prisma generate && pnpm build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
USER node
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
```

> [!NOTE]
> 这里保留了 devDependencies，因为运行时要用 `prisma migrate deploy`。如果你把镜像压到最小，把迁移放到 CI/部署流水线，运行阶段只装生产依赖。

### 2. 写 .dockerignore

路径：`.dockerignore`。完整内容如下：

```text
node_modules
dist
coverage
.git
.idea
.env
.env.*
!.env.example
docs
tests
```

### 3. 给 docker-compose.yml 增加 api 服务

在 Day 1 的 `docker-compose.yml` 里追加（不要重复 mysql/redis）：

```yaml
  api:
    build: .
    container_name: community-api
    restart: unless-stopped
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: mysql://root:root@mysql:3306/community
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET:?set JWT_SECRET in .env}
      WEB_ORIGIN: ${WEB_ORIGIN:-http://localhost:5173}
    ports:
      - "3000:3000"
```

### 4. 启动并验收

```bash
docker compose up --build -d
docker compose ps
curl -i http://127.0.0.1:3000/health
curl -i http://127.0.0.1:3000/ready
```

预期：api、mysql、redis 都是 `Up`；`/health` 和 `/ready` 都是 `200`。

确认镜像里没有源码和 `.env`：

```bash
docker compose exec api sh -lc 'ls /app; test ! -f /app/.env && echo no-env'
```

预期：能看到 `dist`、`prisma`、`node_modules`，没有 `src`，没有 `.env`。

重启后数据还在：

```bash
docker compose restart mysql
docker compose up -d
```

**常见错误**

- 容器里 `P1001`：`DATABASE_URL` 里的 host 必须是 compose 服务名 `mysql`，不是 `127.0.0.1`。
- `prisma: not found`：运行时没保留 Prisma CLI，或在 CI 里跑迁移。
- 镜像里带 `.env`：`.dockerignore` 没写 `.env`。
- 启动顺序不对：`depends_on` 只保证容器启动，不保证健康；要用 `condition: service_healthy`。

**产出**：commit `build: add multi-stage dockerfile and compose`。

```bash
git add .
git commit -m "build: add multi-stage dockerfile and compose"
```

## Day 20：Nginx + SSE

**今天目标**：通过 Nginx 访问 API，SSE 不被缓冲。

### 1. 写 Nginx 配置

路径：`deploy/nginx/community.conf`。完整内容如下：

```nginx
server {
    listen 80;
    server_name _;
    client_max_body_size 2m;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/v1/notifications/stream {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        gzip off;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        add_header X-Accel-Buffering no;
    }
}
```

> [!IMPORTANT]
> Nginx 按最长前缀匹配，`/api/v1/notifications/stream` 比 `/api/` 长，所以 SSE 会走第二个 location。`proxy_buffering off` 和 `X-Accel-Buffering: no` 缺一不可。

### 2. 应用配置

Ubuntu/Debian：

```bash
sudo cp deploy/nginx/community.conf /etc/nginx/sites-available/community
sudo ln -sf /etc/nginx/sites-available/community /etc/nginx/sites-enabled/community
sudo nginx -t
sudo nginx -s reload
```

如果 Nginx 和 API 都在 Docker 里，把 `proxy_pass` 改成容器服务名，例如 `http://api:3000`。

### 3. 验收

普通接口：

```bash
curl -i http://127.0.0.1/api/v1/posts
```

预期：`200`，不是 502。

SSE：

```bash
curl -N -H "Authorization: Bearer $USER_TOKEN" \
  http://127.0.0.1/api/v1/notifications/stream
```

另一端点赞后，终端应在 1 秒内出现 `event: notification`，而不是攒一批才吐。

**常见错误**

- SSE 延迟/一次性吐出：`proxy_buffering` 没关。
- 502：`proxy_pass` 端口不对，或 API 没起。
- 大请求 413：`client_max_body_size` 太小。
- 长连接被断：`proxy_read_timeout` 太短；SSE 需要分钟级以上的超时。

**产出**：commit `build: add nginx config for api and sse`。

```bash
git add .
git commit -m "build: add nginx config for api and sse"
```

## Day 21：CI

**今天目标**：提交即跑 lint/类型/测试/构建，失败阻断。

### 1. 安装 lint 依赖

```bash
pnpm add -D eslint @eslint/js typescript-eslint
```

### 2. 写 eslint.config.mjs

路径：`eslint.config.mjs`。完整内容如下：

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', 'coverage', 'prisma/migrations'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
    },
  },
);
```

`package.json` 增加：

```json
{
  "scripts": {
    "lint": "eslint ."
  }
}
```

### 3. 写 GitHub Actions

路径：`.github/workflows/ci.yml`。完整内容如下：

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: community_test
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping -h 127.0.0.1 -uroot -proot"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=10
      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: >-
          --health-cmd="redis-cli ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=10

    env:
      NODE_ENV: test
      DATABASE_URL: mysql://root:root@127.0.0.1:3306/community_test
      REDIS_URL: redis://127.0.0.1:6379
      JWT_SECRET: 01234567890123456789012345678901
      WEB_ORIGIN: http://localhost:5173

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 12.18.0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec prisma migrate deploy
      - run: pnpm exec prisma db seed
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

### 4. 验收

先本地跑一遍：

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

再故意提交一个类型错误：

```bash
# 例如把某个 number 赋给 string
git add .
git commit -m "test: break ci"
git push
```

预期：CI 红；修掉后再推，CI 绿。

**常见错误**

- CI 里 `P1001`：service 容器还没健康就跑了迁移，检查 healthcheck。
- `pnpm-lock.yaml` 不同步：`pnpm install --frozen-lockfile` 会失败。
- 测试库没表：CI 步骤里先 `prisma migrate deploy`。
- seed 依赖 admin 用户：`prisma db seed` 必须在测试前跑。

**产出**：commit `ci: add lint typecheck test and build`。

```bash
git add .
git commit -m "ci: add lint typecheck test and build"
```

## Day 22：日志、指标、优雅关闭

**今天目标**：线上能看、能查、能安全重启。

### 1. 安装 prom-client

```bash
pnpm add prom-client
```

### 2. 写 metrics

路径：`src/common/metrics.ts`。完整内容如下：

```ts
import type { RequestHandler } from 'express';
import {
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

export const register = new Registry();
collectDefaultMetrics({ register });

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

export const metricsMiddleware: RequestHandler = (req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({
      method: req.method,
      route: req.route?.path ?? req.path,
      status: String(res.statusCode),
    });
  });
  next();
};
```

### 3. 在 app.ts 暴露 metrics

```ts
import { metricsMiddleware, register } from './common/metrics.js';

app.use(metricsMiddleware);

app.get('/metrics', async (_req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

> [!WARNING]
> `/metrics` 不要直接暴露公网；生产环境只让内网或带 token 的抓取端访问。

### 4. 写优雅关闭

路径：`src/server.ts`。完整内容如下：

```ts
import { config } from './common/config.js';
import { prisma } from './common/db.js';
import { logger } from './common/logger.js';
import { redis } from './common/redis.js';
import { createApp } from './app.js';
import { startWorkers } from './jobs/index.js';

const app = createApp();
const stopWorkers = await startWorkers();

const server = app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'API listening');
});

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  logger.info({ signal }, 'shutting down');

  const forceExit = setTimeout(() => {
    logger.error('graceful shutdown timed out');
    process.exit(1);
  }, 10000);
  forceExit.unref();

  const forceClose = setTimeout(() => {
    server.closeAllConnections();
  }, 5000);
  forceClose.unref();

  server.close(async () => {
    clearTimeout(forceExit);
    await stopWorkers();
    await prisma.$disconnect();
    await redis.quit();
    logger.info('shutdown complete');
    process.exit(0);
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
```

### 5. 验收

```bash
curl -s http://127.0.0.1:3000/metrics | head -20
```

预期：能看到 `http_request_duration_seconds` 和进程指标。

发一个慢请求（可以临时加 `await new Promise(r => setTimeout(r, 3000))`），然后：

```bash
kill -TERM <PID>
```

预期：服务等慢请求完成后再退出，日志有 `shutting down` 和 `shutdown complete`。

**常见错误**

- 重启时慢请求被掐断：`server.close()` 后要等回调，不能立刻 `process.exit`。
- SSE 长连接导致永远退不出：5 秒后 `server.closeAllConnections()` 兜底。
- 指标没有数据：`metricsMiddleware` 必须在路由前挂。
- 日志串不起来：错误日志必须带 `requestId`。

**产出**：commit `feat: add metrics and graceful shutdown`。

```bash
git add .
git commit -m "feat: add metrics and graceful shutdown"
```

## Day 23：压测与回滚演练

**今天目标**：知道服务能扛多少，以及发坏了怎么退。

### 1. 压测

准备一个已发布帖子、一个关注关系和一个有效 token，然后：

```bash
npx autocannon -c 100 -d 30 \
  -H "Authorization: Bearer $USER_TOKEN" \
  http://127.0.0.1:3000/api/v1/feed
```

点赞写入：

```bash
npx autocannon -c 50 -d 30 -m POST \
  -H "Authorization: Bearer $USER_TOKEN" \
  http://127.0.0.1:3000/api/v1/posts/<POST_ID>/like
```

记录：

- QPS / Req/Sec
- P95 / P99
- Non-2xx
- CPU / 内存
- MySQL 连接数：`docker exec -i community-mysql mysql -uroot -proot -e "SHOW STATUS LIKE 'Threads_connected';"`
- 慢查询：`SHOW FULL PROCESSLIST;`

### 2. 写压测报告

路径：`docs/load-report.md`。完整模板如下：

```markdown
# 压测报告

- 日期：
- 机器 / 核数 / 内存：
- 数据量：users / posts / follows / likes
- 场景：feed 读 / 点赞写
- 并发：100
- 时长：30s
- QPS：
- P95 / P99：
- 错误率：
- CPU / 内存：
- MySQL 连接数：
- 瓶颈判断：DB / 应用 / 连接池 / 锁
- 本轮只做的优化：
- 优化后 QPS / P95：
```

### 3. 回滚演练

单机 Docker + Git 部署的回滚顺序：

```bash
git log --oneline -5
git revert <bad-commit> --no-edit
docker compose up --build -d
curl -i http://127.0.0.1:3000/health
curl -i http://127.0.0.1:3000/ready
```

如果你用镜像 tag 部署（compose 里的 `api` 服务用 `image: community-api:current`）：

```bash
docker tag community-api:v1 community-api:current
docker compose up -d --no-deps api
```

验收：5 分钟内回到上一版，`/health` 和核心接口正常。

**常见错误**

- 压测打的是空表：先造数据，否则 QPS 没有参考价值。
- 只压读不压写：点赞/发帖才是锁和事务的瓶颈。
- 回滚只回代码不回迁移：数据库迁移要保证向前兼容，破坏性变更拆成两步。
- 回滚后没验核心链路：至少验 `/health`、登录、feed。

**产出**：commit `perf: ...` + `docs/load-report.md` + 回滚步骤。

```bash
git add .
git commit -m "perf: add load report and rollback runbook"
```

## Day 24（周末）：README + 架构图 + 10 分钟讲稿

**今天目标**：把 4 周变成可展示的作品。

### 1. 写 README

路径：`README.md`。完整内容如下：

````markdown
# Community API

企业级社区业务 Node 服务：Express 5 + TypeScript + Prisma + MySQL 8 + Redis 7 + BullMQ。

## 能力

- 认证：注册 / 登录 / refresh 轮换 / 登出 / RBAC
- 内容：发帖 / 评论 / 点赞 / 软删除
- 关系：关注 / 取关
- 信息流：关注流，游标分页
- 通知：Outbox + BullMQ + SSE
- 治理：审核 / 举报 / 后台列表
- 工程：Docker / Nginx / CI / 日志 / 指标 / 优雅关闭

## 快速开始

```bash
cp .env.example .env
docker compose up -d mysql redis
pnpm install
pnpm exec prisma migrate dev
pnpm exec prisma db seed
pnpm dev
```

健康检查：

```bash
curl http://127.0.0.1:3000/health
curl http://127.0.0.1:3000/ready
```

## 环境变量

| 键 | 说明 |
|---|---|
| `PORT` | API 端口 |
| `DATABASE_URL` | MySQL 连接串 |
| `REDIS_URL` | Redis 连接串 |
| `JWT_SECRET` | access token 签名密钥，至少 32 字符 |
| `WEB_ORIGIN` | 允许的前端来源 |
| `LOG_LEVEL` | pino 日志级别 |

## 常用命令

```bash
pnpm dev          # 开发
pnpm build        # 编译到 dist
pnpm start        # 运行编译产物
pnpm typecheck    # 类型检查
pnpm test         # 测试
pnpm lint         # lint
```

## API

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/v1/auth/register` | 注册 |
| POST | `/api/v1/auth/login` | 登录 |
| POST | `/api/v1/auth/refresh` | 刷新 |
| POST | `/api/v1/auth/logout` | 登出 |
| GET | `/api/v1/users/me` | 当前用户 |
| PATCH | `/api/v1/users/me` | 修改资料 |
| POST | `/api/v1/users/:id/follow` | 关注 |
| DELETE | `/api/v1/users/:id/follow` | 取关 |
| GET | `/api/v1/posts` | 已发布帖子列表 |
| POST | `/api/v1/posts` | 发帖 |
| GET | `/api/v1/posts/:id` | 帖子详情 |
| DELETE | `/api/v1/posts/:id` | 软删除 |
| POST | `/api/v1/posts/:postId/comments` | 评论 |
| POST | `/api/v1/posts/:postId/like` | 点赞 |
| DELETE | `/api/v1/posts/:postId/like` | 取消点赞 |
| GET | `/api/v1/feed` | 关注流 |
| GET | `/api/v1/notifications` | 通知列表 |
| GET | `/api/v1/notifications/stream` | SSE |
| POST | `/api/v1/reports` | 举报 |
| GET | `/api/v1/admin/posts` | 后台帖子列表 |
| POST | `/api/v1/admin/posts/:id/approve` | 审核通过 |
| POST | `/api/v1/admin/posts/:id/reject` | 审核拒绝 |
| GET | `/api/v1/admin/reports` | 举报列表 |
| POST | `/api/v1/admin/reports/:id/resolve` | 处理举报 |

## 架构

```text
routes → controller → service → repository → MySQL
                         │
                         ├─ Redis（缓存/限流/SSE）
                         └─ Outbox → BullMQ → worker
```

## 测试

```bash
pnpm test
```

## 部署

```bash
docker compose up --build -d
```

## ADR

- `docs/adr/001-auth.md`
- `docs/adr/002-outbox.md`
- `docs/adr/003-feed.md`
````

### 2. 写三篇 ADR

路径：`docs/adr/001-auth.md`：

```markdown
# ADR 001：JWT access + refresh 轮换

## 背景

社区需要无状态鉴权，同时 refresh 要可撤销。

## 决策

- access JWT 15 分钟，放内存/Authorization 头。
- refresh 随机串，sha256 存 `refresh_tokens`，httpOnly Cookie。
- 每次刷新撤销旧 token，检测到重放则撤销该用户全部 refresh。

## 代价

- 需要数据库存 refresh。
- 多端登录需要额外的会话管理。
```

路径：`docs/adr/002-outbox.md`：

```markdown
# ADR 002：事务性 Outbox + BullMQ

## 背景

点赞/评论/关注要发通知，但不能让通知拖慢主事务。

## 决策

- 业务事务里同时写 `outbox_events`。
- worker 轮询 pending，投递 BullMQ。
- 消费者用 `eventId` 唯一键幂等。

## 代价

- 最终一致，通知有秒级延迟。
- 需要监控积压和失败重试。
```

路径：`docs/adr/003-feed.md`：

```markdown
# ADR 003：关注流先拉模式 + 游标分页

## 背景

MVP 需要只看到关注人的帖子，不能深分页。

## 决策

- 查询时 JOIN follows + posts。
- 按 `(created_at, id)` 游标分页。
- 先不做写扩散/缓存，保证正确性。

## 代价

- 关注很多时查询成本上升。
- 大 V 场景后续要加缓存或推拉结合。
```

### 3. 写 10 分钟讲稿

直接复用 Day 18 的 `docs/demo.md`，再补一页「如果重来」：

```text
如果重来：
1. Day 1 就把 .env / .gitignore / CI 骨架搭好。
2. 先写测试和压测基线，再补功能。
3. 通知链路先做 Outbox + 幂等，再考虑 SSE。
4. 任何 BigInt 字段在 API 边界统一转字符串。
```

**验收**

- 别人照 README 能跑起来。
- 你能对着架构图讲完整链路。
- 面试时每个决策都能说「为什么不是另一个」。

**产出**：commit `docs: add readme architecture and adr`。

```bash
git add .
git commit -m "docs: add readme architecture and adr"
```

---

## 毕业验收：完整项目清单

> [!IMPORTANT]
> Day 3–24 是增量片段，不是 24 份完整文件。按顺序落地后，你的目录应该和 1.5.6 的最终目录一致；下面这份清单用来判断「是不是真的做完了」。

### 1. 业务能力

- [ ] 注册 / 登录 / 刷新 / 登出
- [ ] 旧 refresh 重放返回 401
- [ ] RBAC：未登录 401、无权限 403
- [ ] 用户资料 / 关注 / 取关
- [ ] 发帖 / 帖子列表 / 详情 / 软删除
- [ ] 评论 / 回复 / 事务计数
- [ ] 点赞 / 取消点赞 / 并发幂等
- [ ] 关注流 / 游标分页
- [ ] 通知列表 / 已读 / SSE
- [ ] 审核 / 举报 / 后台列表
- [ ] 审计记录 `moderation_records`

### 2. 数据与索引

- [ ] `users`、`refresh_tokens`、`roles`、`permissions`、`user_roles`、`role_permissions`
- [ ] `posts`、`comments`、`likes`、`follows`
- [ ] `notifications`、`reports`、`moderation_records`
- [ ] `outbox_events`、`idempotency_keys`
- [ ] 点赞唯一约束、关注复合主键、refresh hash 唯一
- [ ] 列表查询都有对应复合索引

### 3. 异步与高并发

- [ ] 业务事务内写 Outbox
- [ ] Outbox worker 能追平 pending
- [ ] 通知消费者按 `eventId` 幂等
- [ ] SSE 心跳 + 断线清理
- [ ] 依赖挂掉返回 503/504，进程不崩
- [ ] 100 并发压测报告
- [ ] 5 分钟内回滚

### 4. 工程化

- [ ] `.env` 不进 Git，`.env.example` 完整
- [ ] `pnpm lint` / `typecheck` / `test` / `build` 全绿
- [ ] Docker 多阶段构建
- [ ] Nginx 反代 + SSE 不缓冲
- [ ] CI 阻断类型错误/测试失败
- [ ] `/health`、`/ready`、`/metrics`
- [ ] SIGTERM 优雅关闭
- [ ] README 能让他人从零跑起来
- [ ] 3 篇 ADR
- [ ] 10 分钟演示

### 5. 最终冒烟脚本

路径：`scripts/smoke.sh`。完整内容如下：

```bash
#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://127.0.0.1:3000}

curl -fsS "$BASE_URL/health" >/dev/null
curl -fsS "$BASE_URL/ready" >/dev/null
curl -fsS "$BASE_URL/api/v1/posts?limit=1" >/dev/null

echo "smoke ok: $BASE_URL"
```

```bash
chmod +x scripts/smoke.sh
./scripts/smoke.sh
```

如果这五组都打勾，你得到的就不是一个「能跑的 demo」，而是一个**边界清楚、可测试、可部署、可讲清楚取舍**的社区服务。

---

## 可插拔扩展：把核心服务长成完整社区

> 30 天主线覆盖社区核心闭环。下面三块是常见的下一阶段业务，放进主线会让范围失控，但架构已经给它们留好了位置。

### 搜索

- 先上 MySQL `FULLTEXT`，数据量上来再换 Meilisearch。
- 发帖/审核通过后通过 Outbox 发 `post.published` 事件，由索引消费者同步，不让搜索拖慢发帖。
- 代码落点：`modules/search`；接口 `GET /api/v1/search/posts?q=`。
- 关键约束：索引可重建，MySQL 是真相源。

### 会员与支付

- 表：`plans`、`orders`、`entitlements`；订单带 `Idempotency-Key` 唯一键。
- 支付回调必须验签 + 幂等；回调成功只写一次权益。
- 代码落点：`modules/memberships`；不要和发帖/评论事务耦合。
- 关键约束：支付失败不能让内容主链路回滚。

### 图片与附件

- 客户端直传 MinIO/OSS，服务端只保存 URL 和元数据。
- 表：`post_media`；上传前限制 MIME、大小和数量。
- 代码落点：`modules/media`；帖子创建只接收已上传的 URL。
- 关键约束：不在 API 进程里转发大文件，避免占满内存和带宽。

这三块都遵循同一条规则：**核心模块不直接依赖扩展模块，扩展模块通过事件或 service 接口接入**。这就是「低耦合、可迭代」在代码里的具体含义。

---

## 3. 每周验收

### 第 1 周
- [ ] 注册 → 登录 → 刷新 → 登出
- [ ] 旧 refresh 失效
- [ ] 401 / 403 正确
- [ ] 重复关注只一行
- [ ] 日志带 requestId
- [ ] 5 个测试通过

### 第 2 周
- [ ] 发帖 pending，审核后进 feed
- [ ] 评论 + 计数同事务
- [ ] 20 并发点赞只加 1
- [ ] feed 游标不重不漏
- [ ] 有基线压测报告

### 第 3 周
- [ ] 点赞/评论/关注产生通知
- [ ] 自己操作自己不通知
- [ ] 重复事件不重复通知
- [ ] SSE 断线重连可恢复
- [ ] 审核有审计记录
- [ ] 依赖挂掉服务不崩

### 第 4 周
- [ ] 一条命令部署
- [ ] `/health`、`/metrics` 可访问
- [ ] SIGTERM 优雅退出
- [ ] 100 并发压测报告
- [ ] 5 分钟内回滚
- [ ] 10 分钟讲解

---

## 4. 防自欺规则

1. 不通读文档，只读当天那一节。
2. 不复制代码，看完关掉自己敲。
3. 不先加功能，先让当前功能有校验、错误、测试。
4. 每个接口四件套：鉴权、校验、错误、测试。
5. 每个异步操作有失败路径：超时、重试、幂等、降级。
6. 每周录 10 分钟讲解，讲不清就是没学会。
7. 每周至少一次故意弄坏：停 Redis、并发重复、杀进程。

---

## 5. 面试能答什么

| 周 | 能答的问题 |
|---|---|
| 第 1 周 | 认证怎么做？refresh 为什么轮换？RBAC 怎么落？日志怎么串请求？ |
| 第 2 周 | 点赞怎么幂等？计数怎么一致？feed 为什么游标？事务边界在哪？ |
| 第 3 周 | Outbox 解决什么？消息重复怎么办？SSE 怎么保活/重连？最终一致怎么解释？ |
| 第 4 周 | 怎么部署？怎么优雅退出？压测看什么？怎么回滚？ |

每个问题按：**我遇到什么 → 我选了什么 → 代价是什么 → 结果怎样**。

---

## 6. 如果只有 2 周

- 第 1 周：Day 1–5 地基 + 认证；Day 6–7 发帖/点赞 + 测试。
- 第 2 周：Day 8–9 Outbox + 通知 + SSE；Day 10 Docker/Nginx；Day 11 CI/指标；Day 12 压测 + 讲稿。
- 砍掉：审核后台、举报、会员、搜索。

---

## 7. 今天先做 90 分钟

照 Day 1 做，验收只有一个：`curl http://127.0.0.1:3000/health` 返回 200，并且有第一个 commit。

---

## 8. 每日记录模板

```text
日期：
今天做了什么：
卡住的地方：
怎么解决的：
明天第一件事：
```

## 9. 周复盘模板

```text
本周交付：
能演示的：
还没解决的：
下周最大风险：
面试能讲的一个点：
```

---

## 10. 如何更新本文

1. 每完成一天，直接把当天涉及的文件代码补到对应 Day 小节，遵守「代码必须完整」规则。
2. 只补代码还不够：同时写清**文件路径、执行命令、预期输出**。
3. 更新 frontmatter 的 `updated` 字段和文末版本记录。
4. 本地执行 `npm run build`，确认 frontmatter 和代码块没有破坏构建。
5. 提交信息用 `docs(blog): 补充 Day N 完整代码`，一次提交只改一个主题。

---

**最后**：这四周的价值不在代码量，而在你亲手经历了「需求 → 契约 → 数据 → 实现 → 验证 → 上线 → 出问题 → 修复」的完整循环。做完一遍，面试官问「你从 0 到 1 做过什么」，你就有东西可讲了。
