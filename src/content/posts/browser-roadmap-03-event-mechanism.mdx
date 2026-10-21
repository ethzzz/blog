---
title: '03 · 事件机制'
published: 2026-09-31T17:00:00+08:00
description: 'DOM 事件的捕获与冒泡三阶段模型，addEventListener 的第三个参数（capture/once/passive），事件委托的原理与性能价值，以及 passive  listener 解决滚动卡顿。'
tags: [浏览器, 事件, 冒泡, 事件委托, passive]
category: 浏览器与性能学习路线
draft: false
---

## 一次点击走了三步

点击一个按钮，事件不是直接打到它，而是沿 DOM 树**三阶段**传播：

1. **捕获阶段**：从 `window` 向下到目标父级。
2. **目标阶段**：到达被点的元素。
3. **冒泡阶段**：从目标向上回到 `window`。

```js
el.addEventListener("click", handler, true);  // true=捕获阶段触发
el.addEventListener("click", handler);        // 默认冒泡阶段触发
```

---

## 事件委托：一个监听管一片

给 1000 个 `<li>` 各绑监听既费内存又难维护。利用冒泡，在**父容器**上绑一个，靠 `event.target` 判断谁被点：

```js
list.addEventListener("click", e => {
  const li = e.target.closest("li");
  if (li) handle(li);
});
```

好处：动态增删子项无需重新绑事件，性能与可维护性双赢。这是 React 事件系统底层思路的来源之一。

---

## addEventListener 的进阶选项

```js
el.addEventListener("scroll", onScroll, { passive: true }); // 告诉浏览器我不会 preventDefault
el.addEventListener("click", once, { once: true });          // 只触发一次后自动解绑
```

**`passive: true` 关键**：移动端 `touchmove`/`wheel` 监听若调用 `preventDefault` 会阻塞滚动。标记为 passive 后浏览器可放心异步滚动，消除卡顿（Chrome 对部分事件已默认 passive）。

---

## 止损与注意

- 委托时记得判断 `target` 是否真是你想要的元素（`closest` 兜底）。
- 组件卸载要 `removeEventListener` 解绑，否则内存泄漏。React 的 `useEffect` 清理函数就是干这个。
- 阻止冒泡用 `e.stopPropagation()`，但别滥用——会打断上层逻辑（如全局点击关闭弹窗）。

---

## 小结

- 事件三阶段：捕获 → 目标 → 冒泡。
- 事件委托靠冒泡 + `closest`，一个监听管全部子项。
- `passive` 让滚动事件不阻塞；`once` 自动解绑。
- 卸载时解绑监听，防止内存泄漏。

---

## 练习

1. 在父容器上用事件委托处理动态列表点击，对比"每项是绑"的内存差异。
2. 给 `wheel` 监听加 `passive: true`，用 Performance 看滚动是否仍流畅。
3. 在捕获阶段和冒泡阶段各绑一个监听，点击目标元素，观察打印顺序。
