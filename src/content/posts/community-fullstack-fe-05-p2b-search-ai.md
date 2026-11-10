---
title: '前端 P2b：搜索与 AI 助手交互'
published: 2026-11-10T12:00:00+08:00
updated: 2026-11-10T12:00:00+08:00
description: '前端最后阶段：Meilisearch 搜索页、AI 助手流式对话、中断/重试/降级，以及前端毕业验收。'
tags: [社区全栈, 前端, 搜索, AI]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 前端 P2b。上一篇：[前端 P2a](/blog/posts/community-fullstack-fe-04-p2a-quality/)；共享总览：[社区全栈实战 · 总览](/blog/posts/node-roadmap-17-express-zero-to-one-30-days/)；后端对应篇：[后端 P2b](/blog/posts/node-roadmap-22-community-graduation/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

P2b 是加分项：搜索和 AI 助手。它们能让项目在面试里有记忆点，但不能拖累核心链路；默认要可开关、可 fallback。

---

## 1. 目标与范围

- `/search` 搜索页：关键词、结果列表、空态。
- 防抖 + 取消请求 + URL 同步。
- AI 助手流式对话：发送、停止、错误/重试。
- 无 API Key 时 mock/降级。
- E2E/手工验收。

---

## 2. 搜索页

```tsx
'use client';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await apiFetch(
          `/api/v1/search/posts?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        setResults(data.items);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') throw error;
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
      {loading && <p className="mt-4 text-sm text-gray-500">搜索中...</p>}
      {!loading && query && results.length === 0 && (
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

- 300ms 防抖；请求可取消。
- URL 同步 `?q=`，方便分享/刷新。
- 搜索后端未上线时用 mock 结果，页面不阻塞。

---

## 3. AI 助手流式对话

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
    setMessages((items) => [...items, { role: 'user', content: question }, { role: 'assistant', content: '' }]);
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
        setMessages((items) => [...items, { role: 'assistant', content: 'AI 暂时不可用，请稍后再试。' }]);
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
        <input value={input} onChange={(event) => setInput(event.target.value)} className="flex-1 rounded border p-2" />
        <button onClick={send} disabled={streaming}>发送</button>
        {streaming && <button onClick={stop}>停止</button>}
      </div>
    </div>
  );
}
```

- 后端 SSE 返回纯文本 token 或 `data:` 事件，前端按约定解析。
- 停止按钮 abort 请求；后端要处理客户端断开。
- 无 Key/超时：显示 fallback 文案，不能让页面崩。

---

## 4. 降级与开关

- 环境变量 `NEXT_PUBLIC_AI_ENABLED=false` 时隐藏入口。
- 搜索/AI 失败不影响 feed、发帖、评论。
- 错误信息面向用户，不暴露内部堆栈。
- 埋点：搜索词、AI 首 token 延迟、错误率（可选）。

---

## 5. 验收清单

- [ ] `/search` 输入关键词有结果/空态，无重复请求
- [ ] 搜索请求可取消，快速输入不闪回旧结果
- [ ] AI 流式输出逐字出现，可停止
- [ ] 无 Key/后端失败有 fallback，不白屏
- [ ] 搜索/AI 不阻塞核心页面
- [ ] 移动端布局可用
- [ ] E2E 或手工验收记录

---

## 6. 常见坑

- **搜索每敲一个字都请求**：必须防抖 + abort。
- **流式不更新**：reader 循环里要累加并 setState。
- **停止无效**：abort 后后端要停止生成/清理连接。
- **AI 阻塞主线**：入口可关闭，失败可降级。
- **搜索索引延迟**：UI 提示「结果可能有延迟」，或提供重建入口。

到这里，前端系列完成。回到 [共享总览](/blog/posts/node-roadmap-17-express-zero-to-one-30-days/) 检查两套系列的阶段对齐，准备演示和投递。
