---
title: '07 · Git Hooks 与质量门禁'
published: 2026-09-30T23:45:00+08:00
description: '为什么靠"自觉"跑 lint 会失败：用 Husky 在 pre-commit 自动触发检查，lint-staged 只对暂存文件检查，配合 eslint/prettier 实现"提交即格式化、带问题提交不进场"。'
tags: [前端工程化, Husky, lint-staged, GitHooks, 质量门禁]
category: 前端工程化学习路线
draft: false
---

## 自觉是不可靠的

规范配好了，但有人忘了跑 lint 就提交，CI 才报错，来回返工。**把检查移到"提交动作那一刻"**——提交前自动跑，过不了就不让提交。

---

## Husky：钩子管家

Husky 让你方便地往 Git 生命周期挂脚本：

```bash
npx husky init
# 在 .husky/pre-commit 写入：
npx lint-staged
```

`pre-commit` 在 `git commit` 执行前触发。如果脚本退出码非 0，提交被中止。

---

## lint-staged：只查改动的文件

全量 lint 在大项目很慢。lint-staged 只对你**本次暂存（staged）的文件**跑检查，速度快、且只格式化你改的：

```js
// .lintstagedrc
{
  "*.{ts,tsx,js}": ["eslint --fix", "prettier --write"],
  "*.css": ["stylelint --fix", "prettier --write"]
}
```

`--fix` 顺便自动修格式问题（如补分号、改引号），提交进来的代码永远是干净的。

---

## 完整防线

```
开发者写代码
  → git commit（Husky pre-commit 触发 lint-staged：格式化+检查）
      ├─ 有问题 → 自动 fix 或报错，提交中止，开发者改完重提
      └─ 通过 → 提交成功
  → push → CI 再跑一遍（lint + typecheck + test + build）
```

本地钩子是第一道，CI 是兜底（有人绕过钩子也能卡住）。

---

## 小结

- 靠自觉跑 lint 必漏，检查要绑到 `pre-commit`。
- Husky 挂钩子，lint-staged 只查暂存文件、快且精准。
- `--fix` 自动格式化，进仓库即干净。
- 本地钩子 + CI 双重防线，质量不靠人。

---

## 练习

1. 给项目加 Husky + lint-staged，提交一个格式乱的文件，观察被自动 fix。
2. 故意提交一个 ESLint 报 error 的代码，确认提交被中止。
3. 解释为什么 CI 还要再跑一遍 lint（钩子可被 `--no-verify` 跳过）。
