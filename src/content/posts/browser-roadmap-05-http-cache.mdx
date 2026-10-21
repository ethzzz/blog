---
title: '05 · 网络与 HTTP 缓存'
published: 2026-09-31T19:00:00+08:00
description: '前端绕不开的网络：HTTP 缓存的强缓存（Cache-Control/max-age/ETag）与协商缓存（304），CDN 边缘缓存，以及"缓存策略怎么配才不会拿到旧资源"。'
tags: [浏览器, HTTP缓存, Cache-Control, ETag, CDN]
category: 浏览器与性能学习路线
draft: false
---

## 缓存是性能的半壁江山

很多"慢"其实是不该发生的请求。HTTP 缓存让浏览器/CDN 复用已下载的资源，**省掉网络往返甚至省掉下载**。配错了则会"永远拿到旧版"。

---

## 强缓存：不询问，直接用

靠响应头：

```
Cache-Control: max-age=31536000, immutable
```

- `max-age=秒`：资源在这么长时间内**绝对新鲜**，不发请求直接用（200 from cache）。
- `immutable`：内容永不变（如带 hash 的文件名），连验证都省。
- 强缓存期间浏览器连服务端都不问。

---

## 协商缓存：问一句"我这份还新吗"

当强缓存过期，浏览器带条件去问服务端：

```
请求：If-None-Match: "<ETag值>"
响应：304 Not Modified（无 body，极快）
```

- `ETag`：资源指纹，内容变则变。
- `Last-Modified`：最后修改时间（精度低，文件 1 秒内改回原值会误判）。

服务端比对后发现没变 → 返回 `304`，浏览器继续用本地副本。

---

## 实践策略

- **带 hash 的静态资源**（如 `app.a1b2c3.js`）：`Cache-Control: max-age=31536000, immutable`。内容变→hash 变→URL 变→自动取新版，旧 URL 永久缓存安全。
- **HTML（入口）**：`no-cache` 或短缓存，确保能及时拿到新引用。
- **CDN**：边缘节点缓存静态资源，用户就近取，延迟大降。

> 本博客部署用 `contenthash` 文件名正是为了这套缓存策略：内容不变 URL 不变，可放心长缓存。

---

## 小结

- 强缓存（max-age/immutable）：不发请求，最快。
- 协商缓存（ETag/304）：发请求但省下载。
- 带 hash 资源长缓存 + HTML 短缓存 = 安全又快的经典组合。
- CDN 把资源推到离用户更近的地方。

---

## 练习

1. 给一个静态资源配 `Cache-Control: max-age=31536000, immutable`，用 DevTools 看二次访问是否 200 (from cache)。
2. 改资源内容但保持文件名不变，观察协商缓存返回 304 还是重新下载。
3. 解释为什么 HTML 入口不宜设 `immutable` 长缓存。
