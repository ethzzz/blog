---
title: '06 · this 的四种绑定'
published: 2026-09-29T16:00:00+08:00
description: '彻底搞懂 JavaScript 中 this 的四种绑定规则：默认绑定、隐式绑定、显式绑定（call/apply/bind）、new 绑定，以及箭头函数不参与绑定、继承词法作用域的 this。'
tags: [JavaScript, this, call, apply, bind, 箭头函数]
category: JavaScript学习路线
draft: false
---

## this 不是"谁调用"这么简单

新人常以为 `this` 指向"调用它的对象"。错。规则有优先级，记住四条并按顺序判断就不会乱。

---

## 四条绑定规则（优先级从低到高）

**1. 默认绑定**：独立调用，非严格模式指向 `window`，严格模式 `undefined`。

```js
function foo() { console.log(this); }
foo(); // 严格模式 undefined，否则 window
```

**2. 隐式绑定**：作为对象方法调用，`this` 指向该对象。

```js
obj.foo(); // this === obj
```

⚠️ 隐患：把方法"抽出来"单独调用会丢失绑定（见下）。

**3. 显式绑定**：`call` / `apply` / `bind` 强行指定。

```js
foo.call(obj, arg1);          // 立即调用，this=obj
foo.apply(obj, [arg1, arg2]); // 同上，参数数组
const bar = foo.bind(obj);    // 返回新函数，this 永久绑定 obj
```

**4. new 绑定**：`new Foo()` 时，`this` 指向新创建的对象。

---

## 优先级

`new` > 显式(`bind`) > 隐式 > 默认。记忆口诀：**new 最先，bind 次之，隐式再次，默认垫底**。

---

## 箭头函数：没有 this

箭头函数**不绑定自己的 this**，而是继承外层词法作用域的 `this`：

```js
const obj = {
  name: "Tom",
  friends: ["A", "B"],
  say() {
    this.friends.forEach(() => console.log(this.name)); // this 继承 say() 的 this
  },
};
```

这解决了回调里 `this` 丢失的老大难问题——以前得用 `const self = this` 或 `bind`。

---

## 小结

- 判断 `this`：先看是不是箭头函数（继承外层）→ 再看 `new` → `call/apply/bind` → 隐式 → 默认。
- 方法被抽离赋值再调用会丢失隐式绑定，用 `bind` 或箭头函数解决。
- 箭头函数无 `this`，是回调场景的最佳选择。

---

## 练习

1. 预测 `obj.foo()` 与 `const f = obj.foo; f()` 的 `this` 差异并解释。
2. 用 `call` 实现一个 `sum` 的借用调用。
3. 把一段用 `const self = this` 的老代码改成箭头函数写法。
