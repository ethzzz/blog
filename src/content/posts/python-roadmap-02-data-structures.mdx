---
title: '常用数据结构'
published: 2026-09-18T10:00:00+08:00
description: 'Python 五大核心数据结构详解：列表、元组、字符串、集合、字典的创建、运算、常用方法与实战应用，含索引切片、列表生成式、打包解包等高频考点。'
tags: [Python, 数据结构, 列表, 字典, 字符串, 集合]
category: Python学习路线
draft: false
---

> [!NOTE]
> 本文对应仓库 **Day08~13**：列表、元组、字符串、集合、字典。这五大结构是 Python 日常编程的绝对主力，面试也是高频考点，务必熟练掌握它们的方法和相互转换。

---

## 五大结构速览

| 结构 | 字面量 | 有序 | 可变 | 可重复 | 典型用途 |
|:--|:--|:--|:--|:--|:--|
| 列表 list | `[1, 2, 3]` | ✅ | ✅ | ✅ | 通用序列、栈 |
| 元组 tuple | `(1, 2, 3)` | ✅ | ❌ | ✅ | 不可变记录、多返回值 |
| 字符串 str | `"abc"` | ✅ | ❌ | ✅ | 文本 |
| 集合 set | `{1, 2, 3}` | ❌ | ✅ | ❌ | 去重、交并差 |
| 字典 dict | `{"k": "v"}` | ✅(3.7+) | ✅ | 键唯一 | 键值映射 |

---

## 一、列表（list）

### 创建与运算

```python
# 创建
nums = [1, 2, 3, 4, 5]
mixed = [1, "two", 3.0, True, None]     # 可混合类型
empty = []                               # 或 list()

# 运算
print(nums + [6, 7])      # 拼接：[1,2,3,4,5,6,7]
print(nums * 2)           # 重复：[1,2,3,4,5,1,2,3,4,5]
print(3 in nums)          # 成员运算：True
print(len(nums))          # 长度：5
print(max(nums), min(nums), sum(nums))   # 15 的最大/最小/求和
```

### 索引与切片

```python
nums = [0, 1, 2, 3, 4, 5]
# 索引：从 0 开始，负数表示从末尾
print(nums[0])     # 0
print(nums[-1])    # 5（最后一个）

# 切片 [start:stop:step]，左闭右开
print(nums[1:4])   # [1, 2, 3]
print(nums[:3])    # [0, 1, 2]（省略 start）
print(nums[3:])    # [3, 4, 5]（省略 stop）
print(nums[::2])   # [0, 2, 4]（步长 2）
print(nums[::-1])  # [5,4,3,2,1,0]（反转）
```

### 常用方法

```python
nums = [3, 1, 2]

# 增
nums.append(4)          # 末尾添加：[3,1,2,4]
nums.insert(0, 9)       # 指定位置插入：[9,3,1,2,4]
nums.extend([5, 6])     # 扩展（合并另一个列表）

# 删
nums.remove(9)          # 删除第一个值为 9 的元素
popped = nums.pop()     # 弹出末尾元素并返回
popped = nums.pop(0)    # 弹出指定索引
del nums[0]             # del 删除
nums.clear()            # 清空

# 查
nums = [1, 2, 3, 2]
print(nums.index(2))    # 第一次出现的索引：1
print(nums.count(2))    # 出现次数：2

# 排序与反转
nums.sort()             # 原地升序排序：[1,2,2,3]
nums.sort(reverse=True) # 降序
nums.reverse()          # 原地反转
sorted_nums = sorted(nums)          # 返回新列表，不改原列表
nums.sort(key=lambda x: -x)         # 自定义排序规则
```

### 列表生成式（推导式）

```python
# 基本形式：[表达式 for 变量 in 可迭代对象]
squares = [x ** 2 for x in range(10)]        # [0,1,4,...,81]

# 带条件过滤
evens = [x for x in range(20) if x % 2 == 0]  # 偶数

# 嵌套
matrix = [[i * j for j in range(3)] for i in range(3)]

# 相比 map/filter 更 Pythonic
nums = [1, 2, 3, 4]
doubled = [n * 2 for n in nums]              # 推荐
# doubled = list(map(lambda n: n*2, nums))   # 等价但不如上面直观
```

### 嵌套列表（二维）

```python
# 3×3 矩阵
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
]
print(matrix[1][2])     # 6（第 2 行第 3 列）

# 遍历
for row in matrix:
    for val in row:
        print(val, end=" ")
    print()
```

> [!WARNING]
> 创建二维列表不要用 `[[0]*3]*3`！这样三行是**同一个对象**的引用，改一行三行都变。正确写法：`[[0]*3 for _ in range(3)]`。

---

## 二、元组（tuple）

### 定义与运算

```python
# 定义（小括号，但括号可省略）
t = (1, 2, 3)
t2 = 1, 2, 3            # 等价
single = (42,)          # 单元素元组必须加逗号！(42) 是整数 42

# 元组不可变：不能增删改
# t[0] = 99  # TypeError

# 运算和列表一样（+ * in 索引 切片），但没有增删改方法
print(t + (4,))         # (1,2,3,4)
print(t[0], t[-1])      # 1 3
```

### 打包与解包

```python
# 打包：多个值组成元组
point = 3, 4

# 解包：元组值分别赋给多个变量
x, y = point            # x=3, y=4
print(x, y)

# 交换变量（最经典的用法）
a, b = 1, 2
a, b = b, a             # 现在 a=2, b=1

# 星号解包（接收剩余元素）
first, *rest = [1, 2, 3, 4, 5]
print(first)            # 1
print(rest)             # [2, 3, 4, 5]

# 函数返回多个值本质就是返回元组
def min_max(nums):
    return min(nums), max(nums)
lo, hi = min_max([3, 1, 4, 1, 5])
```

### 元组 vs 列表

| 对比 | 元组 tuple | 列表 list |
|:--|:--|:--|
| 可变性 | 不可变 | 可变 |
| 性能 | 更快、更省内存 | 稍慢 |
| 安全性 | 数据不会被意外修改 | 可能被修改 |
| 可哈希 | 是（可作字典的键） | 否 |
| 使用场景 | 固定数据、多返回值、字典键 | 需要增删改的序列 |

---

## 三、字符串（str）

### 定义与特殊表示

```python
s1 = 'single quotes'
s2 = "double quotes"
s3 = """多行
字符串"""

# 转义字符
print("换行\n制表\t反斜杠\\ 引号\"")

# 原始字符串（r 前缀，不转义，常用于正则/路径）
path = r"C:\new\test.txt"     # 不会把 \n \t 当转义
print(path)
```

### 运算与索引切片

```python
s = "Hello, Python"
print(s + "!")            # 拼接
print(s * 2)              # 重复
print(len(s))             # 长度：13
print("Python" in s)      # 成员运算：True
print(s[0])               # H
print(s[-6:])             # Python
print(s[7:])              # Python（切片）
```

### 常用方法（按用途分类）

```python
s = "  Hello World  "

# 大小写
"abc".upper()             # "ABC"
"ABC".lower()             # "abc"
"hello world".title()     # "Hello World"
"Hello".swapcase()        # "hELLO"

# 修剪（去空白）
s.strip()                 # "Hello World"（两端）
s.lstrip()                # 去左
s.rstrip()                # 去右

# 查找与判断
"Hello".find("ll")        # 2（找不到返回 -1）
"Hello".index("ll")       # 2（找不到抛异常）
"Hello".startswith("He")  # True
"Hello".endswith("lo")    # True
"123".isdigit()           # True
"abc".isalpha()           # True
"abc123".isalnum()        # True

# 替换
"a-b-c".replace("-", "+") # "a+b+c"

# 拆分与合并
"a,b,c".split(",")        # ['a', 'b', 'c']
"-".join(['a', 'b', 'c']) # "a-b-c"

# 格式化（三种方式）
name, age = "Ethan", 25
"我是%s，%d岁" % (name, age)          # 旧式
"我是{}，{}岁".format(name, age)       # format
f"我是{name}，{age}岁"                 # f-string（推荐）
```

### 编码与解码

```python
# str（文本） ↔ bytes（字节）
s = "你好，Python"
b = s.encode("utf-8")     # 编码为字节：b'\xe4\xbd\xa0...'
s2 = b.decode("utf-8")    # 解码回字符串
print(len(s))             # 字符数：9
print(len(b))             # 字节数：更多（中文 UTF-8 占 3 字节）
```

---

## 四、集合（set）

### 创建与运算

```python
# 创建（自动去重、无序）
s = {1, 2, 3, 3, 2}       # {1, 2, 3}
s2 = set([1, 2, 2, 3])    # 从列表创建（去重）
empty = set()             # 注意：{} 是空字典，不是空集合！

# 去重是集合最常见的用途
nums = [1, 2, 2, 3, 3, 3]
unique = list(set(nums))  # [1, 2, 3]
```

### 集合运算（数学）

```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

print(a & b)      # 交集 {3, 4}       a.intersection(b)
print(a | b)      # 并集 {1,2,3,4,5,6} a.union(b)
print(a - b)      # 差集 {1, 2}        a.difference(b)
print(a ^ b)      # 对称差集 {1,2,5,6} a.symmetric_difference(b)

# 比较
print({1, 2} <= a)    # 子集：True
print(a >= {1, 2})    # 超集：True
```

### 常用方法与不可变集合

```python
s = {1, 2}
s.add(3)              # 添加
s.update([4, 5])      # 批量添加
s.remove(1)           # 删除（不存在报错）
s.discard(99)         # 删除（不存在不报错）
print(2 in s)         # 成员运算（集合的 in 极快，O(1)）

# 不可变集合 frozenset（可作字典的键）
fs = frozenset([1, 2, 3])
```

---

## 五、字典（dict）

### 创建与使用

```python
# 创建
person = {"name": "Ethan", "age": 25, "city": "Shanghai"}
person2 = dict(name="Tom", age=30)       # 关键字参数
person3 = dict([("a", 1), ("b", 2)])     # 键值对序列
empty = {}                                # 空字典

# 访问
print(person["name"])          # Ethan
# print(person["xxx"])         # 键不存在会 KeyError
print(person.get("xxx"))       # None（推荐，不报错）
print(person.get("xxx", "默认值"))  # 键不存在返回默认值
```

### 增删改查

```python
person = {"name": "Ethan"}

# 增 / 改（键存在则改，不存在则增）
person["age"] = 25
person.update({"city": "SH", "age": 26})   # 批量更新

# 删
del person["city"]
age = person.pop("age")        # 删除并返回值
person.pop("xxx", None)        # 键不存在给默认值，不报错
person.clear()                 # 清空

# 查
print("name" in person)        # 判断键是否存在
```

### 遍历

```python
scores = {"语文": 90, "数学": 95, "英语": 88}

# 遍历键
for key in scores:                    # 等价 scores.keys()
    print(key)

# 遍历值
for val in scores.values():
    print(val)

# 遍历键值对（最常用）
for key, val in scores.items():
    print(f"{key}: {val}")

# 字典生成式
squared = {x: x ** 2 for x in range(5)}   # {0:0, 1:1, 2:4, 3:9, 4:16}
```

### 应用示例

```python
# 统计词频
words = ["apple", "banana", "apple", "cherry", "banana", "apple"]
counter = {}
for w in words:
    counter[w] = counter.get(w, 0) + 1
print(counter)     # {'apple': 3, 'banana': 2, 'cherry': 1}

# 用 collections.Counter 更简洁
from collections import Counter
print(Counter(words))              # Counter({'apple': 3, 'banana': 2, 'cherry': 1})
print(Counter(words).most_common(2))  # 出现最多的 2 个
```

---

## 结构之间的转换

```python
# list ↔ tuple ↔ set ↔ str
lst = [1, 2, 3]
tpl = tuple(lst)        # (1, 2, 3)
st = set(lst)           # {1, 2, 3}（去重）
back = list(st)

# str → list
list("abc")             # ['a', 'b', 'c']
"abc".split()           # 按空白拆
"".join(['a', 'b'])     # list → str

# dict 相关
dict([("a", 1)])        # [('a',1)] → {'a':1}
d = {"a": 1, "b": 2}
list(d.keys())          # ['a', 'b']
list(d.values())        # [1, 2]
list(d.items())         # [('a',1), ('b',2)]
```

---

## 常见问题 Q&A

**Q1：列表和元组怎么选？**
A：数据**需要修改**用列表；数据**固定不变**（如坐标、配置、函数多返回值）用元组。元组更快、更安全，还能作字典的键。

**Q2：`{}` 是空集合还是空字典？**
A：是**空字典**！空集合必须用 `set()`。这是常见陷阱。

**Q3：`remove`、`pop`、`del` 有什么区别？**
A：`remove(值)` 按值删除；`pop(索引)` 删除并**返回**该元素（默认末尾）；`del list[i]` 按索引删除且不返回。

**Q4：`sort()` 和 `sorted()` 区别？**
A：`sort()` 是列表方法，**原地**排序返回 None；`sorted()` 是内置函数，返回**新列表**，且适用于任何可迭代对象。

**Q5：字典是有序的吗？**
A：Python **3.7+** 字典保证按插入顺序遍历（3.6 是实现细节）。之前的版本无序，需有序要用 `collections.OrderedDict`。

**Q6：为什么集合的 `in` 判断比列表快？**
A：集合基于哈希表，`in` 是 O(1)；列表是逐个比较，O(n)。频繁做成员判断时优先用集合。

---

## 复习卡片

> [!TIP]
> **五大结构速记**
>
> 1. **列表**：可变有序，`append/insert/remove/pop/sort`，生成式 `[x for x in ...]`，切片 `[start:stop:step]`
> 2. **元组**：不可变，`(1,)` 单元素要加逗号，`a,b = b,a` 解包交换，可作字典键
> 3. **字符串**：不可变，`split/join/replace/strip/find`，`encode/decode` 转字节，f-string 格式化
> 4. **集合**：无序去重，`& | - ^` 交并差对称差，`in` 是 O(1)，`{}` 是空字典不是空集合
> 5. **字典**：键值对，`get()` 安全取值，`items()` 遍历，3.7+ 保持插入序
> 6. **切片通用**：`[左闭:右开:步长]`，`[::-1]` 反转
> 7. **去重**：`list(set(x))`；**统计**：`collections.Counter`
> 8. **推导式**：列表 `[]`、字典 `{k:v}`、集合 `{}`、生成器 `()` 都支持

---

> [!TIP]
> 下一篇：[函数、模块与面向对象](/blog/posts/python-roadmap-03-function-oop/) 将讲解函数定义与参数、高阶函数、Lambda、装饰器、递归，以及面向对象编程（类、对象、继承、多态）。
>
> 返回 [Python 学习路线总览](/blog/posts/python-roadmap-00-overview/) | [合集页](/blog/python-roadmap/)
