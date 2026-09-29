---
title: '10 · 装饰器'
published: 2026-09-27T20:00:00+08:00
description: 'TypeScript 装饰器全解：装饰器是什么、开启 experimentalDecorators、类/方法/访问器/属性/参数五种装饰器、装饰器工厂、执行顺序，以及与 NestJS 等框架的关系。'
tags: [TypeScript, 装饰器, decorators, 装饰器工厂, NestJS]
category: TypeScript学习路线
draft: false
---

> [!NOTE]
> 装饰器是"给类/方法/属性加元数据或行为的注解语法"，NestJS、Angular 大量使用。TS 里它是实验特性，需显式开启。

---

## 1. 开启装饰器

在 `tsconfig.json`：

```jsonc
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true // 配合反射元数据（NestJS 需要）
  }
}
```

> ⚠️ TS 的装饰器基于**旧版（stage-1）提案**写法；新版 TC39 装饰器（stage-3）语法不同，TS 5.0+ 也在逐步对齐。本篇按当前 TS 文档的写法讲，NestJS 等框架仍用此写法。

---

## 2. 类装饰器

接收构造函数，可替换/增强类：

```ts
function Seal(constructor: Function): void {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}
@Seal
class User {
  name = "Tom";
}
```

类装饰器参数就是**被装饰类的构造函数**。

---

## 3. 方法装饰器

接收 `(target, propertyKey, descriptor)`：

```ts
function Log(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
): void {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`调用 ${propertyKey}`, args);
    return original.apply(this, args);
  };
}
class Calc {
  @Log
  add(a: number, b: number): number { return a + b; }
}
```

方法装饰器常用于**日志、缓存、权限、性能统计**——不侵入业务代码地"包"一层。

---

## 4. 访问器 / 属性 / 参数装饰器

```ts
// 访问器装饰器（getter/setter），签名同方法装饰器但 descriptor.value 为 undefined
function NoNegative(target: any, key: string, descriptor: PropertyDescriptor) {
  const setter = descriptor.set!;
  descriptor.set = function (v: number) {
    if (v < 0) throw new Error("不能为负");
    setter.call(this, v);
  };
}

class Account {
  private _bal = 0;
  @NoNegative
  set balance(v: number) { this._bal = v; }
  get balance() { return this._bal; }
}

// 属性装饰器：(target, propertyKey)
function Format(fmt: string) {
  return function (target: any, key: string) {} as any;
}

// 参数装饰器：(target, propertyKey, parameterIndex)
function Validate(target: any, key: string, index: number) {}
```

属性/参数装饰器多用于**收集元数据**（如依赖注入标记），本身不返回值。

---

## 5. 装饰器工厂

上面装饰器都是"硬编码"。用工厂返回真正的装饰器，可传参：

```ts
function Role(role: string) {
  return function (constructor: Function) {
    constructor.prototype.role = role;
  };
}
@Role("admin")
class AdminService {}
```

工厂 = "返回装饰器函数的函数"，是装饰器传参的标准写法。

---

## 6. 执行顺序

- 同一声明上多个装饰器：**从下到上**求值，但**从上到下**应用。
- 不同声明：参数装饰器 → 方法/访问器 → 属性 → 类（先内后外）。

理解顺序在调试元数据注入时有用，日常不必死记。

---

## 7. 与框架的关系

NestJS 用装饰器声明路由、依赖、守卫：

```ts
@Controller("users")
class UserController {
  @Get(":id")
  @UseGuards(AuthGuard)
  findOne(@Param("id") id: string) {}
}
```

装饰器本身只是"语法糖 + 元数据"，真正的逻辑由框架读取这些元数据后驱动。理解这点就不怕框架黑魔法了。

---

## 小结

- 装饰器需 `experimentalDecorators: true`。
- 五类：类 / 方法 / 访问器 / 属性 / 参数装饰器，参数各异。
- 装饰器工厂 = 返回装饰器的函数，用于传参。
- 实战价值在 AOP（日志/鉴权/缓存）与框架元数据（NestJS）。

---

## 练习

1. 写 `@readonly` 类装饰器，把类的 `prototype` 方法设为不可写（Object.defineProperty）。
2. 写 `@Log` 方法装饰器记录方法名与耗时（performance.now()）。
3. 用装饰器工厂 `@Prefix("api")` 给类加一个静态 `prefix` 属性。
4. 思考：为什么 NestJS 的 `@Get()` 不需要返回值？（提示：收集元数据）
