---
title: 'W1 · strict TypeScript 后端深用'
published: 2026-10-13T14:10:00+08:00
description: '把前端 TS 能力推进到后端强度：strict 全开、泛型与条件类型、装饰器、ESM/CJS 差异、Node 项目分层结构。落到 NoteLab 的真实脚本上。'
tags: [TypeScript, Node.js, 全栈, 12周计划]
category: 全栈进阶12周
draft: false
---

> [!NOTE]
> 你前端 TS 已很强，但后端对类型的要求更狠：运行期几个月不重启，一个 `any` 漏过的字段可能在凌晨炸进程。本周目标是把 TS 从"前端写法"升级到"服务端写法"。

---

## 本周目标

- `tsconfig` 的 `strict` 全开（`strictNullChecks` / `noImplicitAny` / `noUncheckedIndexedAccess`）。
- 掌握泛型约束、条件类型、类型守卫（`is` 谓词）。
- 弄清 ESM vs CJS、装饰器的启用开关。
- 建立 Node 项目的分层目录（dto / service / repository）。

## 核心概念速记（详文 →）

- 工程化 tsconfig：[/blog/posts/typescript-roadmap-13-engineering-tsconfig/](/blog/posts/typescript-roadmap-13-engineering-tsconfig/)
- 类型体操：[/blog/posts/typescript-roadmap-09-type-gymnastics/](/blog/posts/typescript-roadmap-09-type-gymnastics/)
- 装饰器：[/blog/posts/typescript-roadmap-10-decorators/](/blog/posts/typescript-roadmap-10-decorators/)

**记忆锚点**：

- `unknown` 是"我还不知道是什么"，`any` 是"我放弃检查"——后端里前者永远优先。
- 类型守卫 `function isUser(x: unknown): x is User` 是把运行时校验结果"喂回"类型系统的桥。
- ESM/CJS 混用是 Node 依赖地狱头号来源；新项目一律 ESM（`"type": "module"`）。

## 落到我项目的动作

- 把 notelab-c 里散落的 Node 脚本（如 Spire/loot 配置读取）整理成一个 `strict: true` 的 typed module。
- 给这些脚本补类型守卫，替换掉里面的 `any` 和 `as`。

## 本周交付物（可见）

- 一个 `strict: true` 的 Node/TS 库 + 一段类型守卫代码，提交到对应仓库。

## 面试一句话

"为什么后端要 `strict` 全开？因为运行期错误成本极高，类型系统是把 bug 左移到编译期的最便宜手段。"

## 易错点 / 记忆锚点

- `noUncheckedIndexedAccess` 会让数组/对象取值变成 `T | undefined`，初期很烦但能逼你处理边界——值得开。
- 装饰器需 `experimentalDecorators` + `emitDecoratorMetadata`（Nest 脚手架已配），别手改关掉。

## 练习

1. 在一个旧 Node 脚本里打开 `strict`，数一数冒出来多少错误，逐个修掉并 commit。
2. 写一个 `parseConfig(raw: unknown): Config` 函数，内部用类型守卫代替 `as`。
3. 说清 `type` 和 `interface` 在你这个场景下的取舍（提示：声明合并、扩展性）。
