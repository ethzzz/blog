---
title: 'W3 · 配置 / 校验 / 统一错误处理'
published: 2026-10-13T14:30:00+08:00
description: '补齐服务端健壮性三件套：多环境配置、class-validator 入参校验、全局异常过滤器统一错误响应。给 W2 的服务加壳。'
tags: [NestJS, 校验, 错误处理, 12周计划]
category: 全栈进阶12周
draft: false
---

> [!NOTE]
> 前端可以"崩了刷新就好"，服务端一个未捕获异常可能拖垮进程。本周给 W2 的服务穿上"健壮性三件套"：配置、校验、统一异常。

---

## 本周目标

- `@nestjs/config` 管理多环境变量。
- `class-validator` + `class-transformer` + `ValidationPipe` 做入参校验。
- 全局异常过滤器，输出统一 `{ code, message, data }` 响应体，且不泄露内部信息。
- 结构化日志雏形（接 W10 再深化）。

## 核心概念速记（详文 →）

- 配置与日志：[/blog/posts/node-roadmap-07-config-and-logging/](/blog/posts/node-roadmap-07-config-and-logging/)
- 校验与错误处理：[/blog/posts/node-roadmap-08-validation-error-handling/](/blog/posts/node-roadmap-08-validation-error-handling/)

**记忆锚点**：

- 一切外部输入都是恶意的——校验是信任边界的第一道闸。
- 500 不能把堆栈/SQL 抛给前端；统一异常层负责"翻译"内部错误为安全响应。
- DTO（Data Transfer Object）既是校验入口，也是前后端类型契约。

## 落到我项目的动作

- 给 W2 的 NestJS 服务加 DTO 校验 + 统一异常过滤器，响应体对齐你 admin 现有约定。
- 把密钥/连接串从代码里挪到环境变量（复用你已有的 env 管理习惯）。

## 本周交付物（可见）

- 带校验与统一异常层的 API；一次"故意传错参数"的测试，确认返回的是友好错误而非 500 堆栈。

## 面试一句话

"API 健壮性三件套是配置、校验、统一异常；校验挡非法输入，异常层挡意外错误并防止信息泄露，两者都是信任边界。"

## 易错点 / 记忆锚点

- `ValidationPipe` 记得开 `whitelist: true`，自动剥掉 DTO 之外的字段（防多余/恶意字段）。
- 全局异常过滤器要覆盖 `HttpException` 和未知 `Error` 两类，漏掉后者进程会崩。

## 练习

1. 给 W2 接口的所有入参补 DTO + 校验装饰器。
2. 写一个全局异常过滤器，把 `EntityNotFound`/`ValidationError`/未知错误分别翻译成统一响应。
3. 故意传非法 body，验证返回 400 而非 500，且响应体无堆栈。
