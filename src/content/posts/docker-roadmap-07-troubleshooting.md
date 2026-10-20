---
title: '07 · 排障：容器里到底发生了什么'
published: 2026-10-20T16:00:00+08:00
description: '容器起不来或访问不了时，一套固定的排障顺序：ps -a、logs、inspect、exec、stats/events，加上退出码、无 shell 镜像与磁盘的检查清单。'
tags: [Docker, 排障, 日志]
category: Docker学习路线
draft: false
---

> [!NOTE]
> 我第一次遇到容器起不来，把 `docker run` 的参数改了十几遍，最后发现是镜像里根本没装 `sh`。排障最贵的成本不是解决问题，是在错误的方向上试——这一篇给我的是一套**固定顺序**，每步只回答一个问题。

---

## 1. 先把顺序固定下来

五步，别跳。跳步的典型后果：一上来就 `exec` 进去看，结果容器根本没在跑。

| 步骤 | 命令 | 回答什么问题 |
| :-- | :-- | :-- |
| 1 | `docker ps -a` | 它是**没起来**，还是起来又退出了？（看 STATUS 与退出码） |
| 2 | `docker logs` | 进程自己说了什么？（应用层错误） |
| 3 | `docker inspect` | 平台层配置对不对？（状态、挂载、网络、环境变量） |
| 4 | `docker exec` | 容器里的**现场**是什么样？（进程、监听、文件） |
| 5 | `docker stats` / `events` | 是资源问题还是调度问题？（内存、重启历史） |

`docker events --filter container=web --since 30m` 给出 `die`、`restart`、`oom` 的**时间点**，用来对齐「几点开始 502」这类问题。

## 2. 日志：先看该看的那一段

`docker logs` 默认把容器从生到死的输出全吐出来，几百行里找一行报错纯属自虐。三个参数够用：

```bash
docker logs --tail 100 web                    # 只看最后 100 行
docker logs --since 15m -f web                # 最近 15 分钟，并持续跟踪
docker logs -t --tail 50 web                  # -t 每行带时间戳，和 nginx 日志对齐
```

宿主机侧的报错一眼能分出是端口还是应用：`Bind for 0.0.0.0:8080 failed: port is already allocated.` 前提是 `docker logs` 只看得到 **PID 1 的 stdout/stderr**——应用把日志写进 `/app/logs/app.log`，`docker logs` 永远为空，不是日志丢了，是它没走标准输出。

## 3. inspect：一次把四块信息拿全

`docker inspect` 输出几十 KB 的 JSON，直接翻会淹死。我固定抽这四块：

```bash
docker inspect web | jq '.[0] | {
  status: .State.Status, exit: .State.ExitCode,
  oom: .State.OOMKilled, health: .State.Health.Status,
  mounts: [.Mounts[] | "\(.Source) -> \(.Destination) rw=\(.RW)"],
  nets: (.NetworkSettings.Networks | keys),
  env: [.Config.Env[] | select(test("^(NODE_ENV|TZ|LOG_LEVEL)="))]
}'
```

| 字段 | 看什么 | 典型信号 |
| :-- | :-- | :-- |
| `State.Status` | running / exited / restarting / created | `created` 说明从没跑起来过，命令有问题 |
| `State.ExitCode` + `OOMKilled` | 退出码、是否被 OOM 杀 | 137 且 `OOMKilled=true` → 内存超限，不是代码 bug |
| `State.Health` | healthy / unhealthy / starting | unhealthy 但端口通 → 检查命令本身有问题 |
| `Mounts` | Source / Destination / RW | 宿主机空目录盖掉了镜像里的 `/app/config` |
| `NetworkSettings` | Networks / IPAddress / Ports | 不在同一网络 → 服务名解析不到 |
| `Config.Env` | 环境变量 | 名字拼错，或被 compose 的 `environment` 覆盖 |

没有 `jq` 时用 template 也够：`docker inspect --format '{{.State.Status}} {{.State.ExitCode}} {{.State.OOMKilled}}' web`。`Config.Env` 里可能有数据库密码，贴工单前先脱敏。

## 4. 退出码是现场留下的口供

`docker ps -a` 的 STATUS 列写着 `Exited (137)`，137 不是随机数，是 `128 + 信号编号`：

| 退出码 | 含义 | 我见过的原因 |
| :--: | :-- | :-- |
| 0 | 正常退出 | 启动命令是 `npm run build` 这种一次性任务；或 CMD 写成了 `node --version` |
| 1 | 应用自己报错 | 未捕获异常、缺环境变量、连不上数据库 |
| 137 | 128+9，SIGKILL | `OOMKilled=true`；或 `docker stop` 等 10 秒没停住被强杀 |
| 143 | 128+15，SIGTERM | `docker stop` 的正常停止——这是**健康**的退出，别去查 bug |
| 139 | 128+11，SIGSEGV | 原生模块崩溃；arm64 机器上跑了 amd64 编译的二进制 |

137 有两个来源必须分开：`docker inspect --format '{{.State.OOMKilled}}' web` 为 `true` 是内存超限，`false` 是停超时被强杀。判错方向会去改代码，实际该改的是 `--memory` 或 `stop_grace_period`。

## 5. 没有 shell 的镜像怎么进

`docker exec -it web sh` 报 `exec: "sh": executable file not found in $PATH`，不是容器坏了，是镜像里真的没有 `sh`（distroless、scratch、静态编译的 Go 镜像都这样）。四条路，从轻到重：

```bash
docker top web                                          # ① 不需要 shell：看进程
docker inspect --format '{{.Path}} {{json .Args}}' web  # ① 实际执行的命令
docker debug web                                        # ② 带工具箱的临时容器
docker cp web:/app/bin/server ./server                   # ③ 把二进制/文件拷出来
docker export web | tar -t | head -50                   # ③ 列出整个文件系统
docker run --rm -it --pid=container:web --network=container:web \
  --cap-add SYS_PTRACE nicolaka/netshoot                # ④ 不依赖 docker debug
```

`docker debug` 需要 Docker Desktop 4.27+，服务器上只有 Engine 时用 ④。`--pid=container:` 让调试容器看到目标的进程，`--network=container:` 让它共享目标网络栈——所以里面 `curl 127.0.0.1:3000` 打到的就是目标。

## 6. 「容器起不来」检查清单

按顺序过，八成的「起不来」在第一条就结束：

| # | 检查 | 症状 / 定位方式 |
| :--: | :-- | :-- |
| 1 | 命令写错 | logs 里 `executable file not found`、`no such file or directory`；用 `{{.Path}}` 对一下 |
| 2 | 端口占用 | `port is already allocated`；`ss -ltnp \| grep 8080` 找占用者，或者换映射 |
| 3 | 依赖没起来 | `ECONNREFUSED 172.18.0.2:3306`；`depends_on` 只保证启动顺序，**不保证对方能服务** |
| 4 | 权限 | `EACCES: permission denied, open '/app/data/x.db'`；非 root 容器 + 宿主机目录属主是 root |
| 5 | 配置路径 | bind mount 把 `/app/config` 整个盖掉，容器里看到的是宿主机空目录 |
| 6 | 架构不匹配 | `exec /usr/local/bin/node: exec format error` |

第 6 条我踩得最冤：M 系列 Mac 上构建、推到 amd64 服务器跑，报错毫无征兆。`docker version` 里 Server 的 `Arch` 和镜像的 `Architecture` 对不上就是它，解法是构建时 `--platform linux/amd64`。

## 7. 「容器活着但访问不了」检查清单

`docker ps` 显示 `Up 3 minutes`，浏览器一直转圈。按四层排：

```bash
docker exec web ss -ltnp     # 镜像里没有 ss 就用第 5 节的 netshoot 容器看
# LISTEN 0 511 127.0.0.1:3000 0.0.0.0:*   ← 只监听回环，端口映射进不来
# LISTEN 0 511 0.0.0.0:3000   0.0.0.0:*   ← 正确
```

1. **监听地址**：容器里的 `127.0.0.1` 是容器自己的回环，`-p 8080:3000` 的流量从 `eth0` 进来，打不到它。改应用监听 `0.0.0.0`（Next：`HOSTNAME=0.0.0.0`；Vite：`--host`）。
2. **端口映射**：`-p 8080:3000` 是**宿主机:容器**，写反了不报错，只是连不上。
3. **防火墙 / 安全组**：先分方向——`curl 127.0.0.1:8080` 通、公网不通报的是防火墙或云安全组；两边都不通则回到第 1、2 条。
4. **健康检查**：`(unhealthy)` 不影响端口连通性，但会让 compose 的 `depends_on: service_healthy` 一直卡住。`docker inspect --format '{{json .State.Health}}' web | jq .Log` 里最近几次输出直接给答案：命令在镜像里不存在（distroless 没有 `curl`/`wget`，输出就是 `sh: not found`，改用应用自己的健康端点）、`start_period` 比冷启动短、检查地址写错。注意 **unhealthy 只是状态，Docker 不会因此重启容器**，要自动拉起得靠编排层。

## 8. DNS 解析失败：自定义网络才有服务名

症状很固定：`getaddrinfo EAI_AGAIN db` 或 `ENOTFOUND db`。两个前提：在同一个自定义网络上（默认 `bridge` 网络**没有内嵌 DNS**，容器之间只能靠 IP，`docker network create app_net` 之后才按服务名解析）；容器的 `/etc/resolv.conf` 指向 `127.0.0.11`（Docker 内嵌 DNS，在容器里改、或只改宿主机的 `/etc/resolv.conf` 都不生效）。

```bash
docker exec web cat /etc/resolv.conf       # nameserver 127.0.0.11
docker exec web getent hosts db            # 最直接的验证，比 nslookup 靠谱
docker network inspect app_net --format '{{range .Containers}}{{.Name}} {{end}}'
```

解析不了时先确认两边在同一网络，再确认服务名——compose 里的解析名是 **service 名**，`container_name` 不是。宿主机要指定上游 DNS，得写进 `daemon.json` 的 `dns` 并重启 Docker。

## 9. 磁盘被镜像和日志吃满

容器里报 `no space left on device`，先别删文件——很可能是宿主机的 `/var/lib/docker` 满了：

```bash
docker system df          # 镜像/容器/卷/构建缓存各占多少、能回收多少
docker system df -v       # 细到单个镜像和卷，找出那个 8GB 的
du -sh /var/lib/docker/containers/*/*-json.log | sort -h | tail -5
```

三种吃法，对应三种正确姿势：

- **容器日志**：json-file 默认不轮转。`docker inspect --format '{{.LogPath}}' web` 找到文件；长期做法是 daemon.json 加 `log-opts` 的 `max-size: "10m"` 与 `max-file: "3"`（[06 篇](/blog/posts/docker-roadmap-06-production-deploy/) 配过 compose 版）。
- **旧镜像**：`docker image prune` 只删 dangling 的 `<none>`，安全；`docker image prune -a` 删所有没被容器引用的镜像，会把留着回滚的部署 tag 一起清掉。
- **构建缓存**：`docker builder prune`，用 buildx 的项目一次能回收好几个 G。

`docker system prune -a --volumes` 请当成 `rm -rf` 看待：它连**卷**一起删，而数据库数据就在卷里。真要用，先 `docker system df` 记数、`docker volume ls` 确认没有要留的，再考虑加 `--filter "until=168h"` 限定时间窗。

## 10. 用 nsenter 站到宿主机上看

容器里没有 `ss`、`iptables`、`tcpdump` 时，硬装工具是下策——起一个带工具的容器进入宿主机命名空间：

```bash
docker run --rm -it --privileged --pid=host nicolaka/netshoot \
  nsenter -t 1 -n -m -u -i -p -- sh
ss -ltnp | grep 8080                        # 宿主机上谁在监听
iptables -t nat -L DOCKER -n | head -20     # 端口映射有没有写进 NAT
# 反方向：从宿主机进容器的网络命名空间
sudo nsenter -t "$(docker inspect -f '{{.State.Pid}}' web)" -n ss -ltnp
```

`--privileged --pid=host` 等于拿到了宿主机 root 权限，只在自己的机器上临时用，查完立刻退出。

---

## 小结

- 顺序固定：`ps -a` → `logs` → `inspect` → `exec` → `stats`/`events`，每步只回答一个问题，答完再走。
- 退出码 137 先查 `OOMKilled`，143 是正常停止；`128+信号号` 是通式，别背孤立数字。
- 没有 shell 的镜像用 `docker debug`、共享命名空间的 netshoot、或 `docker cp`，别为排障往生产镜像里装 `curl`。
- 「起不来」看命令、端口、依赖、权限、路径、架构；「活着访问不了」看监听地址、端口映射、防火墙、健康检查。
- `unhealthy` 不会自动重启；磁盘先看 `docker system df`，`prune -a --volumes` 之前确认卷里的数据不要了。

---

## 练习

1. 跑一个必然 OOM 的容器（别加 `--rm`，否则退出后查不到）：`docker run --memory 64m node:22-alpine node -e "const a=[];while(true)a.push(Buffer.alloc(1e6).fill(1))"`，再用 `docker inspect` 确认 `ExitCode=137` 且 `OOMKilled=true`。
2. 用 distroless 镜像起一个服务，分别用 `docker debug` 和 netshoot 共享命名空间查出它的监听端口，比较两条路的代价。
3. 故意制造两个故障：一个 `port is already allocated`，一个「监听 127.0.0.1 导致映射不可达」。各写一句根因和修复动作。
4. 在自定义网络里起 web + db，用 `getent hosts db` 验证解析；再把 db 挪到默认 bridge，复现失败并记下报错原文。
