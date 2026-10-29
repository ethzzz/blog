# 点「练习实践」闪白屏 & 首屏淡入播放两次（Layout / swup / OverlayScrollbars）

> 日期：2026-10-27 ｜ 提交：`8def426` ｜ 涉及文件：`src/layouts/Layout.astro`、`src/styles/transition.css`

两个症状、两个根因，同一次提交修完：

1. 点顶栏「练习实践」（`/blog/solutions/`）时，偶尔整页闪一下白、布局像塌了，然后恢复。
2. 首屏入场动画（导航栏 / 侧栏 / 正文）会淡入**第二次**，观感像「页面重新渲染了一遍」。

## 1. 现象与复现

- 症状 1 只在 `/solutions/` 上明显，其它页几乎看不到。`/solutions/` 与 `/solutions/<slug>/` 是**运行时渲染**（`prerender = false`），内容每次从 NoteLab 接口现取，实测首字节到 HTML 到手 0.25~0.6s；其余页面是构建期固化的静态 HTML。
- 症状 2 在首屏就发生，与点击无关：加载完约 0.5s 时导航栏、侧栏、正文会从当前不透明度掉回 0 再升上来。用户描述为「从 pagefind.js 那里重复加载了一次页面」。

## 2. 先排除的怀疑

| 怀疑 | 排除证据 |
| :-- | :-- |
| 整页真的 reload 了 | `sessionStorage` 文档执行计数器在本地构建和线上都是 **1**；Network 里只有一个 document 请求 |
| pagefind 重复初始化拖垮了页面 | `pagefind.js` 的两次请求是设计使然：`Navbar.astro` 先 `fetch(..., {method:'HEAD'})` 探存在性，再 `import(scriptUrl)` 真正加载（PROD 限定） |
| swup 缓存 / 首次导航导致的闪回 | 打开页面后**不点任何链接**，静置观察首屏，同样在 ~540ms 复现 |
| 只是动画「还没播完」 | 导航栏当时已到 0.99、侧栏 0.47，随后一起归零再升 —— 是中断，不是未完成 |

结论先立住：**不是重新加载文档，是 CSS 入场动画被取消后重放了。**

## 3. 根因 A：swup 先淡出，再等新页面 HTML

swup 默认 `visit.animation.wait = false`，顺序是「点击 → 立刻开始 fade-out → 再去取新页面 HTML」。

静态页取 HTML 是毫秒级，所以看不出问题。而 `/solutions/` 要等 0.25~0.6s 的 SSR，这段时间里旧内容早已淡到 `opacity: 0`，`#swup-container` 只剩背景色 —— 肉眼就是「白屏一闪 / 样式像塌了」，HTML 到手后才重新淡入。

`wait = true` 只调整**顺序**、不改总耗时：旧页保持原样等 HTML，到手了再开始淡出。

```ts
// src/layouts/Layout.astro:465
window.swup.hooks.on('visit:start', (visit: { animation: { wait: boolean } }) => {
	visit.animation.wait = true;
});
```

附带踩到的坑：原本紧跟在后面的 `visit:transition` 逻辑必须用 `hooks.before(...)` 注册。swup 会把通过 `on` 注册的普通 handler 排进 `after` 列表，即**排在 hook 的默认实现之后**执行 —— 用 `on` 的话这段「淡出前改 banner 高度 / 收 TOC」的代码会拖到新页面都渲染完了才跑（`src/layouts/Layout.astro:470`）。

## 4. 根因 B：OverlayScrollbars 初始化时摘挂 `<body>` 子树

`initCustomScrollbar()` 用 body 模式初始化滚动条：

```ts
// src/layouts/Layout.astro:339
OverlayScrollbars({ target: bodyElement, cancel: { nativeScrollbarsOverlaid: true } }, { /* ... */ });
```

OverlayScrollbars 2.16.0 在 body 模式下会**把所有 `<body>` 子节点 detach 再重新 append**，并给 `<html>` 加上 `data-overlayscrollbars` / `data-overlayscrollbars-viewport` / `data-overlayscrollbars-initialize`。节点被移出文档的一瞬间，其上正在跑的 CSS 动画就会被取消；重新插入并重新计算样式时，`.onload-animation` 的 `fade-in-up` 从 0% 重新开始。

时间点刚好撞上：

| 事件 | 实测时刻 |
| :-- | :-- |
| `.onload-animation` 开始 | ~350ms |
| OverlayScrollbars 搬完 `<body>` | ~453ms |
| 三条动画 opacity 归零 | ~540ms |

导航栏此时已经到 0.99、侧栏 0.47、正文 0.11 —— 所以不是「没开始」，而是**跑到一半被打断**，这才是最刺眼的地方。

### 证据怎么拿的

- 逐帧采样 `getComputedStyle(el).opacity`，记录每帧三条动画的值和时间戳 —— 直接看到「升到 0.99 → 掉回 0 → 再升」。
- 给 `Node.prototype.appendChild`、`Element.prototype.setAttribute`、`CSSStyleDeclaration` 的 setter 打桩并采集 `new Error().stack`，命中的调用栈落在 `Layout.astro_astro_type_script_index_1_lang.js` 里 OverlayScrollbars 的压缩函数（`qt / an / Jt / mt`）上。
- 用 `MutationObserver` 观察 `<body>` 的 `childList`，确认在 453ms 有一次整体重挂。

## 5. 修法：入场动画门控

思路是「等库把 DOM 搬完，再创建动画」，而不是「动画被打断了再补回去」。

**1）`<head>` 里同步内联加门控类 + 兜底定时器**

```html
<!-- src/layouts/Layout.astro:161 -->
<script is:inline>
	(function () {
		var html = document.documentElement;
		html.classList.add('onload-anim-gate');
		setTimeout(function () {
			html.classList.remove('onload-anim-gate');
		}, 1500);
	})();
</script>
```

**2）门控期间不创建动画**

```css
/* src/styles/transition.css:29 */
html.onload-anim-gate .onload-animation {
    animation: none;
}
```

**3）搬完 DOM 后放行**

```ts
// src/layouts/Layout.astro:356
requestAnimationFrame(() => {
	document.documentElement.classList.remove('onload-anim-gate');
});
```

### 几个必须这么写的理由

- **用 `animation: none` 而不是 `animation-play-state: paused`。** 暂停再恢复时，浏览器按「动画已结束」处理，实测导航栏会从 0 直接跳到 1（硬跳变）。`none` 是根本不创建动画，放行时才创建一次，得到完整平滑的 300ms 淡入。
- **必须 `is:inline` 放在 `<head>` 同步执行。** 普通 module script 要等到 `DOMContentLoaded` 才跑（实测 ~450ms），而首屏动画 ~350ms 就开始了，那时已经晚了。
- **放行要排到下一帧。** OverlayScrollbars 初始化内部的收尾也可能排在同帧的 `rAF` 里，往后一帧才能稳定排在它后面。
- **必须有超时兜底。** 客户端脚本异常时若门控类一直挂着，整页会永远停在 `opacity: 0`。1.5s 兜底让最坏情况退化成「晚一点淡入」。
- **旧的 WeakSet「事后 snap 到终态」补丁已删除。** 它只是把被打断的动画直接钉到 100%，跳变依然肉眼可见 —— 治标。
- **为什么只有首屏受影响。** swup 导航时 `content:replace` 会再调一次 `initCustomScrollbar`，但 OverlayScrollbars 对已初始化的 target 直接返回既有实例（types 里写明 "or returns the current OverlayScrollbars instance if the target already has an instance"），不会二次搬 DOM。

## 6. 验证

机器可判定：

- 首屏逐帧采样，三种环境入场动画 **0 次回落**：桌面 1280×800、文章页（`osInit = true`）、移动端 390×844。
- swup 回归：练习 → 归档 → 关于 → 主页 连续跳转，0 条 console error，页面均正常淡入。
- 兜底路径：用 `Network.setBlockedURLs` 阻断 Layout 的客户端 chunk，门控在 ~1533ms 由定时器放行，页面正常淡入，**没有卡在 `opacity: 0`**。
- `astro check` 0 error、`biome ci ./src` 无告警、`npm run build` 退出码 0。

肉眼确认：点「练习实践」不再出现空白窗口；首屏淡入只播一次。

## 7. 可复用经验

1. **先分清「文档重载」和「动画重放」。** 一个 `sessionStorage` 计数器 + Network 里 document 请求数就能定性，比读半天代码快。用户口中的「重新加载了页面」经常只是视觉重放。
2. **任何「初始化时会移动 DOM 子树」的库都会打断运行中的 CSS 动画。** OverlayScrollbars 的 body 模式只是其中一例；水合接管、虚拟列表首次挂载、第三方样式重排都有同样风险。入场动画要么等它做完再建，要么用门控。
3. **门控用 `animation: none`，不要用 `paused`。** `paused` 的「恢复」在观感上等于「已完成」，会硬跳。
4. **门控脚本必须在 `<head>` 内联同步注册，并且必须带超时兜底。** 前者决定它赶不赶得上动画起点，后者决定脚本挂掉时页面会不会全黑。
5. **swup 的 `wait` 是「顺序」开关，不是「时长」开关**：`wait = true` 让旧页保持可见直到新 HTML 到手，对 SSR / 慢接口页面是必需项。同时记住 `hooks.before` 与 `hooks.on` 的执行顺序差异。
6. **对「偶尔出现」的视觉 bug，逐帧 opacity 采样比截图有效得多。** 截图只能证明某一刻，采样能给出曲线、时间点和复现概率。
