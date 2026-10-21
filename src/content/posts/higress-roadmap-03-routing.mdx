---
title: 'Higress 路由配置'
published: 2026-09-17T11:30:00+08:00
description: '详解 Higress 路由配置：Ingress/Gateway API 标准、域名/路径/Header/Query 匹配规则、权重路由、路径改写、重定向、超时重试。'
tags: [Higress, 路由配置, Ingress, Gateway API, 流量管理]
category: Higress学习路线
draft: false
---

> [!NOTE]
> 路由是网关的核心能力。Higress 兼容 K8s Ingress 和 Gateway API 标准，同时提供丰富的扩展注解。

---

## 路由配置方式对比

| 方式 | 标准 | 复杂度 | 功能 | 推荐场景 |
|:--|:--|:--|:--|:--|
| Ingress | K8s 原生 | ⭐⭐ | 基础路由 + 注解扩展 | 兼容现有 Ingress |
| Gateway API | K8s 新一代 | ⭐⭐⭐ | 功能更强、角色分离 | 新项目、复杂路由 |
| Higress Console | Web UI | ⭐ | 可视化配置 | 快速上手、运维 |

---

## 方式一：Ingress 路由

### 基础路由（域名 + 路径）

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: demo-ingress
  namespace: default
  annotations:
    higress.io/destination: "httpbin.default.svc.cluster.local:80"
spec:
  ingressClassName: higress
  rules:
    - host: demo.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: httpbin
                port:
                  number: 80
```

**测试**：
```bash
curl -H "Host: demo.example.com" http://<gateway-ip>/api/get
```

### 路径匹配类型

| pathType | 说明 | 示例 |
|:--|:--|:--|
| Exact | 精确匹配 | `/api/v1/users` 只匹配该路径 |
| Prefix | 前缀匹配 | `/api` 匹配 `/api`、`/api/v1`、`/api/v2` |
| ImplementationSpecific | 实现相关 | Higress 支持正则（见下文） |

### 正则路径匹配（Higress 扩展）

```yaml
metadata:
  annotations:
    higress.io/use-regex: "true"
    higress.io/rewrite-target: /$1
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api/(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: api-service
                port:
                  number: 8080
```

**效果**：
- `/api/users` → 转发到 `/users`
- `/api/orders/123` → 转发到 `/orders/123`

### Header 匹配

```yaml
metadata:
  annotations:
    higress.io/header-match: "X-Env:gray"
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-gray
                port:
                  number: 8080
```

**效果**：只有 `X-Env: gray` 的请求才路由到 gray 服务。

### Query 参数匹配

```yaml
metadata:
  annotations:
    higress.io/query-match: "version:v2"
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-v2
                port:
                  number: 8080
```

**效果**：`/api?version=v2` 路由到 v2 服务。

---

## 方式二：Gateway API 路由

### Gateway + HTTPRoute

```yaml
# 1. 定义 Gateway（监听端口）
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: demo-gateway
  namespace: higress-system
spec:
  gatewayClassName: higress
  listeners:
    - name: http
      protocol: HTTP
      port: 80
      allowedRoutes:
        namespaces:
          from: All

---
# 2. 定义 HTTPRoute（路由规则）
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: demo-route
  namespace: default
spec:
  parentRefs:
    - name: demo-gateway
      namespace: higress-system
  hostnames:
    - "api.example.com"
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /api/v1
          headers:
            - name: X-Env
              value: prod
      filters:
        - type: RequestHeaderModifier
          requestHeaderModifier:
            add:
              - name: X-Routed-By
                value: higress
        - type: URLRewrite
          urlRewrite:
            path:
              type: ReplacePrefixMatch
              replacePrefixMatch: /v1
      backendRefs:
        - name: api-service
          port: 8080
          weight: 90
        - name: api-service-canary
          port: 8080
          weight: 10
```

**Gateway API 优势**：
- 角色分离：平台工程师管 Gateway，开发管 HTTPRoute
- 功能更强：原生支持 Header/Query 匹配、权重、Filter
- 标准化：K8s 官方推荐，未来替代 Ingress

---

## 高级路由功能

### 权重路由（灰度发布）

```yaml
metadata:
  annotations:
    higress.io/canary: "true"
    higress.io/canary-weight: "20"
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-canary
                port:
                  number: 8080
```

**效果**：20% 流量到 canary 服务，80% 到稳定服务。

### 路径改写

```yaml
metadata:
  annotations:
    higress.io/rewrite-target: /v2/$1
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api/(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: api-service
                port:
                  number: 8080
```

**效果**：`/api/users` → 转发到 `/v2/users`

### 重定向

```yaml
metadata:
  annotations:
    higress.io/permanent-redirect: "https://new.example.com$request_uri"
spec:
  rules:
    - host: old.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: placeholder
                port:
                  number: 80
```

**效果**：所有 `old.example.com` 请求 301 重定向到 `new.example.com`

### 超时配置

```yaml
metadata:
  annotations:
    higress.io/upstream-vhost: "api.example.com"
    higress.io/request-timeout: "30s"
    higress.io/connect-timeout: "5s"
spec:
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

### 重试策略

```yaml
metadata:
  annotations:
    higress.io/retry-count: "3"
    higress.io/retry-timeout: "10s"
    higress.io/retry-on: "5xx,reset,connect-failure"
spec:
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

**重试条件**：
- `5xx`：上游返回 5xx
- `reset`：连接被重置
- `connect-failure`：连接失败
- `retriable-4xx`：可重试的 4xx（如 409）

### CORS 跨域

```yaml
metadata:
  annotations:
    higress.io/enable-cors: "true"
    higress.io/cors-allow-origin: "https://web.example.com"
    higress.io/cors-allow-methods: "GET,POST,PUT,DELETE"
    higress.io/cors-allow-headers: "Authorization,Content-Type"
    higress.io/cors-max-age: "86400"
spec:
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

---

## 路由优先级

```
匹配顺序（从高到低）：
1. 精确路径（Exact）
2. 最长前缀（Prefix，/api/v1 > /api）
3. 正则路径（ImplementationSpecific）
4. Header/Query 匹配（更具体的优先）
5. 权重路由（按比例分配）

示例：
/api/v1/users     → 匹配 /api/v1（最长前缀）
/api/v1           → 匹配 /api/v1
/api/v2/orders    → 匹配 /api（前缀）
/api              → 匹配 /api
/health           → 无匹配，返回 404
```

---

## 实战案例

### 案例 1：多环境路由

```yaml
# 开发环境
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-dev
  annotations:
    higress.io/header-match: "X-Env:dev"
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
                name: api-dev
                port:
                  number: 8080

---
# 生产环境
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-prod
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
                name: api-prod
                port:
                  number: 8080
```

### 案例 2：A/B 测试

```yaml
# 版本 A（80%）
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ab-test-a
  annotations:
    higress.io/canary: "true"
    higress.io/canary-weight: "80"
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
                name: api-version-a
                port:
                  number: 8080

---
# 版本 B（20%）
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ab-test-b
  annotations:
    higress.io/canary: "true"
    higress.io/canary-weight: "20"
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
                name: api-version-b
                port:
                  number: 8080
```

### 案例 3：API 版本管理

```yaml
# v1 API（旧版本，兼容）
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-v1
  annotations:
    higress.io/rewrite-target: /$1
spec:
  ingressClassName: higress
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /v1/(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: api-legacy
                port:
                  number: 8080

---
# v2 API（新版本）
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-v2
  annotations:
    higress.io/rewrite-target: /$1
spec:
  ingressClassName: higress
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /v2/(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: api-new
                port:
                  number: 8080
```

---

## 常见问题

### Q1: Ingress 配置不生效

```bash
# 1. 检查 Ingress 状态
kubectl get ingress -n default
kubectl describe ingress demo-ingress -n default

# 2. 检查 Higress Controller 日志
kubectl logs -n higress-system deploy/higress-controller

# 3. 确认 ingressClassName
spec:
  ingressClassName: higress   # 必须是 higress

# 4. 确认 Service 存在且 Endpoint 正常
kubectl get svc httpbin -n default
kubectl get endpoints httpbin -n default
```

### Q2: 路由匹配顺序混乱

```bash
# 查看 Envoy 实际路由配置
kubectl exec -n higress-system deploy/higress-gateway -- \
  curl -s localhost:15000/config_dump | jq '.configs[] | select(.["@type"]=="type.googleapis.com/envoy.admin.v3.RoutesConfigDump")'

# 简化排查：用 curl -v 看响应头
curl -v -H "Host: api.example.com" http://<gateway-ip>/api/v1/users
# 查看 X-Envoy-Upstream-Service-Time 等 Header 确认路由到了哪个服务
```

### Q3: 正则路径不生效

```yaml
# 必须加注解
annotations:
  higress.io/use-regex: "true"

# pathType 必须是 ImplementationSpecific
pathType: ImplementationSpecific

# 路径用正则语法
path: /api/(.*)
```

---

## 复习卡片

> [!TIP]
> **快速复习清单**
>
> 1. **两种路由标准**：Ingress（兼容）、Gateway API（推荐新项目）
> 2. **路径匹配**：Exact（精确）、Prefix（前缀）、ImplementationSpecific（正则）
> 3. **高级匹配**：Header（`higress.io/header-match`）、Query（`higress.io/query-match`）
> 4. **权重路由**：`higress.io/canary-weight: "20"`（灰度发布）
> 5. **路径改写**：`higress.io/rewrite-target: /v2/$1`
> 6. **重定向**：`higress.io/permanent-redirect`（301）/ `temporal-redirect`（302）
> 7. **超时重试**：`request-timeout`、`retry-count`、`retry-on: 5xx,reset`
> 8. **CORS**：`enable-cors`、`cors-allow-origin/methods/headers`
> 9. **优先级**：精确 > 最长前缀 > 正则 > Header/Query > 权重

---

> [!TIP]
> 下一篇：[服务发现](/blog/posts/higress-roadmap-04-service-discovery/) 将讲解如何对接 K8s/Nacos/Consul/Eureka/DNS/静态服务，实现动态服务发现。
>
> 返回 [Higress 学习路线总览](/blog/posts/higress-roadmap-00-overview/) | [合集页](/blog/higress-roadmap/)
