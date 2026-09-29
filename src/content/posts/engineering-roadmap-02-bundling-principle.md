---
title: '02 · 模块化与打包原理'
published: 2026-09-30T20:00:00+08:00
description: '打包器到底在做什么：从入口出发构建依赖图、转译、合并、拆分 chunk。理解 ESM/CJS 互操作、Tree-shaking 的前置条件、以及 source map 如何把压缩代码映射回源码。'
tags: [前端工程化, 打包, 依赖图, tree-shaking, sourcemap]
category: 前端工程化学习路线
draft: false
---

## 浏览器不认识你的工程

你写的是 `import`/`export`、TS、JSX，浏览器只认"一个或少数几个 JS 文件"。**打包器（bundler）就是把分散的模块，变成浏览器能直接跑的产物**。

---

## 打包四步

1. **构建依赖图**：从入口文件出发，递归解析所有 `import`，形成"谁依赖谁"的图。
2. **转译**：用 Babel/esbuild 把 TS/JSX/新语法转成目标 JS。
3. **合并**：把模块拼接成 bundle（处理作用域、导出绑定）。
4. **拆分与优化**：按路由/动态 `import` 拆成多个 chunk，做压缩、tree-shaking。

---

## Tree-shaking 的前提

"摇掉"没被用到的导出，靠的是 **ESM 的静态结构**（编译期可知导入导出）：

```js
// math.js
export const add = () => {};
export const unused = () => {}; // 没被 import → 被摇掉
```

前提：用 ESM（`import/export`），且打包器开启 `mode: production`。**CommonJS 因运行时才知依赖，无法静态分析，摇不掉**。

---

## ESM 与 CJS 互操作

打包器要处理两种模块规范的混用：把 CJS 的 `module.exports` 包成 ESM 可消费的接口。这也是为什么"只 import CJS 的具名导出有时会失败"——CJS 本质是单个 `exports` 对象。

---

## Source Map

压缩后的代码只剩 `a,b,c`，报错堆栈看不懂。**source map** 记录"压缩代码位置 ↔ 源码位置"的映射，让 DevTools 能把错误指回你写的 `.ts` 行。生产环境也建议保留（或单独上传到错误监控），否则线上报错无法定位。

---

## 小结

- 打包器 = 依赖图 + 转译 + 合并 + 拆分。
- Tree-shaking 依赖 ESM 静态结构，CJS 摇不掉。
- source map 是定位压缩后代码错误的生命线。

---

## 练习

1. 用 `npx esbuild` 打包一个含未使用导出的 ESM 文件（production 模式），对比打包前后体积，验证 tree-shaking。
2. 故意制造一个线上报错，用 source map 在 DevTools 里定位回源码行。
3. 解释为什么 `import { a } from "cjs-lib"` 可能拿不到具名导出。
