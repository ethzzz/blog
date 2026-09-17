---
title: 'Java 阶段十一：多线程入门'
published: 2026-09-05T14:00:00+08:00
description: '前端视角看 Java 并发：线程创建、synchronized/volatile、死锁、线程池 ExecutorService、Future、并发集合、原子类。'
tags: [Java, 多线程, 并发, 线程池, synchronized]
category: Java学习路线
draft: false
---

前端的世界是**单线程 + 事件循环**，异步靠 `Promise` 和 `async/await`。Java 是**真·多线程**，多个线程同时读写同一份数据，稍不留神就会遇到竞态条件、死锁、内存可见性问题。这一篇是入门级导览，把心智模型和最基本的工具建起来。

> [!IMPORTANT]
> 多线程是 Java 里最容易出 bug 也最难调试的部分。这个阶段的目的是让你**能看懂**、**能写简单的并发代码**、**知道坑在哪里**。真正深入的并发编程需要单独花几个月学 `java.util.concurrent`（JUC）包。

## 前端 vs Java 的并发模型

| 维度 | JavaScript（浏览器/Node） | Java |
| :-- | :-- | :-- |
| 线程模型 | 单线程 + 事件循环 | 多线程并行 |
| 异步 | `Promise`、`async/await`、回调 | `Thread`、`ExecutorService`、`CompletableFuture` |
| 数据共享 | 天然隔离（除 `SharedArrayBuffer`） | 直接共享堆内存 |
| 竞态条件 | 罕见（除非用 Worker） | 常见，必须显式处理 |
| 锁 | 无 | `synchronized`、`Lock`、原子类 |
| 通信 | 消息传递（`postMessage`） | 共享内存 + 同步 |
| 阻塞 | 阻塞会卡死 UI/事件循环 | 阻塞只影响当前线程 |

**心智模型的转换**：

- JS：`await` 让出控制权，事件循环调度下一个任务
- Java：线程阻塞时 OS 调度另一个线程；多个线程可能**真的同时**执行同一段代码

## 创建线程的三种方式

### 方式一：继承 Thread

```java
public class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("线程运行：" + getName());
    }
}

// 启动
MyThread t = new MyThread();
t.start();          // ✅ 启动新线程执行 run
// t.run();         // ❌ 只是普通方法调用，仍在当前线程
```

**缺点**：Java 单继承，继承了 `Thread` 就不能继承别的类。

### 方式二：实现 Runnable（推荐）

```java
public class MyTask implements Runnable {
    @Override
    public void run() {
        System.out.println("任务运行：" + Thread.currentThread().getName());
    }
}

// 启动
Thread t = new Thread(new MyTask());
t.start();

// Lambda 简化
Thread t2 = new Thread(() -> System.out.println("hi"));
t2.start();
```

**优点**：任务和线程解耦，一个任务可以交给多个线程执行。

### 方式三：实现 Callable（有返回值）

```java
import java.util.concurrent.*;

public class MyCallable implements Callable<Integer> {
    @Override
    public Integer call() throws Exception {
        Thread.sleep(1000);
        return 42;
    }
}

// 通过 ExecutorService 提交（不能直接给 Thread）
ExecutorService executor = Executors.newSingleThreadExecutor();
Future<Integer> future = executor.submit(new MyCallable());
Integer result = future.get();     // 阻塞等待结果
executor.shutdown();
```

`Callable<V>` 与 `Runnable` 的区别：

- `Callable.call()` 有返回值，可以抛受检异常
- `Runnable.run()` 无返回值，只能抛非受检异常

## 线程生命周期

一个线程从创建到死亡会经历 6 种状态（`Thread.State` 枚举）：

```text
NEW ──start()──▶ RUNNABLE ─────────────────────▶ TERMINATED
                    │  ▲
                    │  │
              wait/│  │notify/notifyAll
              join/│  │
              lock │  │
                    ▼  │
                 BLOCKED / WAITING / TIMED_WAITING
```

| 状态 | 含义 |
| :-- | :-- |
| `NEW` | 已创建但未 `start()` |
| `RUNNABLE` | 可运行（包含"正在运行"和"就绪等待 CPU"） |
| `BLOCKED` | 等待获取 `synchronized` 锁 |
| `WAITING` | 无限期等待（`wait()`、`join()`、`LockSupport.park()`） |
| `TIMED_WAITING` | 限时等待（`sleep(ms)`、`wait(ms)`、`join(ms)`） |
| `TERMINATED` | 执行完毕或异常终止 |

## Thread 常用方法

```java
Thread t = new Thread(() -> { ... });

// 启动
t.start();

// 当前线程
Thread.currentThread();
Thread.currentThread().getName();
Thread.currentThread().getId();

// 睡眠（毫秒）
Thread.sleep(1000);           // 当前线程暂停 1 秒，不释放锁

// 等待另一个线程结束
t.join();                     // 当前线程等 t 结束
t.join(5000);                 // 最多等 5 秒

// 中断（协作式）
t.interrupt();                // 给 t 发中断信号
t.isInterrupted();            // 查询是否被中断（不清除标志）
Thread.interrupted();         // 查询并清除标志

// 优先级（1~10，默认 5，仅供 JVM 参考，不保证）
t.setPriority(Thread.MAX_PRIORITY);

// 守护线程：所有非守护线程结束时，JVM 退出（不管守护线程）
t.setDaemon(true);            // 必须在 start() 之前设置

// 让步（提示调度器，不保证）
Thread.yield();

// 静态工厂（JDK 21+ 虚拟线程，另讲）
Thread vt = Thread.ofVirtual().start(() -> { ... });
```

### 正确处理 InterruptedException

`sleep`、`wait`、`join` 都会抛 `InterruptedException`。**不要吞掉它**：

```java
// ❌ 反模式：吞掉中断信号
try {
    Thread.sleep(1000);
} catch (InterruptedException e) {
    // 什么都不做
}

// ✅ 方式一：重新抛出
public void doWork() throws InterruptedException {
    Thread.sleep(1000);
}

// ✅ 方式二：恢复中断状态
try {
    Thread.sleep(1000);
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();   // 让上层知道被中断了
    return;
}
```

## 竞态条件与线程安全

**经典反例**：两个线程同时对一个变量做 `count++`：

```java
public class RaceCondition {
    static int count = 0;

    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> {
            for (int i = 0; i < 100_000; i++) count++;
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start(); t2.start();
        t1.join(); t2.join();

        System.out.println(count);   // 期望 200000，实际可能是 130000~199999
    }
}
```

**原因**：`count++` 不是原子操作，实际上是三步：读 `count` → 加 1 → 写回 `count`。两个线程同时执行时可能都读到同一个值，各自加 1 后写回，导致丢失一次自增。

**解决方案有三种**：

### 1. synchronized：加锁

```java
public class SafeCounter {
    private int count = 0;

    // 同步方法：整个方法加锁（对象锁）
    public synchronized void increment() {
        count++;
    }

    // 同步代码块：更细粒度，指定锁对象
    public void incrementBlock() {
        synchronized (this) {
            count++;
        }
    }

    // 静态同步方法：类锁
    public static synchronized void reset() { ... }

    public int getCount() {
        synchronized (this) {
            return count;
        }
    }
}
```

` synchronized` 保证：

1. **原子性**：代码块内的操作要么全执行要么全不执行
2. **可见性**：一个线程修改后，其他线程立刻能看到
3. **有序性**：禁止代码块内外的指令重排

### 2. volatile：仅保证可见性

```java
public class VolatileExample {
    private volatile boolean running = true;

    public void stop() {
        running = false;       // 修改后立刻对其他线程可见
    }

    public void run() {
        while (running) {      // 没有 volatile 可能死循环（读到缓存的旧值）
            // 干活
        }
    }
}
```

`volatile` **只保证可见性和有序性，不保证原子性**：

```java
private volatile int count = 0;
count++;                       // ❌ 仍然会丢失更新，volatile 救不了
```

**适用场景**：

- 状态标志位（`running`、`shutdown`）
- 双重检查锁定单例（DCL）
- 一写多读的场景

### 3. 原子类：CAS 无锁

`java.util.concurrent.atomic` 包里有一堆原子类，用 CPU 级别的 CAS（Compare-And-Swap）指令实现无锁并发：

```java
import java.util.concurrent.atomic.AtomicInteger;

AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet();       // ++count，返回新值
count.getAndIncrement();       // count++，返回旧值
count.addAndGet(10);           // count += 10
count.compareAndSet(5, 10);    // 如果当前是 5 就设为 10
count.get();
```

**性能对比**（单线程递增 1 亿次）：

- 普通 `int`：约 100ms
- `AtomicInteger`：约 500ms
- `synchronized`：约 3000ms

原子类是**低竞争场景**的首选，高竞争时可能反而不如锁（因为 CAS 失败会自旋）。

其他常用原子类：`AtomicLong`、`AtomicBoolean`、`AtomicReference`、`LongAdder`（高并发计数器，比 `AtomicLong` 更快）。

## 死锁

**死锁**指两个或多个线程互相等待对方持有的锁，永远无法继续：

```java
public class Deadlock {
    static Object lockA = new Object();
    static Object lockB = new Object();

    public static void main(String[] args) {
        new Thread(() -> {
            synchronized (lockA) {
                sleep(100);
                synchronized (lockB) {       // 等待线程 2 释放 lockB
                    System.out.println("线程 1 完成");
                }
            }
        }).start();

        new Thread(() -> {
            synchronized (lockB) {
                sleep(100);
                synchronized (lockA) {       // 等待线程 1 释放 lockA → 死锁
                    System.out.println("线程 2 完成");
                }
            }
        }).start();
    }
}
```

**死锁的四个必要条件**（破坏任一即可避免）：

1. 互斥：资源同时只能被一个线程持有
2. 请求与保持：持有资源的同时请求新资源
3. 不可剥夺：不能强制抢走别人的资源
4. 循环等待：线程之间形成等待环

**避免死锁的实用技巧**：

- **固定加锁顺序**：所有线程都按 A→B 的顺序加锁，就不会循环等待
- **使用 `tryLock` 超时**：`ReentrantLock.tryLock(1, TimeUnit.SECONDS)`，超时放弃
- **减少锁的粒度和持有时间**：不要在持锁时做 IO 或长时间计算
- **使用并发工具类**：`ConcurrentHashMap`、`BlockingQueue` 内部已经处理好

**排查死锁**：

- `jstack <pid>`：打印所有线程栈，会明确指出死锁
- JConsole / VisualVM：图形化工具，"检测死锁"按钮
- `ThreadMXBean.findDeadlockedThreads()`：代码里检测

## 线程池 ExecutorService

**永远不要在生产代码里 `new Thread()`**，线程的创建和销毁开销大，且不受控。用**线程池**复用线程：

```java
import java.util.concurrent.*;

ExecutorService executor = Executors.newFixedThreadPool(10);   // 固定 10 个线程

// 提交任务
executor.submit(() -> System.out.println("task 1"));
executor.submit(() -> System.out.println("task 2"));

// 提交有返回值的任务
Future<Integer> future = executor.submit(() -> 42);
Integer result = future.get();          // 阻塞等待

// 优雅关闭
executor.shutdown();                    // 不再接受新任务，等已提交的执行完
executor.awaitTermination(60, TimeUnit.SECONDS);

// 强制关闭
executor.shutdownNow();                 // 中断所有任务
```

### 常用工厂方法

```java
// 固定大小：并发数可控，最常用
Executors.newFixedThreadPool(10);

// 单线程：保证任务按提交顺序执行
Executors.newSingleThreadExecutor();

// 可缓存：线程数按需增长，60 秒空闲回收
Executors.newCachedThreadPool();

// 定时任务
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);
scheduler.schedule(task, 5, TimeUnit.SECONDS);             // 延迟 5 秒执行
scheduler.scheduleAtFixedRate(task, 0, 1, TimeUnit.SECONDS); // 每秒执行
scheduler.scheduleWithFixedDelay(task, 0, 1, TimeUnit.SECONDS);
```

> [!WARNING]
> **阿里巴巴 Java 开发手册**明确禁止在生产代码用 `Executors.newFixedThreadPool` 和 `newCachedThreadPool`：
> - `newFixedThreadPool` 用无界队列，任务堆积会 OOM
> - `newCachedThreadPool` 用无界线程数，线程爆炸会 OOM
>
> 应该显式用 `ThreadPoolExecutor` 构造：
> ```java
> ThreadPoolExecutor executor = new ThreadPoolExecutor(
>     10,                                    // 核心线程数
>     50,                                    // 最大线程数
>     60L, TimeUnit.SECONDS,                 // 空闲线程存活时间
>     new ArrayBlockingQueue<>(1000),        // 有界队列
>     new ThreadPoolExecutor.CallerRunsPolicy()   // 拒绝策略
> );
> ```

### 线程池参数详解

```text
提交任务时的流程：
1. 线程数 < corePoolSize → 新建核心线程执行
2. 线程数 >= corePoolSize → 放入队列
3. 队列满了 → 新建线程直到 maximumPoolSize
4. 达到 maximumPoolSize 且队列满 → 触发拒绝策略
```

**拒绝策略**（`RejectedExecutionHandler`）：

- `AbortPolicy`（默认）：抛 `RejectedExecutionException`
- `CallerRunsPolicy`：让调用者线程自己执行（降低提交速度）
- `DiscardPolicy`：静默丢弃
- `DiscardOldestPolicy`：丢弃队列里最老的任务

## Future 与 CompletableFuture

### Future：异步结果占位符

```java
ExecutorService executor = Executors.newFixedThreadPool(4);

Future<String> future = executor.submit(() -> {
    Thread.sleep(1000);
    return "done";
});

// 阻塞等待结果
String result = future.get();                  // 无限期等待
String result2 = future.get(5, TimeUnit.SECONDS);   // 最多等 5 秒

future.isDone();       // 是否完成
future.isCancelled();  // 是否被取消
future.cancel(true);   // 尝试取消（true 表示中断正在执行的线程）
```

**Future 的痛点**：

- `get()` 阻塞，无法组合多个 Future
- 无法链式调用（类似 Promise.then）
- 无法注册完成回调

### CompletableFuture（JDK 8+）：真正的 Promise

Java 版的 `Promise`，支持链式调用、组合、异常处理：

```java
import java.util.concurrent.CompletableFuture;

// 创建
CompletableFuture<String> cf = CompletableFuture.supplyAsync(() -> {
    sleep(1000);
    return "hello";
});

// 链式转换（类似 Promise.then）
CompletableFuture<Integer> result = cf
    .thenApply(String::length)              // map
    .thenApply(len -> len * 2);

// 消费（无返回值）
cf.thenAccept(s -> System.out.println(s));
cf.thenRun(() -> System.out.println("done"));

// 组合两个 Future
CompletableFuture<String> f1 = CompletableFuture.supplyAsync(() -> "hello");
CompletableFuture<String> f2 = CompletableFuture.supplyAsync(() -> "world");

f1.thenCombine(f2, (a, b) -> a + " " + b)
  .thenAccept(System.out::println);         // "hello world"

// 等待所有完成
CompletableFuture.allOf(f1, f2).join();

// 等待任意一个完成
CompletableFuture.anyOf(f1, f2).join();

// 异常处理
cf.exceptionally(ex -> "fallback")          // 类似 Promise.catch
  .handle((result, ex) -> {                 // 无论成功失败都调用
      if (ex != null) return "error";
      return result.toUpperCase();
  });

// 显式完成
CompletableFuture<String> manual = new CompletableFuture<>();
manual.complete("done");                    // 手动设置结果
manual.completeExceptionally(new RuntimeException("fail"));

// 指定线程池
ExecutorService pool = Executors.newFixedThreadPool(4);
CompletableFuture.supplyAsync(() -> work(), pool);
```

**API 对照 Promise**：

| JavaScript Promise | CompletableFuture |
| :-- | :-- |
| `new Promise((res, rej) => ...)` | `new CompletableFuture<>()` |
| `Promise.resolve(x)` | `CompletableFuture.completedFuture(x)` |
| `.then(fn)` | `.thenApply(fn)`（有返回）/ `.thenAccept(fn)`（无返回） |
| `.catch(fn)` | `.exceptionally(fn)` |
| `.finally(fn)` | `.whenComplete((r, e) -> ...)` |
| `Promise.all([...])` | `CompletableFuture.allOf(...)` |
| `Promise.race([...])` | `CompletableFuture.anyOf(...)` |
| `await promise` | `future.get()` / `future.join()` |

## 并发集合

普通的 `HashMap`、`ArrayList` 不是线程安全的。多线程场景用 `java.util.concurrent` 包里的替代品：

| 单线程版 | 并发版 | 特点 |
| :-- | :-- | :-- |
| `HashMap` | `ConcurrentHashMap` | 分段锁 / CAS，高并发首选 |
| `TreeMap` | `ConcurrentSkipListMap` | 并发有序 Map |
| `HashSet` | `ConcurrentHashMap.newKeySet()` | 并发 Set |
| `ArrayList` | `CopyOnWriteArrayList` | 写时复制，读多写少场景 |
| `LinkedList` | `ConcurrentLinkedQueue` | 无界并发队列 |
| `ArrayDeque` | `LinkedBlockingQueue` / `ArrayBlockingQueue` | 阻塞队列，生产者-消费者模型 |

```java
// ConcurrentHashMap：线程安全的 HashMap
Map<String, Integer> map = new ConcurrentHashMap<>();
map.put("a", 1);
map.computeIfAbsent("b", k -> 2);
map.merge("a", 1, Integer::sum);         // 原子操作

// CopyOnWriteArrayList：读多写少
List<String> list = new CopyOnWriteArrayList<>();
list.add("a");
for (String s : list) { ... }            // 迭代不会抛 ConcurrentModificationException

// BlockingQueue：生产者消费者
BlockingQueue<String> queue = new LinkedBlockingQueue<>(100);
queue.put("item");                       // 队列满时阻塞
String item = queue.take();              // 队列空时阻塞
queue.offer("item", 5, TimeUnit.SECONDS); // 超时放弃
```

**注意**：`ConcurrentHashMap` 的**单个方法**是线程安全的，但**多个方法的组合**仍需要外部同步：

```java
// ❌ 不是原子的
if (!map.containsKey("k")) {
    map.put("k", v);
}

// ✅ 用原子方法
map.putIfAbsent("k", v);
map.computeIfAbsent("k", key -> computeValue());
```

## Lock 与 ReentrantLock

`synchronized` 是 JVM 内置的锁，简单但功能有限。`java.util.concurrent.locks.Lock` 接口提供了更强大的锁：

```java
import java.util.concurrent.locks.ReentrantLock;

ReentrantLock lock = new ReentrantLock();

// 基本用法
lock.lock();
try {
    // 临界区
} finally {
    lock.unlock();     // 必须在 finally 里释放！
}

// 尝试加锁（非阻塞）
if (lock.tryLock()) {
    try { ... } finally { lock.unlock(); }
} else {
    // 没拿到锁
}

// 超时尝试
if (lock.tryLock(1, TimeUnit.SECONDS)) {
    try { ... } finally { lock.unlock(); }
}

// 公平锁：按等待顺序分配
ReentrantLock fairLock = new ReentrantLock(true);

// 可中断的加锁
lock.lockInterruptibly();
```

**Lock vs synchronized**：

| 维度 | `synchronized` | `Lock` |
| :-- | :-- | :-- |
| 释放 | 自动（离开代码块） | 手动 `unlock()`，必须在 `finally` |
| 中断响应 | 不可中断 | `lockInterruptibly()` 可中断 |
| 超时 | 无 | `tryLock(timeout)` |
| 公平性 | 非公平 | 可选公平/非公平 |
| 条件变量 | 只有一个（`wait/notify`） | 多个 `Condition` |
| 性能（现代 JVM） | 差不多 | 差不多 |

**结论**：**日常首选 `synchronized`**（简单、不会忘记释放）。只有需要超时、可中断、公平锁、多条件变量时才用 `Lock`。

### ReadWriteLock：读写锁

**读多写少**的场景，允许多个读线程同时进入，写线程独占：

```java
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

ReadWriteLock rwLock = new ReentrantReadWriteLock();

// 读操作
rwLock.readLock().lock();
try { return data; } finally { rwLock.readLock().unlock(); }

// 写操作
rwLock.writeLock().lock();
try { data = newValue; } finally { rwLock.writeLock().unlock(); }
```

## ThreadLocal：线程局部变量

每个线程持有独立的副本，天然线程安全，常用于**用户上下文**、**日期格式化器**等场景：

```java
public class UserContext {
    private static final ThreadLocal<String> CURRENT_USER = new ThreadLocal<>();

    public static void set(String user) { CURRENT_USER.set(user); }
    public static String get() { return CURRENT_USER.get(); }
    public static void clear() { CURRENT_USER.remove(); }
}

// 使用
UserContext.set("Tom");
System.out.println(UserContext.get());   // "Tom"

// 线程池场景务必 clear，避免内存泄漏
try {
    UserContext.set("Tom");
    // 业务代码
} finally {
    UserContext.clear();
}
```

**常见用途**：

- `SimpleDateFormat`（非线程安全）→ 用 `ThreadLocal<SimpleDateFormat>` 或换 `DateTimeFormatter`（线程安全）
- 数据库连接、事务上下文
- 请求作用域的用户信息

> [!CAUTION]
> ThreadLocal 在**线程池**中特别容易内存泄漏：线程复用不会销毁，`ThreadLocal` 里的值也不会释放。**用完必须调用 `remove()`**。

## 虚拟线程（JDK 21+）

JDK 21 正式引入**虚拟线程**（Virtual Threads，Project Loom），是 Java 并发的重大革新：

```java
// 传统平台线程：受 OS 限制，最多几千个
Thread t = new Thread(() -> work());

// 虚拟线程：轻量级，可以创建百万个
Thread vt = Thread.ofVirtual().start(() -> work());

// 用 ExecutorService 更方便
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 1_000_000; i++) {
        executor.submit(() -> {
            Thread.sleep(1000);
            return "done";
        });
    }
}
```

**虚拟线程的意义**：写"同步阻塞"的代码，享受"异步非阻塞"的性能，简化高并发编程。**IO 密集型应用的未来方向**。

## 综合小例子：并发下载器

把线程池、Future、并发集合、原子类串起来：

```java title="ConcurrentDownloader.java"
package com.example.downloader;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class ConcurrentDownloader {
    private final ExecutorService executor;
    private final Map<String, byte[]> cache = new ConcurrentHashMap<>();
    private final AtomicInteger successCount = new AtomicInteger();
    private final AtomicInteger failureCount = new AtomicInteger();

    public ConcurrentDownloader(int poolSize) {
        this.executor = Executors.newFixedThreadPool(poolSize);
    }

    public void downloadAll(List<String> urls) throws InterruptedException {
        List<CompletableFuture<Void>> futures = urls.stream()
            .map(this::downloadAsync)
            .toList();

        // 等待全部完成
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
    }

    private CompletableFuture<Void> downloadAsync(String url) {
        return CompletableFuture
            .supplyAsync(() -> fetch(url), executor)
            .thenAccept(data -> {
                if (data != null) {
                    cache.put(url, data);
                    successCount.incrementAndGet();
                    System.out.printf("[OK] %s (%d bytes)%n", url, data.length);
                } else {
                    failureCount.incrementAndGet();
                    System.out.printf("[FAIL] %s%n", url);
                }
            })
            .exceptionally(ex -> {
                failureCount.incrementAndGet();
                System.err.println("[ERROR] " + url + ": " + ex.getMessage());
                return null;
            });
    }

    private byte[] fetch(String url) {
        // 模拟网络请求
        try {
            Thread.sleep(ThreadLocalRandom.current().nextInt(100, 500));
            if (url.contains("fail")) return null;
            return ("data-of-" + url).getBytes();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return null;
        }
    }

    public void shutdown() {
        executor.shutdown();
        try {
            if (!executor.awaitTermination(60, TimeUnit.SECONDS)) {
                executor.shutdownNow();
            }
        } catch (InterruptedException e) {
            executor.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }

    public void printStats() {
        System.out.printf("成功: %d, 失败: %d, 缓存: %d%n",
            successCount.get(), failureCount.get(), cache.size());
    }

    public static void main(String[] args) throws Exception {
        List<String> urls = List.of(
            "https://example.com/a",
            "https://example.com/b",
            "https://example.com/fail-1",
            "https://example.com/c",
            "https://example.com/d"
        );

        ConcurrentDownloader downloader = new ConcurrentDownloader(4);
        try {
            long start = System.currentTimeMillis();
            downloader.downloadAll(urls);
            long elapsed = System.currentTimeMillis() - start;
            System.out.printf("总耗时：%dms%n", elapsed);
            downloader.printStats();
        } finally {
            downloader.shutdown();
        }
    }
}
```

这段代码综合运用了：

- **`ExecutorService` 线程池**（不用手动 `new Thread`）
- **`CompletableFuture`** 链式调用（`supplyAsync` → `thenAccept` → `exceptionally`）
- **`ConcurrentHashMap`** 线程安全缓存
- **`AtomicInteger`** 无锁计数器
- **优雅关闭**：`shutdown` + `awaitTermination` + `shutdownNow` 三段式

## 复习卡片

```java
// 创建线程
Thread t = new Thread(() -> work());
t.start();

// Callable + Future
ExecutorService exec = Executors.newFixedThreadPool(10);
Future<Integer> f = exec.submit(() -> 42);
Integer r = f.get();
exec.shutdown();

// 线程安全：三选一
synchronized (lock) { count++; }        // 加锁
private volatile boolean running;       // 仅可见性
AtomicInteger count = new AtomicInteger();   // 无锁

// 死锁避免：固定加锁顺序 + tryLock 超时

// CompletableFuture（Java 版 Promise）
CompletableFuture.supplyAsync(() -> work())
    .thenApply(String::length)
    .thenAccept(System.out::println)
    .exceptionally(ex -> { log.error("", ex); return null; });

CompletableFuture.allOf(f1, f2).join();

// 并发集合
ConcurrentHashMap<K, V>       // 替代 HashMap
CopyOnWriteArrayList<E>       // 替代 ArrayList（读多写少）
LinkedBlockingQueue<E>        // 生产者-消费者

// Lock
ReentrantLock lock = new ReentrantLock();
lock.lock();
try { ... } finally { lock.unlock(); }

if (lock.tryLock(1, TimeUnit.SECONDS)) {
    try { ... } finally { lock.unlock(); }
}

// ThreadLocal（记得 remove）
ThreadLocal<User> ctx = new ThreadLocal<>();
try { ctx.set(user); ... } finally { ctx.remove(); }

// 虚拟线程（JDK 21+）
Thread.ofVirtual().start(() -> work());
Executors.newVirtualThreadPerTaskExecutor();
```

**记忆要点**：

- 生产代码永远用**线程池**，不要 `new Thread()`
- 线程安全三选一：`synchronized`（简单）/ `volatile`（状态位）/ 原子类（低竞争计数）
- `volatile` 只保证**可见性**，不保证原子性；`count++` 用原子类或锁
- 处理 `InterruptedException` **不要吞**，要么抛出要么 `Thread.currentThread().interrupt()`
- 死锁避免：固定加锁顺序、`tryLock` 超时、减少锁粒度
- `CompletableFuture` = Java 版 `Promise`，链式调用、组合、异常处理都有
- 并发集合首选 `ConcurrentHashMap`，读多写少用 `CopyOnWriteArrayList`
- `ThreadLocal` 用完必须 `remove()`，尤其在线程池里
- JDK 21 的**虚拟线程**是未来方向，IO 密集型场景优先尝试

## 结语

到这里整个 Java 学习路线就走完了。回头看看这十一个阶段：

- **一 ~ 四**：语法地基（环境、类型、流程、数组字符串）
- **五 ~ 七**：OOP 三件套（类、继承多态、接口抽象类）
- **八 ~ 十**：日常业务代码的核心工具（集合、异常泛型、Lambda Stream）
- **十一**：并发入门

一个前端工程师从零到能写业务 Java 代码，走完这些大概需要 **2~3 周**认真投入的时间。之后就是靠写项目、读源码、看《Effective Java》持续深化。

**接下来的方向**（不在这个系列里）：

- **构建工具**：Maven / Gradle，项目结构与依赖管理
- **单元测试**：JUnit 5、Mockito、AssertJ
- **主流框架**：Spring Boot（后端）、Android（移动端）
- **JVM 深入**：内存模型、GC、类加载、性能调优
- **JUC 深入**：`java.util.concurrent` 剩余部分、AQS、锁优化
- **虚拟线程**：Project Loom 完整用法

祝学习顺利。有代码可跑，有笔记可查，就不算白学。
