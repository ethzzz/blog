---
title: '04 · 浏览器存储'
published: 2026-09-31T18:00:00+08:00
description: '浏览器端存储方案对比：Cookie（带过期/同源策略/请求自动携带）、LocalStorage（持久、同源、5MB）、SessionStorage（标签页级）、IndexedDB（结构化、大容量、异步）。讲清各方案的边界与选型。'
tags: [浏览器, 存储, Cookie, LocalStorage, IndexedDB]
category: 浏览器与性能学习路线
draft: false
---

## 为什么需要客户端存储

服务端是真相源，但很多场景要在客户端记点东西：登录态、用户偏好、离线缓存、草稿。浏览器提供了几层能力，各有适用边界。

---

## 四种方案对比

| 方案 | 容量 | 生命周期 | 自动随请求发 | 类型 |
| --- | --- | --- | --- | --- |
| **Cookie** | ~4KB | 可设过期 | ✅（同域请求头） | 字符串 |
| **LocalStorage** | ~5MB | 永久（手动清） | ❌ | 字符串 |
| **SessionStorage** | ~5MB | 标签页关闭即清 | ❌ | 字符串 |
| **IndexedDB** | 数百 MB+ | 永久 | ❌ | 结构化/二进制 |

---

## Cookie：最老但特殊

```js
document.cookie = "token=abc; max-age=3600; Secure; SameSite=Strict; Path=/";
```

特点：
- 每次同域请求**自动带在请求头**，适合存登录态。
- 容量小（~4KB），有安全属性：`HttpOnly`（JS 读不到，防 XSS 偷）、`Secure`（仅 HTTPS）、`SameSite`（防 CSRF）。
- 现代登录态更倾向存 `HttpOnly Cookie`，而非 LocalStorage（后者易被 XSS 读走）。

---

## LocalStorage / SessionStorage

```js
localStorage.setItem("theme", "dark");
localStorage.getItem("theme"); // "dark"
// 只存字符串，对象需 JSON.stringify
```

- LocalStorage 同源持久；SessionStorage 仅当前标签页（新开标签不共享）。
- **同步 API**，大量读写会阻塞；且同源下任何脚本可读，敏感信息别放这。

---

## IndexedDB：前端的"数据库"

```js
const db = await idb.openDB("app", 1);
await db.put("drafts", { id: 1, text: "..." });
```

- 异步、支持事务、存结构化/二进制（Blob/ArrayBuffer），容量大。
- 适合离线应用、缓存大体积数据、PWA 的本地存储。
- API 偏底层，常用 `idb` 这类封装库。

---

## 选型口诀

登录态 → `HttpOnly Cookie`；用户偏好/轻量缓存 → `LocalStorage`；标签页临时态 → `SessionStorage`；大/结构化/离线 → `IndexedDB`。

---

## 小结

- Cookie 小、随请求发、带安全属性，适合登录态。
- LocalStorage 持久同源，SessionStorage 标签页级。
- IndexedDB 大容量异步，适合离线/结构化数据。
- 敏感信息别放可被 JS 读取的存储。

---

## 练习

1. 比较把登录 token 存 LocalStorage 与 HttpOnly Cookie 在 XSS 下的风险差异。
2. 用 IndexedDB（或 idb 库）实现一个"离线草稿箱"，刷新后仍在。
3. 解释 SessionStorage 为什么"新标签页打开同一 URL 不共享状态"。
