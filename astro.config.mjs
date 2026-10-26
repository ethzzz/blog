import mdx from "@astrojs/mdx";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import swup from "@swup/astro";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import { expressiveCodeOptions } from "./src/expressive-code-config.ts";
import { rehypePlugins, remarkPlugins } from "./src/markdown-plugins.mjs";

// https://astro.build/config
export default defineConfig({
	site: "https://haolo.cloud",
	base: "/blog",
	trailingSlash: "always",
	// 旧链接兜底：模块重排后保留跳转页，避免外部书签/RSS 里的旧地址 404。
	// ⚠️ value 必须手写 `/blog` 前缀：Astro 不会把 base 自动加到 redirect 目标上，
	//    而 key 不能带前缀（否则产物会落到 dist/client/blog/blog/...）。
	redirects: {
		// 前端工程化（2026-10-26）：毕业项目 12 → 15
		"/posts/engineering-roadmap-12-project-delivery-gates/":
			"/blog/posts/engineering-roadmap-15-project-delivery-gates/",
		// TypeScript（2026-10-26）：装饰器并入 05、模块/namespace 并入 12，其余整体重排
		"/posts/typescript-roadmap-10-decorators/": "/blog/posts/typescript-roadmap-05-class-and-oop/",
		"/posts/typescript-roadmap-11-modules/": "/blog/posts/typescript-roadmap-12-declaration-files/",
		"/posts/typescript-roadmap-13-engineering-tsconfig/":
			"/blog/posts/typescript-roadmap-14-tsconfig-performance/",
		"/posts/typescript-roadmap-14-framework-integration/":
			"/blog/posts/typescript-roadmap-16-framework-integration/",
		"/posts/typescript-roadmap-15-project-type-safe-sdk/":
			"/blog/posts/typescript-roadmap-17-project-type-safe-sdk/",
		// JavaScript（2026-10-26）：按教学顺序重排 03/04/06/07（执行上下文与 this 提到闭包之前）
		"/posts/js-roadmap-03-prototype-chain/": "/blog/posts/js-roadmap-06-prototype-chain/",
		"/posts/js-roadmap-04-inheritance/": "/blog/posts/js-roadmap-07-inheritance/",
		"/posts/js-roadmap-06-this-binding/": "/blog/posts/js-roadmap-04-this-binding/",
		"/posts/js-roadmap-07-execution-context/": "/blog/posts/js-roadmap-03-execution-context/",
		// React（2026-10-26）：三层重构，条件渲染并入 03、路由与数据拆成 09/11、后续整体后移
		"/posts/react-roadmap-03-events-forms/": "/blog/posts/react-roadmap-04-events-forms/",
		"/posts/react-roadmap-04-render-list-key/": "/blog/posts/react-roadmap-03-render-and-keys/",
		"/posts/react-roadmap-09-performance/": "/blog/posts/react-roadmap-12-performance/",
		"/posts/react-roadmap-10-router-data/": "/blog/posts/react-roadmap-11-routing/",
		"/posts/react-roadmap-11-engineering-pitfalls/":
			"/blog/posts/react-roadmap-16-engineering-pitfalls/",
		"/posts/react-roadmap-12-project-task-board/":
			"/blog/posts/react-roadmap-17-project-task-board/",
	},
	// 混合渲染（hybrid）：整站仍是静态产物（默认 prerender=true），
	// 只有 src/pages/solutions/ 下的两个页面显式 `export const prerender = false`。
	// 为什么必须这样：解答内容改由数据库（Notelab 的 /api/practice/public/**）供给，
	// 后台发布后要**立刻**可见 —— 构建期固化成 HTML 就必然要重建+重新部署。
	// ⚠️ adapter 是「有页面要运行时渲染」的前提，没有它 `prerender = false` 直接报错。
	//    standalone 模式产出 dist/server/entry.mjs，由 pm2 直接 node 起来（见 ops 部署脚本）。
	adapter: node({ mode: "standalone" }),
	integrations: [
		tailwind({
			nesting: true,
		}),
		swup({
			theme: false,
			animationClass: "transition-swup-", // see https://swup.js.org/options/#animationselector
			// the default value `transition-` cause transition delay
			// when the Tailwind class `transition-all` is used
			containers: ["main", "#toc"],
			smoothScrolling: true,
			cache: true,
			preload: true,
			accessibility: true,
			updateHead: true,
			updateBodyClass: false,
			globalInstance: true,
		}),
		icon({
		include: {
			"fa6-brands": ["*"],
				"fa6-regular": ["*"],
				"fa6-solid": ["*"],
			},
		}),
		// ⚠️ 配置在 src/expressive-code-config.ts —— 运行时渲染（src/utils/runtime-markdown.ts）
		// 用的是同一份，两处漂移会导致「静态页的代码块与解答页不一样」。
		expressiveCode(expressiveCodeOptions),
        svelte(),
		// MDX 与 Markdown 共用下方 markdown.remarkPlugins / rehypePlugins（默认 extendMarkdownConfig）。
		// optimize：把静态 JSX 在编译期折叠成 HTML，降低构建期组件/模块驻留内存。
		mdx({ optimize: true }),
		sitemap(),
	],
	// ⚠️ 插件清单在 src/markdown-plugins.ts —— 同样被运行时渲染复用，别在这里写第二份。
	markdown: {
		remarkPlugins,
		rehypePlugins,
	},
	vite: {
		build: {
			rollupOptions: {
				onwarn(warning, warn) {
					// temporarily suppress this warning
					if (
						warning.message.includes("is dynamically imported by") &&
						warning.message.includes("but also statically imported by")
					) {
						return;
					}
					warn(warning);
				},
			},
		},
	},
});
