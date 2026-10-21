---
title: '06 · 跨域与安全'
published: 2026-09-31T20:00:00+08:00
description: '前端安全底线：同源策略与 CORS 的跨域机制、Content-Security-Policy 防注入、XSS（跨站脚本）与 CSRF（跨站请求伪造）的原理与防御要点。以"如何不被攻击"为主线。'
tags: [浏览器, 安全, CORS, CSP, XSS, CSRF]
category: 浏览器与性能学习路线
draft: false
---

## 安全是上线的必答题

功能做完不代表能上线。两个经典漏洞——XSS 和 CSRF——是前端必须懂的防御知识。本文只讲**如何防**，原理服务于防护。

---

## 同源策略与 CORS

同源 = 协议 + 域名 + 端口都相同。跨源请求默认被浏览器拦截。服务端通过 CORS 头放行：

```
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
```

- 简单请求直接发；带凭证/非简单方法会先发 `OPTIONS` 预检。
- 不要把 `Allow-Origin` 设成 `*`（通配）同时又允许凭证，这是危险组合。

---

## CSP：给页面上把锁

Content-Security-Policy 声明"页面允许加载哪些来源的资源"，从源头遏制注入：

```
Content-Security-Policy: default-src 'self'; img-src 'self' https://cdn.example.com;
```

即使有注入点，外部脚本也因不在白名单被拒绝执行。是现代防 XSS 的关键防线。

---

## XSS：别让用户输入变成代码

原理（仅用于理解防御）：把用户输入未经处理地插入 DOM/HTML，其中的脚本会被执行。防御：

- **输出转义**：插入文本用 `textContent` 而非 `innerHTML`；框架（React/Vue）默认转义插值。
- **不信任任何用户输入**，富文本用白名单 sanitizer（如 DOMPurify）。
- **HttpOnly Cookie** 让 JS 读不到 token，即使被注入也偷不走登录态。
- 配合 **CSP** 兜底。

---

## CSRF：别让别人的站点替你发请求

原理（用于理解）：用户在 A 站登录，访问恶意 B 站，B 自动发起对 A 的请求，浏览器带上 A 的 Cookie 通过鉴权。防御：

- **SameSite Cookie**：`SameSite=Strict/Lax` 阻止跨站携带 Cookie。
- **CSRF Token**：请求带服务端下发的随机 token，恶意站点无法伪造。
- 关键操作要求二次确认/验证码。

---

## 小结

- CORS 是服务端声明的跨域放行，别滥用 `* + 凭证`。
- CSP 用白名单约束资源来源，防注入兜底。
- XSS 防：转义输出 + 不信任输入 + HttpOnly + CSP。
- CSRF 防：SameSite Cookie + CSRF Token。

---

## 练习

1. 给一个页面加 CSP 头，故意引入一个外部脚本，观察被拦截。
2. 对比 `innerHTML` 插入用户输入 vs `textContent` 的安全性差异。
3. 解释为什么 `SameSite=Strict` 能挡住大部分 CSRF。
