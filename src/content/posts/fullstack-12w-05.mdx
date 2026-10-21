---
title: 'W5 · 鉴权与 RBAC'
published: 2026-10-13T14:50:00+08:00
description: 'JWT vs Session、Passport、角色权限、刷新令牌安全。给 W2/W4 服务加登录 + RBAC 守卫，权限模型对齐你 admin 现有角色。'
tags: [鉴权, RBAC, JWT, 12周计划]
category: 全栈进阶12周
draft: false
---

> [!NOTE]
> 这是第二个里程碑。你 notelab-b admin 已经有登录模型，本周把它"讲清楚 + 用 NestJS 重做一遍"，并补上刷新令牌这个最容易出事的点。

---

## 本周目标

- 理解 JWT vs Session 的本质取舍。
- 用 `@nestjs/jwt` + Passport 实现登录。
- 实现基于角色的访问控制（RBAC）守卫，对齐 admin 现有角色。
- 刷新令牌走 httpOnly cookie（不塞 localStorage）。

## 核心概念速记（详文 →）

- 认证与安全：[/blog/posts/node-roadmap-06-auth-and-security/](/blog/posts/node-roadmap-06-auth-and-security/)

**记忆锚点**：

- Session 把状态放服务端（更可控、易吊销），JWT 把状态放令牌（无状态、但吊销难）。
- 刷新令牌被盗 = 长期免密；必须 httpOnly + 短时效 + 可吊销列表。
- RBAC 三要素：用户→角色→权限；守卫只判断"这个角色能否访问这个路由"。

## 落到我项目的动作

- 给 W2/W4 的 NestJS 服务加登录 + RBAC 守卫，权限模型对齐你 admin UI 已有的角色。
- 前端（notelab-c）对接：登录拿 access token，刷新走 httpOnly cookie。

## 本周交付物（可见）

- 带登录与角色守卫的接口，能演示"普通用户访问管理员路由被拒"。

## 面试一句话

"Session 适合需要强管控/易吊销的场景，JWT 适合无状态/跨服务；刷新令牌必须 httpOnly + 短时效 + 可吊销，绝不能进 localStorage。"

## 易错点 / 记忆锚点

- access token 短时（15min），refresh token 长时但可吊销——别把两者混为一谈。
- `Guards` 里抛 `ForbiddenException`（403）而非 `UnauthorizedException`（401）——语义要分清。

## 练习

1. 实现登录接口，返回 access + 设置 refresh 的 httpOnly cookie。
2. 写 `@Roles('admin')` 守卫，套到 admin 路由上，演示越权被拒。
3. 设计一个"令牌被盗"的应对：如何在不改 access 时效的前提下吊销 refresh。
