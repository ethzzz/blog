---
title: '03 · HTTP 服务与中间件'
published: 2026-10-13T12:00:00+08:00
description: 'Node HTTP 服务从零讲起：原生 http 模块、Express 路由与中间件、Koa 洋葱模型原理、手写 40 行迷你中间件引擎，理解 NestJS 之前的必经之路。'
tags: [Node.js, Express, Koa, 中间件]
category: Node全栈学习路线
draft: false
---

> [!NOTE]
> 有人建议前端直接上 NestJS，我反对。因为 Nest 的中间件、拦截器、守卫全是"中间件思想"的变体，不懂原生那套，你只能背 API 而不能推导行为。这一篇从 20 行原生 http 代码讲到手写中间件引擎——看完你就明白框架只是帮你省了样板代码。

---

## 1. 原生 http：一切的地基

不依赖任何框架，Node 就能起一个服务：

```js
import http from 'node:http';

const server = http.createServer((req, res) => {
  // req: http.IncomingMessage（可读流），res: http.ServerResponse（可写流）
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/hello') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ msg: 'hello' }));
    return;
  }
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(3000, () => console.log('http://localhost:3000'));
```

三个必须建立的认知：

1. **req 和 res 都是 Stream**。POST body 不是一次性给你的，要监听 `data`/`end` 事件或用 `for await` 收集——框架帮你做了这个脏活。
2. **没有路由**。`createServer` 只有一个入口函数，所有路径都要自己 `if-else`。路由分发正是框架的第一个价值。
3. **请求天然异步**。一个进程同时服务成百上千连接，全靠第 02 篇的事件循环。

## 2. Express：中间件模型的行业事实标准

Express 解决的就是"把一个巨大入口函数拆成一串中间件"：

```js
import express from 'express';
const app = express();

app.use(express.json());                      // 解析 body 挂到 req.body
app.use((req, res, next) => {                 // 自定义：计时中间件
  const start = Date.now();
  res.on('finish', () => console.log(req.method, req.url, Date.now() - start, 'ms'));
  next();                                     // 放行到下一个
});

app.get('/api/posts/:id', (req, res) => {     // 路由 + 参数
  res.json({ id: req.params.id });
});

app.use((err, req, res, next) => {            // 四参数 = 错误处理中间件
  console.error(err);
  res.status(500).json({ msg: 'Internal Error' });
});

app.listen(3000);
```

Express 的执行模型是**直线流水线**：`next()` 调用就进入下一个中间件，不调用就挂起。注意它**没有"回程"**——响应在去程的某个中间件里就发出去了。

## 3. Koa：洋葱模型的优雅

Koa 由 Express 原班人马重写，核心改变是中间件支持 `async/await`，形成了"洋葱"：

```js
import Koa from 'koa';
const app = new Koa();

app.use(async (ctx, next) => {
  const start = Date.now();   // ① 去程
  await next();               // ② 进入内层
  console.log(Date.now() - start, 'ms');  // ④ 回程：内层处理完才执行到这里
});

app.use(async (ctx) => {
  ctx.body = { msg: 'hello' };  // ③ 最内层：真正写响应
});

app.listen(3000);
```

```text
    请求 ──▶ ① 计时中间件 ──▶ ③ 业务中间件
    响应 ◀── ④ 打印耗时   ◀──（next 返回后回程）
```

两代模型对比，这直接决定了你后面能不能看懂 Nest 的拦截器：

| | Express | Koa |
| --- | --- | --- |
| 模型 | 直线流水线 | 洋葱（去程 + 回程） |
| 异步方式 | 回调 `next()` | `await next()` |
| 响应后处理 | 要靠事件监听 hack | 回程天然可做（日志、耗时、统一包装响应体） |
| 错误处理 | 特殊四参数中间件 | try/catch 包住 `await next()` |
| 内置 body 解析 | ✅ express.json() | ❌ 要装 koa-bodyparser |

Koa 的回程能力是关键：**统一给响应包一层 `{ code, data }`、记录每个请求耗时、捕获下游异常**，都只需要一个外层中间件。

## 4. 手写迷你中间件引擎：40 行看穿本质

这是我给组里新人布置的经典练习，写完你对所有 Node 框架祛魅：

```js
class MiniKoa {
  #middlewares = [];

  use(fn) { this.#middlewares.push(fn); return this; }

  listen(port) {
    const server = http.createServer(async (req, res) => {
      // 组装 ctx：把原生对象挂上去，再放两个便捷方法
      const ctx = { req, res, body: undefined };
      ctx.set = (k, v) => res.setHeader(k, v);
      ctx.json = (data) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); };

      // compose：把中间件数组组合成一个洋葱
      const dispatch = (i) => {
        if (i >= this.#middlewares.length) return Promise.resolve();
        return Promise.resolve(this.#middlewares[i](ctx, () => dispatch(i + 1)));
      };
      try {
        await dispatch(0);
      } catch (err) {
        res.statusCode = 500;
        res.end('Internal Error');
      }
    });
    server.listen(port);
  }
}
```

核心就是 `dispatch(i)`：**第 i 个中间件的 `next` 就是"调用第 i+1 个"**，`await` 等它跑完再回到自己下半段——洋葱就这么简单。Nest 的拦截器、Express 5 的 Promise 化、Fastify 的 hooks，本质都是这个 compose 函数的变体。

## 5. 从 Express 到 Nest 的过渡认知

用一张表完成视角转换，第 04 篇会展开：

| Express/Koa 概念 | NestJS 对应物 |
| --- | --- |
| 路由 + 控制函数 | `@Controller()` + `@Get()` |
| body 解析/校验中间件 | ValidationPipe + class-validator（第 08 篇） |
| 错误处理中间件 | Exception Filter（第 08 篇） |
| 自定义中间件挂 req 属性 | Middleware（概念几乎不变） |
| 依赖注入 | 全新的，Express 世界没有 |

我的建议：**用纯 Express 写一个 5 个接口的小服务**（不要 Nest），亲手处理 body 解析、404、错误兜底，感受"没有约束的自由"。之后再进 Nest，你会明白它每一层抽象在替你解决什么。

---

## 小结

- 原生 http：req/res 都是流，没有路由，框架的本质是"中间件分发 + 样板代码收敛"。
- Express 直线流水线，Koa 洋葱模型；回程能力让统一日志/响应包装变简单。
- 中间件引擎核心 40 行：`dispatch(i)` 递归 + `next` 即"下一个"。
- Express 适合小项目打基础，Nest 适合工程化交付——第 04 篇正式切换。

---

## 练习

1. 用原生 http 写一个 `/api/echo` 接口：原样返回 POST body 的 JSON（提示：`for await (const chunk of req)` 收集 body）。
2. 用 Express 实现三个中间件：请求日志、简单限流（内存计数 60 秒内最多 100 次）、404 兜底，观察执行顺序。
3. 把本文的 MiniKoa 跑起来，加一个洋葱中间件验证回程顺序（先 console.log('a')、next、再 console.log('a2')）。
4. 思考题：Express 的错误处理中间件为什么必须是四个参数？（提示：框架靠 `fn.length` 识别签名。）
