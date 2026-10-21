---
title: '03 · 接口与类型别名'
published: 2026-09-27T13:00:00+08:00
description: 'TypeScript 结构化类型的核心：interface 的定义、可选与只读成员、索引签名、接口继承、函数类型接口；type 类型别名的用法；interface 与 type 的取舍；交叉类型 & 的组合技巧。'
tags: [TypeScript, interface, type, 类型别名, 交叉类型]
category: TypeScript学习路线
draft: false
---

> [!NOTE]
> 本篇讲 TS 描述"对象形状"的两大工具：`interface` 与 `type`。掌握它们，等于掌握了 TS 描述数据结构的语法。

---

## 1. interface 定义对象形状

```ts
interface User {
  id: number;
  name: string;
  email: string;
}

function sendEmail(user: User): void {
  console.log(`给 ${user.name} 发邮件`);
}
```

只要传入的对象**结构匹配**（有 `id/name/email`），就通过——TS 是**结构化类型系统**（鸭子类型），不看"是不是同一个类"，只看"长得像不像"。

---

## 2. 可选与只读

```ts
interface User {
  id: number;
  name: string;
  bio?: string;            // ? 可选成员
  readonly createdAt: Date; // readonly 只读，赋值后不可改
}

const u: User = { id: 1, name: "Tom" }; // bio 可省略
u.createdAt = new Date(); // ❌ readonly 不可重新赋值
```

> `readonly` 只约束**编译期**的重新赋值，不保证深层不可变（数组元素、对象属性仍可被改）。深层冻结要用 `Object.freeze` 或 `Readonly<T>`（第 7 篇）。

---

## 3. 索引签名

当你不知道对象有哪些键、但知道键值类型时用索引签名：

```ts
interface StringMap {
  [key: string]: string;
}
const dict: StringMap = { a: "1", b: "2" };
```

常见场景：配置对象、字典结构。注意：一旦有索引签名，所有显式成员的类型必须**兼容**该签名的值类型。

---

## 4. 函数类型接口

接口也能描述函数：

```ts
interface SearchFn {
  (source: string, keyword: string): boolean;
}
const search: SearchFn = (s, k) => s.includes(k);
```

不过函数类型更常用 `type` 写（见第 4 篇），接口更偏向对象。

---

## 5. 接口继承 extends

接口可继承多个：

```ts
interface Animal {
  name: string;
}
interface Dog extends Animal {
  bark(): void;
}
// Dog = { name: string; bark(): void }
```

---

## 6. type 类型别名

`type` 给任意类型起名字，不只是对象：

```ts
type ID = number | string;
type Point = { x: number; y: number };
type Callback = (err: Error | null, data: string) => void;
```

`type` 还能配合联合、交叉、条件类型做复杂组合（后续多篇大量用到）。

---

## 7. interface vs type：怎么选

这是高频面试题，结论如下：

| 场景 | 推荐 |
| --- | --- |
| 描述对象/类的公开形状 | `interface` |
| 需要被类 `implements` | `interface` |
| 联合类型、元组、基本类型别名 | `type` |
| 需要交叉 `&`、条件、映射类型 | `type` |
| 想被**声明合并**扩展 | `interface` |

关键差异：
- **声明合并**：同名 `interface` 会**自动合并**；同名 `type` 会**报错**。
  ```ts
  interface Foo { a: number }
  interface Foo { b: string } // ✅ 合并为 { a: number; b: string }
  ```
- **继承方式**：interface 用 `extends`，type 用交叉 `&`。

**实践建议**：写对象/数据结构优先 `interface`（可读性好、可合并）；涉及联合/交叉/工具类型用 `type`。团队统一即可。

---

## 8. 交叉类型 &

交叉把多个类型合并成一个"全部都有"的类型：

```ts
type A = { x: number };
type B = { y: string };
type C = A & B; // { x: number; y: string }

const c: C = { x: 1, y: "hi" };
```

对象交叉 = 成员并集；同名成员若类型冲突（如 `x: number & x: string`）会变成 `never`，要小心。

---

## 小结

- `interface` 描述对象形状，支持可选 `?`、只读 `readonly`、索引签名、继承 `extends`、声明合并。
- `type` 更通用，可表达联合/交叉/基本类型别名。
- 对象结构用 `interface`，组合类型用 `type`。
- 交叉 `&` 合并成员，同名冲突会变 `never`。

---

## 练习

1. 定义 `interface Product { id: number; name: string; price: number; discount?: number }`，写函数计算最终价。
2. 用 `type` 定义 `type Coordinate = { lat: number; lng: number }`，再用交叉 `&` 加 `type WithName = Coordinate & { name: string }`。
3. 验证声明合并：写两个同名 `interface Config`，观察合并结果。
4. 思考 `type X = { a: number } & { a: string }` 中 `a` 是什么类型？
