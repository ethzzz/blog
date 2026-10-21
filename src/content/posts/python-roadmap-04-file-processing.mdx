---
title: '文件操作与数据交换'
published: 2026-09-18T11:00:00+08:00
description: 'Python 文件与数据处理：文本/二进制文件读写、异常处理机制、with 上下文管理器、JSON 序列化反序列化、CSV 读写、pip 包管理和调用网络 API 获取数据。'
tags: [Python, 文件操作, 异常处理, JSON, CSV, API]
category: Python学习路线
draft: false
---

> [!NOTE]
> 本文对应仓库 **Day21~23**：文件读写与异常处理、对象序列化（JSON）、CSV 文件读写、pip 包管理、调用网络 API。这是与外部数据打交道的基础能力。

---

## 一、文件读写

### 打开和关闭文件

```python
# 传统方式（不推荐，容易忘记 close）
f = open("test.txt", "r", encoding="utf-8")
content = f.read()
f.close()

# 推荐方式：with 上下文管理器（自动关闭，即使出错）
with open("test.txt", "r", encoding="utf-8") as f:
    content = f.read()
# 出了 with 块，文件自动关闭
```

### 打开模式

| 模式 | 含义 | 文件不存在 | 文件存在 |
|:--|:--|:--|:--|
| `r` | 只读（默认） | 报错 | 从头读 |
| `w` | 只写 | 创建 | **清空**后写 |
| `a` | 追加 | 创建 | 末尾追加 |
| `r+` | 读写 | 报错 | 从头读写 |
| `w+` | 读写 | 创建 | 清空后读写 |
| `b` | 二进制（叠加，如 `rb`） | - | 按字节 |

> [!WARNING]
> `w` 模式会**清空原文件**！想追加内容一定要用 `a`。处理中文文本务必指定 `encoding="utf-8"`，否则 Windows 下默认 GBK 会乱码。

### 读写文本文件

```python
# 写入
with open("note.txt", "w", encoding="utf-8") as f:
    f.write("第一行\n")
    f.write("第二行\n")
    f.writelines(["第三行\n", "第四行\n"])   # 写多行（不会自动加换行）

# 读取的三种方式
with open("note.txt", "r", encoding="utf-8") as f:
    all_content = f.read()          # 一次读全部（大文件慎用，占内存）

with open("note.txt", "r", encoding="utf-8") as f:
    lines = f.readlines()           # 读成列表，每行一个元素

# 推荐：逐行迭代（省内存，适合大文件）
with open("note.txt", "r", encoding="utf-8") as f:
    for line in f:                  # 文件对象是可迭代的
        print(line.strip())         # strip() 去掉行尾换行符
```

### 读写二进制文件

```python
# 复制图片（二进制用 rb / wb）
with open("source.jpg", "rb") as src, open("copy.jpg", "wb") as dst:
    # 分块读取，避免大文件撑爆内存
    while chunk := src.read(4096):   # 海象运算符 := (Python 3.8+)
        dst.write(chunk)
```

---

## 二、异常处理

### try / except / else / finally

```python
try:
    num = int(input("输入一个整数："))
    result = 10 / num
except ValueError:                    # 捕获特定异常
    print("输入的不是有效整数")
except ZeroDivisionError:
    print("不能除以 0")
except (TypeError, KeyError) as e:    # 捕获多种，as e 拿到异常对象
    print(f"其他错误：{e}")
except Exception as e:                # 兜底捕获所有（放最后）
    print(f"未知错误：{e}")
else:
    print(f"没有异常，结果 = {result}")   # try 成功才执行
finally:
    print("无论如何都会执行（常用于清理资源）")
```

### 执行流程

```
try 块
  ├─ 无异常 → 执行 else → 执行 finally
  └─ 有异常 → 匹配 except → 执行对应 except → 执行 finally
```

### 主动抛出与自定义异常

```python
# 主动抛出异常
def set_age(age):
    if age < 0:
        raise ValueError("年龄不能为负数")
    return age

# 自定义异常类（继承 Exception）
class BusinessError(Exception):
    def __init__(self, code, message):
        self.code = code
        self.message = message
        super().__init__(message)

try:
    raise BusinessError(404, "用户不存在")
except BusinessError as e:
    print(f"错误码 {e.code}: {e.message}")

# 重新抛出 / 异常链
try:
    1 / 0
except ZeroDivisionError:
    print("记录日志...")
    raise                # 重新抛出原异常
```

### 上下文管理器语法

`with` 能自动管理资源，本质是对象实现了 `__enter__` 和 `__exit__`。也可自定义：

```python
# 方式1：类实现
class MyContext:
    def __enter__(self):
        print("进入")
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        print("退出（自动清理）")
        return False     # False 表示不吞掉异常

with MyContext() as ctx:
    print("执行中")

# 方式2：contextlib 装饰器（更简洁）
from contextlib import contextmanager

@contextmanager
def timer():
    import time
    start = time.time()
    yield                       # yield 前是 __enter__，后是 __exit__
    print(f"耗时 {time.time()-start:.4f}s")

with timer():
    sum(range(1000000))
```

---

## 三、JSON 序列化与反序列化

JSON 是跨语言的数据交换格式，Python 用内置 `json` 模块处理。

```python
import json

data = {"name": "Ethan", "age": 25, "skills": ["Python", "Go"], "vip": True}

# 序列化：Python 对象 → JSON 字符串
json_str = json.dumps(data)                      # 紧凑
json_str = json.dumps(data, ensure_ascii=False)  # 保留中文（不转义成 \uXXXX）
json_str = json.dumps(data, indent=2, ensure_ascii=False)  # 美化缩进
print(json_str)

# 反序列化：JSON 字符串 → Python 对象
obj = json.loads(json_str)
print(obj["name"])       # Ethan

# 直接读写文件
# 写入文件
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# 从文件读取
with open("data.json", "r", encoding="utf-8") as f:
    loaded = json.load(f)
```

### Python 类型 ↔ JSON 类型对照

| Python | JSON |
|:--|:--|
| dict | object `{}` |
| list / tuple | array `[]` |
| str | string |
| int / float | number |
| True / False | true / false |
| None | null |

> [!NOTE]
> `dumps/dump` 是序列化（s = string），`loads/load` 是反序列化。带 `s` 的处理字符串，不带 `s` 的直接处理文件对象。`ensure_ascii=False` 是让中文正常显示的关键。

---

## 四、CSV 文件读写

CSV（逗号分隔值）是最简单的表格数据格式，用内置 `csv` 模块。

```python
import csv

# 写入 CSV
with open("users.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["姓名", "年龄", "城市"])           # 写一行（表头）
    writer.writerows([                                  # 写多行
        ["Ethan", 25, "上海"],
        ["Tom", 30, "北京"],
    ])

# 读取 CSV（每行是一个列表）
with open("users.csv", "r", newline="", encoding="utf-8") as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)          # ['姓名', '年龄', '城市'] ...

# 用字典方式读写（更适合有表头的数据）
# 写入
with open("users.csv", "w", newline="", encoding="utf-8") as f:
    fields = ["姓名", "年龄"]
    writer = csv.DictWriter(f, fieldnames=fields)
    writer.writeheader()
    writer.writerow({"姓名": "Ethan", "年龄": 25})

# 读取（每行是一个字典）
with open("users.csv", "r", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        print(row["姓名"], row["年龄"])
```

> [!WARNING]
> Windows 下写 CSV 一定要加 `newline=""`，否则每行之间会多一个空行。

---

## 五、pip 包管理

```bash
# 安装第三方库
pip install requests
pip install requests==2.31.0      # 指定版本
pip install "requests>=2.0"       # 版本范围

# 查看 / 卸载
pip list                          # 已安装的所有包
pip show requests                 # 某个包的信息
pip uninstall requests            # 卸载

# 依赖管理（项目协作必备）
pip freeze > requirements.txt     # 导出当前环境依赖
pip install -r requirements.txt   # 从文件安装依赖

# 使用国内镜像加速
pip install requests -i https://pypi.tuna.tsinghua.edu.cn/simple
```

```txt
# requirements.txt 示例
requests==2.31.0
pandas>=2.0
Django~=4.2          # ~= 兼容版本（>=4.2, <4.3）
```

---

## 六、用网络 API 获取数据

结合 `requests` 库和 JSON 处理，是爬虫和数据获取的基础。

```python
import requests

# GET 请求一个公开 API
response = requests.get("https://api.github.com/users/jackfrued")

# 检查状态码
if response.status_code == 200:
    data = response.json()          # 直接把响应体解析成 dict
    print(data["login"])            # jackfrued
    print(data["public_repos"])

# 带参数的请求
resp = requests.get(
    "https://api.github.com/search/repositories",
    params={"q": "python", "sort": "stars"},   # 自动拼成 ?q=python&sort=stars
    headers={"User-Agent": "my-app"},           # 自定义请求头
    timeout=10,                                 # 超时（务必设置！）
)

# POST 请求（提交 JSON）
resp = requests.post(
    "https://httpbin.org/post",
    json={"key": "value"},           # 自动序列化并设 Content-Type
)

# 异常处理
try:
    resp = requests.get(url, timeout=5)
    resp.raise_for_status()          # 4xx/5xx 抛异常
except requests.exceptions.Timeout:
    print("请求超时")
except requests.exceptions.RequestException as e:
    print(f"请求失败：{e}")
```

### 实战：抓取并保存数据

```python
import requests
import json

def fetch_and_save(url, filename):
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        # 保存为 JSON 文件
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"已保存到 {filename}")
    except requests.RequestException as e:
        print(f"抓取失败：{e}")

fetch_and_save("https://api.github.com/users/jackfrued", "user.json")
```

---

## 常见问题 Q&A

**Q1：为什么一定要用 `with open(...)`？**
A：`with` 是上下文管理器，无论代码是否出错，退出块时都会自动 `close()` 文件，避免资源泄漏。手动 open/close 容易在异常时忘记关闭。

**Q2：`read()`、`readline()`、`readlines()` 区别？**
A：`read()` 读全部成一个字符串；`readline()` 读一行；`readlines()` 读所有行成列表。大文件推荐直接 `for line in f` 逐行迭代，最省内存。

**Q3：处理中文为什么会乱码？**
A：没指定编码。`open()` 时务必加 `encoding="utf-8"`；`json.dumps()` 时加 `ensure_ascii=False`。Windows 默认编码是 GBK，不指定容易出问题。

**Q4：`except Exception` 能捕获所有异常吗？**
A：能捕获绝大多数，但捕获不了 `SystemExit`、`KeyboardInterrupt`（它们继承 `BaseException`）。不要写裸 `except:`，会连 Ctrl+C 都拦截。

**Q5：JSON 和 pickle 怎么选？**
A：JSON 跨语言、可读、安全，但只支持基本类型；pickle 是 Python 专用、支持任意对象，但**不安全**（反序列化可执行恶意代码），不要对不可信数据用 pickle。数据交换用 JSON。

**Q6：`requests` 是标准库吗？**
A：不是，需要 `pip install requests`。标准库是 `urllib`，但 API 难用，实际项目基本都用 requests（或异步的 httpx/aiohttp）。

---

## 复习卡片

> [!TIP]
> **本篇速记**
>
> 1. **文件操作**：`with open(f, mode, encoding="utf-8")`，模式 r/w/a/rb/wb，`w` 会清空
> 2. **读取三法**：`read()` 全部 / `readlines()` 列表 / `for line in f` 逐行（大文件首选）
> 3. **异常结构**：`try → except(可多个) → else(成功时) → finally(必执行)`
> 4. **主动抛错**：`raise ValueError(...)`；自定义异常继承 `Exception`
> 5. **上下文管理器**：`__enter__/__exit__` 或 `@contextmanager` + `yield`
> 6. **JSON**：`dumps/dump` 序列化，`loads/load` 反序列化，`ensure_ascii=False` 保中文
> 7. **CSV**：`csv.writer/reader`，字典用 `DictWriter/DictReader`，Windows 加 `newline=""`
> 8. **pip**：`freeze > requirements.txt` 导出，`-r` 安装，用国内镜像加速
> 9. **requests**：`get/post`，`resp.json()`，务必设 `timeout`，`raise_for_status()` 检查

---

> [!TIP]
> 下一篇：[办公自动化与图像处理](/blog/posts/python-roadmap-05-office-automation/) 将讲解用 openpyxl 处理 Excel、python-docx/python-pptx 操作 Word 和 PPT、PyPDF 处理 PDF、Pillow 处理图像，以及发送邮件短信。
>
> 返回 [Python 学习路线总览](/blog/posts/python-roadmap-00-overview/) | [合集页](/blog/python-roadmap/)
