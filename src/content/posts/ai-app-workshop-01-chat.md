---
title: '实战 01 · 从零跑起可中断的流式对话'
published: 2026-11-27T09:00:00+08:00
description: 'Day 1–2：建项目、用 mock 跑通聊天、保存多轮历史、接入真实模型并验证 SSE 中断。'
tags: [AI应用, 项目实战, LLM, SSE]
category: AI应用开发学习路线
draft: false
---

> [!NOTE]
> [项目总览](/blog/posts/ai-app-roadmap-00-overview/) · [下一篇：知识库与引用](/blog/posts/ai-app-workshop-02-rag/) · [路线合集](/blog/ai-app-roadmap/)

在浏览器新建会话、输入消息、看到逐段输出，并在生成途中按下停止。刷新页面后，重新输入工作台访问密钥可以读回历史。这个工作台会贯穿后续五个阶段。

### 文件地图

| 文件 | 负责什么 | 动手时先看哪里 |
| --- | --- | --- |
| `server.mjs` | 启动 HTTP、鉴权、会话与消息持久化 | 从 `/api/health` 跟到 `/api/chat` |
| `db.mjs`、`compose.yaml`、`init-dev.sql` | MySQL 连接池、事务、容器与本地数据库初始化 | 看事务为何要用连接池借出的同一条连接 |
| `model.mjs` | 模型适配层 | 对照 mock 与兼容 API 的 `stream` |
| `http.mjs`、`sse.mjs` | 请求校验、SSE 写入和读取 | 看看 CRLF 跨一个网络分块时如何处理 |
| `index.html`、`app.mjs` | 对话列表、消息表单和流式渲染 | 从发送表单跟到 `AbortController` |
| `smoke.mjs` | 分阶段验收 | 测试在随机端口运行，使用独立的 MySQL 测试库和临时账号 |

## Day 1 跑通第一条对话

### 1. 准备源码

安装 Node.js 24，启动带 Compose 的 Docker，在博客仓库外创建练习目录。安装脚本按阶段取参考文件，并保留同名文件。如果你已经下载过旧版教程，请为 MySQL 版新建练习目录。也可以从仓库的 `lab/ai-app-workshop/` 复制文件。

PowerShell

```powershell
node --version
mkdir kb-workshop
cd kb-workshop
Invoke-WebRequest https://haolo.cloud/blog/ai-app-workshop/setup.mjs -OutFile setup.mjs
node setup.mjs 1
npm.cmd ci
Copy-Item dev.env.example .env
```

Bash

```bash
node --version
mkdir kb-workshop
cd kb-workshop
curl -fSLo setup.mjs https://haolo.cloud/blog/ai-app-workshop/setup.mjs
node setup.mjs 1
npm ci
cp dev.env.example .env
```

### 2. 启动 MySQL 和工作台

打开 `.env`，为 `MYSQL_ROOT_PASSWORD` 和 `DB_PASSWORD` 设置两把不同的本地密码。`DB_PASSWORD` 是 Node.js 使用的 MySQL 应用账号密码。Compose 首次启动会创建开发库 `kb_workshop`、测试库 `kb_workshop_test` 和评测库 `kb_workshop_eval`，并使用命名卷保留数据。初始化 SQL 在空数据目录首次启动时执行。 [MySQL Docker 官方镜像](https://hub.docker.com/_/mysql)

```bash
docker compose up -d --wait
node --env-file=.env server.mjs 1
```

已有 MySQL 8.0 或 8.4 时，也可以手动创建上述三个库，给应用账号对应库的建表、外键和读写权限，在 `.env` 配置 `DB_HOST`、`DB_PORT`、`DB_NAME`、`DB_USER` 和 `DB_PASSWORD`。第 3 章需要额外的 MySQL 只读账号。`server.mjs` 启动当前阶段时会创建缺少的表。

打开 `http://127.0.0.1:8787/`，输入工作台的练习访问密钥 `alice-local`，新建「发布会话」，发送「你好」。预期看见「演练回复：你好」。如果应用启动报 `ECONNREFUSED`，先检查 Compose 健康状态和 `DB_PORT`。如果报 `ER_ACCESS_DENIED_ERROR`，检查数据库账号和密码。已有命名卷时，修改 `.env` 后还需要在 MySQL 里轮换账号密码。

### 3. 用接口复现浏览器操作

另开一个终端，先检查服务健康，再创建会话。下例使用 PowerShell，Bash 可以用 `curl` 发送相同 JSON。

```powershell
$base = 'http://127.0.0.1:8787'
$headers = @{ Authorization = 'Bearer alice-local' }
Invoke-RestMethod "$base/api/health"
$chat = Invoke-RestMethod "$base/api/conversations" -Method Post -Headers $headers `
  -ContentType 'application/json' -Body (@{ title = 'Release' } | ConvertTo-Json)
$payload = @{ id = $chat.id; text = 'Hello' } | ConvertTo-Json -Compress
$payload | curl.exe -N "$base/api/chat" -H 'Authorization: Bearer alice-local' `
  -H 'Content-Type: application/json' --data-binary '@-'
```

预期依次收到若干 `event: delta`，最后收到 `event: done`。在开发者工具的 Network 面板对照页面触发的同一条请求。

## Day 2 实现中断与真实模型适配

### 1. 沿着数据和取消信号重写一次

1. 读 `server.mjs` 的 `/api/chat`。服务端从访问密钥查用户，用 `SELECT … FOR UPDATE` 锁住当前用户的会话行，串行检查是否已有进行中的生成，最多读取最近 8 条完成的消息。事务同时写入本轮用户消息和 `generating` 的助手占位，提交后才调模型。另一个会话不需要等这轮生成。 [InnoDB 锁定读](https://dev.mysql.com/doc/refman/8.4/en/innodb-locking-reads.html)
2. 读 `model.mjs` 的 mock 生成器。把它改成每次只吐两个字符，把间隔从 40 ms 改到 180 ms。观察同一 HTTP 请求如何变成多个 SSE 事件。
3. 读 `app.mjs` 的发送和停止处理。浏览器关闭读取后，服务端监听响应连接关闭，将同一个信号传给模型。失败或停止后保留部分文本并标为 `interrupted`。只有明确收到 `done` 才算完成。
4. 在 `sse.mjs` 关闭读流时打一个断点。用长问题测试停止，再用另一个用户 `bob-local` 刷新，确认 Alice 的会话对 Bob 不可见。

### 2. 用兼容接口跑一次真实对话

在现有 `.env` 修改 `AI_PROVIDER`，补上模型配置。从厂商控制台抄模型 ID 和服务根地址，根地址应包含 API 版本路径。访问工作台时仍用 `alice-local`。工作台密钥、数据库密码和模型 API Key 分别管理。

```dotenv
AI_PROVIDER=compatible
AI_BASE_URL=https://api.openai.com/v1/
AI_API_KEY=填自己的厂商密钥
AI_CHAT_MODEL=填支持流式对话的模型ID
```

```bash
node --env-file=.env server.mjs 1
```

发一条中文消息后再问「把上一个回答缩成一句」。这样可以同时验证历史消息和真实流式输出。使用 OpenAI 兼容端点时，确认厂商支持 `max_completion_tokens`、`stream_options.include_usage` 和 `[DONE]`。如果兼容层缺某个字段，在 `model.mjs` 的请求适配层调整。模型密钥错误时先在厂商控制台查密钥作用域和模型权限。

## 验收

```bash
node --env-file=.env smoke.mjs 1
```

- [ ] 出现 `PASS 01`。逐字节拆分的中文和 CRLF 事件仍能还原。
- [ ] 长回答生成中可停止，刷新读取的是部分文本和中断状态。
- [ ] 重启服务后历史还在，Bob 读取 Alice 的会话返回 404。
- [ ] 同一会话同时发送两个请求，后到的请求返回 409。确认 MySQL 中只有一轮新消息。
- [ ] 有模型密钥时完成两轮真机对话，记录用到的模型 ID、是否返回用量和停止后的表现。

重点代码可以按文件下载。 [server.mjs](/blog/ai-app-workshop/server.mjs) · [db.mjs](/blog/ai-app-workshop/db.mjs) · [compose.yaml](/blog/ai-app-workshop/compose.yaml) · [model.mjs](/blog/ai-app-workshop/model.mjs) · [sse.mjs](/blog/ai-app-workshop/sse.mjs)

延伸阅读。 [LLM API 基础](/blog/posts/ai-app-roadmap-01-llm-api-basics/) · [客户端封装](/blog/posts/ai-app-roadmap-02-client-engineering/) · [SSE 流式输出](/blog/posts/ai-app-roadmap-04-streaming-sse/) · [Chat Completions 接口](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create)
