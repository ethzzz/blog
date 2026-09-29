---
title: '03 · 原型与原型链'
published: 2026-09-29T13:00:00+08:00
description: '理解 JavaScript 的基于原型的继承：prototype、__proto__、constructor 三者的关系，属性查找如何沿原型链向上，以及 new 操作符背后发生了什么。'
tags: [JavaScript, 原型链, prototype, 继承, new]
category: JavaScript学习路线
draft: false
---

## 第一次没搞懂"方法共享"

早年每个实例都拷贝一份方法，内存爆炸。后来知道 JS 用**原型**让所有实例共享方法：

```js
function Person(name) { this.name = name; }
Person.prototype.greet = function () { return `Hi, ${this.name}`; };

const p1 = new Person("Tom");
const p2 = new Person("Jane");
p1.greet === p2.greet; // true（方法在原型上，共享）
```

---

## 三个容易混的概念

- **`prototype`**：函数（构造函数）上的属性，指向"实例的原型对象"。
- **`__proto__`**（现代用 `Object.getPrototypeOf`）：实例内部指针，指向"创建它的构造函数的 `prototype`"。
- **`constructor`**：原型对象上的属性，指回构造函数本身。

关系：`p.__proto__ === Person.prototype`，`Person.prototype.constructor === Person`。

---

## 原型链：属性怎么找

访问 `p.greet` 时，JS 先查 `p` 自身，没有就沿 `p.__proto__`（即 `Person.prototype`）找，再没有继续向上到 `Object.prototype`，到 `null` 为止。这条链就是**原型链**。

```js
p.toString(); // p 自身没有 → Person.prototype 没有 → Object.prototype 有，调用它
```

> 原型链是 JS **实现继承的机制**：子类原型指向父类实例（或父类原型），就能"继承"其属性。

---

## new 操作符做了什么

```js
function myNew(Ctor, ...args) {
  const obj = Object.create(Ctor.prototype); // 1. 建空对象，原型指向 Ctor.prototype
  const result = Ctor.apply(obj, args);      // 2. this 绑定到 obj，执行构造函数
  return typeof result === "object" && result !== null ? result : obj; // 3. 返回对象
}
```

理解 `new` 的三步，就看懂了"为什么实例能访问原型方法"。

---

## 小结

- 实例方法放 `prototype` 上共享，省内存。
- `__proto__` 是实例到原型的链，`prototype` 是构造函数的原型属性。
- 属性查找沿原型链向上，到 `Object.prototype` → `null`。
- `class` 语法是原型继承的语法糖（下篇讲继承演进）。

---

## 练习

1. 不用 `class`，用构造函数 + 原型写一个 `Animal`，让其有共享方法 `eat()`。
2. 画出 `new Person("Tom")` 后 `p`、`p.__proto__`、`Person.prototype`、`Object.prototype` 之间的指向图。
3. 实现上面的 `myNew`，并用它创建对象验证原型链正确。
