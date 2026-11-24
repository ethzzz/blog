#!/usr/bin/env bash
# Redis Cluster 实测：槽分配、MOVED 与 CROSSSLOT、hash tag、单主故障由副本接管。
# 产出 ../evidence/redis-cluster.txt。
#
# 与哨兵那套的关系要写清楚：Cluster 自己判断可达与投票，不依赖哨兵；
# 上一轮踩到的「哨兵返回 IP 而不是主机名」在这里以另一种形式出现——cluster nodes 里全是容器 IP。
set -uo pipefail
cd "$(dirname "$0")"
OUT=../evidence/redis-cluster.txt
mkdir -p ../evidence
: > "$OUT"
log() { printf '%s\n' "$*" | tee -a "$OUT"; }
N1=dblab-redis-redis-c1-1
rc() { docker exec "$1" redis-cli "${@:2}"; }

log "生成时间: $(date '+%F %T %z')｜redis:7-alpine ×6（3 主 3 从）"
log ""
log "== 1. 组集群 =="
docker compose --profile cluster down -v >/dev/null 2>&1
docker compose --profile cluster up -d >/dev/null 2>&1
sleep 8
NODES="redis-c1:6379 redis-c2:6379 redis-c3:6379 redis-c4:6379 redis-c5:6379 redis-c6:6379"
out=$(docker exec $N1 redis-cli --cluster create $NODES --cluster-replicas 1 --cluster-yes 2>&1)
log "$(printf '%s' "$out" | grep -E '>>> Allocating|>>> Merging|>>> Node|OK: All|master| slaves' | sed 's/^/  /' | head -14)"
log ""

log "== 2. 集群状态与槽分配 =="
log "  cluster_state / slots: $(rc $N1 CLUSTER INFO | tr -d '\r' | grep -E 'cluster_state|cluster_slots_ok|cluster_size|cluster_known_nodes' | tr '\n' ' ')"
log "  各主节点槽区间:"
rc $N1 CLUSTER NODES | awk '$3~/master/ {print "    " $2" slots="$9}' | sed 's/[ ,]*$//'
log ""

log "== 3. MOVED：请求打到不持有该槽的节点 =="
slot=$(rc $N1 CLUSTER KEYSLOT foo)
owner=$(rc $N1 CLUSTER NODES | awk -v s="$slot" '$3~/master/{for(i=9;i<=NF;i++) if($i ~ /-/){split($i,a,"-"); if(a[1]<=s && s<=a[2]) print $2}}' | head -1)
log "  KEYSLOT foo = $slot，持有者 = $owner"
wrong=$(rc $N1 CLUSTER NODES | awk '$3~/master/ && $2!~"'"$(printf '%s' "$owner" | cut -d@ -f1)"'" {print $2; exit}')
log "  直接向非持有节点写: $(printf '%s' "$(rc $N1 SET foo v)" | tr -d '\r')"
log "  （-c 客户端会自动跟随 MOVED，但裸 redis-cli 会把这个错误抛给你——业务代码里那层重定向处理不能省）"
log ""

log "== 4. CROSSSLOT：多键命令的硬约束 =="
s1=$(rc $N1 CLUSTER KEYSLOT foo); s2=$(rc $N1 CLUSTER KEYSLOT bar)
log "  KEYSLOT foo=$s1 / bar=$s2 → MSET: $(printf '%s' "$(rc $N1 MSET foo 1 bar 2)" | tr -d '\r')"
log "  加 hash tag 后同槽: KEYSLOT {u}:foo=$(rc $N1 CLUSTER KEYSLOT '{u}:foo') / {u}:bar=$(rc $N1 CLUSTER KEYSLOT '{u}:bar')"
log "  用 tag 的 MSET: $(printf '%s' "$(rc $N1 MSET '{u}:foo' 1 '{u}:bar' 2)" | tr -d '\r')"
log "  事务同理: $(printf '%s' "$(rc $N1 MULTI)" | tr -d '\r') + 跨槽 EXEC → $(rc $N1 EVAL "return 1" 2 foo bar 2>&1 | tr -d '\r' | head -1)"
log ""

log "== 5. 单主故障：副本接管 =="
# 用容器 IP 反查容器名（CLUSTER NODES 给的是 IP，不是容器名；上一版这里用 grep 硬凑映射是坏的）
victim=$(rc $N1 CLUSTER NODES | awk '$3=="master"{print $2; exit}' | cut -d@ -f1 | cut -d: -f1)
victim_c=""
for c in $(docker ps --format '{{.Names}}' | grep 'dblab-redis-redis-c'); do
  ip=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' "$c")
  [ "$ip" = "$victim" ] && victim_c="$c"
done
# 探针必须落在一个还活着的节点上——$N1 本身可能就是被打的那个主
probe=""
for c in $(docker ps --format '{{.Names}}' | grep 'dblab-redis-redis-c'); do
  [ "$c" = "$victim_c" ] && continue
  docker exec "$c" redis-cli ping >/dev/null 2>&1 && { probe="$c"; break; }
done
log "  被打的主 = $victim（容器 ${victim_c:-未匹配}），探针节点 = ${probe:-无}"
t0=$(date +%s)
docker kill "${victim_c:-noop}" >/dev/null 2>&1
state=""
for _ in $(seq 1 60); do
  state=$(rc "${probe:-$N1}" CLUSTER INFO 2>/dev/null | grep cluster_state | tr -d '\r')
  printf '%s' "$state" | grep -q 'ok' && break
  sleep 1
done
log "  kill 后 cluster_state 恢复 ok 用时 $(( $(date +%s) - t0 ))s → $state"
log "  故障期间往该槽写入的结果: $(printf '%s' "$(rc "${probe:-$N1}" SET duringfail v 2>&1 | tr -d '\r' | head -1)")"
log "  当前角色分布: $(rc "${probe:-$N1}" CLUSTER NODES | awk 'NR>0{c[$3]++} END{for(k in c) printf "%s=%d ", k, c[k]}')"
docker start "${victim_c:-noop}" >/dev/null 2>&1
sleep 5
log "  旧主回归后的角色: $(docker exec "${victim_c:-noop}" redis-cli INFO replication 2>/dev/null | grep -E '^role' | tr -d '\r')（Cluster 里旧主回来只会当副本，不会自动抢回）"
log ""

log "== 6. 扩缩容的代价（本轮不做真实迁移，只记录判据） =="
log "  迁移一个槽的命令形态: redis-cli --cluster reshard <node> --cluster-from <srcId> --cluster-to <dstId> --cluster-slots 1 --cluster-yes"
log "  迁移期间的三种可观测状态: importing/migrating 计数、ASK 重定向（槽还在迁时旧主会把请求转给新主）、以及客户端缓存的槽表过期窗口。"
log "  判据口径：迁移期间 P99 会抬升，且**跨槽多键操作在迁移完成后 key 分布变了才会成功**，别把 ASK 当 bug 吞掉。"
log ""
log "重跑：bash 12-cluster.sh（自带 down -v 重建）"
