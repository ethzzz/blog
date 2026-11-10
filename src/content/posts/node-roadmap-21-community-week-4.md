---
title: '后端 P2a：可观测、容器化与上线'
published: 2026-11-10T10:50:00+08:00
updated: 2026-11-10T10:50:00+08:00
description: '后端第四阶段：多阶段 Docker、Nginx/SSE、Prometheus 指标、优雅关闭、压测与回滚，把服务真正跑上线。'
tags: [社区全栈, 后端, Docker, Nginx]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 后端 P2a。上一篇：[后端 P1](/blog/posts/node-roadmap-20-community-week-3/)；下一篇：[后端 P2b](/blog/posts/node-roadmap-22-community-graduation/)；前端对应篇：[前端 P2a](/blog/posts/community-fullstack-fe-04-p2a-quality/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

P1 之后功能已经完整。P2a 的目标是：**一条命令起全栈、Nginx 不缓冲 SSE、有指标、能优雅重启、有压测和回滚**。

---

## 1. 目标与范围

- api / admin-api / web 多阶段 Dockerfile。
- Nginx 反代 + SSE 专用 location。
- prom-client 指标 + `/metrics`。
- SIGTERM 优雅关闭。
- k6/autocannon 压测；回滚演练。

---

## 2. Docker 多阶段构建

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
RUN pnpm exec prisma generate && pnpm -r build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
USER node
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
```

`.dockerignore` 必须包含 `node_modules`、`dist`、`.env`、`.git`、`tests`。迁移也可放到 CI/Helm Job，容器只跑应用。

---

## 3. Nginx + SSE

```nginx
location /api/ {
    proxy_pass http://api:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
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

SSE 的 `proxy_buffering off` 和 `X-Accel-Buffering: no` 缺一不可，否则事件会攒一批才吐。

---

## 4. 指标

```ts
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path ?? req.path, status: String(res.statusCode) });
  });
  next();
});
```

再加 outbox 积压、BullMQ 队列深度、DB 连接池、缓存命中率。Grafana 至少两张面板：API 延迟/错误率、队列/outbox。

---

## 5. 优雅关闭

```ts
const server = app.listen(config.PORT);

async function shutdown(signal: string) {
  logger.info({ signal }, 'shutting down');
  const force = setTimeout(() => process.exit(1), 10_000);
  const closeConnections = setTimeout(() => server.closeAllConnections(), 5_000);

  server.close(async () => {
    clearTimeout(force);
    clearTimeout(closeConnections);
    await stopWorkers();
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
```

SSE 长连接可能阻止 `server.close`，5 秒后 `closeAllConnections()` 兜底。

---

## 6. 压测与回滚

```bash
npx autocannon -c 100 -d 30 \
  -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:3000/api/v1/feed
```

记录 QPS、P95/P99、错误率、CPU/内存、MySQL 连接数、慢查询。写一份 `docs/load-report.md`。

回滚：

```bash
git revert <bad-commit> --no-edit
docker compose up --build -d
curl -i http://127.0.0.1:3000/health
```

镜像部署则用 `helm rollback` 或切换 `community-api:v1` tag。目标：5 分钟内回滚并验证核心链路。

---

## 7. 验收清单

- [ ] `docker compose up --build -d` 后 web/api/admin-api 都可用
- [ ] 镜像里没有源码和 `.env`
- [ ] SSE 首个事件 1 秒内出现，不是攒批
- [ ] `/metrics` 有请求数/耗时
- [ ] SIGTERM 后等完在途请求再退出
- [ ] 有压测报告和 5 分钟回滚步骤

---

## 8. 常见坑

- **SSE 被缓冲**：Nginx 配置缺失。
- **重启掐断慢请求**：`server.close()` 后不能立刻 `process.exit`。
- **镜像带 `.env`**：`.dockerignore` 漏了。
- **迁移放在应用启动**：多副本会并发迁移，改用 Job。
- **压测空表**：先造数据，否则 QPS 没参考价值。

下一步：[后端 P2b](/blog/posts/node-roadmap-22-community-graduation/)，做 K8s、搜索与毕业验收。
