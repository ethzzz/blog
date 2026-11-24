#!/usr/bin/env node
/**
 * 内容门禁：检查站内文章的 frontmatter、MDX 构建风险、内链有效性、模块归属一致性。
 *
 * 为什么需要它：2026-11-23 的站内完善里，四类问题都是靠临时脚本才发现的，而它们本该在提交前被挡住——
 *   1) frontmatter 漏一个引号 / tags 里 YAML 保留字符开头不加引号 → `astro build` 全站失败；
 *   2) 正文里裸尖括号或裸花括号（围栏外）→ 被当 JSX 解析，构建失败；
 *   3) 链接先于文件存在（解答还没写就往原文加链接）→ 线上 404；
 *   4) 新增 category 既没注册也没入口 → 文章写了但读者到不了。
 *
 * 用法：
 *   npm run check:content              全站检查（error 非零退出，可进 CI）
 *   node scripts/check-content.js --self-test   用内置样例证明这些规则真的会报警
 *
 * 规则踩过的坑（改动前先看这里）：
 *   - 围栏扫描必须按行做状态机，且要认 `> [!WARNING]` 里嵌 ``` 的写法：站内大量这种结构，
 *     用正则配对会整体错位，把真代码报成「裸花括号」（java-roadmap-04/05/08 就是这么被误报的）。
 *   - tags 含空格是合法 YAML，只有保留指示符（@ ` * ! & % { [ ? , | >）开头或含 ": " 才危险，
 *     一律要求加引号会造成几十条误报（nextjs/java/notelab 各篇）。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POSTS = path.join(root, "src/content/posts");
const SOLUTIONS = path.join(root, "src/content/solutions");
const PAGES = path.join(root, "src/pages");

/** 有独立导航入口、但不在路线注册表里的系列 */
const STANDALONE = new Set(["前端面试宝典", "notelab"]);

function registeredCategories() {
	const src = fs.readFileSync(
		path.join(root, "src/constants/roadmap-modules.ts"),
		"utf8",
	);
	return new Set([...src.matchAll(/category:\s*"([^"]+)"/g)].map((m) => m[1]));
}

function linkTargets() {
	const posts = new Set();
	const sols = new Set();
	for (const f of fs.readdirSync(POSTS)) if (/\.mdx?$/.test(f)) posts.add(f.replace(/\.mdx?$/, ""));
	if (fs.existsSync(SOLUTIONS)) {
		for (const f of fs.readdirSync(SOLUTIONS))
			if (/\.mdx?$/.test(f)) sols.add(f.replace(/\.mdx?$/, ""));
	}
	const routes = new Set();
	for (const f of fs.readdirSync(PAGES)) {
		const full = path.join(PAGES, f);
		if (fs.statSync(full).isDirectory()) {
			if (!f.startsWith("[")) routes.add(f);
		} else if (f.endsWith(".astro") && !f.includes("[") && f !== "index.astro") {
			routes.add(f.replace(/\.astro$/, ""));
		}
	}
	return { posts, sols, routes };
}

/**
 * 逐行扫描：跳过代码块（含引用块内的围栏）与行内代码，只留会被 MDX 解析的裸文本。
 * unclosed 表示扫到文件结尾仍停在代码块里 —— 那就是没闭合。
 */
function scanMarkdown(body) {
	const out = [];
	let fenceLen = 0;
	let fenceChar = "";
	for (const line of body.split(/\r?\n/)) {
		const open = line.match(/^\s{0,3}(?:>\s*)*(`{3,}|~{3,})/);
		if (open) {
			const marker = open[1];
			if (!fenceLen) {
				fenceLen = marker.length;
				fenceChar = marker[0];
				continue;
			}
			if (marker[0] === fenceChar && marker.length >= fenceLen) {
				fenceLen = 0;
				fenceChar = "";
				continue;
			}
			continue;
		}
		if (fenceLen) continue;
		out.push(line.replace(/(`+)(?:[^`]|`[^`])*?\1/g, ""));
	}
	return { prose: out.join("\n"), unclosed: fenceLen > 0 };
}

/** 检查单个文件；返回 { errors, warnings, category } */
function lintFile(name, raw, ctx) {
	const errors = [];
	const warnings = [];
	const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!fmMatch) {
		return { errors: [`${name}: frontmatter 缺失或结束分隔符不配对`], warnings, category: null };
	}
	const fm = fmMatch[1];
	const body = raw.slice(fmMatch[0].length);

	// --- frontmatter ---
	for (const key of ["title", "published", "category", "draft"]) {
		if (!new RegExp(`^${key}:`, "m").test(fm)) errors.push(`${name}: 缺 ${key}`);
	}
	for (const line of fm.split(/\r?\n/)) {
		for (const quote of ["'", '"']) {
			if ((line.split(quote).length - 1) % 2) {
				errors.push(`${name}: frontmatter 引号不配对 → ${line.trim().slice(0, 60)}`);
			}
		}
	}
	const category = fm.match(/^category:\s*(.+?)\s*$/m)?.[1]?.replace(/^['"]|['"]$/g, "");
	if (/^draft:/m.test(fm) && !/^draft:\s*(true|false)\s*$/m.test(fm)) {
		errors.push(`${name}: draft 必须是布尔字面量`);
	}
	const tagsLine = fm.match(/^tags:\s*\[(.*)\]\s*$/m)?.[1];
	if (tagsLine) {
		for (const tag of tagsLine.split(",")) {
			const t = tag.trim();
			if (!t || /^["'].*["']$/.test(t)) continue;
			if (/^[@`*!&%{[?,|>]/.test(t) || /:\s/.test(t)) {
				errors.push(`${name}: tags 项需加引号 → ${t}`);
			}
		}
	}

	// --- MDX 构建风险 ---
	const { prose, unclosed } = scanMarkdown(body);
	if (unclosed) errors.push(`${name}: 有代码块没闭合（到文件结尾仍在围栏内）`);
	const bareTag = prose.match(/<[A-Za-z/][\w-]*[\s/>]/);
	if (bareTag) errors.push(`${name}: 围栏外裸标签 ${bareTag[0].trim()}`);
	const bareBrace = prose.match(/[{]/);
	if (bareBrace) {
		const line = prose.split("\n").find((l) => l.includes("{")) ?? "";
		errors.push(`${name}: 围栏外裸花括号 → ${line.trim().slice(0, 60)}`);
	}

	// --- 内链 ---
	for (const m of body.matchAll(/\/blog\/(posts|solutions)\/([a-z0-9-]+)\/\)/g)) {
		const [, kind, slug] = m;
		const pool = kind === "posts" ? ctx.posts : ctx.sols;
		if (!pool.has(slug)) errors.push(`${name}: 死链 /blog/${kind}/${slug}/（目标文件还不存在）`);
	}
	for (const m of body.matchAll(/\/blog\/([a-z0-9-]+)\/\)/g)) {
		const route = m[1];
		if (route === "posts" || route === "solutions") continue;
		if (!ctx.routes.has(route)) errors.push(`${name}: 死链 /blog/${route}/（没有对应页面）`);
	}

	return { errors, warnings, category };
}

function main() {
	const registered = registeredCategories();
	const ctx = linkTargets();
	const files = fs.readdirSync(POSTS).filter((f) => /\.mdx?$/.test(f));
	const errors = [];
	const warnings = [];
	const countByCategory = new Map();
	const catByPrefix = new Map();

	for (const name of files) {
		const raw = fs.readFileSync(path.join(POSTS, name), "utf8");
		const r = lintFile(name, raw, ctx);
		errors.push(...r.errors);
		warnings.push(...r.warnings);
		const cat = r.category ?? "?";
		countByCategory.set(cat, (countByCategory.get(cat) ?? 0) + 1);
		const prefix = name.replace(/-\d{2}[^.]*\.mdx?$/, "");
		if (prefix !== name) {
			const g = catByPrefix.get(prefix) ?? new Map();
			g.set(cat, (g.get(cat) ?? 0) + 1);
			catByPrefix.set(prefix, g);
		}
	}

	// 模块归属：既没注册也没入口的成体系 category
	for (const [category, n] of countByCategory) {
		if (registered.has(category) || STANDALONE.has(category)) continue;
		if (n <= 2) {
			warnings.push(`category「${category}」${n} 篇，未注册 → 由散篇页兜底收录；成体系后请注册`);
		} else {
			errors.push(`category「${category}」有 ${n} 篇，却既不在模块注册表也没有独立入口 —— 读者从导航到不了`);
		}
	}
	// 注册了模块但没正文 → 聚合页会是空的
	for (const category of registered) {
		const n = countByCategory.get(category) ?? 0;
		if (n === 0) errors.push(`模块「${category}」已注册但一篇正文都没有`);
		else if (n < 3) warnings.push(`模块「${category}」只有 ${n} 篇，作为一条路线偏薄`);
	}
	// slug 前缀与系列不同源（改名会换掉已上线 URL，所以只提示不阻断）
	for (const [prefix, cats] of catByPrefix) {
		if (cats.size < 2) continue;
		const main2 = [...cats.entries()].sort((a, b) => b[1] - a[1])[0];
		const others = [...cats.entries()].filter(([c]) => c !== main2[0]);
		const total = [...cats.values()].reduce((s, n) => s + n, 0);
		warnings.push(
			`${prefix}- 前缀下混着 ${cats.size} 个系列（共 ${total} 篇）：${others.map(([c, n]) => `${n} 篇属「${c}」`).join("、")} —— 聚合页按 category 取数不受影响，但 slug 会误导人`,
		);
	}

	console.log(`扫描 ${files.length} 篇正文`);
	if (warnings.length) {
		console.log(`\n⚠ warning ${warnings.length} 条（不挡构建）`);
		for (const w of [...new Set(warnings)]) console.log(`  · ${w}`);
	}
	if (errors.length) {
		console.log(`\n❌ error ${errors.length} 条`);
		for (const e of errors) console.log(`  · ${e}`);
		process.exit(1);
	}
	console.log("\n✅ 无 error");
}

/** 自检：证明每条规则会报警，且对照组（合法写法）不误报 */
function selfTest() {
	const ctx = { posts: new Set(["exist-post"]), sols: new Set(["algo-01-ex01"]), routes: new Set(["roadmaps"]) };
	const fm = "title: 't'\npublished: 2026-01-01\ncategory: X\n";
	const cases = [
		["缺闭合引号", `---\n${fm}description: '没闭合\ntags: [a]\ndraft: false\n---\n正文`, /引号不配对/],
		["tags 保留字符", `---\n${fm}description: 'ok'\ntags: [@types, Vue]\ndraft: false\n---\n正文`, /tags 项需加引号/],
		["裸标签", `---\n${fm}description: 'ok'\ntags: [a]\ndraft: false\n---\n这里 <Suspense> 没包起来`, /裸标签/],
		["裸花括号", `---\n${fm}description: 'ok'\ntags: [a]\ndraft: false\n---\n赋值 {{ x }} 要进反引号`, /裸花括号/],
		["死链", `---\n${fm}description: 'ok'\ntags: [a]\ndraft: false\n---\n看 [解答](/blog/solutions/nope/)`, /死链/],
		["未闭合围栏", `---\n${fm}description: 'ok'\ntags: [a]\ndraft: false\n---\n\`\`\`ts\nconst a = 1;`, /没闭合/],
		["缺 draft", `---\n${fm}description: 'ok'\ntags: [a]\n---\n正文`, /缺 draft/],
	];
	let fail = 0;
	for (const [label, raw, re] of cases) {
		const r = lintFile(`${label}.mdx`, raw, ctx);
		const hit = r.errors.some((e) => re.test(e));
		console.log(`${hit ? "✅" : "❌"} 应报警：${label}${hit ? "" : ` → 实际 ${r.errors.join(" | ") || "无"}`}`);
		if (!hit) fail++;
	}
	// 对照组：合法写法不得报错
	const ok = `---\n${fm}description: '含 Vue3 + Element Plus 的空格与冒号: 都可以'\ntags: [Vue3, "Element Plus", 组合式]\ndraft: false\n---\n
提示块里的代码不算裸文本：
> [!WARNING]
> \`\`\`java
> int[] nums = {1, 2, 3};
> List<Integer> view = Arrays.asList(nums);
> \`\`\`
行内写法也合法：\`{{ x }}\` 与 \`<Suspense>\`。链接：[已存在](/blog/posts/exist-post/)、[路由](/blog/roadmaps/)。`;
	const r = lintFile("对照组.mdx", ok, ctx);
	console.log(`${r.errors.length === 0 ? "✅" : "❌"} 对照组不得报错${r.errors.length ? ` → ${r.errors.join(" | ")}` : ""}`);
	if (r.errors.length) fail++;
	console.log(fail ? `\n自检失败 ${fail} 项` : "\n自检全部通过");
	process.exit(fail ? 1 : 0);
}

if (process.argv.includes("--self-test")) selfTest();
else main();
