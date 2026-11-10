---
title: '前端 P2a：性能、E2E 与部署'
published: 2026-11-10T11:50:00+08:00
updated: 2026-11-10T11:50:00+08:00
description: '前端第四阶段：Next.js 性能优化、Playwright E2E、Docker/Nginx/K8s Ingress 部署与生产环境检查。'
tags: [社区全栈, 前端, Next.js, Playwright]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 前端 P2a。上一篇：[前端 P1](/blog/posts/community-fullstack-fe-03-p1-admin/)；下一篇：[前端 P2b](/blog/posts/community-fullstack-fe-05-p2b-search-ai/)；后端对应篇：[后端 P2a](/blog/posts/node-roadmap-21-community-week-4/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

P2a 让前端从「能跑」变成「能上线」：性能、E2E、部署和生产检查。功能不再增加，重点是把体验和交付质量固定下来。

---

## 1. 目标与范围

- RSC/流式/缓存策略优化。
- 首屏与交互性能检查。
- Playwright E2E 主链路。
- Docker/Nginx/K8s Ingress 部署。
- 生产环境变量、错误页、404。

---

## 2. 性能

- 首屏用 Server Component，避免把大列表塞进 client bundle。
- 列表分页/游标加载，不一次性拉全量。
- 图片用 `next/image`，设置尺寸和 lazy。
- 路由级 `loading.tsx`，避免白屏。
- 大组件用 `dynamic(() => import(...), { ssr: false })` 只在必要时使用。
- 构建后看 `next build` 输出的 First Load JS；超过预算的页面要拆。

```tsx
// app/(public)/feed/loading.tsx
export default function Loading() {
  return <div className="mx-auto max-w-2xl py-8">加载中...</div>;
}
```

---

## 3. 缓存与刷新

- 公开列表可短 TTL；登录态/管理端用 `cache: 'no-store'`。
- 点赞/评论后局部刷新，不要 `router.refresh()` 整页。
- SSE 通知直接更新 Query cache，减少轮询。

---

## 4. Playwright E2E

安装：

```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

主链路用例：

```ts
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

至少覆盖：注册/登录、发帖、评论、点赞、关注、管理端审核。测试数据用独立账号，测试结束清理。

---

## 5. 部署

### Docker

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

### Nginx / K8s

- 前端和 API 同源：`/api/` 反代到 api/admin-api，`/` 反代到 web。
- SSE location 单独关闭 buffering。
- K8s Ingress 配置 TLS、超时和 body size。
- 环境变量通过 ConfigMap/Secret 注入，不把 `.env` 打进镜像。

---

## 6. 生产检查

- [ ] 404/500 页面有品牌和返回入口
- [ ] `NEXT_PUBLIC_*` 只放非敏感配置
- [ ] refresh Cookie `Secure` + `SameSite`
- [ ] 管理端 403 页面明确提示
- [ ] 首屏无布局抖动；图片有尺寸
- [ ] E2E 主链路通过
- [ ] 部署后 `/feed`、`/login`、`/admin` 可访问

---

## 7. 常见坑

- **client bundle 过大**：把表格/编辑器等重组件按需加载。
- **缓存登录态**：用户相关请求不要长缓存。
- **E2E 依赖真实数据**：用独立账号/固定 fixture，测试可重复。
- **前端直连后端**：生产走同源反代，避免 CORS 和 Cookie 问题。
- **环境变量泄漏**：`NEXT_PUBLIC_*` 会进浏览器，不能放密钥。

下一步：[前端 P2b](/blog/posts/community-fullstack-fe-05-p2b-search-ai/)，做搜索和 AI 助手交互。
