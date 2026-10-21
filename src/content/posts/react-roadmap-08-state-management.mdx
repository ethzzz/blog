---
title: '08 · 状态管理'
published: 2026-09-30T14:00:00+08:00
description: 'React 状态管理的分层选型：局部用 useState、跨层用 useContext、全局用 Zustand/Redux。讲清什么时候不该上状态库，以及 useReducer 在复杂状态机场景的价值。'
tags: [React, 状态管理, Redux, Zustand, useReducer]
category: React学习路线
draft: false
---

## 先问：真的需要状态库吗

我见过太多项目一上来 `npm i redux`，结果 90% 的状态都是局部 `useState` 能解决的。状态管理的代价是**额外的抽象和心智负担**，别为"可能以后要"提前引入。

分层决策：

| 范围 | 工具 | 理由 |
| --- | --- | --- |
| 单组件内 | `useState` | 最简单 |
| 跨多层组件 | `useContext` | 免 prop drilling |
| 多个不相关组件共享 | `useReducer` | 状态逻辑复杂、像状态机 |
| 真正全局（用户、主题、购物车） | `Zustand` / `Redux` | 跨路由、需可预测/可调试 |

---

## useReducer：复杂本地状态

当 state 有多个子值、多种变更动作时，`useReducer` 比一堆 `useState` 清晰：

```jsx
function reducer(state, action) {
  switch (action.type) {
    case "add": return { ...state, items: [...state.items, action.item] };
    case "remove": return { ...state, items: state.items.filter(i => i.id !== action.id) };
    default: return state;
  }
}
const [state, dispatch] = useReducer(reducer, { items: [] });
dispatch({ type: "add", item });
```

---

## 轻量全局：Zustand

```jsx
import { create } from "zustand";
const useStore = create(set => ({
  user: null,
  setUser: (u) => set({ user: u }),
}));
// 组件内
const user = useStore(s => s.user);
```

比 Redux 少一堆样板，按需订阅、无 Provider 包裹，中小型项目首选。

---

## Redux 何时值得

需要**时间旅行调试、严格可预测、中间件生态**（如 redux-saga 处理复杂异步）的大型应用才上。现代 Redux 用 `@reduxjs/toolkit` 已大幅减负，但样板仍多于 Zustand。

---

## 小结

- 默认 `useState`；跨层 `useContext`；复杂本地 `useReducer`；真全局才上库。
- Zustand 是轻量全局状态首选；Redux 留给需要强约束的大型应用。
- 别提前引入状态库——它带来的是复杂度，不是免费午餐。

---

## 练习

1. 把一个"多字段表单 + 多个 action"的 `useState` 堆砌改写成 `useReducer`。
2. 用 Zustand 建一个 `cart` store，实现添加/删除/计数。
3. 画一张决策图：什么时候用 useState / context / 状态库。
