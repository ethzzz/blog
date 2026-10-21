---
title: '03 · 事件与表单'
published: 2026-09-29T23:45:00+08:00
description: 'React 合成事件机制、事件绑定的几种写法与 this 陷阱、受控表单的批量处理、多字段表单的状态组织方式。'
tags: [React, 事件, 表单, 合成事件, onChange]
category: React学习路线
draft: false
---

## 合成事件

React 把浏览器原生事件包成**合成事件（SyntheticEvent）**，抹平浏览器差异，且事件委托到根节点。你拿到的 `e` 是跨浏览器的统一对象，`e.preventDefault()` / `e.stopPropagation()` 都能用。

```jsx
function handleClick(e) {
  e.preventDefault();
  console.log(e.target.value);
}
<button onClick={handleClick}>点我</button>
```

---

## 绑定写法的坑

- **内联箭头**：`onClick={() => doSomething(id)}` —— 每次渲染新建函数，简单安全。
- **类组件里的 this**：函数不会自动绑定 `this`，要用 `this.handle = this.handle.bind(this)` 或类字段箭头函数，否则 `this` 是 `undefined`。

函数组件没有 `this` 问题，这也是它更推荐的原因。

---

## 受控表单批量处理

多个输入框时，别一个字段一个 `useState`，用一个对象 state + 统一 handler：

```jsx
const [form, setForm] = useState({ name: "", email: "" });
function update(e) {
  const { name, value } = e.target;
  setForm(prev => ({ ...prev, [name]: value }));
}
<input name="name" value={form.name} onChange={update} />
<input name="email" value={form.email} onChange={update} />
```

`[name]: value` 动态键，一个 handler 通吃所有字段。

---

## 常见陷阱

- **忘了 `value` 要受控**：只写 `value` 不写 `onChange` 会警告且不可输入——要么都给，要么用 `defaultValue`（非受控）。
- **checkbox 用 `checked` 而非 `value`**：`e.target.checked` 才是布尔值。
- **`onChange` 含义不同**：React 的 `onChange` 在每次输入都触发（不像原生只在失焦），所以实时同步无压力。

---

## 小结

- React 用合成事件统一浏览器差异。
- 函数组件用内联箭头或 `useCallback` 绑定，无 `this` 烦恼。
- 多字段表单用一个对象 state + 动态键 handler。
- 受控组件 `value` 与 `onChange` 成对出现。

---

## 练习

1. 写一个登录表单（用户名/密码），提交时 `preventDefault` 并打印（用对象 state 统一管理）。
2. 处理一个 checkbox 组，收集所有选中项到数组 state。
3. 解释 React `onChange` 与原生 `change` 事件触发时机差异。
