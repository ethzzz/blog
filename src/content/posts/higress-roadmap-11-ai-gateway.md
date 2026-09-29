---
title: 'Higress AI 网关'
published: 2026-09-17T15:30:00+08:00
description: '详解 Higress 在 AI/LLM 场景的应用：多模型路由、Token 限流、Prompt 改写、内容审核、流式响应处理。'
tags: [Higress, AI网关, LLM, Token限流, Prompt, 大模型]
category: Higress学习路线
draft: false
---

> [!NOTE]
> Higress 2024+ 重点发力 AI 网关场景，提供 LLM 代理、Token 限流、Prompt 改写、多模型路由等能力，是构建 AI 应用基础设施的理想选择。

---

## AI 网关的价值

### 传统 API 网关 vs AI 网关

| 维度 | 传统 API 网关 | AI 网关 |
|:--|:--|:--|
| 计量单位 | QPS / 带宽 | **Token**（输入+输出） |
| 响应模式 | 请求-响应 | **流式**（SSE/Streaming） |
| 内容处理 | 透传 | **Prompt 改写 / 内容审核** |
| 路由策略 | 路径/Header | **模型能力 / 成本 / 延迟** |
| 安全关注 | SQL 注入/XSS | **Prompt 注入 / 敏感内容** |
| 成本模型 | 固定 | **按 Token 计费**（差异大） |

### AI 网关核心能力

```
┌─────────────────────────────────────────────────┐
│                 AI 网关能力                       │
├──────────────┬──────────────────────────────────┤
│ 多模型路由   │ GPT-4 / Claude / 通义 / 文心 / 本地 │
│ Token 限流   │ 按用户/API Key/应用配额            │
│ Prompt 改写  │ 系统提示词注入、模板填充           │
│ 内容审核     │ 输入/输出敏感内容过滤              │
│ 流式处理     │ SSE 流式响应、首字节延迟优化       │
│ 成本统计     │ Token 消耗、费用计算               │
│ 缓存         │ 语义缓存（相似问题复用答案）       │
│ 降级         │ 主模型故障时自动切换备用模型       │
└──────────────┴──────────────────────────────────┘
```

---

## 多模型路由

### 配置多个 LLM 后端

```yaml
# McpBridge 配置多个 LLM 服务
apiVersion: networking.higress.io/v1
kind: McpBridge
metadata:
  name: llm-services
  namespace: higress-system
spec:
  registries:
    # OpenAI
    - name: openai
      type: dns
      domain: api.openai.com
      port: 443
      protocol: https
    
    # Anthropic Claude
    - name: anthropic
      type: dns
      domain: api.anthropic.com
      port: 443
      protocol: https
    
    # 阿里通义千问
    - name: dashscope
      type: dns
      domain: dashscope.aliyuncs.com
      port: 443
      protocol: https
    
    # 本地部署（vLLM/Ollama）
    - name: local-llm
      type: static
      staticServers:
        - address: 10.0.0.100:8000
```

### 按路由分发到不同模型

```yaml
# GPT-4 路由（高复杂度任务）
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: llm-gpt4
  annotations:
    higress.io/destination: "openai.dns"
    higress.io/upstream-vhost: "api.openai.com"
    higress.io/request-header-authorization: "Bearer sk-xxx"
spec:
  ingressClassName: higress
  rules:
    - host: ai.example.com
      http:
        paths:
          - path: /v1/chat/gpt4
            pathType: Prefix
            backend:
              resource:
                apiGroup: networking.higress.io
                kind: McpBridge
                name: llm-services

---
# Claude 路由（代码任务）
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: llm-claude
  annotations:
    higress.io/destination: "anthropic.dns"
    higress.io/upstream-vhost: "api.anthropic.com"
    higress.io/request-header-x-api-key: "sk-ant-xxx"
spec:
  ingressClassName: higress
  rules:
    - host: ai.example.com
      http:
        paths:
          - path: /v1/chat/claude
            pathType: Prefix
            backend:
              resource:
                apiGroup: networking.higress.io
                kind: McpBridge
                name: llm-services

---
# 通义千问路由（中文任务，成本低）
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: llm-qwen
  annotations:
    higress.io/destination: "dashscope.dns"
    higress.io/upstream-vhost: "dashscope.aliyuncs.com"
spec:
  ingressClassName: higress
  rules:
    - host: ai.example.com
      http:
        paths:
          - path: /v1/chat/qwen
            pathType: Prefix
            backend:
              resource:
                apiGroup: networking.higress.io
                kind: McpBridge
                name: llm-services
```

### 智能路由（按任务类型）

```yaml
# Wasm 插件实现智能路由
apiVersion: extensions.higress.io/v1alpha1
kind: WasmPlugin
metadata:
  name: llm-router
spec:
  url: oci://registry.example.com/plugins/llm-router:v1
  defaultConfig:
    routes:
      - match:
          header: X-Task-Type
          value: "code"
        target: "anthropic.dns"    # Claude 擅长代码
      - match:
          header: X-Task-Type
          value: "chinese"
        target: "dashscope.dns"    # 通义擅长中文
      - match:
          header: X-Task-Type
          value: "complex"
        target: "openai.dns"       # GPT-4 复杂推理
      - default: true
        target: "local-llm"        # 默认本地模型（成本低）
```

---

## Token 限流

### 为什么需要 Token 限流

```
传统限流：100 QPS（每个请求成本相同）
AI 限流：100 QPS 但每个请求 Token 消耗差异巨大

示例：
- 请求 A："你好" → 10 tokens
- 请求 B："写一篇 5000 字论文" → 5000 tokens

如果只限 QPS，请求 B 的成本是请求 A 的 500 倍！
必须按 Token 限流。
```

### Token 限流插件配置

```yaml
apiVersion: extensions.higress.io/v1alpha1
kind: WasmPlugin
metadata:
  name: token-rate-limit
spec:
  url: oci://registry.example.com/plugins/token-rate-limit:v1
  phase: UNSPECIFIED_PHASE
  priority: 900
  defaultConfig:
    redis_cluster: "outbound|6379||redis.redis.svc.cluster.local"
    
    # 按用户 Token 配额
    rules:
      - name: "free-tier"
        match:
          header: X-User-Tier
          value: "free"
        limit:
          input_tokens: 10000       # 每天 1 万输入 Token
          output_tokens: 5000       # 每天 5 千输出 Token
          total_tokens: 15000
          window: 86400             # 24 小时
      
      - name: "pro-tier"
        match:
          header: X-User-Tier
          value: "pro"
        limit:
          input_tokens: 1000000
          output_tokens: 500000
          total_tokens: 1500000
          window: 86400
      
      - name: "enterprise"
        match:
          header: X-User-Tier
          value: "enterprise"
        limit:
          input_tokens: 100000000
          output_tokens: 50000000
          window: 86400
    
    # 按模型成本加权
    model_weights:
      gpt-4: 30          # GPT-4 每 Token 成本是基准的 30 倍
      gpt-3.5-turbo: 1
      claude-3-opus: 25
      claude-3-sonnet: 5
      qwen-max: 3
      qwen-turbo: 1
    
    # 超限响应
    rejected_code: 429
    rejected_body: |
      {
        "error": "token_limit_exceeded",
        "message": "Your daily token quota has been exceeded",
        "upgrade_url": "https://example.com/upgrade"
      }
```

### Token 计算逻辑

```go
// Wasm 插件中计算 Token（伪代码）
func calculateTokens(body []byte, model string) (inputTokens, outputTokens int) {
	// 1. 解析请求 Body
	var req map[string]interface{}
	json.Unmarshal(body, &req)
	
	// 2. 计算输入 Token
	messages := req["messages"].([]interface{})
	for _, msg := range messages {
		content := msg.(map[string]interface{})["content"].(string)
		// 使用 tiktoken 或近似算法
		inputTokens += estimateTokens(content)
	}
	
	// 3. 输出 Token（从响应中获取，或预估）
	// 流式响应需要累计 chunk 中的 token
	
	// 4. 按模型权重加权
	weight := modelWeights[model]
	inputTokens = inputTokens * weight
	outputTokens = outputTokens * weight
	
	return
}

// 近似 Token 估算（英文 ~4 chars/token，中文 ~1.5 chars/token）
func estimateTokens(text string) int {
	// 简化实现，实际应该用 tiktoken
	return len(text) / 3
}
```

---

## Prompt 改写

### 系统提示词注入

```yaml
apiVersion: extensions.higress.io/v1alpha1
kind: WasmPlugin
metadata:
  name: prompt-injector
spec:
  url: oci://registry.example.com/plugins/prompt-injector:v1
  defaultConfig:
    # 按路由注入系统提示词
    rules:
      - match:
          path_prefix: "/v1/chat/customer-service"
        inject:
          role: "system"
          content: |
            你是一个专业的客服助手。请遵循以下规则：
            1. 始终保持礼貌和专业
            2. 不要透露内部信息
            3. 如果不确定，引导用户联系人工客服
            4. 回答控制在 200 字以内
      
      - match:
          path_prefix: "/v1/chat/code-review"
        inject:
          role: "system"
          content: |
            你是一个资深代码审查专家。请：
            1. 指出代码中的 bug 和安全隐患
            2. 提供改进建议
            3. 遵循 SOLID 原则
            4. 给出具体的代码示例
      
      - match:
          path_prefix: "/v1/chat/translation"
        inject:
          role: "system"
          content: |
            你是专业翻译。请：
            1. 保持原文语义
            2. 符合目标语言表达习惯
            3. 专业术语准确
            4. 只输出翻译结果，不要解释
```

### Prompt 模板填充

```yaml
defaultConfig:
  templates:
    - name: "sql-generator"
      match:
        header: X-Task-Type
        value: "sql"
      template: |
        你是一个 SQL 专家。根据以下需求生成 SQL：
        
        数据库 Schema：
        {{schema}}
        
        用户需求：
        {{user_input}}
        
        要求：
        1. 使用标准 SQL 语法
        2. 考虑性能（索引、JOIN 优化）
        3. 添加注释说明
        4. 只输出 SQL，不要解释
      
      variables:
        schema:
          from: "header"
          key: "X-DB-Schema"
        user_input:
          from: "body"
          path: "messages[-1].content"
```

### Prompt 安全检查

```yaml
defaultConfig:
  # Prompt 注入检测
  injection_detection:
    enabled: true
    patterns:
      - "ignore previous instructions"
      - "ignore all previous"
      - "disregard.*instructions"
      - "system prompt"
      - "you are now"
      - "new instructions"
    action: "block"       # block / log / sanitize
  
  # 敏感话题过滤
  topic_filter:
    enabled: true
    blocked_topics:
      - "violence"
      - "illegal"
      - "harmful"
    action: "block"
  
  # 输出长度限制
  max_output_tokens: 4096
```

---

## 内容审核

### 输入审核（用户 Prompt）

```yaml
apiVersion: extensions.higress.io/v1alpha1
kind: WasmPlugin
metadata:
  name: content-moderation
spec:
  url: oci://registry.example.com/plugins/content-moderation:v1
  defaultConfig:
    # 输入审核
    input_moderation:
      enabled: true
      # 调用外部审核服务
      provider: "aliyun-green"    # 阿里云内容安全
      endpoint: "green.cn-shanghai.aliyuncs.com"
      access_key: "${ALIYUN_AK}"
      access_secret: "${ALIYUN_SK}"
      
      # 审核维度
      scenes:
        - "porn"          # 色情
        - "terrorism"     # 暴恐
        - "ad"            # 广告
        - "live"          # 不良场景
        - "logo"          # 特殊标识
      
      # 处理策略
      action_on_block: "reject"     # reject / sanitize / log
      action_on_review: "pass"      # pass / reject
  
  # 输出审核（LLM 响应）
  output_moderation:
    enabled: true
    provider: "aliyun-green"
    # 流式响应需要缓冲后审核
    stream_buffer_size: 1024        # 每 1KB 审核一次
    action_on_block: "truncate"     # truncate / replace / reject
```

### 自定义审核规则

```yaml
defaultConfig:
  custom_rules:
    # 关键词过滤
    - name: "sensitive-words"
      type: "keyword"
      keywords:
        - "暴力"
        - "色情"
        - "赌博"
        - "毒品"
      action: "block"
    
    # 正则过滤
    - name: "phone-number"
      type: "regex"
      pattern: "1[3-9]\\d{9}"
      action: "mask"          # 脱敏：138****1234
    
    # 语义审核（调用 LLM）
    - name: "semantic-check"
      type: "llm"
      prompt: |
        判断以下内容是否包含有害信息：
        {{content}}
        
        只回答：safe / unsafe / review
      model: "qwen-turbo"     # 用便宜模型审核
      action_on_unsafe: "block"
      action_on_review: "log"
```

---

## 流式响应处理

### SSE 流式代理

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: llm-streaming
  annotations:
    # 禁用响应缓冲（关键！）
    higress.io/proxy-buffering: "off"
    # 超时设置（流式响应可能很长）
    higress.io/request-timeout: "300s"
    higress.io/upstream-response-timeout: "300s"
    # 分块传输
    higress.io/chunked-transfer: "on"
spec:
  ingressClassName: higress
  rules:
    - host: ai.example.com
      http:
        paths:
          - path: /v1/chat/stream
            backend:
              service:
                name: llm-service
                port: { number: 8000 }
```

### 流式 Token 统计

```go
// Wasm 插件处理流式响应
func onHttpResponseBody(ctx wrapper.HttpContext, config Config, body []byte, log wrapper.Log) wrapper.Action {
	// SSE 格式：data: {...}\n\n
	lines := strings.Split(string(body), "\n")
	
	for _, line := range lines {
		if strings.HasPrefix(line, "data: ") {
			data := strings.TrimPrefix(line, "data: ")
			
			// 解析 chunk
			var chunk map[string]interface{}
			json.Unmarshal([]byte(data), &chunk)
			
			// 累计 Token
			if usage, ok := chunk["usage"].(map[string]interface{}); ok {
				inputTokens += int(usage["prompt_tokens"].(float64))
				outputTokens += int(usage["completion_tokens"].(float64))
			}
		}
	}
	
	// 流式结束（data: [DONE]）
	if strings.Contains(string(body), "data: [DONE]") {
		// 上报 Token 统计
		reportTokenUsage(ctx, inputTokens, outputTokens)
	}
	
	return wrapper.ActionContinue
}
```

---

## 语义缓存

### 原理

```
用户问题："什么是 Kubernetes？"
   ↓
计算语义向量（Embedding）
   ↓
查询向量数据库（相似问题）
   ↓
命中缓存（相似度 > 0.95）→ 直接返回缓存答案
未命中 → 调用 LLM → 存入缓存
```

### 配置语义缓存

```yaml
apiVersion: extensions.higress.io/v1alpha1
kind: WasmPlugin
metadata:
  name: semantic-cache
spec:
  url: oci://registry.example.com/plugins/semantic-cache:v1
  defaultConfig:
    # Embedding 服务
    embedding:
      provider: "openai"
      model: "text-embedding-3-small"
      endpoint: "https://api.openai.com/v1/embeddings"
    
    # 向量数据库
    vector_db:
      type: "redis"           # redis / milvus / qdrant
      endpoint: "redis.redis.svc.cluster.local:6379"
      index: "llm-cache"
    
    # 缓存策略
    cache:
      similarity_threshold: 0.95    # 相似度阈值
      ttl: 3600                     # 缓存 1 小时
      max_entries: 100000           # 最大缓存条目
    
    # 缓存 Key
    key_template: "{{model}}:{{user_id}}:{{prompt_hash}}"
```

---

## 成本统计与计费

### Token 消耗统计

```yaml
apiVersion: extensions.higress.io/v1alpha1
kind: WasmPlugin
metadata:
  name: llm-cost-tracker
spec:
  url: oci://registry.example.com/plugins/llm-cost-tracker:v1
  defaultConfig:
    # 模型单价（美元/1K tokens）
    pricing:
      gpt-4:
        input: 0.03
        output: 0.06
      gpt-3.5-turbo:
        input: 0.0005
        output: 0.0015
      claude-3-opus:
        input: 0.015
        output: 0.075
      claude-3-sonnet:
        input: 0.003
        output: 0.015
      qwen-max:
        input: 0.02
        output: 0.06
    
    # 统计维度
    dimensions:
      - "user_id"           # 按用户
      - "api_key"           # 按 API Key
      - "model"             # 按模型
      - "application"       # 按应用
    
    # 上报
    report:
      interval: 60          # 每分钟上报
      endpoint: "http://billing-service.internal/api/usage"
```

---

## 实战：完整 AI 网关配置

```yaml
# 1. 服务发现（多 LLM）
apiVersion: networking.higress.io/v1
kind: McpBridge
metadata:
  name: llm-services
  namespace: higress-system
spec:
  registries:
    - name: openai
      type: dns
      domain: api.openai.com
      port: 443
    - name: anthropic
      type: dns
      domain: api.anthropic.com
      port: 443
    - name: dashscope
      type: dns
      domain: dashscope.aliyuncs.com
      port: 443

---
# 2. 路由配置
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ai-gateway
  annotations:
    higress.io/destination: "openai.dns"
    higress.io/proxy-buffering: "off"
    higress.io/request-timeout: "300s"
spec:
  ingressClassName: higress
  rules:
    - host: ai.example.com
      http:
        paths:
          - path: /v1/chat
            pathType: Prefix
            backend:
              resource:
                apiGroup: networking.higress.io
                kind: McpBridge
                name: llm-services

---
# 3. Token 限流
apiVersion: extensions.higress.io/v1alpha1
kind: WasmPlugin
metadata:
  name: token-limit
spec:
  url: oci://registry.example.com/plugins/token-rate-limit:v1
  phase: UNSPECIFIED_PHASE
  priority: 900
  defaultConfig:
    rules:
      - name: "free"
        limit: { total_tokens: 15000, window: 86400 }
      - name: "pro"
        limit: { total_tokens: 1500000, window: 86400 }

---
# 4. Prompt 注入
apiVersion: extensions.higress.io/v1alpha1
kind: WasmPlugin
metadata:
  name: prompt-injector
spec:
  url: oci://registry.example.com/plugins/prompt-injector:v1
  priority: 800
  defaultConfig:
    rules:
      - match: { path_prefix: "/v1/chat/support" }
        inject:
          role: "system"
          content: "你是专业客服助手..."

---
# 5. 内容审核
apiVersion: extensions.higress.io/v1alpha1
kind: WasmPlugin
metadata:
  name: content-moderation
spec:
  url: oci://registry.example.com/plugins/content-moderation:v1
  priority: 700
  defaultConfig:
    input_moderation: { enabled: true, provider: "aliyun-green" }
    output_moderation: { enabled: true, provider: "aliyun-green" }
```

---

## 复习卡片

> [!TIP]
> **快速复习清单**
>
> 1. **AI 网关 vs 传统网关**：Token 计量、流式响应、Prompt 处理、内容审核、成本模型
> 2. **多模型路由**：按任务类型/成本/延迟路由到 GPT-4/Claude/通义/本地模型
> 3. **Token 限流**：按用户/API Key/应用配额，模型成本加权，Redis 滑动窗口
> 4. **Prompt 改写**：系统提示词注入、模板填充、安全检查（注入检测/敏感话题）
> 5. **内容审核**：输入审核（用户 Prompt）、输出审核（LLM 响应）、流式缓冲审核
> 6. **流式处理**：SSE 代理、禁用缓冲、Token 累计统计、超时设置
> 7. **语义缓存**：Embedding 向量、相似度匹配、TTL 策略
> 8. **成本统计**：模型单价、多维度统计（用户/模型/应用）、定期上报

---

> [!TIP]
> 下一篇：[Console 与运维](/blog/posts/higress-roadmap-12-console-ops/) 将讲解 Higress Console 使用、配置管理、版本升级、监控告警、故障排查。
>
> 返回 [Higress 学习路线总览](/blog/posts/higress-roadmap-00-overview/) | [合集页](/blog/higress-roadmap/)
