---
title: 'Higress 流量治理'
published: 2026-09-17T12:30:00+08:00
description: '详解 Higress 流量治理能力：限流、熔断、重试、超时、灰度发布、金丝雀部署、蓝绿部署、流量镜像。'
tags: [Higress, 流量治理, 限流, 熔断, 灰度发布, 金丝雀]
category: Higress学习路线
draft: false
---

> [!NOTE]
> 流量治理是网关的核心价值。Higress 提供限流、熔断、重试、超时、灰度等能力，保障系统稳定性和发布安全。

---

## 流量治理能力全景

```
请求进入
   │
   ▼
┌─────────────┐
│  限流       │  ← 控制 QPS/并发，防止过载
├─────────────┤
│  熔断       │  ← 上游故障时快速失败，防止雪崩
├─────────────┤
│  重试       │  ← 瞬时故障自动重试
├─────────────┤
│  超时       │  ← 控制响应时间
├─────────────┤
│  灰度路由   │  ← 按权重/Header/Cookie 分流
├─────────────┤
│  流量镜像   │  ← 复制流量到测试环境
└─────────────┘
   │
   ▼
上游服务
```

---

## 限流（Rate Limiting）

### 全局限流

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-route
  annotations:
    # 全局限流：1000 QPS
    higress.io/limit-rps: "1000"
    # 突发流量：允许 2000（令牌桶）
    higress.io/limit-burst-multiplier: "2"
spec:
  ingressClassName: higress
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 8080
```

### 按维度限流

```yaml
metadata:
  annotations:
    # 按 Header 限流（每个用户独立配额）
    higress.io/limit-by-header: "X-User-ID"
    higress.io/limit-rps: "100"
    
    # 按 IP 限流
    higress.io/limit-by-ip: "true"
    higress.io/limit-rps: "50"
    
    # 按路径限流（不同 API 不同配额）
    higress.io/limit-by-path: "true"
```

### 集群限流（Redis）

```yaml
# ConfigMap 配置全局集群限流
apiVersion: v1
kind: ConfigMap
metadata:
  name: higress-config
  namespace: higress-system
data:
  higress: |
    rateLimit:
      redis:
        service: redis.redis.svc.cluster.local
        port: 6379
        timeout: 1000
        database: 0
      # 默认限流规则
      rules:
        - name: global-limit
          limit: 10000        # 10000 QPS
          limitByKey: "header:X-User-ID"
```

### 限流响应定制

```yaml
metadata:
  annotations:
    higress.io/limit-rps: "100"
    higress.io/limit-rejected-code: "429"
    higress.io/limit-rejected-body: '{"error":"Too Many Requests","retryAfter":60}'
    higress.io/limit-rejected-header: "Retry-After:60"
```

---

## 熔断（Circuit Breaking）

### 熔断原理

```
状态机：
┌─────────┐  失败率 > 阈值  ┌─────────┐
│ CLOSED  │ ─────────────→ │  OPEN   │
│（正常）  │                │（熔断）  │
└─────────┘                └─────────┘
     ↑                          │
     │    探测成功               │ 超时后
     │  ←─────────────────────  ▼
     │                    ┌─────────┐
     └─────────────────── │ HALF-   │
                          │ OPEN    │
                          │（探测）  │
                          └─────────┘
```

### 熔断配置

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-route
  annotations:
    # 熔断：连续 5 次 5xx 后熔断
    higress.io/circuit-breaker-consecutive-5xx: "5"
    # 熔断时长：30s
    higress.io/circuit-breaker-sleep-window: "30s"
    # 最小请求数（避免误判）
    higress.io/circuit-breaker-min-request-volume: "20"
    # 错误率阈值（50%）
    higress.io/circuit-breaker-error-percent: "50"
spec:
  ingressClassName: higress
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api
            backend:
              service:
                name: api-service
                port:
                  number: 8080
```

### 熔断降级响应

```yaml
metadata:
  annotations:
    higress.io/circuit-breaker-consecutive-5xx: "5"
    # 熔断时返回自定义响应
    higress.io/circuit-breaker-fallback-code: "503"
    higress.io/circuit-breaker-fallback-body: '{"error":"Service Unavailable","message":"Circuit breaker open"}'
    # 或降级到备用服务
    higress.io/circuit-breaker-fallback-service: "backup-service.default.svc.cluster.local:8080"
```

---

## 重试（Retry）

### 重试策略

```yaml
metadata:
  annotations:
    # 重试次数
    higress.io/retry-count: "3"
    # 重试超时
    higress.io/retry-timeout: "10s"
    # 重试条件
    higress.io/retry-on: "5xx,reset,connect-failure,retriable-4xx"
    # 重试间隔（指数退避）
    higress.io/retry-back-off-base-interval-ms: "100"
    higress.io/retry-back-off-max-interval-ms: "1000"
```

### 重试条件详解

| 条件 | 说明 |
|:--|:--|
| `5xx` | 上游返回 5xx |
| `reset` | 连接被重置 |
| `connect-failure` | TCP 连接失败 |
| `retriable-4xx` | 可重试的 4xx（409 Conflict 等） |
| `gateway-error` | 网关内部错误 |
| `refused-stream` | 上游拒绝流 |

### 不重试的场景

```yaml
# POST 请求默认不重试（幂等性考虑）
# 如需强制重试：
metadata:
  annotations:
    higress.io/retry-count: "3"
    higress.io/retry-on: "5xx"
    higress.io/retry-non-idempotent: "true"   # 允许非幂等请求重试
```

---

## 超时（Timeout）

### 超时配置

```yaml
metadata:
  annotations:
    # 连接超时（TCP 握手）
    higress.io/connect-timeout: "5s"
    # 请求超时（完整请求）
    higress.io/request-timeout: "30s"
    # 上游响应超时（等待首字节）
    higress.io/upstream-response-timeout: "10s"
    # 空闲超时（Keep-Alive）
    higress.io/idle-timeout: "60s"
```

### 超时层级

```
客户端 ←─── request-timeout ───→ Higress ←─── upstream-response-timeout ───→ 上游服务
                                     ↑
                              connect-timeout
                              （TCP 握手）
```

---

## 灰度发布

### 基于权重（金丝雀）

```yaml
# 稳定版本（90%）
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-stable
spec:
  ingressClassName: higress
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api
            backend:
              service:
                name: api-stable
                port: { number: 8080 }

---
# 灰度版本（10%）
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-canary
  annotations:
    higress.io/canary: "true"
    higress.io/canary-weight: "10"
spec:
  ingressClassName: higress
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api
            backend:
              service:
                name: api-canary
                port: { number: 8080 }
```

### 基于 Header（定向灰度）

```yaml
# 只有 X-Env: canary 的请求才到灰度版本
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-canary-header
  annotations:
    higress.io/canary: "true"
    higress.io/canary-by-header: "X-Env"
    higress.io/canary-by-header-value: "canary"
spec:
  ingressClassName: higress
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api
            backend:
              service:
                name: api-canary
                port: { number: 8080 }
```

### 基于 Cookie（用户灰度）

```yaml
metadata:
  annotations:
    higress.io/canary: "true"
    higress.io/canary-by-cookie: "gray_user"
    # Cookie gray_user=always → 灰度
    # Cookie gray_user=never → 稳定版
    # 无 Cookie → 按权重分配
```

### 灰度发布流程

```
1. 部署灰度版本（api-canary）
2. 创建 Canary Ingress（权重 5%）
3. 观察监控（错误率、延迟、业务指标）
4. 逐步增加权重：5% → 20% → 50% → 100%
5. 全量后删除稳定版，重命名灰度版为稳定版
6. 清理 Canary Ingress
```

---

## 蓝绿部署

### 原理

```
┌─────────────┐         ┌─────────────┐
│   Blue      │         │   Green     │
│  (当前生产)  │         │  (新版本)   │
│  v1.0       │         │  v2.0       │
└─────────────┘         └─────────────┘
       ↑                       ↑
       │    切换 Ingress       │
       └───────────────────────┘
       
切换瞬间完成，回滚也只需切回 Blue
```

### 配置示例

```yaml
# 初始：Blue 环境
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-blue
spec:
  ingressClassName: higress
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api
            backend:
              service:
                name: api-blue
                port: { number: 8080 }

---
# 部署 Green 环境后，切换 Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-green    # 新名称
spec:
  ingressClassName: higress
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api
            backend:
              service:
                name: api-green    # 切换到 Green
                port: { number: 8080 }

# 删除旧的 Blue Ingress
kubectl delete ingress api-blue
```

---

## 流量镜像（Traffic Mirroring）

### 适用场景

- 新版本测试（复制生产流量到测试环境）
- A/B 测试数据收集
- 安全审计（复制流量到分析系统）

### 配置示例

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-route
  annotations:
    # 镜像 10% 流量到测试服务
    higress.io/mirror-service: "api-test.default.svc.cluster.local:8080"
    higress.io/mirror-percent: "10"
spec:
  ingressClassName: higress
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api
            backend:
              service:
                name: api-prod
                port: { number: 8080 }
```

**注意**：镜像请求的响应会被丢弃，不影响客户端。

---

## 实战案例

### 案例 1：API 网关完整流量治理

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-gateway
  annotations:
    # 限流
    higress.io/limit-rps: "1000"
    higress.io/limit-by-ip: "true"
    higress.io/limit-rejected-code: "429"
    
    # 熔断
    higress.io/circuit-breaker-consecutive-5xx: "5"
    higress.io/circuit-breaker-sleep-window: "30s"
    higress.io/circuit-breaker-error-percent: "50"
    
    # 重试
    higress.io/retry-count: "3"
    higress.io/retry-timeout: "10s"
    higress.io/retry-on: "5xx,reset,connect-failure"
    
    # 超时
    higress.io/connect-timeout: "5s"
    higress.io/request-timeout: "30s"
spec:
  ingressClassName: higress
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 8080
```

### 案例 2：渐进式灰度发布

```bash
# Step 1: 部署新版本
kubectl apply -f deployment-canary.yaml

# Step 2: 5% 流量
kubectl apply -f ingress-canary-5.yaml

# Step 3: 观察 10 分钟，检查监控
# - 错误率 < 1%
# - P99 延迟 < 500ms
# - 业务指标正常

# Step 4: 20% 流量
kubectl apply -f ingress-canary-20.yaml

# Step 5: 50% 流量
kubectl apply -f ingress-canary-50.yaml

# Step 6: 100% 流量（切换为主版本）
kubectl apply -f ingress-canary-100.yaml

# Step 7: 清理旧版本
kubectl delete deployment api-stable
kubectl delete ingress api-stable
```

---

## 常见问题

### Q1: 限流不生效

```bash
# 1. 检查注解是否正确
kubectl get ingress api-route -o yaml | grep higress.io/limit

# 2. 检查 Envoy 配置
kubectl exec -n higress-system deploy/higress-gateway -- \
  curl -s localhost:15000/config_dump | jq '.configs[] | select(.["@type"]=="type.googleapis.com/envoy.admin.v3.ListenersConfigDump")'

# 3. 确认限流维度
# limit-by-header 需要请求携带对应 Header
# limit-by-ip 需要获取真实客户端 IP（X-Forwarded-For）
```

### Q2: 熔断频繁触发

```bash
# 1. 检查上游服务健康状态
kubectl get pods -l app=api-service
kubectl logs -l app=api-service --tail=100

# 2. 调整熔断阈值
higress.io/circuit-breaker-consecutive-5xx: "10"    # 放宽
higress.io/circuit-breaker-min-request-volume: "50" # 提高最小请求数

# 3. 查看熔断状态
kubectl exec -n higress-system deploy/higress-gateway -- \
  curl -s localhost:15000/clusters | grep circuit_breaker
```

### Q3: 灰度发布流量分配不均

```bash
# 1. 确认 Canary Ingress 配置
kubectl get ingress -l higress.io/canary=true

# 2. 检查权重总和
# 多个 Canary Ingress 权重总和应为 100

# 3. 查看 Envoy 路由配置
kubectl exec -n higress-system deploy/higress-gateway -- \
  curl -s localhost:15000/config_dump | jq '.configs[] | select(.["@type"]=="type.googleapis.com/envoy.admin.v3.RoutesConfigDump")'
```

---

## 复习卡片

> [!TIP]
> **快速复习清单**
>
> 1. **限流**：`limit-rps`（QPS）、`limit-by-header/ip/path`（维度）、Redis 集群限流
> 2. **熔断**：连续 5xx / 错误率阈值 → OPEN → sleep-window → HALF-OPEN → 探测
> 3. **重试**：`retry-count`、`retry-on: 5xx,reset,connect-failure`、指数退避
> 4. **超时**：connect-timeout（握手）、request-timeout（完整）、upstream-response-timeout（首字节）
> 5. **灰度发布**：权重（金丝雀）、Header（定向）、Cookie（用户）
> 6. **蓝绿部署**：两套环境，切换 Ingress，瞬间完成
> 7. **流量镜像**：复制流量到测试环境，响应丢弃
> 8. **渐进式发布**：5% → 20% → 50% → 100%，每步观察监控

---

> [!TIP]
> 下一篇：[安全认证](/blog/posts/higress-roadmap-06-security/) 将讲解 JWT/OAuth2/API Key/CORS/WAF/mTLS/IP 黑白名单等安全能力。
>
> 返回 [Higress 学习路线总览](/blog/posts/higress-roadmap-00-overview/) | [合集页](/blog/higress-roadmap/)
