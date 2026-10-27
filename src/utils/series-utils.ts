import type { CollectionEntry } from "astro:content";
import { ROADMAP_GROUPS } from "../constants/roadmap-modules";

/**
 * 系列（= 同一 category）的划分与排序。
 *
 * 背景：`getSortedPosts()` 原本按全站发布时间排上一篇/下一篇，
 * 于是「React 路线」的文章会链到「前端工程化」——读者完全不知道为什么连在一起。
 * 这里把同一 category 的文章收成一个系列，系列内按 slug 里的序号排序
 * （`react-roadmap-03-xxx` → 3），序号缺失时退回发布时间升序。
 */

export type PostEntry = CollectionEntry<"posts">;

export type SeriesItem = {
	slug: string;
	/** 原始标题（上一篇/下一篇按钮用它，保留「03 · 」前缀便于对照） */
	title: string;
	/** 去掉前缀序号后的标题，用于系列列表（序号单独渲染成徽标） */
	label: string;
	/** 系列内序号；slug 里解析不到时为 null */
	order: number | null;
};

export type SeriesInfo = {
	/** 分类名，例如「React学习路线」 */
	name: string;
	/** 对应的路线总览页（来自 roadmap-modules 注册表），没有则为 null */
	roadmapUrl: string | null;
	items: SeriesItem[];
	/** 当前文章在 items 里的下标（0 开始） */
	currentIndex: number;
	prev: SeriesItem | null;
	next: SeriesItem | null;
};

/** category → 路线总览页，单一数据源仍是 roadmap-modules.ts */
const ROADMAP_URL_BY_CATEGORY = new Map<string, string>(
	ROADMAP_GROUPS.flatMap((group) => group.modules).map((m) => [
		m.category,
		m.url,
	]),
);

/**
 * 从 slug 里取「最后一段独立数字」作为系列序号。
 *
 * 必须取最后一段：`fullstack-12w-05` 里的 `12w` 不是序号，`05` 才是；
 * `react-roadmap-03-render-and-keys` 只有一个数字，取到 `03`。
 */
export function seriesOrderOf(slug: string): number | null {
	const matches = [...slug.matchAll(/(?:^|-)(\d+)(?=-|$)/g)];
	if (matches.length === 0) return null;
	return Number(matches[matches.length - 1][1]);
}

/** 标题前可能带「03 · 」这类序号，列表里已单独显示序号，这里剥掉避免重复 */
export function stripTitleOrder(title: string): string {
	return title.replace(/^\s*\d+\s*[·、:：.]\s*/, "").trim();
}

/**
 * 建立 slug → 系列信息 的映射。构建期调用一次即可。
 * 单篇分类（如「随笔」）也会返回长度 1 的系列，由调用方决定是否渲染。
 */
export function buildSeriesBySlug(
	entries: PostEntry[],
): Map<string, SeriesInfo> {
	const groups = new Map<string, PostEntry[]>();

	for (const entry of entries) {
		const key = entry.data.category || "未分类";
		const list = groups.get(key);
		if (list) list.push(entry);
		else groups.set(key, [entry]);
	}

	const result = new Map<string, SeriesInfo>();

	for (const [name, list] of groups) {
		const orders = list.map((e) => seriesOrderOf(e.slug));
		const everyPostNumbered = orders.every((o) => o !== null);

		const sorted = [...list].sort((a, b) => {
			if (everyPostNumbered) {
				const oa = seriesOrderOf(a.slug) ?? 0;
				const ob = seriesOrderOf(b.slug) ?? 0;
				if (oa !== ob) return oa - ob;
			}
			return (
				new Date(a.data.published).getTime() -
				new Date(b.data.published).getTime()
			);
		});

		const items: SeriesItem[] = sorted.map((e) => ({
			slug: e.slug,
			title: e.data.title,
			label: stripTitleOrder(e.data.title),
			order: seriesOrderOf(e.slug),
		}));

		const roadmapUrl = ROADMAP_URL_BY_CATEGORY.get(name) ?? null;

		sorted.forEach((entry, index) => {
			result.set(entry.slug, {
				name,
				roadmapUrl,
				items,
				currentIndex: index,
				prev: index > 0 ? items[index - 1] : null,
				next: index < items.length - 1 ? items[index + 1] : null,
			});
		});
	}

	return result;
}
