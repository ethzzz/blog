---
title: '10 · Web Workers 与多线程'
published: 2026-09-31T23:30:00+08:00
description: 'JS 单线程的突破：Web Worker 把重计算移出主线程，避免卡 UI。讲清 Worker 的通信模型（postMessage/结构化克隆）、使用场景与限制，以及 Comlink 这类更易用的封装。'
tags: [浏览器, WebWorkers, 多线程, 主线程, 并发]
category: 浏览器与性能学习路线
draft: false
---

## 单线程的墙

前面说过 JS 单线程，重计算（如大数组排序、图像/音频处理、加密）会卡住主线程，UI 冻结。Web Worker 提供了**真正的多线程**：把这类活丢到后台线程跑。

---

## Worker 基本用法

```js
// main.js
const worker = new Worker("worker.js");
worker.postMessage({ type: "calc", data: bigArray });
worker.onmessage = (e) => console.log("结果", e.data);

// worker.js
self.onmessage = (e) => {
  const result = heavyCompute(e.data.data);
  self.postMessage(result);
};
```

- 主线程与 Worker **不共享内存**，通过 `postMessage` 传数据。
- 数据用**结构化克隆**传递（默认拷贝；大对象可用 `Transferable` 转移所有权，零拷贝）。

---

## 适用场景

- 大数组/矩阵运算、排序、压缩。
- 图像处理（canvas 像素级操作）。
- 音视频编解码、加密解密。
- 解析大 JSON / 文档。

不适合：直接操作 DOM（Worker 里没有 `document`）、频繁小消息（通信也有开销）。

---

## 现代封装：Comlink

手写 `postMessage` 像在写 RPC，繁琐。`Comlink` 把 Worker 暴露的对象变成可 `await` 的远程对象：

```js
// worker.js
import * as Comlink from "comlink";
Comlink.expose({ heavyCompute });

// main.js
const api = Comlink.wrap(new Worker("worker.js"));
await api.heavyCompute(data); // 像调本地函数
```

---

## 限制与权衡

- Worker 有启动/通信成本，轻量计算不值得搬。
- 复杂共享状态可用 `SharedWorker`（多标签页共享）或 `SharedArrayBuffer`（需COOP/COEP 头）。
- 模块 Worker：`new Worker(url, { type: "module" })` 支持 ESM。

---

## 小结

- Web Worker 把重计算移出主线程，保 UI 流畅。
- 通过 `postMessage` 通信，数据走结构化克隆（大对象用 Transferable）。
- 适合重计算，不适合操作 DOM 或超高频小消息。
- Comlink 让 Worker 调用像本地异步函数。

---

## 练习

1. 写一个 Worker 做"大数组排序"，对比放主线程时页面是否冻结。
2. 用 `Transferable` 传递一个大 `ArrayBuffer`，体会零拷贝。
3. 用 Comlink 重构上面的 Worker 调用，对比代码可读性。
