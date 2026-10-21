---
title: 'MySQL 面试题（前端工程师必备后端知识）'
published: 2026-09-16T14:00:00+08:00
description: '讲解索引原理（B+树）、事务 ACID 与隔离级别、SQL 优化、锁机制、分库分表等前端工程师需要了解的后端知识。'
tags: [前端面试, MySQL, 索引, 事务, SQL优化]
category: 前端面试宝典
draft: false
---

> [!NOTE]
> 本文包含 20+ 道 MySQL 面试题，面向需要了解后端知识的中高级前端工程师，难度标注：⭐ 基础 · ⭐⭐ 进阶 · ⭐⭐⭐ 高级

---

## 索引

### Q1: MySQL 索引的类型？⭐ 🔥

**答：**

| 索引类型 | 说明 |
|:--|:--|
| 主键索引 (PRIMARY KEY) | 唯一标识，不允许 NULL |
| 唯一索引 (UNIQUE) | 值唯一，允许 NULL |
| 普通索引 (INDEX) | 最基本的索引 |
| 联合索引 (COMPOSITE) | 多列组合索引 |
| 全文索引 (FULLTEXT) | 文本搜索 |

```sql
-- 创建索引
CREATE INDEX idx_username ON users(username);
CREATE UNIQUE INDEX idx_email ON users(email);
CREATE INDEX idx_name_age ON users(name, age);  -- 联合索引

-- 查看索引
SHOW INDEX FROM users;

-- 删除索引
DROP INDEX idx_username ON users;
```

### Q2: 为什么使用 B+ 树而不是 B 树？⭐⭐⭐ 🔥

**答：**

```
B 树：
        [30|60]
       /   |   \
   [10|20] [40|50] [70|80]
   (数据存储在内部节点)

B+ 树：
        [30|60]           ← 内部节点只存键值
       /   |   \
   [10|20] [40|50] [70|80]
      ↓       ↓       ↓
   [data]  [data]  [data]  ← 叶子节点存数据
      ↔       ↔       ↔    ← 叶子节点链表相连
```

**B+ 树优势：**

| 特性 | B 树 | B+ 树 |
|:--|:--|:--|
| 数据存储位置 | 所有节点 | 只在叶子节点 |
| 叶子节点链表 | 无 | 有（便于范围查询） |
| 查询稳定性 | 不稳定（可能在内部节点找到） | 稳定（必须到叶子节点） |
| 磁盘 I/O | 较多 | 较少（内部节点更小） |
| 范围查询 | 需要中序遍历 | 链表顺序扫描 |

### Q3: 聚簇索引和非聚簇索引的区别？⭐⭐ 🔥

**答：**

```
聚簇索引（InnoDB 主键）：
┌─────────────────────────────────┐
│  B+ 树叶子节点存储完整行数据    │
│  数据即索引，索引即数据         │
└─────────────────────────────────┘

非聚簇索引（二级索引）：
┌─────────────────────────────────┐
│  B+ 树叶子节点存储主键值        │
│  需要"回表"查询完整数据         │
└─────────────────────────────────┘
```

```sql
-- 回表示例
SELECT * FROM users WHERE name = 'Tom';
-- 1. 在 name 索引树找到主键 id = 100
-- 2. 在主键索引树找到 id = 100 的完整行数据（回表）

-- 避免回表：覆盖索引
SELECT id, name FROM users WHERE name = 'Tom';
-- name 索引已包含 id 和 name，无需回表
```

### Q4: 最左前缀原则？⭐⭐ 🔥

**答：**

联合索引 `(a, b, c)` 的查询规则：

```sql
-- ✅ 命中索引
WHERE a = 1                    -- 命中 a
WHERE a = 1 AND b = 2          -- 命中 a, b
WHERE a = 1 AND b = 2 AND c = 3 -- 命中 a, b, c

-- ❌ 不命中或部分命中
WHERE b = 2                    -- 不命中（缺少最左列 a）
WHERE c = 3                    -- 不命中
WHERE b = 2 AND c = 3          -- 不命中

-- ⚠️ 范围查询后停止
WHERE a = 1 AND b > 2 AND c = 3  -- 命中 a, b（c 不命中，范围后停止）

-- ✅ 索引下推（MySQL 5.6+）
WHERE a = 1 AND b LIKE '%test%' AND c = 3
-- ICP 优化：在索引层过滤 b，减少回表
```

### Q5: 索引失效的情况？⭐⭐ 🔥

```sql
-- 1. 对索引列使用函数
WHERE YEAR(create_time) = 2024        -- ❌ 失效
WHERE create_time >= '2024-01-01'     -- ✅ 命中

-- 2. 隐式类型转换
WHERE phone = 13800138000             -- ❌ phone 是 varchar，数字会转换
WHERE phone = '13800138000'           -- ✅ 命中

-- 3. LIKE 以 % 开头
WHERE name LIKE '%Tom'                -- ❌ 失效
WHERE name LIKE 'Tom%'                -- ✅ 命中

-- 4. OR 条件有非索引列
WHERE name = 'Tom' OR age = 20        -- ❌ age 无索引，全表扫描

-- 5. != 和 NOT IN
WHERE status != 1                     -- ❌ 可能失效
WHERE status NOT IN (1, 2)            -- ❌ 可能失效

-- 6. IS NULL / IS NOT NULL（视数据分布）
WHERE name IS NULL                    -- 可能失效

-- 7. 联合索引不满足最左前缀
-- 见上题
```

---

## 事务

### Q6: 事务的 ACID 特性？⭐ 🔥

**答：**

| 特性 | 说明 | 实现机制 |
|:--|:--|:--|
| **A** (Atomicity) 原子性 | 事务要么全成功，要么全失败 | undo log |
| **C** (Consistency) 一致性 | 事务前后数据状态一致 | 其他三个特性保证 |
| **I** (Isolation) 隔离性 | 并发事务互不干扰 | 锁 + MVCC |
| **D** (Durability) 持久性 | 提交后数据永久保存 | redo log |

```sql
-- 事务示例
START TRANSACTION;

UPDATE account SET balance = balance - 100 WHERE id = 1;
UPDATE account SET balance = balance + 100 WHERE id = 2;

COMMIT;  -- 或 ROLLBACK;
```

### Q7: 事务隔离级别？⭐⭐ 🔥

**答：**

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|:--|:--|:--|:--|
| READ UNCOMMITTED | ✅ | ✅ | ✅ |
| READ COMMITTED | ❌ | ✅ | ✅ |
| REPEATABLE READ (MySQL默认) | ❌ | ❌ | ✅* |
| SERIALIZABLE | ❌ | ❌ | ❌ |

```sql
-- 查看隔离级别
SELECT @@transaction_isolation;

-- 设置隔离级别
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

**并发问题解释：**

```sql
-- 脏读：读到未提交的数据
-- 事务A修改数据但未提交，事务B读到了修改后的值

-- 不可重复读：同一事务内两次读取结果不同
-- 事务A读取数据，事务B修改并提交，事务A再次读取发现变了

-- 幻读：同一事务内两次查询行数不同
-- 事务A查询10行，事务B插入新行，事务A再查询变成11行
```

**MVCC（多版本并发控制）：**

```
MySQL InnoDB 通过 MVCC 实现 REPEATABLE READ 下的非锁定读：

每行数据隐藏列：
- trx_id：最后修改的事务ID
- roll_pointer：指向 undo log 的指针

读取时根据 Read View 判断可见性：
- 事务开始时创建 Read View
- 读取时沿着 roll_pointer 找到可见版本
```

---

## SQL 优化

### Q8: 如何分析慢 SQL？⭐⭐ 🔥

**答：**

```sql
-- 1. 开启慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- 超过1秒记录

-- 2. EXPLAIN 分析执行计划
EXPLAIN SELECT * FROM users WHERE name = 'Tom';

-- 关键字段
-- id: 查询序号
-- select_type: 查询类型（SIMPLE/PRIMARY/SUBQUERY）
-- table: 表名
-- type: 访问类型（性能从好到差）
--   system > const > eq_ref > ref > range > index > ALL
-- possible_keys: 可能使用的索引
-- key: 实际使用的索引
-- rows: 预估扫描行数
-- Extra: 额外信息
--   Using index: 覆盖索引（好）
--   Using where: 需要过滤
--   Using filesort: 需要额外排序（差）
--   Using temporary: 使用临时表（差）
```

### Q9: SQL 优化技巧？⭐⭐ 🔥

```sql
-- 1. 避免 SELECT *
SELECT id, name, email FROM users;  -- ✅ 只查需要的列

-- 2. 使用 LIMIT 分页
SELECT * FROM orders ORDER BY id LIMIT 100000, 10;  -- ❌ 深分页慢
-- 优化：延迟关联
SELECT o.* FROM orders o
INNER JOIN (SELECT id FROM orders ORDER BY id LIMIT 100000, 10) t
ON o.id = t.id;  -- ✅

-- 3. 小表驱动大表
-- IN 适合子查询结果集小
SELECT * FROM users WHERE id IN (SELECT user_id FROM orders WHERE amount > 100);
-- EXISTS 适合外表小
SELECT * FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- 4. 批量操作
INSERT INTO users (name, age) VALUES ('A', 20), ('B', 21), ('C', 22);  -- ✅ 批量
-- 而不是循环单条插入

-- 5. 使用连接查询替代子查询
SELECT u.*, o.amount FROM users u
JOIN orders o ON u.id = o.user_id;  -- ✅ 通常比子查询快

-- 6. 合理使用索引
-- WHERE、ORDER BY、GROUP BY 的列加索引
-- 联合索引把区分度高的列放前面

-- 7. 避免大事务
-- 大事务占用锁时间长，影响并发
```

---

## 锁机制

### Q10: MySQL 有哪些锁？⭐⭐

**答：**

| 锁类型 | 粒度 | 说明 |
|:--|:--|:--|
| 表锁 | 表 | 开销小，并发低 |
| 行锁 | 行 | 开销大，并发高（InnoDB） |
| 共享锁 (S) | 行/表 | 读锁，允许并发读 |
| 排他锁 (X) | 行/表 | 写锁，阻塞其他读写 |
| 间隙锁 (Gap) | 范围 | 防止幻读 |
| 临键锁 (Next-Key) | 行+间隙 | InnoDB 默认 |

```sql
-- 共享锁（读锁）
SELECT * FROM users WHERE id = 1 LOCK IN SHARE MODE;

-- 排他锁（写锁）
SELECT * FROM users WHERE id = 1 FOR UPDATE;

-- 死锁示例
-- 事务A：UPDATE users SET ... WHERE id = 1;
-- 事务B：UPDATE users SET ... WHERE id = 2;
-- 事务A：UPDATE users SET ... WHERE id = 2;  -- 等待B
-- 事务B：UPDATE users SET ... WHERE id = 1;  -- 等待A，死锁！

-- InnoDB 自动检测死锁，回滚代价小的事务
```

---

## 分库分表

### Q11: 什么时候需要分库分表？⭐⭐⭐

**答：**

| 场景 | 方案 |
|:--|:--|
| 单表数据量 > 2000万 | 水平分表 |
| 单库并发 > 2000 | 分库 |
| 读写比例悬殊 | 读写分离 |

```
垂直分库：按业务拆分
┌─────────────────┐    ┌──────┐ ┌──────┐ ┌──────┐
│   单一数据库    │ →  │用户库│ │订单库│ │商品库│
└─────────────────┘    └──────┘ └──────┘ └──────┘

水平分表：按规则分散数据
┌─────────────────┐    ┌────────┐ ┌────────┐ ┌────────┐
│   orders 表     │ →  │orders_0│ │orders_1│ │orders_2│
│   (1亿条)       │    │(hash)  │ │(hash)  │ │(hash)  │
└─────────────────┘    └────────┘ └────────┘ └────────┘

读写分离：
写 → 主库 → 同步 → 从库1（读）
                  → 从库2（读）
```

---

## 复习卡片

| 知识点 | 关键记忆 |
|:--|:--|
| B+ 树 | 叶子节点存数据，链表便于范围查询 |
| 聚簇索引 | 主键索引，数据即索引 |
| 回表 | 二级索引查主键，再查完整数据 |
| 最左前缀 | 联合索引必须从最左列开始 |
| ACID | 原子性、一致性、隔离性、持久性 |
| 隔离级别 | MySQL 默认 REPEATABLE READ |
| MVCC | 多版本并发控制，非锁定读 |
| EXPLAIN | type: ALL 最差，const 最好 |
| 索引失效 | 函数、类型转换、LIKE '%x' |

> [!TIP]
> 下一篇：[后端知识面试题](/blog/posts/interview-guide-11-backend/)
> 
> 涵盖 RESTful API 设计、Node.js、Java 基础、微服务等前端工程师需要了解的后端知识。
