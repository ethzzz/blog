---
title: '10 · 手写防抖与节流'
published: 2026-10-13T19:00:00+08:00
description: '手写防抖 debounce 与节流 throttle 完整版：immediate 立即执行、cancel 取消、leading/trailing 变体与 requestAnimationFrame 节流。'
tags: [手写题, 防抖, 节流, JavaScript]
category: 算法与手写题
draft: false
---

> [!NOTE]
> 防抖节流是前端手写题出场率第一梯队，而且**层层加码**：基础版 → 支持立即执行 → 支持 cancel → leading/trailing 可配。这篇按面试的真实追问顺序，一版一版写。

---

## 1. 先讲清楚概念（这步决定追问走向）

面试先给一句准话，再动手：

- **防抖 debounce**：事件停止触发 n 毫秒后才执行；期间再触发就重新计时。场景：搜索框输入联想、resize 结束后重算布局。关键词是"**最后一次说了算**"。
- **节流 throttle**：n 毫秒内最多执行一次。场景：滚动加载、按钮防连点。关键词是"**按固定频率执行**"。

一句话区分：防抖是"等你别闹了再做"，节流是"再闹我也按节奏做"。这十秒钟的概念陈述决定面试官后面追问的深度，值得练熟。

---

## 2. 防抖：基础版到完整版

**基础版**：

```ts
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);          // 重新计时
    timer = setTimeout(() => {
      fn.apply(this, args);                  // 保留 this 和参数
    }, delay);
  };
}
```

三个必讲细节，漏一个追问就来了：

1. **`fn.apply(this, args)`**：事件处理函数里的 `this` 和 `event` 必须透传。写成 `fn(...args)` 丢了 `this`，面试官立刻问"箭头函数版本 this 会怎样"。
2. **`clearTimeout` 后重新赋值**：核心就是"取消上一次的定时器"。
3. **返回普通函数而非箭头函数**：为了能拿到调用时的 `this`。

**完整版：加 immediate（首次立即执行）和 cancel**：

```ts
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number, immediate = false) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = function (this: unknown, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);
    if (immediate && !timer) {               // timer 为 null 说明是"静止后的第一次"
      fn.apply(this, args);
    }
    timer = setTimeout(() => {
      timer = null;                          // ⚠️ 执行完重置，下次又能立即执行
      if (!immediate) fn.apply(this, args);
    }, delay);
  } as T & { cancel: () => void };

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return debounced;
}
```

逐行讲：`immediate` 的判断条件是 `!timer`——只有"定时器不存在"（说明这次触发距离上次执行已超过 delay）才立即调用。**`timer = null` 必须在 setTimeout 回调里重置**，否则 immediate 模式永远只有第一次生效。`cancel` 用于组件卸载时清理，React/Vue 场景题里常被要求补上。

---

## 3. 节流：时间戳版与定时器版

节流的经典两种实现，行为差异是面试的高频考点：

**时间戳版（leading：首次立即执行，停止后不再补）**：

```ts
function throttleTimestamp<T extends (...args: any[]) => void>(fn: T, interval: number) {
  let last = 0;
  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - last >= interval) {            // 距上次执行够久了
      last = now;
      fn.apply(this, args);
    }
  };
}
```

**定时器版（trailing：停止后还会补一次，首次不立即）**：

```ts
function throttleTimer<T extends (...args: any[]) => void>(fn: T, interval: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    if (timer) return;                       // 冷却中，直接忽略
    timer = setTimeout(() => {
      timer = null;
      fn.apply(this, args);
    }, interval);
  };
}
```

两种版本答完，主动总结差异：

| 版本 | 首次触发 | 停止触发后 |
|------|----------|------------|
| 时间戳版 | 立即执行 | 不补执行 |
| 定时器版 | 延迟执行 | 会补执行一次 |

**终极版：leading/trailing 可配置**。两个机制合体——时间戳管"立即执行"，定时器管"补执行"：

```ts
function throttle<T extends (...args: any[]) => void>(
  fn: T, interval: number, { leading = true, trailing = true } = {}
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let last = 0;

  const throttled = function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now();
    if (!last && !leading) last = now;        // 首次且不 leading：假装已执行过
    const remain = interval - (now - last);
    if (remain <= 0) {
      if (timer) { clearTimeout(timer); timer = null; }
      last = now;
      fn.apply(this, args);
    } else if (!timer && trailing) {
      timer = setTimeout(() => {              // 补上被忽略的最后一次
        last = leading ? Date.now() : 0;
        timer = null;
        fn.apply(this, args);
      }, remain);
    }
  } as T & { cancel: () => void };

  throttled.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    last = 0;
  };
  return throttled;
}
```

能脱稿写出这版的人不多，写不出也没关系——**把表格里的行为差异讲清楚**，分数基本拿满。

---

## 4. rAF 节流：前端特色加分项

滚动、鼠标移动这类高频事件，用 `requestAnimationFrame` 做节流更贴合浏览器渲染节奏：

```ts
function rafThrottle<T extends (...args: any[]) => void>(fn: T) {
  let ticking = false;
  let lastArgs: Parameters<T> | null = null;
  return function (this: unknown, ...args: Parameters<T>) {
    lastArgs = args;                          // 始终记住最新参数
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      fn.apply(this, lastArgs!);
      ticking = false;
    });
  };
}
```

逐行讲：`ticking` 标志保证每帧最多执行一次；`lastArgs` 存最新参数——帧与帧之间的多次触发只保留最后一次的入参。rAF 版的优势：**天然与渲染帧对齐，浏览器标签页隐藏时自动暂停**，比定时器节流省电省性能。追问"rAF 和 setTimeout(16) 的区别"时答这两点即可。

---

## 小结

- 防抖：clearTimeout 重新计时；完整版补 immediate（`!timer` 判断）、cancel、this/args 透传。
- 节流：时间戳版 leading、定时器版 trailing，合体版两者可配。
- rAF 节流：ticking 标志 + lastArgs，与渲染帧对齐。
- 概念先行：先一句话讲清"最后一次说了算 vs 按频率执行"，再动手。

---

## 练习

1. 默写基础版防抖，重点自查 this/args 透传。
2. 默写完整版防抖，测试：immediate 模式下连续点击，第一次应立即执行、停止 300ms 后再点击又立即执行。
3. 默写时间戳版和定时器版节流，用表格复述两者行为差异。
4. 写一个搜索框场景：输入停止 500ms 后发请求，组件卸载时调用 cancel——防抖在 React 里的真实用法。
5. 用 rAF 节流改写一个 scroll 监听，控制台打印触发次数对比原生监听。
