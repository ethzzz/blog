---
title: '07 · 泛型进阶与内置工具类型'
published: 2026-09-27T17:00:00+08:00
description: 'TypeScript 类型编程核心：条件类型 T extends U ? X : Y、infer 提取类型、映射类型 { [K in keyof T]: ... }、keyof 与索引访问，以及 Partial/Required/Readonly/Pick/Omit/Record/ReturnType 等内置工具类型的原理与用法。'
tags: [TypeScript, 条件类型, infer, 映射类型, 工具类型, keyof]
category: TypeScript学习路线
draft: false
---

> [!NOTE]
> 本篇进入"类型编程"：用类型去操作类型。条件类型、infer、映射类型是 TS 类型系统的三把瑞士军刀，内置工具类型都建立在它们之上。

---

## 1. 条件类型

语法像三元表达式，但在类型层面：

```ts
type IsString<T> = T extends string ? "yes" : "no";
type A = IsString<"hi">;  // "yes"
type B = IsString<42>;    // "no"
```

注意 `T extends U` 在条件类型里，若 `T` 是**联合**，会发生**分布式条件**——对联合每个成员分别求值：

```ts
type ToArray<T> = T extends any ? T[] : never;
type R = ToArray<string | number>; // string[] | number[]
```

想**关闭分发**，用元组包一层：`[T] extends [any]`。

---

## 2. infer 提取类型

`infer` 在 `extends` 中"占位"提取一部分类型：

```ts
type ElementType<T> = T extends (infer U)[] ? U : T;
type E = ElementType<number[]>; // number

type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : never;
type R = ReturnOf<() => boolean>; // boolean
```

`infer U` 表示"这里有个待推断的类型"，匹配成功后被绑定到 `U`。

---

## 3. keyof 与索引访问

```ts
interface User { id: number; name: string }
type Keys = keyof User;        // "id" | "name"
type NameType = User["name"];  // string
type AllValues = User[keyof User]; // number | string
```

`keyof T` 得到 T 所有键的联合；`T[K]` 得到键 K 对应的值类型。两者结合可写出"按 key 取值"的泛型：

```ts
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
getProp({ id: 1, name: "Tom" }, "name"); // 返回 string，类型精确
```

---

## 4. 映射类型

遍历一个类型的所有键，逐一变换：

```ts
type Optional<T> = {
  [K in keyof T]?: T[K];
};
type PartialUser = Optional<User>; // { id?: number; name?: string }
```

`in keyof T` 遍历键；`?` 加可选；`T[K]` 取原值类型。这是 `Partial` 的底层实现。

---

## 5. 内置工具类型（必背）

| 工具类型 | 作用 | 近似实现 |
| --- | --- | --- |
| `Partial<T>` | 全部变可选 | `{ [K in keyof T]?: T[K] }` |
| `Required<T>` | 全部必填 | `{ [K in keyof T]-?: T[K] }` |
| `Readonly<T>` | 全部只读 | `{ readonly [K in keyof T]: T[K] }` |
| `Pick<T, K>` | 挑部分键 | `{ [P in K]: T[P] }` |
| `Omit<T, K>` | 排除部分键 | `Pick<T, Exclude<keyof T, K>>` |
| `Record<K, V>` | 键到值的映射 | `{ [P in K]: V }` |
| `Exclude<T, U>` | 排除联合成员 | `T extends U ? never : T` |
| `Extract<T, U>` | 提取联合成员 | `T extends U ? T : never` |
| `NonNullable<T>` | 去掉 null/undefined | `T extends null | undefined ? never : T` |
| `ReturnType<T>` | 函数返回值类型 | 用 infer |
| `Parameters<T>` | 函数参数元组 | 用 infer |

用法示例：

```ts
type UserPreview = Pick<User, "id" | "name">; // { id: number; name: string }
type UserInput = Omit<User, "id">;            // 创建时不需要 id
type Dict = Record<string, number>;          // { [k: string]: number }

function load(): { data: string } { return { data: "" }; }
type LoadResult = ReturnType<typeof load>;    // { data: string }
```

---

## 6. 组合使用

工具类型可嵌套组合，表达复杂变换：

```ts
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
```

这是递归映射类型（类型体操入门，第 9 篇深入）。

---

## 小结

- 条件类型 `T extends U ? X : Y`，联合会分发；`[T]` 包元组可关分发。
- `infer` 在 extends 中提取子类型。
- `keyof` + `T[K]` 实现"按键取值"的精确类型。
- 映射类型 `{ [K in keyof T]: ... }` 遍历变换键。
- `Partial/Pick/Omit/Record/ReturnType` 等内置工具建立在这四者之上。

---

## 练习

1. 用 `infer` 实现 `FirstArg<F>` 提取函数第一个参数类型。
2. 用映射类型实现 `Mutable<T>`（去掉所有 readonly）。
3. 用 `Pick` 和 `Omit` 从 `interface Post { id; title; body; author }` 派生 `PostMeta`（去掉 body）。
4. 用 `Record` 定义 `type HttpCodes = Record<"OK" | "NotFound", number>` 并赋值。
