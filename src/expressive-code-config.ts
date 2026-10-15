// expressive-code 的**单一配置来源**：构建期（astro.config.mjs）与运行时 SSR
// （src/utils/runtime-markdown.ts）都从这里取。
//
// 为什么必须单一来源：改接口驱动后，解答页从「构建期渲染」变成「运行时渲染」。
// 两处各留一份配置迟早会漂移，表现是「同一篇解答，别的页面代码块有行号、
// 解答页没有」这种不会立刻被发现的差异。
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { expressiveCodeConfig } from "./config.ts";
import { pluginCustomCopyButton } from "./plugins/expressive-code/custom-copy-button.ts";
import { pluginLanguageBadge } from "./plugins/expressive-code/language-badge.ts";

export const expressiveCodeOptions = {
	themes: [expressiveCodeConfig.theme, expressiveCodeConfig.theme],
	plugins: [
		pluginCollapsibleSections(),
		pluginLineNumbers(),
		pluginLanguageBadge(),
		pluginCustomCopyButton(),
	],
	defaultProps: {
		wrap: true,
		overridesByLang: {
			shellsession: {
				showLineNumbers: false,
			},
		},
	},
	styleOverrides: {
		codeBackground: "var(--codeblock-bg)",
		borderRadius: "0.75rem",
		borderColor: "none",
		codeFontSize: "0.875rem",
		codeFontFamily:
			"'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
		codeLineHeight: "1.5rem",
		frames: {
			editorBackground: "var(--codeblock-bg)",
			terminalBackground: "var(--codeblock-bg)",
			terminalTitlebarBackground: "var(--codeblock-topbar-bg)",
			editorTabBarBackground: "var(--codeblock-topbar-bg)",
			editorActiveTabBackground: "none",
			editorActiveTabIndicatorBottomColor: "var(--primary)",
			editorActiveTabIndicatorTopColor: "none",
			editorTabBarBorderBottomColor: "var(--codeblock-topbar-bg)",
			terminalTitlebarBorderBottomColor: "none",
		},
		textMarkers: {
			delHue: 0,
			insHue: 180,
			markHue: 250,
		},
	},
	frames: {
		showCopyToClipboardButton: false,
	},
};
