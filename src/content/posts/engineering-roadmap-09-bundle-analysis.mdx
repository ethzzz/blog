---
title: '09 · 构建产物分析与优化'
published: 2026-09-31T11:00:00+08:00
description: '先量化再优化：用 bundle 分析工具定位体积大户，常见的优化手段（拆包、按需引入、压缩、资源优化、HTTP 缓存），以及"别盲目优化"的工程纪律。'
tags: [前端工程化, 性能优化, 打包分析, 体积, 按需引入]
category: 前端工程化学习路线
draft: false
---

## 优化第一步是测量

我曾花两天"优化"了一个本就不大的 bundle，纯属浪费。正确顺序：**分析 → 定位大头 → 优化 → 再测**。没数据别动手。

---

## 分析工具

- **webpack-bundle-analyzer** / **rollup-plugin-visualizer**：可视化每个模块占的体积，一眼看出谁是"体积刺客"（常是 moment、lodash 全量、某个大图标库）。
- 浏览器 DevTools → Network → 看资源大小与加载时间。

---

## 常见优化手段

**1. 按需引入，别全量 import**

```js
import _ from "lodash";        // ❌ 全量，拉进整个库
import debounce from "lodash/debounce"; // ✅ 只引要用的
// 或 ESM 版的 lodash-es 配合 tree-shaking
```

**2. 拆包 / 路由级懒加载**：首屏只加载必要代码（见 React 篇代码分割）。

**3. 压缩与 Tree-shaking**：`mode: production` 自动做；确认用 ESM 以启用摇树。

**4. 资源优化**：图片用现代格式（webp/avif）、压缩、用 CDN；字体子集化。

**5. 缓存策略**：`contenthash` 文件名 + 长缓存（`Cache-Control: immutable`），内容不变则命中缓存。

---

## 别盲目优化

- 先确认瓶颈在**体积**还是**网络**还是**运行时**（见浏览器与性能模块）。三者解法完全不同。
- 微优化（省几 KB）优先级低于"删掉一个误引的大依赖"（省几百 KB）。
- 移动端弱网下，首屏体积比桌面端敏感得多。

---

## 小结

- 优化前先量化，用可视化工具找体积大头。
- 最高杠杆：按需引入、拆包懒加载、删误引大依赖。
- 压缩 + tree-shaking + 长缓存组合拳。
- 先定位瓶颈类型（体积/网络/运行时），再对症下药。

---

## 练习

1. 用 `rollup-plugin-visualizer` 生成你项目 bundle 图，找出最大的三个模块。
2. 把一个 `import _ from "lodash"` 改成按需引入，对比体积变化。
3. 给静态资源配 `contenthash` 文件名，解释它如何让浏览器安全长缓存。
