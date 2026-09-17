---
title: 'Java 阶段五：面向对象（一）——类与对象'
published: 2026-09-03T14:00:00+08:00
description: '类的定义、字段、方法、构造器、this、static、包与访问修饰符、方法重载、JavaBean、record，一篇讲完 Java OOP 的地基。'
tags: [Java, 面向对象, 类, 构造器, static]
category: Java学习路线
draft: false
---

JS 从 ES6 起也有了 `class`，但底层仍然是原型链。Java 的类是**真正的类**：字段类型固定、方法必须声明返回类型、实例化必须 `new`。这个阶段把 Java OOP 的地基一次搭起来。

## 从 JS 的 class 到 Java 的 class

先看两边同一个"用户"类的写法：

```javascript
// JavaScript
class User {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    greet() {
        return `Hi, I'm ${this.name}`;
    }
}

const u = new User("Tom", 25);
```

```java
// Java
public class User {
    // 字段必须声明类型
    private String name;
    private int age;

    // 构造器：名字必须与类名一致，没有返回类型
    public User(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // 方法必须声明返回类型
    public String greet() {
        return "Hi, I'm " + name;
    }
}

// 使用
User u = new User("Tom", 25);
System.out.println(u.greet());
```

**关键差异**：

| 维度 | JavaScript | Java |
| :-- | :-- | :-- |
| 字段声明 | 构造器里 `this.x = ...` 隐式声明 | 类体里显式声明类型 |
| 方法返回类型 | 隐式，不写 `return` 就是 `undefined` | 必须显式声明 `void` 或具体类型 |
| 访问控制 | `#field` 私有（ES2022+），约定用 `_field` | `public` / `private` / `protected` / 默认 |
| 实例化 | `new User()` | `new User()`，但变量必须有声明类型 |
| 类型 | 动态 | 静态，编译期检查 |

## 类的完整结构

```java
package com.example.model;         // 1. 包声明（可选，但推荐）

import java.util.List;             // 2. 导入其他类
import java.time.LocalDate;

public class User {                // 3. 类声明
    // ========== 静态字段（属于类，所有实例共享） ==========
    private static int userCount = 0;
    public static final String DEFAULT_ROLE = "guest";

    // ========== 实例字段（属于对象，每个实例独立） ==========
    private Long id;
    private String name;
    private int age;
    private LocalDate registeredAt;
    private List<String> tags;

    // ========== 构造器 ==========
    public User() {
        this("Anonymous", 0);       // 调用另一个构造器
    }

    public User(String name, int age) {
        this.name = name;
        this.age = age;
        this.registeredAt = LocalDate.now();
        userCount++;
    }

    // ========== 实例方法 ==========
    public String greet() {
        return "Hi, I'm " + name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    // ========== 静态方法 ==========
    public static int getUserCount() {
        return userCount;
    }
}
```

**几个约定俗成的规矩**：

1. 一个 `.java` 文件最多一个 `public` 类，文件名 = 类名
2. 顺序：包声明 → import → 类声明
3. 类内部顺序：静态字段 → 实例字段 → 构造器 → 方法
4. 字段一般 `private`，通过 getter/setter 暴露

## 构造器

### 默认构造器

如果**没有显式写任何构造器**，Java 会自动提供一个无参构造器：

```java
public class Simple {
    // 没写构造器
}

new Simple();   // ✅ 编译器提供的默认无参构造器
```

一旦你**写了任何一个构造器**，默认的无参构造器就消失了：

```java
public class User {
    public User(String name) { ... }
}

new User();             // ❌ 编译报错：no suitable constructor
new User("Tom");        // ✅
```

想要保留无参构造器就得自己写一个。

### 构造器重载

同一个类可以有多个参数不同的构造器：

```java
public class User {
    private String name;
    private int age;
    private String email;

    public User() {
        this("Anonymous", 0, null);
    }

    public User(String name) {
        this(name, 0, null);
    }

    public User(String name, int age) {
        this(name, age, null);
    }

    public User(String name, int age, String email) {
        this.name = name;
        this.age = age;
        this.email = email;
    }
}
```

### this(...) 调用其他构造器

`this(...)` 必须是构造器里的**第一行**，用来复用其他构造器的逻辑：

```java
public User(String name) {
    this(name, 0);          // ✅ 调用 User(String, int)
    // 其他代码
}
```

不能同时用 `this(...)` 和 `super(...)`（父类构造器），因为它们都要在第一行。

## this 关键字

`this` 指向当前实例，主要三种用法：

### 1. 区分字段和参数

```java
public class User {
    private String name;

    public void setName(String name) {
        this.name = name;      // 字段 = 参数
        // name = name;        // ❌ 参数赋给自己，字段没变
    }
}
```

### 2. 调用当前对象的其他方法

```java
public class Counter {
    private int count = 0;

    public void increment() {
        count++;
    }

    public void incrementTwice() {
        this.increment();      // 显式调用（this 可省略）
        this.increment();
    }
}
```

### 3. 调用当前类的其他构造器

```java
public User() {
    this("Anonymous");         // 调用 User(String)
}
```

> [!NOTE]
> `this` 不能在 `static` 方法里使用，因为静态方法属于类本身，没有"当前实例"的概念：
> ```java
> public static void printName() {
>     // System.out.println(this.name);   // ❌ 编译报错
> }
> ```

## static：属于类，不属于对象

`static` 修饰的字段和方法**属于类本身**，所有实例共享：

```java
public class User {
    private static int count = 0;         // 静态字段：所有 User 共享
    private String name;                  // 实例字段：每个 User 独立

    public User(String name) {
        this.name = name;
        count++;                          // 静态字段在构造器里累加
    }

    public static int getCount() {        // 静态方法
        return count;
    }

    public String getName() {             // 实例方法
        return name;
    }
}

// 使用
User u1 = new User("Tom");
User u2 = new User("Jerry");

User.getCount();     // ✅ 通过类名调用（推荐）
u1.getCount();       // ✅ 也能通过实例调用，但容易误导，不推荐
u1.getName();        // ✅ 实例方法必须通过实例
// User.getName();   // ❌ 静态上下文无法调用实例方法
```

**static 使用场景**：

- 常量：`public static final double PI = 3.14;`
- 工具方法：`Math.max`、`Arrays.sort`、`String.join` 都是静态方法
- 工厂方法：`Integer.valueOf(42)`、`List.of(1, 2, 3)`
- 计数器、缓存、单例

**static 的限制**：

- 不能访问实例字段和实例方法（因为没有 `this`）
- 不能被重写（override），只能被隐藏（hide）
- 静态方法里不能用 `this` 和 `super`

## 访问修饰符

Java 有 4 种访问级别，从宽到严：

| 修饰符 | 同一个类 | 同一个包 | 子类（跨包） | 任何地方 |
| :-- | :--: | :--: | :--: | :--: |
| `public` | ✅ | ✅ | ✅ | ✅ |
| `protected` | ✅ | ✅ | ✅ | ❌ |
| 默认（不写） | ✅ | ✅ | ❌ | ❌ |
| `private` | ✅ | ❌ | ❌ | ❌ |

**经验法则**：

- 字段：**一律 `private`**，需要暴露就写 getter/setter
- 构造器：一般 `public`（想禁止外部实例化则 `private`，比如单例）
- 方法：内部实现 `private`，对外 API `public`
- 常量：`public static final`

```java
public class BankAccount {
    private double balance;              // 私有字段，外部无法直接改

    public double getBalance() {         // 只暴露 getter，不允许外部修改
        return balance;
    }

    public void deposit(double amount) { // 通过方法修改，可以加校验
        if (amount <= 0) {
            throw new IllegalArgumentException("金额必须大于 0");
        }
        balance += amount;
    }
}
```

## 包与 import

**包**（package）是 Java 的模块系统，用来组织类、避免命名冲突。包名对应目录结构：

```text
src/
└── com/
    └── example/
        └── model/
            ├── User.java         // package com.example.model;
            └── Admin.java        // package com.example.model;
```

每个 `.java` 文件第一行声明所属包：

```java
package com.example.model;

public class User { ... }
```

### import 引入其他包的类

```java
import java.util.List;              // 引入单个类
import java.util.ArrayList;
import java.time.*;                 // 引入整个包（不推荐，容易命名冲突）
import static java.lang.Math.PI;    // 引入静态成员，之后可以直接写 PI
import static java.lang.Math.*;     // 引入所有静态成员
```

**几个常用的隐式导入**：

- `java.lang.*` 自动导入（`String`、`Integer`、`Math`、`System` 都不用 import）
- 同一个包里的类互相不用 import

### 命名约定

包名用**反向域名**开头，全小写：

```text
com.company.project.module
com.example.blog.controller
org.apache.commons.lang3
```

## 方法重载（Overload）

同一个类里，**方法名相同、参数列表不同**叫重载。返回类型可以相同也可以不同，但**不能只靠返回类型区分**：

```java
public class Calculator {
    public int add(int a, int b) { return a + b; }
    public double add(double a, double b) { return a + b; }
    public int add(int a, int b, int c) { return a + b + c; }
    public String add(String a, String b) { return a + b; }

    // ❌ 只有返回类型不同不构成重载
    // public int add(int a, int b) { return a + b; }
    // public double add(int a, int b) { return a + b; }   // 编译错误
}
```

Java 标准库里重载非常常见，比如 `System.out.println` 就有 10 个重载版本（`int`、`long`、`double`、`String`、`Object`...）。

## JavaBean 约定

JavaBean 是一种约定俗成的类结构，用来表示"数据对象"：

1. 有一个 `public` 无参构造器
2. 字段全部 `private`
3. 每个字段有 `public` 的 getter/setter，命名遵循 `getXxx` / `setXxx`（`boolean` 用 `isXxx`）
4. 可序列化（实现 `Serializable` 接口，可选）

```java
public class User implements java.io.Serializable {
    private String name;
    private int age;
    private boolean active;

    public User() {}

    public User(String name, int age, boolean active) {
        this.name = name;
        this.age = age;
        this.active = active;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }

    public boolean isActive() { return active; }   // boolean 用 is
    public void setActive(boolean active) { this.active = active; }
}
```

写业务代码时 getter/setter 一般由 **IDE 自动生成**（IDEA：`Alt+Insert`；VS Code：右键 → Source Action），或者用 **Lombok** 库的 `@Data` 注解一键生成。

## record：不可变数据类（JDK 14+）

如果只是要一个"纯数据容器"，用 `record` 一行搞定，编译器自动生成 getter、`equals`、`hashCode`、`toString`、构造器：

```java
public record Point(int x, int y) {}

// 使用
Point p = new Point(3, 4);
p.x();               // 3，getter 名字就是字段名，不加 get
p.y();               // 4
System.out.println(p);   // "Point[x=3, y=4]"，toString 自动生成

// 两个 Point 只要 x/y 相同就相等
new Point(1, 2).equals(new Point(1, 2));   // true
```

`record` 的限制：

- 字段隐式 `private final`，**不能修改**
- 不能继承其他类（隐式继承 `java.lang.Record`）
- 可以实现接口
- 可以加静态字段、静态方法、实例方法
- 可以加"紧凑构造器"做校验：

```java
public record User(String name, int age) {
    public User {
        if (age < 0) throw new IllegalArgumentException("年龄不能为负");
        if (name == null) throw new NullPointerException("name 不能为 null");
    }
}
```

**用 record 的场景**：DTO、坐标、键值对、多返回值。**不用 record 的场景**：需要修改字段的实体类（用传统 class + Lombok）。

## 综合小例子：图书管理

把这一阶段的语法组合起来，写一个简易的图书管理类：

```java title="Book.java"
package com.example.library;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class Book {
    private static int totalBooks = 0;

    private final String isbn;
    private String title;
    private String author;
    private double price;
    private boolean borrowed;
    private LocalDate publishedAt;
    private List<String> tags;

    public Book(String isbn, String title, String author, double price) {
        this.isbn = isbn;
        this.title = title;
        this.author = author;
        this.price = price;
        this.borrowed = false;
        this.publishedAt = LocalDate.now();
        this.tags = new ArrayList<>();
        totalBooks++;
    }

    // 便捷构造器：只传必要信息
    public Book(String isbn, String title) {
        this(isbn, title, "Unknown", 0.0);
    }

    public void borrow() {
        if (borrowed) {
            throw new IllegalStateException("《" + title + "》已被借出");
        }
        borrowed = true;
    }

    public void returnBook() {
        borrowed = false;
    }

    public void addTag(String tag) {
        tags.add(tag);
    }

    // Getters
    public String getIsbn() { return isbn; }
    public String getTitle() { return title; }
    public String getAuthor() { return author; }
    public double getPrice() { return price; }
    public boolean isBorrowed() { return borrowed; }
    public List<String> getTags() { return List.copyOf(tags); }

    public static int getTotalBooks() { return totalBooks; }

    @Override
    public String toString() {
        return "《%s》 by %s (ISBN: %s)%s".formatted(
            title, author, isbn, borrowed ? " [已借出]" : ""
        );
    }
}
```

使用它：

```java
public class LibraryDemo {
    public static void main(String[] args) {
        Book b1 = new Book("978-7-115-42802-8", "Java 核心技术", "Cay Horstmann", 148.0);
        b1.addTag("Java");
        b1.addTag("编程");

        Book b2 = new Book("978-7-111-21382-6", "算法导论");

        System.out.println(b1);
        System.out.println(b2);

        b1.borrow();
        try {
            b1.borrow();
        } catch (IllegalStateException e) {
            System.out.println(e.getMessage());
        }

        System.out.println("馆藏总数：" + Book.getTotalBooks());
    }
}
```

## 复习卡片

```java
// 类的基本结构
package com.example.model;

import java.util.List;

public class User {
    // 静态字段
    private static int count;
    public static final String ROLE = "user";

    // 实例字段（private + getter/setter）
    private String name;
    private int age;

    // 构造器
    public User() { this("Anonymous"); }
    public User(String name) {
        this.name = name;
        count++;
    }

    // 实例方法
    public String greet() { return "Hi " + name; }
    public String getName() { return name; }
    public void setName(String n) { this.name = n; }

    // 静态方法
    public static int getCount() { return count; }
}

// 使用
User u = new User("Tom");
u.greet();
User.getCount();          // 静态方法通过类名调用

// record（JDK 14+）
public record Point(int x, int y) {}
Point p = new Point(1, 2);
p.x();
```

**记忆要点**：

- 类字段声明类型；构造器名字 = 类名，没有返回类型
- 默认构造器只在你**没写任何构造器**时才自动提供
- `this(...)` 调用其他构造器，必须在第一行
- `static` 属于类，不能用 `this`；实例方法必须通过实例调用
- 访问修饰符：`private` 字段 + `public` getter/setter 是最常见的封装方式
- 包名反向域名，全小写；`java.lang` 自动导入
- 方法重载：同名不同参；不能只靠返回类型区分
- JavaBean 约定：无参构造 + private 字段 + getter/setter
- 纯数据类用 `record`，一行搞定不可变数据

下一阶段进入继承与多态——Java OOP 真正有意思的部分。
