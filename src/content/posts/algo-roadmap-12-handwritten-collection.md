---
title: '12 · 手写高频合集：深拷贝、call/bind、instanceof 等'
published: 2026-10-15T21:00:00+08:00
description: '手写题高频合集：深拷贝处理循环引用、call/apply/bind 三件套、instanceof、EventEmitter、数组扁平化。'
tags: [手写题, 深拷贝, JavaScript, 面试]
category: 算法与手写题
draft: false
---

> [!NOTE]
> 这篇是手写题的"杂粮袋"：单拎出来不够一篇、但出场率都很高的题。深拷贝（循环引用版）、call/apply/bind、instanceof、EventEmitter、数组扁平化——每道都是十分钟内能讲完的高频款。

---

## 1. 深拷贝：处理循环引用是分水岭

浅拷贝只复制第一层引用，深拷贝递归复制所有层级。`JSON.parse(JSON.stringify())` 的缺陷必先说：丢函数、undefined、Symbol，Date 变字符串，循环引用直接报错。

**递归版 + WeakMap 解决循环引用**：

```ts
function deepClone<T>(obj: T, map = new WeakMap<object, unknown>()): T {
  // 基础类型、函数直接返回
  if (obj === null || typeof obj !== "object") return obj;

  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags) as unknown as T;

  // 循环引用检测：正在拷贝中 => 返回半成品引用
  if (map.has(obj as object)) return map.get(obj as object) as T;

  const cloned = (Array.isArray(obj) ? [] : {}) as T;
  map.set(obj as object, cloned);                // ⚠️ 先登记再递归，顺序不能反

  for (const key of Reflect.ownKeys(obj as object)) {  // 含 Symbol 键
    (cloned as Record<PropertyKey, unknown>)[key] = deepClone(
      (obj as Record<PropertyKey, unknown>)[key], map,
    );
  }
  return cloned;
}
```

逐行讲，三个必答点：

1. **WeakMap 在递归前 set**：先登记"原对象 → 半成品"，再递归子属性。循环引用（`a.child = a`）走到子属性时查 map 命中，返回半成品，死循环解开。**先递归后登记**是这题最经典的错误写法。
2. **为什么用 WeakMap 不用 Map**：WeakMap 键是弱引用，不影响原对象被垃圾回收。
3. **`Reflect.ownKeys`**：同时拿到字符串键和 Symbol 键，比 `Object.keys` 完整。

追问"还有哪些没覆盖"：Map/Set（`new Map(obj)` 后递归 value）、原型链（`Object.create(getPrototypeOf(obj))`）、getter/setter（`Object.getOwnPropertyDescriptor`）。全结构版一般不需要现场写，讲清思路即可。

---

## 2. call / apply / bind 三件套

**call**：把函数临时挂到目标对象上借 this：

```ts
Function.prototype.myCall = function <T, A extends unknown[]>(
  this: (this: T, ...args: A) => unknown,
  ctx: T,
  ...args: A
): unknown {
  const context = ctx ?? globalThis;             // null/undefined 时指向全局
  const key = Symbol("fn");                      // Symbol 避免键冲突
  (context as Record<symbol, unknown>)[key] = this;
  const result = (context as Record<symbol, (this: T, ...args: A) => unknown>)[key](...args);
  delete (context as Record<symbol, unknown>)[key];   // 用完删除，不留痕
  return result;
};
```

必答点：`Symbol` 当临时键防止覆盖对象已有属性；`ctx ?? globalThis` 处理严格模式下传 null 的场景；调用后 delete 清理。**apply** 只差参数形式：`...args` 变成数组 `context[key](...argsArr)`。

**bind**：返回永久绑定的函数，还要支持 `new` 调用：

```ts
Function.prototype.myBind = function <T, A extends unknown[]>(
  this: (this: T, ...args: A) => unknown,
  ctx: T,
  ...boundArgs: A
) {
  const fn = this;
  function bound(this: unknown, ...restArgs: unknown[]) {
    // new 调用时 this 是新实例，应优先于绑定的 ctx
    return fn.apply(
      this instanceof bound ? this : ctx,
      [...boundArgs, ...restArgs],               // 预置参数 + 调用时参数
    );
  }
  // 维持原型链，让 new bound() 的实例能访问 fn.prototype
  bound.prototype = Object.create(fn.prototype);
  return bound;
};
```

必答点：`this instanceof bound` 判断是否被 new——new 时 this 是新实例，绑定目标被忽略（new 优先级高于 bind）；`Object.create(fn.prototype)` 保住原型链。bind 是三件套里唯一"返回新函数"的，也是追问最多的。

---

## 3. instanceof：原型链的行走

```ts
function myInstanceof(obj: unknown, ctor: Function): boolean {
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    return false;                                // 原始值直接 false
  }
  let proto = Object.getPrototypeOf(obj);        // 不用 __proto__，更规范
  while (proto !== null) {
    if (proto === ctor.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
```

逐行讲：instanceof 的本质是**沿着原型链找 ctor.prototype**。用 `getPrototypeOf` 而非 `obj.__proto__` 显得规范；终止条件 `proto === null`（原型链尽头即 null）。追问"基础类型为什么永远 false"：基础类型没有原型链，第一步就被拦下。

---

## 4. EventEmitter 与数组扁平化

**EventEmitter**（发布订阅的裸实现，场景题常客）：

```ts
class EventEmitter {
  private events = new Map<string, Set<Function>>();

  on(event: string, cb: Function): this {
    if (!this.events.has(event)) this.events.set(event, new Set());
    this.events.get(event)!.add(cb);
    return this;                                  // 支持链式调用
  }

  off(event: string, cb: Function): this {
    this.events.get(event)?.delete(cb);
    return this;
  }

  once(event: string, cb: Function): this {
    const wrapper = (...args: unknown[]) => {
      cb(...args);
      this.off(event, wrapper);                   // 触发一次后自毁
    };
    return this.on(event, wrapper);
  }

  emit(event: string, ...args: unknown[]): this {
    this.events.get(event)?.forEach((cb) => cb(...args));
    return this;
  }
}
```

必答点：`once` 的自毁包装器（注销用的是 wrapper 而不是原回调）；用 `Set` 天然去重；`emit` 时先拷贝回调列表再遍历更稳（防止回调里 off 自己导致遍历异常，主动提这一点很加分）。

**数组扁平化**：

```ts
// 递归版
function flatten(arr: unknown[], depth = Infinity): unknown[] {
  return arr.reduce<unknown[]>((acc, item) =>
    Array.isArray(item) && depth > 0
      ? acc.concat(flatten(item, depth - 1))
      : acc.concat(item),
  []);
}
```

追问梯度：`arr.flat(Infinity)` 一行流 → 递归实现 → 迭代实现（用栈 + `shift`，大数组递归会爆栈，这是迭代版的存在意义）→ "扁平化 + 去重 + 升序"组合题（`[...new Set(flatten(arr))].sort((a,b) => a-b)`）。

---

## 小结

- 深拷贝：WeakMap **先登记后递归**解循环引用，`Reflect.ownKeys` 收 Symbol 键。
- call 借 this 用完即删；bind 要处理 new 优先级和原型链。
- instanceof：沿原型链找 ctor.prototype。
- EventEmitter：once 自毁包装器；扁平化递归/迭代双版本。

---

## 练习

1. 构造 `const a = {name:'a'}; a.self = a;` 验证你的深拷贝不死循环。
2. 默写 myCall 和 myBind，用 `new myBind(...)` 验证 new 优先级。
3. 写 `myInstanceof([], Array)` 和 `myInstanceof('a', String)`，解释后者为什么 false。
4. 手写 EventEmitter，实现 `once` 后用 `off` 注销 once 注册的回调。
