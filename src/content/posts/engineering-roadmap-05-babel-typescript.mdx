---
title: '05 · Babel 与 TypeScript 编译'
published: 2026-09-30T23:00:00+08:00
description: 'Babel 的定位（语法降级，不类型检查）与 preset 机制，TypeScript 的两种编译路径（tsc 做类型检查、esbuild/babel 只转译），以及"类型检查"与"转译"必须分离的工程常识。'
tags: [前端工程化, Babel, TypeScript, 转译, tsc]
category: 前端工程化学习路线
draft: false
---

## Babel 做什么、不做什么

Babel 只做一件事：**把新语法转成旧语法**（语法降级），让老浏览器能跑。它**不做类型检查**——`const x: number` 里的 `: number` 被它直接丢掉，但类型错误它发现不了。

```js
// .babelrc
{ "presets": ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"] }
```

`preset-env` 按目标浏览器决定降级到什么程度；`preset-typescript` 只剥离类型注解。

---

## TypeScript 的两条路径

| 路径 | 谁负责 | 类型检查 | 转译速度 |
| --- | --- | --- | --- |
| `tsc` | TypeScript 官方 | ✅ 做 | 慢 |
| `esbuild` / `babel` | 转译器 | ❌ 不做 | 极快 |

---

## 关键工程常识：检查与转译分离

最佳实践（现代前端标配）：

```bash
vite build          # 用 esbuild/rollup 转译，极快，不检查类型
tsc --noEmit        # 单独跑类型检查，不参与打包
```

**绝不让打包器既转译又类型检查**——前者要快，后者要严，职责分开各取所长。CI 里 `tsc --noEmit` 失败就阻断合并。

---

## 为什么不是"用 tsc 打包"

`tsc` 只转译+检查，**不会**做打包（处理 CSS/图片/拆包都不行）。所以类型项目里，tsc 负责"编译期把关"，Vite/webpack 负责"产物构建"，两者协作而非互相替代。

---

## 小结

- Babel 只降级语法，不检查类型。
- `tsc` 检查类型但慢；`esbuild`/`babel` 转译快但不管类型。
- 工程上分离：打包器转译、独立 `tsc --noEmit` 做类型门禁。
- tsc 不打包，构建交给 Vite/Rollup。

---

## 练习

1. 用 `tsc --noEmit` 跑一个故意写了类型错误的文件，看报错；再用 esbuild 转译同一文件，观察类型错误被忽略但编译通过。
2. 在一个 Vite 项目里配置 npm script：`"typecheck": "tsc --noEmit"`，并在 CI 步骤里调用。
3. 解释 `preset-typescript` 为什么能"剥离类型却不检查"。
