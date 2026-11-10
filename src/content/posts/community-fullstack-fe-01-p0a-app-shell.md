---
title: '前端 01–03：App Router、登录态与 feed 首屏'
published: 2026-11-10T11:20:00+08:00
updated: 2026-11-10T11:20:00+08:00
description: 'Day 1–3：Next.js App Router 骨架、登录/注册、refresh Cookie、feed 首屏、帖子详情与发帖。'
tags: [社区全栈, 前端, Next.js, App Router]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 前端 01–03。上一篇：[前端 00](/blog/posts/community-fullstack-fe-00-overview/)；下一篇：[前端 04–06](/blog/posts/community-fullstack-fe-02-p0b-content-loop/)；后端对应篇：[后端 01–05](/blog/posts/node-roadmap-18-community-week-1/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

这三天让浏览器完整跑通：注册 → 登录 → feed → 帖子详情 → 发帖。评论/点赞/通知放 04–06，不要阻塞演示。

---

## Day 1：脚手架、API client、登录/注册

**今天目标**：Next.js 能启动，登录/注册能调通后端，刷新后登录态不丢。

### 1. 初始化

```bash
pnpm dlx create-next-app@latest apps/web \
  --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
```

目录：

```text
apps/web/src/
  app/
    (auth)/login/page.tsx
    (auth)/register/page.tsx
    (public)/layout.tsx
    api/auth/login/route.ts
    api/auth/refresh/route.ts
    api/auth/logout/route.ts
    layout.tsx
  lib/
    api.ts
    auth.ts
  middleware.ts
```

环境变量：

```ini
NEXT_PUBLIC_API_BASE=http://127.0.0.1:3000
API_BASE_INTERNAL=http://127.0.0.1:3000
```

### 2. API client

`src/lib/api.ts`：

```ts
const base = process.env.NEXT_PUBLIC_API_BASE!;

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}
```

### 3. 登录/注册 route handler

`src/app/api/auth/login/route.ts`：

```ts
export async function POST(request: Request) {
  const body = await request.json();
  const upstream = await fetch(`${process.env.API_BASE_INTERNAL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();
  const response = Response.json(data, { status: upstream.status });
  const setCookie = upstream.headers.get('set-cookie');
  if (setCookie) response.headers.set('set-cookie', setCookie);
  return response;
}
```

同样写 `refresh` / `logout` route handler。accessToken 放内存/sessionStorage；refresh 只走 httpOnly Cookie。

### 4. 登录页

```tsx
'use client';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        password: form.get('password'),
      }),
    });

    if (!response.ok) {
      setError('邮箱或密码错误');
      return;
    }

    const data = await response.json();
    sessionStorage.setItem('accessToken', data.accessToken);
    router.push('/feed');
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-3 py-20">
      <h1 className="text-2xl font-bold">登录</h1>
      <input name="email" type="email" placeholder="邮箱" className="w-full rounded border p-2" />
      <input name="password" type="password" placeholder="密码" className="w-full rounded border p-2" />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button className="w-full rounded bg-black py-2 text-white">登录</button>
    </form>
  );
}
```

注册页同理，调 `/api/v1/auth/register`，成功后跳登录。

**验收**：注册 201、登录 200、刷新页面登录态不丢；未登录访问 `/feed` 跳 `/login`。

**产出**：commit `feat: add next app shell and auth`。

---

## Day 2：feed、帖子详情、发帖

**今天目标**：feed 首屏可渲染；帖子详情可访问；登录用户能发帖。

### 1. feed 首屏

`src/app/(public)/feed/page.tsx`：

```tsx
export default async function FeedPage() {
  const response = await fetch(`${process.env.API_BASE_INTERNAL}/api/v1/feed?limit=20`, {
    headers: { cookie: (await cookies()).toString() },
    cache: 'no-store',
  });
  const data = await response.json();

  return (
    <main className="mx-auto max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-4">关注流</h1>
      {data.items.length === 0 ? (
        <p className="text-sm text-gray-500">还没有内容，去关注几个人或发第一条帖子。</p>
      ) : (
        <ul className="space-y-4">
          {data.items.map((post: any) => (
            <li key={post.id}>
              <a className="block rounded border p-4" href={`/posts/${post.id}`}>
                <p className="font-medium">{post.author.nickname}</p>
                <p className="mt-2 whitespace-pre-wrap">{post.content}</p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
```

### 2. 帖子详情

`src/app/(public)/posts/[id]/page.tsx`：

```tsx
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await fetch(`${process.env.API_BASE_INTERNAL}/api/v1/posts/${id}`, {
    cache: 'no-store',
  });
  if (!response.ok) notFound();
  const post = await response.json();

  return (
    <article className="mx-auto max-w-2xl py-8">
      <h1 className="text-xl font-bold">{post.title ?? '无标题'}</h1>
      <p className="text-sm text-gray-500">{post.author.nickname}</p>
      <p className="mt-4 whitespace-pre-wrap">{post.content}</p>
    </article>
  );
}
```

### 3. 发帖

`src/app/(public)/posts/new/page.tsx`：

```tsx
'use client';

export default function NewPostPage() {
  const router = useRouter();
  const [content, setContent] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const token = sessionStorage.getItem('accessToken');
    await apiFetch('/api/v1/posts', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }, token ?? undefined);
    router.push('/feed');
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-3 py-8">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={8}
        className="w-full rounded border p-3"
        placeholder="写点什么..."
      />
      <button className="rounded bg-black px-4 py-2 text-white">发布</button>
    </form>
  );
}
```

发帖默认 `pending`，feed 暂时看不到，这是预期行为。

### 4. 登录保护

`src/middleware.ts`：

```ts
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has('refresh_token');
  if (!hasSession && /^\/(feed|posts\/new)/.test(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/feed/:path*', '/posts/new'] };
```

**验收**：feed 首屏能渲染；详情 200；发帖 201；未登录跳登录。

**产出**：commit `feat: add feed post detail and create`。

---

## Day 3：三态、错误处理、联调验收

**今天目标**：页面有加载/空态/错误态；前后端联调无 CORS/Cookie 问题。

### 1. 三态

- 每个列表页有 `loading.tsx`、空态、错误提示。
- 401 时先调 `/api/auth/refresh`，成功重放一次，失败跳登录。
- 403 显示无权限，不要当 401。
- 404 用 `notFound()`，不要渲染空白页。

### 2. CORS/Cookie

- 后端 `cors({ origin: config.WEB_ORIGIN, credentials: true })`。
- 前端 fetch `credentials: 'include'`。
- refresh Cookie `path=/api/v1/auth`、`httpOnly`、生产 `secure`。

### 3. 验收清单

- [ ] 注册 → 登录 → feed → 详情 → 发帖
- [ ] 刷新页面登录态不丢
- [ ] 空 feed 有提示
- [ ] 401 能刷新一次并恢复
- [ ] 未登录访问 `/feed` 跳登录
- [ ] 浏览器无 CORS/Cookie 报错

**产出**：commit `fix: handle auth states and errors`。

下一步：[前端 04–06](/blog/posts/community-fullstack-fe-02-p0b-content-loop/)，补评论、点赞、关注和通知。
