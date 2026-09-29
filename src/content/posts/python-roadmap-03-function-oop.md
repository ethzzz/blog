---
title: '函数、模块与面向对象'
published: 2026-09-18T10:30:00+08:00
description: 'Python 函数与面向对象核心：函数定义与参数、高阶函数、Lambda、装饰器、递归，以及类与对象、属性装饰器、静态/类方法、继承与多态，附扑克游戏与工资结算实战。'
tags: [Python, 函数, 装饰器, 面向对象, 继承多态, OOP]
category: Python学习路线
draft: false
---

> [!NOTE]
> 本文对应仓库 **Day14~20**：函数与模块、函数进阶（高阶函数/Lambda/装饰器/递归）、面向对象编程三大支柱。这是从"会写脚本"到"会设计程序"的关键跃迁。

---

## 一、函数与模块

### 定义函数

```python
def greet(name):
    """向指定用户打招呼（这是文档字符串 docstring）"""
    return f"Hello, {name}!"

# 调用
msg = greet("Ethan")
print(msg)

# 无 return 的函数默认返回 None
def print_hi():
    print("hi")
```

### 函数的参数（重点）

```python
# 1. 位置参数：按顺序传
def add(a, b):
    return a + b
add(1, 2)

# 2. 关键字参数：按名字传，顺序无关
add(a=1, b=2)
add(b=2, a=1)          # 等价

# 3. 默认参数：调用时可省略
def power(base, exp=2):
    return base ** exp
power(3)               # 9（用默认 exp=2）
power(3, 3)            # 27

# 4. 可变参数 *args：接收任意多个位置参数，打包成元组
def sum_all(*args):
    print(args)        # (1, 2, 3)
    return sum(args)
sum_all(1, 2, 3)

# 5. 可变关键字参数 **kwargs：打包成字典
def make_user(**kwargs):
    print(kwargs)      # {'name': 'Tom', 'age': 20}
make_user(name="Tom", age=20)

# 6. 混合使用（顺序：位置 → *args → 默认 → **kwargs）
def func(a, b, *args, c=10, **kwargs):
    pass
```

> [!WARNING]
> **默认参数陷阱**：默认值不要用可变对象（如 `def f(x=[])`）！因为默认值只在定义时创建一次，多次调用会共享同一个列表。正确做法：`def f(x=None): if x is None: x = []`。

### 用模块管理函数

```python
# module_a.py
def hello():
    return "hello from module_a"

PI = 3.14

# main.py 导入的几种方式
import module_a                    # 用 module_a.hello()
from module_a import hello, PI     # 直接用 hello()
from module_a import *             # 导入全部（不推荐，易命名冲突）
import module_a as ma              # 别名 ma.hello()

# 标准库示例
import math, random, os, sys, datetime
```

---

## 二、函数使用进阶

### 高阶函数（函数作为参数/返回值）

```python
# Python 中函数是一等公民，可以当参数传递
def apply(func, value):
    return func(value)

print(apply(abs, -5))          # 5
print(apply(lambda x: x*2, 10)) # 20

# 内置高阶函数
nums = [1, 2, 3, 4, 5]
print(list(map(lambda x: x**2, nums)))       # [1,4,9,16,25] 映射
print(list(filter(lambda x: x % 2 == 0, nums)))  # [2,4] 过滤
from functools import reduce
print(reduce(lambda a, b: a * b, nums))      # 120 累积
print(sorted(nums, key=lambda x: -x))        # 降序排序
```

### Lambda 函数（匿名函数）

```python
# 语法：lambda 参数: 表达式（只能是一个表达式）
square = lambda x: x ** 2
print(square(5))             # 25

add = lambda a, b: a + b
print(add(1, 2))             # 3

# 常用于 sort/map/filter 的 key
students = [("Tom", 85), ("Amy", 92), ("Bob", 78)]
students.sort(key=lambda s: s[1], reverse=True)   # 按分数降序
print(students)
```

### 偏函数

```python
from functools import partial

def power(base, exp):
    return base ** exp

square = partial(power, exp=2)   # 固定 exp=2
cube = partial(power, exp=3)
print(square(5))    # 25
print(cube(3))      # 27

# int 转换固定进制
int2 = partial(int, base=2)
print(int2("1010"))   # 10（二进制转十进制）
```

---

## 三、函数高级应用

### 装饰器（Decorator）

装饰器本质是"接收函数、返回新函数"的高阶函数，用于**不修改原函数代码**的前提下增强功能（如日志、计时、权限校验）。

```python
import time
from functools import wraps

# 定义一个计时装饰器
def timer(func):
    @wraps(func)                       # 保留原函数的名字和文档
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs) # 调用原函数
        print(f"{func.__name__} 耗时 {time.time()-start:.4f}s")
        return result
    return wrapper

# 用 @语法糖 应用装饰器
@timer
def slow_func():
    time.sleep(1)

slow_func()        # 输出：slow_func 耗时 1.00xxs

# 带参数的装饰器（三层嵌套）
def repeat(n):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for _ in range(n):
                func(*args, **kwargs)
        return wrapper
    return decorator

@repeat(3)
def say_hi():
    print("hi")
say_hi()           # 打印 3 次 hi
```

### 递归调用

```python
# 函数调用自己，必须有终止条件（否则栈溢出 RecursionError）
def factorial(n):
    if n <= 1:            # 递归出口
        return 1
    return n * factorial(n - 1)

print(factorial(5))       # 120

# 斐波那契（朴素递归，效率低，有重复计算）
def fib(n):
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)

# 用缓存优化（记忆化）
from functools import lru_cache
@lru_cache(maxsize=None)
def fib_fast(n):
    return n if n < 2 else fib_fast(n-1) + fib_fast(n-2)
```

> [!NOTE]
> Python 默认递归深度约 1000 层，可用 `sys.setrecursionlimit()` 调整。能用循环就别用深递归，容易栈溢出且效率低。

---

## 四、面向对象编程（OOP）

### 类和对象

```python
class Dog:
    # 类属性（所有实例共享）
    species = "canine"

    # 初始化方法（构造器），self 代表实例本身
    def __init__(self, name, age):
        # 实例属性
        self.name = name
        self.age = age

    # 实例方法（第一个参数必须是 self）
    def bark(self):
        return f"{self.name} 汪汪叫！"

# 创建对象（实例化）
dog = Dog("旺财", 3)
print(dog.name)        # 旺财
print(dog.bark())      # 旺财 汪汪叫！
print(Dog.species)     # canine（类属性）
```

### 可见性与属性装饰器

Python 没有真正的 private，用命名约定：`_name` 表示"受保护"，`__name` 触发**名称改写**（name mangling）实现弱私有。

```python
class Person:
    def __init__(self, name, age):
        self._name = name
        self.__age = age          # 名称改写为 _Person__age

    # 用 @property 把方法伪装成属性访问（推荐做法）
    @property
    def age(self):
        return self.__age

    @age.setter
    def age(self, value):         # setter 里做校验
        if 0 <= value <= 150:
            self.__age = value
        else:
            raise ValueError("年龄不合法")

p = Person("Tom", 25)
print(p.age)        # 25（像访问属性一样，实际调用 getter）
p.age = 30          # 调用 setter
# p.age = 200       # ValueError
```

### 静态方法与类方法

```python
class MathUtil:
    PI = 3.14159

    def __init__(self, value):
        self.value = value

    # 实例方法：操作实例属性，第一个参数 self
    def double(self):
        return self.value * 2

    # 类方法：第一个参数 cls（类本身），常用作工厂方法
    @classmethod
    def from_string(cls, s):
        return cls(float(s))       # 创建实例

    # 静态方法：不访问实例也不访问类，就是放在类里的普通函数
    @staticmethod
    def add(a, b):
        return a + b

print(MathUtil.add(1, 2))              # 3（静态方法，无需实例）
obj = MathUtil.from_string("3.14")     # 类方法创建实例
print(obj.value)                       # 3.14
```

### 继承与多态

```python
# 基类（父类）
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        raise NotImplementedError("子类必须实现 speak")

    def info(self):
        return f"我是 {self.name}"

# 子类继承父类
class Cat(Animal):
    def speak(self):            # 重写（override）父类方法
        return "喵喵"

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)  # 调用父类构造器
        self.breed = breed

    def speak(self):
        return "汪汪"

# 多态：同一个接口，不同子类有不同行为
animals = [Cat("咪咪"), Dog("旺财", "柴犬")]
for a in animals:
    print(f"{a.name}: {a.speak()}")   # 各自调用自己的 speak

# 多重继承与方法解析顺序（MRO）
class A:
    def hello(self): return "A"
class B(A):
    def hello(self): return "B"
class C(A):
    def hello(self): return "C"
class D(B, C):        # 菱形继承
    pass
print(D().hello())    # B（按 MRO：D→B→C→A）
print(D.__mro__)      # 查看方法解析顺序
```

---

## 五、面向对象实战

### 例子1：数字时钟

```python
import time, os

class Clock:
    def __init__(self, hour=0, minute=0, second=0):
        self.hour, self.minute, self.second = hour, minute, second

    def run(self):
        self.second += 1
        if self.second == 60:
            self.second = 0
            self.minute += 1
            if self.minute == 60:
                self.minute = 0
                self.hour += 1
                if self.hour == 24:
                    self.hour = 0

    def show(self):
        return f"{self.hour:02d}:{self.minute:02d}:{self.second:02d}"

clock = Clock(23, 59, 58)
for _ in range(5):
    print(clock.show())
    clock.run()
    time.sleep(1)
```

### 例子2：工资结算系统（多态）

```python
from abc import ABC, abstractmethod

# 抽象基类：定义接口，不能实例化
class Employee(ABC):
    def __init__(self, name):
        self.name = name

    @abstractmethod
    def get_salary(self):
        """子类必须实现"""
        pass

class Manager(Employee):
    def get_salary(self):
        return 15000.0

class Programmer(Employee):
    def __init__(self, name, hour):
        super().__init__(name)
        self.hour = hour
    def get_salary(self):
        return 200 * self.hour        # 时薪 200

class Salesman(Employee):
    def __init__(self, name, sales):
        super().__init__(name)
        self.sales = sales
    def get_salary(self):
        return 1500 + 0.05 * self.sales   # 底薪 + 提成

# 多态：统一处理不同员工
employees = [Manager("经理"), Programmer("程序猿", 160), Salesman("销售", 50000)]
for emp in employees:
    print(f"{emp.name}: {emp.get_salary():.2f} 元")
```

---

## 常见问题 Q&A

**Q1：`self` 是什么？必须写吗？**
A：`self` 代表实例本身，是实例方法的第一个参数。名字可以改但约定俗成用 `self`。调用时 Python 自动传入，不用手动传。

**Q2：`__init__` 和构造函数？**
A：`__init__` 是初始化方法（构造时自动调用）。还有 `__new__` 才是真正创建对象的，但极少用。

**Q3：类属性 vs 实例属性？**
A：类属性定义在类里、方法外，所有实例共享；实例属性在 `__init__` 里用 `self.xxx` 定义，每个实例独立。

**Q4：装饰器 `@property` 有什么用？**
A：把方法变成"属性"访问方式（`obj.age` 而非 `obj.get_age()`），同时能在 setter 里加校验逻辑，是封装的推荐做法。

**Q5：`@staticmethod` 和 `@classmethod` 区别？**
A：静态方法不接收 self/cls，就是普通函数放类里做归类；类方法第一个参数是 `cls`，常用于工厂方法创建实例、操作类属性。

**Q6：Python 支持真正的私有吗？**
A：不支持。`__name` 只是名称改写（变成 `_类名__name`），仍可访问。`_name` 是约定的"受保护"，纯靠自觉。

**Q7：装饰器和闭包的关系？**
A：装饰器基于闭包实现——内层 `wrapper` 函数引用了外层函数的参数 `func`，形成闭包。理解闭包才能理解装饰器。

---

## 复习卡片

> [!TIP]
> **本篇速记**
>
> 1. **参数五种**：位置、关键字、默认、`*args`（元组）、`**kwargs`（字典）
> 2. **默认参数陷阱**：别用可变对象做默认值，用 `None` 兜底
> 3. **高阶函数**：`map/filter/reduce/sorted` + Lambda
> 4. **装饰器**：`@decorator` = 不改原函数增强功能，配 `@wraps` 保留元信息
> 5. **递归**：必须有出口，`lru_cache` 可记忆化优化
> 6. **类三大支柱**：封装（`@property`）、继承（`super()`）、多态（重写方法）
> 7. **三种方法**：实例方法(self)、类方法(@classmethod, cls)、静态方法(@staticmethod)
> 8. **抽象基类**：`ABC` + `@abstractmethod` 强制子类实现
> 9. **MRO**：多重继承按 `__mro__` 顺序查找方法（C3 线性化）

---

> [!TIP]
> 下一篇：[文件操作与数据交换](/blog/posts/python-roadmap-04-file-processing/) 将讲解文件读写、异常处理、上下文管理器，以及 JSON/CSV 数据格式的处理和用网络 API 获取数据。
>
> 返回 [Python 学习路线总览](/blog/posts/python-roadmap-00-overview/) | [合集页](/blog/python-roadmap/)
