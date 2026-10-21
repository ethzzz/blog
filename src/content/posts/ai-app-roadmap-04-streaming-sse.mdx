---
title: '04 · 流式输出'
published: 2026-10-12T13:00:00+08:00
description: 'LLM 流式输出完整实现：SSE 协议解析、fetch 流读取、前端打字机渲染、中断 AbortController 与断线重连续传。做出 ChatGPT 级别的流式体验。'
tags: [AI应用, SSE, 流式输出, 前端]
category: AI应用开发学习路线
draft: false
---

> [!NOTE]
> 流式输出是用户对 AI 产品体验的第一印象——等 30 秒白屏，用户走了；逐字蹦出来，用户觉得"它在思考"。这篇覆盖 SSE 协议、浏览器流读取、打字机渲染、中断和断线续传，全是我知识库聊天框里踩出来的代码。

---

## 知识地图

- SSE 协议：data 行、`[DONE]` 哨兵、chunk 格式
- 浏览器读取：fetch + ReadableStream 手写解析
- 渲染：打字机效果、Markdown 渐进渲染的坑
- 中断与续传：AbortController、last-event-id 思路

---

## 1. SSE 协议：LLM 流式的默认选择

主流模型的流式接口都返回 `text/event-stream`，格式长这样（Qwen 兼容模式实抓）：

```
data: {"id":"chatcmpl-xxx","choices":[{"delta":{"content":"你"},"index":0}]}

data: {"id":"chatcmpl-xxx","choices":[{"delta":{"content":"好"},"index":0}]}

data: [DONE]
```

关键点：

- 每个 chunk 以 `data: ` 开头，**chunk 之间用空行分隔**——这不是装饰，是 SSE 帧边界，解析全靠它
- 增量内容在 `choices[0].delta.content`（非流式在 `message.content`），可能是空字符串（首尾常有心跳帧），要判空
- `data: [DONE]` 是结束哨兵，收到后停止解析

为什么用 SSE 而不是 WebSocket？**单向场景 SSE 够用且更简单**：HTTP 语义、自动重连（浏览器 EventSource 内建）、过代理/网关不容易被掐。LLM 输出本来就是单向流，WebSocket 属于杀鸡用牛刀。

## 2. 浏览器端读取流

有个前提先说清楚：如果前端直连 LLM API（本地工具可以，生产不行——Key 会暴露），直接 fetch 即可。生产架构是前端 → 自己的服务端 → LLM，服务端把上游 SSE 原样透传给前端（Node 的 `res.write()` 逐块转发即可，注意关掉缓冲）。

浏览器端解析代码，这是我精简了两轮后的版本：

```ts
async function streamChat(
  messages: ChatMessage[],
  onDelta: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += value;

    // 按空行切帧，最后一段可能是半帧，留在 buf
    const frames = buf.split("\n\n");
    buf = frames.pop() ?? "";

    for (const frame of frames) {
      for (const line of frame.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6);
        if (payload === "[DONE]") return full;
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          onDelta(delta);
        }
      }
    }
  }
  return full;
}
```

**核心易错点：TCP 粘包**。一个 `read()` 拿到的字节流可能包含半个 JSON、一个半 JSON + 下个半帧。必须用 buffer 攒着、按空行切、切剩的尾段留回去。我第一次实现时直接对每个 chunk 做 `JSON.parse`，本地顺、线上偶发解析异常，查了一晚上才意识到是网络把帧切碎了。

## 3. 前端打字机渲染

### 3.1 最简版：直接 setState

```tsx
const [text, setText] = useState("");
await streamChat(messages, (delta) => setText((t) => t + delta));
```

能用，但有两个体验问题：真实到达速率不均匀（有时一秒 20 chunk，有时 3 秒憋出一个），以及高频 setState 导致 Markdown 重解析卡顿。

### 3.2 我的方案：缓冲队列 + 固定节奏

```ts
class Typewriter {
  private queue: string[] = [];
  private shown = "";
  private timer: number | null = null;

  push(delta: string) {
    this.queue.push(delta);
    this.tick();
  }

  private tick() {
    if (this.timer) return;
    this.timer = window.setInterval(() => {
      if (!this.queue.length) {
        clearInterval(this.timer!);
        this.timer = null;
        return;
      }
      // 每帧取 1-2 段，落后越多取得越多（追赶）
      const take = this.queue.length > 10 ? 2 : 1;
      this.shown += this.queue.splice(0, take).join("");
      this.onUpdate?.(this.shown);
    }, 40);
  }
  onUpdate?: (text: string) => void;
}
```

这样不管上游 chunk 多颠簸，渲染始终是匀速的"打字"节奏，攒多了还会自动加速追赶。

### 3.3 Markdown 渐进渲染的坑

内容是 Markdown 时，渲染半截文本会出现各种中间态：`**加粗` 只有一半星号、代码块没闭合就高亮。我的处理：

- **渲染节流**：不是每个 delta 都重新 parse Markdown，用 rAF 或 50ms 节流
- **未闭合语法修正**：渲染前数一下 ```` ``` ```` 数量，奇数就临时补一个闭合再渲染（星号同理简单处理）
- **代码块稳定性**：流式期间代码高亮只对已闭合的块生效，结束帧到了再全量高亮一次

别追求完美中间态，用户在打字机阶段只在乎"有没有东西在出来"，结束时的终态渲染才是质量关键。

## 4. 中断与断线续传

### 4.1 用户主动中断：AbortController

```ts
const controller = new AbortController();
// 流式请求必须传 signal
streamChat(messages, onDelta, controller.signal);

// 停止按钮
stopBtn.onclick = () => controller.abort();
```

两个容易漏的细节：

1. **中断后要把已生成的文本保留入库**。abort 抛错别直接把 `text` 清空——用户按停止时，前半段回答是有价值的。我在 catch 里区分 `AbortError`：正常保存半截内容 + 标注"已中断"。
2. **中断要传到服务端再传到上游**。前端 abort 只是断了自家连接，如果服务端没监听 close 事件继续向上游拉流，token 还在白烧。Node 端要把客户端断开传导为上游 AbortSignal 的取消。

### 4.2 断线续传：现实中的取舍

真正的"续传"（从断点继续生成）LLM API 本身不支持。可行方案有两条：

| 方案 | 做法 | 代价 |
| --- | --- | --- |
| 静默重发 | 检测中断后，把完整 messages 重发一次，前端从头渲染 | 多花一次输入输出 token；体验上"重来" |
| 断点展示 | 已收到的部分直接展示 + "继续"按钮，点击后携带半截内容作为 assistant 消息继续 | 需要服务端持久化半截内容 |

我的聊天功能用的第二条：服务端每收到 chunk 就追加进一个带 TTL 的缓存（key 是请求 id），断线后前端拿着 request id 来取，`?from=offset` 支持从任意位置续读。**SSE 本身有 Last-Event-ID 的重连语义**，如果用 EventSource 且服务端给每个事件编号，浏览器重连时会自动带上，但 POST 请求用不了 EventSource，所以实际上都是手搓这套逻辑。

判断优先级：聊天框断了，重发一次通常是最省事的方案，别过度工程化。续传真正值得做的是**长文批量生成**这种一次几十秒、断不起的任务。

## 5. 服务端透传：Node 端的实现要点

前端代码写好只是半件事，生产链路里你的 Node 服务端要负责"从 LLM 拉流、转发给浏览器"这个中间环节。这段代码不长，但坑都藏在配置里：

```ts
// Node/Express 侧：透传上游 SSE
app.post("/api/chat", async (req, res) => {
  const upstream = await fetch(LLM_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.QWEN_API_KEY}` },
    body: JSON.stringify(buildBody(req.body)),
  });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // 关键：告诉 Nginx 别缓冲

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  req.on("close", () => controller.abort()); // 客户端断开 → 取消上游

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    res.write(decoder.decode(value, { stream: true }));
  }
  res.end();
});
```

四个我用真实故障换来的要点：

1. **`X-Accel-Buffering: no` 是最容易漏的一个**。Nginx 默认会缓冲代理响应，表现是本地开发一切正常，部署到生产后用户的聊天框要等几十秒一次性蹦出全文——流式变成了伪流式。我上线第一天就栽在这里，查了两小时才发现是代理层缓冲。
2. **压缩协商要小心**。如果 Nginx 开了 gzip 对 event-stream 压缩，同样会引入缓冲。SSE 场景直接禁用该 location 的压缩即可。
3. **客户端断开的传导**（`req.on("close")`）是 4.1 节"别白烧 token"的具体实现，忘了这行，用户关掉页面后服务端还在傻傻地拉完整条流。
4. **长连接超时**：部分网关/负载均衡对 HTTP 连接有 60s 空闲超时，流式响应如果某段时间没有字节（模型在长推理），连接会被掐断。对策是服务端每隔 15 秒发一帧 SSE 注释（`: keepalive\n\n`，以冒号开头的帧是合法的 SSE 注释，客户端解析时会忽略）作为心跳。

## 6. 异常恢复的 UI 设计：流式断了之后

流式的错误恢复是体验设计的重头戏——聊天框打到一半断了，用户看到什么、能做什么，直接决定他对产品的信任。我把中断后的 UI 状态机整理成四态：

1. **生成中**：打字机渲染 + 停止按钮可用。这是唯一常态。
2. **中断（用户主动）**：保留已生成内容，追加一行灰色小字"已停止生成"，旁边放"继续"按钮（携带半截内容作为 assistant 消息续问）和"重新生成"。绝不清空——清空是新手最常见也最伤人的做法。
3. **中断（网络异常）**：保留已生成内容 + 顶部细条提示"网络中断，正在重连"。静默重发期间给已到内容加一个"暂存"视觉状态，重发完成后无缝替换。
4. **服务端错误**：保留内容 + 显式错误条 + "重试"按钮。错误文案要人话（"服务繁忙，稍后重试"），禁止把上游的英文报错直接怼给用户。

实现上的关键是一个小的状态机而不是散落的 boolean：

```ts
type StreamState =
  | { kind: "idle" }
  | { kind: "streaming"; controller: AbortController }
  | { kind: "interrupted"; text: string; byUser: boolean }
  | { kind: "error"; text: string; message: string };
```

每个状态转移都显式定义，UI 只渲染 `kind`。我最早用三四个 ref 布尔值管理这套逻辑，出了一个"停止后立刻重连导致双流写入"的诡异 bug，重构成状态机之后同类问题再没出现过。流式 UI 的复杂度足以配得上一个正式的状态机，这不是过度设计。

### 3.4 一个渲染性能的实测参考

给节流策略一个真实数据支撑。我的聊天框在未优化版本（每个 delta 都 setState + 全量 Markdown 重解析）下，长回答渲染到 3000 字时掉帧明显，Performance 面板里 Markdown 解析占了主线程的 40% 以上。引入 50ms 节流 + 未闭合语法轻量修正后，同一篇内容的解析次数从 400+ 降到 60 左右，全程流畅。

另外一个值得记录的取舍：**流式期间用轻量解析、结束时用完整解析**。我最终选的方案是流式期间只处理段落级 Markdown（标题、代码块围栏、列表），行内格式（加粗、链接）等到结束帧再统一高亮。用户在打字机阶段根本感知不出这个差别，但主线程压力降了一个量级。性能优化的收益要放在"用户能感知什么"的天平上称——这个原则在 AI 流式渲染里尤其重要，因为渲染频率是天然的高频场景。

---

## 小结

- SSE 帧以空行分隔，`data: [DONE]` 收尾，delta 要判空；TCP 粘包必须 buffer 攒帧解析。
- 打字机渲染用缓冲队列 + 固定间隔，颠簸的上游也能匀速呈现；Markdown 渲染要节流 + 处理未闭合语法。
- 中断用 AbortController，且要把取消信号传导到上游，已生成的半截内容要保留。
- 续传没有银弹：聊天场景静默重发最省事，长任务才值得做服务端半截内容缓存 + offset 续读。

---

## 练习

1. 抓一次真实流式响应（curl -N 或浏览器 Network 面板 EventStream），画出前 5 个 chunk 的原始格式。
2. 实现 `streamChat`，故意把 `frames.pop()` 那行删掉，观察什么情况下报错。
3. 给打字机加"停止"按钮，验证中断后已生成文本被保留并入库。
4. 手动断网再恢复（DevTools 的 offline 模拟），体验静默重发方案的差距，然后决定你的产品要不要做续传。
