---
title: 'Java 阶段九：异常处理与泛型'
published: 2026-09-04T20:00:00+08:00
description: 'Java 的异常体系（受检/非受检）、try-with-resources、自定义异常，以及泛型类/方法/通配符与 PECS 原则。'
tags: [Java, 异常, 泛型, try-with-resources, PECS]
category: Java学习路线
draft: false
---

异常处理和泛型是 Java 里两个"看着有点吓人、其实规整得可爱"的主题。JS 的 `throw/catch` 简单直接，Java 多了一层**受检异常**的强制约束；TS 的泛型跟 Java 的泛型概念相通，但 Java 多了个**类型擦除**的坑。这一篇一次讲透。

# Part 1：异常处理

## 异常层次结构

Java 里所有可抛出的东西都继承自 `Throwable`：

```text
Throwable
├── Error                     ← JVM 层面的严重错误，程序员管不了
│     ├── OutOfMemoryError    ← 内存耗尽
│     ├── StackOverflowError  ← 栈溢出（无限递归）
│     └── NoClassDefFoundError
│
└── Exception                 ← 程序可以处理的异常
      ├── RuntimeException    ← 运行时异常（非受检，Unchecked）
      │     ├── NullPointerException       ← 空指针
      │     ├── IndexOutOfBoundsException  ← 索引越界
      │     ├── ArithmeticException        ← 算术异常（除以 0）
      │     ├── ClassCastException         ← 类型转换失败
      │     ├── IllegalArgumentException   ← 参数不合法
      │     ├── IllegalStateException      ← 状态不合法
      │     └── NumberFormatException      ← 字符串转数字失败
      │
      └── 其他 Exception 子类   ← 受检异常（Checked）
            ├── IOException            ← 输入输出错误
            ├── SQLException           ← 数据库错误
            ├── FileNotFoundException  ← 文件找不到
            └── InterruptedException   ← 线程被中断
```

## 受检 vs 非受检异常

这是 Java 特有、也是最容易被诟病的设计：

| 类别 | 编译器强制处理？ | 什么时候用 | 常见例子 |
| :-- | :--: | :-- | :-- |
| **受检异常**（Checked） | ✅ 必须 `try/catch` 或 `throws` | 可预见、可恢复的外部错误 | `IOException`, `SQLException` |
| **非受检异常**（Unchecked / RuntimeException） | ❌ 不强制 | 程序 bug、编程错误 | `NullPointerException`, `IllegalArgumentException` |
| **Error** | ❌ 不强制 | JVM 层面严重问题 | `OutOfMemoryError` |

**受检异常**的意思：编译器会检查你有没有处理，没处理就不给编译过。这逼着你显式面对可能失败的调用：

```java
// ❌ 编译报错：未处理的 IOException
public void readFile() {
    FileInputStream fis = new FileInputStream("a.txt");
}

// ✅ 方式一：try/catch 处理
public void readFile() {
    try {
        FileInputStream fis = new FileInputStream("a.txt");
    } catch (FileNotFoundException e) {
        System.err.println("文件不存在：" + e.getMessage());
    }
}

// ✅ 方式二：throws 声明抛出，让调用者处理
public void readFile() throws FileNotFoundException {
    FileInputStream fis = new FileInputStream("a.txt");
}
```

**非受检异常**通常是程序员的错，编译器不管，但运行时会崩：

```java
String s = null;
s.length();       // 运行时抛 NullPointerException，编译期不报错
```

> [!NOTE]
> 现代 Java 编程风格越来越倾向**多用非受检异常**，因为受检异常会让代码到处充斥 `try/catch` 或 `throws`，可读性差。Spring、Hibernate 等主流框架都遵循这个原则。

## try / catch / finally

### 基本形式

```java
try {
    // 可能抛异常的代码
    int result = 10 / 0;
} catch (ArithmeticException e) {
    // 处理特定类型异常
    System.err.println("除数不能为 0：" + e.getMessage());
} catch (Exception e) {
    // 兜底
    System.err.println("其他异常：" + e.getMessage());
} finally {
    // 无论是否异常都会执行（通常用于释放资源）
    System.out.println("cleanup");
}
```

### 多重 catch 的顺序

**子类异常必须写在父类前面**，否则编译报错：

```java
try {
    ...
} catch (FileNotFoundException e) {   // IOException 的子类
    ...
} catch (IOException e) {             // 父类
    ...
}
// ❌ 反过来写编译报错：exception IOException has already been caught
```

### 多异常合并 catch（JDK 7+）

用 `|` 一次捕获多种异常：

```java
try {
    ...
} catch (IOException | SQLException e) {
    // 处理两种异常
    e.printStackTrace();
}
```

限制：合并的异常之间**不能有继承关系**。

### finally 的陷阱

`finally` **几乎总会执行**，除了：

- `System.exit(0)` 被调用
- JVM 崩溃
- 线程被强制杀死

**`finally` 里的 `return` 会吞掉异常**（**极其不推荐**）：

```java
public int badMethod() {
    try {
        throw new RuntimeException("boom");
    } finally {
        return 42;   // ❌ 异常被吞，方法返回 42
    }
}
```

`finally` 里也**不要抛新异常**，会覆盖 try/catch 里的原始异常，导致排查困难。

## try-with-resources（JDK 7+）

**自动关闭资源**，比手动写 `finally { close(); }` 优雅太多。任何实现 `AutoCloseable` 接口的对象都可以放进 `try(...)`：

```java
// ❌ 传统写法，繁琐且容易漏 close
BufferedReader br = null;
try {
    br = new BufferedReader(new FileReader("a.txt"));
    return br.readLine();
} catch (IOException e) {
    ...
} finally {
    if (br != null) {
        try { br.close(); } catch (IOException e) { ... }
    }
}

// ✅ try-with-resources
try (BufferedReader br = new BufferedReader(new FileReader("a.txt"))) {
    return br.readLine();
} catch (IOException e) {
    ...
}
// 出了 try 块 br 自动关闭，即使抛异常也会关
```

**多资源同时管理**（用 `;` 分隔，按声明的**逆序**关闭）：

```java
try (
    InputStream in = new FileInputStream("in.txt");
    OutputStream out = new FileOutputStream("out.txt")
) {
    in.transferTo(out);
} catch (IOException e) {
    e.printStackTrace();
}
```

**JDK 9+ 的语法糖**：资源可以在 try 外声明，try 里直接引用：

```java
BufferedReader br = new BufferedReader(new FileReader("a.txt"));
try (br) {           // 直接引用外部变量
    return br.readLine();
}
```

> [!TIP]
> try-with-resources 是**日常处理 IO/数据库/网络资源的首选**。所有实现 `AutoCloseable` 的类都适用：文件流、数据库连接、Statement、ResultSet、Socket、Scanner 等。

## throw 与 throws

- `throw`：**动作**，抛出一个具体的异常实例
- `throws`：**声明**，方法签名上说明本方法可能抛哪些异常

```java
// throw：抛异常
public void setAge(int age) {
    if (age < 0) {
        throw new IllegalArgumentException("年龄不能为负数：" + age);
    }
    this.age = age;
}

// throws：声明异常
public void readFile(String path) throws IOException {
    BufferedReader br = new BufferedReader(new FileReader(path));
    ...
}

// 两者常常同时出现
public void process(String path) throws IOException {
    if (path == null) {
        throw new IllegalArgumentException("path 不能为 null");   // 非受检，不需要声明
    }
    readFile(path);   // 受检，向上抛
}
```

## 自定义异常

业务代码里常常需要抛自己的异常类型，方便上层区分：

```java
// 非受检异常（推荐）：继承 RuntimeException
public class BusinessException extends RuntimeException {
    private final String code;

    public BusinessException(String code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(String code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }

    public String getCode() { return code; }
}

// 受检异常：继承 Exception
public class InsufficientBalanceException extends Exception {
    public InsufficientBalanceException(double balance, double amount) {
        super("余额不足：当前 %.2f，需要 %.2f".formatted(balance, amount));
    }
}

// 使用
public void withdraw(double amount) {
    if (amount > balance) {
        throw new BusinessException("INSUFFICIENT_BALANCE", "余额不足");
    }
}
```

**自定义异常的最佳实践**：

- 优先继承 `RuntimeException`（不强制上层处理）
- 保留 cause：`super(message, cause)`，便于异常链追踪
- 携带业务上下文（错误码、参数）
- 用异常类名表达含义，不要用 `MyException` 这种含糊的名字

## 异常处理最佳实践

### 1. 只捕获能处理的异常

```java
// ❌ 无脑吞异常
try { ... } catch (Exception e) { /* 什么也不做 */ }

// ✅ 要么处理，要么抛出
try { ... } catch (IOException e) {
    log.error("读取失败", e);
    throw new BusinessException("READ_ERROR", "无法读取配置", e);
}
```

### 2. 不要捕获 Throwable 或 Error

`OutOfMemoryError`、`StackOverflowError` 这类是 JVM 层面的严重问题，捕获它们通常没有意义，反而掩盖问题。

### 3. 保留异常链

用带 cause 的构造器，别丢失原始异常：

```java
// ❌ 丢失原始异常
try { ... } catch (IOException e) {
    throw new BusinessException("失败了");
}

// ✅ 保留 cause
try { ... } catch (IOException e) {
    throw new BusinessException("失败了", e);
}
```

### 4. 不要用异常做流程控制

抛异常和捕获异常有性能开销（要构造栈帧），不要拿它当 `if` 用：

```java
// ❌ 反模式
try {
    int n = Integer.parseInt(input);
    return n;
} catch (NumberFormatException e) {
    return 0;
}

// ✅ 直接判断
if (input.matches("\\d+")) {
    return Integer.parseInt(input);
}
return 0;
```

### 5. 日志记录用完整的异常对象

```java
log.error("处理失败", e);          // ✅ 打印堆栈
// log.error("处理失败：" + e.getMessage());  // ❌ 丢失堆栈
```

# Part 2：泛型

## 为什么需要泛型

**没有泛型的时代**（JDK 5 之前），集合只能存 `Object`，取出来要强转，运行时才知道对不对：

```java
List list = new ArrayList();
list.add("hello");
list.add(123);            // 编译器不报错

String s = (String) list.get(0);   // ✅
String n = (String) list.get(1);   // ❌ 运行时 ClassCastException
```

**有了泛型**，编译期就能查出类型错误：

```java
List<String> list = new ArrayList<>();
list.add("hello");
// list.add(123);         // ❌ 编译报错

String s = list.get(0);   // ✅ 无需强转
```

对比 TypeScript：

```typescript
const list: string[] = [];
list.push("hello");
// list.push(123);        // ❌ 类型错误
```

概念完全一致，Java 的泛型是**编译期类型系统**的一部分。

## 泛型类

用**类型参数**（type parameter）声明可参数化的类：

```java
public class Box<T> {
    private T content;

    public void put(T item) {
        this.content = item;
    }

    public T take() {
        return content;
    }
}

// 使用
Box<String> stringBox = new Box<>();
stringBox.put("hello");
String s = stringBox.take();       // 无需强转

Box<Integer> intBox = new Box<>();
intBox.put(42);
Integer n = intBox.take();
```

**类型参数命名约定**：

- `T`：Type
- `E`：Element（集合常用）
- `K`：Key
- `V`：Value
- `N`：Number
- `S`, `U`, `V`：多个类型参数时依次用

多类型参数：

```java
public class Pair<K, V> {
    private final K key;
    private final V value;

    public Pair(K key, V value) {
        this.key = key;
        this.value = value;
    }

    public K getKey() { return key; }
    public V getValue() { return value; }
}

Pair<String, Integer> p = new Pair<>("age", 25);
```

Java 标准库里的泛型类：`List<E>`、`Map<K, V>`、`Optional<T>`、`CompletableFuture<T>` 全是。

## 泛型接口

跟泛型类一样：

```java
public interface Comparable<T> {
    int compareTo(T other);
}

public class Student implements Comparable<Student> {
    private int score;

    @Override
    public int compareTo(Student other) {
        return Integer.compare(this.score, other.score);
    }
}
```

## 泛型方法

**方法级别的泛型**，类型参数写在返回类型前面：

```java
public class Utils {
    // 泛型方法：接受任意类型的 List，返回同类型的第一个元素
    public static <T> T first(List<T> list) {
        return list.isEmpty() ? null : list.get(0);
    }

    // 多类型参数
    public static <K, V> Map<V, K> invert(Map<K, V> map) {
        Map<V, K> result = new HashMap<>();
        for (Map.Entry<K, V> e : map.entrySet()) {
            result.put(e.getValue(), e.getKey());
        }
        return result;
    }

    // 类型参数带边界（bounded）
    public static <T extends Comparable<T>> T max(T a, T b) {
        return a.compareTo(b) >= 0 ? a : b;
    }

    // 多边界（用 &）
    public static <T extends Number & Comparable<T>> T maxNum(T a, T b) {
        return a.compareTo(b) >= 0 ? a : b;
    }
}

// 使用（编译器通常能推断，也可以显式指定）
List<String> names = List.of("a", "b");
String first = Utils.first(names);              // 推断为 String
String first2 = Utils.<String>first(names);     // 显式

Utils.max(3, 5);                                // int
Utils.max("a", "b");                            // String
```

## 类型擦除：Java 泛型的最大坑

Java 的泛型是**编译期**的机制，运行时所有泛型信息都被**擦除**（type erasure）：

```java
List<String> strings = new ArrayList<>();
List<Integer> ints = new ArrayList<>();

// 运行时它们是同一个类
System.out.println(strings.getClass() == ints.getClass());
// true，都是 java.util.ArrayList

// 擦除后 List<String> 变成 List，T 变成 Object（或边界类型）
```

**类型擦除带来的限制**：

```java
// ❌ 不能用泛型类型做 instanceof
if (list instanceof List<String>) { ... }       // 编译报错
if (list instanceof List<?>) { ... }            // ✅

// ❌ 不能 new 泛型数组
List<String>[] arr = new List<String>[10];      // 编译报错
List<?>[] arr = new List<?>[10];                // ✅

// ❌ 不能 new 类型参数
public <T> T create() {
    return new T();                              // 编译报错
}
// 变通：传 Class<T>
public <T> T create(Class<T> clazz) throws Exception {
    return clazz.getDeclaredConstructor().newInstance();
}

// ❌ 静态字段/方法不能用类的类型参数
public class Box<T> {
    // static T item;              // 编译报错
    static <T> void method() {}    // ✅ 但方法可以有自己的类型参数
}

// ❌ 不能对基本类型使用泛型
List<int> nums;                    // 编译报错
List<Integer> nums;                // ✅ 用包装类
```

## 通配符 ?

**通配符**表示"未知类型"，主要用于**方法参数**，让方法更灵活：

```java
// ❌ List<Integer> 不是 List<Number> 的子类！
public void print(List<Number> list) { ... }
List<Integer> ints = List.of(1, 2, 3);
// print(ints);   // 编译报错

// ✅ 用通配符
public void print(List<?> list) {
    for (Object o : list) System.out.println(o);
}
print(ints);      // ✅
print(List.of("a", "b"));   // ✅
```

### ? extends T：上界通配符

表示"T 或 T 的子类"，**只读**（生产者 Producer）：

```java
public double sum(List<? extends Number> list) {
    double total = 0;
    for (Number n : list) total += n.doubleValue();
    // list.add(1);      // ❌ 不能添加（除了 null）
    return total;
}

sum(List.of(1, 2, 3));            // List<Integer>
sum(List.of(1.5, 2.5));           // List<Double>
```

**为什么不能添加**：编译器不知道 `list` 具体是 `List<Integer>` 还是 `List<Double>`，往里加什么都不安全。

### ? super T：下界通配符

表示"T 或 T 的父类"，**只写**（消费者 Consumer）：

```java
public void addNumbers(List<? super Integer> list) {
    list.add(1);              // ✅ 可以加 Integer
    list.add(2);
    // Integer n = list.get(0);  // ❌ 取出只能是 Object
}

List<Number> nums = new ArrayList<>();
addNumbers(nums);
List<Object> objs = new ArrayList<>();
addNumbers(objs);
```

### PECS 原则

**Producer Extends, Consumer Super**：

- 如果集合是**生产者**（你要**从中读取**数据），用 `<? extends T>`
- 如果集合是**消费者**（你要**往里写入**数据），用 `<? super T>`
- 既要读又要写，就用精确类型 `<T>`

Java 标准库里的例子：

```java
// Collections.copy：dest 是消费者，src 是生产者
public static <T> void copy(List<? super T> dest, List<? extends T> src)

// Collections.addAll：collection 是消费者
public static <T> boolean addAll(Collection<? super T> c, T... elements)
```

## 泛型的类型边界

用 `extends` 限定类型参数的范围（不管是类还是接口都用 `extends`）：

```java
// T 必须是 Number 或其子类
public class NumberBox<T extends Number> {
    private T value;
    public double doubleValue() { return value.doubleValue(); }
}

NumberBox<Integer> intBox = new NumberBox<>();     // ✅
// NumberBox<String> strBox = new NumberBox<>();   // ❌ String 不是 Number

// 多边界：T 必须同时满足
public <T extends Comparable<T> & Serializable> void sort(T[] arr) { ... }
```

## 综合小例子：类型安全的结果封装

用泛型和异常写一个业务里常见的 `Result` 类型：

```java title="Result.java"
package com.example.common;

import java.util.function.Function;

public class Result<T> {
    private final T data;
    private final String errorCode;
    private final String errorMessage;

    private Result(T data, String errorCode, String errorMessage) {
        this.data = data;
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(data, null, null);
    }

    public static <T> Result<T> failure(String code, String message) {
        return new Result<>(null, code, message);
    }

    public boolean isSuccess() { return errorCode == null; }

    public T getData() {
        if (!isSuccess()) {
            throw new IllegalStateException("结果失败，无数据：" + errorMessage);
        }
        return data;
    }

    public String getErrorCode() { return errorCode; }
    public String getErrorMessage() { return errorMessage; }

    // map：转换成功值
    public <R> Result<R> map(Function<T, R> mapper) {
        if (isSuccess()) {
            try {
                return Result.success(mapper.apply(data));
            } catch (Exception e) {
                return Result.failure("MAP_ERROR", e.getMessage());
            }
        }
        @SuppressWarnings("unchecked")
        Result<R> failed = (Result<R>) this;
        return failed;
    }

    // orElse：失败时提供默认值
    public T orElse(T fallback) {
        return isSuccess() ? data : fallback;
    }

    @Override
    public String toString() {
        return isSuccess()
            ? "Result.success(" + data + ")"
            : "Result.failure(" + errorCode + ", " + errorMessage + ")";
    }
}
```

使用：

```java
public Result<User> findUser(Long id) {
    if (id == null) {
        return Result.failure("INVALID_ID", "id 不能为 null");
    }
    User user = userDao.findById(id);
    if (user == null) {
        return Result.failure("NOT_FOUND", "用户不存在");
    }
    return Result.success(user);
}

// 链式转换
Result<String> nameResult = findUser(1L)
    .map(User::getName)
    .map(String::toUpperCase);

String name = nameResult.orElse("Anonymous");
```

这个 `Result` 类同时体现了：

- **泛型**：`Result<T>` 可以承载任何类型
- **静态工厂方法**：`success`/`failure`
- **异常**：`getData` 在失败时抛 `IllegalStateException`
- **函数式接口**：`map` 接受 `Function<T, R>`
- **PECS 原则**：`Function<T, R>` 中 T 是生产者（读），R 是消费者（写）

## 复习卡片

```java
// ===== 异常 =====
// 层次：Throwable → Error / Exception
// Exception → RuntimeException（非受检）+ 其他（受检）

// try/catch/finally
try { ... }
catch (IOException | SQLException e) { ... }   // 多异常合并（JDK 7+）
catch (Exception e) { ... }
finally { ... }

// try-with-resources（推荐）
try (BufferedReader br = new BufferedReader(new FileReader("a.txt"))) {
    return br.readLine();
}

// 抛异常
throw new IllegalArgumentException("参数错误");
public void m() throws IOException { ... }

// 自定义异常
public class BusinessException extends RuntimeException {
    public BusinessException(String msg, Throwable cause) { super(msg, cause); }
}

// ===== 泛型 =====
// 泛型类
public class Box<T> {
    private T content;
    public void put(T item) { content = item; }
    public T take() { return content; }
}

// 泛型方法
public static <T> T first(List<T> list) { return list.get(0); }
public static <T extends Comparable<T>> T max(T a, T b) { ... }

// 通配符（PECS）
List<? extends Number> producer;   // 只读
List<? super Integer> consumer;    // 只写
List<?> anything;                  // 只能读作 Object

// 类型擦除的限制
// ❌ new T()、T.class、new T[]、instanceof List<String>、静态字段用 T
```

**记忆要点**：

- 受检异常编译器强制处理，非受检（RuntimeException）不强制
- **优先用非受检异常**，业务错误抛 `BusinessException` 之类
- 处理 IO/数据库资源永远用 **try-with-resources**
- 捕获异常要保留 cause（`super(msg, cause)`），不要吞异常
- 不要用异常做流程控制
- 泛型是**编译期**机制，运行时被**擦除**
- 泛型不能用基本类型（`List<int>` ❌，`List<Integer>` ✅）
- 通配符 **PECS**：Producer Extends, Consumer Super
- `<T extends Number>` 限定类型边界，`<T extends A & B>` 多边界

下一阶段进入现代 Java 最好用的部分——Lambda 和 Stream API，前端工程师上手最快的地方。
