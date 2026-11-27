---
title: '2026-11-25 面试记录 · React、Vue 与前端工程实践'
published: 2026-11-25
description: '全栈偏前端的模拟面试复盘，涵盖 React 与 Vue、浏览器性能、Vite 首包、HTTP 缓存及接口工程实践。'
tags: [React, Vue, JavaScript, TypeScript, 性能优化, 异步请求, HTTP缓存, Redis, Vite]
category: 面试记录
draft: false
---

今天的模拟面试从 React 画布的模板配置切入，讨论了渲染排查、Vue 搜索竞态和前端发布，也练习了上传重试、鉴权刷新和 Redis 热点缓存。以下记录保留当时的答法、面试中的补充，以及下次可以复述的参考答案。

优先复练三处容易混淆的边界：

- **框架更新与浏览器绘制。** Vue 的 `nextTick()` 对应 DOM 更新。遇到异步 `watchEffect`，先确认响应式字段是在什么时点读取的。
- **拆包与首屏加载。** 用构建清单确认静态依赖，再沿导入链定位源码。动态行高的列表则需要按锚点补偿滚动位置。
- **网络成功与业务结果。** 对比优化效果时计量首批内容可见时间。请求超时时，通过上传幂等标识或共享刷新流程控制重试的副作用。

## React 画布如何接入新模板

**面试题** · 同一个图层的默认显隐随运动场景变化，位置随画幅变化。怎样设计 TypeScript 配置，让不同模板复用同一套 React 渲染逻辑？

**我的答法** · 每套模板都有自己的 `config.ts`。一级键是运动场景，二级键是画幅，下面配置各组件的位置。初始化时把运动场景和画幅写入全局 store。图层组件通过 selector 读取这两个值，再查询配置里自己的位置并渲染。

**点评** · 回答交代了配置结构和从状态到渲染的查找链路，也说明了新模板如何复用图层组件。还需要讲清三个要点。

- `config.ts` 如果直接导出对象，面试时可以说「TS 配置对象」，并说明场景、画幅和图层 ID 如何通过联合类型或 `Record` 约束。
- 题目同时考察默认显隐和位置。可以把默认显隐放在场景级，把坐标放在场景下的画幅级。这样同一场景的默认显隐只需声明一次。
- 说明缺失配置的含义。允许缺少某个场景或画幅时，要定义是标记不支持，还是沿用明确指定的默认配置。应当存在的可见图层缺少坐标时，可以在开发期报告配置错误。

**参考答法** · 每套模板导出一份带类型约束的配置。场景级记录默认显示的图层，场景下按画幅存放布局，每份布局按图层 ID 索引坐标。初始化时把当前场景和画幅写入 store。图层组件通过 selector 读取这两个值，再按自身 ID 得到显隐和坐标。已有图层类型可以复用这套查找逻辑，新模板只需提供对应的配置和素材。

如果每套模板都必须覆盖全部场景和画幅，可以用 `Record` 要求配置完整。如果模板只支持部分组合，可以用 `Partial<Record<…>>` 表达缺项，并在读取配置时明确处理不支持的组合。

## 用 Profiler 定位图层重渲染

**面试题** · 切换运动场景后，只有少数图层的坐标或显隐变化，Profiler 却显示多数图层都重新渲染。怎样查明触发原因？

**我的答法** · 想到了用 React 的诊断工具查看组件的渲染原因。

**点评** · 工具方向对。面试时补上工具名称、复现步骤，以及看到渲染原因后如何回到代码验证。

**参考答法**

1. 在 React DevTools 的 Profiler 设置里打开 **Record why each component rendered while profiling**，录制一次场景切换。选中对应的 commit，找一个坐标和显隐都没变的图层，查看 **Why did this render?** 的线索。 [React DevTools 设置源码](https://github.com/react/react/blob/main/packages/react-devtools-shared/src/devtools/views/Settings/ProfilerSettings.js)
2. 如果提示 props 变化，检查父组件是否传了新的对象或函数引用。如果提示 Hook 变化，对照图层实际订阅的值，比较切换前后的 selector 结果。如果图层的输入和订阅值都没变，再沿组件树检查是否是父组件更新带来的渲染。 [React DevTools 变更记录](https://github.com/react/react/blob/main/packages/react-devtools/CHANGELOG.md#why-did-this-render) · [React 的渲染与提交](https://react.dev/learn/render-and-commit)
3. 在这个例子中，可以先验证每个图层是否都订阅了 `sport`。如果是，切换场景会改变每个图层的订阅值，即使某些图层最终查到的坐标和显隐没有变化。调整后用同样的操作再录一次，对比重渲染的图层数量和渲染耗时。 [Zustand 的 selector 比较规则](https://zustand.docs.pmnd.rs/learn/guides/prevent-rerenders-with-use-shallow)

### 追问 · 图层应该订阅哪些值

**我的答法** · 每个图层只订阅自己的坐标和显隐状态。

**点评** · 订阅范围选得对。还可以说明 selector 从哪里拿到场景和画幅，以及 Zustand 怎样判断输出是否变化。

**参考答法** · selector 内部用当前场景、画幅和图层 ID 查配置，只返回图层实际使用的 `x`、`y` 和 `visible`。可以分别订阅三个基本类型值，也可以用 `useShallow` 包住返回这三个字段的 selector。Zustand 默认用 `Object.is` 比较 selector 的结果。直接返回新建对象时，字段值相同也会产生新引用。浅比较可以让这三个字段相同的图层跳过由本次 store 更新触发的重渲染。 [Zustand 的 selector 比较规则](https://zustand.docs.pmnd.rs/learn/guides/prevent-rerenders-with-use-shallow)

## Vue 搜索框如何处理异步请求竞态

**面试题** · 用户连续输入关键词，旧请求比新请求更晚返回。怎样保证页面只展示最新关键词对应的搜索结果？

**我的答法** · 通过 `AbortController` 管理请求，发起新请求时取消上一次请求。

**点评** · 取消旧请求是正确的。需要补充如何让 `fetch` 接收到取消信号，以及旧任务已经进入后续异步处理时怎么保护页面状态。

**参考答法** · 在 Vue 的 `watch` 回调里为每次搜索创建一个 `AbortController`，把 `signal` 传给 `fetch`。通过第三个参数 `onCleanup` 注册 `abort()`，在旧搜索失效或 watcher 停止时取消请求。主动取消按正常流程处理，避免弹出请求失败提示。 [Vue 文档：副作用清理](https://vuejs.org/guide/essentials/watchers.html#side-effect-cleanup) · [Fetch 标准](https://fetch.spec.whatwg.org/#fetch-method)

有防抖或额外的异步数据处理时，可以在关键词变化后立即推进搜索序号，提交结果、写入错误和重置 `loading` 前都确认序号仍然最新。这样等待防抖期间回来的旧响应，以及继续执行的旧任务，都无法覆盖当前搜索状态。

## SPA 入口和哈希资源的 HTTP 缓存

**面试题** · SPA 的入口 HTML 引用了文件名带内容哈希的 JS 和 CSS。怎样配置 `Cache-Control`，让用户打开页面时拿到当前版本，并复用未修改的静态资源？

**我的答法** · 入口 HTML 用 `no-store`，带哈希的 JS、CSS 用 `max-age`。哈希变化后，浏览器请求新文件。

**点评** · 两类资源分开配置的思路正确。可以把入口 HTML 的两个选择说清楚，再说明浏览器如何按 URL 命中静态资源缓存。

- **入口 HTML** · `no-store` 要求 HTTP 缓存不存储响应。如果希望保留 HTML 并在每次复用前校验，可以用 `Cache-Control: no-cache`，配合 `ETag`。浏览器拿到缓存副本后可以通过 `If-None-Match` 发起条件请求。内容未变时收到 `304`，继续使用已缓存的 HTML。 [RFC 9111：缓存响应指令](https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2.2) · [RFC 9110：If-None-Match](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.2)
- **公开的哈希静态资源** · 可以用 `Cache-Control: public, max-age=31536000, immutable`。URL 相同、缓存匹配且仍新鲜时，浏览器通常直接复用。内容变化后，新版 HTML 会引用新的哈希 URL。浏览器按新 URL 查找缓存，未命中时才发起请求。这套策略依赖同一个哈希 URL 始终对应同一份内容。 [RFC 9111：缓存响应指令](https://www.rfc-editor.org/rfc/rfc9111.html#section-5.2.2) · [RFC 8246：immutable](https://www.rfc-editor.org/rfc/rfc8246.html#section-2)

### 追问 · 发布后旧页面的懒加载 chunk 返回 404

**我的答法** · 提供手动重新加载按钮，通过 10%、50%、100% 逐步放量，并考虑通过 WebSocket 通知活跃客户端更新。

**点评** · 重载按钮可以帮助用户恢复。这里的 `404` 发生在静态资源请求上，路由仍然可能匹配成功。入口应放在动态导入失败的处理流程里。灰度可以控制新版的放量节奏，前提是新旧版本引用的资源在过渡期内都可访问。若业务已有 WebSocket，可用它推送新版本提醒，把刷新时机交给用户，避免打断未保存的操作。 [Vite 文档：加载错误处理](https://vite.dev/guide/build.html#load-error-handling)

**参考答法** · 先上传新版本的全部静态资源，验证 CDN 上可以访问，再切换入口 HTML。旧版本的哈希资源继续通过原 URL 提供，包括尚未被旧页面加载的异步 chunk。按活跃会话时长和回滚窗口制定保留策略，过期后再清理。发布验证可以保留一个发布前打开的标签页，在切换入口后首次进入懒加载路由，确认旧 chunk 仍然可用。对已失效的旧页面，在动态导入失败时提供重新加载入口。 [Vite 文档：版本不一致](https://vite.dev/guide/troubleshooting.html#version-skew)

## 任务卡同时到期时如何批量刷新

**面试题** · 一批倒计时任务卡可能在同一秒到期。怎样及时确认服务端状态，并减少请求次数？

**我的答法** · 把到期定时器交给父组件管理。合并同一秒到期的卡片，用任务 ID 数组一次请求多张卡片的最新状态。

**点评** · 集中调度和批量接口都答到了。可以把「定时器冒泡」说得更具体：由父组件根据已有的任务列表调度，或由卡片显式上报到期事件。再说明如何去重和应用批量结果。

**参考答法** · 父组件按到期时间归组，用 `Set` 保存每组任务 ID，只给最近一组设一个定时器。定时器触发时，收集已到期且尚未同步的 ID，发一次批量请求。响应按 ID 更新对应卡片，以服务端结果确认任务最终状态。如果到期时间精确到毫秒，但业务允许按秒合并，可以在该秒内最后一张卡片到期后发送这一批请求，避免提前确认。

## Vue 的 nextTick 与浏览器绘制

**面试题** · 点击按钮后设置 `loading = true`，接着 `await nextTick()`，再运行约 800 毫秒的同步计算。为什么计算结束前可能看不到 loading？

**作答情况** · 对这一段执行顺序还不熟悉。

**参考答法** · `nextTick()` 等待 Vue 把这批变更写入 DOM。它返回的 Promise 完成后，`await` 后面的代码会在微任务里继续跑。此时浏览器可能还没获得绘制机会，紧接着的同步计算又持续占用主线程。若计算一结束就把 `loading` 设回 `false`，浏览器可能只绘制最终状态，用户从头到尾都看不到 loading。 [Vue 的 nextTick 文档](https://vuejs.org/api/general.html#nexttick) · [HTML 标准：事件循环](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model)

**工程处理** · 可以把纯计算交给 Web Worker，主线程继续处理界面更新和用户输入。必须留在主线程的工作可以拆成短任务，在批次之间让出主线程，给浏览器绘制机会。 [HTML 标准：Web Workers](https://html.spec.whatwg.org/multipage/workers.html#workers)

### 追问 · Worker 中如何复用筛选数据

**我的答法** · 第一次把完整数据保存在 Worker 中。后续每次只传筛选条件，Worker 在内存中完成筛选和分组，把结果回传主线程。

**点评** · 答到了数据复用的核心。可以进一步明确回传的数据量，以及连续筛选时怎样让结果对应当前条件。

**参考答法** · 主线程通过 `postMessage` 发送一次初始化数据。之后每次筛选只发送条件和 `requestId`，Worker 根据已有的数据计算，回传同一个 `requestId` 和 UI 所需的结果，例如分组计数或当前页记录。主线程只应用最新请求的结果。原始数据变化时，显式更新 Worker 中的数据。 [HTML 标准：与 Dedicated Worker 通信](https://html.spec.whatwg.org/multipage/workers.html#communicating-with-a-dedicated-worker)

首次发送大型对象数组仍有结构化克隆的开销。如果数据本身适合用 `ArrayBuffer` 表示，且发送后由 Worker 持有，可以用 transfer list 转移底层数据，发送端的 buffer 会被分离。 [HTML 标准：可转移对象](https://html.spec.whatwg.org/multipage/structured-data.html#transferable-objects)

## 热门商品缓存过期时如何合并回源

**面试题** · 多个 Node.js 实例共享 Redis。一个热门商品的缓存过期后，怎样避免并发请求同时查询 MySQL？

**我的答法** · 想到了通过缓存字符串 `"null"` 避免回源、给 TTL 加随机值，以及用锁协调请求。

**点评** · 题目描述的是单个热点键过期时的缓存击穿。数据库确认商品不存在后，可以用短 TTL 缓存空值，减少缓存穿透。随机 TTL 用来错开多个键的到期时间，减少集中失效。这里需要用按商品 ID 的互斥锁，协调同一个键的并发回源。 [AWS：空值缓存 TTL](https://docs.aws.amazon.com/prescriptive-guidance/latest/dynamodb-elasticache-integration/design.html) · [AWS：缓存 TTL 策略](https://aws.amazon.com/caching/best-practices/)

**参考答法**

1. Redis 未命中时，各实例用 `SET lock:product:<id> <token> NX PX <ttl>` 竞争这个商品的重建锁。
2. 拿到锁后再读一次缓存。如果仍然未命中，由持锁者查 MySQL 并回填 Redis。其他请求短暂等待后重读缓存，超过等待预算时走降级或返回可重试错误。
3. 锁带有租期，租期需要覆盖正常的回源与写缓存时间。释放时原子比较 token，再删除属于本请求的锁，避免误删其他请求后来取得的锁。 [Redis：Node.js 缓存重建示例](https://redis.io/docs/latest/develop/use-cases/cache-aside/nodejs/#stampede-protection-with-a-lua-lock) · [Redis：分布式锁](https://redis.io/docs/latest/develop/use/patterns/distributed-locks/)

## TypeScript 接口类型与运行时校验

**面试题** · 第三方接口响应被断言为 `User`，但实际可能返回 `name: null`。怎样让业务组件收到符合类型定义的数据？

**我的答法** · 用 `user.name?.trim()` 处理空值，并将接口类型中的 `name` 声明为可选或 `string | null`。

**点评** · 这个写法能处理展示层的空值。字段允许省略时，可以写 `name?: string`。字段必须存在但允许是空值时，可以写 `name: string | null`。契约允许省略和显式空值时，可以写 `name?: string | null`。`?.` 在左侧是 `null` 或 `undefined` 时短路。如果接口传来 `name: 123`，调用 `trim()` 仍会抛错。 [TypeScript：可选链](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#optional-chaining)

**参考答法** · 在请求层把原始响应当作 `unknown`，用 schema 或手写校验检查对象结构和各字段。按接口契约接受合法的 `null`，类型错误走明确的错误处理。校验成功后再映射为组件使用的 `User`，组件可以对合法空值展示默认文案。`as User` 会在编译时移除，所以运行时校验需要在接口层明确执行。 [TypeScript：类型断言](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)

## Vite 中如何追踪首屏依赖

**面试题** · 富文本编辑页已经做了路由懒加载，但编辑器库仍在首屏入口 chunk 里。怎样找出把它带入首包的依赖链？

**作答情况** · 对首包依赖的追踪过程还不熟悉。

**参考答法**

1. 用生产构建的打包报告定位编辑器库所在的 chunk。如果编辑器代码出现在一个共享 chunk 里，开启 `build.manifest`，从首屏入口逐层检查 `imports`，确认它是否属于首屏的静态依赖。清单中的 `dynamicImports` 记录动态导入关系。 [Vite：构建清单](https://vite.dev/guide/backend-integration.html)
2. 用 `rollup-plugin-visualizer` 的 Network 视图找到编辑器模块，顺着「谁导入了它」往入口反查。也可以用 Rollup 插件的 `getModuleInfo(id)` 读取 `importers` 和 `dynamicImporters`，区分两种导入关系。 [Visualizer：Network 视图](https://github.com/btd/rollup-plugin-visualizer#network) · [Rollup：getModuleInfo](https://rollupjs.org/plugin-development/#this-getmoduleinfo)
3. 把依赖链落到源码。例如 `main.ts → 全局组件注册 → RichEditor.vue → 编辑器库`。即使路由使用动态导入，入口仍可能经由全局注册静态导入同一个组件。改完后重新构建，用清单和浏览器 Network 验证普通页面首屏没有编辑器资源请求，首次进入编辑页时才加载。

### 追问 · 全局注册的 Vue 组件如何按需加载

**我的答法** · 通过 ES 模块的动态导入，让模块在用到时加载。

**点评** · 动态导入的方向对。需要说出具体语法 `import()`，以及 Vue 如何在组件首次渲染时调用加载函数。

**参考答法** · 把 `RichEditor.vue` 从带 `eager: true` 的 glob 匹配范围中排除，再用原组件名全局注册一个异步组件。Vue 在首次实际渲染它时才执行 loader，模板可以继续写 `<RichEditor />`。 [Vue：异步组件](https://vuejs.org/guide/components/async.html) · [Vite：Glob 导入](https://vite.dev/guide/features.html#glob-import)

```ts
import { defineAsyncComponent } from "vue";

app.component(
  "RichEditor",
  defineAsyncComponent(() => import("./components/RichEditor.vue")),
);
```

## JavaScript 批量上传如何限制并发

**面试题** · 页面要上传 100 张图片，同时最多允许 3 个请求。某张图片失败后，其余图片仍要继续上传。怎样调度？

**我的答法** · 将图片按每 3 张分组，在循环里等待当前组的 `Promise.allSettled()`，再启动下一组。收集上传失败的图片，随后重新分组重试。

**点评** · 分批方案可以满足题目。每轮只创建当前组的上传请求，`allSettled` 等这一组全部结束，并保留每张图片的成功或失败结果。这个方案有组间等待：如果同组三张图里最后一张特别慢，前两张结束之后空出来的槽位要等整组结束。 [ECMAScript：Promise.allSettled](https://tc39.es/ecma262/multipage/control-abstraction-objects.html#sec-promise.allsettled)

**参考答法** · 可以启动 3 个异步循环，共享一个待上传队列。每个循环取出一张图片，等待上传完成，在单个任务内部捕获并记录错误，再继续取下一张。任意一个请求结束后都可以立刻补上新任务，并发数始终最多为 3。重试也进入同一个限并发队列，在接口支持安全重试时，对可恢复错误设置有限次数和退避间隔。

### 追问 · 上传成功但响应丢失，怎样安全重试

**我的答法** · 根据图片内容生成标识，重试时交给服务端。服务端如果找到原来的图片记录，就直接返回已有结果。

**点评** · 你抓住了重试时复用标识、服务端返回原结果的思路。如果业务要做文件内容去重，可以直接对文件字节算哈希，省去 Base64 转换。上传幂等更关心一次业务操作。例如，同一张图分别上传到两个相册，两次操作可以使用不同的上传标识。 [AWS Builders’ Library：幂等 API 的请求标识](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)

**参考答法** · 前端为每次用户发起的上传生成一个 `uploadId`，该次上传的所有重试都带同一个 ID。服务端按用户和 `uploadId` 设置唯一约束，原子登记处理状态。收到同 ID 的重复请求时，已完成就返回原来保存的图片记录，处理中就返回当前状态。同一 ID 携带不同文件或目标相册时，返回参数冲突。这样并发重试也只会创建一条图片记录。 [AWS Builders’ Library：安全重试与原子登记](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)

## 如何验证接口聚合提升了列表首屏性能

**面试题** · 列表首屏从并行请求 6 个接口改成请求 1 个聚合接口。怎样证明用户更快看到列表？

**我的答法** · 对比新旧版本的接口返回耗时。

**点评** · 新旧对照是正确的起点。还要把终点放在用户实际看到第一批列表数据的时刻。原来 6 个请求并行，应该看哪些响应位于列表展示的关键路径。聚合接口返回后，数据解析、组件渲染和浏览器绘制也可能影响结果。

**参考答法**

1. 定义主指标为「开始进入列表页到首批真实数据可见」。用 `performance.mark()` 和 `performance.measure()` 给进入页面、接口完成和列表 DOM 更新等节点打点，用 Chrome Performance 的录制截图核对首批行实际出现的时机。 [W3C：User Timing](https://www.w3.org/TR/user-timing/) · [Chrome DevTools：录制截图](https://developer.chrome.com/docs/devtools/performance/reference#capture-screenshots-while-recording)
2. 在相同的数据量、设备和网络条件下重复测试新旧版本，将冷缓存和热缓存分别比较。上线灰度时用同一套埋点对照 P50 和 P95，并同时看成功率，避免把加载失败的样本排除后误判为变快。
3. 用请求瀑布图核对首屏关键响应的完成顺序，再结合服务端分段耗时和浏览器渲染记录定位变化来源。 [W3C：Resource Timing](https://www.w3.org/TR/resource-timing/)

### 追问 · 侧栏统计慢，如何让列表先显示

**我的答法** · 按组件的数据依赖独立加载，各模块数据就绪后各自渲染。也考虑把侧栏统计交给 Web Worker。

**点评** · 独立加载、独立渲染抓住了关键。当前的 1.5 秒发生在服务端聚合阶段，需要调整接口的响应边界。Web Worker 适用于原始数据已经到达浏览器、统计计算占用前端主线程的场景。 [HTML 标准：Web Workers](https://html.spec.whatwg.org/multipage/workers.html#workers)

**参考答法** · 让列表接口只返回首屏列表需要的数据，把侧栏统计放到独立接口。两者可以并行发起，组件分别维护加载和错误状态。列表拿到数据就立即渲染，侧栏先显示占位，统计就绪后再更新。侧栏失败时在局部提供重试。改完后用上一题定义的「进入页面到第一批列表可见」指标验证效果。

## 虚拟列表行高变化时如何保持视口稳定

**面试题** · 用户滚到第 500 行时，上方某一行的图片加载完成，实际行高增加了 80 像素。怎样保持当前可见内容的位置？

**作答情况** · 对动态行高的滚动补偿还不熟悉。

**参考答法** · 以当前第一个可见项为滚动锚点，记录它的稳定 ID 和视口在该行内的偏移。对已挂载的行使用 `ResizeObserver` 测量实际行高，并更新虚拟列表的高度缓存和偏移。用更新后的锚点起点加上原来的行内偏移，得到新的 `scrollTop`。 [Resize Observer 规范](https://www.w3.org/TR/resize-observer/) · [CSS Scroll Anchoring：滚动补偿](https://www.w3.org/TR/css-scroll-anchoring-1/#adjustment)

例如第 500 行原本从内容坐标 `20000` 开始，`scrollTop` 为 `20010`，也就是视口从这一行内部 10 像素处开始。上方增加 80 像素后，该行的起点变成 `20080`，将 `scrollTop` 改为 `20090` 就能保留这 10 像素偏移。如果变化发生在锚点下方，锚点起点保持原值。可以优先复用虚拟列表库提供的尺寸变化补偿。 [TanStack Virtual：行高变化时的滚动补偿](https://tanstack.com/virtual/latest/docs/api/virtualizer#shouldadjustscrollpositiononitemsizechange)

## Vue 的 watchEffect 在异步回调里如何收集依赖

**面试题** · `watchEffect` 里的异步函数先执行 `await loadConfig()`，之后才首次读取 `filters.value`。怎样让筛选条件变化后重新执行？

**作答情况** · 对异步回调的依赖收集时机还不熟悉。

**参考答法** · `watchEffect` 只追踪同步执行阶段读取的响应式值。首次读取在 `await` 之后时，筛选条件没有被收集为依赖。可以把实际依赖的字段读到第一个 `await` 前，也可以用 `watch` 显式指定来源。 [Vue：watchEffect](https://vuejs.org/guide/essentials/watchers.html#watcheffect)

```ts
watch(
  () => filters.value.keyword,
  async (keyword) => {
    const config = await loadConfig();
    await search(keyword, config);
  },
  { immediate: true },
);
```

示例显式监听 `keyword`，所以即使筛选对象仍是同一个引用，原地修改该字段也会触发。多个筛选字段可以作为一组来源传给 `watch`。`immediate: true` 保留初始化时也执行一次的行为。 [Vue：监听来源与立即执行](https://vuejs.org/guide/essentials/watchers.html#watch-source-types)

## React 列表删除后为什么会串输入值

**面试题** · 可编辑列表用数组下标当 `key`，每行用自己的 `useState` 保存输入。删除中间一行后，为什么输入值会出现在其他数据行？

**我的答法** · 删除后数组下标发生变化，React 会按 `key` 匹配新旧项，导致组件复用错位。应该改用每条数据的唯一 ID。

**点评** · 识别出 `key` 随位置变化是正确的。这里串位的是被复用组件的本地 `useState`。这次渲染的 props 已经对应新数据，但复用的组件实例仍保留上一次的输入状态。 [React：保留和重置状态](https://react.dev/learn/preserving-and-resetting-state)

**参考答法** · 列表原本是 `[A, B, C]`，下标键为 `0, 1, 2`。删掉 B 后，C 的新键变成 `1`。React 在同一个父组件下匹配到键为 `1`、类型相同的旧行，于是用 B 的行组件渲染 C 的数据，并保留该行的本地输入状态。改成 `<Row key={item.id} item={item} />` 后，C 移动位置时仍能匹配原来的组件。ID 在同级列表中唯一，且同一条数据跨渲染保持稳定。 [React：列表中的 key](https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key)

## React 一次点击中连续更新三次状态

**面试题** · `count` 初始为 `0`。一次点击里连续执行三次 `setCount(count + 1)`，下一次渲染显示几？怎样加 3？

**我的答法** · 显示 `1`。用 `setCount(count => count + 1)` 的函数式写法累加。

**点评** · 结果和修法都正确。还可以解释事件处理函数里读取的状态快照，以及 React 怎样处理状态更新队列。

**参考答法** · 一次点击的处理函数读取的是当前这次渲染的 `count` 快照。三次调用都等价于 `setCount(1)`，也就是在队列里三次请求将状态替换为 `1`。React 处理队列后的结果仍是 `1`。改成连续调用三次 `setCount(prev => prev + 1)`，每个更新函数会接收队列中上一步的结果，依次得到 `1 → 2 → 3`。如果业务意图就是一次加 3，可以直接写 `setCount(prev => prev + 3)`。 [React：状态快照](https://react.dev/learn/state-as-a-snapshot) · [React：状态更新队列](https://react.dev/learn/queueing-a-series-of-state-updates)

## 并发 401 如何共用一次 token 刷新

**面试题** · 同一页面有 5 个请求因为 access token 过期而返回 `401`。怎样只刷新一次，并在成功后各自重试？

**我的答法** · 把需要刷新的请求放进队列，由第一个请求触发刷新。其他请求等待刷新完成后，用新 token 重试。

**点评** · 集中刷新和统一唤醒都正确。可以用「刷新请求仍在执行」作为合并条件，避免依赖固定的时间窗口。一个共享的 `refreshPromise` 就能让多个请求一起等待。

**参考答法** · 请求层识别服务端约定的 access token 失效错误。首个需要刷新的请求创建并保存 `refreshPromise`，后续请求直接等待同一个 Promise。成功后保存新 token，各请求带新凭据重放一次。刷新接口走独立的错误处理，确保它的失败不会递归触发刷新。成功或失败都要清理共享 Promise。若刷新凭据已失效，统一结束等待并引导重新登录。临时网络故障则向等待者返回可重试错误。 [RFC 6750：无效 access token](https://www.rfc-editor.org/rfc/rfc6750.html#section-3.1) · [RFC 6749：刷新 access token](https://www.rfc-editor.org/rfc/rfc6749.html#section-6)
