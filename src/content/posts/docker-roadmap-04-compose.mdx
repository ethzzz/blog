---
title: '04 · Compose：把多服务编排起来'
published: 2026-10-20T13:00:00+08:00
description: '三个 docker run 收成一个 compose.yaml：app + mysql + redis 示例，服务名互访、健康启动、profiles 与 down -v 的风险。'
tags: [Docker, Compose, 编排]
category: Docker学习路线
draft: false
---

> [!NOTE]
> 我维护过最久的一个脚本叫 `run.sh`，七八条 `docker run`，顺序不能乱、密码写在命令行里，改个端口要全文搜索。换成 `compose.yaml` 之后同样的服务只要 `up -d` 一条命令——这篇是那次迁移的完整过程。

---

## 1. 三个 docker run 之后，我放弃了

```bash
docker network create app-net
docker run -d --name db --network app-net -v mysql-data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASSWORD" mysql:8.4
docker run -d --name cache --network app-net redis:7-alpine
docker run -d --name app --network app-net -p 127.0.0.1:3000:3000 app:1.0
```

能跑，问题第二天全出来：**顺序靠人记**（db 没 ready 就起 app，只能在脚本里 `sleep 10`）；**参数散在 shell history 里**，换台机器得重敲一遍；**改个变量要 `docker rm -f` 重来**，容器名和网络名全靠手维护；最要命的是**依赖关系只在我脑子里**。Compose 做的事只有一件：把这些 `docker run` 参数声明进文件，让 Docker 自己算网络和顺序。

## 2. compose.yaml 的顶层结构

`compose.yaml` 只有四个顶层键：`name` 是项目名（给容器/网络/卷加前缀，同机多项目不打架）、`services` 是主体、`networks` 声明网络（不写就自动建 `<项目名>_default` 这个自定义 bridge，服务名在其中可解析）、`volumes` 是命名卷的声明处——**没在这里声明的卷会变成匿名卷**，`down -v` 时一起没。

## 3. 一个能跑的 app + mysql + redis

拿 [02 篇](/blog/posts/docker-roadmap-02-dockerfile-and-layers/)的 Dockerfile 直接用，`compose.yaml` 放它旁边：

```yaml
name: notelab

services:
  app:
    build: .
    ports: ["127.0.0.1:3000:3000"]      # 只绑回环，公网入口不在这里
    environment:
      NODE_ENV: production
      DATABASE_URL: mysql://app:${MYSQL_PASSWORD}@mysql:3306/app
      REDIS_URL: redis://redis:6379
    env_file: [.env]
    depends_on:
      mysql:
        condition: service_healthy
      redis:
        condition: service_started
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://127.0.0.1:3000/health || exit 1"]
      interval: 30s
      timeout: 3s
      retries: 3
    restart: unless-stopped

  mysql:
    image: mysql:8.4
    environment:
      MYSQL_DATABASE: app
      MYSQL_USER: app
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
    volumes: ["mysql-data:/var/lib/mysql"]
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h 127.0.0.1 -uroot -p$$MYSQL_ROOT_PASSWORD --silent"]
      interval: 10s
      retries: 10
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes: ["redis-data:/data"]
    restart: unless-stopped

networks:
  default:
    name: notelab-net

volumes:
  mysql-data:
  redis-data:
```

`docker compose up -d` 之后 `docker compose ps` 里 app 和 mysql 变成 `healthy`、redis 是 `Up`，才算真起来了。注意 `DATABASE_URL` 里的 `mysql` 是**服务名**、`3306` 是**容器内端口**，写反是下一章最常见的错误。

## 4. build 还是 image

| 情况 | 写什么 |
| :-- | :-- |
| 自己有 Dockerfile | `build: .`（`context` 默认当前目录） |
| 用现成镜像 | `image: mysql:8.4` |

能构建的写 `build`，用别人的写 `image`；两个都写就是「构建完打上这个 tag」。多阶段镜像只跑某一段用 `build: {context: ., target: dev}`。改端口、环境变量不用重建镜像，代码或 Dockerfile 变了才 `docker compose up -d --build`。

## 5. 服务名就是主机名

Compose 给每个服务在项目网络上注册了 DNS：**服务名即主机名**。所以连 MySQL 写 `mysql:3306`，不是 `localhost:3306`（那是 app 自己），端口写**容器内端口**而不是 `ports:` 映射出去的那个；只有同网络的服务能解析，跨 compose 项目默认不通。想确认就进容器跑 `docker compose exec app getent hosts mysql`，解析不出来时报 `getaddrinfo EAI_AGAIN mysql`——根因和 03 篇默认 bridge 不能按名字解析是同一个。

## 6. depends_on 只保证启动顺序

`depends_on` 默认只等「容器起来了」，不等「服务能用了」。MySQL 容器 Up 之后还要几秒才接受连接，这期间 app 直接崩：

```text
Error: connect ECONNREFUSED 172.18.0.2:3306
```

所以示例用了 `condition: service_healthy`，等 mysql 的 healthcheck 通过再启动 app。另外两个取值：`service_started`（默认）和 `service_completed_successfully`（一次性任务跑完，适合迁移容器）。但它不是银弹——healthcheck 通过只代表端口能连，表结构迁移还得 app 自带重试或单独跑迁移服务。

## 7. profiles：可选服务不占资源

adminer 这种只用来翻数据库的工具，天天跑着纯属浪费：

```yaml
  adminer:
    image: adminer:4
    profiles: ["tools"]
    ports: ["127.0.0.1:8080:8080"]
```

带 `profiles` 的服务默认**完全不参与**：`up -d` 不启动它，`docker compose config` 里也看不见。要用时 `docker compose --profile tools up -d`，或把 `COMPOSE_PROFILES=tools` 写进环境变量。

## 8. 开发态热更新

生产镜像把代码烤进去，本地开发要的是「改文件、浏览器刷新」。标准做法是把源码 bind mount 进来，再给依赖目录盖一个匿名卷：

```yaml
# compose.override.yaml
services:
  app:
    build:
      target: dev
    command: pnpm dev
    environment:
      NODE_ENV: development
    volumes:
      - .:/app                 # 源码挂进来，改文件不用重建
      - /app/node_modules      # 匿名卷：保住镜像里装好的依赖
```

`- /app/node_modules` 看着像笔误，其实是重点：bind mount 会把宿主机的 `node_modules` 盖进容器，而宿主机那份可能是 macOS 编的、或压根不存在；匿名卷在那个路径上盖一层空目录，容器就继续用镜像里的依赖。Compose 2.22+ 还可以用 `develop.watch` 替代：`action: sync` 只把改动的文件同步进容器，`action: rebuild` 在 `package.json` 变化时才重建镜像——依赖始终真装在镜像里，也不吃文件监听的性能。

## 9. 常用命令与 `down -v`

```bash
docker compose up -d --build    # 构建并后台起
docker compose ps               # 只看本项目
docker compose logs -f app      # 跟日志，Ctrl-C 只退日志不退服务
docker compose exec app sh      # 进容器
docker compose config           # 渲染后的最终配置（插值和 override 都合并好了）
docker compose down             # 停并删容器/网络，卷保留
docker compose down -v          # 连命名卷一起删
```

> [!WARNING]
> `down -v` 会删掉 `volumes:` 里声明并挂载的命名卷，数据库**直接归零**，没有回收站——先用 `docker compose config --volumes` 看清有哪些卷再决定。另外 `docker compose config` 会把 `.env` 里的密钥明文打出来，别往聊天窗口或 issue 里粘。

## 10. override 文件与 .env 插值

Compose 会自动合并 `compose.yaml` + `compose.override.yaml`，后者覆盖前者——这就是区分 dev/prod 最省事的方式：`compose.yaml` 写生产基线，`compose.override.yaml` 只写本地要改的部分（挂源码、开端口、换命令）。生产上显式指定文件就不会加载 override：

```bash
docker compose -f compose.yaml -f compose.prod.yaml up -d
```

`.env` 和 `env_file` 的区别只有一句：**`.env` 给 `compose.yaml` 的 `${VAR}` 插值用、不进容器；`env_file` 是注入容器进程的环境变量、会进容器**。所以端口、镜像 tag、数据库密码放 `.env`（不进 git，仓库里提交 `.env.example`），应用自己的配置放 `env_file`。插值还支持默认值 `${TAG:-latest}` 和 `$$` 转义——示例里 mysql healthcheck 写 `$$MYSQL_ROOT_PASSWORD`，就是让 shell 在容器里展开它。

---

## 小结

- 三个以上服务别堆 `docker run`：参数进文件、顺序给 `depends_on`、网络给 Compose。
- `compose.yaml` 四个键：`name` / `services` / `networks` / `volumes`；没声明的卷是匿名卷。
- 服务名就是主机名，端口写容器内端口；跨网络、跨项目默认不通。
- `condition: service_healthy` 解决启动顺序，不解决表结构迁移。
- `profiles` 让工具类服务按需启动；开发态用 bind mount + 匿名卷，或 `develop.watch`。
- `down -v` 删卷不可逆，`compose config` 会打印密钥。

---

## 练习

1. 把 03 篇的三个 `docker run` 改写成 `compose.yaml`，用 `docker compose config` 核对端口、卷、网络。
2. 删掉 mysql 的 healthcheck 再 `up -d`，看 app 是否 `ECONNREFUSED` 反复重启；加回来对比。
3. 给 adminer 加 `profiles`，分别用不带 profile 和 `--profile tools` 启动，对比 `docker compose ps`。
4. 用 `compose.override.yaml` 挂源码 + 匿名卷，改一行代码确认热更新，再 `docker compose exec app ls node_modules` 确认不是空目录。
