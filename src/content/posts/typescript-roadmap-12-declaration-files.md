---
title: '12 · 声明文件与类型生态'
published: 2026-09-27T22:00:00+08:00
description: 'TypeScript 声明文件详解：.d.ts 是什么、declare 关键字、第三方库类型 @types 与 DefinitelyTyped、全局声明 declare global、为无类型的 JS 库补声明、编写可发布的类型包。'
tags: [TypeScript, 声明文件, d.ts, declare, "@types", DefinitelyTyped]
category: TypeScript学习路线
draft: false
---

> [!NOTE]
> 很多 JS 库没有类型，TS 怎么认得它们？答案是**声明文件 `.d.ts`**——只描述形状、不含实现的"类型说明书"。本篇讲清它的全部玩法。

---

## 1. 什么是 .d.ts

`.d.ts` 是**只有类型、没有值**的文件，编译后不产生 JS。它告诉 TS："某个东西长这样，你按这个检查就行"。打开 `node_modules/@types/node` 能看到一大堆 `.d.ts`，那是 Node 的"说明书"。

---

## 2. declare 关键字

在 `.d.ts` 里用 `declare` 声明外部存在的值/类型：

```ts
// globals.d.ts
declare const API_URL: string;
declare function greet(name: string): void;
declare module "legacy-lib" {
  export function doThing(): void;
}
```

`declare` 的意思是"这个东西在别处定义了，我只声明它的类型"。在普通 `.ts` 里也能用 `declare` 避免重复实现（如只为已有全局变量补类型）。

---

## 3. 第三方库类型 @types

绝大多数流行库的类型在 `@types/xxx` 里：

```bash
npm install -D @types/lodash @types/node
```

装好后 TS 自动找到类型。这些包来自社区维护的 **DefinitelyTyped** 仓库。如果库自带类型（包里含 `.d.ts` 或 `package.json` 的 `types` 字段），则**不用**装 `@types`。

---

## 4. 全局声明 declare global

给全局对象（如 `window`）加自定义属性：

```ts
// global.d.ts
declare global {
  interface Window {
    myConfig: { theme: string };
  }
}
export {}; // 让本文件成为模块（否则 declare global 不生效）
```

之后 `window.myConfig` 就有类型了。给 `process.env` 加自定义变量同理：

```ts
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}
```

---

## 5. 为无类型库补声明

遇到老库没类型、也不想装 `@types`（或不存在），自己写个 `.d.ts`：

```ts
// types/my-lib.d.ts
declare module "my-old-lib" {
  export function compute(input: string): number;
  export const version: string;
}
```

然后把 `types` 目录加进 `tsconfig` 的 `include` 或 `typeRoots`。这样 `import` 该库就有类型，且不会 `any`。

若库导出太复杂，先用 `declare module "x";` 让它整体为 `any`，再逐步细化：

```ts
declare module "x"; // 最粗粒度：整个模块 any，至少能 import
```

---

## 6. 编写可发布的类型包

若你开源一个 JS 库，给用户好体验就带上类型：

```jsonc
// package.json
{
  "types": "./dist/index.d.ts",
  "exports": { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" } }
}
```

用 `tsc` 的 `declaration: true` 自动从 `.ts` 生成 `.d.ts`：

```jsonc
{ "compilerOptions": { "declaration": true, "emitDeclarationOnly": true, "outDir": "dist" } }
```

---

## 7. 类型与实现分离的最佳实践

- 业务逻辑写在 `.ts`，类型声明由 `tsc` 生成，不要手写维护 `.d.ts`（易与实现脱节）。
- 只有**描述外部/全局**才手写 `.d.ts`。
- 严格项目开 `skipLibCheck: true`，跳过 `.d.ts` 内部一致性检查，避免第三方类型拖累你的编译速度（你不负责修它们的类型）。

---

## 小结

- `.d.ts` = 只有类型、编译后消失的"说明书"。
- `declare` 声明外部存在的值/类型；`declare module "x"` 为库补类型。
- 第三方库优先 `@types/xxx`（DefinitelyTyped）。
- `declare global` 扩展 `window`/`process.env`。
- 自己库用 `declaration: true` 自动产出 `.d.ts`，别手写维护。

---

## 练习

1. 找一个没类型的库（或假设 `my-lib`），写 `.d.ts` 补 `declare module "my-lib"` 并 import 测试。
2. 用 `declare global` 给 `window` 加 `appVersion: string`，在代码里访问。
3. 开 `declaration: true` 编译一个含函数的 `.ts`，观察生成的 `.d.ts`。
4. 解释何时用 `@types/xxx`、何时自己写 `.d.ts`、何时用 `declare module "x";`。
