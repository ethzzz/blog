---
title: '09 · 运行时性能'
published: 2026-09-31T23:00:00+08:00
description: '页面"加载完但用着卡"的运行时优化：长任务与主线程阻塞、用 Performance 面板定位、避免频繁重排、虚拟列表、requestAnimationFrame 与节流防抖，让交互始终流畅。'
tags: [浏览器, 运行时性能, 长任务, 主线程, 节流防抖]
category: 浏览器与性能学习路线
draft: false
---

## 卡顿的根源：主线程被占满

浏览器的**主线程**负责 JS 执行、样式计算、布局、绘制编排。一旦一段 JS 跑了太久（>50ms），主线程被独占，用户点击/滚动无响应——这就是"长任务"。INP 指标直接反映这个体验。

---

## 用 Performance 面板定位

录制一次交互，看火焰图：哪段脚本占了长条？是否出现"Long Task"红色标记？聚焦最贵的函数，别瞎优化。

---

## 常见运行时杀手与对策

**1. 频繁重排**：循环里"读写交替"触发强制同步布局。批量读写、用 `requestAnimationFrame` 把视觉更新集中到下一帧。

```js
// 节流：高频事件（scroll/resize）限制执行频率
function throttle(fn, wait) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= wait) { last = now; fn(...args); }
  };
}
window.addEventListener("scroll", throttle(onScroll, 100));
```

**2. 大列表渲染**：1 万行 DOM 必卡 → 虚拟列表（见 React 性能篇）。

**3. 大量 DOM 操作**：用文档片段（DocumentFragment）或先 `display:none` 改完再显示，减少重排次数。

**4. 复杂计算**：移到 Web Worker（下篇），不占主线程。

---

## rAF 与防抖节流

- **requestAnimationFrame**：把动画/视觉更新对齐浏览器刷新节奏（~16ms/帧），避免掉帧。
- **debounce**：停止触发 N 毫秒后才执行（搜索输入，等用户停下来再请求）。
- **throttle**：固定间隔最多执行一次（滚动处理，限频）。

---

## 小结

- 卡顿 = 长任务占满主线程；用 Performance 面板定位最贵函数。
- 避免循环读写交替、大列表全量渲染、无节制的 DOM 操作。
- 防抖/节流控频率；rAF 对齐帧；重计算进 Worker。

---

## 练习

1. 用 Performance 录制一个卡顿交互，找出最长的 Long Task 并定位函数。
2. 写一个高频 `input` 搜索，用 debounce 避免每次按键都发请求。
3. 把一段"循环里反复改 style 触发重排"的代码改成 rAF 批量更新。
