---
title: '后端 P0a：Express 公共 API 最小可演示'
published: 2026-11-10T10:20:00+08:00
updated: 2026-11-10T10:20:00+08:00
description: '后端第一阶段：monorepo 迁移、Prisma 领域模型、JWT 认证、发帖与关注流，做出浏览器可演示的最小社区 API。'
tags: [社区全栈, 后端, Express, Prisma]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 后端 P0a。上一篇：[后端总览](/blog/posts/node-roadmap-23-community-fullstack-plan/)；下一篇：[后端 P0b](/blog/posts/node-roadmap-19-community-week-2/)；前端对应篇：[前端 P0a](/blog/posts/community-fullstack-fe-01-p0a-app-shell/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

P0a 只做**最小可演示垂直切片**：认证、发帖、feed。评论、点赞、关注通知不阻塞这一阶段；先让前端能登录、看 feed、发帖，11/24 才能开始投递。

---

## 1. 目标与范围

- 将现有 Express 应用迁入 monorepo 的 `apps/api`。
- 建核心 Prisma 模型：User、RefreshToken、Post、Comment、Like、Follow。
- 完成注册 / 登录 / 刷新 / 登出。
- 完成发帖、帖子列表、帖子详情、关注流。
- Docker Compose 一键起 MySQL/Redis/API。

**不在本阶段**：评论、点赞、通知/SSE、管理端、Redis 缓存、OpenAPI、CI。

---

## 2. Monorepo 迁移

目标结构：

```text
community/
  apps/
    api/
      src/
      prisma/
      package.json
      tsconfig.json
  packages/
    shared/
  infra/
    docker/
  pnpm-workspace.yaml
  package.json
```

`pnpm-workspace.yaml`：

```yaml
packages:
  - apps/*
  - packages/*
```

迁移原则：先 `git mv` 不改业务逻辑，每步跑 `pnpm -r typecheck`，确认 `/health` 仍然可用。

```bash
mkdir -p apps packages/shared/src infra/docker
git mv src apps/api/src
git mv prisma apps/api/prisma
git mv package.json apps/api/package.json
git mv tsconfig.json apps/api/tsconfig.json
```

根 `package.json` 只保留 workspace 脚本：

```json
{
  "private": true,
  "packageManager": "pnpm@12.18.0",
  "scripts": {
    "dev:api": "pnpm --filter api dev",
    "typecheck": "pnpm -r typecheck",
    "build": "pnpm -r build"
  }
}
```

---

## 3. Prisma：先建核心模型

`apps/api/prisma/schema.prisma` 至少包含：

```prisma
model User {
  id           BigInt   @id @default(autoincrement())
  email        String   @unique
  passwordHash String   @map("password_hash")
  nickname     String
  status       UserStatus @default(active)
  createdAt    DateTime @default(now()) @map("created_at")
  posts        Post[]
  refreshTokens RefreshToken[]
  @@map("users")
}

model Post {
  id           BigInt     @id @default(autoincrement())
  authorId     BigInt     @map("author_id")
  content      String     @db.Text
  status       PostStatus @default(pending)
  likeCount    Int        @default(0) @map("like_count")
  commentCount Int        @default(0) @map("comment_count")
  createdAt    DateTime   @default(now()) @map("created_at")
  author       User       @relation(fields: [authorId], references: [id])
  @@index([status, createdAt])
  @@map("posts")
}
```

完整模型（Comment/Like/Follow/Role 等）按仓库 schema 落地。注意：

- Prisma 固定 `6.19.3`，不要裸装 `latest`。
- 主键 BigInt 在 API 边界统一 `toString()`。
- 帖子默认 `pending`，feed 只查 `published`。

```bash
pnpm exec prisma migrate dev --name init
pnpm exec prisma db seed
```

---

## 4. 认证：access JWT + refresh 轮换

`apps/api/src/modules/auth/token.service.ts` 关键逻辑：

```ts
export function signAccessToken(payload: { sub: string; roles: string[] }) {
  return jwt.sign(payload, config.JWT_SECRET, { expiresIn: '15m' });
}

export function createRefreshToken() {
  const token = randomBytes(48).toString('base64url');
  return { token, tokenHash: sha256(token) };
}
```

`login` 返回 accessToken，refresh 放 httpOnly Cookie：

```ts
res.cookie('refresh_token', result.refreshToken, {
  httpOnly: true,
  sameSite: 'lax',
  secure: config.NODE_ENV === 'production',
  path: '/api/v1/auth',
  maxAge: config.JWT_REFRESH_TTL_DAYS * 86400000,
});
```

刷新时撤销旧 token、发新 token；检测到旧 token 重放时撤销该用户全部 refresh。

---

## 5. 发帖与 feed

发帖默认 pending：

```ts
export async function createPost(authorId: bigint, input: { content: string }) {
  const post = await prisma.post.create({
    data: { authorId, content: input.content, status: 'pending' },
  });
  return { ...post, id: post.id.toString(), authorId: authorId.toString() };
}
```

关注流用游标分页，避免 OFFSET：

```sql
SELECT p.*, u.nickname
FROM posts p
JOIN follows f ON f.followee_id = p.author_id AND f.follower_id = ?
JOIN users u ON u.id = p.author_id
WHERE p.status = 'published'
  AND (p.created_at < ? OR (p.created_at = ? AND p.id < ?))
ORDER BY p.created_at DESC, p.id DESC
LIMIT ?;
```

验收时如果 feed 为空，先用 Prisma Studio 把测试帖子改成 `published`。

---

## 6. 启动与验收

```bash
cp .env.example .env
docker compose -f infra/docker/docker-compose.yml up -d mysql redis
pnpm --filter api exec prisma migrate dev
pnpm --filter api exec prisma db seed
pnpm dev:api
```

```bash
curl -i http://127.0.0.1:3000/health
curl -i -X POST http://127.0.0.1:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"a@test.com","password":"Passw0rd!","nickname":"A"}'
```

P0a 验收清单：

- [ ] `/health` 200
- [ ] 注册 201、登录 200、refresh 200
- [ ] 发帖 201，状态 pending
- [ ] 作者能在 feed/详情看到自己的 published 帖子
- [ ] 另一个用户看不到 pending
- [ ] Docker Compose 后 API/MySQL/Redis 都可用

---

## 7. 常见坑

- **Prisma 版本**：`latest` 可能是 8 RC，必须固定 6.19.3。
- **ESM 导入**：NodeNext 下源码写 `./app.js`，不是 `./app`。
- **BigInt JSON**：返回前逐层 `toString()`，否则序列化报错。
- **Cookie 路径**：refresh Cookie 的 `path=/api/v1/auth`，否则刷新接口收不到。
- **feed 为空**：帖子默认 pending，测试数据要手动改成 published。

下一步：[后端 P0b](/blog/posts/node-roadmap-19-community-week-2/)，补评论/点赞/关注/通知与工程化。
