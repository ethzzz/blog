---
title: '06 · 二叉树与递归套路'
published: 2026-10-13T15:00:00+08:00
description: '二叉树高频题套路：前中后序递归、层序 BFS、最大深度家族，一个"拆成左右子树"的万能思考框架。'
tags: [算法, 二叉树, 递归, BFS]
category: 算法与手写题
draft: false
---

> [!NOTE]
> 二叉树题的万能思考框架只有一句话：**整棵树的问题 = 处理根节点 + 左子树的问题 + 右子树的问题**。会这句话，前中后序只是"根在什么时候被处理"的区别。

---

## 1. 递归三部曲与三种遍历

写树的递归，先固定三件事（类似回溯的套路化）：

1. **递归函数的参数和返回值是什么**——返回值通常携带"子树的信息"。
2. **终止条件是什么**——90% 的题是 `if (!root) return ...`。
3. **单层逻辑是什么**——拿到左右子树的结果，拼出当前层的答案。

三种遍历只是"处理根的时机"不同：

```ts
interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

// 前序：根 -> 左 -> 右（进入节点时处理）
function preorder(root: TreeNode | null, res: number[] = []): number[] {
  if (!root) return res;
  res.push(root.val);            // 根先
  preorder(root.left, res);
  preorder(root.right, res);
  return res;
}

// 中序：左 -> 根 -> 右（BST 中序即升序，必背性质）
function inorder(root: TreeNode | null, res: number[] = []): number[] {
  if (!root) return res;
  inorder(root.left, res);
  res.push(root.val);            // 根中
  inorder(root.right, res);
  return res;
}

// 后序：左 -> 右 -> 根（需要子树信息时用，见下文最大深度）
function postorder(root: TreeNode | null, res: number[] = []): number[] {
  if (!root) return res;
  postorder(root.left, res);
  postorder(root.right, res);
  res.push(root.val);            // 根后
  return res;
}
```

**选遍历的口诀**：需要"先知道子树才能决定根" → 后序（如求高度、判断平衡）；需要"边走边收集且顺序敏感" → 前序（如路径收集）；涉及 BST 的有序性 → 中序。记住这个口诀，选题型的速度会快很多。

---

## 2. 深度家族：自底向上收集子树信息

**最大深度**（104 题）是后序套路的标准样板：

```ts
function maxDepth(root: TreeNode | null): number {
  if (!root) return 0;                          // 终止：空树深度 0
  const l = maxDepth(root.left);                // 左子树深度
  const r = maxDepth(root.right);               // 右子树深度
  return Math.max(l, r) + 1;                    // 当前层 = max(左,右) + 1
}
```

逐行讲：不关心遍历顺序，只关心"左右子树把答案给我，我 +1 返回"。这就是后序的价值——**答案依赖子树结果**。

**家族变体**（都改最后一行）：

```ts
// 最小深度（111 题）：注意"一边为空不算较短"
function minDepth(root: TreeNode | null): number {
  if (!root) return 0;
  const l = maxDepthLike(root.left), r = maxDepthLike(root.right);
  if (!root.left) return r + 1;    // 单边空要取另一边！
  if (!root.right) return l + 1;
  return Math.min(l, r) + 1;
}
// maxDepthLike 即 maxDepth 的实现
```

最小深度的坑：只有一个孩子的节点，最小深度不是 1 而是沿非空边走到底——**单边为空必须特判**，这是 111 题唯一的考点。

**平衡二叉树**（110 题）：返回"高度"，不满足平衡时返回 -1 当信号：

```ts
function isBalanced(root: TreeNode | null): boolean {
  return height(root) !== -1;
}
function height(node: TreeNode | null): number {
  if (!node) return 0;
  const l = height(node.left);
  if (l === -1) return -1;                     // 提前短路
  const r = height(node.right);
  if (r === -1) return -1;
  return Math.abs(l - r) > 1 ? -1 : Math.max(l, r) + 1;
}
```

用 -1 做"失败信号"把判断平衡和求高度合并进一次递归，O(n)——比"对每个节点再调 maxDepth"的 O(n²) 暴力版高一个档次，面试主动对比这两个复杂度很加分。

---

## 3. 层序 BFS：队列 + 按层取数

**套路模板**：队列 + 记录每层节点数，逐层处理。

```ts
function levelOrder(root: TreeNode | null): number[][] {
  if (!root) return [];
  const res: number[][] = [];
  const queue: TreeNode[] = [root];
  while (queue.length) {
    const size = queue.length;               // 本层节点数，先锁定
    const level: number[] = [];
    for (let i = 0; i < size; i++) {         // 只消费本层
      const node = queue.shift()!;
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    res.push(level);
  }
  return res;
}
```

逐行讲：`size = queue.length` 必须在 for 循环**外**取——循环里会 push 下一层节点，边取边变就乱了。这个"锁定层大小"是 BFS 模板最经典的易错点。

层序模板是大量变体题的地基，改动都发生在"level 怎么用"：

- **锯齿形层序**（103 题）：层号奇偶决定 `level.reverse()` 或 `unshift`。
- **右视图**（199 题）：每层只取最后一个节点 `level[size - 1]`。
- **最大宽度**（662 题）：给节点编号（`i` 的孩子是 `2i+1`、`2i+2`），每层宽度 = 首尾编号差。

面试里"层序遍历 + 一个小改动"的组合出场率极高，模板背熟后基本是送分题。

---

## 4. 对称、翻转与最近公共祖先

**翻转二叉树**（226 题，"谷歌面试官不会写"梗题）：每个节点交换左右孩子，先序或后序都行：

```ts
function invertTree(root: TreeNode | null): TreeNode | null {
  if (!root) return null;
  [root.left, root.right] = [root.right, root.left];   // 处理根
  invertTree(root.left);                                // 左
  invertTree(root.right);                               // 右
  return root;
}
```

**对称二叉树**（101 题）：把"一个树的对称"转化为"两个树互相镜像"：

```ts
function isSymmetric(root: TreeNode | null): boolean {
  const mirror = (a: TreeNode | null, b: TreeNode | null): boolean => {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.val === b.val
      && mirror(a.left, b.right)      // a 的左 vs b 的右
      && mirror(a.right, b.left);     // a 的右 vs b 的左
  };
  return mirror(root, root);
}
```

**最近公共祖先**（236 题，中高频）：后序的经典应用——左右子树的结果决定根的答案：

```ts
function lowestCommonAncestor(
  root: TreeNode | null, p: TreeNode, q: TreeNode
): TreeNode | null {
  if (!root || root === p || root === q) return root;   // 命中目标或走到头
  const l = lowestCommonAncestor(root.left, p, q);
  const r = lowestCommonAncestor(root.right, p, q);
  if (l && r) return root;        // p、q 分居两侧 => 当前根即 LCA
  return l ?? r;                  // 只有一侧命中，继续上传
}
```

逐行讲：递归含义定义为"这棵子树里 p 或 q 的存在情况"。左右都命中说明 p、q 在两侧，当前节点就是最近公共祖先；否则把命中的那一侧继续上传。这题是"递归函数返回值设计"的最佳教材——**把返回值定义成'携带信息'而不是'最终答案'**，是递归进阶的关键一步。

---

## 小结

- 递归三部曲：定返回值、定终止条件、定单层逻辑；三种遍历 = 根的处理时机。
- 深度家族：后序"子树给答案我 +1"；最小深度单边空要特判；平衡树用 -1 信号短路。
- 层序 BFS：锁定每层 size 再消费；右视图、锯齿形都只改 level 的用法。
- LCA：返回值携带"命中信息"，左右都命中则当前是祖先。

---

## 练习（LeetCode 同类题清单）

1. 104. 二叉树的最大深度 —— 后序样板，必做。
2. 226. 翻转二叉树 —— 前序处理根。
3. 101. 对称二叉树 —— 双参数镜像递归。
4. 102. 层序遍历 —— BFS 模板，必做。
5. 199. 二叉树的右视图 —— 层序取每层最后一个。
6. 110. 平衡二叉树 —— -1 信号短路。
7. 236. 二叉树的最近公共祖先 —— 返回值携带信息。
