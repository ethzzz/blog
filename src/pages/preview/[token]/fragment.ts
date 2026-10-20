// 预览正文的**片段接口**：`GET /blog/preview/<token>/fragment` → JSON。
//
// 用途：后台「文章起草」右侧的实时预览。内容变化时它拿这一小段去替换 iframe 里的正文，
// 而不是让 iframe 重新加载整页。
//
// 为什么不让后台 fetch 整个 `/preview/<token>/?embed=1` 再从中抽出正文：
//   那一页带着 expressive-code 的全部样式与脚本（每份几十 KB），而实时预览每停一次键就要更新一次。
//   这里只回正文 HTML + 字数/时长/标题（几 KB）。
//
// ⚠️ 渲染必须与页面**共用同一套**（runtime-markdown 的 renderMarkdown）：
//    一旦这里换一套实现，「局部刷新出来的正文」就会和「整页预览的正文」长得不一样，
//    而这种差异只在打字过程中出现，几乎不可能被发现。
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import type { APIRoute } from "astro";
import { fetchPreview } from "../../../utils/notelab-preview-api";
import { renderMarkdown } from "../../../utils/runtime-markdown";

export const prerender = false;

function json(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"cache-control": "no-store",
		},
	});
}

export const GET: APIRoute = async ({ params }) => {
	const token = params.token ?? "";
	if (!token) return json({ ok: false, error: "缺少 token" }, 400);
	try {
		const entry = await fetchPreview(token);
		if (!entry) return json({ ok: false, error: "预览不存在或已过期" }, 404);
		const rendered = await renderMarkdown(entry.body ?? "");
		return json({
			ok: true,
			html: rendered.html,
			// 与页面上那两处文本同格式（含 i18n 单位），否则更新一次就变样
			words: `${rendered.words} ${i18n(I18nKey.wordsCount)}`,
			minutes: `${rendered.minutes} ${i18n(rendered.minutes === 1 ? I18nKey.minuteCount : I18nKey.minutesCount)}`,
			title: entry.title,
		});
	} catch (e) {
		return json(
			{ ok: false, error: e instanceof Error ? e.message : String(e) },
			502,
		);
	}
};
