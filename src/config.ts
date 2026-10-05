import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "我的博客",
	subtitle: "记录技术、想法与生活",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: false,
		src: "assets/images/demo-banner.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		{
			name: "Java 学习路线",
			shortName: "Java",
			url: "/java-roadmap/",
		},
		{
			name: "RuoYi 学习路线",
			shortName: "RuoYi",
			url: "/ruoyi-roadmap/",
		},
		{
			name: "面试宝典",
			url: "/interview-guide/",
		},
		{
			name: "Higress 学习路线",
			shortName: "Higress",
			url: "/higress-roadmap/",
		},
		{
			name: "Python 学习路线",
			shortName: "Python",
			url: "/python-roadmap/",
		},
		{
			name: "TypeScript 学习路线",
			shortName: "TypeScript",
			url: "/typescript-roadmap/",
		},
		{
			name: "JavaScript 核心",
			shortName: "JavaScript",
			url: "/js-roadmap/",
		},
		{
			name: "React 实战",
			shortName: "React",
			url: "/react-roadmap/",
		},
		{
			name: "前端工程化",
			shortName: "前端工程化",
			url: "/engineering-roadmap/",
		},
		{
			name: "浏览器与性能",
			shortName: "浏览器",
			url: "/browser-roadmap/",
		},
		{
			name: "NoteLab 实战",
			shortName: "NoteLab",
			url: "/notelab/",
		},
		LinkPreset.About,
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.jpg", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "Ethan",
	bio: "记录技术、想法与生活。",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/ethzzz",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
