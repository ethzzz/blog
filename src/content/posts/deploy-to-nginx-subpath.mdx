---
title: '把 Astro 站点挂到 nginx 的 /blog 路径下'
published: 2026-08-28
description: '子路径部署不是加个 location 就完事，记录 base 配置、资源前缀和几个容易踩的坑。'
tags: [Astro, nginx, 部署]
category: 教程
draft: false
---

把静态站部署到域名的根路径很简单，挂到子路径（比如 `/blog`）就会遇到几个坑。记录一下完整过程。

## 第一步：告诉 Astro 站点在子路径

`astro.config.mjs` 里加一行：

```js
export default defineConfig({
	site: 'https://example.com',
	base: '/blog',
});
```

`base` 会让 Astro 把 CSS、JS、图片这些资源的引用自动加上 `/blog` 前缀。构建完看一眼 `dist/index.html`，里面的 `/_astro/xxx.css` 应该已经变成 `/blog/_astro/xxx.css`。

## 第二步：手写的链接要自己补前缀

**这是最容易漏的一点**：`base` 只处理 Astro 自己生成的资源引用，你写在模板里的 `<a href="/posts">` **不会**自动加前缀，点了会跳到网站根目录。

解决办法是统一用一个辅助函数拼路径：

```ts
export const BASE = import.meta.env.BASE_URL;

export function url(path: string): string {
	if (path === '/') return `${BASE}/`;
	return `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
}
```

模板里统一写 `href={url('/posts')}`，输出就是 `/blog/posts`。

## 第三步：注意路由重名

模板默认把文章放在 `src/pages/blog/`，如果站点又挂在 `/blog` 下，最终 URL 会变成 `/blog/blog/xxx` 这种叠床架屋的路径。

我把它改名成了 `src/pages/posts/`，最终地址干净：

- 首页 `/blog/`
- 文章列表 `/blog/posts`
- 文章详情 `/blog/posts/hello-world`

## 第四步：nginx 配置

用 `alias` 指向静态文件目录，注意 `alias` 的目录路径要带结尾斜杠：

```nginx
location ^~ /blog {
    alias /var/www/blog/;
    index index.html;
    try_files $uri $uri/ $uri/index.html =404;
}
```

配完先 `nginx -t` 校验，再 `nginx -s reload`，不要直接 restart——万一配置有语法错误，reload 会拒绝加载而保持旧配置运行，restart 可能直接把站点搞挂。

## 第五步：absolute URL 相关的坑

RSS 和 sitemap 里的链接需要绝对地址，`new URL('rss.xml', Astro.site)` 会生成 `https://example.com/rss.xml`，**丢失 `/blog` 前缀**。要手动补：

```ts
const rssHref = new URL(`${BASE}/rss.xml`.slice(1), Astro.site).href;
```

## 小结

子路径部署的核心就一句话：**Astro 管资源，你管链接**。资源前缀它自动加，手写的 `href` 得自己拼。改完记得全局搜一遍 `href="/` 确认没有漏网的。
