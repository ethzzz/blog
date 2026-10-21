---
title: 'Java 阶段二：变量、数据类型与类型系统'
published: 2026-09-02T14:00:00+08:00
description: 'Java 的 8 种基本类型、包装类、自动装箱、类型转换、var 推断、字符串不可变性，一篇对照 JS 讲清楚。'
tags: [Java, 数据类型, 变量, 类型系统]
category: Java学习路线
draft: false
---

JS 里 `let x = 1` 一句就完事，`x` 可以是数字下一秒变字符串也没人管。Java 完全反过来：**先声明类型，再赋值，从此这个变量只能是这个类型**。这个阶段把所有类型相关的东西一次讲完。

## 变量声明的基本形式

```java
// 类型 变量名 = 初始值;
int age = 25;
String name = "Tom";
double price = 19.99;
boolean isValid = true;

// 也可以先声明再赋值
int count;
count = 10;
```

对比 JS：

```javascript
// JavaScript
let age = 25;         // 类型自动推断
const name = "Tom";   // 常量
```

Java 里也有类似 `const` 的关键字，叫 `final`：

```java
final double PI = 3.14159;
// PI = 3.14;  // ❌ 编译报错：cannot assign a value to final variable PI
```

> [!TIP]
> 命名约定：
> - 变量、方法：**小驼峰**（camelCase），跟 JS 一致
> - 类、接口：**大驼峰**（PascalCase）
> - 常量（`static final`）：**全大写下划线**（UPPER_SNAKE_CASE），比如 `MAX_SIZE`
> - 包名：**全小写**，比如 `com.example.app`

## 8 种基本类型

Java 的**基本类型**（primitive types）是语言内置的、不是对象、直接存值。总共 8 种：

| 分类 | 类型 | 大小 | 取值范围 | 默认值 | JS 对应 |
| :-- | :-- | :-- | :-- | :--: | :-- |
| 整数 | `byte` | 1 字节 | -128 ~ 127 | `0` | —— |
| 整数 | `short` | 2 字节 | -32768 ~ 32767 | `0` | —— |
| 整数 | `int` | 4 字节 | 约 ±21 亿 | `0` | `number`（整数场景） |
| 整数 | `long` | 8 字节 | 约 ±9.2 × 10¹⁸ | `0L` | `bigint` |
| 浮点 | `float` | 4 字节 | 约 7 位有效数字 | `0.0f` | —— |
| 浮点 | `double` | 8 字节 | 约 15 位有效数字 | `0.0` | `number`（默认） |
| 字符 | `char` | 2 字节 | 单个 UTF-16 字符 | `'\u0000'` | —— |
| 布尔 | `boolean` | 未定义 | `true` / `false` | `false` | `boolean` |

**几个必须记住的字面量写法**：

```java
int decimal = 100;              // 十进制
int hex = 0xFF;                 // 十六进制 = 255
int binary = 0b1010;            // 二进制 = 10
int octal = 017;                // 八进制 = 15
int million = 1_000_000;        // 下划线分隔，提高可读性（JDK 7+）

long bigNumber = 9_000_000_000L;   // 必须加 L 后缀，否则被当成 int 溢出
float pi = 3.14f;                  // 必须加 f 后缀，否则被当成 double
double e = 2.718;                  // 默认就是 double
double exp = 1.6e-19;              // 科学计数法

char grade = 'A';                  // 单引号，只能一个字符
char unicode = '\u4e2d';           // Unicode 转义 = "中"
char newline = '\n';               // 常见转义字符

boolean done = true;               // 只有 true/false，不像 JS 有 truthy/falsy
```

> [!WARNING]
> Java 里 `boolean` **不能**跟数字互转。JS 中 `if (1)` 是真的，Java 里会直接编译报错：`incompatible types: int cannot be converted to boolean`。所有条件判断必须是明确的 `boolean` 表达式。

## 整数溢出：JS 里很少见的坑

`int` 是 32 位有符号，最大约 21 亿。超过就溢出，从最小值开始绕回：

```java
int max = Integer.MAX_VALUE;   // 2147483647
System.out.println(max + 1);   // -2147483648  ← 溢出！

// 大数用 long
long big = 3_000_000_000L;     // ✅
// long wrong = 3_000_000_000; // ❌ 编译报错：integer number too large
```

JS 里的 `Number.MAX_SAFE_INTEGER` 是 9 千万亿（`2^53 - 1`），因为它是双精度浮点。Java 想要类似的能力就用 `long`，或者更大的用 `BigInteger`：

```java
import java.math.BigInteger;

BigInteger huge = new BigInteger("123456789012345678901234567890");
BigInteger result = huge.multiply(BigInteger.TEN);
```

## 浮点数不精确：跟 JS 一样

`0.1 + 0.2 != 0.3` 这个坑 Java 也有，因为都遵循 IEEE 754：

```java
System.out.println(0.1 + 0.2);          // 0.30000000000000004
System.out.println(0.1 + 0.2 == 0.3);   // false
```

**涉及金额的场景永远用 `BigDecimal`**：

```java
import java.math.BigDecimal;

BigDecimal a = new BigDecimal("0.1");   // 注意传字符串，传 double 会带误差
BigDecimal b = new BigDecimal("0.2");
System.out.println(a.add(b));           // 0.3 精确
```

## 类型转换

### 自动类型转换（隐式）

**小范围 → 大范围**会自动转，不会丢精度：

```java
byte b = 100;
int i = b;         // byte → int，自动
long l = i;        // int → long，自动
double d = l;      // long → double，自动
```

转换链：`byte → short → int → long → float → double`，`char → int` 也可以自动。

### 强制类型转换（显式）

**大范围 → 小范围**必须强制转换，可能丢精度或溢出：

```java
double pi = 3.14;
int intPi = (int) pi;       // 3，小数部分被截断（不是四舍五入）

long big = 200L;
int small = (int) big;      // 200

// 危险的溢出
long tooBig = 3_000_000_000L;
int overflow = (int) tooBig;   // -1294967296，值完全不对
```

想要四舍五入用 `Math.round`：

```java
int rounded = (int) Math.round(3.6);   // 4
```

### 字符串与数字互转

Java 没有 JS 那种 `Number("123")` 或 `"123" * 1` 的隐式转换，必须显式调用：

```java
// 字符串 → 数字（用包装类的静态方法）
int n = Integer.parseInt("123");
double d = Double.parseDouble("3.14");
long l = Long.parseLong("9999999999");

// 数字 → 字符串
String s1 = String.valueOf(123);
String s2 = 123 + "";         // 拼接空串也可以，但不推荐
String s3 = Integer.toString(123);

// 非法字符串会抛异常
try {
    int bad = Integer.parseInt("abc");   // NumberFormatException
} catch (NumberFormatException e) {
    System.out.println("转换失败：" + e.getMessage());
}
```

## 包装类与自动装箱

每种基本类型都有一个对应的**包装类**（wrapper class），让基本类型也能"像对象一样用"：

| 基本类型 | 包装类 |
| :-- | :-- |
| `byte` | `Byte` |
| `short` | `Short` |
| `int` | `Integer` |
| `long` | `Long` |
| `float` | `Float` |
| `double` | `Double` |
| `char` | `Character` |
| `boolean` | `Boolean` |

**自动装箱**（autoboxing）：基本类型 → 包装类，编译器帮你调用 `Integer.valueOf()`：

```java
Integer wrapped = 42;          // 自动装箱：Integer.valueOf(42)
int unwrapped = wrapped;       // 自动拆箱：wrapped.intValue()
```

包装类的主要用处：

1. **集合只能装对象**：`List<Integer>` 可以，`List<int>` 不行。
2. **提供常量和静态工具方法**：`Integer.MAX_VALUE`、`Integer.parseInt`。
3. **允许为 null**：`int` 不能是 `null`，`Integer` 可以（数据库字段常用）。

> [!CAUTION]
> 自动装箱有个陷阱——**用 `==` 比较包装类**：
> ```java
> Integer a = 100;
> Integer b = 100;
> System.out.println(a == b);       // true（-128~127 有缓存）
> 
> Integer c = 200;
> Integer d = 200;
> System.out.println(c == d);       // false（超出缓存范围，是两个不同对象）
> System.out.println(c.equals(d));  // true ← 永远用 equals
> ```
> 记住一句话：**包装类的相等判断永远用 `.equals()`，不用 `==`**。

## var：类型推断

从 JDK 10 开始，可以用 `var` 让编译器推断类型，类似 TS 的推断：

```java
var name = "Tom";         // 推断为 String
var age = 25;             // 推断为 int
var list = new ArrayList<String>();   // 推断为 ArrayList<String>

// 但 var 不是"动态类型"！类型在编译期已经确定，之后不能变
var x = 10;
// x = "hello";   // ❌ 编译报错：incompatible types
```

`var` 使用建议：

- ✅ 右边类型很明显时用（`new`、字面量、静态工厂方法）
- ❌ 右边是方法调用且返回类型不直观时不用
- ❌ 不能用于类字段、方法参数、返回类型（只能用于**局部变量**）

## 字符串：不可变的对象

`String` 不是基本类型，是 `java.lang.String` 类的对象。它最重要的特性是**不可变**（immutable）：

```java
String s = "hello";
s.concat(" world");          // 返回新字符串 "hello world"
System.out.println(s);       // 仍然是 "hello"，原字符串没变

s = s.concat(" world");      // 必须重新赋值
System.out.println(s);       // "hello world"
```

### 字符串常量池

Java 会把字面量字符串放到**常量池**（string pool）里复用：

```java
String a = "hello";
String b = "hello";
String c = new String("hello");

System.out.println(a == b);       // true，指向常量池同一个对象
System.out.println(a == c);       // false，c 是堆里的新对象
System.out.println(a.equals(c));  // true，内容相等
```

再次强调：**比较字符串内容永远用 `.equals()`**，`==` 是比引用地址。

### 字符串拼接的性能

循环里用 `+` 拼接会产生大量临时对象，性能差：

```java
// ❌ 慢：每次循环创建新 String
String result = "";
for (int i = 0; i < 10000; i++) {
    result += i;
}

// ✅ 快：StringBuilder 内部是可变的字符数组
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    sb.append(i);
}
String result = sb.toString();
```

单行拼接可以直接用 `+`（编译器会优化成 `StringBuilder`）：

```java
String greeting = "Hello, " + name + "! You are " + age + " years old.";
```

### 格式化字符串

Java 没有 JS 的模板字符串 `` `hi ${name}` ``，用 `String.format` 或 JDK 15+ 的 `formatted`：

```java
String name = "Tom";
int age = 25;

// 方式一：String.format（类似 C 的 printf）
String s1 = String.format("Hello, %s! You are %d years old.", name, age);

// 方式二：formatted（JDK 15+，链式调用更顺手）
String s2 = "Hello, %s! You are %d years old.".formatted(name, age);

// 常用占位符：
// %s 字符串   %d 整数   %f 浮点   %b 布尔   %c 字符   %% 百分号本身
// %.2f 保留两位小数   %5d 右对齐宽度 5   %-5d 左对齐
```

### 常用字符串方法

```java
String s = "Hello, World";

s.length();                  // 12（属性 length 是数组用的，字符串是方法 length()）
s.charAt(0);                 // 'H'
s.substring(7);              // "World"
s.substring(0, 5);           // "Hello"，左闭右开
s.indexOf("World");          // 7
s.contains("World");         // true
s.startsWith("He");          // true
s.endsWith("ld");            // true
s.replace("World", "Java");  // "Hello, Java"
s.replaceAll("\\s+", "-");   // 正则替换
s.split(", ");               // ["Hello", "World"]
s.trim();                    // 去掉两端空白
s.toUpperCase();             // "HELLO, WORLD"
s.toLowerCase();             // "hello, world"
String.join("-", "a","b","c");  // "a-b-c"
```

## 数组快速一瞥

数组的详细用法放在阶段四，这里先见一面：

```java
int[] nums = new int[5];          // 长度 5，全是 0
int[] primes = {2, 3, 5, 7};      // 直接初始化
String[] names = new String[3];   // 长度 3，全是 null

nums.length;      // 5，注意 length 是**字段**不是方法
nums[0] = 10;     // 索引访问
```

数组长度**固定不变**，想要动态数组用 `ArrayList`（阶段八讲）。

## 复习卡片

一分钟回忆本阶段所有关键点：

```java
// 8 种基本类型
byte b = 1;  short s = 1;  int i = 1;  long l = 1L;
float f = 1.0f;  double d = 1.0;
char c = 'A';  boolean bool = true;

// 字面量后缀
long big = 100L;
float pi = 3.14f;
int million = 1_000_000;

// 常量
final double E = 2.718;

// var 类型推断（仅局部变量）
var name = "Tom";   // String

// 类型转换
int n = (int) 3.99;         // 3（截断）
int rounded = (int) Math.round(3.99);   // 4
int parsed = Integer.parseInt("123");
String str = String.valueOf(123);

// 包装类
Integer boxed = 42;         // 自动装箱
int unboxed = boxed;        // 自动拆箱
boxed.equals(42);           // ✅ 比较用 equals

// 字符串
String greeting = "hi";
greeting.length();          // 方法不是字段
greeting.equals("hi");      // 内容比较永远用 equals
"hi %s".formatted(name);    // 格式化

// 循环拼接
StringBuilder sb = new StringBuilder();
sb.append("a").append("b");
sb.toString();
```

**记忆要点**：

- 8 种基本类型：`byte short int long float double char boolean`
- `long` 加 `L`，`float` 加 `f`
- `boolean` 不能与数字互转，条件必须明确
- 包装类比较用 `.equals()`，不用 `==`
- 字符串不可变，循环拼接用 `StringBuilder`
- 字符串内容比较用 `.equals()`，`==` 是引用比较
- 金额用 `BigDecimal`，别用 `double`
- `var` 只是类型推断，类型仍是静态的

下一阶段进入运算符和流程控制，看看 Java 的 `if/for/switch` 跟 JS 有哪些细节差异。
