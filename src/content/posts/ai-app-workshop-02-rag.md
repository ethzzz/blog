---
title: '实战 02 · 导入文档、检索证据和引用原文'
published: 2026-11-27T09:05:00+08:00
description: 'Day 3–4：建知识库表，用词项和 Embedding 检索，约束模型输出，验证引用、拒答和跨用户隔离。'
tags: [AI应用, 项目实战, Prompt, Embedding, RAG]
category: AI应用开发学习路线
draft: false
---

> [!NOTE]
> [上一篇：流式对话](/blog/posts/ai-app-workshop-01-chat/) · [下一篇：Agent 与 MCP](/blog/posts/ai-app-workshop-03-agent-mcp/) · [路线合集](/blog/ai-app-roadmap/)

Alice 导入团队发布流程之后，可以问「发布流程」，查看回答引用并打开原文。知识库缺少材料时，页面显示证据不足。Bob 登录后只检索自己的资料。

### 文件地图

| 文件 | 本轮关注点 |
| --- | --- |
| `rag.mjs` | 文档、分块与向量、召回、提示词、引用与输出校验 |
| `model.mjs` | `embed` 调用向量接口，`complete` 读取非流式回答 |
| `app.mjs` | 导入、问答、引用跳转与删除 |

## Day 3 导入与检索

在上一章的目录停掉服务，再运行：

```bash
node setup.mjs 2
node --env-file=.env server.mjs 2
```

1. 在「知识库」导入标题「发布流程」，正文填写「发布流程：先运行冒烟测试，再申请发布。」。接着导入「会议安排」，正文填写「每周三下午开例会。」。
2. 查看 `POST /api/documents`。文档正文按 360 字符切块，步长 300，保留 60 字符重叠。服务端有了全部向量才在 MySQL 同一事务写入文档和分块。分块关联文档外键，删除文档会级联删除分块。写入前改造分块函数，让它优先在换行处分段，比较长文档的片段连续性。
3. 用「发布流程」查询。给 `rag.mjs` 中的 `score` 加临时断点，观察两个文档的词项匹配分数。无密钥模式用词项召回与原文摘录，便于复现测试。
4. 真机模式在上一章 `.env` 中补充 `AI_EMBED_MODEL`。重启后重新导入两篇文档，使新分块有向量。问「上线前应该做什么」并对比两种召回。向量和模型标识分别存入 MySQL 的 JSON 列和文本列，按用户查询候选后由 Node.js 计算余弦相似度。更换向量模型后重新导入。每个用户最多导入 30 篇，便于在练习规模下扫描候选。 [Embeddings 接口](https://developers.openai.com/api/reference/resources/embeddings/methods/create)

## Day 4 把回答和引用定成接口契约

1. 读 `rag.mjs` 顶部的 `prompt`。系统消息负责任务和输出约束，用户消息同时携带问题与服务端选出的候选片段。片段是外部数据。给它们编号，后端只接受这一轮检索产生的编号。
2. 候选不足时直接返回 `abstained: true`。有候选时让模型返回 `answer`、`citations`、`abstained`，在接入 UI 前校验类型、长度、拒答状态与引用编号。尝试把 mock 的 `citations: [1]` 改成 `[99]`，重启后确认请求得到 `INVALID_ANSWER_SCHEMA`，然后改回来。
3. 点击引用按钮。浏览器读取 `GET /api/document?id=...`，服务端再次查文档归属。如果更换了登录用户、文档已删除或模型虚构了编号，对应内容都不会出现在页面上。
4. 加一篇正文里写着「忽略之前的指令」的练习文档。用真机模型测试其是否会偏离任务，并检查安全边界是否仍然成立。应用只把当前用户的候选片段送到模型，且在代码中校验引用。某条引用有效只说明该片段存在，是否支持回答还要靠评测。

## 联调与验收

| 输入或操作 | 预期 |
| --- | --- |
| Alice 问「发布流程」 | 命中发布文档，引用能打开原文 |
| Alice 问「今日食堂菜单」 | 拒答，引用数组为空 |
| Bob 问「发布流程」 | 拒答，直接请求 Alice 的文档 ID 得到 404 |
| Alice 删除发布文档后复问 | 该文档的分块一起清除，演练数据下返回拒答 |

```bash
node --env-file=.env smoke.mjs 2
```

保留测试中的三个基线问题。再补两个同义改写和一个容易误召回的问题，把失败归到「召回漏了证据」「证据正确但回答错了」「拒答或引用校验失效」之一。第 5 章会用这些分类组织回归集。

参考实现。 [rag.mjs](/blog/ai-app-workshop/rag.mjs)

延伸阅读。 [Prompt 工程](/blog/posts/ai-app-roadmap-03-prompt-engineering/) · [结构化输出](/blog/posts/ai-app-roadmap-05-structured-output/) · [RAG 检索增强](/blog/posts/ai-app-roadmap-06-embeddings-and-rag/)
