---
title: '手写代码题专篇（笔试必考 18 题）'
published: 2026-09-16T18:00:00+08:00
description: '防抖节流、深拷贝、call/apply/bind、new、instanceof、Promise 系列、并发控制、发布订阅、数组扁平化、柯里化等笔试必考题逐行解析。'
tags: [前端面试, 手写代码, 防抖节流, 深拷贝, Promise]
category: 前端面试宝典
draft: false
---

> [!NOTE]
> 本文包含 18 道手写代码必考题，每题给出**可运行代码 + 关键追问**。手写题是笔试/面试白板环节的硬通货，务必动手敲熟。难度标注：⭐ 基础 · ⭐⭐ 进阶 · ⭐⭐⭐ 高级 · 🔥 高频必考

---

## 函数类

### T1: 手写防抖（debounce）⭐ 🔥

```javascript
// 基础版
function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);                        // 每次触发都重置计时
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 进阶版：立即执行 + 可取消（面试加分项）
function debounce(fn, delay = 300, immediate = false) {
  let timer = null;
  function debounced(...args) {
    if (timer) clearTimeout(timer);
    if (immediate && !timer) {
      fn.apply(this, args);                     // 首次立即执行
      timer = setTimeout(() => { timer = null; }, delay);
    } else {
      timer = setTimeout(() => fn.apply(this, args), delay);
    }
  }
  debounced.cancel = () => {                    // 组件卸载时可取消
    clearTimeout(timer);
    timer = null;
  };
  return debounced;
}
```

**追问：** 为什么要 `fn.apply(this, args)`？—— 防抖返回的包装函数可能作为事件回调/DOM 方法调用，需要透传 this 和参数。

### T2: 手写节流（throttle）⭐ 🔥

```javascript
// 时间戳版（首次立即执行）
function throttle(fn, interval = 200) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, args);
    }
  };
}

// 定时器版（停止触发后还会执行最后一次）
function throttle2(fn, interval = 200) {
  let timer = null;
  return function (...args) {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, interval);
  };
}
```

**追问：** 时间戳版和定时器版的区别？—— 时间戳版首次立即执行、停止触发后不再执行；定时器版首次延迟执行、停止后会补最后一次。

### T3: 手写 call / apply / bind ⭐⭐ 🔥

```javascript
// call：把函数挂到目标对象上调用，this 即目标对象
Function.prototype.myCall = function (ctx, ...args) {
  if (typeof this !== 'function') throw new TypeError('not a function');
  ctx = ctx == null ? globalThis : Object(ctx);
  const key = Symbol('fn');           // 避免覆盖已有属性
  ctx[key] = this;
  const result = ctx[key](...args);
  delete ctx[key];
  return result;
};

// apply：同 call，参数是数组
Function.prototype.myApply = function (ctx, args = []) {
  ctx = ctx == null ? globalThis : Object(ctx);
  const key = Symbol('fn');
  ctx[key] = this;
  const result = ctx[key](...args);
  delete ctx[key];
  return result;
};

// bind：返回新函数，this 永久绑定；支持柯里化传参、new 调用
Function.prototype.myBind = function (ctx, ...preArgs) {
  const fn = this;
  function bound(...args) {
    // new bound() 时 this 是新实例，忽略 ctx
    return fn.apply(this instanceof bound ? this : ctx, [...preArgs, ...args]);
  }
  // 维护原型链：new bound() 的实例能访问原函数原型上的属性
  if (fn.prototype) {
    bound.prototype = Object.create(fn.prototype);
  }
  return bound;
};
```

**追问：** 原生 bind 返回的函数为什么没有 prototype？—— 规范规定 bound function 的 prototype 为 undefined，但通过原型链连接了原函数 prototype。

### T4: 手写 new 操作符 ⭐⭐ 🔥

```javascript
function myNew(Constructor, ...args) {
  // 1. 创建空对象，原型指向构造函数的 prototype
  const obj = Object.create(Constructor.prototype);
  // 2. 执行构造函数，绑定 this
  const result = Constructor.apply(obj, args);
  // 3. 构造函数返回对象则用它，否则返回新对象
  return result instanceof Object ? result : obj;
}

// 验证
function Person(name) { this.name = name; }
Person.prototype.say = function () { console.log(this.name); };
const p = myNew(Person, 'Tom');
p.say();  // Tom
```

**追问：** 构造函数 return 一个对象会怎样？—— new 的结果是这个对象；return 基本类型会被忽略。

### T5: 手写 instanceof ⭐

```javascript
function myInstanceof(obj, Constructor) {
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return false;                          // 基本类型直接 false
  }
  let proto = Object.getPrototypeOf(obj);
  const prototype = Constructor.prototype;
  while (proto !== null) {
    if (proto === prototype) return true;
    proto = Object.getPrototypeOf(proto);  // 沿原型链向上
  }
  return false;
}

myInstanceof([], Array);    // true
myInstanceof([], Object);   // true
myInstanceof('str', String); // false（基本类型）
```

### T6: 手写柯里化（curry）⭐⭐⭐

```javascript
// 参数够了就执行，不够就继续收集
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {        // fn.length = 形参个数
      return fn.apply(this, args);
    }
    return (...args2) => curried.apply(this, [...args, ...args2]);
  };
}

function add(a, b, c) { return a + b + c; }
const curriedAdd = curry(add);
curriedAdd(1)(2)(3);     // 6
curriedAdd(1, 2)(3);     // 6
curriedAdd(1)(2, 3);     // 6

// 变体题：无限参数累加 add(1)(2)(3)() === 6 / add(1,2)(3) === 6
function addChain(...args) {
  const nums = [...args];
  const fn = (...more) => {
    if (more.length === 0) return nums.reduce((a, b) => a + b, 0);
    nums.push(...more);
    return fn;
  };
  return fn;
}
```

---

## 对象与数组类

### T7: 手写深拷贝 ⭐⭐ 🔥

```javascript
function deepClone(target, map = new WeakMap()) {
  // 基本类型和函数直接返回
  if (target === null || typeof target !== 'object') return target;
  // 特殊内置对象
  if (target instanceof Date) return new Date(target);
  if (target instanceof RegExp) return new RegExp(target.source, target.flags);
  // 循环引用：拷贝过的直接返回缓存
  if (map.has(target)) return map.get(target);

  const result = Array.isArray(target) ? [] : {};
  map.set(target, result);                 // 先缓存再递归，解决循环引用

  for (const key of Reflect.ownKeys(target)) {   // 包含 Symbol 键
    result[key] = deepClone(target[key], map);
  }
  return result;
}

// 验证循环引用
const obj = { name: 'a' };
obj.self = obj;
const copy = deepClone(obj);
console.log(copy.self === copy);  // true，且不栈溢出
```

**追问：** 为什么用 WeakMap 而不是 Map？—— 弱引用，拷贝完成后键（原对象）可被 GC 回收，避免内存泄漏。

### T8: 数组扁平化（flat）⭐ 🔥

```javascript
// 1. 递归 + reduce
function flat(arr, depth = Infinity) {
  return arr.reduce((acc, cur) => {
    if (Array.isArray(cur) && depth > 0) {
      acc.push(...flat(cur, depth - 1));
    } else {
      acc.push(cur);
    }
    return acc;
  }, []);
}

// 2. 完全扁平化简洁版
const flatAll = arr => arr.reduce(
  (acc, cur) => acc.concat(Array.isArray(cur) ? flatAll(cur) : cur), []
);

// 3. 迭代版（不用递归，避免栈溢出）
function flatIterative(arr) {
  const stack = [...arr];
  const result = [];
  while (stack.length) {
    const item = stack.pop();
    Array.isArray(item) ? stack.push(...item) : result.unshift(item);
  }
  return result;
}

// 4. 一行版（了解即可）
const flatOneLine = arr => arr.flat(Infinity);
const flatToString = arr => arr.toString().split(',').map(Number); // 仅纯数字数组

flatAll([1, [2, [3, [4]]]]);  // [1, 2, 3, 4]
```

### T9: 手写数组去重 ⭐

```javascript
// 1. Set（最简洁，NaN 也能去重）
const unique1 = arr => [...new Set(arr)];

// 2. filter + indexOf
const unique2 = arr => arr.filter((item, i) => arr.indexOf(item) === i);

// 3. 对象数组按 key 去重（实战常见）
function uniqueBy(arr, key) {
  const seen = new Map();
  return arr.filter(item => !seen.has(item[key]) && seen.set(item[key], true));
}
uniqueBy([{ id: 1 }, { id: 2 }, { id: 1 }], 'id');  // [{id:1},{id:2}]
```

### T10: 手写 Object.assign 的浅拷贝语义 / 对象合并 ⭐⭐

```javascript
// 浅拷贝的常见实现（对比记忆）
const shallowClone = obj => ({ ...obj });
const shallowClone2 = obj => Object.assign({}, obj);

// 深合并（deepMerge，配置合并场景）
function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const t = target[key], s = source[key];
    const bothObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
    result[key] = bothObj(t) && bothObj(s) ? deepMerge(t, s) : s;
  }
  return result;
}
deepMerge({ a: 1, b: { x: 1 } }, { b: { y: 2 } });
// { a: 1, b: { x: 1, y: 2 } }
```

---

## Promise 与异步类

### T11: 手写 Promise.all ⭐⭐ 🔥

```javascript
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let count = 0;
    const list = Array.from(promises);     // 支持可迭代对象
    if (list.length === 0) return resolve([]);

    list.forEach((p, i) => {
      // Promise.resolve 包装：兼容非 Promise 值
      Promise.resolve(p).then(
        value => {
          results[i] = value;              // 按索引存，保证顺序
          if (++count === list.length) resolve(results);  // 全部完成才 resolve
        },
        reject                             // 任意一个失败立即 reject
      );
    });
  });
}

// 验证
promiseAll([Promise.resolve(1), 2, Promise.resolve(3)])
  .then(console.log);  // [1, 2, 3]
promiseAll([Promise.resolve(1), Promise.reject('err')])
  .catch(console.log);  // 'err'
```

**追问：** 为什么用 `results[i]` 而不是 `results.push`？—— then 回调执行顺序不定，push 会乱序；按索引赋值保证与输入顺序一致。

### T12: 手写 Promise.race / allSettled / any ⭐⭐

```javascript
// race：第一个完成（无论成败）决定结果
function promiseRace(promises) {
  return new Promise((resolve, reject) => {
    for (const p of promises) {
      Promise.resolve(p).then(resolve, reject);  // 谁先谁赢
    }
  });
}

// allSettled：全部结束，返回每项状态
function promiseAllSettled(promises) {
  return promiseAll(
    Array.from(promises).map(p =>
      Promise.resolve(p)
        .then(value => ({ status: 'fulfilled', value }))
        .catch(reason => ({ status: 'rejected', reason }))
    )
  );
}

// any：第一个成功决定结果；全失败才失败（AggregateError）
function promiseAny(promises) {
  return new Promise((resolve, reject) => {
    const errors = [];
    let count = 0;
    const list = Array.from(promises);
    list.forEach((p, i) => {
      Promise.resolve(p).then(resolve, err => {
        errors[i] = err;
        if (++count === list.length) {
          reject(new AggregateError(errors, 'All promises were rejected'));
        }
      });
    });
  });
}
```

### T13: 手写 Promise（A+ 简化版）⭐⭐⭐

```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.callbacks = [];                    // pending 期间收集的回调

    const resolve = value => this.#settle('fulfilled', value);
    const reject = reason => this.#settle('rejected', reason);
    try { executor(resolve, reject); } catch (e) { reject(e); }
  }

  #settle(state, value) {
    if (this.state !== 'pending') return;   // 状态不可逆
    this.state = state;
    this.value = value;
    this.callbacks.forEach(cb => cb());     // 异步触发已收集回调
  }

  then(onFulfilled, onRejected) {
    // 穿透处理：then() 不传参时值要能传递下去
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e; };

    const promise2 = new MyPromise((resolve, reject) => {
      const handle = () => {
        // 用宏任务模拟微任务，保证异步调用
        setTimeout(() => {
          try {
            if (this.state === 'fulfilled') {
              const x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } else {
              const x = onRejected(this.value);
              resolvePromise(promise2, x, resolve, reject);
            }
          } catch (e) { reject(e); }
        }, 0);
      };
      this.state === 'pending' ? this.callbacks.push(handle) : handle();
    });
    return promise2;                        // 返回新 Promise 支持链式调用
  }

  catch(onRejected) { return this.then(null, onRejected); }
}

// A+ 核心：解析 then 回调的返回值
function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected'));
  }
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let called = false;
    try {
      const then = x.then;
      if (typeof then === 'function') {
        then.call(x,
          y => { if (!called) { called = true; resolvePromise(promise2, y, resolve, reject); } },
          r => { if (!called) { called = true; reject(r); } }
        );
      } else { resolve(x); }
    } catch (e) {
      if (!called) { called = true; reject(e); }
    }
  } else { resolve(x); }                    // 普通值直接 resolve
}
```

**追问：** 为什么需要 resolvePromise 递归解析？—— then 回调可能返回另一个 Promise，必须等它 settle 后再决定 promise2 的状态。

### T14: 手写 async/await 的生成器实现（run 函数）⭐⭐⭐

```javascript
// async 语法糖 = 生成器 + 自动执行器
function run(generatorFn) {
  return new Promise((resolve, reject) => {
    const gen = generatorFn();
    function step(nextFn) {
      let result;
      try {
        result = nextFn();
      } catch (e) {
        return reject(e);                   // 生成器内抛错 → reject
      }
      if (result.done) return resolve(result.value);
      // yield 的值包装成 Promise，then 里递归驱动下一步
      Promise.resolve(result.value).then(
        v => step(() => gen.next(v)),       // 成功值送回生成器
        e => step(() => gen.throw(e))       // 错误抛回生成器（可被 try/catch 捕获）
      );
    }
    step(() => gen.next());
  });
}

// 使用（等价于 async/await）
const fetchUser = run(function* () {
  const res = yield fetch('/api/user');
  const data = yield res.json();
  return data;
});
```

### T15: 手写并发控制器（限制并发数）⭐⭐⭐ 🔥

```javascript
// 经典题：最多同时执行 limit 个异步任务
function asyncPool(limit, tasks) {
  return new Promise((resolve, reject) => {
    const results = [];
    const executing = new Set();            // 正在执行的 Promise 集合
    let index = 0;

    async function runNext() {
      if (index >= tasks.length) {
        // 全部派发完，等待剩余任务结束
        await Promise.all(executing);
        return resolve(results);
      }
      const i = index++;
      const task = Promise.resolve()
        .then(() => tasks[i]())             // tasks[i] 是返回 Promise 的函数
        .then(
          v => { results[i] = v; },
          e => { results[i] = e; }          // 单个失败不中断（可改为 reject）
        );
      executing.add(task);
      task.then(() => executing.delete(task));

      if (executing.size >= limit) {
        await Promise.race(executing);      // 满了就等最快的一个腾出位置
      }
      runNext();                            // 递归派发下一个
    }
    runNext();
  });
}

// 使用
const tasks = urls.map(url => () => fetch(url).then(r => r.json()));
const results = await asyncPool(3, tasks);  // 最多 3 个并发

// 追问：为什么用 Promise.race 而不是 Promise.all？
// race 等"最快的一个"完成就继续派发，保持并发池满载；
// all 要等全部完成，并发度会塌缩。
```

### T16: 手写 sleep / 超时控制 / 请求重试 ⭐⭐

```javascript
// sleep
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// 超时控制（Promise.race 实战）
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    sleep(ms).then(() => Promise.reject(new Error('timeout'))),
  ]);
}
withTimeout(fetch('/api/slow'), 3000);

// 请求重试（指数退避）
async function retry(fn, times = 3, delay = 1000) {
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === times - 1) throw e;         // 最后一次仍失败 → 抛出
      await sleep(delay * Math.pow(2, i));  // 1s → 2s → 4s
    }
  }
}
retry(() => fetch('/api/unstable').then(r => {
  if (!r.ok) throw new Error(r.status);
  return r.json();
}), 3);
```

---

## 设计模式类

### T17: 手写发布订阅（EventEmitter）⭐⭐ 🔥

```javascript
class EventEmitter {
  constructor() {
    this.events = new Map();                // eventName → Set<callback>
  }

  on(name, fn) {
    if (!this.events.has(name)) this.events.set(name, new Set());
    this.events.get(name).add(fn);
    return this;                            // 支持链式调用
  }

  off(name, fn) {
    const set = this.events.get(name);
    if (set) {
      set.delete(fn);
      if (set.size === 0) this.events.delete(name);
    }
    return this;
  }

  once(name, fn) {
    const wrapper = (...args) => {
      fn.apply(this, args);
      this.off(name, wrapper);              // 执行后自动移除
    };
    this.on(name, wrapper);
    return this;
  }

  emit(name, ...args) {
    this.events.get(name)?.forEach(fn => fn.apply(this, args));
    return this;
  }
}

// 使用
const bus = new EventEmitter();
const handler = data => console.log('got:', data);
bus.on('msg', handler);
bus.once('login', u => console.log('welcome', u));
bus.emit('msg', 'hello');   // got: hello
bus.emit('login', 'Tom');   // welcome Tom
bus.emit('login', 'Tom');   // 无输出（once 已移除）
bus.off('msg', handler);
```

**追问：** Vue2 的 `$on/$emit`、Node 的 `EventEmitter`、跨组件通信总线都是这个模式。

### T18: 手写懒加载 / IntersectionObserver 封装 ⭐⭐

```javascript
// 图片懒加载封装（实战常用）
class LazyLoad {
  constructor(selector = 'img[data-src]', options = {}) {
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        img.src = img.dataset.src;
        img.onload = img.onerror = () => this.observer.unobserve(img);
      });
    }, {
      rootMargin: options.rootMargin || '200px',  // 提前 200px 加载
      threshold: 0,
    });
    document.querySelectorAll(selector).forEach(el => this.observer.observe(el));
  }

  destroy() { this.observer.disconnect(); }
}

new LazyLoad();  // 自动接管页面所有 img[data-src]

// 追问：为什么不用 scroll 事件 + getBoundingClientRect？
// scroll 高频触发性能差，getBoundingClientRect 强制同步布局；
// IntersectionObserver 由浏览器异步计算，不阻塞主线程。
```

---

## 复习卡片

> [!TIP]
> **手写题优先级清单**（按出现频率排序）
>
> | 优先级 | 题目 | 关键考点 |
> |:--|:--|:--|
> | P0 必会 | 防抖/节流 | this 透传、cancel、时间戳 vs 定时器 |
> | P0 必会 | 深拷贝 | WeakMap 循环引用、Date/RegExp/Symbol 键 |
> | P0 必会 | Promise.all | 索引保序、计数、单个失败即 reject |
> | P0 必会 | call/apply/bind | Symbol 挂载、原型链维护、new 兼容 |
> | P0 必会 | 并发控制 | Promise.race 腾位、结果保序 |
> | P1 高频 | new/instanceof | 原型链遍历、返回对象优先级 |
> | P1 高频 | 发布订阅 | once 包装、Set 存储、链式返回 |
> | P1 高频 | 数组扁平化 | 递归/迭代/toString 三种写法 |
> | P2 加分 | Promise 手写 | A+ 状态机、resolvePromise、穿透 |
> | P2 加分 | 柯里化 | fn.length、递归收集参数 |
> | P2 加分 | 重试/超时 | 指数退避、Promise.race |
>
> **练习建议**：每题至少独立手写 3 遍（看题解 → 默写 → 隔天再写），面试白板环境没有代码提示，肌肉记忆很重要。

---

> [!TIP]
> 下一篇：[前端工程化实践面试题](/blog/posts/interview-guide-15-engineering-practice/) 涵盖 Monorepo、微前端（qiankun/Module Federation）、组件库设计、npm 发包、CI/CD、灰度发布等中高级必考的工程化落地实践。
>
> 返回 [面试宝典总览](/blog/posts/interview-guide-00-overview/) | [面试宝典合集页](/blog/interview-guide/)
