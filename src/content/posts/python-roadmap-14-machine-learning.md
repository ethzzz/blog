---
title: '机器学习入门'
published: 2026-09-18T16:00:00+08:00
description: '机器学习入门：核心概念与工作流程、scikit-learn 使用范式、监督学习（kNN/决策树/线性回归/逻辑回归/随机森林）、无监督学习（KMeans/PCA）、模型评估（准确率/混淆矩阵/交叉验证）与调优（网格搜索），以及神经网络初步。'
tags: [Python, 机器学习, scikit-learn, 监督学习, 聚类, 神经网络]
category: Python学习路线
draft: false
---

> [!NOTE]
> 本文对应仓库 **Day81~90**：机器学习基础、经典算法（kNN/决策树/回归/SVM/集成学习/聚类/降维）、模型评估与调优、神经网络初步。机器学习让程序从数据中自动学习规律，是人工智能的核心，也是数据分析的进阶方向。

---

## 一、机器学习基础

### 什么是机器学习

机器学习（Machine Learning）让计算机**从数据中自动学习规律**，无需显式编程，用学到的模型对新数据做预测。

```
传统编程：规则 + 数据 → [程序] → 答案
机器学习：数据 + 答案 → [训练] → 规则（模型）→ 预测新数据的答案
```

### 三大类机器学习

| 类型 | 特点 | 典型算法 | 应用 |
|:--|:--|:--|:--|
| **监督学习** | 有标签（知道正确答案） | kNN、决策树、回归、SVM、随机森林 | 分类、预测 |
| **无监督学习** | 无标签（自己找规律） | KMeans、层次聚类、PCA | 聚类、降维 |
| **强化学习** | 试错 + 奖惩反馈 | Q-Learning、DQN | 游戏、机器人 |

```
监督学习细分：
- 分类（Classification）：预测离散类别（垃圾邮件/正常，猫/狗）
- 回归（Regression）：预测连续数值（房价、股价、温度）
```

### 机器学习工作流程

```
1. 收集数据      →  爬虫/数据库/公开数据集
2. 数据预处理    →  清洗、缺失值、编码、归一化、特征工程
3. 划分数据集    →  训练集 / 验证集 / 测试集
4. 选择模型      →  根据问题类型选算法
5. 训练模型      →  fit(X_train, y_train)
6. 评估模型      →  准确率/精确率/召回率/混淆矩阵
7. 调优          →  超参数调优、交叉验证、特征选择
8. 部署预测      →  predict(X_new)
```

---

## 二、scikit-learn 使用范式

scikit-learn（sklearn）是最主流的机器学习库，API 高度统一。

```bash
pip install scikit-learn
```

```python
# 统一的 API 范式（所有模型都一样！）
from sklearn.model_selection import train_test_split

# 1. 加载数据（以鸢尾花为例）
from sklearn.datasets import load_iris
data = load_iris()
X = data.data          # 特征（输入）
y = data.target        # 标签（输出）

# 2. 划分训练集和测试集
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y
)
# test_size=0.3：30% 做测试；random_state：可复现；stratify：保持类别比例

# 3. 创建模型
from sklearn.neighbors import KNeighborsClassifier
model = KNeighborsClassifier(n_neighbors=5)

# 4. 训练（fit）
model.fit(X_train, y_train)

# 5. 预测（predict）
y_pred = model.predict(X_test)

# 6. 评估（score）
print(model.score(X_test, y_test))    # 准确率
```

> [!TIP]
> sklearn 所有模型都遵循 **`fit()` 训练 → `predict()` 预测 → `score()` 评估** 的统一接口。换模型只需换一行 import + 实例化，其余流程完全不变。这种一致性是 sklearn 好用的关键。

### 数据预处理

```python
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder, OneHotEncoder

# 标准化（均值0方差1，适合大多数算法）
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)   # 训练集 fit + transform
X_test = scaler.transform(X_test)         # 测试集只 transform（用训练集的参数！）

# 归一化（缩放到 [0,1]）
MinMaxScaler().fit_transform(X)

# 类别特征编码
LabelEncoder().fit_transform(["男", "女", "男"])        # → [1, 0, 1]（有序）
OneHotEncoder(sparse_output=False).fit_transform([["红"], ["蓝"]])  # 独热（无序）
```

> [!WARNING]
> **数据泄漏（Data Leakage）警告**：预处理（标准化/归一化）必须**先划分训练测试集，再分别处理**。测试集只能用 `transform()`（复用训练集的均值方差），绝不能 `fit_transform()`，否则测试集信息泄漏到训练，评估虚高。

---

## 三、监督学习算法

### 1. kNN（K 近邻）

原理：物以类聚。看新样本最近的 K 个邻居，投票决定类别（分类）或取平均（回归）。

```python
from sklearn.neighbors import KNeighborsClassifier

knn = KNeighborsClassifier(n_neighbors=5)   # K=5
knn.fit(X_train, y_train)
knn.predict([[5.1, 3.5, 1.4, 0.2]])

# K 值选择：太小易过拟合（受噪声影响），太大易欠拟合（边界模糊）
# 通常取奇数（避免平票），用交叉验证选最优 K
```

```
kNN 特点：
✅ 简单、无需训练（惰性学习）、天然支持多分类
❌ 预测慢（要算所有距离）、对特征尺度敏感（必须先标准化）、高维失效
适用：小数据、低维、需要简单基线模型
```

### 2. 决策树

原理：一系列 if-else 判断，像玩"二十个问题"，通过信息增益/基尼系数选择最佳分裂特征。

```python
from sklearn.tree import DecisionTreeClassifier, export_text

tree = DecisionTreeClassifier(max_depth=3, criterion="gini")
tree.fit(X_train, y_train)

# 查看决策规则
print(export_text(tree, feature_names=data.feature_names))

# 特征重要性
print(tree.feature_importances_)
```

```
决策树特点：
✅ 可解释性强（能画出树）、不用标准化、能处理数值和类别
❌ 易过拟合（需限制 max_depth / min_samples_split）
关键参数：max_depth（最大深度）、min_samples_split（分裂最小样本）
         criterion（gini 基尼 / entropy 信息熵）
```

### 3. 线性回归与逻辑回归

```python
# 线性回归（预测连续值，如房价）
from sklearn.linear_model import LinearRegression
reg = LinearRegression()
reg.fit(X_train, y_train)
print(reg.coef_)        # 系数（权重）
print(reg.intercept_)   # 截距
# 方程：y = w1*x1 + w2*x2 + ... + b

# 逻辑回归（尽管叫"回归"，其实是分类！输出概率）
from sklearn.linear_model import LogisticRegression
clf = LogisticRegression()
clf.fit(X_train, y_train)
clf.predict_proba(X_test)   # 输出各类别概率
```

> [!NOTE]
> **逻辑回归是分类算法**，不是回归！它用 Sigmoid 函数把线性输出压缩到 (0,1) 作为概率，常用于二分类（如是否点击、是否患病）。名字有迷惑性，别搞混。

```
过拟合 vs 欠拟合：
过拟合（Overfitting）：训练集很好，测试集差 → 模型太复杂，学到了噪声
                       解决：正则化、简化模型、增数据、交叉验证、剪枝
欠拟合（Underfitting）：训练集和测试集都差 → 模型太简单，没学到规律
                       解决：加特征、增复杂度、减正则化
```

### 4. 支持向量机（SVM）

原理：找一个**间隔最大**的超平面分隔不同类别，可用核函数处理非线性。

```python
from sklearn.svm import SVC

svm = SVC(kernel="rbf", C=1.0, gamma="scale")   # rbf 高斯核（非线性）
svm.fit(X_train, y_train)
# kernel: linear（线性）/ rbf（高斯，最常用）/ poly（多项式）
# C: 惩罚系数（大→不容错易过拟合，小→容忍错易欠拟合）
```

### 5. 集成学习（随机森林 / Boosting）

集成学习：组合多个弱模型成一个强模型（"三个臭皮匠顶个诸葛亮"）。

```python
# 随机森林（Bagging：多棵决策树并行投票，降方差防过拟合）
from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(n_estimators=100, max_depth=None, random_state=42)
rf.fit(X_train, y_train)
print(rf.feature_importances_)     # 特征重要性

# GradientBoosting（Boosting：树串行，每棵纠正前一棵的错误，降偏差）
from sklearn.ensemble import GradientBoostingClassifier
gb = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1)
gb.fit(X_train, y_train)
```

```
Bagging vs Boosting：
Bagging（随机森林）：并行训练多个模型投票，降方差，抗过拟合，可并行
Boosting（GBDT）：串行训练，后者纠正前者错误，降偏差，精度高，易过拟合
工业界更强：XGBoost / LightGBM / CatBoost（GBDT 的高效实现，竞赛常胜）
```

> [!TIP]
> 随机森林是**最实用的默认分类器**——精度高、抗过拟合、能评估特征重要性、几乎不用调参。拿到分类任务，先用随机森林跑个基线准没错。追求极致精度上 XGBoost/LightGBM。

---

## 四、无监督学习

### 1. KMeans 聚类

原理：把数据分成 K 个簇，使簇内距离最小、簇间距离最大。

```python
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs

X, _ = make_blobs(n_samples=300, centers=4, random_state=42)

kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
kmeans.fit(X)                      # 无需标签 y！
labels = kmeans.predict(X)         # 每个点的簇标签
print(kmeans.cluster_centers_)     # 各簇中心

# 用肘部法则选 K（画不同 K 的 inertia，找拐点）
inertias = [KMeans(n_clusters=k, n_init=10).fit(X).inertia_ for k in range(1, 10)]
```

```
KMeans 特点：
✅ 简单高效、易实现
❌ 需预先指定 K、对初始中心和异常值敏感、只适合凸形簇
肘部法则：inertia（簇内平方和）随 K 增大而减小，找"肘部"拐点即最优 K
```

### 2. PCA 降维

原理：把高维数据投影到低维，保留最大方差（信息），用于可视化、去噪、加速。

```python
from sklearn.decomposition import PCA

pca = PCA(n_components=2)          # 降到 2 维
X_reduced = pca.fit_transform(X)   # 降维
print(pca.explained_variance_ratio_)   # 各主成分解释的方差比例
# 若前2个主成分解释 >85% 方差，说明降维损失小
```

```
降维好处：减少特征数（防维度灾难）、可视化（降到2/3维）、去噪、加速训练
PCA 是最常用的线性降维；非线性降维有 t-SNE（可视化神器）、UMAP
```

---

## 五、模型评估与调优

### 分类评估指标

```python
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, confusion_matrix, classification_report)

y_true = [0, 1, 1, 0, 1]
y_pred = [0, 1, 0, 0, 1]

print(accuracy_score(y_true, y_pred))     # 准确率 = 对的/总数
print(precision_score(y_true, y_pred))    # 精确率 = TP/(TP+FP)  预测为正的里有多少真对
print(recall_score(y_true, y_pred))       # 召回率 = TP/(TP+FN)  真正的里找回多少
print(f1_score(y_true, y_pred))           # F1 = 精确率和召回率的调和平均
print(confusion_matrix(y_true, y_pred))   # 混淆矩阵
print(classification_report(y_true, y_pred))  # 综合报告
```

```
混淆矩阵（二分类）：
                预测正    预测负
实际正          TP        FN     （漏报）
实际负          FP        TN     （误报）

准确率 Accuracy  = (TP+TN)/总数        整体对的比例（类别不均衡时会骗人！）
精确率 Precision = TP/(TP+FP)         预测为正的准不准（重在不冤枉）
召回率 Recall    = TP/(TP+FN)         正样本找得全不全（重在不漏掉）
F1 = 2 * P*R/(P+R)                   精确率和召回率的平衡
```

> [!WARNING]
> **类别不均衡时准确率会骗人**：如 99% 正常、1% 欺诈，模型全预测"正常"也有 99% 准确率，但一个欺诈都没抓到（召回率=0）。此时要看**精确率、召回率、F1、AUC**，或用 SMOTE 过采样、调整类别权重。

### 交叉验证与网格搜索

```python
from sklearn.model_selection import cross_val_score, GridSearchCV

# K 折交叉验证（更可靠地评估模型，默认 5 折）
scores = cross_val_score(rf, X, y, cv=5, scoring="accuracy")
print(scores.mean(), scores.std())      # 5 次准确率的均值和标准差

# 网格搜索（自动找最优超参数组合）
param_grid = {
    "n_estimators": [50, 100, 200],
    "max_depth": [None, 5, 10],
}
grid = GridSearchCV(rf, param_grid, cv=5, scoring="accuracy", n_jobs=-1)
grid.fit(X, y)
print(grid.best_params_)                # 最优参数
print(grid.best_score_)                 # 最优得分
print(grid.best_estimator_)             # 最优模型
```

```
交叉验证：把数据分 K 份，轮流用 K-1 份训练、1 份验证，取平均。
         好处：充分利用数据、评估更稳定、减少过拟合风险。
网格搜索：遍历所有超参数组合，配合交叉验证选最优。
         参数多用 RandomizedSearchCV（随机采样，更快）。
```

### Pipeline（管道，防止数据泄漏）

```python
from sklearn.pipeline import Pipeline

# 把预处理 + 模型串成一条流水线
pipe = Pipeline([
    ("scaler", StandardScaler()),          # 先标准化
    ("clf", RandomForestClassifier()),     # 再分类
])
pipe.fit(X_train, y_train)                 # 一起 fit，自动避免数据泄漏
pipe.score(X_test, y_test)

# Pipeline 配合网格搜索（参数名用 "步骤名__参数名"）
GridSearchCV(pipe, {"clf__n_estimators": [50, 100]}, cv=5).fit(X, y)
```

---

## 六、神经网络初步

### 从神经元到深度学习

```
人工神经元：输入 x → 加权求和 + 偏置 → 激活函数 → 输出
   输出 = activation(w1*x1 + w2*x2 + ... + b)

激活函数（引入非线性）：
- ReLU：f(x)=max(0,x)      最常用，解决梯度消失
- Sigmoid：f(x)=1/(1+e^-x) 输出(0,1)，二分类输出层
- Softmax：多分类输出层（输出概率和为1）
- Tanh：输出(-1,1)

神经网络 = 多层神经元堆叠（输入层 → 隐藏层 → 输出层）
深度学习 = 多层（深层）神经网络
```

### sklearn 简易神经网络

```python
from sklearn.neural_network import MLPClassifier

mlp = MLPClassifier(hidden_layer_sizes=(64, 32),   # 两个隐藏层
                    activation="relu",
                    max_iter=1000, random_state=42)
mlp.fit(X_train, y_train)
print(mlp.score(X_test, y_test))
```

### 深度学习框架概览

```
sklearn MLP：小数据、快速原型
真正的深度学习用专业框架：
- PyTorch（学术界主流、动态图、灵活，推荐入门）
- TensorFlow/Keras（工业界、生态全、部署方便）
应用：CNN（图像）、RNN/LSTM（序列/时间）、Transformer（NLP/大模型）
```

> [!NOTE]
> 入门机器学习**不必一上来就深度学习**。传统 ML（随机森林、XGBoost）在中小规模表格数据上往往比深度学习更好、更快、更可解释。深度学习优势在**非结构化数据**（图像、语音、文本）和**海量数据**。按数据规模和类型选方法。

---

## 常见问题 Q&A

**Q1：分类和回归怎么区分？**
A：看预测目标是**离散类别**还是**连续数值**。预测"是/否垃圾邮件""猫/狗/鸟"是分类；预测"房价 320 万""明天气温 25 度"是回归。分类用逻辑回归/决策树/SVM，回归用线性回归/回归树。

**Q2：过拟合和欠拟合怎么判断和解决？**
A：看训练集和测试集表现。都差=欠拟合（模型太简单）→ 加特征/加复杂度/减正则；训练好测试差=过拟合（模型太复杂）→ 加数据/正则化/降复杂度/交叉验证/早停。画学习曲线能直观诊断。

**Q3：准确率很高但模型没用，为什么？**
A：**类别不均衡**！如 99% 负样本、1% 正样本，全猜负也有 99% 准确率，但漏掉所有正样本。解决：看精确率/召回率/F1/AUC，用 `class_weight="balanced"`，SMOTE 过采样，或调整决策阈值。

**Q4：特征要标准化吗？哪些算法需要？**
A：**基于距离/梯度的算法必须标准化**：kNN、KMeans、SVM、神经网络、线性/逻辑回归（带正则）。**基于树的算法不需要**：决策树、随机森林、XGBoost（只看分裂点排序，不看绝对值）。不确定就标准化，一般无害。

**Q5：怎么选模型？**
A：先明确问题类型（分类/回归/聚类）。表格数据首选随机森林/XGBoost（强且省心）；需要可解释用决策树/线性模型；小数据快速基线用 kNN/逻辑回归；图像/文本/语音用深度学习。多试几个用交叉验证比较。

**Q6：`fit_transform` 和 `transform` 有什么区别？**
A：`fit_transform` = 学习参数（如均值方差）+ 转换；`transform` = 用已学参数转换。训练集用 `fit_transform`，测试集**只能用 `transform`**（复用训练集参数），否则数据泄漏导致评估虚高。

**Q7：机器学习需要很强的数学吗？**
A：入门应用（调 sklearn API）**不需要**深厚数学，理解概念、会预处理和调参就能上手。但要深入（改进算法、读论文、调优模型）需要线性代数、概率统计、微积分（梯度下降）基础。建议先用起来，遇到瓶颈再补数学。

---

## 复习卡片

> [!TIP]
> **机器学习速记**
>
> 1. **三类 ML**：监督（有标签，分类/回归）、无监督（无标签，聚类/降维）、强化（奖惩）
> 2. **流程**：收集 → 预处理 → 划分 → 选模型 → fit 训练 → 评估 → 调优 → predict 部署
> 3. **sklearn 范式**：`fit(X_train,y_train)` → `predict(X_test)` → `score()`，所有模型统一
> 4. **预处理**：StandardScaler 标准化、编码；测试集只 `transform` 防泄漏
> 5. **算法**：kNN（近邻）、决策树（可解释）、逻辑回归（分类）、SVM（间隔最大）、随机森林（集成，首选）
> 6. **无监督**：KMeans（聚类，肘部法则选K）、PCA（降维，看方差比）
> 7. **评估**：准确率（不均衡会骗人）、精确率、召回率、F1、混淆矩阵、AUC
> 8. **过拟合**：训练好测试差 → 正则化/加数据/降复杂度；欠拟合反之
> 9. **调优**：`cross_val_score` 交叉验证 + `GridSearchCV` 网格搜索 + `Pipeline` 防泄漏
> 10. **深度学习**：神经元+激活函数(ReLU)堆叠；PyTorch/TensorFlow；表格数据传统 ML 常更优

---

> [!TIP]
> 下一篇：[项目实战、部署与面试](/blog/posts/python-roadmap-15-project-interview/) 是系列收官之作，将讲解综合项目实战思路、Python 项目部署（Docker/CI/CD）、工程化规范，以及 Python 高频面试题与学习路线总结。
>
> 返回 [Python 学习路线总览](/blog/posts/python-roadmap-00-overview/) | [合集页](/blog/python-roadmap/)
