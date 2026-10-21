---
title: 'Java 阶段七：接口、抽象类与静态成员'
published: 2026-09-04T09:00:00+08:00
description: 'interface 定义与实现、默认方法、抽象类 vs 接口、常用标准接口（Comparable/Runnable）、内部类、密封类。'
tags: [Java, 接口, 抽象类, Comparable, 内部类]
category: Java学习路线
draft: false
---

如果说继承表达的是 "**is-a**"（Dog 是 Animal），接口表达的是 "**can-do**"（Dog 能跑、能叫）。Java 里接口用得比继承还多，尤其是 JDK 8 引入默认方法之后，接口能做的事大大扩展。这一篇把接口和抽象类彻底捋清楚。

## 接口基础

接口是**只有方法签名（早期）+ 常量**的纯契约。用 `interface` 定义，用 `implements` 实现：

```java
// 定义接口
public interface Flyable {
    void fly();                    // 隐式 public abstract
    String getFlyStyle();
}

// 实现接口
public class Bird implements Flyable {
    @Override
    public void fly() {
        System.out.println("鸟在飞");
    }

    @Override
    public String getFlyStyle() {
        return "拍打翅膀";
    }
}

public class Airplane implements Flyable {
    @Override
    public void fly() {
        System.out.println("飞机在飞");
    }

    @Override
    public String getFlyStyle() {
        return "引擎推进";
    }
}

// 使用：多态
Flyable f1 = new Bird();
Flyable f2 = new Airplane();
f1.fly();     // 鸟在飞
f2.fly();     // 飞机在飞
```

**接口成员的隐式修饰符**：

| 成员 | 隐式修饰符 |
| :-- | :-- |
| 字段 | `public static final`（即常量） |
| 方法 | `public abstract`（JDK 8 起也可以是 `default` / `static`） |
| 内部类/接口 | `public static` |

所以接口里写 `int MAX = 100;` 其实是 `public static final int MAX = 100;`，可以直接用 `接口名.MAX` 访问。

## 一个类实现多个接口

Java **单继承多实现**，弥补了单继承的限制：

```java
public interface Swimmable {
    void swim();
}

public interface Flyable {
    void fly();
}

// 一个类可以既会游又会飞
public class Duck extends Animal implements Swimmable, Flyable {
    @Override
    public void swim() { System.out.println("鸭子游泳"); }

    @Override
    public void fly() { System.out.println("鸭子飞"); }
}
```

**语法顺序**：`class 类名 extends 父类 implements 接口1, 接口2 { ... }`，`extends` 必须在 `implements` 前面。

## 接口的默认方法（JDK 8+）

早期接口里所有方法都是抽象的，任何修改都会破坏所有实现类。JDK 8 引入 `default` 方法，允许接口提供**默认实现**：

```java
public interface Logger {
    void log(String message);                // 抽象方法，实现类必须提供

    default void warn(String message) {      // 默认方法，实现类可以直接用或重写
        log("[WARN] " + message);
    }

    default void error(String message) {
        log("[ERROR] " + message);
    }
}

public class ConsoleLogger implements Logger {
    @Override
    public void log(String message) {
        System.out.println(message);
    }
    // warn 和 error 直接继承，无需重写
}

ConsoleLogger logger = new ConsoleLogger();
logger.log("hi");           // hi
logger.warn("小心");         // [WARN] 小心
logger.error("出错了");      // [ERROR] 出错了
```

### 默认方法的冲突解决

如果一个类实现了两个接口，两个接口都有同名的默认方法，编译器会**强制要求重写**：

```java
public interface A {
    default void hello() { System.out.println("A"); }
}

public interface B {
    default void hello() { System.out.println("B"); }
}

public class C implements A, B {
    @Override
    public void hello() {
        // 必须重写，明确选择哪一个
        A.super.hello();      // 显式调用 A 的默认实现
        // 或者 B.super.hello();
        // 或者完全自己实现
    }
}
```

## 接口的静态方法和私有方法

JDK 8 起接口可以有静态方法：

```java
public interface MathUtils {
    static int square(int n) {
        return n * n;
    }
}

MathUtils.square(5);   // 25，通过接口名调用
```

JDK 9 起还可以有私有方法，用来给默认方法提取公共逻辑：

```java
public interface Validator {
    default boolean validate(String s) {
        return checkNotNull(s) && checkLength(s);
    }

    private boolean checkNotNull(String s) { return s != null; }
    private boolean checkLength(String s) { return s.length() > 0; }
}
```

## 接口 vs 抽象类

| 维度 | 接口 `interface` | 抽象类 `abstract class` |
| :-- | :-- | :-- |
| 关系 | can-do（能力） | is-a（血缘） |
| 继承数量 | 一个类可以实现**多个**接口 | 只能继承**一个**抽象类 |
| 字段 | 只能是 `public static final` 常量 | 任意字段（含实例字段） |
| 构造器 | **没有**构造器 | **有**构造器（供子类调用） |
| 方法 | 抽象、`default`、`static`、`private` | 抽象方法 + 普通方法 |
| 访问修饰符 | 方法隐式 `public` | 方法可以 `public`/`protected`/`private` |
| 何时用 | 定义能力、跨类层次共享行为 | 定义家族模板、共享状态和构造逻辑 |

**经验法则**：

- 优先用**接口**定义 API 契约（`List`、`Comparable`、`Runnable`）
- 需要共享状态或构造逻辑时用**抽象类**（`AbstractList` 是 `List` 的骨架实现）
- 两者常常配合使用：**接口定契约，抽象类做骨架**

**经典组合**：Java 集合框架

```text
List<E>（接口，定契约）
  ↑ implements
AbstractList<E>（抽象类，做骨架）
  ↑ extends
ArrayList<E> / LinkedList<E>（具体实现）
```

## 常用标准接口

Java 标准库里有几个接口用得极多，必须掌握：

### Comparable：定义自然排序

```java
public class User implements Comparable<User> {
    private String name;
    private int age;

    @Override
    public int compareTo(User other) {
        // 返回负数：this < other
        // 返回 0：this == other
        // 返回正数：this > other
        return Integer.compare(this.age, other.age);   // 按年龄升序
    }
}

List<User> users = ...;
Collections.sort(users);              // 自动按 compareTo 排序
users.sort(Comparator.naturalOrder());   // 等价
```

### Comparator：定义外部排序规则

```java
import java.util.Comparator;

// 按名字排序
Comparator<User> byName = Comparator.comparing(User::getName);

// 按年龄降序
Comparator<User> byAgeDesc = Comparator.comparingInt(User::getAge).reversed();

// 多字段：先按年龄升序，年龄相同按名字
Comparator<User> combined = Comparator
    .comparingInt(User::getAge)
    .thenComparing(User::getName);

users.sort(byName);
users.sort(byAgeDesc);
users.sort(combined);
```

`Comparator` 是 Lambda 和 Stream API 的基础，阶段十会大量用到。

### Runnable：无返回值的任务

```java
public interface Runnable {
    void run();
}

// 用于线程
Runnable task = () -> System.out.println("运行中");
new Thread(task).start();
```

### Iterable 与 Iterator：可遍历

任何实现 `Iterable<T>` 的类都能用增强 for 循环：

```java
public class MyCollection implements Iterable<String> {
    private List<String> items = new ArrayList<>();

    @Override
    public Iterator<String> iterator() {
        return items.iterator();
    }
}

for (String s : new MyCollection()) { ... }   // ✅ 可以用了
```

### 其他常见接口

| 接口 | 方法 | 用途 |
| :-- | :-- | :-- |
| `Cloneable` | （标记接口） | 允许 `clone()` |
| `Serializable` | （标记接口） | 允许序列化 |
| `AutoCloseable` | `close()` | 支持 try-with-resources |
| `CharSequence` | `length()`, `charAt()` | 字符串通用接口，`String`/`StringBuilder` 都实现 |
| `FunctionalInterface` | （注解） | 单方法接口，支持 Lambda |

## 接口继承

接口之间可以继承，且**可以多继承**：

```java
public interface Readable {
    void read();
}

public interface Writable {
    void write();
}

public interface ReadWritable extends Readable, Writable {
    void close();
}

public class File implements ReadWritable {
    @Override public void read() { ... }
    @Override public void write() { ... }
    @Override public void close() { ... }
}
```

## 内部类简介

Java 允许在一个类里定义另一个类，主要四种：

### 1. 成员内部类

```java
public class Outer {
    private String name = "outer";

    public class Inner {
        public void print() {
            System.out.println(name);   // 可以访问外部类的字段
        }
    }
}

// 实例化：先有 Outer，再有 Inner
Outer outer = new Outer();
Outer.Inner inner = outer.new Inner();
inner.print();
```

### 2. 静态内部类（推荐）

```java
public class Outer {
    private String name = "outer";

    public static class Inner {
        public void print() {
            // System.out.println(name);   // ❌ 静态内部类不能访问外部实例字段
            System.out.println("static inner");
        }
    }
}

Outer.Inner inner = new Outer.Inner();   // 直接实例化，无需 Outer
```

`Map.Entry` 就是典型的静态内部类。日常用内部类**首选静态**，避免持有外部引用导致的内存泄漏。

### 3. 局部内部类（很少用）

```java
public void method() {
    class LocalInner {
        void doIt() { ... }
    }
    new LocalInner().doIt();
}
```

### 4. 匿名内部类（Lambda 之前的写法）

```java
Runnable r = new Runnable() {
    @Override
    public void run() {
        System.out.println("running");
    }
};

// JDK 8+ 用 Lambda 简化
Runnable r2 = () -> System.out.println("running");
```

Lambda 会在阶段十详细讲，这里先知道它是匿名内部类的语法糖即可。

## 密封类 sealed（JDK 17+）

**密封类**限制哪些类可以继承/实现它，用于精确建模"有限的类型集合"：

```java
public sealed interface Shape
    permits Circle, Rectangle, Triangle {
    double area();
}

public final class Circle implements Shape { ... }
public final class Rectangle implements Shape { ... }
public final class Triangle implements Shape { ... }

// ❌ 其他类不能实现 Shape
// public class Hexagon implements Shape { ... }   // 编译报错
```

**子类必须显式声明为**：

- `final`：不能再被继承
- `sealed`：继续密封，需要 `permits`
- `non-sealed`：开放继承

配合 JDK 21 的**模式匹配 switch**，可以写出非常优雅的类型分支：

```java
public static String describe(Shape s) {
    return switch (s) {
        case Circle c    -> "圆，半径 " + c.radius();
        case Rectangle r -> "矩形，宽 " + r.width();
        case Triangle t  -> "三角形";
        // 不需要 default，编译器知道所有可能的子类
    };
}
```

这在处理 AST、事件、状态机等"有限类型集合"时特别好用。

## 综合小例子：支付系统

用接口和抽象类设计一个可扩展的支付系统：

```java title="PaymentMethod.java"
package com.example.payment;

public interface PaymentMethod {
    boolean pay(double amount);
    String getName();

    default void refund(double amount) {
        System.out.printf("[%s] 退款 %.2f%n", getName(), amount);
    }
}
```

```java title="AbstractCreditCard.java"
package com.example.payment;

public abstract class AbstractCreditCard implements PaymentMethod {
    protected final String cardNumber;
    protected double balance;

    protected AbstractCreditCard(String cardNumber, double balance) {
        this.cardNumber = cardNumber;
        this.balance = balance;
    }

    @Override
    public boolean pay(double amount) {
        if (amount > balance) {
            System.out.println("余额不足");
            return false;
        }
        balance -= amount;
        System.out.printf("[%s] 支付 %.2f，剩余 %.2f%n",
            getName(), amount, balance);
        return true;
    }

    // 子类只需要提供名字
    // getName() 留给子类实现
}
```

```java title="VisaCard.java"
package com.example.payment;

public class VisaCard extends AbstractCreditCard {
    public VisaCard(String cardNumber, double balance) {
        super(cardNumber, balance);
    }

    @Override
    public String getName() { return "Visa-" + cardNumber.substring(cardNumber.length() - 4); }
}
```

```java title="AlipayAccount.java"
package com.example.payment;

public class AlipayAccount implements PaymentMethod {
    private final String account;
    private double balance;

    public AlipayAccount(String account, double balance) {
        this.account = account;
        this.balance = balance;
    }

    @Override
    public boolean pay(double amount) {
        if (amount > balance) return false;
        balance -= amount;
        System.out.printf("[支付宝 %s] 支付 %.2f%n", account, amount);
        return true;
    }

    @Override
    public String getName() { return "支付宝-" + account; }
}
```

```java title="PaymentDemo.java"
package com.example.payment;

import java.util.List;

public class PaymentDemo {
    public static void main(String[] args) {
        List<PaymentMethod> methods = List.of(
            new VisaCard("4111111111111111", 1000),
            new AlipayAccount("tom@example.com", 500)
        );

        // 多态：统一接口，不同实现
        for (PaymentMethod m : methods) {
            m.pay(200);
            m.refund(50);       // 默认方法，AlipayAccount 也能用
        }
    }
}
```

这个设计的扩展性：**新增一种支付方式**（微信、银联）只需要写一个新类实现 `PaymentMethod`，业务代码不用改。这就是"面向接口编程"的威力。

## 复习卡片

```java
// 接口定义与实现
public interface Flyable {
    void fly();
    default void land() { System.out.println("降落"); }
    static Flyable empty() { return () -> {}; }
}

public class Bird implements Flyable {
    @Override public void fly() { ... }
}

// 多实现
public class Duck extends Animal implements Swimmable, Flyable { ... }

// Comparable：自然排序
public class User implements Comparable<User> {
    @Override
    public int compareTo(User o) {
        return Integer.compare(age, o.age);
    }
}

// Comparator：外部排序
users.sort(Comparator.comparing(User::getName));
users.sort(Comparator.comparingInt(User::getAge).reversed());

// 抽象类
public abstract class Shape {
    protected String color;
    public abstract double area();
    public void describe() { ... }
}

// 密封类（JDK 17+）
public sealed interface Shape permits Circle, Rectangle {}
public final class Circle implements Shape {}

// 静态内部类（推荐）
public class Outer {
    public static class Inner { ... }
}
new Outer.Inner();
```

**记忆要点**：

- 接口是"能力"（can-do），抽象类是"血缘"（is-a）
- Java **单继承多实现**，弥补单继承限制
- 接口方法隐式 `public abstract`，字段隐式 `public static final`
- 默认方法用 `default`，冲突时子类必须重写并用 `接口名.super.方法()` 选择
- `Comparable` 定义自然排序（内部），`Comparator` 定义外部排序规则
- 内部类首选 `static` 静态内部类，避免内存泄漏
- 密封类 `sealed` 限制继承者，配合 JDK 21 模式匹配 switch 极优雅
- 面向接口编程：新增实现类不改业务代码

到这里 OOP 三件套（类、继承、接口）就讲完了。下一阶段进入日常业务代码里出现频率最高的东西——集合框架 `List/Set/Map`。
