---
title: '02 · Dockerfile 与镜像分层'
published: 2026-10-20T11:00:00+08:00
description: '从 FROM 到 HEALTHCHECK 讲清指令取舍，用层缓存、.dockerignore 压缩构建时间，给出 pnpm + Node 多阶段 Dockerfile 与镜像选型。'
tags: [Docker, Dockerfile, 镜像, 构建]
category: Docker学习路线
draft: false
---

> [!NOTE]
> 我第一份 Dockerfile 是 `FROM node:latest` + `COPY . .` + `RUN npm install`：镜像 1.4GB，改一行代码要等三分钟。这一篇讲的就是把它拆成多阶段、瘦到 180MB、构建从三分钟变成十秒的过程。

---

## 1. 骨架：十一个指令与它们的取舍

| 指令 | 作用 | 取舍要点 |
| :-- | :-- | :-- |
| `FROM` | 指定基础镜像 | 写死 minor 版本 + 发行版，别用 `latest` |
| `WORKDIR` | 设工作目录，不存在会创建 | 别用 `RUN cd`，它只对当层有效 |
| `COPY` | 从构建上下文复制 | 优先 `COPY`，`ADD` 会自动解压/下载，太隐式 |
| `RUN` | 构建期执行，产生新层 | 安装与清理必须写在同一条里 |
| `ENV` | 环境变量，构建期+运行期都在 | 非敏感配置用它；密钥别用（阶段八） |
| `ARG` | 构建期变量，`--build-arg` 覆盖 | 会留在镜像历史里，见第 6 节 |
| `EXPOSE` | 声明端口，纯元数据 | 不发布端口，映射靠 `-p` 或 compose |
| `CMD` | 默认启动命令，可被覆盖 | 用 exec form，让应用成为 PID 1 |
| `ENTRYPOINT` | 固定入口，参数追加 | 需要 `docker run <args>` 传参时才用 |
| `USER` | 切换运行用户 | 生产镜像必须非 root |
| `HEALTHCHECK` | 容器内自检命令 | 编排层靠它判健康，否则只能看端口通不通 |

## 2. 分层与缓存：顺序就是构建速度

每条 `RUN`/`COPY`/`ADD` 生成一层只读层，**缓存键 = 指令文本 + 输入文件的内容校验和**。某一层失效，它之后的所有层全部重建——所以顺序就是命脉：

```dockerfile
# ⚠️ 反面教材：改一行 README 也会重装依赖
COPY . .
RUN pnpm install --frozen-lockfile
# ✅ 顺序对了：lock 文件不变，依赖层一直命中缓存
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
```

还有个反常识点：**层里删掉的文件不会让镜像变小**。`RUN pnpm install && rm -rf /root/.cache` 在同层内有效；拆成两条 `RUN`，被删的文件就永久留在上一层里。依赖想跨构建复用，用 BuildKit 的 cache mount：`RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install`——缓存目录不进镜像，只在构建期存在。

## 3. 构建上下文与 .dockerignore

`docker build .` 里的 `.` 不是「Dockerfile 所在目录」，而是**构建上下文**：daemon 只能看到这份上下文里的文件。上下文越大传输越慢；更糟的是 `COPY . .` 会把本地 `node_modules` 一起烤进镜像——宿主机上编译的原生模块换架构直接段错误。

`.dockerignore` 是必写项，语法同 `.gitignore`：

```text
node_modules
.git
.next
dist
.env
.env.*
!.env.example
Dockerfile
.dockerignore
```

`.env` 一定要排除，哪怕当前没写 `COPY . .`，也别给以后留后门。验证方式是看构建输出里那行 `transferring context: 1.2MB`，排除前通常是几十上百 MB。

## 4. 多阶段 Dockerfile：pnpm + Node 服务

```dockerfile
# syntax=docker/dockerfile:1.7
FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# 构建层：先拷清单装依赖（这一层吃缓存），再拷源码编译
FROM base AS builder
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# 生产依赖：devDependencies 不进最终镜像
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --prod

# 运行层：只有产物、生产依赖和清单
FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server.js"]
```

- **`corepack enable` 配合 `package.json` 的 `packageManager` 字段**：pnpm 版本跟仓库走，不在 Dockerfile 里硬编码。
- **`--prod` 单独装一次**：`node_modules` 里混着 `typescript`、`eslint` 时凭空多几百 MB；多跑一次的代价在缓存命中后只有几秒。
- **`USER node`**：`node` 镜像自带 uid 1000 用户，复制进去的文件全局可读够用了；真要写目录，用 `COPY --chown=node:node`。
- **`CMD ["node", ...]` 而不是 `npm start`**：npm 会多套一层进程，PID 1 变成 npm，`docker stop` 的 SIGTERM 发给它、不保证转发，10 秒后 SIGKILL（退出码 137），优雅关停全废。而且 Node 默认不处理 SIGTERM，想让关连接、跑迁移真的生效，代码里加 `process.on('SIGTERM')`，或给容器加 `--init`。

## 5. CMD vs ENTRYPOINT：exec form 与 shell form

| | `CMD` | `ENTRYPOINT` |
| :-- | :-- | :-- |
| 定位 | 默认命令，整条可被替换 | 固定入口，`run` 后的参数追加 |
| exec form | `CMD ["node","dist/server.js"]`，node 就是 PID 1 | 同理，信号直达应用 |
| shell form | `CMD node dist/server.js`，实际跑 `/bin/sh -c`，sh 抢了 PID 1 | 同理，SIGTERM 到不了 node |
| 覆盖 | `docker run img sh` | `docker run --entrypoint sh img` |

**exec form 是默认选择**，shell form 只在需要变量展开、管道时才用。入口固定、参数可换就组合：

```dockerfile
ENTRYPOINT ["node", "dist/server.js"]
CMD ["--port", "3000"]          # 只提供默认参数
```

## 6. ARG vs ENV，以及「ARG 会留在历史里」

```dockerfile
ARG NODE_MAJOR=22                    # 构建期变量，FROM 之前也能用
FROM node:${NODE_MAJOR}-bookworm-slim

ARG NPM_TOKEN                        # ⚠️ 在 RUN 里展开就写进层元数据
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > /root/.npmrc \
 && pnpm install --frozen-lockfile && rm -f /root/.npmrc

ENV NODE_ENV=production              # 构建期+运行期都在，docker inspect 可见
```

`rm` 删掉的是文件，删不掉这条 `RUN` 的**命令字符串**：`docker history --no-trunc` 里能看到 `RUN |1 NPM_TOKEN=<真值> ...`。正确做法是 BuildKit secret，值不落层——`RUN --mount=type=secret,id=npmrc,target=/root/.npmrc pnpm install`，构建时 `docker build --secret id=npmrc,src="$HOME/.npmrc" .`。

## 7. 体积与基础镜像

```bash
docker image ls myapp                    # 顶层大小，不含共享的基础层
docker history --no-trunc myapp:1.0      # 逐层看，哪条指令胖一眼就知道
docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock \
  wagoodman/dive:latest myapp:1.0        # 看每层新增与浪费，--ci 可让超标构建失败
```

体积之外，选哪个基础镜像决定了层数、攻击面和排障成本：

| 基础镜像 | 体积量级 | 代价 | 适合 |
| :-- | :-- | :-- | :-- |
| `alpine` | ~50MB | musl libc，原生模块常要自己编 | 纯 JS、体积敏感、依赖干净 |
| `bookworm-slim` | ~75MB | 比 alpine 大几十 MB | **默认选择**，`sharp`/`bcrypt` 省心 |
| `distroless` | ~110MB+ | 没有 shell、没有包管理器 | 生产环境，攻击面最小 |
| `scratch` | 0 | 无 libc、无 CA 证书 | Go/Rust 静态二进制 |

我踩过 alpine 的坑：`sharp` 的预编译包按 glibc 选，装不上只能从头编译，构建从 40 秒变 6 分钟。现在的策略是 **slim 起步，确认体积痛点再换 alpine**；distroless 则要接受「出问题没有 shell」的排障成本（[阶段七](/blog/posts/docker-roadmap-07-troubleshooting/) 讲怎么进去）。另外 `dive` 挂了 `docker.sock`，等于把宿主机 root 交出去，别在共用构建机上跑。

## 8. --platform：换台机器就起不来

Mac 上构建、服务器上运行，报 `standard_init_linux.go:228: exec user process caused: exec format error`。原因就是架构不对：Apple Silicon 默认产 `linux/arm64`，服务器是 `amd64`。

```bash
docker build --platform linux/amd64 -t myapp:1.0 .        # 明确目标架构
docker run --platform linux/amd64 --rm myapp:1.0
docker buildx build --platform linux/amd64,linux/arm64 \
  -t registry.example.com/myapp:1.0 --push .              # 多架构必须 --push
```

多架构构建里，非本机架构的 `RUN` 走 QEMU 模拟，慢 3–10 倍；CI 用 amd64 runner 构建 amd64 才快。`--load` 只能装单个平台，多平台必须推到 registry。

---

## 小结

- 顺序是缓存的朋友：`COPY` 清单 → 装依赖 → `COPY` 源码；`.dockerignore` 必须排除 `node_modules` 和 `.env`，顺手看一眼 `transferring context`。
- 多阶段分 builder / runner，运行层只留产物和生产依赖，非 root、`NODE_ENV=production`、`CMD` 直接调 `node`。
- exec form 让应用成为 PID 1；shell form 多一层 `/bin/sh`，`docker stop` 的信号到不了应用。
- `ARG` 在 `RUN` 里展开的命令会留在镜像历史，密钥走 BuildKit secret；alpine 省体积但坑原生依赖，slim 是稳妥默认。

---

## 练习

1. 给现有 Node 项目写一份多阶段 Dockerfile，记录 `docker image ls` 的体积；去掉 `--prod` 那步再构建，对比差多少 MB。
2. 先 `COPY . .` 再 `pnpm install`，改一行源码重建，看命中了哪几层；换成正确顺序再比耗时。
3. 加一个 `ARG DEMO_TOKEN` 并 `RUN echo $DEMO_TOKEN`，用 `--build-arg` 传值构建，用 `docker history --no-trunc` 把它找出来。
4. 在 arm 机器上用 `--platform linux/amd64` 构建，比较耗时和 `docker image inspect` 里的 `Architecture`。
