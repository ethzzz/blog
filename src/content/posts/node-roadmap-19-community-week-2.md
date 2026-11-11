---
title: '后端 06–10：完整社区主链路与工程化'
published: 2026-11-10T10:30:00+08:00
updated: 2026-11-10T10:30:00+08:00
description: 'Day 6–10：评论事务、点赞幂等、Outbox + BullMQ 通知、SSE、OpenAPI、Vitest/Supertest 和 CI。'
tags: [社区全栈, 后端, Redis, BullMQ]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 后端 06–10。上一篇：[后端 01–05](/blog/posts/node-roadmap-18-community-week-1/)；下一篇：[后端 11–15](/blog/posts/node-roadmap-20-community-week-3/)；前端对应篇：[前端 04–06](/blog/posts/community-fullstack-fe-02-p0b-content-loop/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

Day 1–5 的服务已经能登录、发帖、看 feed。接下来把评论、点赞、通知和 SSE 补上，再把 OpenAPI、测试和 CI 接进仓库。功能不复杂，麻烦的是事务和幂等，下面按天拆开做。

**这一阶段在练什么**

用事务、唯一约束、幂等和异步，解决“数据不能错”的问题。先保证正确，再谈性能。

### 文件地图

| 文件 | 为什么单独存在 | 以后可能怎么改 |
|---|---|---|
| `comments.service.ts` | 评论和计数必须在同一个事务边界 | 嵌套回复、@、审核 |
| `likes.service.ts` | 点赞幂等靠唯一约束，不靠先查再插 | Redis 计数、分片 |
| `common/outbox.ts` | 业务和事件写入同一事务 | 换 Kafka、加 relay |
| `jobs/*` | 异步副作用集中管理 | 重试、退避、DLQ、积压监控 |
| `notifications.*` | SSE 连接和通知读写独立 | WebSocket、推送、多端 |
| `common/openapi.ts` | 契约是前后端共同边界 | 生成 client、契约测试 |
| `tests/*` | 把幂等和事务固定成回归 | 契约、E2E、压测 |

**怎么判断**

先问失败会怎样：能不能重试、会不会重复、要不要补偿。答案决定用事务、唯一键还是队列。

---

## Day 6：评论与事务计数

**今天目标**：评论成功时计数 +1；事务失败时评论和计数一起回滚。

### 1. 写 comments.service.ts

路径：`apps/api/src/modules/comments/comments.service.ts`：

```ts
import { prisma } from '../../common/db.js';
import { AppError } from '../../common/errors.js';

export async function createComment(
  postId: bigint,
  authorId: bigint,
  input: { content: string; parentId?: string },
) {
  const post = await prisma.post.findFirst({
    where: { id: postId, status: 'published' },
    select: { id: true, authorId: true },
  });
  if (!post) throw new AppError('POST_NOT_FOUND', 404, 'Post not found');

  let parentId: bigint | undefined;
  if (input.parentId) {
    parentId = BigInt(input.parentId);
    const parent = await prisma.comment.findFirst({
      where: { id: parentId, postId, status: 'published' },
      select: { id: true },
    });
    if (!parent) throw new AppError('PARENT_COMMENT_NOT_FOUND', 404, 'Parent comment not found');
  }

  const comment = await prisma.$transaction(async (tx) => {
    const created = await tx.comment.create({
      data: { postId, authorId, parentId, content: input.content },
      include: { author: { select: { id: true, nickname: true, avatarUrl: true } } },
    });
    await tx.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });
    return created;
  });

  return {
    ...comment,
    id: comment.id.toString(),
    postId: comment.postId.toString(),
    authorId: comment.authorId.toString(),
    parentId: comment.parentId?.toString() ?? null,
    author: { ...comment.author, id: comment.author.id.toString() },
  };
}

export async function listComments(postId: bigint, limit = 50) {
  const rows = await prisma.comment.findMany({
    where: { postId, status: 'published' },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    take: limit,
    include: { author: { select: { id: true, nickname: true, avatarUrl: true } } },
  });

  return rows.map((comment) => ({
    ...comment,
    id: comment.id.toString(),
    postId: comment.postId.toString(),
    authorId: comment.authorId.toString(),
    parentId: comment.parentId?.toString() ?? null,
    author: { ...comment.author, id: comment.author.id.toString() },
  }));
}
```

### 2. 写 comments.routes.ts

路径：`apps/api/src/modules/comments/comments.routes.ts`：

```ts
import { Router } from 'express';
import { requireAuth } from '../../common/auth.js';
import { AppError } from '../../common/errors.js';
import { asyncHandler } from '../../common/middleware.js';
import { createComment, listComments } from './comments.service.js';

export const commentsRouter = Router({ mergeParams: true });

function postId(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) throw new AppError('INVALID_POST_ID', 400, 'Invalid post id');
  return BigInt(value);
}

commentsRouter.get('/', asyncHandler(async (req, res) => {
  res.json({ items: await listComments(postId(req.params.postId)) });
}));

commentsRouter.post('/', requireAuth, asyncHandler(async (req, res) => {
  res.status(201).json(
    await createComment(postId(req.params.postId), BigInt(req.user!.sub), req.body),
  );
}));
```

`app.ts` 挂载：

```ts
import { commentsRouter } from './modules/comments/comments.routes.js';
app.use('/api/v1/posts/:postId/comments', commentsRouter);
```

### 3. 验收

```bash
curl -i -X POST http://127.0.0.1:3000/api/v1/posts/<POST_ID>/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"第一条评论"}'
```

- 评论 201，帖子 `commentCount +1`
- 评论不存在的帖子 → 404
- 临时在事务里 `throw`，确认评论和计数一起回滚

**产出**：commit `feat: add comments with transactional counter`。

---

## Day 7：点赞幂等

**今天目标**：同一用户重复点赞只加 1；取消两次不会变负。

### 1. 写 likes.service.ts

路径：`apps/api/src/modules/likes/likes.service.ts`：

```ts
import { prisma } from '../../common/db.js';
import { AppError } from '../../common/errors.js';

export async function likePost(postId: bigint, userId: bigint) {
  return prisma.$transaction(async (tx) => {
    const post = await tx.post.findFirst({
      where: { id: postId, status: 'published' },
      select: { id: true, authorId: true },
    });
    if (!post) throw new AppError('POST_NOT_FOUND', 404, 'Post not found');

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

    return { liked: true, changed: created.count === 1, authorId: post.authorId };
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

### 2. 写 likes.routes.ts

路径：`apps/api/src/modules/likes/likes.routes.ts`：

```ts
import { Router } from 'express';
import { requireAuth } from '../../common/auth.js';
import { asyncHandler } from '../../common/middleware.js';
import { likePost, unlikePost } from './likes.service.js';

export const likesRouter = Router({ mergeParams: true });

likesRouter.post('/', requireAuth, asyncHandler(async (req, res) => {
  res.json(await likePost(BigInt(req.params.postId ?? ''), BigInt(req.user!.sub)));
}));

likesRouter.delete('/', requireAuth, asyncHandler(async (req, res) => {
  res.json(await unlikePost(BigInt(req.params.postId ?? ''), BigInt(req.user!.sub)));
}));
```

`app.ts` 挂载：

```ts
import { likesRouter } from './modules/likes/likes.routes.js';
app.use('/api/v1/posts/:postId/like', likesRouter);
```

### 3. 验收

```bash
curl -s -X POST -H "Authorization: Bearer $TOKEN" http://127.0.0.1:3000/api/v1/posts/<POST_ID>/like
curl -s -X POST -H "Authorization: Bearer $TOKEN" http://127.0.0.1:3000/api/v1/posts/<POST_ID>/like
```

第一次 `changed: true`，第二次 `changed: false`；`likeCount = 1`。取消两次后 `likeCount = 0`，不会为负。

**产出**：commit `feat: add idempotent likes`。

---

## Day 8：Outbox + BullMQ 通知

**今天目标**：评论/点赞/关注产生通知；自己操作自己不通知；重复事件不重复通知。

### 1. 扩展 Prisma

在 `apps/api/prisma/schema.prisma` 增加：

```prisma
enum NotificationType {
  like
  comment
  follow
  system
}

enum OutboxStatus {
  pending
  processing
  done
  failed
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

model Notification {
  id         BigInt           @id @default(autoincrement())
  eventId    String?          @unique @map("event_id") @db.VarChar(64)
  userId     BigInt           @map("user_id")
  type       NotificationType
  actorId    BigInt?          @map("actor_id")
  targetType String?          @map("target_type") @db.VarChar(32)
  targetId   BigInt?          @map("target_id")
  payload    Json?
  readAt     DateTime?        @map("read_at")
  createdAt  DateTime         @default(now()) @map("created_at")
  user       User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId, createdAt])
  @@map("notifications")
}
```

User 模型补：

```prisma
notifications Notification[]
```

执行：

```bash
pnpm --filter api exec prisma migrate dev --name add_outbox_notifications
pnpm --filter api add bullmq ioredis
```

### 2. 写 Redis 与队列

路径：`apps/api/src/common/redis.ts`：

```ts
import Redis from 'ioredis';
import { config } from './config.js';

export const redis = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  connectTimeout: 3000,
});
```

路径：`apps/api/src/jobs/queue.ts`：

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

### 3. 写 Outbox 工具与 worker

路径：`apps/api/src/common/outbox.ts`：

```ts
import type { Prisma } from '@prisma/client';

export async function enqueueOutbox(
  tx: Prisma.TransactionClient,
  type: string,
  payload: Record<string, unknown>,
) {
  await tx.outboxEvent.create({
    data: { type, payload: payload as unknown as Prisma.InputJsonValue },
  });
}
```

路径：`apps/api/src/jobs/outbox.worker.ts`：

```ts
import { prisma } from '../common/db.js';
import { logger } from '../common/logger.js';
import { notificationQueue } from './queue.js';

let ticking = false;

async function tick() {
  if (ticking) return;
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
      if (claimed.count === 0) continue;

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
          data: { status: 'failed', retryCount: { increment: 1 } },
        });
        logger.error({ err: error, eventId: event.id.toString() }, 'outbox dispatch failed');
      }
    }
  } finally {
    ticking = false;
  }
}

export function startOutboxWorker() {
  const timer = setInterval(() => void tick(), 1000);
  void tick();
  return () => clearInterval(timer);
}
```

### 4. 写通知 worker

路径：`apps/api/src/jobs/notification.worker.ts`：

```ts
import { Worker } from 'bullmq';
import type { Prisma } from '@prisma/client';
import { prisma } from '../common/db.js';
import { logger } from '../common/logger.js';
import { redis } from '../common/redis.js';

type Payload = {
  actorId?: string;
  recipientId?: string;
  targetType?: string;
  targetId?: string;
  postId?: string;
  commentId?: string;
  followerId?: string;
  followeeId?: string;
};

function typeOf(name: string) {
  if (name === 'like.created') return 'like';
  if (name === 'comment.created') return 'comment';
  if (name === 'follow.created') return 'follow';
  return 'system';
}

export const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    if (!job.id) return;
    const payload = job.data as Payload;
    const actorId = payload.actorId ?? payload.followerId;
    const recipientId = payload.recipientId ?? payload.followeeId;
    if (!actorId || !recipientId || actorId === recipientId) return;

    const notification = await prisma.notification.upsert({
      where: { eventId: job.id },
      update: {},
      create: {
        eventId: job.id,
        userId: BigInt(recipientId),
        type: typeOf(job.name),
        actorId: BigInt(actorId),
        targetType: payload.targetType ?? (payload.postId ? 'post' : payload.commentId ? 'comment' : null),
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
  { connection: redis, concurrency: 10 },
);

notificationWorker.on('failed', (job, error) => {
  logger.error({ err: error, jobId: job?.id }, 'notification job failed');
});
```

`server.ts` 启动：

```ts
import { startOutboxWorker } from './jobs/outbox.worker.js';
import './jobs/notification.worker.js';

startOutboxWorker();
```

### 5. 业务事务写 Outbox

评论成功分支：

```ts
await enqueueOutbox(tx, 'comment.created', {
  commentId: created.id.toString(),
  postId: postId.toString(),
  actorId: authorId.toString(),
  recipientId: post.authorId.toString(),
});
```

点赞成功分支：

```ts
await enqueueOutbox(tx, 'like.created', {
  targetType: 'post',
  targetId: postId.toString(),
  actorId: userId.toString(),
  recipientId: post.authorId.toString(),
});
```

关注成功分支：

```ts
await enqueueOutbox(tx, 'follow.created', {
  followerId: followerId.toString(),
  followeeId: followeeId.toString(),
  actorId: followerId.toString(),
  recipientId: followeeId.toString(),
});
```

### 6. 验收

A 点赞 B 的帖子，1–2 秒后查通知表：

```bash
docker exec -i community-mysql mysql -uroot -proot community \
  -e "SELECT user_id, type, actor_id, event_id FROM notifications ORDER BY id DESC LIMIT 5;"
```

- B 收到 like 通知
- A 点赞自己的帖子不产生通知
- 同一条 outbox 重投不重复插入

**产出**：commit `feat: add outbox worker and notifications`。

---

## Day 9：SSE 实时通知

**今天目标**：B 在线时，点赞通知 1 秒内到达；断线可重连。

### 1. 通知列表与已读

路径：`apps/api/src/modules/notifications/notifications.service.ts`：

```ts
import { prisma } from '../../common/db.js';

export async function listNotifications(userId: bigint, limit = 20) {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit,
  });
  return rows.map((row) => ({
    ...row,
    id: row.id.toString(),
    userId: row.userId.toString(),
    actorId: row.actorId?.toString() ?? null,
    targetId: row.targetId?.toString() ?? null,
  }));
}

export async function markRead(userId: bigint) {
  const result = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  return { updated: result.count };
}
```

### 2. SSE 路由

路径：`apps/api/src/modules/notifications/notifications.routes.ts`：

```ts
import { Router } from 'express';
import { requireAuth } from '../../common/auth.js';
import { asyncHandler } from '../../common/middleware.js';
import { redis } from '../../common/redis.js';
import { listNotifications, markRead } from './notifications.service.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', requireAuth, asyncHandler(async (req, res) => {
  res.json({ items: await listNotifications(BigInt(req.user!.sub)) });
}));

notificationsRouter.post('/read', requireAuth, asyncHandler(async (req, res) => {
  res.json(await markRead(BigInt(req.user!.sub)));
}));

notificationsRouter.get('/stream', requireAuth, async (req, res) => {
  const userId = req.user!.sub;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const subscriber = redis.duplicate();
  await subscriber.subscribe(`notify:${userId}`);

  let closed = false;
  subscriber.on('message', (_channel, message) => {
    if (!closed) res.write(`event: notification\ndata: ${message}\n\n`);
  });

  const heartbeat = setInterval(() => {
    if (!closed) res.write(': ping\n\n');
  }, 15000);

  req.on('close', () => {
    closed = true;
    clearInterval(heartbeat);
    void subscriber.unsubscribe(`notify:${userId}`);
    subscriber.disconnect();
  });
});
```

`app.ts` 挂载：

```ts
import { notificationsRouter } from './modules/notifications/notifications.routes.js';
app.use('/api/v1/notifications', notificationsRouter);
```

### 3. 验收

终端 A：

```bash
curl -N -H "Authorization: Bearer $USER_B_TOKEN" \
  http://127.0.0.1:3000/api/v1/notifications/stream
```

终端 B 用 A 点赞 B 的帖子。预期终端 A 1 秒内出现：

```text
event: notification
data: {"id":"...","type":"like",...}
```

断开客户端后服务端不报错；重新连接能拉到未读列表。

**常见错误**：SSE 被 Nginx 缓冲；`req.on('close')` 没清理订阅；订阅 channel 和发布 channel 不一致。

**产出**：commit `feat: add sse notifications`。

---

## Day 10：OpenAPI、测试、CI

**今天目标**：接口有文档、主链路有测试、提交即跑 CI。

### 1. OpenAPI

```bash
pnpm --filter api add @asteasolutions/zod-to-openapi swagger-ui-express
pnpm --filter api add -D @types/swagger-ui-express
```

路径：`apps/api/src/common/openapi.ts`：

```ts
import { OpenAPIRegistry, OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

export const registry = new OpenAPIRegistry();

registry.registerPath({
  method: 'get',
  path: '/api/v1/feed',
  summary: '关注流',
  request: {
    query: z.object({
      limit: z.coerce.number().int().min(1).max(50).default(20),
      cursor: z.string().optional(),
    }),
  },
  responses: {
    200: { description: 'feed page' },
    401: { description: 'unauthorized' },
  },
});

export function buildOpenApiDocument() {
  return new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: '3.0.0',
    info: { title: 'Community API', version: '1.0.0' },
  });
}
```

`app.ts`：

```ts
import swaggerUi from 'swagger-ui-express';
import { buildOpenApiDocument } from './common/openapi.js';

app.use('/docs', swaggerUi.serve, swaggerUi.setup(buildOpenApiDocument()));
```

### 2. 测试

```bash
pnpm --filter api add -D vitest supertest @types/supertest
```

`apps/api/vitest.config.ts`：

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    fileParallelism: false,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? 'mysql://root:root@127.0.0.1:3306/community_test',
    },
  },
});
```

`apps/api/tests/content.test.ts`：

```ts
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/common/db.js';

const app = createApp();

describe('likes', () => {
  beforeEach(async () => {
    await prisma.like.deleteMany();
    await prisma.post.deleteMany();
  });

  async function registerAndLogin(email: string) {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ email, password: 'Passw0rd!', nickname: 'L' });
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'Passw0rd!' });
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });
    return { token: login.body.accessToken as string, userId: user.id };
  }

  it('is idempotent', async () => {
    const { token, userId } = await registerAndLogin(`like-${Date.now()}@test.com`);
    const post = await prisma.post.create({
      data: { authorId: userId, content: 'hello', status: 'published' },
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
});
```

> 测试里生成 token 的完整 helper（注册/登录、resetDb、seedRoles）见仓库 `tests/helpers.ts`；这里先把测试库和开发库分开，`fileParallelism: false` 避免互相污染。

### 3. CI

`.github/workflows/ci.yml`：

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: community_test
        ports: ['3306:3306']
        options: >-
          --health-cmd="mysqladmin ping -h 127.0.0.1 -uroot -proot"
          --health-interval=10s --health-timeout=5s --health-retries=10
      redis:
        image: redis:7
        ports: ['6379:6379']
    env:
      NODE_ENV: test
      DATABASE_URL: mysql://root:root@127.0.0.1:3306/community_test
      REDIS_URL: redis://127.0.0.1:6379
      JWT_SECRET: 01234567890123456789012345678901
      WEB_ORIGIN: http://localhost:3000
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 12.18.0 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter api exec prisma migrate deploy
      - run: pnpm --filter api exec prisma db seed
      - run: pnpm -r typecheck
      - run: pnpm --filter api test
      - run: pnpm -r build
```

### 4. 验收

- [ ] `/docs` 能打开 OpenAPI
- [ ] `pnpm --filter api test` 全绿
- [ ] CI 绿；故意提交类型错误会红
- [ ] 评论/点赞/关注/通知/SSE 全链路通过
- [ ] 20 并发点赞只加 1

**产出**：commit `test: cover content core and add ci`。

下一步：[后端 11–15](/blog/posts/node-roadmap-20-community-week-3/)，做 NestJS 管理/BFF、RabbitMQ 和可观测性。
