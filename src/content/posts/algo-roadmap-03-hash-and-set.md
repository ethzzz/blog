---
title: '03 · 哈希表与集合'
published: 2026-10-15T12:00:00+08:00
description: '哈希表与集合高频题：两数之和家族、字符统计、字母异位词分组，以及缓存思想在前端场景题中的应用。'
tags: [算法, 哈希表, LeetCode, 空间换时间]
category: 算法与手写题
draft: false
---

> [!NOTE]
> 哈希表的核心思想就一句话：**用 O(n) 空间换 O(n) 查找**。它可能是面试里最常用的"降复杂度武器"——凡是看到"找配对""数次数""判重复"，第一反应就该是它。

---

## 1. 两数之和家族：哈希的一次遍历

两数之和是面试出场率天花板级的题，先看暴力为什么不行：

```ts
// 暴力 O(n²)：每个数都和别人配一次对
for (let i = 0; i < nums.length; i++)
  for (let j = i + 1; j < nums.length; j++)
    if (nums[i] + nums[j] === target) return [i, j];
```

**套路模板**：遍历时问自己一个问题——"我要找的另一半出现过吗？"把答案存进 Map。

```ts
function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>();    // 值 -> 下标
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];           // 我需要的另一半
    if (seen.has(need)) return [seen.get(need)!, i];
    seen.set(nums[i], i);                    // 先查后存，避免用到自己
  }
  return [];
}
```

逐行讲：每到一个新元素，先查"伴侣"是否在 `seen` 里，在就直接返回；不在才把自己存进去。**先查后存**这个顺序很关键——如果先存后查，`target` 是当前元素两倍时会错误地匹配到自己。

**家族成员**（套路完全一致，只是存的东西变了）：

- 两数之和 II（有序版）：用第 01 篇的对撞指针更优，O(1) 空间——面试官常拿这题考察你能不能根据"有序"换方案。
- 三数之和：排序 + 固定一个数 + 对撞指针，O(n²)。
- 最长连续序列（128 题）：把数组丢进 Set，只从"序列起点"（即 `x-1` 不在 Set 中）开始往后数。

```ts
function longestConsecutive(nums: number[]): number {
  const set = new Set(nums);
  let ans = 0;
  for (const x of set) {
    if (set.has(x - 1)) continue;      // 不是起点，跳过
    let len = 1;
    while (set.has(x + len)) len++;    // 从起点往后数
    ans = Math.max(ans, len);
  }
  return ans;
}
```

"只从起点开始数"这个剪枝保证了每个元素最多被访问两次，整体 O(n)——这是 Set 题 里最值得背的一个模板。

---

## 2. 字符统计：计数的三种写法

**套路模板**：对象、Map、定长数组都能当计数器，按场景选。

```ts
function charCount(s: string): Record<string, number> {
  const count: Record<string, number> = {};
  for (const ch of s) count[ch] = (count[ch] ?? 0) + 1;
  return count;
}
```

注意 `for...of` 走的是码点，`for...in` 走的是索引——遍历字符串统计字符**永远用 `for...of`**，中文 emoji 场景会感谢你。

例题：**有效的字母异位词**。两个字符串字符及次数完全相同。

```ts
function isAnagram(s: string, t: string): boolean {
  if (s.length !== t.length) return false;
  const count = new Map<string, number>();
  for (const ch of s) count.set(ch, (count.get(ch) ?? 0) + 1);
  for (const ch of t) {
    const c = count.get(ch);
    if (!c) return false;              // 没有 or 已耗尽
    count.set(ch, c - 1);
  }
  return true;
}
```

逐行讲：先给 `s` 计数，再用 `t` 做减法。长度相等 + 每次减法都成功，等价于完全匹配。这题还有个进阶版 **字母异位词分组**（49 题）：把"排序后的字符串"当 Map 的 key，异位词自然归为一组——**用规范化结果做 key** 是哈希题的一个万能思路。

---

## 3. 判重复与去重：Set 的主场

判重复用 Set，O(1) 查询：

```ts
// 存在重复元素
function hasDuplicate(nums: number[]): boolean {
  return new Set(nums).size !== nums.length;
}
```

这行代码值得背——构造 Set 自动去重，比较 size 就知道有没有重复。**最长无重复字符子串**（第 3 题，字符串题高频王）是滑动窗口 + Set 的组合，这里先给一个 Set 版本：

```ts
function lengthOfLongestSubstring(s: string): string {
  const window = new Set<string>();
  let l = 0, ans = 0;
  for (let r = 0; r < s.length; r++) {
    while (window.has(s[r])) {
      window.delete(s[l]);             // 右边撞车，左边收缩
      l++;
    }
    window.add(s[r]);
    ans = Math.max(ans, r - l + 1);
  }
  return ans;
}
```

逐行讲：`window` 维护当前无重复的子串。右指针每进一个字符，如果撞车，就不停从左边删直到不撞。每个字符最多进出窗口各一次，O(n)。这题还有用 Map 记下标的优化版（一步跳到位不逐个删），面试官追问时可以主动提。

---

## 4. 缓存思想：哈希在前端场景题里的真身

哈希思想在前端无处不在，面试的场景题也爱考：

**接口请求去重**——同一接口短时间重复触发只发一次请求：

```ts
const pending = new Map<string, Promise<unknown>>();

function onceRequest(url: string, fn: () => Promise<unknown>) {
  if (!pending.has(url)) {
    const p = fn().finally(() => pending.delete(url));
    pending.set(url, p);
  }
  return pending.get(url)!;            // 复用同一个 Promise
}
```

**LRU 缓存**（LeetCode 146，前端高频）：`Map` 天然保持插入顺序，配合 `delete + set` 实现"访问即置新"：

```ts
class LRUCache {
  private map = new Map<number, number>();
  constructor(private cap: number) {}

  get(key: number): number {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key)!;
    this.map.delete(key);              // 删掉再放，移到"最新"位置
    this.map.set(key, val);
    return val;
  }

  set(key: number, val: number): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, val);
    if (this.map.size > this.cap) {
      this.map.delete(this.map.keys().next().value!);  // Map 第一个 key 即最旧
    }
  }
}
```

`Map` 迭代顺序 = 插入顺序，第一个 key 就是最久未使用的——这个语言特性让 LRU 从"手写双向链表"降维成十行代码，是 JS 面试的经典福利题。

---

## 小结

- 哈希核心：空间换时间，"找配对 / 数次数 / 判重复"三句话识别哈希题。
- 两数之和：先查后存；最长连续序列：只从起点数。
- 字符统计：`for...of` + `?? 0 + 1`；异位词分组用规范化结果做 key。
- 场景题：请求去重、LRU 缓存都是哈希思想的变装，Map 的插入顺序是 JS 特有福利。

---

## 练习（LeetCode 同类题清单）

1. 1. 两数之和 —— 先查后存模板，必做。
2. 217. 存在重复元素 —— 一行 Set。
3. 242. 有效的字母异位词 —— 计数减法。
4. 49. 字母异位词分组 —— 规范化做 key。
5. 128. 最长连续序列 —— 起点剪枝，必做。
6. 3. 无重复字符的最长子串 —— 滑动窗口 + Set。
7. 146. LRU 缓存 —— 用 Map 插入顺序实现。
