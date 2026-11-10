---
title: '后端 P0b：完整社区主链路与工程化'
published: 2026-11-10T10:30:00+08:00
updated: 2026-11-10T10:30:00+08:00
description: '后端第二阶段：评论事务、点赞幂等、关注、Outbox + BullMQ + SSE 通知，以及 Redis、OpenAPI、测试与 CI。'
tags: [社区全栈, 后端, Redis, BullMQ]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 后端 P0b。上一篇：[后端 P0a](/blog/posts/node-roadmap-18-community-week-1/)；下一篇：[后端 P1](/blog/posts/node-roadmap-20-community-week-3/)；前端对应篇：[前端 P0b](/blog/posts/community-fullstack-fe-02-p0b-content-loop/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

P0a 只是垂直切片。P0b 把社区主链路补齐：评论、点赞、关注、通知/SSE，同时把 Redis、OpenAPI、测试和 CI 落下来。

---

## 1. 目标与范围

- 评论 + 计数同事务。
- 点赞/取消点赞幂等。
- 关注/取关幂等。
- Outbox + BullMQ 生成通知，SSE 推送。
- Redis：限流、缓存、SSE Pub/Sub。
- OpenAPI、Vitest/Supertest、GitHub Actions。

---

## 2. 评论：计数必须同事务

```ts
const comment = await prisma.$transaction(async (tx) => {
  const created = await tx.comment.create({
    data: { postId, authorId, content: input.content, parentId },
  });
  await tx.post.update({
    where: { id: postId },
    data: { commentCount: { increment: 1 } },
  });
  return created;
});
```

验收时临时在事务里 `throw`，确认评论和计数一起回滚。

---

## 3. 点赞：唯一约束 + 条件更新

```ts
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
```

取消点赞只删一条，且 `likeCount > 0` 才减：

```ts
const deleted = await tx.like.deleteMany({
  where: { userId, targetType: 'post', targetId: postId },
});
if (deleted.count === 1) {
  await tx.post.updateMany({
    where: { id: postId, likeCount: { gt: 0 } },
    data: { likeCount: { decrement: 1 } },
  });
}
```

20 并发点赞脚本跑完，`likeCount` 必须仍为 1。

---

## 4. 关注：createMany 幂等

```ts
const result = await prisma.follow.createMany({
  data: [{ followerId, followeeId }],
  skipDuplicates: true,
});
return { created: result.count === 1 };
```

关注自己返回 400；重复关注不报唯一键冲突。

---

## 5. 通知：Outbox + BullMQ + SSE

业务事务里写 outbox：

```ts
await enqueueOutbox(tx, 'like.created', {
  targetType: 'post',
  targetId: postId.toString(),
  actorId: userId.toString(),
  recipientId: postAuthorId.toString(),
});
```

outbox worker 投递 BullMQ，`jobId = outbox event id`：

```ts
await notificationQueue.add(event.type, event.payload, {
  jobId: event.id.toString(),
});
```

消费者写通知，`event_id` 唯一键幂等；自己操作自己直接返回。

SSE 路由：

```ts
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache, no-transform');
res.setHeader('X-Accel-Buffering', 'no');

const subscriber = redis.duplicate();
await subscriber.subscribe(`notify:${userId}`);
subscriber.on('message', (_channel, message) => {
  res.write(`event: notification\ndata: ${message}\n\n`);
});
```

15 秒心跳，`req.on('close')` 清理订阅和定时器。

---

## 6. Redis：限流与缓存

- 登录/注册/点赞接口用 `rate-limit-redis` 做分布式限流。
- 热点帖子/用户资料短 TTL 缓存；写操作主动失效。
- SSE 用 Redis Pub/Sub 支持多实例。

---

## 7. OpenAPI 与测试

OpenAPI：

```ts
const registry = new OpenAPIRegistry();
registry.registerPath({
  method: 'get',
  path: '/api/v1/feed',
  request: { query: feedQuerySchema },
  responses: { 200: { description: 'feed page' } },
});
```

测试分层：

- Vitest + Supertest：路由/权限/幂等。
- Testcontainers：MySQL/Redis/RabbitMQ（P1 接入 RabbitMQ 后）。
- CI：install → typecheck → test → build，失败阻断。

---

## 8. 验收清单

- [ ] 评论 201，`commentCount +1`；事务回滚验证通过
- [ ] 重复点赞 `changed=false`；20 并发只加 1
- [ ] 取消点赞两次，计数不会为负
- [ ] 重复关注只一行；关注自己 400
- [ ] A 点赞 B 的帖子，B 收到通知；自己点赞自己不通知
- [ ] SSE 1 秒内收到事件；断开客户端服务不报错
- [ ] `pnpm -r typecheck` / `test` / `build` 全绿
- [ ] OpenAPI 页面可访问

---

## 9. 常见坑

- **计数不一致**：评论/点赞计数必须和业务记录同事务。
- **点赞重复计数**：不要「先查再插」，用唯一约束 + `createMany`。
- **SSE 被缓冲**：`X-Accel-Buffering: no`，Nginx 还要 `proxy_buffering off`。
- **通知重复**：BullMQ `jobId` + 数据库 `event_id` 双保险。
- **SSE 连接泄漏**：`req.on('close')` 必须清理订阅和心跳。

下一步：[后端 P1](/blog/posts/node-roadmap-20-community-week-3/)，做 NestJS 管理/BFF、RabbitMQ 和可观测性。
