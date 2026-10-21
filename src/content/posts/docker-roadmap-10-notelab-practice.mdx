---
title: '10 · 实战：把 NoteLab 三仓装进 Compose'
published: 2026-10-20T19:00:00+08:00
description: '把三个业务服务和 nginx、MySQL、Redis 装进一份 compose.yaml：服务拆分、Dockerfile 要点、SSE 反代、数据卷与从 pm2 迁移回滚。'
tags: [Docker, NoteLab, 实战, 部署]
category: Docker学习路线
draft: false
---

> [!NOTE]
> 我的服务器上曾经是 4 个 pm2 进程加一个宿主机 nginx，MySQL 和 Redis 直接装在系统里。跑了一年没出事，直到换服务器：我花了两个晚上重装环境，还把 Node 版本装错了。这篇是把它整个装进 Compose 的过程，包括那几次让我半夜起来回滚的坑。

---

## 1. 现状：4 个 pm2 进程 + 宿主机中间件

服务器上是 4 个 pm2 进程（3010 / 3020 / 8001 / 8002）+ 宿主机 nginx + 宿主机 MySQL、Redis。能跑，但**没有任何版本声明**：Node 是 20 还是 22、JDK 是 17 还是 21、MySQL 调过哪些参数，全靠 `history` 和记忆。容器化要解决的就是三件事：**环境一致**（运行时写进 Dockerfile）、**迁移**（新机器只要 Docker + `.env` + 数据卷）、**回滚**（换镜像 tag，不是重装依赖）。

## 2. 拆成哪些服务

| 服务 | 角色 | 端口 | 依赖 | 对外 |
| :-- | :-- | :--: | :-- | :--: |
| nginx | 统一入口、TLS | 80/443 | 全部前端 + java | ✅ |
| java | Spring Boot fat jar | 8001 | mysql、redis | 仅内网 |
| notelab-c | Next，无 basePath | 3010 | java | 仅内网 |
| notelab-b | Next，basePath `/admin` | 3020 | java | 仅内网 |
| ai-lab | FastAPI + 静态产物 | 8002 | 无 | 仅内网 |
| mysql | MySQL 8.4 | 3306 | — | ❌ 不映射 |
| redis | Redis 7（限流） | 6379 | — | ❌ 不映射 |

**只有 nginx 映射宿主机端口**，其余靠服务名互访；3306 映射出去就是挂在公网上等扫描器。ai-lab 与两个前端同构（换成 `python:3.12-slim` 而已），下面 compose 里从略。

## 3. 两个 Dockerfile 的要点

Spring Boot 的 fat jar 只需要 JRE，Maven 只出现在构建阶段：

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src
COPY pom.xml .
RUN mvn -B -q dependency:go-offline          # 依赖单独一层，改代码不重下
COPY src ./src
RUN mvn -B -q -DskipTests package
FROM eclipse-temurin:21-jre
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/* && useradd -r -u 10001 app
WORKDIR /app
COPY --from=build /src/target/*.jar app.jar
ENV TZ=Asia/Shanghai
USER app
ENTRYPOINT ["sh", "-c", "exec java -XX:MaxRAMPercentage=75 -jar app.jar"]
```

装 `curl` 只为 healthcheck（约 1MB），换来 compose 能判断「java 到底起没起来」。`exec` 不能省：不加的话 PID 1 是 shell，`docker stop` 的 SIGTERM 传不到 JVM，只能等 10 秒后 SIGKILL，退出码从 143 变成 137。

Next 的关键是 `next.config.ts` 里的 `output: 'standalone'`，它把运行所需的依赖裁剪成几十 MB，产物在 `.next/standalone`：

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production TZ=Asia/Shanghai PORT=3010
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
RUN addgroup -S app && adduser -S -G app app && chown -R app:app /app
USER app
CMD ["node", "server.js"]
```

三处细节：`pnpm-lock.yaml` 和 `package.json` 一起先 COPY，否则改一行业务代码就要重装依赖；`--frozen-lockfile` 保证 CI 和服务器装出同一棵树；`.dockerignore` 写 `node_modules`、`.next`、`.git`，否则本地依赖进构建上下文，构建慢十倍。

## 4. 一份精简但完整的 compose.yaml

```yaml
x-app: &app
  restart: unless-stopped
  networks: [notelab]
  logging: { driver: json-file, options: { max-size: "10m", max-file: "3" } }
services:
  mysql:
    <<: *app
    image: mysql:8.4
    env_file: [./env/mysql.env]
    volumes: ["mysql-data:/var/lib/mysql"]
    healthcheck: { test: ["CMD", "mysqladmin", "ping", "-h127.0.0.1"], interval: 10s, retries: 10 }
  redis:
    <<: *app
    image: redis:7-alpine
    volumes: ["redis-data:/data"]
  java:
    <<: *app
    build: ./notelab-java
    env_file: [./env/java.env]
    volumes: ["uploads:/app/uploads"]
    depends_on: { mysql: { condition: service_healthy }, redis: { condition: service_started } }
    healthcheck: { test: ["CMD-SHELL", "curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8001/api/menu | grep -qE '200|401'"], interval: 15s, start_period: 60s }
  notelab-c:
    <<: *app
    build: ./notelab-c
    env_file: [./env/web.env]
  notelab-b:
    <<: *app
    build: ./notelab-b
    env_file: [./env/web.env]
  nginx:
    <<: *app
    image: nginx:1.27-alpine
    ports: ["80:80", "443:443"]
    volumes: ["./nginx/notelab.conf:/etc/nginx/conf.d/default.conf:ro", "uploads:/var/www/uploads:ro"]
    depends_on: [java, notelab-c, notelab-b]
volumes: { mysql-data: {}, redis-data: {}, uploads: {} }
networks: { notelab: {} }
```

`x-app` 锚点省掉每个服务重复的 `restart` 与 `logging`。日志轮转必须有：json-file 驱动默认不限大小，一年后日志吃满磁盘是标准结局。`depends_on` 的 `service_healthy` 只保证「MySQL 能应答之后再启 java」，重连仍然要应用自己兜。

## 5. nginx：用服务名反代，SSE 必须关缓冲

```nginx
location /api/ {
    proxy_pass http://java:8001;      # java = compose 里的 service 名
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header Connection "";   # 保持长连接，SSE 必需
    proxy_buffering off;              # 别攒满缓冲区才发
    proxy_read_timeout 3600s;         # 默认 60s 直接把流掐断
}
location /admin/ { proxy_pass http://notelab-b:3020; }
location /      { proxy_pass http://notelab-c:3010; }
```

`proxy_buffering off` 是踩过的坑：流式响应被 nginx 攒着，前端看到的是「转半天圈，然后一次性全刷出来」。`/admin/` 的 `proxy_pass` **不能加尾斜杠**，加了之后 `/admin/login` 会被改写成 `/login` 发出去，而 Next 的 basePath 是 `/admin`，直接 404。

## 6. 配置、密钥与数据卷

- `env/java.env`：`MYSQL_HOST=mysql`、`MYSQL_PORT`、`MYSQL_DATABASE`、`MYSQL_USER`、`MYSQL_PASSWORD`、`REDIS_HOST=redis`、`TZ`
- `env/web.env`：`NEXT_PUBLIC_API_BASE`、`SESSION_SECRET`；`env/mysql.env`：`MYSQL_ROOT_PASSWORD` 等；三个卷：`mysql-data`、`uploads`（java 写、nginx 只读）、`redis-data`

`env/` 整目录进 `.gitignore`，仓库只留 `env/*.env.example`（只写键名）。备份每天一次、7 天滚动：`docker compose exec -T mysql mysqldump ... | gzip > /srv/backup/notelab-$(date +%F).sql.gz`；**`uploads` 必须单独打包**，只备数据库的话用户上传的图会一起消失。

## 7. 部署与回滚

```bash
#!/usr/bin/env bash
set -euo pipefail
cd /srv/notelab
git pull --ff-only
docker compose build                          # 失败即退出，旧容器继续对外服务
docker compose up -d --no-deps java notelab-c notelab-b
code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8001/api/menu)
[ "$code" = "200" ] || [ "$code" = "401" ] || { echo "健康检查失败（HTTP $code），不切流量"; exit 1; }
docker compose up -d --no-deps nginx          # 最后才碰入口
```

关键在**顺序**：先 build（失败就停在这一步，线上零影响），再换应用容器，健康检查过了才碰 nginx；反过来做，nginx 会先指向还没起来的容器，用户看到 502。回滚是 `git checkout <上一个提交> && ./deploy.sh`，镜像层缓存大多命中，通常一两分钟；要秒级回滚就得把镜像推到仓库、用固定 tag + `IMAGE_TAG` 变量（见[阶段五](/blog/posts/docker-roadmap-05-registry-and-ci/)）。

## 8. 从 pm2 平滑迁移

别停 pm2 再起容器，**让两套并存**：

1. 容器先换端口起：`3010 → 13010`、`3020 → 13020`、`8001 → 18001`，nginx 不动，线上还是 pm2 在服务。
2. `curl -N` 逐个验证新端口，SSE 接口单独验一次（确认不是攒完才返回）。
3. 改 nginx upstream 到新端口 → `nginx -t` → `systemctl reload nginx`，这一步才是切流。
4. pm2 留一周：`pm2 stop` 但不 `delete`，回滚就是把 nginx 改回去 reload；稳定后再 `pm2 delete` 回收端口。

第一次在容器里起服务时撞到的是 `Error response from daemon: Ports are not available ... bind: address already in use`——因为 pm2 还占着 3010，这正是要换端口起容器的原因。并行期两套服务连同一个 MySQL，所以别在这期间跑数据库迁移。

## 9. 六个一定会踩的坑

1. **容器里的 `127.0.0.1` 是容器自己**：`MYSQL_HOST=127.0.0.1` 报 `Connection refused`，要写服务名 `mysql`。
2. **Next 的 basePath 构建期定死**：nginx 路径和 `next.config` 必须严格对齐，改一个不改另一个就是 404。
3. **时区**：镜像默认 UTC，日志和定时任务差 8 小时。`ENV TZ` 和 compose 里的 `TZ` 两处都要。
4. **别把宿主机 `node_modules` 挂进容器**：`- ./notelab-c:/app` 会盖掉镜像里的依赖，加匿名卷 `- /app/node_modules`。
5. **文件权限**：容器内 uid 10001 写 bind mount 的上传目录会 `Permission denied`，用命名卷或宿主机 `chown -R 10001`。
6. **MySQL 初始化脚本只跑一次**：`/docker-entrypoint-initdb.d` 仅在数据目录为空时执行，改 SQL 只能走迁移。

---

## 小结

- 只有 nginx 映射宿主机端口，数据库和内部服务一律不映射，靠服务名互访。
- Java 用「Maven 构建 + JRE 运行」，`exec` 启动让 SIGTERM 直达 JVM；Next 用 `standalone` 只拷三样产物。
- `depends_on: service_healthy` 只管启动顺序，重连要应用自己兜；`logging` 轮转必须有。
- SSE 三件套：`proxy_buffering off`、`proxy_read_timeout` 拉长、`Connection ""`。
- 部署顺序 build → 应用容器 → 健康检查 → nginx，回滚是 checkout 上一个提交再跑一遍；迁移期换端口并行、切 nginx、pm2 留一周再删。

---

## 练习

1. 给自己的 Next 项目写一份 `standalone` 的 Dockerfile，`docker build` 后对比镜像体积能不能小于 200MB。
2. 起一套 java + mysql + redis 的小 compose，故意把 `MYSQL_HOST` 写成 `127.0.0.1`，看日志里的报错，再改成服务名验证恢复。
3. 写一个 `deploy.sh`，要求「构建失败不重启、健康检查失败不切 nginx」，然后用一个错的健康路径验证它真的会退出。
4. 本地用两个端口同时起新旧版本，改一次 nginx 完成切换，再手工回滚一次，把流程压成 5 行以内的操作清单。
