---
title: '02 · 重排、重绘与合成层'
published: 2026-09-31T16:00:00+08:00
description: '区分 Reflow（重排/布局）、Repaint（重绘）、Composite（合成）三者的代价差异；哪些属性触发哪种；用 transform/opacity 走 GPU 合成层避开昂贵的重排重绘；will-change 的正确用法。'
tags: [浏览器, 重排, 重绘, 合成层, will-change]
category: 浏览器与性能学习路线
draft: false
---

## 三个词的代价天差地别

| 操作 | 触发 | 代价 |
| --- | --- | --- |
| **Reflow 重排** | 改几何（宽高/位置/字号） | 最高：重算布局 + 重绘 + 合成 |
| **Repaint 重绘** | 改外观（颜色/背景）不涉及布局 | 中：重绘 + 合成 |
| **Composite 合成** | 改 `transform`/`opacity` | 最低：仅 GPU 合成层变换 |

> 口诀：**能合成就别重绘，能重绘就别重排**。

---

## 触发对比

```css
.el { width: 100px; }      /* 改 width → Reflow（连锁 Repaint+Composite） */
.el { color: red; }        /* 改 color → Repaint */
.el { transform: translateX(10px); } /* 走合成层，仅 Composite */
```

动画用 `transform`/`opacity` 而非 `left`/`top`/`width`，因为前者只动合成层，丝滑且不阻塞主线程。

---

## 合成层（Compositing Layer）

浏览器把某些元素提升为独立图层，由 GPU 单独处理。常见触发：3D transform、`<video>`、`<canvas>`、`will-change: transform`、fixed 定位等。

```css
.card { will-change: transform; } /* 提前提示浏览器为该元素建合成层 */
```

> ⚠️ `will-change` 别滥用：每个合成层占内存，建太多反而卡。用在有持续动画的元素上，动画结束移除。

---

## 实战注意

- **批量改样式**：连续改多次几何属性会触发多次重排。读 `offsetWidth` 再写样式会强制同步布局（强制重排），循环中尤其要避免"读写读写"交替。
- **脱离文档流再改**：对要大幅变化的节点，先 `display:none`（改完再恢复）可把重排限制在子树。

---

## 小结

- Reflow > Repaint > Composite 的代价递增方向反着记：Composite 最便宜。
- 动画优先 transform/opacity，避开重排重绘。
- `will-change` 提示建层但别滥用，吃内存。
- 避免循环里"读写交替"触发强制同步布局。

---

## 练习

1. 用 DevTools Performance 录制：一个 `left` 动画 vs 一个 `transform` 动画，对比主线程占用。
2. 写一个循环，交替读 `offsetHeight` 写样式，观察为何变慢；改成批量写后对比。
3. 给一个持续动画元素加 `will-change: transform`，在 Layer 面板看是否生成独立层。
