/**
 * 学习路线模块注册表——单一数据源。
 * 「学习路线」总览页（src/pages/roadmaps.astro）和导航栏下拉子菜单
 * （src/config.ts 的学习路线 children）都从这里取数据，改模块只改这里。
 */

export type RoadmapModule = {
	title: string;
	abbr: string;
	desc: string;
	url: string;
	category: string;
	chips: string[];
};

export type RoadmapGroup = {
	name: string;
	modules: RoadmapModule[];
};

export const ROADMAP_GROUPS: RoadmapGroup[] = [
	{
		name: "前端核心",
		modules: [
			{
				title: "TypeScript 从零基础到精通",
				abbr: "TS",
				desc: "从类型注解到类型体操，系统掌握 TypeScript",
				url: "/typescript-roadmap/",
				category: "TypeScript学习路线",
				chips: ["泛型", "类型体操", "tsconfig"],
			},
			{
				title: "JavaScript 核心机制",
				abbr: "JS",
				desc: "作用域、闭包、原型链、事件循环一本讲透",
				url: "/js-roadmap/",
				category: "JavaScript学习路线",
				chips: ["闭包", "原型链", "事件循环"],
			},
			{
				title: "React 实战路线",
				abbr: "Re",
				desc: "从 JSX 组件到 Hooks、状态管理与性能优化",
				url: "/react-roadmap/",
				category: "React学习路线",
				chips: ["Hooks", "状态管理", "性能"],
			},
			{
				title: "前端工程化",
				abbr: "工",
				desc: "构建原理、规范 lint、CI/CD、微前端与 Monorepo",
				url: "/engineering-roadmap/",
				category: "前端工程化学习路线",
				chips: ["Vite", "CI/CD", "Monorepo"],
			},
			{
				title: "浏览器与性能",
				abbr: "浏",
				desc: "渲染管线、缓存策略、安全与首屏优化实战",
				url: "/browser-roadmap/",
				category: "浏览器与性能学习路线",
				chips: ["渲染", "缓存", "首屏"],
			},
		],
	},
	{
		name: "进阶方向",
		modules: [
			{
				title: "Node.js 全栈开发",
				abbr: "Node",
				desc: "前端向后端延伸的最短路径：NestJS / 数据库 / 部署",
				url: "/node-roadmap/",
				category: "Node全栈学习路线",
				chips: ["NestJS", "MySQL", "Redis"],
			},
			{
				title: "AI 应用开发",
				abbr: "AI",
				desc: "用前端工程能力把大模型做成真实产品：API / 流式 / RAG / Agent",
				url: "/ai-app-roadmap/",
				category: "AI应用开发学习路线",
				chips: ["LLM", "SSE 流式", "RAG"],
			},
			{
				title: "算法与手写题",
				abbr: "Algo",
				desc: "面试前 30 天也能刷完的算法套路与手写题全家桶",
				url: "/algo-roadmap/",
				category: "算法与手写题",
				chips: ["LeetCode", "手写题", "面试"],
			},
		],
	},
	{
		name: "后端与运维",
		modules: [
			{
				title: "Java 入门",
				abbr: "Java",
				desc: "Java 基础语法、面向对象、集合与线程",
				url: "/java-roadmap/",
				category: "Java学习路线",
				chips: ["OOP", "集合", "线程"],
			},
			{
				title: "RuoYi 实战",
				abbr: "RuoYi",
				desc: "跑通经典后台管理系统：权限、字典、定时任务、代码生成",
				url: "/ruoyi-roadmap/",
				category: "RuoYi学习路线",
				chips: ["Spring Boot", "权限", "MyBatis"],
			},
			{
				title: "Higress 网关",
				abbr: "Higress",
				desc: "云原生网关：路由、流量治理与 WASM 插件开发",
				url: "/higress-roadmap/",
				category: "Higress学习路线",
				chips: ["网关", "WASM", "可观测"],
			},
			{
				title: "Docker 与容器化部署",
				abbr: "Docker",
				desc: "从镜像、容器、网络到 Compose 与生产部署：把项目装进容器",
				url: "/docker-roadmap/",
				category: "Docker学习路线",
				chips: ["镜像", "Compose", "部署"],
			},
			{
				title: "Python 全栈",
				abbr: "Py",
				desc: "100 天从新手到大师：后端 / 爬虫 / 数据科学全赛道",
				url: "/python-roadmap/",
				category: "Python学习路线",
				chips: ["Django", "爬虫", "机器学习"],
			},
		],
	},
];
