---
title: '13 · 工程化：tsconfig 全解与构建'
published: 2026-09-27T23:00:00+08:00
description: 'TypeScript 工程化核心：tsconfig.json 关键字段逐解、strict 严格族（strictNullChecks 等）、target/lib/module、outDir/rootDir、路径别名、project references 实现 monorepo 类型共享，以及与 Vite/webpack/esbuild 的职责边界。'
tags: [TypeScript, tsconfig, strict, projectReferences, 工程化, monorepo]
category: TypeScript学习路线
draft: false
---

> [!NOTE]
> 前 12 篇讲语言特性，本篇讲"怎么把 TS 用在生产项目里"。tsconfig 是项目的总开关，配错了要么漏检类型、要么编译炸。逐字段讲清。

---

## 1. tsconfig 怎么生效

`tsc` 在当前目录找 `tsconfig.json`，按 `include/exclude/files` 决定编译范围。空 `tsc` 用配置编译，`tsc file.ts` 则忽略配置单文件编译。

---

## 2. 最关键的开关：strict

```jsonc
{ "compilerOptions": { "strict": true } }
```

`strict: true` 一次性开启一组检查，等价于：

| 子项 | 作用 |
| --- | --- |
| `strictNullChecks` | `null/undefined` 不能赋给非联合类型（最重要） |
| `noImplicitAny` | 隐式 `any` 报错 |
| `strictFunctionTypes` | 函数参数逆变检查更严 |
| `strictBindCallApply` | `bind/call/apply` 也有类型 |
| `strictPropertyInitialization` | 类属性必须初始化 |
| `noImplicitThis` | `this` 类型不明确报错 |
| `alwaysStrict` | 输出 `"use strict"` |

**强烈建议全程 strict**。它是 TS 安全感的来源，关掉等于自废武功。

---

## 3. 编译目标与库

```jsonc
{
  "target": "ES2020",   // 编译到哪版 JS
  "lib": ["ES2020", "DOM", "DOM.Iterable"], // 可用哪些内置 API 的类型
}
```

`target` 决定语法降级（如 `async` 转成回调）；`lib` 决定"能用哪些全局类型"——前端要加 `"DOM"`，Node 则慎重。只设 `target` 时 TS 会自动配对应 `lib`。

---

## 4. 模块与输出

```jsonc
{
  "module": "ESNext",
  "moduleResolution": "Bundler",
  "outDir": "./dist",
  "rootDir": "./src",
  "sourceMap": true,
  "removeComments": false
}
```

- 前端（Vite/webpack）：`module: ESNext` + `moduleResolution: Bundler`，由打包器负责最终 JS。
- Node：`module: NodeNext` + `moduleResolution: NodeNext`，写扩展名。

---

## 5. 路径别名

```jsonc
{
  "baseUrl": ".",
  "paths": { "@/*": ["src/*"], "@utils/*": ["src/utils/*"] }
}
```

TS 能解析别名，但**运行时/打包器也要配**（Vite 的 `resolve.alias`、Node 的 `tsconfig-paths`/`tsx`）。两处都要配，否则编译过运行炸。

---

## 6. project references（monorepo 友）

多个子包互相依赖、共享类型时，用项目引用避免重复编译：

```jsonc
// 根 tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/app" }
  ]
}
```

```jsonc
// packages/core/tsconfig.json
{
  "compilerOptions": {
    "composite": true,     // 必须，生成 .tsbuildinfo
    "outDir": "../../dist/core",
    "rootDir": "src"
  }
}
```

`tsc -b`（build 模式）按依赖顺序增量编译，子包间类型共享且互不重复检查。这是 TS 官方推荐的 monorepo 方案（比第三方工具更稳）。

---

## 7. TS 与打包器的边界

常见误解："tsc 负责打包"。其实：

- **tsc**：只做类型检查 + 转译语法（TS→JS）。默认不打包、不处理 CSS/图片。
- **打包器**（Vite/webpack/esbuild/rollup）：处理打包、压缩、资源、HMR。

现代前端流程：
```bash
vite build   # 内部用 esbuild/rollup 处理 .ts，极快
tsc --noEmit # 单独跑类型检查，不参与打包
```

即"打包用打包器，类型检查用 `tsc --noEmit`"，职责分离、各取所长。

---

## 8. 常用提速与保险项

```jsonc
{
  "skipLibCheck": true,   // 跳过 .d.ts 检查，显著提速
  "incremental": true,    // 增量编译，生成 .tsbuildinfo
  "noUnusedLocals": true, // 未用变量报错
  "noUnusedParameters": true,
  "forceConsistentCasingInFileNames": true
}
```

---

## 小结

- `strict: true` 是安全底线，务必开。
- `target/lib` 控语法与可用 API；`module/moduleResolution` 按前端/Node 选。
- 路径别名 TS 与打包器**都要配**。
- monorepo 用 `project references` + `composite`。
- 打包交给 Vite/webpack，`tsc --noEmit` 只做类型检查。

---

## 练习

1. 新建项目，开 `strict`，故意留一个 `let x; x.foo` 看 `noImplicitAny` 是否报错。
2. 对比 `strictNullChecks` 关/开时 `let a: string = null` 的行为。
3. 配置 `@/*` 别名，分别在 TS 与 Vite 里生效并验证。
4. 用 `tsc -b` 建一个两包依赖的最小 monorepo 体会 project references。
