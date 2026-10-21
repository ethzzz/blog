---
title: '06 · 生产部署：nginx、HTTPS 与零停机'
published: 2026-10-20T15:00:00+08:00
description: '从单机 compose 上线、nginx 反代容器、HTTPS 与证书续期，讲到日志轮转、备份、部署脚本与回滚，以及单机零停机的现实做法。'
tags: [Docker, 部署, nginx, 运维]
category: Docker学习路线
draft: false
---

> [!NOTE]
> 第一次把容器放上生产，我以为 `docker compose up -d` 之后就结束了。现实是域名打不开、证书三个月后静默过期、流式接口被缓冲成一整块返回、要回滚时发现旧镜像已经被 `pull` 覆盖。这一篇讲我怎么把「跑起来」变成「能上线、能回滚」。

---

## 1. 单机部署流程

流程固定为 `git pull` → `build` 或 `pull` → `up -d`。我不在服务器上现场 `docker build`——构建那几分钟里服务是半死不活的，而且服务器上还得装齐所有构建依赖：

```bash
cd /srv/app
git pull --ff-only                 # 只有 compose.yaml / nginx.conf 变更时才需要
docker compose pull                # 拉 CI 已经构建好的镜像
docker compose up -d               # 只重建镜像变了的容器
docker compose ps                  # 状态应为 running + healthy
```

镜像构建交给 CI（[05 · 镜像仓库与 CI 构建](/blog/posts/docker-roadmap-05-registry-and-ci/)），服务器只做「拉取 + 起容器」。这样服务器不需要 Node、不需要构建缓存，也就不会有「服务器上编译不过」这类事故。

## 2. nginx 反代容器：两种连法

容器里有三个容易搞混的「地址」：容器内的 `127.0.0.1` 是容器自己，宿主机的 `127.0.0.1` 是宿主机，服务名只在同一个 compose 网络里能解析。所以 nginx 有两种写法：

```nginx
# 写法 A：nginx 跑在宿主机，upstream 指向 compose 发布到宿主机的端口
upstream notelab_c { server 127.0.0.1:3010; }
server {
    listen 80; server_name haolo.cloud;
    location / { proxy_pass http://notelab_c; }
}
```

```nginx
# 写法 B：nginx 也是容器，upstream 直接用 compose 里的服务名和容器内端口
upstream notelab_c { server notelab-c:3000; }
```

差异就三点：**A** 需要 `ports: ["3010:3000"]` 把端口发布到宿主机，好处是 nginx 配置和数据在容器外、改完 reload 即可；**B** 不用发布端口（`expose` 就够），地址更稳定（容器 IP 会变，服务名不会），少一层转发，但 nginx 必须和 app 在同一个 compose 网络里，改配置要重建容器。我线上用 B，临时调试用 A。

## 3. HTTPS：签发与续期

```bash
# 首次签发（80 端口上已能提供 /.well-known/acme-challenge/）
sudo certbot --nginx -d haolo.cloud -d www.haolo.cloud
# 之后由定时器每 12 小时检查，到期前自动续签
sudo certbot renew --dry-run
```

续期失败最常见的原因不是 ACME 报错，而是**证书换了、nginx 没 reload**：`--nginx` 插件自己会 reload，用 webroot/standalone 模式就不会。nginx 在容器里时，续期钩子必须进容器执行：

```bash
# /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh（记得 chmod +x）
#!/usr/bin/env bash
set -e
docker compose -f /srv/app/compose.yaml exec -T nginx nginx -s reload
```

证书目录用 bind mount 挂进容器（`/etc/letsencrypt:/etc/letsencrypt:ro`），**不要 `COPY` 进镜像**——那样每 90 天要重建一次镜像，还让证书进了镜像层。

## 4. 代理头、上传大小与 SSE

反代之后，应用看到的 `remote_addr` 是 nginx 的地址，真实 IP 只能靠头传：

```nginx
proxy_pass http://notelab_c;
proxy_set_header Host              $host;
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
client_max_body_size 20m;          # 默认 1m，传图/附件立刻 413
```

四个头里 `X-Forwarded-For` 是**追加**的链（多级代理时取最左的非可信 IP），`X-Real-IP` 是覆盖的单个值——应用里读哪个要定死，否则日志里的 IP 一会儿对一会儿错。`X-Forwarded-Proto` 决定后端拼出来的是 `http` 还是 `https` 链接，漏了它会出现登录后跳回 http 的死循环。`client_max_body_size` 默认 1m，超了直接 `413 Request Entity Too Large`，我为这个「本地好好的、线上传不上去」排查过半小时。流式接口（SSE / LLM 输出）同理必须关缓冲，否则前端要等整段生成完才一次性收到：

```nginx
location /api/stream {
    proxy_pass http://notelab_api;
    proxy_http_version 1.1;
    proxy_set_header Connection '';
    proxy_buffering off;
    proxy_read_timeout 3600s;          # 长响应别被默认 60s 掐断
}
```

## 5. restart、日志轮转与 healthcheck

```yaml
services:
  web:
    image: ghcr.io/your-name/notelab-c:1.4.2
    restart: unless-stopped
    logging:
      driver: json-file
      options: { max-size: "10m", max-file: "3" }
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:3000/"]
      interval: 30s
      start_period: 20s
```

`restart: unless-stopped` 是我唯一想要的：机器重启后自动起来，我手动 `stop` 的容器不会自己复活（`always` 会让它复活）。`json-file` 不轮转会吃满磁盘，`max-size` + `max-file` 是不装额外组件的方案；注意**日志驱动参数不能热改**，改完要重建容器。healthcheck 的坑则在于：**容器 healthy 只说明那条命令在容器内成功了**，不等于服务可用。我踩过的三种：健康检查配成 `CMD true`（永远 healthy）；探活 `/` 但真正挂的是数据库连接池；`start_period` 太短，启动中被判死然后被反复重启：

```text
NAME                STATUS
app-web-1           Restarting (1) 4 seconds ago
```

看到这个状态先看 `logs`，别急着改 healthcheck——它只是在如实报告「服务没起来」。判据是：探活要打**真依赖下游的端点**（比如 `/healthz` 里查一次 DB），`restart` 只当「进程退出」的兜底，别把它当可用性监控。

## 6. 数据卷备份

```bash
# 命名卷整体打包（不停服务也能做，但一致性由数据库自己保证）
docker run --rm -v notelab_mysql:/data:ro -v /srv/backup:/backup alpine \
  tar czf /backup/mysql-$(date +%F).tar.gz -C /data .
# 数据库优先用逻辑备份，别只靠卷快照
docker compose exec -T db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" app' \
  | gzip > /srv/backup/app-$(date +%F).sql.gz
find /srv/backup -name '*.gz' -mtime +14 -delete
```

卷快照是文件级的，热备时可能拷到写了一半的 InnoDB 文件；`mysqldump` 能在事务里拿到一致视图。**两种都做**：文件卷每周存档一次，逻辑备份每天一次，保留 14 天。另外每季度真跑一次恢复——没演练过的备份不算备份，`compose.yaml` 和 nginx 配置也要一起进 git，它们是部署的一部分。

## 7. 部署脚本与回滚

```bash
#!/usr/bin/env bash
set -euo pipefail
TAG="${1:?usage: deploy.sh <tag>}"        # 固定 tag，禁止 latest
cd /srv/app

sed -i "s|^\( *image: .*notelab-c:\).*|\1${TAG}|" compose.yaml
docker compose pull web
docker compose up -d --no-deps web        # 只换 web，不动 db/redis
sleep 5
if ! curl -fsS http://127.0.0.1:3010/ > /dev/null; then
  echo "health check failed, rolling back"
  git checkout -- compose.yaml            # 切回旧 tag
  docker compose up -d --no-deps web
  exit 1
fi
echo "deployed ${TAG}"
```

三个要点：`set -euo pipefail` 让任何一步失败立即停；tag 是必传参数；失败时**不先删旧容器**，直接切回旧 image 再起——`up -d` 之前旧容器一直活着，这是最便宜的兜底。回滚就是重跑脚本、传上一个 tag。**数据库迁移是唯一的例外**：如果新版本的迁移删了列或改了类型，回滚镜像也救不回数据，所以规则只能是「迁移向后兼容一个版本」——先加列不删列、字段双写、废弃字段延迟两版再删。做不到就只能从备份恢复，那是分钟级停机。

## 8. 单机零停机：现实做法与顺序

单机做不到真正无缝，但能做到「nginx 切一下，丢几百毫秒」：

1. 新版本起在**另一个端口**（3010 → 3011），`up -d` 只加不删，旧容器继续服务；
2. 探活新端口，通过就把 nginx upstream 改指向 3011，`nginx -t && nginx -s reload`；
3. 观察几分钟，没问题再停旧容器；有问题就把 upstream 改回去，零成本回滚。

`reload` 时已有连接不丢（worker 平滑替换），但**在途请求仍可能失败**，而且新老版本同时连着同一个数据库——所以**数据库迁移必须先于新版本启动**，且必须兼容老版本。顺序永远是：迁移 → 起新版本 → 探活 → 切流量 → 停旧版本。

> [!WARNING]
> 「两个端口 + nginx 切换」不是集群编排器那种滚动发布：没有就绪探针的自动回退，没有多副本分担，切换脚本自己挂了就没人切回来，而且双份资源同时占着。单机想要真零停机，代价是一套切换编排和持续的双份开销，多数个人项目不值得。

---

## 小结

- 服务器只做 `pull` + `up -d`，构建在 CI；部署永远传固定 tag，不用 `latest`。
- nginx 反代容器两种连法：宿主机 upstream 指向发布端口，或同网络用服务名；后者地址稳定、少一层转发，但要和 compose 绑死。
- 证书用 bind mount 挂进容器，续期钩子里 reload nginx，不要把证书 COPY 进镜像。
- 四个代理头全套上，`client_max_body_size` 放大到业务需要，流式接口必须 `proxy_buffering off`。
- `restart: unless-stopped` + json-file 轮转 + 真正打下游的 healthcheck，缺一都会在半夜出事。
- 回滚靠固定 tag 重跑脚本；数据库迁移必须向后兼容一个版本，否则只能恢复备份。

---

## 练习

1. 给现有服务加一个 nginx 反代容器，用「发布端口」和「服务名」两种写法各跑一次，比较 `docker compose ps` 与 `curl -I` 的结果差异。
2. 写一个 `/api/stream` 的 SSE 端点，对比 `proxy_buffering on/off` 下 `curl -N` 的输出节奏，记录首字节时间。
3. 按第 7 节的脚本部署一次，再故意传一个不存在的 tag，确认脚本失败退出后旧容器仍在正常服务。
4. 用 `docker run --rm` 把命名卷打包再解到一个新卷，然后在临时容器里验证文件数量与关键表行数一致。
