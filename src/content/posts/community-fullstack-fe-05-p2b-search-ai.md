---
title: '前端 13–15：搜索与 AI 助手交互'
published: 2026-11-10T12:00:00+08:00
updated: 2026-11-10T12:00:00+08:00
description: 'Day 13–15：Meilisearch 搜索页、AI 助手流式对话、中断/重试/降级，以及前端毕业验收。'
tags: [社区全栈, 前端, 搜索, AI]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 前端 13–15。上一篇：[前端 10–12](/blog/posts/community-fullstack-fe-04-p2a-quality/)；后端对应篇：[后端 19–21](/blog/posts/node-roadmap-22-community-graduation/)；共享总览：[00 总览](/blog/posts/node-roadmap-17-express-zero-to-one-30-days/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

最后做搜索和 AI 助手。这两块是加分项，入口要能关，失败要能降级，别让它们影响登录、feed 和发帖。

**这一阶段在练什么**

可选能力的产品化：搜索和 AI 要有入口、有降级、有成本边界，不能影响核心链路。

### 文件地图

| 文件 | 为什么单独存在 | 以后可能怎么改 |
|---|---|---|
| `search/page.tsx` | 搜索交互和 URL 同步 | 筛选、排序、联想 |
| `useDebounce/abort` | 防抖和取消请求 | 请求合并、缓存 |
| `AiChat` | 流式输出和停止 | 多轮、工具调用、RAG |
| `feature flag` | 入口可关 | 灰度、租户开关 |
| `fallback` | 失败可解释 | 模型网关、降级文案 |

**怎么判断**

入口可关、失败可降级、成本可观测。搜索/AI 挂了，登录、feed、发帖仍然可用。

---

## Day 13：搜索页

**今天目标**：关键词搜索有结果/空态，防抖 + 取消请求 + URL 同步。

### 1. 搜索页

```tsx
'use client';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiFetch(
          `/api/v1/search/posts?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        setResults(data.items);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') setError('搜索失败，请重试');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <main className="mx-auto max-w-2xl py-8">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="搜索帖子..."
        className="w-full rounded border p-3"
      />
      {loading && <p className="mt-4 text-sm">搜索中...</p>}
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      {!loading && query && results.length === 0 && !error && (
        <p className="mt-4 text-sm text-gray-500">没有找到相关帖子。</p>
      )}
      <ul className="mt-4 space-y-3">
        {results.map((post) => (
          <li key={post.id} className="rounded border p-3">
            <a href={`/posts/${post.id}`}>{post.title ?? post.content.slice(0, 40)}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

### 2. URL 同步

用 `useSearchParams` 初始化 `query`，输入变化时 `router.replace('/search?q=...')`，方便分享/刷新。

### 3. 后端未上线时

用 mock 结果或 MSW，页面先不受影响；搜索接口失败不影响 feed/发帖。

**验收**：输入有结果/空态；快速输入不闪回旧结果；请求可取消。

**产出**：commit `feat: add search page`。

---

## Day 14：AI 助手流式对话

**今天目标**：AI 回复逐字出现，可停止；无 Key/失败有 fallback。

### 1. 对话组件

```tsx
'use client';

export function AiChat() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  async function send() {
    if (!input.trim() || streaming) return;
    const question = input;
    setInput('');
    setMessages((items) => [
      ...items,
      { role: 'user', content: question },
      { role: 'assistant', content: '' },
    ]);
    setStreaming(true);

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question }),
        signal: controller.signal,
      });
      if (!response.body) throw new Error('No stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages((items) => {
          const next = [...items];
          next[next.length - 1] = { role: 'assistant', content: answer };
          return next;
        });
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setMessages((items) => [
          ...items,
          { role: 'assistant', content: 'AI 暂时不可用，请稍后再试。' },
        ]);
      }
    } finally {
      setStreaming(false);
      controllerRef.current = null;
    }
  }

  function stop() {
    controllerRef.current?.abort();
  }

  return (
    <div className="space-y-3">
      {messages.map((message, index) => (
        <p key={index} className={message.role === 'user' ? 'font-medium' : 'text-75'}>
          {message.content}
        </p>
      ))}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="flex-1 rounded border p-2"
        />
        <button onClick={send} disabled={streaming}>发送</button>
        {streaming && <button onClick={stop}>停止</button>}
      </div>
    </div>
  );
}
```

- 停止按钮 abort 请求；后端要停止生成/清理连接。
- 无 Key/超时显示 fallback，不让页面崩。

### 2. 开关与降级

```ini
NEXT_PUBLIC_AI_ENABLED=false
```

关闭时隐藏 AI 入口；搜索/AI 失败不影响主页面。

**验收**：流式逐字输出；停止有效；无 Key fallback 不白屏。

**产出**：commit `feat: add ai chat streaming`。

---

## Day 15：前端毕业验收

**今天目标**：确认前端完整可演示，能配合后端讲 10 分钟。

### 验收清单

- [ ] 注册/登录/刷新/登出
- [ ] feed/详情/发帖/评论/点赞/关注
- [ ] 通知 SSE 实时到达
- [ ] 管理端审核/举报/用户
- [ ] 搜索可用；AI 可开关
- [ ] 移动端布局可用
- [ ] E2E 主链路通过
- [ ] 部署后 `/feed`、`/admin`、`/search` 可访问

### 10 分钟前端演示

```text
0:00-1:00  页面地图与技术栈
1:00-3:00  登录态/refresh Cookie
3:00-5:00  feed 游标 + 乐观点赞
5:00-7:00  发帖/评论/通知 SSE
7:00-9:00  管理端审核 + 搜索
9:00-10:00 性能/部署/如果重来
```

### 面试能讲什么

- RSC 与 Client Component 的边界
- 登录态为什么 refresh 放 httpOnly Cookie
- 乐观更新为什么要回滚
- SSE 与轮询的取舍
- 搜索防抖/取消请求
- AI 流式的中断与 fallback

前端 01–15 到这里就做完了。回到 [00 总览](/blog/posts/node-roadmap-17-express-zero-to-one-30-days/) 对一下两套系列，准备演示和投递。
