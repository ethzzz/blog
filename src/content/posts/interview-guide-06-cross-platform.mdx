---
title: '跨端框架面试题（uniapp / React Native / Flutter）'
published: 2026-09-16T10:00:00+08:00
description: '深入讲解 uniapp、React Native、Flutter 等跨端方案的原理、架构、性能对比与选型策略。'
tags: [前端面试, uniapp, ReactNative, Flutter, 跨端开发]
category: 前端面试宝典
draft: false
---

> [!NOTE]
> 本文包含 20+ 道跨端框架面试题，难度标注：⭐ 基础 · ⭐⭐ 进阶 · ⭐⭐⭐ 高级 · 🔥 高频必考

---

## 跨端方案概览

### Q1: 主流跨端方案有哪些？各自原理是什么？⭐⭐ 🔥

**答：**

| 方案 | 技术栈 | 渲染方式 | 性能 |
|:--|:--|:--|:--|
| **React Native** | JS + React | 原生组件（Bridge/JSI） | 接近原生 |
| **Flutter** | Dart | 自绘引擎（Skia） | 最接近原生 |
| **uniapp** | Vue | WebView / 原生（条件编译） | 中等 |
| **Taro** | React/Vue | 小程序 / H5 | 中等 |
| **Ionic** | JS + WebView | WebView | 一般 |
| **Weex** | Vue | 原生组件 | 接近原生（已停维） |

**渲染架构对比：**

```
React Native（新架构）
JS 线程 ←→ JSI (C++) ←→ 原生 UI 组件

Flutter
Dart 代码 → Skia 引擎 → GPU 直接绘制（不依赖原生组件）

uniapp（App 端）
Vue 代码 → WebView / 原生混合渲染
```

### Q2: React Native 的通信机制？⭐⭐⭐

**答：**

**旧架构（Bridge）：**
```
JS Thread ←→ Bridge (异步 JSON 序列化) ←→ Native Thread
```
- 缺点：异步通信、序列化开销大、批量更新

**新架构（JSI + TurboModules + Fabric）：**
```
JS Thread ←→ JSI (C++ 直接引用) ←→ Native
```
- JSI：JavaScript Interface，JS 可以直接调用 C++ 方法
- TurboModules：按需加载原生模块，懒加载
- Fabric：新渲染系统，支持同步布局

```javascript
// JSI 使用示例（C++ HostObject）
// JS 侧直接调用原生方法，无需 Bridge 序列化
global.nativeModule.doSomething(arg);
```

---

## uniapp

### Q3: uniapp 的跨端原理？⭐⭐ 🔥

**答：**

uniapp 使用 **条件编译** + **运行时适配** 实现跨端：

```javascript
// 条件编译
// #ifdef APP-PLUS
// App 端特有代码
uni.scanCode({ success: (res) => {} });
// #endif

// #ifdef H5
// H5 端特有代码
window.scrollTo(0, 0);
// #endif

// #ifdef MP-WEIXIN
// 微信小程序特有代码
wx.login({});
// #endif
```

**各端渲染方式：**

| 平台 | 渲染方式 |
|:--|:--|
| H5 | Vue → DOM |
| 小程序 | Vue → 小程序 DSL → 原生渲染 |
| App (iOS/Android) | WebView + 原生组件混合 |
| App (nvue) | Weex → 原生组件 |

### Q4: uniapp 的生命周期？⭐⭐

**答：**

```javascript
// uniapp 有两套生命周期

// 1. 应用生命周期（App.vue）
export default {
  onLaunch(options) {},    // 应用初始化（全局只触发一次）
  onShow(options) {},      // 应用进入前台
  onHide() {},             // 应用进入后台
  onError(err) {},         // 应用报错
  onPageNotFound() {},     // 页面不存在
};

// 2. 页面生命周期（页面 .vue）
export default {
  // Vue 生命周期
  beforeCreate() {},
  created() {},
  mounted() {},
  
  // uniapp 页面生命周期
  onLoad(options) {},      // 页面加载（可获取路由参数）
  onShow() {},             // 页面显示
  onReady() {},            // 页面初次渲染完成
  onHide() {},             // 页面隐藏
  onUnload() {},           // 页面卸载
  onPullDownRefresh() {},  // 下拉刷新
  onReachBottom() {},      // 触底加载
  onShareAppMessage() {}, // 分享
};
```

### Q5: uniapp 路由和传参？⭐

```javascript
// 页面跳转
uni.navigateTo({ url: '/pages/detail?id=123' });
uni.redirectTo({ url: '/pages/detail' });   // 关闭当前页
uni.switchTab({ url: '/pages/home' });       // 跳转 tabBar
uni.navigateBack({ delta: 1 });              // 返回
uni.reLaunch({ url: '/pages/login' });       // 重启应用

// 接收参数
export default {
  onLoad(options) {
    console.log(options.id); // '123'
  }
};

// 复杂参数（序列化）
const data = encodeURIComponent(JSON.stringify({ a: 1, b: 2 }));
uni.navigateTo({ url: `/pages/detail?data=${data}` });

// 接收
onLoad(options) {
  const data = JSON.parse(decodeURIComponent(options.data));
}

// EventChannel（页面间通信）
uni.navigateTo({
  url: '/pages/detail',
  success: (res) => {
    res.eventChannel.emit('acceptData', { data: 'from prev page' });
  }
});
```

---

## React Native

### Q6: React Native 常用组件和 API？⭐⭐

```jsx
// 核心组件
import {
  View,           // div
  Text,           // span / p
  Image,          // img
  ScrollView,     // 滚动容器
  FlatList,       // 高性能列表
  SectionList,    // 分组列表
  TouchableOpacity, // 可点击容器
  TextInput,      // input
  Modal,          // 弹窗
  SafeAreaView,   // 安全区域
  StatusBar,      // 状态栏
} from 'react-native';

// FlatList（长列表必备）
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ItemCard item={item} />}
  // 性能优化
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index
  })}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={10}
  removeClippedSubviews={true}
/>

// 样式
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
});
```

### Q7: React Native 性能优化？⭐⭐⭐ 🔥

**答：**

```jsx
// 1. 使用 FlatList 而非 ScrollView（长列表）
// FlatList 有窗口化渲染，只渲染可见区域

// 2. 避免不必要的重渲染
const Item = React.memo(({ item }) => (
  <View><Text>{item.name}</Text></View>
));

// 3. 图片优化
import FastImage from 'react-native-fast-image';
<FastImage
  source={{ uri: imageUrl, priority: FastImage.priority.high }}
  style={{ width: 200, height: 200 }}
  resizeMode={FastImage.resizeMode.cover}
/>

// 4. 减少 Bridge 通信（旧架构）
// 批量操作，避免频繁调用原生方法

// 5. 动画使用 useNativeDriver
Animated.timing(animatedValue, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // 在原生线程执行
}).start();

// 6. InteractionManager（延迟非关键任务）
InteractionManager.runAfterInteractions(() => {
  // 在动画/交互结束后执行
  loadHeavyData();
});

// 7. Hermes 引擎
// 启用 Hermes 可以显著减少启动时间和内存占用
```

---

## Flutter

### Q8: Flutter 的架构和渲染原理？⭐⭐⭐

**答：**

```
Flutter 三层架构：

┌─────────────────────────────────┐
│      Framework (Dart)           │
│  Material/Cupertino/Widgets     │
├─────────────────────────────────┤
│      Engine (C++)               │
│  Skia 绘图 / Dart VM / Text     │
├─────────────────────────────────┤
│      Embedder (平台层)           │
│  iOS / Android / Web / Desktop  │
└─────────────────────────────────┘
```

**渲染流程：**
```
Widget (描述 UI) → Element (管理生命周期) → RenderObject (布局绘制)
```

```dart
// Widget 是不可变的描述
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(16),
      child: Text('Hello Flutter'),
    );
  }
}

// StatefulWidget 管理状态
class CounterWidget extends StatefulWidget {
  @override
  _CounterState createState() => _CounterState();
}

class _CounterState extends State<CounterWidget> {
  int _count = 0;
  
  void _increment() {
    setState(() => _count++); // 触发重建
  }
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Count: $_count'),
        ElevatedButton(
          onPressed: _increment,
          child: Text('Increment'),
        ),
      ],
    );
  }
}
```

---

## 跨端方案对比与选型

### Q9: 跨端方案如何选型？⭐⭐ 🔥

**答：**

| 维度 | uniapp | React Native | Flutter |
|:--|:--|:--|:--|
| 学习成本 | 低（Vue） | 中（React） | 高（Dart） |
| 性能 | 中 | 高 | 最高 |
| 生态 | 小程序优 | 丰富 | 快速增长 |
| 包体积 | 小 | 中 | 大（~10MB） |
| 热更新 | 支持 | 支持 | 受限 |
| 原生能力 | 一般 | 强 | 强 |
| 适用场景 | 多端统一（含小程序） | 重交互 App | 高性能 UI |

**选型建议：**
- **需要小程序 + App + H5**：选 uniapp / Taro
- **重交互、接近原生体验**：选 React Native
- **高性能 UI、设计一致性**：选 Flutter
- **团队技术栈是 React**：React Native
- **团队技术栈是 Vue**：uniapp

### Q10: 跨端方案的热更新原理？⭐⭐⭐

**答：**

```
React Native 热更新：
1. 打包 JS Bundle（CodePush / 自建服务）
2. App 启动时检查版本
3. 下载新 Bundle 到本地
4. 重启加载新 Bundle

uniapp 热更新：
1. wgt 包（Widget 更新包）
2. 使用 plus.runtime.install 安装
3. 重启应用

Flutter 热更新（受限）：
1. Dart AOT 编译后无法直接热更新
2. 需要通过 Shorebird 等方案
3. 或者通过配置 + 服务端控制
```

```javascript
// RN CodePush 热更新示例
import codePush from 'react-native-code-push';

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: codePush.InstallMode.ON_NEXT_RESTART,
};

function App() {
  useEffect(() => {
    codePush.sync({
      updateDialog: true,
      installMode: codePush.InstallMode.IMMEDIATE,
    });
  }, []);
  
  return <MainApp />;
}

export default codePush(codePushOptions)(App);
```

---

## 复习卡片

| 知识点 | 关键记忆 |
|:--|:--|
| RN 新架构 | JSI 替代 Bridge，同步通信 |
| Flutter 渲染 | Skia 自绘，不依赖原生组件 |
| uniapp 跨端 | 条件编译 + 运行时适配 |
| FlatList | RN 长列表必须用，窗口化渲染 |
| useNativeDriver | 动画性能优化关键 |
| Hermes | RN 引擎，减少启动时间 |
| 热更新 | RN/uniapp 支持，Flutter 受限 |
| 选型 | 多端选 uniapp，性能选 Flutter，生态选 RN |

> [!TIP]
> 下一篇：[前端构建工具面试题](/blog/posts/interview-guide-07-build-tools/)
> 
> 涵盖 Webpack、Vite、Babel、Tree Shaking、HMR 等工程化核心知识点。
