---
title: '05 · 闭包'
published: 2026-09-29T15:00:00+08:00
description: '闭包是函数与其词法作用域的组合。讲清闭包的形成、为什么能"记住"外部变量、经典面试题（循环+var）、以及在模块封装与防抖节流中的真实应用。'
tags: [JavaScript, 闭包, 词法作用域, 模块封装, 防抖]
category: JavaScript学习路线
draft: false
---

## 当年最懵的概念

面试被问"什么是闭包"，我背了定义却答不出"它解决什么问题"。后来才懂：**闭包让函数能访问定义时所在的作用域，即使那个作用域已执行完**。

---

## 形成条件

```js
function outer() {
  const count = 0;
  return function inner() {
    count++;
    return count;
  };
}
const fn = outer();
fn(); // 1
fn(); // 2
```

`inner` 被返回后，`outer` 的作用域本该销毁，但因为 `inner` 还在引用 `count`，**这块作用域被保留**——这就是闭包。`count` 活在闭包里，成为"私有变量"。

---

## 经典坑：循环 + var

回顾 01 篇的例子，用闭包修复：

```js
for (var i = 0; i < 3; i++) {
  ((j) => setTimeout(() => console.log(j), 0))(i); // 0 1 2
}
// 或现代写法：直接用 let（块级作用域天然隔离）
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 0);
```

`let` 的方案本质也是每轮迭代形成独立作用域（类闭包），所以最推荐。

---

## 真实应用

- **模块封装**：IIFE / 模块返回的对象方法构成闭包，隐藏私有状态（早期的"模块模式"）。
- **防抖/节流**：闭包保存定时器 ID 和上一次时间。
- **函数工厂**：根据参数"定制"返回的函数。

```js
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
```

---

## 小结

- 闭包 = 函数 + 其词法作用域；能"记住"外部变量。
- 它是模块私有化、高阶函数的基础。
- 循环问题用 `let` 或 IIFE 解决。
- 闭包持有变量会**延长生命周期**，注意避免不必要的内存占用。

---

## 练习

1. 用闭包实现一个 `createCounter()`，每次调用返回自增后的值。
2. 写一个 `once(fn)`，让函数只执行一次（闭包保存标志位）。
3. 解释为什么下面返回 5 个 5，如何用 `let` 改成 0-4：`for (var i=0;i<5;i++){ setTimeout(()=>console.log(i),0); }`。
