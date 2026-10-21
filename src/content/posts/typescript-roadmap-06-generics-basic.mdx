---
title: '06 · 泛型基础'
published: 2026-09-27T16:00:00+08:00
description: 'TypeScript 泛型入门：为什么需要泛型、泛型函数 identity、泛型约束 extends、泛型默认值、泛型接口与泛型类、多个类型参数。用泛型写出可复用且类型安全的代码。'
tags: [TypeScript, 泛型, generics, 类型约束, 类型安全]
category: TypeScript学习路线
draft: false
---

> [!NOTE]
> 泛型 = "参数化的类型"。它让函数/类/接口在**保持类型安全**的同时适配多种类型。本篇打基础，第 7 篇讲进阶玩法。

---

## 1. 为什么需要泛型

没有泛型时，想写一个"返回传入值"的函数只能退化成 `any`：

```ts
function identity(arg: any): any {
  return arg;
}
const x = identity(10); // x 是 any，丢了 number 信息
```

用泛型保留类型信息：

```ts
function identity<T>(arg: T): T {
  return arg;
}
const x = identity(10);   // x: number
const s = identity("hi"); // s: string
```

`T` 是**类型参数**，调用时由实参推断。返回值类型和入参类型被"绑定"在一起。

---

## 2. 泛型函数

```ts
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}
first([1, 2, 3]);     // number | undefined
first(["a", "b"]);    // string | undefined
```

多个类型参数：

```ts
function pair<K, V>(key: K, value: V): [K, V] {
  return [key, value];
}
```

---

## 3. 泛型约束 extends

有时你想限制 `T` "至少长什么样"。用 `extends` 约束：

```ts
interface HasLength {
  length: number;
}
function longest<T extends HasLength>(a: T, b: T): T {
  return a.length >= b.length ? a : b;
}
longest("abc", "de");   // ✅ string 有 length
longest([1, 2], [3]);   // ✅ 数组有 length
// longest(10, 20);     // ❌ number 没有 length
```

约束让 `T` 既保留具体类型，又能安全访问 `length`。

---

## 4. 泛型默认值

类型参数也能给默认：

```ts
interface ApiResponse<T = unknown> {
  code: number;
  data: T;
}
const r1: ApiResponse = { code: 0, data: null };      // data: unknown
const r2: ApiResponse<string> = { code: 0, data: "ok" }; // data: string
```

默认值让可选泛型更友好，常见于库的类型定义。

---

## 5. 泛型接口

```ts
interface Result<T> {
  ok: boolean;
  value: T;
}
function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}
```

---

## 6. 泛型类

```ts
class Stack<T> {
  private items: T[] = [];
  push(item: T): void { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
}
const s = new Stack<number>();
s.push(1);
```

实例化时指定 `T`，类内所有用到 `T` 的地方都锁定为该类型。

---

## 7. 泛型与箭头函数

给箭头函数加泛型要小心语法——`<T>` 易被解析为 JSX：

```ts
const identity = <T,>(arg: T): T => arg; // 加逗号 <T,> 避免歧义
```

在 `.tsx` 文件里这个逗号**必需**。

---

## 小结

- 泛型 `<T>` 把"类型"当参数，保留类型信息又复用逻辑。
- `extends` 约束 `T` 的形态；默认值让泛型可选。
- 泛型可用于函数、接口、类，多个类型参数用 `<K, V>`。
- `.tsx` 中写 `<T,>` 防止被当成 JSX。

---

## 练习

1. 写泛型函数 `last<T>(arr: T[]): T | undefined` 返回最后一个元素。
2. 用 `T extends object` 约束写一个 `getKeys<T extends object>(o: T): (keyof T)[]`。
3. 写泛型类 `Queue<T>` 实现 `enqueue`/`dequeue`。
4. 给 `interface Box<T = string>` 加默认值，分别用 `Box` 和 `Box<number>` 实例化。
