---
title: '01 · LLM API 基础'
published: 2026-10-12T10:00:00+08:00
description: 'LLM API 基础：chat completions 报文结构、temperature 与 top_p 采样参数、token 与计费原理、上下文窗口管理。读懂任何一家大模型 API 文档的第一步。'
tags: [AI应用, LLM, API, token]
category: AI应用开发学习路线
draft: false
---

> [!NOTE]
> 一切 AI 应用的起点都是一个 HTTP 请求。这篇把 chat completions 的报文、采样参数、token 计费、上下文窗口讲透——读懂这一篇，OpenAI、Qwen、DeepSeek、Kimi 的文档你都能直接上手，因为它们全都在抄同一个接口设计。

---

## 知识地图

- 报文结构：messages 数组与三种角色
- 采样参数：temperature、top_p 到底在控制什么
- token：计费单位、上下文窗口、估算方法
- 一次完整请求的 request/response 全解剖

---

## 1. chat completions 报文结构

所有主流模型的对话接口几乎长一个样。以 Qwen（DashScope 兼容模式）为例：

```ts
const res = await fetch(
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.QWEN_API_KEY}`,
    },
    body: JSON.stringify({
      model: "qwen-plus",
      messages: [
        { role: "system", content: "你是一个严谨的技术翻译。" },
        { role: "user", content: "把这段话翻译成英文：流式输出" },
        { role: "assistant", content: "Streaming output" },
        { role: "user", content: "再翻译一次：重试机制" },
      ],
      temperature: 0.3,
    }),
  },
);
const data = await res.json();
console.log(data.choices[0].message.content);
```

三个要点：

1. **messages 是无状态的**。模型不记得上一轮说过什么，所谓"多轮对话"就是每次把历史全部重发一遍。这是我刚开始最不适应的一点——习惯了自己维护状态，但这里状态全在你的客户端。
2. **system / user / assistant 三种角色**。system 定人设和规则，user 是用户输入，assistant 是模型（或你伪造的）历史回复。few-shot 就是靠伪造 assistant 消息实现的（03 篇细讲）。
3. **返回结构里最该看的是 `usage`**：

```json
{
  "choices": [{ "message": { "role": "assistant", "content": "Retry mechanism" } }],
  "usage": {
    "prompt_tokens": 48,
    "completion_tokens": 3,
    "total_tokens": 51
  }
}
```

## 2. temperature 与 top_p：控制"随机性"的两个旋钮

这两个参数是我见过被滥用最多的。先建立直觉：模型每生成一个 token，都是从词表里按概率分布"抽签"。temperature 和 top_p 控制的就是这次抽签有多激进。

| 参数 | 作用 | 直觉 |
| --- | --- | --- |
| temperature | 对概率分布做缩放，值越小分布越尖 | 0 = 每次都选最高概率词（近乎确定）；1+ = 抽签更随机 |
| top_p | 只从累积概率前 p 的词里抽 | 0.9 = 砍掉长尾 10% 的冷门词 |

**我的实战经验：**

- **翻译、抽取、分类、JSON 生成**：temperature 0 ~ 0.3。这类任务要的是稳定，两次输出不一致就是事故。我的翻译功能固定用 0.1。
- **写作、头脑风暴**：0.7 ~ 1.0。太低会写出千篇一律的车轱辘话。
- **temperature 和 top_p 不要同时大调**。文档里也这么建议。我一般只动 temperature，top_p 保持默认。

另一个坑：**temperature: 0 也不是 100% 确定性**。GPU 并行计算的浮点误差会导致偶发不同输出。要求严格可复现的场景（比如评测），只能容忍这点噪声，或者做好结果缓存（09 篇讲）。

## 3. token：计费单位与上下文窗口

### 3.1 token 是什么

模型不处理"字"，处理 token。中英文换算粗略经验：

- 英文：1 token ≈ 0.75 个单词
- 中文：**1 个汉字 ≈ 0.6 ~ 1 个 token**（不同模型 tokenizer 不同，Qwen 对中文比较友好）

精确计数用官方工具：OpenAI 有 tiktoken，Qwen 有对应 tokenizer 包。但日常开发用估算就够：**中文按 1 字 1 token 往上估，英文按 4 字符 1 token**。

### 3.2 计费怎么算

主流平台都是输入、输出分开计价，且**输出单价通常是输入的 3~5 倍**：

| 模型档位 | 输入价格（相对） | 输出价格（相对） |
| --- | --- | --- |
| 旗舰（qwen-max / gpt-4o 级） | 高 | 很高 |
| 中档（qwen-plus 级） | 低 | 中 |
| 轻量（qwen-turbo / mini 级） | 极低 | 低 |

这带来两个直接推论：

1. **Prompt 不是免费的**。系统提示词每轮都重发、都按输入计费。我见过 3000 token 的系统提示词 × 高频调用，光 system 部分一个月烧掉几百块。
2. **省钱优先砍输入，其次砍输出**。让模型"回答简洁"是真的在省钱。

### 3.3 上下文窗口

窗口 = 输入 + 输出共享一个总 token 上限（比如 128K）。超了直接报错，不是自动裁剪。

多轮对话的上下文增长是线性的：

```
第 1 轮: system(500) + user(200)                    → 输入 700
第 2 轮: system(500) + 历史(200+50) + user(200)      → 输入 950
第 3 轮: system(500) + 历史(450+80) + user(200)      → 输入 1230
```

所以我封装客户端时都会带一个 `truncateMessages` 工具：超过阈值时保留 system、丢最旧轮次、必要时把中间轮次摘要压缩。这个在 02 篇会写成代码。

## 4. 一次完整请求的解剖

把前面所有东西串起来，我实际项目里的最小可用请求封装：

```ts
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function chat(
  messages: ChatMessage[],
  opts: ChatOptions = {},
): Promise<string> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
    },
    body: JSON.stringify({
      model: opts.model ?? "qwen-plus",
      messages,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 2048,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM API ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0]?.message?.content ?? "";
}
```

注意 `max_tokens` 要显式设置：不设的话部分模型默认值很小，输出会被截断——我第一次遇到"回答总是一半就停"查了半天，最后发现是这个。

另外别在浏览器里直接调 API。**API Key 放前端等于公开**，生产环境必须走自己的服务端代理。报文结构、流式处理这些知识前后端通用，但密钥管理（12 篇）是底线问题。

## 5. 错误码速查与多平台差异

错误处理的前提是认识错误。我把三年里真实遇到过的错误码整理成表，建议存在你的 snippet 库里：

| 状态码 | 含义 | 典型原因 | 处理策略 |
| --- | --- | --- | --- |
| 400 | 请求参数错 | messages 结构非法、tool_calls 配对丢失 | 不重试，直接修代码 |
| 401 | 鉴权失败 | Key 错误、过期、额度类型不匹配 | 不重试，告警换 Key |
| 403 | 权限不足 | 模型未开通、地域限制 | 不重试，检查控制台配置 |
| 429 | 限流 | QPM/QPD 超限 | 指数退避重试（02 篇） |
| 500/503 | 服务端异常 | 平台抖动、模型过载 | 退避重试 1-2 次，仍失败走降级 |
| 200 但内容空 | 软失败 | max_tokens 太小、被安全策略拦 | 检查 finish_reason 字段 |

最后一条最阴险：HTTP 层面一切正常，`choices[0].message.content` 却是空串。这时候要去看 `finish_reason`——值为 `length` 说明输出被 max_tokens 截断，值为 `content_filter` 说明触发了内容审核。两种情况的处理完全不同：前者调大限制或改分段策略，后者是内容问题要走审核流程（12 篇）。我第一次遇到时对着空输出排查了一下午，最后发现平台把拒绝原因藏在了一个我从来没用过的字段里。

多平台差异方面，虽然接口协议高度趋同，但有几个容易踩的细节差异：模型名拼写各家不同且带版本后缀；`max_tokens` 有的平台上限极低需要显式调；流式 chunk 里部分平台会混入用量统计帧；错误码语义也有出入（同样是 429，有的平台限流窗口 1 秒、有的 1 分钟）。我的建议是把"平台差异"收敛在客户端封装里（02 篇），让业务代码面对统一的抽象。

## 6. 两个选型决策：流式与否、模型档位

### 6.1 什么时候用流式

流式不是默认必选。我的决策标准只有一条：**用户是否在盯着屏幕等结果**。交互式聊天、在线翻译、卡片生成——用户在等，必须流式（04 篇）；后台摘要、批量打标签、定时任务——没人盯着，用非流式，代码简单一半。我见过有人在定时任务里也写流式解析，白白承担了粘包和中断的复杂度，毫无收益。把流式当成"交互体验工具"而不是"接口高级功能"，取舍立刻清晰。

### 6.2 模型怎么选

同一个功能里模型选型的思考框架，用三个问题过滤：

1. **任务复杂度**：格式转换、简单摘要 → 轻量档；多约束生成、推理 → 中档以上。判断方法是先拿最便宜的模型试，质量不达标再升级——反过来"先上旗舰再说"是成本失控的开始。
2. **上下文长度需求**：全文翻译长文档时要确认模型的窗口够装（输入 + 输出），不够就得做分段策略，这会反过来影响整个功能设计。
3. **中文能力与合规**：面向国内用户的产品，Qwen/DeepSeek 这类国产模型的中文语感和审核合规都更省心，这一点在选型时权重应该高于跑分。

我的知识库实测数据可以参考：翻译用 qwen-plus 和 qwen-max 的盲测差异我几乎分辨不出，但价格差 4 倍——这类"盲测无感"的任务就是降档的空间。反过来，复杂的多文档综合问答，降档后错误率明显上升，这部分保持旗舰。**模型选型不是一次决定，而是每个功能单独测量后的分区决策。**

### 6.3 一次报文问题的排查方法

最后给一个通用排查技巧。AI 接口的报错信息往往只说"参数错误"，不说哪里错。我的排查三板斧：第一，把 request body 原样 curl 一遍，排除你封装层的变量；第二，curl 成功则 diff 你代码发出的 body 与 curl 的 body，九成问题在这一步现形（我最常见的是多余字段和 undefined 序列化成 null）；第三，仍失败就把模型名换成该平台最基础的型号再试——部分报错其实是"该模型不支持某个参数"（比如某模型不支持 response_format），错误信息却报成参数错误。这个三板斧帮我省下的排查时间加起来以天计，值得写进团队的调试文档。

---

## 小结

- chat completions = POST 一个 JSON：`messages` 数组 + 采样参数；多轮对话靠客户端重发历史。
- temperature 控随机度：抽取/翻译类 0~0.3，写作类 0.7+；top_p 一般不动。
- token 是计费单位，中文 1 字约 1 token；输出比输入贵 3~5 倍，省钱先砍 system 提示词。
- 上下文窗口 = 输入 + 输出共享上限，多轮对话要主动裁剪历史。
- `max_tokens` 显式设置，防截断；Key 永远不进前端。

---

## 练习

1. 用你封装的 `chat()` 函数分别以 temperature 0 和 1.0 各请求 3 次同一问题，对比输出差异。
2. 把 `usage` 里的 token 数乘以你所用模型的价格，算一次"成本/千次调用"估算表。
3. 写一个 10 轮对话循环，打印每轮实际发送的输入 token 数，观察线性增长。
4. 故意把 messages 里塞一段 5 万字的文本，观察 API 返回什么错误码与错误信息，记下来——这是下一篇错误处理的素材。
