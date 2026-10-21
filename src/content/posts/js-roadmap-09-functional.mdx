---
title: '09 · 函数式与高阶函数'
published: 2026-09-29T19:00:00+08:00
description: '函数式编程在 JS 中的落地：一等公民函数、纯函数、高阶函数、map/filter/reduce 的链式用法、柯里化与函数组合，以及为什么函数式让代码更易测试。'
tags: [JavaScript, 函数式, 高阶函数, 纯函数, 柯里化]
category: JavaScript学习路线
draft: false
---

## 函数是一等公民

JS 里函数可以像值一样：赋值、传参、返回。基于这个特性衍生出**高阶函数**（接收或返回函数的函数）和**纯函数**（相同输入永远相同输出、无副作用）。

---

## 数组三件套

```js
const nums = [1, 2, 3, 4, 5];
const result = nums
  .filter(n => n % 2 === 1)   // [1,3,5]
  .map(n => n * n)            // [1,9,25]
  .reduce((sum, n) => sum + n, 0); // 35
```

`map/filter/reduce` 不修改原数组（纯），链式表达数据流转，比 `for` 循环更声明式、更易读。

---

## 柯里化

把多参函数转成"每次吃一个参数"的链式函数：

```js
const add = a => b => a + b;
add(2)(3); // 5
// 实战：预置配置
const log = prefix => msg => console.log(`[${prefix}] ${msg}`);
const logError = log("ERROR");
logError("fail"); // [ERROR] fail
```

---

## 函数组合

把小函数拼成处理管道：

```js
const compose = (...fns) => x => fns.reduceRight((v, fn) => fn(v), x);
const trim = s => s.trim();
const upper = s => s.toUpperCase();
const process = compose(upper, trim);
process("  hi  "); // "HI"
```

---

## 为什么函数式好

- **纯函数可测**：不依赖外部状态，给定输入断言输出即可。
- **无副作用**：并发、缓存、推理都更安全。
- **声明式**：关注"做什么"而非"怎么做"。

> 现实里不必极端函数式，但多用 `map/filter/reduce`、少改原数据，代码质量立竿见影。

---

## 小结

- 函数是一等公民 → 高阶函数是基础。
- `map/filter/reduce` 链式处理数组，声明式且纯。
- 柯里化做参数预置，组合做管道。
- 纯函数提升可测试性与可维护性。

---

## 练习

1. 用 `reduce` 实现 `map` 和 `filter`（即 `myMap`/`myFilter`）。
2. 写一个 `curry(fn)` 把普通多参函数转成柯里化版本。
3. 把一段"先过滤空值、再转数字、再求和"的命令式代码改成 `reduce` 链式。
