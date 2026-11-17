---
title: '前端 13–15：搜索与 AI 助手交互'
published: 2026-11-10T12:00:00+08:00
updated: 2026-11-18T09:20:00+08:00
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

`src/app/(public)/search/page.tsx` 完整文件：

```tsx
'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

type Post = {
  id: string;
  title: string | null;
  content: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    // 300ms 防抖 + AbortController：快速输入只保留最后一次请求
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        // 走 Next BFF，浏览器不需要知道后端地址
        const data = await apiFetch<{ items: Post[]; source: 'meilisearch' | 'mysql' }>(
          `/api/search?q=${encodeURIComponent(query)}`,
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

`src/components/ai-chat.tsx` 完整文件（样式依赖前端的 `Avatar`、`SparkIcon` 和全局 `.card` 等类）：

```tsx
'use client';

import { useRef, useState } from 'react';
import { Avatar } from '@/components/avatar';
import { SparkIcon } from '@/components/icons';

type Message = { role: 'user' | 'assistant'; content: string };

const suggestions = ['怎么发帖？', '搜索是怎么工作的？', '这个项目用了哪些技术？'];

export function AiChat() {
  const enabled = process.env.NEXT_PUBLIC_AI_ENABLED !== 'false';
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const controllerRef = useRef<AbortController | null>(null);

  async function send(question?: string) {
    const message = (question ?? input).trim();
    if (!message || streaming) return;

    setInput('');
    setError('');
    setMessages((items) => [
      ...items,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);
    setStreaming(true);

    // 保存 controller，停止按钮才能真正中断请求
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      // 走 BFF：浏览器不直接访问后端，Cookie 由 Next Route Handler 转发
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      });
      if (!response.ok || !response.body) throw new Error('AI 暂时不可用');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let answer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;

          try {
            // 后端发的是 data: {"token":"..."}，不是裸文本
            const data = JSON.parse(payload) as { token?: string };
            if (!data.token) continue;
            answer += data.token;
            setMessages((items) => {
              const next = [...items];
              next[next.length - 1] = { role: 'assistant', content: answer };
              return next;
            });
          } catch {
            // 忽略不完整的 SSE 行
          }
        }
      }
    } catch (chatError) {
      if ((chatError as Error).name !== 'AbortError') {
        setError('AI 暂时不可用，请稍后再试。');
        setMessages((items) => {
          const next = [...items];
          next[next.length - 1] = {
            role: 'assistant',
            content: '这次没有连上助手。主链路不受影响，可以稍后再试。',
          };
          return next;
        });
      }
    } finally {
      setStreaming(false);
      controllerRef.current = null;
    }
  }

  function stop() {
    controllerRef.current?.abort();
  }

  if (!enabled) {
    return (
      <div className="card px-6 py-14 text-center">
        <p className="font-display text-2xl font-semibold">AI 助手未开启</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          设置 NEXT_PUBLIC_AI_ENABLED=true 后重新启动前端即可。
        </p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-[var(--line)] px-5 py-4">
        <div className="flex items-center gap-2">
          <SparkIcon className="h-4 w-4 text-[var(--accent)]" />
          <p className="text-sm font-semibold">围炉助手</p>
          <span className="chip ml-auto">演示模式</span>
        </div>
        <p className="mt-1 text-xs text-[var(--muted)]">
          当前使用本地流式回复；接入真实模型后只替换 BFF。
        </p>
      </div>

      <div className="min-h-[320px] space-y-4 px-5 py-5">
        {messages.length === 0 && (
          <div className="rounded-2xl bg-[var(--surface-2)] p-5">
            <p className="font-display text-xl font-semibold">想问点什么？</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              可以先试一个示例，看看流式输出和停止按钮。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.map((item) => (
                <button className="chip hover:border-[var(--line-strong)]" key={item} onClick={() => void send(item)} type="button">
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            key={`${message.role}-${index}`}
          >
            <Avatar name={message.role === 'user' ? '我' : 'AI'} size="sm" />
            <div
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-7 ${
                message.role === 'user'
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--surface-2)] text-[var(--ink-soft)]'
              }`}
            >
              {message.content || (streaming ? '正在想...' : '')}
            </div>
          </div>
        ))}
      </div>

      <form
        className="flex gap-2 border-t border-[var(--line)] p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <input
          className="field"
          onChange={(event) => setInput(event.target.value)}
          placeholder="问问围炉助手..."
          value={input}
        />
        {streaming ? (
          <button className="admin-danger shrink-0" onClick={stop} type="button">
            停止
          </button>
        ) : (
          <button className="btn-primary shrink-0" type="submit">
            发送
          </button>
        )}
      </form>
      {error && <p className="px-5 pb-4 text-xs text-red-600">{error}</p>}
    </div>
  );
}
```

BFF 只做透传，不解析协议（`src/app/api/ai/chat/route.ts`）：

```ts
import { NextResponse } from 'next/server';
import { callBackendWithAuth } from '@/lib/server-api';

export async function POST(request: Request) {
  const body = await request.text();
  const { response: upstream, cookiesToSet } = await callBackendWithAuth('/api/v1/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!upstream.ok || !upstream.body) {
    const message = await upstream.text().catch(() => 'AI unavailable');
    return NextResponse.json({ code: 'AI_UNAVAILABLE', message }, { status: upstream.status || 502 });
  }

  const response = new NextResponse(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });

  for (const cookie of cookiesToSet) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}
```

- 停止按钮 abort 请求；后端监听 `req.on('close')` 中断上游生成。
- 前端解析 `data: {"token":...}`，协议变化只改这一处。
- 无 Key 时后端返回 mock 流；失败显示 fallback，不让页面崩。

### 2. 开关与降级

`apps/web/.env.local` 完整内容（浏览器只拿到开关，后端地址留在服务端）：

```ini
API_BASE_INTERNAL=http://127.0.0.1:3000
ADMIN_API_URL=http://127.0.0.1:3002
# false 时隐藏 AI 入口，不影响登录/feed/发帖
NEXT_PUBLIC_AI_ENABLED=true
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
