---
title: '06 · 常用 Hooks'
published: 2026-09-30T12:00:00+08:00
description: 'useMemo 缓存计算结果、useCallback 缓存函数、useRef 持有可变引用且不触发重渲染、useContext 跨组件传值。讲清每个 Hook 的适用场景与误用代价。'
tags: [React, useMemo, useCallback, useRef, useContext]
category: React学习路线
draft: false
---

## useMemo：缓存昂贵计算

```jsx
const sorted = useMemo(() => bigList.sort(compare), [bigList]);
```

只有 `bigList` 变才重新排序，否则复用上次结果。适合**确实昂贵**的计算——别什么都包，记忆本身有成本。

---

## useCallback：缓存函数引用

```jsx
const handle = useCallback(() => doSomething(a), [a]);
```

返回稳定的函数引用，传给被 `React.memo` 包裹的子组件时，能避免因父组件重渲染生成新函数而导致子组件无谓重渲染。

> `useMemo`/`useCallback` 都要配合依赖数组；它们**不是**性能银弹，滥用反而慢。

---

## useRef：可变盒子

```jsx
const inputRef = useRef(null);
// 访问 DOM
<input ref={inputRef} />;
inputRef.current.focus();

// 或存跨渲染的可变值（不触发重渲染）
const timer = useRef();
```

与 state 区别：`ref.current` 改了**不会触发重渲染**，适合存 DOM 引用、定时器 ID、上一次的值。

---

## useContext：跨层传值

避免 props 层层透传（prop drilling）：

```jsx
const ThemeContext = createContext("light");
function App() {
  return <ThemeContext.Provider value="dark"><Toolbar /></ThemeContext.Provider>;
}
function Toolbar() {
  const theme = useContext(ThemeContext); // 直接拿到，不用一层层传
}
```

注意：context 值变化会让**所有消费组件重渲染**，拆分 context 或结合 `memo` 控制范围。

---

## 小结

- `useMemo` 缓存计算、`useCallback` 缓存函数，都按依赖、别滥用。
- `useRef` 存可变值/ DOM 引用，改动不触发渲染。
- `useContext` 解决 prop drilling，但变化会广播给所有消费者。

---

## 练习

1. 一个列表组件，用 `useMemo` 缓存"根据关键词过滤+排序"的结果。
2. 用 `useRef` 实现"组件挂载后自动聚焦输入框"。
3. 写一个 `ThemeContext`，在深层子组件里读取主题值，体会免透传。
