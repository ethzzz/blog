---
title: '02 · 规则引擎与六人投放预演'
published: 2026-11-28T09:10:00+08:00
description: '逐用户计算候选、排除理由和预计获胜结果，验证版本比较、时间边界和修改前后的人群差异。'
tags: [项目实战, 规则引擎, 投放, 自动化测试]
category: AI运营投放实战
draft: false
---

> [!NOTE]
> [上一篇：手工建活动](/blog/posts/ai-ops-workshop-01-setup/) · [下一篇：审核发布](/blog/posts/ai-ops-workshop-03-release/) · [合集](/blog/ai-ops-workshop/)

同一时点可以有多个活动符合某位用户。预演需要回答「这个人是否匹配当前草稿」和「当前草稿发布后有没有机会赢过已发布活动」。两种结果分别显示，避免把候选人数当成最终曝光人数。

## 1. 先写出人工预期

使用默认预演时点 `2026-12-03T04:00:00Z`。草稿仅面向 Link 2、最低版本 2.5.0、已激活且尚未完成引导的用户，优先级 20。通用引导优先级 10，在同一时段内运行。

| 用户 | 机型 | App 版本 | 激活 / 引导完成 | 草稿预期 |
| --- | --- | --- | --- | --- |
| u01 | LINK2 | 2.5.0 | 是 / 否 | 命中并预计获胜 |
| u02 | LINK2 | 2.4.9 | 是 / 否 | 版本过低 |
| u03 | LINK2 | 2.10.0 | 是 / 否 | 命中并预计获胜 |
| u04 | LINK2 | 2.5.0 | 否 / 否 | 未激活 |
| u05 | LINK2 | 2.5.0 | 是 / 是 | 已完成引导 |
| u06 | LINK2C | 2.5.0 | 是 / 否 | 机型不符 |

## 2. 实现规则与解释

1. 在 `rules.mjs` 实现 `instant` 和 `compareVersions`。时间只收完整 UTC 时间戳，再用 `toISOString()` 对照，拦住会被日期解析器进位的非法日期。版本逐段转数字比较，保证 2.10.0 在 2.5.0 之后。
2. 让 `reasons(config, user, at)` 返回排除原因数组。把 u06 同时改成未激活，验证两个原因都出现。规则顺序不改变结果，数组顺序便于界面渲染和断言。
3. 写 `resolve`，从满足条件的已发布活动里按优先级选一条。普通预演用 `preview` 复用同一套匹配逻辑。候选草稿比现有胜出者优先级更高时，标记预计获胜。相同优先级且排期重叠由发布接口统一拒绝。
4. 在页面按「预演」。把预演时点设为草稿结束时刻 `2026-12-04T12:00:00Z`，应看到 0 人命中。排期使用半开区间 `[开始, 结束)`，下一批活动可以从上一批的结束时刻接续。

函数调用关系：

```js
const at = instant("2026-12-03T04:00:00Z");
const live = [{ id: "baseline", config: fallback }];
const before = preview(demo, audience, live, at);
const after = preview({ ...demo, minAppVersion: "2.4.0" }, audience, live, at);
console.log(compare(before, after));
// { added: ["u02"], removed: [] }
```

其中 `demo`、`audience`、`fallback` 来自 `fixtures.mjs`，其余函数来自 `rules.mjs`。正式 API 用 `POST /api/preview` 接收 `{config, at}`，用 `POST /api/compare` 接收 `{before, config, at}`。编辑现有活动可加 `excludeId`，让预演时不把它当前的发布版本当作竞争活动。

## 验收

```bash
npm test
```

- [ ] 版本边界、排期边界与六人预演结果和表格一致。
- [ ] 最低版本从 2.5.0 调到 2.4.0，同一时点仅新增 u02。
- [ ] 选回通用活动，在「查看线上结果」查 u01。草稿尚未发布时，实际结果仍为通用引导。
- [ ] 将优先级改成 10，预演应显示与通用引导排期冲突。

参考源码。 [rules.mjs](/blog/ai-ops-workshop/rules.mjs) · [rules.test.mjs](/blog/ai-ops-workshop/rules.test.mjs)
