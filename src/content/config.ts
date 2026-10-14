import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
/**
 * 练习题解答：与 posts 完全隔离的独立集合。
 * 所有列表页（首页 / 归档 / RSS）都只查 posts，所以解答不会冲垮文章流。
 */
const solutionsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		/** 所属模块，如 algo / typescript，与路线模块 slug 前缀一致 */
		module: z.string().default(""),
		/** 关联的路线文章 slug（不带前缀路径），用于双向跳转 */
		relatedPost: z.string().default(""),
		/** 在所属文章练习清单里的序号，用于排序与对齐 */
		order: z.number().optional().default(0),
		difficulty: z.enum(["简单", "中等", "困难"]).optional().default("中等"),
		tags: z.array(z.string()).optional().default([]),
		lang: z.string().optional().default(""),
	}),
});

const specCollection = defineCollection({
	schema: z.object({}),
});
export const collections = {
	posts: postsCollection,
	solutions: solutionsCollection,
	spec: specCollection,
};
