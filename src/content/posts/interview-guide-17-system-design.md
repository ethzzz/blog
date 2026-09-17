---
title: '前端系统设计场景题（P6+ 高级岗分水岭）'
published: 2026-09-16T21:00:00+08:00
description: '讲解大文件上传、权限系统、埋点监控、富文本编辑器、前端安全、灰度发布、低代码平台、组件库设计等高级岗必考场景题。'
tags: [前端面试, 系统设计, 场景题, 大文件上传, 权限]
category: 前端面试宝典
draft: false
---

> [!NOTE]
> 本文包含 15 道前端系统设计场景题，是**高级/资深前端（P6+/P7）面试的分水岭**。回答核心是"分析 → 方案 → 权衡 → 演进"，而不是直接给代码。难度标注：⭐⭐ 进阶 · ⭐⭐⭐ 高级 · 🔥 高频必考

---

## 回答框架

> [!IMPORTANT]
> **系统设计题的黄金回答框架**（务必按此结构组织）
>
> 1. **需求澄清**：反问关键细节（用户量、并发、场景、约束）
> 2. **技术方案**：整体架构 + 关键模块 + 数据流
> 3. **技术选型**：为什么选 A 不选 B（权衡 trade-off）
> 4. **难点攻关**：识别 1-2 个核心难点，深入展开
> 5. **性能与体验**：量化指标（响应时间、体积、FPS）
> 6. **演进与兜底**：从 MVP 到完整版的路径 + 异常处理

---

## 大文件上传

### Q1: 设计一个支持 GB 级大文件上传的方案 ⭐⭐⭐ 🔥

**需求澄清：**
- 文件大小上限？（100MB / 1GB / 10GB）
- 网络环境？（内网稳定 / 公网易断）
- 是否需要断点续传？秒传？
- 并发用户数？服务端存储方案？

**核心方案（分片上传 + 断点续传 + 秒传）：**

```
上传流程：
1. 计算文件 hash（秒传/去重用）
2. 检查是否已上传（秒传命中直接返回）
3. 检查已上传分片（断点续传）
4. 切片并并发上传未上传的分片
5. 通知服务端合并
```

```javascript
// 1. 文件切片
function createChunks(file, chunkSize = 5 * 1024 * 1024) {
  const chunks = [];
  for (let start = 0; start < file.size; start += chunkSize) {
    chunks.push(file.slice(start, start + chunkSize));
  }
  return chunks;
}

// 2. 计算文件 hash（增量 + Web Worker 避免卡顿）
// 大文件全量 hash 太慢，采用抽样 hash：
// - 首尾各 2MB 全量
// - 中间每隔 10MB 取 2MB 采样
async function calculateHash(file) {
  return new Promise(resolve => {
    const worker = new Worker('/hash-worker.js');
    worker.postMessage({ file });
    worker.onmessage = e => resolve(e.data.hash);
  });
}

// hash-worker.js（Web Worker 中计算，不阻塞主线程）
importScripts('/spark-md5.min.js');
self.onmessage = async ({ data: { file } }) => {
  const spark = new SparkMD5.ArrayBuffer();
  const chunks = createChunks(file);
  for (const chunk of chunks) {
    const buffer = await chunk.arrayBuffer();
    spark.append(buffer);
    self.postMessage({ progress: /* ... */ });   // 上报进度
  }
  self.postMessage({ hash: spark.end() });
};

// 3. 秒传 + 断点续传检查
const { uploadedChunks, uploaded } = await fetch('/api/upload/check', {
  method: 'POST',
  body: JSON.stringify({ hash, filename, total: chunks.length }),
}).then(r => r.json());

if (uploaded) return { url: existingUrl };      // 秒传命中

// 4. 并发上传（限制并发数 3）
const tasks = chunks
  .map((chunk, index) => ({ chunk, index }))
  .filter(({ index }) => !uploadedChunks.includes(index));

await asyncPool(3, tasks.map(({ chunk, index }) => async () => {
  const formData = new FormData();
  formData.append('chunk', chunk);
  formData.append('hash', fileHash);
  formData.append('index', index);
  return fetch('/api/upload/chunk', { method: 'POST', body: formData });
}));

// 5. 通知合并
await fetch('/api/upload/merge', {
  method: 'POST',
  body: JSON.stringify({ hash, filename, total: chunks.length }),
});
```

**关键追问与答案：**

| 追问 | 回答 |
|:--|:--|
| 分片大小怎么选？ | 5-10MB 平衡：太小请求多、太大失败重传成本高 |
| hash 计算慢怎么办？ | Web Worker + 抽样 hash + 增量计算（SparkMD5） |
| 如何显示进度？ | (已传字节 / 总字节) + 每个分片内部 XMLHttpRequest.upload.onprogress |
| 暂停/恢复？ | 维护 AbortController，暂停时 abort 所有请求 |
| 上传失败重试？ | 单分片失败自动重试 3 次（指数退避），全部失败入死信队列 |
| 服务端如何合并？ | 按 index 顺序 concat 分片文件 → 完整文件 |
| 并发数限制？ | 前端 asyncPool 限 3-6，避免打爆浏览器连接数（每域 6 个） |
| CDN 直传？ | 前端向业务服务器申请签名 → 直传 OSS/S3 → 回调业务服务器 |

**架构演进：**
- MVP：直接 POST 表单（<10MB）
- V1：分片上传 + 服务端合并（<1GB）
- V2：+ 断点续传 + hash 秒传（<10GB）
- V3：+ CDN 直传 + 客户端并发控制（无上限）
- V4：+ Web Worker + 增量 hash + 上传队列持久化（IndexedDB）

---

## 权限系统

### Q2: 设计一个中后台前端权限系统 ⭐⭐⭐ 🔥

**权限的三个层次：**

```
1. 路由权限：能不能访问某个页面
2. 按钮/操作权限：能不能看到/点击某个按钮
3. 数据权限：能看到哪些数据（部门/个人/全部）
4. 接口权限：后端接口鉴权（前端只做体验，安全靠后端）
```

**方案 A：路由表配置式（角色固定）**

```javascript
// 路由 meta 声明所需角色
const routes = [
  { path: '/user', component: UserList, meta: { roles: ['admin', 'manager'] } },
  { path: '/audit', component: Audit, meta: { roles: ['admin'] } },
];

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const userRoles = store.getters.roles;
  if (to.meta.roles && !to.meta.roles.some(r => userRoles.includes(r))) {
    next('/403');
  } else {
    next();
  }
});
```

**方案 B：动态路由（后端下发，主流）**

```javascript
// 1. 登录后拉取用户信息和权限
const { roles, permissions, menus } = await api.getUserInfo();

// 2. 根据后端菜单树过滤路由表
const asyncRoutes = [/* 所有可能的路由 */];
const accessibleRoutes = filterRoutes(asyncRoutes, menus);

function filterRoutes(routes, menus) {
  return routes.filter(route => {
    if (route.meta?.permission) {
      return menus.some(m => m.code === route.meta.permission);
    }
    if (route.children) {
      route.children = filterRoutes(route.children, menus);
    }
    return true;
  });
}

// 3. 动态注册
accessibleRoutes.forEach(r => router.addRoute(r));

// 4. 侧边栏菜单用同一份 menus 数据渲染（保持一致）
```

**按钮级权限（指令封装）：**

```javascript
// v-permission 指令
app.directive('permission', {
  mounted(el, binding) {
    const required = binding.value;
    const userPerms = store.getters.permissions;
    const hasPermission = Array.isArray(required)
      ? required.some(p => userPerms.includes(p))
      : userPerms.includes(required);
    if (!hasPermission) el.remove();
  },
});

// 使用
<el-button v-permission="'user:delete'">删除</el-button>
<el-button v-permission="['user:edit', 'admin']">编辑</el-button>

// 函数式（更灵活，可控制 loading/disabled 而不是删除）
<button :disabled="!hasPermission('user:delete')">删除</button>
```

**数据权限（后端为主，前端配合）：**

```javascript
// 前端只传"数据范围"参数（如：全部/本部门/本人）
// 后端根据用户角色和数据权限规则过滤 SQL
// 参考 RuoYi 的 @DataScope 注解：
// SELECT * FROM users ${dataScope}
// dataScope 由 AOP 根据角色注入：AND dept_id IN (...)
```

**追问与陷阱：**

| 追问 | 回答 |
|:--|:--|
| 前端权限能防住吗？ | 不能！前端只做体验（不显示无权内容），安全必须后端二次校验 |
| 权限变更后如何同步？ | 关键操作前实时校验 + WebSocket 推送权限变更事件强制刷新 |
| 权限粒度多细？ | 一般到"按钮/接口"级，字段级权限成本高、少用 |
| 大量权限点如何管理？ | 后端菜单表 + 权限标识（perm_code），前端只做展示，不硬编码 |
| 路由跳转闪烁？ | 动态 addRoute 后要 next({ ...to, replace: true }) 重新触发 |

---

## 前端监控

### Q3: 从零设计一个前端错误监控系统 ⭐⭐⭐ 🔥

```
整体架构：

浏览器 SDK → 上报网关 → Kafka → 消费服务 → 存储（ClickHouse/ES）→ 告警 + 看板

SDK 采集内容：
1. JS 错误：window.onerror / unhandledrejection
2. 资源加载错误：img/script/css 加载失败
3. 接口错误：拦截 fetch/XHR，记录 4xx/5xx/超时
4. 框架错误：Vue.config.errorHandler / React ErrorBoundary
5. 用户行为轨迹：点击、路由跳转、输入（脱敏）
6. 性能指标：LCP/FID/CLS + 长任务
7. 自定义错误：业务主动上报
```

```javascript
class Monitor {
  constructor(config) {
    this.config = { appId, userId, sampleRate: 1, ...config };
    this.buffer = [];
    this.init();
  }

  init() {
    this.hookError();
    this.hookPromise();
    this.hookResource();
    this.hookXHR();
    this.hookFetch();
    this.hookBehavior();
    this.startReport();
  }

  hookError() {
    window.addEventListener('error', (e) => {
      // 区分 JS 错误和资源错误
      if (e.target !== window) return this.reportResource(e);
      this.report({
        type: 'js_error',
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error?.stack,
      });
    }, true);   // 捕获阶段才能拿到资源错误
  }

  hookPromise() {
    window.addEventListener('unhandledrejection', (e) => {
      this.report({ type: 'promise_error', reason: String(e.reason) });
    });
  }

  hookXHR() {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    const self = this;

    XMLHttpRequest.prototype.open = function (method, url) {
      this._meta = { method, url, startTime: Date.now() };
      originalOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function () {
      this.addEventListener('loadend', () => {
        const { method, url, startTime } = this._meta;
        self.report({
          type: 'api',
          method, url,
          status: this.status,
          duration: Date.now() - startTime,
          success: this.status >= 200 && this.status < 300,
        });
      });
      originalSend.apply(this, arguments);
    };
  }

  hookBehavior() {
    // 用户行为轨迹（面包屑），保留最近 20 条
    this.breadcrumbs = [];
    document.addEventListener('click', e => {
      this.pushBreadcrumb({
        type: 'click',
        target: getXPath(e.target),
        text: e.target.innerText?.slice(0, 50),
      });
    }, true);
    // 路由变化
    const originalPush = history.pushState;
    history.pushState = (...args) => {
      this.pushBreadcrumb({ type: 'route', to: args[2] });
      originalPush.apply(history, args);
    };
  }

  report(data) {
    if (Math.random() > this.config.sampleRate) return;    // 采样
    this.buffer.push({
      ...data,
      ...this.config,
      timestamp: Date.now(),
      url: location.href,
      ua: navigator.userAgent,
      breadcrumbs: this.breadcrumbs.slice(-20),
    });
  }

  startReport() {
    // 批量 + 节流上报
    setInterval(() => this.flush(), 5000);
    // 页面卸载时用 sendBeacon
    window.addEventListener('beforeunload', () => {
      if (this.buffer.length) {
        navigator.sendBeacon('/api/monitor', JSON.stringify(this.buffer));
      }
    });
    // 空闲时上报
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => this.flush());
    }
  }

  flush() {
    if (!this.buffer.length) return;
    const batch = this.buffer.splice(0, 50);
    navigator.sendBeacon('/api/monitor', JSON.stringify(batch));
  }
}

new Monitor({ appId: 'my-app', sampleRate: 0.1 });   // 10% 采样
```

**关键设计点：**

| 点 | 方案 |
|:--|:--|
| SourceMap 还原 | 生产环境不上传 SourceMap 到 CDN，只上传到监控平台，服务端用 source-map 库还原堆栈 |
| 错误去重/聚合 | 按 hash(type+message+filename+lineno) 聚合，一个错误只显示一次 |
| 采样率 | 大流量站点 10%，小站点 100%，错误可 100% |
| 用户脱敏 | 密码/身份证/手机号在 SDK 端脱敏后再上报 |
| 告警规则 | 5 分钟内错误率 > 0.5% / 新增错误类型 / P0 页面白屏率 > 1% |
| 现成方案 | Sentry（开源+云服务）、阿里 ARMS、腾讯 RUM、字节 volcengine |

---

## 富文本编辑器

### Q4: 如何设计一个富文本编辑器？⭐⭐⭐

```
三种技术路线：

1. contenteditable（老方案）
   - 浏览器原生 API，兼容性最好
   - 但各浏览器行为不一致，坑极多
   - 代表：早期的 UEditor、KindEditor

2. 自绘 + 隐藏输入框（现代方案）
   - 完全自己绘制内容（Canvas 或 DOM）
   - 用一个隐藏 input/textarea 接收键盘事件
   - 好处：完全控制渲染，跨浏览器一致
   - 代表：Google Docs、飞书文档、Figma

3. 基于成熟框架（推荐）
   - Slate.js（React，可扩展性极强）
   - ProseMirror（框架无关，插件化）
   - Tiptap（基于 ProseMirror，Vue 友好）
   - Quill（老牌，API 简单）
   - Lexical（Meta 出品，2022 年）
```

**核心数据模型（ProseMirror/Slate 风格）：**

```javascript
// 文档 = 树形结构，每个节点有类型、属性、子节点
{
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Hello ' },
        { type: 'text', text: 'world', marks: [{ type: 'bold' }] },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Title' }],
    },
    {
      type: 'image',
      attrs: { src: 'xxx.jpg', alt: 'desc' },
    },
  ],
}

// 编辑器三大核心：
// 1. Schema：定义允许的节点和标记（约束文档结构）
// 2. Transaction：所有修改都是不可变的 op，可撤销重做
// 3. Plugin：装饰、快捷键、协同编辑都是插件
```

**关键难点与方案：**

| 难点 | 方案 |
|:--|:--|
| 光标管理 | Selection API + 自绘光标（跨浏览器一致） |
| 撤销/重做 | 事务日志（Transaction History），不用快照 |
| 粘贴处理 | 拦截 paste 事件，解析 HTML/Markdown 转内部结构 |
| 图片上传 | 拦截 drop/paste，本地 blob 占位 → 上传后替换 URL |
| @提及 | 触发字符检测 + 弹出面板 + 插入 mention 节点 |
| 协同编辑 | Yjs + ProseMirror/Slate 绑定（见 16 篇 Q11） |
| 大文档性能 | 虚拟滚动（只渲染可视区域段落） |
| Markdown 兼容 | 序列化插件（内部结构 ↔ Markdown） |
| XSS 防护 | 严格 sanitize（DOMPurify），不允许任意 HTML |

---

## 前端安全

### Q5: 前端如何做安全防护？⭐⭐ 🔥

```
1. XSS（跨站脚本）防护
   - 类型：存储型（评论注入）、反射型（URL 参数）、DOM 型（innerHTML）
   - 防御：
     * 输出转义：Vue {{ }}、React JSX 自动转义
     * 避免 v-html / dangerouslySetInnerHTML
     * 必须使用时用 DOMPurify 消毒
     * CSP 内容安全策略（限制脚本来源）
     * HttpOnly Cookie（JS 读不到，防窃取）

   import DOMPurify from 'dompurify';
   element.innerHTML = DOMPurify.sanitize(userInput);

   // CSP 响应头
   Content-Security-Policy: default-src 'self';
                            script-src 'self' https://cdn.example.com;
                            object-src 'none';

2. CSRF（跨站请求伪造）防护
   - 类型：GET 型（img src）、POST 型（自动提交表单）
   - 防御：
     * SameSite Cookie：Strict / Lax（默认，禁止跨站携带）
     * CSRF Token：表单加隐藏字段，后端校验
     * 双重 Cookie：请求头带 X-CSRF-Token = Cookie 中的 token
     * 验证 Origin/Referer 头

3. 点击劫持
   - 防御：X-Frame-Options: DENY / SAMEORIGIN
   - 或 CSP frame-ancestors

4. MIME 嗅探
   - 防御：X-Content-Type-Options: nosniff

5. HTTPS 强制
   - HSTS：Strict-Transport-Security: max-age=31536000

6. 敏感数据处理
   - 前端不存明文密码（用一次性 token）
   - localStorage 慎用（XSS 可读），敏感用 HttpOnly Cookie
   - 打印日志脱敏（手机号、身份证）

7. 第三方脚本管控
   - SRI（Subresource Integrity）：hash 校验 CDN 脚本
   <script src="https://cdn/x.js"
           integrity="sha384-xxx" crossorigin="anonymous"></script>

8. 供应链安全
   - 依赖审计：npm audit / snyk
   - lock 文件提交（package-lock.json）
   - CI 检查依赖漏洞
```

---

## 长列表与大数据渲染

### Q6: 10 万行 Excel 数据如何在前端渲染并支持编辑？⭐⭐⭐

```
核心思路：虚拟滚动 + 分片计算 + 增量渲染

架构：
┌──────────────────────────────────────┐
│  数据层（Web Worker + IndexedDB）    │
│  - 原始数据 10 万行放 Worker 内存     │
│  - 大文件用 IndexedDB 分片存储        │
│  - 计算（排序/过滤/公式）在 Worker    │
├──────────────────────────────────────┤
│  渲染层（Canvas 或 DOM 虚拟列表）     │
│  - Canvas：>5000 单元格推荐           │
│  - DOM：编辑交互友好，<1000 行足够    │
├──────────────────────────────────────┤
│  交互层（键盘/鼠标/剪贴板）           │
│  - 隐藏 textarea 接收键盘输入         │
│  - 复制粘贴解析 TSV/HTML              │
└──────────────────────────────────────┘

关键实现：

1. Canvas 渲染（性能最优）
   - 只绘制可视区（20x50 单元格 = 1000 个）
   - requestAnimationFrame 节流重绘
   - 分层 Canvas：背景层 + 数据层 + 选中层高亮

2. 数据分片加载
   - 首次只加载前 1000 行，滚动时按需加载
   - Worker 中预处理（排序、过滤）

3. 编辑交互
   - 单元格激活时创建浮动 input 定位到该格
   - 编辑完成写回 Worker 数据源，重绘该行

4. 现成方案
   - AG Grid（企业级，功能全，收费）
   - Handsontable（Excel-like，商用收费）
   - Luckysheet / Univer（国产开源）
   - RevoGrid（Web Component，轻量）
```

---

## 前端灰度与热更新

### Q7: 前端如何做灰度发布？⭐⭐⭐

```
方案对比：

方案 A：CDN 多版本共存
dist/
├── v1.0.0/         # 老版本
├── v1.1.0/         # 新版本
└── index.html      # 入口，根据用户 ID 决定加载哪个版本

灰度逻辑（Node 网关 or Nginx Lua）：
if (hash(userId) % 100 < grayPercent) {
  serve('v1.1.0/index.html');
} else {
  serve('v1.0.0/index.html');
}

方案 B：客户端灰度配置
1. 前端启动时先拉 /api/gray-config（这个接口本身不能灰度）
2. 根据配置动态加载不同 JS bundle
3. 好处：粒度可到功能级（feature flag）

方案 C：Feature Flag（推荐）
if (featureFlag('new_checkout_flow')) {
  render(<NewCheckout />);
} else {
  render(<OldCheckout />);
}
- 无需发版即可切换
- 支持按用户/百分比/地域开关
- 工具：LaunchDarkly / Unleash / 自研

灰度维度：
- 内部用户（员工邮箱）→ 内测用户 → 1% → 10% → 50% → 100%
- 每阶段观察 24h，关键指标（错误率、转化率）达标才推进

监控与回滚：
- 关键指标：JS 错误率、白屏率、页面加载时长、业务转化
- 阈值：错误率上涨 > 20% 自动告警
- 回滚：配置中心一键切回旧版本，无需重新发版
```

---

## 移动端专题

### Q8: H5 与原生 App 如何交互（JSBridge）？⭐⭐⭐

```
JSBridge 三种通信方式：

1. URL Scheme 拦截（老方案，兼容性好）
   - H5 触发 iframe.src = 'jsbridge://methodName?params=xxx'
   - Native 拦截 URL，解析方法名和参数
   - 缺点：URL 长度限制、连续调用可能丢

2. 注入 API（现代方案）
   - Android：addJavascriptInterface(window.native, ...)
   - iOS：WKScriptMessageHandler
   - H5 直接调 window.native.methodName(params)
   - 缺点：Android 4.2 前有安全漏洞

3. prompt/console 拦截（备用）
   - Native 拦截 window.prompt / console.log
   - 兼容性最好，但性能差

统一封装：
```

```javascript
class JSBridge {
  static callbacks = new Map();
  static callbackId = 0;

  static call(nativeMethod, params = {}) {
    return new Promise((resolve, reject) => {
      const cbId = `cb_${++this.callbackId}_${Date.now()}`;
      this.callbacks.set(cbId, { resolve, reject });

      const payload = JSON.stringify({
        method: nativeMethod,
        params,
        callbackId: cbId,
      });

      // 分平台调用
      if (window.webkit?.messageHandlers?.native) {
        window.webkit.messageHandlers.native.postMessage(payload);  // iOS
      } else if (window.native) {
        window.native.postMessage(payload);                          // Android
      } else {
        // 降级：URL Scheme
        const iframe = document.createElement('iframe');
        iframe.src = `jsbridge://${nativeMethod}?data=${encodeURIComponent(payload)}`;
        document.body.appendChild(iframe);
        setTimeout(() => iframe.remove(), 100);
      }

      // 超时
      setTimeout(() => {
        if (this.callbacks.has(cbId)) {
          this.callbacks.delete(cbId);
          reject(new Error('JSBridge timeout'));
        }
      }, 5000);
    });
  }

  // Native 调用此方法回传结果
  static handleCallback(callbackId, result) {
    const cb = this.callbacks.get(callbackId);
    if (cb) {
      cb.resolve(result);
      this.callbacks.delete(callbackId);
    }
  }
}
window.JSBridge = JSBridge;

// 使用
const userInfo = await JSBridge.call('getUserInfo');
await JSBridge.call('share', { title: 'xxx', url: 'yyy' });
```

**常见场景：**
- 获取用户信息 / Token
- 调用原生分享 / 支付 / 扫码
- 关闭当前 WebView
- 打开新页面（原生路由）
- 设置标题栏 / 状态栏
- 获取地理位置 / 设备信息

---

## 国际化

### Q9: 前端 i18n 方案怎么设计？⭐⭐

```
方案对比：

| 方案 | 优点 | 缺点 |
|:--|:--|:--|
| JSON 语言包（vue-i18n / react-intl） | 简单、生态好 | 语言包体积大 |
| ICU MessageFormat | 复数、性别、日期灵活 | 学习成本高 |
| 服务端下发 | 支持热更新 | 首屏依赖接口 |

vue-i18n 使用：
```

```javascript
// locales/zh-CN.js
export default {
  common: { confirm: '确认', cancel: '取消' },
  user: { greeting: '你好，{name}', items: '{count} 条消息' },
};

// 使用
t('common.confirm')             // 确认
t('user.greeting', { name: 'Tom' })  // 你好，Tom
t('user.items', { count: 5 })   // 5 条消息（支持复数）

// 语言切换
i18n.global.locale.value = 'en-US';
localStorage.setItem('locale', 'en-US');
```

**关键难点：**

| 难点 | 方案 |
|:--|:--|
| 语言包体积 | 按路由懒加载 / 按需拆分 / 服务端下发 |
| 日期时间格式 | Intl.DateTimeFormat / dayjs + locale 插件 |
| 数字货币 | Intl.NumberFormat（自动处理千分位、货币符号） |
| RTL 语言（阿拉伯语） | CSS logical properties（margin-inline-start）+ dir="rtl" |
| 图片/图标本地化 | 图片命名带语言后缀 or CSS background 切换 |
| 后端返回的文本 | 后端接受 Accept-Language 头返回对应语言 |
| SEO 多语言 | hreflang 标签 + 独立 URL（/en/、/zh/） |
| 首屏语言闪烁 | HTML 直出时读取 Cookie/Accept-Language 决定 |

---

## 主题换肤

### Q10: 前端主题换肤方案？⭐⭐

```
方案 1：CSS 变量（推荐，运行时切换）
:root {
  --primary: #409eff;
  --bg: #fff;
  --text: #333;
}
[data-theme="dark"] {
  --primary: #66b1ff;
  --bg: #1a1a1a;
  --text: #eee;
}
.btn { background: var(--primary); }

// 切换：document.documentElement.dataset.theme = 'dark';
// 优势：无需重载 CSS，秒切
// 劣势：老浏览器不支持（IE），需要预置所有主题变量

方案 2：多份 CSS 文件（构建时生成）
- theme-light.css / theme-dark.css
- 切换时动态替换 <link href>
- 优势：兼容性好，CSS 静态优化
- 劣势：切换有闪烁，构建产物翻倍

方案 3：Sass/Less 变量（构建时）
- 用户下载不同主题包
- 只能构建时决定，无法运行时切换
- 适合组件库提供给用户定制

方案 4：CSS-in-JS（运行时）
- styled-components ThemeProvider
- 灵活但性能差

方案 5：Filter 反色（应急）
filter: invert(1) hue-rotate(180deg);
- 一行 CSS 实现暗色，图片再反色回来
- 只适合临时方案，颜色不准

推荐组合：
- 组件库：Sass 变量（构建时）+ CSS 变量（运行时）
- 业务应用：CSS 变量 + 预置主题配置
- 用户自定义：暴露关键 Token（--primary、--radius）
```

---

## 低代码平台

### Q11: 低代码平台前端如何设计？⭐⭐⭐

```
低代码平台四大核心模块：

1. 物料（组件库）
   - 基础组件：Button / Input / Table
   - 业务组件：UserCard / OrderList
   - 每个组件有 Schema 描述（props、slots、events）

2. 编排器（画布）
   - 拖拽组件到画布
   - 属性面板编辑 props
   - 事件绑定（点击 → 打开弹窗 / 调接口）
   - 大纲树（层级视图）

3. 数据源
   - 静态数据（JSON）
   - 接口数据（配置 URL、参数、响应映射）
   - 页面变量（响应式状态）

4. 出码 / 渲染
   - Schema → 运行时渲染（在线预览）
   - Schema → 源码出码（导出 Vue/React 项目）

核心 Schema 协议：
```

```json
{
  "componentName": "Page",
  "props": { "title": "用户列表" },
  "children": [
    {
      "componentName": "Table",
      "props": {
        "columns": [...],
        "dataSource": {
          "type": "JSExpression",
          "value": "this.state.users"
        }
      },
      "events": {
        "onRowClick": {
          "type": "JSFunction",
          "value": "function(row) { this.openDetail(row.id); }"
        }
      }
    }
  ],
  "dataSource": {
    "list": [{
      "id": "users",
      "type": "fetch",
      "options": { "uri": "/api/users", "method": "GET" }
    }]
  },
  "lifeCycles": {
    "componentDidMount": { "type": "JSFunction", "value": "..." }
  }
}
```

**渲染器实现：**

```javascript
function Renderer(schema) {
  const Component = componentMap[schema.componentName];   // 物料注册表
  const props = resolveProps(schema.props, context);       // 解析 JSExpression
  const children = schema.children?.map(Renderer);
  return <Component {...props}>{children}</Component>;
}

// 表达式解析（安全考虑不用 eval，用 new Function 或 vm）
function resolveProps(props, context) {
  return Object.fromEntries(
    Object.entries(props).map(([k, v]) => [
      k,
      v?.type === 'JSExpression'
        ? new Function('ctx', `with(ctx) return ${v.value}`)(context)
        : v,
    ])
  );
}
```

**开源方案：**
- 阿里 LowCodeEngine（生态最全）
- 腾讯 TMagic
- 百度 Amis（JSON 配置驱动）
- Formily（表单场景）

**核心难点：**
- Schema 版本兼容（升级不能破坏老页面）
- 表达式沙箱（防 XSS）
- 出码质量（可读性、可维护性）
- 性能（大页面渲染优化）
- 二次开发（pro-code 混编）

---

## 复习卡片

> [!TIP]
> **场景题回答模板**（万能公式）
>
> 1. **反问澄清**：用户量、场景、约束（体现工程思维）
> 2. **给整体架构**：分层图 or 数据流（3-5 句话说清）
> 3. **拆解关键模块**：每个模块的核心 API / 数据结构
> 4. **点出难点**：性能 / 一致性 / 兼容性 / 安全
> 5. **给权衡方案**：MVP → 完整版的演进路径
> 6. **量化收益**：体积降 X%、响应快 Xms、支持 X 并发
>
> **快速复习清单**
>
> 1. **大文件上传**：分片 + hash 秒传 + 断点续传 + Worker 计算
> 2. **权限系统**：路由级 + 按钮级 + 数据级，前端做体验、后端保安全
> 3. **错误监控**：SDK 采集 + sendBeacon 上报 + SourceMap 还原 + 采样
> 4. **富文本**：ProseMirror/Slate/Lexical，Schema + Transaction + Plugin
> 5. **前端安全**：XSS（转义+CSP）、CSRF（SameSite+Token）、SRI、HSTS
> 6. **长列表**：Canvas 渲染 + Web Worker 数据 + IndexedDB 存储
> 7. **灰度发布**：CDN 多版本 / Feature Flag / 按用户百分比
> 8. **JSBridge**：URL Scheme + Native 注入 API + 回调管理
> 9. **i18n**：vue-i18n + Intl API + RTL + hreflang SEO
> 10. **换肤**：CSS 变量为主，运行时切换，Sass 变量兼容构建时定制
> 11. **低代码**：物料 + 编排器 + Schema 协议 + 渲染器/出码

---

> [!TIP]
> 下一篇：[软素质与 HR 面](/blog/posts/interview-guide-18-soft-skills/) 涵盖自我介绍、项目难点挖掘、STAR 表述、离职原因、职业规划、反问环节、薪资谈判等非技术面试环节。
>
> 返回 [面试宝典总览](/blog/posts/interview-guide-00-overview/) | [面试宝典合集页](/blog/interview-guide/)
