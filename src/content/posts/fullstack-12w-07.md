---
title: 'W7 · BFF 模式'
published: 2026-10-13T15:10:00+08:00
description: '为什么前端需要 BFF、Next.js Route Handlers 作轻量 BFF、聚合多后端减少客户端请求。在 notelab-c 抽一层 BFF 聚合。'
tags: [BFF, 架构, 全栈, 12周计划]
category: 全栈进阶12周
draft: false
---

> [!NOTE]
> 你 notelab-c 现在直接调 SpireContentController 等后端。本周理解"为什么中间该有一层 BFF"，并用 App Router 的 Route Handlers 抽一层聚合。

---

## 本周目标

- 讲清 BFF 的价值与边界（何时不该用）。
- 用 Next.js Route Handlers（`app/api/...`）做轻量 BFF。
- 把多次后端调用合并为一个前端友好的接口。

## 核心概念速记（详文 →）

- HTTP 服务与中间件：[/blog/posts/node-roadmap-03-http-server-express-koa/](/blog/posts/node-roadmap-03-http-server-express-koa/)
- 系统设计（含 BFF 取舍）：[/blog/posts/interview-guide-17-system-design/](/blog/posts/interview-guide-17-system-design/)

**记忆锚点**：

- BFF = "为前端定制的后端"：聚合、裁剪、协议转换，让客户端少发请求、少做拼装。
- BFF 不是又一层微服务——它贴近前端，按前端页面而非业务域划分。
- 别过度：小项目直连后端即可，BFF 的价值在"多后端聚合 + 多端差异"时才显著。

## 落到我项目的动作

- 在 notelab-c 的 App Router 里抽一层 BFF 聚合（把调 SpireContentController 的多次请求合并）。
- 记录改造前后客户端请求数对比。

## 本周交付物（可见）

- 一个 BFF 聚合示例 + 一份"前后请求数对比"说明，提交。

## 面试一句话

"BFF 解决的是多后端聚合与多端差异，让前端拿到的就是它要的；但它增加一层，只有在聚合收益明显时才该引入，否则是过度设计。"

## 易错点 / 记忆锚点

- BFF 里别写业务规则——它做"拼装/裁剪"，领域逻辑还在后端服务。
- BFF 自己也要有超时和降级，否则一个后端慢会拖死整个页面。

## 练习

1. 找出 notelab-c 里一个"一个页面发 3+ 请求"的场景，用 Route Handler 聚合成一个。
2. 给 BFF 加超时与降级（某后端挂了返回部分数据）。
3. 画一张"直连 vs BFF"的架构对比图，标注请求数与故障传播差异。
