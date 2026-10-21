---
title: 'W2 · NestJS 核心（对照 Spring 映射）'
published: 2026-10-13T14:20:00+08:00
description: '用你已有的 Spring 概念平移到 NestJS：Module/Controller/Service/DI/Pipe/Guard。把 NoteLab 的一个真实接口用 NestJS 重写跑通。'
tags: [NestJS, Node.js, 全栈, 12周计划]
category: 全栈进阶12周
draft: false
---

> [!NOTE]
> 这是第一个里程碑（W2/W5/W9/W12 之一）。你懂 Spring，NestJS 几乎是它的 TS 翻版——本周不学"后端是什么"，只学"TS 里这套注解长什么样"。

---

## 本周目标

- 跑通 NestJS 的 Module / Controller / Service / Provider / DI。
- 理解装饰器 + `reflect-metadata` 如何建依赖图。
- 用 NestJS 重写 notelab-c 的**一个现有接口**或新建一个 admin 接口。

## 核心概念速记（详文 →）

- NestJS IoC/DI：[/blog/posts/node-roadmap-04-nestjs-ioc-di/](/blog/posts/node-roadmap-04-nestjs-ioc-di/)
- HTTP 服务与中间件基础：[/blog/posts/node-roadmap-03-http-server-express-koa/](/blog/posts/node-roadmap-03-http-server-express-koa/)

**Spring → NestJS 映射表（背下来）**：

| Spring | NestJS |
|---|---|
| `@RestController` / `@GetMapping` | `@Controller` + `@Get()` |
| `@Service` + 构造注入 | `@Injectable()` + 构造注入 |
| `@Valid` / `@Validated` | `class-validator` + `ValidationPipe` |
| `@ControllerAdvice` | 全局异常过滤器 `ExceptionFilter` |
| AOP 切面 | `Interceptor` |

## 落到我项目的动作

- 选 NoteLab admin（notelab-b）或 notelab-c 的一个接口，用 NestJS 重写为分层结构（Controller 薄、Service 写业务）。
- 本地 `npm run start` 跑通，能真实访问。

## 本周交付物（可见）

- 一个本地可访问的 NestJS 服务（含一个真实接口），提交到仓库。

## 面试一句话

"DI 解决的是重复创建、硬耦合、难测试三件事；Nest 的容器本质是 注册→递归解析→单例缓存，比手写 IoC 多了元数据收集和循环依赖检测。"

## 易错点 / 记忆锚点

- Controller 必须薄：里面写查询逻辑一律打回，业务全在 Service。
- "Nest can't resolve dependencies" 九成是忘了 `exports`/`imports`。
- 默认单例：别在 service 实例属性上存请求级数据（会被并发覆盖）。

## 练习

1. 按 [node-roadmap-04](/blog/posts/node-roadmap-04-nestjs-ioc-di/) 的手写迷你 IoC 容器抄一遍跑通。
2. 用 Nest CLI 起项目，把选中的 NoteLab 接口重写并跑通。
3. 故意制造循环依赖→观察报错→用"抽公共模块"重构掉（别用 forwardRef 掩盖）。
