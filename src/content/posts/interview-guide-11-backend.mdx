---
title: '后端知识面试题（前端工程师需要了解的部分）'
published: 2026-09-16T15:00:00+08:00
description: '讲解 RESTful API 设计、Node.js 核心、Java 基础、微服务架构、认证鉴权等中高级前端工程师需要了解的后端知识。'
tags: [前端面试, RESTful, Node.js, Java, 微服务]
category: 前端面试宝典
draft: false
---

> [!NOTE]
> 本文包含 20+ 道后端知识面试题，面向中高级前端工程师（全栈方向加分项），难度标注：⭐ 基础 · ⭐⭐ 进阶 · ⭐⭐⭐ 高级 · 🔥 高频必考

---

## RESTful API 设计

### Q1: 什么是 RESTful API？设计原则？⭐ 🔥

**答：**

REST（Representational State Transfer）是一种 API 设计风格，核心思想是**用 URL 表示资源，用 HTTP 方法表示操作**。

| 原则 | 说明 |
|:--|:--|
| 资源导向 | URL 是名词（资源），不是动词 |
| HTTP 方法语义化 | GET 查、POST 增、PUT/PATCH 改、DELETE 删 |
| 无状态 | 每个请求携带全部信息（如 Token） |
| 统一接口 | 一致的 URL 风格和响应格式 |
| 合理使用状态码 | 用 HTTP 状态码表达结果 |

```
❌ 不好的设计：
GET  /api/getUserList
POST /api/deleteUser?id=1
GET  /api/user/query?id=1

✅ RESTful 设计：
GET    /api/users          # 获取用户列表
GET    /api/users/1        # 获取单个用户
POST   /api/users          # 创建用户
PUT    /api/users/1        # 全量更新用户
PATCH  /api/users/1        # 部分更新用户
DELETE /api/users/1        # 删除用户
GET    /api/users/1/orders # 获取用户的订单（嵌套资源）
```

**统一响应格式：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "Tom"
  }
}
```

**分页、过滤、排序（查询参数）：**

```
GET /api/users?page=1&pageSize=10        # 分页
GET /api/users?status=active             # 过滤
GET /api/users?sort=-createdAt,name      # 排序（- 表示降序）
GET /api/users?fields=id,name,email      # 字段筛选
```

### Q2: PUT 和 PATCH 的区别？⭐

| 方法 | 语义 | 幂等 | 示例 |
|:--|:--|:--|:--|
| PUT | 全量更新（替换整个资源） | ✅ | 传完整对象，未传的字段可能被置空 |
| PATCH | 部分更新（只改传入字段） | ❌（理论） | 只传要修改的字段 |

```javascript
// PUT /users/1  —— 全量替换
{ "name": "Tom", "age": 20, "email": "tom@x.com" }

// PATCH /users/1  —— 只更新 name
{ "name": "Tom" }
```

### Q3: 常见 HTTP 状态码如何正确返回？⭐⭐

| 场景 | 状态码 |
|:--|:--|
| 查询/创建/更新成功 | 200 / 201（Created） |
| 删除成功（无返回体） | 204 No Content |
| 参数校验失败 | 400 Bad Request |
| 未登录/Token 失效 | 401 Unauthorized |
| 已登录但无权限 | 403 Forbidden |
| 资源不存在 | 404 Not Found |
| 方法不允许 | 405 Method Not Allowed |
| 请求冲突（重复创建） | 409 Conflict |
| 请求过于频繁 | 429 Too Many Requests |
| 服务端异常 | 500 Internal Server Error |
| 网关错误（后端挂了） | 502 / 504 |

```javascript
// 401 vs 403 是高频追问点
// 401：你是谁？（未认证）→ 前端应跳转登录页
// 403：我知道你是谁，但你不能这么做（未授权）→ 前端应提示无权限

// axios 拦截器典型处理
axios.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    if (status === 401) {
      // token 过期，清除登录态并跳转
      clearAuth();
      router.push('/login');
    } else if (status === 403) {
      message.error('无权限访问');
    }
    return Promise.reject(err);
  }
);
```

---

## 认证与鉴权

### Q4: Cookie/Session 与 Token(JWT) 认证的区别？⭐⭐ 🔥

**答：**

| 维度 | Cookie + Session | JWT Token |
|:--|:--|:--|
| 状态 | 有状态（服务端存 Session） | 无状态（服务端不存） |
| 存储位置 | 服务端内存/Redis + 浏览器 Cookie | 客户端（localStorage / Cookie） |
| 跨域 | 受同源策略限制（需 SameSite 配置） | 灵活（放 Header 即可） |
| 水平扩展 | 需 Session 共享（Redis/Sticky） | 天然支持 |
| 注销/失效 | 删除 Session 即失效 | 难（需黑名单机制） |
| 移动端支持 | 弱 | 强 |
| 安全风险 | CSRF | XSS（Token 被盗） |

**JWT 结构与原理：**

```
JWT = Header.Payload.Signature

Header:    { "alg": "HS256", "typ": "JWT" }        → Base64URL 编码
Payload:   { "userId": 1, "exp": 1735689600 }      → Base64URL 编码
Signature: HMACSHA256(header + "." + payload, 密钥)

验证流程：
1. 服务端用密钥重新计算签名
2. 与 Token 中的签名比对 → 防篡改
3. 检查 exp 是否过期

注意：Payload 只是 Base64 编码，不是加密！
不要放密码等敏感信息。
```

```javascript
// 前端典型用法
// 登录后存储 token
localStorage.setItem('token', res.data.token);

// 请求时携带
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### Q5: 什么是 OAuth 2.0？常见授权模式？⭐⭐⭐

```
OAuth 2.0 角色：
- Resource Owner：用户
- Client：第三方应用
- Authorization Server：授权服务器
- Resource Server：资源服务器

四种授权模式：
┌──────────────────┬────────────────────────────────┐
│ 授权码模式        │ 最常用最安全（网站第三方登录）  │
│ (Authorization   │ 流程：跳转授权页 → 用户同意 →   │
│  Code)           │ 回调返回 code → 用 code 换 token│
├──────────────────┼────────────────────────────────┤
│ 简化模式          │ 已废弃（token 暴露在 URL）      │
│ (Implicit)       │                                │
├──────────────────┼────────────────────────────────┤
│ 密码模式          │ 高度信任的第一方应用            │
│ (Password)       │ 直接传用户名密码换 token        │
├──────────────────┼────────────────────────────────┤
│ 客户端模式        │ 服务间调用（无用户参与）        │
│ (Client          │                                │
│  Credentials)    │                                │
└──────────────────┴────────────────────────────────┘

授权码模式为什么安全？
- code 通过前端信道（浏览器重定向）传递，一次性且短时效
- token 通过后端信道（服务器间通信）换取，不暴露给浏览器
- 配合 PKCE 可防授权码拦截攻击
```

### Q6: RBAC 权限模型？⭐⭐

```
RBAC（Role-Based Access Control）基于角色的访问控制：

用户 ←→ 角色 ←→ 权限

用户不直接拥有权限，而是通过角色间接获得。
一个用户可有多个角色，一个角色可有多个权限。

表设计：
sys_user（用户表）
sys_role（角色表）
sys_menu/permission（权限表）
sys_user_role（用户-角色关联表）
sys_role_menu（角色-权限关联表）

前端配合：
1. 登录后获取用户角色和权限标识列表
2. 路由守卫：根据权限动态生成可访问路由
3. 按钮级权限：v-permission 指令控制显示
```

---

## Node.js

### Q7: Node.js 的事件循环与浏览器有何区别？⭐⭐ 🔥

**答：**

```
Node.js 事件循环（libuv）分阶段：

   ┌───────────────────────────┐
┌─>│           timers          │  setTimeout/setInterval
│  ├───────────────────────────┤
│  │     pending callbacks     │  系统级回调（如 TCP 错误）
│  ├───────────────────────────┤
│  │       idle, prepare       │  内部使用
│  ├───────────────────────────┤
│  │           poll            │  I/O 回调（文件、网络）
│  ├───────────────────────────┤
│  │           check           │  setImmediate
│  ├───────────────────────────┤
│  │      close callbacks      │  socket.on('close')
│  └───────────────────────────┘

与浏览器的差异：
1. 浏览器：微任务队列在每次宏任务后清空
2. Node 11 前：微任务在每【阶段】结束后清空
   Node 11+：与浏览器对齐，每个宏任务后清空微任务
3. Node 独有：setImmediate（check 阶段）vs setTimeout（timers 阶段）
```

```javascript
// Node.js 经典输出题
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
// 输出顺序不确定（主模块中），但在 I/O 回调中 immediate 总是先执行

// process.nextTick 优先级高于 Promise.then
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
// 输出：nextTick → promise
```

### Q8: Node.js 如何处理 CPU 密集型任务？⭐⭐⭐

```javascript
// Node.js 单线程，CPU 密集任务会阻塞事件循环
// 解决方案：

// 1. Worker Threads（官方推荐，Node 12+）
const { Worker } = require('worker_threads');
const worker = new Worker('./heavy-task.js');
worker.postMessage({ data });
worker.on('message', result => console.log(result));

// 2. Child Process（fork 子进程）
const { fork } = require('child_process');
const child = fork('./heavy-task.js');
child.send({ data });
child.on('message', result => console.log(result));

// 3. Cluster（多进程负载均衡，利用多核 CPU）
const cluster = require('cluster');
const os = require('os');
if (cluster.isPrimary) {
  for (let i = 0; i < os.cpus().length; i++) cluster.fork();
} else {
  require('./server.js');  // 每个子进程运行服务
}

// 4. 任务拆分 + setImmediate（让出事件循环）
function processChunk(data, index) {
  if (index >= data.length) return;
  processItem(data[index]);           // 处理一小块
  setImmediate(() => processChunk(data, index + 1));  // 让出控制权
}

// 5. 使用 C++ 扩展 / WASM（如 sharp 图片处理）
```

### Q9: Express 和 Koa 的区别？⭐⭐

| 维度 | Express | Koa |
|:--|:--|:--|
| 中间件模型 | 线性（callback） | 洋葱模型（async/await） |
| 错误处理 | 错误处理中间件 | try/catch 捕获所有下游错误 |
| 内置功能 | 多（路由、静态文件等） | 极简（只有核心） |
| 异步处理 | callback，易嵌套 | 原生 async/await |
| 体积 | 较大 | 轻量 |

```javascript
// Koa 洋葱模型：请求进入时顺序执行，响应返回时逆序执行
app.use(async (ctx, next) => {
  console.log('1 进入');
  await next();       // 执行下游中间件
  console.log('4 返回');
});
app.use(async (ctx, next) => {
  console.log('2 进入');
  await next();
  console.log('3 返回');
});
// 输出：1进入 → 2进入 → 3返回 → 4返回
// 应用场景：日志统计耗时、事务回滚、响应统一包装
```

### Q10: BFF（Backend For Frontend）是什么？⭐⭐

```
传统模式：
前端 → 后端微服务A、B、C（前端需调多个接口，聚合数据）

BFF 模式：
前端 → BFF 层（Node.js）→ 微服务A、B、C

BFF 的价值（前端主导的服务层）：
1. 接口聚合：多个微服务数据合并成一个接口
2. 数据裁剪：只返回前端需要的字段，减小体积
3. 适配多端：为 Web/App/小程序提供不同数据结构
4. 缓冲层：后端接口变更时，BFF 层消化差异
5. SSR：Node.js 天然适合服务端渲染

常见技术选型：NestJS / Egg.js / Express + GraphQL
```

---

## Java 基础（前端需要了解的部分）

### Q11: 为什么前端要了解 Java 基础？常见概念映射？⭐

**答：**

中大型公司后端以 Java 为主，前端了解后端技术有助于**接口联调、问题定位、全栈发展**。

| Java 概念 | 前端对应概念 |
|:--|:--|
| Spring Boot | NestJS / Express |
| Maven / Gradle | npm / pnpm |
| pom.xml | package.json |
| Controller | 路由处理器 |
| DTO / VO / Entity | TypeScript interface |
| 注解 @Annotation | 装饰器 @Decorator |
| MyBatis / JPA | ORM（Prisma / TypeORM） |
| Tomcat | Node HTTP Server |
| JVM 堆内存 | V8 堆内存（都有 GC） |

### Q12: Spring Boot 的注解你见过哪些？分别什么作用？⭐⭐

```java
@RestController          // = @Controller + @ResponseBody，返回 JSON
@RequestMapping("/users")  // 路由前缀（类似 Express Router）
@GetMapping("/{id}")     // GET 请求，@PathVariable 取路径参数
@PostMapping             // POST 请求
@RequestParam            // 查询参数 ?name=xxx（类似 req.query）
@RequestBody             // 请求体 JSON 自动反序列化（类似 req.body）
@Service                 // 业务逻辑层
@Repository / @Mapper    // 数据访问层（DAO）
@Autowired               // 依赖注入（类似 NestJS 构造函数注入）
@Transactional           // 声明式事务（类似 TypeORM 事务）
```

```java
// 典型分层结构（与 NestJS 完全对应）
@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;   // Service 层

    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) {
        return Result.success(userService.getById(id));
    }
}

// Controller（接收请求）→ Service（业务逻辑）→ Mapper（数据库操作）
// 前端联调报错时看哪一层：
// 400：Controller 参数校验失败
// 500：Service/Mapper 抛异常，看后端日志的堆栈
```

### Q13: 后端接口的参数校验，前端应该如何配合？⭐⭐

```java
// Java 常见校验注解（JSR-380 / Hibernate Validator）
@NotNull      // 非空（对象）
@NotBlank     // 非空字符串
@Size(min=1, max=20)   // 长度
@Min(0) @Max(100)      // 数值范围
@Email        // 邮箱格式
@Pattern(regexp="^1[3-9]\\d{9}$")  // 手机号正则
```

```javascript
// 前端应做同样的校验（提升体验），但不能替代后端校验（安全）
// 规则保持一致，避免"前端通过、后端 400"的联调问题
const rules = {
  username: [
    { required: true, message: '用户名不能为空' },
    { min: 2, max: 20, message: '长度 2-20 个字符' },
  ],
  email: [{ type: 'email', message: '邮箱格式不正确' }],
};
// 收到 400 时，优先展示后端 message（后端规则更权威）
```

---

## 微服务与架构

### Q14: 单体架构和微服务架构的区别？⭐⭐ 🔥

**答：**

| 维度 | 单体架构 | 微服务架构 |
|:--|:--|:--|
| 部署 | 一个包（war/jar） | 多个独立服务 |
| 技术栈 | 统一 | 每个服务可不同 |
| 扩展 | 整体扩容 | 按服务扩容 |
| 故障 | 一处挂全挂 | 故障隔离 |
| 通信 | 方法调用 | HTTP/RPC |
| 复杂度 | 代码复杂 | 运维复杂（分布式问题） |
| 数据 | 单库 | 每服务独立库 |

```
单体：
┌─────────────────────────┐
│  用户 + 订单 + 支付 + …  │ → 一个数据库
└─────────────────────────┘

微服务：
┌──────┐  ┌──────┐  ┌──────┐
│用户服务│  │订单服务│  │支付服务│
└──┬───┘  └──┬───┘  └──┬───┘
   ↓         ↓         ↓
 用户库    订单库    支付库

服务间通信：
- 同步：HTTP REST / RPC（Dubbo、gRPC）
- 异步：消息队列（RabbitMQ、Kafka、RocketMQ）
```

**对前端的影响：**
- 接口域名可能不同 → 需要网关统一入口（如 `/api/user/**` 路由到用户服务）
- 一个页面可能需要聚合多个服务的数据 → BFF 层的价值
- 服务不可用时的降级 → 前端要做好容错和兜底 UI

### Q15: API 网关是什么？⭐⭐

```
没有网关：前端要记住 N 个服务地址
前端 → 用户服务 :8001
前端 → 订单服务 :8002
前端 → 支付服务 :8003

有网关：统一入口
前端 → 网关 :8080 → 路由分发到各服务

网关的职责：
1. 路由转发（按路径/Header 分发）
2. 统一认证（在网关层校验 Token）
3. 限流熔断（保护后端服务）
4. 日志监控（统一记录请求日志）
5. 协议转换（外部 HTTP → 内部 RPC）
6. 跨域处理（统一配置 CORS）

常见实现：
- Nginx / OpenResty（轻量）
- Kong（基于 OpenResty，插件丰富）
- Spring Cloud Gateway（Java 生态）
- APISIX（国产，高性能）
```

### Q16: 什么是消息队列？前端场景有哪些？⭐⭐⭐

```
消息队列（MQ）：异步通信的中间件
生产者 → MQ（队列）→ 消费者

三大作用：
1. 异步：下单后发短信/邮件不用同步等待
2. 解耦：订单服务不需要知道谁消费订单消息
3. 削峰：秒杀请求先入队，后端按能力消费

前端相关场景：
- WebSocket 推送：后端消费 MQ 消息后推送给前端
- 大文件处理：上传视频 → MQ → 转码服务 → 完成后通知前端
- 埋点上报：日志采集 → Kafka → 实时计算
- 订单状态轮询优化：MQ + WebSocket 替代轮询
```

### Q17: 接口幂等性是什么？前端如何配合？⭐⭐ 🔥

```
幂等性：同一请求执行一次和执行多次，结果相同。

为什么重要？网络超时重试、用户连点、MQ 重复消费都可能导致重复请求。

场景：
- 支付接口重复调用 → 重复扣款！（必须幂等）
- 创建订单重复提交 → 重复订单！

后端方案：
1. 唯一索引（数据库层兜底）
2. Token 机制：先申请 token，提交时携带并删除（Redis）
3. 乐观锁：UPDATE ... SET stock=stock-1 WHERE id=1 AND version=1
4. 状态机：订单只能从"待支付"→"已支付"，不可逆

前端配合：
1. 按钮防连点：提交后 loading/disabled
2. 唯一请求 ID：生成 requestId 随请求发送
3. 防抖节流：搜索框等高频操作
```

```javascript
// 前端防重复提交示例
const submitOrder = async () => {
  if (submitting.value) return;
  submitting.value = true;   // 立即锁定
  try {
    await api.createOrder({ ...form, requestId: uuid() });
    message.success('提交成功');
  } catch (e) {
    message.error(e.message);
  } finally {
    submitting.value = false;
  }
};
```

### Q18: 什么是限流？常见算法？⭐⭐⭐

```
限流：控制单位时间的请求数，保护系统不被打垮。

常见算法：
┌────────────┬──────────────────────────────────┐
│ 固定窗口    │ 每分钟 N 个请求，简单但有临界问题 │
│ 滑动窗口    │ 窗口细分滚动，更平滑              │
│ 漏桶       │ 请求入桶匀速流出，强制恒定速率     │
│ 令牌桶      │ 匀速发令牌，有令牌才能请求，       │
│            │ 允许一定突发流量（最常用）         │
└────────────┴──────────────────────────────────┘

前端遇到 429 Too Many Requests 的处理：
1. 指数退避重试：1s → 2s → 4s → 8s
2. 读取 Retry-After 响应头
3. 请求合并/防抖，减少请求量
4. 提示用户稍后再试
```

---

## 部署与运维基础

### Q19: 前端项目常见的部署方式？⭐ 🔥

| 方式 | 说明 | 适用场景 |
|:--|:--|:--|
| Nginx 静态托管 | dist 目录 + Nginx 配置 | 最通用 |
| CDN | 静态资源上传 CDN，就近访问 | 大型项目 |
| Docker | Nginx 镜像 + dist，容器化部署 | 微服务环境 |
| Serverless | Vercel / Netlify / 云函数 | 个人项目、SSR |
| Node SSR | Node 服务渲染（Nuxt/Next） | SEO 需求 |

```dockerfile
# 前端 Docker 部署典型 Dockerfile（多阶段构建）
# 阶段1：构建
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 阶段2：运行（只拷贝 dist，镜像极小）
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Q20: CI/CD 是什么？前端项目如何落地？⭐⭐

```
CI（持续集成）：代码提交后自动构建、测试
CD（持续部署/交付）：构建产物自动部署到环境

典型流水线（GitLab CI / GitHub Actions / Jenkins）：

git push → 触发流水线
  ├─ 1. 安装依赖（npm ci，利用缓存）
  ├─ 2. 代码检查（ESLint / Prettier / commitlint）
  ├─ 3. 单元测试（vitest / jest）
  ├─ 4. 构建（npm run build）
  ├─ 5. 产物上传（OSS / 镜像仓库）
  └─ 6. 部署（测试环境自动 / 生产环境手动审批）

分支策略配合：
- feature/* → 开发分支（自动部署测试环境）
- develop   → 集成测试
- master/main → 生产发布（打 tag，可回滚）

回滚方案：
1. 保留历史版本 dist 目录，Nginx 切换软链
2. Docker 镜像 tag 回退
3. CDN 刷新 + 版本回退
```

---

## 复习卡片

> [!TIP]
> **快速复习清单**
>
> 1. **RESTful**：URL 名词化 + HTTP 方法语义化 + 状态码规范
> 2. **401 vs 403**：未认证（跳登录） vs 未授权（提示无权限）
> 3. **JWT**：Header.Payload.Signature，无状态，Payload 不是加密
> 4. **OAuth 2.0**：授权码模式最安全，code 换 token 走后端信道
> 5. **Node 事件循环**：六阶段，setImmediate vs setTimeout，nextTick 优先
> 6. **CPU 密集**：Worker Threads / Cluster / 任务拆分
> 7. **BFF**：接口聚合 + 数据裁剪 + 多端适配
> 8. **微服务**：独立部署 + 故障隔离 + 网关统一入口
> 9. **幂等性**：唯一 ID + Token 机制 + 前端防连点
> 10. **限流**：令牌桶最常用，429 + 指数退避重试
> 11. **部署**：Nginx / Docker 多阶段构建 / CDN
> 12. **CI/CD**：提交触发 → 检查 → 测试 → 构建 → 部署 → 可回滚

---

> [!TIP]
> 下一篇：[TypeScript 进阶面试题](/blog/posts/interview-guide-12-typescript/) 涵盖泛型、条件类型、infer、映射类型、内置工具类型手写实现、协变逆变等中高级必考的 TS 进阶知识。
>
> **Node.js 深化阅读**：本篇 Q7-Q10 只是 Node.js 的入门，完整的 Node.js 服务端知识（事件循环、Stream、多进程、框架选型、部署运维）详见 [Node.js 面试题专篇](/blog/posts/interview-guide-19-nodejs/)。
>
> 返回 [面试宝典总览](/blog/posts/interview-guide-00-overview/) | [面试宝典合集页](/blog/interview-guide/)

> [!IMPORTANT]
> **面试冲刺建议**
>
> 1. 优先复习所有标注 🔥 的高频考点
> 2. 每篇文章末尾的复习卡片过一遍，卡壳的知识点回原文精读
> 3. 结合自己的项目经历，把知识点转化为「场景 + 方案 + 结果」的 STAR 表述
> 4. 手写代码题（防抖节流、深拷贝、Promise.all、并发控制）务必练熟，详见 [手写代码题专篇](/blog/posts/interview-guide-14-handwritten-code/)
