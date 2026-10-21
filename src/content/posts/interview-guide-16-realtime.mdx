---
title: '实时通信面试题（WebSocket/SSE/WebRTC）'
published: 2026-09-16T20:00:00+08:00
description: '讲解 WebSocket 协议与握手、心跳重连、SSE、长轮询对比、Socket.IO、WebRTC P2P、协同编辑（OT/CRDT）、直播弹幕等实时通信场景。'
tags: [前端面试, WebSocket, SSE, WebRTC, 实时通信]
category: 前端面试宝典
draft: false
---

> [!NOTE]
> 本文包含 18+ 道实时通信面试题，覆盖聊天、通知、协同编辑、直播、多人游戏等场景，是差异化竞争的加分模块。难度标注：⭐ 基础 · ⭐⭐ 进阶 · ⭐⭐⭐ 高级 · 🔥 高频必考

---

## 通信方式对比

### Q1: 短轮询、长轮询、SSE、WebSocket 怎么选？⭐⭐ 🔥

**答：**

| 方式 | 方向 | 连接 | 实时性 | 服务端压力 | 适用场景 |
|:--|:--|:--|:--|:--|:--|
| 短轮询 | 单向 | 频繁建立 | 差（延迟=间隔） | 大 | 简单场景，实时性要求低 |
| 长轮询 | 单向 | 保持到超时 | 中 | 中 | 兼容性要求高、更新少 |
| SSE | 服务器 → 客户端 | 长连接（HTTP） | 好 | 中 | 通知、股票行情、日志流 |
| WebSocket | 双向 | 长连接（TCP） | 极好 | 小（连接后） | 聊天、协同、游戏 |
| WebRTC | 双向 P2P | UDP/TCP | 极好 | 极小 | 音视频、屏幕共享 |

```javascript
// 短轮询（最不推荐，但最简单）
setInterval(async () => {
  const data = await fetch('/api/messages').then(r => r.json());
  render(data);
}, 5000);

// 长轮询
async function longPoll() {
  try {
    const data = await fetch('/api/messages?wait=30').then(r => r.json());
    // 服务端 hold 住连接，有数据或超时才返回
    render(data);
  } finally {
    longPoll();   // 立即再发起
  }
}
longPoll();
```

**选型建议：**
- 只需要服务器推送（AI 流式响应、通知、股票） → **SSE**
- 需要双向实时（聊天、协同、游戏） → **WebSocket**
- 音视频 / P2P 大流量 → **WebRTC**
- 兼容极老浏览器 → 长轮询兜底

---

## WebSocket

### Q2: WebSocket 协议与握手过程？⭐⭐ 🔥

```
WebSocket 是应用层协议，基于 TCP，通过 HTTP Upgrade 建立连接：

1. 客户端发起 HTTP 请求（Upgrade 头）
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==      ← 客户端随机生成
Sec-WebSocket-Version: 13

2. 服务端响应 101 Switching Protocols
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
  ↑ = Base64(SHA1(Sec-WebSocket-Key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"))

3. TCP 连接保持，转为 WebSocket 帧协议双向通信

关键点：
- 握手用 HTTP，之后不是 HTTP（帧协议）
- 端口默认 80（ws://）或 443（wss://，加密）
- Sec-WebSocket-Key/Accept 用于防止普通 HTTP 请求误升级
- 建立后全双工，客户端和服务端都可以主动发消息
```

### Q3: WebSocket API 与常见用法？⭐ 🔥

```javascript
const ws = new WebSocket('wss://example.com/chat');

// 4 个核心事件
ws.onopen = () => {
  console.log('连接建立');
  ws.send(JSON.stringify({ type: 'login', token }));
};
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  handleMessage(msg);
};
ws.onerror = (e) => console.error('错误', e);
ws.onclose = (e) => {
  console.log('关闭', e.code, e.reason);
  // 常见 close code：
  // 1000 正常关闭 / 1001 端点离开 / 1006 异常断开（无 close 帧）
  // 1011 服务端错误 / 1015 TLS 握手失败
};

// readyState 四个状态
WebSocket.CONNECTING  // 0
WebSocket.OPEN        // 1
WebSocket.CLOSING     // 2
WebSocket.CLOSED      // 3

// 发送多种数据
ws.send('hello');                    // 文本
ws.send(JSON.stringify({ a: 1 }));   // JSON 序列化
ws.send(arrayBuffer);                // 二进制
ws.send(blob);                       // Blob

// 主动关闭
ws.close(1000, 'user logout');
```

### Q4: 心跳机制与断线重连怎么实现？⭐⭐⭐ 🔥

```javascript
// 为什么需要心跳？
// 1. NAT/防火墙会关闭长时间空闲连接（通常 60s-5min）
// 2. 网络切换（WiFi → 4G）后 TCP 连接失效但客户端不知道
// 3. 服务端异常断开，浏览器不一定触发 onclose

class ReconnectingWebSocket {
  constructor(url, options = {}) {
    this.url = url;
    this.heartbeatInterval = options.heartbeatInterval || 30000;
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.maxReconnectTimes = options.maxReconnectTimes || 10;
    this.reconnectTimes = 0;
    this.handlers = new Map();       // 事件监听
    this.manualClose = false;        // 是否主动关闭
    this.connect();
  }

  connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      this.reconnectTimes = 0;       // 重置重连计数
      this.startHeartbeat();
      this.emit('open');
    };
    this.ws.onmessage = e => this.emit('message', e);
    this.ws.onclose = e => {
      this.stopHeartbeat();
      this.emit('close', e);
      if (!this.manualClose) this.reconnect();
    };
    this.ws.onerror = e => this.emit('error', e);
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
      }
    }, this.heartbeatInterval);

    // 超时未收到 pong，认为连接死了，主动关闭触发重连
    this.pongTimeout = setTimeout(() => {
      this.ws.close();
    }, this.heartbeatInterval * 1.5);

    this.ws.addEventListener('message', e => {
      if (JSON.parse(e.data).type === 'pong') {
        clearTimeout(this.pongTimeout);
      }
    });
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatTimer);
    clearTimeout(this.pongTimeout);
  }

  reconnect() {
    if (this.reconnectTimes >= this.maxReconnectTimes) {
      this.emit('reconnect-failed');
      return;
    }
    // 指数退避：3s → 6s → 12s → 24s（最大 30s）
    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectTimes),
      30000
    );
    setTimeout(() => {
      this.reconnectTimes++;
      this.connect();
    }, delay);
  }

  send(data) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      // 离线消息队列（可选）
      this.pendingQueue = this.pendingQueue || [];
      this.pendingQueue.push(data);
    }
  }

  close() {
    this.manualClose = true;
    this.stopHeartbeat();
    this.ws.close(1000, 'client close');
  }

  on(event, fn) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event).add(fn);
  }
  emit(event, ...args) {
    this.handlers.get(event)?.forEach(fn => fn(...args));
  }
}

// 使用
const ws = new ReconnectingWebSocket('wss://example.com/chat');
ws.on('message', e => console.log(e.data));

// 补充优化：
// - 监听 online/offline 事件，网络恢复立即重连
// - 页面隐藏时（visibilitychange）降低心跳频率
// - 登录 token 过期时不重连，跳登录页
window.addEventListener('online', () => ws.reconnect());
```

### Q5: WebSocket 消息格式怎么设计？⭐⭐

```javascript
// 统一消息协议（前后端约定）
{
  "type": "chat.message",       // 事件类型（点分命名）
  "id": "msg-uuid-xxx",          // 消息 ID（幂等/去重/ACK）
  "seq": 12345,                  // 序列号（消息顺序）
  "timestamp": 1726000000000,
  "data": { /* 业务数据 */ },
  "code": 0,                     // 状态码（响应消息用）
  "message": "ok"                // 错误信息
}

// 消息分类：
// - 请求消息：客户端主动发起（chat.send）
// - 响应消息：服务端回复请求（chat.send.ack）
// - 通知消息：服务端主动推送（chat.new_message）
// - 系统消息：心跳、错误、断线（ping/pong/error）

// 消息可靠性保证：
// 1. ACK 机制：客户端发消息后等待服务端 ACK，超时重发
// 2. 消息去重：服务端根据 msg_id 去重（Redis Set）
// 3. 顺序保证：seq 序列号 + 客户端排序
// 4. 断线补发：重连后带 last_seq，服务端补发缺失消息
// 5. 离线消息：用户上线后拉取离线队列

// 二进制 vs JSON：
// - JSON：可读性好，调试方便，体积稍大（大多数场景够用）
// - Protobuf：二进制协议，体积小 3-5 倍，需前后端约定 .proto
// - MessagePack：JSON 兼容的二进制格式
// - 高频/大数据场景（游戏、协同）推荐 Protobuf
```

### Q6: Nginx 反向代理 WebSocket 怎么配置？⭐⭐

```nginx
# WebSocket 需要 Nginx 传递 Upgrade 头
location /ws/ {
    proxy_pass http://backend_ws;
    proxy_http_version 1.1;                    # 必须 1.1
    proxy_set_header Upgrade $http_upgrade;    # 关键
    proxy_set_header Connection "upgrade";     # 关键
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;

    # 超时（默认 60s 会断开长连接）
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;

    # 关闭缓冲，实时转发
    proxy_buffering off;
}

# 负载均衡时的会话保持
# WebSocket 是长连接，同一用户的多次连接最好路由到同一台机器
upstream backend_ws {
    ip_hash;                                    # IP hash 保持
    server 192.168.1.1:8080;
    server 192.168.1.2:8080;
}

# 或者使用 sticky session（Nginx Plus / OpenResty）
```

### Q7: Socket.IO 相比原生 WebSocket 有什么优势？⭐⭐

```
Socket.IO 不是 WebSocket 协议，是基于 WebSocket 的封装库，
提供降级方案（长轮询、HTTP Streaming）。

优势：
1. 自动重连（内置）
2. 消息 ACK 回调
3. 房间（room）和命名空间（namespace）
4. 广播（broadcast to others）
5. 二进制数据自动分片
6. 断线消息缓冲
7. 多路传输降级：WebSocket → HTTP Long Polling → HTTP Streaming

代码对比：

原生 WebSocket：
ws.send(JSON.stringify({ type: 'chat', data: msg }));
ws.onmessage = e => { const { type, data } = JSON.parse(e.data); ... }

Socket.IO：
socket.emit('chat', msg, ackCallback);         // 事件 + ACK
socket.on('chat', (msg) => { ... });           // 直接监听事件名
socket.join('room-1');                         // 加入房间
socket.to('room-1').emit('chat', msg);         // 房间内广播

代价：
- 协议不兼容标准 WebSocket（服务端必须也是 Socket.IO）
- 包体积较大（60KB+ min）
- 需要额外的 sticky session 配置（多实例部署）

选型：
- 快速搭建、内部通信、房间功能多 → Socket.IO
- 与第三方标准 WebSocket 服务对接 → 原生 WebSocket
- 极致性能 / 二进制协议 → 原生 WebSocket + Protobuf
```

---

## SSE (Server-Sent Events)

### Q8: SSE 是什么？和 WebSocket 的区别？⭐⭐ 🔥

```
SSE：基于 HTTP 的服务器单向推送协议
- 客户端发起一次 HTTP 请求，服务端保持连接持续推送
- 协议：Content-Type: text/event-stream
- 单向：只能服务端 → 客户端

SSE vs WebSocket：

| 特性 | SSE | WebSocket |
|:--|:--|:--|
| 方向 | 单向（服务器推） | 双向 |
| 协议 | HTTP | 独立协议（Upgrade from HTTP）|
| 自动重连 | 浏览器内置 | 需自己实现 |
| 消息 ID/断点续传 | 内置（Last-Event-ID） | 需自己实现 |
| 二进制数据 | 不支持（Base64 转） | 支持 |
| 代理/防火墙穿透 | 好（就是 HTTP） | 可能被拦截 |
| 连接数限制 | HTTP/1.1 每域 6 个 | 无限制 |
| 浏览器支持 | 除 IE 全支持 | 全支持 |

适用场景：
- SSE：AI 流式响应（ChatGPT 打字机效果）、通知推送、日志流、股票行情
- WebSocket：聊天、协同编辑、多人游戏
```

```javascript
// 前端使用
const es = new EventSource('/api/stream');

es.onopen = () => console.log('连接打开');
es.onmessage = (e) => {
  console.log('收到消息', e.data);
  // e.lastEventId 可用于断点续传
};
es.onerror = (e) => {
  // 浏览器会自动重连，一般不用手动处理
  console.log('错误', es.readyState);
};

// 监听自定义事件
es.addEventListener('user-message', (e) => {
  console.log(JSON.parse(e.data));
});

// 主动关闭
es.close();

// 服务端响应格式（Node.js Express 示例）
app.get('/api/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // 消息格式：event / data / id / retry
  res.write('event: message\n');
  res.write('data: hello\n\n');         // 两个换行结束一条消息

  // 定时推送
  const timer = setInterval(() => {
    res.write(`id: ${Date.now()}\n`);
    res.write(`data: ${JSON.stringify({ time: Date.now() })}\n\n`);
  }, 1000);

  req.on('close', () => clearInterval(timer));
});

// 局限：
// 1. 单域名 6 个连接（HTTP/1.1）→ HTTP/2 无此限制
// 2. 不支持自定义 header（认证要用 URL 参数或 Cookie）
// 3. 不支持二进制
// 4. IE 不支持
```

### Q9: ChatGPT 打字机效果怎么实现？⭐⭐ 🔥

```javascript
// 方案 A：SSE（推荐，最简单）
const es = new EventSource('/api/chat/stream?prompt=xxx');
es.onmessage = (e) => {
  if (e.data === '[DONE]') { es.close(); return; }
  const chunk = JSON.parse(e.data);
  output.value += chunk.content;   // 逐字追加
};

// 方案 B：fetch + ReadableStream（更灵活，可带 header）
async function streamChat(prompt, onChunk) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ prompt, stream: true }),
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    // 按 SSE 协议解析（每条消息以 \n\n 分隔）
    const lines = buffer.split('\n\n');
    buffer = lines.pop();          // 保留不完整的最后一段

    for (const line of lines) {
      const data = line.match(/^data: (.*)$/m)?.[1];
      if (!data || data === '[DONE]') continue;
      const chunk = JSON.parse(data);
      onChunk(chunk.content);
    }
  }
}

// 使用
streamChat('讲个笑话', (text) => { output.value += text; });

// OpenAI 官方 SDK 就是这么做的：
// 用 fetch + stream，兼容自定义 header 和 POST 请求体
```

---

## WebRTC

### Q10: WebRTC 是什么？工作原理？⭐⭐⭐

```
WebRTC（Web Real-Time Communication）：
浏览器之间 P2P 实时通信，主要用于音视频、屏幕共享、大数据传输。

三大核心 API：
1. getUserMedia：获取摄像头/麦克风
2. RTCPeerConnection：P2P 连接管理
3. RTCDataChannel：P2P 数据传输

信令流程（需要中间服务器）：

      A                     Signaling Server              B
      │                            │                       │
      │─── 1. createOffer ────────>│                       │
      │                            │─── 2. offer ─────────>│
      │                            │                       │
      │                            │<── 3. answer ─────────│
      │<── 4. answer ──────────────│                       │
      │                            │                       │
      │─── 5. ICE candidate ──────>│─── ICE candidate ────>│
      │<── 6. ICE candidate ───────│<── ICE candidate ─────│
      │                            │                       │
      └──────────── P2P 连接建立（无需服务器） ────────────┘

关键概念：
- SDP（Session Description Protocol）：描述媒体能力
- ICE（Interactive Connectivity Establishment）：NAT 穿透
  - STUN 服务器：发现自己的公网 IP
  - TURN 服务器：NAT 打不通时中转
- DataChannel：基于 SCTP，可传输任意数据（文件、游戏状态）

WebRTC 优势：
- 直连（低延迟，200ms 内）
- 加密（DTLS-SRTP 强制）
- 节省服务器带宽（P2P 传输）
```

```javascript
// 简化示例（获取本地流 + 建立连接）
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
video.srcObject = stream;

const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
});

// 添加本地流
stream.getTracks().forEach(track => pc.addTrack(track, stream));

// 监听远端流
pc.ontrack = (e) => { remoteVideo.srcObject = e.streams[0]; };

// 创建 offer 并通过信令服务器发给对方
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
signalingServer.send({ type: 'offer', sdp: offer });
```

---

## 实战场景

### Q11: 协同编辑（多人同时改一个文档）怎么实现？⭐⭐⭐

```
两大主流算法：

1. OT（Operational Transformation）
   - Google Docs 采用
   - 核心：将编辑操作抽象为 op（insert/delete/retain）
   - 冲突时通过 transform 函数转换 op，保证最终一致
   - 优点：成熟、性能好
   - 缺点：实现复杂，需要中央服务器协调

   例：
   文档 "abc"
   A 用户：insert(1, "X") → "aXbc"
   B 用户：insert(2, "Y") → "abYc"
   
   服务器收到 A 的 op 后转发给 B：
   B 需要 transform：insert(2, "Y") 变成 insert(3, "Y")
   最终双方都得到 "aXbYc"

2. CRDT（Conflict-free Replicated Data Type）
   - Figma、Notion、Yjs 采用
   - 核心：数据结构本身保证任意顺序合并都一致
   - 优点：无需中央协调，可离线编辑
   - 缺点：内存占用大（保留历史元数据）

   常见 CRDT 库：Yjs、Automerge、Diamond Types

前端实现（基于 Yjs）：
```

```javascript
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';

// 1. 创建共享文档
const ydoc = new Y.Doc();
const ytext = ydoc.getText('monaco');

// 2. WebSocket 同步
const provider = new WebsocketProvider('wss://yjs.example.com', 'room-id', ydoc);

// 3. 绑定到编辑器（Monaco / CodeMirror / ProseMirror / Slate）
const editor = monaco.editor.create(container, { value: ytext.toString() });
new MonacoBinding(ytext, editor.getModel(), new Set([editor]), provider.awareness);

// awareness 提供在线状态、光标位置
provider.awareness.setLocalStateField('user', { name: 'Tom', color: '#f00' });

// 现成方案：
// - 文档：语雀、飞书文档（自研 OT）
// - 白板：tldraw、Excalidraw（CRDT）
// - 代码：CodeSandbox、StackBlitz（Yjs + Monaco）
// - 设计：Figma（自研 CRDT-like 方案）
```

### Q12: 直播间弹幕/聊天室怎么设计？⭐⭐⭐

```
架构：

用户浏览器 ←WebSocket→ 网关层 ←→ 消息服务 ←Redis Pub/Sub→ 房间管理
                                    ↓
                                  存储（MongoDB / Kafka → 数仓）

关键设计点：

1. 房间模型
   - 每个直播间是一个 room，用户加入即订阅
   - Socket.IO：socket.join('room-123')
   - 广播：io.to('room-123').emit('danmu', msg)

2. 消息扩散策略
   - 小房间（<1000 人）：直接广播
   - 大房间（万人级）：分级扩散
     * 网关层缓存最新 N 条，新用户进来先推历史
     * 消息按用户 ID hash 分片，多机并行推送

3. 消息限流
   - 单用户发言频率限制（Redis 计数 + 滑动窗口）
   - 房间总消息 QPS 限制，超过丢弃或合并

4. 消息优先级
   - 系统公告 > 付费弹幕 > 普通弹幕
   - 高优先级消息不走限流

5. 消息展示优化
   - 前端渲染节流：合并 100ms 内的多条消息一次性插入 DOM
   - 弹幕轨道管理：避免重叠，计算可用轨道
   - 虚拟列表：只渲染可视区域弹幕

6. 掉线与重连
   - 前端重连后带 last_msg_id，服务端补发
   - 长时间掉线（>5min）只推最新消息，不补历史

7. 数据规模
   - 单房间消息数：万级/分钟
   - 存储：Kafka 缓冲 → MongoDB 分片存储
   - 冷热分离：7 天内热数据 Redis，历史归档

前端要点：
- 弹幕用 requestAnimationFrame 控制动画（transform 走 GPU）
- Canvas 绘制（>1000 弹幕时性能远好于 DOM）
- 敏感词过滤（前端本地 DFA 算法 + 后端二次校验）
```

### Q13: 聊天消息的可靠性投递怎么保证？⭐⭐⭐

```
IM 系统三大难题：不丢、不重、有序

1. 不丢消息
   客户端发送 → 服务端 ACK → 客户端标记已送达
   ┌──────┐        ┌──────┐        ┌──────┐
   │  A   │──send─>│Server│──push─>│  B   │
   │      │<──ACK──│      │<──ACK──│      │
   └──────┘        └──────┘        └──────┘
   
   - A 未收到 ACK：本地重发（相同 msg_id）
   - Server 未收到 B 的 ACK：写入离线队列，B 上线后拉取
   - 消息持久化：先落库再推送（防止服务端崩溃丢消息）

2. 不重复
   - 每条消息生成全局唯一 msg_id（雪花算法/UUID）
   - 服务端根据 msg_id 去重（Redis Set，TTL 24h）
   - 客户端本地缓存已收 msg_id，重复的丢弃

3. 有序
   - 服务端为每个会话生成递增 seq
   - 客户端按 seq 排序展示
   - 断线重连时带 last_seq，服务端补发 seq > last_seq 的消息

4. 已读回执
   - B 打开会话时上报 read_seq
   - 服务端将 read_seq 推送给 A，A 展示"已读"

5. 离线消息
   - 用户离线时消息写入 inbox（Redis List / MongoDB）
   - 用户上线时按 seq 拉取（分页）
   - 拉取完成后清空 inbox

6. 消息漫游
   - 多端同步：手机端发的消息，Web 端也要看到
   - 每个用户维护一份消息索引（不只是每个会话）
```

---

## 复习卡片

> [!TIP]
> **快速复习清单**
>
> 1. **通信选型**：单向推送 SSE / 双向 WebSocket / P2P WebRTC / 兜底长轮询
> 2. **WebSocket 握手**：HTTP Upgrade + Sec-WebSocket-Key/Accept（SHA1 + GUID）
> 3. **心跳重连**：30s ping/pong + 超时主动关闭 + 指数退避重连 + online 事件
> 4. **消息协议**：type + id + seq + data，ACK 机制 + 去重 + 断线补发
> 5. **Nginx 代理**：proxy_http_version 1.1 + Upgrade/Connection 头 + ip_hash
> 6. **Socket.IO**：房间 + 广播 + ACK + 自动降级，但非标准协议
> 7. **SSE 优势**：HTTP 穿透好 + 浏览器自动重连 + Last-Event-ID 续传
> 8. **打字机效果**：SSE 或 fetch + ReadableStream（POST + header 用后者）
> 9. **WebRTC**：SDP + ICE + STUN/TURN，P2P 低延迟音视频
> 10. **协同编辑**：OT（Google Docs）vs CRDT（Yjs/Figma），后者可离线
> 11. **弹幕设计**：房间模型 + 分级扩散 + Canvas 渲染 + 限流
> 12. **IM 可靠性**：ACK + msg_id 去重 + seq 排序 + 离线消息 + 已读回执

---

> [!TIP]
> 下一篇：[系统设计场景题](/blog/posts/interview-guide-17-system-design/) 涵盖大文件上传、权限系统、埋点系统、富文本编辑器、前端安全、灰度发布、低代码平台等高级岗必考的架构设计题。
>
> 返回 [面试宝典总览](/blog/posts/interview-guide-00-overview/) | [面试宝典合集页](/blog/interview-guide/)
