---
title: '11 · 错误处理与调试'
published: 2026-09-29T21:00:00+08:00
description: 'JS 的错误类型体系、try/catch/finally 的正确用法、throw 自定义错误、Error 边界与异步错误捕获（Promise/await），以及用 DevTools 定位问题的实战方法。'
tags: [JavaScript, 错误处理, try-catch, 调试, DevTools]
category: JavaScript学习路线
draft: false
---

## 错误也是代码的一部分

早年我习惯"能跑就行"，结果线上一个未捕获异常整页白屏。错误处理的本质：**在预期会失败的地方，给程序一条退路**。

---

## 错误类型

- `Error`：基类，自定义错误继承它。
- `TypeError`：类型不对（如 `null.foo`）。
- `ReferenceError`：访问未声明变量。
- `RangeError`：数值越界（如递归爆栈）。
- `SyntaxError`：解析阶段就报错（不会被 try/catch 捕获）。

---

## try/catch/finally

```js
try {
  const data = JSON.parse(input); // 可能抛 SyntaxError
} catch (e) {
  if (e instanceof SyntaxError) {
    console.error("格式错误", e.message);
  } else {
    throw e; // 不认识的往上抛
  }
} finally {
  cleanup(); // 无论成功失败都执行（关闭连接、释放资源）
}
```

> `catch` 里别吞掉错误——至少打日志，或重新 `throw`。静默失败最可怕。

---

## 异步错误捕获

```js
// Promise
fetch(url).then(r => r.json()).catch(err => handle(err));

// async/await：用 try/catch 包住
async function load() {
  try {
    const r = await fetch(url);
    return await r.json();
  } catch (e) {
    report(e);
    throw e;
  }
}
```

注意：`window.onerror` / `unhandledrejection` 可兜住全局未捕获错误，用于监控上报。

---

## 调试实战

- **断点**：Sources 面板在可疑行点断点，看调用栈和变量。
- **条件断点**：右键断点加条件，只在特定值时停。
- **console 技巧**：`console.table` 看数组、`console.dir` 看对象结构。
- **Network**：看请求状态、响应、Timing 定位慢请求。

---

## 小结

- 错误分类型，自定义错误继承 `Error`。
- `catch` 别吞错，要么处理要么重抛；`finally` 做清理。
- 异步用 `.catch` / `try-catch` 包 `await`；全局兜底用 `onerror` / `unhandledrejection`。
- 调试靠断点 + 调用栈 + Network，比 `console.log` 高效。

---

## 练习

1. 写 `parseSafe(json, fallback)`，解析失败返回 fallback 并打印错误类型。
2. 用 `async/await` + `try/catch` 改写一段 `.then().catch()` 链式。
3. 给页面加 `window.addEventListener('unhandledrejection', ...)` 上报未捕获 Promise 错误。
