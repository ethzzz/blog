---
title: 'Node.js 面试题专篇（前端全栈必备）'
published: 2026-09-16T23:00:00+08:00
description: '讲解 Node.js 事件循环、模块系统、Stream、Buffer、进程线程、HTTP 服务器、Express/Koa/NestJS 对比、性能优化、部署运维等前端全栈必备知识。'
tags: [前端面试, Node.js, Stream, 事件循环, Express, NestJS]
category: 前端面试宝典
draft: false
---

> [!NOTE]
> 本文包含 25+ 道 Node.js 面试题，面向需要掌握服务端开发的中高级前端工程师（全栈/BFF/SSR 场景），难度标注：⭐ 基础 · ⭐⭐ 进阶 · ⭐⭐⭐ 高级 · 🔥 高频必考

---

## Node.js 基础

### Q1: Node.js 是什么？特点和适用场景？⭐ 🔥

**答：**

Node.js 是基于 **V8 引擎**的 JavaScript 运行时，让 JS 能脱离浏览器运行在服务器端。

**核心特点：**

| 特点 | 说明 |
|:--|:--|
| 单线程 | 主线程只有一个（避免线程切换开销） |
| 非阻塞 I/O | 文件/网络 I/O 交给底层 libuv，主线程不等待 |
| 事件驱动 | 通过事件循环处理异步回调 |
| 高并发 | 单进程可处理数万连接（相比传统多线程模型） |
| 跨平台 | Windows / Linux / macOS |

**架构分层：**

```
┌───────────────────────────────────┐
│  JS 代码（业务逻辑）              │
├───────────────────────────────────┤
│  Node.js 标准库                   │
│  (http/fs/net/stream/events...)  │
├───────────────────────────────────┤
│  C++ Bindings（JS ↔ C++ 桥接）    │
├──────────────────┬────────────────┤
│   V8 引擎        │    libuv       │
│  （执行 JS）      │ （异步 I/O）    │
└──────────────────┴────────────────┘
```

**适用场景：**

| 场景 | 原因 |
|:--|:--|
| BFF 中间层 | 前端主导，接口聚合、数据裁剪 |
| SSR / SSG | Next.js / Nuxt / Astro |
| 实时应用 | 聊天、协同、直播（长连接） |
| I/O 密集 API | 高并发读写数据库、代理转发 |
| 微服务 | 轻量、启动快、容器友好 |
| CLI 工具 | 前端脚手架、构建工具（Vite/eslint） |
| Serverless | 冷启动快，按需付费 |

**不适用场景：**
- CPU 密集任务（视频编码、大量数学运算、图像处理）—— 单线程会阻塞
- 强事务、复杂业务逻辑的传统企业应用（Java 生态更成熟）

### Q2: Node.js 单线程为什么能支持高并发？⭐⭐ 🔥

```
传统多线程模型（Apache 老版本）：
每个请求 → 创建一个线程 → 阻塞等待 I/O → 返回响应
问题：
- 线程创建/切换开销大
- 内存占用高（每线程 ~1MB 栈）
- C10K 问题（万级连接就撑不住）

Node.js 事件驱动模型：
每个请求 → 注册回调 → 立即返回 → 主线程处理下一个请求
       ↓ I/O 完成
    libuv 线程池处理 → 事件循环触发回调 → 返回响应

关键点：
1. 主线程不阻塞：I/O 交给操作系统 / libuv 线程池
2. 单线程避免了锁竞争和上下文切换
3. 内存占用低：每连接 ~几 KB
4. libuv 默认线程池 4 个（可调 UV_THREADPOOL_SIZE 至 1024）

真实数据：
- Node.js 单进程可支持 5万+ 并发连接
- 传统 Apache 每线程模型：几千连接就 OOM
```

**追问：单线程如何处理 CPU 密集任务？**
- Worker Threads（Node 12+）
- Child Process（fork）
- Cluster（多进程利用多核）
- 任务拆分 + setImmediate（让出事件循环）

---

## 模块系统

### Q3: CommonJS 和 ES Module 的区别？⭐⭐ 🔥

**答：**

| 维度 | CommonJS (CJS) | ES Module (ESM) |
|:--|:--|:--|
| 语法 | `require` / `module.exports` | `import` / `export` |
| 加载时机 | 运行时（同步） | 编译时（静态分析） |
| 值 | 拷贝（值传递） | 引用（实时绑定） |
| this | 当前模块 | undefined |
| 顶层 await | ❌ | ✅ |
| Tree Shaking | ❌（动态无法分析） | ✅（静态结构） |
| 文件扩展名 | `.js`（默认）/ `.cjs` | `.mjs` 或 package.json 声明 `"type": "module"` |
| Node 支持 | 原生 | Node 12+ 支持，14+ 稳定 |

```javascript
// CommonJS
// lib.cjs
module.exports = { foo: 1 };
// main.cjs
const { foo } = require('./lib.cjs');
console.log(foo);  // 1

// ES Module
// lib.mjs
export const foo = 1;
// main.mjs
import { foo } from './lib.mjs';
console.log(foo);  // 1

// 值 vs 引用（关键区别）
// CJS：拷贝，修改 exports 后 require 的还是旧值
// counter.cjs
let count = 0;
setTimeout(() => count = 100, 1000);
module.exports = { count };
// main.cjs
const { count } = require('./counter.cjs');
setTimeout(() => console.log(count), 2000);  // 0（拷贝的旧值）

// ESM：引用绑定，实时读取
// counter.mjs
export let count = 0;
setTimeout(() => count = 100, 1000);
// main.mjs
import { count } from './counter.mjs';
setTimeout(() => console.log(count), 2000);  // 100（实时读取）
```

### Q4: Node.js 中如何混用 CJS 和 ESM？⭐⭐⭐

```javascript
// ESM 中导入 CJS：可以，但只能默认导入
// lib.cjs
module.exports = { foo: 1, bar: 2 };
// main.mjs
import lib from './lib.cjs';         // ✅ 默认导入整个 exports
import { foo } from './lib.cjs';     // ⚠️ Node 14+ 支持命名导入（有限）

// CJS 中导入 ESM：只能用动态 import()
// main.cjs
async function load() {
  const { foo } = await import('./lib.mjs');   // ✅
}
// const { foo } = require('./lib.mjs');       // ❌ 报错

// package.json 决定默认模块类型
{
  "type": "module"    // 该包下 .js 默认按 ESM 解析
  // 或 "type": "commonjs"（默认）
}
// 显式指定：.cjs 强制 CJS，.mjs 强制 ESM

// 双模式包（同时支持 CJS 和 ESM）：
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

### Q5: require 的查找过程？循环依赖怎么处理？⭐⭐⭐

```
require('xxx') 查找顺序：

1. 核心模块（http/fs/path 等）→ 直接返回
2. 路径模块（./ ../ /）→ 按路径查找
3. 非路径模块（lodash）→ node_modules 查找
   从当前目录逐级向上查找 node_modules
   找到后：
   a. 有 package.json 且声明 main → 加载 main
   b. 无 package.json 或无 main → 依次尝试
      index.js → index.json → index.node

文件扩展名解析顺序：
.js → .json → .node（C++ 插件）→ .mjs（ESM）

模块缓存：
- 加载过的模块缓存在 require.cache
- 同一模块多次 require 只执行一次
- 可通过 delete require.cache[路径] 强制重载（测试常用）
```

```javascript
// 循环依赖示例
// a.js
console.log('a 开始');
exports.done = false;
const b = require('./b.js');       // 加载 b，此时 b 拿到 a 的不完整 exports
console.log('在 a 中，b.done =', b.done);
exports.done = true;
console.log('a 结束');

// b.js
console.log('b 开始');
exports.done = false;
const a = require('./a.js');       // a 正在加载中，返回已执行部分的 exports
console.log('在 b 中，a.done =', a.done);   // false（不完整！）
exports.done = true;
console.log('b 结束');

// main.js
const a = require('./a.js');
const b = require('./b.js');
console.log('在 main 中，a.done =', a.done, 'b.done =', b.done);

// 输出：
// a 开始
// b 开始
// 在 b 中，a.done = false     ← 循环依赖拿到不完整的 exports
// b 结束
// 在 a 中，b.done = true
// a 结束
// 在 main 中，a.done = true b.done = true

// Node.js 处理循环依赖的策略：
// 返回"已执行部分"的 exports，不会无限递归
// 但可能导致拿到 undefined，需重构代码避免循环依赖

// ESM 的循环依赖：
// 静态分析 + 实时绑定，可以正确处理，但依然应避免
```

---

## 事件循环（Node.js 版本）

### Q6: Node.js 事件循环和浏览器有何区别？⭐⭐⭐ 🔥

```
Node.js 事件循环（基于 libuv）分 6 个阶段：

   ┌───────────────────────────┐
┌─>│           timers          │  执行 setTimeout/setInterval 回调
│  ├───────────────────────────┤
│  │     pending callbacks     │  执行延迟到下一轮的 I/O 回调
│  ├───────────────────────────┤
│  │       idle, prepare       │  内部使用
│  ├───────────────────────────┤
│  │           poll            │  ★ 最重要：获取新的 I/O 事件
│  │                           │  执行 I/O 回调（文件、网络）
│  │                           │  适当时阻塞等待
│  ├───────────────────────────┤
│  │           check           │  执行 setImmediate 回调
│  ├───────────────────────────┤
│  │      close callbacks      │  执行 close 事件回调
│  └───────────────────────────┘

与浏览器的差异：

1. 微任务清空时机
   浏览器：每次宏任务后清空
   Node 11 前：每【阶段】结束后清空
   Node 11+：与浏览器对齐（每个宏任务后清空）

2. 独有 API
   process.nextTick：优先级最高，当前操作完成后立即执行
   setImmediate：check 阶段执行

3. 优先级顺序：
   process.nextTick > Promise.then > setTimeout ≈ setImmediate
```

```javascript
// 经典输出题
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
// 主模块中：顺序不确定（取决于进程启动耗时）
// 若在 I/O 回调中：immediate 总是先执行

// process.nextTick vs Promise
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
// 输出：nextTick → promise

// nextTick 递归会阻塞事件循环！
function recursive() {
  process.nextTick(recursive);   // 永远轮不到 I/O
}
// 应该用 setImmediate 递归

// 综合题
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}
async function async2() { console.log('async2'); }
console.log('script start');
setTimeout(() => console.log('setTimeout'), 0);
async1();
new Promise(resolve => {
  console.log('promise1');
  resolve();
}).then(() => console.log('promise2'));
console.log('script end');

// 输出顺序：
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```

---

## Buffer 与 Stream

### Q7: Buffer 是什么？为什么需要它？⭐⭐

```javascript
// Buffer：Node.js 提供的二进制数据容器
// JS 原生只有字符串和数组，无法高效处理 TCP 流、文件、图片等二进制数据

// 创建 Buffer
const buf1 = Buffer.alloc(10);              // 10 字节，初始化为 0
const buf2 = Buffer.allocUnsafe(10);        // 10 字节，未初始化（快但可能泄漏旧数据）
const buf3 = Buffer.from([1, 2, 3]);        // 从数组
const buf4 = Buffer.from('hello');          // 从字符串（默认 utf-8）
const buf5 = Buffer.from('hello', 'base64');// 指定编码

// 编码转换
buf4.toString('utf8');      // 'hello'
buf4.toString('base64');    // 'aGVsbG8='
buf4.toString('hex');       // '68656c6c6f'

// 常见操作
Buffer.concat([buf1, buf2]);       // 拼接
buf1.write('abc', 0);              // 写入
buf1.slice(0, 5);                  // 切片（共享内存，不是拷贝！）
buf1.equals(buf2);                 // 比较
buf1.length;                       // 字节长度（不是字符长度）

// Buffer vs Uint8Array
// Buffer 是 Uint8Array 的子类，Node.js API 都接受两者
// 但 Buffer 有更多便捷方法（toString/alloc 等）

// 内存管理：
// Buffer 分配在 V8 堆外（不受 GC 精确管理）
// 大量小 Buffer 建议用 Buffer.allocUnsafe + 手动清零
// 或用 Buffer pool（Node 内部有 8KB pool）
```

### Q8: Stream 是什么？四种类型？⭐⭐⭐ 🔥

```
Stream（流）：处理流式数据的抽象接口
适用于：大文件、实时数据、网络传输

核心优势：
- 内存友好：不用一次性加载全部数据
- 时间友好：边读边处理，不用等全部就绪

四种 Stream 类型：
┌──────────────┬─────────────────────────────┐
│ Readable     │ 可读流（数据源）             │
│              │ 例：fs.createReadStream      │
│              │     process.stdin            │
│              │     http 请求 body           │
├──────────────┼─────────────────────────────┤
│ Writable     │ 可写流（数据目的地）         │
│              │ 例：fs.createWriteStream     │
│              │     process.stdout           │
│              │     http 响应                │
├──────────────┼─────────────────────────────┤
│ Duplex       │ 双向流（既可读又可写）       │
│              │ 例：net.Socket               │
│              │     WebSocket                │
├──────────────┼─────────────────────────────┤
│ Transform    │ 转换流（读写并转换数据）     │
│              │ 例：zlib.createGzip          │
│              │     crypto.createCipheriv     │
└──────────────┴─────────────────────────────┘
```

```javascript
// 大文件复制（错误做法：内存爆炸）
const data = fs.readFileSync('huge.mp4');      // 4GB 内存！
fs.writeFileSync('copy.mp4', data);

// 正确做法：Stream
fs.createReadStream('huge.mp4')
  .pipe(fs.createWriteStream('copy.mp4'));     // 分块传输，内存占用小

// pipe 的进阶用法（gzip 压缩）
fs.createReadStream('data.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('data.txt.gz'));

// Stream 三大事件
const rs = fs.createReadStream('data.txt');
rs.on('data', chunk => console.log('收到 chunk', chunk.length));
rs.on('end', () => console.log('读取完成'));
rs.on('error', err => console.error('出错', err));

// 背压（Backpressure）
// 问题：读得快、写得慢 → 数据积压在内存
// pipe 自动处理背压
// 手动处理：
const rs = fs.createReadStream('in.txt');
const ws = fs.createWriteStream('out.txt');
rs.on('data', chunk => {
  const ok = ws.write(chunk);
  if (!ok) {
    rs.pause();                                  // 暂停读
    ws.once('drain', () => rs.resume());         // 排空后恢复
  }
});

// Stream 组合（pipeline，Node 10+，推荐替代 pipe）
const { pipeline } = require('stream/promises');
await pipeline(
  fs.createReadStream('in.txt'),
  zlib.createGzip(),
  fs.createWriteStream('in.txt.gz')
);
// pipeline 优势：自动清理、错误传播、支持 Promise

// Stream 在 Web 标准中的对应
// Node.js Stream ↔ Web Streams API（ReadableStream/WritableStream）
// Node 18+ 两者可互转：Readable.toWeb() / Readable.fromWeb()
```

---

## 进程、线程与集群

### Q9: child_process、cluster、worker_threads 的区别？⭐⭐⭐ 🔥

| 方案 | 隔离性 | 通信 | 适用场景 |
|:--|:--|:--|:--|
| child_process | 完全独立进程 | IPC（stdio） | 调用外部命令、独立子任务 |
| cluster | 独立进程，共享端口 | IPC | 多核负载均衡（Web 服务） |
| worker_threads | 线程，共享内存 | postMessage / SharedArrayBuffer | CPU 密集计算 |

```javascript
// 1. child_process —— 创建子进程
const { spawn, exec, fork, execFile } = require('child_process');

// spawn：流式输出，适合长时间运行、大数据量
const child = spawn('ls', ['-la']);
child.stdout.on('data', d => console.log(d.toString()));
child.on('close', code => console.log('退出码', code));

// exec：缓冲输出，适合短命令
exec('ls -la', (err, stdout, stderr) => console.log(stdout));

// fork：spawn 的特例，创建 Node 子进程 + IPC 通道
const worker = fork('./worker.js');
worker.send({ task: 'compute' });
worker.on('message', result => console.log(result));

// 2. cluster —— 多进程共享端口（利用多核 CPU）
const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) cluster.fork();

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} 挂了，重启`);
    cluster.fork();                              // 自动重启
  });
} else {
  require('./server.js');                        // 每个 Worker 运行 HTTP 服务
  // 内核负责负载均衡（Linux 上由内核分发，Windows 由 primary 轮询）
}

// 3. worker_threads —— 线程（Node 12+）
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

if (isMainThread) {
  const worker = new Worker(__filename, { workerData: { num: 42 } });
  worker.on('message', result => console.log('计算结果', result));
  worker.on('error', err => console.error(err));
} else {
  // 在 worker 线程中执行 CPU 密集任务
  const result = heavyCompute(workerData.num);
  parentPort.postMessage(result);
}

// worker_threads vs child_process：
// - 线程共享内存（SharedArrayBuffer），通信更快
// - 内存开销小（进程 ~30MB，线程 ~5MB）
// - 但隔离性弱，一个线程崩溃可能影响主线程

// 选型建议：
// - Web 服务多核负载均衡 → cluster（生产用 PM2 cluster 模式）
// - CPU 密集计算（图片处理、加密）→ worker_threads
// - 调用外部命令 / 独立子任务 → child_process
```

### Q10: 进程间通信（IPC）有哪些方式？⭐⭐⭐

```
1. stdio 管道（child_process.spawn 默认）
   父进程 ← stdin/stdout/stderr → 子进程
   
2. IPC 通道（child_process.fork / cluster）
   process.send() / process.on('message')
   基于 socket / named pipe
   
3. 信号（Signal）
   process.kill(pid, 'SIGTERM')
   process.on('SIGTERM', () => cleanup())
   
4. 共享内存（worker_threads）
   SharedArrayBuffer + Atomics
   
5. 网络通信（跨机器）
   HTTP / WebSocket / gRPC / TCP
   
6. 消息队列（跨服务）
   Redis Pub/Sub / RabbitMQ / Kafka
   
7. 文件锁 / 命名管道
   适合无亲缘关系进程

Node.js 常用：
- fork() 自带 IPC 通道，最简单
- cluster 内部用 IPC 做进程管理
- PM2 通过 IPC 实现进程监控和零停机重启
```

---

## HTTP 服务器与框架

### Q11: Node.js 原生 HTTP 服务器怎么写？⭐

```javascript
const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  const { pathname, query } = url.parse(req.url, true);

  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 路由分发
  if (req.method === 'GET' && pathname === '/api/users') {
    res.writeHead(200);
    res.end(JSON.stringify({ users: [] }));
  } else if (req.method === 'POST' && pathname === '/api/users') {
    // 读取请求 body（Stream）
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const data = JSON.parse(body);
      res.writeHead(201);
      res.end(JSON.stringify({ id: 1, ...data }));
    });
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(3000, () => console.log('Server on :3000'));

// 原生 HTTP 的痛点：
// 1. 路由分发要手写 if/else
// 2. body 解析要手动收集 Stream
// 3. 中间件（日志、鉴权、错误处理）没有统一机制
// 4. 静态文件服务要自己实现
// → 所以有 Express / Koa / Fastify / NestJS
```

### Q12: Express、Koa、Fastify、NestJS 怎么选？⭐⭐ 🔥

| 框架 | 中间件模型 | 性能 | 生态 | TypeScript | 适用场景 |
|:--|:--|:--|:--|:--|:--|
| Express | 线性 | 中 | ★★★★★ | 需 @types | 通用 API、快速原型 |
| Koa | 洋葱模型 | 中 | ★★★★ | 需 @types | 需要精细控制中间件 |
| Fastify | 钩子 + 中间件 | **最快** | ★★★ | 内置支持 | 高性能 API |
| NestJS | 洋葱 + DI + 装饰器 | 中（基于 Express/Fastify） | ★★★★ | 原生 TS | 企业级、大型项目 |

```javascript
// Express：最主流，回调风格
const express = require('express');
const app = express();
app.use(express.json());                        // 中间件
app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id });
});
app.use((err, req, res, next) => {              // 错误处理中间件
  res.status(500).json({ error: err.message });
});
app.listen(3000);

// Koa：洋葱模型（async/await）
const Koa = require('koa');
const app = new Koa();
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();                                  // 执行下游
  ctx.set('X-Response-Time', `${Date.now() - start}ms`);
});
app.use(async ctx => { ctx.body = 'Hello'; });
app.listen(3000);

// Fastify：高性能 + Schema 校验
const fastify = require('fastify')();
fastify.get('/users/:id', {
  schema: {
    params: { type: 'object', properties: { id: { type: 'string' } } },
    response: { 200: { type: 'object', properties: { id: { type: 'string' } } } }
  }
}, async (req, reply) => ({ id: req.params.id }));
fastify.listen({ port: 3000 });

// NestJS：装饰器 + 依赖注入 + 模块化
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }
}
// NestJS 底层默认用 Express，可切换到 Fastify
```

**Koa 洋葱模型详解：**

```javascript
// 中间件像洋葱，请求进入时顺序执行，响应返回时逆序执行
app.use(async (ctx, next) => {
  console.log('1 进入');
  await next();
  console.log('6 返回');
});
app.use(async (ctx, next) => {
  console.log('2 进入');
  await next();
  console.log('5 返回');
});
app.use(async (ctx) => {
  console.log('3 处理');
  ctx.body = 'hello';
  console.log('4 处理完');
});

// 输出：1进入 → 2进入 → 3处理 → 4处理完 → 5返回 → 6返回

// 洋葱模型的价值：
// - 日志统计耗时（await next() 前后）
// - 事务管理（await next() 前开启，后提交/回滚）
// - 响应统一包装
// - 错误捕获（try/catch await next()）
```

**选型建议：**
- 快速开发、社区大 → Express
- 需要洋葱模型、精细控制 → Koa
- 追求极致性能 → Fastify
- 企业级、TypeScript、微服务 → NestJS
- BFF 层 / 前端主导 → NestJS 或 Koa

---

## 数据库与 ORM

### Q13: Node.js 连接数据库的方案？⭐⭐

```javascript
// MySQL
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: 'localhost', user: 'root', password: 'xxx',
  database: 'test', waitForConnections: true,
  connectionLimit: 10,                           // 连接池大小
  queueLimit: 0,
});
const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [1]);

// Redis
const Redis = require('ioredis');
const redis = new Redis({ host: 'localhost', port: 6379, db: 0 });
await redis.set('key', 'value', 'EX', 3600);     // 1 小时过期
const val = await redis.get('key');

// MongoDB
const { MongoClient } = require('mongodb');
const client = new MongoClient('mongodb://localhost:27017');
await client.connect();
const db = client.db('test');
const users = await db.collection('users').find({}).toArray();

// ORM 方案
// 1. Prisma（现代、TS 友好、DX 最好）
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const user = await prisma.user.findUnique({ where: { id: 1 } });

// 2. TypeORM（装饰器风格，NestJS 默认）
@Entity()
class User {
  @PrimaryGeneratedColumn() id: number;
  @Column() name: string;
}
const user = await repo.findOne({ where: { id: 1 } });

// 3. Sequelize（老牌，功能全）
const User = sequelize.define('User', { name: DataTypes.STRING });
const user = await User.findByPk(1);

// 4. Mongoose（MongoDB ODM）
const User = mongoose.model('User', new Schema({ name: String }));
const user = await User.findById(id);

// 选型建议：
// - 新项目、TypeScript → Prisma（首推）
// - NestJS 项目 → TypeORM
// - 复杂 SQL、多数据库 → Sequelize
// - MongoDB → Mongoose
```

### Q14: 什么是连接池？为什么需要？⭐⭐

```
问题：每次请求都创建/销毁数据库连接
- TCP 三次握手 + 认证 → 每次开销 ~50-100ms
- 数据库连接数有限（MySQL 默认 151）
- 高并发下连接数暴涨 → 数据库崩溃

连接池：预先创建 N 个连接，复用
┌──────────────────────────────┐
│      连接池（Connection Pool）│
│  ┌────┐┌────┐┌────┐┌────┐    │
│  │ C1 ││ C2 ││ C3 ││ C4 │ …  │
│  └────┘└────┘└────┘└────┘    │
└──────────────────────────────┘
       ↑       ↓
   请求获取  用完归还

关键配置：
- connectionLimit：最大连接数（一般 = CPU 核数 × 2 + 磁盘数）
- queueLimit：等待队列长度
- idleTimeout：空闲连接超时回收
- acquireTimeout：获取连接超时

Node.js 各库默认都有连接池：
- mysql2: createPool()
- pg: new Pool()
- Redis: ioredis 内置
- Mongoose: 内置

连接池监控：
- 活跃连接数 / 空闲连接数 / 等待队列长度
- 连接泄漏检测（长时间未归还）
```

---

## 性能优化

### Q15: Node.js 性能优化手段？⭐⭐⭐ 🔥

```
1. CPU 密集任务处理
   - Worker Threads（首选）
   - 任务队列（Bull / BullMQ + Redis）
   - 微服务拆分（专门的服务处理计算任务）

2. I/O 优化
   - 使用异步 API（fs.promises 而非 fs sync）
   - 连接池（数据库、Redis、HTTP Agent）
   - HTTP Keep-Alive（复用 TCP 连接）
   - 批处理（bulk insert、pipeline）

3. 缓存策略
   - 内存缓存：LRU-Cache / node-cache（进程内，最快）
   - 分布式缓存：Redis（多实例共享）
   - HTTP 缓存：ETag / Last-Modified / Cache-Control
   - 多级缓存：内存 → Redis → 数据库

4. 内存管理
   - 避免大对象（用 Stream 处理大文件）
   - 及时释放引用（避免闭包持有大数据）
   - 监控 V8 堆：process.memoryUsage()
   - 排查内存泄漏：--inspect + Chrome DevTools 拍堆快照

5. 代码层面
   - 避免同步 API（fs.readFileSync 阻塞事件循环）
   - JSON 大对象序列化用 fast-json-stringify（基于 Schema）
   - 正则避免灾难性回溯（用 safe-regex 检查）
   - 减少闭包和函数创建（V8 优化）

6. 部署层面
   - Cluster / PM2 多进程利用多核
   - Docker 容器化 + K8s 水平扩展
   - Nginx 反向代理 + 负载均衡 + 静态资源
   - CDN 加速静态资源
   - Gzip / Brotli 压缩

7. 监控工具
   - clinic.js（诊断 Node.js 性能问题）
   - 0x（火焰图）
   - node --prof（V8 profiler）
   - Prometheus + Grafana（生产监控）
   - APM：New Relic / DataDog / 阿里 ARMS
```

```javascript
// 性能分析工具 clinic.js
// 安装：npm i -g clinic
// 使用：
clinic doctor -- node server.js       // 综合诊断
clinic flame -- node server.js        // 火焰图
clinic bubbleprof -- node server.js   // 异步操作分析

// 内存泄漏排查
const v8 = require('v8');
const heapStats = v8.getHeapStatistics();
console.log(heapStats);
// {
//   total_heap_size: 20971520,
//   used_heap_size: 15728640,
//   heap_size_limit: 2197815296,   // 默认 ~2GB（64位）
// }

// 手动触发 GC（需启动参数 --expose-gc）
global.gc();

// HTTP Keep-Alive Agent（复用 TCP 连接）
const http = require('http');
const agent = new http.Agent({ keepAlive: true, maxSockets: 100 });
http.get({ host: 'api.example.com', agent });
```

---

## 部署运维

### Q16: PM2 是什么？常用命令？⭐⭐ 🔥

```
PM2（Process Manager 2）：Node.js 生产环境进程管理器

核心功能：
1. 守护进程（崩溃自动重启）
2. 集群模式（多核负载均衡）
3. 零停机重启（reload）
4. 日志管理（合并、切割）
5. 监控（CPU、内存、重启次数）
6. 开机自启

常用命令：
pm2 start app.js --name myapp         # 启动
pm2 start app.js -i max               # 集群模式（max = CPU 核数）
pm2 list                              # 查看所有进程
pm2 logs myapp                        # 查看日志
pm2 monit                             # 实时监控面板
pm2 restart myapp                     # 重启（有短暂中断）
pm2 reload myapp                      # 零停机重启（滚动更新）
pm2 stop myapp                        # 停止
pm2 delete myapp                      # 删除
pm2 save                              # 保存进程列表
pm2 startup                           # 生成开机自启脚本

配置文件（ecosystem.config.js）：
```

```javascript
module.exports = {
  apps: [{
    name: 'myapp',
    script: './dist/main.js',
    instances: 'max',                    // 集群数（max = CPU 核数）
    exec_mode: 'cluster',                // 集群模式
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    max_memory_restart: '1G',            // 内存超限自动重启
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    // 优雅关闭
    kill_timeout: 5000,
    wait_ready: true,                    // 等待 process.send('ready')
    listen_timeout: 10000,
  }],
};

// 应用中：
process.send('ready');                   // 通知 PM2 应用就绪
process.on('SIGINT', () => {             // 优雅关闭
  server.close(() => process.exit(0));
});
```

### Q17: Node.js Docker 部署最佳实践？⭐⭐

```dockerfile
# 多阶段构建（镜像最小化）

# 阶段 1：构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production              # 只装生产依赖
COPY . .
RUN npm run build                         # TS 编译 / 打包

# 阶段 2：运行
FROM node:20-alpine
WORKDIR /app

# 安全：不用 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 只复制构建产物和生产依赖
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

USER nodejs
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# 用 node 直接启动（不用 npm start，让 Node 成为 PID 1，接收 SIGTERM）
CMD ["node", "dist/main.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:pass@db:5432/app
    depends_on: [db, redis]
    restart: unless-stopped
  db:
    image: postgres:16-alpine
    volumes: [pgdata:/var/lib/postgresql/data]
  redis:
    image: redis:7-alpine
volumes:
  pgdata:
```

**关键实践：**
1. **基础镜像**：用 alpine（~150MB）而非默认（~900MB）
2. **多阶段构建**：构建工具不进最终镜像
3. **不用 root**：创建专用用户
4. **健康检查**：K8s / Docker 依赖它判断服务状态
5. **优雅关闭**：处理 SIGTERM，先停止接受新请求，等现有请求完成
6. **PID 1 问题**：用 `node` 直接启动，或用 `tini` 作为 init
7. **配置外置**：环境变量 / ConfigMap，不打进镜像

---

## 安全

### Q18: Node.js 常见安全风险与防护？⭐⭐

```
1. 依赖漏洞
   - npm audit / snyk / socket.dev 扫描
   - 定期更新（npm-check-updates）
   - lock 文件提交，防止 CI 装到不同版本

2. XSS（服务端渲染场景）
   - 转义用户输入（用模板引擎默认转义，别关闭）
   - CSP 响应头（helmet.contentSecurityPolicy）
   - 富文本用 sanitize-html / DOMPurify

3. SQL 注入
   - 参数化查询（?占位符），永远别拼字符串
   - 用 ORM（Prisma/TypeORM 默认参数化）

4. CSRF
   - SameSite Cookie
   - CSRF Token（csurf 中间件）
   - 验证 Origin / Referer

5. 敏感信息泄漏
   - 生产环境不返回 stack trace
   - .env 文件不进 Git（.gitignore）
   - 日志脱敏（手机号、身份证、密码）
   - 错误响应不暴露内部信息

6. HTTP 安全头（helmet 一键搞定）
   const helmet = require('helmet');
   app.use(helmet());
   // 自动设置：
   // - X-Content-Type-Options: nosniff
   // - X-Frame-Options: SAMEORIGIN
   // - Strict-Transport-Security
   // - Content-Security-Policy
   // - X-XSS-Protection

7. 速率限制（防 DDoS / 暴力破解）
   const rateLimit = require('express-rate-limit');
   app.use('/api/', rateLimit({ windowMs: 15*60*1000, max: 100 }));

8. 请求体大小限制（防内存耗尽）
   app.use(express.json({ limit: '1mb' }));

9. 原型污染
   - 避免直接 Object.assign({}, JSON.parse(userInput))
   - 用 lodash.merge 前先看 CVE，或换 defu / merge-deep
   - 校验 __proto__ / constructor / prototype 键

10. SSRF（服务端请求伪造）
    - 用户传入 URL 时白名单校验
    - 禁止内网 IP（10.x / 192.168.x / 127.x）
```

---

## 生态与工具

### Q19: Node.js 常见工具库？⭐⭐

```
HTTP 客户端：
- axios（最流行，Promise API）
- node-fetch（fetch API 兼容）
- got（功能强大，重试、hooks）
- undici（Node 官方，最快，fetch 内置实现）

参数校验：
- zod（TS 友好，运行时校验 + 类型推断）
- joi（功能全，Schema 声明式）
- yup（前端也用，Formik 搭配）
- class-validator（NestJS 默认，装饰器风格）

日志：
- pino（性能最好，JSON 格式）
- winston（灵活，多 transport）
- consola（美观，Nuxt 默认）

任务队列：
- bull / bullmq（Redis 后端，最流行）
- agenda（MongoDB 后端）
- bee-queue（轻量 Redis）

定时任务：
- node-cron（Cron 表达式）
- node-schedule（更灵活）

工具库：
- lodash（工具函数）
- dayjs（日期，moment 替代品）
- uuid（生成唯一 ID）
- dotenv（.env 加载）

TypeScript 支持：
- ts-node（直接运行 TS）
- tsx（更快，基于 esbuild）
- @types/node（Node API 类型）

打包与发布：
- esbuild（极快，打包 CLI 工具）
- tsup（基于 esbuild 的库打包）
- pkg / nexe（打包成单文件可执行）
- ncc（@vercel/ncc，打包成单文件）
```

---

## 实战场景

### Q20: 如何用 Node.js 实现 BFF 层？⭐⭐⭐ 🔥

```
BFF（Backend For Frontend）价值：
- 接口聚合（多微服务 → 一个前端接口）
- 数据裁剪（只返回前端需要的字段）
- 适配多端（Web / App / 小程序不同结构）
- 缓冲层（后端变更时 BFF 消化差异）
- SSR（服务端渲染）

NestJS 实现 BFF：
```

```typescript
// user.controller.ts
@Controller('bff')
export class BffController {
  constructor(
    private userService: UserService,
    private orderService: OrderService,
    private productService: ProductService,
  ) {}

  // 首页聚合接口：一次请求拿到用户信息 + 订单 + 推荐商品
  @Get('home')
  async getHomeData(@Req() req) {
    const userId = req.user.id;

    // 并行调用多个下游服务（Promise.all）
    const [user, orders, recommendations] = await Promise.all([
      this.userService.getProfile(userId),
      this.orderService.getRecentOrders(userId, 5),
      this.productService.getRecommendations(userId, 10),
    ]);

    // 数据裁剪 + 格式化
    return {
      user: {
        name: user.name,
        avatar: user.avatarUrl,
        level: user.vipLevel,
        // 不返回敏感信息（手机号、身份证、地址）
      },
      orders: orders.map(o => ({
        id: o.id,
        title: o.items[0].name,
        status: o.status,
        // 不返回详细的物流、发票等信息
      })),
      products: recommendations.map(p => ({
        id: p.id,
        title: p.title,
        price: p.price,
        image: p.images[0],
      })),
    };
  }
}

// BFF 关键实践：
// 1. 并行请求（Promise.all）而非串行
// 2. 超时控制（Promise.race + timeout）
// 3. 降级策略（某个下游挂了返回兜底数据）
// 4. 缓存（Redis 缓存聚合结果，短 TTL）
// 5. 类型共享（前后端共用 DTO 类型）
// 6. 错误统一处理（下游错误转前端友好提示）
```

### Q21: Node.js 如何做 SSR？⭐⭐⭐

```javascript
// 最简单的 SSR（原生 HTTP + Vue）
const { createSSRApp } = require('vue');
const { renderToString } = require('vue/server-renderer');
const http = require('http');

http.createServer(async (req, res) => {
  const app = createSSRApp({
    data: () => ({ message: 'Hello SSR' }),
    template: '<div>{{ message }}</div>',
  });
  const html = await renderToString(app);
  res.end(`
    <!DOCTYPE html>
    <html>
      <body>
        <div id="app">${html}</div>
        <script src="/client.js"></script>
      </body>
    </html>
  `);
}).listen(3000);

// 现代 SSR 框架：
// - Next.js（React）：文件路由 + SSR/SSG/ISR + API Routes
// - Nuxt 3（Vue）：文件路由 + SSR/SSG + Server API
// - Astro：SSG 为主 + 岛屿架构（局部 hydration）
// - Remix：SSR + Web 标准 + 嵌套路由

// SSR 关键问题：
// 1. 数据获取：服务端预取（getServerSideProps / useFetch）
// 2. 状态脱水/注水：服务端 state → HTML → 客户端 hydration
// 3. 环境判断：typeof window === 'undefined' 区分服务端
// 4. 内存泄漏：服务端不能持有请求级数据到全局
// 5. 性能：缓存渲染结果、流式 SSR、部分 hydration
```

---

## 复习卡片

> [!TIP]
> **快速复习清单**
>
> 1. **Node.js 特点**：单线程 + 非阻塞 I/O + 事件驱动，适合 I/O 密集
> 2. **架构**：V8（执行 JS）+ libuv（异步 I/O）+ C++ Bindings
> 3. **高并发原理**：事件循环 + libuv 线程池，主线程不阻塞
> 4. **CJS vs ESM**：运行时同步拷贝 vs 编译时静态引用；ESM 支持顶层 await 和 Tree Shaking
> 5. **循环依赖**：Node 返回不完整 exports，需重构避免
> 6. **事件循环六阶段**：timers → pending → poll → check → close；nextTick > Promise > setTimeout
> 7. **Buffer**：二进制容器，堆外内存，alloc/from/concat/slice
> 8. **Stream 四类**：Readable / Writable / Duplex / Transform；pipe 处理背压；pipeline 更安全
> 9. **多核利用**：cluster（Web 服务）/ worker_threads（CPU 密集）/ child_process（外部命令）
> 10. **框架选型**：Express 通用 / Koa 洋葱 / Fastify 性能 / NestJS 企业级
> 11. **Koa 洋葱模型**：await next() 前后逻辑对称，用于日志、事务、错误处理
> 12. **数据库**：Prisma（现代首选）/ TypeORM（NestJS）/ Sequelize / Mongoose
> 13. **连接池**：预创建连接复用，避免频繁握手，注意连接泄漏
> 14. **性能优化**：Stream 处理大文件 + 缓存（内存/Redis）+ 多进程 + 异步 API + 监控（clinic.js）
> 15. **PM2**：集群模式 + 零停机 reload + 日志管理 + 监控
> 16. **Docker 部署**：多阶段构建 + alpine + 非 root 用户 + 健康检查 + 优雅关闭
> 17. **安全**：helmet + rate limit + 参数化查询 + 依赖审计 + 请求体大小限制
> 18. **BFF 实践**：接口聚合 + 数据裁剪 + 并行调用 + 降级 + 缓存
> 19. **SSR**：Next.js / Nuxt / Astro；数据脱水注水 + 环境判断 + 内存泄漏防范

---

> [!TIP]
> 🎉 **恭喜！** 你已完成《前端面试宝典》全部 20 篇文章的学习（00 总览 + 19 专题）。
>
> 返回 [面试宝典总览](/blog/posts/interview-guide-00-overview/) | [面试宝典合集页](/blog/interview-guide/)
>
> **Node.js 学习延伸**：
> - 官方文档：https://nodejs.org/docs/latest/api/
> - Node.js 设计模式（书）
> - 《Node.js 调试指南》
> - NestJS 官方文档（企业级最佳实践）
