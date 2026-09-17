---
title: 'TypeScript 进阶面试题（中高级必考）'
published: 2026-09-16T16:00:00+08:00
description: '深入讲解泛型、条件类型、infer、映射类型、内置工具类型实现原理、类型收窄、协变逆变等 TypeScript 高频进阶面试题。'
tags: [前端面试, TypeScript, 泛型, 类型体操, 工具类型]
category: 前端面试宝典
draft: false
---

> [!NOTE]
> 本文包含 20+ 道 TypeScript 进阶面试题，中高级岗位 TS 考察比重越来越高，难度标注：⭐ 基础 · ⭐⭐ 进阶 · ⭐⭐⭐ 高级 · 🔥 高频必考

---

## 类型基础

### Q1: interface 和 type 的区别？⭐ 🔥

**答：**

| 维度 | interface | type |
|:--|:--|:--|
| 声明合并 | ✅ 同名自动合并 | ❌ 重复定义报错 |
| extends / 交叉 | `extends` 继承 | `&` 交叉类型 |
| 联合/元组/基础类型别名 | ❌ | ✅ |
| 映射类型 | ❌ | ✅ |
| 性能 | 类型检查更快（名字可缓存） | 复杂计算类型稍慢 |
| 报错信息 | 更友好（显示接口名） | 有时展开为内联结构 |

```typescript
// interface 声明合并（适合扩展第三方库类型）
interface User { name: string }
interface User { age: number }
// 合并为 { name: string; age: number }

// type 独有：联合、元组、条件类型
type Status = 'pending' | 'done';        // 联合
type Pair = [string, number];            // 元组
type NonNull<T> = T extends null ? never : T;  // 条件类型

// 实践建议：
// 对象/类的形状 → interface（可合并、可 implements）
// 联合、元组、工具类型、类型运算 → type
```

### Q2: any、unknown、never 的区别？⭐ 🔥

```typescript
// any：放弃类型检查，可以赋值给任何类型、做任何操作
let a: any = 'str';
a.foo.bar();  // 编译通过，运行时爆炸

// unknown：类型安全的 any，赋值随意，使用前必须收窄
let u: unknown = JSON.parse(str);
u.toFixed();           // ❌ 编译报错
if (typeof u === 'number') u.toFixed();  // ✅ 收窄后可用

// never：不可能存在的值，是所有类型的子类型
// 三大来源：
// 1. 抛异常的函数
function fail(msg: string): never { throw new Error(msg); }
// 2. 无限循环
function loop(): never { while (true) {} }
// 3. 穷尽检查（最高频用法）
type Shape = 'circle' | 'square';
function area(s: Shape) {
  switch (s) {
    case 'circle': return 1;
    case 'square': return 2;
    default:
      // 如果 Shape 新增了 'triangle' 而这里没处理，
      // s 会是 'triangle'，无法赋给 never → 编译报错，提醒补全
      const _exhaustive: never = s;
      return _exhaustive;
  }
}
```

### Q3: 什么是类型收窄（Narrowing）？有哪些方式？⭐⭐ 🔥

```typescript
// 1. typeof —— 基础类型
function f(x: string | number) {
  if (typeof x === 'string') x.toUpperCase();  // x 收窄为 string
}

// 2. instanceof —— 类实例
if (err instanceof Error) console.log(err.message);

// 3. in —— 属性存在性
interface Dog { bark(): void }
interface Cat { meow(): void }
function speak(pet: Dog | Cat) {
  if ('bark' in pet) pet.bark();
}

// 4. 字面量类型判别（可辨识联合，最常用）
type Res = { code: 0; data: string } | { code: -1; msg: string };
function handle(r: Res) {
  if (r.code === 0) r.data;  // 通过判别属性收窄
  else r.msg;
}

// 5. 自定义类型守卫（is 谓词）
function isString(v: unknown): v is string {
  return typeof v === 'string';
}

// 6. 断言函数（asserts）
function assertDefined<T>(v: T | undefined): asserts v is T {
  if (v === undefined) throw new Error('undefined');
}

// 7. 真值收窄 / == null / 可选链
if (user?.name) { /* user 非空 */ }
```

---

## 泛型

### Q4: 泛型是什么？解决什么问题？⭐ 🔥

```typescript
// 没有泛型：要么丢失类型（any），要么为每种类型写一遍
function identity(arg: any): any { return arg; }  // 返回值类型丢失

// 泛型：类型参数化，调用时才确定类型
function identity<T>(arg: T): T { return arg; }
const s = identity('hello');   // T 推断为 string，s: string
const n = identity<number>(1); // 显式指定

// 泛型接口 / 泛型类
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}
type UserRes = ApiResponse<{ id: number; name: string }>;

// 泛型约束（extends）：限制 T 必须具备某些属性
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}
getLength('str');      // ✅ string 有 length
getLength([1, 2]);     // ✅ 数组有 length
getLength(123);        // ❌ number 没有 length

// 默认泛型参数
function createArr<T = string>(len: number, val: T): T[] {
  return Array(len).fill(val);
}
```

### Q5: 泛型的 extends 有哪几种含义？⭐⭐

```typescript
// 1. 约束：T 必须满足某形状
function fn<T extends { id: number }>(arg: T) {}

// 2. 继承接口
interface Admin extends User { role: string }

// 3. 条件类型中的判断（类型层面的三元表达式）
type IsString<T> = T extends string ? true : false;
type A = IsString<'x'>;    // true
type B = IsString<1>;      // false
```

---

## 条件类型与 infer

### Q6: 条件类型的分布式特性？⭐⭐⭐ 🔥

```typescript
// 当条件类型作用于联合类型时，会分发到每个成员分别计算
type ToArray<T> = T extends any ? T[] : never;

type R = ToArray<string | number>;
// 分布式：ToArray<string> | ToArray<number> = string[] | number[]
// 而不是 (string | number)[]

// 如何关闭分布式？用元组包一层
type ToArrayNoDist<T> = [T] extends [any] ? T[] : never;
type R2 = ToArrayNoDist<string | number>;  // (string | number)[]

// 经典应用：Exclude 就是靠分布式实现的
type MyExclude<T, U> = T extends U ? never : T;
type E = MyExclude<'a' | 'b' | 'c', 'a'>;
// 'a' extends 'a' → never
// 'b' extends 'a' → 'b'
// 'c' extends 'a' → 'c'
// never | 'b' | 'c' = 'b' | 'c'（never 在联合中消失）
```

### Q7: infer 关键字的作用？⭐⭐⭐ 🔥

```typescript
// infer：在条件类型中声明一个待推断的类型变量
// 相当于类型层面的"解构赋值"

// 提取函数返回值类型（ReturnType 的实现）
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type R1 = MyReturnType<() => string>;  // string

// 提取 Promise 的值类型
type UnwrapPromise<T> = T extends Promise<infer U> ? UnwrapPromise<U> : T;
type P = UnwrapPromise<Promise<Promise<number>>>;  // number（递归解包）

// 提取数组元素类型
type ElementOf<T> = T extends (infer E)[] ? E : never;
type E = ElementOf<string[]>;  // string

// 提取第一个元素
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;
type F = First<[1, 2, 3]>;  // 1

// 提取构造函数实例类型（InstanceType 的实现）
type MyInstance<T> = T extends new (...args: any[]) => infer I ? I : never;
```

---

## 映射类型与 keyof

### Q8: keyof 和 typeof 的用法？⭐ 🔥

```typescript
// keyof：取对象类型的所有键，组成联合类型
interface User { id: number; name: string; age: number }
type UserKey = keyof User;  // 'id' | 'name' | 'age'

// 高频场景：类型安全的属性访问
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
const user: User = { id: 1, name: 'Tom', age: 20 };
getProp(user, 'name');  // 返回类型精确推断为 string
getProp(user, 'xxx');   // ❌ 编译报错，key 不在 User 中

// typeof：从"值"反推"类型"（JS 对象 → TS 类型）
const config = { host: 'localhost', port: 8080 } as const;
type Config = typeof config;  // { readonly host: "localhost"; readonly port: 8080 }
type ConfigKey = keyof typeof config;  // 'host' | 'port'

// 组合技：常量数组 → 联合类型
const ROLES = ['admin', 'user', 'guest'] as const;
type Role = typeof ROLES[number];  // 'admin' | 'user' | 'guest'
```

### Q9: 映射类型是什么？修饰符怎么用？⭐⭐⭐

```typescript
// 映射类型：遍历键集合批量生成新类型
type MyPartial<T> = {
  [K in keyof T]?: T[K];       // in 遍历，? 添加可选修饰
};

// 修饰符的添加与移除：+ / -
type Mutable<T> = { -readonly [K in keyof T]: T[K] };   // 移除 readonly
type Freeze<T>  = { +readonly [K in keyof T]: T[K] };   // 添加 readonly
type Required2<T> = { [K in keyof T]-?: T[K] };          // 移除可选

// as 子句（TS 4.1+）：重映射键
// 1. 过滤键
type OnlyString<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};
// 2. 生成 getter 类型
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
interface Person { name: string; age: number }
type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number }
```

### Q10: 手写常见内置工具类型？⭐⭐⭐ 🔥

```typescript
// Partial：所有属性变可选
type MyPartial<T> = { [K in keyof T]?: T[K] };

// Required：所有属性变必选
type MyRequired<T> = { [K in keyof T]-?: T[K] };

// Readonly
type MyReadonly<T> = { readonly [K in keyof T]: T[K] };

// Pick：挑选属性
type MyPick<T, K extends keyof T> = { [P in K]: T[P] };

// Omit：排除属性（Pick + Exclude 组合）
type MyOmit<T, K extends keyof T> = MyPick<T, MyExclude<keyof T, K>>;
// 官方实现：Pick<T, Exclude<keyof T, K>>

// Exclude / Extract
type MyExclude<T, U> = T extends U ? never : T;
type MyExtract<T, U> = T extends U ? T : never;

// NonNullable：排除 null 和 undefined
type MyNonNullable<T> = T extends null | undefined ? never : T;

// Record：构造键值对类型
type MyRecord<K extends keyof any, V> = { [P in K]: V };
type Dict = MyRecord<string, number>;  // { [x: string]: number }

// ReturnType / Parameters
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;
```

---

## 实战场景

### Q11: 如何给后端接口返回值做类型定义？⭐⭐

```typescript
// 1. 统一响应包装（泛型）
interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
}

// 2. 列表分页响应
interface PageResult<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

// 3. 实体类型集中管理
interface UserVO {
  id: number;
  username: string;
  status: UserStatus;
  createTime: string;
}

// 枚举用字面量联合 + as const（比 enum 更轻量，tree-shaking 友好）
const UserStatus = { NORMAL: '0', DISABLED: '1' } as const;
type UserStatus = typeof UserStatus[keyof typeof UserStatus];

// 4. 请求函数泛型化，全链路类型推断
async function request<T>(url: string, config?: RequestInit): Promise<ApiResult<T>> {
  const res = await fetch(url, config);
  return res.json();
}
// 调用处 data 自动推断为 PageResult<UserVO>
const { data } = await request<PageResult<UserVO>>('/api/users');
data.list.forEach(u => u.username);  // ✅ 全程有提示
```

### Q12: declare、.d.ts、模块声明怎么用？⭐⭐

```typescript
// declare：告诉 TS "这个东西在别处已存在"，只声明不实现
declare const __VERSION__: string;      // 构建工具注入的全局变量
declare function ga(cmd: string): void; // 第三方脚本挂载的全局函数

// .d.ts 文件：纯类型声明，不产生运行时代码
// global.d.ts —— 扩展全局类型
interface Window {
  __APP_CONFIG__: { apiBase: string };
}
// 之后 window.__APP_CONFIG__ 有类型提示

// 为无类型的 npm 包补声明
declare module 'some-untyped-lib' {
  export function doSomething(input: string): number;
}

// 静态资源模块声明（Vite 项目常见）
declare module '*.svg' {
  const content: string;
  export default content;
}

// 扩展第三方库类型（模块扩充）
// 例如给 vue-router 的 meta 加类型
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    roles?: string[];
  }
}
```

### Q13: as const 和 satisfies 的作用？⭐⭐⭐

```typescript
// as const：深度只读 + 字面量类型收窄
const arr1 = ['a', 'b'];            // string[]
const arr2 = ['a', 'b'] as const;   // readonly ['a', 'b']
const obj = { type: 'click' } as const;  // { readonly type: "click" }
// 没有 as const 时 type 会被 widen 成 string

// satisfies（TS 4.9+）：既要满足约束，又保留精确类型
type ColorMap = Record<string, string | [number, number, number]>;

const colors = {
  red: [255, 0, 0],
  green: '#00ff00',
} satisfies ColorMap;
// colors.red 类型是 [number, number, number]（精确保留）
colors.red[0];        // ✅ 能访问元组下标
// 如果写成 : ColorMap，red 会被放宽为 string | [number,number,number]，
// 访问 red[0] 报错

// 总结：
// as const  → 收窄为字面量/只读
// satisfies → 校验类型但不丢失精度（常与 as const 连用）
```

### Q14: 协变与逆变是什么？⭐⭐⭐

```typescript
// 协变（covariance）：子类型可以赋给父类型（数组、返回值）
class Animal { name = '' }
class Dog extends Animal { bark() {} }

let animals: Animal[] = [];
let dogs: Dog[] = [];
animals = dogs;   // ✅ Dog[] 赋给 Animal[]（协变）

// 逆变（contravariance）：函数参数方向相反
type Handler<T> = (arg: T) => void;
let hAnimal: Handler<Animal> = a => console.log(a.name);
let hDog: Handler<Dog> = d => d.bark();
hDog = hAnimal;   // ✅ 处理 Animal 的函数可以处理 Dog（逆变）
// 直觉：能处理"更宽"参数的函数，用在"更窄"参数位置是安全的

// 双向协变（bivariance）：方法写法的参数默认双向协变（不严格）
// strictFunctionTypes 开启后，函数写法的参数才是严格逆变

// 面试一句话总结：
// 属性/返回值 → 协变；函数参数 → 逆变（strict 模式下）
```

### Q15: TS 编译过程？tsc 做了哪些事？⭐⭐

```
TypeScript 编译流程：

.ts 源码
   ↓ 解析（Parser）
AST 抽象语法树
   ↓ 绑定（Binder）→ Symbol 符号表
   ↓ 类型检查（Checker）← 核心！tsc 的主要价值
   ↓ 发射（Emitter）
.js + .d.ts + .map

关键点：
1. tsc = 类型检查 + 转译降级（target 转换）
2. Vite/esbuild/SWC 只转译不检查（快 20-100 倍），
   类型检查交给 IDE 和 CI 里的 vue-tsc / tsc --noEmit
3. isolatedModules：每个文件独立编译，
   因此不能用 const enum、命名空间合并等跨文件特性
4. 类型信息在编译后完全擦除（type erasure），
   运行时不存在任何类型，无法用类型做运行时校验
   → 外部数据（接口返回）需要 zod / valibot 等运行时校验
```

### Q16: tsconfig 中最重要的配置项？⭐⭐ 🔥

```json
{
  "compilerOptions": {
    // 严格性（新项目直接开 strict，包含下面所有）
    "strict": true,
    "noImplicitAny": true,        // 禁止隐式 any
    "strictNullChecks": true,     // null/undefined 必须显式处理
    "strictFunctionTypes": true,  // 函数参数逆变检查

    // 模块与目标
    "target": "ES2020",           // 编译产物的 JS 版本
    "module": "ESNext",           // 模块系统
    "moduleResolution": "bundler",// Vite/webpack 项目推荐

    // 互操作
    "esModuleInterop": true,      // 允许 import x from 'cjs-module'
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,    // 允许 import json

    // 路径别名（与 Vite resolve.alias 保持一致）
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },

    // 产物
    "sourceMap": true,
    "declaration": true,          // 生成 .d.ts（发 npm 包必须）
    "skipLibCheck": true          // 跳过 node_modules 类型检查（提速）
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 类型体操常见题

### Q17: 手写常见类型体操题？⭐⭐⭐ 🔥

```typescript
// 1. 元组转联合
type TupleToUnion<T extends any[]> = T[number];
type U = TupleToUnion<['a', 'b', 'c']>;  // 'a' | 'b' | 'c'

// 2. 联合转交叉（高频难题）
type UnionToIntersection<T> =
  (T extends any ? (arg: T) => void : never) extends
  (arg: infer I) => void ? I : never;
// 原理：联合分发成多个函数类型，再利用函数参数逆变推断出交叉
type I = UnionToIntersection<{ a: 1 } | { b: 2 }>;  // { a: 1 } & { b: 2 }

// 3. 字符串模板解析（CamelCase → KebabCase）
type CamelToKebab<S extends string> =
  S extends `${infer H}${infer T}`
    ? H extends Uppercase<H>
      ? `${H extends Lowercase<H> ? '' : '-'}${Lowercase<H>}${CamelToKebab<T>}`
      : `${H}${CamelToKebab<T>}`
    : S;
type K = CamelToKebab<'helloWorldFoo'>;  // 'hello-world-foo'

// 4. Awaited（TS 4.5 内置，递归解包 Promise）
type A = Awaited<Promise<Promise<string>>>;  // string

// 5. 数组转对象（元组 [keys, values] 映射）
type Zip<K extends string[], V extends any[]> =
  K extends [infer KH extends string, ...infer KR]
    ? V extends [infer VH, ...infer VR]
      ? { [P in KH]: VH } & Zip<KR, VR>
      : {}
    : {};

// 6. DeepReadonly（递归只读）
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

// 7. DeepPartial（递归可选）
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

// 学习建议：type-challenges 仓库刷 easy 全部 + medium 前 30 题，
// 面试手写基本覆盖（联合转交叉、DeepReadonly、字符串模板是重点）
```

### Q18: 项目中如何做 TS 渐进式迁移（JS → TS）？⭐⭐

```
大型 JS 项目迁移 TS 的务实策略：

1. 先搭架子：allowJs: true，让 .js/.ts 共存
2. 从底向上：类型声明（api/types）→ 工具函数 → 组件 → 页面
3. 分级严格：先关 strict，跑通构建，再逐目录开启
4. 双工具链：Vite 用 esbuild 转译（不检查），
   CI 加 tsc --noEmit 兜底全量检查
5. 存量代码：@ts-expect-error + TODO 注释标记，
   禁止新增 @ts-ignore（它会永久吞掉错误）
6. 第三方无类型包：先 declare module 兜底，
   再逐步补全或换有类型的替代包

关键指标：any 占比。用 eslint 规则
@typescript-eslint/no-explicit-any 设为 warn 统计，
新代码 error、旧代码 warn，逐步收敛。
```

---

## 复习卡片

> [!TIP]
> **快速复习清单**
>
> 1. **interface vs type**：声明合并 vs 联合/元组/映射
> 2. **any vs unknown vs never**：不安全 / 安全收窄 / 穷尽检查
> 3. **类型收窄七法**：typeof、instanceof、in、判别联合、is 守卫、asserts、真值
> 4. **分布式条件类型**：联合类型逐个计算，`[T] extends [U]` 可关闭
> 5. **infer**：类型层面的解构，ReturnType/UnwrapPromise 核心
> 6. **keyof + 泛型约束**：`<T, K extends keyof T>` 类型安全取属性
> 7. **内置工具类型手写**：Partial/Pick/Omit/Exclude/Record 必须秒写
> 8. **as const vs satisfies**：收窄字面量 vs 校验不丢精度
> 9. **协变逆变**：返回值协变、参数逆变（strictFunctionTypes）
> 10. **编译流程**：tsc 检查+发射；Vite 只转译；类型运行时擦除
> 11. **高频体操题**：UnionToIntersection、DeepReadonly、CamelToKebab
> 12. **渐进迁移**：allowJs 共存 → 自底向上 → any 占比收敛

---

> [!TIP]
> 下一篇：[性能优化面试题](/blog/posts/interview-guide-13-performance/) 涵盖核心指标（LCP/INP/CLS）、加载性能、渲染性能、内存泄漏排查、优化实战案例。
>
> 返回 [面试宝典总览](/blog/posts/interview-guide-00-overview/) | [面试宝典合集页](/blog/interview-guide/)
