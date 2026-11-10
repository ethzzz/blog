---
title: '前端 10–12：性能、E2E 与部署'
published: 2026-11-10T11:50:00+08:00
updated: 2026-11-10T11:50:00+08:00
description: 'Day 10–12：Next.js 性能优化、Playwright E2E、Docker/Nginx/K8s Ingress 部署与生产检查。'
tags: [社区全栈, 前端, Next.js, Playwright]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 前端 10–12。上一篇：[前端 07–09](/blog/posts/community-fullstack-fe-03-p1-admin/)；下一篇：[前端 13–15](/blog/posts/community-fullstack-fe-05-p2b-search-ai/)；后端对应篇：[后端 16–18](/blog/posts/node-roadmap-21-community-week-4/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

功能先停一停，处理性能和上线。首屏不要白屏，列表不要一次拉全量，最后用 Playwright 把主链路跑一遍，再装进容器。

---

## Day 10：性能与缓存

**今天目标**：首屏不白屏、列表不拉全量、client bundle 可控。

### 1. RSC 与加载态

- 首屏列表/详情用 Server Component。
- 路由级 `loading.tsx`，避免白屏。
- 大组件按需加载：

```tsx
const Editor = dynamic(() => import('@/components/editor'), { ssr: false });
```

### 2. 列表与图片

- feed/评论用游标分页，不一次性拉全量。
- 图片用 `next/image`，设置宽高和 lazy。
- 长列表用虚拟滚动（可选）。

### 3. 缓存策略

- 公开列表可短 TTL；登录态/管理端 `cache: 'no-store'`。
- 点赞/评论后局部刷新，不要整页 `router.refresh()`。
- SSE 通知直接更新 Query cache，减少轮询。

### 4. 构建检查

```bash
pnpm --filter web build
```

看 First Load JS；超过预算的页面拆组件/动态导入。

**验收**：feed 首屏有 loading；列表不一次拉全量；构建输出没有异常大的 chunk。

**产出**：commit `perf: optimize next rendering and bundles`。

---

## Day 11：Playwright E2E

**今天目标**：注册→登录→发帖→评论→点赞→管理端审核主链路自动化。

### 1. 安装

```bash
pnpm --filter web add -D @playwright/test
pnpm --filter web exec playwright install
```

### 2. 用例

`apps/web/e2e/community.spec.ts`：

```ts
import { test, expect } from '@playwright/test';

test('register -> login -> post -> feed', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel('邮箱').fill('e2e@test.com');
  await page.getByLabel('密码').fill('Passw0rd!');
  await page.getByRole('button', { name: '注册' }).click();

  await page.goto('/login');
  await page.getByLabel('邮箱').fill('e2e@test.com');
  await page.getByLabel('密码').fill('Passw0rd!');
  await page.getByRole('button', { name: '登录' }).click();

  await page.goto('/posts/new');
  await page.getByRole('textbox').fill('e2e post');
  await page.getByRole('button', { name: '发布' }).click();
  await expect(page).toHaveURL(/feed/);
});
```

至少覆盖：注册/登录、发帖、评论、点赞、关注、管理端审核。用独立测试账号，测试后清理。

### 3. 验收

- [ ] 主链路 E2E 通过
- [ ] 失败时截图/录像
- [ ] CI 可选 nightly 跑 E2E

**产出**：commit `test: add playwright e2e`。

---

## Day 12：部署与生产检查

**今天目标**：前端容器化，Nginx/K8s Ingress 同源反代，生产环境可访问。

### 1. Dockerfile

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@12.18.0 --activate
COPY . .
RUN pnpm install --frozen-lockfile && pnpm --filter web build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/web/.next ./.next
COPY --from=build /app/apps/web/public ./public
COPY --from=build /app/apps/web/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
CMD ["pnpm", "start"]
```

### 2. 同源反代

- `/api/` → api
- `/admin-api/` → admin-api
- `/` → web
- SSE location 单独关闭 buffering。

K8s Ingress 配 TLS、超时、body size；环境变量用 ConfigMap/Secret。

### 3. 生产检查

- [ ] 404/500 页面有返回入口
- [ ] `NEXT_PUBLIC_*` 只放非敏感配置
- [ ] refresh Cookie `Secure` + `SameSite`
- [ ] 管理端 403 页面明确
- [ ] 首屏无布局抖动；图片有尺寸
- [ ] 部署后 `/feed`、`/login`、`/admin` 可访问

**产出**：commit `build: dockerize web and add ingress`。

下一步：[前端 13–15](/blog/posts/community-fullstack-fe-05-p2b-search-ai/)，做搜索与 AI 助手。
