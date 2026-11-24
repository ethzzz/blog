# lab/ — 数据库与缓存章节的实测环境

这条目录只服务一件事：**站内「MySQL 学习路线」和「Redis 学习路线」两个模块里出现的每个数字，都必须能在这里复跑出来**。
没有对应实验支撑的结论，在正文里一律写成「机制推导」或明确标注未实测。

## 运行位置

宿主是 Windows，容器引擎在 **WSL Ubuntu-24.04 内的 dockerd**（不是 Docker Desktop）。
两个环境约束直接影响脚本写法，改脚本前必读：

1. **NAT 模式没有 localhost 转发** → 不映射任何端口，一切命令走 `docker exec` 进容器执行。
   想在宿主直连 6379/3306 的写法在这里一律失效。
2. **`docker exec` 不带 `-i` 时 stdin 不会进容器** → `redis-cli --pipe`、here-doc 灌 SQL 都会静默丢输入。
   上一版就是栽在这儿：2000 条写入实际落库 0 条，`master_repl_offset` 只涨了 1690 字节，
   于是"丢失窗口 = 0"这个假结论看起来完全成立。

## 目录

| 文件 | 作用 | 产出 |
| --- | --- | --- |
| `redis/docker-compose.yml` | 1 主 2 从 + 3 哨兵（默认），6 节点 Cluster（`--profile cluster`） | — |
| `redis/sentinel.conf` | 哨兵模板；每个实例启动时 cp 到自己的可写路径 | — |
| `redis/11-failover.sh` | 转移时间线、已确认写入丢失、`min-replicas` 取舍 | `evidence/redis-failover.txt` |
| `redis/12-cluster.sh` | 槽分配、MOVED、CROSSSLOT、hash tag、单主故障接管 | `evidence/redis-cluster.txt` |
| `mysql/docker-compose.yml` + `conf/*.cnf` | 一主一从，GTID + ROW binlog + `log_replica_updates` | — |
| `mysql/00-setup-replication.sh` | 建复制账号、`CHANGE REPLICATION SOURCE`、验证只读边界 | 控制台 |
| `mysql/run-experiments.sh` | 执行计划、MVCC 可见性、间隙锁与死锁、刷盘语义、复制延迟 | `evidence/mysql-experiments.txt` |

跑法（在 WSL 内）：

```bash
cd /mnt/e/code/astro-blog-fuwari/lab/redis && bash 11-failover.sh
cd /mnt/e/code/astro-blog-fuwari/lab/mysql  && docker compose up -d && bash 00-setup-replication.sh && bash run-experiments.sh
```

每个脚本自带 `down -v` 重置，可以重复跑。数据都在命名卷里，别把卷挂到宿主目录。

## 已经证到的（可直接引用）

- 主从基线与偏移量对齐方式（`master_repl_offset` / `slave_repl_offset` 逐字节可比）。
- **异步复制的已确认写入丢失**：摘掉全部副本后 pipeline 写 2000 条（`errors: 0, replies: 2000`），
  副本侧一条没有；旧主自己的 AOF 里 2000 条都在 —— 丢的不是数据，是「谁当主」的决定权。
- **`min-replicas-to-write` 的真实症状**：`NOREPLICAS Not enough good replicas to write.`，
  批量 500 条 `errors: 500, replies: 500`；把副本接回去后写立刻 `OK`。
- **哨兵切换会发生、且返回的是 IP 而不是容器名**：`+sdown → +odown → +try-failover → +switch-master` 完整时间线，
  新主形如 `172.18.0.4:6379`。

## 还没证到 / 需要绕开的（正文里不许写成实测）

- **`+tilt` 会让自动切换完全失效，这是本环境当前的主要障碍。**
  哨兵日志里连着出现 `# +tilt #tilt mode entered`：Sentinel 的事件循环被拖慢超过约 2 秒就进 tilt 模式，
  **tilt 期间它既不判定客观下线，也不发起 failover**。现象与"选举参数配错"几乎一样
  （三个哨兵里只有一个记到 `+sdown`、等 240 秒也不切换、`切换后 role:master 的容器 = 无`），
  但根因是 CPU 饥饿：这台 2 vCPU 的 WSL 上同时跑着 1 主 2 从 + 3 哨兵 + 6 节点 Cluster + 镜像解压。
  结论口径：**切换耗时的绝对值在本环境不可信**，正文只报机制（sdown/odown/quorum/parallel-syncs/failover-timeout
  各控制哪一段）+ 明确写「容器资源不足时哨兵会进 tilt，自动切换会静默不发生」这条真实故障模式。
  要拿可信数字：独占 CPU 重跑，或把 `down-after-milliseconds` 放大到 15000 降低误判灵敏度。

- **切换耗时的绝对值**。这个环境里出现过 `-failover-abort-not-elected`，一轮选举要等 `failover-timeout` 重试，
  所以测出来的是「单机 Docker + 三哨兵同主机名」下的耗时，不能当作生产参考值。
  正文只报机制（sdown/odown/选举/retry 各受哪个参数控制）+ 「本环境实测区间」的口径。
- **`innodb_flush_log_at_trx_commit=2` 会丢事务**这件事，**进程级 `docker kill` 证不了**：
  杀的是 mysqld 进程，OS 页缓存与 redo 还在，所以 =1 与 =2 都丢 0 行。
  要真证明需要整机掉电或内核崩溃。这是 `run-experiments.sh` 第 4 节必须写明的前提，
  否则就是把「未证」写成「实测」。
- Cluster 的 resharding 只记录了命令形态与可观测状态，没做真实迁移（迁移期间数据分布变化会污染后续实验）。

## 三个已知坑（改脚本前先读）

1. `deploy.replicas: 3` 让三个哨兵共用主机名 `redis-sentinel`。哨兵靠 IP 互相发现没问题，
   但配合 `resolve-hostnames yes` 时会出现「主从地址一会儿是服务名、一会儿是 IP」的混合视图，
   判据必须写成"三哨兵对非旧主达成共识"，不能 grep 单个哨兵的 `+switch-master` 日志（只有当选 leader 的会写）。
2. 脚本必须**每组实验前整体重置并动态发现主节点**（按 `INFO replication` 里的 `role:master`）。
   上一版 A 组把 replica-a 提成新主，B/C 继续假设主叫 `redis-master`，
   于是往只读副本写入，拿到 `READONLY` 却误以为在验证 `NOREPLICAS` —— 两种错误长得几乎一样。
3. `SHOW REPLICA STATUS` 的 `Seconds_Behind_Source` 是 SQL 线程相对 IO 线程的秒级取整差值，
   不含网络传输，不能当「读己之写」的依据；那要用 GTID 等待。
4. **compose 改了配置但容器还是旧的**，而且不报"你没生效"。这次是 YAML 里 `"mysqladmin ... -p\"$$PWD\""`
   的 `\"` 属于非法转义 → go-yaml 直接拒绝解析整个文件，`down`/`up` 全部没执行，
   旧容器继续跑着上一版 `--defaults-extra-file=/etc/mysql/conf.d/lab.cnf`。
   症状是"我明明改了 command，gtid_mode 还是 OFF"。
   两条硬规矩：改完 compose 先 `docker compose config` 过一遍（错误进 stderr，别 `2>/dev/null` 吞掉），
   再 `docker inspect -f '{{.Config.Cmd}}'` 肉眼确认新参数真的落在容器上；
   healthcheck.test 用**列表 + 明文标量**写法（`- CMD-SHELL` / `- mysqladmin ping ... -p"$$VAR"`），
   双引号在明文标量里是普通字符，不需要转义。
5. **不要在吞掉输出的前提下判断部署成功**：本轮所有"环境就绪"的误判，
   都发生在 `>/dev/null 2>&1` 之后。要么看输出，要么在脚本里加预检查断言（run-experiments.sh 已加）。

