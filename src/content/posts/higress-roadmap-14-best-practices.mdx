---
title: 'Higress 生产最佳实践'
published: 2026-09-17T17:00:00+08:00
description: '总结 Higress 生产环境最佳实践：高可用部署、性能调优、安全加固、CI/CD、GitOps、多集群管理、容量规划与故障演练。'
tags: [Higress, 生产实践, 高可用, 性能调优, 安全加固, GitOps]
category: Higress学习路线
draft: false
---

> [!NOTE]
> 本文是 Higress 学习路线的最后一篇，汇总生产环境落地的关键实践：高可用部署、性能调优、安全加固、CI/CD 与 GitOps、多集群管理、容量规划、故障演练。前 13 篇讲"怎么用"，本篇讲"怎么用好、用稳"。

---

## 生产落地检查清单

在把 Higress 推向生产前，先过一遍这张清单：

| 维度 | 检查项 | 状态 |
|:--|:--|:--|
| **高可用** | Gateway ≥ 3 副本、跨节点/跨可用区、配置 PDB | ☐ |
| **资源** | 设置 requests/limits、启用 HPA | ☐ |
| **配置** | CRD 纳入 Git、GitOps 自动同步 | ☐ |
| **备份** | etcd / CRD 定期备份、可回滚 | ☐ |
| **安全** | mTLS、RBAC、Secret 加密、镜像扫描 | ☐ |
| **可观测** | Metrics + Tracing + 日志三件套、告警规则 | ☐ |
| **发布** | 灰度/蓝绿、快速回滚预案 | ☐ |
| **容量** | 压测基线、扩容阈值明确 | ☐ |
| **演练** | 故障注入、Chaos 演练、Runbook | ☐ |

---

## 一、高可用部署

### 1.1 Gateway 多副本 + 反亲和

数据面（Gateway）是流量入口，必须多副本、跨节点分散，避免单点。

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: higress-gateway
  namespace: higress-system
spec:
  replicas: 3                      # 生产至少 3 副本
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0            # 滚动更新时不允许不可用
      maxSurge: 1
  template:
    spec:
      affinity:
        # 节点反亲和：副本分散到不同节点
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            - labelSelector:
                matchLabels:
                  app: higress-gateway
              topologyKey: kubernetes.io/hostname
        # 可用区反亲和（软约束）：尽量跨 AZ
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchLabels:
                    app: higress-gateway
                topologyKey: topology.kubernetes.io/zone
      topologySpreadConstraints:
        # 拓扑分布约束：跨 AZ 均衡
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels:
              app: higress-gateway
      containers:
        - name: gateway
          resources:
            requests:
              cpu: "1000m"
              memory: "1Gi"
            limits:
              cpu: "2000m"
              memory: "2Gi"
```

> [!WARNING]
> 上面为演示把两个 `podAntiAffinity` 写在一起，实际同一个 `affinity` 下只能有一个 `podAntiAffinity` 字段。生产中请把节点反亲和放到 `requiredDuringScheduling`、AZ 反亲和放到 `preferredDuringScheduling`，合并为**一个** `podAntiAffinity` 对象。

### 1.2 PodDisruptionBudget（PDB）

防止节点维护、集群升级时同时驱逐过多 Gateway 副本。

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: higress-gateway-pdb
  namespace: higress-system
spec:
  minAvailable: 2                  # 任意时刻至少 2 个可用
  selector:
    matchLabels:
      app: higress-gateway
```

### 1.3 HPA 自动扩缩容

按 CPU / QPS / 连接数自动扩容，应对流量高峰。

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: higress-gateway-hpa
  namespace: higress-system
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: higress-gateway
  minReplicas: 3
  maxReplicas: 20
  metrics:
    # CPU 使用率
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    # 内存使用率
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 30   # 快速扩容
      policies:
        - type: Percent
          value: 100
          periodSeconds: 30
    scaleDown:
      stabilizationWindowSeconds: 300  # 缓慢缩容，防抖动
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
```

> [!TIP]
> 更精准的做法是用 **KEDA** 基于 Prometheus 的 QPS/连接数指标扩缩容，而不是只看 CPU。网关是 I/O 密集型，CPU 未必能真实反映负载。

### 1.4 控制面高可用

控制面（Controller）故障不影响已下发的数据面配置（Envoy 会缓存最后的 xDS），但影响配置变更。同样要多副本：

```yaml
# helm values
global:
  replicas: 3                    # Controller 副本数
  priorityClassName: system-cluster-critical
```

---

## 二、性能调优

### 2.1 Envoy 并发与连接

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: higress-config
  namespace: higress-system
data:
  higress: |
    concurrency: 0               # 0 = 自动等于 CPU 核数
    # 每个 worker 独立处理连接，避免锁竞争
```

```yaml
# 上游连接池（针对后端服务）
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-route
  annotations:
    # 上游 keepalive 连接池
    higress.io/upstream-keepalive-connections: "256"
    higress.io/upstream-keepalive-time: "60s"
    # 单连接最大请求数（防止连接老化）
    higress.io/upstream-keepalive-requests: "1000"
    # 连接/请求超时
    higress.io/connect-timeout: "5s"
    higress.io/request-timeout: "30s"
```

### 2.2 下游（客户端）连接优化

```yaml
# Gateway 监听器优化
apiVersion: v1
kind: ConfigMap
metadata:
  name: higress-gateway-tuning
  namespace: higress-system
data:
  # 开启 HTTP/2、HTTP/3(QUIC)
  enable-http2: "true"
  enable-http3: "false"          # 按需开启
  # 空闲连接超时
  downstream-idle-timeout: "180s"
  # 最大请求头大小
  max-request-headers-kb: "60"
  # 每连接最大请求数（0 = 无限）
  max-requests-per-connection: "0"
```

### 2.3 内核参数（节点级）

高并发场景，节点内核参数是瓶颈。用 DaemonSet 或节点初始化脚本调整：

```bash
# /etc/sysctl.d/99-higress.conf
cat <<EOF | sudo tee /etc/sysctl.d/99-higress.conf
# 文件描述符
fs.file-max = 2097152
fs.nr_open = 2097152

# TCP 连接队列
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535

# TIME_WAIT 复用与回收
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_fin_timeout = 15

# 端口范围
net.ipv4.ip_local_port_range = 1024 65535

# 连接跟踪（如启用 conntrack）
net.netfilter.nf_conntrack_max = 1048576
net.netfilter.nf_conntrack_tcp_timeout_established = 3600

# 内存
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
EOF

sudo sysctl --system
```

```bash
# 进程级文件描述符（systemd 或容器 securityContext）
ulimit -n 1048576
```

### 2.4 性能调优优先级

```
1. 副本数 & HPA        → 最直接，横向扩展
2. 资源 requests/limits → 避免 CPU 节流（throttling）
3. 上游连接池 keepalive → 减少握手开销（收益大）
4. 内核参数            → 高并发下的天花板
5. Wasm 插件精简       → 每个插件都有开销，按需启用
6. 日志采样            → 高 QPS 下全量日志很贵
```

> [!WARNING]
> **CPU limits 陷阱**：给 Envoy 设置过低的 CPU limit 会触发内核 CFS 节流，P99 延迟飙升。网关这类延迟敏感组件，建议**只设 requests 不设 CPU limit**（或 limit 设为节点可突发上限），内存 limit 必须设（防 OOM 拖垮节点）。

---

## 三、安全加固

### 3.1 分层安全模型

```
┌─────────────────────────────────────────┐
│  边缘层：TLS 终止、WAF、DDoS、IP 黑名单  │
├─────────────────────────────────────────┤
│  认证层：JWT / OAuth2 / mTLS / API Key   │
├─────────────────────────────────────────┤
│  授权层：RBAC、Consumer 权限、路由级策略 │
├─────────────────────────────────────────┤
│  传输层：东西向 mTLS、加密               │
├─────────────────────────────────────────┤
│  数据层：敏感信息脱敏、日志审计          │
└─────────────────────────────────────────┘
```

### 3.2 Secret 管理

绝不把密钥硬编码在 Ingress annotation 或 WasmPlugin config 里。

```yaml
# ❌ 反例：明文写在 annotation
metadata:
  annotations:
    higress.io/request-header-authorization: "Bearer sk-1234567890abcdef"

# ✅ 正例：引用 K8s Secret
apiVersion: v1
kind: Secret
metadata:
  name: llm-api-key
  namespace: higress-system
type: Opaque
stringData:
  api-key: sk-xxxx          # 生产用 External Secrets / Vault 注入
---
# 通过 Wasm 插件从 Secret 读取
```

```yaml
# 使用 External Secrets Operator 从 Vault/AWS SM 同步
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: llm-api-key
  namespace: higress-system
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: ClusterSecretStore
  target:
    name: llm-api-key
  data:
    - secretKey: api-key
      remoteRef:
        key: secret/llm/openai
        property: api-key
```

### 3.3 RBAC 最小权限

```yaml
# 限制谁能修改 Higress CRD
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: higress-route-editor
  namespace: default
rules:
  - apiGroups: ["networking.k8s.io"]
    resources: ["ingresses"]
    verbs: ["get", "list", "watch", "create", "update"]
  # 注意：不给 delete，防误删；不给 WasmPlugin（更高权限单独授予）
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: dev-team-route-editor
  namespace: default
subjects:
  - kind: Group
    name: dev-team
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: higress-route-editor
  apiGroup: rbac.authorization.k8s.io
```

### 3.4 网络策略

```yaml
# 只允许 Gateway 访问后端服务，限制东西向流量
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-gateway-only
  namespace: production
spec:
  podSelector:
    matchLabels:
      tier: backend
  policyTypes:
    - Ingress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              kubernetes.io/metadata.name: higress-system
          podSelector:
            matchLabels:
              app: higress-gateway
      ports:
        - protocol: TCP
          port: 8080
```

### 3.5 安全加固清单

| 项 | 措施 |
|:--|:--|
| TLS | 强制 HTTPS、TLS 1.2+、禁用弱密码套件、HSTS |
| 证书 | cert-manager 自动签发续期，避免过期 |
| 镜像 | 私有 Registry + 镜像签名（cosign）+ 漏洞扫描（Trivy） |
| Secret | External Secrets / Vault，禁止明文入 Git |
| RBAC | 最小权限，CRD 修改权限收敛 |
| WAF | 开启 WAF 插件，防 SQL 注入 / XSS |
| 管理面 | Console 不暴露公网，走内网 + VPN + SSO |
| 审计 | 开启操作审计日志，谁改了配置可追溯 |
| mTLS | 东西向流量 mTLS 加密 |

---

## 四、CI/CD 与 GitOps

### 4.1 配置即代码（GitOps）

所有 Higress CRD（Ingress/WasmPlugin/McpBridge）纳入 Git，用 ArgoCD/Flux 自动同步。**禁止**生产环境手动 `kubectl apply`。

```
Git 仓库（唯一事实来源）
├── base/                      # 基础配置
│   ├── mcpbridge.yaml
│   └── wasmplugin-jwt.yaml
├── overlays/
│   ├── staging/               # 预发环境
│   │   ├── kustomization.yaml
│   │   └── ingress-patch.yaml
│   └── production/            # 生产环境
│       ├── kustomization.yaml
│       └── ingress-patch.yaml
└── argocd/
    └── application.yaml
```

```yaml
# ArgoCD Application
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: higress-production
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/example/higress-config.git
    targetRevision: main
    path: overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: higress-system
  syncPolicy:
    automated:
      prune: true              # 自动删除 Git 中移除的资源
      selfHeal: true           # 自动修复漂移
    syncOptions:
      - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### 4.2 Wasm 插件 CI/CD

```yaml
# .github/workflows/wasm-plugin.yaml
name: Build & Push Wasm Plugin
on:
  push:
    tags: ['v*']
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.24'

      - name: Unit Test
        run: go test ./...

      - name: Build Wasm
        env:
          GOOS: wasip1
          GOARCH: wasm
        run: go build -buildmode=c-shared -o plugin.wasm ./main.go

      - name: Login Registry
        run: oras login registry.example.com -u ${{ secrets.REG_USER }} -p ${{ secrets.REG_PASS }}

      - name: Push OCI Artifact
        run: |
          oras push registry.example.com/plugins/my-plugin:${{ github.ref_name }} \
            --artifact-type application/vnd.module.wasm.content.layer.v1+wasm \
            plugin.wasm:application/vnd.module.wasm.content.layer.v1+wasm

      - name: Update GitOps Repo（触发部署）
        run: |
          # 用 sed 更新 overlays/production 中的镜像 tag，提 PR
          echo "更新镜像 tag 到 ${{ github.ref_name }}"
```

### 4.3 灰度发布流水线

```
代码合并 → 构建 Wasm → 推送 OCI
                          ↓
              部署到 staging（自动）
                          ↓
              自动化测试 + 冒烟
                          ↓
        ┌─────────────────┴─────────────────┐
        │  灰度：5% → 20% → 50% → 100%       │
        │  每步观察 Metrics（错误率/延迟）    │
        │  异常自动回滚                        │
        └─────────────────────────────────────┘
```

```yaml
# 用 Argo Rollouts 做金丝雀
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: my-service
spec:
  strategy:
    canary:
      steps:
        - setWeight: 5
        - pause: { duration: 5m }
        - analysis:              # 自动分析错误率
            templates:
              - templateName: success-rate
        - setWeight: 20
        - pause: { duration: 5m }
        - setWeight: 50
        - pause: { duration: 10m }
```

---

## 五、多集群管理

### 5.1 多集群部署模式

```
模式 A：每集群独立 Higress（推荐）
┌──────────────┐   ┌──────────────┐
│  Cluster 1   │   │  Cluster 2   │
│  Higress     │   │  Higress     │
│  + 业务服务  │   │  + 业务服务  │
└──────┬───────┘   └──────┬───────┘
       │                  │
       └───────┬──────────┘
               │
        全局负载均衡（DNS/GSLB/L4 LB）

优点：故障隔离、就近访问、独立扩缩容
```

### 5.2 配置统一分发

多集群最大痛点是**配置一致性**。用 GitOps 统一管理：

```
Git 仓库（单一事实来源）
        ↓
   ArgoCD ApplicationSet（一键部署到 N 个集群）
        ↓
┌───────────┬───────────┬───────────┐
│ Cluster 1 │ Cluster 2 │ Cluster 3 │
│ Higress   │ Higress   │ Higress   │
└───────────┴───────────┴───────────┘
```

```yaml
# ArgoCD ApplicationSet：一套配置分发到所有集群
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: higress-multi-cluster
  namespace: argocd
spec:
  generators:
    - clusters: {}               # 匹配所有已注册集群
  template:
    metadata:
      name: 'higress-{{name}}'
    spec:
      source:
        repoURL: https://github.com/example/higress-config.git
        targetRevision: main
        path: overlays/production
      destination:
        server: '{{server}}'
        namespace: higress-system
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
```

### 5.3 跨集群服务发现

```yaml
# 集群 A 的 Higress 通过 DNS/McpBridge 访问集群 B 的服务
apiVersion: networking.higress.io/v1
kind: McpBridge
metadata:
  name: cross-cluster
  namespace: higress-system
spec:
  registries:
    - name: cluster-b-svc
      type: dns
      domain: svc-b.cluster-b.example.com   # 集群 B 的服务暴露地址
      port: 8080
```

---

## 六、容量规划与压测

### 6.1 压测基线

上线前必须压测，建立容量基线：

```bash
# wrk 压测示例
wrk -t12 -c400 -d300s \
  -H "Host: api.example.com" \
  --latency \
  http://<gateway-ip>/api/health

# 关注指标：
# - QPS（吞吐）
# - P50/P99/P999 延迟
# - 错误率
# - Gateway CPU/内存
# - 上游连接数
```

### 6.2 容量估算参考

| 单副本规格 | 简单路由 QPS | 带 3 个插件 QPS | 建议并发连接 |
|:--|:--|:--|:--|
| 1C2G | ~15,000 | ~10,000 | ~5,000 |
| 2C4G | ~30,000 | ~20,000 | ~15,000 |
| 4C8G | ~55,000 | ~38,000 | ~40,000 |

> 数据仅供参考，实际取决于插件复杂度、Body 大小、上游延迟。**务必以自己的压测为准**。

### 6.3 资源规划公式

```
副本数 = ceil(峰值QPS / 单副本QPS × 冗余系数)
冗余系数建议 1.5~2（留缓冲应对突发 + 滚动更新）

示例：
峰值 100,000 QPS，单副本（2C4G）30,000 QPS
副本数 = ceil(100000 / 30000 × 1.5) = ceil(5) = 5 副本
再加跨 AZ 冗余 → 6 副本（每 AZ 3 个）
```

---

## 七、故障演练与 Runbook

### 7.1 常见故障 Runbook

| 故障 | 现象 | 应急处理 | 根因排查 |
|:--|:--|:--|:--|
| Gateway 全挂 | 5xx 暴增 | 扩容/重启副本、切备用入口 | 看 Pod 事件、OOM、探针 |
| 配置错误 | 路由 404/502 | GitOps 回滚到上个版本 | `kubectl describe ingress` |
| 上游雪崩 | 延迟飙升、连接堆积 | 触发熔断、降级 | 上游健康检查、连接池 |
| Wasm 插件崩溃 | 特定路由 5xx | 禁用该插件 | 看插件日志、回滚镜像 |
| 证书过期 | TLS 握手失败 | 手动更新证书 | cert-manager 状态 |
| etcd 压力 | 配置下发慢 | 减少 CRD 变更频率 | etcd 监控、Controller 日志 |

### 7.2 快速回滚

```bash
# 1. 配置回滚（GitOps）
git revert <commit>            # 回退配置提交
git push                       # ArgoCD 自动同步

# 2. Helm 回滚（版本升级出问题）
helm rollback higress <REVISION> -n higress-system

# 3. Wasm 插件回滚
kubectl patch wasmplugin my-plugin -n higress-system \
  --type merge -p '{"spec":{"url":"oci://registry/plugins/my-plugin:v1.2.3"}}'

# 4. 紧急禁用插件
kubectl delete wasmplugin my-plugin -n higress-system
```

### 7.3 Chaos 演练

```yaml
# Chaos Mesh：模拟 Gateway Pod 故障
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: kill-higress-gateway
spec:
  action: pod-kill
  mode: one                      # 每次杀一个，验证 HA
  selector:
    namespaces: [higress-system]
    labelSelectors:
      app: higress-gateway
  scheduler:
    cron: '@every 2m'
```

演练目标：验证副本被杀时**流量无损**（PDB + 多副本 + 探针 + 优雅下线）。

---

## 常见问题 Q&A

**Q1：生产环境最少几个 Gateway 副本？**
A：至少 3 个，且跨节点/跨可用区。配合 PDB（minAvailable: 2）和 HPA。单副本无法容忍节点故障和滚动更新。

**Q2：控制面（Controller）挂了，流量会断吗？**
A：不会。Envoy 会缓存最后下发的 xDS 配置，控制面短时故障不影响已有流量转发，只是无法变更配置。这也是控制面/数据面分离的优势。

**Q3：CPU limit 到底要不要设？**
A：网关这类延迟敏感组件，建议**不设 CPU limit**（或设很高），只设 requests。CPU limit 过低会触发 CFS 节流，P99 延迟暴涨。内存 limit 必须设，防 OOM。

**Q4：怎么做配置备份？**
A：GitOps 是天然备份（所有配置在 Git）。额外定期导出：`kubectl get ingress,wasmplugin,mcpbridge -A -o yaml > backup-$(date +%F).yaml`，etcd 也要做快照。

**Q5：多集群配置怎么保证一致？**
A：单一 Git 仓库 + ArgoCD ApplicationSet 分发到所有集群，开启 selfHeal 自动修复漂移。禁止手动改单个集群。

**Q6：Wasm 插件拖慢网关怎么办？**
A：① 精简插件数量，按需启用；② 插件内避免重计算和频繁内存分配；③ 用路由级/域名级作用域，别全局启用；④ 压测对比开关插件前后的 QPS/延迟。

**Q7：如何实现零停机发布？**
A：滚动更新（maxUnavailable: 0）+ 就绪探针 + 优雅下线（preStop 钩子等待连接排空）+ PDB。前端有 L4 LB 时确保健康检查及时摘除旧副本。

```yaml
# 优雅下线
lifecycle:
  preStop:
    exec:
      command: ["sh", "-c", "sleep 15"]   # 等待 LB 摘除 + 连接排空
terminationGracePeriodSeconds: 30
```

---

## 复习卡片

> [!TIP]
> **生产最佳实践速记**
>
> 1. **高可用**：Gateway ≥3 副本、跨 AZ、PDB、HPA、滚动更新 maxUnavailable=0
> 2. **性能**：横向扩容优先 → 连接池 keepalive → 内核参数；CPU 不设 limit 防节流
> 3. **安全**：Secret 用 Vault/External Secrets、RBAC 最小权限、mTLS、镜像扫描、Console 不暴露公网
> 4. **CI/CD**：GitOps（ArgoCD/Flux）单一事实来源、selfHeal、禁止手动 kubectl
> 5. **发布**：金丝雀 5%→20%→50%→100%、自动分析、异常回滚
> 6. **多集群**：每集群独立 Higress + ApplicationSet 统一分发 + GSLB
> 7. **容量**：先压测建基线，副本数 = 峰值QPS / 单副本QPS × 1.5~2
> 8. **演练**：Chaos 杀 Pod 验证无损、备好 Runbook 和快速回滚

---

> [!NOTE]
> 🎉 **恭喜你完成 Higress 学习路线全部 15 篇！**
>
> 回顾整个学习路径：
> - **基础篇**（01-02）：环境搭建、核心概念
> - **网关功能篇**（03-07）：路由、服务发现、流量治理、安全、可观测
> - **Wasm 插件篇**（08-10）：Wasm 基础、Go 开发、实战
> - **高级篇**（11-14）：AI 网关、Console 运维、选型对比、生产实践
>
> 下一步建议：① 在真实项目落地一个完整网关；② 深入 Envoy 源码理解数据面；③ 关注 Higress 社区动态和 AI 网关演进；④ 考取云原生相关认证（CKA/CKAD）。
>
> 返回 [Higress 学习路线总览](/blog/posts/higress-roadmap-00-overview/) | [合集页](/blog/higress-roadmap/)
