// Notelab 草稿预览接口的客户端 —— 博客侧取「正在编辑、还没写进仓库」的草稿的**唯一出口**。
//
// 与 practice-api.ts 同源的理由：SSR 进程与 Java 后端同机，直连 127.0.0.1 省掉出网绕行，
// 也不把 nginx 的证书/域名依赖引进来。⚠️ 同样只在**服务端**发生（页面 prerender=false）。
//
// ⚠️ 用 process.env 而不是 import.meta.env：后者会被 Vite 在构建时静态替换成字面量，
//    构建机上没设就永远是 undefined（换端口/换机都得重新构建）。见 practice-api.ts 的说明。
// ⚠️ 复用同一个后端地址变量：NOTELAB_API 是更准确的名字（这个后端不只服务练习实践），
//    但要兼容已经配好的 PRACTICE_API —— 两个都不设才回落到默认本机端口。
const BASE = process.env.NOTELAB_API ?? process.env.PRACTICE_API ?? "http://127.0.0.1:8001";

export type DraftPreview = {
	title: string;
	description: string;
	tags: string[];
	category: string;
	draft: boolean;
	published: string;
	body: string;
	slug: string;
};

/** 取一份预览草稿。token 不存在/已过期 → null（页面据此说「预览已过期」，不当异常）。 */
export async function fetchPreview(token: string): Promise<DraftPreview | null> {
	const res = await fetch(`${BASE}/api/blog/preview/${encodeURIComponent(token)}`);
	if (res.status === 404) return null;
	if (!res.ok) throw new Error(`预览接口返回 HTTP ${res.status}`);
	return (await res.json()) as DraftPreview;
}
