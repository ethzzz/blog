---
title: '数据库与 MySQL'
published: 2026-09-18T13:00:00+08:00
description: 'MySQL 数据库全面讲解：关系型数据库概念、SQL 四大类（DDL/DML/DQL/DCL）、多表连接、窗口函数、索引原理与优化、视图与存储过程、Python 接入 MySQL 及 Hive 入门。'
tags: [Python, MySQL, SQL, 数据库, 索引, Hive]
category: Python学习路线
draft: false
---

> [!NOTE]
> 本文对应仓库 **Day36~45**：关系型数据库与 MySQL、SQL 详解、索引优化、Python 接入数据库、Hive 实战。数据库是后端开发的基石，SQL 更是每个程序员的必备技能。

---

## 一、关系型数据库概述

关系型数据库（RDBMS）用**二维表**存储数据，表之间通过外键关联，支持 SQL 查询和事务（ACID）。

| 概念 | 说明 |
|:--|:--|
| 数据库 Database | 多张表的集合 |
| 表 Table | 行（记录）+ 列（字段） |
| 主键 Primary Key | 唯一标识一行，非空且唯一 |
| 外键 Foreign Key | 关联另一张表的主键 |
| 索引 Index | 加速查询的数据结构 |
| 事务 Transaction | 一组操作，要么全成功要么全失败 |

```bash
# 安装 MySQL（Ubuntu）
sudo apt install mysql-server
sudo systemctl start mysql

# 连接
mysql -u root -p

# 基本命令
SHOW DATABASES;              # 查看所有数据库
CREATE DATABASE shop;        # 建库
USE shop;                    # 选择数据库
SHOW TABLES;                 # 查看所有表
DESC users;                  # 查看表结构
```

---

## 二、SQL 之 DDL（数据定义）

DDL 用于定义数据库结构（库、表、字段）。

```sql
-- 建表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,        -- 自增主键
    username VARCHAR(50) NOT NULL UNIQUE,     -- 非空且唯一
    email VARCHAR(100),
    age INT DEFAULT 0,                        -- 默认值
    balance DECIMAL(10, 2),                   -- 精确小数（金额）
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 修改表
ALTER TABLE users ADD COLUMN phone VARCHAR(20);       -- 加列
ALTER TABLE users MODIFY COLUMN age SMALLINT;         -- 改列类型
ALTER TABLE users DROP COLUMN phone;                  -- 删列
ALTER TABLE users RENAME TO members;                  -- 改表名

-- 删除表 / 库
DROP TABLE IF EXISTS users;
DROP DATABASE IF EXISTS shop;
```

### 常用数据类型

| 类型 | 说明 |
|:--|:--|
| INT / BIGINT | 整数 / 大整数 |
| DECIMAL(M,D) | 精确小数（金额必用，避免 float 精度问题） |
| VARCHAR(n) | 变长字符串 |
| CHAR(n) | 定长字符串 |
| TEXT | 大文本 |
| DATE / DATETIME / TIMESTAMP | 日期 / 日期时间 / 时间戳 |
| JSON | JSON 类型（MySQL 5.7+） |
| BOOLEAN | 布尔（实际是 TINYINT） |

---

## 三、SQL 之 DML（数据操作）

DML 用于增删改数据。

```sql
-- 插入
INSERT INTO users (username, email, age) VALUES ('tom', 'tom@x.com', 25);
INSERT INTO users (username, age) VALUES ('amy', 30), ('bob', 28);   -- 批量

-- 更新
UPDATE users SET age = 26 WHERE username = 'tom';
UPDATE users SET age = age + 1 WHERE age < 30;   -- 表达式更新

-- 删除
DELETE FROM users WHERE id = 1;
DELETE FROM users;                 -- 删所有行（可回滚）
TRUNCATE TABLE users;              -- 清空表（更快，不可回滚，重置自增）
```

> [!WARNING]
> `UPDATE` / `DELETE` **一定要带 WHERE**！不带条件会修改/删除全表数据，是生产事故高发区。执行前先用相同 WHERE 跑一遍 `SELECT` 确认影响范围。

---

## 四、SQL 之 DQL（数据查询，重点）

查询是 SQL 最核心、最复杂的部分。

### 基本查询

```sql
-- 投影与别名
SELECT username AS name, age FROM users;
SELECT * FROM users;                       -- 查所有列（生产慎用）

-- 筛选 WHERE
SELECT * FROM users WHERE age > 18;
SELECT * FROM users WHERE age BETWEEN 18 AND 30;
SELECT * FROM users WHERE username IN ('tom', 'amy');
SELECT * FROM users WHERE username LIKE 't%';     -- 模糊（% 任意多，_ 单个）
SELECT * FROM users WHERE email IS NULL;          -- 空值判断用 IS NULL
SELECT * FROM users WHERE age > 18 AND balance > 100;

-- 去重
SELECT DISTINCT city FROM users;

-- 排序（ASC 升序默认，DESC 降序）
SELECT * FROM users ORDER BY age DESC, username ASC;

-- 分页（LIMIT 偏移量, 条数）
SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 20;   -- 跳过20取10条
SELECT * FROM users LIMIT 20, 10;                     -- 等价写法
```

### 聚合与分组

```sql
-- 聚合函数
SELECT COUNT(*) FROM users;                    -- 计数
SELECT AVG(age), MAX(balance), MIN(balance), SUM(balance) FROM users;

-- 分组 GROUP BY
SELECT city, COUNT(*) AS num, AVG(age) AS avg_age
FROM users
GROUP BY city;

-- 分组后筛选 HAVING（WHERE 不能用聚合函数，HAVING 可以）
SELECT city, COUNT(*) AS num
FROM users
GROUP BY city
HAVING COUNT(*) > 10;
```

> [!NOTE]
> **WHERE vs HAVING**：`WHERE` 在分组**前**过滤行，不能用聚合函数；`HAVING` 在分组**后**过滤组，可以用聚合函数。执行顺序：FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT。

### 多表连接（JOIN）

```sql
-- 假设有 orders 表：orders(id, user_id, amount)

-- 内连接：只返回两表都匹配的行
SELECT u.username, o.amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- 左连接：返回左表全部 + 右表匹配（无匹配为 NULL）
SELECT u.username, o.amount
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- 右连接：返回右表全部
SELECT u.username, o.amount
FROM users u
RIGHT JOIN orders o ON u.id = o.user_id;

-- 自连接（表和自己连）
SELECT e.name AS 员工, m.name AS 上级
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;
```

```
连接类型示意：
内连接 INNER JOIN     A ∩ B          （交集）
左连接 LEFT JOIN      A 全部 + B匹配  （A 为主）
右连接 RIGHT JOIN     B 全部 + A匹配  （B 为主）
全连接 FULL JOIN      A ∪ B          （并集，MySQL 不支持，用 UNION 模拟）
```

### 子查询与窗口函数

```sql
-- 子查询：嵌套在另一个查询里
SELECT username FROM users
WHERE age > (SELECT AVG(age) FROM users);      -- 大于平均年龄

SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders WHERE amount > 1000);

-- 窗口函数（MySQL 8.0+）：不合并行，做组内计算
-- 每个城市内按余额排名
SELECT username, city, balance,
    RANK() OVER (PARTITION BY city ORDER BY balance DESC) AS rk,
    ROW_NUMBER() OVER (PARTITION BY city ORDER BY balance DESC) AS rn,
    SUM(balance) OVER (PARTITION BY city) AS city_total
FROM users;
```

| 窗口函数 | 作用 |
|:--|:--|
| `ROW_NUMBER()` | 连续序号 1,2,3,4 |
| `RANK()` | 排名（并列跳号）1,2,2,4 |
| `DENSE_RANK()` | 排名（并列不跳号）1,2,2,3 |
| `LAG(col, n)` | 取前 n 行的值 |
| `LEAD(col, n)` | 取后 n 行的值 |

---

## 五、SQL 之 DCL（数据控制）

```sql
-- 创建用户
CREATE USER 'app'@'localhost' IDENTIFIED BY 'password';

-- 授权
GRANT SELECT, INSERT ON shop.* TO 'app'@'localhost';   -- 授予某库权限
GRANT ALL PRIVILEGES ON shop.* TO 'admin'@'%';         -- 授予全部权限
FLUSH PRIVILEGES;                                       -- 刷新权限

-- 回收权限
REVOKE INSERT ON shop.* FROM 'app'@'localhost';

-- 删除用户
DROP USER 'app'@'localhost';
```

---

## 六、视图、函数与存储过程

```sql
-- 视图：把复杂查询封装成"虚拟表"
CREATE VIEW active_users AS
SELECT id, username, email FROM users WHERE age > 18;
SELECT * FROM active_users;              -- 像查表一样用

-- 存储过程：封装一段可复用的 SQL 逻辑
DELIMITER //
CREATE PROCEDURE get_user_count(OUT total INT)
BEGIN
    SELECT COUNT(*) INTO total FROM users;
END //
DELIMITER ;
CALL get_user_count(@n);                 -- 调用
SELECT @n;
```

---

## 七、索引

### 索引原理

索引用 **B+ 树**结构加速查询，把全表扫描 O(n) 降到 O(log n)，但会占用空间、拖慢写入。

```sql
-- 创建索引
CREATE INDEX idx_username ON users(username);         -- 普通索引
CREATE UNIQUE INDEX idx_email ON users(email);        -- 唯一索引
CREATE INDEX idx_city_age ON users(city, age);        -- 复合索引
CREATE INDEX idx_name ON users(username(10));         -- 前缀索引（长字符串）

-- 查看 / 删除
SHOW INDEX FROM users;
DROP INDEX idx_username ON users;
```

### 执行计划（EXPLAIN）

```sql
-- 分析查询是否用到索引
EXPLAIN SELECT * FROM users WHERE username = 'tom';
```

| 关键字段 | 含义 |
|:--|:--|
| type | 访问类型，性能：system > const > eq_ref > ref > range > index > ALL |
| key | 实际使用的索引 |
| rows | 预估扫描行数（越少越好） |
| Extra | Using index（覆盖索引，好）/ Using filesort（需优化） |

### 索引使用注意事项

```
✅ 该建索引的场景：
- WHERE、JOIN、ORDER BY、GROUP BY 频繁用到的列
- 区分度高的列（如用户名、订单号）
- 复合索引遵循"最左前缀"原则

❌ 索引失效的场景：
- 对索引列做运算/函数：WHERE YEAR(created_at)=2026（改用范围）
- 隐式类型转换：WHERE phone = 138xxx（phone 是字符串却传数字）
- LIKE '%xxx' 以通配符开头
- 复合索引不满足最左前缀
- OR 连接非索引列
```

---

## 八、Python 接入 MySQL

```bash
pip install pymysql        # 或 mysql-connector-python
```

```python
import pymysql

# 1. 创建连接
conn = pymysql.connect(
    host="localhost",
    port=3306,
    user="root",
    password="your_password",      # 生产用环境变量
    database="shop",
    charset="utf8mb4",
    cursorclass=pymysql.cursors.DictCursor,   # 结果返回字典
)

try:
    # 2. 获取游标
    with conn.cursor() as cursor:
        # 3. 执行 SQL（用参数化查询防 SQL 注入！）
        sql = "SELECT * FROM users WHERE age > %s"
        cursor.execute(sql, (18,))          # 参数用元组，%s 占位

        # 4. 抓取数据
        rows = cursor.fetchall()            # 取全部
        # one = cursor.fetchone()           # 取一条
        # many = cursor.fetchmany(10)       # 取多条
        for row in rows:
            print(row["username"], row["age"])

        # 增删改需要提交事务
        cursor.execute(
            "INSERT INTO users (username, age) VALUES (%s, %s)",
            ("new_user", 20),
        )
        conn.commit()                       # 提交
except Exception as e:
    conn.rollback()                         # 出错回滚
    print(f"数据库错误：{e}")
finally:
    conn.close()                            # 释放连接
```

> [!WARNING]
> **绝不要用字符串拼接 SQL**（`f"SELECT * FROM users WHERE name='{name}'"`）！这会导致 **SQL 注入**攻击。永远用 `%s` 占位符 + 参数元组，让驱动做转义。

### 编写 ETL 脚本

```python
# ETL：Extract（提取）→ Transform（转换）→ Load（加载）
def etl_example():
    # Extract：从源库读取
    with conn.cursor() as cursor:
        cursor.execute("SELECT id, username, balance FROM users")
        rows = cursor.fetchall()

    # Transform：清洗转换
    cleaned = [
        {"id": r["id"], "name": r["username"].strip().upper(),
         "level": "VIP" if r["balance"] > 1000 else "普通"}
        for r in rows if r["balance"] is not None
    ]

    # Load：写入目标表
    with conn.cursor() as cursor:
        cursor.executemany(
            "INSERT INTO user_summary (id, name, level) VALUES (%s,%s,%s)",
            [(c["id"], c["name"], c["level"]) for c in cleaned],
        )
        conn.commit()
```

---

## 九、Hive 入门（大数据）

Hive 是建立在 Hadoop 上的数据仓库工具，用类 SQL（HQL）查询 HDFS 上的海量数据。

```sql
-- Hive 适合离线大数据分析（TB/PB 级），不适合在线事务

-- 建表
CREATE TABLE logs (
    user_id INT,
    action STRING,
    ts TIMESTAMP
)
PARTITIONED BY (dt STRING);        -- 按日期分区（重要优化）

-- 加载数据
LOAD DATA INPATH '/data/logs' INTO TABLE logs PARTITION (dt='2026-09-18');

-- 查询（和 MySQL 语法基本一致）
SELECT user_id, COUNT(*) AS cnt
FROM logs
WHERE dt = '2026-09-18'            -- 分区过滤，避免全表扫描
GROUP BY user_id;

-- 性能优化要点：
-- 1. 分区裁剪：WHERE 带上分区字段
-- 2. 只选需要的列（列式存储 ORC/Parquet）
-- 3. 小表用 MAP JOIN
-- 4. 避免 COUNT(DISTINCT)，改用 GROUP BY 后计数
```

---

## 常见问题 Q&A

**Q1：MySQL 和 Hive 的区别？**
A：MySQL 是 OLTP（在线事务处理），面向业务系统，毫秒级响应，数据量 GB 级；Hive 是 OLAP（在线分析处理），面向数据仓库，分钟级响应，数据量 TB/PB 级，用于离线分析。

**Q2：为什么金额字段要用 DECIMAL 不用 FLOAT？**
A：FLOAT/DOUBLE 是二进制浮点，有精度误差（`0.1 + 0.2 != 0.3`）。金额必须用 `DECIMAL(M,D)` 精确定点数，避免"少一分钱"的账务问题。

**Q3：`DELETE`、`TRUNCATE`、`DROP` 区别？**
A：`DELETE` 删行（可带 WHERE，可回滚，DML）；`TRUNCATE` 清空整表（不可回滚，重置自增，DDL）；`DROP` 删表结构+数据（表都没了）。

**Q4：什么是 SQL 注入？怎么防？**
A：把用户输入拼进 SQL，攻击者可输入 `' OR '1'='1` 绕过验证。防护：**永远用参数化查询**（`%s` 占位符），不要字符串拼接；输入校验；最小权限。

**Q5：`WHERE` 和 `HAVING` 到底怎么选？**
A：过滤**行**（分组前）用 `WHERE`；过滤**组**（分组后，含聚合函数如 `COUNT(*)>10`）用 `HAVING`。能用 WHERE 提前过滤就别放到 HAVING，性能更好。

**Q6：复合索引 `(a, b, c)` 怎么用才生效？**
A：遵循**最左前缀**原则。`WHERE a=?`、`WHERE a=? AND b=?`、`WHERE a=? AND b=? AND c=?` 能用；但 `WHERE b=?`（跳过 a）用不上。范围查询（`>`、`<`、`LIKE`）后的列也用不上索引。

**Q7：连接池有什么用？**
A：频繁创建/销毁数据库连接开销大。连接池（如 DBUtils、SQLAlchemy）预先建好一批连接复用，大幅提升性能。生产环境必用连接池，ORM（SQLAlchemy/Django ORM）通常自带。

---

## 复习卡片

> [!TIP]
> **数据库速记**
>
> 1. **SQL 四类**：DDL（建改删表 CREATE/ALTER/DROP）、DML（增删改 INSERT/UPDATE/DELETE）、DQL（查询 SELECT）、DCL（权限 GRANT/REVOKE）
> 2. **查询顺序**：FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
> 3. **WHERE vs HAVING**：分组前过滤行用 WHERE，分组后过滤组用 HAVING
> 4. **JOIN**：INNER（交集）、LEFT（左全）、RIGHT（右全）；ON 写连接条件
> 5. **窗口函数**：`ROW_NUMBER/RANK/DENSE_RANK OVER(PARTITION BY ... ORDER BY ...)`，不合并行
> 6. **索引**：B+ 树，加速读拖慢写；最左前缀；`EXPLAIN` 看执行计划
> 7. **索引失效**：列上运算/函数、隐式类型转换、`LIKE '%x'`、不满足最左前缀
> 8. **Python 接入**：pymysql，游标 execute + `%s` 参数化，事务 commit/rollback
> 9. **防注入**：永远参数化查询，不拼接 SQL
> 10. **Hive**：离线大数据分析，分区裁剪是关键优化

---

> [!TIP]
> 下一篇：[Django 入门](/blog/posts/python-roadmap-09-django-basics/) 将进入 Web 开发，讲解 Django 框架快速上手、ORM 模型与 CRUD、静态资源与 Ajax、Cookie 和 Session、报表日志以及中间件的应用。
>
> 返回 [Python 学习路线总览](/blog/posts/python-roadmap-00-overview/) | [合集页](/blog/python-roadmap/)
