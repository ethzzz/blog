---
title: 'JavaScript 核心面试题（中高级）'
published: 2026-09-15T12:00:00+08:00
description: '覆盖原型链、闭包、this 指向、作用域、类型转换、ES6+ 新特性等 30+ 道高频面试题。'
tags: [前端面试, JavaScript, 原型链, 闭包, ES6]
category: 前端面试宝典
draft: false
---

> [!NOTE]
> 本文包含 30+ 道 JavaScript 核心面试题，难度标注：⭐ 基础 · ⭐⭐ 进阶 · ⭐⭐⭐ 高级 · 🔥 高频必考

---

## 数据类型

### Q1: JavaScript 有哪些数据类型？⭐ 🔥

**答：**

| 类型 | 分类 | 示例 |
|:--|:--|:--|
| `number` | 基本类型 | `1`, `3.14`, `NaN`, `Infinity` |
| `string` | 基本类型 | `'hello'`, `"world"` |
| `boolean` | 基本类型 | `true`, `false` |
| `undefined` | 基本类型 | `undefined` |
| `null` | 基本类型 | `null` |
| `symbol` | 基本类型 (ES6) | `Symbol('id')` |
| `bigint` | 基本类型 (ES2020) | `123n` |
| `object` | 引用类型 | `{}`, `[]`, `function`, `Date` |

```javascript
// 类型检测
typeof 123           // 'number'
typeof 'str'         // 'string'
typeof true          // 'boolean'
typeof undefined     // 'undefined'
typeof null          // 'object' (历史 bug)
typeof Symbol()      // 'symbol'
typeof []            // 'object'
typeof function(){}  // 'function'

// 准确检测
Object.prototype.toString.call(null)      // '[object Null]'
Object.prototype.toString.call([])        // '[object Array]'
Object.prototype.toString.call(new Date()) // '[object Date]'

Array.isArray([])        // true
instanceof               // 检测原型链
```

### Q2: null 和 undefined 的区别？⭐

**答：**

| 特性 | `null` | `undefined` |
|:--|:--|:--|
| 含义 | 空值，表示"没有对象" | 未定义，表示"缺少值" |
| typeof | `'object'` | `'undefined'` |
| 转换数字 | `0` | `NaN` |
| 使用场景 | 主动赋值 | 变量声明未赋值、函数无返回值 |

```javascript
null == undefined    // true（宽松相等）
null === undefined   // false（严格相等）

Number(null)         // 0
Number(undefined)    // NaN

// 实际使用
let obj = null;       // 明确表示空对象
let value;            // undefined，未赋值

function fn() {}
fn();                 // undefined，无返回值
```

### Q3: 深拷贝和浅拷贝的区别？如何实现深拷贝？⭐⭐ 🔥

**答：**

```javascript
// 浅拷贝：只复制第一层，引用类型仍共享
const obj = { a: 1, b: { c: 2 } };
const shallow = { ...obj };
// 或 Object.assign({}, obj)

shallow.b.c = 999;
console.log(obj.b.c); // 999，原对象也被修改

// 深拷贝：递归复制所有层级
const deep = JSON.parse(JSON.stringify(obj));
deep.b.c = 888;
console.log(obj.b.c); // 2，原对象不受影响
```

**深拷贝实现：**

```javascript
// 方法1：JSON（简单场景，有缺陷）
const copy1 = JSON.parse(JSON.stringify(obj));
// 缺陷：undefined/function/Symbol 会丢失，循环引用报错

// 方法2：递归实现
function deepClone(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  
  // 处理循环引用
  if (map.has(obj)) return map.get(obj);
  
  const clone = Array.isArray(obj) ? [] : {};
  map.set(obj, clone);
  
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], map);
    }
  }
  return clone;
}

// 方法3：structuredClone（现代浏览器）
const copy3 = structuredClone(obj);
```

---

## 作用域与闭包

### Q4: 什么是作用域？作用域链是什么？⭐⭐

**答：**

作用域是变量和函数的可访问范围，分为：
- **全局作用域**：在整个程序中可访问
- **函数作用域**：在函数内部可访问
- **块级作用域**（ES6）：`let/const` 在 `{}` 内

```javascript
// 作用域链：查找变量时逐级向上
var a = 'global';

function outer() {
  var b = 'outer';
  
  function inner() {
    var c = 'inner';
    console.log(a); // 'global'，沿作用域链找到全局
    console.log(b); // 'outer'
    console.log(c); // 'inner'
  }
  
  inner();
}

// 块级作用域
if (true) {
  let x = 1;
  var y = 2;
}
console.log(x); // ReferenceError
console.log(y); // 2（var 没有块级作用域）
```

### Q5: 什么是闭包？应用场景？⭐⭐ 🔥

**答：**

闭包是指函数能够访问其词法作用域中的变量，即使该函数在其词法作用域之外执行。

```javascript
// 闭包示例
function counter() {
  let count = 0; // 被闭包引用，不会被垃圾回收
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

const c = counter();
c.increment(); // 1
c.increment(); // 2
c.getCount();  // 2
```

**应用场景：**

```javascript
// 1. 数据私有化
function createWallet(initial) {
  let balance = initial;
  
  return {
    deposit(amount) { balance += amount; },
    withdraw(amount) { balance -= amount; },
    getBalance() { return balance; }
  };
}

// 2. 函数柯里化
function multiply(a) {
  return function(b) {
    return a * b;
  };
}
const double = multiply(2);
double(5); // 10

// 3. 防抖节流
function debounce(fn, delay) {
  let timer = null; // 闭包保存定时器
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 4. 模块化（IIFE）
const module = (function() {
  let privateVar = 'private';
  
  return {
    getPrivate: () => privateVar
  };
})();
```

**闭包的问题：**
- 内存泄漏：闭包引用的变量不会被回收
- 解决：及时释放不需要的引用 `fn = null`

### Q6: var、let、const 的区别？⭐ 🔥

**答：**

| 特性 | `var` | `let` | `const` |
|:--|:--|:--|:--|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 有（值为 undefined） | 有（暂时性死区） | 有（暂时性死区） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 重新赋值 | 允许 | 允许 | 不允许 |
| 全局声明 | 挂载到 window | 不挂载 | 不挂载 |

```javascript
// 变量提升
console.log(a); // undefined（var 提升）
var a = 1;

console.log(b); // ReferenceError（暂时性死区）
let b = 2;

// 经典面试题
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// 输出：3 3 3

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 100);
}
// 输出：0 1 2（每次循环创建新的 j）

// const 注意
const obj = { a: 1 };
obj.a = 2;        // ✅ 允许，修改属性
obj = { b: 1 };   // ❌ 报错，不能重新赋值
```

---

## this 指向

### Q7: this 的指向规则？⭐⭐ 🔥

**答：**

| 调用方式 | this 指向 |
|:--|:--|
| `obj.fn()` | `obj` |
| `fn()` | `undefined`（严格模式）/ `window` |
| `new Fn()` | 新创建的实例 |
| `fn.call(obj)` | `obj` |
| `fn.apply(obj)` | `obj` |
| `fn.bind(obj)` | `obj` |
| 箭头函数 | 继承外层 this |

```javascript
// 1. 对象方法调用
const obj = {
  name: 'obj',
  fn() { console.log(this.name); }
};
obj.fn(); // 'obj'

// 2. 普通函数调用
function fn() { console.log(this); }
fn(); // window（非严格模式）

// 3. 构造函数
function Person(name) {
  this.name = name;
}
const p = new Person('Tom');
console.log(p.name); // 'Tom'

// 4. call/apply/bind
const ctx = { name: 'ctx' };
fn.call(ctx);    // this = ctx
fn.apply(ctx);   // this = ctx
const bound = fn.bind(ctx);
bound();         // this = ctx

// 5. 箭头函数
const arrow = {
  name: 'arrow',
  fn: () => console.log(this.name), // 外层 this（window）
  fn2() {
    return () => console.log(this.name); // 外层 this（arrow）
  }
};
arrow.fn();      // undefined
arrow.fn2()();   // 'arrow'

// 经典面试题
const person = {
  name: 'person',
  sayName: function() {
    console.log(this.name);
  }
};

const fn1 = person.sayName;
fn1(); // undefined（this 丢失）

const fn2 = person.sayName.bind(person);
fn2(); // 'person'
```

---

## 原型与继承

### Q8: 什么是原型链？⭐⭐ 🔥

**答：**

每个对象都有一个 `__proto__` 属性指向其构造函数的 `prototype`，形成链式结构。

```javascript
// 原型链图示
// 实例 --> 构造函数.prototype --> Object.prototype --> null

function Person(name) {
  this.name = name;
}
Person.prototype.sayHi = function() {
  console.log('Hi, ' + this.name);
};

const p = new Person('Tom');

p.__proto__ === Person.prototype;           // true
Person.prototype.__proto__ === Object.prototype; // true
Object.prototype.__proto__ === null;        // true

// 属性查找顺序
p.name;       // 自身属性
p.sayHi();    // 原型上的方法
p.toString(); // Object.prototype 上的方法
```

**关键概念：**

```javascript
// prototype：构造函数的原型对象
Person.prototype; // { sayHi: f, constructor: Person }

// __proto__：实例的原型引用（非标准但广泛支持）
p.__proto__; // 同 Person.prototype

// constructor：原型对象指向构造函数的引用
Person.prototype.constructor === Person; // true

// Object.getPrototypeOf（标准方法）
Object.getPrototypeOf(p) === Person.prototype; // true
```

### Q9: JavaScript 继承的几种方式？⭐⭐⭐

**答：**

```javascript
// 1. 原型链继承（缺陷：引用类型共享）
function Parent() {
  this.hobbies = ['reading'];
}
function Child() {}
Child.prototype = new Parent();

// 2. 构造函数继承（缺陷：无法继承原型方法）
function Parent(name) {
  this.name = name;
}
function Child(name) {
  Parent.call(this, name);
}

// 3. 组合继承（常用）
function Parent(name) {
  this.name = name;
}
Parent.prototype.sayName = function() {
  console.log(this.name);
};
function Child(name, age) {
  Parent.call(this, name); // 继承实例属性
  this.age = age;
}
Child.prototype = new Parent(); // 继承原型方法
Child.prototype.constructor = Child;

// 4. 寄生组合继承（最佳方案）
function inheritPrototype(Child, Parent) {
  const prototype = Object.create(Parent.prototype);
  prototype.constructor = Child;
  Child.prototype = prototype;
}
function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}
inheritPrototype(Child, Parent);

// 5. ES6 Class（推荐）
class Parent {
  constructor(name) {
    this.name = name;
  }
  sayName() {
    console.log(this.name);
  }
}
class Child extends Parent {
  constructor(name, age) {
    super(name); // 必须先调用 super
    this.age = age;
  }
}
```

### Q10: instanceof 的原理？如何实现？⭐⭐

**答：**

```javascript
// instanceof 检测构造函数的 prototype 是否出现在对象的原型链上
[] instanceof Array;    // true
[] instanceof Object;   // true（原型链上）

// 手动实现
function myInstanceof(obj, Constructor) {
  let proto = Object.getPrototypeOf(obj);
  const prototype = Constructor.prototype;
  
  while (proto !== null) {
    if (proto === prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}

myInstanceof([], Array);  // true
myInstanceof([], Object); // true
myInstanceof({}, Array);  // false
```

---

## ES6+ 新特性

### Q11: ES6 有哪些新特性？⭐ 🔥

**答：**

```javascript
// 1. let/const 块级作用域
let x = 1;
const y = 2;

// 2. 解构赋值
const { name, age } = person;
const [first, ...rest] = array;

// 3. 模板字符串
const str = `Hello, ${name}!`;

// 4. 箭头函数
const fn = (a, b) => a + b;

// 5. 默认参数
function greet(name = 'World') {}

// 6. 展开运算符
const arr = [...arr1, ...arr2];
const obj = { ...obj1, ...obj2 };

// 7. Promise
Promise.resolve(1).then(v => console.log(v));

// 8. async/await
async function fetchData() {
  const res = await fetch(url);
  return res.json();
}

// 9. Class
class Person {
  constructor(name) { this.name = name; }
  sayHi() { console.log(`Hi, ${this.name}`); }
}

// 10. Module
import { foo } from './module';
export const bar = 1;

// 11. Symbol
const id = Symbol('id');

// 12. Map/Set
const map = new Map([['key', 'value']]);
const set = new Set([1, 2, 3]);

// 13. Proxy/Reflect
const proxy = new Proxy(target, {
  get(target, prop) { return Reflect.get(target, prop); }
});

// 14. 可选链 (ES2020)
const city = user?.address?.city;

// 15. 空值合并 (ES2020)
const value = input ?? 'default';
```

### Q12: Map 和 Object 的区别？⭐⭐

**答：**

| 特性 | `Map` | `Object` |
|:--|:--|:--|
| 键类型 | 任意值 | 字符串/Symbol |
| 键顺序 | 插入顺序 | 不保证 |
| 大小 | `size` 属性 | 需手动计算 |
| 迭代 | 可迭代 | 需 `Object.keys()` |
| 性能 | 频繁增删更优 | 少量数据更优 |

```javascript
// Map 操作
const map = new Map();
map.set('key', 'value');
map.set(1, 'number key');
map.set({}, 'object key'); // 对象作为键

map.get('key');      // 'value'
map.has('key');      // true
map.delete('key');   // true
map.size;            // 2

// 遍历
map.forEach((v, k) => console.log(k, v));
for (const [k, v] of map) { }

// 转换
const arr = [...map];           // Map -> Array
const obj = Object.fromEntries(map); // Map -> Object
const map2 = new Map(Object.entries(obj)); // Object -> Map
```

### Q13: Proxy 和 Object.defineProperty 的区别？⭐⭐⭐ 🔥

**答：**

| 特性 | `Object.defineProperty` | `Proxy` |
|:--|:--|:--|
| 监听粒度 | 单个属性 | 整个对象 |
| 数组支持 | 需重写方法 | 原生支持 |
| 新增属性 | 无法监听 | 可以监听 |
| 删除属性 | 无法监听 | 可以监听 |
| 性能 | 初始化递归 | 惰性代理 |

```javascript
// Object.defineProperty（Vue 2）
function defineReactive(obj, key, val) {
  Object.defineProperty(obj, key, {
    get() { return val; },
    set(newVal) { val = newVal; }
  });
}
// 缺陷：无法监听 obj.newKey = value

// Proxy（Vue 3）
const proxy = new Proxy(target, {
  get(target, key, receiver) {
    track(target, key); // 依赖收集
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    trigger(target, key); // 触发更新
    return Reflect.set(target, key, value, receiver);
  },
  deleteProperty(target, key) {
    trigger(target, key);
    return Reflect.deleteProperty(target, key);
  }
});
// 优势：可以监听所有操作
```

---

## 复习卡片

| 知识点 | 关键记忆 |
|:--|:--|
| 数据类型 | 7 种基本 + 1 种引用 |
| 闭包 | 函数 + 词法作用域，用于数据私有化 |
| this | 调用时决定，箭头函数继承外层 |
| 原型链 | `__proto__` 链式查找，终于 `null` |
| 继承 | ES6 `class extends` 最简洁 |
| var/let/const | 块级作用域 + 暂时性死区 |
| Map vs Object | Map 键可为任意类型，性能更好 |
| Proxy | 可监听整个对象，Vue3 响应式基础 |

> [!TIP]
> 下一篇：[JS 异步与事件循环](/blog/posts/interview-guide-03-javascript-async/)
> 
> 涵盖 Event Loop、宏任务微任务、Promise、async/await 等核心知识点。
