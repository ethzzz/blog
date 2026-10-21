---
title: '04 · NestJS 入门：IoC 与依赖注入'
published: 2026-10-13T13:00:00+08:00
description: 'NestJS 核心概念拆解：手写迷你 IoC 容器理解依赖注入原理、Module/Controller/Provider 三大件、装饰器机制、Scope 作用域与循环依赖处理。'
tags: [Node.js, NestJS, IoC, 装饰器]
category: Node全栈学习路线
draft: false
---

> [!NOTE]
> 第一次看 Nest 代码我最大的感受是"装神弄鬼"：类上面挂一堆装饰器，构造函数里塞几个参数就能用，数据从哪来的完全不知道。直到我手写了一个 60 行的 IoC 容器，一切豁然开朗。这篇我们就这么干——先手写再上框架，保证你不是背 API 而是真懂。

---

## 1. 为什么需要 IoC：从一个痛点说起

不用框架的典型代码长这样：

```ts
class PostService {
  private db: MySQLClient;
  private cache: RedisClient;
  constructor() {
    // 每个类都自己 new 依赖：耦合 + 重复 + 难测试
    this.db = new MySQLClient({ host: 'localhost', ... });
    this.cache = new RedisClient();
  }
}
```

三个致命问题：**每个类自己造连接**（该共享的没共享）；**想换 MySQL 为 PostgreSQL 要改所有类**；**单测没法把 db 换成 mock**。

IoC（控制反转）的解法是倒过来：**类不自己创建依赖，而是声明"我需要什么"，由外部容器统一创建并注入**：

```ts
class PostService {
  constructor(
    private db: Database,      // 只要接口，不管实现
    private cache: Cache,
  ) {}
}
// 容器负责：new Database → new Cache → new PostService(db, cache)
```

"依赖注入（DI）"是 IoC 的实现手段。收益立现：单例共享、换实现只改一处、测试时注入 mock。

## 2. 手写迷你容器：60 行看穿原理

```ts
type Token = string;
const registry = new Map<Token, { cls: any; instance?: any; deps: Token[] }>();

function Injectable(token: string) {
  return (cls: any) => {
    // 记录这个类的依赖：从构造函数参数类型读出来
    registry.set(token, { cls, deps: cls.$deps ?? [] });
  };
}

function resolve(token: Token): any {
  const entry = registry.get(token)!;
  if (entry.instance) return entry.instance;           // ① 单例：有缓存直接用
  const args = entry.deps.map(resolve);                 // ② 递归解析所有依赖
  entry.instance = new entry.cls(...args);              // ③ 创建并缓存
  return entry.instance;
}

// —— 使用 ——
@Injectable('db')
class Db { query(sql: string) { return `${sql} from db`; } }

@Injectable('postService')
class PostService { static $deps = ['db']; constructor(private db: any) {} }

const svc = resolve('postService') as PostService;
```

容器做的事就三步：**注册（记录类和依赖）→ 解析（递归把依赖树铺开）→ 缓存（单例）**。Nest 的 IoC 容器是它的豪华版：用装饰器元数据（`reflect-metadata`）自动收集依赖，而不是手写 `$deps`；token 支持类本身；还加了循环依赖检测和模块隔离。原理一模一样。

## 3. 三大件：Module / Controller / Provider

Nest 用装饰器把"注册"变成声明式：

```ts
// Provider：可被注入的东西（Service 是最常见的 Provider）
@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll() { return this.prisma.post.findMany(); }
}

// Controller：处理 HTTP，只做参数解析和调用 Service，不写业务
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}
  @Get()
  findAll() { return this.postService.findAll(); }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }
}

// Module：组织单元，声明"这个模块有哪些组件、导入谁、导出什么"
@Module({
  controllers: [PostController],
  providers: [PostService, PrismaService],
  exports: [PostService],      // 别的模块要用 PostService 就从这里导出
})
export class PostModule {}
```

三条我踩过的铁律：

- **Controller 保持薄**。我 code review 时看到 Controller 里写查询逻辑一律打回——业务全在 Service，Controller 只做"翻译 HTTP"。
- **模块间访问靠 imports/exports**。`PostService` 想在 `CommentModule` 用，必须 `PostModule.exports` 它，然后 `CommentModule.imports: [PostModule]`。报 "Nest can't resolve dependencies" 十有八九是忘了这步。
- **全局模块慎用**。`@Global()` 省事但会让依赖关系不可见，只给数据库连接这类真正全局的东西用。

## 4. 装饰器：Nest 的魔法从哪来

Nest 重度使用装饰器，值得花两分钟弄懂语法。装饰器本质是**一个接收目标并可以改造它的函数**：

```ts
function Log(target: any, key: string, desc: PropertyDescriptor) {
  const original = desc.value;
  desc.value = function (...args: any[]) {
    console.log(`调用 ${key}，参数:`, args);
    return original.apply(this, args);
  };
}
class Calc {
  @Log
  add(a: number, b: number) { return a + b; }
}
```

Nest 的关键是 **`Reflect.defineMetadata` 把元数据存在类上**，容器启动时读元数据建依赖图。还有一个前端也有体感的用法——**参数装饰器**：

```ts
@Get(':id')
findOne(@Param('id') id: string) { /* id 自动从 URL 提取 */ }
```

`@Param('id')` 就是"从请求对象取值注入参数"的语法糖。你写的每个 Controller 方法，参数全是被各种装饰器喂进来的。

启用装饰器需要 `tsconfig.json` 里 `"experimentalDecorators": true, "emitDecoratorMetadata": true`（Nest CLI 脚手架已配好）。提醒：TypeScript 5.0 后有新标准装饰器，但 Nest 目前仍依赖旧版实验性装饰器，照脚手架配置来就行。

## 5. Scope 与循环依赖：进阶必知

**Scope**：默认所有 Provider 是单例（Scope.DEFAULT），整个进程共享一个实例，这也意味着**不能把请求级数据存在 service 的实例属性上**（会被并发请求互相覆盖）。需要请求级隔离时：

```ts
@Injectable({ scope: Scope.REQUEST })
export class TenantService {}
```

但 REQUEST scope 有代价——每个请求都重新实例化整棵依赖子树，性能敏感的地方别乱用。我的实践：请求上下文（如租户 ID、trace ID）用 `AsyncLocalStorage` 传，而不是 REQUEST scope，第 07 篇日志链路会用到。

**循环依赖**：A 依赖 B、B 依赖 A，容器解析时死锁。Nest 官方给的前进/后退引用：

```ts
// a.service.ts
@Injectable()
export class AService {
  constructor(@Inject(forwardRef(() => BService)) private b: BService) {}
}
```

但我的态度是：**循环依赖出现即设计警报**，宁可抽一个共同的 `SharedService` 或事件解耦（第 10 篇的 Event），也别用 forwardRef 掩盖问题。

---

## 小结

- IoC 解决三大痛点：重复创建、硬耦合、难测试；DI 是实现手段。
- 容器原理 60 行：注册 → 递归解析 → 单例缓存，Nest 只是豪华版。
- 三大件分工：Module 组织、Controller 翻译 HTTP、Provider 写业务；跨模块访问靠 imports/exports。
- 装饰器 = 可改造目标的函数 + reflect-metadata 存元数据。
- 默认单例，别在 service 实例属性上存请求态；循环依赖优先重构而不是 forwardRef。

---

## 练习

1. 把本文的迷你容器抄一遍并跑通，然后扩展：支持 `resolve` 时打印依赖树（模拟 Nest 的启动日志）。
2. 用 Nest CLI（`npx @nestjs/cli new demo`）生成项目，通读 `app.module.ts`，对照本文找出三大件。
3. 故意制造一次循环依赖，观察报错信息，再用 forwardRef 修复，最后用"抽公共模块"重构掉。
4. 写一个 `@Timing` 方法装饰器打印 Service 方法耗时，思考它和第 03 篇计时中间件的区别（一个管 HTTP 层，一个管方法层）。
