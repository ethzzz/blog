/**
 * 「前端面试宝典」的分组 —— **单一数据源**。
 *
 * 两处都从这里取：页面的分组列表（`src/pages/interview-guide.astro`）、
 * 导航栏「面试宝典」的下拉子菜单（`src/components/Navbar.astro`）。
 *
 * 为什么要有这个文件：这两处原来各自硬编码，粒度与命名都不一样 ——
 * 页面是 7 组、按 slug 前缀匹配；导航是 5 组、按专题编号匹配。
 * 结果是**同一篇文章在两处归属不同**：
 *   · `12-typescript`：页面「进阶必修」 / 导航「语言基础」
 *   · `15-engineering-practice` / `16-realtime`：页面「工程化与网络」 / 导航「性能与实践」
 *   · `17-system-design`：页面「进阶必修」 / 导航「设计与综合」
 * 谁都没错，就是两套账。收成一份之后，改分组只改这里。
 *
 * 归一后的判据是**专题编号**：`interview-guide-12-typescript` → 12。
 * 比 slug 前缀稳：正文改了 slug 后缀（`12-typescript` → `12-ts-in-depth`）不会让文章掉出分组。
 */

/** 面试宝典文章的 category 值（原来在页面与导航里各写了一遍字面量） */
export const INTERVIEW_CATEGORY = "前端面试宝典"

export type InterviewGroup = {
	name: string
	/** 分组主题色：页面用它做竖条与编号圆背景 */
	color: string
	/** 专题编号，对应 slug 里的 `interview-guide-NN-*` */
	nums: number[]
}

/**
 * 分组定义 —— 以**页面**的 7 组为准（导航原来的 5 组是它的压缩版，名字还不同）。
 * 顺序即页面展示顺序；`00-overview` 是总览文章，单独展示，不属于任何组。
 */
export const INTERVIEW_GROUPS: InterviewGroup[] = [
	{ name: "基础三剑客", color: "#f97316", nums: [1, 2, 3] },
	{ name: "框架与跨端", color: "#10b981", nums: [4, 5, 6] },
	{ name: "工程化与网络", color: "#3b82f6", nums: [7, 8, 15, 16] },
	{ name: "后端知识", color: "#8b5cf6", nums: [9, 10, 11, 19] },
	{ name: "进阶必修", color: "#ec4899", nums: [12, 13, 14, 17] },
	{ name: "综合面试", color: "#64748b", nums: [18] },
	{ name: "深水区实战", color: "#0ea5e9", nums: [20, 21] },
]

/** 从 slug 取专题编号：`interview-guide-12-typescript` → 12；取不到返回 0 */
export function interviewNumOf(slug: string): number {
	return Number.parseInt(slug.match(/interview-guide-(\d+)/)?.[1] ?? "0", 10)
}

/**
 * 文章属于哪个分组。
 *
 * @returns 匹配不到时返回 `undefined` —— 调用方**必须**处理这种情况：
 *          原来页面直接用 `if (groupPosts.length > 0)` 渲染，匹配不到的文章会**静默消失**
 *          （归档页还在，但面试宝典页上看不见）。页面那边会把它们收进「未分组」并在构建时告警。
 */
export function interviewGroupOf(slug: string): InterviewGroup | undefined {
	const n = interviewNumOf(slug)
	return INTERVIEW_GROUPS.find((g) => g.nums.includes(n))
}
