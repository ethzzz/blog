---
title: '01 · 环境搭建与第一个 TypeScript 程序'
published: 2026-09-27T11:00:00+08:00
description: '从零搭建 TypeScript 开发环境：安装 Node 与 tsc、编写并编译第一个 hello.ts、理解 tsconfig.json 关键字段、配置 VS Code、用 npm scripts 与 tsx/ts-node 提升开发体验。'
tags: [TypeScript, 环境搭建, tsc, tsconfig, npm]
category: TypeScript学习路线
draft: false
---

> [!NOTE]
> 本篇目标：在你的电脑上跑通 TypeScript 工具链，写出第一个能被编译运行的 TS 文件，并建立对 `tsconfig.json` 的初步认识。

---

## 1. 安装 Node.js

TypeScript 编译器 `tsc` 本身是一个 Node.js 程序，所以第一步是装 Node。

```bash
# 查看是否已安装（建议 18+）
node -v
npm -v
```

没装的话去 [nodejs.org](https://nodejs.org/) 下载 LTS 版本即可。装好后 `npm` 也一并就绪。

---

## 2. 安装 TypeScript 编译器

推荐**项目级安装**（而非全局），这样不同项目能锁定不同版本：

```bash
# 在当前项目目录初始化并安装
npm init -y
npm install -D typescript

# 验证安装
npx tsc -v
```

`npx tsc` 会调用本地安装的 `tsc`。如果想全局装也可以 `npm install -g typescript`，但团队项目强烈建议走 `devDependencies`。

---

## 3. 第一个 TypeScript 程序

新建 `hello.ts`：

```ts
// hello.ts
function greet(name: string): string {
  return `你好，${name}！`;
}

const message = greet("TypeScript");
console.log(message);
```

注意 `name: string` 和 `: string` 这两处类型注解——这就是 TS 比 JS 多的部分。

编译它：

```bash
npx tsc hello.ts
```

会生成一个 `hello.js`（类型注解被擦除后的纯 JS）。运行：

```bash
node hello.js
# 输出：你好，TypeScript！
```

试着改错传参，体验类型检查：

```ts
greet(123); // ❌ 报错：Argument of type 'number' is not assignable to parameter of type 'string'
```

不用运行，编译器就拦住了你——这就是 TS 的价值。

---

## 4. tsconfig.json 初探

每次手动指定文件太麻烦。用配置文件让 `tsc` 自动处理整个项目：

```bash
npx tsc --init
```

这会生成 `tsconfig.json`。几个最关键、初学者先记住的字段：

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",      // 编译成哪个 JS 版本
    "module": "CommonJS",    // 模块系统（Node 用 CommonJS，前端用 ESNext）
    "outDir": "./dist",      // 编译产物输出目录
    "rootDir": "./src",      // 源码根目录
    "strict": true,          // 开启全部严格检查（强烈建议）
    "esModuleInterop": true, // 兼容默认导入（import fs from 'fs'）
    "skipLibCheck": true     // 跳过 .d.ts 内部检查，提速
  },
  "include": ["src/**/*"],   // 参与编译的文件
  "exclude": ["node_modules", "dist"]
}
```

之后直接 `npx tsc` 就能编译整个 `src` 目录到 `dist`。

> 第 13 篇会**逐字段**拆解 tsconfig，这里先混个脸熟。

---

## 5. 配置 VS Code

VS Code 对 TS 开箱即用（内置 TS 语言服务）。建议：

- 状态栏右下角确认 TS 版本是**项目本地版本**（点版本号可切换），避免用到全局旧版。
- 开启 `strict` 后，编辑器会实时标红类型错误，不用等编译。
- 装官方扩展 **TypeScript + JavaScript Nightly**（可选，抢先体验新版特性）。

---

## 6. 让开发更顺手

每篇都手敲 `tsc` 太累，把常用命令写进 `package.json`：

```jsonc
{
  "scripts": {
    "build": "tsc",           // 编译
    "watch": "tsc -w",        // 监听改动自动编译
    "start": "node dist/index.js"
  }
}
```

开发时直接 `npm run watch` 后台编译，`npm start` 跑。

如果想**跳过编译直接跑 TS**（开发调试更爽），用 `tsx`：

```bash
npm install -D tsx
npx tsx src/index.ts   # 直接运行 TS，无需先 tsc
```

`tsx` 基于 esbuild，速度极快，是 `ts-node` 的现代替代品。

---

## 小结

- TS 工具链 = **Node + tsc + tsconfig + IDE**。
- `npx tsc file.ts` 单文件编译；`tsconfig.json` + `tsc` 项目级编译。
- `strict: true` 是安全底线，别关。
- 开发期用 `tsx` 直接跑 TS，省去编译步骤。

---

## 练习

1. 新建一个项目，安装 TypeScript，写函数 `sum(a: number, b: number): number` 并返回和，编译运行验证。
2. 故意把 `sum("1", 2)` 传进去，观察 `tsc` 报什么错。
3. 用 `tsc --init` 生成 tsconfig，把 `outDir` 改成 `./build` 后编译，确认产物去了哪里。
4. 装 `tsx`，用 `npx tsx` 直接运行你的 TS 文件。
