---
title: 'Django 入门'
published: 2026-09-18T13:30:00+08:00
description: 'Django Web 框架入门：Web 与 HTTP 基础、项目结构与 MVT 模式、URL/视图/模板、ORM 模型与 CRUD、Admin 后台、静态资源与 Ajax、Cookie 与 Session、报表与日志、中间件应用。'
tags: [Python, Django, Web开发, ORM, MVT, 中间件]
category: Python学习路线
draft: false
---

> [!NOTE]
> 本文对应仓库 **Day46~52**：Django 快速上手、深入模型、静态资源与 Ajax、Cookie 与 Session、报表与日志、调试工具栏、中间件应用。Django 是 Python 最主流的全功能 Web 框架，"batteries included"（自带电池），掌握它能快速开发企业级网站。

---

## 一、Web 应用与 HTTP 基础

在学框架前，先搞懂 Web 是怎么工作的。

### 请求-响应模型（B/S 架构）

```
浏览器（Client）  ──HTTP 请求──▶  服务器（Server）
                 ◀──HTTP 响应──
```

Web 应用是 **B/S（Browser/Server）架构**，浏览器和服务器通过 **HTTP 协议**通信。HTTP 是**无状态**的——每次请求相互独立，服务器默认不记得"你是谁"，这就是后面 Cookie/Session 存在的原因。

### HTTP 请求方法

| 方法 | 用途 | 幂等 |
|:--|:--|:--|
| GET | 获取资源（查询） | 是 |
| POST | 创建资源（提交表单） | 否 |
| PUT | 更新资源（整体替换） | 是 |
| PATCH | 局部更新 | 否 |
| DELETE | 删除资源 | 是 |

```
一个 HTTP 请求包含：
- 请求行：GET /index.html HTTP/1.1（方法 + 路径 + 协议版本）
- 请求头：Host、User-Agent、Cookie、Content-Type 等
- 请求体：POST/PUT 的数据（表单或 JSON）

一个 HTTP 响应包含：
- 状态行：HTTP/1.1 200 OK（协议 + 状态码 + 描述）
- 响应头：Content-Type、Content-Length、Set-Cookie 等
- 响应体：HTML/JSON/文件内容
```

### 常见状态码

```
2xx 成功：200 OK、201 Created、204 No Content
3xx 重定向：301 永久重定向、302 临时重定向、304 Not Modified（缓存）
4xx 客户端错误：400 请求错误、401 未认证、403 无权限、404 找不到
5xx 服务器错误：500 内部错误、502 网关错误、503 服务不可用
```

---

## 二、Django 概述与安装

### 什么是 Django

Django 是高级 Python Web 框架，遵循 **MVT** 模式，自带 ORM、Admin 后台、认证系统、表单处理、模板引擎等，让开发者专注于业务而非重复造轮子。

| 组件 | 作用 |
|:--|:--|
| Models（模型） | 数据结构，对应数据库表，通过 ORM 操作 |
| Views（视图） | 业务逻辑，接收请求、处理、返回响应 |
| Templates（模板） | 页面展示，HTML + Django 模板语法 |
| URLs（路由） | 把 URL 映射到视图函数 |

> [!NOTE]
> **MVC vs MVT**：传统 MVC 是 Model-View-Controller。Django 里 View 相当于 Controller（业务逻辑），Template 相当于 View（展示）。整体框架（URL 分发）充当 Controller。

### 安装与创建项目

```bash
# 安装 Django
pip install django

# 查看版本
django-admin --version

# 创建项目（会生成一个项目目录）
django-admin startproject mysite
cd mysite

# 创建应用（一个项目可有多个应用）
python manage.py startapp blog

# 数据库迁移
python manage.py migrate

# 创建超级管理员（用于登录 Admin 后台）
python manage.py createsuperuser

# 启动开发服务器（默认 8000 端口）
python manage.py runserver
```

### 项目结构

```
mysite/
├── manage.py              # 项目管理命令入口
├── mysite/                # 项目配置目录
│   ├── __init__.py
│   ├── settings.py        # 全局配置（数据库、应用、中间件）
│   ├── urls.py            # 根路由
│   ├── asgi.py            # ASGI 入口（异步）
│   └── wsgi.py            # WSGI 入口（同步）
└── blog/                  # 应用目录
    ├── __init__.py
    ├── admin.py           # Admin 后台注册
    ├── apps.py            # 应用配置
    ├── models.py          # 数据模型
    ├── views.py           # 视图
    ├── urls.py            # 应用路由（需自己创建）
    ├── tests.py           # 测试
    └── migrations/        # 数据库迁移记录
```

---

## 三、第一个 Django 视图（Day46 五分钟上手）

### 编写视图

```python
# blog/views.py
from django.http import HttpResponse

def index(request):
    """最简单的视图：返回一个 HttpResponse"""
    return HttpResponse("Hello, Django!")

def detail(request, post_id):
    """带参数的视图：从 URL 取参数"""
    return HttpResponse(f"文章详情，ID = {post_id}")
```

### 配置路由

```python
# blog/urls.py（应用级路由，需自己创建）
from django.urls import path
from . import views

app_name = "blog"      # 命名空间，用于反向解析

urlpatterns = [
    path("", views.index, name="index"),               # 访问 /blog/
    path("<int:post_id>/", views.detail, name="detail"), # 访问 /blog/1/
]
```

```python
# mysite/urls.py（根路由，包含应用路由）
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("blog/", include("blog.urls")),   # 把 blog 应用的路由挂到 /blog/ 下
]
```

### 注册应用与配置

```python
# mysite/settings.py
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "blog",                    # 注册自己的应用
]

# 数据库配置（默认 SQLite，可换成 MySQL）
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}
```

> [!TIP]
> 启动 `python manage.py runserver` 后访问 `http://127.0.0.1:8000/blog/` 就能看到 "Hello, Django!"。这就是 Django 的最小闭环：**URL → 视图 → 响应**。

---

## 四、深入模型与 ORM（Day47）

ORM（对象关系映射）让你**用 Python 类操作数据库表**，无需写 SQL。

### 定义模型

```python
# blog/models.py
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):          # 定义对象的可读表示
        return self.name

class Post(models.Model):
    # 字段类型对应数据库列类型
    title = models.CharField(max_length=200)              # 字符串
    content = models.TextField()                          # 大文本
    views = models.IntegerField(default=0)                # 整数，默认 0
    is_published = models.BooleanField(default=False)     # 布尔
    created_at = models.DateTimeField(auto_now_add=True)  # 创建时间
    updated_at = models.DateTimeField(auto_now=True)      # 更新时间

    # 关系字段
    category = models.ForeignKey(                         # 多对一
        Category, on_delete=models.CASCADE, related_name="posts"
    )
    tags = models.ManyToManyField("Tag")                  # 多对多

    class Meta:
        ordering = ["-created_at"]      # 默认排序（- 降序）
        db_table = "blog_post"          # 自定义表名

    def __str__(self):
        return self.title

class Tag(models.Model):
    name = models.CharField(max_length=30)
    def __str__(self):
        return self.name
```

### 常用字段类型

| 字段 | 数据库类型 | 说明 |
|:--|:--|:--|
| `CharField(max_length)` | VARCHAR | 短字符串（必填 max_length） |
| `TextField` | TEXT | 长文本 |
| `IntegerField` | INT | 整数 |
| `FloatField` / `DecimalField` | FLOAT/DECIMAL | 小数（金额用 Decimal） |
| `BooleanField` | BOOL | 布尔 |
| `DateField` / `DateTimeField` | DATE/DATETIME | 日期/日期时间 |
| `ForeignKey` | 外键 | 多对一关系 |
| `OneToOneField` | 外键唯一 | 一对一 |
| `ManyToManyField` | 中间表 | 多对多 |

### 迁移

```bash
# 1. 生成迁移文件（根据模型变化生成 SQL）
python manage.py makemigrations

# 2. 执行迁移（应用到数据库）
python manage.py migrate

# 查看某应用的 SQL（不执行）
python manage.py sqlmigrate blog 0001
```

> [!WARNING]
> 每次修改 `models.py` 后，必须先 `makemigrations` 再 `migrate`，否则数据库不会同步。迁移文件（`migrations/` 目录）要纳入版本控制。

### ORM 之 CRUD

```python
from blog.models import Post, Category

# 增（Create）
cat = Category.objects.create(name="技术")
post = Post(title="标题", content="内容", category=cat)
post.save()                                  # 或者 Post.objects.create(...)

# 查（Read）——返回 QuerySet（惰性，用到才查库）
Post.objects.all()                           # 全部
Post.objects.get(id=1)                       # 唯一一条（找不到抛异常）
Post.objects.filter(is_published=True)       # 条件过滤
Post.objects.exclude(is_published=False)     # 排除
Post.objects.filter(title__contains="Django") # 模糊查询（双下划线）
Post.objects.filter(views__gt=100)           # 大于
Post.objects.filter(category__name="技术")    # 跨关系查询
Post.objects.order_by("-views")[:10]         # 排序 + 切片（Top10）
Post.objects.first()                         # 第一条
Post.objects.count()                         # 计数

# 改（Update）
post = Post.objects.get(id=1)
post.views += 1
post.save()                                  # 保存整个对象
Post.objects.filter(id=1).update(views=99)   # 批量更新（更高效）

# 删（Delete）
post.delete()                                # 删单条
Post.objects.filter(is_published=False).delete()  # 批量删
```

### 查询条件（双下划线）

```
__exact / __iexact   精确 / 忽略大小写
__contains           包含（LIKE %x%）
__startswith / __endswith  以...开头/结尾
__in                 在列表中
__gt / __gte         大于 / 大于等于
__lt / __lte         小于 / 小于等于
__range              范围（BETWEEN）
__isnull             是否为 NULL
```

### 关联查询优化（N+1 问题）

```python
# ❌ N+1 问题：查 N 篇文章，每篇访问 category 又查一次库（共 N+1 次）
for post in Post.objects.all():
    print(post.category.name)

# ✅ select_related：一次 JOIN 把外键对象一起查出来（多对一）
for post in Post.objects.select_related("category").all():
    print(post.category.name)

# ✅ prefetch_related：多对多/反向外键，两次查询后在内存组装
for post in Post.objects.prefetch_related("tags").all():
    print([t.name for t in post.tags.all()])
```

> [!TIP]
> `select_related` 用 SQL JOIN，适合 ForeignKey/OneToOne；`prefetch_related` 分开查再合并，适合 ManyToMany/反向关系。合理用它们能大幅减少数据库查询次数。

### Admin 后台

```python
# blog/admin.py
from django.contrib import admin
from .models import Post, Category

@admin.register(Post)              # 注册模型到后台
class PostAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "views", "is_published", "created_at"]
    list_filter = ["is_published", "category"]     # 侧边筛选
    search_fields = ["title", "content"]          # 搜索框
    ordering = ["-created_at"]
    list_editable = ["is_published"]              # 列表页可直接编辑

admin.site.register(Category)      # 另一种注册方式
```

创建超级管理员后访问 `http://127.0.0.1:8000/admin/`，即可用图形界面管理数据，非常适合后台增删改查。

---

## 五、视图进阶与模板

### 类视图与通用视图

```python
# blog/views.py
from django.views.generic import ListView, DetailView
from .models import Post

# ListView：列表页（自动分页、传 object_list 给模板）
class PostListView(ListView):
    model = Post
    template_name = "blog/post_list.html"
    context_object_name = "posts"
    paginate_by = 10

# DetailView：详情页
class PostDetailView(DetailView):
    model = Post
    template_name = "blog/post_detail.html"
```

### 模板语法

```html
<!-- blog/templates/blog/post_list.html -->
{% extends "base.html" %}          <!-- 继承父模板 -->

{% block content %}                <!-- 填充内容块 -->
<h1>文章列表</h1>
<ul>
    {% for post in posts %}        <!-- 循环 -->
    <li>
        <a href="{% url 'blog:detail' post.id %}">{{ post.title }}</a>
        {% if post.views > 100 %}🔥{% endif %}   <!-- 条件 -->
    </li>
    {% empty %}
    <li>暂无文章</li>
    {% endfor %}
</ul>

<!-- 分页 -->
{% if is_paginated %}
    {% if page_obj.has_previous %}
        <a href="?page={{ page_obj.previous_page_number }}">上一页</a>
    {% endif %}
    第 {{ page_obj.number }} / {{ page_obj.paginator.num_pages }} 页
{% endif %}
{% endblock %}
```

```
模板语法速记：
{{ 变量 }}        输出变量（自动 HTML 转义）
{% 标签 %}        逻辑标签（for/if/extends/block/url）
{# 注释 #}        注释
{{ post.title }}  访问属性/方法
{{ list|length }} 过滤器（管道）
```

> [!NOTE]
> 模板中的 `{{ }}` 会自动做 **HTML 转义**防 XSS 攻击。如果确实要输出原始 HTML，用 `{{ content|safe }}`，但要确保内容可信。

---

## 六、静态资源与 Ajax（Day48）

### 静态资源

```python
# settings.py
STATIC_URL = "/static/"                       # URL 前缀
STATICFILES_DIRS = [BASE_DIR / "static"]      # 静态文件目录
```

```html
{% load static %}                              <!-- 先加载 static 标签 -->
<img src="{% static 'images/logo.png' %}">
<link rel="stylesheet" href="{% static 'css/style.css' %}">
```

### Ajax 异步请求

用 JavaScript（fetch）实现无刷新更新，Django 返回 JSON。

```python
# blog/views.py
from django.http import JsonResponse
from django.views.decorators.http import require_POST

@require_POST                        # 只接受 POST
def like_post(request, post_id):
    post = Post.objects.get(id=post_id)
    post.views += 1
    post.save()
    return JsonResponse({"code": 200, "views": post.views})
```

```javascript
// 前端 fetch 请求
fetch('/blog/api/like/1/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),   // CSRF 令牌（见下）
    },
    body: JSON.stringify({}),
})
.then(resp => resp.json())
.then(data => console.log(data.views));

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
```

> [!WARNING]
> Django 对 POST/PUT/DELETE 默认启用 **CSRF 保护**。Ajax 请求必须在头部带上 `X-CSRFToken`（值取自 `csrftoken` Cookie），否则会返回 403。表单则用 `{% csrf_token %}` 标签。

---

## 七、Cookie 与 Session（Day49）

HTTP 无状态，靠 Cookie/Session 实现"记住用户"。

### Cookie（存在浏览器）

```python
# 设置 Cookie（在响应对象上）
def set_cookie(request):
    response = HttpResponse("已设置 Cookie")
    response.set_cookie("username", "tom", max_age=3600)  # 1 小时过期
    return response

# 读取 Cookie
def get_cookie(request):
    username = request.COOKIES.get("username")
    return HttpResponse(f"你好，{username}")
```

### Session（存在服务器）

```python
# 写 Session
request.session["user_id"] = 123
request.session["cart"] = {"item1": 2}

# 读 Session
user_id = request.session.get("user_id")

# 删 Session
del request.session["user_id"]
request.session.flush()        # 清空当前会话
```

```
Cookie vs Session：
┌──────────┬──────────────────┬──────────────────┐
│          │ Cookie           │ Session          │
├──────────┼──────────────────┼──────────────────┤
│ 存储位置 │ 浏览器           │ 服务器           │
│ 安全性   │ 较低（用户可见） │ 较高             │
│ 容量     │ 约 4KB           │ 较大             │
│ 生命周期 │ 可设过期时间     │ 默认 2 周        │
│ 关联     │ SessionID 存 Cookie，服务器用 SessionID 找数据 │
└──────────┴──────────────────┴──────────────────┘
```

> [!NOTE]
> Session 的实现依赖 Cookie：服务器把 `sessionid` 存进浏览器 Cookie，下次请求带回来，服务器据此找到对应的会话数据。Django 默认把 Session 存数据库，也可配置存缓存（Redis）提升性能。

### Django 内置用户认证

```python
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required

def user_login(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)              # 登录（写入 Session）
            return redirect("blog:index")
    return render(request, "login.html")

@login_required                               # 未登录自动跳登录页
def profile(request):
    return HttpResponse(f"你好，{request.user.username}")

def user_logout(request):
    logout(request)                           # 退出
    return redirect("blog:index")
```

---

## 八、报表与日志（Day50-51）

### 生成报表（导出 Excel / PDF）

```python
# 导出 Excel（用 xlwt）
import xlwt
from django.http import HttpResponse

def export_excel(request):
    response = HttpResponse(content_type="application/vnd.ms-excel")
    response["Content-Disposition"] = 'attachment; filename="posts.xls"'

    wb = xlwt.Workbook(encoding="utf-8")
    ws = wb.add_sheet("文章")
    ws.write(0, 0, "标题")           # 表头
    ws.write(0, 1, "阅读量")
    row = 1
    for post in Post.objects.all():
        ws.write(row, 0, post.title)
        ws.write(row, 1, post.views)
        row += 1
    wb.save(response)               # 直接写入响应流
    return response

# 导出 PDF 用 reportlab；前端图表用 ECharts（后端提供 JSON 数据接口）
```

### 日志

```python
# settings.py 配置日志
LOGGING = {
    "version": 1,
    "handlers": {
        "file": {
            "level": "WARNING",
            "class": "logging.FileHandler",
            "filename": "debug.log",
        },
    },
    "loggers": {
        "django": {"handlers": ["file"], "level": "WARNING"},
    },
}
```

```python
# 视图中记录日志
import logging
logger = logging.getLogger(__name__)

def index(request):
    logger.info("访问首页")
    logger.warning("这条会写入文件")
    return HttpResponse("OK")
```

```
日志级别（由低到高）：DEBUG < INFO < WARNING < ERROR < CRITICAL
设置某级别后，只记录该级别及以上的日志。
```

### Django Debug Toolbar

```python
# 开发利器：显示 SQL 查询、请求耗时、模板渲染等
pip install django-debug-toolbar

# settings.py
INSTALLED_APPS += ["debug_toolbar"]
MIDDLEWARE += ["debug_toolbar.middleware.DebugToolbarMiddleware"]
INTERNAL_IPS = ["127.0.0.1"]

# urls.py（DEBUG=True 时挂载）
if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [path("__debug__/", include(debug_toolbar.urls))]
```

> [!TIP]
> Debug Toolbar 能直观看到每个请求执行了多少条 SQL、耗时多少，是排查 **N+1 查询**和性能问题的第一工具。仅用于开发环境，生产务必关闭。

---

## 九、中间件（Day52）

中间件是介于**请求进来**和**响应出去**之间的钩子，全局处理请求/响应。

```
请求 → 中间件1 → 中间件2 → ... → 视图 → ... → 中间件2 → 中间件1 → 响应
       （洋葱模型：进来从上到下，出去从下到上）
```

### Django 内置中间件

| 中间件 | 作用 |
|:--|:--|
| `SecurityMiddleware` | 安全相关（HTTPS 重定向等） |
| `SessionMiddleware` | Session 管理 |
| `CommonMiddleware` | URL 规范化、APPEND_SLASH |
| `CsrfViewMiddleware` | CSRF 保护 |
| `AuthenticationMiddleware` | 把 user 绑定到 request |
| `MessageMiddleware` | 一次性消息提示（flash） |

### 自定义中间件

```python
# blog/middleware.py
import time
import logging

logger = logging.getLogger(__name__)

class RequestTimeMiddleware:
    """记录每个请求的处理耗时"""
    def __init__(self, get_response):
        self.get_response = get_response       # 保存下一个中间件/视图

    def __call__(self, request):
        start = time.time()                    # 请求进来（视图前）
        response = self.get_response(request)  # 调用后续处理
        duration = time.time() - start         # 响应出去（视图后）
        logger.info(f"{request.path} 耗时 {duration:.3f}s")
        return response
```

```python
# settings.py 注册（顺序很重要）
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "blog.middleware.RequestTimeMiddleware",   # 加自己的
    # ...
]
```

> [!NOTE]
> 中间件顺序影响执行时机：越靠上，请求阶段越早执行、响应阶段越晚执行。典型用途：记录耗时、IP 黑名单、请求日志、全局异常处理、修改请求/响应头。

---

## 常见问题 Q&A

**Q1：Django 和 Flask 怎么选？**
A：Django 是"全家桶"，自带 ORM、Admin、认证，适合中大型、快速开发、功能完整的项目；Flask 是"微框架"，轻量灵活，适合小型应用或需要高度定制的场景。企业级后台、CMS 类首选 Django。

**Q2：一个 Project 和一个 App 什么关系？**
A：Project 是整个网站（含全局配置），App 是可复用的功能模块（如博客、用户、评论）。一个 Project 可包含多个 App，App 理论上能在不同 Project 间复用。

**Q3：`get()` 和 `filter()` 有什么区别？**
A：`get()` 返回**单个对象**，找不到抛 `DoesNotExist`，找到多个抛 `MultipleObjectsReturned`；`filter()` 返回 **QuerySet**（可能 0 到多条），不报错。取单条确定存在的用 `get()`，不确定用 `filter().first()`。

**Q4：QuerySet 是惰性的，什么意思？**
A：写了 `Post.objects.filter(...)` 并不会立即查数据库，只有在你**遍历、切片、count()、len()、bool()** 等"求值"操作时才真正执行 SQL。所以可以把 QuerySet 传来传去组合，直到需要数据才查库。

**Q5：如何解决 N+1 查询问题？**
A：用 `select_related()`（ForeignKey/OneToOne，SQL JOIN）和 `prefetch_related()`（ManyToMany/反向关系，分查再合并）预加载关联数据。配合 Debug Toolbar 观察 SQL 数量验证效果。

**Q6：`makemigrations` 和 `migrate` 的区别？**
A：`makemigrations` 根据模型改动**生成迁移文件**（记录要执行的 SQL）；`migrate` **执行**这些迁移文件，把改动应用到数据库。前者是"计划"，后者是"执行"。

**Q7：CSRF 是什么？为什么 Ajax 要带 token？**
A：CSRF（跨站请求伪造）指攻击者诱导用户在已登录的站点执行非预期操作。Django 默认对 POST 等请求校验 CSRF token。Ajax 请求要在头里带 `X-CSRFToken`，让服务器确认请求来自本站，否则返回 403。

---

## 复习卡片

> [!TIP]
> **Django 入门速记**
>
> 1. **MVT 模式**：Model（数据/ORM）、View（业务逻辑）、Template（展示），URL 分发充当 Controller
> 2. **最小闭环**：URL（path）→ 视图（返回 HttpResponse）→ 响应；`runserver` 启动
> 3. **ORM 字段**：CharField/TextField/IntegerField/DateTimeField + ForeignKey/ManyToMany
> 4. **迁移两步**：`makemigrations`（生成）→ `migrate`（执行），改模型必做
> 5. **CRUD**：`objects.create/get/filter/exclude/update/delete`，双下划线条件（`__gt`/`__contains`）
> 6. **N+1 优化**：`select_related`（JOIN，一对多）、`prefetch_related`（分查合并，多对多）
> 7. **Admin 后台**：`@admin.register` + `list_display/list_filter/search_fields`
> 8. **Cookie/Session**：Cookie 存浏览器、Session 存服务器；`sessionid` 关联；`login_required`
> 9. **CSRF**：POST 请求需带 token，Ajax 用 `X-CSRFToken` 头，表单用 `{% csrf_token %}`
> 10. **中间件**：洋葱模型，全局处理请求/响应，常用于耗时统计、日志、IP 过滤

---

> [!TIP]
> 下一篇：[Django 进阶与 DRF](/blog/posts/python-roadmap-10-django-drf/) 将讲解 RESTful API 设计、Django Rest Framework（序列化器、视图集、路由器）、认证与权限、分页限流，以及 Django 项目的部署上线。
>
> 返回 [Python 学习路线总览](/blog/posts/python-roadmap-00-overview/) | [合集页](/blog/python-roadmap/)
