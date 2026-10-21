---
title: '03 · Webpack 核心'
published: 2026-09-30T21:00:00+08:00
description: 'Webpack 的核心概念：entry/output/loader/plugin，loader 如何把非 JS 资源转成模块，plugin 在生命周期钩子上扩展能力，以及拆包（code splitting）与常见优化配置。'
tags: [前端工程化, Webpack, loader, plugin, code-splitting]
category: 前端工程化学习路线
draft: false
---

## Webpack 的心智模型

Webpack 把一切（JS、CSS、图片）都当**模块**，核心是四件套：

- **entry**：从哪开始构建依赖图。
- **output**：产物输出到哪。
- **loader**："某种文件 → JS 模块"的转换器（如 `css-loader`、`ts-loader`、`babel-loader`）。
- **plugin**：在编译生命周期钩子上做更重的活（压缩、生成 HTML、提取 CSS）。

```js
module.exports = {
  entry: "./src/index.js",
  output: { path: "dist", filename: "[name].[contenthash].js" },
  module: {
    rules: [{ test: /\.tsx?$/, use: "babel-loader" }],
  },
  plugins: [new HtmlWebpackPlugin()],
};
```

---

## loader vs plugin

- **loader** 是"文件级"转换，一对一（一个资源进，一个模块出）。链条从右到左执行。
- **plugin** 是"生命周期级"扩展，能访问整个编译对象，做代码分割、资源注入、报表等。

简记：改**文件内容**用 loader，改**构建过程/产物**用 plugin。

---

## code splitting 拆包

```js
// 动态 import 自动拆成独立 chunk
button.onclick = () => import("./heavy").then(m => m.run());
// 或配置
optimization: { splitChunks: { chunks: "all" } } // 提取公共依赖
```

拆包让首屏只加载必要代码，公共库单独缓存，是性能优化的基础。

---

## 常见优化

- `mode: "production"` 自动开启压缩、tree-shaking。
- `contenthash` 文件名：内容不变则文件名不变，最大化浏览器缓存。
- `cache` 目录缓存：二次构建大幅提速。
- 用 `webpack-bundle-analyzer` 看谁占了体积。

---

## 小结

- 四件套：entry/output/loader/plugin。
- loader 转文件，plugin 扩流程。
- 动态 import + splitChunks 做拆包优化首屏。
- `contenthash` 文件名利于长缓存。

---

## 练习

1. 手写一个最小 webpack 配置，把 TS 入口打包成 dist 下的 hash 命名文件。
2. 配置 `splitChunks: { chunks: "all" }`，观察公共依赖是否被提取到独立 chunk。
3. 用 `webpack-bundle-analyzer` 找出体积最大的模块，想办法减小。
