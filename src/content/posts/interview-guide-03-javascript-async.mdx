---
title: 'JS 异步与事件循环面试题（中高级）'
published: 2026-09-15T13:00:00+08:00
description: '深入讲解 Event Loop、宏任务微任务、Promise、async/await、Generator 等异步编程核心面试题。'
tags: [前端面试, JavaScript, EventLoop, Promise, async]
category: 前端面试宝典
draft: false
---

> [!NOTE]
> 本文包含 20+ 道 JS 异步编程面试题，难度标注：⭐ 基础 · ⭐⭐ 进阶 · ⭐⭐⭐ 高级 · 🔥 高频必考

---

## 事件循环 (Event Loop)

### Q1: 什么是 Event Loop？⭐⭐ 🔥

**答：**

Event Loop 是 JavaScript 的执行机制，用于协调单线程与异步操作的关系。

```
┌─────────────────────────────────────┐
│           执行栈 (Call Stack)        │
└───────────────────┬─────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│      微任务队列 (Microtask Queue)    │
│  Promise.then/catch/finally        │
│  MutationObserver                  │
│  queueMicrotask()                  │
└───────────────────┬─────────────────┘
                    │ 微任务清空后
                    ▼
┌─────────────────────────────────────┐
│      宏任务队列 (Macrotask Queue)    │
│  setTimeout/setInterval            │
│  setImmediate (Node)               │
│  I/O、UI 渲染                       │
│  requestAnimationFrame             │
└─────────────────────────────────────┘
```

**执行顺序：**
1. 执行同步代码（调用栈）
2. 清空微任务队列
3. 执行一个宏任务
4. 重复步骤 2-3

### Q2: 宏任务和微任务有哪些？⭐ 🔥

**答：**

| 类型 | 任务 |
|:--|:--|
| **微任务** | `Promise.then/catch/finally` |
| | `MutationObserver` |
| | `queueMicrotask()` |
| | `process.nextTick` (Node，优先级更高) |
| **宏任务** | `setTimeout` |
| | `setInterval` |
| | `setImmediate` (Node) |
| | I/O 操作 |
| | UI 渲染 |
| | `MessageChannel` |
| | `postMessage` |

```javascript
console.log('1'); // 同步

setTimeout(() => {
  console.log('2'); // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('3'); // 微任务
});

console.log('4'); // 同步

// 输出：1 4 3 2
```

### Q3: 经典 Event Loop 输出题 ⭐⭐⭐ 🔥

```javascript
// 题目 1
console.log('script start');

setTimeout(function() {
  console.log('setTimeout');
}, 0);

new Promise(function(resolve) {
  console.log('promise executor'); // 同步执行
  resolve();
}).then(function() {
  console.log('promise then');
});

console.log('script end');

// 输出顺序：
// script start
// promise executor
// script end
// promise then
// setTimeout
```

```javascript
// 题目 2：嵌套 Promise
Promise.resolve().then(() => {
  console.log('then1');
  Promise.resolve().then(() => {
    console.log('then1-1');
  });
}).then(() => {
  console.log('then2');
});

// 输出：then1 -> then1-1 -> then2
```

```javascript
// 题目 3：async/await 与 Promise
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(function() {
  console.log('setTimeout');
}, 0);

async1();

new Promise(function(resolve) {
  console.log('promise1');
  resolve();
}).then(function() {
  console.log('promise2');
});

console.log('script end');

// 输出：
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```

### Q4: Node.js 的 Event Loop 和浏览器有什么不同？⭐⭐⭐

**答：**

Node.js 的 Event Loop 分为 6 个阶段：

```
   ┌───────────────────────────┐
┌─>│           timers          │  setTimeout/setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  系统操作回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  内部使用
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  I/O 回调
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │      close callbacks      │  close 事件
│  └───────────────────────────┘
```

```javascript
// Node.js 中的执行顺序
setImmediate(() => console.log('setImmediate'));
setTimeout(() => console.log('setTimeout'), 0);

// 不确定顺序（取决于进入 Event Loop 的时间）

// 在 I/O 回调中，setImmediate 总是先执行
const fs = require('fs');
fs.readFile(__filename, () => {
  setTimeout(() => console.log('setTimeout'), 0);
  setImmediate(() => console.log('setImmediate'));
});
// 输出：setImmediate -> setTimeout
```

---

## Promise

### Q5: Promise 有哪几种状态？⭐ 🔥

**答：**

| 状态 | 说明 |
|:--|:--|
| `pending` | 进行中，初始状态 |
| `fulfilled` | 已成功 |
| `rejected` | 已失败 |

```javascript
// 状态一旦改变就不可逆
const p = new Promise((resolve, reject) => {
  resolve('success');  // pending -> fulfilled
  reject('error');     // 无效，状态已确定
});

p.then(v => console.log(v)); // 'success'
```

### Q6: Promise 的常用方法？⭐⭐ 🔥

**答：**

```javascript
// 1. then/catch/finally
promise
  .then(value => { /* 成功 */ })
  .catch(error => { /* 失败 */ })
  .finally(() => { /* 总是执行 */ });

// 2. 静态方法
Promise.resolve(value);      // 返回成功的 Promise
Promise.reject(error);       // 返回失败的 Promise

// 3. 并发处理
Promise.all([p1, p2, p3])
  .then(results => {})       // 全部成功才成功
  .catch(err => {});         // 任一失败就失败

Promise.allSettled([p1, p2]) // ES2020
  .then(results => {
    // [{status: 'fulfilled', value}, {status: 'rejected', reason}]
  });

Promise.race([p1, p2])       // 第一个完成的结果
  .then(result => {});

Promise.any([p1, p2])        // ES2021，第一个成功的结果
  .then(value => {});
```

### Q7: 如何实现 Promise.all？⭐⭐⭐

```javascript
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let count = 0;
    const len = promises.length;
    
    if (len === 0) {
      resolve([]);
      return;
    }
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise).then(value => {
        results[index] = value;
        count++;
        if (count === len) {
          resolve(results);
        }
      }).catch(reject);
    });
  });
}

// 测试
promiseAll([
  Promise.resolve(1),
  Promise.resolve(2),
  3 // 非 Promise 也可以
]).then(console.log); // [1, 2, 3]
```

### Q8: Promise 链式调用的原理？⭐⭐

```javascript
// then 返回新的 Promise
promise
  .then(value => {
    return value * 2;        // 返回普通值，下一个 then 收到 2
  })
  .then(value => {
    return Promise.resolve(value * 2); // 返回 Promise
  })
  .then(value => {
    console.log(value);      // 4
    throw new Error('error'); // 抛出错误
  })
  .catch(err => {
    console.log('caught:', err.message);
    return 'recovered';      // 恢复，下一个 then 收到
  })
  .then(value => {
    console.log(value);      // 'recovered'
  });
```

---

## async/await

### Q9: async/await 的原理？⭐⭐ 🔥

**答：**

`async/await` 是 Generator + Promise 的语法糖。

```javascript
// async 函数总是返回 Promise
async function fn() {
  return 1;
}
fn().then(v => console.log(v)); // 1

// await 暂停执行，等待 Promise 完成
async function fetchData() {
  const res = await fetch(url); // 暂停，等待 Promise
  const data = await res.json();
  return data;
}

// 等价于
function fetchData() {
  return fetch(url)
    .then(res => res.json())
    .then(data => data);
}
```

### Q10: async/await 错误处理？⭐⭐

```javascript
// 方式1：try/catch
async function fn() {
  try {
    const result = await somePromise();
    return result;
  } catch (error) {
    console.error('Error:', error);
    // 可以选择重新抛出或返回默认值
    throw error;
  } finally {
    // 清理工作
  }
}

// 方式2：.catch()
async function fn() {
  const result = await somePromise().catch(err => {
    console.error(err);
    return null; // 返回默认值
  });
  
  if (!result) return; // 处理错误情况
}

// 方式3：统一处理
const [err, data] = await to(somePromise());
function to(promise) {
  return promise
    .then(data => [null, data])
    .catch(err => [err, null]);
}
```

### Q11: 串行 vs 并行执行 ⭐⭐ 🔥

```javascript
// ❌ 串行执行（慢）
async function serial() {
  const a = await fetchA(); // 等待 A 完成
  const b = await fetchB(); // 再等待 B
  return [a, b];
}
// 总时间 = A时间 + B时间

// ✅ 并行执行（快）
async function parallel() {
  const [a, b] = await Promise.all([
    fetchA(),
    fetchB()
  ]);
  return [a, b];
}
// 总时间 = max(A时间, B时间)

// ✅ 并行 + 错误隔离
async function parallelSafe() {
  const [a, b] = await Promise.allSettled([
    fetchA(),
    fetchB()
  ]);
  
  const resultA = a.status === 'fulfilled' ? a.value : null;
  const resultB = b.status === 'fulfilled' ? b.value : null;
  
  return [resultA, resultB];
}
```

---

## Generator

### Q12: 什么是 Generator？⭐⭐

**答：**

Generator 是可以暂停和恢复执行的函数。

```javascript
// 定义
function* generator() {
  console.log('start');
  yield 1;
  console.log('resume 1');
  yield 2;
  console.log('resume 2');
  return 3;
}

// 使用
const gen = generator();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: true }

// 应用场景：惰性求值
function* idMaker() {
  let index = 0;
  while (true) {
    yield index++;
  }
}
const ids = idMaker();
ids.next().value; // 0
ids.next().value; // 1
// 无限序列，按需生成

// 应用场景：异步流程控制（async/await 之前）
function run(gen) {
  const it = gen();
  
  function step(result) {
    if (result.done) return Promise.resolve(result.value);
    
    return Promise.resolve(result.value)
      .then(value => step(it.next(value)))
      .catch(err => step(it.throw(err)));
  }
  
  return step(it.next());
}
```

---

## 实战题

### Q13: 实现 sleep 函数 ⭐

```javascript
// Promise 版本
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 使用
async function fn() {
  console.log('start');
  await sleep(1000);
  console.log('after 1s');
}
```

### Q14: 实现并发控制器 ⭐⭐⭐ 🔥

```javascript
// 限制同时执行的异步任务数量
function concurrentLimit(tasks, limit) {
  return new Promise((resolve, reject) => {
    const results = [];
    const running = new Set();
    let index = 0;
    
    function run() {
      while (index < tasks.length && running.size < limit) {
        const i = index++;
        const task = tasks[i];
        
        const promise = Promise.resolve(task())
          .then(result => {
            running.delete(promise);
            results[i] = { status: 'fulfilled', value: result };
            run(); // 继续执行下一个
          })
          .catch(error => {
            running.delete(promise);
            results[i] = { status: 'rejected', reason: error };
            run();
          });
        
        running.add(promise);
      }
      
      if (running.size === 0 && index >= tasks.length) {
        resolve(results);
      }
    }
    
    run();
  });
}

// 使用
const tasks = [
  () => fetch('/api/1'),
  () => fetch('/api/2'),
  () => fetch('/api/3'),
  () => fetch('/api/4'),
  () => fetch('/api/5'),
];

concurrentLimit(tasks, 2).then(results => {
  console.log(results);
});
```

### Q15: 实现防抖和节流 ⭐⭐ 🔥

```javascript
// 防抖：事件停止触发 n 秒后执行
function debounce(fn, delay) {
  let timer = null;
  
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 节流：每 n 秒最多执行一次
function throttle(fn, interval) {
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// 节流（定时器版）
function throttleTimer(fn, interval) {
  let timer = null;
  
  return function(...args) {
    if (timer) return;
    
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, interval);
  };
}
```

---

## 复习卡片

```javascript
// Event Loop 执行顺序
// 同步代码 -> 微任务（全部）-> 宏任务（一个）-> 微任务 -> ...

// 微任务
Promise.then/catch/finally
MutationObserver
queueMicrotask()

// 宏任务
setTimeout / setInterval
setImmediate (Node)
I/O / UI 渲染

// async/await 本质
// async 函数返回 Promise
// await 暂停执行，让出主线程

// 并行 vs 串行
// 串行：await a; await b;
// 并行：await Promise.all([a, b]);
```

| 概念 | 关键点 |
|:--|:--|
| Event Loop | 协调单线程与异步的机制 |
| 微任务 | Promise.then，优先级高 |
| 宏任务 | setTimeout，优先级低 |
| async/await | Generator + Promise 语法糖 |
| Promise.all | 全部成功才成功 |
| Promise.race | 第一个完成的结果 |

> [!TIP]
> 下一篇：[Vue 框架面试题](/blog/posts/interview-guide-04-vue/)
> 
> 涵盖 Vue 响应式原理、虚拟 DOM、Diff 算法、生命周期、组件通信等核心知识点。
