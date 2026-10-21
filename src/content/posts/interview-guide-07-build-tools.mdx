---
title: '前端构建工具面试题（Webpack / Vite）'
published: 2026-09-16T11:00:00+08:00
description: '深入讲解 Webpack 核心原理、Loader/Plugin、Vite 为何快、Tree Shaking、HMR、代码分割等高频面试题。'
tags: [前端面试, Webpack, Vite, TreeShaking, HMR]
category: 前端面试宝典
draft: false
---

> [!NOTE]
> 本文包含 25+ 道前端构建工具面试题，难度标注：⭐ 基础 · ⭐⭐ 进阶 · ⭐⭐⭐ 高级 · 🔥 高频必考

---

## Webpack 核心

### Q1: Webpack 的构建流程？⭐⭐ 🔥

**答：**

```
初始化参数
    ↓
创建 Compiler 对象
    ↓
注册所有插件（plugins）
    ↓
确定入口（entry）
    ↓
从入口开始构建模块图（Module Graph）
    ↓
Loader 转换每个模块
    ↓
递归处理依赖模块
    ↓
生成 Chunk（代码块）
    ↓
输出 Bundle 到文件系统
```

```javascript
// webpack.config.js 核心配置
module.exports = {
  entry: './src/index.js',       // 入口
  output: {                       // 输出
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
  },
  module: {
    rules: [                      // Loader 规则
      { test: /\.js$/, use: 'babel-loader' },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
    ]
  },
  plugins: [                      // 插件
    new HtmlWebpackPlugin(),
    new MiniCssExtractPlugin(),
  ],
  optimization: {                 // 优化
    splitChunks: { chunks: 'all' },
    minimize: true,
  },
};
```

### Q2: Loader 和 Plugin 的区别？⭐ 🔥

**答：**

| 特性 | Loader | Plugin |
|:--|:--|:--|
| 作用 | 转换单个文件 | 扩展构建功能 |
| 时机 | 模块解析阶段 | 整个构建生命周期 |
| 本质 | 函数（接收源码，返回转换后代码） | 类（监听 Compiler 事件） |
| 示例 | babel-loader、css-loader | HtmlWebpackPlugin、DefinePlugin |

```javascript
// Loader 本质：一个函数
function myLoader(source) {
  // source 是文件内容字符串
  return source.replace(/console\.log\(.*?\);?/g, '');
}
module.exports = myLoader;

// Plugin 本质：一个类，监听 Compiler hooks
class MyPlugin {
  apply(compiler) {
    // 监听 emit 事件（输出文件前）
    compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
      // 修改 compilation.assets
      callback();
    });
    
    // 监听 done 事件（构建完成）
    compiler.hooks.done.tap('MyPlugin', (stats) => {
      console.log('Build complete!');
    });
  }
}
```

### Q3: 常见 Loader 有哪些？执行顺序？⭐⭐

**答：**

```javascript
// 常见 Loader
// babel-loader    -> ES6+ 转 ES5
// css-loader      -> 解析 CSS 中的 @import 和 url()
// style-loader    -> 将 CSS 插入到 <style> 标签
// sass-loader     -> 编译 Sass/SCSS
// postcss-loader  -> 自动添加浏览器前缀（autoprefixer）
// file-loader     -> 处理图片/字体文件
// url-loader      -> 小文件转 base64
// ts-loader       -> 编译 TypeScript
// vue-loader      -> 解析 Vue SFC

// 执行顺序：从右到左，从下到上
module: {
  rules: [{
    test: /\.scss$/,
    use: [
      'style-loader',    // 4. 插入 DOM
      'css-loader',      // 3. 解析 CSS
      'postcss-loader',  // 2. 添加前缀
      'sass-loader',     // 1. 编译 Sass（先执行）
    ]
  }]
}
```

### Q4: 常见 Plugin 有哪些？⭐⭐

**答：**

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const DefinePlugin = require('webpack').DefinePlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');

plugins: [
  // 自动生成 HTML 并注入 bundle
  new HtmlWebpackPlugin({ template: './src/index.html' }),
  
  // 提取 CSS 为单独文件（生产环境）
  new MiniCssExtractPlugin({ filename: 'css/[name].[contenthash].css' }),
  
  // 清空 dist 目录
  new CleanWebpackPlugin(),
  
  // 定义全局变量（环境变量注入）
  new DefinePlugin({
    'process.env.API_URL': JSON.stringify(process.env.API_URL)
  }),
  
  // 复制静态文件
  new CopyWebpackPlugin({ patterns: [{ from: 'public', to: '' }] }),
],

optimization: {
  minimizer: [
    new TerserPlugin({ parallel: true }),       // 压缩 JS
    new CssMinimizerPlugin(),                    // 压缩 CSS
  ]
}
```

---

## Tree Shaking

### Q5: Tree Shaking 的原理？⭐⭐ 🔥

**答：**

Tree Shaking 是基于 **ES Module 静态分析** 的特性，在编译时移除未使用的代码。

```javascript
// utils.js
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; } // 未使用
export const PI = 3.14159;

// main.js
import { add } from './utils'; // 只导入 add
console.log(add(1, 2));

// Tree Shaking 后，subtract 和 PI 会被移除
```

**为什么需要 ESM？**

```javascript
// ESM：静态分析（编译时确定）
import { foo } from './module'; // 结构固定

// CommonJS：动态加载（运行时确定）
const module = require(condition ? './a' : './b'); // 无法静态分析
```

**Tree Shaking 失效的常见情况：**

```javascript
// 1. 副作用代码
// package.json 中声明
{ "sideEffects": false } // 允许 Tree Shaking
{ "sideEffects": ["*.css"] } // CSS 文件有副作用，保留

// 2. Babel 将 ESM 转换为 CJS（破坏静态分析）
// babel.config.js
{
  "presets": [["@babel/preset-env", { "modules": false }]] // 保留 ESM
}

// 3. 导入整个对象
import * as utils from './utils'; // 无法 Tree Shaking

// 4. 类方法
class MyClass {
  usedMethod() {}
  unusedMethod() {} // 类方法无法被 Tree Shaking
}
```

---

## 代码分割

### Q6: Webpack 代码分割的方式？⭐⭐ 🔥

**答：**

```javascript
// 1. 多入口（entry）
entry: {
  app: './src/app.js',
  admin: './src/admin.js',
}

// 2. 动态导入（懒加载）
const LazyComponent = () => import('./components/Lazy.vue');
// React
const LazyComponent = React.lazy(() => import('./Lazy'));

// 3. splitChunks（提取公共代码）
optimization: {
  splitChunks: {
    chunks: 'all', // async | initial | all
    cacheGroups: {
      // 提取第三方库
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
        priority: 10,
      },
      // 提取公共模块
      common: {
        minChunks: 2,
        name: 'common',
        chunks: 'all',
        priority: 5,
        reuseExistingChunk: true,
      },
    },
  },
}

// 4. runtimeChunk（提取 Webpack 运行时代码）
optimization: {
  runtimeChunk: 'single', // 单独提取 runtime
}
```

### Q7: contenthash 的作用？⭐⭐

```javascript
// contenthash：根据文件内容生成 hash
// 只有文件内容变化，hash 才变化，利用浏览器缓存

output: {
  filename: 'js/[name].[contenthash:8].js',
  chunkFilename: 'js/[name].[contenthash:8].chunk.js',
},

// moduleIds: 'deterministic'
// 确保模块 ID 稳定，避免 hash 抖动
optimization: {
  moduleIds: 'deterministic',
  chunkIds: 'deterministic',
}
```

---

## HMR (热模块替换)

### Q8: HMR 的原理？⭐⭐⭐ 🔥

**答：**

```
HMR 工作流程：

1. Webpack 监听文件变化，重新编译修改的模块
2. Webpack Dev Server 通过 WebSocket 通知浏览器
3. 浏览器 HMR Runtime 接收更新信息
4. HMR Runtime 下载新的模块代码（JSONP）
5. 执行模块的 accept handler，替换旧模块
6. 如果没有 accept handler，则冒泡到父模块
7. 如果冒泡到入口还未处理，则整页刷新
```

```javascript
// HMR API
if (module.hot) {
  module.hot.accept('./component.js', () => {
    // 组件更新时执行
    renderComponent();
  });
  
  module.hot.dispose(() => {
    // 模块卸载时清理
    cleanup();
  });
}

// Vue 中（vue-loader 自动处理）
// React 中（react-hot-loader / Fast Refresh）
```

---

## Vite

### Q9: Vite 为什么比 Webpack 快？⭐⭐ 🔥

**答：**

| 对比项 | Webpack | Vite |
|:--|:--|:--|
| 冷启动 | 打包全部模块再启动 | 直接启动 Dev Server |
| HMR | 重新打包受影响模块链 | 直接 ESM 模块替换 |
| 依赖预构建 | 无 | esbuild（Go 语言，极快） |
| 生产构建 | Webpack 打包 | Rollup 打包 |

**Vite 开发模式原理：**

```
浏览器请求 index.html
        ↓
Vite Dev Server 拦截请求
        ↓
按需编译请求的模块（不打包）
        ↓
以 ESM 格式返回给浏览器
        ↓
浏览器通过 <script type="module"> 加载
        ↓
遇到 import 再向 Vite 请求（按需加载）
```

```javascript
// Vite 开发模式：浏览器原生 ESM
// index.html
<script type="module" src="/src/main.js"></script>

// main.js（Vite 直接返回，不打包）
import { createApp } from 'vue';  // 浏览器请求 /node_modules/.vite/vue.js
import App from './App.vue';       // 浏览器请求 /src/App.vue（Vite 编译）
```

**依赖预构建（esbuild）：**

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    include: ['lodash-es', 'axios'], // 强制预构建
    exclude: ['my-local-lib'],        // 排除预构建
  },
  // 预构建作用：
  // 1. 将 CJS 转为 ESM
  // 2. 将多文件模块合并（减少 HTTP 请求）
  // 3. esbuild 比 Webpack 快 10-100x
};
```

### Q10: Vite 的生产构建？⭐⭐

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser', // 或 'esbuild'（更快）
    
    rollupOptions: {
      output: {
        // 手动分割代码
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          utils: ['lodash-es', 'dayjs'],
        },
      },
    },
    
    // 代码分割阈值
    chunkSizeWarningLimit: 500, // KB
  },
});
```

---

## 性能优化

### Q11: Webpack 构建速度优化？⭐⭐ 🔥

```javascript
// 1. 缩小 Loader 作用范围
{
  test: /\.js$/,
  use: 'babel-loader',
  exclude: /node_modules/, // 排除 node_modules
  // 或 include: path.resolve(__dirname, 'src')
}

// 2. 缓存
{
  test: /\.js$/,
  use: [{
    loader: 'babel-loader',
    options: { cacheDirectory: true } // 缓存编译结果
  }]
}
// 或使用 filesystem cache（Webpack 5）
cache: {
  type: 'filesystem',
  buildDependencies: { config: [__filename] },
}

// 3. 多线程构建
const ThreadLoader = require('thread-loader');
{
  test: /\.js$/,
  use: [ThreadLoader, 'babel-loader'] // 多进程
}

// 4. DLL 预编译（Webpack 4，Webpack 5 用 cache 代替）
// 将第三方库提前编译，不随业务代码重新打包

// 5. resolve 优化
resolve: {
  extensions: ['.js', '.jsx', '.ts', '.tsx'], // 减少后缀尝试
  alias: { '@': path.resolve(__dirname, 'src') }, // 路径别名
  modules: [path.resolve(__dirname, 'node_modules')], // 指定查找目录
}

// 6. 使用更快的工具
// terser-webpack-plugin（parallel: true）
// esbuild-loader（替代 babel-loader + terser）
```

### Q12: Webpack 产物体积优化？⭐⭐ 🔥

```javascript
// 1. Tree Shaking（已讲）
// 确保使用 ESM，配置 sideEffects

// 2. 代码分割（已讲）
// splitChunks + 动态导入

// 3. 压缩
optimization: {
  minimize: true,
  minimizer: [
    new TerserPlugin({
      parallel: true,
      terserOptions: {
        compress: { drop_console: true, drop_debugger: true }
      }
    }),
    new CssMinimizerPlugin(),
  ]
},

// 4. Gzip 压缩（配合 Nginx）
const CompressionPlugin = require('compression-webpack-plugin');
new CompressionPlugin({
  algorithm: 'gzip',
  test: /\.js$|\.css$|\.html$/,
  threshold: 10240, // 只压缩 > 10KB 的文件
})

// 5. 图片优化
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

// 6. 分析包体积
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
new BundleAnalyzerPlugin() // 可视化分析

// 7. 按需引入组件库
// babel-plugin-import（Ant Design / Element UI）
{
  "plugins": [["import", { "libraryName": "antd", "style": "css" }]]
}
```

---

## Babel

### Q13: Babel 的编译流程？⭐⭐

**答：**

```
源代码 (JS/JSX/TS)
    ↓
解析 (Parse) → AST（抽象语法树）
    ↓
转换 (Transform) → 新 AST（插件处理）
    ↓
生成 (Generate) → 目标代码
```

```javascript
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.25%, not dead', // 目标浏览器
      useBuiltIns: 'usage',          // 按需引入 polyfill
      corejs: 3,                     // core-js 版本
      modules: false,                // 保留 ESM（Tree Shaking）
    }],
    '@babel/preset-react',            // JSX 支持
    '@babel/preset-typescript',       // TS 支持
  ],
  plugins: [
    '@babel/plugin-transform-runtime', // 避免全局污染
    ['@babel/plugin-proposal-decorators', { legacy: true }], // 装饰器
  ],
};
```

---

## 复习卡片

| 知识点 | 关键记忆 |
|:--|:--|
| Loader | 文件转换器，从右到左执行 |
| Plugin | 生命周期扩展，监听 Compiler hooks |
| Tree Shaking | 基于 ESM 静态分析，移除未使用代码 |
| splitChunks | 代码分割，提取公共代码和第三方库 |
| HMR | WebSocket 通知 + 模块替换 |
| Vite 快的原因 | 无需打包，原生 ESM + esbuild 预构建 |
| contenthash | 内容 hash，利用浏览器缓存 |
| 构建速度 | exclude、cache、多线程、resolve 优化 |

> [!TIP]
> 下一篇：[网络与 HTTP 面试题](/blog/posts/interview-guide-08-network-http/)
> 
> 涵盖 TCP/IP、HTTP/2、HTTPS、缓存策略、跨域解决方案等核心知识点。
