---
title: '02 · 基础类型与类型注解'
published: 2026-09-27T12:00:00+08:00
description: 'TypeScript 基础类型全解：原始类型、数组与元组、枚举（含 const enum 陷阱）、any/unknown/never/void 的区别与取舍、类型推断机制、字面量类型，建立"类型即约束"的核心直觉。'
tags: [TypeScript, 基础类型, 类型注解, 类型推断, enum]
category: TypeScript学习路线
draft: false
---

> [!NOTE]
> 本篇讲 TS 的"原子"——基础类型。理解它们和类型推断，是后续所有类型组合的地基。

---

## 1. 类型注解语法

TS 在变量/参数/返回值后加 `: 类型`：

```ts
let age: number = 18;
function add(a: number, b: number): number {
  return a + b;
}
```

但**大多数时候你不用手写注解**——TS 会推断（见第 4 节）。注解主要用于：函数参数（无法推断）、对象结构、想收窄类型时。

---

## 2. 原始类型

| 类型 | 说明 | 示例 |
| --- | --- | --- |
| `string` | 字符串 | `"hello"` |
| `number` | 所有数字（含整数/浮点/NaN） | `42`、`3.14` |
| `boolean` | 布尔 | `true` |
| `bigint` | 大整数 | `100n` |
| `symbol` | 唯一符号 | `Symbol("k")` |
| `null` / `undefined` | 空值 | —— |

```ts
let title: string = "TS 入门";
let count: number = 0;
let done: boolean = false;
```

> TS 里**没有** `int`/`float` 之分，数字统一是 `number`（编译到 JS 都是 `number`）。

---

## 3. 数组与元组

```ts
// 数组：两种写法等价
let nums: number[] = [1, 2, 3];
let nums2: Array<number> = [1, 2, 3];

// 元组：固定长度、固定位置类型
let pair: [string, number] = ["age", 18];
pair[0].toUpperCase(); // ✅ string 方法可用
pair[1].toFixed(2);    // ✅ number 方法可用
```

元组常用于"固定结构的多返回值"，比如 `useState` 的 `[state, setState]`。

---

## 4. 枚举 enum

枚举给一组相关常量起名字：

```ts
enum Direction {
  Up,
  Down,
  Left,
  Right,
}
Direction.Up;    // 0
Direction.Down;  // 1
```

可指定值：

```ts
enum Status {
  Success = 200,
  NotFound = 404,
  Error = 500,
}
```

字符串枚举：

```ts
enum Role {
  Admin = "ADMIN",
  User = "USER",
}
```

⚠️ **陷阱：const enum**。普通 enum 会编译成 JS 对象，有运行时开销；`const enum` 在编译期被**内联替换**，但配合某些打包器（尤其 `isolatedModules`）会报错。现代项目多用**字符串字面量联合**替代 enum（见第 8 篇），更轻量也更 TS 化。

---

## 5. any / unknown / never / void

这四个容易混，务必分清：

### any —— "关掉类型检查"
```ts
let val: any = 4;
val = "hello";
val.foo.bar; // 不报错，但运行时炸
```
`any` 会**逃逸整个类型系统**，能调用任何成员。尽量少用；实在要接不明来源数据时，优先 `unknown`。

### unknown —— "安全的 any"
```ts
let input: unknown = getUserInput();
// input.toUpperCase(); // ❌ 必须先收窄类型
if (typeof input === "string") {
  input.toUpperCase(); // ✅ 收窄后可用
}
```
`unknown` 是"我还不知道类型"，使用前必须做类型守卫，安全得多。

### never —— "永远不会发生"
```ts
function fail(msg: string): never {
  throw new Error(msg);
}
```
`never` 表示函数**不返回**（抛异常/死循环），或"一个不可能存在的值"。它常用于**穷尽性检查**（第 8 篇联合类型会用到）。

### void —— "没有返回值"
```ts
function log(msg: string): void {
  console.log(msg);
}
```
`void` 表示函数不返回有意义的值。注意：`undefined` 是具体值，`void` 是"无返回"的语义。

---

## 6. 类型推断

TS 能自动推断绝大多数类型，不必处处注解：

```ts
let x = 10;          // 推断为 number
x = "hi";            // ❌ 不能改成 string

const arr = [1, 2];  // 推断为 number[]
```

推断规则速记：
- 用 `let` 初始化 → 推断为**值的类型**。
- 用 `const` 初始化对象/数组 → 推断为**足够宽**的类型（数组是 `T[]`，不是元组）。
- 函数返回值 → 由 `return` 推断；无 return 为 `void`。

**最佳实践**：函数参数、导出对象结构显式注解；局部变量交给推断。

---

## 7. 字面量类型

字面量不仅能当值，也能当类型——值本身成为类型：

```ts
let mode: "light" | "dark" = "light";
mode = "dark";   // ✅
mode = "blue";   // ❌

const port = 8080; // const 下推断为字面量类型 8080（不是 number）
```

字面量类型 + 联合 = 可辨识联合（第 8 篇核心），是 TS 最实用的特性之一。

---

## 小结

- 原始类型 `string/number/boolean/bigint/symbol/null/undefined`。
- 数组 `T[]`、元组 `[T, U]`（固定结构）。
- `enum` 方便但有运行时开销，现代偏好字面量联合。
- `any`(关检查)/`unknown`(需收窄)/`never`(不返回)/`void`(无返回) 各自有清晰边界。
- 类型推断省注解，但参数和导出结构要显式写。

---

## 练习

1. 定义 `let user: { name: string; age: number }`，试把 `age` 改成字符串看报错。
2. 写一个返回 `never` 的 `assertNever(x: never): never` 函数。
3. 用字面量联合定义 `type Theme = "light" | "dark" | "system"`，并写函数 `applyTheme(t: Theme)`。
4. 对比 `let n = 1` 与 `const n = 1` 推断出的类型差异（用 VS Code 悬浮查看）。
