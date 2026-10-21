---
title: '08 · 容器安全与镜像瘦身'
published: 2026-10-20T17:00:00+08:00
description: '安全不是加个 --privileged 就完事：非 root、只读根文件系统、能力裁剪、secrets 的正确位置、trivy 扫描与一份能落地的镜像瘦身清单。'
tags: [Docker, 安全, 镜像优化]
category: Docker学习路线
draft: false
---

> [!NOTE]
> 我把 `docker run --privileged` 当成「跑不起来时的最后一招」用了半年，直到有人问我：这条命令等于给了容器多大权限？答案是**几乎等于宿主机 root**。这一篇是我补上的另一半：用最少的权限把服务跑起来，同时不让镜像胖到没法维护。

---

## 1. 威胁模型：先想清楚在防谁

安全加固不是为了通过某个检查表，是因为下面四条各有具体后果：

| 威胁 | 怎么发生 | 后果 |
| :-- | :-- | :-- |
| 镜像供应链 | 拉到被投毒的基础镜像或某个版本依赖 | 你的容器天生就带着后门，扫描也未必查得出 |
| 容器逃逸 | `--privileged`、挂载 `/var/lib/docker`、危险 capability | 容器里的进程拿到宿主机 root，整机沦陷 |
| 密钥泄露 | 密码写进 `ENV`/`ARG`/镜像层 | 镜像推到仓库后，任何能 pull 的人都拿到了 |
| 资源耗尽 | 没有内存/CPU 上限，日志无限增长 | 一个容器把整机拖死，其他服务陪葬 |

前三项是「别让它发生」，最后一项是「发生了也别全死」。下面按这个顺序来。

## 2. 非 root：`USER` 与文件属主

容器默认以 root 跑。容器里的 root 在宿主机上也是 root（除非开了 user namespace 映射），所以第一件事是换人：

```dockerfile
FROM node:22-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S -G app app \
 && mkdir -p /app/data && chown -R app:app /app

COPY --chown=app:app package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --prod
COPY --chown=app:app . .

USER app
CMD ["node", "dist/main.js"]
```

`--chown` 与先建用户这两步不能省：`chown` 必须排在 `USER` 之前，和 `mkdir` 写进同一条 `RUN` 还能少一层。三个必踩的坑：

- `COPY` 不加 `--chown`，文件属主是 root，`USER app` 之后应用写不进去。
- 数据目录在构建期建好并 `chown`；运行时挂进来的卷属主由宿主机决定，需要 `chown 1000:1000` 预置。
- 端口别用 80/1024 以下——非 root 绑不了，要么改高位端口，要么在宿主机的 nginx 上做映射（06 篇就是这么做的）。

## 3. 只读根文件系统 + tmpfs 给 /tmp

大部分服务运行时根本不需要写自己的根文件系统。把它设成只读，等于把「攻击者落地 webshell」这条路堵掉：

```yaml
services:
  web:
    image: ghcr.io/example/web:1.4.2
    read_only: true
    tmpfs:
      - /tmp:size=64m,mode=1777
      - /run:size=8m
    volumes:
      - uploads:/app/uploads      # 真要写的目录单独挂可写卷
```

跑起来如果报 `EROFS: read-only file system`，说明应用在写某个路径——不是把 `read_only` 关掉，而是把那个路径挂成 `tmpfs` 或命名卷。常见的有：`/tmp`、`/app/.cache`、nginx 的 `/var/cache/nginx` 和 `/var/run`。

## 4. 能力裁剪与 no-new-privileges

Linux 给 root 拆了 40 多个 capability。默认容器拿到的是「删减版 root」，但仍有十几个用不上的，全部丢掉再按需加回：

```yaml
services:
  web:
    cap_drop: [ALL]
    # cap_add: [NET_BIND_SERVICE]   # 只有需要绑 80 端口时才加回来
    security_opt:
      - no-new-privileges:true      # 禁止 setuid 提权
    user: "1000:1000"
```

`no-new-privileges` 拦的是「进程通过 setuid 二进制或 `sudo` 拿到更多权限」。绝大多数应用不需要它，加上的成本是零。`cap_drop: ALL` 之后如果服务起不来，看日志里缺哪个能力再加一个，别一把 `--privileged` 了事。

## 5. secrets：三种错误用法，三条正路

**错误一：写进 ENV。** `ENV DB_PASSWORD=xxx` 之后，`docker inspect`、`docker exec env`、compose 的 `environment` 全都能看到明文。

**错误二：写进 ARG。** 很多人以为 `ARG` 不进镜像。实际上 `docker history --no-trunc <image> | grep -i pass` 就能把构建参数捞出来，构建缓存也会留下它。

**错误三：`COPY` 进镜像层。** 哪怕下一层 `RUN rm` 掉了，文件仍在上一层里，`docker save` 出来就能翻到。

三条正路，边界不一样：

| 做法 | 适用 | 边界 |
| :-- | :-- | :-- |
| 运行时环境变量（`env_file` / 编排平台注入） | 一般配置、非高敏 | 仍能被 `inspect` 看到，只是不进镜像 |
| `docker secret` / Swarm secret | 单机小规模、需要落成文件 | 只在 Swarm 模式可用；本质还是文件挂载 |
| 外部 secret manager（Vault、云厂商 KMS、CI 的 secret） | 多环境、要审计与轮换 | 多一层依赖，启动时要能拉到 |

我现在的默认选择：**CI 里用平台 secret 构建，运行时用 `env_file` 注入，高敏的（数据库密码、签名密钥）走外部 manager 或 secret 文件**。判断标准很简单——这个值泄露了，能不能只靠改配置止损。

## 6. 镜像扫描与固定 digest

扫描放 CI 里，别等到上线才查：

```bash
docker run --rm aquasec/trivy image --image-src remote \
  --severity HIGH,CRITICAL --exit-code 1 ghcr.io/example/web:1.4.2
```

`--exit-code 1` 让高危漏洞直接失败，否则报告永远没人看；`--image-src remote` 让它直接读远端镜像，**不用挂 docker.sock**（第 7 节说过的那个坑）。部署侧同理：tag 会被覆盖，digest 不会——`docker pull ghcr.io/example/web@sha256:<digest>`，compose 里也写 digest，注释保留可读的 tag。我的做法是「tag 给人看，digest 给机器用」，回滚就是把 digest 换回上一个。

## 7. 基础镜像的更新策略

固定 digest 的代价是**永远不更新**，漏洞也跟着固定。节奏我按风险分三档：

- **patch 版本**（`node:22.11.0-alpine` → `22.11.1`）：每月批量重建一次，CI 跑扫描，过了就换 digest。
- **minor 版本**：跟着项目迭代走，别单独开窗口。
- **EOL 镜像**：`node:16`、`debian:buster` 这类，扫描报告会长期挂着高危且无解，必须在排期里换掉。

另外两条硬规矩：**不要挂 `docker.sock`**（挂进去等于把宿主机 root 交出去，容器里的进程能起任意特权容器），**镜像里不要带 `curl | sh` 式的安装脚本**——构建时能跑通，但没人知道它装了什么版本。

## 8. 资源限制是 DoS 的兜底

```yaml
services:
  web:
    deploy:
      resources:
        limits: {cpus: "1.0", memory: 512M}
        reservations: {memory: 128M}
```

没有 `memory` 上限时，一个内存泄漏的容器会被内核 OOM killer 挑中——**被杀的可能是你的数据库**。设了上限，死的是它自己，`ExitCode=137` 且 `OOMKilled=true`（[07 篇](/blog/posts/docker-roadmap-07-troubleshooting/) 讲过怎么确认）。

另一类耗尽更隐蔽：磁盘。日志几周就能把盘写满。除了 06 篇的 json-file 轮转，还要在应用层脱敏：请求头里的 `authorization`、`cookie`，body 里的手机号、身份证号、密码字段，进日志前就替换掉。日志是**最容易被复制粘贴出去**的资产。

## 9. 瘦身清单

先看体积再动手：`docker image ls` 看总量，`dive ghcr.io/example/web:1.4.2` 看每一层多出来什么。然后按收益排序：

- **多阶段构建**：devDependencies、源码、构建缓存都留在 builder 阶段，运行阶段只带产物。这一步通常砍掉一半以上。
- **`apk add --no-cache`**：alpine 默认把包索引留在 `/var/cache/apk`，`--no-cache` 连索引都不写盘。
- **清包管理器缓存**：`npm`/`pnpm` 用 `--prod` + `pnpm store prune`；`pip install --no-cache-dir`。放在**同一条 `RUN`** 里，分开写等于白清（层还在）。
- **`.dockerignore`**：`node_modules`、`.git`、`dist`、`*.log`、测试数据不进构建上下文，镜像和构建速度一起受益。
- **distroless / scratch**：没有 shell、没有包管理器，攻击面最小，体积也最小。

一个实测的量级：同一个 Node 服务，`node:22` 全量约 1.1GB，多阶段 + alpine 约 180MB，多阶段 + distroless 约 120MB——但最后这 60MB 换来的代价见下一节。

## 10. 瘦身不能牺牲可排障性

这是我踩得最实的一课。为了极致瘦身换成 scratch 之后，线上 502，我既进不去也没法 `exec`，最后靠 `docker cp` 把日志文件捞出来才定位到问题。

所以取舍标准是：**排障通道要能覆盖你最常遇到的故障**。

- 保留 `distroless`，但把 `docker debug` / 共享命名空间的 netshoot 容器写进运维手册（07 篇第 5 节）。
- 镜像里保留一个健康检查用的二进制，或者直接用应用自己的 `/healthz`，不要依赖 `curl`。
- 启动日志一定要打到 stdout：没有 shell 的镜像里，`docker logs` 是唯一稳定的观测入口。

一句话：**瘦身砍的是构建期残留，不是运行期的可观测性**。

---

## 小结

- 四类威胁分开防：供应链（扫描 + digest）、逃逸（cap_drop + 不挂 sock）、密钥（不进镜像层）、耗尽（资源上限）。
- `USER` 换人之后，`COPY --chown` 和目录属主要一起改，否则第一批报错就是 `EACCES`。
- `read_only: true` + `tmpfs: /tmp` 是成本最低的一条加固，报 `EROFS` 时挂卷而不是关开关。
- secrets 的判断标准：**这个值泄露了能不能只靠改配置止损**；`ENV`/`ARG`/`COPY` 三条路都会留痕。
- 瘦身砍构建期残留，保留排障通道——没有 shell 的镜像必须配好 `docker debug` 这条路。

---

## 练习

1. 把一个现有 Dockerfile 改成非 root：加 `USER`、`COPY --chown`，跑起来后用 `docker exec <c> id` 确认 uid 不是 0。
2. 给同一个服务加 `read_only: true`，根据报错逐个补 `tmpfs`/卷，记录一共补了几个路径。
3. 用 `docker history --no-trunc` 检查一个公开镜像有没有把 `ARG` 里的敏感值留在历史里，写出你的结论。
4. 对同一个镜像跑一次 `trivy image --severity HIGH,CRITICAL`，按第 9 节的清单瘦身之后再跑一次，比较体积与漏洞数量的变化。
