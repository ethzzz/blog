---
title: '01 · 启动 MySQL 与手工建活动'
published: 2026-11-28T09:05:00+08:00
description: '用 Node.js 和 MySQL 跑起运营工作台，建立投放位、活动与审计表，保存第一条首页 Banner 草稿。'
tags: [项目实战, Node.js, MySQL, 运营后台]
category: AI运营投放实战
draft: false
---

> [!NOTE]
> [项目总览](/blog/posts/ai-ops-workshop-00-overview/) · [下一章：人群预演](/blog/posts/ai-ops-workshop-02-preview/)

这一章跑通一次「进入工作台 → 新草稿 → 保存 → 刷新读回」。先用确定的六名用户和三条素材做业务数据。数据库从第一章起贯穿完整项目。

### 文件地图

| 文件 | 本章负责什么 |
| --- | --- |
| `compose.yaml`、`dev.env.example` | MySQL 容器、端口和环境变量 |
| `init-dev.sql`、`db.mjs` | 单独的测试库、表结构、连接池和事务 |
| `fixtures.mjs` | 六个用户、已审核素材、通用投放和示例配置 |
| `server.mjs`、`index.html`、`app.mjs` | 同源 HTTP API、访问密钥、活动表单 |

## 1. 准备参考源码并启动

从博客仓库复制 `lab/ai-ops-workshop/` 到练习目录。线上教程也提供逐文件安装脚本，例如在 PowerShell 中执行下列命令：

```powershell
mkdir ai-ops-lab
cd ai-ops-lab
Invoke-WebRequest https://haolo.cloud/blog/ai-ops-workshop/setup.mjs -OutFile setup.mjs
node setup.mjs
npm.cmd ci
Copy-Item dev.env.example .env
```

Bash 可以用 `curl -fSLo setup.mjs https://haolo.cloud/blog/ai-ops-workshop/setup.mjs`、`npm ci` 和 `cp dev.env.example .env` 替换对应三条命令。预览博客时，可给 `node setup.mjs` 传入本地源码路由的完整地址，地址以 `/blog/ai-ops-workshop/` 结尾。安装脚本保留已存在的同名文件。

在 `.env` 给 `MYSQL_ROOT_PASSWORD` 和 `DB_PASSWORD` 各设一个练习密码。MySQL 默认使用主机端口 3308，避免占用传统的 3306。Compose 初始化 `ops_workshop` 和 `ops_workshop_test`，后者用于独立的冒烟测试。已有 MySQL 时，手工创建两库，为工作坊账号授予对应库的建表、外键与读写权限，再修改 `.env` 的连接参数。 [MySQL 官方容器说明](https://hub.docker.com/_/mysql)

```bash
docker compose up -d --wait
npm run dev
```

PowerShell 若拦截 `npm.ps1`，改用 `npm.cmd run dev`。浏览器打开 `http://127.0.0.1:8790/`，用 `operator-local` 进入工作台。第一次启动会种下优先级 10 的「通用引导」，初次登录表单使用优先级 20 的示例配置。点击「保存草稿」，页面应显示 `draft` 和修订号 1。刷新并重新输入密钥后，可从活动下拉框重新选中这条草稿。

## 2. 拆开一次草稿保存

1. 打开 `app.mjs` 的 `read()`。表单把版本保留为字符串，把优先级转为数字，把复选框转为布尔值。把优先级留空并直接请求接口，观察服务端的校验错误。
2. 在 `POST /api/campaigns` 打断点。服务端从访问密钥得出角色，使用 `validate(config, materials)` 检查字段、素材和日期。
3. 到 `db.mjs` 看创建事务。两条 SQL 分别写入活动与审计记录。练习将两条语句其中之一改成错误 SQL，刷新确认没有只保存一半的活动，再恢复代码。 [mysql2 Promise 连接池](https://sidorares.github.io/node-mysql2/docs/documentation/promise-wrapper)
4. 切换 `reviewer-local`，仍能读活动列表。尝试向写接口提交草稿，服务端返回 403。浏览器仅在内存里持有本轮输入的密钥。

另开一个 PowerShell 终端可复查数据库已准备好、草稿已写入：

```powershell
$base = 'http://127.0.0.1:8790'
Invoke-RestMethod "$base/api/health"
$headers = @{ Authorization = 'Bearer operator-local' }
Invoke-RestMethod "$base/api/campaigns" -Headers $headers |
  Select-Object id, status, revision
```

## 验收

- [ ] 健康接口返回 `ok: true`，初始活动列表有「通用引导」。
- [ ] 保存草稿时返回 201。重启 Node 服务后仍能找到草稿和修订 1 的创建记录。
- [ ] 无有效密钥时业务 API 返回 401。审核员发起保存时返回 403。
- [ ] 使用测试素材 `draft-sale` 或让结束时间早于开始时间，接口分别返回素材或区间错误。

参考源码。 [db.mjs](/blog/ai-ops-workshop/db.mjs) · [server.mjs](/blog/ai-ops-workshop/server.mjs) · [fixtures.mjs](/blog/ai-ops-workshop/fixtures.mjs) · [compose.yaml](/blog/ai-ops-workshop/compose.yaml)
