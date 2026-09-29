---
title: '02 · 数据类型与隐式转换'
published: 2026-09-29T12:00:00+08:00
description: 'JS 的原始类型与引用类型区别、== 与 === 的隐式转换陷阱、typeof/instanceof 的边界，以及"为什么我总用 ==="。'
tags: [JavaScript, 数据类型, 隐式转换, 相等性, typeof]
category: JavaScript学习路线
draft: false
---

## 一次线上事故的源头

```js
if (user.permission == "admin") { ... }
```

某天 `user.permission` 是数字 `0`，`0 == "admin"` 竟然是 `false`——但另一个分支 `1 == "1"` 又是 `true`。隐式转换让相等性判断变得不可预测。**结论先给：`==` 允许类型转换，`===` 不转换、更可控。无特殊理由一律 `===`。**

---

## 原始类型 vs 引用类型

- 原始类型：`string / number / boolean / null / undefined / symbol / bigint`，**按值存储**，比较的是"值"。
- 引用类型：`object`（含数组、函数、日期等），**按引用存储**，变量存的是内存地址。

```js
const a = { x: 1 };
const b = a;
b.x = 2;
console.log(a.x); // 2（a、b 指向同一对象）
```

这也是为什么比较两个对象要用深比较或 `JSON.stringify`，而非 `==`/`===`（后者比的是引用）。

---

## == 的隐式转换规则（记住几条就够）

`==` 在类型不同时会尝试转换，规则复杂且反直觉：

```js
[] == false      // true（[] 转成 ''，再转成 0）
[] == ![]       // true（![] 是 false，[] 转 0，false 转 0）
'0' == false    // true
null == undefined // true（唯一一对 == 相等但不 === 的情况）
NaN == NaN      // false（NaN 不等于任何值，用 Number.isNaN 判）
```

> 看到这些就明白：`===` 才是"我真的想比较"。

---

## 类型判断

| 需求 | 写法 | 注意 |
| --- | --- | --- |
| 原始类型 | `typeof x` | `typeof null` 返回 `"object"`（历史 bug） |
| 引用类型 | `x instanceof Ctor` | 跨 iframe/多全局环境会失效 |
| 数组 | `Array.isArray(x)` | 最可靠 |
| 安全判断 | `Object.prototype.toString.call(x)` | 返回 `[object Array]` 等 |

---

## 小结

- 引用类型比的是引用，不是内容。
- `==` 会隐式转换，易出 bug；默认 `===`。
- `typeof null` 是 `"object"`，判空用 `x === null`。
- 数组用 `Array.isArray`，跨环境类型判断用 `toString.call`。

---

## 练习

1. 预测并验证：`[] == 0`、`' ' == 0`、`null === undefined` 的结果。
2. 写函数 `isPlainObject(x)`，用 `toString.call` 判断是否为普通对象 `{}`。
3. 解释为什么 `NaN !== NaN`，以及如何正确判断一个值是不是 `NaN`。
