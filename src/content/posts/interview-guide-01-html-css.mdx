---
title: 'HTML & CSS 高频面试题（中高级）'
published: 2026-09-15T11:00:00+08:00
description: '覆盖语义化、盒模型、BFC、选择器优先级、Flex/Grid 布局、响应式设计、CSS 动画等 30+ 道高频面试题。'
tags: [前端面试, HTML, CSS, 布局, Flex, Grid]
category: 前端面试宝典
draft: false
---

> [!NOTE]
> 本文包含 30+ 道 HTML/CSS 高频面试题，难度标注：⭐ 基础 · ⭐⭐ 进阶 · ⭐⭐⭐ 高级 · 🔥 高频必考

---

## HTML 部分

### Q1: HTML5 有哪些新特性？⭐ 🔥

**答：**

| 分类 | 新特性 |
|:--|:--|
| 语义化标签 | `<header>` `<footer>` `<nav>` `<article>` `<section>` `<aside>` |
| 多媒体 | `<audio>` `<video>` `<canvas>` |
| 表单增强 | `date` `email` `url` `range` `placeholder` `required` |
| 存储 | `localStorage` `sessionStorage` `IndexedDB` |
| 地理定位 | `Geolocation API` |
| Web Worker | 后台线程处理 |
| WebSocket | 全双工通信 |
| 拖拽 API | `draggable` `dragstart` `dragover` `drop` |

### Q2: 什么是语义化 HTML？为什么要使用？⭐⭐

**答：**

语义化 HTML 是指使用有明确含义的标签来描述内容，而不是滥用 `<div>` 和 `<span>`。

**好处：**
1. **SEO 友好**：搜索引擎能更好理解页面结构
2. **可访问性**：屏幕阅读器能正确朗读内容
3. **代码可读性**：团队协作时更容易理解
4. **设备兼容**：移动设备、阅读器能更好解析

```html
<!-- ❌ 不语义化 -->
<div class="header">网站标题</div>
<div class="nav">导航</div>
<div class="content">内容</div>

<!-- ✅ 语义化 -->
<header>网站标题</header>
<nav>导航</nav>
<main>
  <article>
    <h1>文章标题</h1>
    <section>章节一</section>
    <section>章节二</section>
  </article>
  <aside>侧边栏</aside>
</main>
<footer>页脚</footer>
```

### Q3: `<script>` `<script async>` `<script defer>` 的区别？⭐⭐ 🔥

**答：**

| 方式 | 加载时机 | 执行时机 | 阻塞 |
|:--|:--|:--|:--|
| `<script>` | 立即加载 | 立即执行 | 阻塞 HTML 解析 |
| `<script async>` | 异步加载 | 加载完立即执行 | 执行时阻塞 |
| `<script defer>` | 异步加载 | HTML 解析完执行 | 不阻塞 |

```html
<!-- 阻塞式 -->
<script src="a.js"></script>

<!-- 异步：下载不阻塞，执行时阻塞，顺序不保证 -->
<script async src="b.js"></script>

<!-- 延迟：下载不阻塞，DOM 解析完执行，按顺序 -->
<script defer src="c.js"></script>
```

**使用建议：**
- 第三方统计脚本用 `async`
- 依赖 DOM 的业务脚本用 `defer`
- 内联脚本放在 `</body>` 前

### Q4: 什么是 DOM 和 BOM？⭐

**答：**

| 概念 | 全称 | 作用 |
|:--|:--|:--|
| DOM | Document Object Model | 文档对象模型，操作 HTML/XML |
| BOM | Browser Object Model | 浏览器对象模型，操作浏览器 |

```javascript
// DOM 操作
document.getElementById('app')
document.querySelector('.class')
element.innerHTML = 'xxx'

// BOM 操作
window.location.href
window.history.back()
navigator.userAgent
screen.width
```

---

## CSS 盒模型

### Q5: CSS 盒模型有哪些？区别是什么？⭐ 🔥

**答：**

| 盒模型 | box-sizing | 宽度计算 |
|:--|:--|:--|
| 标准盒模型 | `content-box` | width = content |
| IE 盒模型 | `border-box` | width = content + padding + border |

```css
/* 标准盒模型（默认） */
.box1 {
  box-sizing: content-box;
  width: 200px;
  padding: 20px;
  border: 5px solid;
  /* 实际宽度 = 200 + 20*2 + 5*2 = 250px */
}

/* IE 盒模型 */
.box2 {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid;
  /* 实际宽度 = 200px，content = 200 - 40 - 10 = 150px */
}

/* 推荐全局设置 */
*, *::before, *::after {
  box-sizing: border-box;
}
```

### Q6: margin 塌陷和 margin 合并是什么？⭐⭐

**答：**

**margin 塌陷**：父子元素垂直 margin 传递问题

```css
/* 问题：子元素 margin-top 传递给父元素 */
.parent { background: #eee; }
.child { margin-top: 50px; background: #ccc; }

/* 解决方案 */
.parent { overflow: hidden; }        /* 触发 BFC */
.parent { border-top: 1px solid; }   /* 加边框 */
.parent { padding-top: 1px; }        /* 加内边距 */
```

**margin 合并**：相邻元素垂直 margin 取最大值

```css
/* 情况1：兄弟元素 */
.box1 { margin-bottom: 30px; }
.box2 { margin-top: 20px; }
/* 实际间距 = 30px，不是 50px */

/* 情况2：空块级元素自身 */
.empty {
  margin-top: 20px;
  margin-bottom: 30px;
  /* 实际高度 margin = 30px */
}
```

---

## BFC (块级格式化上下文)

### Q7: 什么是 BFC？如何触发？有什么作用？⭐⭐ 🔥

**答：**

BFC (Block Formatting Context) 是一个独立渲染区域，内部元素布局不影响外部。

**触发条件：**
- `float` 不为 `none`
- `position` 为 `absolute` 或 `fixed`
- `display` 为 `inline-block` `flex` `grid`
- `overflow` 不为 `visible`
- 根元素 `<html>`

**应用场景：**

```css
/* 1. 清除浮动（高度塌陷） */
.parent { overflow: hidden; } /* 触发 BFC */

/* 2. 避免 margin 合并 */
.box1 { margin-bottom: 20px; }
.divider { overflow: hidden; } /* BFC 隔离 */
.box2 { margin-top: 10px; }

/* 3. 两栏布局（左浮动右自适应） */
.left { float: left; width: 200px; }
.right { overflow: hidden; } /* BFC 不与浮动重叠 */
```

---

## 选择器与优先级

### Q8: CSS 选择器优先级如何计算？⭐ 🔥

**答：**

| 优先级 | 选择器 | 权重 |
|:--|:--|:--|
| 1 | `!important` | ∞ |
| 2 | 内联样式 `style=""` | 1000 |
| 3 | ID 选择器 `#id` | 100 |
| 4 | 类/伪类/属性 `.class` `:hover` `[attr]` | 10 |
| 5 | 标签/伪元素 `div` `::before` | 1 |
| 6 | 通配符 `*` | 0 |

```css
/* 计算示例 */
#nav .item a:hover        /* 100 + 10 + 1 + 10 = 121 */
.nav .item a.active       /* 10 + 10 + 1 + 10 = 31 */
div#main p.intro span     /* 1 + 100 + 1 + 10 + 1 = 113 */

/* !important 最高但慎用 */
.text { color: red !important; }
```

### Q9: CSS 有哪些选择器？⭐

**答：**

```css
/* 基础选择器 */
* {}              /* 通配符 */
div {}            /* 标签 */
.class {}         /* 类 */
#id {}            /* ID */

/* 组合选择器 */
div p {}          /* 后代 */
div > p {}        /* 子代 */
div + p {}        /* 相邻兄弟 */
div ~ p {}        /* 通用兄弟 */

/* 属性选择器 */
[type="text"] {}  /* 精确匹配 */
[href^="http"] {} /* 开头匹配 */
[src$=".png"] {}  /* 结尾匹配 */
[class*="btn"] {} /* 包含匹配 */

/* 伪类 */
a:hover {}
li:first-child {}
li:nth-child(2n) {}
input:focus {}
:not(.active) {}

/* 伪元素 */
p::before {}
p::after {}
p::first-line {}
p::selection {}
```

---

## 布局相关

### Q10: Flex 布局常用属性？⭐ 🔥

**答：**

**容器属性：**

```css
.container {
  display: flex;
  
  /* 主轴方向 */
  flex-direction: row | row-reverse | column | column-reverse;
  
  /* 换行 */
  flex-wrap: nowrap | wrap | wrap-reverse;
  
  /* 主轴对齐 */
  justify-content: flex-start | center | flex-end | 
                   space-between | space-around | space-evenly;
  
  /* 交叉轴对齐 */
  align-items: stretch | flex-start | center | flex-end | baseline;
  
  /* 多行对齐 */
  align-content: stretch | flex-start | center | ...;
}
```

**项目属性：**

```css
.item {
  /* 放大比例，默认 0 */
  flex-grow: 1;
  
  /* 缩小比例，默认 1 */
  flex-shrink: 0;
  
  /* 基准大小 */
  flex-basis: 200px;
  
  /* 简写 */
  flex: 1;           /* flex: 1 1 0% */
  flex: auto;        /* flex: 1 1 auto */
  flex: none;        /* flex: 0 0 auto */
  
  /* 单独对齐 */
  align-self: center;
  
  /* 排序 */
  order: -1;
}
```

**经典布局：**

```css
/* 水平垂直居中 */
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 两栏布局 */
.layout {
  display: flex;
}
.sidebar { flex: 0 0 200px; }
.main { flex: 1; }

/* 三栏布局（圣杯） */
.layout { display: flex; }
.left { flex: 0 0 200px; }
.center { flex: 1; }
.right { flex: 0 0 150px; }
```

### Q11: Grid 布局怎么用？⭐⭐

**答：**

```css
.container {
  display: grid;
  
  /* 定义列 */
  grid-template-columns: 200px 1fr 1fr;
  grid-template-columns: repeat(3, 1fr);
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  
  /* 定义行 */
  grid-template-rows: 100px auto;
  
  /* 间距 */
  gap: 20px;           /* 行列间距 */
  row-gap: 10px;
  column-gap: 20px;
  
  /* 区域划分 */
  grid-template-areas: 
    "header header header"
    "sidebar main main"
    "footer footer footer";
}

.item {
  /* 跨列 */
  grid-column: 1 / 3;      /* 从第1条线到第3条线 */
  grid-column: span 2;     /* 跨2列 */
  
  /* 跨行 */
  grid-row: 1 / 3;
  
  /* 区域 */
  grid-area: header;
}
```

**Grid vs Flex：**

| 特性 | Flex | Grid |
|:--|:--|:--|
| 维度 | 一维 | 二维 |
| 适用 | 行或列布局 | 复杂网格布局 |
| 对齐 | 内容驱动 | 容器驱动 |

### Q12: 实现水平垂直居中的方式？⭐ 🔥

**答：**

```css
/* 1. Flex（推荐） */
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 2. Grid */
.parent {
  display: grid;
  place-items: center;
}

/* 3. 定位 + transform */
.parent { position: relative; }
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 4. 定位 + margin auto */
.parent { position: relative; }
.child {
  position: absolute;
  top: 0; right: 0; bottom: 0; left: 0;
  margin: auto;
  width: 200px;
  height: 100px;
}

/* 5. 行内元素 */
.parent {
  text-align: center;
  line-height: 100px; /* 等于容器高度 */
}

/* 6. table-cell */
.parent {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}
```

---

## 响应式设计

### Q13: 如何实现响应式设计？⭐⭐ 🔥

**答：**

**1. 媒体查询**

```css
/* 移动优先 */
.container { width: 100%; }

@media (min-width: 768px) {
  .container { width: 750px; }
}

@media (min-width: 992px) {
  .container { width: 970px; }
}

@media (min-width: 1200px) {
  .container { width: 1170px; }
}

/* 常用断点 */
/* xs: <576px  sm: ≥576px  md: ≥768px  lg: ≥992px  xl: ≥1200px */
```

**2. 弹性布局**

```css
/* 百分比 */
.col { width: 50%; }

/* flex */
.row { display: flex; flex-wrap: wrap; }
.col { flex: 1; min-width: 200px; }

/* grid 自动适应 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}
```

**3. 视口单位**

```css
/* vw/vh */
.hero { height: 100vh; }
.title { font-size: 5vw; }

/* clamp() 响应式字体 */
h1 { font-size: clamp(1.5rem, 4vw, 3rem); }
```

**4. 响应式图片**

```html
<!-- srcset -->
<img 
  srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
  sizes="(max-width: 600px) 480px, 800px"
  src="medium.jpg" 
  alt="responsive"
>

<!-- picture -->
<picture>
  <source media="(min-width: 800px)" srcset="large.jpg">
  <source media="(min-width: 400px)" srcset="medium.jpg">
  <img src="small.jpg" alt="responsive">
</picture>
```

### Q14: rem、em、px、vw/vh 的区别？⭐

**答：**

| 单位 | 说明 | 示例 |
|:--|:--|:--|
| `px` | 固定像素 | `width: 100px` |
| `em` | 相对于**当前元素**字体大小 | 父元素 16px，1em = 16px |
| `rem` | 相对于**根元素**字体大小 | html 16px，1rem = 16px |
| `vw` | 视口宽度的 1% | 100vw = 视口宽度 |
| `vh` | 视口高度的 1% | 100vh = 视口高度 |

```css
/* rem 适配方案 */
html {
  font-size: 16px; /* 默认 */
}

@media (max-width: 768px) {
  html { font-size: 14px; }
}

.title { font-size: 1.5rem; } /* 24px 或 21px */

/* flexible.js 动态设置 */
document.documentElement.style.fontSize = 
  document.documentElement.clientWidth / 10 + 'px';
```

---

## CSS 进阶

### Q15: CSS3 有哪些新特性？⭐

**答：**

```css
/* 1. 圆角 */
border-radius: 10px;
border-radius: 50%; /* 圆形 */

/* 2. 阴影 */
box-shadow: 0 4px 6px rgba(0,0,0,0.1);
text-shadow: 2px 2px 4px #ccc;

/* 3. 渐变 */
background: linear-gradient(to right, #ff6b6b, #4ecdc4);
background: radial-gradient(circle, #fff, #000);

/* 4. 变换 */
transform: translate(50px, 50px);
transform: rotate(45deg);
transform: scale(1.5);
transform: skew(10deg, 10deg);

/* 5. 过渡 */
transition: all 0.3s ease-in-out;
transition: width 0.3s, height 0.3s;

/* 6. 动画 */
@keyframes slide {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}
animation: slide 2s infinite alternate;

/* 7. 弹性布局 */
display: flex;
display: grid;

/* 8. 滤镜 */
filter: blur(5px);
filter: grayscale(100%);

/* 9. 多列布局 */
columns: 3;
column-gap: 20px;

/* 10. 变量 */
:root { --primary: #3498db; }
.btn { color: var(--primary); }
```

### Q16: transition 和 animation 的区别？⭐⭐

**答：**

| 特性 | transition | animation |
|:--|:--|:--|
| 触发方式 | 需要事件触发 | 自动播放 |
| 关键帧 | 只有开始和结束 | 可定义多个关键帧 |
| 循环 | 不支持 | 支持 `infinite` |
| 控制 | 简单 | 丰富（暂停、延迟、方向） |

```css
/* transition：需要状态变化触发 */
.btn {
  background: blue;
  transition: background 0.3s ease;
}
.btn:hover {
  background: red;
}

/* animation：自动播放 */
.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* animation 属性 */
animation: name duration timing-function delay iteration-count direction fill-mode;
animation: slide 2s ease-in-out 0.5s infinite alternate forwards;
```

### Q17: 什么是重绘和回流？如何优化？⭐⭐ 🔥

**答：**

| 概念 | 说明 | 触发条件 |
|:--|:--|:--|
| 回流 (Reflow) | 重新计算元素位置和大小 | 修改尺寸、位置、内容 |
| 重绘 (Repaint) | 重新绘制元素外观 | 修改颜色、背景、阴影 |

**回流一定导致重绘，重绘不一定导致回流。**

```javascript
// ❌ 触发多次回流
element.style.width = '100px';  // 回流
element.style.height = '100px'; // 回流
element.style.margin = '10px';  // 回流

// ✅ 批量修改
element.style.cssText = 'width: 100px; height: 100px; margin: 10px;';
// 或
element.className = 'new-class';

// ❌ 读取布局信息会强制回流
const width = element.offsetWidth; // 可能触发回流
element.style.width = width + 10 + 'px';

// ✅ 使用 DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
document.body.appendChild(fragment); // 一次回流

// ✅ 离线修改
element.style.display = 'none';
// ... 多次修改
element.style.display = 'block';

// ✅ 使用 transform 代替 top/left
// 触发合成层，不回流
element.style.transform = 'translateX(100px)';
```

**优化总结：**
1. 批量修改样式
2. 避免频繁读取布局属性
3. 使用 `transform` 和 `opacity` 做动画
4. 使用 `will-change` 提升为合成层
5. DOM 操作使用 `DocumentFragment`
6. 复杂动画使用 `position: absolute` 脱离文档流

---

## 复习卡片

| 知识点 | 关键词 |
|:--|:--|
| 盒模型 | `content-box` vs `border-box` |
| BFC | 独立渲染区域，清除浮动，避免 margin 合并 |
| 选择器优先级 | `!important` > 内联 > ID > 类 > 标签 |
| Flex 布局 | `justify-content` `align-items` `flex: 1` |
| Grid 布局 | 二维布局，`grid-template-columns` |
| 居中方案 | Flex `place-items: center` 最简洁 |
| 响应式 | 媒体查询 + 弹性布局 + 视口单位 |
| 重绘回流 | `transform` 动画不回流，批量修改 |

> [!TIP]
> 下一篇：[JavaScript 核心面试题](/blog/posts/interview-guide-02-javascript-core/)
> 
> 涵盖原型链、闭包、this 指向、作用域、ES6+ 等核心知识点。
