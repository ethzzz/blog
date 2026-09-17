---
title: 本地预览效果演示
published: 2026-09-01
description: 一篇用于验证本地开发预览流程的测试文章，展示 Fuwari 主题的各项 Markdown 渲染能力。
image: ''
tags: [测试, Markdown]
category: 教程
draft: false
lang: ''
---

这是一篇**演示文章**，用来验证本地开发服务器的热更新效果。试着在编辑器里改动这段文字并保存，浏览器会自动刷新，无需手动重启服务。

（热更新已验证：这行是刚才加的，保存后页面自动同步，全程没有重启服务器。）

## 基础排版

正文段落支持 **粗体**、*斜体*、~~删除线~~、`行内代码` 以及 [超链接](https://astro.build)。

> 这是一段引用。
> 引用常用于强调别人的观点或补充说明。

无序列表：

- 第一项
- 第二项
  - 嵌套子项
- 第三项

有序列表：

1. 打开终端
2. 运行 `npm run dev`
3. 访问 `localhost:4321`

## 代码高亮

Fuwari 使用 Expressive Code 渲染代码块，自带行号和复制按钮。

```javascript title="hello.js"
function greet(name) {
  // 试着改一下这行注释，保存页面会自动热更新
  console.log(`你好，${name}！`);
}

greet("世界");
```

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print([fibonacci(i) for i in range(10)])
```

## 提示块

Fuwari 支持 GitHub 风格的提示语法：

> [!NOTE]
> 这是普通提示，用来补充说明信息。

> [!TIP]
> 这是技巧提示，分享一些好用的做法。

> [!IMPORTANT]
> 这是重要提示，需要特别留意的内容。

> [!WARNING]
> 这是警告，提示可能存在的风险。

> [!CAUTION]
> 这是危险提示，操作不当可能造成损失。

## 数学公式

行内公式 $E = mc^2$ 与块级公式都支持（基于 KaTeX）：

$$
\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}
$$

## 表格

| 命令 | 作用 |
| :--- | :--- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run new-post -- 文件名` | 新建一篇文章 |

## 小结

如果上面这些元素都渲染正常，说明本地开发环境完全跑通了。接下来可以放心写自己的文章，边写边看效果。

满意之后运行 `./deploy.sh` 就能一键部署到线上服务器。
