---
title: "LeetCode 167 · 两数之和 II：有序数组为什么不用哈希表"
published: 2026-10-14
description: "两数之和 II 的对撞指针解法。关键是想明白：有序性给出的信息比哈希表更强，能把空间从 O(n) 压到 O(1)。"
module: "algo"
relatedPost: "algo-roadmap-01-complexity-and-two-pointers"
order: 1
difficulty: "简单"
tags: ["算法", "对撞指针", "LeetCode", "数组"]
lang: "zh-CN"
---

## 题目

给你一个下标从 **1 开始**、已按 **非递减顺序** 排列的整数数组 `numbers`，请你找出两个数，使它们的和等于 `target`，返回这两个数的下标（1-based）。题目保证有且只有一个解，且**不能重复使用同一个元素**。

```
输入：numbers = [2,7,11,15], target = 9
输出：[1,2]
```

## 思路：两个指针从两头往中间挤

取最左 `left = 0`、最右 `right = n - 1`，看两者之和：

- 和**正好等于** target → 找到了，返回 `[left + 1, right + 1]`
- 和**小于** target → 说明当前太小，需要换个更大的数。如果把 `right` 往左移，和只会更小，所以只能**右移 `left`**
- 和**大于** target → 对称地，只能**左移 `right`**

每一步都确定地排除掉一整行/一整列候选，所以最多走 n 步就必然相遇。

```
numbers = [2,7,11,15], target = 9

left=0, right=3:  2 + 15 = 17 > 9   → right--
left=0, right=2:  2 + 11 = 13 > 9   → right--
left=0, right=1:  2 + 7  = 9  ✓    → 返回 [1,2]
```

## 代码

```ts
function twoSum(numbers: number[], target: number): number[] {
	let left = 0;
	let right = numbers.length - 1;

	while (left < right) {
		const sum = numbers[left] + numbers[right];
		if (sum === target) return [left + 1, right + 1];
		if (sum < target) {
			left++;
		} else {
			right--;
		}
	}

	// 题目保证有解，实际工程里这里应该抛出错误而不是静默返回
	throw new Error("no solution");
}
```

## 复杂度

- 时间 **O(n)**：两个指针合计最多移动 n 次，每次 O(1)
- 空间 **O(1)**：只用两个变量，与输入规模无关

## 复盘

这道题是「两数之和 I」（第 1 题）的有序版本，很多人会顺手把哈希表的解法搬过来——能过，但**浪费了题目给的最强条件**。

哈希表解法是 O(n) 时间 + O(n) 空间，它对数组有没有序**完全不敏感**，也就是说它没吃到"有序"这个红利。而对撞指针把空间压到了 O(1)。

这背后是一条通用判断：**遇到有序数组上的查找问题，先想双指针，再想哈希表**。前者能利用单调性做"排除式搜索"，后者只是暴力枚举的记忆化。

顺带一句工程上的提醒：真实代码里别写 `return [-1, -1]` 这种"假成功"。找不到就抛错或者返回 `null`，让调用方无法假装一切正常——这是我在业务代码里踩过的坑，静默返回哨兵值会让 bug 平均晚两天才被发现。
