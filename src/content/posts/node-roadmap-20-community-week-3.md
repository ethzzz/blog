---
title: '20 · 社区服务 0→1：第 3 周（Day 13–18）异步与治理'
published: 2026-11-09T22:33:00+08:00
updated: 2026-11-09T22:33:00+08:00
description: 'Outbox、BullMQ、通知消费者、SSE、审核举报、故障注入和 10 分钟演示。'
tags: [Node.js, BullMQ, SSE, 社区治理]
category: Node全栈学习路线
draft: false
---

> [!NOTE]
> 本系列第 4/6 篇。上一篇：[第 2 周：内容核心](/blog/posts/node-roadmap-19-community-week-2/)；下一篇：[第 4 周：上线](/blog/posts/node-roadmap-21-community-week-4/)；合集：[Node.js 全栈开发路线](/blog/node-roadmap/)。

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
