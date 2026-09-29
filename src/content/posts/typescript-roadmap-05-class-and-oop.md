---
title: '05 · 类与面向对象'
published: 2026-09-27T15:00:00+08:00
description: 'TypeScript 类系统详解：class 基础、public/private/protected 修饰符、readonly、参数属性、继承 extends 与 super、abstract 抽象类、implements 实现接口、getter/setter 存取器、静态成员。'
tags: [TypeScript, class, 面向对象, 继承, 抽象类, implements]
category: TypeScript学习路线
draft: false
---

> [!NOTE]
> TS 的 `class` 是 ES6 class 的超集，额外加了**访问控制、抽象类、参数属性**等 OOP 利器。本篇讲清类在 TS 里的正确打开方式。

---

## 1. 类的基础

```ts
class Person {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  greet(): string {
    return `我是 ${this.name}`;
  }
}
const p = new Person("Tom");
```

---

## 2. 访问修饰符

| 修饰符 | 可见范围 |
| --- | --- |
| `public` | 默认，哪都能访问 |
| `private` | 仅类内部（编译期约束，**不等于**运行时私有） |
| `protected` | 类内部 + 子类 |
| `readonly` | 只读，初始化后不可改 |

```ts
class Account {
  private balance = 0;
  readonly id = "A001";
  deposit(n: number): void {
    this.balance += n; // ✅ 内部可访问
  }
}
const a = new Account();
// a.balance; // ❌ private 外部不可访问
```

> 注意：TS 的 `private` 是**编译期**检查，运行时仍可访问（编译后是普通属性）。需要真运行时私有用 `#field`（JS 原生私有字段）。

---

## 3. 参数属性（简写）

构造函数里直接加修饰符，会自动声明并赋值成员，少写样板：

```ts
class User {
  constructor(
    public id: number,
    public name: string,
    private token: string,
  ) {}
}
const u = new User(1, "Tom", "x");
u.id;    // ✅
u.token; // ❌ private
```

等价于手写 `id: number; constructor(id) { this.id = id; }`，但更简洁。

---

## 4. 继承 extends 与 super

```ts
class Animal {
  constructor(public name: string) {}
  move(): void { console.log(`${this.name} 移动`); }
}
class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name); // 必须先调 super
  }
  bark(): void { console.log("汪"); }
}
```

子类构造函数**必须**先 `super()` 再访问 `this`。

---

## 5. 抽象类 abstract

抽象类不能实例化，用于定义骨架：

```ts
abstract class Shape {
  abstract area(): number; // 子类必须实现
  describe(): string {
    return `面积 ${this.area()}`;
  }
}
class Circle extends Shape {
  constructor(public r: number) { super(); }
  area(): number { return Math.PI * this.r ** 2; }
}
// new Shape(); // ❌ 抽象类不能 new
```

---

## 6. implements 实现接口

类可以"实现"接口，保证具备接口要求的成员：

```ts
interface Loggable {
  log(): void;
}
class Logger implements Loggable {
  log(): void { console.log("log"); }
}
```

`implements` 只做**结构检查**，不继承实现——接口里没有方法体。一个类可实现多个接口。

> 接口 vs 抽象类：接口**只约束形状**（多实现、无状态）；抽象类可**带实现与状态**（单继承）。

---

## 7. 存取器 getter / setter

```ts
class Temperature {
  private _c = 0;
  get celsius(): number { return this._c; }
  set celsius(v: number) {
    if (v < -273.15) throw new Error("低于绝对零度");
    this._c = v;
  }
  get fahrenheit(): number { return this._c * 9 / 5 + 32; }
}
```

getter/setter 让"看似属性访问"实则带校验逻辑，且只在 `target >= ES5` 时可用。

---

## 8. 静态成员

```ts
class MathUtil {
  static PI = 3.14159;
  static square(n: number): number { return n * n; }
}
MathUtil.square(3); // 不需要实例
```

---

## 小结

- 修饰符 `public/private/protected/readonly` 控制可见性与可变性（编译期）。
- 参数属性 `constructor(public x)` 一键声明+赋值。
- `extends` 继承，`super()` 必须先调用；`abstract` 定义骨架。
- `implements` 让类满足接口（多实现、无继承）；getter/setter 带逻辑的属性访问；`static` 类级成员。

---

## 练习

1. 写一个 `abstract class Vehicle { abstract wheels(): number }`，派生 `Car` 和 `Bike` 实现。
2. 用参数属性写一个 `class Point { constructor(public x, public y) }`，加 `distance()` 方法。
3. 用 `implements` 让一个 `class Cache` 满足 `interface Storage { get(k): string; set(k, v): void }`。
4. 给某属性加 setter 做范围校验（如年龄 0–150），越界抛错。
