---
title: '04 · 条件渲染与列表'
published: 2026-09-30T10:00:00+08:00
description: 'React 条件渲染的几种写法（&&、三目、early return），列表用 map 渲染，key 的作用与"为什么别用 index"，以及列表性能与稳定性的真相。'
tags: [React, 条件渲染, 列表, key, map]
category: React学习路线
draft: false
---

## 条件渲染

React 没有 `if` 模板指令，靠 JS 表达式：

```jsx
// 三目
{isLogin ? <UserPanel /> : <LoginForm />}
// && 短路（注意：0 / "" 也会被渲染！）
{unread > 0 && <Badge count={unread} />}
// 提前返回（组件顶部）
if (!data) return <Loading />;
```

⚠️ `&&` 陷阱：当左侧是 `0`、`""`、`NaN` 时，这些"假值"会被直接渲染出来（因为 React 渲染 0）。要显示数字计数时尤其小心，用三目或 `> 0 &&`。

---

## 列表用 map

```jsx
const list = ["a", "b", "c"];
<ul>
  {list.map(item => <li key={item}>{item}</li>)}
</ul>
```

---

## key 为什么重要

`key` 是 React **区分列表项身份**的标识。重渲染时，React 用 key 判断"哪个是旧的、哪个是新的"，从而复用 DOM、保持状态。

**别用 index 当 key**（列表增删/重排时身份错乱，导致输入框内容串位、状态错配）：

```jsx
// ❌ 删除中间项后，后面项的 index 全变，key 也变，状态跟着错位
list.map((item, i) => <li key={i}>{item}</li>);
// ✅ 用稳定唯一 id
list.map(item => <li key={item.id}>{item.text}</li>);
```

> 只有"静态、永不变顺序、永不增删"的列表才可用 index。

---

## 小结

- 条件渲染用 `&&` / 三目 / early return；`&&` 注意假值被渲染。
- 列表用 `map` 渲染，必须给每项稳定 `key`。
- `key` 用数据 id，别用 `index`（除非列表完全静态）。

---

## 练习

1. 写一个待办列表，删除某项后观察用 index 做 key 时复选框状态是否串位，再改成 id 验证修复。
2. 用 `&&` 渲染一个"未读消息数"徽标，故意让 `unread=0` 看渲染结果，改成安全写法。
3. 解释为什么 key 能帮 React 复用 DOM 而非重建。
