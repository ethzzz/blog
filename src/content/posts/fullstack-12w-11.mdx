---
title: 'W11 · 安全与性能自查'
published: 2026-10-13T15:50:00+08:00
description: 'OWASP Top 10(Node 侧)、参数化查询防注入、速率限制、性能(连接池/索引/压缩/HTTP2)、Web Vitals。对 NoteLab 跑一份自查清单。'
tags: [安全, 性能, OWASP, 12周计划]
category: 全栈进阶12周
draft: false
---

> [!NOTE]
> 你前端强项在性能（Lighthouse/Web Vitals），本周把它和后端安全/性能打通，对 NoteLab 做一次可交付的自查——这也是面试能讲的真事。

---

## 本周目标

- 过一遍 OWASP Top 10 的 Node 侧要点。
- 确认所有 DB 查询参数化（防 SQL 注入），依赖审计 `npm audit`。
- 性能：连接池、DB 索引、响应压缩、HTTP2。
- 前端性能：Web Vitals（你已有体感，补到全栈视角）。

## 核心概念速记（详文 →）

- 认证与安全（注入/限流）：[/blog/posts/node-roadmap-06-auth-and-security/](/blog/posts/node-roadmap-06-auth-and-security/)
- 性能面试：[/blog/posts/interview-guide-13-performance/](/blog/posts/interview-guide-13-performance/)
- 浏览器安全：[/blog/posts/browser-roadmap-06-security/](/blog/posts/browser-roadmap-06-security/)

**记忆锚点**：

- 注入的根因是"把用户输入当代码执行"——参数化/ORM 预编译是治本。
- 性能两大锤：减少请求（合并/CDN）、减少等待（索引/缓存/压缩）。
- 依赖也是攻击面：`npm audit` 定期跑，别让 transitive 依赖成后门。

## 落到我项目的动作

- 对 NoteLab（C 端 + B 端）跑一份"安全 + 性能"自查清单。
- 重点：输入校验是否全覆盖、DB 是否参数化、`npm audit` 有无高危、C 端资源加载是否达标。

## 本周交付物（可见）

- 一份自查报告（问题 + 严重级 + 修复建议），提交到仓库 `docs/`。

## 面试一句话

"全栈安全从信任边界做起：输入校验、参数化查询、依赖审计、速率限制；性能从减少请求与减少等待两条线优化，前后端指标要连起来看。"

## 易错点 / 记忆锚点

- `npm audit` 高危别只 `audit fix` 了事——自动升级可能破坏 API，要 review。
- Web Vitals 不只是前端分：服务器响应慢（TTFB 高）也会拉低 LCP。

## 练习

1. 对 NoteLab 跑 `npm audit`，列出高危并判断是否可安全升级。
2. 检查一个手写 SQL（如有）是否参数化，未参数化的改掉。
3. 用 Lighthouse 测 C 端首页，把 TTFB 与 LCP 拆开看责任在谁。
