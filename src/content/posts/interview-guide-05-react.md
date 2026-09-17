---
title: 'React 框架面试题（中高级）'
published: 2026-09-15T15:00:00+08:00
description: '深入讲解 React Fiber、Hooks、JSX、虚拟 DOM、状态管理、性能优化等高频面试题。'
tags: [前端面试, React, Hooks, Fiber, 性能优化]
category: 前端面试宝典
draft: false
---

> [!NOTE]
> 本文包含 30+ 道 React 框架面试题，难度标注：⭐ 基础 · ⭐⭐ 进阶 · ⭐⭐⭐ 高级 · 🔥 高频必考

---

## React 基础

### Q1: React 的核心思想是什么？⭐

**答：**

1. **声明式编程**：UI = f(state)，状态驱动视图
2. **组件化**：将 UI 拆分为独立、可复用的组件
3. **单向数据流**：数据从父组件流向子组件
4. **虚拟 DOM**：高效更新真实 DOM
5. **跨平台**：React Native、React DOM、React Canvas

```jsx
// 声明式
function Counter({ initialCount }) {
  const [count, setCount] = useState(initialCount);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}

// 命令式（jQuery 风格）
$('#btn').click(function() {
  count++;
  $('#count').text('Count: ' + count);
});
```

### Q2: JSX 是什么？为什么要使用？⭐

**答：**

JSX 是 JavaScript 的语法扩展，允许在 JS 中编写 HTML 结构。

```jsx
// JSX
const element = <h1 className="title">Hello, World!</h1>;

// 编译后
const element = React.createElement(
  'h1',
  { className: 'title' },
  'Hello, World!'
);

// 最终生成虚拟 DOM 对象
{
  type: 'h1',
  props: {
    className: 'title',
    children: 'Hello, World!'
  }
}
```

**JSX 的优势：**
- 结构清晰，接近 HTML
- 编译时检查，减少错误
- 性能更好（编译优化）

---

## Fiber 架构

### Q3: 什么是 Fiber？为什么需要 Fiber？⭐⭐⭐ 🔥

**答：**

Fiber 是 React 16 引入的新协调引擎，核心目标是**增量渲染**。

**问题背景：**
- React 15 的 Stack Reconciler 是同步递归的
- 大组件树更新时会阻塞主线程，导致掉帧

**Fiber 的解决方案：**

```
React 15 (Stack Reconciler)     React 16+ (Fiber)
┌─────────────────────┐        ┌─────────────────────┐
│    同步递归更新      │        │   可中断的异步更新   │
│    (不可中断)       │        │   (时间切片)        │
│                     │        │                     │
│   ██████████████    │        │   ███ ███ ███ ███   │
│   (长时间阻塞)      │        │   (分片执行)        │
└─────────────────────┘        └─────────────────────┘
```

**Fiber 节点结构：**

```javascript
const fiber = {
  // 节点类型
  type: 'div',
  key: null,
  
  // 链表结构
  return: parentFiber,    // 父节点
  child: firstChildFiber, // 第一个子节点
  sibling: nextFiber,     // 下一个兄弟节点
  
  // 状态
  pendingProps: {},       // 新 props
  memoizedProps: {},      // 上次 props
  memoizedState: {},      // 上次 state
  
  // 副作用
  flags: 0,               // 副作用标记（增删改）
  subtreeFlags: 0,        // 子树的副作用
  
  // 优先级
  lane: 0,                // 更新优先级
};
```

**时间切片原理：**

```javascript
// 简化实现
function workLoop(deadline) {
  let shouldYield = false;
  
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1; // 剩余时间不足 1ms
  }
  
  if (!nextUnitOfWork && workInProgressRoot) {
    commitRoot(); // 提交阶段
  }
  
  requestIdleCallback(workLoop); // 继续调度
}

requestIdleCallback(workLoop);
```

---

## Hooks

### Q4: 常用 Hooks 有哪些？⭐ 🔥

**答：**

```jsx
import {
  useState,      // 状态管理
  useEffect,     // 副作用
  useContext,    // 上下文
  useRef,        // DOM/变量引用
  useCallback,   // 函数缓存
  useMemo,       // 计算缓存
  useReducer,    // 复杂状态
  useLayoutEffect, // 同步副作用
  useImperativeHandle, // 暴露方法
} from 'react';

// 1. useState
const [count, setCount] = useState(0);
const [user, setUser] = useState({ name: '', age: 0 });

// 2. useEffect
useEffect(() => {
  // 副作用逻辑
  const timer = setInterval(() => {}, 1000);
  
  return () => {
    // 清理函数
    clearInterval(timer);
  };
}, [dependency]); // 依赖数组

// 3. useContext
const theme = useContext(ThemeContext);

// 4. useRef
const inputRef = useRef(null);
<input ref={inputRef} />;
inputRef.current.focus();

// 5. useCallback
const memoizedCallback = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// 6. useMemo
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// 7. useReducer
const [state, dispatch] = useReducer(reducer, initialState);
dispatch({ type: 'increment' });
```

### Q5: useEffect 和 useLayoutEffect 的区别？⭐⭐

**答：**

| 特性 | `useEffect` | `useLayoutEffect` |
|:--|:--|:--|
| 执行时机 | 浏览器绘制**后** | DOM 更新**后**，绘制**前** |
| 阻塞 | 异步，不阻塞 | 同步，阻塞绘制 |
| 使用场景 | 大多数副作用 | 需要读取/修改 DOM 布局 |

```jsx
// useEffect：不阻塞渲染
useEffect(() => {
  console.log('useEffect'); // 绘制后执行
}, []);

// useLayoutEffect：阻塞渲染
useLayoutEffect(() => {
  console.log('useLayoutEffect'); // 绘制前执行
  // 适合需要同步测量的场景
  const rect = divRef.current.getBoundingClientRect();
}, []);

// 执行顺序
// render -> useLayoutEffect -> 浏览器绘制 -> useEffect
```

**使用场景：**

```jsx
// useLayoutEffect：避免闪烁
function Tooltip({ target }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef(null);
  
  useLayoutEffect(() => {
    // 在绘制前计算位置，避免闪烁
    const rect = target.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 8,
      left: rect.left
    });
  }, [target]);
  
  return <div ref={tooltipRef} style={position}>...</div>;
}
```

### Q6: useCallback 和 useMemo 的区别？⭐⭐ 🔥

**答：**

```jsx
// useCallback：缓存函数
const memoizedFn = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// useMemo：缓存计算结果
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);

// 等价关系
useCallback(fn, deps) === useMemo(() => fn, deps)
```

**使用场景：**

```jsx
// useCallback：避免子组件不必要的重渲染
const Parent = () => {
  const [count, setCount] = useState(0);
  
  // ❌ 每次渲染都创建新函数，子组件会重渲染
  const handleClick = () => console.log('clicked');
  
  // ✅ 缓存函数引用
  const handleClickMemo = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <Child onClick={handleClickMemo} />;
};

const Child = React.memo(({ onClick }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click</button>;
});

// useMemo：缓存昂贵计算
const ExpensiveComponent = ({ items }) => {
  // ❌ 每次渲染都重新计算
  const sorted = items.sort((a, b) => a.price - b.price);
  
  // ✅ 只在 items 变化时计算
  const sortedMemo = useMemo(() => {
    return [...items].sort((a, b) => a.price - b.price);
  }, [items]);
  
  return <List items={sortedMemo} />;
};
```

### Q7: useRef 的用途？⭐⭐

**答：**

```jsx
// 1. 获取 DOM 元素
function InputFocus() {
  const inputRef = useRef(null);
  
  const focusInput = () => {
    inputRef.current.focus();
  };
  
  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>Focus</button>
    </>
  );
}

// 2. 保存可变值（不触发重渲染）
function Timer() {
  const [count, setCount] = useState(0);
  const intervalRef = useRef(null);
  
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    
    return () => clearInterval(intervalRef.current);
  }, []);
  
  const stop = () => clearInterval(intervalRef.current);
  
  return <div>{count}</div>;
}

// 3. 保存上一次的值
function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

// 使用
const prevCount = usePrevious(count);
```

---

## 组件设计

### Q8: 受控组件和非受控组件？⭐⭐ 🔥

**答：**

| 类型 | 数据来源 | 更新方式 |
|:--|:--|:--|
| 受控组件 | React state | setState |
| 非受控组件 | DOM | ref |

```jsx
// 受控组件（推荐）
function ControlledForm() {
  const [value, setValue] = useState('');
  
  const handleChange = (e) => {
    setValue(e.target.value);
  };
  
  return (
    <input 
      value={value} 
      onChange={handleChange} 
    />
  );
}

// 非受控组件
function UncontrolledForm() {
  const inputRef = useRef(null);
  
  const handleSubmit = () => {
    console.log(inputRef.current.value);
  };
  
  return (
    <>
      <input ref={inputRef} defaultValue="" />
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}
```

### Q9: React 组件通信方式？⭐⭐ 🔥

**答：**

```jsx
// 1. props（父 -> 子）
<Child name="Tom" age={18} />

// 2. 回调函数（子 -> 父）
// 父组件
<Child onUpdate={(data) => setParentData(data)} />
// 子组件
props.onUpdate(newData);

// 3. Context（跨层级）
const ThemeContext = createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <DeepChild />
    </ThemeContext.Provider>
  );
}

function DeepChild() {
  const theme = useContext(ThemeContext);
  return <div>{theme}</div>;
}

// 4. ref（父调子方法）
const childRef = useRef();
<Child ref={childRef} />
childRef.current.someMethod();

// 5. 状态管理库（Redux/Zustand/Jotai）
// 全局状态共享
```

### Q10: React.memo、PureComponent 的区别？⭐⭐

**答：**

```jsx
// React.memo：函数组件的浅比较优化
const MemoizedComponent = React.memo(function MyComponent(props) {
  console.log('rendered');
  return <div>{props.name}</div>;
});

// 自定义比较函数
const MemoizedWithCompare = React.memo(
  MyComponent,
  (prevProps, nextProps) => {
    return prevProps.id === nextProps.id; // true 不重渲染
  }
);

// PureComponent：类组件的浅比较优化
class MyComponent extends React.PureComponent {
  render() {
    return <div>{this.props.name}</div>;
  }
}

// 区别
// React.memo -> 函数组件
// PureComponent -> 类组件
// 都是浅比较 props（和 state）
```

---

## 状态管理

### Q11: Redux 的工作原理？⭐⭐

**答：**

```javascript
// Redux 三大原则
// 1. 单一数据源（Store）
// 2. State 只读（通过 Action 修改）
// 3. 纯函数修改（Reducer）

// 数据流
// View -> Action -> Reducer -> Store -> View

// Action
const increment = () => ({ type: 'INCREMENT' });

// Reducer
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    default:
      return state;
  }
}

// Store
const store = createStore(counterReducer);

// 使用
store.dispatch(increment());
store.subscribe(() => {
  console.log(store.getState());
});
```

### Q12: Redux、MobX、Zustand 的区别？⭐⭐

**答：**

| 特性 | Redux | MobX | Zustand |
|:--|:--|:--|:--|
| 数据流 | 单向 | 双向 | 单向 |
| 学习曲线 | 陡峭 | 中等 | 简单 |
| 代码量 | 多 | 少 | 少 |
| 性能 | 好 | 好（细粒度） | 好 |
| TypeScript | 支持 | 支持 | 优秀 |
| 体积 | ~7KB | ~15KB | ~1KB |

```javascript
// Zustand 示例（简洁）
import { create } from 'zustand';

const useCounterStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}));

// 使用
function Counter() {
  const { count, increment } = useCounterStore();
  return <button onClick={increment}>{count}</button>;
}
```

---

## 性能优化

### Q13: React 性能优化手段？⭐⭐ 🔥

**答：**

```jsx
// 1. React.memo 避免不必要渲染
const Child = React.memo(({ data }) => {
  console.log('Child rendered');
  return <div>{data}</div>;
});

// 2. useCallback 缓存函数
const Parent = () => {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);
  
  return <Child onClick={handleClick} />;
};

// 3. useMemo 缓存计算
const ExpensiveList = ({ items }) => {
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.value - b.value);
  }, [items]);
  
  return <List items={sortedItems} />;
};

// 4. 列表使用 key
{items.map(item => (
  <Item key={item.id} data={item} />
))}

// 5. 懒加载组件
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>

// 6. 虚拟列表（长列表）
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={10000}
  itemSize={35}
>
  {({ index, style }) => (
    <div style={style}>Row {index}</div>
  )}
</FixedSizeList>

// 7. 避免内联对象/函数
// ❌ 每次渲染创建新对象
<Child style={{ color: 'red' }} onClick={() => {}} />

// ✅ 提取到外部或 useMemo
const style = useMemo(() => ({ color: 'red' }), []);
<Child style={style} />

// 8. 状态提升 vs 下沉
// 只在需要的组件维护状态，避免不必要的重渲染
```

---

## 复习卡片

| 知识点 | 关键记忆 |
|:--|:--|
| Fiber | 可中断渲染，时间切片，优先级调度 |
| Hooks 规则 | 只能在顶层调用，只能在函数组件调用 |
| useEffect | 绘制后执行，异步不阻塞 |
| useLayoutEffect | 绘制前执行，同步阻塞 |
| useCallback | 缓存函数引用 |
| useMemo | 缓存计算结果 |
| React.memo | 浅比较优化函数组件 |
| 性能优化 | memo + useCallback + 懒加载 + 虚拟列表 |

> [!TIP]
> 下一篇：[跨端框架面试题](/blog/posts/interview-guide-06-cross-platform/)
> 
> 涵盖 uniapp、React Native、Flutter 等跨端技术原理与对比。
