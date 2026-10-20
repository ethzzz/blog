// Notelab 草稿预览接口的客户端 —— 博客侧取「正在编辑、还没写进仓库」的草稿的**唯一出口**。
//
// 与 practice-api.ts 同源的理由：SSR 进程与 Java 后端同机，直连 127.0.0.1 省掉出网绕行，
// 也不把 nginx 的证书/域名依赖引进来。⚠️ 同样只在**服务端**发生（页面 prerender=false）。
//
// ⚠️ 用 process.env 而不是 import.meta.env：后者会被 Vite 在构建时静态替换成字面量，
//    构建机上没设就永远是 undefined（换端口/换机都得重新构建）。见 practice-api.ts 的说明。
// ⚠️ 复用同一个后端地址变量：NOTELAB_API 是更准确的名字（这个后端不只服务练习实践），
//    但要兼容已经配好的 PRACTICE_API —— 两个都不设才回落到默认本机端口。
const BASE =
	process.env.NOTELAB_API ??
	process.env.PRACTICE_API ??
	"http://127.0.0.1:8001";

export type DraftPreview = {
	/** post（博客文章）或 solution（练习解答）—— 决定用哪套布局渲染 */
	kind: string;
	title: string;
	description: string;
	tags: string[];
	category: string;
	draft: boolean;
	published: string;
	/** 仅解答用 */
	difficulty: string;
	/** 仅解答用：关联的路线文章 slug（解答页据此显示「返回原题」） */
	relatedPost: string;
	body: string;
	slug: string;
};

/**
 * 取一份预览内容。token 不存在/已过期 → null（页面据此说「预览已过期」，不当异常）。
 *
 * ⚠️ `expectKind` 不符也当作 null：文章与解答是**两条**预览路由，各认自己的类型。
 * 拿文章 token 去解答路由渲染会出一张字段不全的页，不如 404 干脆。
 */
export async function fetchPreview(
	token: string,
	expectKind: "post" | "solution" = "post",
): Promise<DraftPreview | null> {
	const res = await fetch(
		`${BASE}/api/blog/preview/${encodeURIComponent(token)}`,
	);
	if (res.status === 404) return null;
	if (!res.ok) throw new Error(`预览接口返回 HTTP ${res.status}`);
	const data = (await res.json()) as DraftPreview;
	if (data.kind && data.kind !== expectKind) return null;
	return data;
}
