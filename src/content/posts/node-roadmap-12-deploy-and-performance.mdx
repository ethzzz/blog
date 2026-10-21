---
title: '12 · 部署与性能优化'
published: 2026-10-13T21:00:00+08:00
description: 'Node 部署与性能收官：PM2 集群模式、Docker 多阶段构建、nginx 反向代理配置、压测方法与内存泄漏排查，把博客 API 真正送上生产环境。'
tags: [Node.js, PM2, Docker, 性能优化]
category: Node全栈学习路线
draft: false
---

> [!NOTE]
> 写完代码只是开始。我第一次自己部署上线时连续翻了三个跟头：pm2 没用集群模式单进程扛不住、nginx 没配 X-Forwarded-For 拿到的全是内网 IP、内存泄漏一周 OOM 重启一次。这一篇是整个路线的收官——把博客 API 真正送上生产，并把性能问题的排查方法论交给你。

---

## 1. PM2 集群：榨干多核 CPU

Node 单进程只能用一个核，4 核机器白瞎 3 核。PM2 的 cluster 模式用 `cluster` 模块 fork 出 N 个进程共享同一端口：

```js
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'blog-api',
    script: 'dist/main.js',
    instances: 'max',          // 按 CPU 核数起满，或写死数字
    exec_mode: 'cluster',      // ⚠️ 必须，默认是 fork 单进程
    max_memory_restart: '512M', // 内存超阈值自动重启（OOM 保底）
    env_production: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'info',
    },
  }],
};
```

```bash
pm2 start ecosystem.config.js --env production
pm2 logs blog-api        # 汇聚所有进程日志
pm2 monit                # 实时监控 CPU/内存
pm2 startup + pm2 save   # 开机自启（别问我怎么知道这步不能省）
```

集群模式的前提：**进程间不共享内存状态**。第 04 篇说过别在 Service 实例属性存请求态，第 06 篇 session 放 Redis——到这里闭环了：所有跨进程状态都外置（Redis/DB）。还有个细节：`NODE_ENV=production` 会让 Express 关闭 verbose 输出、很多库切换快路径，忘了配性能差一截。

## 2. Docker 化：多阶段构建

容器是部署的事实标准，`Dockerfile` 的质量直接决定镜像大小和构建速度：

```dockerfile
# 阶段 1：构建
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# 阶段 2：运行（只有产物和生产依赖，镜像从 1.2GB 瘦到 180MB）
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
USER node                     # ⚠️ 别用 root 跑容器
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

要点速记：**alpine 基础镜像最小、依赖安装利用层缓存（先 COPY lock 文件再 install）、多阶段构建把 devDependencies 和源码留在 builder、非 root 用户跑**。容器里进程数是 1，所以容器方案下不再需要 PM2 集群——**多副本交给 K8s/docker-compose `replicas`**，PM2 只在传统裸机部署用。两条路线别混。

## 3. nginx 反向代理：服务的第一道门

Node 不直接暴露公网，nginx 挡在前面：

```nginx
upstream blog_api {
    server 127.0.0.1:3000;
    keepalive 64;              # 到 Node 的长连接，省握手开销
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    location / {
        proxy_pass http://blog_api;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;        # 第 06 篇限流依赖真实 IP
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 20m;     # 上传场景必调，默认 1m 会 413
        proxy_read_timeout 60s;
    }
}
```

Nest 侧要配 `app.set('trust proxy', 1)` 才会信任这些头，否则取 IP 逻辑失效。nginx 还能顺手做：gzip/brotli 压缩、静态资源缓存、按路径分流（`/api` 到 Node、`/` 到前端静态文件）——**前后端同机部署时一个 nginx 全搞定**。

## 4. 压测：上线前的体检

拍脑袋说"能扛多少"没有意义，压测才有数字。用 `autocannon`（Node 生态友好）：

```bash
npx autocannon -c 100 -d 30 -p 10 http://localhost:3000/api/posts
# -c 并发连接数 -d 持续秒数 -p 管道请求数
```

关键指标解读：

| 指标 | 含义 | 我的警戒线 |
| --- | --- | --- |
| RPS | 每秒请求数 | 对比优化前后 |
| 延迟 p99 | 99% 请求的响应时间 | < 500ms（均值会骗人，p99 不会） |
| 错误率 | 非 2xx 占比 | 压测中应为 0（除了故意打的限流 429） |

我的优化优先级口诀：**先查数据库（索引/N+1），再上缓存（Redis 热点数据），最后才考虑代码级微优化**。一个真实案例：列表接口 800ms，加一个联合索引降到 60ms——先看 EXPLAIN 再谈架构。

## 5. 内存泄漏排查：一次完整复盘

内存缓慢上涨 → 几天后 OOM，是最阴险的问题。我的标准排查流程（以"每次请求后全局数组忘了清理"这种经典案底为例）：

1. **确认泄漏**：`pm2 monit` 或 `docker stats` 看内存曲线——只涨不跌（GC 后水位持续抬高）即泄漏。
2. **抓快照**：`kill -USR2 <pid>`（`--inspect` 下）或 `heapdump` 包，间隔 10 分钟抓两份 heap snapshot。
3. **对比分析**：Chrome DevTools 载入两份快照，用 Comparison 视图按增量排序，找 Retained Size 异常的对象。
4. **顺藤摸瓜**：点开对象看 Retainers（引用链），谁持有它不放——90% 是全局 Map/数组、闭包、监听器没解绑（`eventEmitter.on` 无 `off`）。
5. **验证**：修复后压测 30 分钟，曲线应该是锯齿状（涨了跌、跌了涨）而不是爬坡。

预防习惯：给 `EventEmitter` 设 `setMaxListeners` 并检查警告；缓存必须有上限（LRU，用 `lru-cache` 而不是裸 Map）；压测脚本纳入 CI 偶尔跑一轮长测。

---

## 小结

- PM2 cluster 吃满多核，`max_memory_restart` 保底；跨进程状态全部外置 Redis/DB。
- Docker 多阶段构建 + alpine + 非 root，镜像瘦一个数量级；容器多副本替代 PM2 集群。
- nginx 反代配 X-Forwarded-For、keepalive、`client_max_body_size`；Node 配 trust proxy。
- 压测看 RPS 和 p99；优化顺序：数据库 → 缓存 → 代码。
- 内存泄漏五步：确认 → 双快照 → 对比 → 引用链 → 验证。

---

## 练习

1. 用 PM2 集群模式起博客 API，`autocannon` 压测对比 `instances: 1` 和 `instances: 'max'` 的 RPS 差异。
2. 写完整 Dockerfile 并构建，对比单阶段和多阶段的镜像体积，记录数据。
3. 配 nginx + HTTPS（自签证书或 Let's Encrypt），用 `curl -I` 验证响应头里的安全头（第 06 篇 helmet 的输出）。
4. 故意制造泄漏：全局数组每请求 push 一个大对象不释放，跑压测观察内存爬坡，完成一次完整的快照对比排查。
