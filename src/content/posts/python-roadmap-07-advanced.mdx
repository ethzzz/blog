---
title: 'Python 语言进阶'
published: 2026-09-18T12:30:00+08:00
description: 'Python 进阶核心：数据结构与算法基础、迭代器与生成器（yield）、并发编程（多线程/多进程/异步 IO 与 GIL），以及 Web 前端入门（HTML/CSS/JavaScript/Vue）概览。'
tags: [Python, 迭代器, 生成器, 并发编程, 异步IO, 算法]
category: Python学习路线
draft: false
---

> [!NOTE]
> 本文对应仓库 **Day31~35（语言进阶 + Web 前端入门）**：数据结构与算法、迭代器与生成器、并发编程。这些是从"能用 Python"到"用好 Python"的分水岭，尤其并发编程是后端/爬虫的核心能力。

---

## 一、数据结构与算法基础

### 常见数据结构

| 结构 | Python 实现 | 特点 | 典型操作复杂度 |
|:--|:--|:--|:--|
| 数组/列表 | `list` | 有序、可变、按索引 | 索引 O(1)，插入/删除 O(n) |
| 栈 | `list` / `collections.deque` | 后进先出 LIFO | push/pop O(1) |
| 队列 | `collections.deque` | 先进先出 FIFO | 两端 O(1) |
| 哈希表 | `dict` / `set` | 键值映射、去重 | 查找/插入 O(1) |
| 链表 | 需自己实现 | 插入删除快 | 查找 O(n) |
| 堆 | `heapq` | 优先队列 | 取最值 O(1)，插入 O(log n) |

```python
from collections import deque, Counter, defaultdict
import heapq

# 栈（用 list）
stack = []
stack.append(1)        # 入栈
stack.pop()            # 出栈（末尾）

# 队列（用 deque，两端操作都是 O(1)）
queue = deque()
queue.append(1)        # 入队（右）
queue.popleft()        # 出队（左）

# 堆（优先队列）
heap = []
heapq.heappush(heap, 3)
heapq.heappush(heap, 1)
print(heapq.heappop(heap))    # 1（总是弹出最小值）

# defaultdict（带默认值的字典）
d = defaultdict(list)
d["key"].append(1)            # 不用先判断 key 是否存在
```

### 常见算法

```python
# 冒泡排序（O(n²)，教学用）
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

# 二分查找（O(log n)，要求有序）
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# 实际开发直接用内置（Timsort，O(n log n)）
sorted([3, 1, 2])          # 排序
[3,1,2].sort()
import bisect
bisect.bisect_left([1,2,3], 2)   # 二分查找位置
```

### 时间复杂度速查

```
O(1)     常数      字典/集合查找、列表索引
O(log n) 对数      二分查找
O(n)     线性      遍历列表
O(n log n) 线性对数  高效排序（快排/归并/Timsort）
O(n²)    平方      双重循环、冒泡排序
```

---

## 二、迭代器与生成器

### 可迭代对象与迭代器

```python
# 可迭代对象（Iterable）：实现 __iter__，能被 for 遍历
# 迭代器（Iterator）：实现 __iter__ 和 __next__，能被 next() 取值

nums = [1, 2, 3]
it = iter(nums)              # 获取迭代器
print(next(it))              # 1
print(next(it))              # 2
print(next(it))              # 3
# print(next(it))            # StopIteration 异常

# 自定义迭代器类
class Countdown:
    def __init__(self, start):
        self.start = start
    def __iter__(self):
        return self
    def __next__(self):
        if self.start <= 0:
            raise StopIteration
        self.start -= 1
        return self.start + 1

for n in Countdown(3):
    print(n)                 # 3 2 1
```

### 生成器（Generator）

生成器是一种**惰性求值**的迭代器，用 `yield` 关键字，能按需产生数据、节省内存，处理大数据流的神器。

```python
# 生成器函数：含 yield，调用不立即执行，返回生成器对象
def countdown(n):
    while n > 0:
        yield n              # 每次 yield 暂停并返回值
        n -= 1

gen = countdown(3)
print(next(gen))             # 1 次执行到第一个 yield → 3
print(next(gen))             # 从上次暂停处继续 → 2

for n in countdown(3):
    print(n)                 # 3 2 1

# 生成器表达式（把列表推导式的 [] 换成 ()）
squares_list = [x**2 for x in range(1000000)]   # 立即生成，占内存
squares_gen = (x**2 for x in range(1000000))    # 惰性，几乎不占内存
print(sum(x**2 for x in range(100)))            # 直接用在聚合里
```

> [!NOTE]
> **列表推导式 vs 生成器表达式**：`[x for x in ...]` 一次性生成所有元素存内存；`(x for x in ...)` 惰性生成，用多少算多少。数据量大或只需遍历一次时，用生成器省内存。

### 无限序列与管道

```python
# 生成器可以表示无限序列（列表不行）
def fib():
    a, b = 0, 1
    while True:              # 无限，但惰性，不会撑爆内存
        yield a
        a, b = b, a + b

# 取前 10 个
import itertools
print(list(itertools.islice(fib(), 10)))   # [0,1,1,2,3,5,8,13,21,34]

# 生成器管道（流式处理，逐条流过）
def read_lines(path):
    with open(path) as f:
        for line in f:
            yield line.strip()

def filter_errors(lines):
    for line in lines:
        if "ERROR" in line:
            yield line

# 组合成管道，内存中永远只有一条数据
# errors = filter_errors(read_lines("big.log"))
```

### itertools 常用工具

```python
import itertools

# 计数 / 循环
itertools.count(10, 2)          # 10,12,14... 无限
itertools.cycle("AB")           # A,B,A,B... 无限

# 组合
list(itertools.permutations([1,2,3], 2))   # 排列
list(itertools.combinations([1,2,3], 2))   # 组合 [(1,2),(1,3),(2,3)]
list(itertools.product([1,2], "ab"))       # 笛卡尔积

# 链接 / 分组
list(itertools.chain([1,2], [3,4]))        # [1,2,3,4]
list(itertools.accumulate([1,2,3,4]))      # 累加 [1,3,6,10]
```

---

## 三、并发编程

### GIL 与三种并发方式的选择

> [!WARNING]
> Python 有 **GIL（全局解释器锁）**：同一时刻只有一个线程执行 Python 字节码。所以**多线程无法利用多核做 CPU 密集计算**。这是选型的关键。

| 场景 | 推荐方式 | 原因 |
|:--|:--|:--|
| **CPU 密集**（计算、图像处理） | 多进程 multiprocessing | 绕过 GIL，利用多核 |
| **IO 密集**（网络、文件、数据库） | 多线程 / 异步 IO | IO 等待时释放 GIL |
| **海量并发 IO**（上万连接） | 异步 IO asyncio | 单线程高并发，开销小 |

### 多线程（threading）

```python
import threading
import time

def task(name):
    print(f"{name} 开始")
    time.sleep(2)              # 模拟 IO
    print(f"{name} 结束")

# 创建并启动线程
t1 = threading.Thread(target=task, args=("线程1",))
t2 = threading.Thread(target=task, args=("线程2",))
t1.start()
t2.start()
t1.join()                      # 等待线程结束
t2.join()

# 线程池（推荐，管理更方便）
from concurrent.futures import ThreadPoolExecutor

def download(url):
    time.sleep(1)
    return f"{url} 完成"

with ThreadPoolExecutor(max_workers=5) as pool:
    results = pool.map(download, ["url1", "url2", "url3"])
    print(list(results))

# 线程安全：用锁保护共享数据
lock = threading.Lock()
counter = 0
def increment():
    global counter
    with lock:                 # 加锁，防止竞态
        counter += 1
```

### 多进程（multiprocessing）

```python
from multiprocessing import Pool, cpu_count
import time

# CPU 密集任务，用多进程真正并行
def heavy_compute(n):
    return sum(i * i for i in range(n))

if __name__ == "__main__":     # Windows 下多进程必须放在这里！
    with Pool(processes=cpu_count()) as pool:
        results = pool.map(heavy_compute, [10**6] * 4)
    print(results)
```

> [!WARNING]
> Windows 下多进程代码必须放在 `if __name__ == "__main__":` 里，否则子进程会无限递归导入主模块导致报错。

### 异步 IO（asyncio）

```python
import asyncio

# async def 定义协程，await 等待异步操作
async def fetch(name, seconds):
    print(f"{name} 开始")
    await asyncio.sleep(seconds)      # 非阻塞等待
    print(f"{name} 完成")
    return name

async def main():
    # 并发执行多个协程
    tasks = [
        fetch("A", 2),
        fetch("B", 1),
        fetch("C", 3),
    ]
    results = await asyncio.gather(*tasks)   # 一起跑，总耗时≈最长的那个(3s)
    print(results)

asyncio.run(main())            # 启动事件循环

# 配合 aiohttp 做异步网络请求（爬虫高并发）
# import aiohttp
# async def get(url):
#     async with aiohttp.ClientSession() as session:
#         async with session.get(url) as resp:
#             return await resp.text()
```

### 三种方式对比

```
多线程：
  - 适合 IO 密集，共享内存，开销中等
  - 受 GIL 限制，CPU 密集无效
  - 注意线程安全（锁）

多进程：
  - 适合 CPU 密集，真正并行，进程隔离
  - 开销大（进程创建 + 数据传递）
  - 进程间通信较复杂

异步 IO：
  - 适合海量 IO 并发，单线程，开销极小
  - 需要 async/await 语法 + 异步库支持
  - 一处阻塞会拖垮整个事件循环
```

---

## 四、Web 前端入门（概览）

后端开发者也需要了解前端基础，才能做全栈或前后端分离。

```html
<!-- HTML：承载页面内容（结构） -->
<!DOCTYPE html>
<html>
<head>
    <title>标题</title>
    <link rel="stylesheet" href="style.css">   <!-- CSS -->
</head>
<body>
    <h1 id="title">Hello</h1>
    <button onclick="sayHi()">点击</button>
    <script src="app.js"></script>             <!-- JavaScript -->
</body>
</html>
```

```css
/* CSS：渲染页面（样式） */
#title {
    color: blue;
    font-size: 24px;
}
```

```javascript
// JavaScript：处理交互行为（行为）
function sayHi() {
    alert("Hi!");
}
// 用 fetch 调用后端 API
fetch("/api/data")
    .then(res => res.json())
    .then(data => console.log(data));
```

> [!NOTE]
> **前端三剑客**：HTML（结构）、CSS（样式）、JavaScript（行为）。现代开发常用 **Vue.js / React** 框架 + Element/Ant Design 等 UI 组件库。Python 后端做前后端分离时，通常用 DRF 提供 JSON API，前端用 Vue/React 渲染。详见 Day53（前后端分离）。

---

## 常见问题 Q&A

**Q1：生成器和普通函数最大的区别？**
A：普通函数 `return` 后结束、一次性返回全部结果；生成器用 `yield`，每次调用 `next()` 执行到 yield 就**暂停并保留状态**，下次从暂停处继续。它是惰性的，省内存，能表示无限序列。

**Q2：GIL 到底是什么？能去掉吗？**
A：GIL 是 CPython 的全局解释器锁，保证同一时刻只有一个线程执行 Python 字节码，简化了内存管理但限制了多线程并行。CPython 无法去掉（可用 Jython 无 GIL，但生态差）。绕过方法：CPU 密集用多进程，或用 C 扩展/Numba 在计算时释放 GIL。（注：Python 3.13+ 正在试验无 GIL 的 free-threaded 模式）

**Q3：多线程在 Python 里就没用了吗？**
A：不是。**IO 密集**（网络请求、文件读写、数据库）场景多线程非常有效，因为 IO 等待时会释放 GIL。只是 **CPU 密集**计算多线程无法加速，那要用多进程。

**Q4：`asyncio` 和多线程怎么选？**
A：并发量小（几十上百）用多线程更简单；海量并发 IO（上千上万连接，如爬虫）用 asyncio，单线程就能扛，开销远小于线程。但异步需要全链路用异步库（aiohttp 而非 requests）。

**Q5：迭代器、生成器、可迭代对象的关系？**
A：可迭代对象（Iterable，有 `__iter__`）能被 for 遍历；迭代器（Iterator，有 `__iter__` 和 `__next__`）能被 next() 取值；生成器是一种特殊的迭代器（用 yield 或生成器表达式创建），写法最简洁。生成器一定是迭代器，迭代器一定可迭代。

**Q6：`yield` 和 `return` 能共存吗？**
A：能。函数里只要有 `yield` 它就是生成器函数。`return` 在生成器里表示**提前结束**迭代（可带值，会被 `StopIteration` 携带），但不会像普通函数那样返回值给调用者。

---

## 复习卡片

> [!TIP]
> **本篇速记**
>
> 1. **数据结构**：栈/队列用 `deque`，堆用 `heapq`，计数用 `Counter`，默认字典 `defaultdict`
> 2. **复杂度**：字典/集合查找 O(1)，二分 O(log n)，遍历 O(n)，高效排序 O(n log n)
> 3. **迭代器协议**：`__iter__` + `__next__`，结束抛 `StopIteration`
> 4. **生成器**：`yield` 惰性求值、省内存、可无限；`(x for x in ...)` 是生成器表达式
> 5. **GIL**：同一时刻只一个线程跑字节码 → CPU 密集用多进程，IO 密集用多线程/异步
> 6. **多线程**：`ThreadPoolExecutor` + `pool.map`，共享数据加 `Lock`
> 7. **多进程**：`multiprocessing.Pool`，Windows 必须放 `if __name__=="__main__"`
> 8. **异步**：`async def` + `await`，`asyncio.gather` 并发，`asyncio.run` 启动
> 9. **前端三剑客**：HTML 结构 + CSS 样式 + JS 行为，框架用 Vue/React
> 10. **itertools**：`chain/product/combinations/islice/accumulate` 高效迭代工具

---

> [!TIP]
> 下一篇：[数据库与 MySQL](/blog/posts/python-roadmap-08-mysql/) 将讲解关系型数据库、SQL 四大类（DDL/DML/DQL/DCL）、索引原理与优化、Python 接入 MySQL，以及 Hive 大数据查询入门。
>
> 返回 [Python 学习路线总览](/blog/posts/python-roadmap-00-overview/) | [合集页](/blog/python-roadmap/)
