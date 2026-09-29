---
title: '11 · 工程实战与常见坑'
published: 2026-09-30T17:00:00+08:00
description: '真实项目里 React 最常见的坑与对策：key 错用、useEffect 竞态、无限重渲染、状态不该放 state、过度使用 Context、StrictMode 双调用困惑，以及一份可落地的工程检查清单。'
tags: [React, 常见坑, StrictMode, 无限重渲染, 工程实战]
category: React学习路线
draft: false
---

## 这些年我排过的雷

### 1. 无限重渲染

```jsx
const [cfg, setCfg] = useState({});
useEffect(() => {
  setCfg(loadCfg()); // 每次渲染都 set 新对象 → 又触发渲染 → 死循环
}, []);
```

修复：依赖写全、或把"非响应式"的初始化放 `useState(() => loadCfg())`，不在 effect 里无条件 set。

### 2. 该派生就不存 state

```jsx
const [fullName, setFullName] = useState(""); // ❌ 多余
// ✅ 直接派生
const fullName = `${first} ${last}`;
```

存储可派生的数据，状态一多就难同步、易错。

### 3. 过度使用 Context

把"用户、主题、语言、布局"全塞一个 Context，任一处变化全部消费者重渲染。拆成多个细粒度 Context，或用状态库按需订阅。

### 4. StrictMode 双调用困惑

开发模式下 `StrictMode` 会**故意双调用**渲染、effect（挂载→卸载→再挂载）以暴露副作用泄漏。看到"请求发两次"先确认是不是它，清理函数写对就不会有问题。

---

## 工程检查清单

- [ ] 列表 key 用稳定 id，非 index。
- [ ] `useEffect` 依赖数组写全，清理函数齐全。
- [ ] 派生数据不进 state。
- [ ] `memo/useMemo/useCallback` 按测量结论加，不滥用。
- [ ] 长列表虚拟滚动；首屏代码分割。
- [ ] 全局状态先评估是否真需要库。

---

## 小结

- 无限循环多因"effect 里无条件 setState + 依赖不全"。
- 能派生的不存 state；Context 拆细，避免广播重渲染。
- StrictMode 双调用是帮你找 bug，清理写对即可。
- 性能靠测量，不靠感觉；清单化自查更稳。

---

## 练习

1. 故意制造一个无限重渲染，用 Profiler 看调用栈，再用正确依赖修复。
2. 把一个"全量 Context"拆成 `UserContext` + `ThemeContext`，验证只改主题时用户组件不重渲染。
3. 列出你当前项目里"可派生却存了 state"的地方并改造。
