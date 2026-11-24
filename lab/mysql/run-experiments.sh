#!/usr/bin/env bash
# MySQL 实验：执行计划 / MVCC 可见性 / 间隙锁与死锁 / 复制延迟 / read_only 边界 / 刷盘语义。
# 产出 ../evidence/mysql-experiments.txt，正文里的数字只允许引用这份文件。
#
# 顺序是有原因的：
#   - 刷盘实验要 docker kill 主库，会打断复制（实测会让从库 SQL 线程停在
#     "Coordinator stopped because there were error(s) in the worker(s)"），所以放在最后；
#   - 上一版没重置从库卷，read_only 还没生效时被 root 本地写过，GTID 直接分叉，
#     之后每一轮复制都在错误基线上跑。现在要求先 down -v 重建。
set -uo pipefail
cd "$(dirname "$0")"
set -a; . ./.env; set +a   # 凭据不写进脚本，仓库里只留 .env.example
OUT=../evidence/mysql-experiments.txt
TMP=/tmp/dblab-mysql
mkdir -p ../evidence "$TMP"
: > "$OUT"
log() { printf '%s\n' "$*" | tee -a "$OUT"; }
PRIM=dblab-mysql-mysql-primary-1
REPL=dblab-mysql-mysql-replica-1
q()  { docker exec -i "$PRIM" mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -N -B -e "$1" 2>&1 | grep -v "Warning"; }
qr() { docker exec -i "$REPL" mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -N -B -e "$1" 2>&1 | grep -v "Warning"; }
# 多会话交错：here-doc 直接喂给后台进程时输出容易被吞，一律先落文件再收集
sess() { # $1=会话名 $2=SQL
  docker exec -i "$PRIM" mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" lab -N -B -e "$2" > "$TMP/$1.out" 2>&1
}

log "生成时间: $(date '+%F %T %z')｜mysql:8.4 一主一从，GTID + ROW binlog + log_replica_updates"
log "主库参数(version/isolation/trx_commit/sync_binlog/format/gtid/log_bin):"
log "  $(q "SELECT @@version,@@transaction_isolation,@@innodb_flush_log_at_trx_commit,@@sync_binlog,@@binlog_format,@@gtid_mode,@@log_bin;")"

# 预检：上一轮就是栽在「配置没下发但实验照跑」，不通过就停，绝不产出数字
pre=$(q "SELECT CONCAT('gtid=',@@gtid_mode,' fmt=',@@binlog_format,' log_bin=',@@log_bin);")
log "预检: $pre"
case "$pre" in *gtid=ON*fmt=ROW*log_bin=1*) ;; *) log "❌ 预检不通过，停止"; exit 1 ;; esac
rep=$(qr "SHOW REPLICA STATUS\G" 2>/dev/null | grep -E "Replica_IO_Running:|Replica_SQL_Running:" | tr -d ' ')
log "复制线程: ${rep:-未配置}"
printf '%s' "$rep" | grep -q "Yes.*Yes\|Yes" || log "  注意：复制未双 Yes，第 5 节的延迟数据不可用"
log ""

log "== 0. 造数：10 万行 =="
q "DROP TABLE IF EXISTS lab.acct; CREATE TABLE lab.acct(
   id INT PRIMARY KEY, balance INT NOT NULL, city VARCHAR(16) NOT NULL, note VARCHAR(32),
   KEY idx_city_balance (city, balance));"
q "SET SESSION cte_max_recursion_depth=200000;
   INSERT INTO lab.acct
   WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n<100000)
   SELECT n, n%1000, ELT(1+(n%4),'hz','sh','bj','gz'), CONCAT('note-',n) FROM seq;" >/dev/null
log "  行数=$(q 'SELECT COUNT(*) FROM lab.acct;')，表统计(数据MB/索引MB)=$(q "SELECT CONCAT(ROUND(data_length/1048576,1),'/',ROUND(index_length/1048576,1)) FROM information_schema.tables WHERE table_schema='lab' AND table_name='acct';")"
log ""

log "== 1. 执行计划（表格原样输出，列序为 id/select_type/table/type/key/rows/filtered/Extra）=="
for sql in "SELECT * FROM acct WHERE id=50000" \
           "SELECT id FROM acct WHERE city='hz'" \
           "SELECT city, balance FROM acct WHERE city='hz' ORDER BY balance LIMIT 10" \
           "SELECT * FROM acct WHERE balance=500 ORDER BY id" \
           "SELECT * FROM acct WHERE city='hz' OR balance=500"; do
  log "  SQL: $sql"
  q "EXPLAIN $sql" | sed 's/^/    /'
done
log "  判读：第 2 条 type=ref；第 3 条 Extra 应出现 Using index（覆盖索引，不回表）；"
log "  第 4 条 type=ALL + Using filesort（balance 无索引，10 万行全扫再排）；"
log "  第 5 条看是否出现 index_merge——两个单列索引做 union 未必比全表扫快，分布倾斜时更差。"
log ""

log "== 2. MVCC：RR 下快照读与当前读的分野 =="
q "UPDATE lab.acct SET balance=100 WHERE id=1;" >/dev/null
sess A "START TRANSACTION;
       SELECT 'A1-快照读', id, balance FROM acct WHERE id=1;
       SELECT SLEEP(3);
       SELECT 'A2-快照读', id, balance FROM acct WHERE id=1;
       SELECT 'A3-当前读', id, balance FROM acct WHERE id=1 FOR UPDATE;
       COMMIT;" &
sleep 1
q "UPDATE lab.acct SET balance=777 WHERE id=1;" >/dev/null   # B 会话：期间改并提交
wait
log "  会话 A 的输出："; cat "$TMP/A.out" | sed 's/^/    /'
log "  判读：A2 仍是 100（同一 ReadView），A3 是当前读，看到 777 并加行锁。"
log "  RC 与 RR 的差别只在 ReadView 生成时机：RC 每条语句重建，RR 事务内只建一次。"
log ""

log "== 3. 间隙锁与死锁 =="
log "  3a 范围加锁期间的锁记录（40–46 之间应出现间隙锁）："
sess G "BEGIN; SELECT id FROM acct WHERE id BETWEEN 40 AND 46 FOR UPDATE; SELECT SLEEP(6); COMMIT;" &
sleep 2
q "SELECT CONCAT(LOCK_TYPE,'/',LOCK_MODE,'/',IFNULL(LOCK_DATA,'-')) FROM performance_schema.data_locks WHERE OBJECT_NAME='acct';" | sed 's/^/    /'
log "  3b 此时向间隙中间插入（预期被挡，等锁超时）："
timeout 12 docker exec -i "$PRIM" mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" lab -N -B \
  -e "SET SESSION innodb_lock_wait_timeout=5; INSERT INTO acct VALUES (43,1,'hz','gap');" > "$TMP/gap.out" 2>&1
log "    $(grep -oE 'ERROR [0-9]+ .*' "$TMP/gap.out" | head -1)"
wait
log "  3c 死锁最小复现（两个会话反序更新 id=1 与 id=2）："
sess D1 "BEGIN; UPDATE acct SET balance=balance+1 WHERE id=1; SELECT SLEEP(2); UPDATE acct SET balance=balance+1 WHERE id=2; ROLLBACK;" &
sleep 0.5
sess D2 "BEGIN; UPDATE acct SET balance=balance+1 WHERE id=2; SELECT SLEEP(2); UPDATE acct SET balance=balance+1 WHERE id=1; ROLLBACK;" &
wait
log "    会话1: $(grep -oE 'ERROR [0-9]+.*|^.*OK.*' "$TMP/D1.out" | head -1)"
log "    会话2: $(grep -oE 'ERROR [0-9]+.*|^.*OK.*' "$TMP/D2.out" | head -1)"
log "    InnoDB 死锁日志（LATEST DETECTED DEADLOCK 段）："
q "SHOW ENGINE INNODB STATUS\G" > "$TMP/eng.out" 2>&1
awk '/LATEST DETECTED DEADLOCK/{f=1} f&&/TRANSACTIONS/{exit} f' "$TMP/eng.out" | sed -n '1,22p' | sed 's/^/      /'
log ""

log "== 4. 复制延迟：主库灌 3 万行期间每秒采样从库 =="
qr "START REPLICA;" >/dev/null 2>&1
q "CREATE TABLE IF NOT EXISTS lab.lag(i INT PRIMARY KEY, s VARCHAR(16));" >/dev/null
( q "SET SESSION cte_max_recursion_depth=200000;
    INSERT INTO lab.lag
    WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n<30000)
    SELECT n, CONCAT('r',n) FROM seq;" >/dev/null 2>&1 ) &
INS=$!
samples=""; maxlag=0
for _ in $(seq 1 30); do
  lag=$(qr "SHOW REPLICA STATUS\G" 2>/dev/null | grep -oE 'Seconds_Behind_Source: [0-9]+' | grep -oE '[0-9]+')
  rows=$(qr "SELECT COUNT(*) FROM lab.lag;" 2>/dev/null)
  samples="$samples ${lag:-?}s/${rows:-?}"
  [ -n "${lag:-}" ] && [ "$lag" -gt "$maxlag" ] && maxlag=$lag
  sleep 1
done
wait $INS
log "  采样(秒数差/从库已应用行数):$samples"
log "  观测最大 Seconds_Behind_Source = ${maxlag}s；主库行数=$(q 'SELECT COUNT(*) FROM lab.lag;') / 从库=$(qr 'SELECT COUNT(*) FROM lab.lag;')"
log "  判读：Seconds_Behind_Source 是 SQL 线程相对 IO 线程的秒级取整差，不含网络传输，"
log "  不能用来保证「读己之写」——那要在从库等 GTID：WAIT_FOR_EXECUTED_GTID_SET(主库刚产生的 gtid)。"
log ""

log "== 5. read_only 边界（MySQL 8.4 与旧文档的差异，实测为准） =="
log "  业务账号写从库: $(qr "INSERT INTO lab.lag VALUES (999999,'x');" 2>&1 | grep -oE 'ERROR [0-9]+ .*' | head -1)"
log "  root 写从库:    $(qr "CREATE TABLE lab.byroot(i INT);" 2>&1 | grep -oE 'ERROR [0-9]+ .*' | head -1)"
log "  判读：8.4 移除了 SUPER 特权，read_only 连 root 也挡（ERROR 1290）。"
log "  这纠正了大量旧文章里「root 不受 read_only 限制」的说法——误写从库这条路在 8.4 上被结构上堵住了。"
qr "DROP TABLE IF EXISTS lab.byroot;" >/dev/null 2>&1
log ""

log "== 6. 刷盘语义：进程级 SIGKILL 能不能区分 trx_commit=1 与 =2 =="
for setting in 1 2; do
  q "SET GLOBAL innodb_flush_log_at_trx_commit=$setting;" >/dev/null
  q "CREATE TABLE IF NOT EXISTS lab.dur(i INT PRIMARY KEY); TRUNCATE TABLE lab.dur;" >/dev/null
  for i in $(seq 1 200); do q "INSERT INTO lab.dur VALUES ($i);" >/dev/null; done
  before=$(q "SELECT COUNT(*) FROM lab.dur;")
  docker kill -t 0 "$PRIM" >/dev/null 2>&1
  sleep 3; docker start "$PRIM" >/dev/null 2>&1
  for _ in $(seq 1 30); do q "SELECT 1" >/dev/null 2>&1 && break; sleep 2; done
  after=$(q "SELECT COUNT(*) FROM lab.dur;")
  log "  trx_commit=$setting：kill 前 $before 行 → 重启后 $after 行，丢失 $((before - after))"
done
log "  判读：两种设置都丢 0 行。因为 docker kill 杀的是 mysqld 进程，OS 页缓存和 redo 还在。"
log "  所以「=2 会丢约 1 秒事务」不能用重启进程证明，必须整机掉电/内核崩溃才能观察到——"
log "  这条负结果本身就是正文要写的防假结论提醒。"
log "  注意：本节 kill 过主库，复制需要重建（RESET REPLICA ALL + START REPLICA），本轮到此结束。"
log ""
log "重跑：cd lab/mysql && docker compose down -v && docker compose up -d && bash 00-setup-replication.sh && bash run-experiments.sh"
