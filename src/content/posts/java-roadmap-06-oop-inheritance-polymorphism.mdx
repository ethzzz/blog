---
title: 'Java 阶段六：面向对象（二）——继承与多态'
published: 2026-09-03T20:00:00+08:00
description: 'extends 继承、super 调用父类、@Override 重写、Object 三兄弟（equals/hashCode/toString）、向上转型与多态、final 关键字。'
tags: [Java, 面向对象, 继承, 多态, Object]
category: Java学习路线
draft: false
---

继承和多态是 OOP 的两大核心机制。Java 的继承比 JS 的原型链更严格：**单继承、显式声明、编译期检查**。这一篇把继承相关的所有关键概念串起来。

## 继承：extends

```java
// 父类
public class Animal {
    protected String name;
    protected int age;

    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public void eat() {
        System.out.println(name + " 正在吃东西");
    }

    public void sleep() {
        System.out.println(name + " 正在睡觉");
    }
}

// 子类
public class Dog extends Animal {
    private String breed;   // 子类特有字段

    public Dog(String name, int age, String breed) {
        super(name, age);           // 必须先调用父类构造器
        this.breed = breed;
    }

    public void bark() {            // 子类特有方法
        System.out.println(name + " 汪汪叫");
    }
}

// 使用
Dog dog = new Dog("旺财", 3, "柴犬");
dog.eat();     // 继承自 Animal
dog.sleep();   // 继承自 Animal
dog.bark();    // Dog 自己的
```

**关键点**：

1. `extends` 表示继承，Java **只支持单继承**，一个类只能有一个直接父类
2. 子类构造器**必须调用父类构造器**，不显式写 `super(...)` 时会自动调用父类的无参构造器
3. 如果父类没有无参构造器，子类必须显式写 `super(...)`，否则编译报错
4. 子类会继承父类所有 `public` 和 `protected` 成员（`private` 不能直接访问，但仍在对象里）

对比 JS：

```javascript
// JavaScript
class Animal {
    constructor(name) { this.name = name; }
    eat() { console.log(`${this.name} 吃东西`); }
}
class Dog extends Animal {
    constructor(name, breed) {
        super(name);
        this.breed = breed;
    }
}
```

写法几乎一样，但 Java 有**编译期类型检查**：

```java
Animal a = new Dog("旺财", 3, "柴犬");   // ✅ 父类引用指向子类对象
a.eat();                                  // ✅
// a.bark();                              // ❌ 编译报错，Animal 类型看不到 bark
```

## super 关键字

`super` 指向父类的成员，主要三种用法：

### 1. 调用父类构造器

```java
public Dog(String name, int age, String breed) {
    super(name, age);          // 必须是构造器的第一行
    this.breed = breed;
}
```

### 2. 调用被覆盖的父类方法

```java
public class Dog extends Animal {
    @Override
    public void eat() {
        super.eat();                          // 先执行父类逻辑
        System.out.println(name + " 用狗粮吃");   // 再加自己的
    }
}
```

### 3. 访问父类字段（少见）

```java
public class Child extends Parent {
    public void print() {
        System.out.println(super.fieldName);   // 显式访问父类字段
    }
}
```

> [!NOTE]
> `super(...)` 和 `this(...)` 都必须在构造器第一行，所以**不能同时使用**。变通做法：把 `this(...)` 调用放在被 `super(...)` 调用的构造器里，形成构造器链。

## 方法重写（Override）

子类可以重新实现父类的方法，叫**重写**（override）：

```java
public class Animal {
    public void makeSound() {
        System.out.println("某种动物叫声");
    }
}

public class Dog extends Animal {
    @Override
    public void makeSound() {
        System.out.println("汪汪");
    }
}

public class Cat extends Animal {
    @Override
    public void makeSound() {
        System.out.println("喵喵");
    }
}
```

**重写规则**：

1. 方法签名（名字 + 参数列表）必须完全一致
2. 返回类型必须一致或是父类返回类型的子类（协变返回类型）
3. 访问修饰符**不能更严格**（父类 `public`，子类不能改成 `private`）
4. 不能抛出比父类更多的**受检异常**（异常在阶段九讲）
5. `static`、`final`、`private` 方法**不能被重写**

### @Override 注解

`@Override` 是可选的，但**强烈建议加上**：

```java
@Override
public void makeSound() { ... }
```

好处：如果方法名拼错（比如 `makeSounds`）或者签名不对，编译器会报错，避免"你以为在重写，其实是新增方法"的 bug。

### 重写 vs 重载

| | 重写 Override | 重载 Overload |
| :-- | :-- | :-- |
| 发生位置 | 父子类之间 | 同一个类里 |
| 方法名 | 必须相同 | 必须相同 |
| 参数列表 | 必须相同 | 必须不同 |
| 返回类型 | 必须相同或是子类 | 可同可不同 |
| 访问修饰符 | 不能更严格 | 无限制 |
| 绑定时机 | 运行时（动态） | 编译时（静态） |

## Object 类：所有类的祖先

Java 里所有类都**隐式继承** `java.lang.Object`，即使你没写 `extends`：

```java
public class User { ... }
// 等价于
public class User extends Object { ... }
```

`Object` 提供了几个所有对象都有的方法，其中最常用的三个：`equals`、`hashCode`、`toString`。

### toString

默认的 `toString` 返回 `类名@哈希码`，几乎没用。**自定义类应该重写它**：

```java
public class User {
    private String name;
    private int age;

    @Override
    public String toString() {
        return "User{name='" + name + "', age=" + age + "}";
    }
}

System.out.println(new User("Tom", 25));
// 输出：User{name='Tom', age=25}
// 因为 println 会自动调用 toString()
```

IDEA 里 `Alt+Insert → toString()` 可以自动生成，或者用 `Objects.toString`：

```java
import java.util.Objects;

@Override
public String toString() {
    return Objects.toStringHelper(this)
        .add("name", name)
        .add("age", age)
        .toString();
}
```

### equals 与 hashCode

这两个是**成对出现**的，重写一个必须重写另一个。

**默认 `equals` 就是 `==`**（比较引用），要按内容比较必须重写：

```java
public class User {
    private String name;
    private int age;

    @Override
    public boolean equals(Object o) {
        // 1. 同一个对象
        if (this == o) return true;
        // 2. 类型检查（模式匹配写法，JDK 16+）
        if (!(o instanceof User other)) return false;
        // 3. 逐字段比较
        return age == other.age && Objects.equals(name, other.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }
}
```

**为什么必须一起重写**：Java 的 `HashMap`、`HashSet` 内部先用 `hashCode` 定位桶，再用 `equals` 比较。如果两个对象 `equals` 返回 `true` 但 `hashCode` 不同，就会被当成两个不同的键存进 map，导致灾难性 bug。

**契约**：

- 若 `a.equals(b)` 为 `true`，则 `a.hashCode() == b.hashCode()`
- 若 `a.hashCode() == b.hashCode()`，`a.equals(b)` **不一定**为 `true`（哈希冲突）
- `equals` 必须满足：**自反、对称、传递、一致、非 null**

> [!TIP]
> IDEA 里 `Alt+Insert → equals() and hashCode()` 可以自动生成，选默认的 `Objects.equals` / `Objects.hash` 模板即可。或者直接用 Lombok 的 `@EqualsAndHashCode`。

## 向上转型与向下转型

### 向上转型（Upcasting）

**子类 → 父类**，自动，安全：

```java
Dog dog = new Dog("旺财", 3, "柴犬");
Animal animal = dog;          // ✅ 自动向上转型
animal.eat();                 // ✅ 父类的方法
// animal.bark();             // ❌ 编译器只知道 animal 是 Animal 类型
```

向上转型后，**编译器只看声明类型**，看不到子类特有的方法。

### 向下转型（Downcasting）

**父类 → 子类**，需要显式强转，可能失败：

```java
Animal animal = new Dog("旺财", 3, "柴犬");

// ❌ 危险：如果 animal 实际是 Cat，运行时抛 ClassCastException
Dog dog = (Dog) animal;

// ✅ 先判断再转
if (animal instanceof Dog) {
    Dog d = (Dog) animal;
    d.bark();
}

// ✅ 模式匹配（JDK 16+，推荐）
if (animal instanceof Dog d) {
    d.bark();
}
```

## 多态：运行时绑定

**多态**（polymorphism）指同一个方法调用，因为对象实际类型不同而产生不同行为。这是 Java OOP 的核心机制：

```java
public class AnimalShelter {
    public static void main(String[] args) {
        // 声明类型是 Animal，实际类型是 Dog/Cat/Bird
        List<Animal> animals = List.of(
            new Dog("旺财", 3, "柴犬"),
            new Cat("咪咪", 2),
            new Dog("小黑", 5, "拉布拉多")
        );

        for (Animal a : animals) {
            a.makeSound();      // 运行时根据实际类型调用不同的方法
            // 输出：汪汪 / 喵喵 / 汪汪
        }
    }
}
```

**关键点**：

- 声明类型是父类（或接口），实际类型是子类
- **方法调用在运行时根据实际对象类型决定**（动态绑定 / late binding）
- 字段访问是**编译时**根据声明类型决定（静态绑定），字段没有多态

字段没有多态的例子：

```java
public class Parent {
    public String name = "Parent";
}
public class Child extends Parent {
    public String name = "Child";    // 隐藏（hide）父类字段，不是重写
}

Parent p = new Child();
System.out.println(p.name);          // "Parent" ← 编译时决定
System.out.println(((Child) p).name); // "Child"
```

**这就是为什么字段应该 `private`**：避免这种隐藏带来的困惑。

## final 关键字

`final` 表示"不可改变"，可以修饰**变量、方法、类、方法参数**：

### 1. final 变量：只能赋值一次

```java
final double PI = 3.14159;
// PI = 3.14;   // ❌ 编译报错

// 实例 final 字段必须在构造器结束前赋值
public class User {
    private final String id;

    public User(String id) {
        this.id = id;    // ✅ 构造器里赋值
    }
}

// 引用类型的 final：引用不能变，但对象内容可以变
final List<String> list = new ArrayList<>();
list.add("a");           // ✅
// list = new ArrayList<>();  // ❌ 引用不能重新赋值
```

### 2. final 方法：不能被子类重写

```java
public class Base {
    public final void doSomething() { ... }
}

public class Sub extends Base {
    // ❌ 不能重写 final 方法
    // @Override
    // public void doSomething() { ... }
}
```

### 3. final 类：不能被继承

```java
public final class Immutable { ... }

// ❌ 编译报错
public class Sub extends Immutable { ... }
```

`String`、`Integer` 等所有包装类都是 `final` 的，防止被继承破坏不可变性。

### 4. final 参数：方法内不能修改

```java
public void print(final int n) {
    // n = 10;   // ❌
    System.out.println(n);
}
```

## 抽象类预告

如果一个类**不需要实例化**，只作为父类被继承，可以声明为 `abstract`：

```java
public abstract class Shape {
    protected String color;

    public Shape(String color) {
        this.color = color;
    }

    // 抽象方法：只有声明没有实现，子类必须重写
    public abstract double area();

    // 普通方法：子类直接继承
    public void describe() {
        System.out.println("一个 " + color + " 的图形，面积 " + area());
    }
}

public class Circle extends Shape {
    private double radius;

    public Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }

    @Override
    public double area() {
        return Math.PI * radius * radius;
    }
}

// Shape s = new Shape("red");   // ❌ 抽象类不能实例化
Shape s = new Circle("red", 2.0);   // ✅ 通过子类
s.describe();
```

抽象类的完整讨论（跟接口的对比）放在**阶段七**。

## 综合小例子：图形系统

把继承、多态、抽象类、`equals` 一起用起来：

```java title="Shape.java"
package com.example.shape;

import java.util.Objects;

public abstract class Shape {
    protected final String color;

    protected Shape(String color) {
        this.color = Objects.requireNonNull(color);
    }

    public abstract double area();
    public abstract double perimeter();

    public String getColor() { return color; }

    @Override
    public String toString() {
        return "%s[color=%s, area=%.2f]".formatted(
            getClass().getSimpleName(), color, area()
        );
    }
}
```

```java title="Circle.java"
package com.example.shape;

import java.util.Objects;

public class Circle extends Shape {
    private final double radius;

    public Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }

    @Override
    public double area() {
        return Math.PI * radius * radius;
    }

    @Override
    public double perimeter() {
        return 2 * Math.PI * radius;
    }

    public double getRadius() { return radius; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Circle other)) return false;
        return Double.compare(radius, other.radius) == 0
            && Objects.equals(color, other.color);
    }

    @Override
    public int hashCode() {
        return Objects.hash(color, radius);
    }
}
```

```java title="Rectangle.java"
package com.example.shape;

import java.util.Objects;

public class Rectangle extends Shape {
    private final double width;
    private final double height;

    public Rectangle(String color, double width, double height) {
        super(color);
        this.width = width;
        this.height = height;
    }

    @Override
    public double area() { return width * height; }

    @Override
    public double perimeter() { return 2 * (width + height); }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Rectangle other)) return false;
        return Double.compare(width, other.width) == 0
            && Double.compare(height, other.height) == 0
            && Objects.equals(color, other.color);
    }

    @Override
    public int hashCode() { return Objects.hash(color, width, height); }
}
```

```java title="ShapeDemo.java"
package com.example.shape;

import java.util.List;

public class ShapeDemo {
    public static void main(String[] args) {
        List<Shape> shapes = List.of(
            new Circle("红色", 2.0),
            new Rectangle("蓝色", 3.0, 4.0),
            new Circle("绿色", 1.5)
        );

        // 多态：同一个方法调用，不同实现
        for (Shape s : shapes) {
            System.out.printf("%s 面积=%.2f 周长=%.2f%n",
                s, s.area(), s.perimeter());
        }

        // 总面积（Stream，阶段十讲）
        double total = shapes.stream().mapToDouble(Shape::area).sum();
        System.out.printf("总面积：%.2f%n", total);

        // equals
        Shape a = new Circle("红色", 2.0);
        Shape b = new Circle("红色", 2.0);
        System.out.println(a.equals(b));   // true，因为重写了 equals
    }
}
```

## 复习卡片

```java
// 1. 继承
public class Dog extends Animal {
    public Dog(String name) {
        super(name);          // 必须调用父类构造器
    }
}

// 2. 重写
@Override
public void makeSound() {
    super.makeSound();        // 可选调用父类逻辑
    // 自己的实现
}

// 3. Object 三兄弟
@Override
public String toString() { return "User{name=" + name + "}"; }

@Override
public boolean equals(Object o) {
    if (this == o) return true;
    if (!(o instanceof User other)) return false;
    return age == other.age && Objects.equals(name, other.name);
}

@Override
public int hashCode() { return Objects.hash(name, age); }

// 4. 向上/向下转型
Animal a = new Dog("旺财");       // 向上，自动
if (a instanceof Dog d) d.bark(); // 向下，模式匹配

// 5. 多态
List<Animal> list = List.of(new Dog(), new Cat());
for (Animal a : list) a.makeSound();   // 运行时决定调用哪个

// 6. final
final double PI = 3.14;               // 变量不能改
public final void method() {}         // 方法不能重写
public final class Immutable {}       // 类不能继承
```

**记忆要点**：

- Java **单继承**，一个类只能 `extends` 一个父类
- 子类构造器必须先调用 `super(...)`（不写则自动调无参）
- 重写规则：签名一致、返回类型一致或是子类、访问修饰符不能更严格
- **`@Override` 一定要加**，让编译器帮你检查签名
- 重写 `equals` 必须同时重写 `hashCode`，否则 `HashMap` 会出鬼
- 向上转型自动、安全；向下转型要强转，配合 `instanceof` 模式匹配
- 多态是**方法**的运行时绑定；字段是编译时绑定，没有多态
- `final` 修饰变量=不可改、方法=不可重写、类=不可继承
- 抽象类不能实例化，抽象方法必须由子类实现

下一个阶段讲接口和抽象类的对比，看看 Java 里"契约式设计"是怎么做的。
