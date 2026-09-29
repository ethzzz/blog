---
title: '05 · Hooks 基础（useState / useEffect）'
published: 2026-09-30T11:00:00+08:00
description: 'Hooks 让函数组件拥有状态与副作用。useState 的用法与惰性初始化，useEffect 的执行时机与依赖数组，清理函数避免内存泄漏，以及"依赖数组"最容易踩的坑。'
tags: [React, Hooks, useState, useEffect, 依赖数组]
category: React学习路线
draft: false
---

## 为什么有 Hooks

以前状态/生命周期只在 class 组件有，函数组件只是"纯渲染"。Hooks（React 16.8）让函数组件也能用状态和副作用，且逻辑可抽成自定义 Hook 复用——这是现代 React 的分水岭。

---

## useState

```jsx
const [count, setCount] = useState(0);
// 惰性初始化（只在首次执行，避免每次渲染都算）
const [user, setUser] = useState(() => loadUser());
```

更新函数式写法（依赖上一次值）：`setCount(c => c + 1)`，避免闭包拿到旧值。

---

## useEffect：处理副作用

副作用 = 渲染之外的操作：请求数据、订阅、操作 DOM、定时器。

```jsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id); // 清理函数，组件卸载/重跑前执行
}, [dep]); // 依赖数组
```

**执行时机取决于依赖数组**：
- `[]`：仅挂载时跑一次。
- `[dep]`：挂载 + `dep` 变化后跑。
- 不写：每次渲染都跑（几乎总是不对的）。

**清理函数**防止内存泄漏（定时器、订阅未取消）。

---

## 依赖数组的坑

最常见 bug：effect 里用了某个变量却没放进依赖，导致用的是旧值。

```jsx
useEffect(() => {
  fetchData(userId); // 若 userId 变化却没进依赖，不会重新请求
}, []); // ❌ 缺 userId
```

ESLint 的 `exhaustive-deps` 规则就是为此——听它的。如果确实只想跑一次，把变量写进依赖；若逻辑需要"只跑一次"，用 `ref` 或 `useRef` 缓存。

---

## 小结

- `useState` 管理状态，函数式更新避免旧值；`useState(() => ...)` 惰性初始化。
- `useEffect` 管副作用，依赖数组控制时机，清理函数防泄漏。
- 依赖数组写全所用的外部变量，`eslint exhaustive-deps` 当真听。

---

## 练习

1. 写一个每秒自增的时钟组件，用 `useEffect` 设 `setInterval` 并在清理函数里 `clearInterval`。
2. 故意把 `userId` 依赖漏掉，观察改 userId 后数据不刷新，补上后修复。
3. 解释 `useState(() => heavy())` 与 `useState(heavy())` 的区别（后者每次渲染都执行 heavy）。
