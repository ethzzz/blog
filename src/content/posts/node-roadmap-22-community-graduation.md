---
title: '22 · 社区服务 0→1：毕业验收与后续阶段路线图'
published: 2026-11-09T22:35:00+08:00
updated: 2026-11-10T19:00:00+08:00
description: '完整项目验收清单、冒烟脚本、可插拔扩展（搜索/会员/图片）以及阶段二/三的追加方式。'
tags: [Node.js, 项目验收, 架构演进, 社区服务]
category: Node全栈学习路线
draft: false
---

> [!NOTE]
> 阶段一第 6 篇（共 6 篇，阶段一完）。上一篇：[第 4 周：上线](/blog/posts/node-roadmap-21-community-week-4/)；下一篇：[阶段二总览：全栈企业化与 P0–P2 计划](/blog/posts/node-roadmap-23-community-fullstack-plan/)；返回：[总览、架构与系列索引](/blog/posts/node-roadmap-17-express-zero-to-one-30-days/)；合集：[Node.js 全栈开发路线](/blog/node-roadmap/)。

---

## 毕业验收：完整项目清单

> [!IMPORTANT]
> Day 3–24 是增量片段，不是 24 份完整文件。按顺序落地后，你的目录应该和 1.5.6 的最终目录一致；下面这份清单用来判断「是不是真的做完了」。

### 1. 业务能力

- [ ] 注册 / 登录 / 刷新 / 登出
- [ ] 旧 refresh 重放返回 401
- [ ] RBAC：未登录 401、无权限 403
- [ ] 用户资料 / 关注 / 取关
- [ ] 发帖 / 帖子列表 / 详情 / 软删除
- [ ] 评论 / 回复 / 事务计数
- [ ] 点赞 / 取消点赞 / 并发幂等
- [ ] 关注流 / 游标分页
- [ ] 通知列表 / 已读 / SSE
- [ ] 审核 / 举报 / 后台列表
- [ ] 审计记录 `moderation_records`

### 2. 数据与索引

- [ ] `users`、`refresh_tokens`、`roles`、`permissions`、`user_roles`、`role_permissions`
- [ ] `posts`、`comments`、`likes`、`follows`
- [ ] `notifications`、`reports`、`moderation_records`
- [ ] `outbox_events`、`idempotency_keys`
- [ ] 点赞唯一约束、关注复合主键、refresh hash 唯一
- [ ] 列表查询都有对应复合索引

### 3. 异步与高并发

- [ ] 业务事务内写 Outbox
- [ ] Outbox worker 能追平 pending
- [ ] 通知消费者按 `eventId` 幂等
- [ ] SSE 心跳 + 断线清理
- [ ] 依赖挂掉返回 503/504，进程不崩
- [ ] 100 并发压测报告
- [ ] 5 分钟内回滚

### 4. 工程化

- [ ] `.env` 不进 Git，`.env.example` 完整
- [ ] `pnpm lint` / `typecheck` / `test` / `build` 全绿
- [ ] Docker 多阶段构建
- [ ] Nginx 反代 + SSE 不缓冲
- [ ] CI 阻断类型错误/测试失败
- [ ] `/health`、`/ready`、`/metrics`
- [ ] SIGTERM 优雅关闭
- [ ] README 能让他人从零跑起来
- [ ] 3 篇 ADR
- [ ] 10 分钟演示

### 5. 最终冒烟脚本

路径：`scripts/smoke.sh`。完整内容如下：

```bash
#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://127.0.0.1:3000}

curl -fsS "$BASE_URL/health" >/dev/null
curl -fsS "$BASE_URL/ready" >/dev/null
curl -fsS "$BASE_URL/api/v1/posts?limit=1" >/dev/null

echo "smoke ok: $BASE_URL"
```

```bash
chmod +x scripts/smoke.sh
./scripts/smoke.sh
```

如果这五组都打勾，你得到的就不是一个「能跑的 demo」，而是一个**边界清楚、可测试、可部署、可讲清楚取舍**的社区服务。

---

## 可插拔扩展：把核心服务长成完整社区

> 30 天主线覆盖社区核心闭环。下面三块是常见的下一阶段业务，放进主线会让范围失控，但架构已经给它们留好了位置。

### 搜索

- 先上 MySQL `FULLTEXT`，数据量上来再换 Meilisearch。
- 发帖/审核通过后通过 Outbox 发 `post.published` 事件，由索引消费者同步，不让搜索拖慢发帖。
- 代码落点：`modules/search`；接口 `GET /api/v1/search/posts?q=`。
- 关键约束：索引可重建，MySQL 是真相源。

### 会员与支付

- 表：`plans`、`orders`、`entitlements`；订单带 `Idempotency-Key` 唯一键。
- 支付回调必须验签 + 幂等；回调成功只写一次权益。
- 代码落点：`modules/memberships`；不要和发帖/评论事务耦合。
- 关键约束：支付失败不能让内容主链路回滚。

### 图片与附件

- 客户端直传 MinIO/OSS，服务端只保存 URL 和元数据。
- 表：`post_media`；上传前限制 MIME、大小和数量。
- 代码落点：`modules/media`；帖子创建只接收已上传的 URL。
- 关键约束：不在 API 进程里转发大文件，避免占满内存和带宽。

这三块都遵循同一条规则：**核心模块不直接依赖扩展模块，扩展模块通过事件或 service 接口接入**。这就是「低耦合、可迭代」在代码里的具体含义。

---

## 下一步：阶段二怎么接

阶段一（Express 核心）到这里收尾。2026-11-10 起进入阶段二：全栈企业化。

- [23 · 阶段二总览：全栈企业化与 P0–P2 计划](/blog/posts/node-roadmap-23-community-fullstack-plan/)：先读这篇，明确保留什么、新增什么、按什么节奏做。
- 24–26 · P0a/P0b、P1、P2 实施记录：随里程碑推进追加。
- 27+ · 搜索、会员/支付、图片/附件等业务扩展：等 P2 后再按业务需要追加。

具体追加规则见总览的「后续阶段怎么追加」。新文章继续用 Node全栈学习路线 分类。
