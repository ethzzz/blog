#!/usr/bin/env bash
# MySQL 实验：执行计划 / MVCC 可见性 / 锁与死锁 / 刷盘语义 / 复制延迟。
# 产出 ../evidence/mysql-experiments.txt，正文里的数字只允许引用这份文件。
set -uo pipefail
cd "$(dirname "$0")"
set -a; . ./.env; set +a   # 凭据不写进脚本，仓库里只留 .env.example
OUT=../evidence/mysql-experiments.txt
mkdir -p ../evidence
: > "$OUT"
log() { printf '%s\n' "$*" | tee -a "$OUT"; }
PRIM=dblab-mysql-mysql-primary-1
REPL=dblab-mysql-mysql-replica-1
# root 走 -N -B 便于机器读；业务账号 lab 用来复现「非 super 用户被 read_only 挡住」这类真实症状
q()  { docker exec -i "$PRIM" mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -N -B -e "$1" 2>&1 | grep -v "Using a password"; }
qr() { docker exec -i "$REPL" mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -N -B -e "$1" 2>&1 | grep -v "Using a password"; }
u()  { docker exec -i "$PRIM" mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" lab -e "$1" 2>&1 | grep -v "Using a password"; }
ur() { docker exec -i "$REPL" mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" lab -e "$1" 2>&1 | grep -v "Using a password"; }

log "生成时间: $(date '+%F %T %z')｜mysql:8.4 一主一从，GTID + ROW binlog + log_replica_updates"
log "主库参数: $(q "SELECT @@version, @@transaction_isolation, @@innodb_flush_log_at_trx_commit, @@sync_binlog, @@binlog_format, @@gtid_mode, @@log_bin")"

# 预检：上一轮就是因为 .cnf 被 mysqld 当 world-writable 静默忽略，gtid_mode 停在 OFF，
# 于是所有实验都在空数据上「跑成功」。环境没就绪时必须当场失败，不许继续往下写结论。
pre=$(q "SELECT CONCAT('gtid=', @@gtid_mode, ' binlog=', @@binlog_format, ' log_bin=', @@log_bin);")
log "预检: $pre"
case "$pre" in
  *gtid=ON*binlog=ROW*log_bin=1*) ;;
  *) log "❌ 预检不通过：GTID/binlog 没生效（多半是配置没下发）。停止，不产出任何数字。"; exit 1 ;;
esac
rl=$(qr "SELECT @@read_only;")
log "从库 read_only = $rl（应为 1）"
[ "$rl" = "1" ] || { log "❌ 从库 read_only 未生效，拓扑与假设不符。停止。"; exit 1; }
log ""

# 造一张 10 万行的表，后面的索引/锁/复制实验都复用它
log "== 准备数据：10 万行 =="
q "DROP TABLE IF EXISTS lab.acct; CREATE TABLE lab.acct(
     id INT PRIMARY KEY, balance INT NOT NULL, city VARCHAR(16) NOT NULL, note VARCHAR(32),
     KEY idx_city_balance (city, balance));"
q "SET SESSION cte_max_recursion_depth = 200000;
   INSERT INTO lab.acct
   WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n < 100000)
   SELECT n, n % 1000, ELT(1 + (n % 4), 'hz', 'sh', 'bj', 'gz'), CONCAT('note-', n) FROM seq;" 2>&1 | tail -1
log "行数 = $(q 'SELECT COUNT(*) FROM lab.acct;')，表统计: $(q "SELECT ROUND(data_length/1024/1024,1), ROUND(index_length/1024/1024,1) FROM information_schema.tables WHERE table_schema='lab' AND table_name='acct';")"
log ""

# ---------- 1. 执行计划 ----------
log "== 1. 执行计划：同一句 WHERE 四种写法 =="
for sql in \
  "SELECT * FROM acct WHERE id=50000" \
  "SELECT * FROM acct WHERE city='hz'" \
  "SELECT city, balance FROM acct WHERE city='hz' ORDER BY balance LIMIT 10" \
  "SELECT * FROM acct WHERE balance=500 ORDER BY id" \
  "SELECT * FROM acct WHERE city='hz' OR balance=500" ; do
  log "SQL: $sql"
  q "EXPLAIN FORMAT=TRADITIONAL $sql\G" | grep -E "type:|key:|rows:|filtered:|Extra:" | sed 's/^ *//' | tr '\n' ' ' | sed 's/ \(type\|key\|rows\|filtered\|Extra\):/ | \1:/g'
  log ""
done
log "提示：上面第 3 条应该看到 Extra 里的 Using index（覆盖索引），第 4 条是 type=ALL + Using filesort（balance 无索引），"
log "第 5 条若出现 index_merge/Using union，就是优化器把两个单列索引拼起来——它在数据分布倾斜时反而比全表扫更慢。"
log ""

# ---------- 2. MVCC 可见性 ----------
log "== 2. MVCC：RR 下一次一致性读与当前读的分野 =="
q "UPDATE lab.acct SET balance=100 WHERE id=1;" >/dev/null
# 会话 A 先建快照，睡 3 秒；期间会话 B 改数据并提交
docker exec -i "$PRIM" mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" lab -N -B <<'SQL' &
START TRANSACTION;
SELECT 'A-快照读1', id, balance FROM acct WHERE id=1;
SELECT SLEEP(3);
SELECT 'A-快照读2', id, balance FROM acct WHERE id=1;
SELECT 'A-当前读', id, balance FROM acct WHERE id=1 FOR UPDATE;
COMMIT;
SQL
SA=$!
sleep 1
u "UPDATE acct SET balance=777 WHERE id=1;" >/dev/null
wait $SA 2>/dev/null
log ""
log "会话 A 三次读的结果差值就是 MVCC 的答案：快照读2 仍看到 100（ReadView 未变），当前读 FOR UPDATE 看到 777（读最新版本并加锁）。"
log "RC 与 RR 的差别只在 ReadView 的生成时机：RC 每条语句重建，RR 事务首条快照语句建一次。"
log ""

# ---------- 3. 锁与死锁 ----------
log "== 3. 间隙锁：范围加锁后，中间插入会被阻塞 =="
q "BEGIN; SELECT id FROM acct WHERE id BETWEEN 40 AND 46 FOR UPDATE;" >/dev/null
docker exec -i "$PRIM" mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" lab -N -B -e "SET SESSION innodb_lock_wait_timeout=4; BEGIN; INSERT INTO acct VALUES (43, 1, 'hz', 'gap');" 2>&1 | grep -oE "ERROR [0-9]+.*" | head -1 | sed 's/^/  插入 43: /'
log "  持锁期间的锁记录（performance_schema.data_locks）："
q "SELECT OBJECT_NAME, INDEX_NAME, LOCK_TYPE, LOCK_MODE, LOCK_STATUS, LOCK_DATA FROM performance_schema.data_locks WHERE OBJECT_NAME='acct' ORDER BY LOCK_DATA LIMIT 8;" | sed 's/^/    /'
q "COMMIT;" >/dev/null
log ""
log "== 3b. 死锁最小复现（两个会话反序更新同一组行） =="
docker exec -i "$PRIM" mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" lab -N -B <<'SQL' &
BEGIN; UPDATE acct SET balance=balance+1 WHERE id=1; SELECT SLEEP(2); UPDATE acct SET balance=balance+1 WHERE id=2; ROLLBACK;
SQL
DB1=$!
sleep 0.5
docker exec -i "$PRIM" mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" lab -N -B <<'SQL'
BEGIN; UPDATE acct SET balance=balance+1 WHERE id=2; SELECT SLEEP(2); UPDATE acct SET balance=balance+1 WHERE id=1; ROLLBACK;
SQL
DB2=$!
wait $DB1 2>/dev/null
log "  上面两段输出的错误码里，被回滚的那一个是死锁牺牲者（ERROR 1213）。"
log "  InnoDB 死锁日志摘录（SHOW ENGINE INNODB STATUS 的 LATEST DETECTED DEADLOCK）："
q "SHOW ENGINE INNODB STATUS\G" | sed -n '/LATEST DETECTED DEADLOCK/,/ENGINE INNODB TRANSSECTION/p;/------------------------$/,/TRANSACTION/p' | sed -n '1,26p' | sed 's/^/    /'
log ""

# ---------- 4. 刷盘语义 ----------
log "== 4. 刷盘：trx_commit=1 vs =2，进程级 SIGKILL 真的能区分吗 =="
for setting in 1 2; do
  q "SET GLOBAL innodb_flush_log_at_trx_commit=$setting;" >/dev/null
  q "CREATE TABLE IF NOT EXISTS lab.dur(i INT PRIMARY KEY); TRUNCATE TABLE lab.dur;" >/dev/null
  for i in $(seq 1 200); do q "INSERT INTO lab.dur VALUES ($i);" >/dev/null; done
  before=$(q "SELECT COUNT(*) FROM lab.dur;")
  docker kill -t 0 "$PRIM" >/dev/null 2>&1
  sleep 3
  docker start "$PRIM" >/dev/null 2>&1
  for _ in $(seq 1 30); do q "SELECT 1" >/dev/null 2>&1 && break; sleep 2; done
  after=$(q "SELECT COUNT(*) FROM lab.dur;")
  log "  trx_commit=$setting：kill 前 $before 行 → 重启后 $after 行，丢失 $((before - after))"
done
log "  判读：这里两种设置都丢 0 行 —— 因为 docker kill 杀的是 mysqld 进程，OS 页缓存与 redo 仍在。"
log "  所以「=2 会丢 1 秒事务」这个结论不能用进程重启来证明，必须整机掉电/内核崩溃。这个实验现场本身就是正文里要写的那条防假结论提醒。"
q "SET GLOBAL innodb_flush_log_at_trx_commit=1;" >/dev/null
log ""

# ---------- 5. 复制延迟 ----------
log "== 5. 复制延迟：主库灌 3 万行期间轮询从库 =="
docker exec -i "$REPL" mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -N -B -e "START REPLICA;" >/dev/null 2>&1
q "SET SESSION cte_max_recursion_depth = 200000;
   INSERT INTO lab.acct
   WITH RECURSIVE seq(n) AS (SELECT 100001 UNION ALL SELECT n+1 FROM seq WHERE n < 130000)
   SELECT n, n % 997, 'nb', CONCAT('lag-', n) FROM seq;" >/dev/null 2>&1 &
INS=$!
max_lag=0
samples=""
for _ in $(seq 1 40); do
  lag=$(qr "SHOW REPLICA STATUS\G" 2>/dev/null | grep -oE 'Seconds_Behind_Source: [0-9]+' | grep -oE '[0-9]+')
  rows=$(qr "SELECT COUNT(*) FROM lab.acct;" 2>/dev/null)
  samples="$samples ${lag:-?}s/${rows:-?}行"
  [ -n "${lag:-}" ] && [ "$lag" -gt "$max_lag" ] && max_lag=$lag
  sleep 1
done
wait $INS 2>/dev/null
log "  采样序列:$samples"
log "  观测到的最大 Seconds_Behind_Source = ${max_lag}s"
log "  从库最终行数 = $(qr 'SELECT COUNT(*) FROM lab.acct;')，主库 = $(q 'SELECT COUNT(*) FROM lab.acct;')"
log "  注意 Seconds_Behind_Source 是「SQL 线程落后 IO 线程的秒数」，它按秒取整、且不含网络传输；真正的读己之写问题要用 GTID 等待（主库取 gtid，从库 WAIT_FOR_EXECUTED_GTID_SET）而不是读这个数。"
log ""
log "== 6. 从库拒绝业务写入（read_only 的实际作用范围） =="
log "  lab 账号写入: $(ur "INSERT INTO acct VALUES (999999,1,'x','y');" 2>&1 | grep -oE 'ERROR [0-9]+ .*' | head -1)"
log "  root 写入:   $(qr "CREATE TABLE lab.byroot(i INT);" 2>&1 | grep -oE 'ERROR [0-9]+ .*|^$' | head -1)（root 有 SUPER/CONNECTION_ADMIN，read_only 不挡它 —— 这正是误写从库事故能发生的原因）"
qr "DROP TABLE IF EXISTS lab.byroot;" >/dev/null
log ""
log "重跑：先 bash 00-setup-replication.sh，再 bash run-experiments.sh"
