---
title: '02 · 异步编程与事件循环'
published: 2026-10-13T11:00:00+08:00
description: 'Node 异步编程核心：Promise 与 async/await 模式、libuv 事件循环六阶段、微任务宏任务顺序、Stream 流处理与 worker_threads 多线程，前端高阶必补的一课。'
tags: [Node.js, 事件循环, Stream, 异步]
category: Node全栈学习路线
draft: false
---

> [!NOTE]
> 前端也有 Promise 和事件循环，所以很多前端觉得"异步我熟"。但在 Node 里，事件循环直接决定**一个进程扛多少并发**，Stream 决定**内存会不会爆**。我在生产环境见过三次事故：一次是同步 CPU 计算卡死整个服务，两次是没用 Stream 读大文件把内存打满。这一篇值得你慢读。

---

## 1. Promise/async：Node 里的四种异步形态

Node 的异步 API 经历了四代演化，你现在还能在代码里见到所有形态：

```js
// 1. 回调（Error-first Callback）：老代码识别特征
fs.readFile('a.txt', (err, data) => { if (err) throw err; });

// 2. Promise：现代基础
fs.promises.readFile('a.txt');

// 3. async/await：日常主力，本质是 Promise 语法糖
async function read() {
  const data = await fs.promises.readFile('a.txt', 'utf-8');
  return data;
}

// 4. 事件驱动 EventEmitter：Node 的骨架模式
server.on('request', (req, res) => { /* ... */ });
```

写 async 代码我总结三条纪律，每条都是坑里爬出来的：

**纪律一：串行 await 能并行就并行。** 十年前我接手过一个初始化逻辑，三个互不依赖的查询被串行 await，接口慢了 400ms：

```js
// ❌ 串行：总耗时 = a + b + c
const user = await getUser();
const posts = await getPosts();
const tags = await getTags();

// ✅ 并行：总耗时 = max(a, b, c)
const [user, posts, tags] = await Promise.all([getUser(), getPosts(), getTags()]);
```

**纪律二：`Promise.all` 一败俱败，容错场景用 `allSettled`。** 拉取"文章 + 推荐 + 广告"，广告接口挂了不该连累整页：

```js
const results = await Promise.allSettled([getPosts(), getRec(), getAds()]);
const ok = results.filter(r => r.status === 'fulfilled').map(r => r.value);
```

**纪律三：async 函数里的错误必须接住。** Express 里忘了 catch，一个 rejected Promise 就是未处理异常，可能直接打挂进程。兜底手法见第 03、08 篇。

## 2. libuv 与事件循环：Node 并发的真相

面试必问，实战有用的部分我讲透。Node 是**单线程执行 JS**，但并发能力来自 libuv 的事件循环 + 线程池：

```text
   ┌───────────────────────────┐
┌─>│ timers（setTimeout/setInterval）│
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │ pending callbacks（系统级回调）│
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │ poll（取新 I/O 事件，阻塞等待）│  ← 大部分 I/O 回调在这
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │ check（setImmediate）      │
│  └─────────────┬─────────────┘
└── nextTick队列 / 微任务队列在【每个阶段切换后】清空
```

关键结论三条：

1. **微任务（Promise.then、queueMicrotask）在每两个阶段之间清空**，`process.nextTick` 优先级最高。这解释了经典面试题：`setTimeout(fn,0)`、`Promise.resolve().then(fn)`、`setImmediate(fn)` 的执行顺序——同步代码 → nextTick → 微任务 → timers → check。
2. **CPU 密集代码会阻塞一切**。循环算 5 秒哈希，期间所有请求、所有定时器全部排队——这就是单线程的代价。解法见本篇第 4 节。
3. **文件 IO 和 DNS 查询走 libuv 线程池**（默认 4 线程），网络 IO 走操作系统 epoll/kqueue。所以 Node 能用单线程扛上万并发连接，靠的是操作系统，不是魔法。

我用一张表对比容易混淆的"并发"与"并行"：

| 概念 | 含义 | Node 中的实现 |
| --- | --- | --- |
| 并发 | 交替处理多个任务 | 事件循环单线程调度 I/O |
| 并行 | 同时执行多个任务 | 线程池（I/O）+ worker_threads（CPU） |

## 3. Stream：处理大数据的正确姿势

前端几乎碰不到流，后端天天用。问题场景：读一个 2GB 的日志文件做统计，`readFile` 会先申请 2GB 内存。Stream 的思路是**分块处理，内存恒定**：

```js
import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { createGzip } from 'node:zlib';

// 读取 → 压缩 → 写入，三个流串起来，内存占用只有几 MB
await pipeline(
  fs.createReadStream('access.log'),
  createGzip(),
  fs.createWriteStream('access.log.gz'),
);
```

四种流类型：**Readable**（读，如 `createReadStream`）、**Writable**（写，如 HTTP 的 `res`）、**Duplex**（双向，如 TCP socket）、**Transform**（读进改出，如 `createGzip`）。

`pipeline` 是我强烈推荐的组合方式，它替代了老的 `.pipe()`——**老写法出错时不关闭流，会泄漏文件描述符**，`pipeline` 自动做错误传播和资源清理。

流自带的**背压（backpressure）**机制也值得知道：写端消费不过来时，读端自动暂停，防止内存堆积。用 `pipeline` 就自动获得了背压处理，手写 `write` 循环才需要自己监听 `drain` 事件。

## 4. worker_threads：CPU 密集的逃生通道

单线程打满的典型场景：图片处理、大 JSON 解析、bcrypt 哈希、报表计算。解法是把 CPU 活扔给工作线程：

```js
// worker.js —— 子线程里跑重活
import { parentPort } from 'node:worker_threads';
parentPort.on('message', (num) => {
  let sum = 0;
  for (let i = 0; i < num; i++) sum += i;   // 假设是个重计算
  parentPort.postMessage(sum);
});

// main.js —— 主线程只管派发，事件循环不被阻塞
import { Worker } from 'node:worker_threads';
const worker = new Worker('./worker.js');
worker.postMessage(1e9);
worker.on('message', (sum) => console.log('结果:', sum));
```

三个工程要点：

- **Worker 有启动成本**（几十 ms 级别），频繁小任务别每次 new，用线程池（`piscina` 库）。
- **传数据默认是拷贝**，大对象用 `Transferable`（ArrayBuffer）转移所有权避免复制。
- **worker_threads 之间不共享 JS 对象**，要共享内存用 `SharedArrayBuffer`——多数业务用不到，知道即可。

我在项目里的判定口诀：**I/O 慢 → 优化查询或上缓存；CPU 慢 → 上 worker 或换算法**。在事件循环里 inline 写重计算，永远是错的。

---

## 小结

- 异步四形态：回调（遗产）→ Promise → async/await（主力）→ EventEmitter（骨架）。
- 独立 I/O 用 `Promise.all` 并行；容错聚合用 `allSettled`；async 错误必须接住。
- 事件循环六阶段，微任务在阶段间清空；CPU 密集会阻塞整个进程。
- 大文件/大数据一律 `pipeline` + Stream，内存恒定还自带背压。
- CPU 密集任务用 `worker_threads`（或 piscina 线程池）逃出主线程。

---

## 练习

1. 不运行代码，写出这段的输出顺序：同步 log、`process.nextTick`、`Promise.then`、`setTimeout(0)`、`setImmediate`，再用 `node -e` 验证。
2. 把你项目里某处串行 `await` 改成 `Promise.all`，用 `console.time` 对比耗时。
3. 写脚本对比 `readFile` 和 `createReadStream` 读取一个 100MB 文件时的内存占用（`process.memoryUsage().heapUsed`），亲眼看一次差距。
4. 写一个 worker 计算 `fib(40)`，主线程同时响应 HTTP 请求，验证主线程是否仍然流畅。
