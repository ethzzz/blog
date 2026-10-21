---
title: 'Nginx 面试题（中高级前端必备）'
published: 2026-09-16T13:00:00+08:00
description: '讲解 Nginx 反向代理、负载均衡、静态资源配置、SPA 路由、HTTPS、性能优化等前端工程师必备知识。'
tags: [前端面试, Nginx, 反向代理, 负载均衡, 运维]
category: 前端面试宝典
draft: false
---

> [!NOTE]
> 本文包含 20+ 道 Nginx 面试题，重点覆盖前端工程师需要掌握的部分，难度标注：⭐ 基础 · ⭐⭐ 进阶 · ⭐⭐⭐ 高级

---

## Nginx 基础

### Q1: Nginx 是什么？主要用途？⭐

**答：**

Nginx 是一个高性能的 HTTP 和反向代理服务器，特点：

- **高并发**：事件驱动架构，单进程处理数万连接
- **低内存**：相比 Apache，内存消耗极低
- **高可靠**：7x24 小时运行，热部署
- **模块化**：功能通过模块扩展

**前端工程师使用场景：**

| 用途 | 说明 |
|:--|:--|
| 静态资源服务 | 托管 HTML/CSS/JS/图片 |
| 反向代理 | 将 API 请求转发到后端 |
| 负载均衡 | 分发请求到多台服务器 |
| HTTPS 终止 | SSL/TLS 证书配置 |
| Gzip 压缩 | 减小传输体积 |
| SPA 路由 | history 模式配置 |
| 缓存 | 静态资源缓存控制 |

### Q2: Nginx 的架构？⭐⭐

```
                    ┌─────────────────────┐
                    │    Master Process    │
                    │  (管理 Worker 进程)  │
                    └──────────┬──────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
    ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
    │   Worker 1  │    │   Worker 2  │    │   Worker N  │
    │ (单线程)    │    │ (单线程)    │    │ (单线程)    │
    │ 事件驱动    │    │ 事件驱动    │    │ 事件驱动    │
    │ 非阻塞 I/O  │    │ 非阻塞 I/O  │    │ 非阻塞 I/O  │
    └─────────────┘    └─────────────┘    └─────────────┘
```

```nginx
# nginx.conf 全局配置
worker_processes auto;        # Worker 进程数（auto = CPU 核心数）
worker_connections 65535;     # 每个 Worker 最大连接数

events {
    use epoll;                # Linux 高效事件模型
    multi_accept on;          # 一次接受多个连接
}
```

---

## 静态资源服务

### Q3: 如何配置静态资源服务？⭐ 🔥

```nginx
server {
    listen 80;
    server_name example.com;
    
    # 静态文件根目录
    root /var/www/blog/dist;
    index index.html;
    
    # 静态资源配置
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 带 hash 的静态资源：强缓存 1 年
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }
    
    # HTML 文件：不缓存（每次协商）
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        expires 0;
    }
}
```

### Q4: SPA 应用（history 模式）如何配置？⭐⭐ 🔥

```nginx
# Vue Router / React Router history 模式
# 问题：直接访问 /user/profile 返回 404
# 原因：Nginx 找不到对应文件，需要将所有路由指向 index.html

server {
    listen 80;
    server_name spa.example.com;
    root /var/www/spa/dist;
    
    location / {
        # 核心：try_files 找不到文件就返回 index.html
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://backend:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**try_files 指令解析：**

```nginx
try_files $uri $uri/ /index.html;

# 执行顺序：
# 1. 尝试找文件 $uri（如 /assets/app.js）
# 2. 尝试找目录 $uri/（如 /assets/）
# 3. 都找不到，返回 /index.html（交给前端路由处理）
```

### Q5: 多项目部署（子路径）如何配置？⭐⭐

```nginx
# 场景：同一服务器部署多个前端项目
# http://example.com/       -> 主站
# http://example.com/blog/  -> 博客
# http://example.com/admin/ -> 后台管理

server {
    listen 80;
    server_name example.com;
    
    # 主站
    location / {
        root /var/www/main/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # 博客（子路径）
    location /blog/ {
        alias /var/www/blog/dist/;
        index index.html;
        try_files $uri $uri/ /blog/index.html;
    }
    
    # 后台管理（子路径）
    location /admin/ {
        alias /var/www/admin/dist/;
        index index.html;
        try_files $uri $uri/ /admin/index.html;
    }
}

# 注意：alias vs root 的区别
# root：拼接完整路径 root + location
# alias：替换 location 部分
```

---

## 反向代理

### Q6: 什么是反向代理？如何配置？⭐⭐ 🔥

**答：**

反向代理是代理**服务端**，客户端不知道真实服务器地址。

```
客户端 → Nginx（反向代理）→ 后端服务器1
                          → 后端服务器2
                          → 后端服务器3
```

```nginx
server {
    listen 80;
    server_name example.com;
    
    # API 反向代理
    location /api/ {
        proxy_pass http://localhost:3000/;
        
        # 传递真实客户端信息
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时配置
        proxy_connect_timeout 30s;
        proxy_read_timeout 60s;
        proxy_send_timeout 60s;
        
        # 重写路径（去掉 /api 前缀）
        # /api/users -> /users
        rewrite ^/api/(.*)$ /$1 break;
    }
    
    # WebSocket 代理
    location /ws/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
```

### Q7: proxy_pass 末尾有无斜杠的区别？⭐⭐⭐

```nginx
# 无斜杠：保留 location 路径
location /api/ {
    proxy_pass http://backend;
}
# /api/users -> http://backend/api/users

# 有斜杠：替换 location 路径
location /api/ {
    proxy_pass http://backend/;
}
# /api/users -> http://backend/users

# 带路径
location /api/ {
    proxy_pass http://backend/v1/;
}
# /api/users -> http://backend/v1/users
```

---

## 负载均衡

### Q8: Nginx 负载均衡策略？⭐⭐ 🔥

```nginx
# 1. 轮询（默认）
upstream backend {
    server 192.168.1.1:3000;
    server 192.168.1.2:3000;
    server 192.168.1.3:3000;
}

# 2. 加权轮询
upstream backend {
    server 192.168.1.1:3000 weight=3;  # 权重高，分配多
    server 192.168.1.2:3000 weight=1;
    server 192.168.1.3:3000 weight=1;
}

# 3. IP Hash（同一 IP 固定到同一服务器，解决 Session 问题）
upstream backend {
    ip_hash;
    server 192.168.1.1:3000;
    server 192.168.1.2:3000;
}

# 4. 最少连接
upstream backend {
    least_conn;
    server 192.168.1.1:3000;
    server 192.168.1.2:3000;
}

# 5. 健康检查 + 故障转移
upstream backend {
    server 192.168.1.1:3000 max_fails=3 fail_timeout=30s;
    server 192.168.1.2:3000 max_fails=3 fail_timeout=30s;
    server 192.168.1.3:3000 backup;  # 备用服务器
}

# 使用
server {
    location /api/ {
        proxy_pass http://backend;
    }
}
```

---

## HTTPS 配置

### Q9: 如何配置 HTTPS？⭐⭐ 🔥

```nginx
# HTTP 强制跳转 HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name example.com;
    
    # SSL 证书
    ssl_certificate     /etc/nginx/ssl/example.com.crt;
    ssl_certificate_key /etc/nginx/ssl/example.com.key;
    
    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS（强制 HTTPS）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    root /var/www/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 性能优化

### Q10: Nginx 性能优化手段？⭐⭐ 🔥

```nginx
# 1. Gzip 压缩
gzip on;
gzip_vary on;
gzip_min_length 1024;           # 小于 1KB 不压缩
gzip_comp_level 6;              # 压缩级别 1-9
gzip_types
    text/plain
    text/css
    text/javascript
    application/javascript
    application/json
    application/xml
    image/svg+xml;

# 2. 开启文件缓存
open_file_cache max=1000 inactive=20s;
open_file_cache_valid 30s;
open_file_cache_min_uses 2;

# 3. 客户端缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 4. 连接优化
keepalive_timeout 65;           # 长连接超时
keepalive_requests 1000;        # 每个连接最大请求数
client_max_body_size 10m;       # 上传文件大小限制

# 5. Worker 优化
worker_processes auto;          # CPU 核心数
worker_connections 65535;       # 最大连接数
worker_rlimit_nofile 65535;     # 文件描述符限制

# 6. 缓冲区优化
client_body_buffer_size 128k;
proxy_buffer_size 4k;
proxy_buffers 8 4k;

# 7. 禁用不必要的日志
access_log off;                 # 静态资源关闭访问日志
```

### Q11: 如何实现灰度发布 / A-B 测试？⭐⭐⭐

```nginx
# 基于 Cookie 的灰度发布
map $http_cookie $version {
    default         "stable";
    "~*version=new" "canary";
}

upstream stable {
    server 192.168.1.1:3000;
}

upstream canary {
    server 192.168.1.2:3000;
}

server {
    location / {
        if ($version = "canary") {
            proxy_pass http://canary;
        }
        proxy_pass http://stable;
    }
}

# 基于权重的灰度（10% 流量到新版本）
upstream backend {
    server 192.168.1.1:3000 weight=9;  # 旧版本 90%
    server 192.168.1.2:3000 weight=1;  # 新版本 10%
}

# 基于 Header 的灰度
map $http_x_version $backend {
    default "stable_backend";
    "v2"    "canary_backend";
}
```

---

## 常用命令

### Q12: Nginx 常用命令？⭐

```bash
# 检查配置是否正确
nginx -t

# 重新加载配置（不中断服务）
nginx -s reload

# 停止
nginx -s stop        # 快速停止
nginx -s quit        # 优雅停止

# 查看进程
ps aux | grep nginx

# 查看日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# 查看连接状态
netstat -anp | grep nginx
```

---

## 复习卡片

| 知识点 | 关键记忆 |
|:--|:--|
| SPA 路由 | `try_files $uri $uri/ /index.html` |
| 反向代理 | `proxy_pass`，注意末尾斜杠 |
| 负载均衡 | 轮询、加权、IP Hash、最少连接 |
| 静态资源缓存 | hash 文件强缓存 1 年，HTML 不缓存 |
| Gzip | 压缩文本类资源，减小 70% 体积 |
| HTTPS | `ssl_certificate` + HTTP 301 跳转 |
| 灰度发布 | `map` + `weight` 或 Cookie/Header |
| alias vs root | alias 替换路径，root 拼接路径 |

> [!TIP]
> 下一篇：[MySQL 面试题](/blog/posts/interview-guide-10-mysql/)
> 
> 涵盖索引原理、事务隔离级别、SQL 优化、锁机制等后端必备知识。
