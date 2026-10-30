# 面试宝典（interview-guide）加深施工图

> 背景：22 篇里除 19-Node.js 外普遍 1,000–2,600 词，比路线模块（3,000–5,000）薄。
> 加深原则：**不改 Q&A 骨架、不推倒重写**，按三件事补：
> 1. 高频题补 **追问链**（面试官下一层会问什么 + 怎么接）；
> 2. 每篇补 **常见坑表**（现象/根因/解法，实战导向）；
> 3. 文末补 **自测清单**（10 题左右，勾选式）。
> 4. 选型/场景类题补 **60 秒参考话术**。

## 进度（2026-10-27 起按字符数（去空白）重新度量，wc -w 对中文严重失真）

| 批次 | 篇目 | 原（字符） | 状态 |
|:--|:--|:--|:--|
| B1 | 06-cross-platform | 7.2k→ | ✅ 已加深（追问链/选型话术/坑表/自测） |
| B1 | 09-nginx | 6.9k→ | ✅ 已加深（location 优先级专题/alias 坑/XFF/限流/坑表/自测） |
| B1 | 21-frontend-deep-practice | 9.1k | ✅ 正文本就扎实，补自测清单 |
| B2 | 08-network-http | 7.3k | ✅ 已加深（TIME_WAIT 治理/QUIC/TLS1.3/ETag 坑/CORS credentials/坑表/自测） |
| B2 | 10-mysql | 5.8k | ✅ 已加深（2000 万估算/自增 vs UUID/RR 幻读边界/RC 取舍/行锁加在索引上/坑表/自测） |
| B3 | 20-frontend-core-qa | 12.1k | ✅ 已加深（Q1/Q8/Q14/Q18 追问 + 资深面压力追问 6 类 + 自测） |
| B3 | 07-build-tools | 9.2k | ✅ 已加深（Compiler/Compilation、Tapable、sideEffects 事故、Fast Refresh、Vite 代价与 Rspack 选型、定位方法、坑表、自测） |
| B3 | 03-javascript-async | 9.6k | ✅ 已加深（微任务动机、渲染时机、rAF 归属、await tick 差异、Node 线程池、五种反模式、坑表、自测） |
| B4 | 05-react | 9.7k | ✅ 已加深（Fiber 两阶段/双缓存/Lane、Hooks 链表原理、闭包陷阱、setState 批处理、并发特性、坑表、自测） |
| B4 | 02-javascript-core | 10.3k | ✅ 已加深（JSON 深拷贝五坑/structuredClone/WeakMap、bind+new 优先级、class TDZ、Proxy receiver、坑表、自测） |
| B4 | 18-soft-skills | 10.7k | ✅ 已加深（数字防守追问、空窗期专题、HR 五种压价话术、反问被反问、翻车点表、自测） |
| B5 | 01-html-css | 10.7k | 待做 |
| B5 | 04-vue | 11.3k | 待做 |
| B5 | 13-performance | 11.3k | 待做 |
| B6 | 11-backend | 12.3k | 待做 |
| B6 | 12-typescript | 12.6k | 待做 |
| B6 | 16-realtime | 13.8k | 待做 |
| B6 | 14-handwritten-code | 14.1k | 待做 |
| B6 | 15-engineering-practice | 14.4k | 待做 |
| B7 | 17-system-design | 17.3k | 视情况抽查 |
| B7 | 00-overview | 4.6k | 索引页，最后统一核对 |
| B7 | 19-nodejs | 24.5k | 已达标，不动 |

> 结论修正：字符数维度上 19/17/15/14/16 都不算薄；「薄」的主因是**清单式答案缺追问链**。
> B3 起改为**抽查式**：优先补高频题的追问链与坑，不整篇重写。

## 注意（沿用 content-system.md 的坑）
- MDX 正文禁裸 `{...}`、禁 `<` 紧跟字母/数字（写「小于 N」或带空格）；
- `**` 不与中文引号/全角括号紧贴；
- tags 含 `@` 要加引号；
- published 不用未来时间。
