---
title: 'Java 学习路线总览：前端工程师的重学笔记'
published: 2026-09-05T20:00:00+08:00
description: '一个前端工程师从 0 开始学 Java 的分阶段路线图，每阶段一篇带代码片段的笔记，便于反复回来复习。'
tags: [Java, 学习路线, 前端]
category: Java学习路线
draft: false
---

写了几年 JavaScript/TypeScript，最近因为工作要接触后端服务，决定系统地把 Java 学一遍。这个系列不是"Java 从入门到精通"式的教程，而是一份**前端工程师视角**的重学笔记：每个知识点都会尽量对照 JS 里已经熟悉的心智模型，配上可以直接跑的最小代码片段，方便日后回来快速回忆。

> [!NOTE]
> 阅读顺序建议按下面的阶段编号从头到尾走一遍；已经熟悉的阶段可以直接跳到对应文章当作速查表使用。

## 学习路线图

整个路线拆成 **11 个阶段**，前 4 个阶段是语法基础，中间 4 个是面向对象与常用 API，最后 3 个进入现代 Java 的工程实践：

| 阶段 | 主题 | 关键概念 | 预计投入 |
| :--: | :-- | :-- | :--: |
| 一 | 环境与第一个程序 | JDK / JRE / JVM、`javac`、`java`、classpath | 半天 |
| 二 | 变量与数据类型 | 基本类型、包装类、类型转换、`String` 不可变 | 1 天 |
| 三 | 运算符与流程控制 | `switch` 表达式、增强 for、`break/continue` 标签 | 半天 |
| 四 | 数组与字符串 | 一维/二维数组、`StringBuilder`、正则 | 1 天 |
| 五 | 类与对象 | 构造器、`this`、`static`、包与访问修饰符 | 1 天 |
| 六 | 继承与多态 | `extends`、`super`、重写、向上转型、`Object` | 1 天 |
| 七 | 接口与抽象类 | `interface`、`abstract`、默认方法、`final` | 1 天 |
| 八 | 集合框架 | `List` / `Set` / `Map`、`ArrayList` vs `LinkedList`、`HashMap` 原理 | 2 天 |
| 九 | 异常与泛型 | `try/catch/finally`、`throws`、泛型类/方法/通配符 | 1 天 |
| 十 | Lambda 与 Stream | 函数式接口、`Stream` 三段式、`Optional` | 1 天 |
| 十一 | 多线程入门 | `Thread` / `Runnable`、线程池、`synchronized`、`volatile` | 2 天 |

## 阶段索引

下面是每个阶段对应的文章。链接是站内绝对路径，跟着 base `/blog` 走：

1. [阶段一：JDK、JRE、JVM 与第一个 Java 程序](/blog/posts/java-roadmap-01-env-and-hello/)
2. [阶段二：变量、数据类型与类型系统](/blog/posts/java-roadmap-02-variables-and-types/)
3. [阶段三：运算符与流程控制](/blog/posts/java-roadmap-03-operators-and-control-flow/)
4. [阶段四：数组与字符串](/blog/posts/java-roadmap-04-arrays-and-strings/)
5. [阶段五：面向对象（一）——类与对象](/blog/posts/java-roadmap-05-oop-class-and-object/)
6. [阶段六：面向对象（二）——继承与多态](/blog/posts/java-roadmap-06-oop-inheritance-polymorphism/)
7. [阶段七：接口、抽象类与静态成员](/blog/posts/java-roadmap-07-interface-abstract/)
8. [阶段八：集合框架 List / Set / Map](/blog/posts/java-roadmap-08-collections/)
9. [阶段九：异常处理与泛型](/blog/posts/java-roadmap-09-exception-generics/)
10. [阶段十：Lambda 与 Stream API](/blog/posts/java-roadmap-10-lambda-stream/)
11. [阶段十一：多线程入门](/blog/posts/java-roadmap-11-thread-basics/)

## 前端工程师的心智模型对照

学 Java 之前，先把 JS 里几个"想当然"的习惯掰一掰：

| 维度 | JavaScript | Java |
| :-- | :-- | :-- |
| 类型系统 | 动态类型，运行时才知道 | 静态类型，编译期就检查 |
| 变量声明 | `let x = 1`（类型自动推断为 `number`） | `int x = 1;`（类型必须显式或用 `var`） |
| 数字类型 | 只有 `number`（IEEE 754 双精度） | `byte` / `short` / `int` / `long` / `float` / `double` 六种 |
| 空值 | `null` 与 `undefined` | 只有 `null`；基本类型不能为 `null` |
| 相等判断 | `==` 会做类型转换，`===` 严格 | `==` 比较值（基本类型）或引用（对象），`.equals()` 才是内容相等 |
| 字符串 | 不可变，模板字符串 `` `hi ${name}` `` | 不可变，拼接用 `+` 或 `StringBuilder`，格式化用 `String.format` |
| 数组 | 动态长度、可混合类型 | 固定长度、同一类型；动态用 `ArrayList` |
| 对象字面量 | `{ name: 'Tom' }` 随手就来 | 必须先有 `class`，再 `new` |
| 函数 | 一等公民，随处可传 | 必须先属于类；一等公民要靠函数式接口 + Lambda |
| 模块 | ES Module `import / export` | `package` + `import`，一个 `.java` 文件一个 public 类 |
| 运行环境 | 浏览器 / Node.js 直接解释 | 编译成字节码，由 JVM 解释或 JIT 执行 |
| 依赖管理 | npm / pnpm | Maven / Gradle |
| 空安全 | `?.`、`??` | `Optional<T>`、`Objects.requireNonNull` |

> [!TIP]
> Java 里最反直觉的两点：
> 1. `String a = "hi"; String b = "hi"; a == b` 可能为 `true`（字符串常量池），但**永远**用 `.equals()` 比较字符串内容。
> 2. 对象数组 `new int[3]` 会初始化为 `0`，但 `new String[3]` 里全是 `null`——引用类型默认值是 `null`。

## 环境准备（一次性）

后续每篇文章里的代码都假设你已经完成下面这三件事：

```bash
# 1. 装 JDK 21（LTS 版本，Oracle JDK 或 Eclipse Temurin 都行）
java -version
# openjdk version "21.0.x" ...

# 2. 装一个 IDE：IntelliJ IDEA Community 免费且开箱即用
#    VS Code + Extension Pack for Java 也够用

# 3. 装 Maven（后面项目结构那篇会用到）
mvn -v
# Apache Maven 3.9.x
```

Windows 用户在系统环境变量里加 `JAVA_HOME` 指向 JDK 安装目录，把 `%JAVA_HOME%\bin` 加进 `PATH`。macOS/Linux 用 `sdkman` 或包管理器安装更省心。

## 如何使用这个系列复习

写这个系列时特意做了两件事，方便日后回来"扫一眼就想起来"：

1. **每篇文章都有"复习卡片"小节**，把关键概念压缩成几行代码或一张表，不用重读正文也能回忆起要点。
2. **每个新概念都配可运行的最小示例**，代码块都能直接复制到 IDEA 或 [jshell](https://dev.java/learn/jshell/) 里跑起来。

推荐的复习节奏：

- **第一次学**：按阶段顺序读，每篇结束在 IDE 里把示例敲一遍。
- **一周后**：只看每篇的"复习卡片"和代码块标题，回忆不起来的再翻正文。
- **一个月后**：把整个系列当作速查手册，遇到具体语法问题直接搜文章内的锚点。

> [!IMPORTANT]
> 光读不写等于没学。每个阶段建议配一个小练习：
> 阶段一到四写命令行小程序（计算器、猜数字），阶段五到七写一个图书管理的 OOP 模型，阶段八到十重构前面的代码用集合和 Stream，阶段十一给图书管理加并发借阅。

## 参考资源

- 官方教程：<https://dev.java/learn/>
- Oracle 官方文档：<https://docs.oracle.com/en/java/javase/21/>
- 《Java 核心技术·卷 I》（Cay Horstmann）——当作字典查
- 《Effective Java》（Joshua Bloch）——学到阶段七之后再读

下一篇从最基础的 JDK / JRE / JVM 三兄弟开始，把"Java 代码是怎么跑起来的"讲清楚。
