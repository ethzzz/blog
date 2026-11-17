---
title: '后端 19–21：K8s、搜索与毕业验收'
published: 2026-11-10T11:00:00+08:00
updated: 2026-11-18T09:10:00+08:00
description: 'Day 19–21：K8s/Helm 部署、Meilisearch 索引、AI 助手后端支持，以及完整项目毕业验收。'
tags: [社区全栈, 后端, K8s, Meilisearch]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 后端 19–21。上一篇：[后端 16–18](/blog/posts/node-roadmap-21-community-week-4/)；前端对应篇：[前端 13–15](/blog/posts/community-fullstack-fe-05-p2b-search-ai/)；共享总览：[00 总览](/blog/posts/node-roadmap-17-express-zero-to-one-30-days/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

最后三天做部署和加分项：K8s、搜索、AI 后端。K8s 先保证能部署和演示，不追求多集群；搜索和 AI 可以裁剪，前面 18 天的内容才是主线。

**这一阶段在练什么**

把部署和扩展做成可插拔：K8s、搜索、AI 都是可替换的扩展，核心链路不能让它们拖住。

### 文件地图

| 文件 | 为什么单独存在 | 以后可能怎么改 |
|---|---|---|
| `infra/k8s/helm/*` | 部署参数和环境差异收敛 | 多环境 values、GitOps |
| `templates/migrate-job.yaml` | 迁移和应用生命周期分开 | 迁移流水线、回滚策略 |
| `common/meili.ts` | 索引是派生数据，可重建 | 增量索引、换 ES |
| `modules/search/` | 搜索优先走索引，失败降级 MySQL | 召回排序、向量检索 |
| `modules/ai/` | 模型调用有超时、限流、降级 | 模型网关、RAG、成本控制 |
| `docs/graduation.md` | 用清单判断“真的做完” | 每次迭代更新验收项 |

**怎么判断**

核心链路先跑通，再加搜索/AI。扩展失败只能降级，不能让登录、发帖、feed 一起挂。

---

## Day 19：K8s/Helm 部署

**今天目标**：一条命令把 api/admin-api/web 部署到集群，探针和迁移 Job 正常。

### 1. Helm 结构

```text
infra/k8s/helm/community/
  Chart.yaml
  values.yaml
  templates/
    _helpers.tpl
    api-deployment.yaml
    api-service.yaml
    admin-deployment.yaml
    admin-service.yaml
    web-deployment.yaml
    web-service.yaml
    ingress.yaml
    hpa.yaml
    configmap.yaml
    secret.yaml
    migrate-job.yaml
    NOTES.txt
```

`values.yaml` 把三个服务的镜像、副本、资源、探针和外部依赖收在一起，部署时只改 values：

```yaml
api:
  replicaCount: 2
  image:
    repository: community-api
    tag: latest
  port: 3000
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 6
    targetCPUUtilizationPercentage: 70

mysql:
  host: mysql
  port: 3306
  database: community
  adminDatabase: community_admin

search:
  meiliHost: ""

ai:
  enabled: false
```

API Deployment 的关键片段（完整文件在 `templates/api-deployment.yaml`）：

```yaml
containers:
  - name: api
    image: community-api:latest
    ports:
      - name: http
        containerPort: 3000
    envFrom:
      - configMapRef:
          name: community-config
      - secretRef:
          name: community-secrets
    # readiness 失败只摘流量；liveness 失败才会重启
    readinessProbe:
      httpGet: { path: /ready, port: http }
      initialDelaySeconds: 10
      periodSeconds: 10
    livenessProbe:
      httpGet: { path: /health, port: http }
      initialDelaySeconds: 20
      periodSeconds: 15
    # 先等 Ingress 把 Pod 摘掉，再让优雅关闭处理剩余请求
    lifecycle:
      preStop:
        exec:
          command: ["sh", "-c", "sleep 5"]
```

`/ready` 检查和 `/health` 不要互相替代：前者失败会把 Pod 从 Service 摘掉，后者失败会触发重启。

### 2. 迁移与 Secret

迁移用独立 Job，通过 Helm hook 在应用滚动前执行（`templates/migrate-job.yaml`）：

```yaml
metadata:
  annotations:
    helm.sh/hook: pre-install,pre-upgrade
    helm.sh/hook-weight: "-10"
    helm.sh/hook-delete-policy: before-hook-creation
spec:
  backoffLimit: 3
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: migrate
          image: community-api:latest
          command: ["npx", "prisma", "migrate", "deploy"]
```

管理端还有一条 `--schema prisma/schema.prisma` 的 Job，`hook-weight: "-5"`。

- 迁移不要放在应用启动时，否则多副本并发执行，失败会变成随机重启；
- 数据库/Redis 连接串放 ConfigMap 或 Secret，JWT/内部 token/API Key 只放 Secret；
- 迁移失败会直接让 Release 失败，避免新代码打到旧表结构；
- Ingress 配 TLS、`client_max_body_size` 和 SSE 超时；HPA 按 CPU 扩缩；本地演示用 k3d/kind。

**验收**：

```bash
helm lint infra/k8s/helm/community \
  --set secrets.jwtSecret=01234567890123456789012345678901 \
  --set secrets.internalApiToken=dev-internal-token-change-me

helm upgrade --install community infra/k8s/helm/community \
  --set secrets.jwtSecret=... --set secrets.internalApiToken=...
```

`kubectl get jobs` 能看到两个迁移 Job 完成，Pod Ready 后 `/health`、`/ready`、`/metrics` 正常。

**产出**：commit `build: add helm chart for community`。

---

## Day 20：Meilisearch 索引与 AI 后端

**今天目标**：搜索可用；AI 助手后端可流式返回，没配 Key 时能 fallback。

### 1. Meilisearch 索引

不需要额外 SDK，Meilisearch 的 HTTP API 就够用。`apps/api/src/common/meili.ts`：

```ts
import { config } from './config.ts';

export type IndexedPost = {
  id: string;
  title: string | null;
  content: string;
  authorId: string;
  createdAt: string;
};

function headers() {
  return {
    'Content-Type': 'application/json',
    ...(config.MEILI_KEY ? { Authorization: `Bearer ${config.MEILI_KEY}` } : {}),
  };
}

export async function indexPosts(posts: IndexedPost[]) {
  if (!config.MEILI_HOST || posts.length === 0) return false;

  const response = await fetch(`${config.MEILI_HOST}/indexes/posts/documents`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(posts),
  });
  if (!response.ok) throw new Error(`Meilisearch index failed: ${response.status}`);
  return true;
}

export async function searchPosts(query: string, limit: number) {
  if (!config.MEILI_HOST) return null;

  const response = await fetch(`${config.MEILI_HOST}/indexes/posts/search`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ q: query, limit }),
  }).catch(() => null);

  if (!response?.ok) return null;

  const data = (await response.json()) as { hits?: IndexedPost[] };
  return data.hits ?? [];
}
```

`MEILI_HOST`、`MEILI_KEY` 都是可选配置：没配就返回 `null`，调用方走降级。

搜索接口 `apps/api/src/modules/search/search.routes.ts`：

```ts
searchRouter.get('/posts', asyncHandler(async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const limit = Math.min(Number(req.query.limit ?? 20) || 20, 50);
  if (!query) throw new AppError('QUERY_REQUIRED', 400, 'Search query is required');

  const indexed = await searchPosts(query, limit).catch(() => null);
  if (indexed) {
    res.json({ items: indexed, source: 'meilisearch' });
    return;
  }

  const rows = await prisma.post.findMany({
    where: {
      status: 'published',
      OR: [{ title: { contains: query } }, { content: { contains: query } }],
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    take: limit,
    select: postSelect,
  });

  res.json({ items: rows.map(toPost), source: 'mysql' });
}));
```

- MySQL 是真相源，索引可重建；`source` 字段让前端和测试能判断走了哪条路；
- Meilisearch 查询失败不抛错，直接降级 MySQL，搜索不会变成 500；
- 只索引 `published` 帖子。

重建索引用内部接口（需要 `X-Internal-Token`）：

```bash
curl -X POST http://127.0.0.1:3000/internal/search/reindex \
  -H "X-Internal-Token: $INTERNAL_API_TOKEN"
# { "posts": 14, "configured": true }
```

生产环境应在帖子发布/审核通过的 outbox 事件里做增量索引；当前实现保留手动重建，先保证索引坏了能修复。

### 2. AI 后端

```text
POST /api/v1/ai/chat
body: { message: string }
response: text/event-stream
```

`apps/api/src/modules/ai/ai.service.ts` 做两件事：有 `OPENAI_API_KEY` 就流式调用模型，没有就返回本地 mock 流。核心是统一的 `streamChat()`：

```ts
function mockReply(message: string) {
  const text = message.toLowerCase();
  if (text.includes('发帖') || text.includes('帖子')) {
    return '新帖默认是 pending，管理员审核通过后才会进入关注流。';
  }
  if (text.includes('搜索')) {
    return '搜索优先使用 Meilisearch，未配置索引时会降级到 MySQL。';
  }
  return '我是围炉助手。当前没有配置模型 Key，所以返回的是本地 fallback。';
}

function split(text: string) {
  const chunks: string[] = [];
  for (let index = 0; index < text.length; index += 2) {
    chunks.push(text.slice(index, index + 2));
  }
  return chunks;
}

async function* mockStream(message: string) {
  for (const chunk of split(mockReply(message))) {
    await new Promise((resolve) => setTimeout(resolve, 20));
    yield chunk;
  }
}

async function* openAiStream(message: string, signal: AbortSignal) {
  const response = await fetch(`${config.OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.OPENAI_MODEL,
      stream: true,
      messages: [
        { role: 'system', content: '你是围炉社区助手，回答简洁、具体。' },
        { role: 'user', content: message },
      ],
    }),
    signal,
  });
  if (!response.ok || !response.body) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === '[DONE]') return;
      try {
        const data = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const token = data.choices?.[0]?.delta?.content;
        if (token) yield token;
      } catch {
        // 忽略不完整的 SSE 行
      }
    }
  }
}

export function streamChat(message: string, signal: AbortSignal) {
  return config.OPENAI_API_KEY
    ? openAiStream(message, signal)
    : mockStream(message);
}
```

路由负责 SSE 协议和客户端断开（`apps/api/src/modules/ai/ai.routes.ts`）：

```ts
aiRouter.post('/chat', requireAuth, asyncHandler(async (req, res) => {
  const message = String(req.body?.message ?? '').trim();
  if (!message) throw new AppError('MESSAGE_REQUIRED', 400, 'Message is required');

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // 浏览器点“停止”或断开连接时，中断上游生成，释放连接
  const controller = new AbortController();
  req.on('close', () => controller.abort());

  try {
    for await (const token of streamChat(message, controller.signal)) {
      if (controller.signal.aborted) break;
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }
    res.write('event: done\ndata: [DONE]\n\n');
  } catch {
    res.write(`event: error\ndata: ${JSON.stringify({ message: 'AI unavailable' })}\n\n`);
  } finally {
    res.end();
  }
}));
```

在 `apps/api/src/app.ts` 挂载（与其他路由同样的两处修改）：

```ts
// 插到 apps/api/src/app.ts 顶部的 import 区
import { aiRouter } from './modules/ai/ai.routes.ts';

// 插到 app.use('/api/v1/posts', postsRouter); 之后
app.use('/api/v1/ai', aiRouter);
```

前端 BFF `apps/web/src/app/api/ai/chat/route.ts` 只做透传：把上游的 `ReadableStream` 原样返回，并带上同一组 SSE 响应头。页面里的解析器按 `data:` 行取 JSON 的 `token` 字段，而不是直接拼原始文本——协议一旦变化，只改一处。

- 检索：用帖子标题/正文做关键词召回（Day 20 前半）；
- 流式：SSE 返回 `{ token }`；客户端 abort 时后端停止生成；
- 审核：敏感内容分类暂未接入，命中应进人工审核；
- 默认 mock，没配 API Key 也能演示；`OPENAI_BASE_URL` 可指向任何兼容接口。

**验收**：搜索页能查到 published 帖子且返回 `source`；AI 流式输出可停止；无 Key 时返回 mock 流而不是白屏。

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
- [ ] 搜索可降级；AI 可开关

### 2. 工程验收

- [ ] `pnpm -r typecheck` 全绿
- [ ] `pnpm --filter api build`、`pnpm --filter admin-api build`、`pnpm --filter web build` 通过
- [ ] `pnpm --filter api test` 全绿
- [ ] `pnpm test:e2e` 三条主链路通过（发帖、管理台、搜索+AI）
- [ ] OpenAPI 可访问；前端请求不绕过 BFF
- [ ] Compose 一条命令启动；`helm lint` 与 `helm template` 通过
- [ ] `/health`、`/ready`、`/metrics` 正常；`SIGTERM` 能优雅退出
- [ ] 压测报告 + 5 分钟回滚路径
- [ ] 3 篇 ADR

完整勾选项、演示脚本和常见追问整理在仓库的 `docs/graduation.md`，每次迭代直接更新那份清单。

> 当前没有接入分布式 trace、Grafana 面板和 Sentry；观测手段是结构化日志 + Prometheus 指标 + `/ready`。这是有意留白，写在“已知不足”里，而不是验收项里打勾。

### 3. 10 分钟演示

```text
0:00-1:00  问题与范围：为什么是 Express + NestJS + Next.js
1:00-3:00  登录 → 发帖 → 点赞 → 评论 → 换账号看通知
3:00-4:30  首页下拉两页：游标分页为什么不重不漏
4:30-5:30  搜索命中/降级 + AI 助手流式输出与停止
5:30-7:00  管理台：审核帖子、处理举报、封禁用户、审计日志
7:00-8:30  /metrics、/health、/ready，讲滚动更新与优雅关闭
8:30-9:30  压测数字、回滚预案、三篇 ADR 的取舍
9:30-10:00 已知不足与下一步
```

### 4. 面试能讲什么

- 为什么公共 API 留 Express、管理端用 NestJS
- 为什么用 Outbox + BullMQ 做通知（RabbitMQ 只在 Compose 里预留，没有进主链路）
- 为什么 feed 用游标、点赞用唯一约束
- 为什么 K8s 先单集群、迁移用 Job
- 为什么搜索必须能降级、AI 必须能 mock
- 如果重来：先补测试和压测，再补功能

后端 01–21 到这里就做完了。回到 [00 总览](/blog/posts/node-roadmap-17-express-zero-to-one-30-days/) 对一下前后端进度，或者继续看 [前端 13–15](/blog/posts/community-fullstack-fe-05-p2b-search-ai/)。
