---
title: '05 · 结构化输出与函数调用'
published: 2026-10-14T14:00:00+08:00
description: 'LLM 结构化输出实战：JSON mode 的正确用法、tool use / function calling 报文结构、用 Zod 与 JSON Schema 做输出校验与重试，让模型输出成为可编程契约。'
tags: [AI应用, LLM, JSON, Zod]
category: AI应用开发学习路线
draft: false
---

> [!NOTE]
> 只要你的 AI 功能要跟程序打交道——存库、渲染组件、触发动作——模型输出就必须是结构化的。而"模型偶尔不按格式来"是新手最容易低估的稳定性问题。这篇讲 JSON mode、function calling 和校验兜底三板斧，核心思想：**把模型输出当不可信输入，像对待用户表单一样校验它。**

---

## 知识地图

- 为什么"在 Prompt 里说请输出 JSON"不够
- JSON mode：开关在哪、注意什么
- function calling：报文结构、调用循环
- Zod / JSON Schema 校验 + 失败重试策略

---

## 1. 光靠 Prompt 说"输出 JSON"是不够的

最朴素的做法：

```
请以 JSON 格式输出：{"title": "...", "points": ["...", "..."]}
```

实测失败率大约 5%~15%，取决于模型和任务复杂度。失败形态我收集全了：

- JSON 外面裹了 \`\`\`json 代码块围栏
- 前面加了一句"好的，以下是 JSON："
- JSON 里带注释、带尾逗号
- 字符串里的引号没转义，整个 JSON 直接语法错误
- 偷懒输出成"标题：xxx / 要点：xxx"的纯文本

每种都能写正则去修，但修补逻辑会越滚越多，永远修不完。正确路线是逐级升级：JSON mode → 校验 → 重试，再不够上 function calling。

## 2. JSON mode：让模型从源头守规矩

主流平台都提供 JSON 输出模式，Qwen 兼容模式的用法：

```ts
const body = {
  model: "qwen-plus",
  messages,
  response_format: { type: "json_object" },
};
```

开启后模型被约束为输出合法 JSON（语法层面），我的实测语法错误率降到接近零。但有三个注意点：

1. **Prompt 里仍要描述 JSON 结构**。JSON mode 只保证"是合法 JSON"，不保证"符合你的 schema"。不写结构它可能输出 `{}`。
2. **不同模型支持不同**。有的叫 `json_object`，有的叫 `response_format: json_schema`（更强，直接约束到 schema）。换供应商时查文档，别想当然。
3. **括号陷阱依然存在**：模型可能输出"合法但不合理"的 JSON——字段名拼错、类型不对、值是空串。所以下一节的校验仍然必需。

## 3. Function calling：让模型"点菜"

JSON mode 是"模型写文档给你"，function calling 是"模型填你给的表单"。你在请求里声明可用的工具及其参数 schema，模型决定调不调、填什么参：

```ts
const body = {
  model: "qwen-plus",
  messages,
  tools: [
    {
      type: "function",
      function: {
        name: "create_summary_card",
        description: "根据文章内容生成摘要卡片",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "卡片标题，10 字以内" },
            points: {
              type: "array",
              items: { type: "string" },
              description: "3 条要点",
            },
            sentiment: {
              type: "string",
              enum: ["positive", "neutral", "negative"],
            },
          },
          required: ["title", "points"],
        },
      },
    },
  ],
};
```

返回里，模型不再直接给 content，而是给出调用意图：

```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "tool_calls": [{
        "id": "call_abc",
        "type": "function",
        "function": {
          "name": "create_summary_card",
          "arguments": "{\"title\":\"流式输出\",\"points\":[\"...\"]}"
        }
      }]
    }
  }]
}
```

要点：

- `description` 和参数 description **直接影响填写质量**，写清楚"10 字以内"比写完再裁剪划算
- `arguments` 是**字符串**不是对象，要自己 parse（因为可能非法）
- enum 是免费的格式约束，能用就用

什么时候该用 function calling 而不是 JSON mode？我的分界线：**JSON mode 适合"输出一段固定结构的数据"；function calling 适合"模型要在多个动作里选一个执行"**。比如"帮我把这篇文章处理一下"——是生成卡片、翻译还是加待办？让模型点菜，这正是 07 篇 Agent 循环的地基。

## 4. 校验与重试：最后一道闸

### 4.1 Zod 校验

无论用哪种模式，拿到输出后都过一遍 Zod：

```ts
import { z } from "zod";

const SummaryCard = z.object({
  title: z.string().min(1).max(20),
  points: z.array(z.string().min(1)).min(1).max(5),
  sentiment: z.enum(["positive", "neutral", "negative"]).default("neutral"),
});

function parseOutput(raw: string): SummaryCard {
  // 兜底清洗：剥掉可能的代码围栏
  const cleaned = raw
    .replace(/^```(json)?\s*/m, "")
    .replace(/```\s*$/m, "")
    .trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  const json = JSON.parse(cleaned.slice(first, last + 1));
  return SummaryCard.parse(json); // 不合格直接 throw
}
```

`parse` 抛错不是坏事——**快速失败比静默的坏数据好一万倍**。我曾让一个没校验的版本直接入库，前端渲染时才发现 points 里混了空数组，排查半天。

### 4.2 校验失败的重试：带错误信息再问一次

校验失败后不要直接换种子重试——把错误喂回去，让模型自己改：

```ts
async function robustJsonCall<T>(
  schema: z.ZodType<T>,
  messages: ChatMessage[],
): Promise<T> {
  let history = [...messages];
  for (let i = 0; i < 2; i++) {
    const raw = await chat(history, { responseFormat: "json_object" });
    try {
      return schema.parse(parseJsonSafe(raw));
    } catch (e) {
      // 把失败原因注入对话，要求修正
      history = [
        ...history,
        { role: "assistant", content: raw },
        {
          role: "user",
          content: `你的输出未通过校验：${String(e)}。
请修正后重新输出完整 JSON，不要输出其他内容。`,
        },
      ];
    }
  }
  throw new Error("输出连续校验失败"); // 触发降级（02 篇）
}
```

这招修复率很高，因为大多数失败是"字段漏了/类型错了"这种小错，模型看到具体 Zod 报错后基本能一次改对。注意最多重试 2 次，别让校验重试变成成本黑洞——最后兜底交给降级策略。

## 5. 实战杂记：三个校验之外的问题

### 5.1 输出被 max_tokens 截断的 JSON

JSON mode 也救不了"输出到一半被截断"——JSON 语法直接残缺，`JSON.parse` 必炸。识别方式是看 `finish_reason` 是否为 `length`（01 篇的表格）。处理优先级：先压 Prompt（要求输出精简）、再调大 max_tokens、最后才是"截断修复"（补齐缺失的引号和括号）。截断修复我只在生产上做过最保守的版本：`]}"}'` 这类结尾补全，复杂修复交给重试。**永远不要相信截断修复能还原完整语义，它能做的只是让 parse 不报错。**

### 5.2 字段"存在但为空"的中间态

比解析失败更磨人的是解析成功但语义残缺：`points` 是空数组、`title` 是"无"、`sentiment` 是空字符串。这类输出大多发生在输入信息不足时（03 篇讲过要给失败出口）。我的经验是在 schema 里把"空"显式建模，而不是放任它以各种形态出现：

```ts
const SummaryCard = z.object({
  title: z.string().min(1),
  points: z.array(z.string()).max(5),
  insufficient: z.boolean(), // 显式的"信息不足"标志
});
// 约定：insufficient=true 时 points 允许为空，前端渲染"该文暂无可提取要点"
```

给"空"一个合法的出口，比在运行时拦截十种非法的空要稳定得多。

### 5.3 流式场景下的结构化输出

流式输出和 JSON 校验有天然的张力：chunk 到达过程中 JSON 是残缺的，无法边流边 parse。三个可选方案，按我的推荐顺序：

1. **非流式拿结构化结果**：适合后台任务（摘要、翻译），体验上没有流式需求，最省心。
2. **流式 + 结束后校验**：给用户展示原始流式文本，同时后台攒完整 JSON，结束后做一次校验和结构化渲染切换。体验好，但要处理"展示与结构化渲染的切换闪烁"。
3. **增量 JSON 解析器**：用 `partial-json` 之类的库边流边 parse 已完整的前缀字段，实现"标题先出、要点逐条蹦"的渐进渲染。效果最炫，工程量也最大，我的卡片生成功能用的就是它——但要接受"最后一个字段到达前，对象始终是不完整的"这个心智模型。

## 6. Prompt 与 Schema 的协同设计

结构化输出最容易犯的设计错误，是 Prompt 和 schema 分别演化、互不知情——Prompt 让模型输出 5 个字段，schema 校验 4 个；或者 schema 加了必填字段，Prompt 一个字没改。我的做法是把两者当成**同一份契约的两面**，从 schema 出发生成 Prompt 的结构描述：

```ts
// schema 是唯一事实源
const SummaryCard = z.object({
  title: z.string().describe("卡片标题，10 字以内"),
  points: z.array(z.string()).max(5).describe("要点，每条不超过 30 字"),
});

// 从 schema 自动生成给 Prompt 用的结构说明
function schemaToPrompt(schema: z.ZodObject<any>): string {
  const shape = schema.shape;
  const lines = Object.entries(shape).map(([k, v]) => {
    const d = (v as any).description ?? "";
    return `- ${k}: ${d}`;
  });
  return `输出 JSON 对象，字段：\n${lines.join("\n")}`;
}
```

三个直接收益：字段描述只写一遍（`describe` 同时喂给 Prompt 和 JSON Schema 的 function calling）；加字段时 Prompt 和校验同步更新，消灭了"忘改一头"这类 bug；schema 的 diff 就是契约的 diff，code review 时一目了然。Zod 的 `zod-to-json-schema` 包可以直接把 schema 转成平台要求的 JSON Schema，function calling 的 `parameters` 也从这同一个源头生成——**一份 schema，三处消费**（Prompt 说明、校验、工具声明），这是我在结构化输出上最值得的一个架构决定。

### 4.3 校验分层：哪里该严、哪里该松

校验不是越严越好，分层设计才是正解。我的三层策略：

- **入库层（最严）**：写数据库的数据必须 100% 通过完整 schema，任何失败走重试或降级，绝不放行。这是数据质量的底线。
- **展示层（中等）**：渲染前做宽松校验（字段存在即可），个别字段缺失时前端给默认值并降级展示。用户看到的页面不该因为一个可选字段缺席就空白。
- **日志层（最松）**：所有原始输出（含校验失败的）都落日志。失败样本是 10 篇坏例分析的原材料，删了它们等于烧掉情报。

分层的意义在于回答"校验失败到底有多严重"——入库失败是事故，展示降级是体验，日志里有失败记录反而是资产。我在不分层的时期吃过两头亏：一边是坏输出混进了库，一边是严格的校验把大量"可用但有瑕疵"的输出拦死在外，白白烧了 token。把"数据的用途"作为校验强度的依据，这个问题就消解了。

收尾给一个选型速断表：后台任务、输出结构固定 → JSON mode + Zod；模型要在多个动作中选一个 → function calling；需要流式展示结构化结果 → 流式 + 增量解析或"流式展示 + 结束校验"两段式。三种方案覆盖了 95% 的场景，剩下的 5% 先想清楚是不是真的需要——结构化输出的第一原则永远是让输出简单到不需要复杂方案。

---

## 小结

- 模型输出永远当不可信输入：清洗 → parse → Zod 校验 → 快速失败。
- JSON mode 保证语法合法但不保证结构正确，Prompt 里仍要写清 schema。
- function calling 用 schema + description 约束填写质量，适合"多动作选一"的场景；arguments 记得 JSON.parse。
- 校验失败把错误信息喂回去重试（最多 2 次），仍失败走降级。

---

## 练习

1. 不开 JSON mode，用 10 条输入测试纯 Prompt 生成 JSON 的失败率，把失败样本归类（围栏/杂语/转义），你就知道清洗函数该怎么写了。
2. 给你的功能定义 Zod schema 并接入 `robustJsonCall`，故意在 schema 里加一个模型容易漏的字段，观察自修复效果。
3. 把 05 篇的翻译功能改造成 function calling：声明 `translate` 工具，枚举目标语言，观察模型对不明确指令的行为。
4. 统计你接入校验前后"坏输出入库"的频率变化，记录在 README 里作为回归基线。
