---
title: '02 · 客户端封装工程化'
published: 2026-10-14T11:00:00+08:00
description: 'LLM 客户端工程化：自封装客户端 vs 官方 SDK 的取舍、多 Key 池轮询实现、429 限流指数退避重试、超时与降级策略，以自研 QwenClient 为完整案例。'
tags: [AI应用, LLM, 容错, TypeScript]
category: AI应用开发学习路线
draft: false
---

> [!NOTE]
> 这篇是整条路线里我写得最有底气的一篇：我的 QwenClient 在自托管知识库里跑了快两年，扛过免费额度用尽、单日百万 token 的批量任务和无数次 429。SDK 能帮你的是"发请求"，帮不了你的是"活下来"。

---

## 知识地图

- 自封装 vs SDK：什么时候该自己写
- 多 Key 池：轮询、健康度、冷却
- 429 处理：指数退避 + 抖动，避免重试风暴
- 超时、取消与降级：失败时给用户什么

---

## 1. 自封装还是用 SDK

先说结论：**demo 用 SDK，生产看你自己的需求**。官方 SDK（openai 兼容包、dashscope-sdk）解决的是报文拼装和类型定义，好处是省事、跟官方接口同步。但它默认假设你只有一把 Key、不需要精细的失败策略、不需要统计每笔 token 开销。

| 维度 | 官方 SDK | 自封装 |
| --- | --- | --- |
| 接入速度 | 快 | 慢半天 |
| 多 Key 池 | 自己想办法 | 原生支持 |
| 重试策略 | 粗粒度全局配置 | 按错误码精细控制 |
| token 统计/审计 | 无 | 想记什么记什么 |
| 换供应商 | 重学 SDK | 改 BASE_URL |

我在做知识库 AI 功能时选择自封装，核心理由就一条：**免费/多渠道额度拼着用**。当时手上有一个 DashScope 主 Key 和两个活动送的备用 Key，单 Key 的 QPM 限制根本撑不起批量摘要任务，轮询是刚需。

## 2. 多 Key 池轮询

### 2.1 最小实现：轮转 + 失败降权

```ts
interface KeyState {
  key: string;
  cooldownUntil: number; // 冷却截止时间戳
  failCount: number;
}

export class KeyPool {
  private keys: KeyState[];
  private cursor = 0;

  constructor(keys: string[]) {
    this.keys = keys.map((key) => ({
      key,
      cooldownUntil: 0,
      failCount: 0,
    }));
  }

  acquire(): string {
    const now = Date.now();
    for (let i = 0; i < this.keys.length; i++) {
      const k = this.keys[(this.cursor + i) % this.keys.length];
      if (k.cooldownUntil <= now) {
        this.cursor = (this.cursor + i + 1) % this.keys.length;
        return k.key;
      }
    }
    throw new Error("所有 Key 均在冷却中");
  }

  report(key: string, ok: boolean) {
    const k = this.keys.find((s) => s.key === key);
    if (!k) return;
    if (ok) {
      k.failCount = 0;
    } else {
      k.failCount++;
      // 429 冷却 60s，连续失败翻倍
      k.cooldownUntil =
        Date.now() + 60_000 * Math.pow(2, k.failCount - 1);
    }
  }
}
```

### 2.2 我踩过的坑

- **轮询不等于负载均衡**。如果三把 Key 的 QPM 限额不同（比如主 Key 60、备用 Key 各 10），纯轮询会让小额度 Key 秒挂。我的做法是给 KeyState 加一个 `weight`，按权重间隔发放。
- **冷却时间别写死**。有些平台的 429 响应头里带 `x-ratelimit-reset-remaining`，能拿到就用它，比拍脑袋猜 60 秒准得多。
- **Key 池状态不要放内存就完事**。Serverless 环境（Vercel 函数）实例随时冷启动，内存里的冷却状态会丢。我最后把健康度记在 SQLite 里，代价是多一次查询。

## 3. 429 与退避重试：最容易写出事故的地方

### 3.1 为什么"直接重试 3 次"是错的

新手写法：

```ts
// ❌ 反面教材
for (let i = 0; i < 3; i++) {
  try {
    return await callLLM();
  } catch (e) {
    if (e.status === 429) continue; // 立刻重试
  }
}
```

问题在哪？假设你的 QPM 是 60（每秒 1 次），超过限额后**每一毫秒的立刻重试都在加深限流**。更糟的是，如果你有 10 个并发 worker 都在这么写，服务端会看到每秒几千次的请求——这就是**重试风暴**，轻则你的 IP/账号被拉黑更久，重则把额度打穿产生真实扣费（部分平台 429 不扣费，但 5xx 重试是会正常计费的）。

### 3.2 正确姿势：指数退避 + 抖动

```ts
async function withRetry<T>(
  fn: () => Promise<T>,
  opts: { maxRetries?: number; baseMs?: number } = {},
): Promise<T> {
  const maxRetries = opts.maxRetries ?? 3;
  const baseMs = opts.baseMs ?? 1000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e: any) {
      const retryable =
        e.status === 429 || e.status >= 500 || e.code === "ECONNRESET";
      if (!retryable || attempt === maxRetries) throw e;

      // 指数退避 + 随机抖动，防止多个 worker 同步重试
      const backoff = baseMs * Math.pow(2, attempt);
      const jitter = Math.random() * backoff * 0.5;
      await new Promise((r) => setTimeout(r, backoff + jitter));
    }
  }
  throw new Error("unreachable");
}
```

三个关键点：

1. **指数退避**：1s → 2s → 4s，给服务端喘息时间。
2. **抖动（jitter）**：加了随机量后，100 个并发 worker 的重试时间会散开，不会聚成第二波尖峰。这是我学到 AWS 架构博客里的一课。
3. **只重试可重试错误**：400（参数错）、401（Key 无效）重试一万次也不会成功，直接抛出。我见过有人把 401 也放进重试列表，10 个 Key 全废了还在空转。

## 4. 超时与降级

### 4.1 超时要分级

```ts
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 60_000); // 非流式 60s
try {
  const res = await fetch(url, { ...opts, signal: controller.signal });
  // ...
} finally {
  clearTimeout(timer);
}
```

我踩的坑：**非流式和流式的超时策略必须分开**。非流式一次请求可能要 30s（长文摘要），流式的"总时长"不可预知，应该用**空闲超时**——两次 chunk 之间超过 15s 没数据才算超时（04 篇流式实现里会给代码）。

### 4.2 降级：失败时给用户什么

所有重试都失败后，别把用户晾在报错页。我的知识库摘要功能是这么降级的：

| 失败场景 | 降级动作 |
| --- | --- |
| LLM 超时/不可用 | 返回"正文前 200 字截断"作为摘要，标注"简版" |
| 输出校验失败 | 返回纯文本，跳过结构化渲染 |
| 全部 Key 冷却 | 任务进队列延迟执行，UI 显示排队中 |

核心原则：**AI 功能失败时，产品要还能用，只是体验降一档**。用户可以接受"摘要比较笨"，不能接受"页面挂了"。

## 5. 并发批处理：比单次调用更难的场景

前面讲的都是"一次处理一个请求"，但真实产品里还有另一类任务：批量处理。比如"给知识库里 300 篇文章全部生成摘要"，这类任务的工程挑战和交互式请求完全不同，值得单独一节。

### 5.1 队列而不是循环

新手写法是一个 `for` 循环 `await` 300 次——问题很大：单线程串行要跑几个小时；中途任何一次崩溃，前面跑过的全部作废（除非有断点记录）；速率不可控，容易触发限流。

我的做法是一个简单的内存队列 + 并发上限 + 断点续跑：

```ts
async function runBatch<T>(
  items: T[],
  worker: (item: T) => Promise<void>,
  concurrency = 3,
) {
  let index = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (index < items.length) {
        const item = items[index++];
        try {
          await worker(item);
        } catch (e) {
          console.error("失败，稍后重试：", item, e);
          items.push(item); // 失败的排到队尾再试
        }
      }
    }),
  );
}
```

三个设计点：**并发上限 3** 是试出来的甜点值（太高触发限流，太低跑不完）；**失败重新入队**而不是终止整个批次；配合内容哈希缓存（09 篇），重跑时已成功的项直接跳过，等效于断点续跑。

### 5.2 批处理专用的三件套

- **进度持久化**：每完成一项就写状态到 SQLite，进程挂了重启后跳过已完成项。300 篇的任务我中断过三次（部署、断网、手滑），没有这个机制早就崩溃了。
- **速率预算**：批量任务按"每秒 N 次请求"的令牌桶控制节奏，而不是依赖被 429 之后再退避——主动排队比被动挨打优雅得多。
- **与在线流量隔离**：批量任务和用户实时请求共用同一个 Key 池会互相挤兑。我的做法是给批处理单独一把 Key（或单独的 Key 池权重），互不干扰。

## 6. 客户端限流：主动排队优于被动挨打

重试策略解决的是"被 429 之后怎么办"，更高明的做法是**根本不触发 429**——在客户端做主动限流。一个简单的令牌桶：

```ts
class RateLimiter {
  private tokens: number;
  private last = Date.now();

  constructor(
    private capacity: number,  // 桶容量（突发上限）
    private refillPerSec: number, // 每秒补充量 = 平稳速率
  ) {
    this.tokens = capacity;
  }

  async acquire(): Promise<void> {
    while (true) {
      const now = Date.now();
      this.tokens = Math.min(
        this.capacity,
        this.tokens + ((now - this.last) / 1000) * this.refillPerSec,
      );
      this.last = now;
      if (this.tokens >= 1) {
        this.tokens -= 1;
        return;
      }
      await new Promise((r) => setTimeout(r, 100));
    }
  }
}

// 平台限流 60 QPM = 1 QPS，留 20% 余量
const limiter = new RateLimiter(5, 0.8);
await limiter.acquire();
const result = await chat(messages);
```

把限流器放进 02 篇的调用链：`gatewayChat → limiter.acquire() → withRetry(callLLM) → KeyPool`，四层防线依次是主动排队、退避重试、多 Key 分流、最终降级。我的批处理任务和在线流量就靠这个组合隔离，两年没再出过连环 429。

一个配套的认知：**限流参数要按"最紧的那把 Key"配置**。Key 池里只要有权限额最低的 Key 被共享轮询，整体速率就得迁就它。这也是我建议 Key 池支持权重的根本原因——不同额度的 Key 混用，均匀轮询必然是错的。

### 5.3 一个完整案例：批量摘要任务的参数实录

把 5.1 和 5.2 的结论落到真实数字上。我的 300 篇文章批量摘要任务的最终参数：并发 3、令牌桶 0.8 QPS、qwen-turbo 模型、每篇 max_tokens 300、失败重排队上限 2 次、SQLite 记录逐篇状态。实测耗时约 25 分钟，消耗约 40 万 token，按当时价格不到 1 元，失败 4 篇（均为超长文）自动重跑后全部成功。

这组数字想说明的是：批处理任务的工程参数没有标准答案，但**必须有意识地选择并记录**。我见过太多次"就跑一次"的批处理脚本因为没有并发限制把在线流量打挂、或没有断点记录导致第三次重跑。哪怕是最简单的 `runBatch`，加上并发上限和状态落库这两件事，它就从"一次性脚本"变成了可信赖的工具。

最后给一份客户端封装的完成度自检：请求发出前（Key 从池获取、限流器排队、超时已设置）、请求中（流式与非流式分开超时、AbortSignal 可取消）、响应后（usage 落账、错误分级、退避重试带抖动）、全部失败后（降级路径执行、告警上报）。四段都有实现，这个客户端才算生产级——对照检查你的实现，缺哪段补哪段。

---

## 小结

- demo 用 SDK 没问题，生产环境自封装换来的多 Key、精细重试和 token 审计都值回成本。
- Key 池 = 轮转发放 + 失败冷却，注意权重和状态持久化。
- 429 处理铁律：指数退避 + 抖动 + 只重试可重试错误，否则就是重试风暴。
- 超时分非流式（总时长）和流式（空闲超时）两套；每个 AI 功能都要设计好降级路径。

---

## 练习

1. 把 `KeyPool` 和 `withRetry` 组装进你 01 篇写的 `chat()`，用两把（哪怕一把假）Key 测试轮询逻辑。
2. 写一个脚本以 20 并发轰自己的接口，分别在"无退避"和"有退避+抖动"两种实现下统计请求时间分布，直观感受重试风暴。
3. 给你的客户端加 `AbortController` 超时，并模拟服务端 hang 住（比如请求一个不存在的地址），验证中断路径。
4. 为你的某个 AI 功能设计一张降级表：哪些场景、什么动作、用户看到什么。
