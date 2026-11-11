---
title: '后端 11–15：NestJS 管理/BFF 与异步治理'
published: 2026-11-10T10:40:00+08:00
updated: 2026-11-10T10:40:00+08:00
description: 'Day 11–15：NestJS 管理/BFF、Guard/Pipe/Interceptor/Filter/Swagger、审核举报、RabbitMQ 事件和 OpenTelemetry 可观测性。'
tags: [社区全栈, 后端, NestJS, RabbitMQ]
category: 社区全栈实战
draft: false
---

> [!NOTE]
> 后端 11–15。上一篇：[后端 06–10](/blog/posts/node-roadmap-19-community-week-2/)；下一篇：[后端 16–18](/blog/posts/node-roadmap-21-community-week-4/)；前端对应篇：[前端 07–09](/blog/posts/community-fullstack-fe-03-p1-admin/)；合集：[社区全栈实战](/blog/community-fullstack-roadmap/)。

公共 API 到这里已经够用了。接下来单独加一个 `apps/admin-api`，用 NestJS 做审核、举报、用户管理和审计。NestJS 只负责管理端，公共 API 不动，避免为了用框架而重写。

**这一阶段在练什么**

按边界拆服务，而不是按框架拆。NestJS 的 Module、Guard、Pipe、Interceptor、Filter 都是手段，目的是让管理端的权限、校验、错误和审计有固定位置。

### 文件地图

| 文件 | 为什么单独存在 | 以后可能怎么改 |
|---|---|---|
| `app.module.ts` | 管理端的组合根 | 拆更多模块或独立服务 |
| `common/guards` | 认证和权限是横切边界 | SSO、ABAC、权限缓存 |
| `common/pipes` | 入参校验统一入口 | 共享 zod 契约 |
| `common/filters` | 错误响应统一出口 | 错误码目录、告警 |
| `common/clients/api-client.ts` | 管理端不直接碰核心表 | gRPC、服务网格、内部网关 |
| `modules/moderation` | 审核是独立业务域 | 工作流、SLA、批量审核 |
| `modules/reports` | 举报和审计独立演进 | 自动分类、风控 |
| `events` | 跨服务事件入口 | Kafka、Outbox relay |

**怎么判断**

只有“独立变更、独立扩容、独立故障域”才拆服务。公共 API 不重写，管理端单独拆，是为了边界，不是为了追框架。

---

## Day 11：NestJS 脚手架与兼容性 spike

**今天目标**：`apps/admin-api` 能启动，Prisma + Swagger + 一个 Guard 能跑。

### 1. 创建应用

```bash
pnpm dlx @nestjs/cli@12 new admin-api --package-manager pnpm --skip-git
mv admin-api apps/admin-api
```

先验证 TypeScript 7 兼容性：

```bash
cd apps/admin-api
pnpm build
pnpm start
```

如果 `nest build` 对 TS 7 报错，改用 SWC 构建或让 `admin-api` 单独使用 TS 5.9；`apps/api` 继续 TS 7。

### 2. 安装依赖

```bash
pnpm --filter admin-api add @nestjs/config @nestjs/swagger @nestjs/jwt @nestjs/passport passport-jwt @nestjs/throttler @nestjs/terminus @nestjs/microservices amqplib @prisma/client
pnpm --filter admin-api add -D prisma @types/passport-jwt @types/amqplib
```

### 3. Prisma：治理库

`apps/admin-api/prisma/schema.prisma`：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("ADMIN_DATABASE_URL")
}

enum ReportStatus {
  pending
  resolved
  rejected
}

model Report {
  id        BigInt       @id @default(autoincrement())
  targetType String      @map("target_type") @db.VarChar(32)
  targetId  BigInt       @map("target_id")
  reason    String       @db.VarChar(255)
  status    ReportStatus @default(pending)
  handledBy BigInt?      @map("handled_by")
  createdAt DateTime     @default(now()) @map("created_at")
  @@index([status, createdAt])
  @@map("reports")
}

model ModerationRecord {
  id         BigInt   @id @default(autoincrement())
  targetType String   @map("target_type") @db.VarChar(32)
  targetId   BigInt   @map("target_id")
  action     String   @db.VarChar(32)
  operatorId BigInt   @map("operator_id")
  reason     String?  @db.VarChar(255)
  createdAt  DateTime @default(now()) @map("created_at")
  @@index([targetType, targetId])
  @@map("moderation_records")
}

model ProcessedEvent {
  eventId    String   @id @map("event_id") @db.VarChar(64)
  createdAt  DateTime @default(now()) @map("created_at")
  @@map("processed_events")
}
```

```bash
pnpm --filter admin-api exec prisma migrate dev --name init_admin
```

### 4. AppModule + PrismaModule

`src/prisma/prisma.module.ts`：

```ts
import { Global, Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Global()
@Module({
  providers: [{ provide: PrismaClient, useFactory: () => new PrismaClient() }],
  exports: [PrismaClient],
})
export class PrismaModule {}
```

`src/app.module.ts`：

```ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
})
export class AppModule {}
```

`src/main.ts`：

```ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  await app.listen(Number(process.env.ADMIN_PORT ?? 3001));
}
void bootstrap();
```

**验收**：`pnpm --filter admin-api start` 后 `GET http://127.0.0.1:3001/api/v1/health` 返回 200（Day 12 加 health）。

**产出**：commit `feat: bootstrap nestjs admin api`。

---

## Day 12：Guard、Pipe、Interceptor、Filter、Swagger

**今天目标**：管理接口有统一鉴权、校验、错误和文档。

### 1. 权限装饰器与 Guard

`src/common/decorators/permissions.decorator.ts`：

```ts
import { SetMetadata } from '@nestjs/common';
export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

`src/common/guards/jwt-auth.guard.ts`：

```ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const header = request.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) throw new UnauthorizedException('Authentication required');
    request.user = jwt.verify(token, process.env.JWT_SECRET!);
    return true;
  }
}
```

`src/common/guards/permissions.guard.ts`：

```ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? [];
    const user = context.switchToHttp().getRequest().user;
    const granted = user?.permissions ?? [];
    if (!required.every((permission) => granted.includes(permission))) {
      throw new ForbiddenException('Permission denied');
    }
    return true;
  }
}
```

> Access token 里要带 `permissions`。公共 API 登签发 token 时补上；或者管理端调用内部接口拿权限。短 TTL + 重新登录即可生效。

### 2. Zod Pipe

```ts
import { Injectable, PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

@Injectable()
export class ZodPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}
  transform(value: unknown) {
    return this.schema.parse(value);
  }
}
```

### 3. 统一异常与 trace

```ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const status = error instanceof HttpException ? error.getStatus() : 500;
    response.status(status).json({
      code: error instanceof HttpException ? error.name : 'INTERNAL_ERROR',
      message: error instanceof Error ? error.message : 'Internal error',
      requestId: response.locals.requestId,
    });
  }
}
```

`main.ts` 注册：

```ts
app.useGlobalFilters(new AllExceptionsFilter());
```

### 4. Swagger

```ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('Community Admin API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
```

**验收**：`/docs` 可打开；无 token 请求 401；普通用户 403。

**产出**：commit `feat: add nest guards pipes filters swagger`。

---

## Day 13：审核、举报、用户、审计、Dashboard

**今天目标**：管理端能审核帖子、处理举报、封禁用户，并写审计。

### 1. 内部 API 客户端

`src/common/clients/api-client.ts`：

```ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiClient {
  private readonly base = process.env.API_INTERNAL_URL ?? 'http://127.0.0.1:3000';
  private readonly token = process.env.INTERNAL_API_TOKEN ?? '';

  private async request(path: string, init: RequestInit = {}) {
    const response = await fetch(`${this.base}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Token': this.token,
        ...init.headers,
      },
    });
    if (!response.ok) throw new Error(`internal api ${response.status}`);
    return response.json();
  }

  listPosts(status: string) {
    return this.request(`/internal/posts?status=${status}`);
  }

  setPostStatus(id: string, status: string) {
    return this.request(`/internal/posts/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  listReports(status: string) {
    return this.request(`/internal/reports?status=${status}`);
  }

  resolveReport(id: string) {
    return this.request(`/internal/reports/${id}/resolve`, { method: 'POST' });
  }
}
```

公共 API 需要提供这些内部接口，并用 `INTERNAL_API_TOKEN` 校验。

### 2. ModerationService

```ts
@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaClient, private readonly api: ApiClient) {}

  listPendingPosts() {
    return this.api.listPosts('pending');
  }

  async approve(postId: string, operatorId: bigint) {
    await this.api.setPostStatus(postId, 'published');
    await this.prisma.moderationRecord.create({
      data: { targetType: 'post', targetId: BigInt(postId), action: 'approve', operatorId },
    });
  }

  async reject(postId: string, operatorId: bigint, reason?: string) {
    await this.api.setPostStatus(postId, 'rejected');
    await this.prisma.moderationRecord.create({
      data: { targetType: 'post', targetId: BigInt(postId), action: 'reject', operatorId, reason },
    });
  }
}
```

控制器：

```ts
@Controller('admin/posts')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('post:review')
export class ModerationController {
  constructor(private readonly service: ModerationService) {}

  @Get()
  list() { return this.service.listPendingPosts(); }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Req() req: any) {
    return this.service.approve(id, BigInt(req.user.sub));
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Req() req: any) {
    return this.service.reject(id, BigInt(req.user.sub));
  }
}
```

### 3. 举报、用户、审计、Dashboard

- `ReportsController`：`GET /admin/reports`、`POST /admin/reports/:id/resolve`，写 `moderation_records`。
- `AdminUsersController`：`GET /admin/users`、`POST /admin/users/:id/ban|unban`，调用内部 API。
- `AuditController`：`GET /admin/audit-logs`，只读。
- `DashboardController`：`GET /admin/dashboard/stats`，聚合待审核/举报/用户/帖子。

**验收**：管理端审核通过后 feed 出现；拒绝后不出现；每次操作有审计记录。

**产出**：commit `feat: add moderation reports users audit`。

---

## Day 14：RabbitMQ 事件总线

**今天目标**：管理端消费 `post.created` / `report.created`，消费幂等。

### 1. 安装与连接

```bash
pnpm --filter admin-api add @nestjs/microservices amqplib amqp-connection-manager
```

`main.ts` 连接 RabbitMQ：

```ts
app.connectMicroservice({
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL ?? 'amqp://127.0.0.1:5672'],
    queue: 'admin.events',
    queueOptions: { durable: true },
  },
});
await app.startAllMicroservices();
```

### 2. 消费者

```ts
@Controller()
export class EventsController {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly dashboard: DashboardService,
  ) {}

  @EventPattern('post.created')
  async onPostCreated(payload: { eventId: string }) {
    const processed = await this.prisma.processedEvent.findUnique({
      where: { eventId: payload.eventId },
    });
    if (processed) return;

    await this.prisma.processedEvent.create({ data: { eventId: payload.eventId } });
    await this.dashboard.invalidate();
  }
}
```

公共 API 的 outbox worker 把 `post.created` / `report.created` 发到 RabbitMQ exchange；站内通知仍走 BullMQ。

**验收**：发一条帖子后，管理端 `processed_events` 多一条；重复投递不重复处理；trace 能串起来（Day 15）。

**产出**：commit `feat: add rabbitmq admin consumer`。

---

## Day 15：OpenTelemetry、指标、E2E 与验收

**今天目标**：trace 跨服务、Grafana 有面板、Sentry 有错误、管理端 E2E 通过。

### 1. OpenTelemetry

```bash
pnpm --filter admin-api add @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http
```

`src/otel.ts`：

```ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const sdk = new NodeSDK({
  serviceName: 'community-admin-api',
  traceExporter: new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://127.0.0.1:4318/v1/traces',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

在 `main.ts` 第一行 `import './otel.js';`。公共 API 也接同一套；Nginx/HTTP/RabbitMQ header 传 traceparent。

### 2. 指标与健康

```bash
pnpm --filter admin-api add prom-client @nestjs/terminus @sentry/node
```

- `/metrics` 暴露 HTTP 耗时、错误率、队列积压。
- `/health`、`/ready` 用 Terminus 检查 MySQL/RabbitMQ。
- Sentry 在 `main.ts` 初始化，错误 Filter 上报。

### 3. E2E / Testcontainers

- Playwright 跑管理端审核/举报。
- Testcontainers 起 MySQL/RabbitMQ 做集成测试。
- CI 增加 admin-api 的 typecheck/test/build。

### 4. 验收

- [ ] 管理端审核/举报/封禁可用
- [ ] 审核通过 feed 出现，拒绝不出现
- [ ] 普通用户 403
- [ ] trace 从 web/api 追到 admin-api/消费者
- [ ] Grafana 有延迟/错误率/队列面板
- [ ] Sentry 收到错误
- [ ] E2E / Testcontainers 通过

**产出**：commit `feat: add otel metrics and admin e2e`。

下一步：[后端 16–18](/blog/posts/node-roadmap-21-community-week-4/)，做 Docker/Nginx/指标/压测与回滚。
