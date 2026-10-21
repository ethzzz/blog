---
title: '在自托管项目里落地 AI 能力：QwenClient 封装实录'
published: 2026-10-13T11:00:00+08:00
description: 'NoteLab 自托管 AI 能力落地实录：自封装 QwenClient 而非官方 SDK，环境变量注入凭据，API Key 池轮询与 429 限流重试，阿里云 MaaS token-plan 计费实践，翻译摘要的超时降级与流式输出踩坑。'
tags: [NoteLab, 全栈, AI 集成, Spring Boot]
category: notelab
draft: false
---

> [!NOTE]
> notelab 分组第三篇。文章摘要、站内翻译这些 AI 能力，第一版是直接把官方 SDK 塞进 Controller 的，一周之内被 429、计费账单和一次密钥泄漏事故轮流教育。这篇记录 QwenClient 从"能用"到"敢用"的重写过程。

## 知识地图

```
调用方（文章摘要 / 翻译 / 站内问答）
        │
        ▼
   QwenClient（自封装单例，Java 17 HttpClient）
    ├─ 凭据：QWEN_BASE_URL / QWEN_MODEL / QWEN_API_KEYS（环境变量注入）
    ├─ Key 池：多 Key 轮询，429 自动换 Key 立即重试
    ├─ 超时：连接 5s / 读取按场景 8~60s，超时走降级
    └─ 降级：摘要返回空串、翻译返回原文，异常不出服务层
```

## 一、为什么自封装，而不是直接用 SDK

第一版用的官方 SDK，重写时有四个理由，按权重排序：

1. **我要插策略，SDK 不给位置。** Key 池轮询、429 换 Key、统一超时、降级，全都要长在"发请求"这一层。为此去研究 SDK 的拦截器体系，绕的路比我自己写 30 行代码还多。
2. **我只用得起一个接口。** OpenAI 兼容协议的 `chat/completions`（外加流式），SDK 里 90% 的能力这辈子用不上，还拖一堆传递依赖进构建。
3. **换供应商要便宜。** BASE_URL 是环境变量，兼容协议下换网关只改一行配置，不动代码。
4. **依赖升级可控。** 自封装的客户端就一个文件，升级是改两行；SDK 升级经常带 breaking change。

一句话：我要的不是"大而全的 AI SDK"，是"一个能换 Key、能超时、能降级的 HTTP 调用"。

还有一个背景要说清：NoteLab 矩阵里其实有两个"AI 客户端"。ai-lab 仓库（FastAPI + Vite，第一篇提过）是试验场，放各种乱七八糟的 prompt 和参数实验；notelab-java 里的 QwenClient 是生产版本，只保留验证过的调用路径。试验的归试验，生产的归生产——生产客户端里的每一行代码都应该能回答"你为什么存在"，这是我从 SDK 那棵泛滥的依赖树里学到的洁癖。

## 二、凭据注入与 Key 池轮询

凭据全部走环境变量，代码里没有任何字符串形式的 Key：

```bash
# .env（在仓库目录下启动才会被读到，见本分组第一篇）
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-plus
QWEN_API_KEYS=sk-aaaa...,sk-bbbb...,sk-cccc...
```

注意 `QWEN_API_KEYS` 是**逗号分隔的复数**——这是 Key 池，不是单 Key。单个 Key 有平台侧的并发与速率上限，多 Key 轮询是最便宜的扩容方式：

```java
private final List<String> keys;
private final AtomicInteger cursor = new AtomicInteger();

private String nextKey() {
    return keys.get(Math.floorMod(cursor.getAndIncrement(), keys.size()));
}

public String chat(String system, String user, Duration timeout) {
    for (int i = 0; i < keys.size(); i++) {
        HttpResponse<String> resp = doSend(system, user, nextKey(), timeout);
        if (resp.statusCode() == 200) return extractContent(resp);
        if (resp.statusCode() == 429) continue;  // 换下一把 Key，立即重试
        throw new QwenException(resp.statusCode(), resp.body());
    }
    throw new QwenException(429, "all keys throttled");
}
```

两个细节值得说：429 换 Key 后**立即**重试、不做退避——限流是按 Key 计的，另一把 Key 大概率是好的，退避反而是白白让用户等；循环上限是 `keys.size()` 而不是写死 3 次，避免"Key 比重试次数多时永远轮不到"或"Key 少了还白试"。

凭据的注入方式在本地和服务器略有不同：本地走 `.env`（必须在仓库目录下启动才会被读到，第一篇讲过这个坑），服务器走进程管理器的 env 配置。两处共同的要求是文件权限收紧到属主可读——`.env` 泄漏的第二大来源不是 git，是随手 `chmod 777` 的部署脚本。另外 Key 完全没配置时客户端不报错，启动日志打一行"QWEN_API_KEYS 未配置，AI 功能降级"就完事，这和第一篇说的"大模型 Key 可选"是同一个设计的两半：可选依赖 + 优雅降级。

## 三、计费实践：MaaS 网关的 token-plan

调用走的是阿里云 MaaS（cn-beijing 区域）的 OpenAI 兼容网关。计费用的是 **token-plan**：预购 token 包，所有模型调用按 token 扣包内余量，不按调用次数计费。

实践下来三条经验：

| 决策 | 选择 | 理由 |
|---|---|---|
| 摘要模型 | qwen-plus | 摘要质量直接影响阅读体验，值得用稍好的 |
| 翻译模型 | qwen-turbo | 翻译量大、单次短，turbo 的质量足够 |
| temperature | 翻译 0.2 / 摘要 0.3 | 都是收敛型任务，不要发散 |

每次调用把响应里的 `usage` 记进日志：

```java
Usage u = MAPPER.readValue(resp.body(), Usage.class);
log.info("qwen usage: model={}, prompt={}, completion={}",
         model, u.promptTokens(), u.completionTokens());
```

别小看这行日志。token-plan 的余量是个"看不见的水池"，没有 usage 记录，你既不知道包什么时候见底，也不知道某个功能是不是在悄悄烧钱。我事后靠这份日志发现摘要功能的 token 消耗是翻译的六倍——因为它把全文都喂进去了，prompt tokens 才是大头，completion 反而是零头。

还有一条被动经验：盯住计费策略变更。MaaS 的模型上下线、价格调整都会直接改变 token-plan 的消耗速度，我吃过一次默默调价没察觉的亏——还是 usage 日志发现月消耗曲线陡了一截，才回头去翻公告。成本可观测性不是大厂专利，一行 log 就够，缺的只是"记得记"这口气。

## 四、超时与降级：AI 是旁路，不能拖垮主流程

原则先立住：**AI 功能挂了，知识库必须还是好用的**。两类场景的策略不同：

- **摘要**：后台异步任务，超时 60 秒，失败保留旧摘要，等下次文章更新时重试。
- **翻译**：同步接口，超时 8 秒，超时直接返回原文加一个"重试"提示——用户等不起第二次。

```java
public String summarize(String content) {
    try {
        return qwen.chat(SUMMARIZE_PROMPT, content, Duration.ofSeconds(60));
    } catch (Exception e) {
        log.warn("summarize degraded: {}", e.getMessage());
        return "";  // 空串 = 前台不渲染摘要区块
    }
}
```

降级的返回值要**设计过**而不是随手抛异常：空摘要让前台安静地不渲染区块，空翻译回退到原文。用户永远不该为 AI 功能看到红色报错——AI 在这个产品里是锦上添花，添不上的时候不能把锦扎破。

熔断是降级的进阶版：连续失败达到阈值（我设的是 5 次）就进入熔断态，后续请求直接走降级、不再真实调用——免得每个请求都要干等一遍超时，把整个接口拖慢。熔断 60 秒后转半开，放一条真实请求试探，成功就恢复，失败继续熔断。实现不过三十行，但它把"AI 网关挂了"从"所有带 AI 的接口集体变慢"变成"安静地少几个区块"，这两者的差别，在告警群里的体感天差地别。

## 五、两个踩坑：流式假卡死与密钥进 git 历史

**流式输出的三个注意点。** 给前端做流式（SSE）时踩的：

1. **nginx 的 proxy_buffering 会把流憋成一坨。** 用户看到的是"卡住半分钟然后一次性吐完"。给响应加 `X-Accel-Buffering: no`，或在 nginx 对该 location 显式关 buffering。
2. **尽快发一个首包 event。** 上游首字节可能要 2~3 秒，先给前端发个空 event 让 loading 转起来，体感完全不同。
3. **用户关闭页面要 abort 上游请求。** 不 abort 的话，模型还在继续生成，token 照扣——这是纯浪费，而且是聚合起来很可观的那种浪费。
4. **注意 chunk 边界切断多字节字符。** 网络分块不认 UTF-8，一个汉字可能被劈成两半分属两个 chunk，前端直接拼接会渲染出乱码。用 TextDecoder 的 `{ stream: true }` 选项做增量解码，或者在后端按完整字符边界切分后再下发。这个坑平时不出现，出现时用户只会说"你们的字是坏的"。

**密钥硬编码进 git 历史。** 最疼的一次。早期图省事把一把 sk- 开头的 Key 写成了 Java 常量，提交后才反应过来。教训与处理流程：

1. **先吊销，再删代码**——顺序反了就白干。代码删了 Key 依然有效，git 历史里躺着呢。
2. 新 Key 只进环境变量，代码和配置文件里都不落盘。
3. git 历史可以用 `git filter-repo` 清理；私有仓库我最终也选择直接吊销了事——历史永远在那里，吊销才是唯一可靠的"删除"。
4. pre-commit 加一道粗扫，挡住下次手滑：

```bash
#!/bin/sh
# .git/hooks/pre-commit
if git diff --cached -U0 | grep -E 'sk-[a-zA-Z0-9]{20,}'; then
  echo "疑似 API Key，禁止提交"; exit 1
fi
```

它挡不住一切混淆手段，但足够挡住"明文粘贴"这种最常见的事故。

## 小结

- 自封装客户端的核心理由是策略插入点：Key 池、超时、降级都要长在请求层，SDK 不给这个位置。
- 凭据只走环境变量；Key 池轮询 + 429 换 Key 立即重试，是多账号最便宜的扩容方式。
- token-plan 计费下，usage 日志是唯一的成本可观测手段，prompt tokens 才是大头。
- 降级返回值要设计：AI 挂了，产品应该安静地少一个区块，而不是多一个报错。
- 密钥事故的顺序口诀：**先吊销、再删码、后清史**。

## 练习

1. 给 QwenClient 增加按 Key 维度的失败计数，连续 N 次 429 的 Key 自动冷却 10 分钟再回池。
2. 把 usage 日志改成入库，写一条按天聚合 token 消耗的 SQL，找出最烧钱的功能。
3. 实现一个简易熔断器：连续 5 次调用失败后直接走降级，60 秒后半开放一条请求试探。
4. 写一个脚本扫描 git 全历史（`git log -p`），列出所有疑似密钥的提交，作为密钥事故的例行体检。
