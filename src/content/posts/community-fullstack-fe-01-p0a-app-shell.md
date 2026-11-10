---
title: '前端 P0a：App Router、登录态与 feed 首屏'
published: 2026-11-10T11:20:00+08:00
updated: 2026-11-10T11:20:00+08:00
description: '前端第一阶段：Next.js App Router 骨架、登录/注册、refresh Cookie、feed 首屏、帖子详情与发帖。'
tags: [社区全栈, 前端, Next.js, App Router]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 前端 P0a。上一篇：[前端总览](/blog/posts/community-fullstack-fe-00-overview/)；下一篇：[前端 P0b](/blog/posts/community-fullstack-fe-02-p0b-content-loop/)；后端对应篇：[后端 P0a](/blog/posts/node-roadmap-18-community-week-1/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

P0a 的目标是让浏览器完整跑通：**注册 → 登录 → feed → 帖子详情 → 发帖**。评论/点赞/通知留给 P0b，不要阻塞 11/24 的投递节点。

---

## 1. 初始化

```bash
pnpm dlx create-next-app@latest apps/web \
  --typescript --tailwind --app --eslint --src-dir --import-alias "@/*"
```

目录：

```text
apps/web/
  src/
    app/
      (auth)/login/page.tsx
      (auth)/register/page.tsx
      (public)/feed/page.tsx
      (public)/posts/[id]/page.tsx
      (public)/posts/new/page.tsx
      (public)/layout.tsx
      layout.tsx
      api/auth/login/route.ts
      api/auth/refresh/route.ts
      api/auth/logout/route.ts
    components/
    lib/api.ts
    lib/auth.ts
  middleware.ts
  next.config.ts
```

环境变量：

```ini
NEXT_PUBLIC_API_BASE=http://127.0.0.1:3000
API_BASE_INTERNAL=http://127.0.0.1:3000
```

---

## 2. API client

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

P0a 可以先用 `NEXT_PUBLIC_API_BASE` 直连；P2a 再改成 Nginx 同源 `/api`。

---

## 3. 登录与 refresh

Route handler 负责把后端 refresh Cookie 透传给浏览器：

```ts
// app/api/auth/login/route.ts
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

- accessToken 放内存/`sessionStorage`；refresh 永远不进 JS。
- 401 时先调 `/api/auth/refresh`，成功重放一次请求，失败跳登录。
- 不要在 client 里直接读 refresh Cookie。

---

## 4. feed 首屏

Server Component 首屏取数：

```tsx
// app/(public)/feed/page.tsx
export default async function FeedPage() {
  const data = await fetch(`${process.env.API_BASE_INTERNAL}/api/v1/feed?limit=20`, {
    headers: { cookie: (await cookies()).toString() },
    cache: 'no-store',
  }).then((res) => res.json());

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

- 空态、加载、错误三态必须有。
- 游标分页：客户端「加载更多」把 `nextCursor` 传给后端，不要用页码。

---

## 5. 帖子详情与发帖

详情页：

```tsx
export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await fetch(`${process.env.API_BASE_INTERNAL}/api/v1/posts/${id}`, {
    cache: 'no-store',
  }).then((res) => res.json());

  return (
    <article className="mx-auto max-w-2xl py-8">
      <h1 className="text-xl font-bold">{post.title ?? '无标题'}</h1>
      <p className="text-sm text-gray-500">{post.author.nickname}</p>
      <p className="mt-4 whitespace-pre-wrap">{post.content}</p>
    </article>
  );
}
```

发帖页用 Client Component + 表单校验：

```tsx
'use client';

export default function NewPostPage() {
  const router = useRouter();
  const [content, setContent] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    await apiFetch('/api/v1/posts', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }, getAccessToken());
    router.push('/feed');
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl py-8 space-y-4">
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        className="w-full rounded border p-3"
        rows={8}
        placeholder="写点什么..."
      />
      <button className="rounded bg-black px-4 py-2 text-white">发布</button>
    </form>
  );
}
```

发布成功后帖子默认 `pending`，所以 feed 里暂时看不到；这是预期行为，不要误以为接口失败。

---

## 6. 登录保护

`middleware.ts`：

```ts
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has('refresh_token');
  if (!hasSession && /^\/(feed|posts\/new|admin)/.test(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/feed/:path*', '/posts/new', '/admin/:path*'] };
```

前端隐藏菜单不等于权限；管理后台最终仍要服务端校验。

---

## 7. 验收清单

- [ ] 注册 201、登录 200、刷新 200
- [ ] 刷新页面登录态不丢
- [ ] feed 首屏能渲染；空态有提示
- [ ] 帖子详情可访问；pending 只有作者可见
- [ ] 发帖成功后跳转 feed；帖子 pending
- [ ] 未登录访问 `/feed` 跳登录
- [ ] 浏览器无 CORS/Cookie 报错

---

## 8. 常见坑

- **Cookie 不回传**：fetch 必须 `credentials: 'include'`，后端 CORS 要 `credentials: true`。
- **refresh 死循环**：401 → refresh 失败要停止，不要无限重试。
- **RSC 里用浏览器 API**：Server Component 不能用 `localStorage`/`window`。
- **直连后端**：P0a 允许；上线前改同源 `/api`，避免 CORS。
- **pending 看不到**：发帖默认待审核，不是 bug。

下一步：[前端 P0b](/blog/posts/community-fullstack-fe-02-p0b-content-loop/)，补评论、点赞、关注和通知。
