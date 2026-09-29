---
title: 'Go 开发 Higress Wasm 插件'
published: 2026-09-17T14:30:00+08:00
description: '实战讲解用 Go 开发 Higress Wasm 插件：wasm-go SDK、钩子函数、HTTP 调用、编译调试、OCI 发布完整流程。'
tags: [Higress, Wasm, Go, 插件开发, wasm-go, Proxy-Wasm]
category: Higress学习路线
draft: false
---

> [!NOTE]
> 本文用 Go 语言实战开发 Higress Wasm 插件，从项目初始化到发布上线，覆盖完整开发流程。

---

## 开发环境准备

### 安装依赖

```bash
# 1. Go 1.24+（原生支持 Wasm 编译）
# 下载：https://go.dev/dl/
go version  # 确认 go1.24.x

# 2. oras（OCI 镜像推送）
curl -LO https://github.com/oras-project/oras/releases/download/v1.0.0/oras_1.0.0_linux_amd64.tar.gz
tar xzf oras_1.0.0_linux_amd64.tar.gz
sudo mv oras /usr/local/bin/

# 3. Docker（可选，用于构建 OCI 镜像）
docker --version

# 4. kubectl + Helm（部署测试）
kubectl version --client
helm version
```

### 获取 wasm-go SDK

```bash
# 方式 1：直接引用（推荐）
go mod init my-plugin
go get github.com/higress-group/wasm-go@latest

# 方式 2：克隆源码（学习用）
git clone https://github.com/higress-group/wasm-go.git
cd wasm-go/examples
```

---

## 第一个插件：Hello World

### 项目结构

```
hello-plugin/
├── go.mod
├── go.sum
├── main.go           # 插件入口
├── plugin.yaml       # 插件元数据（可选）
└── README.md
```

### main.go

```go
package main

import (
	"github.com/higress-group/wasm-go/pkg/wrapper"
	"github.com/tidwall/gjson"
)

func main() {
	wrapper.SetCtx(
		// 插件名称
		"hello-plugin",
		// 解析配置
		wrapper.ParseConfigBy(parseConfig),
		// 处理请求头
		wrapper.ProcessRequestHeadersBy(onHttpRequestHeaders),
	)
}

// 插件配置结构
type HelloConfig struct {
	Message string `json:"message"`
}

// 解析配置（JSON 格式）
func parseConfig(json gjson.Result, config *HelloConfig, log wrapper.Log) error {
	config.Message = json.Get("message").String()
	if config.Message == "" {
		config.Message = "Hello from Higress Wasm Plugin!"
	}
	log.Infof("Config loaded: message=%s", config.Message)
	return nil
}

// 处理请求头
func onHttpRequestHeaders(ctx wrapper.HttpContext, config HelloConfig, log wrapper.Log) wrapper.Action {
	// 添加自定义 Header
	ctx.SetRequestHeader("X-Hello-Message", config.Message)
	
	// 记录日志
	log.Infof("Request path: %s", ctx.Path())
	
	// 继续处理
	return wrapper.ActionContinue
}
```

### go.mod

```go
module hello-plugin

go 1.24

require (
	github.com/higress-group/wasm-go v1.0.0
	github.com/tidwall/gjson v1.17.0
)
```

### 编译 Wasm

```bash
# Go 1.24+ 原生编译
GOOS=wasip1 GOARCH=wasm go build -o plugin.wasm

# 验证
file plugin.wasm
# plugin.wasm: WebAssembly (wasm) binary module version 0x1 (MVP)

ls -lh plugin.wasm
# -rw-r--r-- 1 user user 2.5M plugin.wasm
```

---

## SDK 核心 API

### wrapper 包

```go
// 设置插件上下文
wrapper.SetCtx(
	name string,                    // 插件名称
	opts ...WrapperOption,          // 配置选项
)

// 配置选项
wrapper.ParseConfigBy(parseFunc)   // 配置解析函数
wrapper.ProcessRequestHeadersBy(fn)  // 请求头处理
wrapper.ProcessRequestBodyBy(fn)     // 请求体处理
wrapper.ProcessResponseHeadersBy(fn) // 响应头处理
wrapper.ProcessResponseBodyBy(fn)    // 响应体处理
wrapper.ProcessLogBy(fn)             // 日志处理
```

### HttpContext 接口

```go
type HttpContext interface {
	// 请求信息
	Path() string                    // 请求路径
	Method() string                  // HTTP 方法
	Host() string                    // Host Header
	Scheme() string                  // http / https
	
	// Header 操作
	GetRequestHeader(key string) (string, error)
	SetRequestHeader(key, value string) error
	RemoveRequestHeader(key string) error
	
	GetResponseHeader(key string) (string, error)
	SetResponseHeader(key, value string) error
	
	// Body 操作
	GetRequestBody() ([]byte, error)
	SetRequestBody(body []byte) error
	
	// 查询参数
	QueryParam(key string) (string, bool)
	
	// 客户端 IP
	ClientIP() string
	
	// 路由信息
	RouteName() string
	
	// 共享数据（跨请求）
	GetSharedData(key string) ([]byte, error)
	SetSharedData(key string, value []byte, cas uint64) error
	
	// 直接响应（中断请求）
	SendHttpResponse(statusCode int, headers map[string]string, body []byte, grpcStatus int) error
}
```

### proxywasm 底层 API

```go
import "github.com/tetratelabs/proxy-wasm-go-sdk/proxywasm"

// 日志
proxywasm.LogDebug("debug message")
proxywasm.LogInfo("info message")
proxywasm.LogWarn("warning message")
proxywasm.LogError("error message")

// Header 操作
proxywasm.GetHttpRequestHeader("key")
proxywasm.AddHttpRequestHeader("key", "value")
proxywasm.ReplaceHttpRequestHeader("key", "value")
proxywasm.RemoveHttpRequestHeader("key")

// HTTP 调用（异步）
proxywasm.DispatchHttpCall(
	cluster string,           // 上游集群名
	headers [][2]string,      // 请求头
	body []byte,              // 请求体
	trailers [][2]string,     // Trailer
	timeout uint32,           // 超时（毫秒）
	callback func(numHeaders, bodySize, numTrailers int),  // 回调
)

// 发送响应
proxywasm.SendHttpResponse(
	statusCode uint32,
	headers [][2]string,
	body []byte,
	grpcStatus int32,
)
```

---

## 实战：JWT 认证插件

### 完整代码

```go
package main

import (
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/higress-group/wasm-go/pkg/wrapper"
	"github.com/tidwall/gjson"
)

func main() {
	wrapper.SetCtx(
		"jwt-auth",
		wrapper.ParseConfigBy(parseConfig),
		wrapper.ProcessRequestHeadersBy(onHttpRequestHeaders),
	)
}

type JWTConfig struct {
	Issuer     string            `json:"issuer"`
	JWKSUri    string            `json:"jwks_uri"`
	PublicKey  *rsa.PublicKey    `json:"-"`
	WhiteList  []string          `json:"white_list"`
	ClaimsToForward []string     `json:"claims_to_forward"`
}

func parseConfig(json gjson.Result, config *JWTConfig, log wrapper.Log) error {
	config.Issuer = json.Get("issuer").String()
	config.JWKSUri = json.Get("jwks_uri").String()
	
	// 解析白名单
	for _, item := range json.Get("white_list").Array() {
		config.WhiteList = append(config.WhiteList, item.String())
	}
	
	// 解析需要透传的 Claims
	for _, item := range json.Get("claims_to_forward").Array() {
		config.ClaimsToForward = append(config.ClaimsToForward, item.String())
	}
	
	// 从 JWKS URI 获取公钥（简化示例，实际需缓存和刷新）
	log.Infof("Loading JWKS from: %s", config.JWKSUri)
	// TODO: 实现 JWKS 获取和缓存
	
	return nil
}

func onHttpRequestHeaders(ctx wrapper.HttpContext, config JWTConfig, log wrapper.Log) wrapper.Action {
	path := ctx.Path()
	
	// 白名单路径跳过认证
	for _, whitePath := range config.WhiteList {
		if strings.HasPrefix(path, whitePath) {
			log.Debugf("Path %s in whitelist, skip auth", path)
			return wrapper.ActionContinue
		}
	}
	
	// 提取 Authorization Header
	authHeader, err := ctx.GetRequestHeader("Authorization")
	if err != nil || authHeader == "" {
		log.Warnf("Missing Authorization header")
		ctx.SendHttpResponse(401, map[string]string{
			"Content-Type": "application/json",
		}, []byte(`{"error":"unauthorized","message":"Missing Authorization header"}`), -1)
		return wrapper.ActionStop
	}
	
	// 提取 Bearer Token
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	if tokenString == authHeader {
		log.Warnf("Invalid Authorization format")
		ctx.SendHttpResponse(401, map[string]string{
			"Content-Type": "application/json",
		}, []byte(`{"error":"unauthorized","message":"Invalid Authorization format"}`), -1)
		return wrapper.ActionStop
	}
	
	// 解析并验证 Token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// 验证签名算法
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return config.PublicKey, nil
	})
	
	if err != nil {
		log.Warnf("Token validation failed: %v", err)
		ctx.SendHttpResponse(401, map[string]string{
			"Content-Type": "application/json",
		}, []byte(fmt.Sprintf(`{"error":"unauthorized","message":"%s"}`, err.Error())), -1)
		return wrapper.ActionStop
	}
	
	if !token.Valid {
		log.Warnf("Token is not valid")
		ctx.SendHttpResponse(401, map[string]string{
			"Content-Type": "application/json",
		}, []byte(`{"error":"unauthorized","message":"Token is not valid"}`), -1)
		return wrapper.ActionStop
	}
	
	// 验证 Claims
	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		// 验证 issuer
		if config.Issuer != "" {
			if iss, ok := claims["iss"].(string); !ok || iss != config.Issuer {
				log.Warnf("Invalid issuer: %v", claims["iss"])
				ctx.SendHttpResponse(401, map[string]string{
					"Content-Type": "application/json",
				}, []byte(`{"error":"unauthorized","message":"Invalid issuer"}`), -1)
				return wrapper.ActionStop
			}
		}
		
		// 透传 Claims 到上游
		for _, claimKey := range config.ClaimsToForward {
			if value, ok := claims[claimKey]; ok {
				headerKey := fmt.Sprintf("X-JWT-%s", strings.ToUpper(claimKey))
				valueStr := fmt.Sprintf("%v", value)
				ctx.SetRequestHeader(headerKey, valueStr)
			}
		}
		
		log.Infof("JWT auth success, sub=%v", claims["sub"])
	}
	
	return wrapper.ActionContinue
}
```

### 插件配置

```yaml
apiVersion: extensions.higress.io/v1alpha1
kind: WasmPlugin
metadata:
  name: jwt-auth
  namespace: higress-system
spec:
  url: oci://registry.example.com/plugins/jwt-auth:v1
  phase: AUTHN
  priority: 1000
  defaultConfig:
    issuer: "https://auth.example.com"
    jwks_uri: "https://auth.example.com/.well-known/jwks.json"
    white_list:
      - "/api/health"
      - "/api/public"
      - "/api/login"
    claims_to_forward:
      - "sub"
      - "email"
      - "roles"
```

---

## 实战：HTTP 调用外部服务

### 异步 HTTP 调用

```go
package main

import (
	"encoding/json"
	"fmt"

	"github.com/higress-group/wasm-go/pkg/wrapper"
	"github.com/tidwall/gjson"
	"github.com/tetratelabs/proxy-wasm-go-sdk/proxywasm"
)

type ExternalAPIConfig struct {
	ClusterName string `json:"cluster_name"`
	Timeout     uint32 `json:"timeout_ms"`
}

func onHttpRequestHeaders(ctx wrapper.HttpContext, config ExternalAPIConfig, log wrapper.Log) wrapper.Action {
	// 暂停请求，等待异步调用完成
	return wrapper.ActionPause
}

func callExternalService(ctx wrapper.HttpContext, config ExternalAPIConfig, log wrapper.Log) {
	// 构造请求
	headers := [][2]string{
		{":method", "GET"},
		{":path", "/api/user-info"},
		{":authority", "user-service.internal"},
		{"X-Request-ID", ctx.GetRequestHeader("X-Request-ID")},
	}
	
	// 发起异步 HTTP 调用
	_, err := proxywasm.DispatchHttpCall(
		config.ClusterName,      // 上游集群名
		headers,
		nil,                     // 请求体
		nil,                     // Trailer
		config.Timeout,          // 超时（毫秒）
		func(numHeaders, bodySize, numTrailers int) {
			// 回调函数（异步执行）
			body, err := proxywasm.GetHttpCallResponseBody(0, bodySize)
			if err != nil {
				log.Errorf("Failed to get response body: %v", err)
				ctx.SendHttpResponse(500, nil, []byte("Internal Error"), -1)
				return
			}
			
			// 解析响应
			var result map[string]interface{}
			json.Unmarshal(body, &result)
			
			// 提取用户信息，添加到请求头
			if userID, ok := result["user_id"].(string); ok {
				ctx.SetRequestHeader("X-User-ID", userID)
			}
			
			// 继续处理原始请求
			proxywasm.ResumeHttpRequest()
		},
	)
	
	if err != nil {
		log.Errorf("Failed to dispatch HTTP call: %v", err)
		ctx.SendHttpResponse(500, nil, []byte("Internal Error"), -1)
	}
}
```

---

## 编译与调试

### 本地编译

```bash
# 开发模式（快速编译）
GOOS=wasip1 GOARCH=wasm go build -o plugin.wasm

# 生产模式（优化大小）
GOOS=wasip1 GOARCH=wasm go build -ldflags="-s -w" -trimpath -o plugin.wasm

# 查看 Wasm 大小
ls -lh plugin.wasm
# 优化前：~3MB
# 优化后：~1.5MB
```

### 本地测试（Docker）

```bash
# 1. 启动 Higress（Docker Compose）
curl -fsSL https://higress.io/standalone/get-higress.sh | bash -s -- -a

# 2. 加载本地 Wasm 插件
docker cp plugin.wasm higress:/data/plugins/hello-plugin.wasm

# 3. 配置 WasmPlugin（挂载本地文件）
kubectl apply -f - <<EOF
apiVersion: extensions.higress.io/v1alpha1
kind: WasmPlugin
metadata:
  name: hello-plugin
  namespace: higress-system
spec:
  url: file:///data/plugins/hello-plugin.wasm
  phase: UNSPECIFIED_PHASE
  priority: 100
  defaultConfig:
    message: "Hello from local test!"
EOF

# 4. 测试
curl -v http://localhost:8080/api/test
# 查看响应头 X-Hello-Message
```

### 日志调试

```go
// 使用 wrapper.Log
log.Debugf("Debug: %v", data)      // 开发环境
log.Infof("Info: %s", msg)          // 生产环境
log.Warnf("Warning: %v", err)       // 警告
log.Errorf("Error: %v", err)        // 错误

// 查看日志
kubectl logs -n higress-system deploy/higress-gateway -f | grep hello-plugin
```

### 远程调试（Delve）

```bash
# 1. 编译时保留调试信息
GOOS=wasip1 GOARCH=wasm go build -gcflags="all=-N -l" -o plugin.wasm

# 2. 启动 Higress（开启调试端口）
# 配置 Envoy 的 admin 端口：15000

# 3. 使用 delve 连接（需要特殊配置，Wasm 调试支持有限）
# 目前 Wasm 调试工具链还不成熟，建议用日志调试
```

---

## 发布插件到 OCI 仓库

### 推送流程

```bash
# 1. 登录 Registry
oras login registry.example.com -u admin -p password

# 2. 推送 Wasm 文件
oras push registry.example.com/plugins/hello-plugin:v1.0.0 \
  --artifact-type application/vnd.module.wasm.content.layer.v1+wasm \
  plugin.wasm

# 3. 添加元数据（可选）
oras push registry.example.com/plugins/hello-plugin:v1.0.0 \
  --artifact-type application/vnd.module.wasm.content.layer.v1+wasm \
  plugin.wasm \
  README.md \
  plugin.yaml

# 4. 验证
oras manifest fetch registry.example.com/plugins/hello-plugin:v1.0.0
```

### 版本管理

```bash
# 语义化版本
v1.0.0  → 主版本.次版本.修订版本
v1.0.1  → Bug 修复
v1.1.0  → 新功能（向后兼容）
v2.0.0  → 破坏性变更

# 标签管理
oras tag registry.example.com/plugins/hello-plugin:v1.0.0 latest
oras tag registry.example.com/plugins/hello-plugin:v1.0.0 stable

# 查看标签
oras repo tags registry.example.com/plugins/hello-plugin
```

### CI/CD 自动发布

```yaml
# .github/workflows/release.yml
name: Release Wasm Plugin

on:
  push:
    tags: ['v*']

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-go@v5
        with:
          go-version: '1.24'
      
      - name: Build Wasm
        run: |
          GOOS=wasip1 GOARCH=wasm go build -ldflags="-s -w" -trimpath -o plugin.wasm
      
      - name: Install oras
        run: |
          curl -LO https://github.com/oras-project/oras/releases/download/v1.0.0/oras_1.0.0_linux_amd64.tar.gz
          tar xzf oras_1.0.0_linux_amd64.tar.gz
          sudo mv oras /usr/local/bin/
      
      - name: Login to Registry
        run: oras login ${{ secrets.REGISTRY }} -u ${{ secrets.REGISTRY_USER }} -p ${{ secrets.REGISTRY_PASSWORD }}
      
      - name: Push Wasm
        run: |
          VERSION=${GITHUB_REF#refs/tags/}
          oras push ${{ secrets.REGISTRY }}/plugins/hello-plugin:${VERSION} \
            --artifact-type application/vnd.module.wasm.content.layer.v1+wasm \
            plugin.wasm
```

---

## 常见问题

### Q1: 编译报错 "unsupported GOOS/GOARCH"

```bash
# 确认 Go 版本
go version  # 需要 go1.24+

# 正确编译命令
GOOS=wasip1 GOARCH=wasm go build -o plugin.wasm

# 如果还是报错，检查是否有 cgo 依赖
CGO_ENABLED=0 GOOS=wasip1 GOARCH=wasm go build -o plugin.wasm
```

### Q2: 插件加载失败

```bash
# 1. 检查 Envoy 日志
kubectl logs -n higress-system deploy/higress-gateway | grep wasm

# 2. 常见错误
# - "unable to initialize Wasm code": Wasm 文件损坏或格式错误
# - "failed to load Wasm module": 内存不足或 VM 配置错误
# - "plugin configuration failed": 配置解析错误

# 3. 验证 Wasm 文件
file plugin.wasm
wasm-objdump -x plugin.wasm  # 需要 wabt 工具
```

### Q3: HTTP 调用超时

```go
// 增加超时时间
proxywasm.DispatchHttpCall(
	cluster,
	headers,
	body,
	trailers,
	5000,  // 5 秒（默认 1 秒）
	callback,
)

// 确认 Cluster 配置正确
// 在 Higress 中注册外部服务（McpBridge）
```

---

## 复习卡片

> [!TIP]
> **快速复习清单**
>
> 1. **环境**：Go 1.24+、oras、Docker、kubectl
> 2. **SDK**：`github.com/higress-group/wasm-go`，wrapper 包封装 Proxy-Wasm ABI
> 3. **核心钩子**：ProcessRequestHeadersBy / ProcessRequestBodyBy / ProcessResponseHeadersBy / ProcessLogBy
> 4. **HttpContext**：Path() / Method() / GetRequestHeader() / SetRequestHeader() / SendHttpResponse()
> 5. **返回值**：ActionContinue（继续）/ ActionPause（暂停）/ ActionStop（停止）
> 6. **HTTP 调用**：proxywasm.DispatchHttpCall（异步），回调中 ResumeHttpRequest()
> 7. **编译**：`GOOS=wasip1 GOARCH=wasm go build -o plugin.wasm`
> 8. **发布**：`oras push registry/plugins/name:version plugin.wasm`
> 9. **调试**：日志（wrapper.Log）、本地 Docker 测试、kubectl logs

---

> [!TIP]
> 下一篇：[Wasm 插件实战](/blog/posts/higress-roadmap-10-wasm-practice/) 将完整实现 JWT 认证、请求改写、限流、灰度四个生产级插件。
>
> 返回 [Higress 学习路线总览](/blog/posts/higress-roadmap-00-overview/) | [合集页](/blog/higress-roadmap/)
