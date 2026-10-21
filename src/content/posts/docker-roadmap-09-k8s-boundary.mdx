---
title: '09 · 什么时候该上 Kubernetes'
published: 2026-10-20T18:00:00+08:00
description: '单机 Compose 什么程度就够用，出现哪些信号才该上 K8s，这一篇给判据：概念映射表、一份最小可跑清单、滚动发布与回滚要领、托管方案的成本提醒。'
tags: [Kubernetes, Docker, 架构]
category: Docker学习路线
draft: false
---

> [!NOTE]
> 我曾把 8 个服务的单机 Compose 搬进 K8s：3 个节点、一套我写了两天的 YAML、账单涨了四倍，而日常操作还是 `kubectl logs`。那次之后我才明白，「该不该上」不是技术品味问题，是成本问题。这篇给判据，不给教程。

---

## 1. 先看判据，别先选技术

判断顺序永远是：先问「我需要的能力 compose 有没有」，再问「哪套编排器能给我」。反过来做，就会变成「因为想学 K8s，把一台 2 核机器搞成事故现场」。

**单机 Compose 够用的信号**（基本全中就别折腾）：

| 信号 | 具体表现 |
| :-- | :-- |
| 一台机器 | 4 核 8G 跑完全部服务，CPU 峰值不到 60% |
| 服务数 < 10 | 一份 `compose.yaml` 一屏读完，依赖关系画得出来 |
| 无多副本要求 | 重启抖 30 秒能接受，`restart: unless-stopped` 就够 |
| 团队小 | 1–3 人，没有专职运维，发版靠一条命令 |
| 流量平稳 | 白天夜里差不多，加机器不如加个缓存 |

**该上 K8s 的信号**（命中两条以上再认真评估）：

| 信号 | 为什么 compose 兜不住 |
| :-- | :-- |
| 多节点高可用 | 单机宕机 = 全站不可用，SLA 要求 99.9% 以上 |
| 自动扩缩 | 白天 10 个副本、夜里 2 个，手工改 compose 改不过来 |
| 几十个服务、多个团队 | 需要命名空间、资源配额、独立发布节奏做隔离 |
| 发布策略有要求 | 灰度、金丝雀、按 header 分流，compose 做不到 |
| 公司已有集群 | 你只交付镜像，平台别人维护——最省事的上车方式 |

## 2. 概念映射：Compose 里的东西在 K8s 叫什么

先把这张表背下来：**K8s 的新概念大多能在 Compose 里找到对应物，找不到对应的那几格才是真正的成本**。

| Compose | Kubernetes | 差异点 |
| :-- | :-- | :-- |
| `service` | Deployment → Pod | 一个服务 = 一组同构 Pod，控制器维持副本数 |
| `image:` / `build:` | `image:` + `imagePullPolicy` | K8s 只拉镜像不构建，构建放 CI |
| `ports: "8080:80"` | Service + `targetPort` | 内部走集群 DNS，对外走 Ingress |
| 命名卷 `volumes:` | PV / PVC | 存储与 Pod 解耦，Pod 重建数据还在 |
| `env_file` | ConfigMap / Secret | 密钥进 Secret；**base64 不是加密**，只是编码 |
| `healthcheck` | liveness / readinessProbe | 活着 ≠ 能接流量，两个语义要分开写 |
| `depends_on: service_healthy` | initContainer / 探针 + 应用重试 | K8s 不保证启动顺序，只能「等」不能「排」 |
| `networks` | NetworkPolicy | 默认全通，隔离要显式写策略 |

注意 `networks` 那行：compose 里同一网络的服务本来就全通，K8s 也一样——**隔离不会自动变好，只是换了个地方配**。

## 3. 最小可跑清单：Deployment + Service + Ingress

假设镜像已经由 CI 推到仓库（见[阶段五](/blog/posts/docker-roadmap-05-registry-and-ci/)），K8s 只管拉起来。三个资源放一个文件：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: notelab-java }
spec:
  replicas: 2
  selector:
    matchLabels: { app: notelab-java }
  template:
    metadata:
      labels: { app: notelab-java }
    spec:
      containers:
        - name: api
          image: registry.example.com/app/notelab-java:1.4.2
          ports: [{ containerPort: 8001 }]
          envFrom:
            - configMapRef: { name: notelab-java-config }
            - secretRef: { name: notelab-java-secret }
          resources:
            requests: { cpu: 250m, memory: 512Mi }   # 调度依据
            limits: { cpu: "1", memory: 1Gi }        # 超了限流 / OOMKilled
          readinessProbe:                            # 决定是否接流量
            tcpSocket: { port: 8001 }
            initialDelaySeconds: 20
          livenessProbe:                             # 决定是否重启
            tcpSocket: { port: 8001 }
            initialDelaySeconds: 60
---
apiVersion: v1
kind: Service
metadata: { name: notelab-java }
spec:
  selector: { app: notelab-java }
  ports: [{ port: 80, targetPort: 8001 }]
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: { name: notelab }
spec:
  ingressClassName: nginx
  tls:
    - { hosts: [haolo.cloud], secretName: haolo-cloud-tls }
  rules:
    - host: haolo.cloud
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service: { name: notelab-java, port: { number: 80 } }
```

三处最容易写错：

- **不写 `resources`，调度器就当你要无限资源**，节点一紧先杀你的 Pod；`requests` 写小、`limits` 写实，比不写安全。
- **两个探针别写成一模一样**。上面都用 `tcpSocket` 是因为这个服务压根没有健康端点，只能测「端口通不通」；一旦有了 `/actuator/health` 之类，readiness 该查「依赖是否就绪」，liveness 只查「进程是否活着」——别在 liveness 里扫全表，依赖挂了你希望它别重启、只是不接流量。
- **Ingress 只解决七层入口**，TLS 要么手挂 Secret，要么装 cert-manager；这一步比 compose 里跑个 certbot 麻烦得多。

## 4. 滚动发布与回滚

Deployment 默认就是滚动更新：先起新 Pod，`readinessProbe` 通过后加入 Service，再逐个杀老 Pod。

```bash
kubectl apply -f k8s/notelab-java.yaml
kubectl rollout status deployment/notelab-java --timeout=120s
# 卡住时先看原因再决定回不回滚
kubectl describe pod -l app=notelab-java | tail -20

kubectl rollout undo deployment/notelab-java          # 回到上一个 ReplicaSet，不重新构建
kubectl rollout history deployment/notelab-java
```

卡死的典型输出：

```text
Waiting for deployment "notelab-java" rollout to finish: 1 out of 2 new replicas have been updated...
error: deployment "notelab-java" exceeded its progress deadline
```

九成原因是**新 Pod 的 readinessProbe 一直不过**：容器没监听在 8001、端口写错、或者 `initialDelaySeconds` 太短（Spring Boot 冷启动 40 秒，你给 20 秒）。剩下那一成是 `limits` 卡太低，容器直接 OOMKilled。要回到更早的版本，`kubectl rollout undo deployment/notelab-java --to-revision=<n>`。

> [!WARNING]
> `rollout undo` 只回滚 **Pod 模板**。数据库迁移、ConfigMap、Secret、Ingress 改了都不会跟着回退——所以迁移脚本必须向前兼容：先加列、后删列，分两次发。

## 5. Helm 与 Kustomize：一句话各自的场景

- **Helm**：把一整套 K8s 资源打包成带版本、可参数化的 chart，适合「同一套服务要部署到多个环境或多个客户，需要 `values.yaml` 差异化 + 版本化安装回滚」。
- **Kustomize**：不给 YAML 加模板语法，用 overlay 覆盖原始清单，适合「资源就是我手写的 YAML，只是 dev/prod 差几个副本数和域名」。

```bash
kubectl kustomize overlays/prod | kubectl apply -f -     # 内置，不用装东西
helm upgrade --install notelab ./charts/notelab -f values.prod.yaml
```

我的选择：**自己的项目先 Kustomize**（零学习成本，YAML 还能直接 `apply` 调试）；只有要把服务交付给别人安装时，才值得写 Helm。

## 6. 别自己从零搭集群：四条现成的路

| 方案 | 适合 | 代价 |
| :-- | :-- | :-- |
| k3s | 自己的一到三台机器，练手或小规模生产 | 单节点没高可用；升级、备份还是你的事 |
| 托管 K8s（ACK/EKS/GKE） | 团队已有运维，需要标准集群 | 控制面按小时计费，节点、负载均衡、云盘另算 |
| Cloud Run / ECS Fargate | 只想要「容器跑起来 + 自动扩缩 + 按量付费」 | 有状态服务难放，冷启动明显，厂商绑定 |
| 单机 Compose + 一台冷备 | 绝大多数个人和小团队项目 | 切机要手动，但有脚本就够 |

**成本提醒**：一台跑 Compose 的 2 核 4G 机器是几十块一个月；同样负载进 K8s，至少 3 个节点 + 负载均衡 + 云盘，常见是 3–5 倍，还多出一个「集群版本每年要升级」的长期任务。**规模没到的时候，K8s 买到的主要是复杂度。**

## 7. 结论：先把 Compose 写干净

能平滑迁到 K8s 的 Compose，通常已经满足这几条（它们本来也是 Compose 的最佳实践，见[阶段四](/blog/posts/docker-roadmap-04-compose/)）：

```bash
docker compose config --quiet && echo "语法 OK"
grep -c "healthcheck:" compose.yaml       # 有状态服务都该有
grep -n "restart:" compose.yaml           # 应该全是 unless-stopped
grep -n "image:.*:latest" compose.yaml    # 不该有输出
```

这四条对应的正是 K8s 的要求：无状态、配置外置、健康检查齐全、镜像固定 tag，日志一律走 stdout 不写本地文件。**一个能被 kill 之后 30 秒自愈的服务，搬上 K8s 几乎不用改代码**；反过来，靠 pm2 守护、配置写死在源码里、日志落本地文件的服务，换编排器只会把问题换个地方发作。

所以顺序是：compose 写干净 → 单机跑稳半年 → 真遇到多节点或扩缩需求 → 再上 K8s。走到那一步，你已经知道该问什么问题了。

---

## 小结

- 判据先行：一台机器、服务 < 10、无多副本要求、团队小，就老老实实用 Compose；命中「多节点高可用 / 自动扩缩 / 几十个服务 / 灰度发布 / 已有集群」两条以上再考虑 K8s。
- 映射表里最容易踩的是探针语义和 `resources`——这两个不写，等于没上 K8s。
- 滚动发布靠 readinessProbe 把关；回滚用 `kubectl rollout undo`，但它回滚不了数据库迁移和配置。
- Helm 面向「分发」，Kustomize 面向「我自己的多环境」，小项目先用 Kustomize。
- 先算账：节点 + 负载均衡 + 云盘通常是单机的 3–5 倍，还搭上一个长期的升级任务。

---

## 练习

1. 给你现在的项目列一张表：左边「我需要的能力」，右边「Compose 能不能给」，逐条判断该不该上 K8s 并写下理由。
2. 用 k3d 或 kind 在本机起一个单节点集群，把上面那份清单改成指向你的项目，`kubectl apply` 后用 `kubectl get pod,svc,ingress` 确认三个资源都起来了。
3. 把 `readinessProbe` 的端口改成一个没人监听的端口，观察 `kubectl rollout status` 的输出和 `kubectl get pod` 里 READY 列的变化，再 `rollout undo` 回滚。
4. 把同一份清单用 Kustomize 拆成 `base/` 和 `overlays/dev`（副本数改 1、tag 改 dev），用 `kubectl kustomize overlays/dev` 看渲染结果，体会它和 Helm 模板的区别。
