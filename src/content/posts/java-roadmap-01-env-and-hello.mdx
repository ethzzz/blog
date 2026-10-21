---
title: 'Java 阶段一：JDK、JRE、JVM 与第一个程序'
published: 2026-09-02T09:00:00+08:00
description: '先把 Java 是怎么跑起来的搞清楚：JDK / JRE / JVM 三兄弟、字节码、classpath，然后写下第一个 Hello World。'
tags: [Java, JDK, JVM, 入门]
category: Java学习路线
draft: false
---

学任何语言之前，先弄明白"我敲的代码到底是怎么变成屏幕上运行的程序的"。JavaScript 是浏览器/V8 直接解释执行，Java 多了一步"编译成字节码"。这个阶段就把这一步彻底讲清楚。

## JDK、JRE、JVM 到底谁装谁

三个缩写经常被混用，其实是三层包含关系：

```text
┌────────────────────────────── JDK ──────────────────────────────┐
│  javac 编译器   jdb 调试器   jshell   jar 打包   ...开发工具     │
│                                                                 │
│  ┌─────────────────────────── JRE ───────────────────────────┐  │
│  │  Java 标准库（java.lang、java.util、java.io ...）         │  │
│  │                                                            │  │
│  │  ┌────────────────────── JVM ─────────────────────────┐    │  │
│  │  │  类加载器 → 字节码解释器 / JIT 编译器 → 操作系统    │    │  │
│  │  └────────────────────────────────────────────────────┘    │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

- **JVM**（Java Virtual Machine）：真正执行字节码的虚拟机，屏蔽操作系统差异。"一次编写，到处运行"就靠它。
- **JRE**（Java Runtime Environment）= JVM + Java 标准库。**只想运行 Java 程序**装它就够了。
- **JDK**（Java Development Kit）= JRE + 编译器 `javac` + 各种开发工具。**要写 Java 代码必须装 JDK**。

> [!TIP]
> JDK 21 之后，Oracle 已经把 JRE 从发行包里拆掉了，日常开发直接装 JDK 即可，不用再纠结选哪个。这个系列用的都是 JDK 21（LTS）。

## Java 程序的运行流程

一个 `.java` 文件从源代码到运行结果，中间经过两步：

```text
HelloWorld.java  ──[javac 编译]──▶  HelloWorld.class  ──[java 运行]──▶  JVM 执行字节码
    源代码                              字节码                             运行结果
```

对比一下熟悉的前端流程：

| 阶段 | Java | 前端类比 |
| :-- | :-- | :-- |
| 编写 | `HelloWorld.java` | `index.ts` |
| 编译 | `javac` 生成 `.class` 字节码 | `tsc` 生成 `.js` |
| 打包 | `jar` 命令打包成 `.jar` | `vite build` 打包成 `dist/` |
| 运行 | JVM 解释或 JIT 编译字节码 | 浏览器/Node 解释或 JIT 执行 JS |

区别在于：Java 的字节码是**平台无关**的中间形式，同一个 `.class` 文件在 Windows、Linux、macOS 上都能跑；JS 的产物则是给浏览器/V8 直接吃的文本。

## 第一个程序：Hello World

新建 `HelloWorld.java`，注意文件名必须和 public 类名**完全一致**（大小写敏感）：

```java title="HelloWorld.java"
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

编译 + 运行：

```bash
javac HelloWorld.java     # 生成 HelloWorld.class
java HelloWorld           # 运行，注意不带 .class 后缀
# 输出：Hello, World!
```

从 JDK 11 开始还支持**单文件直接运行**，省去手动编译：

```bash
java HelloWorld.java      # 编译 + 运行一步到位，适合写小脚本
```

## 逐行拆解代码

上面这 5 行看着简单，其实每一处都有说法：

```java
public class HelloWorld {
```

- `public`：访问修饰符，表示所有类都能访问它。一个 `.java` 文件里**最多只能有一个 public 类**，且文件名必须等于这个类名。
- `class`：定义一个类。Java 是纯面向对象语言，所有代码都必须写在类里。
- `HelloWorld`：类名，**大驼峰**命名（PascalCase）。

```java
    public static void main(String[] args) {
```

- `public static`：静态方法，属于类本身而不是类的实例，JVM 启动时直接调用，不需要 `new`。
- `void`：返回类型是"无"。JS 里函数不写 `return` 就是返回 `undefined`，Java 必须显式声明。
- `main`：方法名，**JVM 启动时约定的入口方法**，名字必须是 `main`。
- `String[] args`：命令行参数数组。执行 `java HelloWorld a b c` 时，`args` 就是 `["a", "b", "c"]`。

```java
        System.out.println("Hello, World!");
```

- `System` 是 `java.lang` 包里的类，`out` 是它的静态字段（一个 `PrintStream` 对象），`println` 是这个对象的方法。
- 等价于 JS 的 `console.log`，但 `println` 会自动加换行，`print` 不会。
- Java 里字符串用**双引号**，单引号只表示 `char` 字符。这一点跟 JS 反着来，刚开始容易写错。

## 常见编译错误对照

| 报错 | 原因 | JS 里的类比 |
| :-- | :-- | :-- |
| `class, interface, enum, or record expected` | 类外写了代码 | 顶层没有正确闭合花括号 |
| `';' expected` | 语句末尾漏了分号 | JS 有 ASI 自动补，Java 没有 |
| `cannot find symbol` | 变量/方法/类没导入或拼错 | `ReferenceError` |
| `class HelloWorld is public, should be declared in a file named HelloWorld.java` | 文件名和 public 类名不一致 | —— |
| `main method not found` | `main` 签名写错（比如少了 `static`） | —— |

> [!WARNING]
> Java **每一条语句都必须以分号 `;` 结尾**，没有 JS 那种自动分号插入（ASI）。写完一行就加分号是最省事的习惯。

## classpath：JVM 去哪儿找 class 文件

`java HelloWorld` 命令默认从**当前目录**找 `HelloWorld.class`。如果 class 文件在别的目录，需要 `-cp`（或 `-classpath`）指定：

```bash
# 假设编译产物在 ./out 目录
javac -d out HelloWorld.java    # -d 指定输出目录
java -cp out HelloWorld         # -cp 指定 classpath
```

后续用 Maven/Gradle 时，classpath 由构建工具自动管理，写业务代码时基本不用手动碰。但看到 `ClassNotFoundException` 时，第一反应就是"classpath 里没这个类"。

## 第一个稍微像样的程序

写一个命令行计算器，读入两个数字并输出和。这里用到 `Scanner` 读控制台输入：

```java title="Sum.java"
import java.util.Scanner;   // 引入其他包的类要 import

public class Sum {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("请输入第一个整数：");
        int a = scanner.nextInt();

        System.out.print("请输入第二个整数：");
        int b = scanner.nextInt();

        System.out.println("a + b = " + (a + b));

        scanner.close();
    }
}
```

跑起来：

```bash
javac Sum.java
java Sum
# 请输入第一个整数：3
# 请输入第二个整数：5
# a + b = 8
```

几个新知识点：

- `import java.util.Scanner;` 类似 JS 的 `import { Scanner } from 'java.util'`，只是 Java 没有相对路径的概念，都是包的全限定名。
- `new Scanner(System.in)` 创建对象，Java 里除了基本类型都要用 `new`。
- `"a + b = " + (a + b)`：`+` 遇到字符串会做拼接，所以要用括号保证先算加法。**注意优先级**，写成 `"a + b = " + a + b` 会变成 `"a + b = 35"`（拼接）。

## 复习卡片

一分钟回想整个阶段的关键点：

```java
// 1. 一个 .java 文件 = 一个 public 类，文件名 = 类名
public class HelloWorld {
    // 2. main 方法是入口，签名固定
    public static void main(String[] args) {
        // 3. 输出：println 带换行，print 不带
        System.out.println("Hello");
        // 4. 每条语句必须以分号结尾
    }
}
```

```bash
# 5. 编译 + 运行
javac HelloWorld.java    # 生成 .class
java HelloWorld          # 运行（不带 .class）

# 6. 单文件直接运行（JDK 11+）
java HelloWorld.java

# 7. classpath 指定
javac -d out HelloWorld.java
java -cp out HelloWorld
```

**记忆要点**：

- JDK ⊃ JRE ⊃ JVM
- `.java` → `javac` → `.class`（字节码）→ `java` → JVM 执行
- `main` 方法签名必须一字不差：`public static void main(String[] args)`
- 文件名 = public 类名
- 字符串用双引号，字符用单引号
- 语句末尾必须有分号

下一个阶段进入变量和数据类型，看看 Java 的静态类型系统和 JS 的动态类型到底差在哪儿。
