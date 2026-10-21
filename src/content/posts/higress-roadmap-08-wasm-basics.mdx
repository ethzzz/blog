---
title: 'Higress Wasm 插件基础'
published: 2026-09-17T14:00:00+08:00
description: '深入理解 Higress Wasm 插件机制：Proxy-Wasm 规范、沙箱隔离、热更新、OCI 镜像分发、插件生命周期。'
tags: [Higress, Wasm, Proxy-Wasm, 插件开发, OCI, 沙箱]
category: Higress学习路线
draft: false
---

> [!NOTE]
> Wasm 插件是 Higress 的核心扩展能力。本文深入讲解 Proxy-Wasm 规范、沙箱机制、热更新原理、OCI 分发流程。

---

## 为什么选择 Wasm

### 传统扩展方式的问题

| 方式 | 问题 |
|:--|:--|
| 原生 C++ Filter | 开发门槛高、需重编译 Envoy、崩溃影响主进程 |
| Lua 脚本 | 性能差（~原生 50%）、无类型安全、生态有限 |
| 外部服务（gRPC/HTTP） | 网络开销大、延迟高、部署复杂 |

### Wasm 的优势

```
┌─────────────────────────────────────────────────┐
│                 Wasm 插件优势                     │
├──────────────┬──────────────────────────────────┤
│ 多语言       │ Go / Rust / AssemblyScript / C++ │
│ 沙箱隔离     │ 内存隔离，崩溃不影响 Envoy        │
│ 热更新       │ 不停机替换插件                    │
│ 高性能       │ ~原生 80-90%                      │
│ 标准化       │ Proxy-Wasm 规范，跨代理（Envoy/MOSN）│
│ 生态         │ OCI 镜像分发，插件市场             │
└──────────────┴──────────────────────────────────┘
```

---

## Proxy-Wasm 规范

### 什么是 Proxy-Wasm

**Proxy-Wasm** 是 Envoy 官方定义的 Wasm 扩展标准，规定了：
- 宿主（Envoy）与插件（Wasm）的 ABI 接口
- 插件生命周期钩子
- 宿主能力调用（读 Header、发 HTTP 请求、写日志等）

### 架构图

```
┌─────────────────────────────────────────────────┐
│  Envoy（宿主）                                   │
│  ┌───────────────────────────────────────────┐  │
│  │  Proxy-Wasm ABI（C++ 实现）                │  │
│  │  ┌─────────────────────────────────────┐  │  │
│  │  │  Wasm VM（V8 / Wasmtime / WAMR）    │  │  │
│  │  │  ┌───────────────────────────────┐  │  │  │
│  │  │  │  Wasm 插件（Go/Rust 编译）     │  │  │  │
│  │  │  │  - OnHttpRequestHeaders       │  │  │  │
│  │  │  │  - OnHttpRequestBody          │  │  │  │
│  │  │  │  - OnHttpResponseHeaders      │  │  │  │
│  │  │  │  - OnLog                      │  │  │  │
│  │  │  └───────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### ABI 接口分类

| 类别 | 函数示例 | 用途 |
|:--|:--|:--|
| 生命周期 | `proxy_on_context_create` | 插件初始化 |
| HTTP 处理 | `proxy_on_request_headers` | 处理请求头 |
| 宿主调用 | `proxy_get_header_map_value` | 读取 Header |
| 宿主调用 | `proxy_http_call` | 发起 HTTP 请求 |
| 宿主调用 | `proxy_log` | 写日志 |
| 内存管理 | `proxy_malloc` / `proxy_free` | 内存分配 |

---

## 沙箱隔离

### 内存隔离

```
Envoy 进程内存空间
┌─────────────────────────────────────────┐
│  Envoy 核心代码                          │
│  ─────────────────────────────────────  │
│  Wasm VM 内存（沙箱）                    │
│  ┌───────────────────────────────────┐  │
│  │  插件 A 内存（线性内存，受限）      │  │
│  │  - 堆：最大 256MB（可配置）        │  │
│  │  - 栈：独立                       │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │  插件 B 内存（独立沙箱）            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

关键特性：
1. 插件无法访问 Envoy 内存（只能读/写自己的线性内存）
2. 插件崩溃只影响自己的沙箱，Envoy 继续运行
3. 插件间内存隔离，互不影响
4. 宿主通过 ABI 接口受控地暴露能力
```

### 能力限制

```
Wasm 插件默认【不能】：
- 直接访问文件系统
- 直接发起网络请求（需通过 proxy_http_call）
- 直接访问系统调用
- 直接访问 Envoy 内部数据结构

Wasm 插件【可以】（通过 ABI）：
- 读/写 HTTP Header/Body
- 发起 HTTP/gRPC 请求（proxy_http_call）
- 读/写共享数据（proxy_get/set_shared_data）
- 写日志（proxy_log）
- 访问插件配置（proxy_get_plugin_configuration）
```

### 安全模型

```
插件代码（不可信）
   ↓ 编译为 Wasm
   ↓
Wasm VM 验证
   ├── 内存访问边界检查
   ├── 函数签名验证
   └── 无限循环检测（燃料机制）
   ↓
沙箱执行
   ↓ 通过 ABI 调用宿主能力
   ↓
Envoy 验证并执行
```

---

## 热更新机制

### 更新流程

```
1. 开发者推送新版本 Wasm 镜像到 OCI 仓库
   oras push registry.example.com/plugins/my-plugin:v2 plugin.wasm

2. 更新 WasmPlugin CRD 镜像版本
   kubectl patch wasmplugin my-plugin -p '{"spec":{"url":"oci://registry.example.com/plugins/my-plugin:v2"}}'

3. Higress Controller 监听到 CRD 变化

4. Controller 拉取新版本 Wasm 镜像

5. Controller 通过 xDS 推送新配置到 Gateway

6. Envoy 加载新版本 Wasm（新请求用新插件，旧请求继续用旧插件）

7. 旧版本插件在所有请求完成后卸载

整个过程【无需重启 Envoy】，实现真正的热更新。
```

### 版本回滚

```bash
# 查看历史版本
kubectl get wasmplugin my-plugin -o jsonpath='{.metadata.annotations}'

# 回滚到 v1
kubectl patch wasmplugin my-plugin -p '{"spec":{"url":"oci://registry.example.com/plugins/my-plugin:v1"}}'

# 秒级生效
```

### 灰度发布插件

```yaml
# 按路由灰度插件版本
apiVersion: extensions.higress.io/v1alpha1
kind: WasmPlugin
metadata:
  name: my-plugin
spec:
  url: oci://registry.example.com/plugins/my-plugin:v2
  # 只在特定路由启用新版本
  matchRules:
    - ingress: [default/canary-route]
      config:
        version: v2
  # 其他路由用旧版本
  defaultConfig:
    version: v1
```

---

## OCI 镜像分发

### 为什么用 OCI

```
传统分发方式：
- 文件下载：版本管理混乱、无签名验证
- ConfigMap：大小限制 1MB、不适合二进制
- 自定义协议：生态不兼容

OCI 镜像分发优势：
- 复用 Docker Registry 生态（Harbor/ACR/GHCR/Docker Hub）
- 版本管理（tag/digest）
- 签名验证（cosign/notary）
- 访问控制（RBAC/Token）
- 全球分发（Registry Mirror/CDN）
```

### 镜像结构

```
OCI Artifact（Wasm 插件镜像）
├── manifest.json
│   ├── mediaType: application/vnd.oci.image.manifest.v1+json
│   └── layers:
│       ├── mediaType: application/vnd.module.wasm.content.layer.v1+wasm
│       │   └── plugin.wasm（Wasm 二进制）
│       └── mediaType: application/vnd.oci.image.layer.v1.tar+gzip
│           └── README.md / config.json（可选）
└── config.json
    └── 插件元数据（名称、版本、描述）
```

### 推送插件到 OCI 仓库

```bash
# 1. 安装 oras
curl -LO https://github.com/oras-project/oras/releases/download/v1.0.0/oras_1.0.0_linux_amd64.tar.gz
tar xzf oras_1.0.0_linux_amd64.tar.gz
mv oras /usr/local/bin/

# 2. 登录 Registry
oras login registry.example.com -u admin -p password

# 3. 推送 Wasm 文件
oras push registry.example.com/plugins/my-plugin:v1 \
  --artifact-type application/vnd.module.wasm.content.layer.v1+wasm \
  plugin.wasm

# 4. 验证
oras manifest fetch registry.example.com/plugins/my-plugin:v1
```

### 私有仓库配置

```yaml
apiVersion: extensions.higress.io/v1alpha1
kind: WasmPlugin
metadata:
  name: my-plugin
spec:
  url: oci://registry.example.com/plugins/my-plugin:v1
  # 私有仓库认证
  imagePullSecret: registry-credentials
  # 或
  imagePullPolicy: IfNotPresent   # Always / IfNotPresent / Never
---
# 创建 Secret
apiVersion: v1
kind: Secret
metadata:
  name: registry-credentials
  namespace: higress-system
type: kubernetes.io/dockerconfigjson
data:
  .dockerconfigjson: <base64-encoded-docker-config>
```

---

## 插件生命周期

### 完整生命周期

```
┌─────────────────────────────────────────────────┐
│  插件加载阶段                                     │
│  1. Envoy 拉取 Wasm 镜像                         │
│  2. Wasm VM 验证并编译                           │
│  3. 调用 proxy_on_context_create（初始化）        │
│  4. 调用 proxy_on_configure（加载配置）           │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  请求处理阶段（每个请求）                          │
│  5. proxy_on_request_headers（请求头）            │
│  6. proxy_on_request_body（请求体，可选）          │
│  7. [转发到上游]                                 │
│  8. proxy_on_response_headers（响应头）           │
│  9. proxy_on_response_body（响应体，可选）         │
│  10. proxy_on_log（请求完成，记录日志）            │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  插件卸载阶段                                     │
│  11. proxy_on_context_destroy（清理资源）         │
│  12. Wasm VM 释放内存                            │
└─────────────────────────────────────────────────┘
```

### 钩子函数详解

| 钩子 | 触发时机 | 可执行操作 | 返回值 |
|:--|:--|:--|:--|
| OnHttpRequestHeaders | 收到请求头 | 读/写 Header、认证、限流、路由改写 | Continue / Pause / Stop |
| OnHttpRequestBody | 收到请求体 | 读/写 Body、内容审核、数据校验 | Continue / Pause / Stop |
| OnHttpResponseHeaders | 收到响应头 | 读/写 Header、添加 Header、日志 | Continue / Pause |
| OnHttpResponseBody | 收到响应体 | 读/写 Body、响应改写、脱敏 | Continue / Pause |
| OnLog | 请求完成 | 记录日志、Metrics、审计 | - |

### 返回值含义

```go
// Continue：继续处理，进入下一个 Filter
return types.ActionContinue

// Pause：暂停处理，等待异步操作完成
// 常用于 proxy_http_call（发起 HTTP 请求）
return types.ActionPause

// Stop：停止处理，直接返回响应
// 常用于认证失败、限流触发
proxywasm.SendHttpResponse(403, nil, []byte("Forbidden"), -1)
return types.ActionStop
```

---

## WasmPlugin CRD 详解

### 完整配置示例

```yaml
apiVersion: extensions.higress.io/v1alpha1
kind: WasmPlugin
metadata:
  name: jwt-auth
  namespace: higress-system
spec:
  # 插件镜像
  url: oci://registry.example.com/plugins/jwt-auth:v1
  
  # 镜像拉取策略
  imagePullPolicy: IfNotPresent
  imagePullSecret: registry-credentials
  
  # 插件阶段（执行顺序）
  phase: AUTHN          # AUTHN / AUTHZ / STATS / UNSPECIFIED_PHASE
  
  # 优先级（同 phase 内，数字越大越先执行）
  priority: 1000
  
  # 默认配置（全局生效）
  defaultConfig:
    issuer: "https://auth.example.com"
    jwks_uri: "https://auth.example.com/.well-known/jwks.json"
  
  # 匹配规则（特定路由/域名/服务生效）
  matchRules:
    # 路由级配置
    - ingress: [default/api-route]
      config:
        issuer: "https://api-auth.example.com"
    
    # 域名级配置
    - domain: [admin.example.com]
      config:
        issuer: "https://admin-auth.example.com"
    
    # 服务级配置
    - service: [payment-service.default.svc.cluster.local]
      config:
        strict: true
  
  # 插件失败策略
  failStrategy: FAIL_OPEN   # FAIL_OPEN（继续）/ FAIL_CLOSE（拒绝）
```

### 配置优先级

```
路由级 > 域名级 > 服务级 > 全局级（defaultConfig）

示例：
- defaultConfig: issuer = "https://auth.example.com"
- domain[admin.example.com]: issuer = "https://admin-auth.example.com"
- ingress[default/api-route]: issuer = "https://api-auth.example.com"

最终生效：
- api-route → "https://api-auth.example.com"（路由级）
- admin.example.com 其他路径 → "https://admin-auth.example.com"（域名级）
- 其他所有 → "https://auth.example.com"（全局级）
```

### 插件阶段（Phase）

```
请求处理顺序：
1. AUTHN（认证）→ JWT / OAuth2 / API Key
2. AUTHZ（鉴权）→ RBAC / ABAC
3. UNSPECIFIED_PHASE（自定义）→ 业务插件
4. STATS（统计）→ Metrics / Logging

同 Phase 内按 priority 降序执行（数字大的先执行）
```

---

## 复习卡片

> [!TIP]
> **快速复习清单**
>
> 1. **Wasm 优势**：多语言、沙箱隔离、热更新、高性能（~原生 80-90%）、标准化
> 2. **Proxy-Wasm**：Envoy 官方 Wasm 扩展标准，定义 ABI 接口和生命周期钩子
> 3. **沙箱隔离**：内存隔离、能力受限（通过 ABI 调用宿主）、崩溃不影响 Envoy
> 4. **热更新**：更新 WasmPlugin CRD → Controller 拉取新镜像 → xDS 推送 → Envoy 加载（无需重启）
> 5. **OCI 分发**：复用 Docker Registry 生态，oras push/pull，版本管理 + 签名验证
> 6. **生命周期**：加载 → 请求处理（Headers/Body/Log）→ 卸载
> 7. **钩子返回值**：Continue（继续）/ Pause（暂停，等待异步）/ Stop（停止，直接响应）
> 8. **WasmPlugin CRD**：url、phase、priority、defaultConfig、matchRules（路由/域名/服务级）
> 9. **配置优先级**：路由级 > 域名级 > 服务级 > 全局级

---

> [!TIP]
> 下一篇：[Go 开发 Wasm 插件](/blog/posts/higress-roadmap-09-wasm-go/) 将实战讲解 wasm-go SDK、钩子函数实现、编译调试、插件发布完整流程。
>
> 返回 [Higress 学习路线总览](/blog/posts/higress-roadmap-00-overview/) | [合集页](/blog/higress-roadmap/)
