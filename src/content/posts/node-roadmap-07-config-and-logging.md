---
title: '07 · 配置与日志'
published: 2026-10-13T16:00:00+08:00
description: 'Node 服务端配置与日志最佳实践：多环境配置管理、pino 结构化日志、请求链路 ID 用 AsyncLocalStorage 贯穿、敏感信息脱敏，让线上问题可排查。'
tags: [Node.js, pino, 日志, 配置]
category: Node全栈学习路线
draft: false
---

> [!NOTE]
> "接口偶现 500，麻烦查一下。"——没有日志的服务，你只能回"本地复现不了"。我在维护别人老项目时深受其害：密码打印在日志里、日志是 console.log 零散文本、一次请求三条日志来自三个用户根本对不上。这一篇讲怎么从第一天就把配置和日志做对，它是排障能力的地基。

---

## 1. 配置管理：环境变量是唯一真理源

第一条铁律：**配置与代码分离，敏感信息绝不进 git**。我见过把数据库密码写死在代码里推上 GitHub 的项目——三个月后机器人扫到，库被脱光。分层方案：

```text
config/
├── .env.example      # 模板：只有 key 和注释，进 git
├── .env.development  # 开发配置：可以进 git（无敏感信息）
└── .env.production   # 生产配置：只在服务器/CI 密钥库里，不进 git
```

```bash
# .env.example
DATABASE_URL=mysql://user:pass@host:3306/blog   # ⚠️ 生产用密钥注入
JWT_SECRET=change-me-32-chars-random
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
```

Nest 的标准做法是 `@nestjs/config`，配合一个带校验的配置模块：

```ts
// config/configuration.ts —— 集中定义 + 默认值
export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: { url: process.env.DATABASE_URL },
  jwt: { secret: process.env.JWT_SECRET, expiresIn: '15m' },
});

// 启动时校验：缺关键配置直接拒绝启动（fail fast）
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required(),
        PORT: Joi.number().default(3000),
      }),
    }),
  ],
})
```

为什么强调"缺配置就崩"：带默认值静默跑起来的服务，比如 JWT_SECRET 兜底成 `change-me`，等于没上锁——**启动期崩溃永远好于运行期事故**。

## 2. 为什么 console.log 不够：结构化日志

`console.log('用户登录成功', userId)` 的问题：人类可读、机器不可查。线上日志动辄百万行，你需要的是能 `grep`、能进 ELK 检索的**结构化日志（JSON 每行一条）**。我选 pino：快（号称 Node 生态最快）、生态全、Nest 一等支持。

```ts
import { pino } from 'pino';
const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: { paths: ['password', '*.password', 'req.headers.authorization'], censor: '[REDACTED]' },
});

logger.info({ userId: 42, action: 'login' }, '用户登录成功');
// 输出：{"level":30,"time":"2026-10-13T08:00:00.000Z","userId":42,"action":"login","msg":"用户登录成功"}
```

三个细节都是坑里来的：

- **redact 必须从第一天配**。密码、token、身份证号一旦打出去就是安全事故。我接手的每个项目第一件事就是查一遍日志里有没有密码。
- **日志分级纪律**：`error`（需要人处理）、`warn`（可疑但能自愈）、`info`（关键业务节点）、`debug`（开发期细节）。生产 level 设 info，别把 debug 上线——日志量会把磁盘打满。
- **别在循环里 info**。批量任务打一行汇总即可，日志是排障工具不是流水账。

## 3. 请求链路 ID：把散落的日志串成一条线

问题：一个请求经过 Controller → Service → Prisma，打了三条日志，怎么知道是同一次请求？答案：**每个请求进来时生成唯一 traceId，随日志输出**。难点是"怎么在任意深度的代码里拿到 traceId 而不层层传参"——`AsyncLocalStorage` 正是为此而生：

```ts
// tracing.middleware.ts
import { AsyncLocalStorage } from 'node:async_hooks';
export const als = new AsyncLocalStorage<{ traceId: string }>();

export function tracingMiddleware(req, res, next) {
  const traceId = (req.headers['x-request-id'] as string) ?? crypto.randomUUID();
  als.run({ traceId }, () => next());   // 这个"上下文"对整个请求生命周期可见
}

// 任意业务代码里，不用传参就能取
export function getLogger() {
  const store = als.getStore();
  return logger.child({ traceId: store?.traceId });
}
```

```ts
// service 深处
await getLogger().info({ postId }, '文章已发布');
// 每条日志自动带上 traceId，搜一个 ID 就能还原整个请求
```

再进一步：**让 nginx/网关生成 `x-request-id` 传进来，响应头原样返回**。这样用户报障时给你一个 ID（或者前端把响应头里的 ID 带上），你能直接搜出完整链路。这是我把排障时间从小时级降到分钟级的最大单项改进。

Nest 生态里可以直接用 `nestjs-pino` 包，它内置了请求日志（自动记录 method/url/status/耗时）和 `PinoLogger` 注入，原理同样是 ALS，但省去手写。

## 4. 日志落盘与轮转

写文件不是 `fs.appendFile` 那么简单——并发写、单文件过大、按天切割都要管。方案是**管道转发**：pino 输出到 stdout，由进程管理器（PM2）或 Docker 收集：

```ts
// 应用内：只管写 stdout（12 篇部署时 Docker 会收集）
// 容器外：pm2 日志轮转
// ecosystem.config.js 里 pm2-logrotate 模块：
//   max_size: '100M'（单文件上限）, retain: 14（保留 14 个）, compress: true
```

或者用 pino-roll 直接按天写文件。我的取舍：**容器部署走 stdout + 收集器（灵组织/EFK），传统服务器部署用 pm2-logrotate**。反面教材是我维护过的项目：单文件 20GB，vim 打开直接卡死，只能 `tail -c` 硬抠。

---

## 小结

- 配置走环境变量 + `.env` 分层，启动时 schema 校验，缺配置直接崩。
- 结构化日志（pino）取代 console.log，redact 从第一天配，分级有纪律。
- AsyncLocalStorage 实现无传参的 traceId 贯穿，响应头回传实现全链路对账。
- 日志走 stdout 由基础设施收集，或 pm2-logrotate 轮转，防止单文件失控。

---

## 练习

1. 给博客项目接 `@nestjs/config` + Joi 校验，删掉 `JWT_SECRET` 试着启动，观察 fail fast 行为。
2. 换掉项目里所有 `console.log` 为 pino，配置 redact 把 password 字段打码，写个接口验证。
3. 实现 tracingMiddleware，用两个并发请求验证日志里 traceId 互不串扰。
4. 做一个实验：在一个请求里 `setTimeout` 回调中用 `als.getStore()` 取 traceId，验证异步上下文依然保留（这正是 ALS 比"全局变量"强的地方）。
