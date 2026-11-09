---
title: '18 · 社区服务 0→1：第 1 周（Day 1–6）地基与认证'
published: 2026-11-09T22:31:00+08:00
updated: 2026-11-09T22:31:00+08:00
description: '从空目录到认证闭环：Express 启动、配置/日志/错误、Prisma 完整领域模型、注册登录刷新、RBAC、关注和 5 个测试。'
tags: [Node.js, Express, Prisma, 认证]
category: Node全栈学习路线
draft: false
---

> [!NOTE]
> 本系列第 2/6 篇。上一篇：[总览、架构与系列索引](/blog/posts/node-roadmap-17-express-zero-to-one-30-days/)；下一篇：[第 2 周：内容核心](/blog/posts/node-roadmap-19-community-week-2/)；合集：[Node.js 全栈开发路线](/blog/node-roadmap/)。

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

> [!TIP]
> 今天不需要新增依赖：Day 1 已经装了 `dotenv`、`zod`、`pino`。

### 1. 准备环境变量

先把 `.env` 挡在 Git 外面。`.gitignore` 完整内容如下：

```text
node_modules/
dist/
coverage/
.idea/
.env
.env.*
!.env.example
```

`.env.example` 完整内容如下（可以提交，作为团队模板）：

```ini
NODE_ENV=development
PORT=3000
DATABASE_URL="mysql://root:root@127.0.0.1:3306/community"
REDIS_URL="redis://127.0.0.1:6379"
JWT_SECRET="replace-with-a-random-string-at-least-32-chars"
WEB_ORIGIN="http://localhost:5173"
LOG_LEVEL=info
```

`.env` 完整内容如下（**只放本地，不要提交**）：

```ini
NODE_ENV=development
PORT=3000
DATABASE_URL="mysql://root:root@127.0.0.1:3306/community"
REDIS_URL="redis://127.0.0.1:6379"
JWT_SECRET="dev-only-change-me-0123456789abcdef"
WEB_ORIGIN="http://localhost:5173"
LOG_LEVEL=debug
```

生成方式：

```bash
cp .env.example .env
```

> [!TIP]
> 这里的账号、密码、库名要和 Day 1 的 `docker-compose.yml` 保持一致；如果你改过 compose，`.env` 也要同步改。

> [!WARNING]
> `JWT_SECRET` 至少 32 个字符；示例值只能用于本地。`.env` 必须命中 `.gitignore`，否则第一次 `git add .` 就会把密钥提交进去。

### 2. 写 src/common/config.ts

路径：`src/common/config.ts`。完整内容如下：

```ts
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  WEB_ORIGIN: z.url(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  console.error(parsed.error.issues);
  process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;
```

**为什么启动即校验**：坏配置不要等到第一次请求才炸。`z.coerce.number()` 负责把字符串端口转成数字，`z.url()` 负责校验连接串格式。

### 3. 写 src/common/logger.ts

路径：`src/common/logger.ts`。完整内容如下：

```ts
import pino from 'pino';
import { config } from './config.js';

export const logger = pino({
  level: config.LOG_LEVEL,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      '*.password',
      'token',
      '*.token',
    ],
    censor: '[REDACTED]',
  },
});
```

**为什么用 pino**：结构化 JSON 可以直接按字段检索；`redact` 保证密码、Cookie、Authorization 不会进日志。

### 4. 写 src/common/errors.ts

路径：`src/common/errors.ts`。完整内容如下：

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

**为什么要有 AppError**：业务代码只表达「错误码 + HTTP 状态 + 可展示消息」，不用在 controller 里拼响应。

### 5. 写 src/common/middleware.ts

路径：`src/common/middleware.ts`。完整内容如下：

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

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/;

export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.header('x-request-id');
  const id = incoming && REQUEST_ID_PATTERN.test(incoming) ? incoming : randomUUID();

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

  if (err instanceof SyntaxError && 'body' in err) {
    logger.warn({ err, requestId }, 'invalid json body');
    res.status(400).json({
      code: 'INVALID_JSON',
      message: 'Request body is not valid JSON',
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

四个中间件分别解决什么：

- `requestId`：优先透传合法的 `x-request-id`，没有就生成 UUID；同时写回响应头。
- `asyncHandler`：把同步异常和 rejected Promise 都交给 `next()`，统一进错误中间件。
- `notFound`：所有未命中路由统一变成 `AppError('NOT_FOUND', 404, ...)`。
- `errorHandler`：`AppError` → 业务码，`ZodError` → 400，坏的 JSON body → 400，其他 → 500。

> [!NOTE]
> Express 5 已经能自动捕获 async handler 的 rejected Promise。`asyncHandler` 保留下来是为了统一写法，也方便以后换回 Express 4 或接入自定义包装。

### 6. 更新 src/app.ts

路径：`src/app.ts`。完整内容如下（整体替换 Day 1 的版本）：

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

挂载顺序不能乱：

- `requestId` 必须最前，后面所有日志和错误响应才能拿到同一个 id；
- `express.json()` 在路由之前；
- `notFound` 必须在所有路由之后；
- `errorHandler` 必须最后，而且必须是 4 个参数，否则 Express 不会把它当错误中间件。

### 7. 更新 src/server.ts

路径：`src/server.ts`。完整内容如下：

```ts
import { config } from './common/config.js';
import { logger } from './common/logger.js';
import { createApp } from './app.js';

const app = createApp();

app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'API listening');
});
```

**为什么用 `config.PORT`**：端口来源只保留 `.env` 一处，不在代码里散落 `process.env`。

### 8. 启动并验收

```bash
pnpm dev
```

另开一个终端，按顺序验收。

**验收 1：健康检查带 requestId**

```bash
curl -i -H "x-request-id: test-123" http://127.0.0.1:3000/health
```

预期（重点是响应头里的 `x-request-id: test-123`）：

```http
HTTP/1.1 200 OK
x-request-id: test-123
Content-Type: application/json; charset=utf-8

{"status":"ok"}
```

**验收 2：404 返回 JSON，不是 HTML**

```bash
curl -i http://127.0.0.1:3000/nope
```

预期：

```http
HTTP/1.1 404 Not Found
x-request-id: <uuid>
Content-Type: application/json; charset=utf-8

{"code":"NOT_FOUND","message":"Route not found: GET /nope","details":null,"requestId":"<uuid>"}
```

**验收 3：未捕获异常返回 500 JSON，并且日志能用 requestId 找到**

临时在 `src/app.ts` 的 `/health` 后面加一个测试路由（验证完删除）：

```ts
app.get('/boom', asyncHandler(async () => {
  throw new Error('boom');
}));
```

同时把 `asyncHandler` 加进 import：

```ts
import { asyncHandler, errorHandler, notFound, requestId } from './common/middleware.js';
```

重启后：

```bash
curl -i http://127.0.0.1:3000/boom
```

预期：

```http
HTTP/1.1 500 Internal Server Error
x-request-id: <uuid>
Content-Type: application/json; charset=utf-8

{"code":"INTERNAL_ERROR","message":"Internal server error","requestId":"<uuid>"}
```

终端日志里会出现同一条 `requestId` 的 `unhandled error`，并带 `err.stack`。用这个 id 去日志里搜，就能把一次请求串起来。

**验收 4：坏的 JSON body 返回 400**

```bash
curl -i -X POST -H "Content-Type: application/json" -d '{bad' http://127.0.0.1:3000/health
```

预期：

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8

{"code":"INVALID_JSON","message":"Request body is not valid JSON","requestId":"<uuid>"}
```

**验收 5：坏配置启动即失败**

```bash
JWT_SECRET=short pnpm dev
```

预期进程直接退出，并打印 `Invalid environment variables`，而不是带病启动。PowerShell 下等价写法是 `$env:JWT_SECRET='short'; pnpm dev`。

**达到什么效果**

- `curl -i /health` 响应头有 `x-request-id`。
- `curl /nope` 返回 `{code:"NOT_FOUND"}`，不是 HTML。
- 临时 `/boom` 返回 500 JSON，日志里能用 requestId 找到这条。
- 坏的 JSON body 返回 400，不是 500。
- `JWT_SECRET` 不合法时服务启动失败。

**产出**：commit `feat: unify config logging errors and trace`。

```bash
git add .
git commit -m "feat: unify config logging errors and trace"
```

## Day 3：Prisma、完整领域模型、种子

**今天目标**：把社区核心业务表一次建齐，生成 Prisma Client，并写入管理员/普通用户和 RBAC 种子数据。

> [!NOTE]
> 今天会把后面 20 多天要用的表一次建好，避免每天改 schema。表按「身份 / 内容 / 关系 / 通知 / 治理 / 基础设施」分组，后面每天只写业务代码和必要迁移。

### 1. 安装与初始化

```bash
pnpm add @prisma/client argon2
pnpm add -D prisma
pnpm exec prisma init --datasource-provider mysql
```

说明：`argon2` 今天就要用，因为 seed 要创建可登录的 admin 用户；Day 4 不再重复安装。

确认 Day 2 的 `.env` 里有：

```ini
DATABASE_URL="mysql://root:root@127.0.0.1:3306/community"
```

### 2. 写 prisma/schema.prisma

路径：`prisma/schema.prisma`。完整内容如下：

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

enum PostVisibility {
  public
  followers
  private
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

enum NotificationType {
  like
  comment
  follow
  system
}

enum ReportTargetType {
  post
  comment
  user
}

enum ReportStatus {
  pending
  resolved
  rejected
}

enum ModerationAction {
  approve
  reject
  delete
  ban
}

enum OutboxStatus {
  pending
  processing
  done
  failed
}

model User {
  id              BigInt        @id @default(autoincrement())
  email           String        @unique @db.VarChar(255)
  phone           String?       @unique @db.VarChar(32)
  passwordHash    String        @map("password_hash") @db.VarChar(255)
  nickname        String        @db.VarChar(64)
  avatarUrl       String?       @map("avatar_url") @db.VarChar(512)
  bio             String?       @db.VarChar(255)
  status          UserStatus    @default(active)
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  refreshTokens   RefreshToken[]
  roles           UserRole[]
  posts           Post[]
  comments        Comment[]
  likes           Like[]
  following       Follow[]      @relation("follower")
  followers       Follow[]      @relation("followee")
  notifications   Notification[] @relation("notification_recipient")
  reports         Report[]      @relation("report_reporter")
  idempotencyKeys IdempotencyKey[]

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
  @@index([expiresAt])
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
  id              BigInt           @id @default(autoincrement())
  code            String           @unique @db.VarChar(64)
  name            String           @db.VarChar(64)
  createdAt       DateTime         @default(now()) @map("created_at")

  rolePermissions RolePermission[]

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
  roleId       BigInt @map("role_id")
  permissionId BigInt @map("permission_id")

  role       Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
  @@index([permissionId])
  @@map("role_permissions")
}

model Post {
  id           BigInt         @id @default(autoincrement())
  authorId     BigInt         @map("author_id")
  title        String?        @db.VarChar(200)
  content      String         @db.Text
  status       PostStatus     @default(pending)
  visibility   PostVisibility @default(public)
  likeCount    Int            @default(0) @map("like_count")
  commentCount Int            @default(0) @map("comment_count")
  createdAt    DateTime       @default(now()) @map("created_at")
  updatedAt    DateTime       @updatedAt @map("updated_at")
  deletedAt    DateTime?      @map("deleted_at")

  author       User           @relation(fields: [authorId], references: [id])
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
  @@index([parentId])
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

model Notification {
  id         BigInt           @id @default(autoincrement())
  userId     BigInt           @map("user_id")
  type       NotificationType
  actorId    BigInt?          @map("actor_id")
  targetType String?          @map("target_type") @db.VarChar(32)
  targetId   BigInt?          @map("target_id")
  payload    Json?
  readAt     DateTime?        @map("read_at")
  createdAt  DateTime         @default(now()) @map("created_at")

  user       User             @relation("notification_recipient", fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([userId, readAt])
  @@map("notifications")
}

model Report {
  id         BigInt           @id @default(autoincrement())
  reporterId BigInt           @map("reporter_id")
  targetType ReportTargetType @map("target_type")
  targetId   BigInt           @map("target_id")
  reason     String           @db.VarChar(255)
  status     ReportStatus     @default(pending)
  handledBy  BigInt?          @map("handled_by")
  createdAt  DateTime         @default(now()) @map("created_at")

  reporter   User             @relation("report_reporter", fields: [reporterId], references: [id], onDelete: Cascade)

  @@index([status, createdAt])
  @@index([targetType, targetId])
  @@map("reports")
}

model ModerationRecord {
  id         BigInt           @id @default(autoincrement())
  targetType String           @map("target_type") @db.VarChar(32)
  targetId   BigInt           @map("target_id")
  action     ModerationAction
  operatorId BigInt?          @map("operator_id")
  reason     String?          @db.VarChar(255)
  createdAt  DateTime         @default(now()) @map("created_at")

  @@index([targetType, targetId])
  @@index([createdAt])
  @@map("moderation_records")
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

model IdempotencyKey {
  key         String   @id @db.VarChar(128)
  userId      BigInt   @map("user_id")
  requestHash String   @map("request_hash") @db.Char(64)
  response    Json?
  status      String   @default("processing") @db.VarChar(20)
  createdAt   DateTime @default(now()) @map("created_at")
  expiresAt   DateTime @map("expires_at")

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([expiresAt])
  @@map("idempotency_keys")
}
```

几个关键决策：

- **BigInt 主键**：对外统一转成字符串，避免 JavaScript 精度丢失。
- **软删除**：帖子/评论用 `status + deletedAt`，不物理删除，方便审计和恢复。
- **唯一约束**：`likes` 的 `(userId, targetType, targetId)`、`follows` 的复合主键、`refresh_tokens.token_hash`，都是幂等的最后一道防线。
- **复合索引**：按真实查询建，不为「可能用到」建索引。
- **审计字段不建外键**：`handledBy`、`operatorId`、`actorId` 故意只存 ID，用户删除后审计记录仍然保留。

### 3. 写 src/common/db.ts

路径：`src/common/db.ts`。完整内容如下：

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

**为什么挂到 globalThis**：`tsx watch` 热重载会重复执行模块，不挂全局会不断创建新的连接池。

### 4. 写 prisma/seed.ts

路径：`prisma/seed.ts`。完整内容如下：

```ts
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const permissionSeeds = [
    { code: 'admin:access', name: '访问后台' },
    { code: 'post:review', name: '审核帖子' },
    { code: 'report:handle', name: '处理举报' },
    { code: 'user:ban', name: '封禁用户' },
  ];

  for (const item of permissionSeeds) {
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

  const permissions = await prisma.permission.findMany();
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  const passwordHash = await argon2.hash('Admin123!ChangeMe');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: { passwordHash },
    create: {
      email: 'admin@test.com',
      passwordHash,
      nickname: 'Admin',
    },
  });
  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: admin.id, roleId: adminRole.id },
    },
    update: {},
    create: { userId: admin.id, roleId: adminRole.id },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: { passwordHash },
    create: {
      email: 'user@test.com',
      passwordHash,
      nickname: 'User',
    },
  });
  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: user.id, roleId: userRole.id },
    },
    update: {},
    create: { userId: user.id, roleId: userRole.id },
  });

  console.log('Seed done: admin@test.com / user@test.com');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

在 `package.json` 顶层增加 seed 配置（不要覆盖已有字段）：

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

### 5. 执行迁移和种子

```bash
pnpm exec prisma migrate dev --name init
pnpm exec prisma db seed
pnpm exec prisma studio
```

### 6. 验收

```bash
pnpm exec prisma migrate status
```

预期：`Database schema is up to date!`，没有 drift。

打开 `pnpm exec prisma studio`，确认能看到：

- `users`：`admin@test.com`、`user@test.com`
- `roles`：`admin`、`user`
- `permissions`：4 条
- `user_roles`：管理员绑定 admin，普通用户绑定 user
- 其余内容/关系/通知/治理表已建好，暂时为空

再跑一次种子，确认幂等：

```bash
pnpm exec prisma db seed
```

预期：不报唯一键冲突，数据不重复。

**常见错误**

- `P1001 Can't reach database server`：MySQL 没起，先 `docker compose ps`。
- `Environment variable not found: DATABASE_URL`：不在项目根目录执行，或 `.env` 没加载。
- `prisma db seed` 不执行：`package.json` 的 `prisma.seed` 没配。
- 迁移 drift：开发期不要手改表，确需重来用 `pnpm exec prisma migrate reset`。

**产出**：commit `feat: add prisma schema and seed`。

```bash
git add .
git commit -m "feat: add prisma schema and seed"
```

## Day 4：注册、登录、刷新、登出

**今天目标**：完整认证闭环，refresh 轮换，旧 refresh 不能重放。

### 1. 安装依赖

```bash
pnpm add jsonwebtoken cookie-parser cors
pnpm add -D @types/jsonwebtoken @types/cookie-parser @types/cors
```

`argon2` 在 Day 3 已安装，不重复装。

### 2. 给 config.ts 增加两个字段

在 Day 2 的 `envSchema` 里追加：

```ts
JWT_ACCESS_TTL: z.string().default('15m'),
JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(7),
```

`.env.example` 和 `.env` 同步增加：

```ini
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL_DAYS=7
```

### 3. 写 src/types/express.d.ts

路径：`src/types/express.d.ts`。完整内容如下：

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

这样后面的 `requireAuth` 就能直接写 `req.user`，不用到处 `as any`。

### 4. 写 src/modules/auth/token.service.ts

路径：`src/modules/auth/token.service.ts`。完整内容如下：

```ts
import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { config } from '../../common/config.js';

export type AccessPayload = {
  sub: string;
  roles: string[];
};

export function signAccessToken(payload: AccessPayload): string {
  const expiresIn = config.JWT_ACCESS_TTL as SignOptions['expiresIn'];
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn, algorithm: 'HS256' });
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, config.JWT_SECRET, { algorithms: ['HS256'] });
  if (typeof decoded === 'string') {
    throw new Error('Invalid token payload');
  }
  return {
    sub: String(decoded.sub),
    roles: Array.isArray(decoded.roles) ? decoded.roles.map(String) : [],
  };
}

export function createRefreshToken(): { token: string; tokenHash: string } {
  const token = randomBytes(48).toString('base64url');
  return { token, tokenHash: hashToken(token) };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
```

**为什么 refresh 存哈希**：数据库泄露时，攻击者拿到的是 sha256，不是可直接使用的 refresh token。

### 5. 写 auth.schemas.ts、auth.service.ts、auth.controller.ts、auth.routes.ts

路径：`src/modules/auth/auth.schemas.ts`。完整内容如下：

```ts
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(72),
  nickname: z.string().min(1).max(64),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(72),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});
```

路径：`src/modules/auth/auth.service.ts`。完整内容如下：

```ts
import argon2 from 'argon2';
import { config } from '../../common/config.js';
import { prisma } from '../../common/db.js';
import { AppError } from '../../common/errors.js';
import { createRefreshToken, hashToken, signAccessToken } from './token.service.js';

type UserWithRoles = {
  id: bigint;
  email: string;
  nickname: string;
  status: string;
  roles: { role: { code: string } }[];
};

function toPublicUser(user: UserWithRoles) {
  return {
    id: user.id.toString(),
    email: user.email,
    nickname: user.nickname,
    roles: user.roles.map((item) => item.role.code),
  };
}

function refreshExpiresAt(): Date {
  return new Date(Date.now() + config.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export async function register(input: { email: string; password: string; nickname: string }) {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('EMAIL_TAKEN', 409, 'Email is already registered');
  }

  const passwordHash = await argon2.hash(input.password);
  const userRole = await prisma.role.findUnique({ where: { code: 'user' } });
  if (!userRole) {
    throw new AppError('ROLE_NOT_INITIALIZED', 500, 'User role is missing; run seed');
  }

  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: { email, passwordHash, nickname: input.nickname.trim() },
    });
    await tx.userRole.create({ data: { userId: created.id, roleId: userRole.id } });
    return created;
  });

  return { id: user.id.toString(), email: user.email, nickname: user.nickname };
}

export async function login(input: {
  email: string;
  password: string;
  userAgent?: string;
  ip?: string;
}) {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } },
  });
  if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
    throw new AppError('INVALID_CREDENTIALS', 401, 'Email or password is incorrect');
  }
  if (user.status !== 'active') {
    throw new AppError('ACCOUNT_DISABLED', 403, 'Account is not active');
  }

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
    user: toPublicUser(user),
  };
}

export async function refresh(input: { refreshToken: string }) {
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(input.refreshToken) },
  });
  if (!stored) {
    throw new AppError('INVALID_REFRESH_TOKEN', 401, 'Refresh token is invalid');
  }
  if (stored.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: stored.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw new AppError('REFRESH_TOKEN_REUSED', 401, 'Refresh token reuse detected');
  }
  if (stored.expiresAt <= new Date()) {
    throw new AppError('REFRESH_TOKEN_EXPIRED', 401, 'Refresh token is expired');
  }

  const user = await prisma.user.findUnique({
    where: { id: stored.userId },
    include: { roles: { include: { role: true } } },
  });
  if (!user || user.status !== 'active') {
    throw new AppError('ACCOUNT_DISABLED', 403, 'Account is not active');
  }

  const next = createRefreshToken();
  await prisma.$transaction([
    prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    }),
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

路径：`src/modules/auth/auth.controller.ts`。完整内容如下：

```ts
import type { Request, Response } from 'express';
import { config } from '../../common/config.js';
import { AppError } from '../../common/errors.js';
import { loginSchema, refreshSchema, registerSchema } from './auth.schemas.js';
import { login, logout, refresh, register } from './auth.service.js';

const REFRESH_COOKIE = 'refresh_token';

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.NODE_ENV === 'production',
    path: '/api/v1/auth',
    maxAge: config.JWT_REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

export async function registerHandler(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  res.status(201).json(await register(input));
}

export async function loginHandler(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const result = await login({
    ...input,
    userAgent: req.header('user-agent'),
    ip: req.ip,
  });
  setRefreshCookie(res, result.refreshToken);
  res.status(200).json({ accessToken: result.accessToken, user: result.user });
}

export async function refreshHandler(req: Request, res: Response) {
  const body = refreshSchema.parse(req.body ?? {});
  const refreshToken = req.cookies[REFRESH_COOKIE] ?? body.refreshToken;
  if (!refreshToken) {
    throw new AppError('REFRESH_TOKEN_REQUIRED', 401, 'Refresh token is required');
  }
  const result = await refresh({ refreshToken });
  setRefreshCookie(res, result.refreshToken);
  res.status(200).json({ accessToken: result.accessToken });
}

export async function logoutHandler(req: Request, res: Response) {
  const body = refreshSchema.parse(req.body ?? {});
  const refreshToken = req.cookies[REFRESH_COOKIE] ?? body.refreshToken;
  if (refreshToken) {
    await logout(refreshToken);
  }
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
  res.status(204).send();
}
```

路径：`src/modules/auth/auth.routes.ts`。完整内容如下：

```ts
import { Router } from 'express';
import { asyncHandler } from '../../common/middleware.js';
import {
  loginHandler,
  logoutHandler,
  refreshHandler,
  registerHandler,
} from './auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(registerHandler));
authRouter.post('/login', asyncHandler(loginHandler));
authRouter.post('/refresh', asyncHandler(refreshHandler));
authRouter.post('/logout', asyncHandler(logoutHandler));
```

### 6. 更新 src/app.ts 挂载认证

在 Day 2 的 `app.ts` 里增加：

```ts
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { config } from './common/config.js';
import { authRouter } from './modules/auth/auth.routes.js';

app.use(cors({ origin: config.WEB_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use('/api/v1/auth', authRouter);
```

最终挂载顺序保持：

```text
requestId → cors → cookieParser → json → routes → notFound → errorHandler
```

### 7. 验收

先注册：

```bash
curl -i -X POST http://127.0.0.1:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"a@test.com","password":"Passw0rd!","nickname":"A"}'
```

预期：`201`，返回用户 id。

登录并保存 Cookie：

```bash
curl -i -c /tmp/cookies.txt -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"a@test.com","password":"Passw0rd!"}'
```

预期：`200`，响应体有 `accessToken`，响应头 `Set-Cookie: refresh_token=...; HttpOnly`。

刷新：

```bash
curl -i -b /tmp/cookies.txt -X POST http://127.0.0.1:3000/api/v1/auth/refresh
```

预期：`200`，返回新的 `accessToken`，并下发新的 refresh Cookie。

旧 refresh 重放：

```bash
OLD=$(awk '$6=="refresh_token" {print $7}' /tmp/cookies.txt)
curl -i -X POST http://127.0.0.1:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$OLD\"}"
```

预期：`401 REFRESH_TOKEN_REUSED`。注意：上面的 `OLD` 取自刷新后的 Cookie；要验证重放，先复制刷新前的 token，再在刷新后使用。最稳妥的做法是 `cp /tmp/cookies.txt /tmp/cookies-old.txt` 后再刷新。

登出后再刷：

```bash
curl -i -b /tmp/cookies.txt -X POST http://127.0.0.1:3000/api/v1/auth/logout
curl -i -b /tmp/cookies.txt -X POST http://127.0.0.1:3000/api/v1/auth/refresh
```

预期：登出 `204`，再刷 `401`。

**常见错误**

- `401`：access token 过期或 `JWT_SECRET` 不一致。
- Cookie 不生效：`path` 必须和请求路径匹配；跨域时前端要 `credentials: 'include'`。
- 刷新重放测试拿错 token：先备份旧 Cookie，再刷新，再用旧 Cookie 重放。

**产出**：commit `feat: add auth with refresh rotation`。

```bash
git add .
git commit -m "feat: add auth with refresh rotation"
```

## Day 5：RBAC + 用户 + 关注

**今天目标**：未登录 401、无权限 403、重复关注幂等。

### 1. 写 src/common/auth.ts

路径：`src/common/auth.ts`。完整内容如下：

```ts
import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../modules/auth/token.service.js';
import { prisma } from './db.js';
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

export function requirePermission(code: string): RequestHandler {
  return async (req, _res, next) => {
    try {
      if (!req.user) {
        throw new AppError('UNAUTHORIZED', 401, 'Authentication required');
      }
      if (!/^\d+$/.test(req.user.sub)) {
        throw new AppError('UNAUTHORIZED', 401, 'Invalid token subject');
      }

      const found = await prisma.userRole.findFirst({
        where: {
          userId: BigInt(req.user.sub),
          role: {
            rolePermissions: {
              some: { permission: { code } },
            },
          },
        },
        select: { userId: true },
      });

      if (!found) {
        throw new AppError('FORBIDDEN', 403, 'Permission denied');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
```

**为什么权限查库而不是只信 JWT**：JWT 里的 roles 可能已经过期；后台权限变更要能立即生效。读多写少的场景后续再加 Redis 缓存。

### 2. 写 users 模块

路径：`src/modules/users/users.schemas.ts`。完整内容如下：

```ts
import { z } from 'zod';

export const updateMeSchema = z
  .object({
    nickname: z.string().min(1).max(64).optional(),
    bio: z.string().max(255).nullable().optional(),
    avatarUrl: z.url().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });
```

路径：`src/modules/users/users.service.ts`。完整内容如下：

```ts
import { prisma } from '../../common/db.js';
import { AppError } from '../../common/errors.js';

export async function getMe(userId: bigint) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } },
  });
  if (!user || user.status === 'deleted') {
    throw new AppError('USER_NOT_FOUND', 404, 'User not found');
  }
  return {
    id: user.id.toString(),
    email: user.email,
    nickname: user.nickname,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    roles: user.roles.map((item) => item.role.code),
    createdAt: user.createdAt,
  };
}

export async function updateMe(
  userId: bigint,
  input: { nickname?: string; bio?: string | null; avatarUrl?: string | null },
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
    select: {
      id: true,
      email: true,
      nickname: true,
      bio: true,
      avatarUrl: true,
      updatedAt: true,
    },
  });
  return { ...user, id: user.id.toString() };
}

export async function follow(followerId: bigint, followeeId: bigint) {
  if (followerId === followeeId) {
    throw new AppError('CANNOT_FOLLOW_SELF', 400, 'You cannot follow yourself');
  }
  const target = await prisma.user.findUnique({
    where: { id: followeeId },
    select: { status: true },
  });
  if (!target || target.status !== 'active') {
    throw new AppError('USER_NOT_FOUND', 404, 'User not found');
  }

  const result = await prisma.follow.createMany({
    data: [{ followerId, followeeId }],
    skipDuplicates: true,
  });
  return { created: result.count === 1 };
}

export async function unfollow(followerId: bigint, followeeId: bigint) {
  const result = await prisma.follow.deleteMany({
    where: { followerId, followeeId },
  });
  return { removed: result.count === 1 };
}
```

路径：`src/modules/users/users.routes.ts`。完整内容如下：

```ts
import { Router } from 'express';
import { requireAuth } from '../../common/auth.js';
import { AppError } from '../../common/errors.js';
import { asyncHandler } from '../../common/middleware.js';
import { updateMeSchema } from './users.schemas.js';
import { follow, getMe, unfollow, updateMe } from './users.service.js';

export const usersRouter = Router();
usersRouter.use(requireAuth);

function currentUserId(req: { user?: { sub: string } }): bigint {
  if (!req.user) {
    throw new AppError('UNAUTHORIZED', 401, 'Authentication required');
  }
  return BigInt(req.user.sub);
}

function parseUserId(value: string | undefined): bigint {
  if (!value || !/^\d+$/.test(value)) {
    throw new AppError('INVALID_USER_ID', 400, 'Invalid user id');
  }
  return BigInt(value);
}

usersRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    res.json(await getMe(currentUserId(req)));
  }),
);

usersRouter.patch(
  '/me',
  asyncHandler(async (req, res) => {
    const input = updateMeSchema.parse(req.body);
    res.json(await updateMe(currentUserId(req), input));
  }),
);

usersRouter.post(
  '/:id/follow',
  asyncHandler(async (req, res) => {
    const result = await follow(currentUserId(req), parseUserId(req.params.id));
    res.status(200).json(result);
  }),
);

usersRouter.delete(
  '/:id/follow',
  asyncHandler(async (req, res) => {
    const result = await unfollow(currentUserId(req), parseUserId(req.params.id));
    res.status(200).json(result);
  }),
);
```

### 3. 写后台权限测试路由

路径：`src/modules/admin/admin.routes.ts`。完整内容如下：

```ts
import { Router } from 'express';
import { requireAuth, requirePermission } from '../../common/auth.js';

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.get('/ping', requirePermission('admin:access'), (_req, res) => {
  res.json({ ok: true });
});
```

### 4. 挂载 users 和 admin

在 `app.ts` 增加：

```ts
import { adminRouter } from './modules/admin/admin.routes.js';
import { usersRouter } from './modules/users/users.routes.js';

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/admin', adminRouter);
```

### 5. 验收

准备两个账号并登录，分别拿到 `USER_TOKEN` 和 `ADMIN_TOKEN`：

```bash
curl -s -X POST http://127.0.0.1:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"b@test.com","password":"Passw0rd!","nickname":"B"}'

USER_TOKEN=$(curl -s -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"b@test.com","password":"Passw0rd!"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).accessToken")

ADMIN_TOKEN=$(curl -s -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"Admin123!ChangeMe"}' | node -pe "JSON.parse(require('fs').readFileSync(0,'utf8')).accessToken")
```

未登录：

```bash
curl -i http://127.0.0.1:3000/api/v1/users/me
```

预期 `401 UNAUTHORIZED`。

普通用户访问后台：

```bash
curl -i -H "Authorization: Bearer $USER_TOKEN" http://127.0.0.1:3000/api/v1/admin/ping
```

预期 `403 FORBIDDEN`。

管理员访问后台：

```bash
curl -i -H "Authorization: Bearer $ADMIN_TOKEN" http://127.0.0.1:3000/api/v1/admin/ping
```

预期 `200 {"ok":true}`。

重复关注：

```bash
curl -s -H "Authorization: Bearer $USER_TOKEN" -X POST http://127.0.0.1:3000/api/v1/users/1/follow
curl -s -H "Authorization: Bearer $USER_TOKEN" -X POST http://127.0.0.1:3000/api/v1/users/1/follow
```

预期两次都返回 `200`，第二次 `{"created":false}`；数据库 `follows` 只有一行。

关注自己：

```bash
curl -i -H "Authorization: Bearer $USER_TOKEN" -X POST http://127.0.0.1:3000/api/v1/users/2/follow
```

预期 `400 CANNOT_FOLLOW_SELF`（把 `2` 换成当前用户 id）。

**常见错误**

- 403：普通用户角色没有 `admin:access` 权限，确认 seed 已跑。
- 关注自己没报错：检查 `followerId === followeeId` 的分支。
- 重复关注报唯一键冲突：必须用 `createMany({ skipDuplicates: true })`，不要用 `create`。

**产出**：commit `feat: add rbac users and follows`。

```bash
git add .
git commit -m "feat: add rbac users and follows"
```

## Day 6（周末）：测试 + 5 分钟讲解

**今天目标**：把第 1 周的能力用测试和讲解固定下来。

### 1. 安装测试依赖

```bash
pnpm add -D vitest supertest @types/supertest
```

### 2. 写 vitest.config.ts

路径：`vitest.config.ts`。完整内容如下：

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 30000,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        'mysql://root:root@127.0.0.1:3306/community_test',
    },
  },
});
```

先建测试库（只建一次）：

```bash
docker exec -i community-mysql mysql -uroot -proot \
  -e "CREATE DATABASE IF NOT EXISTS community_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 3. 写 tests/helpers.ts

路径：`tests/helpers.ts`。完整内容如下：

```ts
import { createApp } from '../src/app.js';
import { prisma } from '../src/common/db.js';

export const app = createApp();

export async function resetDb(): Promise<void> {
  await prisma.$transaction([
    prisma.idempotencyKey.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.like.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.post.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.userRole.deleteMany(),
    prisma.report.deleteMany(),
    prisma.moderationRecord.deleteMany(),
    prisma.outboxEvent.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

export async function seedRoles(): Promise<void> {
  await prisma.role.upsert({
    where: { code: 'user' },
    update: {},
    create: { code: 'user', name: '普通用户' },
  });
  await prisma.role.upsert({
    where: { code: 'admin' },
    update: {},
    create: { code: 'admin', name: '管理员' },
  });
}

export async function registerAndLogin(email: string): Promise<string> {
  await prisma.user.deleteMany({ where: { email } });
  await registerUser(email);
  const login = await loginUser(email);
  return login.body.accessToken as string;
}

async function registerUser(email: string) {
  const { default: request } = await import('supertest');
  return request(app)
    .post('/api/v1/auth/register')
    .send({ email, password: 'Passw0rd!', nickname: email.split('@')[0] });
}

async function loginUser(email: string) {
  const { default: request } = await import('supertest');
  return request(app)
    .post('/api/v1/auth/login')
    .send({ email, password: 'Passw0rd!' });
}
```

> [!TIP]
> 这里用 `await import('supertest')` 是为了避免 helper 在非测试环境被静态加载时引入测试依赖；正常测试里直接 `import request from 'supertest'` 也可以。

### 4. 写 tests/auth.test.ts

路径：`tests/auth.test.ts`。完整内容如下：

```ts
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { app, registerAndLogin, resetDb, seedRoles } from './helpers.js';
import { prisma } from '../src/common/db.js';

describe('auth and follow', () => {
  beforeAll(async () => {
    await seedRoles();
  });

  beforeEach(async () => {
    await resetDb();
  });

  it('registers a user', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'a@test.com', password: 'Passw0rd!', nickname: 'A' });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('a@test.com');
  });

  it('logs in and returns access token', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'a@test.com', password: 'Passw0rd!', nickname: 'A' });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'a@test.com', password: 'Passw0rd!' });

    expect(response.status).toBe(200);
    expect(typeof response.body.accessToken).toBe('string');
  });

  it('rejects unauthenticated /users/me', async () => {
    const response = await request(app).get('/api/v1/users/me');
    expect(response.status).toBe(401);
  });

  it('forbids normal user from admin ping', async () => {
    const token = await registerAndLogin('normal@test.com');
    const response = await request(app)
      .get('/api/v1/admin/ping')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it('follows idempotently', async () => {
    const followerToken = await registerAndLogin('follower@test.com');
    const followee = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'followee@test.com', password: 'Passw0rd!', nickname: 'Followee' });

    const followeeId = followee.body.id as string;
    const first = await request(app)
      .post(`/api/v1/users/${followeeId}/follow`)
      .set('Authorization', `Bearer ${followerToken}`);
    const second = await request(app)
      .post(`/api/v1/users/${followeeId}/follow`)
      .set('Authorization', `Bearer ${followerToken}`);

    expect(first.body.created).toBe(true);
    expect(second.body.created).toBe(false);

    const count = await prisma.follow.count({
      where: {
        follower: { email: 'follower@test.com' },
        followee: { email: 'followee@test.com' },
      },
    });
    expect(count).toBe(1);
  });
});
```

### 5. package.json 增加测试脚本

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### 6. 跑测试

```bash
pnpm test
```

预期：5 个测试全部通过。

**常见错误**

- `P1001`：测试库没建或 MySQL 没起。
- `Table does not exist`：对测试库跑一次 `pnpm exec prisma migrate deploy`。
- 测试互相污染：`fileParallelism: false` + `resetDb()`，不要并行共享同一个库。
- 进程不退出：测试结束要 `prisma.$disconnect()`，或在 `vitest.config.ts` 配 `pool: 'forks'`。

**产出**：commit `test: cover auth and follow`；一段 5 分钟录音。

```bash
git add .
git commit -m "test: cover auth and follow"
```

---
