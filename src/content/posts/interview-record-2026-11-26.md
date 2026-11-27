---
title: '2026-11-26 面试记录 · 请求层并发与组件更新'
published: 2026-11-26
description: '复盘前端请求层、React 与 Vue 组件更新、JavaScript 微任务、首屏图片性能和 TypeScript 业务建模。'
tags: [前端网络, HTTP, 鉴权, 并发请求, React, Vue, JavaScript, TypeScript, 性能优化, CORS]
category: 面试记录
draft: false
---

## 刷新已经完成，旧请求才收到 401

**面试题** · A 和 B 都带旧 token 发出。A 收到 `401` 后刷新成功，共享的 `refreshPromise` 已经清空。这时 B 才返回 `401`。怎样判断 B 可以直接用新 token 重试？

**我的答法** · 刷新时标记旧 token 已经被替换。B 收到 `401` 后检查自己使用的 token 是否已被替换，如果已经换过，就用当前的新 token 重试。

**点评** · 判断方向正确。共享 Promise 记录的是刷新是否仍在进行，凭据版本记录的是刷新是否已经发生。可以在发请求时保存凭据版本，再用它与当前版本比较。

**参考答法** · 请求发出时记录会话标识和当前 `tokenVersion`。刷新成功后，一起更新 access token 与版本号。同一会话内，若 B 的发送版本比当前版本旧，就用当前 token 重试一次。若版本相同且服务端确认凭据失效，则进入共享刷新流程。刷新失败时保持版本号。会话已经切换时，旧请求按失效处理，避免拿另一个账号的凭据重放。 [RFC 6750：无效 access token](https://www.rfc-editor.org/rfc/rfc6750.html#section-3.1)

## React 大列表更新时怎样让输入框保持响应

**面试题** · 输入框和大型搜索结果列表会随每次按键更新。数据已在本地，列表渲染仍然拖慢了字符回显。怎样安排更新？

**我的答法** · 把筛选计算放在 Web Worker，结果回传主线程，再渲染列表。

**点评** · Web Worker 可以分担筛选的 CPU 开销。这里还要处理回传之后的列表渲染，把输入回显和列表更新设成不同优先级。 [HTML 标准：Web Workers](https://html.spec.whatwg.org/multipage/workers.html#workers)

**参考答法** · `onChange` 直接更新受控输入框的 `query`。派生一个 `deferredQuery = useDeferredValue(query)`，把它和其他稳定的 props 传给用 `memo` 包裹的列表。输入框先回显，列表可以暂时保留上一批结果，随后以较低优先级渲染新结果。如果主线程上的列表渲染仍然很重，可以用虚拟列表减少实际挂载的行数。 [React：延后更新列表](https://react.dev/reference/react/useDeferredValue#deferring-re-rendering-for-a-part-of-the-ui)

## Vue 如何让选中状态只更新受影响的行

**面试题** · 每个列表行都接收自己的 `item` 和全局的 `activeId`。选中项从 A 切到 B 时，怎样调整 props，让这次选中变化只更新 A、B 两行？

**我的答法** · 给每个行组件传 `item` 和该行自己的 `isActive`。切换时，只有旧选中行和新选中行的布尔值会变化。

**点评** · 答对了。把比较放到父组件，用 `:is-active="item.id === activeId"` 把每个子组件关心的信息直接传进去。

**参考答法** · A 收到的值从 `true` 变成 `false`，B 从 `false` 变成 `true`，其他行继续收到 `false`。在 `item` 引用和其他 props 都保持稳定的前提下，这次切换只需要更新 A、B 两个行组件。父组件仍会执行列表的计算与比对。每行直接传 `:item="item"`，避免在父组件重新渲染时给每行创建一份新对象。 [Vue：Props 稳定性](https://vuejs.org/guide/best-practices/performance.html#props-stability)

## 带 Authorization 的跨域 GET 如何通过预检

**面试题** · 管理台跨域请求一个 API，`GET` 带 `Authorization` 请求头。浏览器先发 `OPTIONS`，服务端返回 `403`。怎样定位并修复？

**我的答法** · 先看请求头，判断触发预检的原因，尝试把请求改成简单请求。

**点评** · 查看请求头是对的。这个场景中，`Authorization` 触发了预检。既然正式请求需要这个头，就保留鉴权头，修复网关或应用的 `OPTIONS` 处理。 [Fetch 标准：CORS 请求](https://fetch.spec.whatwg.org/#http-requests)

**参考答法** · 在 Network 里打开 `OPTIONS`，看 `Origin`、`Access-Control-Request-Method: GET` 和 `Access-Control-Request-Headers: authorization`。查网关和应用日志确认是 CORS 规则拒绝，还是鉴权中间件把预检当成了业务请求。对来源允许的预检，可以让 CORS 处理先于业务鉴权，返回 `204`，并允许管理台的具体来源、`GET` 和 `Authorization`。正式 `GET` 继续正常鉴权，响应也返回匹配的 `Access-Control-Allow-Origin`。 [Fetch 标准：CORS 响应](https://fetch.spec.whatwg.org/#http-responses) · [Fetch 标准：预检校验](https://fetch.spec.whatwg.org/#cors-preflight-fetch)

### 追问 · 带 Cookie 的跨域请求怎样配置响应头

**面试题** · 前端用 `credentials: "include"` 发跨域请求，接口返回 `Access-Control-Allow-Origin: *`，浏览器报 CORS 错。服务端要设置哪些响应头？

**作答情况** · 知道需要修改响应头，具体字段还不熟悉。

**参考答法** · 带凭据的 CORS 请求要求 `Access-Control-Allow-Origin` 匹配前端的具体来源，并且 `Access-Control-Allow-Credentials` 为小写的 `true`。例如前端来源是 `https://admin.example.com`，服务端返回以下响应头。如果请求还需要预检，预检响应也要声明对凭据的支持，并允许对应的方法和请求头。 [Fetch 标准：CORS 协议与凭据](https://fetch.spec.whatwg.org/#cors-protocol-and-credentials)

```http
Access-Control-Allow-Origin: https://admin.example.com
Access-Control-Allow-Credentials: true
```

如果允许多个来源，先用允许名单校验请求的 `Origin`，然后只返回匹配的那个来源。响应随 `Origin` 变化时，加 `Vary: Origin`，让 HTTP 缓存按来源区分响应。 [Fetch 标准：CORS 与 HTTP 缓存](https://fetch.spec.whatwg.org/#cors-protocol-and-http-caches)

## 浏览器怎样执行微任务中新加入的微任务

**面试题** · 判断下面这段浏览器脚本的输出顺序。

```js
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => {
  console.log("C");
  queueMicrotask(() => console.log("D"));
});

queueMicrotask(() => console.log("E"));
console.log("F");
```

**我的答法** · `A → F → C → E → B → D`。

**点评** · 前四项正确，最后两项需要交换。执行 `C` 时安排的 `D` 追加到微任务队列尾部，在这次微任务检查中就会执行。

**参考答法** · 同步代码先打印 `A` 和 `F`，此时微任务队列是 `[C, E]`。执行 `C` 后，`D` 排到 `E` 后面，队列变成 `[E, D]`。浏览器处理完这两个微任务后，定时器任务才有机会执行。所以顺序是 `A → F → C → E → D → B`。 [HTML 标准：微任务检查点](https://html.spec.whatwg.org/multipage/webappapis.html#perform-a-microtask-checkpoint) · [HTML 标准：定时器](https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers)

## 调整卡片宽度后怎样批量读取高度

**面试题** · 循环里反复修改卡片的 `style.width`，紧接着读它的 `offsetHeight`。如果需要的是调整后的高度，怎样减少同步布局？

**我的答法** · 父组件统一修改所有子卡片的宽度，完成后再统一读 `offsetHeight`。

**点评** · 方案正确。父组件协调两轮操作，第一轮批量写 DOM，第二轮批量读布局。优化来自读写的顺序。

**参考答法** · 原来每张卡片写完宽度后马上读高度，浏览器可能反复为测量计算布局。现在先写完所有宽度，再读取各卡片的新高度。第一次读取仍可能触发同步布局，后续连续读取通常可以复用这次布局结果。如果还要根据高度修改样式，把这批写入放在测量结束后。可以用 Chrome Performance 对比同样操作的 Layout 次数和耗时。 [Chrome 团队：避免强制同步布局和布局抖动](https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing)

## 怎样让浏览器更早请求 LCP 图片

**面试题** · 首屏横幅是 LCP 元素。图片下载很快，但请求要等 JavaScript 创建 `<img>` 才发出。怎样提前发现资源？

**我的答法** · 用 `preload` 预加载图片，并给脚本加 `defer`，减轻脚本对 HTML 的阻塞。

**点评** · 图片 `preload` 可以直接提前请求。对外部经典脚本，`defer` 让下载与 HTML 解析并行，并在解析完成后执行。如果图片元素由脚本创建，页面仍要等到该脚本执行后才能把图片加入 DOM。 [HTML 标准：script 的加载与执行](https://html.spec.whatwg.org/multipage/scripting.html#the-script-element)

**参考答法** · 如果能改首屏 HTML，用服务端渲染、静态生成或 HTML 模板直接输出带 `src` 的 `<img>`，使浏览器在解析 HTML 时发现它。若图片元素仍需由客户端 JavaScript 创建，则在初始 HTML 的 `<head>` 放入 `<link rel="preload" as="image" href="/assets/hero.webp">`，提前下载实际会用到的图片。需要时给该图加 `fetchpriority="high"` 提示优先级。改完后在请求瀑布中确认图片请求提前，并核对 LCP 是否改善。 [Chrome 团队：优化 LCP 资源发现](https://web.dev/articles/optimize-lcp#optimize-when-the-resource-is-discovered)

### 追问 · 响应式图片如何预加载正确的尺寸

**面试题** · 横幅用 `srcset` 和 `sizes` 选择图片尺寸，`preload` 却固定加载桌面大图。怎样让两者选择同一个资源？

**作答情况** · 对响应式预加载的属性还不熟悉。

**参考答法** · 在 `<link rel="preload" as="image">` 上设置 `imagesrcset` 和 `imagesizes`，值分别与 `<img>` 的 `srcset` 和 `sizes` 保持一致。两者就会根据同样的候选图片和显示宽度选图，并考虑设备像素比。预加载可以省略固定的 `href`，让实际的 `<img src="…">` 提供回退。 [Chrome 团队：预加载响应式图片](https://web.dev/articles/preload-responsive-images#imagesrcset-and-imagesizes) · [HTML 标准：link 元素](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element)

```html
<!-- 放在 head 中 -->
<link rel="preload" as="image"
  imagesrcset="/hero-480.webp 480w, /hero-960.webp 960w"
  imagesizes="(max-width: 800px) 100vw, 800px">

<!-- 页面中的横幅 -->
<img src="/hero-960.webp"
  srcset="/hero-480.webp 480w, /hero-960.webp 960w"
  sizes="(max-width: 800px) 100vw, 800px" alt="产品预览">
```

## TypeScript 怎样表达不同模式的必填字段

**面试题** · 通知支持邮件与短信。邮件必须有 `email`，短信必须有 `phone`。怎样在编译期拒绝缺少当前模式必填字段的配置？

**我的答法** · 抽出公共字段，再为两种模式分别定义类型，最后用联合类型描述配置。

**点评** · 拆分方式正确。每个分支用不同的字符串字面量标记 `channel`，并把该分支所需字段声明为必填。

```ts
interface CommonConfig {
  enabled: boolean;
}

interface EmailConfig extends CommonConfig {
  channel: "email";
  email: string;
}

interface SmsConfig extends CommonConfig {
  channel: "sms";
  phone: string;
}

type NotificationConfig = EmailConfig | SmsConfig;
```

**参考答法** · 这是可辨识联合类型。选择 `channel: "email"` 时，缺少 `email` 会报类型错误。消费配置时，检查 `config.channel === "email"` 后，TypeScript 会将该分支中的 `config` 缩窄为 `EmailConfig`，可以直接读 `config.email`。 [TypeScript：接口继承](https://www.typescriptlang.org/docs/handbook/2/objects.html#extending-types) · [TypeScript：可辨识联合](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)

### 追问 · 如何在编译时发现遗漏的分支

**面试题** · 新增 `inApp` 通知模式后，如何让忘记添加对应 `case` 的 `switch` 编译报错？

**作答情况** · 对联合类型的穷尽检查还不熟悉。

**参考答法** · 在 `default` 分支把配置交给只接受 `never` 的函数。所有类型都匹配到对应的 `case` 时，`default` 中的 `config` 被缩窄为 `never`。增加 `inApp` 却漏写 `case` 时，那个分支仍可能收到 `InAppConfig`，因此无法传给 `assertNever`。 [TypeScript：穷尽检查](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking)

```ts
function assertNever(_config: never): never {
  throw new Error("Unhandled notification channel");
}

function sendNotification(config: NotificationConfig) {
  switch (config.channel) {
    case "email":
      return sendEmail(config.email);
    case "sms":
      return sendSms(config.phone);
    default:
      return assertNever(config);
  }
}
```
