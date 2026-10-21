---
title: '数据可视化'
published: 2026-09-18T15:30:00+08:00
description: 'Python 数据可视化：matplotlib 绘制折线图/柱状图/散点图/饼图/直方图、子图布局与样式定制，seaborn 统计可视化（分布图/关系图/热力图），以及 pyecharts 交互式图表，让数据会说话。'
tags: [Python, 数据可视化, matplotlib, seaborn, pyecharts, 图表]
category: Python学习路线
draft: false
---

> [!NOTE]
> 本文对应仓库 **Day78~80**：matplotlib 绘图基础、seaborn 统计可视化、pyecharts 交互图表。数据可视化把枯燥的数字变成直观的图形，是数据分析的"最后一公里"，也是汇报和洞察的关键。

---

## 一、可视化三剑客概览

| 库 | 特点 | 适用场景 |
|:--|:--|:--|
| **matplotlib** | 最基础、最灵活、可控性强 | 所有静态图表的底层 |
| **seaborn** | 基于 matplotlib、默认样式美观、统计图强 | 统计分析、快速出好看的图 |
| **pyecharts** | 基于百度 ECharts、交互式、可网页嵌入 | 交互式报表、大屏、Web |

```bash
pip install matplotlib seaborn pyecharts
```

```
选型建议：
- 定制/科研/基础图 → matplotlib
- 统计/美观/快速探索 → seaborn
- 交互/Web/大屏展示 → pyecharts
- 三者可混用（seaborn 底层就是 matplotlib）
```

---

# 第一部分：matplotlib

## 二、matplotlib 基础与折线图

```python
import matplotlib.pyplot as plt
import numpy as np

# 解决中文乱码（重要！）
plt.rcParams["font.sans-serif"] = ["SimHei"]   # 用黑体显示中文
plt.rcParams["axes.unicode_minus"] = False     # 解决负号 '-' 显示问题

# 折线图
x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.figure(figsize=(8, 5))            # 创建画布，设置尺寸（英寸）
plt.plot(x, y, label="sin(x)", color="blue", linewidth=2, linestyle="-")
plt.plot(x, np.cos(x), label="cos(x)", color="red", linestyle="--")

plt.title("三角函数图像")              # 标题
plt.xlabel("x 轴")                    # x 轴标签
plt.ylabel("y 轴")                    # y 轴标签
plt.legend()                          # 图例（显示 label）
plt.grid(True, alpha=0.3)             # 网格线
plt.xlim(0, 10)                       # x 轴范围
plt.ylim(-1.5, 1.5)                   # y 轴范围
plt.axhline(y=0, color="gray", linestyle=":")  # 参考线

plt.savefig("sine.png", dpi=150, bbox_inches="tight")  # 保存（dpi 清晰度）
plt.show()                            # 显示
```

```
linestyle 线型：'-'实线  '--'虚线  '-.'点划线  ':'点线
marker 标记：'o'圆点  '*'星  's'方  '^'三角  '+'加
color：'r'红 'g'绿 'b'蓝 'k'黑 或 '#FF5733' 十六进制
```

> [!TIP]
> 中文乱码是 matplotlib 最常见的坑。`plt.rcParams["font.sans-serif"] = ["SimHei"]`（Windows）或 `["Arial Unicode MS"]`（Mac）；Linux 可安装中文字体后设 `["WenQuanYi Micro Hei"]`。别忘了 `axes.unicode_minus=False` 否则负号变方块。

---

## 三、常用图表类型

### 柱状图与条形图

```python
categories = ["A", "B", "C", "D"]
values = [23, 45, 56, 78]

# 垂直柱状图
plt.bar(categories, values, color="skyblue", edgecolor="black")
plt.barh(categories, values)          # 水平条形图

# 分组柱状图（多组对比）
x = np.arange(len(categories))
width = 0.35
plt.bar(x - width/2, [20, 30, 40, 50], width, label="2025")
plt.bar(x + width/2, [23, 45, 56, 78], width, label="2026")
plt.xticks(x, categories)
plt.legend()

# 堆叠柱状图
plt.bar(categories, [20, 30, 40, 50], label="男")
plt.bar(categories, [3, 15, 16, 28], bottom=[20, 30, 40, 50], label="女")
```

### 散点图

```python
x = np.random.randn(100)
y = np.random.randn(100)
plt.scatter(x, y, s=50, c=y, cmap="viridis", alpha=0.6)  # s大小 c颜色 cmap色图
plt.colorbar()                        # 颜色条
```

### 饼图

```python
labels = ["技术", "销售", "市场", "行政"]
sizes = [40, 25, 20, 15]
plt.pie(sizes, labels=labels, autopct="%1.1f%%",   # 显示百分比
        startangle=90, explode=[0.1, 0, 0, 0])     # 突出第一块
plt.axis("equal")                     # 保证是正圆
```

### 直方图与箱线图

```python
data = np.random.randn(1000)

# 直方图（看分布）
plt.hist(data, bins=30, color="steelblue", edgecolor="black", alpha=0.7)

# 箱线图（看离群值、四分位数）
plt.boxplot([data, np.random.randn(1000)*2],
            labels=["组A", "组B"])
```

```
图表选型指南：
- 趋势变化 → 折线图
- 类别对比 → 柱状图/条形图
- 占比构成 → 饼图（类别少）/堆叠柱
- 相关性   → 散点图
- 数据分布 → 直方图/箱线图/小提琴图
- 多变量关系 → 热力图/散点矩阵
```

---

## 四、子图与布局

一张画布放多个图，用 `subplots`。

```python
# subplots：创建网格子图
fig, axes = plt.subplots(2, 2, figsize=(10, 8))   # 2行2列
axes[0, 0].plot(x, np.sin(x))       # 左上
axes[0, 0].set_title("sin")
axes[0, 1].plot(x, np.cos(x))       # 右上
axes[0, 1].set_title("cos")
axes[1, 0].bar(["A", "B"], [3, 5])  # 左下
axes[1, 1].scatter(x, np.random.randn(100))  # 右下
plt.tight_layout()                  # 自动调整间距，防重叠
plt.show()

# 一行多图
fig, axes = plt.subplots(1, 3, figsize=(15, 4))
for i, ax in enumerate(axes):
    ax.plot(x, np.sin(x + i))

# subplot（逐个添加，旧式）
plt.subplot(2, 2, 1)                # 2行2列的第1个
plt.plot(x, y)
```

---

## 五、面向对象接口与样式

matplotlib 有两套 API，推荐**面向对象**（更清晰可控）。

```python
# ❌ pyplot 状态式（简单图可以，复杂易乱）
plt.plot(x, y)
plt.title("标题")

# ✅ 面向对象式（推荐，Figure + Axes）
fig = plt.figure(figsize=(8, 5))     # 画布 Figure
ax = fig.add_subplot(111)            # 坐标系 Axes
ax.plot(x, y)
ax.set_title("标题")                 # 方法都带 set_ 前缀
ax.set_xlabel("x")
ax.set_ylabel("y")
```

```
概念层次：
Figure（画布）
  └── Axes（坐标系，一张图）
        ├── 标题、轴标签
        ├── 刻度、图例、网格
        └── 线、点、柱（artist）
```

### 使用内置样式

```python
print(plt.style.available)          # 查看所有可用样式
plt.style.use("seaborn-v0_8-darkgrid")   # 应用样式
plt.style.use("ggplot")             # ggplot 风格

# 临时用某样式
with plt.style.context("dark_background"):
    plt.plot(x, y)
```

---

# 第二部分：seaborn

## 六、seaborn 统计可视化

seaborn 基于 matplotlib，默认样式更美观，一行代码画出复杂统计图。

```python
import seaborn as sns
import pandas as pd

# 加载示例数据集
tips = sns.load_dataset("tips")     # 餐厅小费数据
sns.set_theme(style="whitegrid")    # 设置主题风格
```

### 关系图

```python
# 散点图（可按类别着色/分形状）
sns.scatterplot(data=tips, x="total_bill", y="tip",
                hue="time", style="smoker", size="size")

# 折线图（自动聚合、画置信区间）
sns.lineplot(data=tips, x="size", y="total_bill", hue="time")

# 关系图矩阵（多变量两两关系）
sns.relplot(data=tips, x="total_bill", y="tip", hue="day", col="time")
```

### 分布图

```python
# 直方图 + 核密度
sns.histplot(tips["total_bill"], kde=True, bins=20)

# 核密度估计
sns.kdeplot(tips["total_bill"])

# 箱线图 / 小提琴图
sns.boxplot(data=tips, x="day", y="total_bill")
sns.violinplot(data=tips, x="day", y="total_bill", hue="sex")

# 多变量分布
sns.pairplot(tips, hue="sex")       # 散点矩阵（探索多列关系神器）
```

### 分类图与热力图

```python
# 柱状图（自动聚合，带误差棒）
sns.barplot(data=tips, x="day", y="total_bill", hue="sex")

# 计数图
sns.countplot(data=tips, x="day")

# 热力图（常配合相关系数矩阵）
corr = tips.corr(numeric_only=True)      # 相关系数矩阵
sns.heatmap(corr, annot=True, cmap="coolwarm",
            center=0, fmt=".2f", square=True)
plt.show()
```

> [!TIP]
> **热力图 + 相关系数矩阵**是数据分析经典组合：`sns.heatmap(df.corr(), annot=True)` 一眼看出哪些变量强相关（颜色越深相关性越强），对特征选择、多重共线性判断很有用。

```
seaborn vs matplotlib：
- seaborn 默认美观、统计图强（自动聚合/置信区间/分面）
- 底层仍是 matplotlib，可用 ax 参数嵌入子图，也可 plt 二次调整
- 快速探索数据、画统计图用 seaborn；高度定制用 matplotlib
```

---

# 第三部分：pyecharts

## 七、pyecharts 交互式图表

pyecharts 生成**可交互的 HTML 图表**（缩放、悬浮提示、图例切换），适合网页报表和大屏。

```python
from pyecharts.charts import Bar, Line, Pie
from pyecharts import options as opts

# 柱状图
bar = (
    Bar()
    .add_xaxis(["衬衫", "毛衣", "领带", "裤子", "风衣"])
    .add_yaxis("商家A", [114, 55, 27, 101, 125])
    .add_yaxis("商家B", [150, 48, 66, 108, 97])
    .set_global_opts(title_opts=opts.TitleOpts(title="销量对比"))
)
bar.render("bar.html")              # 生成交互式 HTML

# 折线图
line = (
    Line()
    .add_xaxis(["周一", "周二", "周三", "周四", "周五"])
    .add_yaxis("销售额", [150, 230, 224, 218, 135])
    .set_global_opts(
        title_opts=opts.TitleOpts(title="周销售趋势"),
        xaxis_opts=opts.AxisOpts(name="日期"),
        yaxis_opts=opts.AxisOpts(name="金额"),
    )
)
line.render("line.html")

# 饼图
pie = (
    Pie()
    .add("", [list(z) for z in zip(["A", "B", "C"], [10, 20, 30])])
    .set_global_opts(title_opts=opts.TitleOpts(title="占比"))
    .set_series_opts(label_opts=opts.LabelOpts(formatter="{b}: {d}%"))
)
pie.render("pie.html")
```

```python
# 链式调用是 pyecharts 特色：
# .add_xaxis() / .add_yaxis()  加数据
# .set_global_opts()           全局配置（标题/坐标轴/图例）
# .set_series_opts()           系列配置（标签/颜色）
# .render("x.html")            输出 HTML；.render_notebook() 在 Jupyter 显示
```

> [!NOTE]
> pyecharts 图表是 **HTML 文件**，能在浏览器交互（悬浮看数值、点击图例隐藏/显示、缩放）。常用于数据大屏、Web 报表。要嵌入网页可用 `render()` 生成 HTML 后 iframe 引用，或 `render_embed()` 内嵌。其他交互库还有 Plotly、Bokeh。

---

## 八、与 pandas 集成

pandas 内置绘图接口（底层 matplotlib/seaborn），快速出图。

```python
import pandas as pd

df = pd.DataFrame({
    "月份": ["1月", "2月", "3月", "4月"],
    "销量": [100, 150, 130, 180],
    "利润": [30, 50, 40, 60],
}).set_index("月份")

# pandas 直接画图
df.plot(kind="line", figsize=(8, 5))       # 折线图
df.plot(kind="bar")                        # 柱状图
df["销量"].plot(kind="pie", autopct="%1.1f%%")  # 饼图
df.plot(kind="area", stacked=True)         # 面积图
df.plot.scatter(x="销量", y="利润")        # 散点图
plt.show()

# 结合 seaborn
sns.lineplot(data=df, x="月份", y="销量")
```

---

## 常见问题 Q&A

**Q1：matplotlib 中文显示成方块/乱码？**
A：设置中文字体 `plt.rcParams["font.sans-serif"] = ["SimHei"]`（Windows 黑体）或 Mac 用 `["Arial Unicode MS"]`；再加 `plt.rcParams["axes.unicode_minus"] = False` 修复负号。Linux 需先安装中文字体（如文泉驿）。

**Q2：matplotlib 和 seaborn 什么关系？该学哪个？**
A：seaborn 建立在 matplotlib 之上，是它的高级封装。seaborn 默认样式好看、统计图（分布、关系、热力图）一行搞定；matplotlib 更底层、定制性最强。建议：快速探索用 seaborn，深度定制用 matplotlib，两者结合最佳。

**Q3：图表太多参数记不住怎么办？**
A：不用死记。掌握核心套路：`figure/subplots` 建画布 → `plot/bar/scatter/hist` 画图 → `set_title/xlabel/legend` 装饰 → `savefig/show` 输出。具体参数查官方文档或 Gallery（ matplotlib 官网的图例画廊，找到想要的图复制代码改）。

**Q4：`plt.plot()` 和面向对象 `ax.plot()` 怎么选？**
A：简单单图用 `plt.xxx()`（pyplot 状态式）够用；多图、子图、要精细控制时用面向对象（`fig, ax = plt.subplots()` 然后 `ax.xxx()`），逻辑更清晰，不容易画错位置。官方推荐面向对象式。

**Q5：图片保存模糊？**
A：`plt.savefig("x.png", dpi=150)` 提高 dpi（默认 100，论文/汇报建议 150~300）；加 `bbox_inches="tight"` 去掉多余白边。矢量图存 PDF/SVG（`savefig("x.pdf")`）无限放大不糊。

**Q6：pyecharts 和 matplotlib 存图有什么区别？**
A：matplotlib 存的是**静态图片**（PNG/SVG/PDF），适合论文、报告；pyecharts 存的是**交互式 HTML**，能悬浮、缩放、切换图例，适合网页、大屏、Dashboard。需要交互就用 pyecharts/Plotly。

**Q7：怎么做数据大屏/仪表盘？**
A：pyecharts（可组合多图成 Page/Grid/Tab）、Plotly Dash（Python Web 仪表盘框架）、Streamlit（快速做数据 App）、Grafana（监控大屏）。轻量快速用 Streamlit，专业大屏用 pyecharts/ECharts。

---

## 复习卡片

> [!TIP]
> **数据可视化速记**
>
> 1. **三剑客**：matplotlib（基础灵活）、seaborn（统计美观）、pyecharts（交互网页）
> 2. **中文不乱码**：`rcParams["font.sans-serif"]=["SimHei"]` + `axes.unicode_minus=False`
> 3. **绘图套路**：figure → plot → 装饰(title/label/legend/grid) → savefig(dpi)/show
> 4. **图表选型**：趋势折线、对比柱状、占比饼图、相关散点、分布直方/箱线
> 5. **子图**：`fig, axes = plt.subplots(行, 列)` + `tight_layout()`
> 6. **面向对象**：Figure > Axes > artist，方法带 `set_` 前缀，多图首选
> 7. **seaborn**：`scatterplot/lineplot/histplot/boxplot/violinplot/barplot`
> 8. **热力图**：`sns.heatmap(df.corr(), annot=True)` 看变量相关性
> 9. **pyecharts**：链式调用 add_xaxis/add_yaxis/set_global_opts → render HTML
> 10. **pandas 集成**：`df.plot(kind="line/bar/pie/scatter")` 快速出图

---

> [!TIP]
> 下一篇：[机器学习入门](/blog/posts/python-roadmap-14-machine-learning/) 将讲解机器学习基础概念、scikit-learn 使用流程、监督学习（kNN/决策树/回归）、无监督学习（聚类/降维）、模型评估与调优，以及神经网络初步。
>
> 返回 [Python 学习路线总览](/blog/posts/python-roadmap-00-overview/) | [合集页](/blog/python-roadmap/)
