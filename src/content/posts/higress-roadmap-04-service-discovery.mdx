---
title: 'Higress 服务发现'
published: 2026-09-17T12:00:00+08:00
description: '详解 Higress 服务发现机制：K8s Service、Nacos、Consul、Eureka、DNS、静态服务，以及 McpBridge CRD 配置。'
tags: [Higress, 服务发现, Nacos, Consul, K8s, McpBridge]
category: Higress学习路线
draft: false
---

> [!NOTE]
> 服务发现是网关的核心能力。Higress 支持多种注册中心，通过 McpBridge CRD 统一配置，实现动态服务发现。

---

## 服务发现类型对比

| 类型 | 适用场景 | 动态更新 | 健康检查 | 配置复杂度 |
|:--|:--|:--|:--|:--|
| K8s Service | K8s 原生应用 | ✅ | ✅（K8s 内置） | ⭐ |
| Nacos | 微服务（Spring Cloud/Alibaba） | ✅ | ✅ | ⭐⭐ |
| Consul | 多数据中心、服务网格 | ✅ | ✅ | ⭐⭐⭐ |
| Eureka | Spring Cloud Netflix | ✅ | ✅ | ⭐⭐ |
| DNS | 外部服务、云厂商 LB | ⚠️ 依赖 TTL | ❌ | ⭐ |
| 静态 | 固定 IP、测试环境 | ❌ | ❌ | ⭐ |

---

## K8s Service（原生支持）

### 自动发现

Higress 部署在 K8s 中时，**自动监听所有 Service 和 Endpoint**，无需额外配置。

```yaml
# 只需创建 Ingress 指向 Service
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: demo-ingress
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
                name: my-service      # K8s Service 名称
                port:
                  number: 8080
```

**工作原理**：
```
Higress Controller 监听 K8s API Server
   ↓
Service/Endpoint 变化 → 触发 reconcile
   ↓
转换为 Envoy Cluster + Endpoint 配置
   ↓
通过 xDS 推送到 Higress Gateway
   ↓
Envoy 动态加载（无需重启）
```

### 跨命名空间服务

```yaml
# 方式 1：在 Ingress 中指定完整服务名
backend:
  service:
    name: my-service.other-namespace.svc.cluster.local
    port:
      number: 8080

# 方式 2：用 higress.io/destination 注解
metadata:
  annotations:
    higress.io/destination: "my-service.other-namespace.svc.cluster.local:8080"
```

---

## Nacos 服务发现

### McpBridge 配置

```yaml
apiVersion: networking.higress.io/v1
kind: McpBridge
metadata:
  name: nacos-bridge
  namespace: higress-system
spec:
  registries:
    - name: nacos-prod
      type: nacos
      nacosServer: nacos.nacos.svc.cluster.local:8848
      nacosNamespaceId: prod          # 命名空间 ID（留空为 public）
      nacosGroups:
        - DEFAULT_GROUP
        - ORDER_GROUP
      nacosTimeout: 3000              # 超时（毫秒）
      # 认证（Nacos 2.x 开启鉴权时需要）
      nacosUsername: nacos
      nacosPassword: nacos
```

### 路由到 Nacos 服务

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: order-route
  annotations:
    # 关键：指定服务来源为 Nacos
    higress.io/destination: "order-service.DEFAULT-GROUP.public.nacos"
spec:
  ingressClassName: higress
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /order
            pathType: Prefix
            backend:
              resource:
                apiGroup: networking.higress.io
                kind: McpBridge
                name: nacos-bridge
```

**destination 格式**：`{服务名}.{分组}.{命名空间}.nacos`

### Nacos 健康检查

Higress 自动订阅 Nacos 服务列表，Nacos 负责健康检查：
- **临时实例**：客户端心跳（默认 5s），15s 无心跳标记不健康，30s 剔除
- **持久实例**：服务端主动探测（TCP/HTTP/MySQL）

---

## Consul 服务发现

### McpBridge 配置

```yaml
apiVersion: networking.higress.io/v1
kind: McpBridge
metadata:
  name: consul-bridge
  namespace: higress-system
spec:
  registries:
    - name: consul-prod
      type: consul
      consulServer: consul.consul.svc.cluster.local:8500
      consulDataCenter: dc1
      consulServiceTags:
        - production
        - v2
      consulToken: "your-acl-token"   # Consul ACL Token（可选）
```

### 路由到 Consul 服务

```yaml
metadata:
  annotations:
    higress.io/destination: "payment-service.consul"
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /payment
            backend:
              resource:
                apiGroup: networking.higress.io
                kind: McpBridge
                name: consul-bridge
```

---

## Eureka 服务发现

### McpBridge 配置

```yaml
apiVersion: networking.higress.io/v1
kind: McpBridge
metadata:
  name: eureka-bridge
  namespace: higress-system
spec:
  registries:
    - name: eureka-prod
      type: eureka
      eurekaServer: http://eureka.eureka.svc.cluster.local:8761/eureka
      eurekaTimeout: 3000
```

### 路由到 Eureka 服务

```yaml
metadata:
  annotations:
    higress.io/destination: "user-service.eureka"
```

---

## DNS 服务发现

### 适用场景

- 外部 SaaS API（`api.openai.com`）
- 云厂商负载均衡（ALB/SLB 域名）
- 跨集群服务（通过 DNS 解析）

### McpBridge 配置

```yaml
apiVersion: networking.higress.io/v1
kind: McpBridge
metadata:
  name: dns-bridge
  namespace: higress-system
spec:
  registries:
    - name: external-api
      type: dns
      domain: api.openai.com
      port: 443
      protocol: https
      dnsRefreshRate: 60              # DNS 刷新间隔（秒）
    
    - name: internal-lb
      type: dns
      domain: internal-lb.example.com
      port: 80
      protocol: http
      dnsRefreshRate: 30
```

### 路由到 DNS 服务

```yaml
metadata:
  annotations:
    higress.io/destination: "external-api.dns"
spec:
  rules:
    - host: ai.example.com
      http:
        paths:
          - path: /v1/chat
            backend:
              resource:
                apiGroup: networking.higress.io
                kind: McpBridge
                name: dns-bridge
```

---

## 静态服务发现

### 适用场景

- 固定 IP 的后端服务
- 测试环境
- 没有注册中心的遗留系统

### McpBridge 配置

```yaml
apiVersion: networking.higress.io/v1
kind: McpBridge
metadata:
  name: static-bridge
  namespace: higress-system
spec:
  registries:
    - name: legacy-service
      type: static
      staticServers:
        - address: 192.168.1.100:8080
          weight: 70
        - address: 192.168.1.101:8080
          weight: 30
```

### 路由到静态服务

```yaml
metadata:
  annotations:
    higress.io/destination: "legacy-service.static"
```

---

## 多注册中心混合使用

### 场景

企业同时存在：
- K8s 新应用（K8s Service）
- 传统微服务（Nacos/Eureka）
- 外部 SaaS（DNS）
- 遗留系统（静态 IP）

### 配置示例

```yaml
apiVersion: networking.higress.io/v1
kind: McpBridge
metadata:
  name: multi-bridge
  namespace: higress-system
spec:
  registries:
    # Nacos 注册中心
    - name: nacos
      type: nacos
      nacosServer: nacos.nacos.svc.cluster.local:8848
      nacosGroups: [DEFAULT_GROUP]
    
    # Eureka 注册中心
    - name: eureka
      type: eureka
      eurekaServer: http://eureka:8761/eureka
    
    # DNS 外部服务
    - name: openai
      type: dns
      domain: api.openai.com
      port: 443
      protocol: https
    
    # 静态遗留服务
    - name: legacy
      type: static
      staticServers:
        - address: 10.0.0.100:8080
```

### 路由分发

```yaml
# K8s 服务（默认，无需 McpBridge）
- path: /api/k8s
  backend:
    service:
      name: k8s-service
      port: { number: 8080 }

# Nacos 服务
- path: /api/nacos
  annotations:
    higress.io/destination: "nacos-service.DEFAULT-GROUP.public.nacos"

# Eureka 服务
- path: /api/eureka
  annotations:
    higress.io/destination: "eureka-service.eureka"

# DNS 外部服务
- path: /api/openai
  annotations:
    higress.io/destination: "openai.dns"

# 静态服务
- path: /api/legacy
  annotations:
    higress.io/destination: "legacy.static"
```

---

## 服务发现健康检查

### 健康检查机制

| 注册中心 | 健康检查方式 | 检查频率 | 剔除策略 |
|:--|:--|:--|:--|
| K8s | Readiness Probe | 按 Pod 配置 | Endpoint 移除 |
| Nacos | 客户端心跳 / 服务端探测 | 5s / 自定义 | 15s 标记不健康，30s 剔除 |
| Consul | TCP/HTTP/gRPC 探测 | 10s（默认） | 3 次失败标记 critical |
| Eureka | 客户端心跳 | 30s | 90s 无心跳剔除 |
| DNS | 无（依赖 DNS 解析） | TTL | 解析失败即剔除 |
| 静态 | Envoy 主动健康检查 | 可配置 | 可配置 |

### Envoy 主动健康检查（静态/DNS）

```yaml
apiVersion: networking.higress.io/v1
kind: McpBridge
metadata:
  name: static-with-health-check
  namespace: higress-system
spec:
  registries:
    - name: my-service
      type: static
      staticServers:
        - address: 10.0.0.100:8080
        - address: 10.0.0.101:8080
      # Higress 扩展：主动健康检查
      healthCheck:
        enabled: true
        interval: 5s
        timeout: 3s
        unhealthyThreshold: 3
        healthyThreshold: 2
        httpHealthCheck:
          path: /health
          expectedStatus: 200
```

---

## 常见问题

### Q1: Nacos 服务发现不生效

```bash
# 1. 检查 McpBridge 状态
kubectl get mcpbridge -n higress-system
kubectl describe mcpbridge nacos-bridge -n higress-system

# 2. 检查 Higress Controller 日志
kubectl logs -n higress-system deploy/higress-controller | grep nacos

# 3. 确认 Nacos 服务已注册
curl http://nacos-server:8848/nacos/v1/ns/instance/list?serviceName=order-service

# 4. 确认网络连通性
kubectl exec -n higress-system deploy/higress-controller -- \
  curl -v http://nacos-server:8848/nacos/
```

### Q2: 服务实例上下线延迟

```bash
# 检查 xDS 推送延迟
kubectl logs -n higress-system deploy/higress-gateway | grep "cds: update"

# 调整 Nacos 订阅推送间隔（默认 10s）
# 在 McpBridge 中设置 nacosTimeout 更短

# 检查 Envoy Endpoint 状态
kubectl exec -n higress-system deploy/higress-gateway -- \
  curl -s localhost:15000/clusters | grep order-service
```

### Q3: 跨命名空间服务无法访问

```bash
# 确认 RBAC 权限
kubectl auth can-i list services --all-namespaces \
  --as=system:serviceaccount:higress-system:higress-controller

# 确认 Service 存在
kubectl get svc my-service -n other-namespace

# 确认 Endpoint 正常
kubectl get endpoints my-service -n other-namespace
```

---

## 复习卡片

> [!TIP]
> **快速复习清单**
>
> 1. **6 种服务发现**：K8s Service（原生）、Nacos、Consul、Eureka、DNS、静态
> 2. **K8s Service**：自动发现，无需配置，Ingress 直接指向 Service
> 3. **McpBridge CRD**：统一配置非 K8s 服务来源
> 4. **Nacos destination 格式**：`{服务名}.{分组}.{命名空间}.nacos`
> 5. **DNS 适用场景**：外部 SaaS、云厂商 LB、跨集群服务
> 6. **静态适用场景**：固定 IP、测试环境、遗留系统
> 7. **健康检查**：K8s（Readiness）、Nacos（心跳）、Consul（探测）、Envoy（主动检查）
> 8. **混合使用**：一个 McpBridge 可配置多个 registries

---

> [!TIP]
> 下一篇：[流量治理](/blog/posts/higress-roadmap-05-traffic-management/) 将讲解限流、熔断、重试、超时、灰度发布、金丝雀、蓝绿部署等流量管理能力。
>
> 返回 [Higress 学习路线总览](/blog/posts/higress-roadmap-00-overview/) | [合集页](/blog/higress-roadmap/)
