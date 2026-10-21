---
title: '11 · 模块与命名空间'
published: 2026-09-27T21:00:00+08:00
description: 'TypeScript 模块系统：ES Module 的 import/export、默认导出与命名导出、重命名与聚合导出、动态 import()、模块解析 moduleResolution、以及遗留的 namespace 用法与取舍。'
tags: [TypeScript, 模块, ESModule, import, 命名空间, 模块解析]
category: TypeScript学习路线
draft: false
---

> [!NOTE]
> 模块化是现代 JS/TS 的基石。本篇讲清 ES Module 在 TS 里的写法、模块解析规则，以及为什么 `namespace` 基本被淘汰。

---

## 1. 导出 export

```ts
// math.ts
export const PI = 3.14;
export function square(n: number): number { return n * n; }
export interface Point { x: number; y: number }

// 或集中导出
const add = (a: number, b: number) => a + b;
export { add };
```

类型（`interface`/`type`）也能 `export`，编译后会被擦除，只用于类型检查。

---

## 2. 导入 import

```ts
import { PI, square, type Point } from "./math";
import * as MathUtils from "./math"; // 命名空间式导入
import defaultExport from "./mod";   // 默认导入
```

用 `type` 前缀（或 `import type`）只导入类型，配合 `isolatedModules` 更安全、且不会被编译进 JS：

```ts
import type { Point } from "./math"; // 纯类型，编译后整行消失
```

---

## 3. 默认导出 vs 命名导出

| | 默认导出 | 命名导出 |
| --- | --- | --- |
| 写法 | `export default` | `export const/function` |
| 导入 | 任意名字 | 必须同名（可重命名） |
| 数量 | 每文件一个 | 多个 |
| 推荐 | 一个文件一个主产物时用 | 多数情况更推荐 |

**推荐命名导出**：可静态分析、重构友好、IDE 补全好。默认导出适合"一个模块一个类/函数"的场景。

---

## 4. 重命名与聚合

```ts
import { square as sq } from "./math";   // 导入时改名
export { square as pow2 } from "./math"; // 重新导出

// 聚合多个模块
export * from "./math";
export * from "./string";
```

---

## 5. 动态 import()

运行时按需加载，返回 Promise：

```ts
button.onclick = async () => {
  const { heavyCalc } = await import("./heavy");
  heavyCalc();
};
```

动态 `import()` 让代码分割/懒加载成为可能，是前端性能优化关键点。

---

## 6. 模块解析 moduleResolution

`tsconfig` 的 `moduleResolution` 决定 TS **怎么找模块**：

```jsonc
{
  "module": "ESNext",
  "moduleResolution": "Bundler" // 或 Node / Node16 / NodeNext
}
```

- `Node`/`NodeNext`：模拟 Node 的 `node_modules` 解析，需写扩展名（NodeNext 要求）。
- `Bundler`：给 Vite/webpack 等打包器用，不用写 `.js` 扩展名，最省心（现代前端首选）。

路径别名也要在此生效：

```jsonc
{
  "baseUrl": ".",
  "paths": { "@/*": ["src/*"] }
}
```

---

## 7. namespace（遗留，谨慎）

TS 早期用 `namespace` 做全局命名隔离：

```ts
namespace Geometry {
  export function area(r: number) { return Math.PI * r * r; }
}
Geometry.area(1);
```

但在 ES Module 时代，**几乎不再需要 namespace**——文件即模块，用 `export/import` 即可。仅维护老代码时可能遇到，新项目请直接用 ES Module。

---

## 小结

- `export`/`import` 是模块标准；`import type` 只导类型，编译后消失。
- 优先**命名导出**（可分析、可重构）。
- 动态 `import()` 实现懒加载。
- `moduleResolution` 选 `Bundler`（前端）或 `NodeNext`（Node）。
- `namespace` 是旧时代产物，新项目用 ES Module 替代。

---

## 练习

1. 建 `string.ts` 导出 `capitalize` 与 `truncate`，在 `main.ts` 用命名导入调用。
2. 把上题改成默认导出一个对象，再改回命名导出，体会差异。
3. 配置 `paths` 别名 `@/* -> src/*`，用 `import { x } from "@/utils"` 验证。
4. 用动态 `import()` 在按钮点击时加载一个含大函数模块。
