---
title: '开张大吉：这个博客是怎么搭起来的'
published: 2026-08-31
description: '从零用 Astro 搭一个静态博客，记录技术选型、目录结构和第一篇内容是怎么写出来的。'
tags: [Astro, 博客]
category: 随笔
draft: false
---

第一篇文章，简单说说这个站的来历。

## 为什么选 Astro

一开始纠结过几个方案，最后选 Astro 的理由很直接：

1. **默认就是静态的** —— 页面在构建期渲染成 HTML，浏览器拿到的不是一堆需要现场拼装的 JS。
2. **只有需要交互的地方才加载 JS** —— 搜索框、主题切换这类组件单独激活，文章正文一个字节都不用。
3. **产物就是一堆文件** —— 丢给 nginx 就能跑，服务器上不用再跑一个 Node 进程。

## 目录长什么样

```text
src/
├── components/    组件：导航栏、文章卡片、侧栏、主题切换
├── content/       文章都在这里：posts/ 一个 .md 一篇，spec/ 放关于页
├── layouts/       页面骨架（MainGridLayout 负责整体栅格）
├── pages/         路由：首页、归档、各学习路线聚合页、关于
├── config.ts      站点信息与导航栏配置，改站名/导航就动这里
└── constants/     常量：页面宽度、路线模块注册表
```

## 写一篇新文章

不用手动建文件，跑一条命令：

```bash
npm run new-post -- my-new-post
```

然后在 `src/content/posts/` 里编辑生成的 `.md`，开头写 frontmatter：

```yaml
---
title: '文章标题'
published: 2026-08-31T10:00:00+08:00
description: '一句话简介，会显示在列表页和 RSS 里'
tags: [标签1, 标签2]
category: 随笔
draft: false
---
```

**文件名就是 URL**，比如 `hello-world.md` 对应 `/posts/hello-world/`。`draft: true` 的文章构建时不会发布。

> 本地预览跑 `npm run dev`，保存即热更新；发布走 git push，CI 自动构建部署。

## 这个站现在有什么

- **学习路线**：TypeScript / JavaScript / React / 工程化 / 浏览器与性能 / Node 全栈 / AI 应用开发 / 算法手写题 / Java / RuoYi / Higress / Python，共 12 条，入口在导航「路线」
- **面试宝典**：22 个专题的面试向整理
- **NoteLab 实战**：自研全栈项目的踩坑实录
- **随笔与教程**：路线之外的零散沉淀

下一篇会写 Markdown 的常用语法速查，方便以后写文章时对照。
