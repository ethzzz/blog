---
title: '前端 P1：管理后台、审核与数据看板'
published: 2026-11-10T11:40:00+08:00
updated: 2026-11-10T11:40:00+08:00
description: '前端第三阶段：Next.js 管理后台布局、权限守卫、Dashboard、帖子审核、举报处理、用户管理与审计表格。'
tags: [社区全栈, 前端, 管理后台, RBAC]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 前端 P1。上一篇：[前端 P0b](/blog/posts/community-fullstack-fe-02-p0b-content-loop/)；下一篇：[前端 P2a](/blog/posts/community-fullstack-fe-04-p2a-quality/)；后端对应篇：[后端 P1](/blog/posts/node-roadmap-20-community-week-3/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

P1 的前端重点是管理后台：审核、举报、用户、Dashboard、审计。它不是「给管理员多几个按钮」，而是权限、表格、表单和状态机的组合。

---

## 1. 目标与范围

- `/admin` 布局与权限守卫。
- Dashboard 统计卡。
- 帖子/评论审核列表。
- 举报列表与处理。
- 用户列表 + 封禁/解封。
- 审计日志表格。

---

## 2. 目录

```text
src/app/(admin)/admin/
  layout.tsx
  page.tsx
  posts/page.tsx
  comments/page.tsx
  reports/page.tsx
  users/page.tsx
  audit/page.tsx
src/components/admin/
  AdminShell.tsx
  StatCard.tsx
  DataTable.tsx
  StatusBadge.tsx
  ModerationActions.tsx
```

前台和管理后台共用登录态，但布局分开；`admin/layout.tsx` 做服务端权限校验。

---

## 3. 服务端权限守卫

```tsx
// app/(admin)/admin/layout.tsx
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await fetch(`${process.env.API_BASE_INTERNAL}/api/v1/users/me`, {
    headers: { cookie: (await cookies()).toString() },
    cache: 'no-store',
  }).then((res) => res.json());

  if (!me.roles?.includes('admin')) {
    redirect('/login?next=/admin');
  }

  return <AdminShell>{children}</AdminShell>;
}
```

前端隐藏菜单不等于权限；后端管理接口仍然要 `PermissionsGuard`。两层都要有。

---

## 4. Dashboard

```tsx
export default async function AdminDashboard() {
  const stats = await adminFetch('/api/v1/admin/dashboard/stats');
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard label="待审核帖子" value={stats.pendingPosts} />
      <StatCard label="待处理举报" value={stats.pendingReports} />
      <StatCard label="今日新增用户" value={stats.newUsers} />
      <StatCard label="今日发帖" value={stats.newPosts} />
    </div>
  );
}
```

数字不要在前端二次聚合；管理 API 直接返回聚合结果，避免多请求和不一致。

---

## 5. 审核表格

```tsx
const posts = await adminFetch('/api/v1/admin/posts?status=pending');

<DataTable
  rows={posts}
  columns={[
    { key: 'title', label: '标题' },
    { key: 'author', label: '作者' },
    { key: 'createdAt', label: '时间' },
  ]}
  actions={(post) => <ModerationActions postId={post.id} />}
/>
```

`ModerationActions` 调：

```text
POST /api/v1/admin/posts/:id/approve
POST /api/v1/admin/posts/:id/reject
```

操作成功后 `router.refresh()` 或 `invalidateQueries`；不要本地删行后再等接口失败回滚。

---

## 6. 举报处理

举报列表展示目标类型、原因、举报人、状态；处理弹窗填处理意见：

```tsx
async function resolve(reportId: string, action: 'resolve' | 'reject') {
  await adminFetch(`/api/v1/admin/reports/${reportId}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
  router.refresh();
}
```

处理成功后状态变为 `resolved/rejected`，审计表多一条记录。

---

## 7. 用户管理

用户表格支持按邮箱/昵称查询、封禁/解封。封禁后：

- 该用户 refresh 失效或登录被拒。
- 其内容是否下架由审核流程决定，不在封禁按钮里顺手删数据。
- 操作写审计。

---

## 8. 审计日志

```tsx
const logs = await adminFetch('/api/v1/admin/audit-logs?limit=50');

<DataTable
  rows={logs.items}
  columns={[
    { key: 'operatorId', label: '操作人' },
    { key: 'action', label: '动作' },
    { key: 'targetType', label: '对象' },
    { key: 'createdAt', label: '时间' },
  ]}
/>
```

审计是只读的，不提供编辑/删除入口。

---

## 9. 验收清单

- [ ] 普通用户访问 `/admin` 被重定向/403
- [ ] Dashboard 数字与后端聚合一致
- [ ] 审核通过后 feed 出现，拒绝后不出现
- [ ] 举报处理写审计
- [ ] 封禁用户后其登录/refresh 被拒
- [ ] 表格有加载/空态/错误态
- [ ] 管理接口 401/403 有明确提示，不是白屏

---

## 10. 常见坑

- **只做前端守卫**：后端接口仍要权限校验。
- **把所有逻辑塞进 client**：首屏表格用 RSC，交互按钮再 client。
- **操作后本地删行**：接口失败会不一致；先请求再刷新。
- **审计可编辑**：审计日志只读，不提供删除。
- **403 当 401 处理**：403 是权限，401 是登录态，提示要区分。

下一步：[前端 P2a](/blog/posts/community-fullstack-fe-04-p2a-quality/)，做性能、E2E 和部署。
