// Notelab 解答接口的客户端 —— 博客侧读解答的**唯一出口**。
//
// 为什么走 127.0.0.1 而不是公网域名：SSR 进程与 Java 后端在同一台机器上，
// 直连本机端口省掉一次「出网再回来」的绕行（hairpin），也避免把 nginx 的证书/域名
// 依赖引进来 —— 接口挂了只会让解答页报错，不会连累整站。
//
// ⚠️ 这个 fetch 只在**服务端**发生（页面是 prerender=false），所以：
//   1) 不能把 BASE 暴露成 PUBLIC_ 前缀的变量（那是给浏览器看的）；
//   2) 接口挂了要在页面上**明说**，而不是渲染成一堆空白 —— 见调用方的 error 分支。
// ⚠️ 刻意用 process.env 而不是 import.meta.env：后者会被 Vite 在**构建时**静态替换成字面量，
//    构建机上没设这个变量就会被替换成 undefined —— 之后再 export 环境变量也不起作用
//    （表现为「明明设了 PRACTICE_API，跑起来还是连默认地址」）。
//    process.env 是运行时读取，换端口/换机部署都不用重新构建。
const BASE = process.env.PRACTICE_API ?? "http://127.0.0.1:8001";

export type PublicSolution = {
	slug: string;
	title: string;
	module: string;
	chapter: string;
	order: number;
	difficulty: string;
	tags: string[];
	description: string;
	relatedPost: string;
	published: string;
	updated: string;
};

export type PublicSolutionDetail = PublicSolution & {
	content: string;
	prev: PublicSolution | null;
	next: PublicSolution | null;
};

/** 已发布的解答清单（不含正文）。接口异常时抛错，由调用方决定怎么呈现。 */
export async function fetchSolutions(): Promise<PublicSolution[]> {
	const res = await fetch(`${BASE}/api/practice/public/solutions`);
	if (!res.ok) throw new Error(`解答接口返回 HTTP ${res.status}`);
	const data = await res.json();
	return (data.items ?? []) as PublicSolution[];
}

/** 单篇解答（含正文）。找不到返回 null（404 是正常情况，不当异常）。 */
export async function fetchSolution(slug: string): Promise<PublicSolutionDetail | null> {
	const res = await fetch(`${BASE}/api/practice/public/solutions/${encodeURIComponent(slug)}`);
	if (res.status === 404) return null;
	if (!res.ok) throw new Error(`解答接口返回 HTTP ${res.status}`);
	return (await res.json()) as PublicSolutionDetail;
}
