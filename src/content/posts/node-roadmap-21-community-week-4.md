---
title: '21 · 社区服务 0→1：第 4 周（Day 19–24）上线'
published: 2026-11-09T22:34:00+08:00
updated: 2026-11-09T22:34:00+08:00
description: 'Docker 多阶段构建、Nginx/SSE、CI、指标与优雅关闭、压测回滚、README/ADR 和讲稿。'
tags: [Docker, Nginx, CI, 可观测性]
category: Node全栈学习路线
draft: false
---

> [!NOTE]
> 本系列第 5/6 篇。上一篇：[第 3 周：异步与治理](/blog/posts/node-roadmap-20-community-week-3/)；下一篇：[毕业验收与后续阶段路线图](/blog/posts/node-roadmap-22-community-graduation/)；合集：[Node.js 全栈开发路线](/blog/node-roadmap/)。

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
