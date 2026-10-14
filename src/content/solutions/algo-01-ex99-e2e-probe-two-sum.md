---
title: '链路验收（临时）· 两数之和'
published: 2026-10-14
description: '链路验收临时记录，验证后即回滚。'
module: 'algo'
relatedPost: 'algo-roadmap-01-complexity-and-two-pointers'
order: 99
difficulty: '简单'
tags: ['算法', '哈希表', '临时']
draft: false
lang: 'zh-CN'
---
## 题目

给定一个整数数组 `nums` 和目标值 `target`，找出和为 `target` 的两个数。

## 思路

用哈希表把「已遍历过的值 → 下标」记下来，一次遍历即可。

![示意图](/blog/images/solutions/algo-01-ex99-e2e-probe-two-sum-1.png)

## 代码

```js
function twoSum(nums, target) {
  const m = new Map()
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]
    if (m.has(need)) return [m.get(need), i]
    m.set(nums[i], i)
  }
  return []
}
```

## 复杂度

时间 O(n)，空间 O(n)。
