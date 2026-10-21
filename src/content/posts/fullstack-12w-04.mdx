---
title: 'W4 · Prisma + MySQL（复用生产库）'
published: 2026-10-13T14:40:00+08:00
description: '用 Prisma 对接你已有的 MySQL（:3306），建模、迁移、关系查询，并把 Spire/loot 的配置表用 ORM 重新建模。对照 JPA。'
tags: [Prisma, MySQL, ORM, 12周计划]
category: 全栈进阶12周
draft: false
---

> [!NOTE]
> 你生产已经是 MySQL（:3306），不用另学新数据库。本周用 Prisma 把"写 SQL"升级为"类型安全的 schema 建模 + 迁移管理"，直接落在 Spire/loot 的配置表上。

---

## 本周目标

- 写 `schema.prisma`，定义 model 与关系。
- 跑通 migration（新建独立 schema 或测试库，**不要动生产表**）。
- 掌握关系查询、N+1 意识（用 `include` / 批查）。

## 核心概念速记（详文 →）

- 数据库与 ORM：[/blog/posts/node-roadmap-05-database-orm/](/blog/posts/node-roadmap-05-database-orm/)

**记忆锚点**：

- migration 是"数据库版本的 git"——改 schema 必须走迁移，不能手动改表后忘记录。
- N+1：循环里逐条查关联，是服务端性能第一杀手；用 `include` 或 `select` 一次取出。
- Prisma 的 `Decimal`/`DateTime` 等类型比 JS 原生更安全，金钱/时间别用 `number`/`string` 裸存。

## 落到我项目的动作

- 把 Spire 或 loot 的**配置表**用 Prisma 重新建模，连你已有的 MySQL（用独立测试库验证）。
- 写几个关系查询示例（如"取某角色 + 其全部技能/装备"）。

## 本周交付物（可见）

- `schema.prisma` + 一次成功 migration + 几个关系查询；提交到仓库（不含生产数据）。

## 面试一句话

"ORM 的价值是类型安全与迁移管理，代价是抽象泄漏；N+1 必须用预加载或批查解决，必要时回到原生 SQL。"

## 易错点 / 记忆锚点

- `npx prisma migrate dev` 会改库结构，务必在**测试库**先跑，确认无误再考虑生产。
- 关系字段命名和 `relation` 声明写错，迁移会静默生成错表——迁移前 `prisma validate` 先过一遍。

## 练习

1. 用 Prisma 把 Spire 的角色/技能建模成两个有关联的 model。
2. 跑一次 migration 到测试库，写查询验证关系取出。
3. 故意制造 N+1（循环查关联），用 `include` 改写，对比两次查询次数。
