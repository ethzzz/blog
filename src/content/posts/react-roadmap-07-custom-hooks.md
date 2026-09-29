---
title: '07 · 自定义 Hook'
published: 2026-09-30T13:00:00+08:00
description: '自定义 Hook 是 React 逻辑复用的正统方式：把状态逻辑抽成以 use 开头的函数，组件间共享行为而非复制代码。用一个 useFetch 实战讲透封装与返回约定。'
tags: [React, 自定义Hook, 逻辑复用, useFetch]
category: React学习路线
draft: false
---

## 为什么需要自定义 Hook

当多个组件出现"相同的 state + effect 逻辑"（如"请求数据并显示 loading"），复制粘贴会散落 bug。自定义 Hook 把这段逻辑收口到一个函数里，**复用的是行为，不是 UI**。

---

## 命名与形态

- 必须以 `use` 开头（让 React 识别这是 Hook，并套用 Hooks 规则）。
- 内部可以调用其他 Hook。
- 返回一个对象/数组，把状态和操作交还组件。

---

## 实战：useFetch

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(d => !cancelled && setData(d))
      .catch(e => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; }; // 卸载/url 变化取消，避免竞态
  }, [url]);

  return { data, loading, error };
}
// 使用
const { data, loading } = useFetch("/api/user");
```

注意 `cancelled` 标志：URL 变化或组件卸载后，旧请求的结果不再写入 state，防止竞态与内存泄漏。

---

## 复用契约

- **输入**：参数（如 url、配置）。
- **输出**：稳定结构（建议返回对象，未来加字段不破坏调用方）。
- **副作用**：在内部 `useEffect` 管理，调用方无感知。

---

## 小结

- 自定义 Hook 以 `use` 开头，复用"逻辑"而非 UI。
- 把 state+effect 收口，组件只消费结果。
- 注意竞态取消（`cancelled` 标志）与清理。
- 返回对象比数组更易扩展。

---

## 练习

1. 写一个 `useLocalStorage(key, initial)`：状态与 localStorage 双向同步。
2. 写一个 `useDebounce(value, delay)`：返回防抖后的值（结合 useEffect + setTimeout）。
3. 给 `useFetch` 加一个 `refetch()` 手动刷新方法，扩展返回结构。
