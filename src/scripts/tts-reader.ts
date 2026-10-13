/**
 * 博客文章语音朗读
 *
 * 调用链路：浏览器 → nginx（/blog/tts/ 反代并注入 API key）→ 本机 kokoro TTS
 *
 * 设计要点（均来自服务端实测）：
 * - 单次合成上限约 120 字，超过会被静默截断，故按 110 字分块
 * - 服务端串行处理、约 1× 实时速度，因此必须「边播边取」，并保持一定预取深度
 * - 首块取更短长度，让声音更快开始
 * - 分块规则（对应「按标签划分句子是否连续」）：
 *     同一类标签的相邻内容累积合并、连续朗读；
 *     标签类型变化处断开（标题与正文之间留出停顿）；
 *     累积到 110 字也断开，避免触碰服务端截断阈值。
 *   注意：不能每个标签块都单独请求 —— 实测 226 个标签块会拆出 227 次请求，
 *   大部分块只有十几个字，请求固定开销远大于音频本身，整篇要 19 分钟才合成完。
 */

const TTS_ENDPOINT = "/blog/tts/v1/audio/speech";
const VOICE = "zf_xiaoxiao";
const MAX_CHUNK_CHARS = 110;
const FIRST_CHUNK_CHARS = 40;
const PREFETCH_DEPTH = 2;
const BLOCK_SELECTOR = "h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,td,th";
const SKIP_SELECTOR =
	"pre,code,.expressive-code,#toc-wrapper,.license-container";

interface TextBlock {
	tag: string;
	text: string;
}

interface SwupHooks {
	on(event: string, cb: () => void, opts?: { before?: boolean }): void;
}
interface SwupLike {
	hooks?: SwupHooks;
}

let audioEl: HTMLAudioElement | null = null;
let resolveCurrent: (() => void) | null = null;
let stopRequested = false;
let isPlaying = false;

function getSwup(): SwupLike | undefined {
	return (window as unknown as { swup?: SwupLike }).swup;
}

/** 合并空白，避免从 DOM 取到换行与缩进 */
function normalize(text: string): string {
	return text.replace(/\s+/g, " ").trim();
}

/**
 * 取块级元素的朗读文本。
 * 标题会被 rehype-autolink-headings 追加一个 "#" 锚点，必须剔除，否则会被念出来。
 */
function blockText(el: HTMLElement): string {
	if (!el.querySelector(".anchor-icon")) return normalize(el.textContent ?? "");
	const clone = el.cloneNode(true) as HTMLElement;
	clone.querySelectorAll(".anchor-icon").forEach((node) => {
		node.remove();
	});
	return normalize(clone.textContent ?? "");
}

/**
 * 从正文按标签提取文本块。
 * 只取「叶子」块级元素，避免 li > p 这类嵌套导致同一段文字被读两遍。
 */
function extractBlocks(root: HTMLElement): TextBlock[] {
	const blocks: TextBlock[] = [];
	const nodes = Array.from(root.querySelectorAll<HTMLElement>(BLOCK_SELECTOR));

	for (const el of nodes) {
		if (el.closest(SKIP_SELECTOR)) continue;
		if (el.querySelector(BLOCK_SELECTOR)) continue;
		const text = blockText(el);
		if (text) blocks.push({ tag: el.tagName.toLowerCase(), text });
	}
	return blocks;
}

/** 超长句子按长度硬切，保证不触碰服务端截断阈值 */
function splitLong(sentence: string, limit: number): string[] {
	if (sentence.length <= limit) return [sentence];
	const parts: string[] = [];
	for (let i = 0; i < sentence.length; i += limit) {
		parts.push(sentence.slice(i, i + limit));
	}
	return parts;
}

function splitSentences(text: string): string[] {
	const parts = text.split(/(?<=[。！？!?；;：:])/).filter((s) => s.trim());
	const out: string[] = [];
	for (const part of parts) out.push(...splitLong(part, MAX_CHUNK_CHARS));
	return out;
}

/** 按标签把文本块切成待合成的片段 */
function chunkText(blocks: TextBlock[]): string[] {
	const chunks: string[] = [];
	let buffer = "";
	let lastTag = "";
	let isFirst = true;

	const limit = () => (isFirst ? FIRST_CHUNK_CHARS : MAX_CHUNK_CHARS);
	const flush = () => {
		const trimmed = buffer.trim();
		if (trimmed) {
			chunks.push(trimmed);
			isFirst = false;
		}
		buffer = "";
	};

	for (const block of blocks) {
		// 标签类型变化处断开：标题与正文之间自然停顿
		if (buffer && block.tag !== lastTag) flush();

		for (const sentence of splitSentences(block.text)) {
			if (buffer && buffer.length + sentence.length > limit()) flush();
			buffer += sentence;
		}
		lastTag = block.tag;
	}
	flush();

	return chunks;
}

async function synthesize(text: string): Promise<Blob> {
	const res = await fetch(TTS_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			model: "kokoro",
			input: text,
			voice: VOICE,
			response_format: "mp3",
		}),
	});
	if (!res.ok) {
		throw new Error(`语音合成失败（HTTP ${res.status}）`);
	}
	return await res.blob();
}

function playBlob(blob: Blob): Promise<void> {
	return new Promise((resolve) => {
		if (!audioEl) audioEl = new Audio();
		const url = URL.createObjectURL(blob);
		const done = () => {
			URL.revokeObjectURL(url);
			if (audioEl) {
				audioEl.onended = null;
				audioEl.onerror = null;
			}
			resolveCurrent = null;
			resolve();
		};
		resolveCurrent = done;
		audioEl.src = url;
		audioEl.onended = done;
		audioEl.onerror = done;
		audioEl.play().catch(done);
	});
}

interface UiRefs {
	button: HTMLElement;
	label: HTMLElement;
}

function setLabel(refs: UiRefs, text: string): void {
	refs.label.textContent = text;
}

function setBusy(refs: UiRefs, busy: boolean): void {
	refs.button.setAttribute("aria-busy", busy ? "true" : "false");
}

function stopPlayback(refs?: UiRefs): void {
	stopRequested = true;
	if (audioEl) audioEl.pause();
	if (resolveCurrent) {
		const done = resolveCurrent;
		resolveCurrent = null;
		done();
	}
	if (refs) {
		isPlaying = false;
		setBusy(refs, false);
		setLabel(refs, "阅读");
	}
}

async function startPlayback(refs: UiRefs): Promise<void> {
	const root = document.querySelector<HTMLElement>(".markdown-content");
	if (!root) return;

	const chunks = chunkText(extractBlocks(root));
	if (chunks.length === 0) return;

	stopRequested = false;
	isPlaying = true;
	setBusy(refs, true);
	setLabel(refs, "准备中…");

	const tasks = new Map<number, Promise<Blob>>();
	const ensure = (i: number): Promise<Blob> | null => {
		if (i >= chunks.length) return null;
		let task = tasks.get(i);
		if (!task) {
			task = synthesize(chunks[i]);
			tasks.set(i, task);
		}
		return task;
	};

	try {
		for (let i = 0; i < chunks.length; i++) {
			if (stopRequested) break;

			// 预取后续若干块：合成慢于播放，靠提前排队填补等待
			for (let d = 1; d <= PREFETCH_DEPTH; d++) ensure(i + d);

			setLabel(refs, `停止 ${i + 1}/${chunks.length}`);
			const task = ensure(i);
			if (!task) break;
			const blob = await task;
			if (stopRequested) break;

			await playBlob(blob);
			tasks.delete(i);
		}
	} catch (err) {
		console.error("[tts-reader]", err);
		setLabel(refs, "朗读失败");
		window.setTimeout(() => setLabel(refs, "阅读"), 2500);
		return;
	} finally {
		isPlaying = false;
		setBusy(refs, false);
	}

	if (!stopRequested) setLabel(refs, "阅读");
}

function onToggle(refs: UiRefs): void {
	if (isPlaying) {
		stopPlayback(refs);
		return;
	}
	void startPlayback(refs);
}

function bind(): void {
	const button = document.getElementById("tts-read-btn");
	const label = document.getElementById("tts-read-label");
	if (!button || !label) return;
	if (button.dataset.ttsBound === "1") return;
	button.dataset.ttsBound = "1";

	const refs: UiRefs = { button, label };
	button.addEventListener("click", () => onToggle(refs));
}

const setup = (): void => {
	const swup = getSwup();
	swup?.hooks?.on(
		"content:replace",
		() => {
			stopPlayback();
		},
		{ before: true },
	);
	swup?.hooks?.on("page:view", bind);
	bind();
};

if (getSwup()) {
	setup();
} else {
	document.addEventListener("swup:enable", setup);
}
