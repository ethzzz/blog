---
title: '04 · 继承的演进：从原型继承到 class'
published: 2026-09-29T14:00:00+08:00
description: '梳理 JavaScript 继承写法的演进：原型链继承、构造函数继承、组合继承，到 ES6 class 与 extends。理解 class 只是原型继承的语法糖，以及 super 的执行顺序。'
tags: [JavaScript, 继承, class, extends, super]
category: JavaScript学习路线
draft: false
---

## 为什么继承这么绕

JS 没有"类"的概念（ES6 之前），继承全靠原型链模拟。于是出现了各种"组合拳"写法，每种都有坑。理解它们，才知道 `class` 帮我们省了多少事。

---

## 经典写法回顾

**原型链继承**：子类原型 = 父类实例。缺点：所有子类实例共享父类引用属性。

```js
Child.prototype = new Parent(); // 共享 parent 的引用属性，易串数据
```

**构造函数继承**：在子类里 `Parent.call(this)`。缺点：只继承实例属性，拿不到原型方法。

**组合继承**：两者结合，最常用但父类构造函数被调用两次。

---

## ES6 class：语法糖

```js
class Animal {
  constructor(name) { this.name = name; }
  eat() { console.log(`${this.name} 吃东西`); }
}
class Dog extends Animal {
  constructor(name, breed) {
    super(name);      // 必须先调用 super，才能用 this
    this.breed = breed;
  }
  bark() { console.log("汪"); }
}
```

`extends` 本质是：**`Dog.prototype.__proto__ = Animal.prototype`**，原型链接上，继承就成立了。`class` 没有新机制，只是把"组合继承"封装得好看。

---

## super 的顺序坑

子类构造函数**必须**先 `super()` 再访问 `this`，否则 `ReferenceError`：

```js
constructor(name) {
  this.name = name; // ❌ 在 super 前用 this
  super(name);
}
```

因为 `super()` 负责初始化 `this`（调用父类构造函数），之前 `this` 还没诞生。

---

## 小结

- 早期继承靠原型链模拟，写法多且有缺陷。
- `class` / `extends` 是原型继承的语法糖，理解原型链才不会被"黑魔法"吓到。
- `super()` 必须在子类构造函数最前调用。
- 优先用 `class`，legacy 代码才需要看懂老式继承。

---

## 练习

1. 用 `class` 写 `Shape` 抽象基类与 `Circle`/`Rect` 子类，实现 `area()`。
2. 不用 `class`，用组合继承实现上面同样的结构，体会差异。
3. 故意在 `super()` 前访问 `this`，观察报错信息。
