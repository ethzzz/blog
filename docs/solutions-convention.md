# 练习题解答写作与发布规范

解答内容与文章（`src/content/posts/`）**完全隔离**：不进首页瀑布流、不进归档、不进 RSS，只出现在 `/blog/solutions/` 下，但同样会被站内搜索（Pagefind）和 sitemap 收录。

## 1. 文件放哪

```
src/content/solutions/
```

一篇练习解答 = 一个 `.md` 文件，**文件名就是访问路径**。

## 2. 创建方式（推荐，避免手写 frontmatter 出错）

```bash
npm run new-solution -- algo-02-ex01-reverse-string
```

脚本会生成带完整 frontmatter 的骨架，并**从文件名自动推断** `module` 和 `order`。

## 3. 命名规则

```
<模块前缀>-<篇章号>-ex<题号>-<英文短名>.md
│          │         │
│          │         └─ 该篇练习清单里的第几题 → order
│          └─ 对应路线文章的序号（02 = algo-roadmap-02-string-and-regex）
└─ 模块前缀 → module
```

| 文件名 | 生成 URL |
|---|---|
| `algo-02-ex01-reverse-string.md` | `/blog/solutions/algo-02-ex01-reverse-string/` |
| `typescript-03-ex02-pick.md` | `/blog/solutions/typescript-03-ex02-pick/` |

模块前缀与路线文章的对应关系（`src/constants/roadmap-modules.ts` 是单一数据源）：

`algo` 算法与手写题 · `typescript` TypeScript · `js` JavaScript · `react` React · `engineering` 前端工程化 · `browser` 浏览器与性能 · `node` Node 全栈 · `ai-app` AI 应用开发 · `java` Java · `python` Python · `ruoyi` RuoYi · `higress` Higress

文件名用英文短名，URL 干净；中文标题写在 `title` 里。

## 4. frontmatter 字段

| 字段 | 必填 | 说明 | 默认值 |
|---|---|---|---|
| `title` | ✅ | 页面标题，也是搜索命中的标题 | — |
| `published` | ✅ | `YYYY-MM-DD` | 脚本自动填当天 |
| `description` | 建议 | SEO 摘要，留空则回退为 title | `""` |
| `module` | 建议 | 模块前缀 | 从文件名推断 |
| `relatedPost` | 建议 | 所属路线文章的 slug（**不带路径**） | `""` |
| `order` | 建议 | 题号，决定聚合页排序与「上一题/下一题」 | 从文件名推断 |
| `difficulty` | 选 | **只能是** `简单` / `中等` / `困难` | `中等` |
| `tags` | 选 | 数组 | `[]` |
| `draft` | 选 | `true` 时生产环境不生成页面 | `false` |
| `lang` | 选 | 语言标记 | `zh-CN` |

示例：

```yaml
---
title: "LeetCode 344 · 反转字符串：双指针交换"
published: 2026-10-14
description: "原地反转字符数组，双指针交换的基本功题。"
module: algo
relatedPost: algo-roadmap-02-string-and-regex
order: 1
difficulty: 简单
tags: ["算法", "双指针", "LeetCode"]
draft: false
lang: zh-CN
---
```

`relatedPost` 填路线文章的文件名（去掉 `.md`），例如 `algo-roadmap-02-string-and-regex`。它决定两件事：聚合页把这道题归到哪一组，以及单题页顶部「返回原题」链接指向哪。

## 5. 正文结构（建议，可自由发挥）

```markdown
## 题目      ← 题面 + 一个输入输出示例
## 思路      ← 为什么这么做，最好有手推过程
## 代码      ← 用 ```ts 标注语言，才有语法高亮和语言徽章
## 复杂度    ← 时间和空间
## 复盘      ← 这道题真正值钱的地方 / 工程里的联想
```

代码块务必标注语言（`` ```ts `` / `` ```js ``），否则会退化成纯文本样式。

## 6. 在原文里加跳转链接

写完解答后，回到对应的路线文章，在练习清单里加上链接：

```markdown
1. 344. 反转字符串 —— 双指针交换基本功。[查看解答 →](/blog/solutions/algo-02-ex01-reverse-string/)
```

两个坑：

- **必须带 `/blog` 前缀**，这是全站内链的约定（现有 266 处都是这么写的），漏了会 404
- 文章本身的 URL 是 `/blog/posts/<slug>/`（注意是 `posts` 复数）

## 7. 本地预览

```bash
npm run dev
# 或 ./dev.sh
```

打开 <http://localhost:4321/blog/solutions/>（**必须带 `/blog` 前缀**，否则 404）。

## 8. 发布

```bash
git add src/content/solutions/
git commit -m "docs(solutions): 新增 xxx 解答"
git push origin main      # 推上去就完了
```

push 到 `main` 会触发 GitHub Actions 自动构建并部署到服务器，约 3–5 分钟生效（Actions 偶尔会在 scp 上传那一步卡住，可以在 Actions 页面 Re-run，或者本地跑 `./deploy.sh` 兜底）。

## 9. 发布前自检

```bash
npm run check    # 校验 frontmatter 是否符合 schema
npm run build    # 完整构建，确认不报错
```

## 10. 常见报错对照

| 现象 | 原因 |
|---|---|
| 构建报 `does not match collection schema` | frontmatter 字段类型不对，最常见是 `difficulty` 写了枚举外的值（如「简单题」） |
| 构建报 YAML 解析错误 | `tags` 里 `@` 开头的标签（如 `@types`）**没加引号** |
| 聚合页里被归到「独立分组」 | `relatedPost` 没填或填错 |
| 页面 404 | `draft: true`，或文件名拼错 |
| 原文里的解答链接 404 | 漏写 `/blog` 前缀 |
| 代码没有高亮 | 代码块没标语言 |
| 题序排错 | `order` 没填或与文件名里的 `ex<n>` 不一致 |
