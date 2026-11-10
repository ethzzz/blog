---
title: '后端 P2b：K8s、搜索与毕业验收'
published: 2026-11-10T11:00:00+08:00
updated: 2026-11-10T11:00:00+08:00
description: '后端最后阶段：K8s/Helm 部署、Meilisearch 索引同步、AI 助手后端支持与完整项目毕业验收。'
tags: [社区全栈, 后端, K8s, Meilisearch]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 后端 P2b。上一篇：[后端 P2a](/blog/posts/node-roadmap-21-community-week-4/)；前端对应篇：[前端 P2b](/blog/posts/community-fullstack-fe-05-p2b-search-ai/)；共享总览：[社区全栈实战 · 总览](/blog/posts/node-roadmap-17-express-zero-to-one-30-days/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

P2b 是后端收尾：K8s/Helm、搜索索引、AI 后端支持和毕业验收。搜索和 AI 是加分项，做不完不影响 P0/P1 的投递价值。

---

## 1. 目标与范围

- Helm/manifests 部署 api/admin-api/web/worker。
- 探针、HPA、Ingress、ConfigMap/Secret、迁移 Job。
- Meilisearch 索引同步。
- AI 助手/内容审核后端接口（可选）。
- 毕业验收清单。

---

## 2. K8s 清单

```text
infra/k8s/helm/community/
  Chart.yaml
  values.yaml
  templates/
    deployment-api.yaml
    deployment-admin-api.yaml
    deployment-web.yaml
    service.yaml
    ingress.yaml
    hpa.yaml
    configmap.yaml
    secret.yaml
    migrate-job.yaml
```

Deployment 关键配置：

```yaml
readinessProbe:
  httpGet: { path: /ready, port: 3000 }
  initialDelaySeconds: 5
  periodSeconds: 5
livenessProbe:
  httpGet: { path: /health, port: 3000 }
  initialDelaySeconds: 10
  periodSeconds: 10
resources:
  requests: { cpu: 100m, memory: 128Mi }
  limits: { cpu: 500m, memory: 512Mi }
```

- 迁移用独立 Job，应用启动不跑 migrate。
- Secret 用 `kubectl create secret` 或 External Secrets，不把 `.env` 打进镜像。
- 本地演示用 k3d/kind；云上用 k3s 或托管 K8s，不做多集群。

---

## 3. Meilisearch 索引

索引消费者订阅 `post.published` / `post.updated` / `post.deleted`：

```ts
await meili.index('posts').addDocuments([
  {
    id: post.id.toString(),
    title: post.title,
    content: post.content,
    authorId: post.authorId.toString(),
    createdAt: post.createdAt.toISOString(),
  },
]);
```

查询接口：

```text
GET /api/v1/search/posts?q=keyword&limit=20
```

- MySQL 是真相源，索引可重建。
- 消费端维护 `processed_events` 幂等。
- 先只索引 `published` 帖子。

---

## 4. AI 助手后端（可选）

```text
POST /api/v1/ai/chat
body: { message: string, postId?: string }
response: text/event-stream
```

- 检索：用帖子标题/正文做关键词或向量召回。
- 流式：SSE 返回 token；客户端可中断。
- 审核：对评论/帖子做敏感内容分类，命中则进人工审核。
- 默认提供 mock/开关，没配 API Key 也能演示。

---

## 5. 毕业验收清单

### 业务

- [ ] 注册/登录/刷新/登出；旧 refresh 重放 401
- [ ] 发帖/列表/详情/软删除；pending 不进 feed
- [ ] 评论 + 计数同事务；点赞幂等；关注幂等
- [ ] 关注流游标分页不重不漏
- [ ] 通知 + SSE；自己操作自己不通知
- [ ] 审核/举报/用户封禁/审计

### 工程

- [ ] `pnpm -r typecheck` / `test` / `build` 全绿
- [ ] OpenAPI 可访问；前端 client 不漂移
- [ ] 一条命令部署；`/health`、`/ready`、`/metrics` 正常
- [ ] trace 跨服务；Grafana 有面板；Sentry 有错误
- [ ] 压测报告 + 5 分钟回滚
- [ ] 搜索可用；AI 可开关/fallback

### 面试

- [ ] 能讲清为什么公共 API 留 Express、管理端用 NestJS
- [ ] 能讲清 Outbox + RabbitMQ + BullMQ 的分工
- [ ] 能讲清游标分页、点赞幂等、计数一致性
- [ ] 能讲清 K8s 探针/HPA/迁移 Job
- [ ] 能不看稿演示 10 分钟

---

## 6. 常见坑

- **迁移放应用启动**：多副本并发迁移；必须用 Job。
- **Secret 进镜像**：`.env` 和 Secret 不能打进镜像。
- **索引不一致**：以 MySQL 为准，提供重建脚本。
- **AI 阻塞主线**：默认 mock/可关闭，不能影响核心链路。
- **K8s 过度设计**：先单集群 + Helm，不做多集群/Service Mesh。

到这里，后端系列闭环完成。回到 [共享总览](/blog/posts/node-roadmap-17-express-zero-to-one-30-days/) 看两套系列的联调顺序，或继续 [前端 P2b](/blog/posts/community-fullstack-fe-05-p2b-search-ai/)。
