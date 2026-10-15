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
