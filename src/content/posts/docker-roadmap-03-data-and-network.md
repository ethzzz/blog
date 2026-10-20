---
title: '03 · 数据卷与容器网络'
published: 2026-10-20T12:00:00+08:00
description: '容器删了数据就没了、服务之间解析不到名字——volume 与 bind mount 怎么选、uid 权限坑、卷的备份恢复、自定义网络 DNS、端口发布与健康检查，一篇讲完。'
tags: [Docker, 数据卷, 网络]
category: Docker学习路线
draft: false
---

> [!NOTE]
> 第一次把服务上容器，我在两件事上连栽了两次：数据库容器的数据在 `docker run` 重跑后凭空消失；app 容器里连 `mysql:3306` 报 `Could not resolve host`。前者是卷的问题，后者是网络的问题——这篇把这两类事故一次讲透。

---

## 1. volume / bind mount / tmpfs 怎么选

容器的可写层跟着容器生命周期走：`docker rm` 之后，写进 `/app/data` 的东西一起没。状态必须搬出去，而搬出去有三条路，差异不在「能不能持久化」，而在**谁负责这个目录**。

| 类型 | 写法 | 数据在哪 | 适合 |
| :-- | :-- | :-- | :-- |
| 命名卷 volume | `-v app-data:/data` | Docker 管理的目录（`/var/lib/docker/volumes/...`） | 数据库、上传文件，任何要活过容器的写数据 |
| bind mount | `-v "$PWD/src:/app/src"` | 你自己指定的宿主机路径 | 配置文件、开发时的源码热更新 |
| tmpfs | `--tmpfs /tmp` | 内存，容器停止即消失 | 临时缓存、不该落盘的敏感文件 |

我的判断顺序是**先问这份数据要不要活过容器**：要活过且只有容器读写 → 命名卷；要活过且宿主机上也得能看见、能编辑 → bind mount；不要活过 → tmpfs，顺便避免它在磁盘上留痕。命名卷比 bind mount 快（在 Docker 自己的数据目录里，不用跨挂载点），也更安全——不会因为手抖 `-v /:/host` 就把宿主机根目录交出去。

## 2. 命名卷的创建、查看、删除

```bash
docker volume create app-data
docker volume ls
docker volume inspect app-data        # 看 Mountpoint / Labels
docker run -d --name db -v app-data:/var/lib/mysql mysql:8.4
docker volume rm app-data             # 还被容器引用时会失败
```

被引用时删不掉，报 `Error response from daemon: remove app-data: volume is in use - [4f1c2a9b7d3e]`；正确顺序是先 `docker rm -f db` 再删卷。`docker volume prune` 删的是**所有没被容器引用的卷**，跑之前先 `docker volume ls` 看一眼——里面可能有你上周删容器时留下的数据库。

匿名卷（`-v /var/lib/mysql`，只写容器内路径）由 Docker 随机起名，`docker volume ls -f dangling=true` 能捞出来。我只在临时跑一下时用它，正经服务一律给命名卷。

## 3. uid/gid：非 root 容器写不进去的那一刀

这是我在生产上栽得最惨的一次。Dockerfile 里为了安全加了 `USER node`（uid 1000），本地跑得好好的；上线换成 bind mount 挂宿主机目录，容器一起来就死：

```text
Error: EACCES: permission denied, open '/app/data/cache.json'
```

原因：bind mount 的权限**来自宿主机**。宿主机那个目录是 `root:root 755`，容器里的 uid 1000 既不是 owner 也不在 group 里，写权限就是没有。「本地用 root 跑没事」恰恰是坑的来源——容器里的 root 和宿主机的 root 都是 uid 0。两个解法，按推荐顺序：

1. **换成命名卷**。命名卷首次挂载会把镜像里该目录的属主带过来，所以 `RUN mkdir -p /data && chown node:node /data` 之后挂命名卷，权限就是对的。我最常用这个。
2. **对齐 uid**：`docker run --user "$(id -u):$(id -g)" ...`，容器进程用宿主机的 uid 跑，bind mount 的属主自然对上。代价是镜像里 `USER` 那行白写。

补一句平台差异：Docker Desktop（macOS/Windows）的 bind mount 走文件共享层，权限基本被忽略，**这类 bug 只在 Linux 上暴露**。所以「我 Mac 上好好的」不构成证据。

## 4. 卷的备份与恢复：一条 tar

数据在卷里，`cp` 不进去，得借一个临时容器把卷和宿主机目录同时挂上：

```bash
# 备份：把卷打成 tar 放到当前目录
docker run --rm -v app-data:/data -v "$PWD":/backup alpine \
  tar czf /backup/app-data-$(date +%F).tar.gz -C /data .

# 恢复：清空卷再解包（先备份再恢复）
docker run --rm -v app-data:/data -v "$PWD":/backup alpine \
  sh -c "rm -rf /data/* && tar xzf /backup/app-data-2026-10-20.tar.gz -C /data"
```

两个前提：**先停写**（`docker stop db`），否则 tar 出来可能是撕裂的文件；数据库更稳的是 `mysqldump` 导出成 SQL，tar 只适合兜底。恢复完再跑 `docker run --rm -v app-data:/data alpine ls -la /data` 确认属主没丢——用 root 解包会把文件全变成 root 的。

## 5. `-p` 到底发布了什么

`-p 8080:80` 的完整含义是 `-p 0.0.0.0:8080:80`：宿主机**所有网卡**的 8080 都转发到容器 80。加上地址就是另一种语义：

```bash
docker run -d -p 8080:80 nginx:alpine                 # 公网可达
docker run -d -p 127.0.0.1:8081:80 nginx:alpine       # 只有宿主机本机能访问
```

我在服务器上的规矩是：**只有要接公网的端口写 `0.0.0.0`，其余一律 `127.0.0.1`**。数据库、admin 面板、内部 API 全绑回环，前面再放 nginx 反代——这样即使防火墙配错，端口也不会直接晾在公网上。

另一半坑在容器内部：容器里的 `127.0.0.1` 指的是**容器自己**。`app.listen(3000, '127.0.0.1')` 只有容器内能访问，端口发布等于白配，得写 `app.listen(3000, '0.0.0.0')`。前者的症状很有迷惑性：`docker ps` 显示端口映射正常，宿主机 `curl` 却报 `curl: (56) Recv failure: Connection reset by peer`。另外 `EXPOSE 3000` 只是文档，它和 `-p` 没有任何运行期关系。

## 6. 网络：默认 bridge 不能靠名字解析

```bash
docker network ls
docker run -d --name db -v app-data:/var/lib/mysql mysql:8.4
docker run --rm alpine ping -c1 db
# ping: bad address 'db'
```

默认 `bridge` 网络只有 IP 层面的连通，**没有内建 DNS**：容器只能靠 `172.17.0.x` 互相访问，IP 每次重建都可能变。老教程里的 `--link` 是补丁，已废弃。

自定义 bridge 会装一个内嵌 DNS（进容器看 `/etc/resolv.conf`，nameserver 是 `127.0.0.11`），服务名直接当主机名用：

```bash
docker network create app-net
docker run -d --name db --network app-net -v app-data:/var/lib/mysql mysql:8.4
docker run -d --name api --network app-net -e DB_HOST=db myapp:1.0
docker run --rm --network app-net alpine ping -c1 db     # 这次通了
```

## 7. host、none 与访问宿主机

- `--network host`：容器直接用宿主机网络栈，没有 NAT 也没有 `-p`，容器里的 `127.0.0.1:3306` 就是宿主机的 3306。性能最好，代价是端口全暴露、没法多实例，且只有 Linux 上完整支持。`--network none` 则相反，只有 loopback，适合纯计算、不想碰网络的批处理。
- **反方向：容器访问宿主机**——容器里的 `127.0.0.1` 是自己，别拿它连宿主机服务：

| 场景 | 用什么 |
| :-- | :-- |
| Docker Desktop（macOS / Windows） | `host.docker.internal` 直接可用 |
| Linux（Docker 20.10+） | 加 `--add-host=host.docker.internal:host-gateway`，之后同名可用 |
| 不想加参数 | 用网桥地址：`docker network inspect bridge --format '{{range .IPAM.Config}}{{.Gateway}}{{end}}'` |

平台差异记一句：`host.docker.internal` 在 Docker Desktop 上是白送的，Linux 上必须显式 `--add-host`，不写就是 `Could not resolve host`。

## 8. 配置注入：env-file、挂载配置、密钥不进镜像

```bash
docker run -d --name api \
  --env-file .env.production \
  -e NODE_ENV=production \
  -v "$PWD/config/app.yaml:/app/config/app.yaml:ro" \
  myapp:1.0
```

`--env-file` 按行读 `KEY=VALUE`；`-e` 优先级更高，可以覆盖文件里的同名项。配置文件用 bind mount 加 `:ro` 只读挂进去，改完 `docker restart` 就生效，不用重建镜像。三条红线：

1. **别把 `.env` `COPY` 进镜像**。它在层里删不掉，`docker history` 和拉到镜像的人都能翻出来。`.dockerignore` 里加一行 `.env`。
2. **别把密钥真值写进 `-e` 的历史命令**。命令会留在 shell history 和 `docker inspect` 里，至少改成 `--env-file`。
3. 挂配置文件方向别反，`-v ./nginx.conf:/etc/nginx/nginx.conf` 挂错会报 `Are you trying to mount a directory onto a file (or vice-versa)?`。

## 9. HEALTHCHECK：容器自己说还活着

`docker ps` 里的 `Up` 只代表**主进程没退出**，不代表服务能响应。加个探针：

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 --start-period=20s \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1
```

- `interval`：多久探一次，默认 30s。别设成 1s，那是给自己加负载。
- `timeout`：单次超时，超了算失败。
- `retries`：连续失败几次才标记 `unhealthy`；`start-period` 是启动宽限期，期间的失败不计数（Next/Java 冷启动要十几秒）。

之后 `docker ps` 会显示 `(healthy)`，细节看 `docker inspect --format '{{json .State.Health}}' api`。两个要点：**unhealthy 不会自动重启容器**，它只写状态，由外部决定怎么办；探针依赖镜像里得有 `wget`/`curl`，distroless 里没有。启动顺序交给下一篇的 [04 · Compose](/blog/posts/docker-roadmap-04-compose/) 处理。

## 10. 资源限制与 restart 策略

```bash
docker run -d --name api \
  --memory 512m --memory-swap 512m \
  --cpus 1.5 \
  --restart unless-stopped \
  myapp:1.0
```

`--memory 512m` 是不含 swap 的硬上限，`--memory-swap` 设成同值等于禁用 swap（否则容器拿 swap 顶着，感觉像没超）。`--cpus 1.5` 是 1.5 核的配额。超内存的表现是进程被内核 OOM kill：`docker ps` 里 exit code 137，`docker inspect --format '{{.State.OOMKilled}}' api` 是 `true`。堆内存大的 Node/Java 服务，这个值要比实测峰值高 30% 左右。

restart 四种值（已运行的容器改策略用 `docker update --restart=...`，不用重建）：

| 值 | 行为 |
| :-- | :-- |
| `no` | 默认，不重启 |
| `on-failure[:max]` | 非 0 退出才重启，可限次数，适合一次性任务 |
| `always` | 退出就重启，daemon 重启后也会被拉起 |
| `unless-stopped` | 同上，但你手动 `docker stop` 过的不会再被拉起。线上我一律用这个：它区分「崩了要拉回来」和「我是故意停的」 |

---

## 小结

- 数据要活过容器就进卷：长期写数据用命名卷，要在宿主机上编辑的用 bind mount，不落盘的用 tmpfs。
- 卷的属主由镜像首次挂载时决定，bind mount 的属主由宿主机决定——非 root 容器写不进去，多半是 bind mount 的锅。
- 备份恢复就是「把卷和一个宿主机目录同时挂进临时容器」，tar 之前先停写。
- 默认 bridge 没有 DNS，自定义 bridge 才有；服务名当主机名，是 Compose 的地基。
- `-p 127.0.0.1:8080:80` 和 `-p 8080:80` 是两种暴露面，内部服务一律绑回环。
- 健康检查看「能不能响应」，restart 策略管「崩了拉不拉」，两者不是一回事。

---

## 练习

1. 起一个 MySQL 容器挂命名卷，`docker rm -f` 后用同一个卷起新容器，确认数据还在。
2. 用一个 `USER node` 的镜像挂 `root:root` 的宿主机目录，复现 `EACCES`，再分别用命名卷和 `--user "$(id -u):$(id -g)"` 修掉。
3. 建一个自定义网络，起两个 alpine 容器验证 `ping 名字` 能通；换回默认 bridge 再试，记录报错。
4. 给上一篇的镜像加 `HEALTHCHECK`，让 `/health` 故意返回 500，观察 `docker ps` 多久变 `(unhealthy)`，并确认容器没被重启。
