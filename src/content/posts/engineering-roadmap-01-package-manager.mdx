---
title: '01 · 包管理器'
published: 2026-09-30T19:00:00+08:00
description: 'npm / yarn / pnpm 的差异与选型，lockfile 为什么必须提交，语义化版本（^ ~ *）的陷阱，依赖类型 dependencies/devDependencies/peerDependencies 的正确划分。'
tags: [前端工程化, npm, pnpm, lockfile, 语义化版本]
category: 前端工程化学习路线
draft: false
---

## 一次"只在我机器上能跑"的事故

新人没提交 `package-lock.json`，别人 `npm install` 装到了 `lodash` 的一个小版本更新，某个 API 行为变了，本地正常、CI 红。根因：**没有 lockfile，依赖树不可复现**。

---

## 三大包管理器

| 工具 | 特点 | 适用 |
| --- | --- | --- |
| `npm` | 自带、最稳 | 通用 |
| `yarn` | 早期快、workspace 支持 | 老项目 |
| `pnpm` | 硬链接+内容寻址，**省磁盘、严格**（不扁平化 node_modules） | 现代项目/Monorepo 首选 |

`pnpm` 的"非扁平" node_modules 能**杜绝幽灵依赖**（没声明却能被 import），这是它最大的工程价值。

---

## lockfile 必须提交

- `package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` 锁定了**精确版本与依赖树**。
- 提交它 → 所有人、CI 装到完全一致的结果，**可复现构建**。
- 装依赖用 `npm ci`（基于 lock 干净安装），比 `npm install` 更快更严格，CI 必用。

---

## 版本号语义

```json
"lodash": "^1.2.3"  // 允许 1.x.x 中 >=1.2.3（不含 2.0.0）
"react": "~18.2.0"  // 允许 18.2.x
"vue": "*"          // 任意版本（危险，别用）
```

`^` 只升 minor/patch，major 不升——这是"不破坏兼容性"的约定。但即使是 `^`，lockfile 仍应锁死，避免意外。

---

## 依赖类型

- **dependencies**：运行时需要（如 React、lodash）。
- **devDependencies**：仅开发/构建需要（如 vite、eslint、typescript）。
- **peerDependencies**："宿主项目应提供"的（如插件声明它需要的 React 版本，避免重复打包）。

分错类型会导致：生产包过大，或 peer 冲突。

---

## 小结

- 选型现代项目优先 `pnpm`（省空间、防幽灵依赖）。
- **lockfile 必提交**，CI 用 `npm ci` / `pnpm install --frozen-lockfile`。
- 版本用 `^`/`~`，别用 `*`；lockfile 兜底精确性。
- 依赖按 运行/开发/peer 三类正确划分。

---

## 练习

1. 初始化一个 pnpm 项目，观察 `node_modules/.pnpm` 结构，解释"硬链接+非扁平"如何防幽灵依赖。
2. 删掉 lockfile 重新 `install`，对比 `package.json` 与 lock 的版本差异。
3. 把一个依赖从 devDependencies 误放进 dependencies，说明对生产构建体积的影响。
