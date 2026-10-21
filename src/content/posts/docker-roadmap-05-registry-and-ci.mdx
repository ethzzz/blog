---
title: '05 · 镜像仓库与 CI 构建'
published: 2026-10-20T14:00:00+08:00
description: '从镜像命名、tag 策略到私有仓库取舍、GitHub Actions 多架构构建、按 digest 部署与密钥隔离，把本地镜像变成可回滚的交付版本。'
tags: [Docker, CI/CD, 镜像仓库]
category: Docker学习路线
draft: false
---

> [!NOTE]
> 我第一次配 CI 时「成功」得很顺利：镜像推上去，服务器拉 `latest` 跑起来就是新版本。三天后要回滚，才发现 `latest` 早被覆盖，上一个版本只存在那台已经销毁的构建机上。这一篇讲怎么让每次构建都留下一个回得去的坐标，以及构建本身该长什么样。

---

## 1. 镜像的完整名字

`docker build -t my-app .` 之后直接 `docker push my-app`，撞上的是这个——不是你忘了登录，是名字被补全成了 `docker.io/library/my-app`：

```text
The push refers to repository [docker.io/library/my-app]
denied: requested access to the resource is denied
```

`library` 是 Docker 官方保留的命名空间，所以普通账号推不进去。镜像名其实是四段 `registry/namespace/repository:tag`：

| 段 | 省略时默认 | 说明 |
| :-- | :-- | :-- |
| registry | `docker.io` | 仓库服务地址；GHCR 是 `ghcr.io`，ACR 是 `<名称>.azurecr.io` |
| namespace | `library` 或账号名 | 官方镜像在 `library`，个人和组织在账号名下 |
| repository:tag | 无默认 / `latest` | 镜像名必须写，tag 不写就等于 `latest` |

## 2. tag 策略：语义化版本 + git sha

流水线每次必推两个 tag：语义化版本（`1.4.2`，和发布说明对得上）和 git sha 前缀（`sha-a1b2c3d`，精确定位某次提交、唯一且不会被覆盖）。`latest` 只留给「给我最新版」的演示。

`latest` 不能用来回滚，原因很朴素：**它是个会被覆盖的指针，不是版本**——永远指向最后一次 push 的镜像，你回滚时它已经指向新版。比 tag 更硬的是 digest：tag 是可变标记，digest 是内容哈希，同一个 digest 永远是同一份字节。

```bash
# 构建完把 digest 打出来，写进发布记录
docker buildx imagetools inspect ghcr.io/your-name/notelab-c:1.4.2 \
  --format '{{json .Manifest}}' | jq -r '.digest'

# 部署时用 digest，比 tag 更确定
docker pull ghcr.io/your-name/notelab-c@sha256:9f2ce0d1e41
```

## 3. login / tag / push / pull

```bash
# 密码走 stdin，不要写进命令行（会留在 shell history 和进程列表里）
echo "$CR_PAT" | docker login ghcr.io -u your-name --password-stdin
# 构建后给本地镜像挂上完整名字，一个镜像可以有多个 tag
docker build -t notelab-c:local .
docker tag notelab-c:local ghcr.io/your-name/notelab-c:1.4.2
docker tag notelab-c:local ghcr.io/your-name/notelab-c:sha-a1b2c3d
# 推两个 tag，层只传一次（按 digest 去重）
docker push ghcr.io/your-name/notelab-c:1.4.2
docker push ghcr.io/your-name/notelab-c:sha-a1b2c3d
# 换台机器拉指定版本，而不是 latest
docker pull ghcr.io/your-name/notelab-c:1.4.2
docker run -d --name web -p 3010:3000 ghcr.io/your-name/notelab-c:1.4.2
```

GHCR 要 `write:packages` 的 Personal Access Token，ACR 用登录令牌。用账号密码既不可撤销，也不该出现在任何日志里。

## 4. 私有仓库：自建 registry 还是云厂商

| 维度 | 自建 `registry:2` | 云厂商（ACR / GHCR / ECR） |
| :-- | :-- | :-- |
| 起步 | 一条 compose 起个容器 | 开个命名空间就能推 |
| TLS 与权限 | 自己配证书，权限靠前置 nginx + basic auth | 开箱带证书，命名空间级读写与拉取令牌 |
| 存储与成本 | 自己管磁盘，满了 push 就失败 | 按量计费，通常有免费额度，不用清旧 layer |

我的取舍：**CI 在公网跑就用云厂商私有仓库，纯内网才自建**。自建最容易被低估的成本不是部署，是磁盘清理——`registry` 不会自动删旧 layer，几个月后 `/var/lib/docker` 就撑爆。

## 5. Docker Hub 限流

匿名拉 Docker Hub 有按 IP 的配额，CI 上偶尔会红，报错是 `toomanyrequests: You have reached your pull rate limit.`。三条应对，按推荐顺序：① 基础镜像也镜像一份进自己的仓库，CI 只认私有仓库；② CI 里先 `docker login docker.io`，认证用户配额高得多，只读 token 就够；③ 换镜像来源（`mcr.microsoft.com`、`public.ecr.aws`），它们没有这套匿名配额。注意 ② 只解决额度，不解决「你依赖的基础镜像哪天悄悄变了」——基础镜像同样要固定版本，必要时固定 digest。

## 6. GitHub Actions：buildx 多架构构建

开发机是 arm64、服务器是 amd64，只构建一种，另一边就是 `exec format error`。`buildx` + QEMU 一次产出两个架构，合成 manifest list，拉取时 registry 按客户端架构分发：

```yaml
name: release
on: {push: {tags: ['v*']}}
jobs:
  image:
    runs-on: ubuntu-latest
    permissions: {contents: read, packages: write}
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-qemu-action@v3
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with: {registry: ghcr.io, username: "${{ github.actor }}", password: "${{ secrets.GITHUB_TOKEN }}"}
      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=semver,pattern={{version}}
            type=sha,prefix=sha-,format=short
      - uses: docker/build-push-action@v6
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

- `setup-qemu-action` 是 arm64 能在 x86 runner 上构建的前提，`RUN` 靠 QEMU 模拟；
- `metadata-action` 从 git tag 推导镜像 tag：推 `v1.4.2` 自动得到 `1.4.2` 和 `sha-a1b2c3d`，不用自己拼字符串；
- `type=gha` 把层缓存存进 Actions 缓存服务，`mode=max` 连中间层一起存——默认只存最终层，多阶段构建几乎不命中。

> [!WARNING]
> QEMU 模拟 arm64 编译要慢 3–5 倍。如果只是「arm64 也要能跑」而不是「要在 arm64 上编译」，就只在 amd64 构建，arm64 镜像只做 `COPY` 阶段的产物。

## 7. 构建后：扫描与 SBOM

镜像进了仓库，漏洞就跟着版本走，流水线末尾加一步比事后补救便宜：

```yaml
      - uses: aquasecurity/trivy-action@0.28.0
        with:
          image-ref: ghcr.io/${{ github.repository }}:sha-${{ github.sha }}
          severity: HIGH,CRITICAL
          ignore-unfixed: true   # 上游还没补丁的先不阻塞
          exit-code: '1'
```

`ignore-unfixed: true` 是踩出来的：基础镜像里一个没补丁的 libc 漏洞能让构建永久变红，最后全组都学会了点「忽略」。SBOM 与 provenance 一行就能开：在 `build-push-action` 里加 `sbom: true` 和 `provenance: true`，物料清单和构建来源（仓库、提交、runner）会作为 attestation 一起推到 registry，出事时这是唯一能回答「这镜像里到底装了什么」的东西。

## 8. 构建密钥不要进镜像

`ARG NPM_TOKEN` 会写进镜像历史（`docker history` 看得见），`ENV` 更直接，`docker inspect` 就读出来；`RUN rm` 只删当前层，值仍留在上一层的 layer 里。唯一安全的是 `--mount=type=secret`：

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
```

```bash
docker build --secret id=npmrc,src=$HOME/.npmrc -t notelab-c:local .
```

秘密在构建期以文件形式挂进来，不写入任何层，构建结束即消失。两类密钥要分清：**构建期 secret**（npm token、私有 git token）走 `--secret` 或 CI secret，只在 `RUN` 里可见；**运行期 secret**（数据库密码、签名密钥）走服务器 `.env` 或编排层 secret，绝不进镜像。把运行期密钥当 `--build-arg` 传是最常见的错误——密码既进了镜像历史，又进了 CI 日志。

## 9. CI 里缓存层的坑

缓存能让构建从 6 分钟降到 40 秒，但缓存错位会让你发布「上一次的代码」。我遇到过的三次：① 缓存 key 没和 lock 文件绑定，依赖升级了 `install` 层还命中旧缓存；② `COPY . .` 写在 install 前面，改一行源码依赖层就全失效，顺序必须是「COPY lock → 装依赖 → 再 COPY 源码」；③ 基础镜像写 `latest`，镜像更新了 layer 缓存却认为没变。

```bash
# 怀疑缓存脏了：先验证「干净构建能过」，再谈优化
docker buildx build --no-cache --platform linux/amd64 -t notelab-c:clean .
docker buildx prune -af
```

判据很简单：**干净构建和缓存构建行为不一致时，那不是加速，是 bug。**

---

## 小结

- 镜像名是 `registry/namespace/repository:tag`，省略 namespace 会掉进 `library`，push 必被拒。
- 每次构建推「语义化版本 + git sha」两个 tag；部署和回滚只认固定版本或 digest，`latest` 只作演示。
- 私有仓库优先用云厂商，自建只适合内网，且要自己负责磁盘清理。
- 多架构用 buildx + QEMU + `type=gha` 缓存，tag 交给 `metadata-action` 从 git tag 推导。
- 构建期密钥走 `--secret`，运行期密钥走 `.env` 或编排 secret；trivy 只对「有修复版本」的漏洞设门禁。

---

## 练习

1. 给现有镜像打 `1.0.0` 和 `sha-<短 sha>` 两个 tag 推到你的私有仓库，再用 `imagetools inspect` 读出 digest。
2. 依次推 `v0.1.0` 和 `v0.2.0`，看 CI 生成的 tag 列表，然后只用 digest 把 `v0.1.0` 的镜像拉回来。
3. 开启 `platforms: linux/amd64,linux/arm64` 构建一次，对比有 `cache-from` 与 `--no-cache` 两次的耗时。
4. 故意用 `ARG` 传一个假 token，`docker history` 找出它，再改成 `--mount=type=secret` 重建并确认历史里没有了。
