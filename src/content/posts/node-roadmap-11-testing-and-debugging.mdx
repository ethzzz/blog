---
title: '11 · 测试与调试'
published: 2026-10-13T20:00:00+08:00
description: 'Node 测试与调试实战：Jest 单元测试与 mock 策略、supertest 接口测试、覆盖率指标取舍、inspector 与 Chrome DevTools 调试、内存与性能问题定位。'
tags: [Node.js, Jest, supertest, 调试]
category: Node全栈学习路线
draft: false
---

> [!NOTE]
> 前端很多人对测试的态度是"写了 CI 会红，烦"；后端不同——**没有测试的服务，每次改代码都是赌命**。我的转折点是某次改了个积分规则，两天后才发现把另一个模块搞坏了，从此所有 Service 必须有测试。这一篇讲我在生产项目里沉淀的测试分层和调试手段，都是实战派。

---

## 1. 测试金字塔：钱要花在刀刃上

不是所有测试都值得写，我的投入比例：

| 层级 | 对象 | 数量占比 | 价值 |
| --- | --- | --- | --- |
| 单元测试 | Service 内单个方法（依赖全 mock） | 70% | 快（毫秒级）、定位精准 |
| 接口测试 | 整个 HTTP 请求进来（DB 用真库或 mock） | 25% | 最接近真实，防回归主力 |
| E2E | 全链路含外部服务 | 5% | 慢但兜底，只测核心链路 |

前端转过来最容易犯的错是"测实现"：mock 了所有依赖，断言内部调了哪个函数——这种测试一重构就碎，还抓不到真 bug。**测行为不测实现**：给输入，断言输出/副作用。

## 2. Jest 单元测试与 mock

测一个 Service，依赖通过构造函数注入（第 04 篇的 IoC 在这里回收红利——**可测试性正是 DI 的最大价值**）：

```ts
// post.service.spec.ts
describe('PostService', () => {
  let service: PostService;
  let prisma: { post: { findMany: Mock; create: Mock } };

  beforeEach(async () => {
    prisma = { post: { findMany: jest.fn(), create: jest.fn() } };
    service = new PostService(prisma as any);   // 手动注入 mock，不起 Nest 容器，快
  });

  it('findAll 应只查已发布文章并分页', async () => {
    prisma.post.findMany.mockResolvedValue([{ id: 1 }]);
    const result = await service.findAll({ page: 1, pageSize: 20 });

    expect(prisma.post.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 1 }, skip: 0, take: 20 }),
    );
    expect(result).toEqual([{ id: 1 }]);
  });

  it('create 对草稿状态默认 authorId 为当前用户', async () => { ... });
});
```

三个我总结的 mock 原则：

- **别过度 mock**。mock 掉 Prisma 的 `findMany`，连"where 条件写没写对"都测不到——这正是上面断言 `toHaveBeenCalledWith` 的原因：mock 的同时校验调用参数。
- **时间相关用假时钟**：`jest.useFakeTimers()` / `jest.setSystemTime`，别让测试真的 sleep。
- **纯函数直接测**，能抽纯逻辑（校验规则、金额计算）就抽，测试成本最低。

覆盖率的取舍我说实话：追求 100% 是自欺欺人（很多行是框架胶水代码）。我的标准是**核心业务逻辑（钱、权限、状态流转）90%+，整体 60-70% 即可**，覆盖率看趋势（新代码不许比存量低）比看绝对值有意义。

## 3. supertest：接口级测试

接口测试不起 Nest 容器全量 mock，而是真启动 app（测试库或 docker-compose 里的 MySQL），发真实 HTTP 请求：

```ts
// post.e2e-spec.ts
describe('POST /posts (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));  // 和生产配置一致！
    await app.init();
    token = await loginAndGetToken(app);   // 测试夹具：先注册登录拿 token
  });

  afterAll(() => app.close());

  it('未登录返回 40101', async () => {
    const res = await request(app.getHttpServer()).post('/posts').send({ title: 't', content: 'c' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe(40101);
  });

  it('创建成功且剥离多余字段', async () => {
    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '第一篇', content: '内容', status: 1, role: 'admin' });  // 混入恶意字段
    expect(res.status).toBe(201);
    expect(res.body).not.toHaveProperty('role');
  });
});
```

这里能看到第 06、08 篇的直接回报：认证守卫、DTO 白名单都被测试验证了。经验提醒：**测试环境的 app 配置必须和生产一致**（管道、过滤器、守卫都别漏装），不然你测的是一个不存在的系统。

## 4. inspector 调试：别再用 console.log 大法

调试服务端代码的正确姿势是断点。两种起法：

```bash
node --inspect-brk dist/main.js   # 启动即暂停，等调试器
nest start --debug --watch        # Nest 集成方式
```

VS Code 里 `.vscode/launch.json` 配 `"type": "node", "request": "attach", "port": 9229`，打断点、看调用栈、Watch 变量，体验和调前端完全一致（Chrome DevTools 也行：`chrome://inspect`）。

但我更想推的是**生产问题的调试三板斧**，因为线上不能挂断点：

1. **日志回溯**：traceId + 结构化日志（第 07 篇的投入在这里兑现）。
2. **性能剖析**：`node --cpu-prof --heap-prof` 生成 profile，或运行时 `kill -USR1 <pid>` 触发 inspector，Chrome DevTools 远程连上采 CPU/内存 profile。
3. **快照对比**：内存持续增长时，隔几分钟抓两次 heap snapshot，对比找"只增不减"的对象——第 12 篇实战会展开。

## 5. CI 里跑测试

测试的价值在"每次提交自动跑"，加到 CI：

```yaml
# .github/workflows/test.yml 关键步骤
- run: npm ci
- run: npm run lint
- run: npm run test -- --coverage
- run: npm run test:e2e        # 配 docker-compose 起临时 MySQL/Redis
```

我的门禁规则：测试不过不许合并；e2e 用完销毁容器。前期觉得"写测试耽误进度"，三个月后你会发现——**没有测试的项目，越写越慢，直到没人敢改**。

---

## 小结

- 分层投入：单测 70%（mock 依赖、测行为）、接口 25%（supertest 真请求）、E2E 5%。
- DI 让 Service 天然可测：手动注入 mock 不起容器，毫秒级。
- 接口测试配置必须与生产一致；覆盖率看趋势，核心逻辑 90%+。
- 调试：开发用 `--inspect-brk` 断点，线上用 traceId 日志 + profile + snapshot。

---

## 练习

1. 给 PostService 写 5 个单测，覆盖正常路径 + 2 个边界（空列表、pageSize 上限）。
2. 写"创建文章"的 e2e 测试，包含未登录 401、恶意字段被剥离、成功创建三用例。
3. 在 Service 里埋一个 `console.log` 轮次的递归死循环，用 VS Code 断点而不是读代码的方式找到根因。
4. 配置 GitHub Actions：PR 触发 lint + 单测 + e2e（用 services 起临时 MySQL），体验一次"测试红了的提交"。
