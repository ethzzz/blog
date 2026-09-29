---
title: '10 · 路由与数据请求'
published: 2026-09-30T16:00:00+08:00
description: 'React Router 的声明式路由与动态参数，客户端数据请求的两种范式：自己用 useEffect+fetch，或用 SWR/React Query 获得缓存、重试、焦点刷新等能力。'
tags: [React, ReactRouter, SWR, ReactQuery, 数据请求]
category: React学习路线
draft: false
---

## 路由：把 URL 当状态

React Router 用声明式路由映射 URL ↔ 组件：

```jsx
<Routes>
  <Route path="/users/:id" element={<UserDetail />} />
  <Route path="*" element={<NotFound />} />
</Routes>
// 组件内取参数
const { id } = useParams();
```

路由本质是"把应用状态的一部分外化到 URL"，刷新/分享链接都能还原页面，对 SEO 和可分享性至关重要。

---

## 自己请求数据

```jsx
function UserDetail() {
  const { id } = useParams();
  const { data, loading } = useFetch(`/api/users/${id}`); // 第07篇的 useFetch
  if (loading) return <Spinner />;
  return <Profile user={data} />;
}
```

够用，但缓存、去重、重试、竞态都要自己写。

---

## SWR / React Query：专业数据层

```jsx
import useSWR from "swr";
const { data, error, isLoading } = useSWR(`/api/users/${id}`, fetcher);
```

SWR（Stale-While-Revalidate）自动：缓存响应、标签页聚焦时重新验证、请求去重、失败重试。React Query 更重，支持 mutations、无限加载、离线缓存。

> 经验：项目一旦有"多个地方用同一份数据、需要自动刷新"的需求，直接用 React Query，别自己造轮子。

---

## 小结

- React Router 把 URL 当共享状态，可还原、可分享。
- 简单请求 `useEffect+fetch` 够用。
- 多组件共享数据、需缓存/重试/聚焦刷新 → SWR / React Query。
- 数据层库解决的是"重复造缓存/竞态/去重的轮子"问题。

---

## 练习

1. 用 React Router 搭一个含 `/` 列表页和 `/items/:id` 详情页的小应用。
2. 用 `useSWR` 替换手写 `useFetch`，对比是否自动处理了重复请求。
3. 给详情页加"焦点回到标签页时自动刷新"（SWR 的 `focusThrottleInterval` / 默认行为）。
