---
title: '初识 Python 与基础语法'
published: 2026-09-18T09:30:00+08:00
description: 'Python 入门第一步：语言简介与环境安装、变量与类型、运算符、分支结构（if/match）、循环结构（for/while），配套温度转换、判断闰年、猜数字等经典小例子。'
tags: [Python, 基础语法, 变量, 运算符, 分支循环]
category: Python学习路线
draft: false
---

> [!NOTE]
> 本文对应仓库 **Day01~07**：从认识 Python、搭建环境开始，掌握变量、运算符、分支、循环这些最基础的构件。这是整个学习路线的地基，务必动手把每个例子都敲一遍。

---

## 一、初识 Python

### Python 的优缺点

| 优点 | 缺点 |
|:--|:--|
| 语法简洁、可读性强（"优雅""明确"） | 运行速度较慢（解释型语言） |
| 学习曲线低，非专业人士也能上手 | 代码无法加密（源码可见） |
| 开源、生态强大（第三方库丰富） | 线程无法利用多核 CPU（GIL 全局解释器锁） |
| 跨平台、可移植性好 | 移动端开发较弱 |
| 支持面向对象 + 函数式编程 | - |

### 安装环境

```bash
# Windows：从 python.org 下载安装包
# 安装时务必勾选 "Add Python to PATH"！

# macOS
brew install python

# Linux（Debian/Ubuntu）
sudo apt update && sudo apt install python3 python3-pip

# 验证
python --version      # Python 3.10+
pip --version
```

### 第一个程序

```python
# hello.py
print("Hello, World!")          # 输出到控制台

# 运行方式
# 1. 命令行：python hello.py
# 2. 交互式：python 进入 REPL，逐行输入
# 3. IDE：VS Code / PyCharm 点击运行
```

### 注释

```python
# 单行注释：以 # 开头

"""
多行注释 / 文档字符串：
用三个单引号或双引号包裹
常用作函数、模块的说明文档（docstring）
"""

print("代码")  # 行尾注释
```

---

## 二、变量和类型

### 变量的使用

Python 是**动态类型**语言，变量不需要声明类型，赋值即创建：

```python
# 变量命名规则：字母/数字/下划线组成，不能以数字开头，不能用关键字
a = 100              # int 整数
b = 3.14             # float 浮点数
c = True             # bool 布尔
s = "Hello"          # str 字符串
n = None             # NoneType 空值

# 查看类型
print(type(a))       # <class 'int'>
print(type(b))       # <class 'float'>
print(type(s))       # <class 'str'>

# 动态类型：同一变量可重新赋不同类型
a = "now a string"
print(type(a))       # <class 'str'>
```

### 类型转换

```python
# int() / float() / str() / bool()
x = int("123")       # 字符串 → 整数：123
y = float("3.14")    # 字符串 → 浮点：3.14
z = str(100)         # 整数 → 字符串："100"
print(int(3.99))     # 浮点 → 整数（直接截断）：3
print(bool(0))       # → False（0、空串、None 都是 False）
print(bool(""))      # → False

# 输入（从键盘读入，永远是字符串）
name = input("请输入你的名字：")
age = int(input("请输入年龄："))   # 需手动转换类型
```

### 变量命名规范（PEP 8）

```python
# ✅ 推荐：小写字母 + 下划线（snake_case）
user_name = "Ethan"
max_retry_count = 3

# ✅ 常量：全大写
PI = 3.14159
MAX_SIZE = 100

# ❌ 避免：驼峰命名（Python 不用）、无意义单字母（循环变量除外）
```

---

## 三、运算符

### 算术运算符

```python
a, b = 7, 2
print(a + b)     # 加：9
print(a - b)     # 减：5
print(a * b)     # 乘：14
print(a / b)     # 除（结果是 float）：3.5
print(a // b)    # 整除（向下取整）：3
print(a % b)     # 取余（模）：1
print(a ** b)    # 幂运算：49
```

> [!WARNING]
> `/` 永远返回 float（`4 / 2 = 2.0`），要整数结果用 `//`。负数整除是**向下取整**：`-7 // 2 = -4`（不是 -3）。

### 赋值运算符

```python
x = 10
x += 5    # x = x + 5  → 15
x -= 3    # x = x - 3  → 12
x *= 2    # x = x * 2  → 24
x /= 4    # x = x / 4  → 6.0
x //= 2   # 整除赋值
x %= 4    # 取余赋值
x **= 2   # 幂赋值

# Python 没有 ++ / --，用 x += 1 / x -= 1
```

### 比较与逻辑运算符

```python
# 比较运算符：== != > < >= <=，结果是 bool
print(3 == 3)     # True
print(3 != 4)     # True

# 逻辑运算符：and（与）or（或）not（非）
age = 20
print(age >= 18 and age < 60)   # True
print(age < 12 or age > 65)     # False
print(not (age >= 18))          # False

# 短路特性：and 前为 False 就不算后面；or 前为 True 就不算后面
```

### 应用示例

```python
# 例1：华氏温度转摄氏温度  C = (F - 32) / 1.8
f = float(input("请输入华氏温度："))
c = (f - 32) / 1.8
print(f"{f}°F = {c:.1f}°C")     # f-string 格式化，保留 1 位小数

# 例2：计算圆的周长和面积
import math
r = float(input("请输入半径："))
print(f"周长 = {2 * math.pi * r:.2f}")
print(f"面积 = {math.pi * r ** 2:.2f}")

# 例3：判断闰年（能被4整除但不能被100整除，或能被400整除）
year = int(input("请输入年份："))
is_leap = (year % 4 == 0 and year % 100 != 0) or year % 400 == 0
print(f"{year} 是闰年吗？{is_leap}")
```

---

## 四、分支结构

### if / elif / else

```python
score = int(input("请输入成绩："))

if score >= 90:
    grade = "优秀"
elif score >= 80:
    grade = "良好"
elif score >= 60:
    grade = "及格"
else:
    grade = "不及格"

print(f"等级：{grade}")
```

> [!NOTE]
> Python 用**缩进**（4 个空格）表示代码块，没有 `{}`。冒号 `:` 后必须换行缩进，缩进不一致会报 `IndentationError`。

### 三元表达式（条件运算）

```python
age = 20
status = "成年" if age >= 18 else "未成年"
print(status)     # 成年

# 分段函数求值
x = 5
if x > 1:
    y = 3 * x - 5
elif x >= -1:
    y = x + 2
else:
    y = 5 * x + 3
```

### match / case（Python 3.10+ 结构化模式匹配）

```python
# 类似其他语言的 switch，但更强大
command = input("请输入命令：")
match command:
    case "start":
        print("启动")
    case "stop" | "quit":        # 多值匹配（或）
        print("停止")
    case "restart":
        print("重启")
    case _:                       # 默认分支（相当于 default）
        print("未知命令")

# 可解构数据结构
point = (0, 5)
match point:
    case (0, 0):
        print("原点")
    case (0, y):
        print(f"在 Y 轴上，y={y}")
    case (x, 0):
        print(f"在 X 轴上，x={x}")
    case (x, y):
        print(f"普通点 ({x}, {y})")
```

### 实战：计算三角形周长和面积（海伦公式）

```python
import math
a, b, c = 3, 4, 5

# 先判断能否构成三角形（任意两边之和大于第三边）
if a + b > c and a + c > b and b + c > a:
    perimeter = a + b + c
    p = perimeter / 2
    area = math.sqrt(p * (p - a) * (p - b) * (p - c))  # 海伦公式
    print(f"周长 = {perimeter}, 面积 = {area:.2f}")
else:
    print("无法构成三角形")
```

---

## 五、循环结构

### for-in 循环

```python
# 遍历 range（最常用）
for i in range(5):          # 0,1,2,3,4
    print(i)

for i in range(1, 6):       # 1,2,3,4,5（左闭右开）
    print(i)

for i in range(0, 10, 2):   # 0,2,4,6,8（步长为 2）
    print(i)

# 遍历序列
for ch in "Python":
    print(ch)

for item in [1, 2, 3]:
    print(item)

# 求和
total = 0
for n in range(1, 101):
    total += n
print(f"1 到 100 的和 = {total}")   # 5050
```

### while 循环

```python
# 当条件为真时循环
count = 0
while count < 5:
    print(count)
    count += 1
```

### break 和 continue

```python
# break：跳出整个循环
for i in range(10):
    if i == 5:
        break           # i=5 时结束循环
    print(i)            # 输出 0,1,2,3,4

# continue：跳过本次，进入下一轮
for i in range(10):
    if i % 2 == 0:
        continue        # 偶数跳过
    print(i)            # 输出 1,3,5,7,9
```

### 嵌套循环

```python
# 九九乘法表
for i in range(1, 10):
    for j in range(1, i + 1):
        print(f"{j}×{i}={i*j}", end="\t")   # end="\t" 制表符分隔，不换行
    print()                                  # 内层结束换行
```

### 循环实战例子

```python
# 例1：判断素数（只能被 1 和自己整除）
num = int(input("请输入一个正整数："))
is_prime = num > 1
for i in range(2, int(num ** 0.5) + 1):   # 只需检查到平方根
    if num % i == 0:
        is_prime = False
        break
print(f"{num} 是素数吗？{is_prime}")

# 例2：斐波那契数列（1 1 2 3 5 8 13...）
n = 10
a, b = 0, 1
for _ in range(n):
    print(b, end=" ")
    a, b = b, a + b       # 同时赋值（交换）

# 例3：水仙花数（各位数字立方和等于自身，如 153=1³+5³+3³）
for num in range(100, 1000):
    low = num % 10              # 个位
    mid = num // 10 % 10        # 十位
    high = num // 100           # 百位
    if low ** 3 + mid ** 3 + high ** 3 == num:
        print(num)              # 153, 370, 371, 407

# 例4：百钱百鸡（公鸡5元/母鸡3元/小鸡1元3只，100元买100只）
for x in range(0, 21):          # 公鸡最多 20 只
    for y in range(0, 34):      # 母鸡最多 33 只
        z = 100 - x - y         # 小鸡数量
        if z % 3 == 0 and 5 * x + 3 * y + z // 3 == 100:
            print(f"公鸡{x}只, 母鸡{y}只, 小鸡{z}只")

# 例5：猜数字游戏
import random
answer = random.randint(1, 100)
count = 0
while True:
    count += 1
    guess = int(input("请输入你猜的数字："))
    if guess > answer:
        print("大了")
    elif guess < answer:
        print("小了")
    else:
        print(f"恭喜猜对！你一共猜了 {count} 次")
        break
```

---

## 常见问题 Q&A

**Q1：Python 2 和 Python 3 该学哪个？**
A：毫无疑问学 **Python 3**。Python 2 已于 2020 年停止维护，本系列全部基于 Python 3.10+。

**Q2：缩进到底用几个空格？能用 Tab 吗？**
A：官方规范 PEP 8 要求 **4 个空格**。不要混用 Tab 和空格（会报 `TabError`）。IDE 一般会把 Tab 自动转成空格。

**Q3：`/` 和 `//` 有什么区别？**
A：`/` 是真除法，结果永远是 float（`7/2=3.5`）；`//` 是整除（向下取整），`7//2=3`、`-7//2=-4`。

**Q4：`input()` 拿到的是什么类型？**
A：永远是 **字符串 str**。要做数学运算必须先用 `int()` 或 `float()` 转换，否则会拼接或报错。

**Q5：`range(5)` 包含 5 吗？**
A：不包含。`range(5)` 是 0~4（左闭右开）。`range(1, 6)` 是 1~5。这是 Python 的通用约定（切片同理）。

**Q6：什么是 f-string？**
A：Python 3.6+ 的字符串格式化方式，在引号前加 `f`，用 `{}` 嵌入变量或表达式：`f"{name} is {age}"`。可以控制精度 `{x:.2f}`、对齐、百分比等，是目前最推荐的写法。

---

## 复习卡片

> [!TIP]
> **本篇速记**
>
> 1. **动态类型**：变量赋值即创建，用 `type()` 查看类型，可随时改类型
> 2. **基本类型**：int / float / bool / str / NoneType
> 3. **除法陷阱**：`/` 得 float，`//` 整除向下取整，`%` 取余，`**` 幂
> 4. **分支**：`if/elif/else`；Python 3.10+ 有 `match/case`
> 5. **循环**：`for-in`（配 `range`）、`while`；`break` 跳出、`continue` 跳过
> 6. **缩进即代码块**：4 个空格，冒号后换行缩进
> 7. **input() 返回 str**：运算前必须 `int()`/`float()` 转换
> 8. **f-string**：`f"{表达式}"` 是首选格式化方式
> 9. **交换变量**：`a, b = b, a`（无需临时变量）

---

> [!TIP]
> 下一篇：[常用数据结构](/blog/posts/python-roadmap-02-data-structures/) 将讲解 Python 五大核心数据结构——列表、元组、字符串、集合、字典，这是日常编程用得最多的部分。
>
> 返回 [Python 学习路线总览](/blog/posts/python-roadmap-00-overview/) | [合集页](/blog/python-roadmap/)
