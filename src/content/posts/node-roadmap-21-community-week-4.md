---
title: '后端 16–18：可观测、容器化与上线'
published: 2026-11-10T10:50:00+08:00
updated: 2026-11-18T09:00:00+08:00
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
| `docker-compose.yml` | 本地依赖编排 | 加 admin/web/nginx，按 profile 拆分 |
| `nginx.conf` | 入口、SSE 超时、安全头 | Ingress、网关、灰度 |
| `metrics.ts` | 指标是排障入口 | 加队列、outbox、DB 连接池 |
| `server.ts` | 关闭顺序决定会不会丢请求 | 接 K8s preStop、优雅下线 |
| `load-report.md` | 容量有数字，不靠感觉 | 定期基线、容量规划 |
| `docs/adr/*` | 记录取舍和代价 | 每次架构变更追加 |

**怎么判断**

先问“上线后怎么知道它坏了、怎么退回去”。答不上来，就先别加功能。

---

## Day 16：Docker 多阶段与全栈 Compose

**今天目标**：`docker compose up --build -d` 起 mysql/redis/api/admin-api/web/nginx（rabbitmq 作为后续扩展预留）。

### 1. API Dockerfile

`apps/api/Dockerfile`：

```dockerfile
FROM node:22-alpine AS build
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.18.0 --activate
COPY . .
# prisma generate 只需要 schema，不需要真的连库
ENV DATABASE_URL=mysql://root:root@localhost:3306/community
RUN pnpm install --frozen-lockfile
RUN pnpm --filter api exec prisma generate
RUN pnpm --filter api build

FROM node:22-alpine AS runtime
RUN apk add --no-cache libc6-compat
WORKDIR /app/apps/api
ENV NODE_ENV=production
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/apps/api/package.json ./package.json
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

> 构建上下文是仓库根目录，不是 `apps/api`。`admin-api` 同理，只换构建命令和启动入口。
>
> 注意最后一行：镜像**不在启动时跑迁移**。多副本同时启动会并发执行 `migrate deploy`；本地 Compose 用 `command` 显式迁移一次，K8s 用独立的迁移 Job（Day 19）。

### 2. 全栈 Compose

`infra/docker/docker-compose.yml` 改完后的完整文件（在 Day 1 只有 mysql/redis 的版本上增加 api/admin-api/web/nginx 和 `mysql-init`；不要保留旧的同名 service 块，直接整文件替换）：

```yaml
services:
  mysql:
    image: mysql:8.0
    container_name: community-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: community
    # 宿主机用 3307，避开本机已装的 MySQL 3306
    ports: ["3307:3306"]
    volumes:
      - mysql-data:/var/lib/mysql
      - ./mysql-init:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-uroot", "-proot"]
      interval: 10s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    container_name: community-redis
    ports: ["6380:6379"]
    volumes: ["redis-data:/data"]

  rabbitmq:
    image: rabbitmq:3-management
    container_name: community-rabbitmq
    ports: ["5672:5672", "15672:15672"]

  api:
    build:
      context: ../..
      dockerfile: apps/api/Dockerfile
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: mysql://root:root@mysql:3306/community
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET:-01234567890123456789012345678901}
      WEB_ORIGIN: http://localhost:8080
      INTERNAL_API_TOKEN: ${INTERNAL_API_TOKEN:-dev-internal-token-change-me}
    # 迁移只在这里跑一次，镜像本身的 CMD 只启动服务
    command: ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
    ports: ["3000:3000"]
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started

  admin-api:
    build:
      context: ../..
      dockerfile: apps/admin-api/Dockerfile
    environment:
      NODE_ENV: production
      ADMIN_DATABASE_URL: mysql://root:root@mysql:3306/community_admin
      ADMIN_PORT: 3002
      API_INTERNAL_URL: http://api:3000
      INTERNAL_API_TOKEN: ${INTERNAL_API_TOKEN:-dev-internal-token-change-me}
      JWT_SECRET: ${JWT_SECRET:-01234567890123456789012345678901}
      WEB_ORIGIN: http://localhost:8080
    command: ["sh", "-c", "npx prisma migrate deploy --schema prisma/schema.prisma && node dist/main.js"]
    ports: ["3003:3002"]
    depends_on:
      mysql:
        condition: service_healthy
      api:
        condition: service_started

  web:
    build:
      context: ../..
      dockerfile: apps/web/Dockerfile
    environment:
      API_BASE_INTERNAL: http://api:3000
      ADMIN_API_URL: http://admin-api:3002
      NEXT_PUBLIC_AI_ENABLED: "true"
    ports: ["3002:3001"]
    depends_on:
      api:
        condition: service_started
      admin-api:
        condition: service_started

  nginx:
    image: nginx:1.27-alpine
    container_name: community-nginx
    ports: ["8080:80"]
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - web
      - api
      - admin-api

volumes:
  mysql-data:
  redis-data:
```

`mysql-init/01-databases.sql` 负责创建管理端库（主库由 `MYSQL_DATABASE` 创建）：

```sql
CREATE DATABASE IF NOT EXISTS community_admin
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

根目录 `.dockerignore` 至少要包含 `node_modules`、`dist`、`.next`、`.env`、`.git`，否则构建上下文会把本机产物和密钥一起送进 Docker daemon。

**验收**：`docker compose -f infra/docker/docker-compose.yml up --build -d` 后，`http://localhost:3000/health`、`http://localhost:3000/docs`、`http://localhost:8080`（Nginx → web）和 `http://localhost:8080/api/v1/posts` 均可用；镜像里没有 `.env`。

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

    # SSE 必须关闭缓冲，且要放在 /api/ 之前（更长前缀优先）
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

    location /api/ {
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /admin-api/ {
        proxy_pass http://admin-api:3002/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        proxy_pass http://web:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

SSE 的 `proxy_buffering off` 和 `X-Accel-Buffering: no` 缺一不可。注意 AI 接口 `/api/v1/ai/chat` 没有单独 location，它靠后端返回的 `X-Accel-Buffering: no` 关闭缓冲；如果换成不支持该响应头的网关，就要显式加一条 `proxy_buffering off`。

### 2. 指标

`apps/api/src/common/metrics.ts`：

```ts
import type { RequestHandler } from 'express';
import { collectDefaultMetrics, Histogram, Registry } from 'prom-client';

export const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry });

export const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  // route 用路由模板而不是原始 URL，避免标签基数爆炸
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [metricsRegistry],
});

export const metricsMiddleware: RequestHandler = (req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path ?? req.path, status: String(res.statusCode) });
  });
  next();
};
```

在 `apps/api/src/app.ts` 里挂载：`app.use(requestId);` 之后加 `app.use(metricsMiddleware);`，并补上 `/ready` 与 `/metrics` 两个端点：

```ts
// 插到 apps/api/src/app.ts 顶部的 import 区
import { prisma } from './common/db.ts';
import { redis } from './common/redis.ts';
import { metricsMiddleware, metricsRegistry } from './common/metrics.ts';

// 插到 app.use(requestId); 之后
app.use(metricsMiddleware);

// 插到路由挂载之前
app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    res.status(200).json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'unavailable' });
  }
});

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', metricsRegistry.contentType);
  res.send(await metricsRegistry.metrics());
});
```

`/health` 只表示进程活着；`/ready` 会真的 ping MySQL 和 Redis，K8s 用它决定是否把流量送进来。

### 3. 优雅关闭

`apps/api/src/server.ts` 改完后的完整文件（在 Day 8 版本上补优雅关闭；`startOutboxWorker()` 的返回值就是停止函数）：

```ts
import { config } from './common/config.ts';
import { prisma } from './common/db.ts';
import { logger } from './common/logger.ts';
import { redis } from './common/redis.ts';
import { notificationWorker } from './jobs/notification.worker.ts';
import { startOutboxWorker } from './jobs/outbox.worker.ts';
import { createApp } from './app.ts';

const app = createApp();
const stopOutbox = startOutboxWorker();
const server = app.listen(config.PORT);

logger.info({ port: config.PORT }, 'API listening');

let shuttingDown = false;

async function shutdown(signal: string) {
  // 重复信号只处理一次，避免 close 回调互相踩
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, 'shutting down');
  const force = setTimeout(() => process.exit(1), 10_000);
  const hardClose = setTimeout(() => server.closeAllConnections(), 5_000);

  // 先停止接收新连接，再等旧请求和 worker 收尾
  server.close(async () => {
    clearTimeout(force);
    clearTimeout(hardClose);
    stopOutbox();
    await notificationWorker.close();
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
```

`server.close()` 只停止接收新连接，不会主动断开 keep-alive；所以 5 秒后调用 `closeAllConnections()` 兜底，10 秒后强制退出。K8s 里再配合 `preStop: sleep 5`，让 Ingress 先把 Pod 从 endpoints 摘掉。

**验收**：`/metrics` 有数据；发慢请求后 `kill -TERM`，进程等请求完成再退出；SSE 首个事件 1 秒内出现。

**产出**：commit `feat: add nginx metrics and graceful shutdown`。

---

## Day 18：压测、回滚、ADR

**今天目标**：知道当前 QPS/P95，能在 5 分钟内回滚。

### 1. 压测

```bash
# 先登录拿 token，避免把 401 的耗时混进来
TOKEN=$(curl -s -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Admin123!ChangeMe"}' | jq -r .accessToken)

pnpm dlx autocannon -c 50 -d 15 \
  -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:3000/api/v1/feed
```

记录：QPS、P95/P99、错误率、CPU/内存、MySQL 连接数、慢查询。

本地基线（Windows、Node 24 + tsx dev、MySQL 8 本地、13 用户/14 帖子）：

| 场景 | 吞吐 | P50 | P97.5 | P99 | 错误率 |
|---|---|---|---|---|---|
| `GET /api/v1/feed`（鉴权） | 1,680 req/s | 28 ms | 42 ms | 51 ms | 0 |
| `GET /api/v1/posts?limit=10` | 1,790 req/s | 29 ms | 49 ms | 56 ms | 0 |

这些数字只用于横向对比，不要当成生产容量。完整方法、瓶颈判断与回滚步骤写进仓库的 `docs/load-report.md`。

### 2. 回滚

```bash
git revert <bad-commit> --no-edit
docker compose up --build -d
curl -i http://127.0.0.1:3000/health
```

镜像部署用 `helm rollback` 或切回上一版 tag。验收：5 分钟内回到上一版，主要接口正常。

### 3. ADR

`docs/adr/001-auth.md`、`002-outbox.md`、`003-feed.md`：背景、决策、代价。面试讲“为什么不是另一个”。

三篇 ADR 的结构一致：先写当时的问题，再写决策和它带来的代价，最后写“为什么不选另一条路”。

- `001-auth`：access token 24h + refresh token 可吊销；浏览器只拿 HttpOnly Cookie；代价是权限变更有最长 24h 延迟，前端解码只用于 UI。
- `002-outbox`：业务写与事件写同事务，worker 用 `updateMany` 原子抢占后投递 BullMQ；代价是最终一致和 outbox 表清理。
- `003-feed`：fan-out on read + `(created_at, id)` 复合游标；代价是大关注量下 JOIN 行数上升，深度分页不可跳页。

**验收**：有压测报告、回滚步骤、3 篇 ADR；能说清瓶颈在 DB 还是应用。

**产出**：commit `perf: add load report and rollback runbook`。

下一步：[后端 19–21](/blog/posts/node-roadmap-22-community-graduation/)，做 K8s、搜索、AI 与毕业验收。
