---
title: 'Higress 可观测性'
published: 2026-09-17T13:30:00+08:00
description: '详解 Higress 可观测性：访问日志、Metrics 指标、Tracing 链路追踪、Prometheus/Grafana/SkyWalking 集成。'
tags: [Higress, 可观测性, Prometheus, Grafana, Tracing, 日志]
category: Higress学习路线
draft: false
---

> [!NOTE]
> 可观测性是生产运维的基础。Higress 内置 Metrics/Tracing/Logging，无缝对接 Prometheus/Grafana/SkyWalking 等生态。

---

## 可观测性三大支柱

```
┌─────────────────────────────────────────────────┐
│                可观测性                           │
├──────────────┬──────────────┬──────────────────┤
│   Metrics    │   Tracing    │    Logging       │
│   （指标）    │   （链路）    │    （日志）       │
├──────────────┼──────────────┼──────────────────┤
│ QPS          │ 请求链路      │ 访问日志         │
│ 延迟         │ 耗时分布      │ 错误日志         │
│ 错误率       │ 依赖关系      │ 审计日志         │
│ 饱和度       │ 瓶颈定位      │ 调试信息         │
└──────────────┴──────────────┴──────────────────┘
         ↓              ↓              ↓
    Prometheus     Jaeger/Zipkin    ELK/Loki
    Grafana        SkyWalking       Fluentd
```

---

## Metrics 指标

### 内置指标

Higress（Envoy）默认暴露以下指标：

| 指标名 | 类型 | 说明 |
|:--|:--|:--|
| `envoy_http_downstream_rq_total` | Counter | 总请求数 |
| `envoy_http_downstream_rq_2xx` | Counter | 2xx 响应数 |
| `envoy_http_downstream_rq_4xx` | Counter | 4xx 响应数 |
| `envoy_http_downstream_rq_5xx` | Counter | 5xx 响应数 |
| `envoy_http_downstream_rq_time` | Histogram | 请求耗时 |
| `envoy_cluster_upstream_rq_total` | Counter | 上游请求数 |
| `envoy_cluster_upstream_cx_active` | Gauge | 活跃连接数 |
| `envoy_server_memory_allocated` | Gauge | 内存使用 |
| `envoy_server_cpu_usage` | Gauge | CPU 使用率 |

### 启用 Prometheus

```yaml
# Helm values.yaml
higress-core:
  gateway:
    metrics:
      enabled: true
      port: 15020          # Metrics 端口
      path: /stats/prometheus

# 或手动配置
apiVersion: v1
kind: ConfigMap
metadata:
  name: higress-config
  namespace: higress-system
data:
  higress: |
    o11y:
      metrics:
        enabled: true
        port: 15020
```

### Prometheus 抓取配置

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'higress-gateway'
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names: ['higress-system']
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        regex: higress-gateway
        action: keep
      - source_labels: [__meta_kubernetes_pod_container_port_number]
        regex: "15020"
        action: keep
```

### 关键 PromQL

```promql
# QPS（每秒请求数）
rate(envoy_http_downstream_rq_total{pod=~"higress-gateway.*"}[1m])

# P99 延迟
histogram_quantile(0.99, 
  rate(envoy_http_downstream_rq_time_bucket{pod=~"higress-gateway.*"}[5m])
)

# 错误率
sum(rate(envoy_http_downstream_rq_5xx[5m])) 
/ 
sum(rate(envoy_http_downstream_rq_total[5m]))

# 上游健康度
envoy_cluster_upstream_cx_active{cluster_name=~".*"}
```

---

## Grafana 监控面板

### 官方 Dashboard

Higress 提供预置 Grafana Dashboard：

```bash
# 导入 Dashboard JSON
# 下载地址：https://github.com/alibaba/higress/tree/main/grafana
# 或 Grafana Labs 搜索 "Higress"
```

### 关键面板

| 面板 | 指标 | 用途 |
|:--|:--|:--|
| 总览 | QPS、延迟、错误率 | 全局健康度 |
| 路由分析 | 按路由分组的 QPS/延迟 | 定位慢接口 |
| 上游服务 | 上游延迟、错误、连接数 | 依赖健康度 |
| 资源使用 | CPU、内存、连接数 | 容量规划 |
| 插件监控 | 插件执行耗时、错误 | 插件性能 |

### 告警规则

```yaml
# Prometheus AlertManager 规则
groups:
  - name: higress-alerts
    rules:
      # 高错误率告警
      - alert: HigressHighErrorRate
        expr: |
          sum(rate(envoy_http_downstream_rq_5xx[5m])) 
          / 
          sum(rate(envoy_http_downstream_rq_total[5m])) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Higress 错误率超过 5%"
      
      # 高延迟告警
      - alert: HigressHighLatency
        expr: |
          histogram_quantile(0.99, 
            rate(envoy_http_downstream_rq_time_bucket[5m])
          ) > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Higress P99 延迟超过 1s"
      
      # 上游服务不可用
      - alert: HigressUpstreamDown
        expr: envoy_cluster_upstream_cx_active == 0
        for: 1m
        labels:
          severity: critical
```

---

## Tracing 链路追踪

### 支持的后端

| 后端 | 协议 | 配置方式 |
|:--|:--|:--|
| Jaeger | Zipkin / OTLP | ConfigMap |
| Zipkin | Zipkin | ConfigMap |
| SkyWalking | SkyWalking | ConfigMap |
| OpenTelemetry | OTLP | ConfigMap |

### 启用 Tracing（Jaeger）

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: higress-config
  namespace: higress-system
data:
  higress: |
    o11y:
      tracing:
        enabled: true
        # Jaeger 配置
        provider: jaeger
        jaeger:
          collector: jaeger-collector.jaeger.svc.cluster.local:9411
          # 采样率（0.0-1.0）
          sampling:
            type: probabilistic
            value: 0.1        # 10% 采样
```

### 启用 Tracing（SkyWalking）

```yaml
data:
  higress: |
    o11y:
      tracing:
        enabled: true
        provider: skywalking
        skywalking:
          service: oap.skywalking.svc.cluster.local:11800
          sampling:
            type: rate
            value: 100        # 每秒 100 个请求
```

### Trace 传播

```yaml
# Higress 自动传播 Trace Header
# 支持的 Header：
# - X-Request-Id（Envoy 原生）
# - X-B3-TraceId / X-B3-SpanId（Zipkin）
# - traceparent / tracestate（W3C Trace Context）
# - sw8（SkyWalking）

# 上游服务需要：
# 1. 读取这些 Header
# 2. 创建子 Span
# 3. 继续传播到下游
```

### 查看 Trace

```bash
# Jaeger UI
kubectl port-forward svc/jaeger-query 16686:16686 -n jaeger
open http://localhost:16686

# SkyWalking UI
kubectl port-forward svc/skywalking-ui 8080:8080 -n skywalking
open http://localhost:8080
```

---

## 访问日志

### 日志格式

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: higress-config
  namespace: higress-system
data:
  higress: |
    accessLog:
      enabled: true
      # JSON 格式（推荐，便于 ELK 解析）
      format: json
      # 自定义字段
      template: |
        {
          "timestamp": "%START_TIME%",
          "method": "%REQ(:METHOD)%",
          "path": "%REQ(X-ENVOY-ORIGINAL-PATH?:PATH)%",
          "protocol": "%PROTOCOL%",
          "response_code": "%RESPONSE_CODE%",
          "response_flags": "%RESPONSE_FLAGS%",
          "bytes_received": "%BYTES_RECEIVED%",
          "bytes_sent": "%BYTES_SENT%",
          "duration": "%DURATION%",
          "upstream_service_time": "%RESP(X-ENVOY-UPSTREAM-SERVICE-TIME)%",
          "x_forwarded_for": "%REQ(X-FORWARDED-FOR)%",
          "user_agent": "%REQ(USER-AGENT)%",
          "request_id": "%REQ(X-REQUEST-ID)%",
          "authority": "%REQ(:AUTHORITY)%",
          "upstream_host": "%UPSTREAM_HOST%",
          "upstream_cluster": "%UPSTREAM_CLUSTER%",
          "route_name": "%ROUTE_NAME%"
        }
```

### 日志字段说明

| 字段 | 说明 | 示例 |
|:--|:--|:--|
| `%START_TIME%` | 请求开始时间 | `2026-09-17T10:30:00.000Z` |
| `%REQ(:METHOD)%` | HTTP 方法 | `GET` |
| `%REQ(X-ENVOY-ORIGINAL-PATH?:PATH)%` | 原始路径 | `/api/users` |
| `%RESPONSE_CODE%` | 响应状态码 | `200` |
| `%RESPONSE_FLAGS%` | 响应标志 | `-`（正常）/ `UH`（上游不健康） |
| `%DURATION%` | 总耗时（ms） | `150` |
| `%RESP(X-ENVOY-UPSTREAM-SERVICE-TIME)%` | 上游耗时 | `120` |
| `%UPSTREAM_HOST%` | 上游实例 | `10.0.0.5:8080` |
| `%UPSTREAM_CLUSTER%` | 上游集群 | `outbound|8080||api-service.default.svc` |
| `%ROUTE_NAME%` | 路由名称 | `api-route.default` |

### 响应标志（RESPONSE_FLAGS）

| 标志 | 说明 |
|:--|:--|
| `-` | 正常 |
| `UH` | 上游无健康实例 |
| `UF` | 上游连接失败 |
| `UO` | 上游过载（熔断） |
| `NR` | 无路由匹配 |
| `URX` | 上游重试耗尽 |
| `RL` | 限流触发 |
| `DC` | 客户端断开 |
| `UT` | 上游超时 |

### 日志输出位置

```bash
# 标准输出（kubectl logs）
kubectl logs -n higress-system deploy/higress-gateway -f

# 文件（需配置 volume）
/var/log/higress/access.log

# 远程（Fluentd/Filebeat 收集）
# 配置 sidecar 或 DaemonSet 收集
```

---

## 集成 ELK/Loki

### Fluentd 收集

```yaml
# fluentd-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
data:
  higress.conf: |
    <source>
      @type tail
      path /var/log/containers/higress-gateway*.log
      pos_file /var/log/fluentd-higress.log.pos
      tag higress.access
      format json
      time_format %Y-%m-%dT%H:%M:%S.%NZ
    </source>
    
    <filter higress.access>
      @type record_transformer
      <record>
        service higress
        component gateway
      </record>
    </filter>
    
    <match higress.access>
      @type elasticsearch
      host elasticsearch.elastic.svc.cluster.local
      port 9200
      logstash_format true
      logstash_prefix higress-access
    </match>
```

### Loki 收集

```yaml
# promtail-config.yaml
scrape_configs:
  - job_name: higress
    kubernetes_sd_configs:
      - role: pod
        namespaces:
          names: ['higress-system']
    relabel_configs:
      - source_labels: [__meta_kubernetes_pod_label_app]
        regex: higress-gateway
        action: keep
      - source_labels: [__meta_kubernetes_pod_name]
        target_label: pod
    pipeline_stages:
      - json:
          expressions:
            method: method
            path: path
            status: response_code
            duration: duration
      - labels:
          method:
          status:
```

---

## 实战：完整可观测性方案

### 架构

```
Higress Gateway
   ├── Metrics → Prometheus → Grafana（监控面板）
   ├── Tracing → Jaeger/SkyWalking（链路追踪）
   └── Logging → Fluentd → Elasticsearch → Kibana（日志分析）
```

### Helm Values 完整配置

```yaml
higress-core:
  gateway:
    metrics:
      enabled: true
      port: 15020
    
    accessLog:
      enabled: true
      format: json

global:
  o11y:
    enabled: true
    grafana:
      enabled: true
      # 自动导入 Higress Dashboard
      dashboards:
        higress: true
    prometheus:
      enabled: true
      # 自动配置 scrape
      scrapeHigress: true
    tracing:
      enabled: true
      provider: jaeger
      jaeger:
        collector: jaeger-collector.jaeger.svc.cluster.local:9411
        sampling:
          type: probabilistic
          value: 0.1
```

### 验证可观测性

```bash
# 1. Metrics
kubectl exec -n higress-system deploy/higress-gateway -- \
  curl -s localhost:15020/stats/prometheus | grep envoy_http

# 2. Tracing（发送测试请求后查看 Jaeger UI）
curl http://api.example.com/api/test
open http://localhost:16686

# 3. Logging
kubectl logs -n higress-system deploy/higress-gateway --tail=10 | jq

# 4. Grafana Dashboard
kubectl port-forward svc/grafana 3000:3000 -n monitoring
open http://localhost:3000
```

---

## 常见问题

### Q1: Prometheus 抓取不到指标

```bash
# 1. 确认 Metrics 端口
kubectl get svc higress-gateway -n higress-system -o yaml | grep 15020

# 2. 手动测试
kubectl exec -n higress-system deploy/higress-gateway -- \
  curl -s localhost:15020/stats/prometheus

# 3. 检查 Prometheus targets
open http://prometheus:9090/targets
```

### Q2: Tracing 链路断裂

```bash
# 1. 确认上游服务传播 Trace Header
# 检查上游服务是否读取并传播：
# - X-Request-Id
# - X-B3-TraceId / X-B3-SpanId
# - traceparent / tracestate

# 2. 确认采样率
# 采样率太低可能导致链路不完整

# 3. 检查时钟同步
# 各节点时钟偏差会导致 Span 顺序错乱
```

### Q3: 日志量太大

```yaml
# 1. 降低采样率（只记录错误和慢请求）
accessLog:
  enabled: true
  # 只记录 5xx 和 >1s 的请求
  filter:
    statusCode: ">=500"
    duration: ">=1000"

# 2. 精简字段
template: |
  {
    "timestamp": "%START_TIME%",
    "method": "%REQ(:METHOD)%",
    "path": "%REQ(X-ENVOY-ORIGINAL-PATH?:PATH)%",
    "response_code": "%RESPONSE_CODE%",
    "duration": "%DURATION%"
  }

# 3. 日志轮转
# 配置 logrotate 或 Fluentd buffer
```

---

## 复习卡片

> [!TIP]
> **快速复习清单**
>
> 1. **三大支柱**：Metrics（Prometheus）、Tracing（Jaeger/SkyWalking）、Logging（ELK/Loki）
> 2. **关键指标**：QPS、P99 延迟、错误率、上游连接数、资源使用
> 3. **PromQL**：`rate()` 计算 QPS，`histogram_quantile()` 计算分位数
> 4. **Tracing 传播**：X-Request-Id / X-B3-* / traceparent / sw8
> 5. **日志格式**：JSON（推荐），关键字段：duration、upstream_service_time、response_flags
> 6. **响应标志**：UH（上游不健康）、UF（连接失败）、RL（限流）、UT（超时）
> 7. **Grafana Dashboard**：总览、路由分析、上游服务、资源使用
> 8. **告警规则**：错误率 > 5%、P99 > 1s、上游不可用

---

> [!TIP]
> 下一篇：[Wasm 插件基础](/blog/posts/higress-roadmap-08-wasm-basics/) 将讲解 Proxy-Wasm 规范、沙箱隔离、热更新、OCI 镜像分发等 Wasm 插件核心机制。
>
> 返回 [Higress 学习路线总览](/blog/posts/higress-roadmap-00-overview/) | [合集页](/blog/higress-roadmap/)
