#!/usr/bin/env bash
# 建立 mysql-primary → mysql-replica 的 GTID 复制关系，并验证到位。
# 凭据来自本目录 .env（gitignore），示例见 .env.example。
set -uo pipefail
cd "$(dirname "$0")"
set -a; . ./.env; set +a

P="docker exec -i dblab-mysql-mysql-primary-1 mysql -uroot -p$MYSQL_ROOT_PASSWORD -N -B"
R="docker exec -i dblab-mysql-mysql-replica-1 mysql -uroot -p$MYSQL_ROOT_PASSWORD -N -B"
MASK() { sed "s/$MYSQL_ROOT_PASSWORD/***/g; s/$MYSQL_PASSWORD/***/g; s/$REPL_PASSWORD/***/g"; }

echo "等待两节点就绪…"
for _ in $(seq 1 60); do
  $P -e "SELECT 1" >/dev/null 2>&1 && $R -e "SELECT 1" >/dev/null 2>&1 && break
  sleep 2
done

echo "1. 主库建复制账号（MySQL 8.4 已移除 mysql_native_password，只能用默认的 caching_sha2_password）"
$P -e "CREATE USER IF NOT EXISTS 'repl'@'%' IDENTIFIED BY '$REPL_PASSWORD';
       GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
       FLUSH PRIVILEGES;" 2>&1 | grep -v "Using a password" | MASK || true

echo "2. 从库配置源（GTID 自动定位，不用记 file/pos；GET_SOURCE_PUBLIC_KEY 是 caching_sha2 走 RSA 交换公钥必需）"
$R -e "STOP REPLICA; RESET REPLICA ALL;
       CHANGE REPLICATION SOURCE TO
         SOURCE_HOST='mysql-primary', SOURCE_PORT=3306,
         SOURCE_USER='repl', SOURCE_PASSWORD='$REPL_PASSWORD',
         SOURCE_AUTO_POSITION=1, GET_SOURCE_PUBLIC_KEY=1;
       START REPLICA;" 2>&1 | grep -v "Using a password" | MASK || true
sleep 3

echo "3. 复制状态"
$R -e "SHOW REPLICA STATUS\G" 2>/dev/null | grep -E "Replica_IO_Running|Replica_SQL_Running|Seconds_Behind_Source|Last_IO_Error|Executed_Gtid_Set" | sed 's/^ *//' | MASK

echo "4. 拓扑探针：主库写一条，从库读得到吗"
$P -e "CREATE TABLE IF NOT EXISTS lab.probe(id INT PRIMARY KEY, note VARCHAR(32));
       REPLACE INTO lab.probe VALUES (1, 'from-primary');" 2>&1 | grep -v "Using a password"
sleep 2
$R -e "SELECT * FROM lab.probe;" 2>&1 | grep -v "Using a password" || echo "  从库读不到（复制没通）"

echo "5. 从库只读边界：read_only 只挡非 super 账号"
$R -e "CREATE TABLE IF NOT EXISTS lab.byroot(i INT);" 2>&1 | grep -v "Using a password" >/dev/null && echo "  root 建成了（预期如此：read_only 不挡有 SUPER/CONNECTION_ADMIN 的账号）"
docker exec -i dblab-mysql-mysql-replica-1 mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" lab -e "INSERT INTO probe VALUES (99,'x');" 2>&1 | grep -oE "ERROR [0-9]+ .*" | head -1 | MASK
docker exec -i dblab-mysql-mysql-replica-1 mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "DROP TABLE IF EXISTS lab.byroot; DELETE FROM lab.probe WHERE id=99;" >/dev/null 2>&1
