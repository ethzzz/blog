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
├── components/    组件：页头、页脚、主题切换、评论
├── content/blog/  文章都在这里，一个 .md 文件一篇
├── layouts/       页面骨架
├── pages/         路由：首页、文章列表、搜索、关于
└── consts.ts      站点信息，改站名改描述就动这里
```

## 写一篇新文章

在 `src/content/blog/` 下新建一个 `.md` 文件，开头写 frontmatter：

```yaml
---
title: '文章标题'
description: '一句话简介，会显示在列表页和 RSS 里'
pubDate: 2026-08-31
---
```

然后往下写正文即可。**文件名就是 URL**，比如 `hello-world.md` 对应 `/posts/hello-world/`。

> 改完执行 `npm run build`，产物在 `dist/` 目录里。

## 接下来

- 换掉站名和描述：改 `src/consts.ts`
- 换掉这个页面：改 `src/pages/index.astro`
- 开评论：在 `src/consts.ts` 填 Giscus 配置

下一篇会写 Markdown 的常用语法速查，方便以后写文章时对照。
