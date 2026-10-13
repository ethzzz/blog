---
title: 'W12 · 部署与 CI/CD（收尾里程碑）'
published: 2026-10-13T16:00:00+08:00
description: 'Docker 化 NestJS、GitHub Actions（博客已在用）、pm2 多进程、滚动/蓝绿发布与回滚预写。把服务做成可一键部署可回滚。'
tags: [部署, Docker, CI/CD, 12周计划]
category: 全栈进阶12周
draft: false
---

> [!NOTE]
> 这是第四个也是最后一个里程碑。一个不能稳定上线、不能回滚的服务不算生产就绪。你已用 pm2 + nginx，本周把它升级成"一键部署 + 可回滚"。

---

## 本周目标

- 把 NestJS 服务 Docker 化（多阶段构建，镜像小而安全）。
- 用 GitHub Actions（你博客已在跑）做构建→推送→服务器拉取→重启。
- pm2 多进程 + nginx 反代。
- 预写回滚方案（保留上一版镜像 / 构建产物）。

## 核心概念速记（详文 →）

- 部署与性能：[/blog/posts/node-roadmap-12-deploy-and-performance/](/blog/posts/node-roadmap-12-deploy-and-performance/)

**记忆锚点（发布铁律）**：

- **回滚未就绪，不得发布**——这是红线，不是建议。
- 蓝绿/滚动让"发布"变成"切换"，出事一键切回。
- pm2 多进程要配 `max_memory_restart`，防止内存泄漏拖垮单机。

## 落到我项目的动作

- 把 W2 起的 NestJS 服务 Docker 化。
- 复用你 sync-deploy 思路写一条 Actions 流水线（构建→推送→服务器拉取→pm2 重启）。
- 预写回滚：保留上一版镜像 tag，出事 `docker run` 旧版 + pm2 重启。

## 本周交付物（可见）

- 一个 Docker 化、可一键部署 + 可回滚的全栈服务；一次"发布→回滚"演练记录。

## 面试一句话

"生产就绪 = 能部署 + 能回滚；发布走蓝绿/滚动降低风险，回滚方案必须预写并演练，未就绪的发布等于赌博。"

## 易错点 / 记忆锚点

- Docker 多阶段构建：构建期装 devDeps，运行期只留产物，镜像能小好几倍。
- 别把 `.env`/密钥打进镜像——用 secrets 或挂载，否则镜像一传就泄。

## 练习

1. 给服务写多阶段 Dockerfile，构建并本地 `docker run` 跑通。
2. 写一条 Actions 流水线，串起构建→推送→服务器重启。
3. 演练一次回滚：发布新镜像→故意制造故障→切回旧镜像，记录 RTO。
