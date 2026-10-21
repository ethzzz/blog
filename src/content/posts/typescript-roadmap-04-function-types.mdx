---
title: '04 · 函数类型深入'
published: 2026-09-27T14:00:00+08:00
description: 'TypeScript 函数类型的完整体系：函数类型表达式、参数与返回值注解、可选/默认/rest 参数、函数重载（overload）、this 参数与 this 类型、回调函数中的 this 安全。'
tags: [TypeScript, 函数类型, 重载, this类型, 函数表达式]
category: TypeScript学习路线
draft: false
---

> [!NOTE]
> 函数是 JS 的一等公民，TS 给函数类型提供了远超参数注解的能力：重载、this 约束、灵活的参数形态。本篇一次讲透。

---

## 1. 函数类型表达式

把"函数长什么样"抽成类型：

```ts
type Greet = (name: string) => string;

const sayHi: Greet = (n) => `hi ${n}`;
```

注意区分两种箭头：
- `(name: string) => string` 是**类型**里的函数签名。
- `(name: string): string => {}` 是**值**里的箭头函数（返回类型注解在参数外）。

---

## 2. 参数形态

```ts
// 可选参数 ?
function build(name: string, age?: number): string {
  return age ? `${name}/${age}` : name;
}

// 默认参数（默认参数自动推断类型）
function fetch(url: string, method = "GET"): void {}

// rest 参数
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0);
}
```

规则：可选参数和默认参数**必须放在必填参数之后**；rest 永远最后。

---

## 3. 函数重载 overload

JS 函数常根据参数类型/个数返回不同结果。TS 用**重载签名 + 实现签名**表达：

```ts
// 重载签名（对外可见，无函数体）
function reverse(x: string): string;
function reverse(x: number): number;

// 实现签名（对外不可见，需兼容所有重载）
function reverse(x: string | number): string | number {
  if (typeof x === "string") return x.split("").reverse().join("");
  return Number(String(x).split("").reverse().join(""));
}

reverse("abc");  // ✅ string
reverse(123);    // ✅ number
reverse(true);   // ❌ 不在重载列表中
```

要点：
- 重载签名可以有多个，实现签名只有一个且**必须兼容全部重载**。
- 调用时按重载签名匹配，类型更精确（返回值是 `string` 而非 `string | number`）。

---

## 4. this 类型与 this 参数

JS 里 `this`  notoriously 难推断。TS 用**显式 this 参数**标注：

```ts
interface Counter {
  count: number;
  inc(this: Counter): void;
}
const c: Counter = {
  count: 0,
  inc() { this.count++; },
};
```

不写 `this: Counter` 时，方法内 `this` 会被推断为 `Counter`，一般够用。但当函数被**抽离调用**时容易丢 `this`：

```ts
function print(this: User): void {
  console.log(this.name);
}
const u: User = { name: "Tom", print } as any;
// 把 print 当回调传出去时，若没约束 this 会报错
```

`this` 参数**必须放在参数列表第一位**，且只用于类型检查，编译后会被擦除。

---

## 5. 回调里的 this

常见坑：回调函数中 `this` 指向丢失。配合 `this` 类型可约束：

```ts
interface Handlers {
  onClick(this: Button, e: Event): void;
}
class Button {
  label = "btn";
  bind(h: Handlers) {
    document.addEventListener("click", () => h.call(this, event));
  }
}
```

这样 `h` 里只能用 `Button` 的 `this`，避免回调里误用外层 `this`。

---

## 6. 构造函数类型

用 `new` 描述可 `new` 的东西：

```ts
type Constructor = new (name: string) => Animal;
function create(Ctor: Constructor, name: string): Animal {
  return new Ctor(name);
}
```

---

## 小结

- 函数类型表达式 `(a: T) => R` 用于注解函数变量。
- 可选 `?`、默认、rest 参数各有位置约束。
- 重载 = 多个对外签名 + 一个兼容实现，提升调用侧精度。
- `this` 参数放在第一位，约束方法/回调里的 `this`，编译后擦除。

---

## 练习

1. 写 `type BinaryOp = (a: number, b: number) => number`，实现 `add/sub/mul` 三个符合该类型的值。
2. 用重载实现 `pad(s: string, n: number): string` 与 `pad(n: number, len: number): string`（数字补零）。
3. 写一个需要 `this: { value: number }` 的 `double(this: { value: number }): number` 方法并测试。
4. 解释"实现签名必须兼容所有重载签名"的含义，并故意写个不兼容的看报错。
