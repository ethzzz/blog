---
title: 'Vue 框架面试题（中高级）'
published: 2026-09-15T14:00:00+08:00
description: '深入讲解 Vue2/Vue3 响应式原理、虚拟 DOM、Diff 算法、生命周期、组件通信、Vuex/Pinia 等高频面试题。'
tags: [前端面试, Vue, 响应式, 虚拟DOM, Pinia]
category: 前端面试宝典
draft: false
---

> [!NOTE]
> 本文包含 30+ 道 Vue 框架面试题，涵盖 Vue2 和 Vue3，难度标注：⭐ 基础 · ⭐⭐ 进阶 · ⭐⭐⭐ 高级 · 🔥 高频必考

---

## Vue 基础

### Q1: Vue 的优缺点？⭐

**答：**

| 优点 | 说明 |
|:--|:--|
| 渐进式框架 | 可以逐步引入，不需要全家桶 |
| 双向数据绑定 | v-model 简化表单处理 |
| 组件化 | 单文件组件 (SFC) 开发体验好 |
| 虚拟 DOM | 性能优化，跨平台能力 |
| 生态丰富 | Vue Router、Pinia、Nuxt 等 |
| 文档完善 | 中文文档友好 |

| 缺点 | 说明 |
|:--|:--|
| 灵活性高 | 大型项目需要规范约束 |
| SEO 问题 | SPA 需要 SSR 解决 |
| 首屏加载 | 需要优化手段 |

### Q2: Vue2 和 Vue3 的区别？⭐⭐ 🔥

**答：**

| 特性 | Vue2 | Vue3 |
|:--|:--|:--|
| 响应式 | `Object.defineProperty` | `Proxy` |
| 生命周期 | `beforeCreate` 等 | `setup` + `onMounted` 等 |
| 组合式 API | 无（需 mixin） | `Composition API` |
| TypeScript | 支持有限 | 原生支持 |
| 性能 | 较好 | 更快（编译优化） |
| 包体积 | ~20KB | ~10KB（Tree Shaking） |
| Fragment | 不支持（单根） | 支持多根节点 |
| Teleport | 不支持 | 内置支持 |
| Suspense | 不支持 | 内置支持 |

```javascript
// Vue2 Options API
export default {
  data() {
    return { count: 0 };
  },
  methods: {
    increment() { this.count++; }
  },
  computed: {
    double() { return this.count * 2; }
  },
  mounted() {
    console.log('mounted');
  }
};

// Vue3 Composition API
import { ref, computed, onMounted } from 'vue';

export default {
  setup() {
    const count = ref(0);
    const double = computed(() => count.value * 2);
    
    function increment() {
      count.value++;
    }
    
    onMounted(() => {
      console.log('mounted');
    });
    
    return { count, double, increment };
  }
};

// Vue3 <script setup> 语法糖
<script setup>
import { ref, computed, onMounted } from 'vue';

const count = ref(0);
const double = computed(() => count.value * 2);
const increment = () => count.value++;

onMounted(() => console.log('mounted'));
</script>
```

---

## 响应式原理

### Q3: Vue2 响应式原理？⭐⭐⭐ 🔥

**答：**

Vue2 使用 `Object.defineProperty` 实现数据劫持。

```javascript
// 简化实现
function defineReactive(obj, key, val) {
  const dep = new Dep(); // 依赖管理器
  
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      if (Dep.target) {
        dep.addSub(Dep.target); // 依赖收集
      }
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      dep.notify(); // 派发更新
    }
  });
}

function observe(obj) {
  if (typeof obj !== 'object') return;
  
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key]);
    observe(obj[key]); // 递归监听
  });
}
```

**流程图：**
```
初始化 -> observe(data) -> defineReactive
                                |
    渲染 -> Watcher -> 读取数据 -> get 触发 -> 依赖收集
                                |
    修改数据 -> set 触发 -> dep.notify() -> Watcher.update() -> 重新渲染
```

**Vue2 响应式的缺陷：**

```javascript
const obj = { a: 1 };
observe(obj);

// 1. 无法检测对象属性的添加/删除
obj.b = 2;           // 不是响应式
delete obj.a;        // 不是响应式

// 解决：Vue.set / Vue.delete
Vue.set(obj, 'b', 2);
Vue.delete(obj, 'a');

// 2. 无法检测数组索引修改和长度变化
arr[0] = 'new';      // 不是响应式
arr.length = 0;      // 不是响应式

// 解决：变异方法
arr.splice(0, 1, 'new');
```

### Q4: Vue3 响应式原理？⭐⭐⭐ 🔥

**答：**

Vue3 使用 `Proxy` 替代 `Object.defineProperty`。

```javascript
// 简化实现
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key); // 依赖收集
      
      // 惰性代理嵌套对象
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      
      if (oldValue !== value) {
        trigger(target, key); // 触发更新
      }
      return result;
    },
    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key);
      trigger(target, key);
      return result;
    }
  });
}

// ref 实现（基本类型）
function ref(value) {
  const wrapper = {
    get value() {
      track(wrapper, 'value');
      return value;
    },
    set value(newVal) {
      if (newVal !== value) {
        value = newVal;
        trigger(wrapper, 'value');
      }
    }
  };
  
  Object.defineProperty(wrapper, '__v_isRef', { value: true });
  return wrapper;
}
```

**Vue3 响应式优势：**

| 特性 | Vue2 | Vue3 |
|:--|:--|:--|
| 对象新增/删除属性 | 不支持 | 支持 |
| 数组索引修改 | 不支持 | 支持 |
| 嵌套对象 | 初始化递归 | 惰性代理 |
| Map/Set | 不支持 | 支持 |
| 性能 | 初始化开销大 | 运行时开销小 |

### Q5: ref 和 reactive 的区别？⭐⭐ 🔥

**答：**

| 特性 | `ref` | `reactive` |
|:--|:--|:--|
| 类型 | 任意类型 | 对象/数组 |
| 访问方式 | `.value` | 直接访问 |
| 实现原理 | getter/setter 包装 | Proxy 代理 |
| 模板中使用 | 自动解包 | 直接使用 |

```javascript
import { ref, reactive } from 'vue';

// ref
const count = ref(0);
count.value++; // 需要 .value
console.log(count.value); // 0

// reactive
const state = reactive({ count: 0 });
state.count++; // 直接访问
console.log(state.count); // 1

// 模板中使用（ref 自动解包）
// <div>{{ count }}</div>  不需要 .value

// reactive 的陷阱
const state = reactive({ list: [] });
state.list = [1, 2, 3];     // ✅ 可以
const { list } = state;      // ❌ 解构后失去响应式

// 解决：toRefs
import { toRefs } from 'vue';
const { list } = toRefs(state); // ✅ 保持响应式
```

---

## 虚拟 DOM 与 Diff

### Q6: 什么是虚拟 DOM？⭐⭐ 🔥

**答：**

虚拟 DOM 是用 JavaScript 对象描述真实 DOM 的结构。

```javascript
// 真实 DOM
<div id="app" class="container">
  <h1>Hello</h1>
  <p>World</p>
</div>

// 虚拟 DOM
const vnode = {
  tag: 'div',
  props: { id: 'app', class: 'container' },
  children: [
    { tag: 'h1', props: null, children: 'Hello' },
    { tag: 'p', props: null, children: 'World' }
  ]
};
```

**虚拟 DOM 的优势：**
1. **性能优化**：批量操作，减少真实 DOM 操作
2. **跨平台**：可渲染到 DOM、Canvas、Native
3. **声明式编程**：状态驱动视图

**虚拟 DOM 不一定比直接操作 DOM 快**，但提供了更好的开发体验和可维护性。

### Q7: Vue 的 Diff 算法？⭐⭐⭐ 🔥

**答：**

Vue 采用**双端对比**策略（Vue2）和**最长递增子序列**（Vue3）。

**Vue2 双端 Diff：**

```
旧头 <---> 新头
旧尾 <---> 新尾
旧头 <---> 新尾
旧尾 <---> 新头
```

```javascript
// 简化流程
function patch(oldVnode, newVnode) {
  // 1. 同层比较，不同层直接替换
  if (oldVnode.tag !== newVnode.tag) {
    replaceNode(oldVnode, newVnode);
    return;
  }
  
  // 2. 文本节点直接更新
  if (!newVnode.tag) {
    if (oldVnode.text !== newVnode.text) {
      oldVnode.elm.textContent = newVnode.text;
    }
    return;
  }
  
  // 3. 子节点 Diff
  diffChildren(oldVnode.children, newVnode.children);
}

function diffChildren(oldCh, newCh) {
  let oldStartIdx = 0, oldEndIdx = oldCh.length - 1;
  let newStartIdx = 0, newEndIdx = newCh.length - 1;
  
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 四种比较方式
    if (sameVnode(oldCh[oldStartIdx], newCh[newStartIdx])) {
      patch(oldCh[oldStartIdx++], newCh[newStartIdx++]);
    } else if (sameVnode(oldCh[oldEndIdx], newCh[newEndIdx])) {
      patch(oldCh[oldEndIdx--], newCh[newEndIdx--]);
    } else if (sameVnode(oldCh[oldStartIdx], newCh[newEndIdx])) {
      patch(oldCh[oldStartIdx++], newCh[newEndIdx--]);
    } else if (sameVnode(oldCh[oldEndIdx], newCh[newStartIdx])) {
      patch(oldCh[oldEndIdx--], newCh[newStartIdx++]);
    } else {
      // 使用 key 查找
      const idxInOld = findIdxInOld(oldCh, newCh[newStartIdx]);
      if (idxInOld === -1) {
        // 新节点，插入
        insertBefore(oldCh[oldStartIdx].elm, newCh[newStartIdx]);
      } else {
        // 移动节点
        moveNode(oldCh[idxInOld], newCh[newStartIdx]);
      }
      newStartIdx++;
    }
  }
}
```

**key 的作用：**

```html
<!-- ❌ 不使用 key，可能导致就地复用 -->
<li v-for="item in list">{{ item.name }}</li>

<!-- ✅ 使用唯一 key，提高 Diff 效率 -->
<li v-for="item in list" :key="item.id">{{ item.name }}</li>

<!-- ❌ 使用 index 作为 key（列表会变化时） -->
<li v-for="(item, index) in list" :key="index">{{ item.name }}</li>
```

---

## 生命周期

### Q8: Vue 生命周期有哪些？⭐ 🔥

**答：**

**Vue2 生命周期：**

```
beforeCreate -> created -> beforeMount -> mounted
      |            |            |            |
   实例初始化    数据观测完成   模板编译完成   DOM 挂载完成
      |
      v
beforeUpdate -> updated -> beforeDestroy -> destroyed
      |            |            |              |
   数据更新前    数据更新后    组件销毁前     组件销毁后
```

**Vue3 生命周期（Composition API）：**

| Vue2 | Vue3 |
|:--|:--|
| `beforeCreate` | `setup()` |
| `created` | `setup()` |
| `beforeMount` | `onBeforeMount` |
| `mounted` | `onMounted` |
| `beforeUpdate` | `onBeforeUpdate` |
| `updated` | `onUpdated` |
| `beforeDestroy` | `onBeforeUnmount` |
| `destroyed` | `onUnmounted` |

```javascript
import { onMounted, onUpdated, onUnmounted } from 'vue';

export default {
  setup() {
    // 相当于 beforeCreate / created
    
    onMounted(() => {
      console.log('DOM 已挂载');
    });
    
    onUpdated(() => {
      console.log('组件已更新');
    });
    
    onUnmounted(() => {
      console.log('组件已卸载');
      // 清理定时器、事件监听等
    });
  }
};
```

### Q9: 父子组件生命周期执行顺序？⭐⭐

**答：**

```javascript
// 加载渲染过程
父 beforeCreate -> 父 created -> 父 beforeMount
  -> 子 beforeCreate -> 子 created -> 子 beforeMount -> 子 mounted
-> 父 mounted

// 更新过程
父 beforeUpdate -> 子 beforeUpdate -> 子 updated -> 父 updated

// 销毁过程
父 beforeDestroy -> 子 beforeDestroy -> 子 destroyed -> 父 destroyed
```

---

## 组件通信

### Q10: Vue 组件通信方式有哪些？⭐⭐ 🔥

**答：**

| 方式 | 适用场景 |
|:--|:--|
| `props` / `$emit` | 父子组件 |
| `v-model` | 表单组件双向绑定 |
| `ref` / `$refs` | 父调子方法 |
| `provide` / `inject` | 跨层级传递 |
| `$parent` / `$children` | 直接访问 |
| `$attrs` / `$listeners` | 属性透传 |
| `EventBus` | 任意组件（Vue2） |
| `Vuex` / `Pinia` | 全局状态管理 |
| `mitt` | 任意组件（Vue3） |

```javascript
// 1. props / emit（父子）
// 父组件
<Child :data="parentData" @update="handleUpdate" />
// 子组件
props: ['data'],
emits: ['update'],
this.$emit('update', newValue);

// 2. v-model
// 父组件
<Child v-model="value" />
// 子组件（Vue3）
props: ['modelValue'],
emits: ['update:modelValue'],
this.$emit('update:modelValue', newValue);

// 3. provide / inject（跨层级）
// 祖先组件
provide: {
  theme: 'dark'
}
// 后代组件
inject: ['theme']

// 4. EventBus（Vue2）
// bus.js
export const bus = new Vue();
// 发送
bus.$emit('event-name', data);
// 接收
bus.$on('event-name', callback);

// 5. mitt（Vue3）
import mitt from 'mitt';
const emitter = mitt();
emitter.emit('event', data);
emitter.on('event', callback);
```

---

## 状态管理

### Q11: Vuex 和 Pinia 的区别？⭐⭐

**答：**

| 特性 | Vuex | Pinia |
|:--|:--|:--|
| TypeScript | 支持一般 | 完美支持 |
| Mutations | 需要 | 不需要 |
| 模块化 | modules | 多个 store |
| 体积 | ~10KB | ~1KB |
| Vue3 | 需 4.x | 原生支持 |
| DevTools | 支持 | 支持 |

```javascript
// Vuex
const store = createStore({
  state: { count: 0 },
  mutations: {
    increment(state) { state.count++; }
  },
  actions: {
    asyncIncrement({ commit }) {
      setTimeout(() => commit('increment'), 100);
    }
  },
  getters: {
    double: state => state.count * 2
  }
});

// Pinia
import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: {
    double: state => state.count * 2
  },
  actions: {
    increment() { this.count++; },
    asyncIncrement() {
      setTimeout(() => this.increment(), 100);
    }
  }
});

// 使用
const counter = useCounterStore();
counter.increment();
console.log(counter.double);
```

---

## 性能优化

### Q12: Vue 性能优化手段？⭐⭐ 🔥

**答：**

```javascript
// 1. v-if vs v-show
// v-if：真正销毁/创建，适合不频繁切换
// v-show：display: none，适合频繁切换
<div v-if="condition">很少切换</div>
<div v-show="condition">频繁切换</div>

// 2. v-for 和 v-if 不要同时使用
// ❌ 
<li v-for="item in list" v-if="item.active" :key="item.id">

// ✅ 使用 computed 过滤
computed: {
  activeList() {
    return this.list.filter(item => item.active);
  }
}
<li v-for="item in activeList" :key="item.id">

// 3. 列表使用 key
<li v-for="item in list" :key="item.id">{{ item.name }}</li>

// 4. 路由懒加载
const routes = [
  {
    path: '/user',
    component: () => import('./views/User.vue')
  }
];

// 5. 异步组件
const AsyncComponent = defineAsyncComponent(() =>
  import('./components/Heavy.vue')
);

// 6. Keep-alive 缓存
<keep-alive :include="['UserList', 'ArticleList']">
  <router-view />
</keep-alive>

// 7. 事件销毁
mounted() {
  window.addEventListener('resize', this.handleResize);
},
beforeUnmount() {
  window.removeEventListener('resize', this.handleResize);
}

// 8. 图片懒加载
<img v-lazy="imageUrl" />

// 9. 虚拟滚动（长列表）
<RecycleScroller
  :items="items"
  :item-size="50"
>
  <template #default="{ item }">
    <div>{{ item.name }}</div>
  </template>
</RecycleScroller>

// 10. 防抖节流
// 搜索框防抖
methods: {
  handleSearch: debounce(function(query) {
    this.fetchResults(query);
  }, 300)
}
```

---

## Vue Router

### Q13: Vue Router 的导航守卫？⭐⭐

**答：**

```javascript
// 全局守卫
router.beforeEach((to, from, next) => {
  // 每次路由跳转前执行
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login');
  } else {
    next();
  }
});

router.afterEach((to, from) => {
  // 跳转完成后执行（不能改变导航）
  document.title = to.meta.title;
});

// 路由独享守卫
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      // 进入该路由前执行
      next();
    }
  }
];

// 组件内守卫
export default {
  beforeRouteEnter(to, from, next) {
    // 进入组件前，无法访问 this
    next(vm => {
      // 通过 vm 访问组件实例
    });
  },
  beforeRouteUpdate(to, from, next) {
    // 路由参数变化时（如 /user/1 -> /user/2）
    next();
  },
  beforeRouteLeave(to, from, next) {
    // 离开组件前
    if (this.hasUnsavedChanges) {
      if (!confirm('确定离开？')) {
        next(false);
        return;
      }
    }
    next();
  }
};
```

---

## 复习卡片

| 知识点 | 关键记忆 |
|:--|:--|
| Vue2 响应式 | `Object.defineProperty`，无法监听新增/删除 |
| Vue3 响应式 | `Proxy`，惰性代理，支持 Map/Set |
| ref vs reactive | ref 需 `.value`，reactive 直接访问 |
| 虚拟 DOM | JS 对象描述 DOM，批量更新 |
| Diff 算法 | 双端对比 + key 优化 |
| 生命周期 | 父 beforeCreate -> 子 mounted -> 父 mounted |
| 组件通信 | props/emit、v-model、provide/inject、Pinia |
| 性能优化 | v-if/v-show、key、懒加载、keep-alive |

> [!TIP]
> 下一篇：[React 框架面试题](/blog/posts/interview-guide-05-react/)
> 
> 涵盖 React Fiber、Hooks、JSX、状态管理、性能优化等核心知识点。
