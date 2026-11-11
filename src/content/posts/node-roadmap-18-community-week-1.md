---
title: '后端 01–05：从空目录到可演示社区 API'
published: 2026-11-10T10:20:00+08:00
updated: 2026-11-10T10:20:00+08:00
description: 'Day 1–5 从空目录开始：初始化 monorepo 与 Express、配置/日志/错误、Prisma 领域模型、JWT 认证、发帖/关注/feed，完整 0→1。'
tags: [社区全栈, 后端, Express, Prisma]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 后端 01–05。上一篇：[后端 00](/blog/posts/node-roadmap-23-community-fullstack-plan/)；下一篇：[后端 06–10](/blog/posts/node-roadmap-19-community-week-2/)；前端对应篇：[前端 01–03](/blog/posts/community-fullstack-fe-01-p0a-app-shell/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

先把环境跑起来。下面从空目录开始，建目录、装依赖、起一个能返回 `/health` 的 Express 服务，再用 Docker Compose 把 MySQL 和 Redis 拉起来。第一天不碰业务表，先把“服务能启动”这件事确认掉。

这 5 天按顺序做：Day 1 起服务，Day 2 配置/日志/错误，Day 3 Prisma，Day 4 认证，Day 5 发帖和 feed。做完一天就提交一次，出问题好回退。

我本地是 Node 24 + pnpm 12，下面的命令在 Git Bash 里跑过；PowerShell 不只要改环境变量，`mkdir -p`、`cp`、`curl -i` 这些写法也不一样。建议直接开 Git Bash 跑；只用 PowerShell 的话，下面会标出等价写法。

**这一阶段在练什么**

从空目录切出一个能跑的最小闭环：先定分层，再写功能。每加一个文件，都要能说清它属于哪一层、删掉会怎样。

### 文件地图

| 文件 | 为什么单独存在 | 以后可能怎么改 |
|---|---|---|
| `apps/api/package.json` | API 是独立部署单元，依赖和脚本自己管 | 后面加 `admin-api`、`web`，各自独立 |
| `common/config.ts` | 环境变量集中校验，启动即失败 | 接 secrets manager、多环境配置 |
| `common/logger.ts` | 日志字段统一、敏感信息脱敏 | 接 OpenTelemetry、采样、日志平台 |
| `common/errors.ts` | 业务错误有统一结构 | 增加错误码目录、国际化 |
| `common/middleware.ts` | requestId、错误边界是横切能力 | 拆成 auth、限流、metrics 等独立中间件 |
| `prisma/schema.prisma` | 领域模型和数据约束的唯一来源 | 迁移、索引、分区、读写分离 |
| `common/db.ts` | 连接池只初始化一次，方便测试替换 | 加只读副本、连接池指标 |
| `modules/auth/*` | 认证是一个独立用例，不混进路由 | 加 OAuth、MFA、会话管理 |
| `modules/posts/*` | 内容是最小垂直切片 | 加审核、搜索、媒体 |
| `modules/feed/*` | 读模型和写模型分开，查询可以单独优化 | 加缓存、写扩散、只读副本 |

**怎么判断该不该拆**

一个文件只有一个变更理由。路由、业务规则、数据访问分开；以后最先变的是业务规则，不是框架。

---

## Day 1：空目录到 `/health`

**今天目标**：从空目录建 monorepo，起 Express 服务，返回 `/health`，并用 Docker Compose 起 MySQL/Redis。

### 1. 建目录

工作目录：任意空目录。

```bash
mkdir community
cd community
mkdir -p apps/api/src packages/shared/src infra/docker
pnpm init
```

> [!TIP]
> PowerShell 里的 `mkdir` 是 `New-Item` 的别名，不支持 `-p`，也不能一次接多个路径。等价命令：
> `New-Item -ItemType Directory -Force -Path apps/api/src, packages/shared/src, infra/docker`
> 后面的 `cp` 用 `Copy-Item`，`curl -i` 用 `curl.exe -i`。

根 `package.json` 改成：

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
```

### 2. 初始化 apps/api

```bash
cd apps/api
pnpm init
pnpm add express zod pino dotenv
pnpm add -D typescript tsx @types/node @types/express
```

`apps/api/package.json` 改成：

```json
{
  "name": "api",
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

`apps/api/tsconfig.json`：

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
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "sourceMap": true
  },
  "include": ["src"]
}
```

### 3. 写 app.ts 与 server.ts

`apps/api/src/app.ts`：

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

`apps/api/src/server.ts`：

```ts
import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

app.listen(port, () => {
  console.log(`API listening on http://127.0.0.1:${port}`);
});
```

> NodeNext 下源码里的相对导入要写 `.js`，部署后才能正确解析。

### 4. 写 Docker Compose

`infra/docker/docker-compose.yml`：

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

### 5. 启动验收

```bash
cd ../..
pnpm install
docker compose -f infra/docker/docker-compose.yml up -d
pnpm dev:api
```

另开终端：

```bash
curl -i http://127.0.0.1:3000/health
```

预期：`200 {"status":"ok"}`；`docker compose ps` 两个容器 Up。

**常见错误**：`pnpm --filter api` 找不到包（`apps/api/package.json` 的 name 不是 `api`）；端口被占用；ESM 导入漏了 `.js`。

**产出**：commit `chore: bootstrap monorepo and express health`。

---

## Day 2：配置、日志、错误、requestId

**今天目标**：坏配置启动即失败；所有错误返回统一 JSON；日志能按 requestId 串起来。

### 1. 环境变量

路径：`apps/api/.env.example`。复制一份到 `apps/api/.env`：

```ini
NODE_ENV=development
PORT=3000
DATABASE_URL="mysql://root:root@127.0.0.1:3306/community"
REDIS_URL="redis://127.0.0.1:6379"
JWT_SECRET="replace-with-a-random-string-at-least-32-chars"
JWT_REFRESH_TTL_DAYS=7
WEB_ORIGIN="http://localhost:3001"
LOG_LEVEL=info
```

```bash
cp apps/api/.env.example apps/api/.env
```

> [!IMPORTANT]
> `.env` 放在 `apps/api/` 下，不是仓库根目录。`pnpm --filter api dev` 的工作目录是 `apps/api`，`dotenv/config` 和 Prisma 都从这里读。根目录 `.gitignore` 加 `apps/api/.env`。

### 2. config.ts

`apps/api/src/common/config.ts`：

```ts
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(7),
  WEB_ORIGIN: z.url(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.issues);
  process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;
```

### 3. logger.ts

`apps/api/src/common/logger.ts`：

```ts
import pino from 'pino';
import { config } from './config.js';

export const logger = pino({
  level: config.LOG_LEVEL,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', '*.password', 'token', '*.token'],
    censor: '[REDACTED]',
  },
});
```

### 4. errors.ts

`apps/api/src/common/errors.ts`：

```ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

### 5. middleware.ts

`apps/api/src/common/middleware.ts`：

```ts
import { randomUUID } from 'node:crypto';
import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import { ZodError } from 'zod';
import { AppError } from './errors.js';
import { logger } from './logger.js';

const REQUEST_ID = /^[A-Za-z0-9._-]{1,128}$/;

export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.header('x-request-id');
  const id = incoming && REQUEST_ID.test(incoming) ? incoming : randomUUID();
  res.locals.requestId = id;
  res.setHeader('x-request-id', id);
  next();
};

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(handler: AsyncRoute): RequestHandler {
  return (req, res, next) => {
    Promise.resolve()
      .then(() => handler(req, res, next))
      .catch(next);
  };
}

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError('NOT_FOUND', 404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const requestId = String(res.locals.requestId ?? '');

  if (err instanceof AppError) {
    logger.warn({ err, requestId }, 'request failed');
    res.status(err.status).json({
      code: err.code,
      message: err.message,
      details: err.details ?? null,
      requestId,
    });
    return;
  }

  if (err instanceof ZodError) {
    logger.warn({ err, requestId }, 'validation failed');
    res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Invalid request data',
      details: err.issues,
      requestId,
    });
    return;
  }

  logger.error({ err, requestId }, 'unhandled error');
  res.status(500).json({
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
    requestId,
  });
};
```

### 6. 更新 app.ts 与 server.ts

`apps/api/src/app.ts` 改完后的完整文件：

```ts
import express from 'express';
import type { Express } from 'express';
import { errorHandler, notFound, requestId } from './common/middleware.js';

export function createApp(): Express {
  const app = express();

  app.use(requestId);
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
```

`apps/api/src/server.ts` 改完后的完整文件：

```ts
import { config } from './common/config.js';
import { logger } from './common/logger.js';
import { createApp } from './app.js';

const app = createApp();

app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'API listening');
});
```

### 7. 验收

```bash
curl -i -H "x-request-id: test-123" http://127.0.0.1:3000/health
curl -i http://127.0.0.1:3000/nope
JWT_SECRET=short pnpm exec tsx src/server.ts
```

预期：健康检查有 `x-request-id`；404 是 JSON；坏配置启动退出（`pnpm dev` 的 watch 父进程会驻留，验证用非 watch）。

**产出**：commit `feat: unify config logging errors and trace`。

---

## Day 3：Prisma 模型与 seed

**今天目标**：建领域表，生成 Prisma Client，写入管理员和普通用户。

### 1. 安装

在 `apps/api`：

```bash
pnpm add @prisma/client@6.19.3 argon2
pnpm add -D prisma@6.19.3
pnpm exec prisma init --datasource-provider mysql
```

> 必须锁 6.19.3。Prisma 的 `latest` 可能是 8 RC，且 7+ 移除了 schema 里的 `datasource.url`。

### 2. schema.prisma

`apps/api/prisma/schema.prisma`：

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
  id           BigInt     @id @default(autoincrement())
  email        String     @unique @db.VarChar(255)
  passwordHash String     @map("password_hash") @db.VarChar(255)
  nickname     String     @db.VarChar(64)
  bio          String?    @db.VarChar(255)
  avatarUrl    String?    @map("avatar_url") @db.VarChar(512)
  status       UserStatus @default(active)
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")
  refreshTokens RefreshToken[]
  roles         UserRole[]
  posts         Post[]
  comments      Comment[]
  likes         Like[]
  following     Follow[]   @relation("follower")
  followers     Follow[]   @relation("followee")
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
  userRoles       UserRole[]
  rolePermissions RolePermission[]
  @@map("roles")
}

model Permission {
  id        BigInt           @id @default(autoincrement())
  code      String           @unique @db.VarChar(64)
  name      String           @db.VarChar(64)
  roles     RolePermission[]
  @@map("permissions")
}

model UserRole {
  userId BigInt @map("user_id")
  roleId BigInt @map("role_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  role   Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)
  @@id([userId, roleId])
  @@map("user_roles")
}

model RolePermission {
  roleId       BigInt     @map("role_id")
  permissionId BigInt     @map("permission_id")
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  @@id([roleId, permissionId])
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
  createdAt DateTime      @default(now()) @map("created_at")
  post      Post          @relation(fields: [postId], references: [id], onDelete: Cascade)
  author    User          @relation(fields: [authorId], references: [id])
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

### 3. db.ts

`apps/api/src/common/db.ts`：

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

### 4. seed.ts

`apps/api/prisma/seed.ts`：

```ts
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  for (const item of [
    { code: 'admin:access', name: '访问后台' },
    { code: 'post:review', name: '审核帖子' },
    { code: 'report:handle', name: '处理举报' },
    { code: 'user:ban', name: '封禁用户' },
  ]) {
    await prisma.permission.upsert({ where: { code: item.code }, update: { name: item.name }, create: item });
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
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
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

  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: { passwordHash },
    create: { email: 'user@test.com', passwordHash, nickname: 'User' },
  });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: userRole.id } },
    update: {},
    create: { userId: user.id, roleId: userRole.id },
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

`apps/api/package.json` 改完后的完整文件：

```json
{
  "name": "api",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "dev:once": "tsx src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@prisma/client": "6.19.3",
    "argon2": "^0.45.2",
    "dotenv": "^18.0.9",
    "express": "^5.3.0",
    "pino": "^10.4.0",
    "zod": "^4.6.7"
  },
  "devDependencies": {
    "@types/express": "^5.0.6",
    "@types/node": "^26.6.6",
    "prisma": "6.19.3",
    "tsx": "^4.23.15",
    "typescript": "^7.0.2"
  }
}
```

`apps/api/prisma.config.ts`（Prisma 6.19.3 的 seed 入口写在这里，不再用 `package.json` 顶层的 `prisma.seed`）：

```ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  engine: 'classic',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

### 5. 迁移与验收

```bash
pnpm --filter api exec prisma migrate dev --name init
pnpm --filter api exec prisma db seed
```

- `prisma migrate status` 正常
- Prisma Studio 能看到 users/roles/posts 等表
- `admin@test.com` / `user@test.com` 存在

**产出**：commit `feat: add prisma schema and seed`。

---

## Day 4：注册、登录、刷新、登出

**今天目标**：把注册、登录、刷新、登出这条线走通，refresh 轮换，旧 refresh 不能重放。

### 1. 安装

```bash
pnpm --filter api add jsonwebtoken cookie-parser cors
pnpm --filter api add -D @types/jsonwebtoken @types/cookie-parser @types/cors
```

### 2. token.service.ts

`apps/api/src/modules/auth/token.service.ts`：

```ts
import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { config } from '../../common/config.js';

export type AccessPayload = { sub: string; roles: string[] };

export function signAccessToken(payload: AccessPayload) {
  const expiresIn = '15m' as NonNullable<SignOptions['expiresIn']>;
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

export function hashToken(token: string) {
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

`apps/api/src/modules/auth/auth.service.ts`：

```ts
import argon2 from 'argon2';
import { config } from '../../common/config.js';
import { prisma } from '../../common/db.js';
import { AppError } from '../../common/errors.js';
import { createRefreshToken, hashToken, signAccessToken } from './token.service.js';

const refreshExpiresAt = () => new Date(Date.now() + config.JWT_REFRESH_TTL_DAYS * 86_400_000);

export async function register(input: { email: string; password: string; nickname: string }) {
  const email = input.email.trim().toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) {
    throw new AppError('EMAIL_TAKEN', 409, 'Email is already registered');
  }

  const passwordHash = await argon2.hash(input.password);
  const role = await prisma.role.findUnique({ where: { code: 'user' } });
  if (!role) throw new AppError('ROLE_NOT_INITIALIZED', 500, 'Run seed first');

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({ data: { email, passwordHash, nickname: input.nickname.trim() } });
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
  if (!stored) throw new AppError('INVALID_REFRESH_TOKEN', 401, 'Refresh token invalid');
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

### 4. controller 与 routes

`apps/api/src/modules/auth/auth.controller.ts`：

```ts
import type { Request, Response } from 'express';
import { config } from '../../common/config.js';
import { AppError } from '../../common/errors.js';
import { login, logout, refresh, register } from './auth.service.js';

const COOKIE = 'refresh_token';

function setCookie(res: Response, token: string) {
  res.cookie(COOKIE, token, {
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
  setCookie(res, result.refreshToken);
  res.status(200).json({ accessToken: result.accessToken, user: result.user });
}

export async function refreshHandler(req: Request, res: Response) {
  const token = req.cookies[COOKIE] ?? req.body?.refreshToken;
  if (!token) throw new AppError('REFRESH_TOKEN_REQUIRED', 401, 'Refresh token required');
  const result = await refresh({ refreshToken: token });
  setCookie(res, result.refreshToken);
  res.status(200).json({ accessToken: result.accessToken });
}

export async function logoutHandler(req: Request, res: Response) {
  const token = req.cookies[COOKIE] ?? req.body?.refreshToken;
  if (token) await logout(token);
  res.clearCookie(COOKIE, { path: '/api/v1/auth' });
  res.status(204).send();
}
```

`apps/api/src/modules/auth/auth.routes.ts`：

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

### 5. common/auth.ts

`apps/api/src/common/auth.ts`：

```ts
import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../modules/auth/token.service.js';
import { AppError } from './errors.js';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.header('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return next(new AppError('UNAUTHORIZED', 401, 'Authentication required'));
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
  if (!token) return next();
  try {
    req.user = verifyAccessToken(token);
  } catch {
    // 匿名请求继续；需要登录的接口由 requireAuth 拦截
  }
  next();
};
```

### 6. app.ts 挂载

`apps/api/src/app.ts` 改完后的完整文件（新增 CORS、Cookie 解析和 auth 路由）：

```ts
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import type { Express } from 'express';
import { config } from './common/config.js';
import { errorHandler, notFound, requestId } from './common/middleware.js';
import { authRouter } from './modules/auth/auth.routes.js';

export function createApp(): Express {
  const app = express();

  app.use(requestId);
  app.use(cors({ origin: config.WEB_ORIGIN, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/v1/auth', authRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
```

### 7. 验收

```bash
curl -i -X POST http://127.0.0.1:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"a@test.com","password":"Passw0rd!","nickname":"A"}'

curl -i -c /tmp/cookies.txt -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@test.com","password":"Passw0rd!"}'

curl -i -b /tmp/cookies.txt -X POST http://127.0.0.1:3000/api/v1/auth/refresh
```

注册 201、登录 200、刷新 200；旧 refresh 重放 401。

**产出**：commit `feat: add auth with refresh rotation`。

---

## Day 5：发帖、关注、feed

**今天目标**：登录用户能发帖；列表只显示 published；关注后 feed 能看到对方帖子。

### 1. posts 模块

先补一个路由参数解析函数。Express 5 的类型把 `req.params` 的值定义成 `string | string[]`（给通配路由留的），不能直接塞给 `BigInt()`，否则会报 TS2345。统一在边界校验：

`apps/api/src/common/params.ts` 完整文件：

```ts
import { AppError } from './errors.js';

export function parseBigIntId(value: string | string[] | undefined, field = 'id'): bigint {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new AppError('INVALID_ID', 400, `Invalid ${field}`);
  }

  return BigInt(value);
}
```

`apps/api/src/modules/posts/posts.service.ts`：

```ts
import type { Prisma } from '@prisma/client';
import { prisma } from '../../common/db.js';
import { AppError } from '../../common/errors.js';

const select = {
  id: true, authorId: true, title: true, content: true,
  status: true, likeCount: true, commentCount: true, createdAt: true,
  author: { select: { id: true, nickname: true, avatarUrl: true } },
} satisfies Prisma.PostSelect;

type PostRow = Prisma.PostGetPayload<{ select: typeof select }>;

const toPost = (post: PostRow) => ({
  ...post,
  id: post.id.toString(),
  authorId: post.authorId.toString(),
  author: { ...post.author, id: post.author.id.toString() },
});

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

`apps/api/src/modules/posts/posts.routes.ts`：

```ts
import { Router } from 'express';
import { optionalAuth, requireAuth } from '../../common/auth.js';
import { asyncHandler } from '../../common/middleware.js';
import { parseBigIntId } from '../../common/params.js';
import { createPost, getPost, listPublishedPosts } from './posts.service.js';

export const postsRouter = Router();

const userId = (req: { user?: { sub: string } }) => BigInt(req.user!.sub);

postsRouter.get('/', asyncHandler(async (_req, res) => {
  res.json({ items: await listPublishedPosts() });
}));

postsRouter.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  res.json(await getPost(parseBigIntId(req.params.id), req.user ? userId(req) : undefined));
}));

postsRouter.post('/', requireAuth, asyncHandler(async (req, res) => {
  res.status(201).json(await createPost(userId(req), req.body));
}));
```

### 2. 关注

`apps/api/src/modules/users/users.service.ts`：

```ts
import { prisma } from '../../common/db.js';
import { AppError } from '../../common/errors.js';

export async function follow(followerId: bigint, followeeId: bigint) {
  if (followerId === followeeId) throw new AppError('CANNOT_FOLLOW_SELF', 400, 'Cannot follow yourself');
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

`apps/api/src/modules/users/users.routes.ts`：

```ts
import { Router } from 'express';
import { requireAuth } from '../../common/auth.js';
import { asyncHandler } from '../../common/middleware.js';
import { parseBigIntId } from '../../common/params.js';
import { follow, unfollow } from './users.service.js';

export const usersRouter = Router();
usersRouter.use(requireAuth);

usersRouter.post('/:id/follow', asyncHandler(async (req, res) => {
  res.json(await follow(BigInt(req.user!.sub), parseBigIntId(req.params.id, 'followeeId')));
}));

usersRouter.delete('/:id/follow', asyncHandler(async (req, res) => {
  res.json(await unfollow(BigInt(req.user!.sub), parseBigIntId(req.params.id, 'followeeId')));
}));
```

### 3. feed

`apps/api/src/modules/feed/feed.repository.ts`：

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

`apps/api/src/modules/feed/feed.routes.ts`。游标必须把 `created_at` 和 `id` 一起带上，只返回日期会在同一时间戳的帖子之间重复或漏数据：

```ts
import { Router } from 'express';
import { requireAuth } from '../../common/auth.js';
import { AppError } from '../../common/errors.js';
import { asyncHandler } from '../../common/middleware.js';
import { findFollowingFeed } from './feed.repository.js';

export const feedRouter = Router();

function parseCursor(raw: unknown): { cursorCreatedAt?: Date; cursorId?: bigint } {
  if (raw === undefined) return {};
  if (typeof raw !== 'string') throw new AppError('INVALID_CURSOR', 400, 'Invalid cursor');

  const separator = raw.lastIndexOf('_');
  if (separator < 1) throw new AppError('INVALID_CURSOR', 400, 'Invalid cursor');

  const createdAt = new Date(raw.slice(0, separator));
  const id = raw.slice(separator + 1);
  if (Number.isNaN(createdAt.getTime()) || !/^\d+$/.test(id)) {
    throw new AppError('INVALID_CURSOR', 400, 'Invalid cursor');
  }

  return { cursorCreatedAt: createdAt, cursorId: BigInt(id) };
}

feedRouter.get('/', requireAuth, asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit ?? 20), 50);
  const cursor = parseCursor(req.query.cursor);
  const rows = await findFollowingFeed({ userId: BigInt(req.user!.sub), limit, ...cursor });
  const page = rows.slice(0, limit);
  const last = page[page.length - 1];

  res.json({
    items: page.map((row) => ({
      ...row,
      id: String(row.id),
      author_id: String(row.author_id),
      author: {
        id: String(row.author_id),
        nickname: row.author_nickname,
        avatarUrl: row.author_avatar_url,
      },
    })),
    nextCursor: rows.length > limit && last
      ? `${new Date(last.created_at as string | Date).toISOString()}_${String(last.id)}`
      : null,
  });
}));
```

`apps/api/src/app.ts` 改完后的完整文件（在 Day 4 的基础上挂 posts/users/feed）：

```ts
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import type { Express } from 'express';
import { config } from './common/config.js';
import { errorHandler, notFound, requestId } from './common/middleware.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { feedRouter } from './modules/feed/feed.routes.js';
import { postsRouter } from './modules/posts/posts.routes.js';
import { usersRouter } from './modules/users/users.routes.js';

export function createApp(): Express {
  const app = express();

  app.use(requestId);
  app.use(cors({ origin: config.WEB_ORIGIN, credentials: true }));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/posts', postsRouter);
  app.use('/api/v1/users', usersRouter);
  app.use('/api/v1/feed', feedRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
```

### 4. 验收

1. 用 `admin@test.com` 发一条帖子，Prisma Studio 改成 `published`。
2. 用 `a@test.com` 登录，关注 admin。
3. 请求 feed：

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "http://127.0.0.1:3000/api/v1/feed?limit=20"
```

预期：能看到 admin 的 published 帖子；重复关注只一行；关注自己 400。

### 5. 01–05 完成标准

- [ ] 空目录能起 monorepo + Express `/health`
- [ ] 配置坏值启动失败；404 是 JSON；日志有 requestId
- [ ] Prisma 迁移/种子成功
- [ ] 注册 → 登录 → 刷新 → 登出全走通
- [ ] 发帖 pending；列表只显示 published
- [ ] 关注幂等；feed 能返回关注对象的帖子
- [ ] 每天提交一次，提交信息能看出当天做了什么

**产出**：commit `feat: add posts follow and feed`。

下一步：[后端 06–10](/blog/posts/node-roadmap-19-community-week-2/)，补评论、点赞、通知、SSE、OpenAPI 和 CI。
