---
title: '00 · 项目总览：AI 运营物料投放工作台'
published: 2026-11-28T09:00:00+08:00
description: '围绕 App 首页 Banner，从手工配置、六人预演和审核发布做起，再接入可查证据的 AI 草稿，完成内测交付。'
tags: [项目实战, 运营后台, AI应用, MySQL]
category: AI运营投放实战
draft: false
---

运营同学输入「只给已经激活 Link 2、还没完成新手引导的用户展示教程，App 至少 2.5.0，本周五下线」。AI 生成待确认的投放建议，推荐已审核素材，并标出「本周五」还缺具体下线时刻。运营补全配置后，后台逐个模拟用户，展示谁会看到这条 Banner、其他人为什么没命中。审核员确认后才更新线上投放结果。

项目只做一个投放位 `home-banner`。读者最后交付一个可打开的运营后台、一个读取实际已发布版本的模拟客户端接口，以及一份能复跑的评测报告。所有机型、素材和用户均为演练数据。两套访问密钥用于切换运营员和审核员，数据库使用 MySQL。

## 章节与阶段验收

| 章节 | 做完后能演示 | 核心文件 |
| --- | --- | --- |
| [01 · 初始化与手工建活动](/blog/posts/ai-ops-workshop-01-setup/) | 从空目录起服务、切账号、保存和重新读取配置 | `fixtures.mjs`、`db.mjs`、`server.mjs` |
| [02 · 规则引擎与人群预演](/blog/posts/ai-ops-workshop-02-preview/) | 看六个模拟用户的命中结果，预测改规则会新增谁 | `rules.mjs`、`rules.test.mjs`、`app.mjs` |
| [03 · 审核发布与并发防护](/blog/posts/ai-ops-workshop-03-release/) | 走提交、退回、发布、下线，证明并发请求不会产生两次发布 | `db.mjs`、`smoke.mjs` |
| [04 · AI 草稿与原文证据](/blog/posts/ai-ops-workshop-04-assistant/) | 从一句运营需求提取字段和证据，对比应用建议前后的人群 | `assistant.mjs`、`app.mjs` |
| [05 · 质量评测与交付](/blog/posts/ai-ops-workshop-05-evaluation/) | 对比模型结果，执行回归，演练备份和下线恢复 | `eval-cases.json`、`eval.mjs`、`smoke.mjs` |

## 业务数据怎么流动

| 对象 | 保存位置 | 如何使用 |
| --- | --- | --- |
| 用户与素材 | `fixtures.mjs` | 六个固定用户覆盖正反样本。素材记录适用机型和审核状态。 |
| 投放位 | MySQL `placements` | `home-banner` 行是同一投放位并发发布时的事务锁。 |
| 活动与规则 | MySQL `campaigns` | 状态、修订号和 JSON 配置一起保存。模拟客户端只读取 `published` 活动。 |
| 审核与修改记录 | MySQL `campaign_audit` | 每次成功写入保存操作人、操作类型和对应的活动快照。 |
| AI 建议 | MySQL `ai_proposals` 与浏览器表单 | 独立保存原需求和建议，应用并保存后通过提案 ID 关联到该次活动修订。 |

服务端根据时间区间、适用机型、App 版本和用户状态计算候选，再按优先级决定一个获胜活动。AI 负责把自然语言转成结构化建议。投放和审核由业务规则、状态机和数据库事务控制。

## 从哪开始

使用 Node.js 24 和 MySQL 8.4，浏览器页面使用原生 HTML 与 JavaScript，方便逐步调试看见请求和返回值。工作坊附一套完整参考源码，克隆博客仓库后可以复制 `lab/ai-ops-workshop/`，博客发布后也可按第一章的命令下载。每章先跑通目标场景，再按文件地图重写或修改本章代码，最后按验收项截图或保留命令输出。

[开始第一章](/blog/posts/ai-ops-workshop-01-setup/) · [AI 运营投放合集](/blog/ai-ops-workshop/) · [项目实践](/blog/projects/)
