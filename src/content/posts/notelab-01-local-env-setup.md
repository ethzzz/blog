---
title: 'NoteLab 本地开发环境的准备'
published: 2026-10-03
description: '在一台全新的 Windows 上把 NoteLab（Spring Boot + 双前端 + MySQL）跑起来要装什么、配什么、验证到哪一步算成功，以及五个不写在文档里就会卡半天的坑。'
tags: [NoteLab, 环境搭建, Java, Spring Boot, MySQL, 全栈]
category: notelab
draft: false
---

> [!NOTE]
> 这是 **notelab 分组**的第一篇。这个分组专门放我在 NoteLab 这套自研项目上踩过的坑和沉淀下来的做法，偏"工程实录"，不是教程。

事情的起因很简单：我想在本机把后端跑起来改点东西，结果发现这台机器上 **Java 项目根本起不来**——不是代码问题，是环境一个都没有。于是把「从零到能启动」这件事完整走了一遍，记在这里。

## 一、先搞清楚这个项目是什么形状

NoteLab 不是一个仓库，是**四个仓库 + 一台服务器**，各管一段：

| 仓库 | 技术栈 | 本地端口 | 作用 |
|---|---|---|---|
| `notelab-java` | Spring Boot 3.4 / Java 17 | 8001 | 后端 API，所有 `/api/*` 都在这里 |
| `notelab-c` | Next.js | 3010 | C 端，个人主页 + 游戏中心 |
| `notelab-b` | Next.js + antd | 3020 | B 端管理后台 |
| `ai-lab` | FastAPI + Vite | 8002 | AI 试验场 |

线上由 nginx 统一入口：`/` 走 C 端、`/admin` 走 B 端、`/api` 走后端。也就是说**开发环境和生产环境的请求路径不一样**——这一点后面会咬人。

## 二、环境清单：哪些必须有，哪些没有也能跑

我实际扫了一遍本机，结论是「必须有」的三样全缺：

| 组件 | 版本要求 | 状态 | 说明 |
|---|---|---|---|
| JDK | 17（LTS） | 缺 | `pom.xml` 写死 `<java.version>17</java.version>`，别装 21 |
| Maven | 3.6+ | 缺 | PATH 里没有；本地仓库只有 34MB，首次构建要联网下依赖 |
| MySQL | 8.0 | 已装但缺库 | 服务在跑，但没有项目用的库和账号 |
| Node | 22 | 有 | 前端用，注意本机可能有多版本 |
| Git | — | 有 | — |
| Redis | — | 可选 | **没有也能启动**，限流会自动降级成内存实现 |
| 大模型 Key | — | 可选 | **没有也能启动**，只是 AI 相关接口不可用 |

两个"可选"值得单独说一句。这个项目的**限流做了降级**：优先用 Redis，连不上就退化为进程内的滑动窗口，所以本地不装 Redis 完全没问题。大模型 Key 同理，启动时日志会打印一行"未配置"，不阻塞启动。

这三个判断很重要——它决定了「最小可启动集」其实只有：**JDK + Maven + 一个能连的 MySQL**。

## 三、数据库：不用导表结构，但要建库建账号

先说个好消息：**表结构不用手动导**。后端的 `Bootstrap` 在启动时会跑一遍 `CREATE TABLE IF NOT EXISTS`，把所有表建齐，而且是幂等的，重启多少次都不会动已有数据。这是这个项目做得挺舒服的一点。

所以只需要建库和账号：

```sql
CREATE DATABASE IF NOT EXISTS notelab
  DEFAULT CHARACTER SET utf8mb4;

CREATE USER IF NOT EXISTS 'notelab'@'%'
  IDENTIFIED BY '<换成你自己的密码>';

GRANT ALL PRIVILEGES ON notelab.* TO 'notelab'@'%';
FLUSH PRIVILEGES;
```

我一开始直接用项目默认账号（`notelab` + 空密码）去连，报了：

```
ERROR 1045 (28000): Access denied for user 'notelab'@'localhost'
```

这就是"库还没建"的典型症状，不是配置写错了。

## 四、配置：环境变量三级回退，.env 按当前目录读

配置读取的优先级是：**系统环境变量 > 当前目录下的 `.env` > 代码里的默认值**。

这里有个非常容易踩的细节：`.env` 是按**当前工作目录**相对路径读的，不是按 jar 包位置、也不是按仓库根目录。这意味着——

```bash
# 对：在仓库目录下启动
cd E:/code/NoteLab/notelab-java
java -jar target/notelab-java.jar

# 错：在别处用绝对路径启动，.env 读不到，配置全走默认值
java -jar E:/code/NoteLab/notelab-java/target/notelab-java.jar
```

同样的坑在生产环境已经踩过一次：进程管理器的 `cwd` 配错，环境变量就丢了，服务重启后直接崩。**凡是"按工作目录读配置"的设计，启动方式都必须固定。**

需要配的键（只列键名，值自己填）：

| 键 | 默认值 | 本地要不要改 |
|---|---|---|
| `MYSQL_HOST` | `127.0.0.1` | 不改 |
| `MYSQL_PORT` | `3306` | 不改 |
| `MYSQL_USER` | `notelab` | 不改 |
| `MYSQL_PASSWORD` | 空 | **要改**，填上面建号时设的密码 |
| `MYSQL_DB` | `notelab` | 不改 |
| `SPIRE_ASSET_ROOT` | `/root/notelab-c/public/spire` | **要改**，这是 Linux 路径，Windows 上扫不到素材 |
| `REDIS_HOST` / `REDIS_PORT` | `127.0.0.1:6379` | 不装 Redis 就不改 |

`SPIRE_ASSET_ROOT` 这条单独强调：它是给「游戏素材扫盘」接口用的，指向前端仓库的素材目录。默认值是服务器上的 Linux 路径，在本机会静默失败——不报错，只是扫出来 0 个素材，然后你会以为是素材没上传。

## 五、启动与验证

```bash
cd E:/code/NoteLab/notelab-java

# 构建：注意别用管道接 tail，那样拿到的是 tail 的退出码
mvn -DskipTests package > build.log 2>&1; echo $?

# 启动
java -jar target/notelab-java.jar
```

验证启动成功的信号：

```bash
curl -i http://127.0.0.1:8001/api/menu
# 期望：401（未登录），不是 404，也不是连接失败
```

看到 401 就说明：端口起来了、路由注册了、数据库连上了。至于 `mvn` 退出码那个提醒——`mvn ... | tail` 拿到的是 `tail` 的退出码，永远是 0，构建失败也会显示成功，这个坑值得一再强调。

后端监听地址在配置里写的是 `127.0.0.1`，端口 `8001`，本地不冲突。

## 六、前端：两个前端的处境完全不同

| 前端 | 本地状态 | 说明 |
|---|---|---|
| `notelab-b` | 依赖已装 | `npm run dev` 直接能起，但 basePath 是 `/admin` |
| `notelab-c` | 无 `node_modules` | 要先 `npm install` |

还有一个联调陷阱：前端代码里的接口请求是**同源相对路径** `/api/*`，靠生产环境的 nginx 转发到后端。本地跑 dev server 时，`/api` 会打到前端自己的端口上，直接 404。

解决方式是临时在 `next.config` 里加一条 rewrite 指向 `http://127.0.0.1:8001`——但**这个改动不要提交**，因为生产环境刻意不加这条规则（注释里明确写了原因）。本地配置的临时改动混进生产配置，是那种"上线后才发现"的经典事故。

## 七、五个坑的清单

1. **`.env` 按工作目录读** → 必须在仓库目录下启动，否则配置静默走默认值
2. **`SPIRE_ASSET_ROOT` 默认是 Linux 路径** → Windows 上素材接口扫出 0 个，且不报错
3. **`mvn ... | tail` 的退出码是 tail 的** → 构建失败也会显示成功，用重定向到文件再 `echo $?`
4. **本地联调 `/api` 打不通** → 生产靠 nginx 转发，本地要临时加 rewrite，且别提交
5. **空库能启动，但没有账号** → 表建好了但用户表是空的，登录不了后台；想完整体验要从生产环境导一份数据

## 小结

回头看，这套环境的「最小启动集」很小：**JDK 17 + Maven + 一个 MySQL 库**。Redis 和大模型 Key 都是可选项，因为代码里都做了降级处理——这其实是判断一个项目对新手是否友好的重要指标：**可选依赖有没有优雅降级，比文档写得多详细更重要**。

而真正会浪费时间的，往往不是"装什么"，而是那些不说就不知道的隐式约定：配置按工作目录读、默认路径是 Linux 的、退出码被管道吃掉了。这类东西不上手撞一次基本发现不了。
