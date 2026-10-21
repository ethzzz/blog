---
title: '08 · 联合、交叉与类型守卫'
published: 2026-09-27T18:00:00+08:00
description: 'TypeScript 类型收窄机制全解：联合类型与字面量联合、typeof/instanceof/in 收窄、可辨识联合（discriminated union）、自定义类型守卫 is、断言 as 与非空断言 ! 的安全边界。'
tags: [TypeScript, 联合类型, 类型守卫, 可辨识联合, 类型收窄]
category: TypeScript学习路线
draft: false
---

> [!NOTE]
> JS 运行时值是动态的，TS 靠"类型收窄"在代码流里逐步把宽泛类型变精确。本篇讲清所有收窄手段，尤其是可辨识联合这一实战神器。

---

## 1. 联合类型

一个值可以是多种类型之一：

```ts
let id: number | string;
id = 1;
id = "a1";
```

联合让 API 更灵活（如 `id` 既接受数字也接受字符串）。但访问联合的**共有成员**才安全，专有成员需先收窄。

---

## 2. 字面量联合

```ts
type Status = "idle" | "loading" | "success" | "error";
let s: Status = "loading";
s = "done"; // ❌ 不在联合内
```

字面量联合是最常用的"枚举替代"，零运行时开销。

---

## 3. 类型收窄 narrowing

TS 在 `if`/三元等控制流里会**自动收窄**联合：

```ts
function format(value: number | string): string {
  if (typeof value === "string") {
    return value.trim(); // 这里 value 被收窄为 string
  }
  return value.toFixed(2); // 这里收窄为 number
}
```

---

## 4. 收窄手段一览

| 手段 | 适用 |
| --- | --- |
| `typeof x === "string"` | 原始类型 |
| `x instanceof Foo` | 类实例 |
| `key in x` | 对象是否含某键 |
| `x === 字面量` | 字面量联合 |
| 自定义守卫 `is` | 任意复杂判断 |
| 可辨识联合的 `switch` | 带 `kind` 的联合 |

`in` 示例：

```ts
type A = { a: number };
type B = { b: string };
function f(x: A | B): void {
  if ("a" in x) x.a; // A
  else x.b;          // B
}
```

---

## 5. 可辨识联合 discriminated union

给联合每个成员加一个**共同的字面量字段**（`kind`/`type`），即可用 `switch` 安全分派：

```ts
type Shape =
  | { kind: "circle"; r: number }
  | { kind: "rect"; w: number; h: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.r ** 2; // s 收窄为 circle
    case "rect":   return s.w * s.h;          // s 收窄为 rect
    default:
      // 穷尽性检查：若漏 case，这里 s 是 never，会编译报错
      const _exhaustive: never = s;
      return _exhaustive;
  }
}
```

`never` 穷尽检查是**杀手锏**：以后新增 `kind`，忘了加 `case`，编译期立刻报错，不会漏处理。

---

## 6. 自定义类型守卫 is

判断逻辑复杂时，用 `is` 抽成守卫函数：

```ts
function isFish(x: Fish | Bird): x is Fish {
  return (x as Fish).swim !== undefined;
}
function move(x: Fish | Bird): void {
  if (isFish(x)) x.swim(); // 收窄为 Fish
  else x.fly();
}
```

`x is Fish` 告诉 TS："这个函数返回 true 时，x 就是 Fish"，从而在调用处自动收窄。

---

## 7. 断言 as 与非空 !

⚠️ 这两是"我比编译器更懂"的逃生舱，**慎用**：

```ts
const el = document.getElementById("app") as HTMLDivElement; // 断言类型
const len = (el as any).length;                              // 双断言链，危险

function f(x: string | null): number {
  return x!.length; // 非空断言：你保证 x 非 null，否则运行时炸
}
```

规则：
- 优先用收窄，别用 `as`。
- 必须断言时，用 `as` 一步到位，避免 `as any as X`。
- `!` 只在你**确定**非空时用，否则把运行时错误藏起来。

---

## 小结

- 联合 `A | B` 与字面量联合是灵活 API 的基础。
- 收窄手段：`typeof`/`instanceof`/`in`/`===`/自定义 `is`/可辨识联合。
- 可辨识联合 + `never` 穷尽检查 = 漏 case 编译期报错。
- `as`/`!` 是逃生舱，能收窄就别断言。

---

## 练习

1. 定义可辨识联合 `type Resp = { ok: true; data: string } | { ok: false; error: string }`，写 `handle(r: Resp)` 用 `switch`。
2. 给上题加 `never` 穷尽检查，然后新增一个 `ok` 变体看是否报错。
3. 写 `isString(x: unknown): x is string` 守卫函数，并在 `format` 里用它收窄。
4. 解释 `as any` 为什么危险，什么场景才该用 `as`。
