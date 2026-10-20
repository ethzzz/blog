# 博客内容生产链路：仓库、后台生成与运行时接口

> 用途：回答「新模块的内容到底放仓库，还是后台生成后由博客请求列表」这个问题，避免每次重新讨论。
> 位置：`docs/` 不参与构建，本文不会出现在博客正文里。

## 1. 结论先说

| 内容类型 | 真相源 | 博客怎么读 | 后台能不能生成 |
| :-- | :-- | :-- | :-- |
| 学习路线文章（`posts`） | **仓库里的 md** | 构建期 `getCollection("posts")` | 能起草/发布（写仓库 + 触发构建），但**模块壳子要改代码** |
| 练习解答（`solutions`） | **数据库** | 运行期 `GET /api/practice/public/solutions` | 能，发布即生效（秒级） |
| 草稿预览 | 数据库短时存储 | 运行期 `/api/blog/preview/<token>`，`noindex` | 能，30 分钟 TTL |

一句话：**路线文章的内容放仓库（可以由后台代写），列表由构建期读取；不要为 posts 另加一套运行时列表接口。** 解答是唯一的例外，它已经是数据库 + 运行时接口。

## 2. 现状证据（别再猜）

- `src/pages/roadmaps.astro`、`xxx-roadmap.astro`、首页分页、归档、标签、`rss.xml.ts`、`sitemap`、Pagefind 索引，全部在**构建期**从 `src/content/posts` 生成。
- 后台 `/admin/blog-gen` 的「新建 / 更新」调用 Java `BlogContentController` → `BlogArticleService` → `BlogRepoService`，最终是**往服务器上的博客仓 clone（`/root/blog-src`）写 `src/content/posts/*.md` → git commit/push**。它不是另一套内容库。
- 后台 `/admin/blog-deploy` 触发服务器本地构建（实测约 80 秒），发布后博客是新的静态产物；GitHub Actions 那条链路仍在，但 scp 上传实测很慢，不作为主发布路径。
- 解答（`solutions`）2026-10-15 起改为「数据库为真相 + 博客运行时读接口」，因为解答数量多、单条小、要求发布即生效；而且它有独立的 `solutions` collection 与聚合页，不参与首页/归档/RSS。
- 预览页 `src/pages/preview/[token].astro` 是 `prerender = false`，正文运行时取、渲染管线与线上一致，仅用于未发布草稿。

## 3. 为什么 posts 不做运行时列表

1. **静态站的核心资产是构建期产物**：RSS、sitemap、Pagefind 全文索引、归档分页、上一篇/下一篇，都是在构建时算好的。列表改成接口，这些要么退化，要么得再写一套运行时索引。
2. **SEO 与首屏**：文章列表是主要入口页，静态 HTML 直接可索引；运行时拉取会引入空白首屏与接口故障面。
3. **单一真相源**：一旦接口也维护一份文章清单，slug、分类、发布时间就会出现两份，迟早漂移。后台已经是「写仓库」的定位，没必要再引入第二套存储。
4. **回滚粒度**：仓库的一次 commit 就是一次可回滚的发布；数据库里的文章状态回滚要另做一套。

真正需要「秒级发布」的是解答和小工具这类**碎片内容**，不是撑起整站结构的路线文章。

## 4. 后台能做什么、不能做什么

`/admin/blog-gen` 能：

- 按分类起草一篇 md（LLM 辅助）、落盘、预览、发布、下线、删除
- 用 `GET /api/blog/options` 拿仓内已有的分类/标签候选，避免把 `Docker学习路线` 写成 `Docker 学习路线`

它不能：

- 新建一个路线**模块**。模块 = 注册表条目（`src/constants/roadmap-modules.ts`）+ 聚合页（`src/pages/xxx-roadmap.astro`）+ 分类约定 + 导航项，这些是代码，必须走仓库提交。
- 保证 10 篇文章的编号、互链、术语一致——一次生成一篇可以，整条路线的结构感仍要人（或本地 agent）统一编排。

所以流程是：**模块壳子先在仓库里搭好（一次性），之后每篇文章都可以在后台写。**

## 5. 新增一条路线模块的清单

以 Docker 模块为例，一次提交要动这些地方：

1. `src/constants/roadmap-modules.ts`：在对应分组加一个模块条目（`category` 必须与文章 frontmatter 完全一致）。
2. `src/pages/<module>-roadmap.astro`：复制同组聚合页，改 `category`、slug 正则、标题文案。
3. `src/content/posts/<module>-roadmap-00-overview.md` + 各阶段文章：`category` 固定为 `Xxx学习路线`，slug 前缀 `<module>-roadmap-`，编号连续。
4. 站内计数文案：`src/content/spec/about.md`、`hello-world.md` 里的「N 条路线」。
5. 可选：`notelab-java` 的 `PracticeController.BLOG_MODULES` 加一行，练习解答发布时才能选到该模块（需要重启 Java 生效）。
6. 本地 `npm run build` 验证 frontmatter 与链接，再 push 触发部署。

## 6. 什么时候该重新评估

- 发布频率高到「每次都要等一次构建」成为瓶颈；
- 出现非技术编辑者，需要完全在后台完成「新建模块 + 写文章」；
- 需要按草稿/权限做多级审核。

到那时优先考虑**增量构建 / 按需重建**（构建单页或单模块），而不是把文章列表改成运行时接口。列表接口会把静态站最重要的几个构建期产物一起拖下水。
