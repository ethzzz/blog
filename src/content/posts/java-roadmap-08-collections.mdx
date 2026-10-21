---
title: 'Java 阶段八：集合框架 List / Set / Map'
published: 2026-09-04T14:00:00+08:00
description: 'Java 集合框架全景：ArrayList/LinkedList、HashSet/TreeSet、HashMap/TreeMap 的用法与选型，附 HashMap 原理简介和迭代陷阱。'
tags: [Java, 集合, List, Map, HashMap]
category: Java学习路线
draft: false
---

日常业务代码里 80% 的时间都在跟集合打交道。Java 的集合框架比 JS 的 `Array` + `Object` + `Map` + `Set` 要复杂得多，但也更有条理。这一篇把整个框架的骨架讲清楚，配上常用操作的速查表。

## 集合框架全景

Java 集合分两大分支：**Collection**（单元素集合）和 **Map**（键值对）：

```text
Iterable
  └── Collection
        ├── List（有序、可重复）
        │     ├── ArrayList     ← 90% 场景用它
        │     ├── LinkedList
        │     └── Vector（古老，别用）
        │
        ├── Set（不重复）
        │     ├── HashSet       ← 最常用
        │     ├── LinkedHashSet（保持插入顺序）
        │     └── TreeSet（排序）
        │
        └── Queue / Deque（队列）
              ├── ArrayDeque    ← 栈和队列都用它
              ├── PriorityQueue（优先队列）
              └── LinkedList（也实现了 Deque）

Map（键值对，不属于 Collection）
  ├── HashMap         ← 90% 场景用它
  ├── LinkedHashMap（保持插入顺序 / 访问顺序）
  ├── TreeMap（按 key 排序）
  ├── Hashtable（古老，别用）
  └── ConcurrentHashMap（线程安全，阶段十一讲）
```

**选型口诀**：

- 需要有序可重复 → `ArrayList`
- 需要不重复 → `HashSet`
- 需要按 key 查找 → `HashMap`
- 需要保持插入顺序 → `LinkedHashSet` / `LinkedHashMap`
- 需要排序 → `TreeSet` / `TreeMap`
- 需要队列/栈 → `ArrayDeque`

## List：有序可重复

### ArrayList

**动态数组**，最常用。内部是一个可变长度的数组，随机访问 O(1)，中间插入删除 O(n)。

```java
import java.util.ArrayList;
import java.util.List;

// 创建
List<String> list = new ArrayList<>();          // 空列表
List<String> withInit = new ArrayList<>(List.of("a", "b", "c"));
List<String> immutable = List.of("a", "b", "c"); // JDK 9+，不可变

// 添加
list.add("apple");                  // 尾部添加
list.add(0, "banana");              // 指定位置插入
list.addAll(List.of("x", "y"));     // 批量添加

// 访问
list.get(0);                        // "banana"
list.set(0, "cherry");              // 修改索引 0
list.indexOf("apple");              // 查找位置
list.contains("apple");             // 是否包含
list.size();                        // 长度
list.isEmpty();                     // 是否为空

// 删除
list.remove(0);                     // 按索引删
list.remove("apple");               // 按内容删（第一个匹配）
list.removeAll(List.of("x", "y"));  // 批量删
list.clear();                       // 清空

// 遍历
for (String s : list) System.out.println(s);
list.forEach(s -> System.out.println(s));
for (int i = 0; i < list.size(); i++) {
    System.out.println(list.get(i));
}
```

> [!WARNING]
> `List.of()` 创建的列表是**不可变**的，调用 `add`/`remove` 会抛 `UnsupportedOperationException`：
> ```java
> List<String> fixed = List.of("a", "b");
> fixed.add("c");   // ❌ 抛异常
> 
> // 想要可变的副本
> List<String> mutable = new ArrayList<>(fixed);
> ```

### LinkedList

**双向链表**，头部/尾部插入删除 O(1)，随机访问 O(n)。**日常几乎不用**，除非明确知道要频繁在头尾操作（这种情况 `ArrayDeque` 通常更快）。

```java
List<String> linked = new LinkedList<>();
linked.addFirst("a");     // LinkedList 特有
linked.addLast("z");
linked.removeFirst();
linked.removeLast();
```

### ArrayList vs LinkedList 选型

| 操作 | ArrayList | LinkedList |
| :-- | :--: | :--: |
| 随机访问 `get(i)` | O(1) ✅ | O(n) |
| 尾部添加 `add(x)` | 均摊 O(1) ✅ | O(1) |
| 头部添加 `add(0, x)` | O(n) | O(1) ✅ |
| 中间插入/删除 | O(n) | O(n)（找位置） + O(1)（改指针） |
| 内存占用 | 紧凑 ✅ | 每个节点额外两个指针 |

**结论**：99% 场景选 `ArrayList`。需要队列/栈行为选 `ArrayDeque`，不选 `LinkedList`。

## Set：不重复

### HashSet

基于 `HashMap` 实现，**无序**，添加/删除/查找都是 O(1)。最常用的 Set。

```java
import java.util.HashSet;
import java.util.Set;

Set<String> set = new HashSet<>();
set.add("apple");
set.add("banana");
set.add("apple");              // 已存在，不添加，add 返回 false

set.size();                    // 2
set.contains("apple");         // true
set.remove("apple");

// 遍历（顺序不保证）
for (String s : set) System.out.println(s);
set.forEach(System.out::println);
```

**去重的原理**：`HashSet` 内部就是 `HashMap<E, Object>`，元素作为 key。**必须重写 `equals` 和 `hashCode`**，否则自定义类的两个"内容相同"的对象会被认为不同：

```java
public class User {
    private String name;
    // 不重写 equals/hashCode 的话
}

Set<User> users = new HashSet<>();
users.add(new User("Tom"));
users.add(new User("Tom"));   // 变成 2 个元素！

// 重写了 equals/hashCode 后
users.add(new User("Tom"));
users.add(new User("Tom"));   // 只有 1 个 ✅
```

### LinkedHashSet

**保持插入顺序**的 HashSet，性能略低但可预测：

```java
Set<String> set = new LinkedHashSet<>();
set.add("c");
set.add("a");
set.add("b");
// 遍历顺序：c, a, b（跟插入一致）
```

### TreeSet

**按自然顺序或 Comparator 排序**，基于红黑树，操作 O(log n)：

```java
Set<Integer> nums = new TreeSet<>(List.of(5, 2, 8, 1, 9));
// 遍历顺序：1, 2, 5, 8, 9

Set<String> reverseOrder = new TreeSet<>(Comparator.reverseOrder());
reverseOrder.add("b");
reverseOrder.add("a");
reverseOrder.add("c");
// 遍历顺序：c, b, a
```

`TreeSet` 的额外能力：

```java
TreeSet<Integer> set = new TreeSet<>(List.of(1, 3, 5, 7, 9));
set.first();             // 1
set.last();              // 9
set.floor(6);            // 5，小于等于 6 的最大值
set.ceiling(6);          // 7，大于等于 6 的最小值
set.higher(5);           // 7，严格大于
set.lower(5);            // 3，严格小于
set.headSet(5);          // [1, 3]，小于 5 的子集
set.tailSet(5);          // [5, 7, 9]，大于等于 5 的子集
```

## Queue 与 Deque

### ArrayDeque

**双端队列**，可以当队列（FIFO）也可以当栈（LIFO）：

```java
import java.util.ArrayDeque;
import java.util.Deque;

// 当队列用（FIFO）
Deque<String> queue = new ArrayDeque<>();
queue.offer("a");           // 尾部入队
queue.offer("b");
queue.poll();               // "a"，头部出队
queue.peek();               // "b"，查看头部但不删

// 当栈用（LIFO）
Deque<String> stack = new ArrayDeque<>();
stack.push("a");            // 头部入栈
stack.push("b");
stack.pop();                // "b"，头部出栈
stack.peek();               // "a"
```

**方法对照**：

| 操作 | 队列（尾部入，头部出） | 栈（头部入，头部出） |
| :-- | :-- | :-- |
| 入 | `offer(x)` / `add(x)` | `push(x)` / `addFirst(x)` |
| 出 | `poll()` / `remove()` | `pop()` / `removeFirst()` |
| 查 | `peek()` / `element()` | `peek()` / `peekFirst()` |

`offer` / `poll` / `peek` 遇失败返回 `null` 或 `false`；`add` / `remove` / `element` 遇失败抛异常。**推荐用前者**。

> [!TIP]
> 官方推荐用 `Deque` 替代古老的 `Stack` 类，因为 `Stack` 继承自 `Vector`（每个方法都加锁），性能差且设计过时。

### PriorityQueue

**优先队列**，出队顺序按优先级（默认自然顺序，可传 Comparator）：

```java
import java.util.PriorityQueue;

PriorityQueue<Integer> pq = new PriorityQueue<>();   // 小顶堆
pq.offer(5);
pq.offer(1);
pq.offer(3);
pq.poll();     // 1（最小）
pq.poll();     // 3
pq.poll();     // 5

// 大顶堆
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
```

内部是**二叉堆**，插入和出队 O(log n)，`peek` O(1)。常用于 Top-K 问题、任务调度、Dijkstra 算法。

## Map：键值对

### HashMap

**最常用**，基于哈希表，`get/put/remove` 均摊 O(1)：

```java
import java.util.HashMap;
import java.util.Map;

// 创建
Map<String, Integer> map = new HashMap<>();
Map<String, Integer> withInit = Map.of("a", 1, "b", 2);   // 不可变，JDK 9+

// 增/改
map.put("apple", 3);
map.put("banana", 5);
map.put("apple", 10);              // 覆盖旧值

// 查
map.get("apple");                  // 10
map.getOrDefault("cherry", 0);     // 0（key 不存在时返回默认值）
map.containsKey("apple");          // true
map.containsValue(10);             // true
map.size();

// 删
map.remove("apple");
map.remove("apple", 10);           // 值匹配才删（更安全）
map.clear();

// 遍历
for (Map.Entry<String, Integer> e : map.entrySet()) {
    System.out.println(e.getKey() + " = " + e.getValue());
}

map.forEach((k, v) -> System.out.println(k + " = " + v));

// 只遍历 key 或 value
for (String k : map.keySet()) { ... }
for (Integer v : map.values()) { ... }
```

**常用便捷方法**：

```java
// putIfAbsent：不存在才放
map.putIfAbsent("cherry", 1);      // 如果 cherry 已存在则不改

// computeIfAbsent：不存在才计算并放（常用于分组）
Map<String, List<Integer>> grouped = new HashMap<>();
grouped.computeIfAbsent("odd", k -> new ArrayList<>()).add(1);
grouped.computeIfAbsent("odd", k -> new ArrayList<>()).add(3);
// {"odd": [1, 3]}

// compute：无论如何都重新计算
map.compute("apple", (k, v) -> v == null ? 1 : v + 1);

// merge：合并值（常用于计数）
Map<String, Integer> count = new HashMap<>();
for (String word : words) {
    count.merge(word, 1, Integer::sum);   // 计数经典写法
}
```

### LinkedHashMap

**保持插入顺序**（默认）或**访问顺序**（LRU 缓存的基础）：

```java
// 插入顺序
Map<String, Integer> insertion = new LinkedHashMap<>();
insertion.put("c", 3);
insertion.put("a", 1);
insertion.put("b", 2);
// 遍历：c, a, b

// 访问顺序（true 参数）：每次访问会把 key 移到末尾
Map<String, Integer> access = new LinkedHashMap<>(16, 0.75f, true);
```

继承 `LinkedHashMap` 重写 `removeEldestEntry` 可以一行实现 LRU 缓存：

```java
public class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    public LRUCache(int capacity) {
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }
}
```

### TreeMap

**按 key 排序**，基于红黑树，操作 O(log n)：

```java
Map<String, Integer> sorted = new TreeMap<>();
sorted.put("banana", 2);
sorted.put("apple", 1);
sorted.put("cherry", 3);
// 遍历顺序：apple, banana, cherry（字典序）

// 范围查询
sorted.headMap("banana");       // {apple=1}
sorted.tailMap("banana");       // {banana=2, cherry=3}
sorted.subMap("a", "c");        // 左闭右开
sorted.firstKey();
sorted.lastKey();
```

## HashMap 原理简述

面试常问，日常写代码理解到"够用"的程度就行：

### 结构

```text
HashMap 内部是一个 Node<K,V>[] table 数组（叫"桶"）
每个 Node 有 hash、key、value、next 四个字段

put(k, v) 流程：
1. 算 hash：h = k.hashCode() ^ (h >>> 16)   ← 扰动函数，减少冲突
2. 定位桶：index = (n - 1) & hash          ← n 是数组长度（2 的幂）
3. 桶为空 → 直接放
4. 桶非空 → 遍历链表/红黑树找同 key（equals）→ 覆盖或追加
5. 超过阈值 → 扩容 2 倍，重新分布元素
```

### 关键参数

| 参数 | 默认值 | 含义 |
| :-- | :--: | :-- |
| 初始容量 | 16 | 桶数组长度，永远是 2 的幂 |
| 负载因子 | 0.75 | 装到 75% 就扩容 |
| 树化阈值 | 8 | 单桶链表长度 ≥ 8 且数组 ≥ 64 时转红黑树 |
| 退化阈值 | 6 | 红黑树节点 ≤ 6 时退回链表 |

### 为什么容量必须是 2 的幂

`(n - 1) & hash` 比 `hash % n` 快得多，且能保证均匀分布。这也是为什么 `HashMap` 的性能高度依赖 `hashCode` 的质量——如果所有对象都返回同一个 hashCode，`HashMap` 就退化成 O(n) 的链表（JDK 8 后是 O(log n) 的红黑树）。

### 为什么重写 equals 必须重写 hashCode

`HashMap` 先用 `hashCode` 找桶，再用 `equals` 比较。如果两个"内容相同"的对象 `hashCode` 不同，会落到不同桶里，`get` 就找不到之前 `put` 的值。

## 迭代器与 ConcurrentModificationException

### Iterator

所有 `Collection` 都实现了 `Iterable`，可以拿到 `Iterator`：

```java
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String s = it.next();
    if (s.startsWith("a")) {
        it.remove();          // ✅ 唯一安全的遍历时删除方式
    }
}
```

### 遍历时修改的陷阱

用增强 for 或 `forEach` 遍历时**直接调用集合的 `add/remove`** 会抛 `ConcurrentModificationException`：

```java
List<String> list = new ArrayList<>(List.of("a", "b", "c"));

// ❌ 抛异常
for (String s : list) {
    if (s.equals("a")) list.remove(s);
}

// ❌ 抛异常
list.forEach(s -> {
    if (s.equals("a")) list.remove(s);
});

// ✅ 用 Iterator.remove
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (it.next().equals("a")) it.remove();
}

// ✅ 用 removeIf（JDK 8+，最简洁）
list.removeIf(s -> s.equals("a"));

// ✅ 用 Stream 过滤生成新列表
List<String> filtered = list.stream().filter(s -> !s.equals("a")).toList();
```

**`removeIf` 是日常首选**，简洁且不会踩坑。

## Collections 工具类

`java.util.Collections` 提供了一堆静态方法操作集合：

```java
List<Integer> nums = new ArrayList<>(List.of(3, 1, 4, 1, 5, 9, 2, 6));

Collections.sort(nums);                        // 排序
Collections.sort(nums, Comparator.reverseOrder());
Collections.shuffle(nums);                     // 打乱
Collections.reverse(nums);                     // 反转
Collections.swap(nums, 0, 1);                  // 交换

Collections.max(nums);                         // 最大值
Collections.min(nums);                         // 最小值
Collections.frequency(nums, 1);                // 1 出现的次数

Collections.emptyList();                       // 空列表（不可变）
Collections.singletonList("only");             // 单元素列表
Collections.unmodifiableList(nums);            // 只读视图
Collections.synchronizedList(nums);            // 线程安全包装
```

JDK 8+ 很多功能已经被 `List` 自己的方法或 Stream 取代：

```java
nums.sort(Comparator.naturalOrder());          // 等价于 Collections.sort
nums.sort(null);                               // 自然顺序
```

## 综合小例子：图书管理系统

用集合把前面阶段学的东西串起来：

```java title="LibraryService.java"
package com.example.library;

import java.util.*;
import java.util.stream.Collectors;

public class LibraryService {
    // ISBN -> Book 的主索引，O(1) 查找
    private final Map<String, Book> booksByIsbn = new HashMap<>();
    // 分类 -> ISBN 集合，按分类浏览
    private final Map<String, Set<String>> isbnByCategory = new LinkedHashMap<>();
    // 借阅者 -> 已借 ISBN 列表
    private final Map<String, List<String>> borrowedBy = new HashMap<>();

    public void addBook(Book book, String category) {
        booksByIsbn.put(book.getIsbn(), book);
        isbnByCategory
            .computeIfAbsent(category, k -> new LinkedHashSet<>())
            .add(book.getIsbn());
    }

    public Optional<Book> findByIsbn(String isbn) {
        return Optional.ofNullable(booksByIsbn.get(isbn));
    }

    public List<Book> listByCategory(String category) {
        Set<String> isbns = isbnByCategory.getOrDefault(category, Set.of());
        return isbns.stream()
            .map(booksByIsbn::get)
            .filter(Objects::nonNull)
            .toList();
    }

    public boolean borrow(String isbn, String user) {
        Book book = booksByIsbn.get(isbn);
        if (book == null) return false;

        try {
            book.borrow();
        } catch (IllegalStateException e) {
            return false;   // 已被借出
        }

        borrowedBy.computeIfAbsent(user, k -> new ArrayList<>()).add(isbn);
        return true;
    }

    public boolean returnBook(String isbn, String user) {
        Book book = booksByIsbn.get(isbn);
        if (book == null) return false;

        book.returnBook();
        List<String> userBooks = borrowedBy.get(user);
        if (userBooks != null) userBooks.remove(isbn);
        return true;
    }

    public Map<String, Long> countByCategory() {
        return isbnByCategory.entrySet().stream()
            .collect(Collectors.toMap(
                Map.Entry::getKey,
                e -> (long) e.getValue().size()
            ));
    }

    public List<Book> search(String keyword) {
        String lower = keyword.toLowerCase();
        return booksByIsbn.values().stream()
            .filter(b -> b.getTitle().toLowerCase().contains(lower)
                      || b.getAuthor().toLowerCase().contains(lower))
            .toList();
    }
}
```

这个服务用了：

- `HashMap` 做主索引（O(1) 查找）
- `LinkedHashMap` 保持分类插入顺序
- `LinkedHashSet` 每个分类下的书去重
- `computeIfAbsent` 优雅处理"key 不存在时创建集合"
- `Optional` 表示可能不存在的结果
- `Stream` 做过滤、映射、聚合（阶段十详细讲）

## 复习卡片

```java
// List
List<String> list = new ArrayList<>();
list.add("a"); list.add(0, "b");
list.get(0); list.set(0, "c");
list.remove(0); list.remove("a"); list.removeIf(s -> s.isEmpty());
list.size(); list.contains("a"); list.indexOf("a");
list.forEach(System.out::println);

// 不可变
List<String> immutable = List.of("a", "b", "c");

// Set
Set<String> set = new HashSet<>();
set.add("a"); set.remove("a"); set.contains("a");

// Map
Map<String, Integer> map = new HashMap<>();
map.put("a", 1);
map.get("a"); map.getOrDefault("b", 0);
map.containsKey("a"); map.remove("a");
map.computeIfAbsent("k", k -> new ArrayList<>());
map.merge("k", 1, Integer::sum);
map.forEach((k, v) -> ...);

// Queue / Stack（用 ArrayDeque）
Deque<String> q = new ArrayDeque<>();
q.offer("a"); q.poll(); q.peek();      // 队列
q.push("a"); q.pop();                  // 栈

// 排序
Collections.sort(list);
list.sort(Comparator.comparing(User::getName));

// 遍历时删除：只能用 Iterator.remove 或 removeIf
list.removeIf(s -> s.startsWith("a"));
```

**记忆要点**：

- 默认选 `ArrayList` / `HashSet` / `HashMap`，需要顺序选 `Linked*`，需要排序选 `Tree*`
- 队列和栈都用 `ArrayDeque`，别用 `Stack` 和 `LinkedList`
- `List.of()` / `Map.of()` 创建的是**不可变**集合
- 自定义类放进 `HashSet` / `HashMap` **必须重写 `equals` 和 `hashCode`**
- 遍历中删除只能用 `Iterator.remove` 或 `removeIf`，直接 `list.remove` 抛 `ConcurrentModificationException`
- `computeIfAbsent` 是分组场景的瑞士军刀
- `merge(key, 1, Integer::sum)` 是计数的经典写法
- `HashMap` 容量是 2 的幂，负载因子 0.75，链表长度 ≥ 8 转红黑树

下一阶段进入异常处理和泛型，这两块是 Java 里"看着复杂但用起来其实很规整"的东西。
