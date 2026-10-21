---
title: '网关选型对比：Higress vs APISIX vs Kong vs SCG vs Nginx'
published: 2026-09-17T16:30:00+08:00
description: '横向对比主流 API 网关：Higress、APISIX、Kong、Spring Cloud Gateway、Nginx，从架构、性能、功能、生态、运维等维度帮助你做技术选型。'
tags: [Higress, APISIX, Kong, 网关选型, 对比, Spring Cloud Gateway]
category: Higress学习路线
draft: false
---

> [!NOTE]
> 网关选型是架构决策的关键一环。本文从 8 个维度横向对比 5 款主流网关，帮助你根据实际场景做出选择。

---

## 对比概览

| 维度 | Higress | APISIX | Kong | Spring Cloud Gateway | Nginx |
|:--|:--|:--|:--|:--|:--|
| **内核** | Envoy (C++) | Nginx + LuaJIT | Nginx + LuaJIT | Java (Netty) | Nginx (C) |
| **开源方** | 阿里云 | Apache 基金会 | Kong Inc. | Spring 官方 | F5 |
| **首次发布** | 2022 | 2019 | 2015 | 2018 | 2004 |
| **License** | Apache 2.0 | Apache 2.0 | Apache 2.0（OSS）/ 商业 | Apache 2.0 | BSD-like |
| **云原生** | ✅ K8s 原生 | ✅ K8s Ingress | ✅ K8s Ingress | ⚠️ 需适配 | ❌ 传统 |
| **动态配置** | ✅ xDS（秒级） | ✅ etcd（秒级） | ✅ DB-less / PostgreSQL | ⚠️ 需重启 | ⚠️ reload |
| **扩展语言** | Wasm (Go/Rust) | Lua | Lua / Go / JS | Java | C / Lua |
| **性能** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 架构对比

### Higress

```
┌─────────────────────────────────────┐
│  Higress Controller（控制面）        │
│  - 监听 K8s CRD                     │
│  - 转换为 Envoy xDS 配置            │
│  - 基于 Istio Pilot                 │
└──────────────┬──────────────────────┘
               │ xDS（gRPC）
               ▼
┌─────────────────────────────────────┐
│  Higress Gateway（数据面）           │
│  - Envoy Proxy                      │
│  - Wasm 插件沙箱                    │
│  - 动态配置热加载                   │
└─────────────────────────────────────┘

特点：
- 控制面/数据面分离
- 基于 Envoy（C++，高性能）
- Wasm 扩展（多语言，沙箱隔离）
- K8s 原生（CRD 配置）
```

### APISIX

```
┌─────────────────────────────────────┐
│  APISIX Dashboard（可选）            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  etcd（配置中心）                    │
│  - 存储路由、服务、插件配置          │
│  - Watch 机制实时推送               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  APISIX（数据面）                    │
│  - Nginx + LuaJIT                   │
│  - 插件热加载                       │
│  - 多协议代理（HTTP/TCP/UDP/MQTT）  │
└─────────────────────────────────────┘

特点：
- 依赖 etcd（配置存储 + 服务发现）
- Nginx + LuaJIT（性能极高）
- 插件热加载（无需重启）
- 多协议支持（HTTP/gRPC/TCP/UDP/MQTT）
```

### Kong

```
┌─────────────────────────────────────┐
│  Kong Manager（企业版）              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  数据库（PostgreSQL / Cassandra）    │
│  或 DB-less 模式（YAML 配置）        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Kong Gateway（数据面）              │
│  - Nginx + LuaJIT                   │
│  - 插件系统（Lua/Go/JS）            │
│  - 多协议支持                       │
└─────────────────────────────────────┘

特点：
- 传统数据库依赖（PostgreSQL/Cassandra）
- DB-less 模式（声明式配置）
- 插件生态丰富（官方 + 社区）
- 企业版功能强大（RBAC/审计/开发者门户）
```

### Spring Cloud Gateway

```
┌─────────────────────────────────────┐
│  Spring Cloud Config / Nacos        │
│  （配置中心）                        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Spring Cloud Gateway（Java）        │
│  - 基于 Netty（异步非阻塞）          │
│  - Spring WebFlux（响应式）          │
│  - Filter 链（Java 扩展）            │
│  - 集成 Spring 生态                  │
└─────────────────────────────────────┘

特点：
- Java 生态（Spring Boot/Cloud）
- 基于 Netty（异步非阻塞）
- Filter 扩展（Java 代码）
- 与 Spring 生态无缝集成（Eureka/Hystrix/Sleuth）
```

### Nginx

```
┌─────────────────────────────────────┐
│  nginx.conf（静态配置）              │
└──────────────┬──────────────────────┘
               │ reload（SIGHUP）
               ▼
┌─────────────────────────────────────┐
│  Nginx（C）                          │
│  - Master-Worker 进程模型            │
│  - 事件驱动（epoll/kqueue）          │
│  - 模块扩展（C/Lua）                 │
│  - 反向代理 / 负载均衡 / 静态服务    │
└─────────────────────────────────────┘

特点：
- 静态配置（reload 生效）
- C 语言（极致性能）
- 模块扩展（需重编译或 Lua）
- 功能简单（需第三方模块补充）
```

---

## 功能对比

### 路由能力

| 功能 | Higress | APISIX | Kong | SCG | Nginx |
|:--|:--|:--|:--|:--|:--|
| 域名路由 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 路径路由 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Header 路由 | ✅ | ✅ | ✅ | ✅ | ⚠️ 需 Lua |
| Query 路由 | ✅ | ✅ | ✅ | ✅ | ⚠️ 需 Lua |
| 权重路由 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 正则路由 | ✅ | ✅ | ✅ | ✅ | ✅ |
| gRPC 代理 | ✅ | ✅ | ✅ | ✅ | ✅ |
| WebSocket | ✅ | ✅ | ✅ | ✅ | ✅ |
| TCP/UDP 代理 | ✅ | ✅ | ✅ | ❌ | ✅ |

### 流量治理

| 功能 | Higress | APISIX | Kong | SCG | Nginx |
|:--|:--|:--|:--|:--|:--|
| 限流 | ✅ | ✅ | ✅ | ✅ | ⚠️ 需模块 |
| 熔断 | ✅ | ✅ | ✅ | ✅ | ❌ |
| 重试 | ✅ | ✅ | ✅ | ✅ | ⚠️ 有限 |
| 超时 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 灰度发布 | ✅ | ✅ | ✅ | ✅ | ⚠️ 需配置 |
| 蓝绿部署 | ✅ | ✅ | ✅ | ✅ | ⚠️ 需配置 |
| 流量镜像 | ✅ | ✅ | ✅ | ❌ | ⚠️ 需模块 |

### 安全认证

| 功能 | Higress | APISIX | Kong | SCG | Nginx |
|:--|:--|:--|:--|:--|:--|
| JWT | ✅ | ✅ | ✅ | ✅ | ⚠️ 需模块 |
| OAuth2 | ✅ | ✅ | ✅ | ✅ | ⚠️ 需模块 |
| API Key | ✅ | ✅ | ✅ | ✅ | ⚠️ 需配置 |
| CORS | ✅ | ✅ | ✅ | ✅ | ⚠️ 需配置 |
| WAF | ✅ | ✅ | ✅ | ⚠️ 需集成 | ⚠️ 需 ModSecurity |
| mTLS | ✅ | ✅ | ✅ | ✅ | ✅ |
| IP 黑白名单 | ✅ | ✅ | ✅ | ✅ | ✅ |

### 可观测性

| 功能 | Higress | APISIX | Kong | SCG | Nginx |
|:--|:--|:--|:--|:--|:--|
| Metrics | ✅ Prometheus | ✅ Prometheus | ✅ Prometheus | ✅ Micrometer | ⚠️ 需模块 |
| Tracing | ✅ Jaeger/SkyWalking | ✅ Jaeger/Zipkin | ✅ Jaeger/Zipkin | ✅ Sleuth | ⚠️ 需模块 |
| 访问日志 | ✅ JSON | ✅ JSON | ✅ JSON | ✅ Logback | ✅ 文本 |
| 健康检查 | ✅ | ✅ | ✅ | ✅ | ✅ |

### 扩展能力

| 功能 | Higress | APISIX | Kong | SCG | Nginx |
|:--|:--|:--|:--|:--|:---|
| 扩展语言 | **Wasm (Go/Rust/AssemblyScript)** | Lua | Lua / Go / JS | Java | C / Lua |
| 热更新 | ✅ 不停机 | ✅ 不停机 | ✅ 不停机 | ❌ 需重启 | ⚠️ reload |
| 沙箱隔离 | ✅ 强隔离 | ⚠️ 弱隔离 | ⚠️ 弱隔离 | ❌ 无隔离 | ❌ 无隔离 |
| 插件市场 | ✅ | ✅ | ✅ | ❌ | ❌ |
| 自定义插件难度 | ⭐⭐⭐（Go 友好） | ⭐⭐（Lua 简单） | ⭐⭐（Lua 简单） | ⭐（Java 最易） | ⭐⭐⭐⭐（C 难） |

---

## 性能对比

### 基准测试（QPS，简单路由）

| 网关 | QPS | P99 延迟 | 内存占用 | CPU 占用 |
|:--|:--|:--|:--|:--|
| Nginx | ~120,000 | ~2ms | ~50MB | ~30% |
| APISIX | ~110,000 | ~3ms | ~100MB | ~40% |
| Higress | ~100,000 | ~3ms | ~150MB | ~45% |
| Kong | ~80,000 | ~5ms | ~200MB | ~50% |
| SCG | ~30,000 | ~15ms | ~500MB | ~60% |

> 测试环境：4C8G，1000 并发，简单路由（无插件）
> 实际性能取决于配置复杂度、插件数量、上游延迟

### 性能分析

```
Nginx/APISIX/Higress：
- C/C++ 内核，事件驱动，零拷贝
- 单进程可处理数万连接
- 内存占用低

Kong：
- Nginx + LuaJIT，性能接近原生
- Lua 插件有额外开销
- 数据库依赖（DB-less 模式更快）

SCG：
- Java（Netty），JVM 开销
- 异步非阻塞，但 GC 影响延迟
- 内存占用高（JVM 堆）
```

---

## 生态对比

### 社区活跃度

| 项目 | GitHub Stars | Contributors | 社区规模 | 商业支持 |
|:--|:--|:--|:--|:--|
| Higress | ~5k | ~100 | 增长中 | 阿里云 |
| APISIX | ~15k | ~500 | 活跃 | API7.ai |
| Kong | ~40k | ~300 | 成熟 | Kong Inc. |
| SCG | Spring 生态 | - | 庞大 | VMware |
| Nginx | - | - | 最成熟 | F5 |

### 插件生态

| 项目 | 官方插件 | 社区插件 | 插件语言 |
|:--|:--|:--|:--|
| Higress | ~30 | 增长中 | Wasm (Go/Rust) |
| APISIX | ~80 | ~20 | Lua |
| Kong | ~50（OSS）/ ~100（企业） | ~30 | Lua / Go / JS |
| SCG | Spring 生态 | - | Java |
| Nginx | 核心模块 | 第三方模块 | C / Lua |

---

## 运维对比

### 部署复杂度

| 项目 | 最小部署 | 生产部署 | 依赖组件 |
|:--|:--|:--|:--|
| Higress | K8s + Helm | K8s 集群 | K8s |
| APISIX | Docker / K8s | K8s + etcd | etcd |
| Kong | Docker / K8s | K8s + PostgreSQL | PostgreSQL（或 DB-less） |
| SCG | Spring Boot App | K8s / VM | JVM |
| Nginx | 二进制 / Docker | LB + 多实例 | 无 |

### 配置管理

| 项目 | 配置方式 | 动态生效 | 配置存储 |
|:--|:--|:--|:--|
| Higress | K8s CRD | ✅ 秒级 | etcd（K8s） |
| APISIX | Admin API / YAML | ✅ 秒级 | etcd |
| Kong | Admin API / YAML | ✅ 秒级 | PostgreSQL / 内存 |
| SCG | YAML / Java Config | ❌ 需重启 | 文件 / 配置中心 |
| Nginx | nginx.conf | ⚠️ reload | 文件 |

### 学习曲线

| 项目 | 入门难度 | 精通难度 | 适合人群 |
|:--|:--|:--|:--|
| Higress | ⭐⭐⭐ | ⭐⭐⭐⭐ | K8s 用户、Go 开发者 |
| APISIX | ⭐⭐ | ⭐⭐⭐ | 运维、后端开发 |
| Kong | ⭐⭐ | ⭐⭐⭐ | 运维、后端开发 |
| SCG | ⭐（Java 开发者） | ⭐⭐⭐ | Spring 生态用户 |
| Nginx | ⭐⭐ | ⭐⭐⭐⭐⭐ | 运维、网络工程师 |

---

## 选型建议

### 按场景选择

| 场景 | 推荐网关 | 理由 |
|:--|:--|:--|
| **K8s 云原生** | Higress / APISIX | K8s 原生，CRD 配置，动态生效 |
| **Spring Cloud 生态** | Spring Cloud Gateway | 与 Spring 生态无缝集成 |
| **多协议代理** | APISIX | HTTP/gRPC/TCP/UDP/MQTT 全支持 |
| **企业级功能** | Kong（企业版） | RBAC/审计/开发者门户/商业支持 |
| **极致性能** | Nginx / APISIX | C/LuaJIT 内核，性能最高 |
| **Wasm 插件开发** | Higress | 多语言（Go/Rust），沙箱隔离 |
| **AI 网关** | Higress | Token 限流、Prompt 改写、多模型路由 |
| **传统架构** | Nginx | 简单、稳定、成熟 |
| **快速上手** | APISIX / Kong | 文档丰富，社区活跃 |

### 按团队技术栈

| 团队技术栈 | 推荐网关 |
|:--|:--|
| Java / Spring | Spring Cloud Gateway |
| Go | Higress（Wasm 插件用 Go） |
| Lua | APISIX / Kong |
| Rust | Higress（Wasm 插件用 Rust） |
| 运维为主 | Nginx / APISIX |
| K8s 原生 | Higress / APISIX |

### 迁移路径

```
Nginx → APISIX / Higress
- 配置相似（Nginx 语法）
- 插件扩展（Lua → Wasm）
- 动态配置（reload → 热更新）

Spring Cloud Gateway → Higress
- 路由配置迁移（YAML → CRD）
- Filter 迁移（Java → Wasm）
- 服务发现迁移（Eureka → K8s/Nacos）

Kong → Higress
- 插件迁移（Lua → Wasm）
- 配置迁移（Admin API → CRD）
- 数据库移除（PostgreSQL → etcd）
```

---

## 复习卡片

> [!TIP]
> **快速复习清单**
>
> 1. **内核对比**：Higress（Envoy C++）、APISIX/Kong（Nginx + LuaJIT）、SCG（Java Netty）、Nginx（C）
> 2. **性能排序**：Nginx ≈ APISIX ≈ Higress > Kong > SCG
> 3. **扩展方式**：Higress（Wasm 多语言）、APISIX/Kong（Lua）、SCG（Java）、Nginx（C/Lua）
> 4. **云原生**：Higress/APISIX（K8s 原生）、Kong（K8s Ingress）、SCG（需适配）、Nginx（传统）
> 5. **动态配置**：Higress/APISIX/Kong（秒级热更新）、SCG（需重启）、Nginx（reload）
> 6. **选型关键**：技术栈（Java/Go/Lua）、场景（K8s/AI/多协议）、团队能力、生态需求
> 7. **AI 网关**：Higress 领先（Token 限流、Prompt 改写、多模型路由）
> 8. **企业级**：Kong 企业版功能最全（RBAC/审计/开发者门户）

---

> [!TIP]
> 下一篇：[生产最佳实践](/blog/posts/higress-roadmap-14-best-practices/) 将讲解高可用部署、性能调优、安全加固、CI/CD、多集群管理等生产级实践。
>
> 返回 [Higress 学习路线总览](/blog/posts/higress-roadmap-00-overview/) | [合集页](/blog/higress-roadmap/)
