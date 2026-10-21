---
title: '14 · 与框架/运行时集成实战'
published: 2026-09-28T10:00:00+08:00
description: 'TypeScript 在真实项目中的落地：React + TS（props 与事件类型、泛型组件、Hooks 类型）、Vue 3 + TS（defineComponent、ref/reactive、组合式 API 类型）、Node + TS（类型化 req/res、tsx 运行），以及常见坑与最佳实践清单。'
tags: [TypeScript, React, Vue3, Node, 框架集成, 类型安全]
category: TypeScript学习路线
draft: false
---

> [!NOTE]
> 终点站：把前面学的全部用进真实框架。本篇给 React / Vue 3 / Node 三套最常见的 TS 集成范式，以及那些"文档不会明说"的坑。

---

## 1. React + TypeScript

### 组件 props
```tsx
interface ButtonProps {
  label: string;
  disabled?: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
function Button({ label, disabled, onClick }: ButtonProps) {
  return <button disabled={disabled} onClick={onClick}>{label}</button>;
}
```

### 泛型组件
```tsx
function List<T>({ items, render }: { items: T[]; render: (it: T) => React.ReactNode }) {
  return <>{items.map(render)}</>;
}
```

### Hooks 类型
```ts
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);
useEffect(() => { /* deps 类型由数组推断 */ }, [count]);
```

要点：事件参数用 `React.ChangeEvent<HTMLInputElement>` 等精确类型；`ref` 用 `useRef<HTMLDivElement>(null)`。

---

## 2. Vue 3 + TypeScript

### defineComponent + setup
```ts
import { defineComponent, ref, reactive } from "vue";

export default defineComponent({
  props: {
    title: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  setup(props) {
    const name = ref<string>("");      // Ref<string>
    const state = reactive({ n: 0 });  // 深层响应式
    return { name, state };
  },
});
```

### `<script setup lang="ts">`（推荐写法）
```vue
<script setup lang="ts">
interface Props { id: number }
const props = defineProps<Props>();
const emit = defineEmits<{ (e: "change", v: number): void }>();

const list = ref<number[]>([]); // 显式给 ref 泛型
</script>
```

Vue 3 对 TS 支持很好：`ref<T>` 推断值类型、`reactive` 推断对象、`defineProps`/`defineEmits` 直接吃泛型。

---

## 3. Node + TypeScript

### 后端路由类型化
```ts
import express, { Request, Response } from "express";
const app = express();
app.get("/user/:id", (req: Request, res: Response) => {
  const id = req.params.id; // string
  res.json({ id });
});
```

### 直接运行
```bash
npm install -D tsx
npx tsx src/server.ts   # 免编译直接跑
```
生产构建仍用 `tsc` 或打包器产出 JS 再 `node dist/server.js`。

---

## 4. 常见坑

1. **类型与运行时不匹配**：`as` 断言骗过编译器，但运行时不保证。例：`JSON.parse` 返回 `any`，要手动收窄成具体类型。
2. **第三方库 any**：遇到无类型库，先找 `@types`；没有就写 `.d.ts`（第 12 篇），别全局 `any` 污染。
3. **ref 解包**：Vue 模板里 `ref` 自动解包，但 TS 里 `.value` 才是值，别混。
4. **event 默认 any**：React 老写法 `onClick={(e) => ...}` 不标类型时 `e` 是 `any`（若关了 `noImplicitAny`），务必标 `React.ChangeEvent<...>`。
5. **枚举 vs 联合**：库/跨端（如 Vue 模板）里枚举编译后会变对象，模板里访问要注意；新增代码优先字面量联合。

---

## 5. 最佳实践清单

- ✅ 全程 `strict`，别留 `any` 死角（用 `unknown` + 守卫替代 `any`）。
- ✅ 组件 props、函数参数、导出结构显式注解；局部变量交给推断。
- ✅ 用 `import type` 隔离类型导入，配合 `isolatedModules` 安全。
- ✅ 类型从数据来：先定 `interface`，再写实现，类型即文档。
- ✅ 类型检查与打包分离：`tsc --noEmit` + Vite/webpack。
- ❌ 别为了"过编译"滥用 `as any`，那是埋雷。
- ❌ 别手写 `.d.ts` 维护自己库的类型，用 `declaration` 自动生成。

---

## 6. 路线收官

走到这里，你已经具备：

- 用 TS 描述任意数据结构（接口/泛型/工具类型）；
- 用类型守卫与可辨识联合写出安全的分支逻辑；
- 用 tsconfig 与工程化手段管理真实项目；
- 把类型系统落地到 React/Vue/Node。

类型系统的终点不是"写更复杂的类型"，而是**用刚好够的类型，让 bug 在编译期现形、让代码自我说明**。继续在真实项目里打磨手感即可。

---

## 小结

- React：props 用 `interface`，事件用 `React.*Event`，泛型组件 `function C<T>(...)`.
- Vue 3：`<script setup lang="ts">` + `ref<T>` + `defineProps<T>()`。
- Node：路由参数/响应用 `Request/Response` 类型，`tsx` 直接跑。
- 通用坑：类型≠运行时、第三方库补类型、别滥用 `as any`。
- 原则：strict 全程开，类型从数据来，类型检查与打包分离。

---

## 练习

1. 写一个带 `interface ButtonProps` 的 React 按钮组件，处理 `onClick` 的 `MouseEvent` 类型。
2. 用 Vue `<script setup lang="ts">` 写计数器：`ref<number>` + `defineProps` + `defineEmits`。
3. 用 Express + TS 写 `/api/users` 返回 `User[]`，给 `res.json` 传类型化数据。
4. 审查你现有项目，找出三处可用 `unknown`+守卫替换 `any` 的地方。
