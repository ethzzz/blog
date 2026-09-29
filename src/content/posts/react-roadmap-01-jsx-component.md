---
title: '01 · JSX 与组件模型'
published: 2026-09-29T23:00:00+08:00
description: 'JSX 不是模板语言而是 JS 的语法糖，理解它编译成 React.createElement 的本质；组件是函数、接收 props 返回 UI，单一职责与组合优于继承。'
tags: [React, JSX, 组件, 组合, createElement]
category: React学习路线
draft: false
---

## JSX 的本质

新人常把 JSX 当"HTML 模板"。其实它只是语法糖，编译后是普通 JS：

```jsx
// 你写的
const el = <h1 className="title">Hello</h1>;
// 编译后等价于
const el = React.createElement("h1", { className: "title" }, "Hello");
```

所以 JSX 里能写**任意 JS 表达式**（用 `{}` 包裹），它不是字符串也不是 HTML，是"描述 UI 的 JS 对象"。

---

## 组件就是函数

React 组件本质：**接收 `props`、返回 UI 描述的函数**。

```jsx
function Welcome({ name }) {
  return <p>你好，{name}</p>;
}
// 使用
<Welcome name="Tom" />
```

函数组件没有 `this`、没有生命周期（用 Hooks 代替），简单且易测。Class 组件已是非主流。

---

## 组合优于继承

React 不鼓励继承，而是用**组合（children / props 插槽）**复用结构：

```jsx
function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}
<Card title="统计"><Chart /></Card>
```

需要多种变体时，用 `children` 或把组件当 `prop` 传入，比继承灵活得多。

---

## 单一职责

一个组件只做一件事。当一个组件超过 ~150 行、props 超过 7 个，就该拆。拆出来的小组件更易复用和测试。

---

## 小结

- JSX 是 JS 语法糖，编译成 `createElement`，不是模板。
- 组件 = 接收 props 返回 UI 的函数，优先函数组件。
- 用组合（children/插槽）而非继承复用。
- 单一职责，过大就拆。

---

## 练习

1. 不用 JSX，用 `React.createElement` 手写一个 `<ul>` 含两个 `<li>` 的组件。
2. 写一个 `Modal` 组件，用 `children` 接收弹窗内容、`title` prop 接收标题。
3. 把一个"又长又多 props"的组件按单一职责拆成 3 个小组件。
