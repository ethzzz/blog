---
title: 'Java 阶段四：数组与字符串'
published: 2026-09-03T09:00:00+08:00
description: '数组的声明/遍历/拷贝、多维数组、Arrays 工具类，以及字符串进阶：StringBuilder、StringJoiner、正则。'
tags: [Java, 数组, 字符串, StringBuilder, 正则]
category: Java学习路线
draft: false
---

数组和字符串是任何语言里最常用的两种数据结构。Java 的数组是**固定长度的对象**，字符串是**不可变的对象**——这两个"限制"直接影响日常写法。字符串的基础（不可变、常量池、`equals`、`format`）在阶段二讲过，这里主要补数组和字符串的进阶用法。

## 数组基础

### 声明与初始化

```java
// 三种声明方式
int[] a1;             // 推荐写法，类型是"int 数组"
int a2[];             // C 风格，也合法但不推荐
int[] a3, a4;         // 一次声明多个数组

// 初始化方式一：指定长度，元素用默认值填充
int[] nums = new int[5];        // [0, 0, 0, 0, 0]
String[] names = new String[3]; // [null, null, null]
boolean[] flags = new boolean[3];   // [false, false, false]

// 初始化方式二：直接给元素
int[] primes = {2, 3, 5, 7, 11};
int[] alsoPrimes = new int[]{2, 3, 5, 7, 11};   // 完整写法

// 长度是数组的**字段**，不是方法
primes.length;   // 5，注意没有括号
```

**默认值规律**：

| 类型 | 默认值 |
| :-- | :-- |
| `byte` / `short` / `int` / `long` | `0` / `0L` |
| `float` / `double` | `0.0f` / `0.0` |
| `char` | `'\u0000'`（空字符） |
| `boolean` | `false` |
| 引用类型（`String`、自定义类等） | `null` |

### 访问与遍历

```java
int[] nums = {10, 20, 30, 40, 50};

nums[0];        // 10
nums[4];        // 50
nums[5];        // ❌ ArrayIndexOutOfBoundsException
nums[-1];       // ❌ 同样越界，Java 不支持负索引

nums[0] = 100;  // 修改

// 方式一：普通 for（可以拿到索引）
for (int i = 0; i < nums.length; i++) {
    System.out.println(i + ": " + nums[i]);
}

// 方式二：增强 for（只关心元素）
for (int n : nums) {
    System.out.println(n);
}
```

对比 JS：

```javascript
nums.forEach((n, i) => console.log(i, n));
nums.map(n => n * 2);
```

Java 数组本身**没有 `map`、`filter` 这些方法**，需要转成 `Stream` 或用 `Arrays` 工具类：

```java
import java.util.Arrays;

int[] doubled = Arrays.stream(nums).map(n -> n * 2).toArray();
```

Stream 相关内容在阶段十详细讲。

### 数组拷贝

```java
int[] src = {1, 2, 3, 4, 5};

// 方式一：直接赋值——不是拷贝！只是引用同一个数组
int[] ref = src;
ref[0] = 99;
System.out.println(src[0]);   // 99，src 也变了

// 方式二：clone()
int[] copy1 = src.clone();

// 方式三：Arrays.copyOf（可以指定新长度）
int[] copy2 = Arrays.copyOf(src, 3);        // [1, 2, 3]
int[] copy3 = Arrays.copyOf(src, 7);        // [1, 2, 3, 4, 5, 0, 0]，多出的补默认值

// 方式四：Arrays.copyOfRange（左闭右开）
int[] copy4 = Arrays.copyOfRange(src, 1, 4);   // [2, 3, 4]

// 方式五：System.arraycopy（性能最好，最底层）
int[] dest = new int[5];
System.arraycopy(src, 0, dest, 0, src.length);
```

### 数组比较与打印

```java
int[] a = {1, 2, 3};
int[] b = {1, 2, 3};

// ❌ == 比较引用地址
System.out.println(a == b);              // false

// ✅ 比较内容
System.out.println(Arrays.equals(a, b)); // true

// ❌ 直接打印是内存地址
System.out.println(a);                   // [I@1540e19d

// ✅ 打印内容
System.out.println(Arrays.toString(a));  // [1, 2, 3]
```

### 排序与查找

```java
int[] nums = {5, 2, 8, 1, 9};

Arrays.sort(nums);                       // 原地排序：[1, 2, 5, 8, 9]
System.out.println(Arrays.toString(nums));

// 二分查找（必须先排序）
int idx = Arrays.binarySearch(nums, 8);  // 3
```

对对象数组排序需要传比较器：

```java
String[] words = {"banana", "apple", "cherry"};
Arrays.sort(words);                                  // 字典序
Arrays.sort(words, (x, y) -> y.compareTo(x));        // 逆序
```

### 数组转 List

```java
Integer[] nums = {1, 2, 3};

// 方式一：Arrays.asList（返回的是"视图"，长度固定，不能 add/remove）
List<Integer> view = Arrays.asList(nums);

// 方式二：new ArrayList<>(Arrays.asList(...))（可变）
List<Integer> list = new ArrayList<>(Arrays.asList(nums));

// 方式三：List.of（JDK 9+，不可变）
List<Integer> immutable = List.of(1, 2, 3);

// 方式四：Stream（JDK 8+）
List<Integer> fromStream = Arrays.stream(nums).toList();
```

> [!WARNING]
> **基本类型数组不能直接转 `List`**：
> ```java
> int[] nums = {1, 2, 3};
> List<int[]> wrong = Arrays.asList(nums);   // 长度是 1 的 List，元素是整个 int[] 数组
> 
> // 正确做法：先转 IntStream 再装箱
> List<Integer> right = Arrays.stream(nums).boxed().toList();
> ```

## 多维数组

Java 的多维数组本质是"数组的数组"：

```java
// 二维数组
int[][] matrix = new int[3][4];       // 3 行 4 列，全是 0

int[][] grid = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

grid.length;         // 3，行数
grid[0].length;      // 3，第一行列数

// 遍历
for (int i = 0; i < grid.length; i++) {
    for (int j = 0; j < grid[i].length; j++) {
        System.out.print(grid[i][j] + " ");
    }
    System.out.println();
}

// 增强 for
for (int[] row : grid) {
    for (int n : row) {
        System.out.print(n + " ");
    }
    System.out.println();
}
```

**不规则数组**（每行长度不同）：

```java
int[][] jagged = new int[3][];
jagged[0] = new int[]{1, 2};
jagged[1] = new int[]{3, 4, 5};
jagged[2] = new int[]{6};
```

三维以上类似，但实际业务里几乎用不到——用嵌套的 `List<List<T>>` 或专门的类更清晰。

## 字符串进阶

### StringBuilder 与 StringBuffer

`String` 不可变，任何"修改"操作都返回新对象。**循环拼接必须用 `StringBuilder`**：

```java
// ❌ 慢：每次 += 都创建新 String，O(n²)
String s = "";
for (int i = 0; i < 10000; i++) {
    s += i;
}

// ✅ 快：内部是可变字符数组，O(n)
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    sb.append(i);
}
String result = sb.toString();
```

**常用方法**：

```java
StringBuilder sb = new StringBuilder();

sb.append("hello");           // 追加
sb.append(" ").append("world");   // 链式调用
sb.insert(5, ",");            // 在索引 5 插入
sb.delete(0, 5);              // 删除 [0, 5)
sb.replace(0, 5, "Hi");       // 替换
sb.reverse();                 // 反转
sb.length();                  // 当前长度
sb.toString();                // 转成 String

// 指定初始容量，避免多次扩容
StringBuilder big = new StringBuilder(1000);
```

**`StringBuilder` vs `StringBuffer`**：

- `StringBuilder`：**非线程安全**，性能高。**日常写业务用这个**。
- `StringBuffer`：**线程安全**（方法加了 `synchronized`），性能略低。多线程共享时才用。

99% 场景选 `StringBuilder`。

### StringJoiner

拼接多个字符串并带分隔符，比手动 `StringBuilder` 更清爽：

```java
import java.util.StringJoiner;

StringJoiner joiner = new StringJoiner(", ");
joiner.add("apple");
joiner.add("banana");
joiner.add("cherry");
System.out.println(joiner.toString());   // "apple, banana, cherry"

// 带前缀后缀
StringJoiner bracketed = new StringJoiner(" | ", "[", "]");
bracketed.add("a").add("b");
System.out.println(bracketed);   // "[a | b]"
```

或者直接用 `String.join`：

```java
String csv = String.join(",", "a", "b", "c");   // "a,b,c"
String fromList = String.join("-", List.of("x", "y", "z"));   // "x-y-z"
```

### 字符串与其他类型转换

```java
// 数字 → 字符串
String s1 = String.valueOf(123);
String s2 = Integer.toString(123);

// 字符串 → 数字
int n = Integer.parseInt("123");
double d = Double.parseDouble("3.14");

// 字符数组 ↔ 字符串
char[] chars = {'h', 'i'};
String fromChars = new String(chars);       // "hi"
char[] back = fromChars.toCharArray();      // ['h', 'i']

// 字节数组 ↔ 字符串（编码相关）
byte[] bytes = "hello".getBytes(StandardCharsets.UTF_8);
String fromBytes = new String(bytes, StandardCharsets.UTF_8);
```

> [!IMPORTANT]
> **处理字符串和字节互转时永远显式指定字符集**，不指定的话 Java 会用平台默认编码（Windows 上可能是 GBK，Linux 上是 UTF-8），跨平台必出问题：
> ```java
> "hello".getBytes(StandardCharsets.UTF_8);   // ✅
> // "hello".getBytes();                       // ❌ 依赖平台
> ```

## 正则表达式

Java 的正则在 `java.util.regex` 包里，主要用 `Pattern` 和 `Matcher` 两个类：

### 基本匹配

```java
import java.util.regex.*;

Pattern pattern = Pattern.compile("\\d+");    // 匹配一个或多个数字
Matcher matcher = pattern.matcher("abc123def456");

while (matcher.find()) {
    System.out.println(matcher.group());      // "123" "456"
}
```

**注意反斜杠要转义**：正则里的 `\d` 在 Java 字符串中要写成 `"\\d"`，因为 `\` 本身是字符串的转义字符。

### 简化写法：String 内置方法

不用完整 `Pattern/Matcher` 时，`String` 提供了几个便捷方法：

```java
// matches：整个字符串是否匹配
"12345".matches("\\d+");              // true
"abc123".matches("\\d+");             // false（必须整体匹配）

// replaceAll：正则替换
"a1b2c3".replaceAll("\\d", "*");      // "a*b*c*"

// split：正则分割
"a,b;;c  d".split("[,;\\s]+");        // ["a", "b", "c", "d"]
```

### 常用正则片段

| 目标 | 正则 |
| :-- | :-- |
| 数字 | `\\d+` |
| 非数字 | `\\D+` |
| 单词字符（字母数字下划线） | `\\w+` |
| 空白字符 | `\\s+` |
| 中文字符 | `[\\u4e00-\\u9fa5]+` |
| 邮箱（简易） | `\\w+@\\w+\\.\\w+` |
| 手机号（大陆） | `1[3-9]\\d{9}` |
| URL | `https?://[\\w.-]+(?:/[\\w./?%&=-]*)?` |

### 完整例子：提取日志中的时间戳

```java title="LogParser.java"
import java.util.regex.*;

public class LogParser {
    private static final Pattern TIMESTAMP = Pattern.compile(
        "\\[(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})\\]\\s+(\\w+):\\s+(.*)"
    );

    public static void main(String[] args) {
        String log = "[2026-09-03 10:15:30] ERROR: Database connection failed";
        Matcher m = TIMESTAMP.matcher(log);

        if (m.matches()) {
            System.out.println("时间：" + m.group(1));   // 2026-09-03 10:15:30
            System.out.println("级别：" + m.group(2));   // ERROR
            System.out.println("消息：" + m.group(3));   // Database connection failed
        }
    }
}
```

**性能建议**：如果同一个正则要用很多次，把 `Pattern.compile` 提到静态字段里，避免重复编译：

```java
private static final Pattern EMAIL = Pattern.compile("\\w+@\\w+\\.\\w+");

public boolean isEmail(String s) {
    return EMAIL.matcher(s).matches();
}
```

## 综合小例子：单词频率统计

结合数组、字符串和 `Map`（阶段八会详细讲，这里先见一面）：

```java title="WordCount.java"
import java.util.*;

public class WordCount {
    public static void main(String[] args) {
        String text = "apple banana apple cherry banana apple";
        String[] words = text.split("\\s+");

        Map<String, Integer> count = new HashMap<>();
        for (String w : words) {
            count.put(w, count.getOrDefault(w, 0) + 1);
        }

        // 按频率降序输出
        count.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .forEach(e -> System.out.println(e.getKey() + ": " + e.getValue()));
    }
}
// 输出：
// apple: 3
// banana: 2
// cherry: 1
```

## 复习卡片

```java
// ===== 数组 =====
int[] nums = new int[5];             // 默认 0
int[] primes = {2, 3, 5, 7};
nums.length;                         // 字段，无括号
nums[0] = 10;

for (int n : nums) { ... }           // 增强 for

int[] copy = Arrays.copyOf(nums, 3);
int[] range = Arrays.copyOfRange(nums, 1, 4);
Arrays.equals(a, b);                 // 内容比较
Arrays.toString(a);                  // 打印
Arrays.sort(nums);
Arrays.binarySearch(nums, 5);

// 二维
int[][] grid = new int[3][4];
grid.length;                         // 行数
grid[0].length;                      // 列数

// 转 List
List<Integer> list = Arrays.stream(intArr).boxed().toList();

// ===== 字符串 =====
StringBuilder sb = new StringBuilder();
sb.append("a").append("b").insert(0, "x");
sb.reverse();
sb.toString();

String csv = String.join(",", "a", "b", "c");
StringJoiner sj = new StringJoiner(", ", "[", "]");
sj.add("a").add("b");

// 编码转换永远显式指定
"hi".getBytes(StandardCharsets.UTF_8);

// ===== 正则 =====
Pattern p = Pattern.compile("\\d+");
Matcher m = p.matcher("abc123");
while (m.find()) m.group();

"12345".matches("\\d+");             // 整体匹配
"a1b2".replaceAll("\\d", "*");       // 替换
"a,b;c".split("[,;]+");              // 分割
```

**记忆要点**：

- 数组长度用 `nums.length`（字段），字符串长度用 `s.length()`（方法）
- 数组 `==` 比引用，内容比较用 `Arrays.equals`
- 打印数组用 `Arrays.toString`，否则是内存地址
- 循环拼接字符串用 `StringBuilder`，不用 `+=`
- `StringBuffer` 是线程安全版，日常用 `StringBuilder`
- 字符串与字节互转永远显式指定 `StandardCharsets.UTF_8`
- 正则里的 `\` 要写成 `\\`
- 常用正则 `Pattern` 提到静态字段避免重复编译

到这里 Java 的语法基础就打完了。下一阶段进入面向对象的核心——类与对象，看看 Java 里"一切皆对象"到底是什么意思。
