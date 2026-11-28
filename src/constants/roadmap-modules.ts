/** 学习路线和项目系列共用的模块注册表，导航与合集页从这里取数据。 */

export type RoadmapModule = {
	title: string;
	abbr: string;
	desc: string;
	url: string;
	category: string;
	chips: string[];
	/** 同一分类中的子系列，用文章 slug 前缀限定范围。 */
	slugPrefix?: string;
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
				title: "Vue 3 从组合式到工程化",
				abbr: "Vue",
				desc: "响应式机制、Composable 契约、Pinia 与动态权限路由，逐章对照 React",
				url: "/vue-roadmap/",
				category: "Vue学习路线",
				chips: ["组合式 API", "Pinia", "Element Plus"],
			},
			{
				title: "Next.js 全栈实战",
				abbr: "Next",
				desc: "从 App Router、RSC 到认证、数据库与生产部署，把 React 能力延伸到服务端",
				url: "/nextjs-roadmap/",
				category: "Next.js学习路线",
				chips: ["App Router", "RSC", "Server Actions"],
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
				desc: "按阶段做完团队知识库助手，覆盖流式对话、RAG、Agent、多模态、评测与部署",
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
				title: "Java 后端学习路线",
				abbr: "Java",
				desc: "从 Java 语法、Maven 和 JUnit 到 Spring Boot、MySQL、Redis 与任务工单交付",
				url: "/java-roadmap/",
				category: "Java学习路线",
				chips: ["Spring Boot", "MySQL", "Redis", "部署"],
			},
			{
				title: "Go 从零到能写服务",
				abbr: "Go",
				desc: "标准库就能写出能上线的服务：值语义、并发模型、pprof 与部署，含毕业项目",
				url: "/golang-roadmap/",
				category: "Go学习路线",
				chips: ["goroutine", "net/http", "标准库"],
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

export const PROJECT_GROUP: RoadmapGroup = {
	name: "项目实践",
	modules: [
		{
			title: "社区全栈实战",
			abbr: "社",
			desc: "用 Express、NestJS 和 Next.js 做围炉社区，涵盖帖子、审核、搜索与功能迭代。",
			url: "/community-fullstack-roadmap/",
			category: "社区全栈实战",
			chips: ["Next.js", "NestJS", "Express"],
		},
		{
			title: "NoteLab 实战",
			abbr: "NL",
			desc: "从本地搭建到上线，记录知识库的三仓协同、AI 功能、发布和排障。",
			url: "/notelab/",
			category: "notelab",
			chips: ["Spring Boot", "三仓协同", "部署"],
		},
		{
			title: "AI 应用工作坊",
			abbr: "AI",
			desc: "跟着五章教程做团队知识库助手，包含流式对话、引用、工具调用、多模态和发布验收。",
			url: "/ai-app-workshop/",
			category: "AI应用开发学习路线",
			slugPrefix: "ai-app-workshop-",
			chips: ["MySQL", "RAG", "MCP"],
		},
		{
			title: "AI 运营物料投放",
			abbr: "运营",
			desc: "从零做 App 首页 Banner 投放后台，逐章实现规则预演、AI 草稿、人工审核发布和回归评测。",
			url: "/ai-ops-workshop/",
			category: "AI运营投放实战",
			chips: ["MySQL", "运营后台", "结构化输出"],
		},
		{
			title: "全栈进阶 12 周",
			abbr: "12W",
			desc: "按周练习全栈开发，每周完成一项可验收的交付物。",
			url: "/fullstack-12w/",
			category: "全栈进阶12周",
			chips: ["Node.js", "NestJS", "周计划"],
		},
	],
};

export const CONTENT_MODULES = [
	...ROADMAP_GROUPS.flatMap((group) => group.modules),
	...PROJECT_GROUP.modules,
];
