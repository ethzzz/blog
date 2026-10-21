---
title: '10 · 消息队列与定时任务'
published: 2026-10-13T19:00:00+08:00
description: 'Node 异步任务体系：BullMQ + Redis 实现消息队列、延迟任务与重试策略、消费幂等设计、@nestjs/schedule 定时任务与分布式锁，把耗时操作移出请求链路。'
tags: [Node.js, BullMQ, Redis, 队列]
category: Node全栈学习路线
draft: false
---

> [!NOTE]
> "发一封欢迎邮件要 3 秒，能不能让注册接口别等它？"——这是我第一次引入队列的动机。后来发现队列能做的远不止：削峰、重试、延迟、解耦。定时任务则是另一半故事：每天凌晨的统计、每小时的缓存刷新。这一篇用 BullMQ 把这两件事一起讲透。

---

## 1. 为什么需要队列：同步请求链路的极限

看一个同步设计的退化过程：

```text
注册接口同步做：写用户表 → 发欢迎邮件(3s) → 发短信(2s) → 初始化积分(0.5s)
→ 接口响应 5.5s，用户早就走了；短信服务商抖动 → 注册直接失败
```

队列的本质是**把"必须现在做完"和"最终要做完"分开**：

```text
注册接口：写用户表(50ms) → 投递消息(1ms) → 返回 ✅
后台 worker：消费消息 → 发邮件/短信/积分，失败自动重试
```

选型上我一句话带过：**BullMQ（基于 Redis）** 适合绝大多数中小项目，轻量、TS 友好、Nest 官方集成；Kafka/RocketMQ 是日均百万级消息的大数据场景，起步成本高，别为了简历引入。

## 2. BullMQ 核心用法

生产者（接口里投递）：

```ts
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL);
export const mailQueue = new Queue('mail', { connection });

// 注册成功后投递，而不是同步发邮件
await mailQueue.add('welcome', { userId: user.id }, {
  delay: 5_000,            // 5 秒后才执行
  attempts: 3,             // 最多尝试 3 次
  backoff: { type: 'exponential', delay: 5_000 },  // 5s → 10s → 20s 指数退避
  removeOnComplete: 1000,  // 保留最近 1000 条完成记录，防 Redis 膨胀
});
```

消费者（worker 进程）：

```ts
import { Worker } from 'bullmq';

const worker = new Worker('mail', async (job) => {
  const { userId } = job.data;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;                       // 用户可能已注销，跳过
  await sendWelcomeMail(user.email);
}, { connection, concurrency: 5 });        // 同时处理 5 个任务
```

Nest 有官方封装 `@nestjs/bullmq`，把 Queue 注册成 Provider、Worker 用 `@Processor('mail')` 装饰器声明，思想同第 04 篇的 DI 一脉相承。

**延迟任务**是队列送的彩蛋：`delay` 字段即成，比 cron 轮询数据库优雅得多。典型场景：注册 30 分钟未验证邮箱就清理、下单 15 分钟未支付自动取消——一条 `delay: 15*60*1000` 的消息搞定。

## 3. 幂等：队列可靠性的一半在这里

队列保证的是**至少一次**投递——意味着消息可能重复（超时重投、worker 崩溃重跑）。所以消费逻辑必须幂等：**同一个消息执行两次，结果和一次相同**。

我的标准手法是**唯一键去重表**：

```ts
const worker = new Worker('mail', async (job) => {
  const dedupeKey = `mail:welcome:${job.data.userId}`;
  // SET NX：不存在才设置成功，天然原子
  const first = await redis.set(dedupeKey, '1', 'EX', 86400, 'NX');
  if (!first) { job.discard(); return; }   // 已处理过，直接跳过
  await sendWelcomeMail(user.email);
});
```

业务级幂等更彻底：数据库唯一索引兜底（如 `order_no` 唯一，重复插入直接报错被捕获为"已处理"）。三个必须幂等的场景清单：支付回调（第三方会重发 N 次）、消息消费、任何带重试的出站调用。**"至少一次 + 消费幂等"是分布式消息的正确心智模型**，别幻想"恰好一次"。

重试策略也有讲究：网络抖动类错误值得重试（配指数退避），参数错误类错误重试一万次也没用——用 `UnrecoverableError` 标记后直接进死信（failed 队列），配合告警人工介入。

## 4. @nestjs/schedule：定时任务

简单周期任务用 Nest 官方的 schedule 模块：

```ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';

@Injectable()
export class StatsTask {
  // 每天凌晨 2 点跑统计
  @Cron('0 0 2 * * *')
  async dailyStats() {
    await this.statsService.aggregate();
  }

  // 每 10 分钟刷新热门文章缓存
  @Interval(600_000)
  async refreshHot() { ... }
}
```

Cron 表达式六位：`秒 分 时 日 月 周`（注意比 Linux 多了秒位，我从 Linux 过来时栽过）。用命名常量 `CronExpression.EVERY_HOUR` 可读性更好。

**单机够用，多实例是坑**：PM2 集群或 K8s 多副本时，同一个任务会被每个实例跑一遍——统计翻倍、邮件发 N 份。解法是分布式锁：

```ts
@Cron('0 0 2 * * *')
async dailyStats() {
  const locked = await redis.set('lock:daily-stats', instanceId, 'EX', 3600, 'NX');
  if (!locked) return;              // 别的实例已抢到
  try { await this.statsService.aggregate(); }
  finally { await redis.del('lock:daily-stats'); }
}
```

或者更干脆：**worker 进程不参与集群**，定时任务只在专用的 single 实例上注册（PM2 里单独定义一个 `cron-app` 进程）——简单可靠，我多数项目都用这招。

## 5. 监控与可观测

队列是异步的，"坏了你不知道"是最大风险，三件套配齐：

1. **失败告警**：监听 `worker.on('failed')`，接入第 07 篇的日志 + 钉钉/企微机器人。
2. **Bull Board**：一个现成的仪表盘（`@bull-board/nest`），看队列深度、失败任务、重试状态，出问题先看板。
3. **死信处理**：重试耗尽的任务进 failed，写个后台任务定期导出到数据库，别让 Redis 无限堆积。

---

## 小结

- 队列把耗时/易错操作移出请求链路：注册 50ms 返回，邮件后台发。
- BullMQ + Redis 是中小项目标配；`delay` 天然支持延迟任务。
- 队列语义是"至少一次"，消费必须幂等（SET NX 去重 + DB 唯一索引兜底）。
- 不可恢复错误用 `UnrecoverableError` 直进死信，别浪费重试。
- 多实例部署下定时任务要分布式锁或专用单实例进程。

---

## 练习

1. 把注册接口的欢迎邮件改成队列投递，用 `console.time` 对比接口耗时变化。
2. 实现"15 分钟未验证邮箱自动清理"延迟任务，故意把 delay 调成 10 秒加速验证。
3. 给消费者加幂等：手动投递两条相同 userId 的消息，确认邮件只发一封。
4. 用 PM2 起 2 个实例跑定时任务，观察日志发现任务跑了两次，再加分布式锁修复——亲手踩一遍这个坑。
