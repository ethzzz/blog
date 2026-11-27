---
title: '实战 03 · Agent 工具循环、人工确认和 MCP'
published: 2026-11-27T09:10:00+08:00
description: 'Day 5–6：模型查询待办，写操作走人工确认，再让本地 MCP 客户端复用同一个只读工具。'
tags: [AI应用, 项目实战, Agent, MCP]
category: AI应用开发学习路线
draft: false
---

> [!NOTE]
> [上一篇：知识库与引用](/blog/posts/ai-app-workshop-02-rag/) · [下一篇：图片与语音](/blog/posts/ai-app-workshop-04-media/) · [路线合集](/blog/ai-app-roadmap/)

在工作台输入「待办：整理发布流程」。助手显示草案，点击确认才创建。之后可以让模型查待办，也可以通过 MCP 从另一个本地客户端读取同一份列表。

### 文件地图

| 文件 | 负责什么 |
| --- | --- |
| `agent.mjs` | 工具描述、参数校验、步数限制、草案和确认事务 |
| `model.mjs` | 把工具 schema 和消息序列转成模型请求 |
| `mcp.mjs` | 通过 stdio 暴露受限的只读工具 |
| `smoke.mjs` | 并发确认和 MCP 握手用例 |

## Day 5 实现从工具调用到执行的闭环

在同一个练习目录停掉旧服务，再运行：

```bash
node setup.mjs 3
node --env-file=.env server.mjs 3
```

1. 登录 Alice，在「待办助手」填「查看待办」，应看到空列表。再发「待办：整理发布流程」，查看接口返回的 `trace` 和 `proposal`。刷新页面或重新查询列表时，未确认的草案不会出现在正式待办中。删掉草案点击前的确认流程会丢失这一边界。
2. 打开 `agent.mjs`，对照模型的两个工具 schema 和真正的执行代码。工具参数经过服务端校验，执行身份取自已经鉴权的请求。写意图只生成 10 分钟有效的草案，且模型拿不到确认接口。
3. 点击确认后，在 Network 找 `POST /api/tasks/confirm`。事务先锁住当前用户的账户行，再检查已有任务、创建待办并移除草案。对相同草案 ID 提交两次，返回同一个待办 ID。打开另一个窗口用 Bob 登录，验收其列表为空，重复提交 Alice 的草案 ID 得到 404。
4. 使用第 1 章的真实模型配置启动第 3 阶段。选择支持 function calling 的模型，先让它查待办。在断点观察 assistant 的 `tool_calls`，再观察带相同 `tool_call_id` 的 tool 消息。读取工具的结果送回模型，循环至多 3 轮。写工具触发草案后结束生成，等用户确认。

固定流程适合「核对资料 → 预览 → 确认」这类步骤可预知的业务。Agent 用在需要根据用户意图选择工具的环节。把步数上限临时改为 1，再跑一遍查询真机用例，观察没有足够轮次处理工具结果时的错误码。

## Day 6 用 MCP 复用读取工具

练习实现固定演示 `2025-11-25` 协议的握手与 stdio。Host 启动子进程，发送 `initialize`，收到响应后发送 `notifications/initialized`，随后请求 `tools/list` 和 `tools/call`。每行一个 JSON-RPC 消息，标准输出用于协议，诊断走标准错误。 [MCP 生命周期](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle) · [stdio 传输](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)

先在页面确认创建「整理发布流程」，再用 PowerShell 模拟 Host：

```powershell
$env:MCP_OWNER = 'alice'
@'
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"manual-check","version":"1"}}}
{"jsonrpc":"2.0","method":"notifications/initialized"}
{"jsonrpc":"2.0","id":2,"method":"tools/list"}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"list_tasks","arguments":{}}}
'@ | node --env-file=.env mcp.mjs
```

Bash 可运行 `MCP_OWNER=alice node --env-file=.env mcp.mjs`，粘贴相同的四行 JSON，按 Ctrl+D 退出。ID 为 2 的响应展示工具定义，ID 为 3 的响应包含刚确认的待办。若用支持这个协议版本的客户端，启动参数依次是 `--env-file=配置文件绝对路径` 和 `mcp.mjs` 的绝对路径，在客户端环境变量里设 `MCP_OWNER`。

MCP 子进程连接同一个 MySQL 库，使用 `MCP_DB_USER` 和 `MCP_DB_PASSWORD` 指定的只读账号。Compose 已设置开发库和测试库的只读权限。自管实例可在创建 `tasks` 表后，仅授予 MCP 账号该表的 `SELECT`。每次启动由可信操作者指定 `MCP_OWNER`，查询在应用层按该用户过滤。远程多用户 MCP 需要独立鉴权、令牌范围和访问审计。

## 验收

```bash
node --env-file=.env smoke.mjs 3
```

- [ ] 确认前任务列表为空，重复和并发确认后列表只有一条。
- [ ] Bob 无法确认 Alice 的草案，模拟 MCP Host 只发现查询工具。
- [ ] 有模型密钥时跑通 `tool_calls → tool → assistant` 和草案交互，检查非法工具名、参数或超出轮数时页面有错误提示。

参考实现。 [agent.mjs](/blog/ai-app-workshop/agent.mjs) · [mcp.mjs](/blog/ai-app-workshop/mcp.mjs)

延伸阅读。 [Agent 与工具循环](/blog/posts/ai-app-roadmap-07-agent-basics/) · [MCP 与工具生态](/blog/posts/ai-app-roadmap-14-mcp-tools/)
