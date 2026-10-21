---
title: '10 · 模块化'
published: 2026-09-29T20:00:00+08:00
description: 'JS 模块化的演进：IIFE、CommonJS（Node）、ES Module（浏览器/现代标准），循环依赖在两种规范下的不同表现，以及 ESM 的静态特性带来的 tree-shaking 优势。'
tags: [JavaScript, 模块化, CommonJS, ESM, 循环依赖]
category: JavaScript学习路线
draft: false
---

## 没有模块的日子

早期用全局变量 + IIFE 避免污染，但依赖关系全靠人工排序 `<script>` 标签，大型项目一团乱。于是有了两套主流方案。

---

## CommonJS（Node 默认）

```js
// math.js
exports.add = (a, b) => a + b;
// main.js
const { add } = require("./math");
```

特点：**同步加载、运行时解析**，`require` 返回的是值的拷贝（对基本类型）/ 引用（对对象）。它适合服务端，但浏览器需打包器转换。

---

## ES Module（现代标准）

```js
// math.js
export const add = (a, b) => a + b;
export default function() {};
// main.js
import foo, { add } from "./math.js";
```

特点：**静态结构**（`import`/`export` 在顶层、编译期可知），支持浏览器原生、可被打包器 **tree-shaking** 剔除未用代码。注意 ESM 里 `import` 是**活绑定**（引用），改了源会反映到导入方。

---

## 循环依赖的坑

```js
// a.js
import { b } from "./b.js";
export const a = b + 1;
// b.js
import { a } from "./a.js";
export const b = a + 1;
```

- **CommonJS**：返回**部分加载**的对象（可能拿到 `undefined`），顺序敏感，易踩。
- **ESM**：因是活绑定，最终能解析出正确值（但逻辑上仍是坏设计）。

> 结论：循环依赖是代码异味，重构拆公共模块比纠结规范更治本。

---

## 小结

- CommonJS：Node 传统，运行时、值拷贝、循环依赖易出 bug。
- ESM：标准、静态、活绑定、支持 tree-shaking。
- 新项目一律 ESM；写库时注意两种规范的 `import/require` 互操作。
- 循环依赖靠重构解决，不是靠规范。

---

## 练习

1. 把一段 CommonJS 代码改写成 ESM，注意加文件扩展名（NodeNext 要求）。
2. 构造一个 CommonJS 循环依赖，观察取到 `undefined` 的现象。
3. 解释为什么 ESM 能做 tree-shaking 而 CommonJS 很难。
