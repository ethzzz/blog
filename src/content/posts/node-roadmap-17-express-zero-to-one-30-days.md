---
title: '17 · Express 企业级服务 0→1：30 天逐日执行路线（持续更新）'
published: 2026-11-09T18:00:00+08:00
updated: 2026-11-09T18:00:00+08:00
description: '把「社区社群全栈：从 0 到 1」拆成 30 天可执行清单：每天 2 小时、一个 commit、一次验证输出。本文是持续更新的工程手册，Day 1 已补齐从空目录到 /health 的完整代码。'
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

当前完成度：**Day 1 已给出完整代码**。Day 2–24 目前还是任务清单，后续每执行一天，就把当天涉及的文件代码补进对应小节，而不是另开一篇。

---

## 版本记录

| 版本 | 日期 | 修改 |
|---|---|---|
| v0.1 | 2026-11-07 | 初版：范围冻结、30 天逐日清单、周验收与讲解要求 |
| v0.2 | 2026-11-09 | 收录到博客；Day 1 补齐 package.json / tsconfig / docker-compose / app.ts / server.ts 完整代码；新增「代码必须完整」规则 |
| v0.3 | 待更新 | 按天补齐 Day 2–24 的完整代码 |
| v1.0 | 待定 | 完整可运行、可演示、可压测、可部署 |

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

**为什么先冻结范围**：30 天最容易被「顺手加个功能」拖垮。先把闭环跑通，再谈扩展。

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

**具体做什么**
1. `.env` + `.env.example`：`PORT`、`DATABASE_URL`、`REDIS_URL`、`JWT_SECRET`、`WEB_ORIGIN`。
2. `src/common/config.ts`：用 zod 启动即校验环境变量。
3. `src/common/logger.ts`：pino，脱敏 `authorization` / `cookie` / `password`。
4. `src/common/errors.ts`：`AppError(code,status,message,details)`。
5. `src/common/middleware.ts`：
   - `requestId`：生成或透传 `x-request-id`；
   - `asyncHandler`：把 rejected Promise 交给错误中间件；
   - `notFound`：统一 404；
   - `errorHandler`：`AppError` → 业务码；`ZodError` → 400；其他 → 500。
6. 在 `app.ts` 按顺序挂：requestId → json → 路由 → notFound → errorHandler。

**达到什么效果**
- `curl -i /health` 响应头有 `x-request-id`。
- `curl /nope` 返回 `{code:"NOT_FOUND"}`，不是 HTML。
- 加一个临时 `/boom` 抛错：返回 500 JSON，日志里能用 requestId 找到这条。

**产出**：commit `feat: unify config logging errors and trace`。

## Day 3：Prisma、迁移、种子

**今天目标**：数据库表建好，有一个管理员账号和权限数据。

**具体做什么**
1. `pnpm add @prisma/client`；`pnpm add -D prisma`；`pnpm exec prisma init`。
2. `schema.prisma` 建：`User`、`RefreshToken`、`Role`、`Permission`、`UserRole`、`RolePermission`。
3. `pnpm exec prisma migrate dev --name init`。
4. `src/common/db.ts` 导出 PrismaClient 单例。
5. `prisma/seed.ts`：插入 `admin` 角色、`post:review` / `report:handle` / `user:ban` 权限、`admin@test.com` 用户并绑定角色。
6. `package.json` 加 `"prisma": { "seed": "tsx prisma/seed.ts" }`；跑 `prisma db seed`。

**达到什么效果**
- `prisma migrate status` 正常。
- `prisma studio` 能看到 6 张表。
- 查询 `users` 有 admin；`user_roles` 有绑定。

**产出**：commit `feat: add prisma schema and seed`。

## Day 4：注册、登录、刷新、登出

**今天目标**：完整认证闭环，refresh 轮换，旧 refresh 不能重放。

**具体做什么**
1. `pnpm add argon2 jsonwebtoken cookie-parser cors`；补类型包。
2. `token.service.ts`：access JWT 15 分钟；refresh 随机串，sha256 哈希存库。
3. `auth.service.ts`：
   - `register`：email 唯一，argon2 哈希；
   - `login`：校验密码，签发 access + refresh；
   - `refresh`：校验 refresh、撤销旧的、发新的；
   - `logout`：撤销 refresh。
4. `auth.controller.ts`：路由 + zod 校验；refresh 放 httpOnly Cookie。
5. `app.ts` 挂 `cookieParser()`、`cors({ credentials: true })`、auth 路由。

**达到什么效果**
```bash
curl -i -X POST /api/v1/auth/register -d '{"email":"a@test.com","password":"Passw0rd!","nickname":"A"}'
curl -i -c /tmp/c.txt -X POST /api/v1/auth/login -d '{"email":"a@test.com","password":"Passw0rd!"}'
curl -i -b /tmp/c.txt -X POST /api/v1/auth/refresh
```
- 注册 201、登录 200、刷新 200。
- 用旧 refresh 再刷 → 401。
- 登出后再刷 → 401。

**产出**：commit `feat: add auth with refresh rotation`。

## Day 5：RBAC + 用户 + 关注

**今天目标**：未登录 401、无权限 403、重复关注幂等。

**具体做什么**
1. `rbac.ts`：查用户权限集合；`requirePermission(code)` 中间件。
2. `users.routes.ts`：
   - `GET /users/me`、`PATCH /users/me`；
   - `POST /users/:id/follow`、`DELETE /users/:id/follow`。
3. 关注用 `createMany({ skipDuplicates: true })`，返回是否新增。
4. 给一个测试接口挂 `requirePermission('admin:access')`。

**达到什么效果**
- 普通用户访问后台接口 → 403；admin → 200。
- 连续关注两次，`follows` 表只有一行。
- 关注自己 → 400。
- 未登录访问 → 401。

**产出**：commit `feat: add rbac users and follows`。

## Day 6（周末）：测试 + 5 分钟讲解

**今天目标**：把第 1 周的能力用测试和讲解固定下来。

**具体做什么**
1. `pnpm add -D vitest supertest @types/supertest`。
2. 写 5 个测试：注册、登录、未登录 401、无权限 403、重复关注只一行。
3. 录一段 5 分钟讲解：一次登录发生了什么、refresh 为什么轮换、requestId 怎么串日志。

**达到什么效果**
- `pnpm test` 全绿。
- 不看稿能讲 5 分钟，卡住的地方记下来。

**产出**：commit `test: cover auth and follow`；一段录音。

---

## 第 2 周：内容核心

## Day 7：发帖

**今天目标**：登录用户能发帖，帖子默认待审核，作者能看自己的，别人看不到未发布的。

**具体做什么**
1. `posts` 路由：`POST /posts`、`GET /posts`、`GET /posts/:id`、`DELETE /posts/:id`。
2. 发帖校验：title 可选、content 1–20000 字。
3. 新帖 `status = pending`；列表只查 `published`；详情允许作者看自己的。
4. 删除用软删除（`deletedAt` + `status=deleted`），只能删自己的。
5. 加索引：`(authorId, createdAt)`、`(status, createdAt)`。

**达到什么效果**
- 发帖 201，返回 id 和 `pending`。
- 作者能查详情；另一个用户查 → 404。
- 列表里看不到 pending。
- 删除自己的 200；删别人的 404。

**产出**：commit `feat: add posts with moderation status`。

## Day 8：评论

**今天目标**：评论和计数在同一个事务里，不能一个成功一个失败。

**具体做什么**
1. `POST /posts/:postId/comments`：只允许评论 `published` 的帖子。
2. `GET /posts/:postId/comments`：按时间正序，限制 50 条。
3. 事务内：插入评论 + `commentCount + 1`。
4. 支持 `parentId`（回复），但先不做嵌套树。

**达到什么效果**
- 评论成功 201，`posts.commentCount` +1。
- 评论不存在的帖子 → 404。
- 故意让计数更新失败，确认评论也回滚（临时改代码验证一次）。

**产出**：commit `feat: add comments with transactional counter`。

## Day 9：点赞

**今天目标**：并发点赞不重复计数，取消点赞不扣成负数。

**具体做什么**
1. `POST /posts/:postId/like`、`DELETE /posts/:postId/like`。
2. `likes` 加唯一约束 `(userId, targetType, targetId)`。
3. 点赞事务：`createMany({ skipDuplicates: true })`，只有新增时才 `likeCount + 1`。
4. 取消点赞：`deleteMany`，只有删掉一条时才 `likeCount - 1`。

**达到什么效果**
- 同一用户点两次，`likeCount` 只加 1。
- 20 并发点赞脚本跑完，`likeCount = 1`。
- 取消两次，`likeCount = 0`，不会变负。

**产出**：commit `feat: add idempotent likes`。

## Day 10：关注流

**今天目标**：只看到关注的人发布的帖子，游标翻页不重不漏。

**具体做什么**
1. `GET /feed?cursor=<createdAt>_<id>&limit=20`。
2. 原生 SQL：`posts JOIN follows`，`followerId = 当前用户`，`status = published`。
3. 游标条件：`(createdAt < ?) OR (createdAt = ? AND id < ?)`。
4. `Promise.all` 里先不做缓存，先把正确性跑通。

**达到什么效果**
- 关注 A 后，A 的 published 帖子出现在 feed。
- 取 limit=2，连续翻页，id 不重复。
- 没有关注任何人 → 空列表，不是 500。

**产出**：commit `feat: add cursor-based following feed`。

## Day 11：测试 + 基线压测

**今天目标**：核心链路有集成测试，知道自己当前的 QPS/P95。

**具体做什么**
1. 补测试：发帖、评论、点赞幂等、feed 分页。
2. `npx autocannon -c 50 -d 10 http://127.0.0.1:3000/api/v1/feed`。
3. 把结果写进 `docs/load-baseline.md`：QPS、P95、错误率、瓶颈猜测。

**达到什么效果**
- `pnpm test` 全绿。
- 有一份基线报告，能说出「当前瓶颈在 DB 还是应用」。

**产出**：commit `test: cover content core and record load baseline`。

## Day 12（周末）：故意弄坏 + 10 分钟演示

**今天目标**：验证幂等和事务在并发下真的成立。

**具体做什么**
1. 用 `xargs -P20` 或 k6 并发点赞同一帖子。
2. 查数据库计数，确认只加一次。
3. 录 10 分钟：发帖 → 审核 → 评论 → 点赞 → feed。

**达到什么效果**
- 并发脚本输出和数据库计数对得上。
- 能讲清「为什么唯一约束比先查再插可靠」。

**产出**：commit（如有修复）+ 一段录音。

---

## 第 3 周：异步与治理

## Day 13：Outbox

**今天目标**：业务成功，事件一定在；业务回滚，事件不在。

**具体做什么**
1. 建 `outbox_events` 表（已在 schema 里）。
2. 发帖、评论、点赞的事务里，同时写一条 outbox 事件。
3. 事件字段：`type`、`payload`、`status`、`createdAt`。
4. 故意让帖子插入失败，确认 outbox 也没有。

**达到什么效果**
- 发帖成功后 `outbox_events` 有一条 pending。
- 事务失败时，帖子和事件都没有。
- 能解释「为什么不用请求里直接发通知」。

**产出**：commit `feat: add transactional outbox`。

## Day 14：BullMQ + 通知消费者

**今天目标**：点赞/评论/关注能生成通知，自己操作自己不通知。

**具体做什么**
1. `pnpm add bullmq ioredis`。
2. `queue.ts`：创建 `notifications` 队列和连接。
3. `outbox.worker.ts`：轮询 pending，入队，标记 processing；用 `FOR UPDATE SKIP LOCKED`。
4. `notification.worker.ts`：消费事件，写 `notifications` 表；自己操作自己直接 return。
5. 在 `server.ts` 启动两个 worker。

**达到什么效果**
- A 点赞 B 的帖子 → B 的 `notifications` 多一条。
- A 点赞自己的帖子 → 没有通知。
- 同一个事件重投两次 → 只有一条通知。

**产出**：commit `feat: add outbox worker and notifications`。

## Day 15：SSE 通知

**今天目标**：B 在线时，点赞事件 1 秒内推到 B 的页面。

**具体做什么**
1. `GET /api/v1/notifications/stream`：鉴权后建立 SSE。
2. 响应头：`text/event-stream`、`no-cache, no-transform`、`X-Accel-Buffering: no`。
3. 15 秒心跳 `: ping\n\n`。
4. 订阅 Redis channel `notify:<userId>`；消费者 publish。
5. `req.on('close')` 清理订阅和定时器。
6. `GET /notifications`、`POST /notifications/read`。

**达到什么效果**
```bash
curl -N -H "Authorization: Bearer <token>" /api/v1/notifications/stream
```
- 另一端点赞后，curl 终端出现 `event: notification`。
- 断线后重连，能拉到未读列表。
- 断开客户端不会让服务报错。

**产出**：commit `feat: add sse notifications`。

## Day 16：审核与后台

**今天目标**：pending 帖子只有审核通过才进入 feed，所有操作有审计。

**具体做什么**
1. 状态机：`pending → published / rejected`。
2. `GET /admin/posts?status=pending`。
3. `POST /admin/posts/:id/approve`、`POST /admin/posts/:id/reject`。
4. 每次审核写 `moderation_records`。
5. 加 `requirePermission('post:review')`。

**达到什么效果**
- pending 帖子不在 feed；approve 后出现；reject 后不出现。
- 普通用户访问后台 → 403。
- `moderation_records` 有操作人、动作、时间。

**产出**：commit `feat: add moderation and admin review`。

## Day 17：故障注入

**今天目标**：Redis、队列、DB 任一挂掉，服务不崩，错误可解释。

**具体做什么**
1. `docker stop redis`，访问通知/限流接口，观察错误。
2. `docker stop mysql`，访问 feed，观察错误。
3. 停掉 worker，制造一批 pending 事件，再启动，确认能追上。
4. 给关键下游加超时/降级；至少让错误变成 503/504，不是进程崩溃。

**达到什么效果**
- 服务进程还在，接口返回结构化错误。
- 恢复依赖后，事件能继续处理。
- 能说清「哪些功能降级、哪些还能用」。

**产出**：commit `fix: add timeout and degradation for dependencies`。

## Day 18（周末）：10 分钟演示

**今天目标**：把异步链路讲清楚。

**具体做什么**
1. 录 10 分钟：点赞 → outbox → 队列 → 通知 → SSE。
2. 讲清：为什么用 Outbox、重复消费怎么办、断线怎么恢复。

**达到什么效果**
- 不看稿能讲 10 分钟。
- 能回答「消息丢了怎么办」「重复了怎么办」。

**产出**：一段录音 + 修复 commit（如有）。

---

## 第 4 周：上线

## Day 19：Docker 多阶段构建

**今天目标**：一条命令起 API + MySQL + Redis。

**具体做什么**
1. 写 `Dockerfile`：deps → build → runtime 三阶段。
2. `.dockerignore`：node_modules、dist、.env、.git。
3. `docker-compose.yml` 加 `api` 服务，依赖 mysql/redis，注入环境变量。
4. 启动后跑迁移：`prisma migrate deploy`。

**达到什么效果**
- `docker compose up --build -d` 后 `/health` 200。
- 镜像里没有源码和 `.env`。
- 容器重启后数据还在（volume）。

**产出**：commit `build: add multi-stage dockerfile and compose`。

## Day 20：Nginx + SSE

**今天目标**：通过 Nginx 访问 API，SSE 不被缓冲。

**具体做什么**
1. Nginx `location /api/` 反代到 API。
2. SSE 单独 location：`proxy_buffering off`、`X-Accel-Buffering no`、长超时。
3. 配 `client_max_body_size`、安全头。
4. 用 curl 经 Nginx 测普通接口和 SSE。

**达到什么效果**
- 普通接口 200。
- SSE 首个事件在 1 秒内出现，不是攒一批才吐。
- Nginx 日志能看到请求。

**产出**：commit `build: add nginx config for api and sse`。

## Day 21：CI

**今天目标**：提交即跑 lint/类型/测试/构建，失败阻断。

**具体做什么**
1. GitHub Actions：install → lint → typecheck → test → build。
2. 缓存 pnpm store。
3. 故意提交一个类型错误，确认 CI 红。
4. 修掉，确认绿。

**达到什么效果**
- PR 上有 CI 结果。
- 类型错误/测试失败会阻断合并。
- 构建产物可重复。

**产出**：commit `ci: add lint typecheck test and build`。

## Day 22：日志、指标、优雅关闭

**今天目标**：线上能看、能查、能安全重启。

**具体做什么**
1. `prom-client`：`/metrics`、HTTP 耗时直方图。
2. pino 日志带 requestId；错误日志带 stack。
3. SIGTERM：`server.close()` → 等在途请求 → 释放 Prisma/Redis → 退出；10 秒兜底。
4. 发一个慢请求，然后 `kill -TERM`，观察是否等完再退出。

**达到什么效果**
- `/metrics` 有请求数和耗时。
- 慢请求不会在重启时被直接掐断。
- 日志能按 requestId 串起来。

**产出**：commit `feat: add metrics and graceful shutdown`。

## Day 23：压测与回滚演练

**今天目标**：知道服务能扛多少，以及发坏了怎么退。

**具体做什么**
1. `autocannon -c 100 -d 30` 打 feed 和点赞。
2. 记录 QPS、P95、错误率、CPU/内存、DB 连接数。
3. 找瓶颈：加索引、缓存、连接池，选一个改。
4. 回滚演练：部署一个有问题的版本 → 回退上一版 → 验证 `/health` 和核心接口。

**达到什么效果**
- 有一份压测报告，能说清瓶颈在哪。
- 能在 5 分钟内回滚。
- 回滚后核心链路正常。

**产出**：commit `perf: ...` + `docs/load-report.md` + 回滚步骤。

## Day 24（周末）：README + 架构图 + 10 分钟讲稿

**今天目标**：把 4 周变成可展示的作品。

**具体做什么**
1. README：如何启动、如何测试、如何部署、目录结构。
2. 架构图：请求 → BFF → DB/Redis/队列。
3. 3 篇 ADR：认证、Outbox、信息流。
4. 10 分钟讲稿：痛点 → 方案 → 取舍 → 结果 → 如果重来。

**达到什么效果**
- 别人照 README 能跑起来。
- 你能对着架构图讲完整链路。
- 面试时每个决策都能说「为什么不是另一个」。

**产出**：commit `docs: add readme architecture and adr`。

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
