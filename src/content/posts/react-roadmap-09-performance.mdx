---
title: '09 · 性能优化'
published: 2026-09-30T15:00:00+08:00
description: 'React 性能优化原则：先测量再优化。React.memo / useMemo / useCallback 的适用边界，长列表用虚拟列表，代码分割与懒加载（React.lazy + Suspense），以及常见反模式。'
tags: [React, 性能优化, memo, 虚拟列表, 代码分割]
category: React学习路线
draft: false
---

## 第一条铁律：先测量

别凭直觉优化。用 React DevTools 的 Profiler 看**哪些组件渲染耗时、为何重渲染**。大多数"卡"其实不在你以为的地方。

---

## memo / useMemo / useCallback

- **`React.memo`**：props 没变就跳过重渲染（浅比较）。适合"纯展示、频繁父级重渲染"的组件。
- **`useMemo`**：缓存昂贵计算。
- **`useCallback`**：缓存函数引用，配 `memo` 子组件避免无谓重渲染。

反模式：给每个组件都包 `memo`、每个函数都 `useCallback`——比较本身有成本，滥用反而慢。

```jsx
const Item = React.memo(function Item({ data }) {
  return <li>{data.name}</li>;
});
```

---

## 长列表：虚拟列表

渲染 10000 行 DOM 必卡。虚拟列表（react-window / react-virtuoso）只渲染可视区域：

```jsx
import { FixedSizeList } from "react-window";
<FixedSizeList height={400} itemCount={10000} itemSize={40}>
  {({ index, style }) => <div style={style}>{items[index]}</div>}
</FixedSizeList>;
```

---

## 代码分割与懒加载

路由级懒加载，首屏只加载必要代码：

```jsx
const Settings = React.lazy(() => import("./Settings"));
<Suspense fallback={<Spinner />}>
  <Settings />
</Suspense>
```

配合打包器的动态 `import()`，自动拆包，首屏体积大幅下降。

---

## 小结

- 优化前先用 Profiler 测，别猜。
- `memo/useMemo/useCallback` 按场景用，滥用有反效果。
- 长列表用虚拟列表；首屏用代码分割 + 懒加载。
- 性能是"度量→定位→优化→再度量"的循环。

---

## 练习

1. 故意让父组件频繁重渲染，观察未 memo 的子组件也跟着渲染，再包 `memo` 对比。
2. 用一个大数据数组（1万项）渲染列表，体验卡顿，再换成 react-window 虚拟列表。
3. 把某个路由组件改成 `React.lazy` 懒加载，观察网络请求是否拆出独立 chunk。
