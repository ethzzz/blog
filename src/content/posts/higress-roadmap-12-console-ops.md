---
title: 'Higress Console 与运维'
published: 2026-09-17T16:00:00+08:00
description: '详解 Higress Console 使用、配置管理、版本升级、监控告警、故障排查、日常运维操作。'
tags: [Higress, Console, 运维, 升级, 监控, 故障排查]
category: Higress学习路线
draft: false
---

> [!NOTE]
> Higress Console 是官方提供的 Web 管理界面，覆盖路由、服务、插件、监控等全功能配置。本文讲解 Console 使用和日常运维操作。

---

## Higress Console 概览

### 访问方式

```bash
# K8s 部署：port-forward
kubectl port-forward svc/higress-console 8001:8001 -n higress-system
open http://localhost:8001

# 生产环境：通过 Ingress 暴露
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: higress-console
  namespace: higress-system
spec:
  ingressClassName: higress
  rules:
    - host: console.higress.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: higress-console
                port:
                  number: 8001

# 默认账号：admin / admin（首次登录强制修改）
```

### 功能模块

| 模块 | 功能 | 对应 CRD |
|:--|:--|:--|
| 概览 | 网关状态、QPS、延迟、错误率 | - |
| 路由管理 | 域名、路径、Header 路由规则 | Ingress / HTTPRoute |
| 服务来源 | 服务发现配置 | McpBridge |
| 插件市场 | Wasm 插件浏览、安装、配置 | WasmPlugin |
| 策略配置 | 限流、熔断、重试、超时、CORS | Ingress Annotations |
| 监控告警 | Prometheus/Grafana 集成 | ConfigMap |
| 系统设置 | 用户管理、权限、全局配置 | - |

---

## 路由管理

### 创建路由（Console UI）

```
1. 登录 Console → 路由管理 → 创建路由
2. 填写基本信息：
   - 路由名称：api-route
   - 域名：api.example.com
   - 路径：/api/*
   - 路径类型：Prefix
3. 配置后端服务：
   - 服务来源：K8s Service
   - 服务名称：api-service
   - 端口：8080
4. 高级配置（可选）：
   - 超时：30s
   - 重试：3 次
   - 限流：1000 QPS
5. 保存 → 测试
```

### 等价 YAML

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-route
  namespace: default
  annotations:
    higress.io/request-timeout: "30s"
    higress.io/retry-count: "3"
    higress.io/limit-rps: "1000"
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

---

## 服务来源管理

### 添加 Nacos 服务来源

```
1. Console → 服务来源 → 创建服务来源
2. 填写：
   - 名称：nacos-prod
   - 类型：Nacos
   - 服务器地址：nacos.nacos.svc.cluster.local:8848
   - 命名空间：prod
   - 分组：DEFAULT_GROUP
   - 用户名/密码：nacos/nacos
3. 保存 → 验证连接
```

### 等价 YAML

```yaml
apiVersion: networking.higress.io/v1
kind: McpBridge
metadata:
  name: nacos-prod
  namespace: higress-system
spec:
  registries:
    - name: nacos-prod
      type: nacos
      nacosServer: nacos.nacos.svc.cluster.local:8848
      nacosNamespaceId: prod
      nacosGroups: [DEFAULT_GROUP]
      nacosUsername: nacos
      nacosPassword: nacos
```

---

## 插件管理

### 安装插件

```
1. Console → 插件市场 → 浏览可用插件
2. 选择插件（如：jwt-auth）→ 点击安装
3. 填写配置：
   - 镜像地址：oci://registry.example.com/plugins/jwt-auth:v1
   - 执行阶段：AUTHN
   - 优先级：1000
   - 插件配置（JSON）：
     {
       "issuer": "https://auth.example.com",
       "jwks_uri": "https://auth.example.com/.well-known/jwks.json"
     }
4. 选择生效范围：
   - 全局
   - 指定域名
   - 指定路由
5. 保存 → 验证插件状态
```

### 查看插件日志

```bash
# Console 中查看
插件管理 → 选择插件 → 日志标签页

# 命令行查看
kubectl logs -n higress-system deploy/higress-gateway | grep jwt-auth
```

---

## 版本升级

### Helm 升级

```bash
# 1. 查看当前版本
helm list -n higress-system

# 2. 备份配置（重要！）
kubectl get ingress,wasmplugin,mcpbridge -A -o yaml > higress-backup.yaml

# 3. 查看可用版本
helm search repo higress --versions

# 4. 升级（滚动更新）
helm upgrade higress higress/higress \
  -n higress-system \
  --version 2.x.x \
  --reuse-values

# 5. 验证升级
kubectl get pods -n higress-system
kubectl rollout status deploy/higress-gateway -n higress-system

# 6. 测试核心路由
curl -H "Host: api.example.com" http://<gateway-ip>/api/health
```

### 升级注意事项

```
✅ 推荐做法：
1. 先在测试环境验证
2. 备份所有 CRD 配置
3. 使用 --reuse-values 保留自定义配置
4. 滚动升级（默认），避免中断
5. 升级后立即测试核心路由

❌ 避免做法：
1. 直接升级生产环境（未测试）
2. 删除 PVC（丢失配置）
3. 同时升级多个组件（Controller + Gateway + Console）
4. 忽略版本兼容性（K8s 版本、Istio 版本）
```

### 回滚

```bash
# 查看历史版本
helm history higress -n higress-system

# 回滚到指定版本
helm rollback higress <REVISION> -n higress-system

# 验证回滚
kubectl get pods -n higress-system
curl http://<gateway-ip>/api/health
```

---

## 监控告警

### Grafana Dashboard

```bash
# 1. 导入 Higress Dashboard
# Grafana → Import → 输入 Dashboard ID（或上传 JSON）
# 官方 Dashboard：https://github.com/alibaba/higress/tree/main/grafana

# 2. 关键面板
# - 总览：QPS、P99 延迟、错误率
# - 路由分析：按路由分组的 QPS/延迟
# - 上游服务：上游延迟、错误、连接数
# - 资源使用：CPU、内存、连接数
```

### 告警规则

```yaml
# PrometheusRule
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: higress-alerts
  namespace: monitoring
spec:
  groups:
    - name: higress
      rules:
        # 高错误率
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
        
        # 高延迟
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
        
        # 上游不可用
        - alert: HigressUpstreamDown
          expr: envoy_cluster_upstream_cx_active == 0
          for: 1m
          labels:
            severity: critical
        
        # Pod 重启
        - alert: HigressPodRestart
          expr: |
            increase(kube_pod_container_status_restarts_total{
              pod=~"higress-.*", namespace="higress-system"
            }[1h]) > 3
          for: 5m
          labels:
            severity: warning
```

---

## 故障排查

### 排查流程

```
问题现象
   ↓
1. 检查 Pod 状态
   kubectl get pods -n higress-system
   ↓
2. 查看日志
   kubectl logs -n higress-system deploy/higress-gateway --tail=100
   kubectl logs -n higress-system deploy/higress-controller --tail=100
   ↓
3. 检查配置
   kubectl get ingress,wasmplugin,mcpbridge -A
   kubectl describe ingress <name>
   ↓
4. 检查 Envoy 配置
   kubectl exec -n higress-system deploy/higress-gateway -- \
     curl -s localhost:15000/config_dump
   ↓
5. 检查上游服务
   kubectl get endpoints <service-name>
   curl http://<pod-ip>:<port>/health
   ↓
6. 网络连通性
   kubectl exec -n higress-system deploy/higress-gateway -- \
     curl -v http://<upstream-service>:<port>
```

### 常见问题速查

| 问题 | 可能原因 | 排查命令 |
|:--|:--|:--|
| 502 Bad Gateway | 上游服务不可用 | `kubectl get endpoints` |
| 503 Service Unavailable | 熔断触发 / 无健康实例 | `curl localhost:15000/clusters` |
| 504 Gateway Timeout | 上游超时 | 检查 `request-timeout` |
| 404 Not Found | 路由不匹配 | `kubectl get ingress -o yaml` |
| 401 Unauthorized | JWT 认证失败 | 查看 Gateway 日志 |
| 429 Too Many Requests | 限流触发 | 检查限流配置 |
| Pod CrashLoopBackOff | 配置错误 / 镜像拉取失败 | `kubectl describe pod` |

### 调试工具

```bash
# 1. Envoy Admin API
kubectl exec -n higress-system deploy/higress-gateway -- \
  curl -s localhost:15000/help

# 常用端点：
# /config_dump    - 完整配置
# /clusters        - 上游集群状态
# /stats          - 指标统计
# /logging        - 日志级别调整

# 2. 调整日志级别（调试用）
kubectl exec -n higress-system deploy/higress-gateway -- \
  curl -X POST "localhost:15000/logging?level=debug"

# 3. 查看路由匹配
kubectl exec -n higress-system deploy/higress-gateway -- \
  curl -s localhost:15000/config_dump | jq '.configs[] | select(.["@type"]=="type.googleapis.com/envoy.admin.v3.RoutesConfigDump")'

# 4. 查看 Wasm 插件状态
kubectl exec -n higress-system deploy/higress-gateway -- \
  curl -s localhost:15000/config_dump | jq '.configs[] | select(.["@type"]=="type.googleapis.com/envoy.admin.v3.EcdsConfigDump")'
```

---

## 日常运维

### 配置备份

```bash
# 备份所有 Higress 配置
kubectl get ingress,wasmplugin,mcpbridge,configmap -A -o yaml > higress-backup-$(date +%Y%m%d).yaml

# 定时备份（CronJob）
apiVersion: batch/v1
kind: CronJob
metadata:
  name: higress-backup
  namespace: higress-system
spec:
  schedule: "0 2 * * *"    # 每天凌晨 2 点
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: bitnami/kubectl:latest
              command:
                - /bin/sh
                - -c
                - |
                  kubectl get ingress,wasmplugin,mcpbridge -A -o yaml > /backup/higress-$(date +%Y%m%d).yaml
              volumeMounts:
                - name: backup-volume
                  mountPath: /backup
          volumes:
            - name: backup-volume
              persistentVolumeClaim:
                claimName: higress-backup-pvc
```

### 配置审计

```bash
# 查看配置变更历史
kubectl get ingress -A -o custom-columns=NAME:.metadata.name,NAMESPACE:.metadata.namespace,UPDATED:.metadata.generation

# 使用 GitOps（ArgoCD/Flux）管理配置
# 所有 CRD 提交到 Git，自动同步到集群
```

### 容量规划

```bash
# 查看当前资源使用
kubectl top pods -n higress-system

# 根据 QPS 调整副本数
# 经验值：单 Pod 可处理 ~5000 QPS（取决于配置复杂度）
kubectl scale deploy/higress-gateway -n higress-system --replicas=4

# 调整资源限制
kubectl edit deploy/higress-gateway -n higress-system
# resources:
#   requests: { cpu: 1000m, memory: 1Gi }
#   limits: { cpu: 4000m, memory: 4Gi }
```

---

## 复习卡片

> [!TIP]
> **快速复习清单**
>
> 1. **Console 访问**：port-forward 8001 或通过 Ingress 暴露，默认 admin/admin
> 2. **路由管理**：Console UI 配置等价于 Ingress/HTTPRoute CRD
> 3. **服务来源**：Console 添加 McpBridge，支持 K8s/Nacos/Consul/DNS/静态
> 4. **插件管理**：Console 安装 WasmPlugin，配置生效范围（全局/域名/路由）
> 5. **版本升级**：`helm upgrade --reuse-values`，先备份配置，滚动升级
> 6. **监控告警**：Grafana Dashboard + PrometheusRule（错误率/延迟/上游不可用）
> 7. **故障排查**：Pod 状态 → 日志 → 配置 → Envoy Admin API → 上游服务
> 8. **日常运维**：配置备份（CronJob）、GitOps 审计、容量规划

---

> [!TIP]
> 下一篇：[网关选型对比](/blog/posts/higress-roadmap-13-comparison/) 将对比 Higress vs APISIX vs Kong vs Spring Cloud Gateway vs Nginx，帮助你做技术选型。
>
> 返回 [Higress 学习路线总览](/blog/posts/higress-roadmap-00-overview/) | [合集页](/blog/higress-roadmap/)
