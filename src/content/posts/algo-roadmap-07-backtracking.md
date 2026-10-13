---
title: '07 · 回溯：排列、组合、子集三板斧'
published: 2026-10-13T16:00:00+08:00
description: '回溯算法模板：排列/组合/子集三大模板、剪枝技巧与去重套路，一棵决策树讲透所有回溯题。'
tags: [算法, 回溯, 剪枝, LeetCode]
category: 算法与手写题
draft: false
---

> [!NOTE]
> 回溯听起来吓人，本质就是**带后悔功能的暴力枚举**：做选择 → 递归 → 撤销选择。所有回溯题都是一棵"决策树"，三板斧模板覆盖 90% 的考题。

---

## 1. 回溯的骨架：一棵决策树

所有回溯题共享同一个骨架：

```ts
const res: T[] = [];
const path: T[] = [];

function backtrack(选择列表, depth): void {
  if (满足结束条件) {              // 到达叶子
    res.push([...path]);           // ⚠️ 必须拷贝，path 是共享引用
    return;
  }
  for (const choice of 选择列表) {
    path.push(choice);             // 做选择：进入树的下一层
    backtrack(下一层的选择列表);
    path.pop();                    // 撤销选择：回到本层试下一种
  }
}
```

三个铁律，每个都值一分面试印象分：

1. **收集结果必须 `[...path]` 拷贝**——`path` 全程是同一个数组，直接 push 会收集到空壳，这是回溯题第一大坑。
2. **pop 必须和 push 配对**——漏了 pop，状态就回不去。
3. **for 循环 = 同层的分支，递归 = 向下一层**——画决策树时永远想清楚"层"在哪。

---

## 2. 子集：每个节点都要收集

**78 题 子集**：输入 `[1,2,3]`，输出所有子集。特点：**每个走过的节点都是一个答案**，不需要结束条件。

```ts
function subsets(nums: number[]): number[][] {
  const res: number[][] = [];
  const path: number[] = [];
  const start = { v: 0 };                       // 用 start 控制不回头选

  function backtrack(startIdx: number): void {
    res.push([...path]);                        // 每个节点都是子集
    for (let i = startIdx; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1);                         // i+1：下一层只能选更后面的
      path.pop();
    }
  }
  backtrack(0);
  return res;
}
```

逐行讲：`startIdx` 是子集/组合类回溯的灵魂——**只允许往后选，天然防重复**。如果传 `0` 不传 `i + 1`，就会把 `[1,2]` 和 `[2,1]` 当成两个子集。

**变体：元素可重复的子集**（90 题）。先排序，同层跳过相同值：

```ts
// nums 已排序
for (let i = startIdx; i < nums.length; i++) {
  if (i > startIdx && nums[i] === nums[i - 1]) continue;  // 同层去重
  path.push(nums[i]);
  backtrack(i + 1);
  path.pop();
}
```

`i > startIdx` 的含义：`i === startIdx` 是本层第一个分支，允许选；后面的重复值是"同一层的孪生分支"，剪掉。**树层去重 vs 分支内重复**这个区分是 90 题的核心考点，面试时画出"同层剪枝"的决策树，比代码本身更打动人。

---

## 3. 组合：凑够 k 个才收集

**77 题 组合**：从 n 个数里选 k 个。与子集唯一的区别——**只在叶子收集**。

```ts
function combine(n: number, k: number): number[][] {
  const res: number[][] = [];
  const path: number[] = [];

  function backtrack(startIdx: number): void {
    if (path.length === k) {                 // 凑够 k 个才收集
      res.push([...path]);
      return;
    }
    for (let i = startIdx; i <= n; i++) {
      path.push(i);
      backtrack(i + 1);
      path.pop();
    }
  }
  backtrack(1);
  return res;
}
```

**剪枝版**只需改循环上界：还缺 `need = k - path.length` 个数，而 `[i, n]` 只剩 `n - i + 1` 个可选，所以 `n - i + 1 >= need`，即 `i <= n - need + 1`：

```ts
const need = k - path.length;
for (let i = startIdx; i <= n - need + 1; i++) { ... }
```

剪枝不改变答案，只是砍掉"必然后悔"的分支。面试里能把剪枝条件推导说出来（而不是背 `n - need + 1`），是"会思考"的直接证据。

---

## 4. 排列：used 数组代替 startIdx

**46 题 全排列**：`[1,2,3]` 的所有排列。与组合的根本区别：**顺序有意义，每层都能重新从头选**，所以不能靠 startIdx，改用 `used` 标记：

```ts
function permute(nums: number[]): number[][] {
  const res: number[][] = [];
  const path: number[] = [];
  const used: boolean[] = new Array(nums.length).fill(false);

  function backtrack(): void {
    if (path.length === nums.length) {
      res.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue;              // 已在当前排列里，跳过
      used[i] = true;
      path.push(nums[i]);
      backtrack();
      path.pop();                          // ⚠️ pop 和 used 重置都要做
      used[i] = false;
    }
  }
  backtrack();
  return res;
}
```

逐行讲：`used[i]` 防止同一分支里重复用同一个元素；循环从 0 开始所以 `[1,2]` 和 `[2,1]` 都能出现。撤销时 `pop` 和 `used[i] = false` **缺一不可**。

**变体：可重复的全排列**（47 题）。排序 + `used[i-1] === false && nums[i] === nums[i-1]` 跳过——保证相同元素"只能按原顺序被选入"，同层去重的另一种表达。这三题（78→90、77→剪枝、46→47）就是三板斧各自的进阶版，建议两两对照着做。

---

## 5. 前端场景里的回溯

回溯在前端面试偶尔以场景题出现：

- **菜单/文件树的所有路径枚举**：递归组件里收集路径，本质是子集/路径回溯。
- **正则匹配的回溯灾难**：`/(a+)+b/` 匹配长字符串会指数级回溯，导致 ReDoS——能从"回溯算法"的角度解释这个安全漏洞，是前端工程师聊回溯的独特切入点。
- **CSS 选择器优先级冲突排查、嵌套路由匹配**：都是"尝试 + 撤销"的思想。

---

## 小结

- 回溯骨架：for 同层分支、递归下一层、push/pop 配对、收集必拷贝。
- 子集：每个节点收集；组合：叶子收集 + 剪枝上界；排列：used 数组。
- 去重：排序后 `i > startIdx && nums[i] === nums[i-1]` 同层剪枝。
- 复杂度口径：子集/组合 O(2ⁿ)、排列 O(n!)，面试说"决策树的节点数"就对了。

---

## 练习（LeetCode 同类题清单）

1. 78. 子集 —— 每个节点收集，必做。
2. 77. 组合 —— 叶子收集 + 剪枝推导。
3. 46. 全排列 —— used 数组，必做。
4. 90. 子集 II —— 同层去重。
5. 47. 全排列 II —— 排序 + used 去重。
6. 39. 组合总和 —— 元素可重复选（backtrack(i) 而非 i+1）。
7. 22. 括号生成 —— 左右括号计数剪枝。
