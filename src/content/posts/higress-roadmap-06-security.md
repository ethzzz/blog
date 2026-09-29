---
title: 'Higress 安全认证'
published: 2026-09-17T13:00:00+08:00
description: '详解 Higress 安全能力：JWT/OAuth2/API Key 认证、CORS 跨域、WAF 防护、mTLS 双向认证、IP 黑白名单。'
tags: [Higress, 安全, JWT, OAuth2, CORS, WAF, mTLS]
category: Higress学习路线
draft: false
---

> [!NOTE]
> 安全是网关的第一道防线。Higress 提供认证、鉴权、WAF、加密传输等完整安全能力。

---

## 安全能力全景

```
请求进入
   │
   ▼
┌─────────────────┐
│  IP 黑白名单    │  ← 网络层过滤
├─────────────────┤
│  CORS 跨域      │  ← 浏览器同源策略
├─────────────────┤
│  WAF 防护       │  ← SQL 注入/XSS/CC 攻击
├─────────────────┤
│  认证           │  ← JWT/OAuth2/API Key
├─────────────────┤
│  鉴权           │  ← RBAC/ABAC 权限控制
├─────────────────┤
│  mTLS           │  ← 双向 TLS 加密
└─────────────────┘
   │
   ▼
上游服务
```

---

## JWT 认证

### 配置 JWT 认证

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-route
  annotations:
    # 启用 JWT 认证
    higress.io/auth-type: "jwt"
    # JWT 密钥（JWKS URI 或本地密钥）
    higress.io/auth-jwt-jwks-uri: "https://auth.example.com/.well-known/jwks.json"
    # 或本地密钥
    # higress.io/auth-jwt-secret: "your-256-bit-secret"
    # higress.io/auth-jwt-algorithm: "HS256"
    # JWT 位置（header/query/cookie）
    higress.io/auth-jwt-from: "header"
    higress.io/auth-jwt-header: "Authorization"
    higress.io/auth-jwt-prefix: "Bearer "
    # 校验字段
    higress.io/auth-jwt-issuer: "https://auth.example.com"
    higress.io/auth-jwt-audience: "api.example.com"
    # 透传字段到上游
    higress.io/auth-jwt-forward-claims: "sub,email,roles"
    higress.io/auth-jwt-forward-header-prefix: "X-JWT-"
spec:
  ingressClassName: higress
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api
            backend:
              service:
                name: api-service
                port: { number: 8080 }
```

### JWT 认证流程

```
1. 客户端请求携带 JWT
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

2. Higress 提取 JWT

3. 验证签名
   - 从 JWKS URI 获取公钥（缓存）
   - 或用本地密钥验证

4. 验证 Claims
   - iss（签发者）
   - aud（受众）
   - exp（过期时间）
   - nbf（生效时间）

5. 验证通过 → 转发到上游（携带用户信息 Header）
   验证失败 → 返回 401 Unauthorized
```

### 上游获取用户信息

```yaml
# Higress 自动添加 Header
X-JWT-sub: user123
X-JWT-email: user@example.com
X-JWT-roles: admin,developer

# 上游服务读取
const userId = req.headers['x-jwt-sub'];
const roles = req.headers['x-jwt-roles'].split(',');
```

### 白名单路径（无需认证）

```yaml
metadata:
  annotations:
    higress.io/auth-type: "jwt"
    higress.io/auth-jwt-jwks-uri: "https://auth.example.com/.well-known/jwks.json"
    # 白名单路径（正则）
    higress.io/auth-white-list: "/api/health,/api/public/.*,/api/login"
```

---

## OAuth2 认证

### OAuth2 授权码模式

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: oauth2-route
  annotations:
    higress.io/auth-type: "oauth2"
    higress.io/auth-oauth2-issuer: "https://auth.example.com"
    higress.io/auth-oauth2-client-id: "your-client-id"
    higress.io/auth-oauth2-client-secret: "your-client-secret"
    higress.io/auth-oauth2-redirect-uri: "https://api.example.com/oauth2/callback"
    higress.io/auth-oauth2-scopes: "openid,profile,email"
    # Cookie 配置
    higress.io/auth-oauth2-cookie-name: "_oauth2_token"
    higress.io/auth-oauth2-cookie-domain: ".example.com"
    higress.io/auth-oauth2-cookie-secure: "true"
    higress.io/auth-oauth2-cookie-http-only: "true"
spec:
  ingressClassName: higress
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            backend:
              service:
                name: web-service
                port: { number: 8080 }
```

### OAuth2 流程

```
1. 用户访问受保护资源
   GET https://api.example.com/dashboard

2. Higress 检测无有效 Cookie → 302 重定向到授权服务器
   Location: https://auth.example.com/authorize?
     client_id=your-client-id&
     redirect_uri=https://api.example.com/oauth2/callback&
     scope=openid profile email&
     response_type=code&
     state=random-state

3. 用户在授权服务器登录并授权

4. 授权服务器回调 Higress
   GET https://api.example.com/oauth2/callback?code=xxx&state=random-state

5. Higress 用 code 换取 access_token + id_token

6. Higress 设置 Cookie，重定向到原始请求
   Set-Cookie: _oauth2_token=xxx; Domain=.example.com; Secure; HttpOnly
   Location: https://api.example.com/dashboard

7. 后续请求携带 Cookie，Higress 验证后转发
```

---

## API Key 认证

### 配置 API Key

```yaml
metadata:
  annotations:
    higress.io/auth-type: "api-key"
    # API Key 位置（header/query）
    higress.io/auth-api-key-from: "header"
    higress.io/auth-api-key-header: "X-API-Key"
    # API Key 列表（支持多个）
    higress.io/auth-api-key-list: |
      key1: {"name":"client-a","quota":1000}
      key2: {"name":"client-b","quota":5000}
      key3: {"name":"client-c","quota":10000}
```

### 结合限流

```yaml
metadata:
  annotations:
    higress.io/auth-type: "api-key"
    higress.io/auth-api-key-header: "X-API-Key"
    higress.io/auth-api-key-list: |
      key1: {"name":"free","quota":100}
      key2: {"name":"pro","quota":10000}
    # 按 API Key 限流
    higress.io/limit-by-header: "X-API-Key"
    higress.io/limit-rps: "100"
```

---

## CORS 跨域

### 配置 CORS

```yaml
metadata:
  annotations:
    higress.io/enable-cors: "true"
    higress.io/cors-allow-origin: "https://web.example.com"
    # 多个域名用逗号分隔
    # higress.io/cors-allow-origin: "https://web.example.com,https://admin.example.com"
    # 或通配符（不推荐生产）
    # higress.io/cors-allow-origin: "*"
    higress.io/cors-allow-methods: "GET,POST,PUT,DELETE,OPTIONS"
    higress.io/cors-allow-headers: "Authorization,Content-Type,X-Requested-With"
    higress.io/cors-expose-headers: "X-Total-Count,X-Request-Id"
    higress.io/cors-allow-credentials: "true"
    higress.io/cors-max-age: "86400"    # 预检请求缓存 24 小时
```

### CORS 预检请求处理

```
浏览器发送 OPTIONS 预检请求
   ↓
Higress 自动响应（不转发到上游）
   Access-Control-Allow-Origin: https://web.example.com
   Access-Control-Allow-Methods: GET,POST,PUT,DELETE
   Access-Control-Allow-Headers: Authorization,Content-Type
   Access-Control-Max-Age: 86400
   ↓
浏览器发送实际请求
   ↓
Higress 转发到上游，响应添加 CORS Header
```

---

## WAF 防护

### 启用 WAF

```yaml
metadata:
  annotations:
    higress.io/waf-enabled: "true"
    # OWASP CRS 规则集
    higress.io/waf-rules: "sql-injection,xss,code-injection,path-traversal"
    # 防护模式（block/log）
    higress.io/waf-mode: "block"
    # 自定义规则
    higress.io/waf-custom-rules: |
      - name: block-china
        action: block
        conditions:
          - type: ip
            operator: notIn
            values: ["CN"]
      - name: rate-limit-login
        action: limit
        rate: 10
        period: 60s
        conditions:
          - type: path
            operator: equals
            values: ["/api/login"]
```

### WAF 防护类型

| 类型 | 说明 | 示例 |
|:--|:--|:--|
| SQL 注入 | 检测 SQL 关键字 | `' OR 1=1--` |
| XSS | 检测脚本标签 | `<script>alert(1)</script>` |
| 代码注入 | 检测系统命令 | `; rm -rf /` |
| 路径遍历 | 检测目录跳转 | `../../etc/passwd` |
| CC 攻击 | 频率限制 | 1000 QPS from single IP |
| 恶意爬虫 | User-Agent 检测 | `curl/wget/scrapy` |

---

## mTLS 双向认证

### 配置 mTLS

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: mtls-route
  annotations:
    higress.io/tls-mode: "mutual"
    # 服务端证书
    higress.io/tls-cert: "server-cert-secret"
    # CA 证书（验证客户端）
    higress.io/tls-ca-cert: "ca-cert-secret"
    # 客户端证书必须匹配
    higress.io/tls-verify-client: "required"
spec:
  ingressClassName: higress
  tls:
    - hosts:
        - secure.example.com
      secretName: server-cert-secret
  rules:
    - host: secure.example.com
      http:
        paths:
          - path: /api
            backend:
              service:
                name: secure-service
                port: { number: 8443 }
```

### 创建证书 Secret

```bash
# 1. 生成 CA
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 3650 -key ca.key -out ca.crt \
  -subj "/CN=MyCA/O=MyOrg"

# 2. 生成服务端证书
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr \
  -subj "/CN=secure.example.com"
openssl x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out server.crt

# 3. 创建 K8s Secret
kubectl create secret tls server-cert-secret \
  --cert=server.crt --key=server.key -n higress-system

kubectl create secret generic ca-cert-secret \
  --from-file=ca.crt -n higress-system

# 4. 生成客户端证书（给调用方）
openssl genrsa -out client.key 2048
openssl req -new -key client.key -out client.csr \
  -subj "/CN=client-app"
openssl x509 -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key \
  -CAcreateserial -out client.crt
```

### 客户端调用

```bash
curl --cert client.crt --key client.key --cacert ca.crt \
  https://secure.example.com/api/data
```

---

## IP 黑白名单

### IP 白名单

```yaml
metadata:
  annotations:
    higress.io/ip-whitelist: "192.168.1.0/24,10.0.0.100,172.16.0.0/16"
```

### IP 黑名单

```yaml
metadata:
  annotations:
    higress.io/ip-blacklist: "1.2.3.4,5.6.7.0/24"
```

### 获取真实客户端 IP

```yaml
# 如果 Higress 前面有 LB（如云厂商 SLB）
metadata:
  annotations:
    higress.io/use-real-ip: "true"
    higress.io/real-ip-header: "X-Forwarded-For"
    higress.io/real-ip-recursive: "true"
    # 信任的代理数量（从右往左数）
    higress.io/trusted-proxy-count: "2"
```

---

## 组合安全策略

### 完整安全配置示例

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: secure-api
  annotations:
    # 1. IP 白名单（只允许内网）
    higress.io/ip-whitelist: "10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"
    
    # 2. CORS（只允许指定域名）
    higress.io/enable-cors: "true"
    higress.io/cors-allow-origin: "https://admin.example.com"
    higress.io/cors-allow-methods: "GET,POST,PUT,DELETE"
    higress.io/cors-allow-credentials: "true"
    
    # 3. WAF（防 SQL 注入/XSS）
    higress.io/waf-enabled: "true"
    higress.io/waf-rules: "sql-injection,xss,code-injection"
    higress.io/waf-mode: "block"
    
    # 4. JWT 认证
    higress.io/auth-type: "jwt"
    higress.io/auth-jwt-jwks-uri: "https://auth.example.com/.well-known/jwks.json"
    higress.io/auth-jwt-issuer: "https://auth.example.com"
    higress.io/auth-white-list: "/api/health,/api/login"
    
    # 5. 限流（防暴力破解）
    higress.io/limit-rps: "100"
    higress.io/limit-by-ip: "true"
    
    # 6. mTLS（高安全场景）
    # higress.io/tls-mode: "mutual"
    # higress.io/tls-ca-cert: "ca-cert-secret"
spec:
  ingressClassName: higress
  tls:
    - hosts:
        - secure-api.example.com
      secretName: api-tls-cert
  rules:
    - host: secure-api.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 8080
```

---

## 常见问题

### Q1: JWT 认证返回 401

```bash
# 1. 检查 JWT 格式
echo "eyJhbGciOiJIUzI1NiIs..." | cut -d'.' -f2 | base64 -d | jq

# 2. 验证签名（jwt.io 或命令行）
# 确认 secret/公钥正确

# 3. 检查 Claims
# - exp 是否过期
# - iss 是否匹配
# - aud 是否匹配

# 4. 查看 Higress 日志
kubectl logs -n higress-system deploy/higress-gateway | grep jwt
```

### Q2: CORS 预检请求失败

```bash
# 1. 确认 OPTIONS 请求响应
curl -X OPTIONS -H "Origin: https://web.example.com" \
  -H "Access-Control-Request-Method: POST" \
  -v https://api.example.com/api/data

# 2. 检查响应 Header
# Access-Control-Allow-Origin 必须匹配 Origin
# Access-Control-Allow-Methods 必须包含请求方法

# 3. 确认 allow-credentials
# 如果前端 withCredentials: true，后端必须设置 allow-credentials: true
# 且 allow-origin 不能是 *
```

### Q3: mTLS 握手失败

```bash
# 1. 验证证书链
openssl verify -CAfile ca.crt client.crt

# 2. 检查证书有效期
openssl x509 -in client.crt -noout -dates

# 3. 检查 CN/SAN
openssl x509 -in server.crt -noout -subject -ext subjectAltName

# 4. 测试连接
openssl s_client -connect secure.example.com:443 \
  -cert client.crt -key client.key -CAfile ca.crt -debug
```

---

## 复习卡片

> [!TIP]
> **快速复习清单**
>
> 1. **JWT 认证**：JWKS URI / 本地密钥，验证签名 + Claims（iss/aud/exp）
> 2. **OAuth2**：授权码模式，Cookie 存储 Token，自动重定向
> 3. **API Key**：Header/Query 传递，结合限流按 Key 配额
> 4. **CORS**：allow-origin/methods/headers/credentials，预检请求自动处理
> 5. **WAF**：SQL 注入/XSS/CC 攻击防护，OWASP CRS 规则集
> 6. **mTLS**：双向证书验证，CA 签发服务端 + 客户端证书
> 7. **IP 黑白名单**：CIDR 格式，注意获取真实 IP（X-Forwarded-For）
> 8. **组合策略**：IP 白名单 → CORS → WAF → 认证 → 限流 → mTLS

---

> [!TIP]
> 下一篇：[可观测性](/blog/posts/higress-roadmap-07-observability/) 将讲解访问日志、Metrics、Tracing、Prometheus/Grafana/SkyWalking 集成。
>
> 返回 [Higress 学习路线总览](/blog/posts/higress-roadmap-00-overview/) | [合集页](/blog/higress-roadmap/)
