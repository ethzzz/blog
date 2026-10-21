---
title: 'Higress 环境搭建'
published: 2026-09-17T10:30:00+08:00
description: '讲解 Higress 的三种部署方式：Docker Compose 快速体验、Kubernetes Helm 生产部署、本地开发环境搭建，以及 Higress Console 的使用。'
tags: [Higress, 环境搭建, Docker, Kubernetes, Helm, Console]
category: Higress学习路线
draft: false
---

> [!NOTE]
> 本文讲解 Higress 的三种部署方式，从快速体验到生产级部署，覆盖不同场景需求。

---

## 部署方式对比

| 方式 | 适用场景 | 复杂度 | 生产可用 |
|:--|:--|:--|:--|
| Docker Compose | 本地体验、开发测试 | ⭐ | ❌ |
| Kubernetes + Helm | 生产环境、云原生 | ⭐⭐⭐ | ✅ |
| 本地源码编译 | 插件开发、二次开发 | ⭐⭐⭐⭐ | ❌ |

---

## 方式一：Docker Compose（快速体验）

### 一键安装脚本

```bash
# 官方一键脚本（最简单）
curl -fsSL https://higress.io/standalone/get-higress.sh | bash -s -- -a

# 参数说明：
# -a: 自动安装依赖（Docker/Docker Compose）
# -c: 指定配置目录（默认 ~/.higress）
# -p: 指定端口（默认 8080/8443）
```

### 手动 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  higress:
    image: higress-registry.cn-hangzhou.cr.aliyuncs.com/higress/all-in-one:latest
    container_name: higress
    ports:
      - "8080:8080"     # HTTP 网关端口
      - "8443:8443"     # HTTPS 网关端口
      - "8001:8001"     # Higress Console 端口
    volumes:
      - ./data:/data    # 持久化配置
    restart: unless-stopped
    environment:
      - CONFIG_TEMPLATE=standalone
```

```bash
# 启动
docker compose up -d

# 查看日志
docker compose logs -f higress

# 访问 Console
open http://localhost:8001
```

### 验证安装

```bash
# 检查容器状态
docker ps | grep higress

# 测试网关（默认返回 404，因为没有配置路由）
curl -i http://localhost:8080

# 查看 Higress 版本
docker exec higress higress version
```

---

## 方式二：Kubernetes + Helm（生产推荐）

### 前置要求

- Kubernetes 1.28+
- Helm 3.8+
- kubectl 配置好集群访问

### 准备 K8s 集群（本地实验）

```bash
# 方案 1：kind（推荐，轻量）
kind create cluster --name higress

# 方案 2：minikube
minikube start --cpus=4 --memory=8192

# 方案 3：云厂商 K8s（ACK/TKE/CCE/EKS）
# 按厂商文档创建集群
```

### Helm 安装 Higress

```bash
# 1. 添加 Helm 仓库
helm repo add higress https://higress.io/helm-charts
helm repo update

# 2. 查看可用版本
helm search repo higress --versions

# 3. 安装（生产配置）
helm install higress higress/higress \
  -n higress-system \
  --create-namespace \
  --set global.local=false \
  --set higress-core.controller.replicas=2 \
  --set higress-core.gateway.replicas=2 \
  --set higress-console.replicas=1

# 4. 等待部署完成
kubectl wait --for=condition=available deployment/higress-controller \
  -n higress-system --timeout=300s
```

### Helm Values 配置详解

```yaml
# values.yaml（生产推荐配置）
global:
  local: false                    # 非本地模式
  o11y:
    enabled: true                 # 启用可观测性
    grafana:
      enabled: true

higress-core:
  controller:
    replicas: 2                   # 控制面副本数（高可用）
    resources:
      requests:
        cpu: 500m
        memory: 512Mi
      limits:
        cpu: 2000m
        memory: 2Gi
  
  gateway:
    replicas: 2                   # 数据面副本数（按流量调整）
    resources:
      requests:
        cpu: 1000m
        memory: 1Gi
      limits:
        cpu: 4000m
        memory: 4Gi
    service:
      type: LoadBalancer          # 生产用 LoadBalancer，测试用 NodePort
      annotations:
        # 云厂商 SLB 注解（按实际调整）
        service.beta.kubernetes.io/alibaba-cloud-loadbalancer-spec: "slb.s2.small"

higress-console:
  replicas: 1
  service:
    type: ClusterIP               # 通过 Ingress 暴露，不直接 LoadBalancer
  admin:
    password: "your-strong-password"  # 务必修改默认密码
```

### 验证 K8s 部署

```bash
# 检查 Pod 状态
kubectl get pods -n higress-system
# NAME                                    READY   STATUS    RESTARTS   AGE
# higress-controller-xxx                  1/1     Running   0          2m
# higress-gateway-xxx                     1/1     Running   0          2m
# higress-console-xxx                     1/1     Running   0          2m

# 检查 Service
kubectl get svc -n higress-system
# NAME                TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)
# higress-gateway     LoadBalancer   10.96.xxx.xxx   47.xxx.xxx.xxx  80:3xxxx/TCP,443:3xxxx/TCP

# 访问网关
curl -i http://<EXTERNAL-IP>

# 访问 Console（通过 port-forward）
kubectl port-forward svc/higress-console 8001:8001 -n higress-system
open http://localhost:8001
```

---

## 方式三：本地开发环境（插件开发）

### 安装依赖

```bash
# Go 1.24+（Wasm 插件开发必需）
# 下载：https://go.dev/dl/
go version  # 确认 go1.24.x

# Docker（构建 Wasm 镜像）
docker --version

# kubectl（K8s 操作）
kubectl version --client

# helm（Higress 部署）
helm version

# oras（OCI 镜像推送）
oras version
```

### 本地 Higress 开发环境

```bash
# 1. 克隆 Higress 源码
git clone https://github.com/alibaba/higress.git
cd higress

# 2. 启动本地 K8s（kind）
make kind-up

# 3. 部署 Higress（开发模式）
make deploy-dev

# 4. 验证
kubectl get pods -n higress-system
```

### Wasm 插件开发环境

```bash
# 1. 克隆 wasm-go SDK
git clone https://github.com/higress-group/wasm-go.git
cd wasm-go

# 2. 创建插件项目
mkdir my-plugin && cd my-plugin
go mod init my-plugin

# 3. 编写 main.go（见第 09 篇）

# 4. 编译 Wasm
GOOS=wasip1 GOARCH=wasm go build -o plugin.wasm

# 5. 本地测试（用 Higress 开发环境加载）
```

---

## Higress Console 使用

### 访问 Console

```bash
# K8s 部署：port-forward
kubectl port-forward svc/higress-console 8001:8001 -n higress-system

# Docker Compose：直接访问
open http://localhost:8001

# 默认账号密码：admin / admin（首次登录强制修改）
```

### Console 功能概览

| 模块 | 功能 |
|:--|:--|
| **概览** | 网关状态、QPS、延迟、错误率监控 |
| **路由管理** | 可视化配置域名、路径、Header 路由规则 |
| **服务来源** | 配置服务发现（K8s/Nacos/Consul/DNS/静态） |
| **插件市场** | 浏览、安装、配置 Wasm 插件 |
| **策略配置** | 限流、熔断、重试、超时、CORS 等 |
| **监控告警** | Prometheus/Grafana 集成、日志查询 |
| **系统设置** | 用户管理、权限、全局配置 |

### 通过 Console 配置第一个路由

```
1. 登录 Console → 路由管理 → 创建路由
2. 填写：
   - 路由名称：demo-route
   - 域名：demo.example.com
   - 路径：/api/*
   - 目标服务：httpbin（内置测试服务）
3. 保存 → 测试：
   curl -H "Host: demo.example.com" http://<gateway-ip>/api/get
```

---

## 常见问题

### Q1: Docker Compose 启动失败，端口被占用

```bash
# 查看端口占用
lsof -i :8080
# 或
netstat -tlnp | grep 8080

# 修改 docker-compose.yml 端口映射
ports:
  - "18080:8080"   # 改用 18080
```

### Q2: K8s 部署后 Pod 一直 Pending

```bash
# 查看 Pod 事件
kubectl describe pod <pod-name> -n higress-system

# 常见原因：
# 1. 资源不足 → 调整 replicas 或 resources
# 2. 存储类缺失 → 检查 PVC 状态
# 3. 镜像拉取失败 → 检查 imagePullSecrets
```

### Q3: Console 无法访问

```bash
# 检查 Service
kubectl get svc higress-console -n higress-system

# 检查 Pod 日志
kubectl logs -n higress-system deploy/higress-console

# 确认 port-forward 正常
kubectl port-forward svc/higress-console 8001:8001 -n higress-system
```

### Q4: Wasm 插件编译失败

```bash
# 确认 Go 版本
go version  # 需要 go1.24+

# 确认环境变量
echo $GOOS   # 编译时设为 wasip1
echo $GOARCH # 编译时设为 wasm

# 正确编译命令
GOOS=wasip1 GOARCH=wasm go build -o plugin.wasm
```

---

## 复习卡片

> [!TIP]
> **快速复习清单**
>
> 1. **三种部署方式**：Docker Compose（体验）、K8s+Helm（生产）、源码编译（开发）
> 2. **Docker Compose**：`curl -fsSL https://higress.io/standalone/get-higress.sh | bash -s -- -a`
> 3. **K8s Helm**：`helm install higress higress/higress -n higress-system --create-namespace`
> 4. **核心组件**：higress-controller（控制面）、higress-gateway（数据面）、higress-console（Web UI）
> 5. **Console 访问**：port-forward 8001 端口，默认 admin/admin
> 6. **Wasm 插件编译**：Go 1.24+，`GOOS=wasip1 GOARCH=wasm go build`
> 7. **生产配置要点**：controller/gateway 各 2 副本、LoadBalancer Service、强密码

---

> [!TIP]
> 下一篇：[核心概念](/blog/posts/higress-roadmap-02-core-concepts/) 将深入讲解 Higress 的架构设计：Envoy/Istio/Wasm 的关系、数据面与控制面、路由/服务/域名/插件模型。
>
> 返回 [Higress 学习路线总览](/blog/posts/higress-roadmap-00-overview/) | [合集页](/blog/higress-roadmap/)
