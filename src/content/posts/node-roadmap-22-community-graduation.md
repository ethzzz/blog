---
title: '后端 19–21：K8s、搜索与毕业验收'
published: 2026-11-10T11:00:00+08:00
updated: 2026-11-10T11:00:00+08:00
description: 'Day 19–21：K8s/Helm 部署、Meilisearch 索引、AI 助手后端支持，以及完整项目毕业验收。'
tags: [社区全栈, 后端, K8s, Meilisearch]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 后端 19–21。上一篇：[后端 16–18](/blog/posts/node-roadmap-21-community-week-4/)；前端对应篇：[前端 13–15](/blog/posts/community-fullstack-fe-05-p2b-search-ai/)；共享总览：[00 总览](/blog/posts/node-roadmap-17-express-zero-to-one-30-days/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

19–21 是后端收尾：K8s/Helm、搜索、AI 后端支持和毕业验收。搜索和 AI 是加分项，做不完不影响前面阶段的投递价值。

---

## Day 19：K8s/Helm 部署

**今天目标**：一条命令把 api/admin-api/web 部署到集群，探针和迁移 Job 正常。

### 1. Helm 结构

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

### 2. 迁移与 Secret

- 迁移用独立 Job：`npx prisma migrate deploy`，不要放在应用启动时，否则多副本并发迁移。
- 数据库/Redis/RabbitMQ 连接串放 Secret；ConfigMap 放非敏感配置。
- Ingress 配 TLS、`client_max_body_size`、SSE 超时。
- HPA 按 CPU/内存扩缩；本地演示用 k3d/kind，云上用 k3s 或托管 K8s，不做多集群。

**验收**：`helm upgrade --install community ./infra/k8s/helm/community -f values-dev.yaml` 后 `/health`、`/ready`、`/metrics` 正常；迁移 Job 成功。

**产出**：commit `build: add helm chart for community`。

---

## Day 20：Meilisearch 索引与 AI 后端

**今天目标**：搜索可用；AI 助手后端可流式返回，没配 Key 时能 fallback。

### 1. Meilisearch 索引

```bash
pnpm --filter api add meilisearch
```

索引消费者订阅 `post.published`：

```ts
const client = new MeiliSearch({
  host: process.env.MEILI_HOST ?? 'http://127.0.0.1:7700',
  apiKey: process.env.MEILI_KEY,
});

await client.index('posts').addDocuments([
  {
    id: post.id.toString(),
    title: post.title,
    content: post.content,
    authorId: post.authorId.toString(),
    createdAt: post.createdAt.toISOString(),
  },
]);
```

搜索接口：

```text
GET /api/v1/search/posts?q=keyword&limit=20
```

- MySQL 是真相源，索引可重建。
- 消费端维护 `processed_events` 幂等。
- 先只索引 `published` 帖子。

### 2. AI 后端

```text
POST /api/v1/ai/chat
body: { message: string, postId?: string }
response: text/event-stream
```

最小实现：

```ts
aiRouter.post('/chat', requireAuth, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('X-Accel-Buffering', 'no');

  const stream = await llm.chat({ messages: [{ role: 'user', content: req.body.message }] });
  for await (const token of stream) {
    res.write(token);
  }
  res.end();
});
```

- 检索：用帖子标题/正文做关键词或向量召回。
- 流式：SSE 返回 token；客户端可中断。
- 审核：对评论/帖子做敏感内容分类，命中进人工审核。
- 默认 mock/开关，没配 API Key 也能演示。

**验收**：搜索页能查到 published 帖子；AI 流式输出可停止；无 Key 时 fallback 不白屏。

**产出**：commit `feat: add search and ai backend support`。

---

## Day 21：毕业验收与演示

**今天目标**：确认「企业级项目」真的成立，并准备 10 分钟演示。

### 1. 业务验收

- [ ] 注册/登录/刷新/登出；旧 refresh 重放 401
- [ ] 发帖/列表/详情/软删除；pending 不进 feed
- [ ] 评论 + 计数同事务；点赞幂等；关注幂等
- [ ] feed 游标不重不漏
- [ ] 通知 + SSE；自己操作自己不通知
- [ ] 审核/举报/用户封禁/审计
- [ ] 搜索/AI 可开关

### 2. 工程验收

- [ ] `pnpm -r typecheck` / `test` / `build` 全绿
- [ ] OpenAPI 可访问；前端 client 不漂移
- [ ] 一条命令部署；`/health`、`/ready`、`/metrics` 正常
- [ ] trace 跨服务；Grafana 有面板；Sentry 有错误
- [ ] 压测报告 + 5 分钟回滚
- [ ] 3 篇 ADR

### 3. 10 分钟演示

```text
0:00-1:00  问题与范围
1:00-3:00  注册/登录/refresh
3:00-5:00  发帖/审核/评论/点赞
5:00-7:00  feed 游标 + 通知 SSE
7:00-9:00  管理端审核/举报 + trace
9:00-10:00 取舍与如果重来
```

### 4. 面试能讲什么

- 为什么公共 API 留 Express、管理端用 NestJS
- 为什么 Outbox + RabbitMQ + BullMQ 并存
- 为什么 feed 用游标、点赞用唯一约束
- 为什么 K8s 先单集群、迁移用 Job
- 如果重来：先补测试和压测，再补功能

到这里，后端 01–21 闭环完成。回到 [00 总览](/blog/posts/node-roadmap-17-express-zero-to-one-30-days/) 检查两套系列的对齐，或继续 [前端 13–15](/blog/posts/community-fullstack-fe-05-p2b-search-ai/)。
