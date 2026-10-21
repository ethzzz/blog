---
title: '02 · Props 与 State'
published: 2026-09-29T23:30:00+08:00
description: '区分 props（父传子、只读）与 state（组件内部可变状态）；状态提升让兄弟组件共享数据；受控与非受控组件的区别与取舍。'
tags: [React, props, state, 状态提升, 受控组件]
category: React学习路线
draft: false
---

## 一句话区分

- **props**：父组件传下来的数据，**只读**，子组件不能改。相当于函数的参数。
- **state**：组件自己管理的可变数据，**能改**，改了就重渲染。相当于函数的局部变量。

---

## 改 state 必须用 setter

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  // count = count + 1; // ❌ 直接改不会触发渲染
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

`setCount` 会安排一次重渲染，并用新值替换旧值。React 状态**不可变**——永远生成新对象，别原地改。

---

## 状态提升

当两个兄弟组件需要共享数据时，把 state 提到**最近的共同父组件**：

```jsx
function Parent() {
  const [value, setValue] = useState("");
  return (
    <>
      <Input value={value} onChange={setValue} />
      <Preview value={value} />
    </>
  );
}
```

这是 React "单向数据流" 的体现：数据向上集中、向下流动。

---

## 受控 vs 非受控

- **受控组件**：表单值由 React state 控制（`value` + `onChange`），实时同步，便于校验。
- **非受控组件**：用 `ref` 在需要时读取 DOM 值，适合简单表单或集成非 React 代码。

```jsx
// 受控
<input value={value} onChange={e => setValue(e.target.value)} />
// 非受控
<input ref={inputRef} defaultValue="初始" />
```

多数场景用受控，数据流向清晰、可预测。

---

## 小结

- props 只读向下传，state 可变自己管。
- 改 state 用 setter，状态不可变。
- 共享状态提升到共同父级。
- 表单优先受控组件。

---

## 练习

1. 写一个温度转换器：摄氏输入框变，华氏框实时更新（用状态提升共享值）。
2. 把上面的输入框改成"非受控"，用 ref 在按钮点击时读值。
3. 解释为什么 React 强调状态不可变（对比 `arr.push` vs `[...arr, x]`）。
