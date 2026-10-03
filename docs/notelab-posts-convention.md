# notelab 分组 · 写作与发布约定

> 用途：给**后续会话/agent**看的机读约定。notelab 分组的文章一律遵守本文，避免每次重新猜。
> 位置：`docs/` 目录不参与构建发布，本文不会出现在博客正文中。

## 1. 分组怎么成立

博客的分类**只由 frontmatter 的 `category` 字段决定**（`src/content/config.ts` 里 `category: z.string().optional().nullable().default("")`），
与文件目录无关。目录始终用 `src/content/posts/`。

| 项 | 值 |
|---|---|
| category | `notelab`（固定，不要写成 `NoteLab` / `notelab 笔记`） |
| 目录 | `src/content/posts/` |
| 文件命名 | `notelab-<两位序号>-<英文短横线 slug>.md`，如 `notelab-01-local-env-setup.md` |
| 序号 | 从 `01` 起递增，**只增不改重**（发布过的文章改序号会换 URL） |

## 2. Frontmatter 模板

```yaml
---
title: '中文标题'
published: YYYY-MM-DD
description: '一到两句话，说清这篇解决什么问题'
tags: [NoteLab, 主题词, 技术点]
category: notelab
draft: false
---
```

- `title` 用中文，`published` 用当天日期（可带时间 `YYYY-MM-DDTHH:mm:ss+08:00`）
- `description` 会显示在列表页，**不要留空**
- `tags` 3–5 个，第一个固定 `NoteLab`
- 草稿走 `draft: true`（不发布），定稿改 `false`

## 3. 内容风格

- **工程实录**，不是教科书：写「我撞到了什么 → 为什么 → 怎么解决」
- 必须有**实测证据**：真实报错原文、真实输出、真实路径
- 坑要编号成清单，方便以后回查
- 可用 Fuwari callout：`> [!NOTE]` / `> [!TIP]` / `> [!WARNING]`

## 4. 脱敏红线（公开博客，必须遵守）

以下内容**禁止**出现在任何文章里：

- 服务器 **IP 地址**（历史上有过泄露，旧 commit 里还留着）
- 任何**密码 / 密钥 / token 真值**（MySQL 密码、API Key、session 值）
- 内部绝对路径里的用户名（如 `C:\Users\xxx\...` 写成 `C:\Users\<你>\...`）

替代写法：服务器统一写域名 `haolo.cloud`；凭据只写**键名**（`MYSQL_PASSWORD`）不写值；本地路径用占位符。

## 5. 篇目索引（新增一篇就追加一行）

| 序号 | 文件 | 标题 | 发布 |
|---|---|---|---|
| 01 | `notelab-01-local-env-setup.md` | NoteLab 本地开发环境的准备 | 2026-10-03 |

## 6. 发布流程

```bash
cd E:/code/astro-blog-fuwari
npm run build          # astro build + pagefind（务必先本地构建验证 frontmatter）
# 确认无误后走 deploy.sh 或推 GitHub 触发 Actions
```

- 提交前先本地 `npm run build`，frontmatter 不合法会直接构建失败
- 提交信息格式：`docs(blog): 新增 notelab-01 本地环境准备`
