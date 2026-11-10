---
title: '前端 P0b：发帖、评论、点赞与通知'
published: 2026-11-10T11:30:00+08:00
updated: 2026-11-10T11:30:00+08:00
description: '前端第二阶段：评论、点赞、关注、通知 SSE、乐观更新和游标分页，把社区交互补完整。'
tags: [社区全栈, 前端, TanStack Query, SSE]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 前端 P0b。上一篇：[前端 P0a](/blog/posts/community-fullstack-fe-01-p0a-app-shell/)；下一篇：[前端 P1](/blog/posts/community-fullstack-fe-03-p1-admin/)；后端对应篇：[后端 P0b](/blog/posts/node-roadmap-19-community-week-2/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

P0a 只跑通了「看和发」。P0b 把互动补齐：评论、点赞、关注、通知/SSE，并加上乐观更新和游标分页，让体验像真正的社区产品。

---

## 1. 目标与范围

- 帖子详情页评论列表 + 发评论。
- 点赞/取消点赞，乐观更新。
- 关注/取关。
- 通知中心 + SSE 实时到达。
- feed/评论游标分页「加载更多」。

---

## 2. TanStack Query 初始化

```tsx
'use client';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1 },
    },
  }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
```

首屏仍用 Server Component；互动区域用 Client Component + Query。

---

## 3. 点赞：乐观更新 + 失败回滚

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

  return (
    <button onClick={toggle} className="flex items-center gap-1">
      {liked ? '♥' : '♡'} {count}
    </button>
  );
}
```

后端幂等，所以重复点击不会把计数加爆；前端乐观更新只负责体验。

---

## 4. 评论

```tsx
'use client';

export function CommentList({ postId }: { postId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => apiFetch(`/api/v1/posts/${postId}/comments?limit=50`),
  });

  if (isLoading) return <p>加载评论...</p>;
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

发评论成功后 `queryClient.invalidateQueries({ queryKey: ['comments', postId] })`，同时更新帖子 `commentCount`。

---

## 5. 关注

```tsx
async function toggleFollow(userId: string, following: boolean) {
  await apiFetch(`/api/v1/users/${userId}/follow`, {
    method: following ? 'DELETE' : 'POST',
  }, getAccessToken());
}
```

按钮状态先乐观更新；失败回滚。关注后 feed 需要重新拉取，或等下一次进入 feed 时刷新。

---

## 6. 通知 SSE

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
      queryClient.setQueryData(['notifications'], (old: any) => ({
        ...old,
        items: [notification, ...(old?.items ?? [])],
      }));
    });

    source.onerror = () => {
      // 浏览器会自动重连；页面卸载时 close
    };

    return () => source.close();
  }, [enabled, queryClient]);
}
```

> 原生 `EventSource` 不能设置 Authorization 头。用 httpOnly Cookie 鉴权，或改用 `fetch` 流式读取。P0b 推荐 Cookie 方案。

---

## 7. 游标分页

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

---

## 8. 验收清单

- [ ] 评论 201，列表刷新，`commentCount +1`
- [ ] 点赞/取消点赞计数正确；快速连点不重复
- [ ] 关注/取关按钮状态正确；重复关注不报错
- [ ] 通知中心能看到新通知；SSE 1 秒内到达
- [ ] 断线后重连，不重复插入同一条通知
- [ ] feed/评论「加载更多」不重不漏
- [ ] 失败时有 toast/回滚，不出现「界面成功、后端失败」

---

## 9. 常见坑

- **SSE 鉴权**：EventSource 不支持自定义头；用 Cookie 或 fetch 流。
- **通知重复**：后端 `event_id` 幂等，前端按 id 去重。
- **乐观更新不回滚**：catch 里必须恢复旧状态。
- **分页重复**：cursor 原样透传，不要自己拼 `createdAt`。
- **401 循环**：refresh 失败就跳登录，不要无限重试。

下一步：[前端 P1](/blog/posts/community-fullstack-fe-03-p1-admin/)，做管理后台和审核流程。
