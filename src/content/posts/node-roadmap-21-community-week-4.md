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

11–15 之后功能完整。16–18 把服务跑上线：一条命令起全栈、Nginx 不缓冲 SSE、有指标、能优雅重启、有压测和回滚。

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
RUN pnpm --filter api exec prisma generate && pnpm --filter api build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
USER node
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
```

> 构建上下文是仓库根目录，不是 `apps/api`。`admin-api` 同理，只换构建命令和启动入口。

### 2. 全栈 Compose

`infra/docker/docker-compose.yml` 增加：

```yaml
services:
  mysql: { image: mysql:8.0, ports: ["3306:3306"], environment: { MYSQL_ROOT_PASSWORD: root, MYSQL_DATABASE: community } }
  redis: { image: redis:7-alpine, ports: ["6379:6379"] }
  rabbitmq:
    image: rabbitmq:3-management
    ports: ["5672:5672", "15672:15672"]

  api:
    build: { context: ../.., dockerfile: apps/api/Dockerfile }
    environment:
      DATABASE_URL: mysql://root:root@mysql:3306/community
      REDIS_URL: redis://redis:6379
      RABBITMQ_URL: amqp://rabbitmq:5672
    ports: ["3000:3000"]
    depends_on: [mysql, redis, rabbitmq]

  admin-api:
    build: { context: ../.., dockerfile: apps/admin-api/Dockerfile }
    environment:
      ADMIN_DATABASE_URL: mysql://root:root@mysql:3306/community_admin
      API_INTERNAL_URL: http://api:3000
      RABBITMQ_URL: amqp://rabbitmq:5672
    ports: ["3001:3001"]
    depends_on: [api, rabbitmq]

  web:
    build: { context: ../.., dockerfile: apps/web/Dockerfile }
    environment:
      NEXT_PUBLIC_API_BASE: http://localhost:3000
    ports: ["3002:3000"]
    depends_on: [api, admin-api]
```

`.dockerignore` 必须包含 `node_modules`、`dist`、`.next`、`.env`、`.git`、`tests`。

**验收**：`docker compose up --build -d` 后 `/health`、`/docs`、web 首页可用；镜像里没有源码和 `.env`。

**产出**：commit `build: add multi-stage docker and full stack compose`。

---

## Day 17：Nginx、SSE、指标、优雅关闭

**今天目标**：Nginx 反代正常，SSE 不缓冲，指标可查，SIGTERM 不掐断慢请求。

### 1. Nginx

```nginx
location /api/ {
    proxy_pass http://api:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

location /admin-api/ {
    proxy_pass http://admin-api:3001/;
    proxy_http_version 1.1;
}

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
```

SSE 的 `proxy_buffering off` 和 `X-Accel-Buffering: no` 缺一不可。

### 2. 指标

`apps/api/src/common/metrics.ts`：

```ts
import { Histogram, Registry, collectDefaultMetrics } from 'prom-client';

export const register = new Registry();
collectDefaultMetrics({ register });

export const httpDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
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

`app.use(metricsMiddleware)`；`/metrics` 输出 `await register.metrics()`。

### 3. 优雅关闭

```ts
const server = app.listen(config.PORT);

async function shutdown(signal: string) {
  logger.info({ signal }, 'shutting down');
  const force = setTimeout(() => process.exit(1), 10_000);
  const hardClose = setTimeout(() => server.closeAllConnections(), 5_000);

  server.close(async () => {
    clearTimeout(force);
    clearTimeout(hardClose);
    await stopWorkers();
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

镜像部署用 `helm rollback` 或切回上一版 tag。验收：5 分钟内回到上一版，核心接口正常。

### 3. ADR

`docs/adr/001-auth.md`、`002-outbox.md`、`003-feed.md`：背景、决策、代价。面试讲“为什么不是另一个”。

**验收**：有压测报告、回滚步骤、3 篇 ADR；能说清瓶颈在 DB 还是应用。

**产出**：commit `perf: add load report and rollback runbook`。

下一步：[后端 19–21](/blog/posts/node-roadmap-22-community-graduation/)，做 K8s、搜索、AI 与毕业验收。
