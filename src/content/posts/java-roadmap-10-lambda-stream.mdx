---
title: 'Java 阶段十：Lambda 与 Stream API'
published: 2026-09-05T09:00:00+08:00
description: '函数式接口、Lambda、方法引用、Stream 三段式（source/intermediate/terminal）、Collectors、Optional、并行流，前端最容易上手的部分。'
tags: [Java, Lambda, Stream, 函数式, Optional]
category: Java学习路线
draft: false
---

前端工程师学 Java 最开心的一章来了。JDK 8 引入的 Lambda 和 Stream API 让 Java 有了跟 JS 数组方法几乎一一对应的能力：`map`、`filter`、`reduce`、`forEach` 全都有。这一篇把函数式编程在 Java 里的完整玩法过一遍。

## 从匿名内部类到 Lambda

在 JDK 8 之前，Java 想传"一段代码"给方法只能用匿名内部类，非常啰嗦：

```java
// JDK 8 之前
Runnable r1 = new Runnable() {
    @Override
    public void run() {
        System.out.println("running");
    }
};

// JDK 8+ 用 Lambda
Runnable r2 = () -> System.out.println("running");

// 对比 JS
const r3 = () => console.log("running");
```

**Lambda 表达式**（Lambda Expression）本质是"一段可以传递的代码"，语法：

```text
(参数列表) -> { 方法体 }
```

跟 JS 箭头函数的对比：

| JavaScript | Java |
| :-- | :-- |
| `() => console.log("hi")` | `() -> System.out.println("hi")` |
| `x => x * 2` | `x -> x * 2` |
| `(x, y) => x + y` | `(x, y) -> x + y` |
| `(x, y) => { return x + y; }` | `(x, y) -> { return x + y; }` |
| `async () => { ... }` | ——（Java Lambda 不支持 async） |

**主要差异**：

1. Java 用 `->`，JS 用 `=>`
2. Java Lambda 的参数类型可以显式声明：`(int x, int y) -> x + y`
3. Java Lambda 只能实现**函数式接口**（只有一个抽象方法的接口），不是"任意函数"
4. Java Lambda 里的变量捕获是**只读的**（ effectively final），不能修改外层变量

## 函数式接口

**函数式接口**（Functional Interface）是只有一个抽象方法的接口，Lambda 表达式的类型就是它：

```java
@FunctionalInterface
public interface MyFunction {
    void apply();          // 唯一的抽象方法
    // 可以有默认方法、静态方法
    default void log() { System.out.println("logged"); }
}

MyFunction f = () -> System.out.println("hi");
f.apply();
```

`@FunctionalInterface` 注解是**可选的**，加了之后编译器会检查是否只有一个抽象方法。

Java 标准库预定义了 40+ 个常用函数式接口，位于 `java.util.function` 包，其中最重要的四个：

### 四大内置函数式接口

| 接口 | 抽象方法 | 语义 | JS 对应 |
| :-- | :-- | :-- | :-- |
| `Function<T, R>` | `R apply(T t)` | 输入 T 输出 R | `x => y` |
| `Predicate<T>` | `boolean test(T t)` | 输入 T 输出 boolean | `x => true/false` |
| `Consumer<T>` | `void accept(T t)` | 输入 T 无输出 | `x => { ... }` |
| `Supplier<T>` | `T get()` | 无输入输出 T | `() => x` |

```java
import java.util.function.*;

// Function：转换
Function<String, Integer> strLen = s -> s.length();
strLen.apply("hello");      // 5

// Predicate：判断
Predicate<Integer> isEven = n -> n % 2 == 0;
isEven.test(4);             // true

// Consumer：消费
Consumer<String> printer = s -> System.out.println(s);
printer.accept("hi");       // 打印 hi

// Supplier：生产
Supplier<Double> random = () -> Math.random();
random.get();               // 0.xxx

// 基本类型特化版本（避免装箱开销）
IntFunction<String> numToStr = n -> "num:" + n;
ToIntFunction<String> strToNum = s -> s.length();
IntPredicate isPositive = n -> n > 0;
IntConsumer print = System.out::println;
```

**函数式接口的组合**：

```java
Function<Integer, Integer> plus1 = x -> x + 1;
Function<Integer, Integer> times2 = x -> x * 2;

plus1.andThen(times2).apply(5);    // (5+1)*2 = 12
plus1.compose(times2).apply(5);    // (5*2)+1 = 11

Predicate<Integer> positive = n -> n > 0;
Predicate<Integer> even = n -> n % 2 == 0;

positive.and(even).test(4);        // true
positive.or(even).test(-3);        // false
positive.negate().test(-1);        // true

Consumer<String> print = System.out::println;
Consumer<String> log = s -> System.out.println("[LOG] " + s);
print.andThen(log).accept("hi");   // 先打印再打日志
```

## Lambda 的变量捕获

Lambda 里可以引用外层作用域的变量，但**必须是 final 或 effectively final**（事实上不可变）：

```java
public void method() {
    int base = 10;                      // effectively final
    Function<Integer, Integer> add = x -> x + base;
    add.apply(5);                       // 15

    // ❌ 修改 base 后 Lambda 就不能引用了
    // base = 20;                        // 编译报错
}
```

对比 JS：JS 的闭包可以修改外层变量，Java 不行。这个限制是为了并发安全和语义清晰。

**变通**：如果确实要"修改"，用数组或 `AtomicInteger`：

```java
int[] counter = {0};
list.forEach(x -> counter[0]++);         // 修改数组元素不算改引用

AtomicInteger total = new AtomicInteger();
list.forEach(x -> total.addAndGet(x));
```

## 方法引用（Method Reference）

当 Lambda 只是**调用一个已有方法**时，可以用 `::` 简写：

```java
// 四种形式

// 1. 静态方法：ClassName::staticMethod
Function<String, Integer> f1 = Integer::parseInt;   // s -> Integer.parseInt(s)

// 2. 特定对象的实例方法：instance::method
String prefix = "LOG: ";
Consumer<String> c1 = prefix::concat;               // s -> prefix.concat(s)

// 3. 任意对象的实例方法：ClassName::method
Function<String, Integer> f2 = String::length;      // s -> s.length()
Consumer<String> c2 = System.out::println;          // s -> System.out.println(s)

// 4. 构造器：ClassName::new
Supplier<ArrayList<String>> s1 = ArrayList::new;    // () -> new ArrayList<>()
Function<String, String> f3 = String::new;          // s -> new String(s)
```

**方法引用是 Lambda 的语法糖**，读起来更简洁：

```java
// Lambda
list.forEach(x -> System.out.println(x));
// 方法引用
list.forEach(System.out::println);

// Lambda
list.sort((a, b) -> a.compareTo(b));
// 方法引用
list.sort(Comparable::compareTo);
```

## Stream API

**Stream**（流）是 Java 8 引入的**声明式数据处理管道**，跟 JS 的数组方法链式调用非常像：

```java
// JS 风格
const result = users
    .filter(u => u.age >= 18)
    .map(u => u.name)
    .sort()
    .slice(0, 10);

// Java Stream 风格
List<String> result = users.stream()
    .filter(u -> u.getAge() >= 18)
    .map(User::getName)
    .sorted()
    .limit(10)
    .toList();
```

**Stream 不是数据结构**，而是"数据的一次性视图"。它有三个特点：

1. **不修改原集合**：每次操作返回新的 Stream
2. **惰性求值**：中间操作不会立即执行，只有终止操作触发时才计算
3. **只能消费一次**：一个 Stream 用完就不能再用

### Stream 的三段式结构

```text
┌─────────────┐   ┌──────────────────┐   ┌──────────────┐
│  Source     │──▶│ Intermediate Ops │──▶│ Terminal Op  │
│  数据源     │   │ 中间操作（0~N）   │   │ 终止操作（1）│
└─────────────┘   └──────────────────┘   └──────────────┘
  collection.       .filter()             .collect()
    stream()        .map()                .forEach()
  Stream.of(...)    .sorted()             .count()
  IntStream.range   .distinct()           .reduce()
```

## 创建 Stream

```java
import java.util.stream.*;

// 从集合
List<String> list = List.of("a", "b", "c");
Stream<String> s1 = list.stream();
Stream<String> s2 = list.parallelStream();     // 并行流

// 从数组
String[] arr = {"a", "b"};
Stream<String> s3 = Arrays.stream(arr);

// 从固定值
Stream<String> s4 = Stream.of("a", "b", "c");
Stream<Integer> s5 = Stream.of(1, 2, 3);

// 空流
Stream<String> s6 = Stream.empty();

// 数字流（避免装箱，性能高）
IntStream ints = IntStream.of(1, 2, 3);
IntStream range = IntStream.range(0, 10);       // 0~9
IntStream rangeClosed = IntStream.rangeClosed(1, 10);  // 1~10

// 无限流
Stream<Integer> iterate = Stream.iterate(0, n -> n + 2);   // 0, 2, 4, ...
Stream<Double> generate = Stream.generate(Math::random);

// 从文件（每行一个元素）
try (Stream<String> lines = Files.lines(Path.of("a.txt"))) {
    lines.forEach(System.out::println);
}
```

## 中间操作

中间操作返回新的 Stream，**惰性执行**，只有终止操作触发时才真正跑。

### filter：过滤

```java
users.stream()
    .filter(u -> u.getAge() >= 18)
    .filter(u -> u.getName().startsWith("T"))
    .toList();
```

对应 JS：`users.filter(u => u.age >= 18)`。

### map：转换

```java
users.stream()
    .map(User::getName)              // Stream<User> → Stream<String>
    .map(String::toUpperCase)
    .toList();
```

对应 JS：`users.map(u => u.name)`。

### flatMap：扁平化

处理"每个元素展开成多个"的场景：

```java
// 把每个订单的商品列表拼成一个扁平流
List<Order> orders = ...;
List<Product> allProducts = orders.stream()
    .flatMap(o -> o.getProducts().stream())
    .toList();

// 拆分字符串
Stream.of("a,b", "c,d")
    .flatMap(s -> Arrays.stream(s.split(",")))
    .toList();   // ["a", "b", "c", "d"]
```

对应 JS：`array.flatMap(x => x.items)`。

### distinct：去重

```java
Stream.of(1, 2, 2, 3, 3, 3).distinct().toList();   // [1, 2, 3]
```

依赖元素的 `equals`。

### sorted：排序

```java
users.stream()
    .sorted()                                              // 自然顺序（要求 Comparable）
    .sorted(Comparator.comparing(User::getName))           // 按名字
    .sorted(Comparator.comparing(User::getAge).reversed()) // 按年龄降序
    .toList();
```

对应 JS：`arr.sort((a, b) => ...)`。

### limit / skip：切片

```java
Stream.iterate(1, n -> n + 1)
    .skip(10)           // 跳过前 10 个
    .limit(5)           // 取 5 个
    .toList();          // [11, 12, 13, 14, 15]
```

对应 JS：`arr.slice(10, 15)`。

### peek：窥视（调试用）

```java
users.stream()
    .filter(u -> u.getAge() >= 18)
    .peek(u -> System.out.println("过滤后：" + u))    // 观察每一步
    .map(User::getName)
    .peek(name -> System.out.println("映射后：" + name))
    .toList();
```

`peek` 主要用于**调试**，不要在里面做业务逻辑（可能不执行，因为惰性优化）。

## 终止操作

终止操作触发整个流水线执行，**返回非 Stream 的结果**。执行后 Stream 就不能再用了。

### forEach / forEachOrdered

```java
users.stream().forEach(u -> System.out.println(u));
users.stream().forEach(System.out::println);

// 并行流保证顺序用 forEachOrdered
users.parallelStream().forEachOrdered(System.out::println);
```

### collect：收集为集合

最常用的终止操作，配合 `Collectors`：

```java
import static java.util.stream.Collectors.*;

// 收集为 List（JDK 16+ 有 .toList() 更简洁）
List<String> list = users.stream().map(User::getName).collect(toList());
List<String> list2 = users.stream().map(User::getName).toList();

// 收集为 Set（自动去重）
Set<String> set = users.stream().map(User::getName).collect(toSet());

// 收集为不可变 List
List<String> immutable = users.stream().map(User::getName).collect(toUnmodifiableList());

// 收集为 Map
Map<Long, User> byId = users.stream()
    .collect(toMap(User::getId, u -> u));
    // 或 toMap(User::getId, Function.identity())

// key 冲突时合并
Map<String, Integer> merged = users.stream()
    .collect(toMap(User::getName, User::getAge, (a, b) -> a));

// 拼接字符串
String names = users.stream()
    .map(User::getName)
    .collect(joining(", "));                        // "Tom, Jerry, Spike"

String bracketed = users.stream()
    .map(User::getName)
    .collect(joining(", ", "[", "]"));              // "[Tom, Jerry, Spike]"
```

### groupingBy：分组

Stream 里的杀手级操作，等价于 SQL 的 `GROUP BY`：

```java
// 按分类分组：Map<Category, List<Product>>
Map<String, List<Product>> byCategory = products.stream()
    .collect(groupingBy(Product::getCategory));

// 分组后计数：Map<Category, Long>
Map<String, Long> countByCategory = products.stream()
    .collect(groupingBy(Product::getCategory, counting()));

// 分组后求和：Map<Category, Double>
Map<String, Double> sumByCategory = products.stream()
    .collect(groupingBy(Product::getCategory, summingDouble(Product::getPrice)));

// 分组后取某字段：Map<Category, List<String>>
Map<String, List<String>> namesByCategory = products.stream()
    .collect(groupingBy(Product::getCategory,
                        mapping(Product::getName, toList())));

// 多级分组
Map<String, Map<String, List<Product>>> nested = products.stream()
    .collect(groupingBy(Product::getCategory,
                        groupingBy(Product::getBrand)));

// 分区（true/false 两组）
Map<Boolean, List<User>> partition = users.stream()
    .collect(partitioningBy(u -> u.getAge() >= 18));
```

### reduce：聚合

把流中的元素**合并成一个值**，跟 JS 的 `reduce` 一样：

```java
// 求和
int sum = nums.stream().reduce(0, (a, b) -> a + b);
int sum2 = nums.stream().reduce(0, Integer::sum);

// 求最大值
Optional<Integer> max = nums.stream().reduce(Integer::max);

// 拼接字符串
String concat = words.stream().reduce("", (a, b) -> a + b);
```

**更推荐用 `mapToInt/mapToDouble` + `sum/average/max`**（性能更好）：

```java
int sum = nums.stream().mapToInt(Integer::intValue).sum();
double avg = users.stream().mapToInt(User::getAge).average().orElse(0);
int max = users.stream().mapToInt(User::getAge).max().orElse(0);
long total = users.stream().count();
```

### 匹配与查找

```java
// anyMatch：至少一个满足
boolean anyAdult = users.stream().anyMatch(u -> u.getAge() >= 18);

// allMatch：全部满足
boolean allAdults = users.stream().allMatch(u -> u.getAge() >= 18);

// noneMatch：没有一个满足
boolean noAdult = users.stream().noneMatch(u -> u.getAge() >= 18);

// findFirst：第一个（有序流保证第一个）
Optional<User> first = users.stream().findFirst();

// findAny：任意一个（并行流更快）
Optional<User> any = users.parallelStream().findAny();
```

对应 JS：`arr.some`、`arr.every`、`arr.find`。

## Optional：优雅处理 null

`Optional<T>` 是一个"可能存在也可能不存在的值"的容器，避免 `NullPointerException`：

```java
import java.util.Optional;

// 创建
Optional<String> present = Optional.of("hello");      // 值不能为 null
Optional<String> empty = Optional.empty();
Optional<String> nullable = Optional.ofNullable(null); // 值可以为 null

// 检查
present.isPresent();          // true
present.isEmpty();            // false（JDK 11+）

// 取值
String value = present.get();                            // 直接取，空则抛异常
String orElse = empty.orElse("default");                 // 空则返回默认值
String orElseGet = empty.orElseGet(() -> compute());     // 空则计算默认值（惰性）
String orElseThrow = empty.orElseThrow(() -> new RuntimeException("没找到"));

// 转换
Optional<Integer> length = present.map(String::length);
Optional<Integer> flat = present.flatMap(s -> Optional.of(s.length()));

// 消费
present.ifPresent(s -> System.out.println(s));
present.ifPresentOrElse(
    s -> System.out.println("有值：" + s),
    () -> System.out.println("没值")
);

// 过滤
Optional<String> filtered = present.filter(s -> s.length() > 3);

// 转 Stream
Stream<String> stream = present.stream();
```

**Optional 使用建议**：

- ✅ **方法返回类型**，表示"可能没有结果"
- ❌ 不要用作**类字段**（不能序列化）
- ❌ 不要用作**方法参数**（增加复杂度）
- ❌ 不要用作**集合元素**（`List<Optional<T>>` 是反模式）

对比 JS：

```javascript
// JS 可选链
const name = user?.profile?.name ?? 'Anonymous';

// Java Optional
String name = Optional.ofNullable(user)
    .map(User::getProfile)
    .map(Profile::getName)
    .orElse("Anonymous");
```

## 并行流

`parallelStream()` 让 Stream 自动多线程执行，充分利用多核 CPU：

```java
// 串行
long count = hugeList.stream().filter(this::expensiveCheck).count();

// 并行
long count = hugeList.parallelStream().filter(this::expensiveCheck).count();
```

**注意事项**：

1. **不是万能的**：小数据集反而更慢（线程调度开销）
2. **底层用 ForkJoinPool.commonPool()**：默认线程数 = CPU 核心数 - 1，多个并行流共享同一个池
3. **操作必须无状态**：不能用 `peek` 修改外部变量，不能保证顺序
4. **数据源要易分割**：`ArrayList`、数组好；`LinkedList`、`Iterator` 差
5. **不要在并行流里做阻塞 IO**：会占满公共池影响其他任务

**判断该不该用并行流**：数据量大（>10000）+ 单元素处理耗时（>计算成本）+ 数据源易分割 → 可以试试。

## 综合小例子：订单数据分析

用 Stream 完成一个类似 JS `Array.prototype.*` 链式调用的分析：

```java title="OrderAnalytics.java"
package com.example.shop;

import java.util.*;
import java.util.stream.*;
import static java.util.stream.Collectors.*;

public record Order(
    String id,
    String userId,
    String category,
    List<String> items,
    double amount,
    boolean paid
) {}

public class OrderAnalytics {
    private final List<Order> orders;

    public OrderAnalytics(List<Order> orders) {
        this.orders = orders;
    }

    /** 已支付的订单总金额 */
    public double totalRevenue() {
        return orders.stream()
            .filter(Order::paid)
            .mapToDouble(Order::amount)
            .sum();
    }

    /** 每个分类的订单数（降序） */
    public Map<String, Long> countByCategory() {
        return orders.stream()
            .collect(groupingBy(Order::category, counting()))
            .entrySet().stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .collect(toMap(
                Map.Entry::getKey,
                Map.Entry::getValue,
                (a, b) -> a,
                LinkedHashMap::new     // 保持排序后的顺序
            ));
    }

    /** 每个用户的消费总额 Top 3 */
    public List<Map.Entry<String, Double>> topUsers(int limit) {
        return orders.stream()
            .filter(Order::paid)
            .collect(groupingBy(Order::userId, summingDouble(Order::amount)))
            .entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(limit)
            .toList();
    }

    /** 所有商品去重后的列表 */
    public List<String> uniqueItems() {
        return orders.stream()
            .flatMap(o -> o.items().stream())
            .distinct()
            .sorted()
            .toList();
    }

    /** 平均订单金额 */
    public double averageOrderValue() {
        return orders.stream()
            .filter(Order::paid)
            .mapToDouble(Order::amount)
            .average()
            .orElse(0);
    }

    /** 按用户分组，每组保留金额最高的订单 */
    public Map<String, Optional<Order>> topOrderByUser() {
        return orders.stream()
            .filter(Order::paid)
            .collect(groupingBy(
                Order::userId,
                maxBy(Comparator.comparingDouble(Order::amount))
            ));
    }

    /** 是否有超过 10000 元的大额订单 */
    public boolean hasLargeOrder() {
        return orders.stream().anyMatch(o -> o.amount() > 10000);
    }
}
```

对应的 JS 版本大概是这样：

```javascript
class OrderAnalytics {
    constructor(orders) { this.orders = orders; }

    totalRevenue() {
        return this.orders
            .filter(o => o.paid)
            .reduce((sum, o) => sum + o.amount, 0);
    }

    countByCategory() {
        const map = {};
        this.orders.forEach(o => { map[o.category] = (map[o.category] ?? 0) + 1; });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }

    uniqueItems() {
        return [...new Set(this.orders.flatMap(o => o.items))].sort();
    }
}
```

Java 版本看起来更"结构化"，JS 版本更"随手"，但表达力是一样的。

## 复习卡片

```java
// Lambda
Runnable r = () -> System.out.println("hi");
Function<String, Integer> f = s -> s.length();
Predicate<Integer> p = n -> n > 0;
Consumer<String> c = System.out::println;
Supplier<Double> s = Math::random;

// 四大函数式接口
Function<T, R>:  R apply(T)
Predicate<T>:    boolean test(T)
Consumer<T>:     void accept(T)
Supplier<T>:     T get()

// 组合
f1.andThen(f2)   // 先 f1 后 f2
f1.compose(f2)   // 先 f2 后 f1
p1.and(p2) / p1.or(p2) / p1.negate()

// 方法引用
Integer::parseInt        // 静态方法
System.out::println      // 实例方法
String::length           // 任意对象的实例方法
ArrayList::new           // 构造器

// Stream 三段式
list.stream()
    .filter(x -> x > 0)           // 中间：过滤
    .map(x -> x * 2)              // 中间：映射
    .flatMap(Collection::stream)  // 中间：扁平化
    .distinct()                   // 中间：去重
    .sorted(Comparator.reverseOrder())  // 中间：排序
    .limit(10).skip(5)            // 中间：切片
    .peek(System.out::println)    // 中间：窥视
    .collect(Collectors.toList()) // 终止：收集
    // .toList()                  // 终止：JDK 16+ 简写
    // .forEach(...)              // 终止：遍历
    // .count()                   // 终止：计数
    // .reduce(...)               // 终止：聚合
    // .anyMatch/allMatch/noneMatch
    // .findFirst/findAny

// Collectors 常用
toList() / toSet() / toUnmodifiableList()
toMap(k, v) / toMap(k, v, mergeFn)
joining(", ")
groupingBy(classifier)
groupingBy(classifier, counting())
groupingBy(classifier, summingDouble(...))
groupingBy(classifier, mapping(..., toList()))
partitioningBy(predicate)
maxBy(comparator) / minBy(comparator)

// 数字流
IntStream.range(0, 10).sum()
list.stream().mapToInt(X::getValue).average().orElse(0)

// Optional
Optional.of(x) / Optional.empty() / Optional.ofNullable(x)
opt.map(...).filter(...).orElse(default)
opt.ifPresent(...) / opt.ifPresentOrElse(a, b)

// 并行流（谨慎使用）
list.parallelStream()...
```

**记忆要点**：

- Lambda 只能实现**函数式接口**（`@FunctionalInterface`）
- 四大内置：`Function` / `Predicate` / `Consumer` / `Supplier`
- 方法引用 `::` 是 Lambda 的语法糖
- Lambda 捕获的变量必须 **effectively final**
- Stream 三段式：**source → intermediate → terminal**
- 中间操作**惰性**，只有终止操作触发才执行
- Stream **一次性**消费，用完就废
- 分组用 `groupingBy`，聚合用 `mapToInt` + `sum/average/max`
- `Optional` 用于**方法返回类型**，别用作字段或参数
- 并行流不是万金油，小数据反而慢

最后一个阶段——多线程入门。前端习惯单线程 + 事件循环，Java 的多线程是完全不同的心智模型，也是最容易出 bug 的地方。
