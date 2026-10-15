// Markdown 渲染管线（remark + rehype）的**单一真相源**。
//
// 构建期：astro.config.mjs 直接引用这两个数组。
// 运行时：src/utils/runtime-markdown.ts 引用后再追加 expressive-code 的 rehype 插件
//        （构建期那一步由 astro-expressive-code 集成代劳，运行时要自己挂）。
//
// ⚠️ 两边共用一份的意义：接口驱动的解答页是**运行时**渲染的，如果它复制一份插件清单，
// 迟早会与静态页漂移 —— 表现是「同一篇解答，解答页少了提示块样式 / 标题锚点」这类
// 不会报错、只会悄悄变丑的问题。
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive";
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkMath from "remark-math";
import remarkSectionize from "remark-sectionize";
import { AdmonitionComponent } from "./plugins/rehype-component-admonition.mjs";
import { GithubCardComponent } from "./plugins/rehype-component-github-card.mjs";
import { parseDirectiveNode } from "./plugins/remark-directive-rehype.js";
import { remarkExcerpt } from "./plugins/remark-excerpt.js";
import { remarkReadingTime } from "./plugins/remark-reading-time.mjs";

export const remarkPlugins = [
	remarkMath,
	remarkReadingTime,
	remarkExcerpt,
	remarkGithubAdmonitionsToDirectives,
	remarkDirective,
	remarkSectionize,
	parseDirectiveNode,
];

export const rehypePlugins = [
	rehypeKatex,
	rehypeSlug,
	[
		rehypeComponents,
		{
			components: {
				github: GithubCardComponent,
				note: (x, y) => AdmonitionComponent(x, y, "note"),
				tip: (x, y) => AdmonitionComponent(x, y, "tip"),
				important: (x, y) => AdmonitionComponent(x, y, "important"),
				caution: (x, y) => AdmonitionComponent(x, y, "caution"),
				warning: (x, y) => AdmonitionComponent(x, y, "warning"),
			},
		},
	],
	[
		rehypeAutolinkHeadings,
		{
			behavior: "append",
			properties: {
				className: ["anchor"],
			},
			content: {
				type: "element",
				tagName: "span",
				properties: {
					className: ["anchor-icon"],
					"data-pagefind-ignore": true,
				},
				children: [
					{
						type: "text",
						value: "#",
					},
				],
			},
		},
	],
];
