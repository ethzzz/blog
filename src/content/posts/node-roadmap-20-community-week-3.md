---
title: '后端 P1：NestJS 管理/BFF 与异步治理'
published: 2026-11-10T10:40:00+08:00
updated: 2026-11-10T10:40:00+08:00
description: '后端第三阶段：用 NestJS 12 做管理/BFF，补审核、举报、用户管理、审计、RabbitMQ 事件和 OpenTelemetry 可观测性。'
tags: [社区全栈, 后端, NestJS, RabbitMQ]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 后端 P1。上一篇：[后端 P0b](/blog/posts/node-roadmap-19-community-week-2/)；下一篇：[后端 P2a](/blog/posts/node-roadmap-21-community-week-4/)；前端对应篇：[前端 P1](/blog/posts/community-fullstack-fe-03-p1-admin/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

P0b 之后公共 API 已经完整。P1 用 NestJS 做**管理/BFF**，把审核、举报、用户管理、审计和看板接起来，同时补 RabbitMQ 和可观测性。NestJS 只占后端约 1/3，不重写公共 API。

---

## 1. 目标与范围

- 新增 `apps/admin-api`（NestJS 12）。
- 审核帖子/评论、处理举报、封禁/解封用户、Dashboard、审计。
- RabbitMQ 消费 `post.created` / `report.created`。
- OpenTelemetry + Prometheus/Grafana + Sentry。
- Playwright E2E + Testcontainers 集成测试。

---

## 2. 先做兼容性 spike

NestJS 依赖装饰器和 `emitDecoratorMetadata`。当前项目用 TypeScript 7，`nest-cli` 对 TS 7 的 programmatic API 支持需要先验证：

```bash
pnpm dlx @nestjs/cli@12 new admin-api --package-manager pnpm --skip-git
```

验证三件事：

1. `nest build` / `nest start` 能跑。
2. Prisma + Swagger + 一个 Guard 能正常注入。
3. ESM/装饰器没有运行时错误。

不兼容时的回退：`admin-api` 单独用 SWC 构建或 TS 5.9，`apps/api` 继续 TS 7。

---

## 3. 目录与模块

```text
apps/admin-api/src/
  main.ts
  app.module.ts
  common/
    guards/jwt-auth.guard.ts
    guards/permissions.guard.ts
    decorators/permissions.decorator.ts
    pipes/zod-validation.pipe.ts
    interceptors/trace.interceptor.ts
    filters/http-exception.filter.ts
    clients/api-client.ts
    prisma/prisma.module.ts
  modules/
    auth/
    dashboard/
    moderation/
    reports/
    admin-users/
    audit/
    events/
    health/
    metrics/
```

模块职责：

| 模块 | 接口 |
|---|---|
| `auth` | JWT 验签、权限装饰器 |
| `dashboard` | `GET /admin/dashboard/stats` |
| `moderation` | `GET /admin/posts`、`approve/reject` |
| `reports` | `GET /admin/reports`、`resolve` |
| `admin-users` | `GET /admin/users`、`ban/unban` |
| `audit` | `GET /admin/audit-logs` |
| `events` | RabbitMQ 消费者 |
| `health`/`metrics` | Terminus / prom-client |

---

## 4. 关键 NestJS 写法

Guard + 自定义装饰器：

```ts
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? [];
    const user = context.switchToHttp().getRequest().user;
    return required.every((permission) => user?.permissions?.includes(permission));
  }
}
```

Zod Pipe：

```ts
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}
  transform(value: unknown) {
    return this.schema.parse(value);
  }
}
```

统一异常：

```ts
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    const status = error instanceof HttpException ? error.getStatus() : 500;
    res.status(status).json({
      code: error instanceof HttpException ? error.name : 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Internal error',
      requestId: res.locals.requestId,
    });
  }
}
```

Interceptor 记录耗时/traceId，Filter 统一错误 JSON；Swagger 用 `@nestjs/swagger` 自动生成。

---

## 5. 数据归属与内部 API

- 管理端拥有 `moderation_records`、`admin_audit_logs`。
- 帖子/用户数据在公共 API；管理端通过内部 API 读取/修改。
- 内部接口用 `X-Internal-Token`，不暴露公网。
- 审核通过：管理端写审计 + 调 `POST /internal/posts/:id/status`；公共 API 更新状态并发 `post.published`。

如果时间紧张，允许共享 MySQL，但保留 Prisma schema 边界和内部接口契约。

---

## 6. RabbitMQ 消费者

NestJS 微服务消费者：

```ts
@Controller()
export class ModerationEventsController {
  constructor(private readonly dashboard: DashboardService) {}

  @EventPattern('post.created')
  async onPostCreated(payload: { postId: string }) {
    await this.dashboard.invalidatePendingCount();
  }
}
```

- 消费者维护 `processed_events(event_id unique)` 做幂等。
- traceparent 从 message header 继续传播。
- P1 先做一条事件闭环（`post.created`），不要一次接所有事件。

---

## 7. 可观测性

- OpenTelemetry SDK：HTTP + RabbitMQ instrumentation。
- Prometheus：HTTP 耗时、错误率、队列积压、outbox 延迟。
- Grafana：至少两张面板（API 延迟/错误率、队列/outbox）。
- Sentry：管理端错误 + release/environment 标签。

---

## 8. 验收清单

- [ ] 管理端可审核帖子、处理举报、封禁用户
- [ ] 审核通过后 feed 出现，拒绝后不出现
- [ ] 每次审核写 `moderation_records` / `admin_audit_logs`
- [ ] 普通用户访问管理接口 403
- [ ] `post.created` 事件能被 RabbitMQ 消费
- [ ] 一条请求的 trace 能从 web/api 追到 admin-api/消费者
- [ ] Grafana 有延迟/错误率/队列面板；Sentry 收到错误
- [ ] Playwright / Testcontainers 测试通过

---

## 9. 常见坑

- **TS 7 / nest-cli**：先 spike，不兼容就 SWC 或 TS 5.9。
- **装饰器元数据**：`experimentalDecorators` / `emitDecoratorMetadata` 要开。
- **权限只信 JWT**：权限变更要短 TTL 或重新签发。
- **跨服务直接改表**：管理端只走内部 API。
- **RabbitMQ 重复消费**：`event_id` 唯一键，不要只靠内存去重。

下一步：[后端 P2a](/blog/posts/node-roadmap-21-community-week-4/)，做 Docker/Nginx/指标/压测。
