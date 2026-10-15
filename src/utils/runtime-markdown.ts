// 运行时 Markdown 渲染 —— 让接口驱动的解答页拿到与**构建期完全一致**的 HTML。
//
// 为什么不把 markdown 原样交给浏览器渲染：这个站的内容渲染是一条**构建期管线**
// （expressive-code 代码高亮 / KaTeX / admonition 提示块 / 标题锚点 / 阅读时长）。
// 解答页每篇都有若干代码块，高亮是内容的一部分，不是装饰；客户端换一套库必然掉画质，
// 还要把这段体积加到每个访客身上。
//
// 做法：把构建期那套插件在运行时原样再跑一遍（createMarkdownProcessor 就是 Astro 内部
// 用的处理器），插件清单一律取自 src/markdown-plugins.ts 与 src/expressive-code-config.ts。
//
// ⚠️ 处理器与 renderer **只建一次**（进程级缓存）：createMarkdownProcessor 要加载 shiki
// 与所有插件、createRenderer 要编译主题，每请求建一次会让首字节慢到几百毫秒。
import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import rehypeExpressiveCode, { createRenderer } from "rehype-expressive-code";
import { expressiveCodeOptions } from "../expressive-code-config";
import { rehypePlugins, remarkPlugins } from "../markdown-plugins.mjs";

export type MarkdownHeading = { depth: number; slug: string; text: string };

export type RenderedMarkdown = {
	html: string;
	headings: MarkdownHeading[];
	words: number;
	minutes: number;
};

type EcRenderer = Awaited<ReturnType<typeof createRenderer>>;

let rendererPromise: Promise<EcRenderer> | null = null;
let processorPromise: Promise<{
	render: (md: string) => Promise<{ code: string; metadata: unknown }>;
}> | null = null;

async function getRenderer(): Promise<EcRenderer> {
	if (!rendererPromise) {
		rendererPromise = createRenderer(expressiveCodeOptions as never);
	}
	return rendererPromise;
}

async function getProcessor() {
	if (!processorPromise) {
		processorPromise = (async () => {
			const renderer = await getRenderer();
			return (await createMarkdownProcessor({
				remarkPlugins: remarkPlugins as never,
				rehypePlugins: [
					...(rehypePlugins as never[]),
					// ⚠️ 必须写成 [attacher, options] 两元组，而不是 rehypeExpressiveCode(options) 的返回值：
					//    后者拿到的是 transformer，unified 会把 transformer 再当 attacher 调一次，直接崩。
					[
						rehypeExpressiveCode as never,
						{ ...expressiveCodeOptions, customCreateRenderer: () => renderer },
					],
				],
				// 交给 expressive-code，别再让 Astro 自带的 shiki 染一遍
				syntaxHighlight: false,
			})) as never;
		})();
	}
	return processorPromise;
}

/** 渲染一篇解答的正文（含代码高亮、提示块、标题锚点） */
export async function renderMarkdown(md: string): Promise<RenderedMarkdown> {
	const processor = await getProcessor();
	const result = await processor.render(md);
	const meta = (result.metadata ?? {}) as {
		headings?: MarkdownHeading[];
		frontmatter?: { words?: number; minutes?: number };
	};
	return {
		html: result.code,
		headings: meta.headings ?? [],
		words: Number(meta.frontmatter?.words ?? 0),
		minutes: Number(meta.frontmatter?.minutes ?? 0) || 1,
	};
}

/**
 * expressive-code 的样式与前端脚本。
 *
 * 构建期这些由 astro-expressive-code 集成自动注入每个页面；运行时渲染的页面没有那一步，
 * 必须自己带上 —— 否则代码块会「有 HTML 但没样式」，渲染出一坨没高亮的纯文本。
 */
export async function expressiveCodeAssets(): Promise<{
	styles: string;
	scripts: string[];
}> {
	const r = (await getRenderer()) as unknown as {
		baseStyles?: string;
		themeStyles?: string;
		jsModules?: (string | { code?: string })[];
	};
	return {
		styles: `${r.baseStyles ?? ""}${r.themeStyles ?? ""}`,
		scripts: (r.jsModules ?? [])
			.map((m) => (typeof m === "string" ? m : (m?.code ?? "")))
			.filter(Boolean),
	};
}
