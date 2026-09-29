---
title: '09 · 高级类型与类型体操入门'
published: 2026-09-27T19:00:00+08:00
description: 'TypeScript 类型体操入门：模板字面量类型、递归类型、索引访问类型进阶，并手搓 MyPick / MyReadonly / MyOmit / MyAwaited 等工具类型，建立"用类型描述类型"的推导思维。'
tags: [TypeScript, 类型体操, 模板字面量, 递归类型, 工具类型实现]
category: TypeScript学习路线
draft: false
---

> [!NOTE]
> "类型体操"指用 TS 类型系统做复杂推导（社区梗，形容像体操一样绕）。本篇带你手搓几个经典工具类型，理解推导套路即可，不必追求炫技。

---

## 1. 模板字面量类型

类型层面也能做字符串拼接：

```ts
type World = "world";
type Hello = `hello ${World}`; // "hello world"

type EventName<T extends string> = `${T}Changed`;
type E = EventName<"name">; // "nameChanged"
```

配合联合会**笛卡尔展开**：

```ts
type Color = "red" | "blue";
type Size = "s" | "m";
type Class = `${Color}-${Size}`; // "red-s" | "red-m" | "blue-s" | "blue-m"
```

实战：给 CSS 属性名加前缀、给事件名加 `on` 等。

---

## 2. 递归类型

类型可递归引用自身，处理嵌套结构：

```ts
type Json =
  | string | number | boolean | null
  | Json[]
  | { [key: string]: Json };
```

递归类型描述树/JSON 等自相似数据。配合映射类型可写 `DeepReadonly`、`DeepPartial`（第 7 篇提过）。

---

## 3. 索引访问进阶

```ts
type Prop<T, K extends keyof T> = T[K];
type Nested = { user: { name: string } };
type Name = Nested["user"]["name"]; // string（链式索引访问）
```

---

## 4. 手搓工具类型（核心练习）

### MyPick<T, K>
```ts
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};
type R = MyPick<{ a: 1; b: 2 }, "a">; // { a: 1 }
```

### MyReadonly<T>
```ts
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K];
};
```

### MyOmit<T, K>
```ts
type MyOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
// 或
type MyOmit2<T, K extends keyof T> = {
  [P in Exclude<keyof T, K>]: T[P];
};
```

### MyAwaited<T>（处理 Promise 嵌套）
```ts
type MyAwaited<T> =
  T extends Promise<infer U>
    ? U extends Promise<any>
      ? MyAwaited<U>
      : U
    : never;
type R = MyAwaited<Promise<Promise<number>>>; // number
```

### MyCapitalize<T>（用内置大小写映射）
```ts
type MyCapitalize<T extends string> =
  T extends `${infer F}${infer Rest}`
    ? `${Uppercase<F>}${Rest}`
    : T;
type R = MyCapitalize<"hello">; // "Hello"
```

---

## 5. 类型体操的套路

1. **拆**：把目标类型拆成"键的集合"与"值的变换"。
2. **遍历**：用 `[K in keyof T]` 或 `[K in U]` 映射。
3. **提取**：用 `infer` 在条件类型里抓子类型。
4. **递归**：遇到嵌套用自身再调一次。
5. **约束**：用 `K extends keyof T` 保证合法。

这些也是 `type-challenges`（社区题库）的常考题。

---

## 6. 现实中的边界

类型体操很酷，但**生产代码别过度**：类型越复杂，编译越慢、可读性越差。原则：
- 库作者/通用工具值得做；业务代码能用内置 `Partial/Pick/Omit` 就别手写。
- 类型报错难读时，先想"是不是设计太复杂"，而非硬刚。

---

## 小结

- 模板字面量类型可做类型级字符串拼接与联合展开。
- 递归类型描述自相似结构（JSON/树）。
- 手搓 `MyPick`/`MyReadonly`/`MyOmit`/`MyAwaited` 掌握映射+infer 套路。
- 类型体操适可而止，业务里优先用内置工具类型。

---

## 练习

1. 实现 `MyExclude<T, U>`（`T extends U ? never : T`）。
2. 实现 `MyRecord<K extends keyof any, V>`（`{ [P in K]: V }`）。
3. 用模板字面量实现 `type Handler<T extends string> = \`on${Capitalize<T>}\``。
4. 实现递归 `MyDeepReadonly<T>`，让嵌套对象全部只读。
