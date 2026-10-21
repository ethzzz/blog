---
title: 'Django 进阶与 DRF'
published: 2026-09-18T14:00:00+08:00
description: 'Django 进阶与 Django Rest Framework：RESTful API 设计、DRF 序列化器、视图（APIView/ViewSet）、路由器、认证与权限、分页过滤限流、缓存优化，以及 uWSGI/Gunicorn + Nginx 部署上线。'
tags: [Python, Django, DRF, RESTful, API, 部署]
category: Python学习路线
draft: false
---

> [!NOTE]
> 本文对应仓库 **Day53~60**：RESTful 架构、DRF 序列化器与视图、路由器、认证权限、分页限流、缓存与部署。前后端分离时代，用 Django Rest Framework（DRF）快速构建 API 是后端开发者的核心技能。

---

## 一、RESTful API 设计

### 什么是 REST

REST（Representational State Transfer，表述性状态转移）是一种**软件架构风格**，核心思想：把一切都抽象为**资源**，用 URL 定位资源，用 HTTP 方法操作资源。

```
RESTful 设计原则：
1. 资源用名词，不用动词：/users ✅  /getUser ❌
2. 用 HTTP 方法表达操作：GET 查、POST 增、PUT/PATCH 改、DELETE 删
3. URL 表示资源层级：/users/1/posts（用户1的文章）
4. 无状态：每个请求自带全部信息（认证），服务器不存会话状态
5. 用 JSON 作为数据交换格式
```

### RESTful URL 设计示例

| 方法 | URL | 含义 |
|:--|:--|:--|
| GET | `/api/posts/` | 获取文章列表 |
| POST | `/api/posts/` | 创建新文章 |
| GET | `/api/posts/1/` | 获取 ID=1 的文章 |
| PUT | `/api/posts/1/` | 整体更新 ID=1 的文章 |
| PATCH | `/api/posts/1/` | 局部更新 ID=1 的文章 |
| DELETE | `/api/posts/1/` | 删除 ID=1 的文章 |

> [!NOTE]
> 同一个 URL `/api/posts/1/`，靠**不同的 HTTP 方法**区分操作，这是 REST 的精髓。而不是设计 `/api/getPost`、`/api/updatePost`、`/api/deletePost` 这种动词式 URL。

---

## 二、DRF 序列化器（Serializer）

序列化器负责 **模型对象 ↔ JSON** 的双向转换，同时做数据校验。

### 安装与配置

```bash
pip install djangorestframework
```

```python
# settings.py
INSTALLED_APPS = [
    # ...
    "rest_framework",
]
```

### ModelSerializer（最常用）

```python
# blog/serializers.py
from rest_framework import serializers
from .models import Post, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]        # 指定字段，或 "__all__"

class PostSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)     # 嵌套序列化（读）
    category_id = serializers.PrimaryKeyRelatedField( # 写时用 ID
        queryset=Category.objects.all(), source="category", write_only=True
    )
    author_name = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Post
        fields = ["id", "title", "content", "views",
                  "category", "category_id", "author_name", "created_at"]
        read_only_fields = ["views", "created_at"]    # 只读，不允许客户端改
```

### 序列化与反序列化

```python
# 序列化（对象 → JSON）：many=True 处理多条
posts = Post.objects.all()
serializer = PostSerializer(posts, many=True)
print(serializer.data)        # [{'id':1,'title':'...',...}, ...]

# 反序列化（JSON → 对象）：需校验
serializer = PostSerializer(data={"title": "新文章", "content": "..."})
if serializer.is_valid():                 # 校验数据
    serializer.save()                     # 创建对象
else:
    print(serializer.errors)              # 校验失败的错误信息

# 更新（传入 instance）
post = Post.objects.get(id=1)
serializer = PostSerializer(post, data={"title": "改标题"}, partial=True)  # partial 局部更新
if serializer.is_valid():
    serializer.save()
```

### 字段校验

```python
class PostSerializer(serializers.ModelSerializer):
    # 自定义校验：校验单个字段 validate_<字段名>
    def validate_title(self, value):
        if "敏感词" in value:
            raise serializers.ValidationError("标题含敏感词")
        return value

    # 全局校验：跨字段验证
    def validate(self, attrs):
        if attrs.get("start") and attrs.get("end"):
            if attrs["start"] > attrs["end"]:
                raise serializers.ValidationError("开始时间不能晚于结束时间")
        return attrs

    class Meta:
        model = Post
        fields = "__all__"
```

> [!TIP]
> 常用序列化字段：`CharField`、`IntegerField`、`BooleanField`、`DateTimeField`、`EmailField`、`SlugField`、`HyperlinkedIdentityField`（生成 URL）。校验器：`required`、`allow_null`、`max_length`、`validators`。

---

## 三、DRF 视图

DRF 提供多个层次的视图，从底层到高层越来越省事。

### 视图类层次

```
APIView（最基础，手写 get/post）
   └── GenericAPIView（增加 queryset/serializer_class）
          └── Mixin + GenericAPIView（组合出增删改查）
                 └── ViewSet（按 action 组织，配合 Router 自动生成路由）
                        └── ModelViewSet（一站式 CRUD）
```

### 1. APIView（最灵活）

```python
# blog/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Post
from .serializers import PostSerializer

class PostListView(APIView):
    def get(self, request):                # 处理 GET
        posts = Post.objects.all()
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)

    def post(self, request):               # 处理 POST
        serializer = PostSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

### 2. GenericAPIView + Mixin

```python
from rest_framework import generics, mixins

# 列表 + 创建
class PostList(mixins.ListModelMixin, mixins.CreateModelMixin,
               generics.GenericAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def get(self, request, *args, **kwargs):
        return self.list(request, *args, **kwargs)
    def post(self, request, *args, **kwargs):
        return self.create(request, *args, **kwargs)

# 更简洁：直接用封装好的通用视图
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

class PostListCreate(ListCreateAPIView):        # 列表 + 创建
    queryset = Post.objects.all()
    serializer_class = PostSerializer

class PostDetail(RetrieveUpdateDestroyAPIView): # 详情 + 改 + 删
    queryset = Post.objects.all()
    serializer_class = PostSerializer
```

### 3. ViewSet + ModelViewSet（最推荐）

```python
from rest_framework import viewsets
from .models import Post
from .serializers import PostSerializer

# ModelViewSet 一站式提供 list/create/retrieve/update/partial_update/destroy
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    # 自定义 action（额外接口）
    from rest_framework.decorators import action
    @action(detail=True, methods=["post"])     # detail=True 针对单个对象
    def publish(self, request, pk=None):
        post = self.get_object()
        post.is_published = True
        post.save()
        return Response({"status": "已发布"})
    # 访问 /api/posts/1/publish/
```

---

## 四、路由器（Router）

Router 能根据 ViewSet **自动生成 URL**，省去手写路由。

```python
# blog/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CategoryViewSet

router = DefaultRouter()
router.register("posts", PostViewSet, basename="post")
router.register("categories", CategoryViewSet, basename="category")

urlpatterns = [
    path("api/", include(router.urls)),
]
```

```
Router 自动生成的 URL：
GET    /api/posts/          列表（list）
POST   /api/posts/          创建（create）
GET    /api/posts/1/        详情（retrieve）
PUT    /api/posts/1/        更新（update）
PATCH  /api/posts/1/        局部更新（partial_update）
DELETE /api/posts/1/        删除（destroy）
GET    /api/                API 根视图（可浏览的接口首页）
```

> [!NOTE]
> DRF 自带**可浏览 API**（Browsable API）：浏览器访问接口会看到漂亮的 HTML 界面，能直接测试。生产环境可关闭，只保留 JSON。

---

## 五、认证与权限（Day57）

### 认证方式

| 认证方式 | 说明 | 适用场景 |
|:--|:--|:--|
| SessionAuthentication | 基于 Session/Cookie | 传统 Web、同源前后端 |
| TokenAuthentication | 基于 Token（存数据库） | 简单 API |
| JWTAuthentication | 基于 JSON Web Token | 前后端分离、移动端（推荐） |
| BasicAuthentication | HTTP Basic（用户名密码） | 测试、内部工具 |

```python
# JWT 认证（推荐，用 djangorestframework-simplejwt）
pip install djangorestframework-simplejwt

# settings.py
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
}

# urls.py（提供获取/刷新 token 的接口）
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
urlpatterns += [
    path("api/token/", TokenObtainPairView.as_view()),   # 用账号密码换 token
    path("api/token/refresh/", TokenRefreshView.as_view()), # 刷新 token
]
```

```
JWT 流程：
1. 用户 POST /api/token/ 提交账号密码 → 服务器返回 access + refresh token
2. 后续请求在头部带上：Authorization: Bearer <access_token>
3. access 过期后用 refresh token 换新的 access
4. JWT 无状态，服务器不存 session，适合分布式
```

### 权限控制

```python
from rest_framework.permissions import IsAuthenticated, IsAdminUser, BasePermission

# 内置权限类
# AllowAny         任何人可访问
# IsAuthenticated  仅登录用户
# IsAdminUser      仅管理员
# IsAuthenticatedOrReadOnly  登录可写，未登录只读

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]   # 应用权限

# 自定义权限：只有作者能改自己的文章
class IsAuthorOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True                       # 读操作放行
        return obj.author == request.user     # 写操作需是作者
```

---

## 六、分页、过滤与限流（Day58）

### 分页（Pagination）

```python
# settings.py 全局配置
REST_FRAMEWORK = {
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
}

# 响应格式：
# { "count": 100, "next": "...", "previous": null, "results": [...] }

# 自定义分页类
from rest_framework.pagination import PageNumberPagination, LimitOffsetPagination

class MyPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "size"      # 允许客户端指定每页数量 ?size=20
    max_page_size = 100
```

### 过滤（Filtering）

```bash
pip install django-filter
```

```python
import django_filters
from .models import Post

class PostFilter(django_filters.FilterSet):
    title = django_filters.CharFilter(lookup_expr="icontains")   # 模糊
    min_views = django_filters.NumberFilter(field_name="views", lookup_expr="gte")

    class Meta:
        model = Post
        fields = ["category", "is_published"]

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = PostFilter                 # 精确/自定义过滤
    search_fields = ["title", "content"]         # ?search=关键词
    ordering_fields = ["views", "created_at"]    # ?ordering=-views
```

### 限流（Throttling）

```python
# settings.py：防止接口被刷
REST_FRAMEWORK = {
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",   # 匿名用户
        "rest_framework.throttling.UserRateThrottle",   # 登录用户
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",        # 匿名每小时 100 次
        "user": "1000/day",        # 用户每天 1000 次
    },
}
# 超限返回 429 Too Many Requests
```

---

## 七、缓存与性能优化

```python
# Django 缓存（Redis 为例）
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
    }
}

# 视图级缓存
from django.views.decorators.cache import cache_page

@cache_page(60 * 15)              # 缓存 15 分钟
def index(request):
    ...

# 手动缓存
from django.core.cache import cache
cache.set("key", value, timeout=60)
value = cache.get("key", default=None)
cache.delete("key")
```

```
性能优化清单：
1. 用 select_related / prefetch_related 消除 N+1 查询
2. 只查需要的字段：.only("title") / .defer("content") / .values()
3. 热点数据上缓存（Redis），减少数据库压力
4. 数据库加索引（见上一篇 MySQL 索引）
5. 静态文件交给 Nginx/CDN，不走 Django
6. 用 Debug Toolbar / silk 定位慢查询
```

---

## 八、部署上线（Day59-60）

开发用的 `runserver` 不能上生产，需要专业的 WSGI 服务器 + Nginx。

### 部署架构

```
用户 → Nginx（反向代理/静态文件/负载均衡）
         ├── 静态文件（css/js/img）直接返回
         └── 动态请求 → Gunicorn/uWSGI（WSGI 服务器）→ Django 应用 → 数据库
```

### Gunicorn（推荐，简单高效）

```bash
pip install gunicorn

# 启动（4 个 worker，绑定 8000 端口）
gunicorn mysite.wsgi:application -w 4 -b 127.0.0.1:8000

# 常用参数
-w 4                    # worker 进程数（一般 = CPU 核数 * 2 + 1）
-b 127.0.0.1:8000       # 绑定地址端口
--daemon                # 后台运行
--access-logfile -      # 访问日志输出到标准输出
```

### uWSGI（功能强大）

```bash
pip install uwsgi
```

```ini
# mysite_uwsgi.ini
[uwsgi]
socket = 127.0.0.1:8000       # 与 Nginx 通信用 socket
chdir = /path/to/mysite       # 项目目录
module = mysite.wsgi          # WSGI 模块
master = true                 # 主进程
processes = 4                 # 进程数
threads = 2                   # 每进程线程数
vacuum = true                 # 退出清理
daemonize = /var/log/uwsgi.log
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name example.com;

    # 静态文件由 Nginx 直接处理（高性能）
    location /static/ {
        alias /path/to/mysite/static/;
    }

    # 动态请求转发给 Gunicorn
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 上线检查清单

```
□ settings.py 中 DEBUG = False（生产必关！否则泄露敏感信息）
□ 配置 ALLOWED_HOSTS = ['example.com', 'www.example.com']
□ 用环境变量管理 SECRET_KEY、数据库密码（不硬编码）
□ python manage.py collectstatic 收集静态文件
□ 生产数据库用 PostgreSQL/MySQL，不用 SQLite
□ 配置 HTTPS（Let's Encrypt 免费证书）
□ 用 systemd / supervisor 守护 Gunicorn 进程
□ 配置数据库定时备份
□ 开启日志监控（错误告警）
```

> [!WARNING]
> 生产环境**必须 `DEBUG = False`** 并正确配置 `ALLOWED_HOSTS`。`DEBUG=True` 会在报错页面暴露源码、数据库配置、密钥等敏感信息，是严重安全隐患。`SECRET_KEY` 要用环境变量注入，绝不提交到代码仓库。

---

## 常见问题 Q&A

**Q1：DRF 和直接用 Django 写 JSON 接口有什么区别？**
A：Django 原生要手动序列化、校验、处理认证。DRF 提供了 Serializer（自动序列化+校验）、ViewSet（自动 CRUD）、Router（自动路由）、认证权限限流分页等一整套组件，写 API 快得多，也更规范。

**Q2：JWT 和 Session 认证怎么选？**
A：Session 需要服务器存状态，多机部署要用 Redis 共享 Session，适合传统 Web；JWT 无状态（信息在 token 里），天然适合分布式、前后端分离、移动端。缺点是 JWT 难以主动失效（需配合黑名单）。

**Q3：`@action` 是干什么的？**
A：给 ViewSet 添加**自定义接口**（超出标准 CRUD 的操作）。`detail=True` 针对单个对象（URL 带 pk，如 `/posts/1/publish/`），`detail=False` 针对列表（如 `/posts/hot/`）。

**Q4：序列化器里 `read_only` 和 `write_only` 有什么用？**
A：`read_only` 字段只输出不接收（如 `created_at`、计算字段）；`write_only` 字段只接收不输出（如密码 `password`，避免泄露）。控制字段在序列化/反序列化时的行为。

**Q5：ViewSet 和 GenericAPIView 怎么选？**
A：ViewSet（尤其 ModelViewSet）配合 Router 自动生成全套 CRUD 路由，最省事，适合标准资源接口；GenericAPIView 更细粒度可控。简单 CRUD 用 ModelViewSet，有特殊逻辑用 APIView/GenericAPIView。

**Q6：限流（Throttle）和缓存有什么区别？**
A：限流是**保护**——限制单位时间请求次数，防止接口被刷爆（返回 429）；缓存是**加速**——把结果存起来复用，减少重复计算/查询。两者常配合：热点数据缓存 + 全局限流。

**Q7：`collectstatic` 做了什么？**
A：把各个 App 和第三方库的静态文件（css/js/img）统一收集到 `STATIC_ROOT` 目录，方便 Nginx/CDN 集中托管。生产部署必做，否则静态文件 404。

---

## 复习卡片

> [!TIP]
> **Django 进阶与 DRF 速记**
>
> 1. **REST 原则**：资源用名词、HTTP 方法表达操作、JSON 交换、无状态
> 2. **序列化器**：ModelSerializer 做对象↔JSON 转换 + 校验；`is_valid()` + `save()`
> 3. **read/write_only**：控制字段输入输出；`validate_<field>` 单字段校验，`validate` 全局校验
> 4. **视图层次**：APIView → GenericAPIView → Mixin → ViewSet → ModelViewSet（越高层越省事）
> 5. **Router**：为 ViewSet 自动生成 CRUD 路由；`@action` 加自定义接口
> 6. **认证**：Session/Token/JWT；前后端分离首选 JWT（`Authorization: Bearer <token>`）
> 7. **权限**：IsAuthenticated/IsAdminUser；自定义 `has_object_permission`（如仅作者可改）
> 8. **分页过滤限流**：PageNumberPagination、django-filter（search/ordering）、Throttle（429）
> 9. **性能**：select_related/prefetch_related、only/defer、Redis 缓存、索引
> 10. **部署**：Nginx（静态+反代）→ Gunicorn/uWSGI → Django；生产 `DEBUG=False` + `ALLOWED_HOSTS` + 环境变量密钥 + collectstatic

---

> [!TIP]
> 下一篇：[网络爬虫](/blog/posts/python-roadmap-11-web-scraping/) 将讲解爬虫原理与反爬应对、requests 与 BeautifulSoup 解析、正则与 XPath 提取、Selenium 处理动态页面、Scrapy 框架以及爬虫数据处理与合规。
>
> 返回 [Python 学习路线总览](/blog/posts/python-roadmap-00-overview/) | [合集页](/blog/python-roadmap/)
