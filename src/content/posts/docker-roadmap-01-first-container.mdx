---
title: '01 · 第一个容器：镜像、容器与生命周期'
published: 2026-10-20T10:00:00+08:00
description: '从 Desktop 与 WSL2 安装讲起，拆开 hello-world 背后的调用链，讲清镜像、容器、仓库的关系与生命周期，并解决端口占用、socket 权限、拉取超时三个坑。'
tags: [Docker, 容器, 命令行]
category: Docker学习路线
draft: false
---

> [!NOTE]
> 我第一次装 Docker 花了两个小时：先卡在 BIOS 没开虚拟化，装完换个终端又报 `permission denied /var/run/docker.sock`。这一篇把「从装好到看懂 `hello-world`」走完，顺手把新手必然撞上的三个报错解决掉。

---

## 1. 安装：Windows 走 Desktop，Linux 走 Engine

- **Windows / macOS**：装 Docker Desktop。它打包了 `docker` CLI、`dockerd` 守护进程，以及一台跑 Linux 的小虚拟机（Windows 上是 WSL2，macOS 是 Virtualization.framework）。GUI 和单节点 K8s 是附赠品，真正干活的是那台 VM 里的 Engine。
- **Linux（服务器）**：只装 Docker Engine，没有 GUI。`docker`（客户端）和 `dockerd`（守护进程）是同一台机器上的两个进程。

Windows 侧的前置步骤（管理员 PowerShell）：

```powershell
wsl --install -d Ubuntu      # 没装 WSL 先装，装完必须重启
wsl --update                 # 内核太老会导致 Desktop 起不来
wsl --status                 # 确认默认版本是 2
```

装完 Desktop 还要在 Settings → Resources → WSL Integration 里打开你的发行版。**这步没开，容器会跑在 Desktop 自己的 VM 里，WSL 终端敲 `docker` 直接 command not found。**

Linux 侧用官方仓库装（比发行版自带的新一个版本）：

```bash
curl -fsSL https://get.docker.com | sudo sh   # 便利脚本，个人机器够用
sudo usermod -aG docker "$USER"               # 免 sudo 提权，重新登录才生效
sudo systemctl enable --now docker
docker version                                # Client 和 Server 两段都要有输出
```

`docker version` 只有 Client 段、`docker info` 报 `Cannot connect to the Docker daemon`——说明守护进程没起，先 `systemctl status docker`，Windows 上则确认 Desktop 正在运行。

## 2. hello-world：一条命令背后的五段旅程

这个镜像只有十几 KB，但它触发的是完整的体检流程：

```text
1. client    docker CLI 解析参数，把 hello-world 补全成
             docker.io/library/hello-world:latest，经 unix socket 发给 daemon
2. daemon    查本地镜像库，没有 → 决定去 registry 拉
3. registry  先拿 token 鉴权，再取 manifest；manifest list 按你的 OS/架构
             挑一条（linux/amd64 或 linux/arm64），然后按 digest 并发下载
             各层，本地已存在的层直接跳过
4. image     层落盘到本地存储（默认 overlay2），拼成一个只读镜像
5. container 镜像层 + 一层可写层 + 一份 config，配上 namespace/cgroup，
             执行入口命令 /hello，打印一段话后退出
```

第一次在干净机器上跑，输出是这样的：

```text
$ docker run hello-world
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
c1ec31eb5944: Pull complete
Digest: sha256:4f1f…
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
```

顺手把三者关系钉死：**镜像**是由层拼成的只读模板，**容器**是镜像加一层可写层的运行实例，**registry** 是存镜像的仓库（类比 npm registry）。上面那串 `c1ec31eb5944` 是层 ID 前缀，不是容器 ID；命令返回后 `docker ps` 看不到容器，`docker ps -a` 里状态是 `Exited (0)`。

## 3. run 的六个参数，够用很久

| 参数 | 作用 | 什么时候必须用 |
| :-- | :-- | :-- |
| `-d` | 后台运行，立刻返回容器 ID | 服务类容器；不加则 Ctrl+C 会把容器一起停掉 |
| `-p 8080:80` | 宿主机端口:容器端口 | 要从外面访问；默认绑 `0.0.0.0`，本机调试写 `127.0.0.1:8080:80` |
| `--name web` | 固定名字 | 后面 `logs`/`exec`/`stop` 都要靠它引用 |
| `-e TZ=Asia/Shanghai` | 注入环境变量 | 配置项；密码类不要写在这里（阶段八讲原因） |
| `--rm` | 退出后自动删除 | 一次性任务、调试用，避免 `ps -a` 堆尸体 |
| `-v $(pwd)/data:/data` | 挂载目录或卷 | 数据要留住的时候（阶段三细讲） |

```bash
docker run -d --name web -p 127.0.0.1:8080:80 -e TZ=Asia/Shanghai nginx:1.27-alpine
curl -I http://127.0.0.1:8080          # 200，nginx 默认页
docker run --rm -it alpine:3.20 sh     # 一次性交互容器，退出即删
```

## 4. 看现场：ps / logs / exec / inspect / stop / rm

```bash
docker ps                    # 只看 running，是最容易误判的一条命令
docker ps -a                 # 含 exited，排查「容器怎么没了」的第一站
docker logs -f --tail 100 web
docker exec -it web sh       # -i 保持 stdin，-t 分配 tty；退出它不影响主进程
docker inspect web --format '{{.State.Status}} exit={{.State.ExitCode}} oom={{.State.OOMKilled}}'
docker stop web              # 先 SIGTERM，10 秒后才 SIGKILL
docker rm web                # 只能删已停止的；-f 强删（会丢可写层）
```

## 5. 生命周期：四个状态与三次误判

| 状态 | 含义 | 触发 |
| :-- | :-- | :-- |
| `created` | 容器已创建，主进程还没起 | `docker create`；`run` 过程中一闪而过 |
| `running` | 主进程在跑 | `ps` 能看到的就是它 |
| `exited` | 主进程结束，**退出码是关键线索** | 命令跑完、崩溃、被 `stop` |
| `dead` | 无法正常清理的残留 | 存储驱动异常、挂载卡死，一般 `rm -f` 或重启 daemon |

1. **`docker ps` 没输出 = 容器没了？** 不，多半是 `exited`。先 `ps -a`。
2. **`-d` 就等于常驻？** 不。`-d` 只是把进程丢后台，命令结束容器照样退出。`docker run -d alpine echo hi` 跑完就是 `Exited (0)`。
3. **`stop` 等于删除？** 不。停止的容器还占磁盘，`ps -a` 里全是 `Exited` 就是它的锅。退出码 `0` 正常、`1` 应用报错、`137` 被 SIGKILL（常是 OOM 或超时强杀）、`143` 收到 SIGTERM。

## 6. 容器 vs 虚拟机：共享内核到底意味着什么

虚拟机靠 Hypervisor 虚拟出整套硬件，每台 VM 有自己的内核；容器没有内核，**直接复用宿主机那一个**。隔离靠内核提供的两块能力：

**namespace 管「看得见什么」。** 每个容器一套独立的 PID、network、mount、UTS、IPC、user 视图。所以容器里 `ps aux` 只有自己那一个进程（PID 1），`hostname` 是自己那串 ID，根目录是镜像给的，不是宿主机。这就是「隔离」的全部来源——没有硬件边界，只是把视野裁掉。

**cgroup 管「能用多少」。** CPU、内存、pids、IO 的配额与统计。`docker run -m 512m --cpus 1.5` 就是在写 cgroup；内存超限触发内核 OOM Killer，容器以 `137` 退出，`docker inspect` 里 `OOMKilled: true`。

共享内核带来三个必须接受的后果：

- 内核版本只有宿主机的，**不能给某个容器换内核**，也不能在 Linux 上跑 Windows 容器。
- 内核漏洞的影响面是整台机器，隔离强度弱于 VM。
- Windows/macOS 上跑 Linux 容器必须有一台 Linux 内核兜底，这就是 WSL2 存在的原因。

## 7. 首次必踩的三个坑

**端口占用。** 报错长这样：

```text
docker: Error response from daemon: driver failed programming external
connectivity on endpoint web: Bind for 0.0.0.0:8080 failed:
port is already allocated.
```

先分清是谁占的：`docker ps` 看有没有别的容器映射了 8080，`ss -ltnp | grep 8080`（Windows 用 `netstat -ano | findstr :8080`）看宿主机进程。要么换宿主端口 `-p 8081:80`，要么停掉占用者。容器**内部**端口可以重复，冲突只发生在宿主端口上。

**`permission denied` 连 socket。** 报错：

```text
permission denied while trying to connect to the Docker daemon socket
at unix:///var/run/docker.sock
```

原因九成是当前用户不在 `docker` 组。`sudo usermod -aG docker "$USER"` 之后**必须重新登录**（或 `newgrp docker`），`id -nG` 里能看到 docker 才算生效。要提醒一句：进 docker 组约等于拿到 root，生产上更稳的是 `sudo docker` 或 rootless 模式。Desktop 用户则先 `docker context ls`，确认当前上下文指向 Desktop 而不是一个已经死了的远端。

**镜像拉取超时。** 报错：

```text
Error response from daemon: Get "https://registry-1.docker.io/v2/":
net/http: request canceled while waiting for connection
(Client.Timeout exceeded while awaiting headers)
```

思路是走 registry mirror：把加速地址写进 `/etc/docker/daemon.json`（Desktop 在 Settings → Docker Engine 里改同一份 JSON），然后重启 Docker：

```json
{
  "registry-mirrors": ["https://<你的镜像加速地址>"]
}
```

```bash
sudo systemctl restart docker && docker info | grep -A2 "Registry Mirrors"
```

注意 mirror 只代理 Docker Hub，`ghcr.io`、私有仓库不走它；地址也分可用性，换一个不通的直接从 `docker info` 里删掉。拉不下来的另一半原因常是架构不对（arm 机器拉 amd64 层），`--platform` 在阶段二讲。

---

## 小结

- Windows 用 Docker Desktop + WSL2，Linux 用 Engine；`docker version` 必须看到 Server 段才算装好。
- `docker run` 的链路是 client → daemon → registry → 镜像层 → 容器进程，镜像不可变，容器多一层可写层。
- 记住六个参数（`-d -p --name -e --rm -v`）和六个排查命令（`ps -a logs exec inspect stop rm`）就能应付大部分日常。
- 容器停在 `exited` 不等于消失；退出码 `0/1/137/143` 是定位问题的第一手线索。
- 容器共享宿主机内核：namespace 裁视野、cgroup 限资源，这是它快、也是它隔离弱的根本原因。
- 端口占用查宿主端口、socket 权限查用户组、拉取慢走 mirror——这三个坑几乎人人都会踩一次。

---

## 练习

1. 跑 `docker run hello-world`，用 `docker ps -a` 找到它的退出码；再跑一次带 `--rm` 的，对比 `ps -a` 里的数量差异。
2. 起一个 nginx 容器映射到 `127.0.0.1:8080`，用 `docker logs` 看访问日志，再 `exec -it` 进去 `ps aux`，解释为什么只有一个进程。
3. 故意用 `-p 8080:80` 起第二个 nginx，把 `port is already allocated` 的报错抄下来，然后用 `ss -ltnp` 找到占用者并解决。
4. 用 `docker run -m 64m node:22-alpine node -e "const a=[];while(1)a.push(Buffer.alloc(1e6))"` 观察退出码是不是 137。
