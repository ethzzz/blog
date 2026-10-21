---
title: 'Higress 核心概念'
published: 2026-09-17T11:00:00+08:00
description: '深入理解 Higress 架构：Envoy/Istio/Wasm 的关系、数据面与控制面分离、路由/服务/域名/插件模型、配置下发机制。'
tags: [Higress, 核心概念, Envoy, Istio, Wasm, 架构]
category: Higress学习路线
draft: false
---

> [!NOTE]
> 理解核心概念是掌握 Higress 的关键。本文从架构分层、组件关系、配置模型三个维度拆解 Higress 的设计哲学。

---

## Higress 架构全景

```
┌─────────────────────────────────────────────────────────┐
│                    Higress Console                       │
│              （Web UI / 配置管理 / 监控）                 │
└──────────────────────┬──────────────────────────────────┘
                       │ 配置下发（gRPC/xDS）
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Higress Controller（控制面）                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  Ingress    │  │  Gateway    │  │   WasmPlugin    │ │
│  │ Controller  │  │ API Ctrl    │  │   Controller    │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
│  ┌─────────────────────────────────────────────────────┐│
│  │         Istio Pilot（配置转换 + xDS 下发）           ││
│  └─────────────────────────────────────────────────────┘│
└──────────────────────┬──────────────────────────────────┘
                       │ xDS 协议（LDS/RDS/CDS/EDS）
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Higress Gateway（数据面）                    │
│  ┌─────────────────────────────────────────────────────┐│
│  │                    Envoy Proxy                       ││
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────────┐ ││
│  │  │Listener │→ │ Route   │→ │  Cluster (Upstream) │ ││
│  │  └─────────┘  └─────────┘  └─────────────────────┘ ││
│  │  ┌─────────────────────────────────────────────────┐││
│  │  │         Wasm Sandbox（插件运行时）               │││
│  │  │  ┌────────┐ ┌────────┐ ┌────────┐              │││
│  │  │  │ JWT    │ │ Rate   │ │ Custom │  ...         │││
│  │  │  │ Plugin │ │ Limit  │ │ Plugin │              │││
│  │  │  └────────┘ └────────┘ └────────┘              │││
│  │  └─────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

## 核心组件详解

### 1. Envoy（数据面内核）

**Envoy 是什么**：Lyft 开源的高性能 C++ 代理，CNCF 毕业项目，Istio 默认数据面。

**核心能力**：
- L4/L7 代理（TCP/HTTP/HTTP2/gRPC）
- 动态配置（xDS API，无需重启）
- 可观测性（内置 Metrics/Tracing/Logging）
- 扩展性（Wasm/Lua/原生 C++ Filter）

**Envoy 核心概念**：

| 概念 | 说明 | Higress 对应 |
|:--|:--|:--|
| Listener | 监听端口，接收连接 | Gateway 端口（80/443） |
| Route | 路由规则，匹配请求 | Ingress/Gateway API 路由 |
| Cluster | 上游服务集群 | Service（K8s/Nacos/DNS） |
| Endpoint | Cluster 中的具体实例 | Pod IP / 服务实例 |
| Filter | 请求/响应处理链 | Wasm 插件 |

**xDS 协议族**：

```
LDS (Listener Discovery Service)  → 发现监听器配置
RDS (Route Discovery Service)     → 发现路由规则
CDS (Cluster Discovery Service)   → 发现上游集群
EDS (Endpoint Discovery Service)  → 发现集群端点
SDS (Secret Discovery Service)    → 发现 TLS 证书
```

### 2. Istio（控制面基座）

**Istio 是什么**：CNCF 服务网格项目，提供流量管理、安全、可观测性。

**Higress 为什么用 Istio**：
- 复用 Istio Pilot 的配置转换能力（K8s CRD → Envoy xDS）
- 复用 Istio 的服务发现（K8s Service Registry）
- 复用 Istio 的证书管理（Citadel）
- 避免重复造轮子

**Higress 对 Istio 的裁剪**：
- 去掉 Sidecar 注入（网关场景不需要）
- 去掉 Mixer（性能瓶颈，已废弃）
- 保留 Pilot（配置下发核心）
- 扩展 WasmPlugin CRD（Istio 原生不支持）

### 3. Wasm（扩展机制）

**Wasm 是什么**：WebAssembly，二进制指令格式，沙箱隔离，多语言支持。

**为什么用 Wasm 而不是 Lua/原生 Filter**：

| 维度 | Wasm | Lua | 原生 C++ Filter |
|:--|:--|:--|:--|
| 语言 | Go/Rust/AssemblyScript/C++ | Lua | C++ |
| 沙箱 | ✅ 强隔离 | ⚠️ 弱隔离 | ❌ 无隔离 |
| 热更新 | ✅ 不停机 | ✅ | ❌ 需重编译 |
| 性能 | ~原生 80-90% | ~原生 50% | 100% |
| 生态 | 快速增长 | 成熟 | 门槛高 |
| 安全性 | 内存隔离 | 可能崩溃 Envoy | 可能崩溃 Envoy |

**Proxy-Wasm 规范**：
- Envoy 官方的 Wasm 扩展标准
- 定义宿主（Envoy）与插件（Wasm）的 ABI 接口
- 插件通过 SDK 调用宿主能力（读 Header、发 HTTP 请求、写日志等）

---

## Higress 配置模型

### 四层配置对象

```
┌─────────────────────────────────────────┐
│  Domain（域名）                          │
│  ├── Route（路由规则）                   │
│  │   ├── Match（匹配条件）               │
│  │   │   ├── Path（路径）                │
│  │   │   ├── Header（请求头）            │
│  │   │   └── Query（查询参数）           │
│  │   └── Action（动作）                  │
│  │       ├── Forward（转发到服务）        │
│  │       ├── Redirect（重定向）          │
│  │       └── Rewrite（改写）             │
│  └── Plugin（插件配置）                  │
│      ├── 全局级                          │
│      ├── 域名级                          │
│      ├── 路由级                          │
│      └── 服务级                          │
└─────────────────────────────────────────┘
```

### 配置优先级

```
路由级 > 域名级 > 服务级 > 全局级

示例：
- 全局配置限流 1000 QPS
- 域名 api.example.com 配置限流 500 QPS
- 路由 /api/v1/* 配置限流 100 QPS
- 路由 /api/v2/* 配置限流 200 QPS

最终生效：
/api/v1/* → 100 QPS（路由级覆盖）
/api/v2/* → 200 QPS（路由级覆盖）
其他 api.example.com 路径 → 500 QPS（域名级）
其他域名 → 1000 QPS（全局级）
```

### CRD 资源类型

| CRD | 作用 | 对应 K8s 资源 |
|:--|:--|:--|
| Ingress | 路由规则（兼容 K8s 标准） | networking.k8s.io/v1 Ingress |
| Gateway API | 路由规则（新一代标准） | gateway.networking.k8s.io |
| McpBridge | 服务发现配置 | Higress 自定义 |
| WasmPlugin | Wasm 插件配置 | extensions.higress.io/v1alpha1 |
| ConfigMap | 全局配置 | v1 ConfigMap |

---

## 配置下发流程

```
用户操作
   │
   ▼
Higress Console（Web UI）
   │
   ▼ 写入 K8s CRD（Ingress/WasmPlugin/McpBridge）
   │
   ▼
Higress Controller（监听 CRD 变化）
   │
   ▼ 转换为 Envoy 配置（xDS）
   │
   ▼ gRPC 推送到 Higress Gateway
   │
   ▼
Envoy 动态加载配置（无需重启）
   │
   ▼ 生效
```

**关键特性**：
- **声明式配置**：用户写 CRD，Controller 负责转换
- **动态下发**：配置变更秒级生效，无需重启网关
- **最终一致性**：Controller 持续 reconcile，确保配置同步

---

## 服务发现模型

### 支持的服务来源

| 类型 | 说明 | 配置方式 |
|:--|:--|:--|
| K8s Service | 原生 K8s 服务发现 | 自动（无需配置） |
| Nacos | 阿里开源注册中心 | McpBridge CRD |
| Consul | HashiCorp 服务发现 | McpBridge CRD |
| Eureka | Netflix 服务发现 | McpBridge CRD |
| DNS | 域名解析 | McpBridge CRD |
| 静态 | 手动配置 IP:Port | McpBridge CRD |

### McpBridge 示例

```yaml
apiVersion: networking.higress.io/v1
kind: McpBridge
metadata:
  name: default
  namespace: higress-system
spec:
  registries:
    - name: nacos-registry
      type: nacos
      nacosGroups:
        - DEFAULT_GROUP
      nacosServer: nacos.nacos.svc.cluster.local:8848
    
    - name: dns-registry
      type: dns
      domain: api.example.com
      port: 443
      protocol: https
```

---

## 插件模型

### 插件生命周期

```
请求进入 Envoy
   │
   ▼
Listener Filter（L4）
   │
   ▼
HTTP Filter Chain（L7）
   │
   ├── Wasm Plugin 1（如：JWT 认证）
   │      ├── OnHttpRequestHeaders
   │      ├── OnHttpRequestBody
   │      └── OnHttpResponseHeaders
   │
   ├── Wasm Plugin 2（如：限流）
   │      └── OnHttpRequestHeaders
   │
   └── Router Filter（转发到上游）
   │
   ▼
上游服务响应
   │
   ▼
Wasm Plugin（OnHttpResponse*）
   │
   ▼
返回客户端
```

### 插件钩子函数

| 钩子 | 触发时机 | 典型用途 |
|:--|:--|:--|
| OnHttpRequestHeaders | 收到请求头 | 认证、限流、路由改写 |
| OnHttpRequestBody | 收到请求体 | 内容审核、数据校验 |
| OnHttpResponseHeaders | 收到响应头 | 添加 Header、日志 |
| OnHttpResponseBody | 收到响应体 | 响应改写、脱敏 |
| OnLog | 请求完成 | 访问日志、Metrics |

---

## 与传统网关对比

| 维度 | Nginx | Spring Cloud Gateway | Higress |
|:--|:--|:--|:--|
| 内核 | C（Nginx） | Java（Netty） | C++（Envoy） |
| 配置 | nginx.conf（静态） | YAML（需重启） | CRD（动态下发） |
| 扩展 | Lua/C Module | Java Filter | Wasm（多语言） |
| 服务发现 | 手动/DNS | Eureka/Nacos | K8s/Nacos/Consul/DNS |
| 热更新 | reload（短暂中断） | 需重启 | xDS（无中断） |
| 可观测性 | 需额外模块 | Spring Actuator | 内置 Metrics/Tracing |
| 云原生 | ❌ | ⚠️ 部分 | ✅ K8s 原生 |
| 性能 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 复习卡片

> [!TIP]
> **快速复习清单**
>
> 1. **架构分层**：Console（UI）→ Controller（控制面）→ Gateway（数据面/Envoy）
> 2. **三大内核**：Envoy（代理）、Istio（配置转换）、Wasm（扩展）
> 3. **xDS 协议**：LDS/RDS/CDS/EDS/SDS，动态配置无需重启
> 4. **配置模型**：Domain → Route → Plugin，优先级：路由级 > 域名级 > 服务级 > 全局级
> 5. **CRD 资源**：Ingress/Gateway API（路由）、McpBridge（服务发现）、WasmPlugin（插件）
> 6. **服务发现**：K8s/Nacos/Consul/Eureka/DNS/静态，通过 McpBridge 配置
> 7. **插件钩子**：OnHttpRequestHeaders/Body、OnHttpResponseHeaders/Body、OnLog
> 8. **vs 传统网关**：动态配置、Wasm 多语言扩展、K8s 原生、内置可观测性

---

> [!TIP]
> 下一篇：[路由配置](/blog/posts/higress-roadmap-03-routing/) 将详细讲解 Ingress/Gateway API 路由规则、域名/路径/Header/Query 匹配、权重路由、路径改写等实战配置。
>
> 返回 [Higress 学习路线总览](/blog/posts/higress-roadmap-00-overview/) | [合集页](/blog/higress-roadmap/)
