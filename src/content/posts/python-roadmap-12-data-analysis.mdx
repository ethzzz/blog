---
title: '数据分析：NumPy 与 pandas'
published: 2026-09-18T15:00:00+08:00
description: 'Python 数据分析核心：NumPy 数组（创建/索引/广播/聚合/线性代数）、pandas 的 Series 与 DataFrame、数据读取、清洗（缺失值/重复值/类型）、选择筛选、分组聚合、合并连接、重塑透视与时间序列处理。'
tags: [Python, 数据分析, NumPy, pandas, DataFrame, 数据清洗]
category: Python学习路线
draft: false
---

> [!NOTE]
> 本文对应仓库 **Day66~77**：NumPy 数组计算与 pandas 数据处理。这是数据科学赛道的基石——NumPy 提供高性能数组运算，pandas 提供表格数据处理能力。掌握它们，才能玩转数据分析、可视化和机器学习。

---

# 第一部分：NumPy

## 一、NumPy 概述与数组创建

NumPy（Numerical Python）核心是 **ndarray（多维数组）**，比 Python 列表快几十倍（底层 C 实现、连续内存、向量化运算）。

```bash
pip install numpy
```

```python
import numpy as np

# 从列表创建
a = np.array([1, 2, 3, 4])              # 一维
b = np.array([[1, 2], [3, 4]])          # 二维
print(a.shape)                           # (4,)  形状
print(b.shape)                           # (2, 2)
print(a.dtype)                           # int64 数据类型
print(a.ndim)                            # 2 维度数

# 快速创建特殊数组
np.zeros((2, 3))          # 全 0，2行3列
np.ones((2, 3))           # 全 1
np.full((2, 3), 7)        # 全 7
np.eye(3)                 # 单位矩阵
np.arange(0, 10, 2)       # [0,2,4,6,8]（类似 range）
np.linspace(0, 1, 5)      # [0, 0.25, 0.5, 0.75, 1]（等间隔 5 个点）
np.random.random((2, 3))  # 2×3 随机浮点 [0,1)
np.random.randint(0, 10, (2, 3))    # 随机整数
np.random.randn(2, 3)     # 标准正态分布
```

### 数据类型（dtype）

```python
np.array([1, 2, 3], dtype=np.float32)   # 指定类型
# 常用：int32/int64、float32/float64、bool、object、datetime64
arr.astype(np.float64)                   # 类型转换
```

---

## 二、数组索引与切片

```python
a = np.arange(10)                 # [0 1 2 3 4 5 6 7 8 9]

# 基本索引（和列表一样）
print(a[0], a[-1])                # 0 9
print(a[2:5])                     # [2 3 4]（切片）
print(a[::2])                     # [0 2 4 6 8]（步长 2）

# 二维索引 [行, 列]
b = np.array([[1, 2, 3], [4, 5, 6]])
print(b[0, 1])                    # 2（第0行第1列）
print(b[0])                       # [1 2 3]（第0行）
print(b[:, 1])                    # [2 5]（所有行的第1列）
print(b[0:2, 1:3])                # 子矩阵

# 布尔索引（超常用！）
print(a[a > 5])                   # [6 7 8 9]（筛选大于5的）
print(b[b > 3])                   # [4 5 6]

# 花式索引（用整数数组取多个）
print(a[[0, 2, 4]])               # [0 2 4]
```

> [!WARNING]
> NumPy 切片是**视图（view）**，不是副本！`a[2:5][0] = 99` 会修改原数组 `a`。要独立副本用 `a[2:5].copy()`。这与 Python 列表切片（返回副本）不同。

---

## 三、数组运算与广播

### 向量化运算（无需循环）

```python
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

print(a + b)          # [5 7 9]    逐元素加
print(a * b)          # [4 10 18]  逐元素乘（不是矩阵乘！）
print(a ** 2)         # [1 4 9]    逐元素平方
print(a / b)          # 逐元素除
print(a @ b)          # 点积（矩阵乘法用 @ 或 np.dot）
print(np.sqrt(a))     # 开方
print(np.exp(a))      # e 的幂
```

### 广播（Broadcasting）

不同形状的数组也能运算——NumPy 自动"拉伸"小数组。

```python
# 一维 + 标量：标量广播到每个元素
print(np.array([1, 2, 3]) + 10)     # [11 12 13]

# 二维 + 一维：一维沿行广播
matrix = np.array([[1, 2, 3],
                   [4, 5, 6]])
print(matrix + np.array([10, 20, 30]))
# [[11 22 33]
#  [14 25 36]]

# 广播规则：从尾部维度对齐，维度相等或其中一个为 1 才能广播
```

### 聚合统计

```python
a = np.array([[1, 2, 3], [4, 5, 6]])

print(a.sum())              # 21 全部求和
print(a.sum(axis=0))        # [5 7 9]  按列（压缩行，axis=0 竖着算）
print(a.sum(axis=1))        # [3 15]   按行（压缩列，axis=1 横着算）
print(a.mean())             # 均值
print(a.max(), a.min())     # 最大最小
print(a.argmax())           # 最大值索引
print(a.std())              # 标准差
print(np.median(a))         # 中位数
```

> [!NOTE]
> **axis 记忆法**：`axis=0` 是**沿着行的方向**（竖直向下），结果是"每列的聚合"；`axis=1` 是**沿着列的方向**（水平向右），结果是"每行的聚合"。可以理解为"把哪个维度压扁"。

---

## 四、变形与线性代数

```python
a = np.arange(12)

# 变形
a.reshape(3, 4)         # 变成 3×4（元素总数要一致）
a.reshape(-1, 4)        # -1 自动计算行数
a.flatten()             # 展平成一维
a.T                     # 转置（等价 a.transpose()）

# 拼接
np.concatenate([a, b])              # 沿 axis=0 拼
np.vstack([a, b])                   # 竖直堆叠
np.hstack([a, b])                   # 水平堆叠
np.split(a, 3)                      # 拆分

# 排序、去重
np.sort(a)                          # 排序
np.unique(a)                        # 去重

# 线性代数（np.linalg）
m = np.array([[1, 2], [3, 4]])
np.linalg.inv(m)                    # 逆矩阵
np.linalg.det(m)                    # 行列式
np.linalg.eig(m)                    # 特征值/特征向量
np.linalg.solve(A, b)               # 解线性方程组 Ax=b
```

---

# 第二部分：pandas

## 五、pandas 两大数据结构

pandas 建立在 NumPy 之上，提供**带标签**的数据结构，是数据分析的主力。

```bash
pip install pandas
```

```python
import pandas as pd

# Series：一维带标签数组（类似带索引的 list）
s = pd.Series([10, 20, 30], index=["a", "b", "c"], name="分数")
print(s["a"])            # 10（按标签索引）
print(s.values)          # [10 20 30]（底层数组）
print(s.index)           # Index(['a','b','c'])

# DataFrame：二维表格（最常用，类似 Excel/数据库表）
df = pd.DataFrame({
    "姓名": ["张三", "李四", "王五"],
    "年龄": [25, 30, 28],
    "城市": ["北京", "上海", "广州"],
    "工资": [15000, 20000, 18000],
})
print(df.head())         # 前 5 行（head(n)）
print(df.tail(2))        # 后 2 行
print(df.shape)          # (3, 4) 行列数
print(df.info())         # 概览：列名、非空数、类型
print(df.describe())     # 数值列统计：计数/均值/标准差/分位数
print(df.columns)        # 列名
print(df.dtypes)         # 各列类型
```

```
Series vs DataFrame：
- Series = 一维（一个索引 + 一列值），像带标签的数组
- DataFrame = 二维（行索引 + 多列），像 Excel 表格
- DataFrame 的每一列就是一个 Series
```

---

## 六、数据读取与写入

```python
# 读取
df = pd.read_csv("data.csv")                       # CSV（最常用）
df = pd.read_csv("data.csv", encoding="utf-8", sep=",", index_col=0)
df = pd.read_excel("data.xlsx", sheet_name="Sheet1")  # Excel
df = pd.read_json("data.json")                     # JSON
df = pd.read_sql("SELECT * FROM users", conn)      # 数据库

# 写入
df.to_csv("out.csv", index=False, encoding="utf-8-sig")  # index=False 不写行号
df.to_excel("out.xlsx", index=False)
df.to_json("out.json", orient="records", force_ascii=False)
```

> [!TIP]
> 读中文 CSV 常见乱码：`encoding` 试 `utf-8`、`gbk`、`utf-8-sig`（带 BOM）。`to_csv` 用 Excel 打开乱码就用 `encoding="utf-8-sig"`。`index=False` 避免多出一列无意义的行号。

---

## 七、数据选择与筛选

```python
df = pd.DataFrame({
    "姓名": ["张三", "李四", "王五", "赵六"],
    "年龄": [25, 30, 28, 35],
    "城市": ["北京", "上海", "广州", "北京"],
    "工资": [15000, 20000, 18000, 25000],
})

# 选列
df["姓名"]                    # 单列（返回 Series）
df[["姓名", "工资"]]          # 多列（返回 DataFrame）

# loc：按标签选；iloc：按位置选
df.loc[0]                     # 第0行（标签）
df.loc[0, "姓名"]             # 第0行"姓名"列的值
df.loc[0:2, ["姓名", "工资"]] # 标签切片（含末尾）+ 选列
df.iloc[0:2, 0:2]             # 位置切片（不含末尾）

# 布尔索引（条件筛选，最常用！）
df[df["年龄"] > 28]                       # 年龄大于28的行
df[df["城市"] == "北京"]                  # 北京的行
df[(df["年龄"] > 25) & (df["工资"] > 16000)]  # 多条件用 & | （不是 and or）
df[df["城市"].isin(["北京", "上海"])]     # 在列表中
df[df["姓名"].str.contains("张")]         # 字符串包含

# 筛选列
df.loc[df["年龄"] > 28, ["姓名", "工资"]] # 条件行 + 指定列
```

> [!WARNING]
> 多条件筛选：用 `&`（与）、`|`（或）、`~`（非），**不是** Python 的 `and/or/not`；且每个条件要用**括号**包起来（运算符优先级）。`df[df.a>1 & df.b>2]` 会报错，必须 `df[(df.a>1) & (df.b>2)]`。

---

## 八、数据清洗

真实数据往往"脏"（缺失、重复、类型错、异常值），清洗是数据分析最耗时的一步。

### 缺失值处理

```python
# 检测缺失
df.isnull().sum()              # 每列缺失数量
df.isna().any()                # 哪些列有缺失

# 处理缺失
df.dropna()                    # 删除含缺失的行
df.dropna(axis=1)              # 删除含缺失的列
df.dropna(subset=["工资"])     # 只看某列
df.fillna(0)                   # 用 0 填充
df["工资"].fillna(df["工资"].mean(), inplace=True)  # 用均值填充
df.fillna(method="ffill")      # 用前一个值填充（时间序列常用）
```

### 重复值处理

```python
df.duplicated().sum()          # 重复行数
df.drop_duplicates()           # 删除重复行
df.drop_duplicates(subset=["姓名"], keep="last")  # 按某列去重，保留最后
```

### 类型转换与替换

```python
df["年龄"] = df["年龄"].astype(int)          # 转类型
df["日期"] = pd.to_datetime(df["日期"])      # 转日期
df.replace({"城市": {"北京": "北京市"}})     # 替换值
df["城市"] = df["城市"].str.strip()          # 去空格
df.rename(columns={"姓名": "名字"})          # 重命名列
df["姓名"].str.upper()                       # 字符串批量操作
```

### 异常值处理

```python
# 用 IQR（四分位距）识别异常值
Q1 = df["工资"].quantile(0.25)
Q3 = df["工资"].quantile(0.75)
IQR = Q3 - Q1
outliers = df[(df["工资"] < Q1 - 1.5*IQR) | (df["工资"] > Q3 + 1.5*IQR)]

# 处理：删除、截断（clip）或替换
df["工资"] = df["工资"].clip(lower=Q1-1.5*IQR, upper=Q3+1.5*IQR)
```

---

## 九、新增列与 apply

```python
# 向量化新增列（推荐，快）
df["年薪"] = df["工资"] * 12
df["高薪"] = df["工资"] > 18000               # 布尔列
df["等级"] = np.where(df["工资"] > 20000, "A", "B")  # 条件赋值

# apply：对每行/每列应用函数
df["工资"].apply(lambda x: x / 1000)          # 对每个元素
df.apply(lambda row: row["工资"] * 12, axis=1) # 对每行（axis=1）
df["年龄"].map({25: "青年", 30: "中年"})       # 映射（字典）
```

> [!TIP]
> 能用**向量化运算**（如 `df["工资"]*12`）就别用 `apply`——向量化是 C 级别批量运算，`apply` 本质是 Python 循环，慢很多。`apply` 留给无法向量化的复杂逻辑。

---

## 十、分组聚合（GroupBy）

数据分析核心操作：**Split（分组）→ Apply（计算）→ Combine（合并）**。

```python
df = pd.DataFrame({
    "部门": ["技术", "技术", "销售", "销售", "技术"],
    "城市": ["北京", "上海", "北京", "上海", "北京"],
    "工资": [20000, 25000, 12000, 15000, 22000],
})

# 按单列分组聚合
df.groupby("部门")["工资"].mean()        # 各部门平均工资
df.groupby("部门")["工资"].agg(["mean", "max", "min", "count"])  # 多个聚合

# 按多列分组
df.groupby(["部门", "城市"])["工资"].sum()

# agg：不同列用不同聚合
df.groupby("部门").agg({
    "工资": ["mean", "sum"],
    "城市": "count",
})

# 自定义聚合函数
df.groupby("部门")["工资"].agg(lambda x: x.max() - x.min())

# transform：结果广播回原形状（不压缩）
df["部门均薪"] = df.groupby("部门")["工资"].transform("mean")
```

---

## 十一、合并与重塑

### 合并（merge / concat / join）

```python
# merge：类似 SQL JOIN，按键合并两个 DataFrame
pd.merge(df1, df2, on="id")                       # 内连接（默认）
pd.merge(df1, df2, on="id", how="left")           # 左连接
pd.merge(df1, df2, left_on="uid", right_on="id")  # 不同键名
# how: inner（交集）/ left / right / outer（并集）

# concat：堆叠（上下或左右）
pd.concat([df1, df2], axis=0)          # 纵向拼接（加行）
pd.concat([df1, df2], axis=1)          # 横向拼接（加列）

# join：按索引合并
df1.join(df2, on="key")
```

### 重塑（pivot / melt / stack）

```python
# pivot：透视表（长表转宽表）
df.pivot(index="部门", columns="城市", values="工资")

# pivot_table：更强大的透视（可聚合）
pd.pivot_table(df, values="工资", index="部门", columns="城市",
               aggfunc="mean", fill_value=0, margins=True)  # margins 加总计

# melt：逆透视（宽表转长表）
pd.melt(df, id_vars=["部门"], var_name="指标", value_name="值")

# stack / unstack：列索引 ↔ 行索引转换
df.stack()        # 列变行（宽→长）
df.unstack()      # 行变列（长→宽）
```

---

## 十二、时间序列处理

```python
# 转成时间类型
df["日期"] = pd.to_datetime(df["日期"])

# 提取时间成分
df["日期"].dt.year
df["日期"].dt.month
df["日期"].dt.day
df["日期"].dt.dayofweek       # 星期几（0=周一）
df["日期"].dt.strftime("%Y-%m")   # 格式化

# 设为索引后做时间序列
df.set_index("日期", inplace=True)
df["2026-09"]                 # 按时间切片
df.resample("M")["销量"].sum()   # 重采样：按月汇总（M月/W周/D日）
df.rolling(window=7)["销量"].mean()  # 移动平均（7日窗口）

# 生成日期范围
pd.date_range("2026-01-01", periods=30, freq="D")   # 30天
pd.date_range("2026-01-01", "2026-12-31", freq="M") # 每月末
```

> [!NOTE]
> `resample`（重采样）用于**降采样/升采样**（如按天→按月聚合），`rolling`（滚动窗口）用于计算移动平均、移动求和等，是时间序列分析的核心工具。`freq`：D日、W周、M月末、H时、T分。

---

## 常见问题 Q&A

**Q1：NumPy 数组和 Python 列表有什么区别？**
A：NumPy 数组要求**同类型元素**、内存连续、支持**向量化运算**（无需循环，底层 C 实现），数值计算快几十倍；列表可存不同类型、动态大小，但运算慢。做数值/科学计算用 ndarray，普通数据存储用 list。

**Q2：`loc` 和 `iloc` 的区别？**
A：`loc` 按**标签**（index/columns 的名字）选取，切片**包含**末尾；`iloc` 按**整数位置**选取，切片**不包含**末尾（同 Python 切片）。记法：loc=labels，iloc=integer location。

**Q3：`axis=0` 和 `axis=1` 总是记混怎么办？**
A：`axis=0` 是**行的方向**（竖直），聚合后行数被压扁，得到"每列的结果"；`axis=1` 是**列的方向**（水平），聚合后列被压扁，得到"每行的结果"。口诀：axis=0 竖着算（对列操作），axis=1 横着算（对行操作）。

**Q4：`SettingWithCopyWarning` 警告怎么解决？**
A：这是链式赋值（`df[df.a>1]["b"]=2`）触发的，可能改的是副本而非原数据。解决：用 `.loc` 一步到位 `df.loc[df.a>1, "b"] = 2`；或先 `.copy()` 再操作。

**Q5：`merge`、`concat`、`join` 怎么选？**
A：`merge` 按**键**合并（类似 SQL JOIN，最灵活）；`concat` 单纯**堆叠**（上下加行或左右加列，不看键）；`join` 基于**索引**合并（本质是 merge 的简化版）。按列匹配合并用 merge，纵向拼接用 concat。

**Q6：`apply`、`map`、`applymap` 的区别？**
A：`map` 用于 Series（逐元素，可传字典映射）；`apply` 用于 Series 或 DataFrame（可作用于行/列，`axis` 控制）；`applymap` 用于 DataFrame 逐元素。能向量化就都别用它们。

**Q7：处理超大 CSV 内存不够怎么办？**
A：① `chunksize` 分块读取：`pd.read_csv(f, chunksize=10000)` 迭代处理；② 只读需要的列 `usecols=[...]`；③ 指定 `dtype` 省内存（如 category 类型）；④ 用 Polars/Dask 等大数据库；⑤ 转 Parquet 格式（列式存储，省空间读得快）。

---

## 复习卡片

> [!TIP]
> **NumPy 与 pandas 速记**
>
> 1. **NumPy ndarray**：同类型、连续内存、向量化，比 list 快几十倍
> 2. **创建**：`np.array/zeros/ones/arange/linspace/random`；属性 `shape/dtype/ndim`
> 3. **索引**：`a[2:5]`、`a[行,列]`、布尔索引 `a[a>5]`；切片是视图非副本
> 4. **运算**：逐元素 `+ - * /`、矩阵乘 `@`、广播自动拉伸
> 5. **聚合**：`sum/mean/max` + `axis=0`（竖算）/`axis=1`（横算）
> 6. **pandas 结构**：Series（一维带标签）、DataFrame（二维表格）
> 7. **读写**：`read_csv/read_excel/read_sql` + `to_csv(index=False)`
> 8. **选择**：`loc`（标签，含末尾）/`iloc`（位置，不含末尾）/布尔索引（`&|~`+括号）
> 9. **清洗**：缺失 `isnull/dropna/fillna`、重复 `drop_duplicates`、类型 `astype/to_datetime`、异常值 `clip`
> 10. **分析**：`groupby().agg()`（分组聚合）、`merge/concat`（合并）、`pivot_table/melt`（重塑）、`resample/rolling`（时间序列）；能向量化就别用 apply

---

> [!TIP]
> 下一篇：[数据可视化](/blog/posts/python-roadmap-13-visualization/) 将讲解 matplotlib 绘制各类图表、子图与样式定制、seaborn 统计可视化，以及 pyecharts 交互式图表，让数据"会说话"。
>
> 返回 [Python 学习路线总览](/blog/posts/python-roadmap-00-overview/) | [合集页](/blog/python-roadmap/)
