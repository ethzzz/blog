---
title: '19 · 社区服务 0→1：第 2 周（Day 7–12）内容核心'
published: 2026-11-09T22:32:00+08:00
updated: 2026-11-09T22:32:00+08:00
description: '发帖、评论、点赞、关注流：游标分页、事务计数、点赞幂等、测试与并发破坏。'
tags: [Node.js, Express, 社区内容, 高并发]
category: Node全栈学习路线
draft: false
---

> [!NOTE]
> 本系列第 3/6 篇。上一篇：[第 1 周：地基与认证](/blog/posts/node-roadmap-18-community-week-1/)；下一篇：[第 3 周：异步与治理](/blog/posts/node-roadmap-20-community-week-3/)；合集：[Node.js 全栈开发路线](/blog/node-roadmap/)。

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
