---
title: '实战 05 · 评测、用量、安全和部署'
published: 2026-11-27T09:20:00+08:00
description: 'Day 8–10：做可重复的质量基线，接入反馈与配额，完成权限核对、反代发布和回滚演练。'
tags: [AI应用, 项目实战, 评估, 网关, 部署]
category: AI应用开发学习路线
draft: false
---

> [!NOTE]
> [上一篇：图片与语音](/blog/posts/ai-app-workshop-04-media/) · [下一篇：毕业验收](/blog/posts/ai-app-roadmap-13-project-ai-app/) · [路线合集](/blog/ai-app-roadmap/)

团队成员能从工作台反馈结果，查看自己的用量。开发者在调整 Prompt 或更换模型前后跑同一套问题，上线后用请求 ID 定位错误，遇到问题可以切回上一个版本。

### 文件地图

| 文件 | 负责什么 |
| --- | --- |
| `eval-cases.json`、`evaluate.mjs` | 可复用的样本、判分、失败退出码 |
| `ops.mjs` | 入场配额、token 与耗时采集、用户反馈 |
| `config.env.example` | 内测运行配置、模型切换和密钥边界 |
| `server.mjs` | 请求 ID、取消信号、鉴权和入口保护 |

## Day 8 建一条评测基线

在同一目录获取最后一阶段文件，先停掉占用 8787 的服务。新建 `eval.env`，写入 `DB_NAME=kb_workshop_eval`。Compose 已创建这个独立评测库。自管 MySQL 时需先创建库并授权，应用启动时会初始化表。

```bash
node setup.mjs 5
node --env-file=.env --env-file=eval.env server.mjs 5
```

另开一个终端：

```bash
node evaluate.mjs
node --env-file=.env smoke.mjs 5
```

评测脚本导入测试文档，检查流程、负责人、库外拒答与跨用户隔离四个问题，完成后删除测试文档。默认访问本机服务并用两把练习密钥。如改端口和测试密钥，同时配置 `EVAL_ORIGIN`、`EVAL_KEY` 和 `EVAL_OTHER_KEY`。用一份干净的评测数据库，避免旧文档干扰召回。基线 mock 预期四条全部通过。

1. 检查报告中的总通过率、应答样本的期望引用命中率、拒答准确率与平均耗时。逐条读实际回答，判断引用是否支持回答。
2. 把第 2 章积累的同义改写、缺证据与错误召回样本加进 `eval-cases.json`，保留其中一个当前会失败的用例。调整召回阈值、分块或 Prompt 后复跑。每次只改一项，记录 Prompt 版本、模型 ID、命中变化和耗时。这里的短语匹配是回归门禁，线上仍需人工抽样评审。
3. 有密钥时，用独立测试资料和账号跑 mock 与真实模型。自动门禁用确定性的 mock，发布评估还要检查真实模型的引用忠实度、图片识别、转写和函数调用。
4. 把 `node --env-file=.env smoke.mjs 5` 加入练习项目的 CI，先让 MySQL 就绪。脚本使用 `kb_workshop_test` 和唯一的测试账号，结束后清理该轮账号及关联记录，任一断言失败时以非零状态退出。自管测试库可通过 `TEST_DB_NAME` 配置 `kb_workshop_test` 或以 `kb_workshop_test_` 开头的专用库名。

## Day 9 把质量信号和配额接进产品

1. 在页面跑一轮问答，打开「用量与反馈」点刷新，给这次请求标记「有帮助」。查看请求响应的 `X-Request-Id`，用它在服务控制台找对应日志。日志记录路径、结果、耗时与上游回传的 token，用量缺失时通过 `usageSamples` 区分。
2. 用新的测试账号把 `REQUESTS_PER_MINUTE` 设为 2，连续发三次知识库查询。第三次应得到 `RATE_LIMIT`，并且不会访问上游。再把分钟上限设得高于 `REQUESTS_PER_DAY`，验证 UTC 日配额命中 `DAILY_REQUEST_LIMIT`。MySQL 在同一个事务里锁住账户行、检查并占用额度。失败和取消同样占用一次额度。
3. 比较日志采集的 token、模型账单和延迟。请求数配额限制调用次数，账单仍取决于模型、上下文、工具迭代和媒体计费方式。给供应商账户单独设预算，在真实模型压测时采集首字耗时与 p95。停止后一律避免自动重放一整轮请求。
4. 用 Bob 访问 Alice 的文档、会话、草案和反馈接口，查看 404。配置无效模型 ID 后检查错误响应和请求 ID。查看日志确认没有密钥、文档原文或完整消息。模型输出在页面通过 `textContent` 渲染，构造带 HTML 的测试文本应显示字面文本。

如果要演练缓存或灰度，先用两份 Prompt 版本做对照评测。缓存键要绑定用户、文档版本与模型配置，文档删除后验证旧结果无法再命中。多供应商路由放在模型适配层，重试需要考虑请求是否已开始流式输出、是否产生副作用，以及调用预算。 [产品化](/blog/posts/ai-app-roadmap-09-product-integration/) · [评估方法](/blog/posts/ai-app-roadmap-10-eval-and-quality/) · [网关与用量](/blog/posts/ai-app-roadmap-11-gateway-and-infra/) · [安全与合规](/blog/posts/ai-app-roadmap-12-security-and-compliance/)

## Day 10 以单实例方式发布团队内测

### 1. 准备生产配置

在你控制的测试机器上运行 Node.js 24。复制源码后执行 `npm ci`，将 `config.env.example` 复制为 `.env`。用下列命令为每位测试成员各生成一把随机访问密钥，填到 `APP_USERS` 的 JSON 中。账号 ID 保持稳定，轮换时替换对应密钥并重启。限制 `.env` 只有运行账号可以读取。

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
node --env-file=.env server.mjs 5
```

用 `APP_MODE=production` 启动会检查自定义密钥和阶段。由系统的服务管理器以非管理员账号运行同一个命令，工作目录设为项目目录。把 `DB_HOST`、`DB_PORT` 和 `DB_NAME` 指向专用 MySQL 库，应用使用仅对此库有建表、外键和读写权限的账号。跨主机连接时走受控网络并配置 `DB_SSL_CA_FILE`。首次内测可用 mock，配置真实模型后再放行实际用户数据。

### 2. 通过 HTTPS 反代

在已有证书的 Nginx HTTPS 站点下使用独立域名的根路径。应用监听 `127.0.0.1:8787`，通过反代向测试人员开放。

```nginx
location / {
    proxy_pass http://127.0.0.1:8787;
    proxy_http_version 1.1;
    proxy_buffering off;
    proxy_read_timeout 40s;
    client_max_body_size 2m;
    gzip off;
}
```

检查配置后重载，先用浏览器验收到达站点，再复用第 1 章的流式命令，将地址改成测试域名、密钥改成测试成员的访问密钥。确认 SSE 逐段到达。若到最后一次性显示，优先检查 Nginx 和外层代理是否缓存或缓冲响应。 [Nginx 代理配置](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_buffering)

### 3. 演练重启与回滚

1. 导入一份合成文档并发起会话。重启服务后登录同一账号，验证文档与会话仍可访问。
2. 用 `mysqldump --single-transaction` 备份 InnoDB 表，并在新建的 `kb_workshop_restore` 恢复。由数据库管理员先建恢复库并授权，演练时将应用的 `DB_NAME` 指向恢复库，检查刚才的文档和会话。按实际环境替换命令中的地址、端口和账号。备份期间暂停表结构变更。 [MySQL 备份工具](https://dev.mysql.com/doc/refman/8.4/en/mysqldump.html)
3. 演练回滚应用版本。先确认数据库结构兼容，再切回上一版源码。涉及不兼容迁移时，按事先演练的恢复方案处理，并确认恢复点之后的数据如何保留。

```bash
mysqldump -h 127.0.0.1 -P 3306 -u workshop -p --single-transaction --no-tablespaces --set-gtid-purged=OFF --result-file=kb-workshop.sql kb_workshop
mysql -h 127.0.0.1 -P 3306 -u workshop -p kb_workshop_restore -e "SOURCE kb-workshop.sql"
```

## 验收

- [ ] 有一份可复跑评测报告，能逐个说明失败样本和版本变化。
- [ ] 反馈可回读，仅请求所属用户可提交，额度耗尽时拒绝调用。
- [ ] 测试环境走 HTTPS，流式、取消、用户隔离和重启保留均通过。
- [ ] 能按请求 ID 排查问题，完成一次备份恢复和版本回滚演练。

参考实现。 [ops.mjs](/blog/ai-app-workshop/ops.mjs) · [evaluate.mjs](/blog/ai-app-workshop/evaluate.mjs) · [eval-cases.json](/blog/ai-app-workshop/eval-cases.json) · [运行配置模板](/blog/ai-app-workshop/config.env.example)
