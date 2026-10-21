---
title: '01 · 渲染流水线'
published: 2026-09-31T15:00:00+08:00
description: '从输入 URL 到像素上屏：解析 HTML 建 DOM、CSSOM，合成渲染树，Layout 布局、Paint 绘制、Composite 合成。理解每个阶段的开销，才知道优化该压哪一环。'
tags: [浏览器, 渲染流水线, DOM, CSSOM, 合成]
category: 浏览器与性能学习路线
draft: false
---

## 一段"看不见"的旅程

你写 `index.html` + `style.css`，浏览器要把它变成屏幕上的像素，经历一条**渲染流水线**。每一步都有成本，瓶颈常在某一环。

---

## 流水线五阶段

1. **解析 HTML → DOM**：字节流按标签解析成 DOM 树。JS 会阻塞解析（见下）。
2. **解析 CSS → CSSOM**：样式规则构造成 CSSOM 树。
3. **合成 Render Tree（渲染树）**：合并 DOM 与 CSSOM，**只含可见节点**（`<head>`、`:display:none` 的都不进）。
4. **Layout（布局/重排）**：计算每个节点的几何位置与尺寸。最贵的一步之一。
5. **Paint（绘制）**：把每个节点画成像素，生成绘制记录。
6. **Composite（合成）**：把各层合并，提交 GPU 上屏。

```
HTML ─┐
      ├─▶ DOM + CSSOM ─▶ Render Tree ─▶ Layout ─▶ Paint ─▶ Composite ─▶ 屏幕
CSS  ─┘
```

---

## 关键认知

- **JS 阻塞解析**：`<script>` 默认会暂停 HTML 解析去执行，放底部或用 `defer`/`async` 避免。
- **CSS 阻塞渲染**：CSSOM 没建好，渲染树没法合成，所以 CSS 要尽早加载。
- **Layout 是重活**：改了几何属性（宽高、位置）触发 Layout，连锁影响后续 Paint/Composite。
- **合成层走 GPU**：某些属性（transform/opacity）可单独合成，不触发 Layout/Paint，最快。

---

## 小结

- 渲染流水线：DOM+CSSOM → 渲染树 → Layout → Paint → Composite。
- JS 阻塞解析、CSS 阻塞渲染，二者都要早加载/异步化。
- Layout 最贵；transform/opacity 走合成层最快。
- 优化要先判断瓶颈在 Layout / Paint / Composite 哪一步。

---

## 练习

1. 在 DevTools Performance 面板录制一次页面加载，对照各阶段耗时。
2. 把脚本从 `<head>` 移到 `<body>` 末尾，对比渲染开始时间。
3. 解释为什么 CSS 没加载完，页面会白屏而非显示无样式内容。
