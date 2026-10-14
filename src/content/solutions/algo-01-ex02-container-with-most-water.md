---
title: "LeetCode 11 · 盛最多水的容器：为什么要移动矮的那一侧"
published: 2026-10-14
description: "盛水容器是对撞指针最经典的『为什么这样移动』证明题。难点不在代码，在于你能不能一句话把理由讲清楚。"
module: "algo"
relatedPost: "algo-roadmap-01-complexity-and-two-pointers"
order: 2
difficulty: "中等"
tags: ["算法", "对撞指针", "LeetCode", "数组"]
lang: "zh-CN"
---

## 题目

给定一个长度为 `n` 的整数数组 `height`。选两条垂线 `i` 和 `j`（`i < j`），它们与 x 轴构成的容器能装的水量为：

```
面积 = (j - i) × min(height[i], height[j])
```

求能装的最大水量。

```
输入：height = [1,8,6,2,5,4,8,3,7]
输出：49
```

## 思路

同样从两头出发，`left = 0`、`right = n - 1`。每次算完面积后，**移动高度较小的那一侧**。

关键在于为什么。设当前 `height[left] < height[right]`，面积受限于矮的左侧：

- 如果移动**右侧**（高的那侧）：宽度必然减 1；而新的高度上限仍然是 `min(height[left], height[right'])` —— 因为左侧那个矮柱子还在，`min` 不可能超过 `height[left]`。**宽变小、高不增，面积必然不增**，这一整批候选可以一次性排除。
- 如果移动**左侧**（矮的那侧）：宽度同样减 1，但换进来的是一根未知高度的新柱子，**有可能**更高，从而让 `min` 变大。这个方向才有希望。

所以每一步移动矮侧是"唯一还可能存在更优解的方向"，其余全部被排除，n 步内必然收敛。

## 代码

```ts
function maxArea(height: number[]): number {
	let left = 0;
	let right = height.length - 1;
	let best = 0;

	while (left < right) {
		const h = Math.min(height[left], height[right]);
		const w = right - left;
		best = Math.max(best, h * w);

		// 移动矮的一侧：高的那侧留着，才可能撑起更大的 min
		if (height[left] < height[right]) {
			left++;
		} else {
			right--;
		}
	}

	return best;
}
```

注意 `else` 分支里包含了**相等**的情况——相等时移动哪边都不影响正确性（两边都不会更优），随便选一边保持循环推进即可，不需要特判。

## 复杂度

- 时间 **O(n)**：双指针合计移动 n 次
- 空间 **O(1)**

## 复盘

这道题的代码只有十几行，但面试里真正的分水岭是那句"为什么要移动矮的"。我见过太多人能写出正确代码，被追问一句"为什么不是移动高的"就卡住。

把话术背下来（原文在路线第 01 篇里也强调过）：

> 面积由矮的一侧决定。移动高的一侧，宽度一定减小，而高度上限还是被那根矮柱子卡住，所以面积不可能变大；只有换掉矮柱子，才可能抬高 `min`，值得尝试。

它和第 42 题「接雨水」是同一套"短板决定上限"的直觉，只是一个求最大、一个求总量。能把这两题串起来讲，比单独做对任何一道都值钱。
