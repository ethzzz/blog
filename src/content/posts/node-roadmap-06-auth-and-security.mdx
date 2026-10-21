---
title: '06 · 认证与安全'
published: 2026-10-13T15:00:00+08:00
description: 'Node 服务端安全实战：JWT 与 Session 认证对比、RBAC 权限模型设计、helmet 安全头、限流策略与 SQL 注入防护，写博客 API 的登录体系并守住它。'
tags: [Node.js, JWT, RBAC, 安全]
category: Node全栈学习路线
draft: false
---

> [!NOTE]
> 前端做登录通常是"调接口、存 token、带 header"，三行代码的事。轮到自己写服务端才发现：密码怎么存、token 放哪、权限怎么管、接口怎么防刷——每一环都是事故高发区。这一篇以我给博客 API 做认证系统的过程为主线，把安全的地基打牢。

---

## 1. 密码存储：第一课就是别自己发明

先立规矩：**密码永远不存明文，永远不自己发明哈希**。用 bcrypt 或 argon2：

```ts
import bcrypt from 'bcrypt';

// 注册：saltRounds 10-12 之间，12 更慢但更抗暴力破解
const hash = await bcrypt.hash(password, 12);

// 登录：比对，注意必须用 compare 而不是再 hash 一次字符串比较
const ok = await bcrypt.compare(password, hash);
```

为什么是 bcrypt 而不是 md5/sha256：bcrypt/argon2 **故意设计得慢**（计算成本可调），攻击者暴力破解的成本被指数级抬高；而 sha256 一次几十亿次的算力对攻击者是"快"。加盐（salt 内置于 hash 字符串）保证相同密码的哈希也不同，防彩虹表。

## 2. Session vs JWT：老争论的工程答案

两种认证模型对比：

| 维度 | Session + Cookie | JWT |
| --- | --- | --- |
| 状态 | 服务端存（内存/Redis） | 无状态，信息在 token 里 |
| 撤销 | 删服务端记录即可，**立即可踢人** | 天然难撤销，要靠黑名单/短过期 |
| 水平扩展 | 需要 Redis 共享 session | 天然友好，任何节点都能验 |
| 前端配合 | Cookie 自动携带（要配 CSRF） | 手动放 Authorization header |
| 适合 | 传统多页应用、管理后台 | 前后端分离、多端（Web + App + 小程序） |

JWT 结构是三段式：`header.payload.signature`。签发与校验：

```ts
import jwt from 'jsonwebtoken';

// 签发：payload 只放非敏感信息（它是 base64 可解码的，不是加密！）
const accessToken = jwt.sign(
  { sub: user.id, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: '15m' },                      // 短过期是安全底线
);

// 校验（通常做成 Nest Guard）
try {
  const payload = jwt.verify(token, process.env.JWT_SECRET!);
} catch (err) {
  throw new UnauthorizedException('token 无效或过期');
}
```

我的实战方案（也是最主流的）：**双 token**——access token 15 分钟 + refresh token 7 天（只存 Redis，可随时吊销）。access 过期用 refresh 换新，refresh 可在"退出登录/改密码"时从 Redis 删除，兼顾无状态扩展和可撤销性。踩坑提醒：**JWT 别放 localStorage 存长命 token**，XSS 一偷一个准；Web 端 refresh token 放 `httpOnly` cookie 更稳。

Nest 里用 Guard 做统一鉴权：

```ts
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const isPublic = this.reflector.get(IS_PUBLIC_KEY, ctx.getHandler());
    if (isPublic) return true;                        // @Public() 标记的接口跳过
    const req = ctx.switchToHttp().getRequest();
    const token = req.headers.authorization?.replace('Bearer ', '');
    req.user = jwt.verify(token, process.env.JWT_SECRET!);  // 失败抛异常
    return true;
  }
}
```

## 3. RBAC：权限不是 if-else 堆出来的

用户多了就有角色：管理员能删任何文章，作者只能删自己的。初级写法是到处 `if (user.role === 'admin')`——三个月后没人能说清系统里有哪些权限。**RBAC（基于角色的访问控制）** 把"权限"抽象成三层：User → Role → Permission。

```ts
// 自定义装饰器声明"这个接口需要什么权限"
@RequirePermission('post:delete')
@Delete('posts/:id')
remove(@Param('id') id: string) { ... }

// Guard 里统一判定
canActivate(ctx) {
  const required = this.reflector.get<Permission>(PERMISSION_KEY, ctx.getHandler());
  return this.authService.hasPermission(req.user.role, required);
}
```

我的设计心得：权限粒度到"资源:操作"（`post:delete`、`comment:moderate`），角色是权限集合的别名。**数据级权限（只能删自己的文章）不要塞进 RBAC**，那是业务逻辑，写在 Service 里查 `authorId === user.id`。两层分开，权限模型稳定，数据规则灵活。

## 4. 常见攻击与防御清单

这一节是清单式速查，建议原文收藏：

| 攻击 | 原理 | 防御 |
| --- | --- | --- |
| SQL 注入 | 拼接 SQL 字符串执行恶意语句 | ORM 参数化查询（Prisma/TypeORM 天然防）；绝不手拼 SQL |
| XSS | 注入脚本偷 cookie/token | 输出转义；httpOnly cookie；CSP 头 |
| CSRF | 诱导用户浏览器携带 cookie 发请求 | SameSite=Strict/Lax；CSRF token |
| 暴力破解 | 撞库试密码 | 限流 + 失败锁定 + bcrypt 慢哈希 |
| SSRF | 服务端被诱导请求内网 | 白名单校验用户提交的 URL |

两个上手即用的工具：

```ts
// helmet：一行加全套安全响应头（CSP、HSTS、X-Frame-Options...）
app.use(helmet());

// 限流：IP 维度，60 秒内最多 100 次请求（登录接口单独更严：5 次/分钟）
app.use(rateLimit({ windowMs: 60_000, max: 100 }));
```

SQL 注入多说一句，因为最致命：手写 SQL 时**任何来自用户的值都必须走占位符**（`?` 或 `$1`），Prisma 的 `$queryRaw` 用 tagged template（`` prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}` ``）同样参数化。我见过的事故全是"这个值我先拼一下，都是内部数据没事"开始的。

## 5. 把认证模块装进博客 API

组合前面的知识，模块结构：

```text
src/auth/
├── auth.module.ts        # 注册 JwtStrategy、导出 AuthService
├── auth.service.ts       # 注册（bcrypt 哈希入库）、登录（签发双 token）
├── jwt-auth.guard.ts     # 全局守卫 + @Public() 白名单
└── permission.guard.ts   # @RequirePermission() RBAC 判定
```

注册顺序的关键认知：**Nest 中间件 → Guard → 拦截器 → Pipe → Controller**，鉴权在 Guard 层意味着业务代码完全不用关心"有没有登录"，只需声明"需要什么权限"。

---

## 小结

- 密码用 bcrypt/argon2 慢哈希，saltRounds 12，永远不自造算法。
- 双 token 方案：短命 access + 可吊销的 refresh（存 Redis），兼得无状态与可控。
- RBAC 管"角色 → 权限"，数据级归属写在 Service；权限粒度"资源:操作"。
- helmet + 限流 + ORM 参数化是三件套，SQL 注入防线在"绝不拼字符串"。
- Nest 鉴权放 Guard 层，业务零感知。

---

## 练习

1. 给博客 API 实现注册/登录接口：bcrypt 哈希 + JWT 签发，用 Postman 走通。
2. 实现 refresh token：签发时存 Redis（`SET refresh:{userId} <token> EX 604800`），退出登录时删除，观察"改密码后旧 refresh 失效"。
3. 用 `@RequirePermission` 实现"作者只能删自己的文章 + 管理员能删任何文章"，拆分清楚 RBAC 层和业务层各自负责什么。
4. 给登录接口单独配 5 次/分钟限流，然后用脚本连发请求验证 429 响应。
