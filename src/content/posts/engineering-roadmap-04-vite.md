---
title: '04 · Vite 原理与实战'
published: 2026-09-30T22:00:00+08:00
description: 'Vite 为什么比 Webpack 快：开发期用浏览器原生 ESM + esbuild 预构建，免打包；生产期用 Rollup。讲清 dev server、依赖预构建、配置要点与"为什么现代项目几乎都选 Vite"。'
tags: [前端工程化, Vite, esbuild, ESM, 开发服务器]
category: 前端工程化学习路线
draft: false
---

## 第一次 `npm run dev` 秒开

早年 Webpack 项目 dev 启动要 30 秒（先全量打包）。Vite 启动几乎瞬时，改文件 HMR 也是毫秒级。秘密在**开发期根本不打包**。

---

## 开发期：浏览器原生 ESM

Vite 利用现代浏览器原生支持 `<script type="module">`，直接按需请求模块，**不提前打包**：

- 你改 `a.ts`，只重新转译 `a.ts` 这一个文件，浏览器重新请求它。
- 没有"全量构建"这一步，所以启动和 HMR 都极快。

```js
// vite.config.js
import { defineConfig } from "vite";
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: { outDir: "dist" },
});
```

---

## 依赖预构建

裸模块 `import react from "react"` 浏览器不认识。Vite 用 **esbuild**（Go 写，极快）把 `node_modules` 里的依赖**预构建成 ESM** 并缓存：解决 CommonJS 兼容、把大依赖拆成小文件以便并行请求。

> 改了依赖或切换分支导致缓存失效时，删 `node_modules/.vite` 重新预构建即可（本博客部署脚本里那段 `rm -rf dist/.vite` 渊源在此）。

---

## 生产期：Rollup

生产构建仍用 **Rollup**（成熟、tree-shaking 强），产出去掉 dev 专用的原生 ESM 策略，做完整的拆包与压缩。所以"Vite 快"特指开发体验，生产构建质量不打折。

---

## 为什么现代项目选 Vite

- 启动/HMR 快 → 开发体验碾压。
- 配置简单，约定优于配置。
- 生态（`vite-plugin-*`）丰富，库/应用通吃。

> 注意：Vite 要求浏览器支持 ESM，极老浏览器需配合 `@vitejs/plugin-legacy` 降级。

---

## 小结

- 开发期：原生 ESM + 按需转译，免打包 → 启动/HMR 极快。
- esbuild 预构建依赖为 ESM 并缓存。
- 生产期：Rollup 负责完整优化。
- 现代项目首选 Vite，体验与质量兼得。

---

## 练习

1. 新建一个 Vite + React 项目，`npm run dev` 后打开 Network 面板，观察模块是如何被浏览器按需请求的。
2. 故意删掉 `node_modules/.vite` 再启动，观察预构建日志重新执行。
3. 对比同一项目用 Webpack 与 Vite 的 dev 启动耗时的差异。
