---
title: '前端 07–09：管理后台、审核与数据看板'
published: 2026-11-10T11:40:00+08:00
updated: 2026-11-10T11:40:00+08:00
description: 'Day 7–9：Next.js 管理后台布局、权限守卫、Dashboard、帖子审核、举报处理、用户管理与审计。'
tags: [社区全栈, 前端, 管理后台, RBAC]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 前端 07–09。上一篇：[前端 04–06](/blog/posts/community-fullstack-fe-02-p0b-content-loop/)；下一篇：[前端 10–12](/blog/posts/community-fullstack-fe-04-p2a-quality/)；后端对应篇：[后端 11–15](/blog/posts/node-roadmap-20-community-week-3/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

这三天做管理后台：权限、表格、表单、审核流程。后台不是多几个按钮，而是「服务端守卫 + 后端权限 + 审计」三件套。

---

## Day 7：后台布局、权限守卫、Dashboard

**今天目标**：普通用户进不了 `/admin`；管理员能看到统计卡。

### 1. 目录

```text
src/app/(admin)/admin/
  layout.tsx
  page.tsx
  posts/page.tsx
  reports/page.tsx
  users/page.tsx
  audit/page.tsx
src/components/admin/
  AdminShell.tsx
  StatCard.tsx
  DataTable.tsx
```

### 2. 服务端权限守卫

`src/app/(admin)/admin/layout.tsx`：

```tsx
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const response = await fetch(`${process.env.API_BASE_INTERNAL}/api/v1/users/me`, {
    headers: { cookie: (await cookies()).toString() },
    cache: 'no-store',
  });

  if (!response.ok) redirect('/login?next=/admin');
  const me = await response.json();
  if (!me.roles?.includes('admin')) redirect('/login?next=/admin');

  return <AdminShell>{children}</AdminShell>;
}
```

前端隐藏菜单不等于权限；后端管理接口仍然要 `PermissionsGuard`。

### 3. Dashboard

```tsx
export default async function AdminDashboard() {
  const stats = await adminFetch('/api/v1/admin/dashboard/stats');
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <StatCard label="待审核帖子" value={stats.pendingPosts} />
      <StatCard label="待处理举报" value={stats.pendingReports} />
      <StatCard label="今日新增用户" value={stats.newUsers} />
      <StatCard label="今日发帖" value={stats.newPosts} />
    </div>
  );
}
```

**验收**：普通用户访问 `/admin` 被重定向；管理员能看到 4 个数字。

**产出**：commit `feat: add admin layout and dashboard`。

---

## Day 8：帖子审核与举报处理

**今天目标**：审核通过后 feed 出现；拒绝不出现；举报处理写审计。

### 1. 审核列表

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

### 2. 审核动作

```tsx
async function approve(postId: string) {
  await adminFetch(`/api/v1/admin/posts/${postId}/approve`, { method: 'POST' });
  router.refresh();
}

async function reject(postId: string) {
  await adminFetch(`/api/v1/admin/posts/${postId}/reject`, { method: 'POST' });
  router.refresh();
}
```

操作成功后刷新列表；不要本地删行再等接口失败回滚。

### 3. 举报列表

```tsx
const reports = await adminFetch('/api/v1/admin/reports?status=pending');

async function resolve(reportId: string, action: 'resolve' | 'reject') {
  await adminFetch(`/api/v1/admin/reports/${reportId}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
  router.refresh();
}
```

**验收**：pending 帖子 approve 后进 feed；reject 后不进；每次操作有审计记录。

**产出**：commit `feat: add moderation and reports ui`。

---

## Day 9：用户管理、审计、三态

**今天目标**：管理员能封禁/解封；审计只读；表格有三态。

### 1. 用户管理

```tsx
const users = await adminFetch('/api/v1/admin/users');

async function setStatus(userId: string, banned: boolean) {
  await adminFetch(`/api/v1/admin/users/${userId}/${banned ? 'ban' : 'unban'}`, {
    method: 'POST',
  });
  router.refresh();
}
```

封禁后该用户 refresh/登录被拒；是否下架内容走审核流程，不在封禁按钮里顺手删。

### 2. 审计

```tsx
const logs = await adminFetch('/api/v1/admin/audit-logs?limit=50');
```

审计只读，不提供编辑/删除入口。

### 3. 三态与错误

- 表格有加载、空态、错误。
- 401 跳登录；403 显示无权限；404 显示空态。
- 操作按钮请求中禁用，防重复提交。

### 4. 验收

- [ ] 普通用户进不了后台
- [ ] Dashboard 数字与后端一致
- [ ] 审核/举报/封禁可用
- [ ] 审计有操作人/动作/时间
- [ ] 401/403 提示区分

**产出**：commit `feat: add admin users audit and states`。

下一步：[前端 10–12](/blog/posts/community-fullstack-fe-04-p2a-quality/)，做性能、E2E 和部署。
