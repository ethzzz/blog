---
title: '01 · 变量、作用域与提升'
published: 2026-09-29T11:00:00+08:00
description: '搞懂 var/let/const 的作用域差异、变量提升与 TDZ（暂时性死区）、作用域链如何逐级查找，以及块级作用域为什么是现代 JS 的默认选择。'
tags: [JavaScript, 作用域, 变量提升, TDZ, let]
category: JavaScript学习路线
draft: false
---

## 一个让我加班的 bug

早年写循环绑定事件，用的是 `var`：

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 输出：3 3 3（不是 0 1 2）
```

因为 `var` 是**函数作用域**，`i` 在整个函数里只有一个，循环结束时已是 3。改成 `let` 立刻正常——因为 `let` 是**块级作用域**，每次迭代都有独立的 `i`。这就是作用域差异最直观的代价。

---

## 三种声明的作用域

| 声明 | 作用域 | 提升 | 重复声明 | 暂死区 |
| --- | --- | --- | --- | --- |
| `var` | 函数作用域 | 提升并初始化为 `undefined` | 允许 | 无 |
| `let` | 块级作用域 | 提升但不初始化 | 不允许 | 有（TDZ） |
| `const` | 块级作用域 | 同上 | 不允许 | 有（且不可改绑定） |

---

## 变量提升与 TDZ

`var` 会被"提升"到函数顶部并初始化为 `undefined`：

```js
console.log(a); // undefined（不报错）
var a = 1;
```

`let/const` 也提升，但**在声明前访问会抛 `ReferenceError`**，这段区域叫**暂时性死区（TDZ）**：

```js
console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 2;
```

> 经验：永远在作用域顶部声明、使用前声明，TDZ 就不会咬人。

---

## 作用域链

JavaScript 通过**词法作用域**（代码写在哪里决定）形成作用域链。查找变量时，从当前作用域向外层逐级找，直到全局：

```js
const x = 1;
function outer() {
  const y = 2;
  function inner() {
    console.log(x, y); // 1 2（沿作用域链向上找到）
  }
  inner();
}
```

> 关键：**作用域在定义时确定，不在调用时**。这是闭包能"记住"外部变量的根因（下篇细讲）。

---

## 小结

- 默认用 `const`，需要重新赋值时用 `let`，**别用 `var`**。
- 块级作用域（if/for 的 `{}`）让变量范围更小、更安全。
- TDZ 是 `let/const` 的安全机制，触发说明你用了"还没初始化的变量"。
- 作用域链沿词法作用域向上查找，且"定义时定死"。

---

## 练习

1. 用 `let` 改写上面的 `for` 循环，解释为什么现在输出 `0 1 2`。
2. 写一个函数，内部用 `var` 声明后在声明前 `console.log`，观察输出；换成 `let` 再看。
3. 解释：为什么在 `if (true) { let z = 1 }` 之后访问 `z` 会报错？
