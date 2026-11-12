---
title: '后端 16–18：可观测、容器化与上线'
published: 2026-11-10T10:50:00+08:00
updated: 2026-11-10T10:50:00+08:00
description: 'Day 16–18：多阶段 Docker、全栈 Compose、Nginx/SSE、Prometheus 指标、优雅关闭、压测与回滚。'
tags: [社区全栈, 后端, Docker, Nginx]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 后端 16–18。上一篇：[后端 11–15](/blog/posts/node-roadmap-20-community-week-3/)；下一篇：[后端 19–21](/blog/posts/node-roadmap-22-community-graduation/)；前端对应篇：[前端 10–12](/blog/posts/community-fullstack-fe-04-p2a-quality/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

功能写完后，接下来处理上线的事：镜像、Nginx、指标和优雅关闭。先把服务装进容器，再压一轮，最后演练回滚。顺序别反，不然出了问题不知道该怪哪一层。

**这一阶段在练什么**

把服务从“本机能跑”推进到“能上线”：容器、反代、指标、优雅关闭、压测和回滚。每个能力都要能回答：出问题怎么发现、怎么退。

### 文件地图

| 文件 | 为什么单独存在 | 以后可能怎么改 |
|---|---|---|
| `Dockerfile` | 固化构建环境和产物 | 多阶段裁剪、镜像扫描 |
| `docker-compose.yml` | 本地依赖编排 | 加 admin/web/otel，按 profile 拆分 |
| `nginx.conf` | 入口、SSE 超时、安全头 | Ingress、网关、灰度 |
| `metrics.ts` | 指标是排障入口 | 加队列、outbox、DB 连接池 |
| `server.ts` | 关闭顺序决定会不会丢请求 | 接 K8s preStop、优雅下线 |
| `load-report.md` | 容量有数字，不靠感觉 | 定期基线、容量规划 |
| `docs/adr/*` | 记录取舍和代价 | 每次架构变更追加 |

**怎么判断**

先问“上线后怎么知道它坏了、怎么退回去”。答不上来，就先别加功能。

---

## Day 16：Docker 多阶段与全栈 Compose

**今天目标**：`docker compose up --build -d` 起 api/admin-api/web/mysql/redis/rabbitmq。

### 1. API Dockerfile

`apps/api/Dockerfile`：

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.18.0 --activate
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# 先生成 Prisma Client；构建阶段不需要连数据库
RUN pnpm --filter api exec prisma generate && pnpm --filter api build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
# 非 root 运行，降低容器被攻破后的影响
USER node
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
```

> 构建上下文是仓库根目录，不是 `apps/api`。`admin-api` 同理，只换构建命令和启动入口。

### 2. 全栈 Compose

`infra/docker/docker-compose.yml` 改完后的完整文件（在 Day 1 只有 mysql/redis 的版本上增加 rabbitmq/api/admin-api/web；不要保留旧的同名 service 块，直接整文件替换）：

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: community-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: community
    ports: ["3306:3306"]
    volumes: ["mysql-data:/var/lib/mysql"]
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-uroot", "-proot"]
      interval: 10s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    container_name: community-redis
    ports: ["6379:6379"]
    volumes: ["redis-data:/data"]

  rabbitmq:
    image: rabbitmq:3-management
    container_name: community-rabbitmq
    ports: ["5672:5672", "15672:15672"]

  api:
    # 服务名就是容器网络里的 DNS：api、mysql、redis
    build: { context: ../.., dockerfile: apps/api/Dockerfile }
    environment:
      NODE_ENV: production
      DATABASE_URL: mysql://root:root@mysql:3306/community
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://rabbitmq:5672
      JWT_SECRET: ${JWT_SECRET:?set JWT_SECRET in .env}
      WEB_ORIGIN: http://localhost:3002
    ports: ["3000:3000"]
    depends_on: [mysql, redis, rabbitmq]

  admin-api:
    build: { context: ../.., dockerfile: apps/admin-api/Dockerfile }
    environment:
      NODE_ENV: production
      ADMIN_DATABASE_URL: mysql://root:root@mysql:3306/community_admin
      API_INTERNAL_URL: http://api:3000
      RABBITMQ_URL: amqp://rabbitmq:5672
      JWT_SECRET: ${JWT_SECRET:?set JWT_SECRET in .env}
    ports: ["3001:3001"]
    depends_on: [api, rabbitmq]

  web:
    build: { context: ../.., dockerfile: apps/web/Dockerfile }
    environment:
      NEXT_PUBLIC_API_BASE: http://localhost:3000
      API_BASE_INTERNAL: http://api:3000
    ports: ["3002:3000"]
    depends_on: [api, admin-api]

volumes:
  mysql-data:
  redis-data:
```

`.dockerignore` 必须包含 `node_modules`、`dist`、`.next`、`.env`、`.git`、`tests`。

**验收**：`docker compose up --build -d` 后 `/health`、`/docs`、web 首页可用；镜像里没有源码和 `.env`。

**产出**：commit `build: add multi-stage docker and full stack compose`。

---

## Day 17：Nginx、SSE、指标、优雅关闭

**今天目标**：Nginx 反代正常，SSE 不缓冲，指标可查，SIGTERM 不掐断慢请求。

### 1. Nginx

`infra/docker/nginx.conf` 完整文件（`location` 不能单独存在，必须放在 `server` 块里）：

```nginx
server {
    listen 80;
    client_max_body_size 10m;

    location /api/ {
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /admin-api/ {
        proxy_pass http://admin-api:3001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 更长前缀优先匹配；SSE 必须关闭缓冲，否则事件会被 Nginx 攒着
    location /api/v1/notifications/stream {
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        gzip off;
        proxy_read_timeout 3600s;
        add_header X-Accel-Buffering no;
    }

    location / {
        proxy_pass http://web:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

SSE 的 `proxy_buffering off` 和 `X-Accel-Buffering: no` 缺一不可。

### 2. 指标

`apps/api/src/common/metrics.ts`：

```ts
import type { RequestHandler } from 'express';
import { Histogram, Registry, collectDefaultMetrics } from 'prom-client';

export const register = new Registry();
collectDefaultMetrics({ register });

export const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  // route 用路由模板而不是原始 URL，避免标签基数爆炸
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

export const metricsMiddleware: RequestHandler = (req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path ?? req.path, status: String(res.statusCode) });
  });
  next();
};
```

在 `apps/api/src/app.ts` 里挂载：`app.use(requestId);` 之后加 `app.use(metricsMiddleware);`，并在 `notFound` 之前加 `/metrics` 路由。改动只有这两处：

```ts
// 插到 apps/api/src/app.ts 顶部的 import 区
import { metricsMiddleware, register } from './common/metrics.js';

// 插到 app.use(requestId); 之后
app.use(metricsMiddleware);

// 插到 app.use(notFound); 之前
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});
```

### 3. 优雅关闭

`apps/api/src/server.ts` 改完后的完整文件（在 Day 8 版本上补优雅关闭；`startOutboxWorker()` 的返回值就是停止函数）：

```ts
import { config } from './common/config.js';
import { logger } from './common/logger.js';
import { prisma } from './common/db.js';
import { redis } from './common/redis.js';
import { notificationWorker } from './jobs/notification.worker.js';
import { startOutboxWorker } from './jobs/outbox.worker.js';
import { createApp } from './app.js';

const app = createApp();
const stopOutbox = startOutboxWorker();
const server = app.listen(config.PORT);

logger.info({ port: config.PORT }, 'API listening');

async function shutdown(signal: string) {
  // 先停止接收新连接，再等旧请求和 worker 收尾
  logger.info({ signal }, 'shutting down');
  const force = setTimeout(() => process.exit(1), 10_000);
  const hardClose = setTimeout(() => server.closeAllConnections(), 5_000);

  server.close(async () => {
    clearTimeout(force);
    clearTimeout(hardClose);
    await stopOutbox();
    await notificationWorker.close();
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
```

**验收**：`/metrics` 有数据；发慢请求后 `kill -TERM`，进程等请求完成再退出；SSE 首个事件 1 秒内出现。

**产出**：commit `feat: add nginx metrics and graceful shutdown`。

---

## Day 18：压测、回滚、ADR

**今天目标**：知道当前 QPS/P95，能在 5 分钟内回滚。

### 1. 压测

```bash
npx autocannon -c 100 -d 30 \
  -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:3000/api/v1/feed
```

记录：QPS、P95/P99、错误率、CPU/内存、MySQL 连接数、慢查询。

写 `docs/load-report.md`：场景、数据量、并发、结果、瓶颈判断、本轮只做的一个优化。

### 2. 回滚

```bash
git revert <bad-commit> --no-edit
docker compose up --build -d
curl -i http://127.0.0.1:3000/health
```

镜像部署用 `helm rollback` 或切回上一版 tag。验收：5 分钟内回到上一版，主要接口正常。

### 3. ADR

`docs/adr/001-auth.md`、`002-outbox.md`、`003-feed.md`：背景、决策、代价。面试讲“为什么不是另一个”。

**验收**：有压测报告、回滚步骤、3 篇 ADR；能说清瓶颈在 DB 还是应用。

**产出**：commit `perf: add load report and rollback runbook`。

下一步：[后端 19–21](/blog/posts/node-roadmap-22-community-graduation/)，做 K8s、搜索、AI 与毕业验收。
