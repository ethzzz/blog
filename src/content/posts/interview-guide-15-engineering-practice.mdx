---
title: '前端工程化实践面试题（Monorepo/微前端/组件库）'
published: 2026-09-16T19:00:00+08:00
description: '讲解 Monorepo 架构、微前端方案选型、组件库设计、npm 发包、代码质量、单元测试、CI/CD、灰度发布等工程化落地实践。'
tags: [前端面试, 工程化, Monorepo, 微前端, 组件库, CI/CD]
category: 前端面试宝典
draft: false
---

> [!NOTE]
> 本文包含 20+ 道前端工程化实践面试题，覆盖从代码组织到发布的完整工程链路，中高级岗位重点考察项。难度标注：⭐ 基础 · ⭐⭐ 进阶 · ⭐⭐⭐ 高级 · 🔥 高频必考

---

## Monorepo 与代码组织

### Q1: Monorepo vs Multirepo 怎么选？⭐⭐ 🔥

**答：**

| 维度 | Monorepo（单一仓库） | Multirepo（多仓库） |
|:--|:--|:--|
| 代码可见性 | 全量可见，易于重构 | 需要跨仓库同步 |
| 依赖管理 | 统一版本，避免"依赖地狱" | 各自维护 |
| CI 构建 | 需增量构建，否则慢 | 独立构建，快 |
| 权限控制 | 粗粒度 | 细粒度 |
| 团队协作 | 打破团队边界 | 按仓库隔离 |
| 代码复用 | 天然复用（workspace 包） | 需发 npm |
| 仓库体积 | 会随时间变大 | 每个仓库小 |

```
Monorepo 典型结构（pnpm workspace）：

my-app/
├── apps/
│   ├── web/              # 主站
│   ├── admin/            # 后台
│   ├── mobile/           # H5
│   └── docs/             # 文档站
├── packages/
│   ├── ui/               # 组件库（内部包）
│   ├── utils/            # 工具函数
│   ├── hooks/            # 自定义 hooks
│   ├── request/          # axios 封装
│   ├── config-eslint/    # 共享配置
│   └── config-tsconfig/  # 共享 ts 配置
├── pnpm-workspace.yaml
├── turbo.json            # 增量构建配置
└── package.json
```

**选择建议：**
- 多产品线共享组件/工具/规范 → Monorepo
- 团队分散、技术栈差异大、代码需强隔离 → Multirepo
- 中小项目 → 单仓库足够，别过度设计

### Q2: pnpm workspace、Turborepo、Nx、Lerna 的区别？⭐⭐⭐

```
pnpm workspace：包管理器级别
- 通过 pnpm-workspace.yaml 定义工作区
- 硬链接 + 符号链接：磁盘占用小、安装快
- 严格 node_modules 结构，避免"幽灵依赖"
- 只解决依赖，不解决构建编排

Turborepo：任务编排
- 基于 turbo.json 声明依赖关系
- 增量构建：只构建变更包及其下游
- 远程缓存：CI 缓存产物，跨机器复用
- Vercel 出品，配置简单，性能好

Nx：全功能构建系统
- 依赖图分析、任务编排、代码生成器
- 插件生态（React/Vue/Node/NestJS）
- 分布式任务执行
- 学习成本高，适合大型企业

Lerna：老牌工具
- v6 后由 Nx 团队维护
- 主要用于版本管理和发布（changed/publish）
- 构建能力已被 Turborepo/Nx 替代
```

```json
// turbo.json 示例
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],        // 依赖上游包先构建
      "outputs": ["dist/**"]          // 缓存产物
    },
    "test": { "dependsOn": ["build"] },
    "lint": {},
    "dev": { "cache": false, "persistent": true }
  }
}
```

```bash
# 常用命令
turbo run build                # 构建所有包
turbo run build --filter=web   # 只构建 web 及其依赖
turbo run test --filter=@app/ui^...  # 只测试 ui 的下游
```

### Q3: pnpm 为什么比 npm/yarn 快？⭐⭐

```
npm/yarn 的问题：
1. 每个项目独立 node_modules，重复占用磁盘
2. 扁平化 node_modules，产生"幽灵依赖"
   （间接依赖可以被 require，但没在 package.json 声明）

pnpm 的解决方案：

1. 全局硬链接（Hard Link）
   ~/.pnpm-store/v3/files/  →  project/node_modules/.pnpm/
   同一版本包在全局只存一份，磁盘节省 60%+

2. 严格的三层 node_modules 结构
   node_modules/
   ├── .pnpm/           ← 真实存放（软链到全局 store）
   │   ├── lodash@4.17.21/
   │   └── ...
   └── lodash -> .pnpm/lodash@4.17.21/node_modules/lodash
   ↑ 只有 package.json 里声明的依赖才在顶层出现

3. 内容寻址存储：相同文件只存一份
4. 并行安装：比 yarn v1 快 2-3 倍

带来的收益：
- 安装速度：npm ci 60s → pnpm i 15s（真实项目数据）
- 磁盘：monorepo 里 10 个 app 共享依赖，节省 90%
- 安全：幽灵依赖被杜绝，重构时更可靠
```

---

## 微前端

### Q4: 微前端解决什么问题？常见方案对比？⭐⭐⭐ 🔥

**答：**

**核心场景：**
- 巨型应用（几百万行代码）拆分维护
- 多团队独立开发部署（组织架构映射）
- 遗留系统渐进式重构（老 jQuery + 新 Vue/React）
- 技术栈异构（不同产品线用不同框架）

**主流方案对比：**

| 方案 | 隔离 | 通信 | 上手成本 | 适用场景 |
|:--|:--|:--|:--|:--|
| qiankun | JS 沙箱 + Shadow DOM | 全局状态 | 中 | 最主流，社区大 |
| Module Federation | 无（模块级） | 共享依赖 | 低 | Webpack 5+，模块共享 |
| single-spa | 无 | props | 中 | 路由级切换 |
| micro-app（京东） | 类 WebComponent | 自定义 | 低 | 无侵入 |
| 无界 wujie（腾讯） | iframe + WebComponent | props | 低 | 隔离最强 |
| iframe | 天然隔离 | postMessage | 低 | 简单场景，体验差 |

**qiankun 核心原理：**

```javascript
// 主应用注册子应用
import { registerMicroApps, start } from 'qiankun';
registerMicroApps([
  {
    name: 'sub-vue',
    entry: '//localhost:8081',
    container: '#subapp',
    activeRule: '/vue',
    props: { token: getToken },
  },
]);
start({ sandbox: { experimentalStyleIsolation: true } });

// 子应用导出生命周期（webpack 配置 library）
export async function bootstrap() { /* 应用首次加载 */ }
export async function mount(props) {
  createApp(App).mount(props.container.querySelector('#app'));
}
export async function unmount() { app.unmount(); }

// 三大关键机制：
// 1. HTML Entry：直接加载子应用 HTML，解析 script/link（比 JS Entry 灵活）
// 2. JS 沙箱：Proxy 拦截 window，子应用修改不污染主应用
// 3. 样式隔离：Shadow DOM / scoped（选择器加前缀）/ dynamic stylesheet
```

**Module Federation（模块联邦）：**

```javascript
// webpack.config.js（生产者）
new ModuleFederationPlugin({
  name: 'app_remote',
  filename: 'remoteEntry.js',
  exposes: { './Button': './src/Button' },
  shared: ['react', 'react-dom'],   // 共享依赖，避免重复加载
});

// 消费者
new ModuleFederationPlugin({
  name: 'app_host',
  remotes: { app_remote: 'app_remote@http://x.com/remoteEntry.js' },
  shared: ['react', 'react-dom'],
});

// 使用（像本地组件一样）
const Button = React.lazy(() => import('app_remote/Button'));
```

**选型建议：**
- 已有大型 SPA、需要拆分独立部署 → qiankun
- Webpack 5+、需要模块级共享 → Module Federation
- 追求强隔离、可接受 iframe 局限 → 无界
- 简单页面级切换、老系统改造 → single-spa / iframe

### Q5: 微前端的坑有哪些？⭐⭐⭐

```
1. 样式冲突
   - qiankun 用 scoped 加前缀，但全局样式（body、html）改不了
   - 解决：约定 BEM 命名 / CSS Module / Shadow DOM

2. JS 沙箱逃逸
   - 定时器、事件监听、全局变量在卸载时要主动清理
   - 解决：子应用 mount/unmount 严格管理生命周期

3. 路由冲突
   - 主子应用都有路由，history/popstate 会互相干扰
   - 解决：子应用 basename 隔离，主应用做前缀分发

4. 共享依赖版本不一致
   - React 17 主应用 + React 18 子应用共存问题
   - 解决：约定版本 / Module Federation shared 强制单例

5. 通信复杂度
   - 跨应用状态同步容易失控
   - 解决：qiankun initGlobalState / CustomEvent / URL 参数

6. 首屏性能
   - 加载主应用 + 子应用资源，白屏时间增加
   - 解决：预加载（prefetchApps）、子应用 CDN 缓存

7. 开发调试困难
   - 本地要同时起主应用和多个子应用
   - 解决：独立运行模式（子应用可脱离主应用启动）
```

---

## 组件库设计

### Q6: 从零设计一个组件库要考虑什么？⭐⭐⭐ 🔥

```
完整链路：
需求分析 → 技术选型 → 目录结构 → 组件设计 → 构建打包 →
文档站 → 单元测试 → 发版流程 → 版本管理 → 迁移方案

1. 技术选型
   - 框架：Vue / React / Web Components（跨框架）
   - 样式：Sass / Less / CSS-in-JS / Tailwind / 原子化
   - 主题：CSS 变量（推荐，运行时切换）/ Sass 变量（构建时）
   - 构建：Vite（开发）+ Rollup（打包）+ Vite lib mode

2. 目录结构
components/
├── packages/
│   ├── button/
│   │   ├── src/Button.vue
│   │   ├── __tests__/Button.spec.ts
│   │   ├── index.ts               # 导出
│   │   └── style/
│   │       ├── index.ts           # 样式入口
│   │       └── button.scss
│   ├── theme-chalk/               # 全局样式变量
│   └── utils/                     # 内部工具
├── docs/                          # 文档站（VitePress）
├── scripts/                       # 构建脚本
└── package.json

3. 组件设计原则
   - 单一职责：一个组件只做一件事
   - Props 语义清晰：不用 v1、v2 这种命名
   - 支持插槽（slot/children）扩展
   - 支持 ref 转发（React）/ defineExpose（Vue）
   - 无障碍（ARIA 属性、键盘导航）
   - 主题变量暴露（--btn-primary-color）

4. 构建产物（三种格式）
   - ESM：dist/es/xxx.js（现代打包器）
   - CJS：dist/lib/xxx.js（Node/webpack 老项目）
   - UMD：dist/index.js（script 标签直接用）
   - 类型声明：dist/types/*.d.ts

5. 按需引入（关键！）
   - 组件独立打包，用户只 import 用到的
   - package.json 配置 sideEffects: false
   - 提供 unplugin-vue-components 自动导入插件
```

```json
// package.json 关键字段
{
  "name": "@myorg/ui",
  "version": "1.2.0",
  "main": "dist/lib/index.js",
  "module": "dist/es/index.js",
  "types": "dist/types/index.d.ts",
  "exports": {
    ".": { "import": "./dist/es/index.js", "require": "./dist/lib/index.js" },
    "./dist/style.css": "./dist/style.css",
    "./es/*": "./es/*",
    "./lib/*": "./lib/*"
  },
  "sideEffects": ["dist/*", "es/*/style/*", "lib/*/style/*"],
  "files": ["dist", "es", "lib", "README.md"]
}
```

### Q7: 组件库如何做主题定制？⭐⭐⭐

```
方案 1：CSS 变量（推荐，运行时切换）
:root {
  --btn-primary-bg: #409eff;
  --btn-primary-color: #fff;
}
.btn-primary {
  background: var(--btn-primary-bg);
  color: var(--btn-primary-color);
}
// 用户覆盖：修改 :root 变量即可，无需重新构建
// 暗色主题：[data-theme="dark"] { --btn-primary-bg: #333; }

方案 2：Sass 变量（构建时，性能最好）
// 用户在自己的项目里覆盖 $--color-primary 再引入
$--color-primary: red;
@import "@myorg/ui/theme/index.scss";

方案 3：CSS-in-JS（运行时，最灵活但性能最差）
// styled-components / emotion / vanilla-extract
const Button = styled.button`
  background: ${props => props.theme.primary};
`;

方案 4：设计 Token（大厂方案）
// design-tokens.json → 编译出 CSS 变量 / Sass / JS
// 好处：一份 Token 多端复用（Web / 小程序 / iOS / Android）

实践建议：
- 组件库默认 CSS 变量方案（用户改起来最方便）
- 内部使用 Sass 变量做构建时优化
- 关键 Token 命名规范化（color / spacing / radius / shadow / z-index）
- 提供在线主题编辑器（Element Plus Theme）
```

---

## npm 发包与版本管理

### Q8: npm 发包完整流程？⭐⭐ 🔥

```bash
# 1. 初始化包
npm init --scope=@myorg    # scoped 包，组织名下

# 2. 关键字段配置（package.json）
# name / version / main / module / types / files / repository

# 3. 登录（首次）
npm login
# 私有仓库：npm login --registry=https://npm.mycompany.com

# 4. 版本号管理（SemVer）
npm version patch    # 1.0.0 → 1.0.1（bug 修复）
npm version minor    # 1.0.0 → 1.1.0（向后兼容的新功能）
npm version major    # 1.0.0 → 2.0.0（破坏性变更）
npm version prerelease --preid=beta  # 1.0.0 → 1.0.1-beta.0

# 5. 发布
npm publish                       # 正式版
npm publish --tag beta            # 测试版（用户 npm i pkg@beta 才装）
npm publish --access public       # scoped 包默认 private，加此参数改公开

# 6. 版本回退（24h 内）
npm unpublish pkg@1.0.0 --force
# 更好的方式：发布修复版 1.0.1，或用 npm deprecate 警告
npm deprecate pkg@1.0.0 "critical bug, use 1.0.1"
```

**Changesets（现代版本管理，Monorepo 首选）：**

```bash
# 1. 初始化
pnpm add -Dw @changesets/cli && pnpm changeset init

# 2. 开发完一个功能，生成变更集
pnpm changeset
# 交互式选择：哪些包变更 + patch/minor/major + 变更说明
# 会在 .changeset/ 目录生成一个 md 文件

# 3. 版本升级
pnpm changeset version
# 消费 .changeset 里的变更，自动更新各包版本号 + CHANGELOG

# 4. 发布
pnpm changeset publish

# 优势：
# - 变更集是"意图"，版本升级是"结果"，解耦
# - Monorepo 里自动处理包间依赖版本联动
# - 自动生成 CHANGELOG
# - CI 集成友好（GitHub Actions 自动发版）
```

### Q9: package.json 中 main、module、exports、types 的区别？⭐⭐

```json
{
  "main": "dist/index.cjs.js",       // CJS 入口（老 webpack/node require）
  "module": "dist/index.esm.js",     // ESM 入口（webpack/rollup 优先，可 Tree Shaking）
  "types": "dist/index.d.ts",        // TypeScript 类型入口
  "browser": "dist/index.browser.js",// 浏览器专用（避免 node polyfill）
  "unpkg": "dist/index.umd.js",      // CDN script 标签直接用
  "exports": {                        // Node 12.7+ 现代入口（优先级最高）
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "default": "./dist/index.mjs"
    },
    "./utils": "./dist/utils/index.mjs",   // 子路径导出
    "./style.css": "./dist/style.css",
    "./package.json": "./package.json"
  },
  "sideEffects": false                // 无副作用，可安全 Tree Shaking
}

// exports 的优势：
// 1. 明确公开哪些路径（其他路径 import 会报错，防止用户依赖内部实现）
// 2. 支持条件导出（node/browser/import/require/types）
// 3. 更好的封装性
```

---

## 代码质量与规范

### Q10: 完整的代码质量工具链？⭐⭐ 🔥

```
提交前拦截链路：

编辑器 → ESLint（保存时自动 fix）
       ↓
git add
       ↓
husky（Git Hooks）
  ├── pre-commit → lint-staged → ESLint + Prettier（只处理暂存文件）
  ├── commit-msg → commitlint（校验提交信息规范）
  └── pre-push → 单元测试（vitest run）
       ↓
CI 流水线
  ├── 全量 lint
  ├── 全量测试 + 覆盖率
  ├── 构建产物
  └── 部署

工具职责：
- ESLint：代码质量（潜在 bug、最佳实践）
- Prettier：代码格式（换行、缩进、引号）
- Stylelint：CSS/SCSS 规范
- commitlint：提交信息规范
- husky：管理 Git Hooks
- lint-staged：只对暂存文件跑 lint（快）
- Biome：Rust 实现，一个工具替代 ESLint + Prettier（新兴）
```

```javascript
// lint-staged 配置（package.json）
"lint-staged": {
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{css,scss,vue}": ["stylelint --fix", "prettier --write"],
  "*.{md,json}": ["prettier --write"]
}

// Conventional Commits 规范
// feat:     新功能
// fix:      bug 修复
// docs:     文档变更
// style:    代码格式（不影响逻辑）
// refactor: 重构
// perf:     性能优化
// test:     测试
// build:    构建/依赖
// ci:       CI 配置
// chore:    其他杂项
// revert:   回滚

// 例：feat(button): 新增 loading 状态支持
// fix(utils): 修复 formatDate 时区问题 #123
```

---

## 测试

### Q11: 前端测试金字塔？各层职责？⭐⭐ 🔥

```
        /\
       /  \  E2E（10%）
      /----\   真实浏览器跑完整用户流程
     /      \  Playwright / Cypress
    /--------\
   /   集成    \  集成测试（20%）
  /    测试     \  多组件协作、组件 + 状态管理
 /--------------\  Testing Library + MSW
/   单元测试      \  单元测试（70%）
/  （最多、最快）   \  纯函数、hooks、组件独立行为
--------------------  Vitest / Jest

原则：越靠下越多、越快、越便宜；越靠上越少、越慢、越贵。
反模式：冰淇淋筒（E2E 特别多，跑得慢，维护成本高）
```

```javascript
// Vitest 单元测试示例（Vue 组件）
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from './Button.vue';

describe('Button', () => {
  it('渲染默认文本', () => {
    const wrapper = mount(Button);
    expect(wrapper.text()).toContain('按钮');
  });

  it('点击触发 click 事件', async () => {
    const wrapper = mount(Button);
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('disabled 时不响应点击', async () => {
    const wrapper = mount(Button, { props: { disabled: true } });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });
});

// Testing Library 核心理念：
// 从用户视角测试（找 role/text/label），不测实现细节
// 好处：重构不破坏测试，测试即文档
```

### Q12: Playwright/Cypress 如何选型？E2E 测试的关键点？⭐⭐⭐

```
Playwright（微软）：
- 支持 Chromium / Firefox / WebKit 三大内核
- 多语言（JS/TS/Python/Java/.NET）
- 内置自动等待、trace viewer（回放调试）
- 并行执行、跨浏览器测试
- 支持移动端模拟

Cypress：
- 只支持 Chromium 系（近年也支持 Firefox/WebKit 实验）
- 时间旅行调试、快照
- 生态成熟、社区大
- 运行在浏览器内，某些场景受限（多标签页、iframe）

选型建议：
- 新项目 → Playwright（更现代、更快、功能全）
- 已有 Cypress 项目 → 继续用
- 需要跨浏览器测试 → Playwright
```

```javascript
// Playwright 示例
import { test, expect } from '@playwright/test';

test('用户登录流程', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid=username]', 'tom');
  await page.fill('[data-testid=password]', '123456');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('.welcome')).toContainText('Tom');
});

// 关键实践：
// 1. 用 data-testid 而非 CSS 选择器（不受样式重构影响）
// 2. 网络拦截 mock 后端（page.route）
// 3. 只测关键用户流程（登录、下单、支付），别贪多
// 4. 测试数据独立，每次前后清理
// 5. CI 上并行执行，本地失败自动截图 + trace
```

---

## CI/CD 与发布

### Q13: 前端 CI/CD 流水线怎么设计？⭐⭐ 🔥

```
分支策略（Trunk-Based Development 主流）：

main（生产）
  ↑ merge / PR
develop / feature/*
  ↑ commit

流水线阶段：

1. PR 阶段（自动）
   ├─ 依赖安装（利用 pnpm store 缓存）
   ├─ 类型检查（tsc --noEmit / vue-tsc）
   ├─ Lint（eslint + prettier --check）
   ├─ 单元测试（vitest run --coverage）
   ├─ 构建（vite build）
   ├─ 产物大小检查（bundlesize / size-limit）
   └─ Preview 部署（Vercel/Netlify 预览环境）

2. Merge 到 main（自动）
   ├─ 完整测试（含 E2E）
   ├─ 构建生产包
   ├─ 上传产物到 OSS / 镜像仓库
   ├─ 部署测试环境（自动）
   └─ 通知（企微/钉钉机器人）

3. 发版到生产（手动审批 or 打 tag 触发）
   ├─ 灰度发布（先 1% → 10% → 50% → 100%）
   ├─ CDN 刷新
   ├─ 健康检查（自动化冒烟测试）
   └─ 失败自动回滚（保留上一版本产物）

关键工具：
- GitHub Actions / GitLab CI / Jenkins
- 缓存：actions/cache 缓存 node_modules、pnpm store
- 制品仓库：Nexus / Verdaccio（私有 npm）
- 部署：Docker + K8s / 静态托管（OSS + CDN）/ Vercel
```

```yaml
# .github/workflows/ci.yml 示例
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test --coverage
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist }
```

### Q14: 灰度发布怎么做？⭐⭐⭐

```
灰度维度：
1. 用户维度：白名单 → 内测用户 → 部分用户 → 全量
2. 流量维度：1% → 10% → 50% → 100%
3. 地域维度：某城市 → 某区域 → 全国
4. 设备维度：某型号 → 某系统版本

实现方案：

方案 A：Nginx 层灰度（简单）
upstream backend {
  server new-version weight=1;   # 新版本 10%
  server old-version weight=9;   # 老版本 90%
}

方案 B：CDN + 版本目录
dist/
├── v1.0.0/index.html
├── v1.1.0/index.html
└── latest/ -> 软链切换
灰度逻辑：根据用户 ID hash 决定加载哪个版本

方案 C：客户端配置中心
- 前端启动时拉取灰度配置
- 后端根据用户特征返回是否命中新版本
- 命中则加载新 JS bundle，否则加载旧版

方案 D：特性开关（Feature Flag）
- 代码里所有新功能用 if (featureEnabled('new_ui')) 包裹
- 配置中心动态开关，无需发版
- 工具：LaunchDarkly、Unleash、自研

灰度回滚：
- 保留上一版本产物 3-7 天
- 监控错误率、崩溃率、业务指标
- 触发阈值自动回滚（如错误率 > 0.5%）
```

---

## 前端监控与埋点

### Q15: 前端埋点方案？⭐⭐⭐

```
埋点分类：
1. 代码埋点（手动）：在业务代码里手动调 track()
   - 优点：精准、灵活
   - 缺点：侵入性高、易漏
2. 无埋点（全埋点）：SDK 自动采集所有点击/曝光
   - 优点：无侵入、可回溯
   - 缺点：数据量大、语义模糊
3. 可视化埋点：运营在页面上圈选元素配置事件
   - 优点：非技术人员可用
   - 缺点：需要平台支撑

主流 SDK 架构：
┌──────────────────────────────────────┐
│          前端埋点 SDK                 │
├──────────────────────────────────────┤
│ 采集层                                │
│ - 用户行为：click / scroll / route    │
│ - 性能指标：LCP / FCP / 长任务        │
│ - 错误：window.onerror / unhandled    │
│ - 接口：拦截 fetch/XHR                │
├──────────────────────────────────────┤
│ 上报层                                │
│ - navigator.sendBeacon（页面卸载）    │
│ - 批量合并 + 节流                     │
│ - requestIdleCallback 空闲上报        │
│ - 采样率控制                          │
├──────────────────────────────────────┤
│ 存储层（服务端）                       │
│ - Kafka 消息队列                      │
│ - ClickHouse / ES 存储                │
│ - 实时看板 + 离线分析                  │
└──────────────────────────────────────┘

关键实现：
- 页面访问：拦截 history.pushState / popstate / hashchange
- 元素曝光：IntersectionObserver
- 元素点击：事件委托 + 冒泡到 body 统一处理
- 页面停留：visibilitychange + beforeunload
- 用户轨迹：Session Replay（rrweb 录制 DOM 变化）
```

---

## 复习卡片

> [!TIP]
> **快速复习清单**
>
> 1. **Monorepo**：pnpm workspace + Turborepo 主流组合，Nx 企业级
> 2. **pnpm 优势**：硬链接 + 严格 node_modules，快 3 倍、省磁盘、防幽灵依赖
> 3. **微前端方案**：qiankun（沙箱）、Module Federation（模块共享）、无界（iframe 强隔离）
> 4. **qiankun 原理**：HTML Entry + Proxy 沙箱 + 样式隔离
> 5. **组件库设计**：多入口打包（ESM/CJS/UMD）+ sideEffects + 按需引入
> 6. **主题方案**：CSS 变量（运行时切换）> Sass 变量（构建时）> CSS-in-JS
> 7. **SemVer**：major.minor.patch，破坏性变更升 major
> 8. **package.json 入口**：main(CJS) / module(ESM) / types / exports（现代）
> 9. **代码质量链路**：ESLint + Prettier + husky + lint-staged + commitlint
> 10. **测试金字塔**：单元 70% + 集成 20% + E2E 10%
> 11. **CI/CD**：PR 阶段自动检查 + 主分支自动部署测试环境 + 灰度发布到生产
> 12. **灰度**：Nginx 权重 / 版本目录 / 特性开关，配错误率监控自动回滚
> 13. **埋点**：sendBeacon + 批量节流 + 采样率，Kafka + ClickHouse 存储

---

> [!TIP]
> 下一篇：[实时通信面试题](/blog/posts/interview-guide-16-realtime/) 涵盖 WebSocket 协议与握手、心跳重连、SSE、WebRTC、协同编辑（OT/CRDT）、直播弹幕等场景。
>
> 返回 [面试宝典总览](/blog/posts/interview-guide-00-overview/) | [面试宝典合集页](/blog/interview-guide/)
