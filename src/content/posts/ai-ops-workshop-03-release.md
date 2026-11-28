---
title: '03 · 审核发布、排期冲突与下线'
published: 2026-11-28T09:15:00+08:00
description: '分离运营与审核权限，用修订号防止覆盖，通过 MySQL 投放位锁解决并发发布，并用审计记录查回历史。'
tags: [项目实战, RBAC, MySQL, 状态机]
category: AI运营投放实战
draft: false
---

> [!NOTE]
> [上一篇：人群预演](/blog/posts/ai-ops-workshop-02-preview/) · [下一篇：AI 草稿](/blog/posts/ai-ops-workshop-04-assistant/) · [合集](/blog/ai-ops-workshop/)

运营提交草稿之后，审核员可以退回或发布。发布成功后，同一组模拟用户能看到新的线上结果。对一个有问题的高优先级活动执行下线，原先的通用引导会重新成为获胜者。

## 1. 先跑通两个角色

| 命令 | 操作者 | 原状态 → 目标状态 |
| --- | --- | --- |
| 保存 | 运营员 | 新建或更新 `draft` |
| `submit` | 运营员 | `draft → in_review` |
| `return` | 审核员 | `in_review → draft` |
| `publish` | 审核员 | `in_review → published` |
| `offline` | 审核员 | `published → offline` |

1. 使用 `operator-local` 保存默认草稿并提交。此时选择 u01 点击「查看线上结果」，还是通用引导。
2. 切换 `reviewer-local` 退回一次，检查修改记录中是否出现 `return`。切回运营修改文案并重新提交。
3. 审核员先在默认时点预演，再发布。u01 应得到新素材，u02 仍得到通用引导。点「打开演练素材」查看目标地址。上线结果读取的是数据库里的发布快照，即使有人在表单里输入改动，也要重新走发布流程才会生效。
4. 切回审核员执行「下线」。在同一时点查询 u01，重新回到通用引导。练习中的下线会保留原活动状态和历史，通过新草稿完成后续修订。

## 2. 用事务处理过期审核和并发发布

活动编辑和状态变化都带 `revision`。收到请求后锁定目标活动行，核对修订号、当前状态和角色。更新活动与审计快照在同一事务完成，任意一条写入失败会一起回滚。

发布还要先锁定 `placements` 中的 `home-banner` 行，再锁定目标活动。两个草稿即使是不同活动 ID，也会在同一投放位上串行检查。首版策略是同投放位、同优先级、时段重叠即拒绝。优先级不同的通用活动和定向活动可以并存。 [MySQL InnoDB 锁定读](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html)

```text
BEGIN
锁投放位 home-banner
锁待审活动并核对 revision
查询已发布活动和时间冲突
更新活动状态为 published
插入带本次 revision 的审计快照
COMMIT
```

打开两个浏览器窗口，使用审核员加载同一条待审活动。在第一个窗口发布，在第二个窗口再提交旧修订，接口应返回 `409 STALE_REVISION`。两个独立活动同时发布的场景由冒烟脚本覆盖。前端遇到 409 后刷新活动状态，再决定修改优先级、排期或返回草稿。

## 验收

```bash
npm run smoke
```

测试使用 `ops_workshop_test`，由脚本在随机回环端口启动工作台。测试完成后按本轮创建的活动 ID 清理记录，保留公共的通用引导种子。自管 MySQL 需要预先创建测试库并授权。自定义库名可设 `TEST_DB_NAME=ops_workshop_test_ci`。

- [ ] 运营员尝试发布返回 403，旧修订返回 409。
- [ ] 两条同优先级且重叠的活动同时发布时，一条成功，另一条收到 `SAME_PRIORITY_WINDOW_CONFLICT`。
- [ ] 发布的活动仅有一条发布审计；下线之后，u01 在同一演练时点读到通用引导。

参考源码。 [db.mjs](/blog/ai-ops-workshop/db.mjs) · [smoke.mjs](/blog/ai-ops-workshop/smoke.mjs)
