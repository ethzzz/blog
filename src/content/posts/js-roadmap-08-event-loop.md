---
title: '08 · 事件循环与异步'
published: 2026-09-29T18:00:00+08:00
description: 'JavaScript 异步的核心：调用栈、Web APIs、宏任务与微任务队列、事件循环调度顺序，Promise/async-await 的本质，以及一道经典输出题彻底讲清执行顺序。'
tags: [JavaScript, 事件循环, 宏任务, 微任务, async]
category: JavaScript学习路线
draft: false
---

## 异步为什么需要事件循环

JS 单线程，若同步等网络/I/O 会卡死页面。于是浏览器把耗时操作（定时器、网络、DOM 事件）交给**其他线程（Web APIs）**处理，完成后把回调**排队**，等调用栈空了再执行——这套调度机制就是**事件循环（Event Loop）**。

---

## 两个队列：宏任务 vs 微任务

- **宏任务（macrotask）**：`setTimeout` / `setInterval` / `setImmediate` / I/O / UI 渲染。
- **微任务（microtask）**：`Promise.then/catch/finally` / `queueMicrotask` / `MutationObserver`。

**调度规则**：每次调用栈清空后，先**把当前所有微任务清空**，再取**一个**宏任务执行，如此往复。

---

## 经典题：输出顺序

```js
console.log("1");              // 同步
setTimeout(() => console.log("2"), 0); // 宏任务
Promise.resolve().then(() => console.log("3")); // 微任务
console.log("4");              // 同步
// 输出：1 4 3 2
```

解析：同步先跑 → `1`、`4`；栈空 → 清空微任务 → `3`；再取宏任务 → `2`。

---

## async/await 的本质

`async` 函数返回 `Promise`；`await` 后面跟着的"同步部分"像 `then` 回调一样变成微任务：

```js
async function run() {
  console.log("a");
  await null;        // 之后的代码等价于 .then(...)
  console.log("b");
}
run();
console.log("c");
// 输出：a c b
```

`await` 让"后面的代码"让出执行权，等微任务阶段再继续。

---

## 小结

- 单线程 + Web APIs + 事件循环 = JS 不阻塞的秘诀。
- 微任务优先于宏任务；每次清空所有微任务再取一个宏任务。
- `async/await` 是 Promise 的语法糖，`await` 之后进微任务队列。

---

## 练习

1. 写出下面输出并解释：`console.log('A'); setTimeout(()=>console.log('B'),0); Promise.resolve().then(()=>console.log('C')); console.log('D')`。
2. 用"宏/微任务"规则解释为什么 `await` 后面的代码总是在当前同步栈之后执行。
3. 写一个会"饿死"宏任务的代码（微任务里不断塞微任务），说明危害。
