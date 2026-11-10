---
title: '前端 04–06：发帖、评论、点赞与通知'
published: 2026-11-10T11:30:00+08:00
updated: 2026-11-10T11:30:00+08:00
description: 'Day 4–6：评论、点赞、关注、通知 SSE、乐观更新和游标分页，把社区交互补完整。'
tags: [社区全栈, 前端, TanStack Query, SSE]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 前端 04–06。上一篇：[前端 01–03](/blog/posts/community-fullstack-fe-01-p0a-app-shell/)；下一篇：[前端 07–09](/blog/posts/community-fullstack-fe-03-p1-admin/)；后端对应篇：[后端 06–10](/blog/posts/node-roadmap-19-community-week-2/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

前三天只能看和发。接下来补评论、点赞、关注和通知。互动多起来之后，乐观更新和 SSE 的细节才是容易出错的地方。

---

## Day 4：评论与点赞

**今天目标**：评论成功刷新列表和计数；点赞乐观更新，失败回滚。

### 1. TanStack Query

```bash
pnpm --filter web add @tanstack/react-query
```

`src/app/providers.tsx`：

```tsx
'use client';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

### 2. 评论列表

```tsx
'use client';

export function CommentList({ postId }: { postId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => apiFetch(`/api/v1/posts/${postId}/comments?limit=50`),
  });

  if (isLoading) return <p>加载评论...</p>;
  if (error) return <p>评论加载失败</p>;
  if (!data?.items.length) return <p>还没有评论，来抢沙发。</p>;

  return (
    <ul className="space-y-3">
      {data.items.map((comment: any) => (
        <li key={comment.id} className="rounded border p-3">
          <p className="text-sm font-medium">{comment.author.nickname}</p>
          <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>
        </li>
      ))}
    </ul>
  );
}
```

### 3. 发评论

```tsx
const queryClient = useQueryClient();

async function submitComment(content: string) {
  await apiFetch(`/api/v1/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  }, getAccessToken());
  await queryClient.invalidateQueries({ queryKey: ['comments', postId] });
  await queryClient.invalidateQueries({ queryKey: ['post', postId] });
}
```

### 4. 点赞乐观更新

```tsx
export function LikeButton({ postId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  async function toggle() {
    const next = !liked;
    setLiked(next);
    setCount((value) => value + (next ? 1 : -1));

    try {
      await apiFetch(`/api/v1/posts/${postId}/like`, {
        method: next ? 'POST' : 'DELETE',
      }, getAccessToken());
    } catch {
      setLiked(!next);
      setCount((value) => value + (next ? -1 : 1));
      toast.error('操作失败，请重试');
    }
  }

  return <button onClick={toggle}>{liked ? '♥' : '♡'} {count}</button>;
}
```

后端幂等，所以快速连点不会把计数加爆。

**验收**：评论 201 + 计数 +1；点赞两次只加 1；失败回滚。

**产出**：commit `feat: add comments and optimistic likes`。

---

## Day 5：关注与通知 SSE

**今天目标**：关注/取关状态正确；通知中心实时收到 SSE。

### 1. 关注按钮

```tsx
async function toggleFollow(userId: string, following: boolean) {
  await apiFetch(`/api/v1/users/${userId}/follow`, {
    method: following ? 'DELETE' : 'POST',
  }, getAccessToken());
}
```

按钮先乐观更新，失败回滚；关注后 feed 下次进入时刷新。

### 2. SSE hook

```tsx
'use client';

export function useNotifications(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const source = new EventSource('/api/v1/notifications/stream', {
      withCredentials: true,
    });

    source.addEventListener('notification', (event) => {
      const notification = JSON.parse((event as MessageEvent).data);
      queryClient.setQueryData(['notifications'], (old: any) => {
        const items = old?.items ?? [];
        if (items.some((item: any) => item.id === notification.id)) return old;
        return { ...old, items: [notification, ...items] };
      });
    });

    source.onerror = () => {
      // 浏览器自动重连；组件卸载时 close
    };

    return () => source.close();
  }, [enabled, queryClient]);
}
```

> 原生 EventSource 不能设置 Authorization 头。用 httpOnly Cookie 鉴权，或改用 fetch 流式读取；本项目用 Cookie。

### 3. 通知中心

```tsx
export default function NotificationsPage() {
  useNotifications(true);
  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiFetch('/api/v1/notifications'),
  });

  return (
    <main className="mx-auto max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-4">通知</h1>
      {(data?.items ?? []).map((item: any) => (
        <div key={item.id} className="rounded border p-3 mb-2">
          {item.type} · {new Date(item.createdAt).toLocaleString()}
        </div>
      ))}
    </main>
  );
}
```

**验收**：A 点赞 B，B 的通知页 1 秒内出现；断线重连不重复插入。

**产出**：commit `feat: add follow and sse notifications`。

---

## Day 6：游标分页、三态、验收

**今天目标**：feed/评论「加载更多」不重不漏；错误状态完整。

### 1. 游标分页

```tsx
const [cursor, setCursor] = useState<string | null>(null);

const { data } = useQuery({
  queryKey: ['feed', cursor],
  queryFn: () => apiFetch(`/api/v1/feed?limit=20${cursor ? `&cursor=${cursor}` : ''}`),
});

<button onClick={() => setCursor(data.nextCursor)} disabled={!data?.nextCursor}>
  加载更多
</button>
```

不要用页码；后端游标是 `(createdAt, id)`，前端只透传。

### 2. 三态

- 每个列表页有加载、空态、错误。
- 失败时有 toast/回滚，不出现「界面成功、后端失败」。
- 401 刷新一次；403 提示无权限；404 用 `notFound()`。

### 3. 验收清单

- [ ] 评论/点赞/关注/通知全链路
- [ ] 点赞快速连点不重复计数
- [ ] SSE 1 秒内到达，断线重连不重复
- [ ] feed/评论加载更多不重不漏
- [ ] 失败有回滚/提示

**产出**：commit `fix: add pagination states and acceptance`。

下一步：[前端 07–09](/blog/posts/community-fullstack-fe-03-p1-admin/)，做管理后台。
