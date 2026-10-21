---
title: '前端性能优化面试题（中高级核心考点）'
published: 2026-09-16T17:00:00+08:00
description: '讲解核心指标 LCP/INP/CLS、加载优化、渲染优化、内存泄漏排查、Performance API 监控与真实优化案例。'
tags: [前端面试, 性能优化, LCP, 白屏时间, 内存泄漏]
category: 前端面试宝典
draft: false
---

> [!NOTE]
> 本文包含 20+ 道性能优化面试题，这是中高级岗位**最能拉开差距**的模块，难度标注：⭐ 基础 · ⭐⭐ 进阶 · ⭐⭐⭐ 高级 · 🔥 高频必考

---

## 指标体系

### Q1: 有哪些常见的性能指标？⭐ 🔥

**答：**

| 指标 | 全称 | 含义 | 优秀标准 |
|:--|:--|:--|:--|
| FCP | First Contentful Paint | 首次内容绘制 | < 1.8s |
| **LCP** | Largest Contentful Paint | 最大内容绘制（加载体验） | < 2.5s |
| **INP** | Interaction to Next Paint | 交互到下一帧绘制（2024 取代 FID） | < 200ms |
| **CLS** | Cumulative Layout Shift | 累计布局偏移（视觉稳定性） | < 0.1 |
| TTFB | Time To First Byte | 首字节时间（服务端响应） | < 800ms |
| FP | First Paint | 首次绘制（可能只是背景色） | - |
| 白屏时间 | - | 用户看到第一个像素前的时间 | - |

**Core Web Vitals（核心 Web 指标）= LCP + INP + CLS**，Google 搜索排名因素。

```javascript
// FID 为什么被 INP 取代？
// FID 只测量"第一次交互的输入延迟"，忽略处理耗时和绘制耗时
// INP 测量页面整个生命周期内所有交互的响应性，取最差值（P98）
// INP = 输入延迟 + 处理时间 + 渲染延迟（全部计入）
```

### Q2: 如何测量这些指标？⭐⭐

```javascript
// 1. Performance API（LCP 示例）
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP:', lastEntry.startTime);
}).observe({ type: 'largest-contentful-paint', buffered: true });

// 2. CLS
let clsScore = 0;
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) clsScore += entry.value;
  }
}).observe({ type: 'layout-shift', buffered: true });

// 3. web-vitals 库（Google 官方，一行搞定）
import { onLCP, onINP, onCLS } from 'web-vitals';
onLCP(console.log);
onINP(console.log);
onCLS(console.log);

// 4. 工具：Lighthouse（实验室数据）、Chrome DevTools Performance 面板、
//    线上 RUM（真实用户监控，上报到自建平台）
// 实验室数据（Lab）：Lighthouse，可复现但非真实用户
// 真实用户数据（Field/RUM）： CrUX、自建上报，反映真实体验
```

---

## 加载性能优化

### Q3: 从输入 URL 到页面展示，有哪些优化点？⭐⭐⭐ 🔥

**答：** 这是一道"串联所有知识"的大题，按阶段答：

```
输入 URL → DNS → TCP/TLS → HTTP 请求 → 服务器处理 → 响应 → 解析渲染

各阶段优化手段：
┌─────────────┬──────────────────────────────────────┐
│ DNS         │ dns-prefetch 预解析                   │
│ TCP/TLS     │ preconnect 预连接、TLS1.3、HTTP/2     │
│ HTTP 请求   │ CDN、缓存（强缓存/协商缓存）、         │
│             │ Gzip/Brotli、减少请求数（合并/雪碧图） │
│ 服务器      │ SSR、接口聚合（BFF）、数据库优化       │
│ 资源体积    │ 压缩、Tree Shaking、代码分割、         │
│             │ 图片 WebP/AVIF、按需加载              │
│ 解析渲染    │ defer/async、关键 CSS 内联、           │
│             │ 减少重排重绘、GPU 加速                │
└─────────────┴──────────────────────────────────────┘
```

```html
<!-- 资源提示（Resource Hints）-->
<link rel="dns-prefetch" href="//api.example.com">
<link rel="preconnect" href="//cdn.example.com" crossorigin>
<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
<link rel="prefetch" href="/next-page.js">  <!-- 空闲时预取下一页 -->
```

### Q4: script 标签的 defer 和 async 区别？⭐ 🔥

```html
<script src="a.js"></script>          <!-- 同步：阻塞解析，顺序执行 -->
<script src="b.js" async></script>    <!-- 异步下载，下载完立即执行（打断解析，顺序不定）-->
<script src="c.js" defer></script>    <!-- 异步下载，HTML 解析完后按顺序执行 -->

/*
时间线对比：
普通:   解析──停─下载─执行─解析──停─下载─执行─解析
async:  解析────解析────解析（下载完就插队执行）
defer:  解析────解析────解析│DOMContentLoaded前统一执行

使用建议：
- 无依赖的统计脚本 → async
- 有依赖顺序的业务脚本 → defer
- 都不加 → 阻塞渲染，尽量避免
*/
```

### Q5: 代码分割（Code Splitting）怎么做？⭐⭐ 🔥

```javascript
// 1. 路由懒加载（收益最大，首屏只加载当前路由）
// Vue Router
const routes = [
  { path: '/detail', component: () => import('./Detail.vue') },
];
// React Router
const Detail = React.lazy(() => import('./Detail'));

// 2. 组件级懒加载（重型组件：编辑器、图表库）
const Editor = defineAsyncComponent(() => import('./Editor.vue'));

// 3. 第三方库拆分（Vite manualChunks）
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vue: ['vue', 'vue-router', 'pinia'],
        echarts: ['echarts'],      // 大库独立 chunk，可长期缓存
      },
    },
  },
}

// 4. 条件加载（按环境/权限）
if (needExport) {
  const { exportToExcel } = await import('./excel-utils');
}

// 分割原则：
// - 首屏必需 → 主包；非首屏 → 懒加载
// - 体积大、更新少的库 → 独立 chunk（利用缓存）
// - 过度分割反而增加请求数，HTTP/2 下控制在合理范围
```

### Q6: 图片优化有哪些手段？⭐ 🔥

```html
<!-- 1. 现代格式：WebP（体积约为 JPEG 的 1/3）、AVIF -->
<picture>
  <source srcset="img.avif" type="image/avif">
  <source srcset="img.webp" type="image/webp">
  <img src="img.jpg" alt="desc">
</picture>

<!-- 2. 响应式图片：按屏幕加载合适尺寸 -->
<img srcset="img-480.jpg 480w, img-800.jpg 800w"
     sizes="(max-width: 600px) 480px, 800px"
     src="img-800.jpg" alt="desc">

<!-- 3. 原生懒加载 -->
<img src="img.jpg" loading="lazy" alt="desc">

<!-- 4. LCP 图片反而要 preload + fetchpriority -->
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high">
<img src="/hero.webp" fetchpriority="high" alt="hero">

<!-- 5. 占位防抖动（配合 CLS）：必须写宽高 -->
<img src="img.jpg" width="800" height="450" alt="desc">
```

```javascript
// 6. 虚拟滚动场景：IntersectionObserver 手动懒加载
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const img = e.target;
      img.src = img.dataset.src;   // data-src 存真实地址
      observer.unobserve(img);
    }
  });
});
document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));

// 7. 构建层：vite-plugin-imagemin 压缩、雪碧图（SVG symbol）
// 8. CDN：URL 参数动态裁剪缩放（?x-oss-process=image/resize,w_400）
```

### Q7: 首屏白屏时间怎么优化？⭐⭐⭐ 🔥

```
白屏时间构成：DNS + TCP + TTFB + HTML下载 + CSS/JS下载解析

优化手段（按投入产出比排序）：

1. 静态资源上 CDN（TTFB 大幅下降）
2. 开启 Gzip/Brotli（体积降 60-80%）
3. 强缓存 + 文件 hash（二次访问秒开）
4. 路由懒加载 + 分包（减小首屏 JS）
5. 骨架屏 / Loading（体验兜底，非真优化）
6. SSR / SSG（HTML 直出，FCP 最快）
   - SSG：构建时生成（博客、官网）
   - SSR：请求时渲染（个性化内容）
   - 流式 SSR / 岛屿架构：更快 TTFB + 局部 hydration
7. 预渲染（prerender）：SSG 的轻量替代
8. 关键 CSS 内联到 <head>，非关键 CSS 异步加载
9. 接口预请求：HTML 内联 script 提前发起首屏接口，
   与 JS 下载并行，省掉串行等待
10. 客户端缓存首屏数据（localStorage），
    先渲染缓存再静默刷新（SWR 模式）
```

---

## 渲染性能优化

### Q8: 浏览器渲染流程？哪里会阻塞？⭐⭐ 🔥

```
HTML → DOM 树
              ↘
               Render 树 → Layout（布局）→ Paint（绘制）→ Composite（合成）
              ↗
CSS  → CSSOM

阻塞点：
1. CSS 阻塞渲染：CSSOM 构建完才能合成 Render 树
2. CSS 间接阻塞 JS：JS 执行前要等前面的 CSS 下载完
3. JS 阻塞解析：同步 script 会暂停 HTML 解析
4. Layout 抖动：JS 频繁读写几何属性触发强制同步布局
```

### Q9: 重排和重绘？如何减少？⭐⭐ 🔥

```javascript
// 重排（Reflow/Layout）：几何变化 → 重新计算布局（贵）
// 重绘（Repaint）：外观变化不影响布局（较贵）
// 合成（Composite）：仅 transform/opacity → GPU 处理（最便宜）
// 关系：重排必重绘，重绘不一定重排

// 触发重排的操作：
// - 改变窗口大小、字体
// - 增删 DOM、元素位置/尺寸变化
// - 读取几何属性（offsetTop/clientWidth/getComputedStyle）
//   ← 高频坑！读取会强制刷新布局队列（强制同步布局）

// ❌ 布局抖动（Layout Thrashing）
for (let i = 0; i < 1000; i++) {
  const el = document.getElementById(`item-${i}`);
  el.style.width = el.offsetWidth + 10 + 'px';  // 读写交替，1000 次强制布局
}

// ✅ 读写分离：先批量读，再批量写
const widths = els.map(el => el.offsetWidth);   // 集中读
els.forEach((el, i) => el.style.width = widths[i] + 10 + 'px');  // 集中写

// ✅ requestAnimationFrame 分批写
function batchUpdate() {
  els.forEach(el => el.style.transform = 'translateX(10px)');
}
requestAnimationFrame(batchUpdate);

// 其他手段：
// - transform/opacity 代替 top/left（走合成层，不重排）
// - will-change: transform 提升合成层（慎用，层爆炸）
// - 绝对定位让动画元素脱离文档流
// - display: none 批量修改后一次显示
// - DocumentFragment 批量 DOM 操作
```

### Q10: 长列表（10 万条数据）如何渲染？⭐⭐⭐ 🔥

```
虚拟列表（Virtual List）核心思想：
只渲染可视区域 + 上下缓冲区的 DOM（约 20-30 个），
滚动时动态替换内容和位置。

┌─────────────┐ ← 外层容器（撑开总高度：10万 × 行高）
│  (占位)      │ ← transform: translateY(偏移)
│ ┌─────────┐ │
│ │ 可视区   │ │ ← 只渲染这一屏的条目
│ │ item 51 │ │
│ │ item 52 │ │
│ │ ...     │ │
│ └─────────┘ │
│  (占位)      │
└─────────────┘

核心计算：
startIndex = Math.floor(scrollTop / itemHeight)
endIndex = startIndex + Math.ceil(viewportHeight / itemHeight)
visibleData = list.slice(startIndex - buffer, endIndex + buffer)
offsetY = startIndex * itemHeight
```

```javascript
// 简易实现（固定行高）
function VirtualList({ container, itemHeight, total, renderItem }) {
  const viewportH = container.clientHeight;
  const visibleCount = Math.ceil(viewportH / itemHeight);
  const buffer = 5;

  container.addEventListener('scroll', () => {
    const scrollTop = container.scrollTop;
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const end = Math.min(total, start + visibleCount + buffer * 2);

    // 只更新可视数据 + 偏移
    renderItems(start, end);
    content.style.transform = `translateY(${start * itemHeight}px)`;
  });
}
// 现成方案：vue-virtual-scroller、react-window、react-virtuoso
// 不定高场景：预估高度 + 渲染后实测缓存高度（react-virtuoso 内置）
```

### Q11: 防抖和节流在性能优化中的应用？⭐ 🔥

```javascript
// 防抖（debounce）：停止触发 n 秒后才执行（结果导向）
// 场景：搜索联想、窗口 resize 后重算、表单校验
function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 节流（throttle）：每 n 秒最多执行一次（频率导向）
// 场景：scroll 滚动加载、mousemove、射击游戏
function throttle(fn, interval = 200) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, args);
    }
  };
}

// 选择口诀：
// 只关心最终结果 → 防抖（搜索框）
// 需要持续响应但要限频 → 节流（滚动条）
```

---

## 内存与运行时

### Q12: 前端内存泄漏的常见原因？如何排查？⭐⭐⭐ 🔥

```javascript
// 常见原因：
// 1. 意外的全局变量
function leak() { data = 'huge string'; }  // 忘写 let/var → 挂到 window

// 2. 未清理的定时器
setInterval(() => { /* 引用了组件数据 */ }, 1000);  // 组件销毁未 clearInterval

// 3. 未解绑的事件监听
element.addEventListener('click', handler);  // 组件卸载未 removeEventListener

// 4. 闭包引用
function outer() {
  const huge = new Array(1e6).fill('x');
  return function inner() { /* 只用了 huge.length，但整个 huge 被引用 */ };
}

// 5. 游离 DOM（detached DOM）
// JS 变量还引用着已从文档移除的节点

// 6. console.log 引用对象（开发环境）

// 7. 第三方库实例未销毁（echarts 实例、地图实例）
```

```
排查流程（Chrome DevTools）：

1. Performance 面板：录制操作，看 JS Heap 是否只增不减（锯齿应该回落）
2. Memory 面板 → Heap Snapshot：
   - 操作前拍一次 → 操作后拍一次 → Comparison 视图对比
   - 按 Retained Size 排序，找 Detached / 可疑构造器
3. Allocation instrumentation on timeline：实时看内存分配，
   蓝色柱（存活）持续增长即泄漏点
4. 常见修复：
   - Vue：onUnmounted 里清理定时器/监听/实例
   - React：useEffect 返回清理函数
   - WeakMap/WeakSet 存"附属数据"，键被回收时自动释放
```

### Q13: 如何优化包体积？⭐⭐ 🔥

```
分析工具先行：
- rollup-plugin-visualizer / webpack-bundle-analyzer
- 打包产物看：du -sh dist/_astro/* | sort -h

优化清单：
1. Tree Shaking：ESM 导入 + sideEffects: false
   （lodash → lodash-es，import { debounce } 而非 import _）
2. 按需引入组件库：Element Plus / Ant Design 自动按需插件
3. 大依赖替换：moment(300KB+) → dayjs(7KB)
   axios → fetch 封装；完整 echarts → 按需注册组件
4. 图片/字体：WebP、字体子集化（fontmin，中文字体必做）
5. Gzip/Brotli：构建时预压缩（vite-plugin-compression）
   或交给 Nginx 动态压缩
6. 代码分割 + 懒加载（见 Q5）
7. 检查重复依赖：npm ls lodash，多版本共存要 dedupe
8. 移除 sourcemap 生产配置或改为 hidden-source-map

量化表达（面试加分）：
"主包从 2.1MB 降到 480KB，首屏 JS 传输体积下降 77%"
```

---

## 监控与实战

### Q14: 如何做线上性能监控（RUM）？⭐⭐⭐

```javascript
// 自建监控的采集内容：
// 1. 指标采集：web-vitals 库 → LCP/INP/CLS/TTFB/FCP
// 2. 资源加载：PerformanceObserver 监听 resource，
//    采集慢资源（duration > 阈值）
// 3. 接口耗时：拦截 fetch/XHR 记录 duration 和状态码
// 4. 长任务：PerformanceObserver 监听 longtask（>50ms）
// 5. 错误：window.onerror + unhandledrejection

// 上报策略（关键，防止监控本身拖慢页面）：
// - navigator.sendBeacon：页面卸载也能发，不阻塞
// - 批量合并 + 节流上报（每 10s 或 20 条）
// - 采样率控制（大流量站点 10%）
// - requestIdleCallback 空闲时上报

window.addEventListener('beforeunload', () => {
  navigator.sendBeacon('/api/monitor', JSON.stringify(bufferedMetrics));
});

// 现成方案：Sentry（错误+性能）、阿里 ARMS、
// 腾讯 RUM、字节 volcengine APMPlus、开源 web-see
```

### Q15: 讲一个你做过的性能优化案例？⭐⭐⭐ 🔥

**答：** 这是必考开放题，用 **STAR + 数据** 结构回答：

```
模板：场景 → 问题定位 → 手段 → 量化结果 → 沉淀

示例回答（管理后台项目）：

【场景】中后台管理系统，用户反馈打开报表页要 6-7 秒白屏。

【定位】Lighthouse + bundle analyzer 分析：
1. 主包 3.2MB（echarts 全量引入 + moment）
2. 报表页串行等 4 个接口
3. 表格一次渲染 5000 行 DOM

【手段】
1. echarts 按需注册组件，moment → dayjs（体积 -1.4MB）
2. 路由级代码分割，报表页独立 chunk
3. 4 个接口合并为 BFF 聚合接口 + Promise.all 并行
4. 表格虚拟滚动（只渲染可视区 30 行）
5. 开启 Gzip + CDN + 接口数据 SWR 缓存

【结果】
- 首屏 LCP：6.8s → 1.9s（-72%）
- 主包体积：3.2MB → 780KB
- 报表页交互卡顿（INP）：600ms → 80ms

【沉淀】
- 把"分包配置 + 按需引入"沉淀为团队脚手架默认配置
- CI 加 bundlesize 检查，主包超 500KB 构建失败
```

### Q16: SSR 为什么能提升首屏？有什么代价？⭐⭐⭐

```
CSR 首屏流程（两次请求才能看到内容）：
请求 HTML（空壳）→ 下载 JS → 执行 JS → 请求接口 → 渲染内容

SSR 首屏流程：
请求 HTML（服务端已渲染好内容）→ 直接显示 → hydration 绑定事件

优势：
1. FCP/LCP 快：HTML 到达即可见
2. SEO 友好：爬虫直接拿到完整内容
3. 弱网/低端设备体验好

代价：
1. 服务器压力大（每个请求都要渲染）
2. TTFB 可能变长（服务端渲染耗时）
3. hydration 成本：JS 加载后还有一次"注水"
4. 开发复杂度：数据获取、环境判断（window 不存在）

折中方案：
- SSG：构建时生成静态 HTML（博客、文档站）
- 增量静态再生（ISR）：静态 + 定时更新
- 流式 SSR：分块吐 HTML，边渲染边下发
- 岛屿架构（Astro）：静态为主，局部交互组件才加载 JS
```

---

## 复习卡片

> [!TIP]
> **快速复习清单**
>
> 1. **Core Web Vitals**：LCP < 2.5s、INP < 200ms、CLS < 0.1（INP 已取代 FID）
> 2. **测量**：web-vitals 库 + PerformanceObserver；Lab（Lighthouse）vs Field（RUM）
> 3. **URL 到展示**：DNS 预解析 → preconnect → CDN/缓存 → 分包 → 渲染
> 4. **defer vs async**：defer 顺序执行于解析后；async 下载完就执行
> 5. **代码分割**：路由懒加载 + manualChunks + 大库独立缓存
> 6. **图片**：WebP/AVIF、srcset、loading=lazy；LCP 图 preload + fetchpriority
> 7. **白屏优化**：CDN + Gzip + 缓存 + 懒加载 + SSR/SSG + 接口预请求
> 8. **重排重绘**：读写分离防布局抖动；transform/opacity 走合成层
> 9. **长列表**：虚拟列表，只渲染可视区 + buffer
> 10. **防抖节流**：结果导向用防抖，限频用节流
> 11. **内存泄漏**：定时器/监听/闭包/游离 DOM；Heap Snapshot 对比排查
> 12. **包体积**：Tree Shaking + 按需引入 + 大依赖替换 + 可视化分析
> 13. **案例回答**：STAR + 量化数据 + 沉淀，务必提前准备 1-2 个

---

> [!TIP]
> 下一篇：[手写代码题专篇](/blog/posts/interview-guide-14-handwritten-code/) 涵盖防抖节流、深拷贝、Promise 系列、并发控制、发布订阅、数组扁平化等笔试必考题的逐行解析。
>
> 返回 [面试宝典总览](/blog/posts/interview-guide-00-overview/) | [面试宝典合集页](/blog/interview-guide/)
