---
title: '后端 01–05：Express 公共 API 最小可演示'
published: 2026-11-10T10:20:00+08:00
updated: 2026-11-10T10:20:00+08:00
description: '按天推进 01–05：Day 1 monorepo + Prisma，Day 2 认证，Day 3 发帖，Day 4 关注流，Day 5 Docker Compose 与验收。每天都有命令、完整代码和验收。'
tags: [社区全栈, 后端, Express, Prisma]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 后端 01–05，按旧 Day 1/Day 2 的格式重写。上一篇：[后端总览](/blog/posts/node-roadmap-23-community-fullstack-plan/)；下一篇：[后端 06–10](/blog/posts/node-roadmap-19-community-week-2/)；前端对应篇：[前端 01–03](/blog/posts/community-fullstack-fe-01-p0a-app-shell/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

01–05 用 5 天做出「能登录、能发帖、能看关注流」的公共 API。每天结束必须有一个 commit 和一次验收，不要跳步。

---

## Day 1：monorepo、Prisma 模型、种子

**今天目标**：把现有 Express 骨架迁入 `apps/api`，建好核心领域表，跑通迁移和种子。

### 1. 建 monorepo

```bash
mkdir -p apps packages/shared/src infra/docker
git mv src apps/api/src
git mv prisma apps/api/prisma
git mv package.json apps/api/package.json
git mv tsconfig.json apps/api/tsconfig.json
```

根目录新建 `package.json`：

```json
{
  "name": "community",
  "private": true,
  "packageManager": "pnpm@12.18.0",
  "scripts": {
    "dev:api": "pnpm --filter api dev",
    "typecheck": "pnpm -r typecheck",
    "build": "pnpm -r build"
  }
}
```

`pnpm-workspace.yaml`：

```yaml
packages:
  - apps/*
  - packages/*
allowBuilds:
  '@prisma/client': true
  '@prisma/engines': true
  argon2: true
  esbuild: true
  prisma: true
```

`apps/api/package.json` 保持原来的 `type: module`、`dev`、`build`、`start` 和依赖；把 `name` 改成 `api`。

验收：

```bash
pnpm install
pnpm --filter api typecheck
pnpm dev:api
curl -i http://127.0.0.1:3000/health
```

### 2. 写 prisma/schema.prisma

路径：`apps/api/prisma/schema.prisma`。01–05 先建这些核心模型（06–10/11–15 再补通知、治理、Outbox）：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

enum UserStatus {
  active
  banned
  deleted
}

enum PostStatus {
  draft
  pending
  published
  rejected
  deleted
}

enum CommentStatus {
  pending
  published
  rejected
  deleted
}

enum LikeTargetType {
  post
  comment
}

model User {
  id           BigInt        @id @default(autoincrement())
  email        String        @unique @db.VarChar(255)
  passwordHash String        @map("password_hash") @db.VarChar(255)
  nickname     String        @db.VarChar(64)
  bio          String?       @db.VarChar(255)
  avatarUrl    String?       @map("avatar_url") @db.VarChar(512)
  status       UserStatus    @default(active)
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")

  refreshTokens RefreshToken[]
  roles         UserRole[]
  posts         Post[]
  comments      Comment[]
  likes         Like[]
  following     Follow[]      @relation("follower")
  followers     Follow[]      @relation("followee")

  @@index([createdAt])
  @@map("users")
}

model RefreshToken {
  id        BigInt    @id @default(autoincrement())
  userId    BigInt    @map("user_id")
  tokenHash String    @unique @map("token_hash") @db.Char(64)
  expiresAt DateTime  @map("expires_at")
  revokedAt DateTime? @map("revoked_at")
  userAgent String?   @map("user_agent") @db.VarChar(255)
  ip        String?   @db.VarChar(64)
  createdAt DateTime  @default(now()) @map("created_at")

  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_tokens")
}

model Role {
  id              BigInt           @id @default(autoincrement())
  code            String           @unique @db.VarChar(64)
  name            String           @db.VarChar(64)
  createdAt       DateTime         @default(now()) @map("created_at")
  userRoles       UserRole[]
  rolePermissions RolePermission[]
  @@map("roles")
}

model Permission {
  id        BigInt           @id @default(autoincrement())
  code      String           @unique @db.VarChar(64)
  name      String           @db.VarChar(64)
  createdAt DateTime         @default(now()) @map("created_at")
  roles     RolePermission[]
  @@map("permissions")
}

model UserRole {
  userId BigInt @map("user_id")
  roleId BigInt @map("role_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  role   Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)
  @@id([userId, roleId])
  @@index([roleId])
  @@map("user_roles")
}

model RolePermission {
  roleId       BigInt     @map("role_id")
  permissionId BigInt     @map("permission_id")
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  @@id([roleId, permissionId])
  @@index([permissionId])
  @@map("role_permissions")
}

model Post {
  id           BigInt     @id @default(autoincrement())
  authorId     BigInt     @map("author_id")
  title        String?    @db.VarChar(200)
  content      String     @db.Text
  status       PostStatus @default(pending)
  likeCount    Int        @default(0) @map("like_count")
  commentCount Int        @default(0) @map("comment_count")
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")
  deletedAt    DateTime?  @map("deleted_at")

  author       User       @relation(fields: [authorId], references: [id])
  comments     Comment[]

  @@index([authorId, createdAt])
  @@index([status, createdAt])
  @@map("posts")
}

model Comment {
  id        BigInt        @id @default(autoincrement())
  postId    BigInt        @map("post_id")
  authorId  BigInt        @map("author_id")
  parentId  BigInt?       @map("parent_id")
  content   String        @db.VarChar(2000)
  status    CommentStatus @default(published)
  likeCount Int           @default(0) @map("like_count")
  createdAt DateTime      @default(now()) @map("created_at")
  deletedAt DateTime?     @map("deleted_at")

  post      Post          @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    User          @relation(fields: [authorId], references: [id])
  parent    Comment?      @relation("comment_replies", fields: [parentId], references: [id])
  replies   Comment[]     @relation("comment_replies")

  @@index([postId, createdAt])
  @@map("comments")
}

model Like {
  id         BigInt         @id @default(autoincrement())
  userId     BigInt         @map("user_id")
  targetType LikeTargetType @map("target_type")
  targetId   BigInt         @map("target_id")
  createdAt  DateTime       @default(now()) @map("created_at")

  user       User           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, targetType, targetId])
  @@index([targetType, targetId])
  @@map("likes")
}

model Follow {
  followerId BigInt   @map("follower_id")
  followeeId BigInt   @map("followee_id")
  createdAt  DateTime @default(now()) @map("created_at")

  follower   User     @relation("follower", fields: [followerId], references: [id], onDelete: Cascade)
  followee   User     @relation("followee", fields: [followeeId], references: [id], onDelete: Cascade)

  @@id([followerId, followeeId])
  @@index([followeeId])
  @@map("follows")
}
```

### 3. 写 db 单例

路径：`apps/api/src/common/db.ts`：

```ts
import { PrismaClient } from '@prisma/client';
import { config } from './config.js';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: config.DATABASE_URL,
    log: config.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (config.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### 4. 写 seed

路径：`apps/api/prisma/seed.ts`：

```ts
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const permissions = [
    { code: 'admin:access', name: '访问后台' },
    { code: 'post:review', name: '审核帖子' },
    { code: 'report:handle', name: '处理举报' },
    { code: 'user:ban', name: '封禁用户' },
  ];

  for (const item of permissions) {
    await prisma.permission.upsert({
      where: { code: item.code },
      update: { name: item.name },
      create: item,
    });
  }

  const adminRole = await prisma.role.upsert({
    where: { code: 'admin' },
    update: { name: '管理员' },
    create: { code: 'admin', name: '管理员' },
  });
  const userRole = await prisma.role.upsert({
    where: { code: 'user' },
    update: { name: '普通用户' },
    create: { code: 'user', name: '普通用户' },
  });

  for (const permission of await prisma.permission.findMany()) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: { roleId: adminRole.id, permissionId: permission.id },
    });
  }

  const passwordHash = await argon2.hash('Admin123!ChangeMe');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { passwordHash },
    create: { email: 'admin@test.com', passwordHash, nickname: 'Admin' },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  console.log('Seed done');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

`apps/api/package.json` 顶层加：

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### 5. 执行迁移

```bash
pnpm --filter api exec prisma migrate dev --name init
pnpm --filter api exec prisma db seed
```

**验收**

- `pnpm --filter api exec prisma migrate status` 正常
- Prisma Studio 能看到 users/roles/posts 等表
- `admin@test.com` 存在并绑定 admin 角色

**常见错误**

- `11–15001`：MySQL 没起，先 `docker compose ps`。
- `prisma` 版本装错：固定 `6.19.3`，不要裸装 latest。
- `prisma db seed` 不执行：`package.json` 的 `prisma.seed` 没配。

**产出**：commit `feat: add monorepo and prisma schema`。

```bash
git add .
git commit -m "feat: add monorepo and prisma schema"
```

---

## Day 2：注册、登录、刷新、登出

**今天目标**：完整认证闭环，refresh 轮换，旧 refresh 不能重放。

### 1. 安装依赖

```bash
pnpm --filter api add jsonwebtoken cookie-parser cors
pnpm --filter api add -D @types/jsonwebtoken @types/cookie-parser @types/cors
```

`config.ts` 增加：

```ts
JWT_ACCESS_TTL: z.string().default('15m'),
JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(7),
```

`.env` 同步加：

```ini
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL_DAYS=7
```

### 2. token.service.ts

路径：`apps/api/src/modules/auth/token.service.ts`：

```ts
import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { config } from '../../common/config.js';

export type AccessPayload = { sub: string; roles: string[] };

export function signAccessToken(payload: AccessPayload): string {
  const expiresIn = config.JWT_ACCESS_TTL as SignOptions['expiresIn'];
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn, algorithm: 'HS256' });
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'] });
  if (typeof decoded === 'string') throw new Error('Invalid token payload');
  return {
    sub: String(decoded.sub),
    roles: Array.isArray(decoded.roles) ? decoded.roles.map(String) : [],
  };
}

export function createRefreshToken() {
  const token = randomBytes(48).toString('base64url');
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
```

`apps/api/src/types/express.d.ts`：

```ts
import type { AccessPayload } from '../modules/auth/token.service.js';

declare global {
  namespace Express {
    interface Request {
      user?: AccessPayload;
    }
  }
}

export {};
```

### 3. auth.service.ts

路径：`apps/api/src/modules/auth/auth.service.ts`：

```ts
import argon2 from 'argon2';
import { config } from '../../common/config.js';
import { prisma } from '../../common/db.js';
import { AppError } from '../../common/errors.js';
import { createRefreshToken, hashToken, signAccessToken } from './token.service.js';

function refreshExpiresAt() {
  return new Date(Date.now() + config.JWT_REFRESH_TTL_DAYS * 86_400_000);
}

export async function register(input: { email: string; password: string; nickname: string }) {
  const email = input.email.trim().toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) {
    throw new AppError('EMAIL_TAKEN', 409, 'Email is already registered');
  }

  const passwordHash = await argon2.hash(input.password);
  const role = await prisma.role.findUnique({ where: { code: 'user' } });
  if (!role) throw new AppError('ROLE_NOT_INITIALIZED', 500, 'Run seed first');

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email, passwordHash, nickname: input.nickname.trim() },
    });
    await tx.userRole.create({ data: { userId: created.id, roleId: role.id } });
    return created;
  });

  return { id: user.id.toString(), email: user.email, nickname: user.nickname };
}

export async function login(input: { email: string; password: string; userAgent?: string; ip?: string }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.trim().toLowerCase() },
    include: { roles: { include: { role: true } } },
  });
  if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
    throw new AppError('INVALID_CREDENTIALS', 401, 'Email or password is incorrect');
  }
  if (user.status !== 'active') throw new AppError('ACCOUNT_DISABLED', 403, 'Account is not active');

  const refresh = createRefreshToken();
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refresh.tokenHash,
      expiresAt: refreshExpiresAt(),
      userAgent: input.userAgent,
      ip: input.ip,
    },
  });

  return {
    accessToken: signAccessToken({
      sub: user.id.toString(),
      roles: user.roles.map((item) => item.role.code),
    }),
    refreshToken: refresh.token,
    user: { id: user.id.toString(), email: user.email, nickname: user.nickname },
  };
}

export async function refresh(input: { refreshToken: string }) {
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(input.refreshToken) },
  });
  if (!stored) throw new AppError('INVALID_REFRESH_TOKEN', 401, 'Refresh token is invalid');
  if (stored.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new AppError('REFRESH_TOKEN_REUSED', 401, 'Refresh token reuse detected');
  }
  if (stored.expiresAt <= new Date()) throw new AppError('REFRESH_TOKEN_EXPIRED', 401, 'Refresh token expired');

  const user = await prisma.user.findUnique({
    where: { id: stored.userId },
    include: { roles: { include: { role: true } } },
  });
  if (!user || user.status !== 'active') throw new AppError('ACCOUNT_DISABLED', 403, 'Account is not active');

  const next = createRefreshToken();
  await prisma.$transaction([
    prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } }),
    prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: next.tokenHash,
        expiresAt: refreshExpiresAt(),
        userAgent: stored.userAgent,
        ip: stored.ip,
      },
    }),
  ]);

  return {
    accessToken: signAccessToken({
      sub: user.id.toString(),
      roles: user.roles.map((item) => item.role.code),
    }),
    refreshToken: next.token,
  };
}

export async function logout(refreshToken: string) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
```

### 4. auth.controller.ts 与 routes

路径：`apps/api/src/modules/auth/auth.controller.ts`：

```ts
import type { Request, Response } from 'express';
import { config } from '../../common/config.js';
import { AppError } from '../../common/errors.js';
import { login, logout, refresh, register } from './auth.service.js';

const REFRESH_COOKIE = 'refresh_token';

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.NODE_ENV === 'production',
    path: '/api/v1/auth',
    maxAge: config.JWT_REFRESH_TTL_DAYS * 86_400_000,
  });
}

export async function registerHandler(req: Request, res: Response) {
  res.status(201).json(await register(req.body));
}

export async function loginHandler(req: Request, res: Response) {
  const result = await login({ ...req.body, userAgent: req.header('user-agent'), ip: req.ip });
  setRefreshCookie(res, result.refreshToken);
  res.status(200).json({ accessToken: result.accessToken, user: result.user });
}

export async function refreshHandler(req: Request, res: Response) {
  const refreshToken = req.cookies[REFRESH_COOKIE] ?? req.body?.refreshToken;
  if (!refreshToken) throw new AppError('REFRESH_TOKEN_REQUIRED', 401, 'Refresh token required');
  const result = await refresh({ refreshToken });
  setRefreshCookie(res, result.refreshToken);
  res.status(200).json({ accessToken: result.accessToken });
}

export async function logoutHandler(req: Request, res: Response) {
  const refreshToken = req.cookies[REFRESH_COOKIE] ?? req.body?.refreshToken;
  if (refreshToken) await logout(refreshToken);
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
  res.status(204).send();
}
```

路径：`apps/api/src/modules/auth/auth.routes.ts`：

```ts
import { Router } from 'express';
import { asyncHandler } from '../../common/middleware.js';
import { loginHandler, logoutHandler, refreshHandler, registerHandler } from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(registerHandler));
authRouter.post('/login', asyncHandler(loginHandler));
authRouter.post('/refresh', asyncHandler(refreshHandler));
authRouter.post('/logout', asyncHandler(logoutHandler));
```

### 5. 写 common/auth.ts

路径：`apps/api/src/common/auth.ts`：

```ts
import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../modules/auth/token.service.js';
import { AppError } from './errors.js';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) {
    next(new AppError('UNAUTHORIZED', 401, 'Authentication required'));
    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    next(new AppError('UNAUTHORIZED', 401, 'Invalid or expired token'));
  }
};

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

`app.ts` 挂载：

```ts
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from './common/config.js';
import { authRouter } from './modules/auth/auth.routes.js';

app.use(cors({ origin: config.WEB_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use('/api/v1/auth', authRouter);
```

### 5. 验收

```bash
curl -i -X POST http://127.0.0.1:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"a@test.com","password":"Passw0rd!","nickname":"A"}'

curl -i -c /tmp/cookies.txt -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@test.com","password":"Passw0rd!"}'

curl -i -b /tmp/cookies.txt -X POST http://127.0.0.1:3000/api/v1/auth/refresh
```

预期：注册 201、登录 200、刷新 200；旧 refresh 重放 401。

**常见错误**

- Cookie 收不到：`path` 必须是 `/api/v1/auth`。
- 401：`JWT_SECRET` 不一致或 token 过期。
- CORS：前端带 Cookie 时 `credentials: true` + 明确 origin。

**产出**：commit `feat: add auth with refresh rotation`。

---

## Day 3：发帖、帖子列表、详情

**今天目标**：登录用户能发帖，列表只显示 published，作者能看自己的 pending。

### 1. posts.service.ts

路径：`apps/api/src/modules/posts/posts.service.ts`：

```ts
import type { Prisma } from '@prisma/client';
import { prisma } from '../../common/db.js';
import { AppError } from '../../common/errors.js';

const select = {
  id: true, authorId: true, title: true, content: true,
  status: true, likeCount: true, commentCount: true, createdAt: true,
} satisfies Prisma.PostSelect;

type PostRow = Prisma.PostGetPayload<{ select: typeof select }>;

function toPost(post: PostRow) {
  return { ...post, id: post.id.toString(), authorId: post.authorId.toString() };
}

export async function createPost(authorId: bigint, input: { title?: string; content: string }) {
  const post = await prisma.post.create({
    data: { authorId, title: input.title ?? null, content: input.content, status: 'pending' },
    select,
  });
  return toPost(post);
}

export async function listPublishedPosts() {
  const rows = await prisma.post.findMany({
    where: { status: 'published' },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: 20,
    select,
  });
  return rows.map(toPost);
}

export async function getPost(id: bigint, viewerId?: bigint) {
  const post = await prisma.post.findFirst({ where: { id, status: { not: 'deleted' } }, select });
  if (!post) throw new AppError('POST_NOT_FOUND', 404, 'Post not found');
  if (post.status !== 'published' && post.authorId !== viewerId) {
    throw new AppError('POST_NOT_FOUND', 404, 'Post not found');
  }
  return toPost(post);
}
```

### 2. posts.routes.ts

路径：`apps/api/src/modules/posts/posts.routes.ts`：

```ts
import { Router } from 'express';
import { optionalAuth, requireAuth } from '../../common/auth.js';
import { asyncHandler } from '../../common/middleware.js';
import { AppError } from '../../common/errors.js';
import { createPost, getPost, listPublishedPosts } from './posts.service.js';

export const postsRouter = Router();

function userId(req: { user?: { sub: string } }) {
  if (!req.user) throw new AppError('UNAUTHORIZED', 401, 'Authentication required');
  return BigInt(req.user.sub);
}

postsRouter.get('/', asyncHandler(async (_req, res) => {
  res.json({ items: await listPublishedPosts() });
}));

postsRouter.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const id = BigInt(req.params.id ?? '');
  res.json(await getPost(id, req.user ? userId(req) : undefined));
}));

postsRouter.post('/', requireAuth, asyncHandler(async (req, res) => {
  res.status(201).json(await createPost(userId(req), req.body));
}));
```

`app.ts` 挂载：

```ts
import { postsRouter } from './modules/posts/posts.routes.js';
app.use('/api/v1/posts', postsRouter);
```

### 3. 验收

```bash
curl -i -X POST http://127.0.0.1:3000/api/v1/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"第一条","content":"hello"}'
```

预期：201，`status: pending`。列表看不到 pending；作者带 token 能看详情。

**产出**：commit `feat: add posts`。

---

## Day 4：关注关系与关注流

**今天目标**：关注/取关幂等，feed 游标分页不重不漏。

### 1. users 关注接口

路径：`apps/api/src/modules/users/users.service.ts`：

```ts
import { prisma } from '../../common/db.js';
import { AppError } from '../../common/errors.js';

export async function follow(followerId: bigint, followeeId: bigint) {
  if (followerId === followeeId) {
    throw new AppError('CANNOT_FOLLOW_SELF', 400, 'You cannot follow yourself');
  }
  const target = await prisma.user.findUnique({ where: { id: followeeId } });
  if (!target || target.status !== 'active') throw new AppError('USER_NOT_FOUND', 404, 'User not found');

  const result = await prisma.follow.createMany({
    data: [{ followerId, followeeId }],
    skipDuplicates: true,
  });
  return { created: result.count === 1 };
}

export async function unfollow(followerId: bigint, followeeId: bigint) {
  const result = await prisma.follow.deleteMany({ where: { followerId, followeeId } });
  return { removed: result.count === 1 };
}
```

路由 `apps/api/src/modules/users/users.routes.ts`：

```ts
import { Router } from 'express';
import { requireAuth } from '../../common/auth.js';
import { asyncHandler } from '../../common/middleware.js';
import { follow, unfollow } from './users.service.js';

export const usersRouter = Router();
usersRouter.use(requireAuth);

usersRouter.post('/:id/follow', asyncHandler(async (req, res) => {
  res.json(await follow(BigInt(req.user!.sub), BigInt(req.params.id ?? '')));
}));

usersRouter.delete('/:id/follow', asyncHandler(async (req, res) => {
  res.json(await unfollow(BigInt(req.user!.sub), BigInt(req.params.id ?? '')));
}));
```

### 2. feed.repository.ts

路径：`apps/api/src/modules/feed/feed.repository.ts`：

```ts
import { Prisma } from '@prisma/client';
import { prisma } from '../../common/db.js';

export async function findFollowingFeed(input: {
  userId: bigint;
  cursorCreatedAt?: Date;
  cursorId?: bigint;
  limit: number;
}) {
  const { userId, cursorCreatedAt, cursorId, limit } = input;

  if (cursorCreatedAt && cursorId) {
    return prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
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

  return prisma.$queryRaw<Array<Record<string, unknown>>>(Prisma.sql`
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

### 3. feed.routes.ts

路径：`apps/api/src/modules/feed/feed.routes.ts`：

```ts
import { Router } from 'express';
import { requireAuth } from '../../common/auth.js';
import { asyncHandler } from '../../common/middleware.js';
import { findFollowingFeed } from './feed.repository.js';

export const feedRouter = Router();

feedRouter.get('/', requireAuth, asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 20), 50);
  const rows = await findFollowingFeed({ userId: BigInt(req.user!.sub), limit });
  res.json({ items: rows.slice(0, limit).map((row) => ({
    ...row,
    id: String(row.id),
    author_id: String(row.author_id),
  })), nextCursor: rows.length > limit ? String(rows[limit - 1]?.created_at) : null });
}));
```

`app.ts` 挂载：

```ts
import { usersRouter } from './modules/users/users.routes.js';
import { feedRouter } from './modules/feed/feed.routes.js';
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/feed', feedRouter);
```

### 4. 验收

1. 用 `admin@test.com` 发一条帖子，Prisma Studio 改成 `published`。
2. 用 `a@test.com` 关注 admin。
3. 请求 feed：

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://127.0.0.1:3000/api/v1/feed?limit=20"
```

预期：能看到 admin 的 published 帖子；重复关注只一行；关注自己 400。

**产出**：commit `feat: add follow and following feed`。

---

## Day 5：Docker Compose 与端到端验收

**今天目标**：一条命令起 MySQL/Redis/API，完整跑通注册→登录→发帖→feed。

### 1. 写 docker-compose

路径：`infra/docker/docker-compose.yml`：

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

volumes:
  mysql-data:
  redis-data:
```

01–05 只把 MySQL/Redis 放进 Compose；API 本地跑。多阶段 Dockerfile 在 16–18 再做。

### 2. 启动与验收

```bash
cp .env.example .env
docker compose -f infra/docker/docker-compose.yml up -d
pnpm --filter api exec prisma migrate deploy
pnpm --filter api exec prisma db seed
pnpm dev:api
```

完整验收：

```bash
curl -i http://127.0.0.1:3000/health
curl -i -X POST http://127.0.0.1:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"a@test.com","password":"Passw0rd!","nickname":"A"}'
```

01–05 完成标准：

- [ ] monorepo 下 `pnpm --filter api typecheck` 通过
- [ ] 注册/登录/刷新/登出闭环
- [ ] 发帖 pending、列表只显示 published
- [ ] 关注/取关幂等
- [ ] feed 能返回关注对象的 published 帖子
- [ ] Docker Compose 后 MySQL/Redis/API 可用
- [ ] 至少 5 个 commit，每天一个

**产出**：commit `feat: dockerize api and verify p0a`。

下一步：[后端 06–10](/blog/posts/node-roadmap-19-community-week-2/)，补评论、点赞、通知、SSE、OpenAPI 和 CI。
