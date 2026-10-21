---
title: '06 · 代码规范（ESLint / Prettier / Stylelint）'
published: 2026-09-30T23:30:00+08:00
description: 'ESLint 查"代码问题"（潜在 bug、坏味道），Prettier 管"格式美观"，两者职责分离如何避免冲突；Stylelint 管 CSS；以及一套能落地的团队规范配置。'
tags: [前端工程化, ESLint, Prettier, Stylelint, 代码规范]
category: 前端工程化学习路线
draft: false
---

## 规范不是束缚，是"别再为风格吵架"

团队里最无意义的消耗就是评审时争论"该不该加分号、缩进几格"。规范把这些问题**自动化**：机器统一格式，人只评审逻辑。

---

## ESLint：查问题，不是管格式

ESLint 通过规则检查**代码正确性**：未声明变量、用了 `var`、no-fallthrough、潜在的内存泄漏等。

```js
// .eslintrc
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  "rules": { "no-var": "error", "no-unused-vars": "warn" }
}
```

配合 `@typescript-eslint`，TS 项目能查到类型相关坏味道（如 `any` 滥用、不必要的非空断言）。

---

## Prettier：只管格式

Prettier 不关心逻辑，只统一**排版**：换行、引号、尾逗号、缩进。它和 ESLint 有重叠（如引号规则），所以**关掉 ESLint 里所有格式类规则**，交给 Prettier，避免打架。

```js
// .prettierrc
{ "semi": true, "singleQuote": true, "printWidth": 80 }
```

---

## Stylelint：CSS 的健康检查

```css
/* 规则：禁止无效颜色、要求简写顺序等 */
a { color: #FFF; }
```

`stylelint-config-standard` 提供一套合理默认，管住 CSS/SCSS 的常见错误。

---

## 落地清单

- ESLint 查逻辑问题，`prettier` 管格式，两者用 `eslint-config-prettier` 关掉冲突规则。
- 编辑器保存时自动 fix（format on save）。
- 提交前用 Git Hooks 跑 lint（下篇讲），CI 再卡一道。

---

## 小结

- ESLint = 代码正确性；Prettier = 格式美观；Stylelint = CSS 规范。
- ESLint 的格式规则全交给 Prettier，避免冲突。
- 规范自动化后，评审聚焦逻辑而非风格。

---

## 练习

1. 给项目配 ESLint + Prettier，并加 `eslint-config-prettier` 关闭冲突规则。
2. 故意写一个 `var x = 1` 和未使用变量，运行 lint 看报错级别（error/warn）。
3. 在编辑器里开启 format on save，体验保存即统一格式。
