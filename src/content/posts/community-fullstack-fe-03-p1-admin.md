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

管理后台单独做一套布局。权限要在服务端校验，表格和表单只是表面；后端接口仍然要再查一次权限，不能只靠前端隐藏菜单。

**这一阶段在练什么**

后台不是“多几个按钮”，而是权限、表格、表单和审计的组合。权限在服务端校验，前端只负责体验。

### 文件地图

| 文件 | 为什么单独存在 | 以后可能怎么改 |
|---|---|---|
| `admin/layout.tsx` | 后台布局和服务端权限入口 | SSO、菜单权限、审计 |
| `DataTable` | 表格展示和分页复用 | 列配置、导出、批量操作 |
| `ModerationActions` | 审核动作和刷新策略 | 批量审核、原因模板 |
| `reports/page.tsx` | 举报处理和状态机 | 自动分类、SLA |
| `users/page.tsx` | 用户管理和封禁 | 角色编辑、登录设备 |
| `audit/page.tsx` | 审计只读 | 检索、导出、告警 |

**怎么判断**

权限两层：前端路由 + 后端接口。表格和表单分开；操作成功后刷新/失效，不要先删本地行。

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

先补一个后台请求封装 `src/lib/admin.ts`（服务端和客户端共用，地址走 `NEXT_PUBLIC_ADMIN_API_BASE`）：

```ts
const base = process.env.NEXT_PUBLIC_ADMIN_API_BASE ?? 'http://127.0.0.1:3001';

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${base}${path}`, {
    ...init,
    cache: 'no-store',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  if (!response.ok) throw new Error(`admin api ${response.status}`);
  return response.json() as Promise<T>;
}
```

> 本地 `admin-api` 跑在 3001，web 也占 3001 时，把 admin-api 的 `ADMIN_PORT` 改成 3002，并把 `NEXT_PUBLIC_ADMIN_API_BASE` 同步改成 `http://127.0.0.1:3002`。生产用同源 `/admin-api` 反代，见前端 10–12。

`src/app/(admin)/admin/layout.tsx` 完整文件：

```tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/AdminShell';

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

`src/app/(admin)/admin/page.tsx` 完整文件：

```tsx
import { adminFetch } from '@/lib/admin';
import { StatCard } from '@/components/admin/StatCard';

type Stats = {
  pendingPosts: number;
  pendingReports: number;
  newUsers: number;
  newPosts: number;
};

export default async function AdminDashboard() {
  const stats = await adminFetch<Stats>('/api/v1/admin/dashboard/stats');
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

`src/app/(admin)/admin/posts/page.tsx` 完整文件：

```tsx
import { adminFetch } from '@/lib/admin';
import { DataTable } from '@/components/admin/DataTable';
import { ModerationActions } from '@/components/admin/ModerationActions';

type Post = {
  id: string;
  title: string | null;
  author: { nickname: string };
  createdAt: string;
};

export default async function AdminPostsPage() {
  const posts = await adminFetch<Post[]>('/api/v1/admin/posts?status=pending');

  return (
    <DataTable
      rows={posts}
      columns={[
        { key: 'title', label: '标题' },
        { key: 'author', label: '作者' },
        { key: 'createdAt', label: '时间' },
      ]}
      actions={(post) => <ModerationActions postId={post.id} />}
    />
  );
}
```

### 2. 审核动作

`src/components/admin/ModerationActions.tsx` 完整文件：

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/admin';

export function ModerationActions({ postId }: { postId: string }) {
  const router = useRouter();

  async function approve() {
    await adminFetch(`/api/v1/admin/posts/${postId}/approve`, { method: 'POST' });
    router.refresh();
  }

  async function reject() {
    await adminFetch(`/api/v1/admin/posts/${postId}/reject`, { method: 'POST' });
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button onClick={approve}>通过</button>
      <button onClick={reject}>拒绝</button>
    </div>
  );
}
```

操作成功后刷新列表；不要本地删行再等接口失败回滚。

### 3. 举报列表

`src/app/(admin)/admin/reports/page.tsx` 完整文件：

```tsx
import { adminFetch } from '@/lib/admin';
import { ReportActions } from '@/components/admin/ReportActions';

type Report = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  createdAt: string;
};

export default async function AdminReportsPage() {
  const reports = await adminFetch<Report[]>('/api/v1/admin/reports?status=pending');

  return (
    <ul className="space-y-3">
      {reports.map((report) => (
        <li key={report.id} className="rounded border p-3">
          <p>{report.targetType} #{report.targetId}</p>
          <p className="text-sm text-gray-500">{report.reason}</p>
          <ReportActions reportId={report.id} />
        </li>
      ))}
    </ul>
  );
}
```

`src/components/admin/ReportActions.tsx` 完整文件：

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/admin';

export function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();

  async function resolve(action: 'resolve' | 'reject') {
    await adminFetch(`/api/v1/admin/reports/${reportId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
    router.refresh();
  }

  return (
    <div className="mt-2 flex gap-2">
      <button onClick={() => void resolve('resolve')}>通过</button>
      <button onClick={() => void resolve('reject')}>驳回</button>
    </div>
  );
}
```

**验收**：pending 帖子 approve 后进 feed；reject 后不进；每次操作有审计记录。

**产出**：commit `feat: add moderation and reports ui`。

---

## Day 9：用户管理、审计、三态

**今天目标**：管理员能封禁/解封；审计只读；表格有三态。

### 1. 用户管理

`src/app/(admin)/admin/users/page.tsx` 完整文件：

```tsx
import { adminFetch } from '@/lib/admin';
import { UserActions } from '@/components/admin/UserActions';

type User = {
  id: string;
  email: string;
  nickname: string;
  status: string;
};

export default async function AdminUsersPage() {
  const users = await adminFetch<User[]>('/api/v1/admin/users');

  return (
    <ul className="space-y-3">
      {users.map((user) => (
        <li key={user.id} className="flex items-center justify-between rounded border p-3">
          <span>
            {user.nickname} · {user.email}
          </span>
          <UserActions userId={user.id} banned={user.status === 'banned'} />
        </li>
      ))}
    </ul>
  );
}
```

`src/components/admin/UserActions.tsx` 完整文件：

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/admin';

export function UserActions({ userId, banned }: { userId: string; banned: boolean }) {
  const router = useRouter();

  async function setStatus() {
    await adminFetch(`/api/v1/admin/users/${userId}/${banned ? 'unban' : 'ban'}`, {
      method: 'POST',
    });
    router.refresh();
  }

  return <button onClick={setStatus}>{banned ? '解封' : '封禁'}</button>;
}
```

封禁后该用户 refresh/登录被拒；是否下架内容走审核流程，不在封禁按钮里顺手删。

### 2. 审计

`src/app/(admin)/admin/audit/page.tsx` 完整文件：

```tsx
import { adminFetch } from '@/lib/admin';

type AuditLog = {
  id: string;
  operatorId: string;
  action: string;
  targetType: string;
  createdAt: string;
};

export default async function AdminAuditPage() {
  const logs = await adminFetch<AuditLog[]>('/api/v1/admin/audit-logs?limit=50');

  return (
    <ul className="space-y-2">
      {logs.map((log) => (
        <li key={log.id} className="rounded border p-3">
          {log.action} · {log.targetType} · 操作人 {log.operatorId} ·{' '}
          {new Date(log.createdAt).toLocaleString()}
        </li>
      ))}
    </ul>
  );
}
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
