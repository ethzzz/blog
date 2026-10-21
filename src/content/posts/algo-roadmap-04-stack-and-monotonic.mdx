---
title: '04 · 栈与单调栈'
published: 2026-10-13T13:00:00+08:00
description: '栈与单调栈高频题：有效括号、下一个更大元素、每日温度、滑动窗口最大值，匹配类与等待类问题的万能解法。'
tags: [算法, 栈, 单调栈, LeetCode]
category: 算法与手写题
draft: false
---

> [!NOTE]
> 栈解决的问题有一个共同气质：**最近的相关性**——最近打开的括号要最先闭合，最近入栈的元素最先被消费。识别出"最近匹配"四个字，这题基本就是栈。

---

## 1. 栈的基本盘：匹配类问题

JS 里用数组模拟栈足够面试用：`push` 入栈、`pop` 出栈、`stack[stack.length - 1]` 看栈顶。

**套路模板**：遇到"需要配对/嵌套"的符号序列，左符号入栈，右符号来时检查栈顶是否匹配。

例题：**有效的括号**（第 02 篇给过字符串视角，这里补全栈视角的两个易错点）：

```ts
function isValid(s: string): boolean {
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  const stack: string[] = [];
  for (const ch of s) {
    if (ch === "(" || ch === "[" || ch === "{") {
      stack.push(ch);
    } else {
      // 易错点 1：栈为空时 pop 返回 undefined，!= 比较恰好得到 false，逻辑仍正确
      if (stack.pop() !== pairs[ch]) return false;
    }
  }
  // 易错点 2：结尾必须栈空，"(((" 这种漏网之鱼靠这一行拦截
  return stack.length === 0;
}
```

**变体：最长有效括号**（32 题，难度陡增但值得会）：求最长的连续有效括号子串长度。用栈存下标，栈底永远放"最后一个未匹配位置"当哨兵：

```ts
function longestValidParentheses(s: string): number {
  let ans = 0;
  const stack: number[] = [-1];        // 哨兵：最后未匹配的下标
  for (let i = 0; i < s.length; i++) {
    if (s[i] === "(") {
      stack.push(i);
    } else {
      stack.pop();
      if (stack.length === 0) {
        stack.push(i);                 // 新的未匹配起点
      } else {
        ans = Math.max(ans, i - stack[stack.length - 1]);
      }
    }
  }
  return ans;
}
```

逐行讲：每次右括号弹栈后，如果栈空了说明这个右括号是"断点"，把自己压进去当哨兵；否则当前有效长度 = 当前下标 − 栈顶（断点）。长度用下标差算，这是栈题里很漂亮的技巧。

---

## 2. 单调栈：为每个元素找"下一个更大"

**套路模板**：单调栈维护一个"从栈底到栈顶递减"的栈。新元素入栈前，把所有比它小的元素弹出来——**被弹出时，就找到了它们的"下一个更大元素"**。

```ts
// 通用模板：对每个元素求右侧第一个更大的元素的下标
function nextGreater(nums: number[]): number[] {
  const ans = new Array(nums.length).fill(-1);
  const stack: number[] = [];          // 存下标，对应的值从底到顶递减
  for (let i = 0; i < nums.length; i++) {
    while (stack.length && nums[i] > nums[stack[stack.length - 1]]) {
      const idx = stack.pop()!;        // nums[i] 就是它的"下一个更大"
      ans[idx] = i;
    }
    stack.push(i);
  }
  // 栈里剩下的元素，右侧没有更大的，保持 -1
  return ans;
}
```

逐行讲：栈里存下标而不是值（因为答案要写回位置）。当前元素比栈顶大时，栈顶的"等待"结束了。每个元素最多入栈一次、出栈一次，总操作 2n 次，所以是 O(n)——**看到"每个元素进出栈最多一次"就能报 O(n)**，这是复杂度追问的标准答案。

例题：**每日温度**。求每天还要等几天才有更高温。

```ts
function dailyTemperatures(temps: number[]): number[] {
  const ans = new Array(temps.length).fill(0);
  const stack: number[] = [];
  for (let i = 0; i < temps.length; i++) {
    while (stack.length && temps[i] > temps[stack[stack.length - 1]]) {
      const idx = stack.pop()!;
      ans[idx] = i - idx;              // 和模板唯一的区别：存天数差
    }
    stack.push(i);
  }
  return ans;
}
```

和通用模板只差一行——答案从"下标"变成"距离"。**单调栈的变体题 90% 只改这一行**，所以模板必须背熟。

---

## 3. 滑动窗口最大值：单调队列登场

**239 题**是单调栈的近亲——单调队列（双向队列）：

```ts
function maxSlidingWindow(nums: number[], k: number): number[] {
  const ans: number[] = [];
  const dq: number[] = [];             // 存下标，对应的值单调递减
  for (let i = 0; i < nums.length; i++) {
    // 1. 队尾弹出所有比当前小的——它们再也不可能当最大值
    while (dq.length && nums[i] >= nums[dq[dq.length - 1]]) dq.pop();
    dq.push(i);
    // 2. 队头过期（滑出窗口）就弹出
    if (dq[0] <= i - k) dq.shift();
    // 3. 窗口成型后，队头就是最大值
    if (i >= k - 1) ans.push(nums[dq[0]]);
  }
  return ans;
}
```

逐行讲：队列里存下标且对应值递减，队头永远是当前窗口最大值。关键洞察在第一步：**比当前元素小的老元素，在当前元素出窗前必然先被更小的位置淘汰，不可能再成为答案**——所以可以放心弹出。这一步的"不可能再当最大值"论证，是面试官最爱追问的点，务必能说出口。

用数组 `shift` 是 O(n)，但每个元素最多进出一次，均摊仍是 O(n)；追求极致可以手写环形队列或用头尾双栈，面试口头说明即可。

---

## 4. 栈在前端场景题里的真身

栈不只是刷题工具，前端场景题也爱考：

**历史记录回退**：浏览器的后退就是两个栈（后退栈 + 前进栈），push 新页面清空前进栈。

**表达式求值 / 计算器**（227 题）：数字栈 + 运算符栈，遇到更高优先级先算栈里的。前端偶尔考简化版"只含加减乘除"。

**函数调用栈与尾递归**：面试官聊到栈，常追问"递归会不会爆栈"。答案是：深度超过调用栈上限（V8 约 1 万层）就爆，改循环或用 `setTimeout` 拆帧可解——能自然引出这个话题，比背栈定义高级得多。

---

## 小结

- 匹配类：左入右查，结尾验栈空；最长有效括号用下标哨兵算长度。
- 单调栈：递减栈，弹出即得"下一个更大"，每元素进出一次所以 O(n)。
- 滑动窗口最大值：单调队列，队头即最大值，"小的必然先淘汰"是核心论证。
- 场景联想：回退记录、计算器、递归爆栈，都是栈的变装。

---

## 练习（LeetCode 同类题清单）

1. 20. 有效的括号 —— 匹配类入门。
2. 1047. 删除字符串中的所有相邻重复项 —— 栈匹配变体。
3. 739. 每日温度 —— 单调栈必做。
4. 496. 下一个更大元素 I —— 模板直用。
5. 42. 接雨水 —— 单调栈经典难题，能讲清两种解法更佳。
6. 239. 滑动窗口最大值 —— 单调队列必做。
