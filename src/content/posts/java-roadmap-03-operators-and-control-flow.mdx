---
title: 'Java 阶段三：运算符与流程控制'
published: 2026-09-02T20:00:00+08:00
description: 'Java 的各类运算符、if/switch/for/while 流程控制，重点讲与 JS 的差异：switch 表达式、instanceof 模式匹配、标签化 break。'
tags: [Java, 运算符, 流程控制, switch]
category: Java学习路线
draft: false
---

流程控制这块 Java 和 JS 长得挺像，但细节差别不少：`switch` 有新版表达式语法，`instanceof` 支持模式匹配，`for-each` 写法不同，`break` 还能带标签。这一篇把常踩的差异点集中过一遍。

## 运算符总览

### 算术运算符

```java
int a = 10, b = 3;

a + b;    // 13
a - b;    // 7
a * b;    // 30
a / b;    // 3   ← 整数除法直接截断，不是 3.333
a % b;    // 1   取余
a++;      // 11  后置自增
++a;      // 12  前置自增
a--;      // 11
```

> [!WARNING]
> **整数除法是 JS 里没有的坑**：
> ```java
> int result = 7 / 2;         // 3，不是 3.5
> double wrong = 7 / 2;       // 3.0，仍然先按 int 算再转 double
> double right = 7.0 / 2;     // 3.5，至少一个操作数是 double
> double alsoRight = (double) 7 / 2;   // 3.5，强制转换
> ```

### 赋值运算符

```java
int x = 10;
x += 5;    // x = x + 5 = 15
x -= 3;    // x = x - 3 = 12
x *= 2;    // x = x * 2 = 24
x /= 4;    // x = x / 4 = 6
x %= 4;    // x = x % 4 = 2

// 复合赋值会自动做类型转换
byte b = 10;
b += 5;              // ✅ 等价于 b = (byte)(b + 5)
// b = b + 5;        // ❌ 报错：b + 5 结果是 int，不能直接赋给 byte
```

### 比较运算符

```java
int a = 5, b = 10;

a == b;    // false
a != b;    // true
a > b;     // false
a < b;     // true
a >= b;    // false
a <= b;    // true
```

对**对象**来说 `==` 比的是引用地址，要比较内容用 `.equals()`：

```java
String s1 = new String("hi");
String s2 = new String("hi");

s1 == s2;         // false，两个不同对象
s1.equals(s2);    // true，内容相同
```

### 逻辑运算符

```java
boolean x = true, y = false;

x && y;    // false  短路与：x 为 false 时不再计算 y
x || y;    // true   短路或：x 为 true 时不再计算 y
!x;        // false  非
x & y;     // false  逻辑与（不短路，两侧都会算）
x | y;     // true   逻辑或（不短路）
x ^ y;     // true   异或
```

99% 场景用 `&&` 和 `||`，`&` 和 `|` 只有在需要"两侧都执行"的少数场景（比如位运算或副作用）才用。

Java **没有** JS 里的 `??`（空值合并）和 `?.`（可选链），需要类似能力用 `Optional`（阶段十讲）：

```java
// JS: const name = user?.name ?? 'Anonymous';
// Java:
String name = Optional.ofNullable(user)
    .map(User::getName)
    .orElse("Anonymous");
```

### 位运算符

```java
int a = 0b1100;   // 12
int b = 0b1010;   // 10

a & b;    // 0b1000 = 8   按位与
a | b;    // 0b1110 = 14  按位或
a ^ b;    // 0b0110 = 6   按位异或
~a;       // 按位取反 = -13
a << 2;   // 左移 = 48（相当于 * 4）
a >> 2;   // 右移（带符号）= 3（相当于 / 4）
a >>> 2;  // 无符号右移（JS 也有这个）
```

### 三元运算符

```java
int age = 20;
String type = age >= 18 ? "成年" : "未成年";
```

跟 JS 完全一样。Java 里三元运算符**不能嵌套过深**，可读性差就换成 `if-else`。

## if / else

基本形式跟 JS 一致：

```java
int score = 85;

if (score >= 90) {
    System.out.println("优秀");
} else if (score >= 60) {
    System.out.println("及格");
} else {
    System.out.println("不及格");
}
```

**几个必须注意的差异**：

```java
// ❌ 条件必须是 boolean，不能像 JS 那样用 truthy/falsy
int n = 1;
// if (n) { ... }        // 编译错误
if (n != 0) { ... }      // ✅ 显式比较

// ❌ 字符串不能用 == 比较
String cmd = getCommand();
// if (cmd == "quit") { ... }   // 逻辑错误
if ("quit".equals(cmd)) { ... } // ✅ 常量在前，避免 cmd 为 null 时抛异常

// 单行 if 可以省略花括号，但强烈不推荐
if (score >= 60) System.out.println("及格");

// 悬挂 else 陷阱：else 匹配最近的 if
if (a) if (b) doSomething(); else doOther();   // else 匹配 if (b)
```

> [!TIP]
> 字符串比较时把**常量放在左边**（`"quit".equals(cmd)`），这样即使 `cmd` 为 `null` 也不会抛 `NullPointerException`，只会返回 `false`。这个技巧在 Java 里叫 "Yoda Conditions"。

## switch

### 传统 switch（跟 JS 一样有 fall-through 陷阱）

```java
int day = 3;
String name;

switch (day) {
    case 1:
        name = "周一";
        break;                 // 必须 break，否则会继续执行下一个 case
    case 2:
        name = "周二";
        break;
    case 3:
    case 4:                    // 多个 case 合并
    case 5:
        name = "工作日中段";
        break;
    default:
        name = "其他";
}
```

传统 `switch` 的痛点：忘写 `break` 会 fall-through，容易出 bug。

### switch 表达式（JDK 14+，推荐）

新语法用 `->` 替代 `:`，**不需要 break**，还可以作为表达式返回值：

```java
int day = 3;

String name = switch (day) {
    case 1 -> "周一";
    case 2 -> "周二";
    case 3, 4, 5 -> "工作日中段";     // 多值 case
    case 6, 7 -> "周末";
    default -> "其他";
};   // 注意分号

System.out.println(name);   // "工作日中段"
```

如果 case 分支要多行，用 `yield` 返回值：

```java
int numLetters = switch (day) {
    case 1, 2, 3 -> 3;
    case 4, 5 -> 2;
    default -> {
        int len = computeLength(day);
        System.out.println("computed: " + len);
        yield len;          // 类似 return，但用于 switch 表达式
    }
};
```

### switch 支持的类型

- 基本类型：`byte`、`short`、`char`、`int`（不包括 `long`、`float`、`double`、`boolean`）
- 包装类：`Byte`、`Short`、`Character`、`Integer`
- `String`（JDK 7+）
- 枚举（`enum`）
- JDK 21 起支持**模式匹配**（配合密封类，后面 OOP 阶段再讲）

用字符串的 switch：

```java
String command = "start";

switch (command.toLowerCase()) {
    case "start" -> System.out.println("启动");
    case "stop"  -> System.out.println("停止");
    case "quit"  -> System.out.println("退出");
    default      -> System.out.println("未知命令：" + command);
}
```

> [!NOTE]
> `switch (String)` 内部其实是先算 `hashCode` 再用 `equals` 比较，性能可以接受；但仍然比不上 `if-else` 直接比字符串，写业务时不用纠结这个差异。

## 循环

### for 循环

```java
// 基本形式，跟 JS 完全一致
for (int i = 0; i < 5; i++) {
    System.out.println(i);
}

// 多变量
for (int i = 0, j = 10; i < j; i++, j--) {
    System.out.println(i + ", " + j);
}

// 无限循环
for (;;) {
    // 靠 break 跳出
}
```

### 增强 for（for-each）

```java
int[] nums = {1, 2, 3, 4, 5};

// 遍历数组或集合，语法比 JS 的 for...of 更简洁
for (int n : nums) {
    System.out.println(n);
}

String[] names = {"Tom", "Jerry"};
for (String name : names) {
    System.out.println("Hello, " + name);
}
```

对比 JS：

```javascript
// JavaScript
for (const n of nums) { console.log(n); }
nums.forEach(n => console.log(n));
```

Java 的增强 for 底层用 `Iterator`，**不能修改集合元素**（想边遍历边删要用显式 `Iterator`，阶段八再讲）。

### while / do-while

```java
int i = 0;

while (i < 5) {
    System.out.println(i);
    i++;
}

// do-while 至少执行一次
int n;
do {
    n = readInput();
} while (n < 0);
```

## break / continue / 标签

`break` 跳出当前循环，`continue` 跳过本次迭代——跟 JS 一致：

```java
for (int i = 0; i < 10; i++) {
    if (i == 3) continue;   // 跳过 3
    if (i == 7) break;      // 遇到 7 结束
    System.out.println(i);
}
// 输出：0 1 2 4 5 6
```

Java 特有的**标签化 break**，可以跳出多层嵌套循环（JS 也支持这个语法，但用得少）：

```java
outer:
for (int i = 0; i < 5; i++) {
    for (int j = 0; j < 5; j++) {
        if (i * j > 6) {
            System.out.println("break at " + i + "," + j);
            break outer;    // 直接跳出外层循环
        }
    }
}
```

不用标签的话，需要一个 flag 变量来控制，代码会啰嗦不少。

## instanceof 与模式匹配

### 传统 instanceof

判断对象是不是某个类的实例，返回 `boolean`：

```java
Object obj = "hello";

if (obj instanceof String) {
    String s = (String) obj;    // 需要显式强转
    System.out.println(s.length());
}
```

### 模式匹配 instanceof（JDK 16+）

**判断 + 强转 + 声明变量一步到位**，是现代 Java 的推荐写法：

```java
Object obj = "hello";

if (obj instanceof String s) {    // 匹配成功后 s 自动可用
    System.out.println(s.length());
}

// 还能配合逻辑运算符
if (obj instanceof String s && s.length() > 3) {
    System.out.println(s.toUpperCase());
}
```

对比 TypeScript：

```typescript
if (obj instanceof String) {
    const s = obj as string;   // TS 需要 as 断言
    console.log(s.length);
}
```

Java 的模式匹配更简洁，且**类型安全**由编译器保证。

## 综合小例子：猜数字游戏

把这一阶段的语法组合起来写一个能跑的小游戏：

```java title="GuessNumber.java"
import java.util.Random;
import java.util.Scanner;

public class GuessNumber {
    public static void main(String[] args) {
        Random random = new Random();
        int answer = random.nextInt(100) + 1;   // 1~100
        Scanner scanner = new Scanner(System.in);
        int attempts = 0;
        boolean guessed = false;

        System.out.println("我想了一个 1~100 的数字，猜猜看：");

        while (!guessed) {
            System.out.print("请输入：");
            int guess = scanner.nextInt();
            attempts++;

            if (guess < answer) {
                System.out.println("太小了");
            } else if (guess > answer) {
                System.out.println("太大了");
            } else {
                guessed = true;
                System.out.printf("猜对了！用了 %d 次%n", attempts);
            }

            if (attempts >= 10 && !guessed) {
                System.out.println("次数用完，答案是 " + answer);
                break;
            }
        }

        scanner.close();
    }
}
```

这段代码用到了：变量、`Random`、`Scanner`、`while` 循环、`if/else if`、`break`、`printf` 格式化输出——把前面几个阶段的东西串了起来。

## 复习卡片

```java
// 1. 整数除法会截断
int r = 7 / 2;          // 3
double d = 7.0 / 2;     // 3.5

// 2. 复合赋值自动转型
byte b = 10;
b += 5;                 // ✅
// b = b + 5;           // ❌

// 3. 逻辑运算
a && b   // 短路与
a || b   // 短路或
!a       // 非

// 4. 三元
int max = a > b ? a : b;

// 5. if 条件必须是 boolean
if (n != 0) { ... }     // ✅
// if (n) { ... }       // ❌

// 6. 字符串比较用 equals，常量放前面
if ("quit".equals(cmd)) { ... }

// 7. switch 表达式（JDK 14+）
String name = switch (day) {
    case 1, 2, 3 -> "工作日";
    case 6, 7    -> "周末";
    default      -> "无效";
};

// 8. 多行 case 用 yield
int len = switch (day) {
    case 1 -> 3;
    default -> {
        int x = compute();
        yield x;
    }
};

// 9. 增强 for
for (int n : nums) { ... }

// 10. 标签化 break
outer:
for (...) {
    for (...) {
        if (cond) break outer;
    }
}

// 11. 模式匹配 instanceof（JDK 16+）
if (obj instanceof String s) {
    s.length();
}
```

**记忆要点**：

- 整数除法截断，`double` 除法要至少一个操作数是浮点
- `if` 条件必须是明确的 `boolean`，不接受 truthy/falsy
- 字符串比较用 `.equals()`，常量放左边防 NPE
- 优先用 `switch` 表达式（`->` + `yield`）而不是传统 `switch`
- 增强 for `for (int n : nums)` 简洁但无法修改元素
- `break label` 可以跳出多层嵌套
- `instanceof` 模式匹配让"判断 + 强转 + 命名"一步完成

下一个阶段进入数组和字符串，看看 Java 里"字符串是不可变对象"和"数组是固定长度"这两条设计怎么影响日常写法。
