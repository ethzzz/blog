---
title: 'RuoYi 阶段一：项目概览与环境搭建'
published: 2026-09-07T11:00:00+08:00
description: '从零开始搭建 RuoYi 开发环境，理解项目结构、Maven 配置、数据库脚本和启动流程。'
tags: [Java, SpringBoot, RuoYi, Maven, MySQL]
category: RuoYi学习路线
draft: false
---

> [!NOTE]
> 本文是 RuoYi 学习路线的**阶段一**，聚焦项目结构和环境搭建。学完本篇你应该能：
> 1. 在本地成功运行 RuoYi 项目
> 2. 理解项目的模块划分和包结构
> 3. 知道每个配置文件的作用

## 前端视角：RuoYi 像什么？

如果把 RuoYi 比作前端项目：

| RuoYi | 前端类比 |
|:--|:--|
| `pom.xml` | `package.json` |
| `src/main/java/com/ruoyi/` | `src/` |
| `application.yml` | `.env` + `config.js` |
| `RuoYiApplication.java` | `main.js` / `index.ts` |
| `sql/ry_20240629.sql` | 数据库迁移脚本 |
| Maven | npm / pnpm |

## 项目结构详解

```
RuoYi/
├── src/
│   ├── main/
│   │   ├── java/com/ruoyi/
│   │   │   ├── common/              # 公共模块
│   │   │   │   ├── annotation/      # 自定义注解
│   │   │   │   ├── config/          # 配置类
│   │   │   │   ├── constant/        # 常量定义
│   │   │   │   ├── core/            # 核心基类
│   │   │   │   ├── enums/           # 枚举类
│   │   │   │   ├── exception/       # 异常处理
│   │   │   │   ├── filter/          # 过滤器
│   │   │   │   └── utils/           # 工具类
│   │   │   │
│   │   │   ├── framework/           # 框架核心
│   │   │   │   ├── aspectj/         # AOP 切面
│   │   │   │   ├── config/          # 框架配置
│   │   │   │   ├── datasource/      # 数据源配置
│   │   │   │   ├── interceptor/     # 拦截器
│   │   │   │   ├── shiro/           # Shiro 安全框架
│   │   │   │   └── web/             # Web 配置
│   │   │   │
│   │   │   ├── generator/           # 代码生成器
│   │   │   │   ├── controller/      # 生成器 Controller
│   │   │   │   ├── domain/          # 生成器实体
│   │   │   │   ├── mapper/          # 生成器 Mapper
│   │   │   │   ├── service/         # 生成器 Service
│   │   │   │   └── util/            # 生成器工具
│   │   │   │
│   │   │   ├── quartz/              # 定时任务
│   │   │   │   ├── controller/      # 任务 Controller
│   │   │   │   ├── domain/          # 任务实体
│   │   │   │   ├── mapper/          # 任务 Mapper
│   │   │   │   ├── service/         # 任务 Service
│   │   │   │   └── util/            # 任务工具
│   │   │   │
│   │   │   ├── system/              # 系统模块（核心业务）
│   │   │   │   ├── controller/      # Controller 层
│   │   │   │   ├── domain/          # 实体类
│   │   │   │   ├── mapper/          # MyBatis Mapper
│   │   │   │   └── service/         # Service 层
│   │   │   │
│   │   │   └── web/                 # Web 层
│   │   │       └── controller/      # 公共 Controller
│   │   │
│   │   └── resources/
│   │       ├── mapper/              # MyBatis XML 映射文件
│   │       │   ├── generator/       # 代码生成器 Mapper XML
│   │       │   ├── quartz/          # 定时任务 Mapper XML
│   │       │   └── system/          # 系统模块 Mapper XML
│   │       │
│   │       ├── static/              # 静态资源
│   │       │   ├── ajax/            # Ajax 插件
│   │       │   ├── css/             # 样式文件
│   │       │   ├── fonts/           # 字体文件
│   │       │   ├── img/             # 图片
│   │       │   └── js/              # JavaScript
│   │       │
│   │       ├── templates/           # Thymeleaf 模板
│   │       │   ├── error/           # 错误页面
│   │       │   ├── include/         # 公共片段
│   │       │   ├── index/           # 首页
│   │       │   ├── login/           # 登录页
│   │       │   ├── monitor/         # 监控页面
│   │       │   ├── system/          # 系统管理页面
│   │       │   └── tool/            # 工具页面
│   │       │
│   │       ├── application.yml      # 主配置文件
│   │       ├── application-druid.yml # 数据源配置
│   │       ├── logback.xml          # 日志配置
│   │       └── banner.txt           # 启动 Banner
│   │
│   └── test/                        # 测试代码
│
├── sql/                             # 数据库脚本
│   ├── ry_20240629.sql              # 主库脚本
│   └── quartz.sql                   # 定时任务脚本
│
├── pom.xml                          # Maven 配置
├── README.md                        # 项目说明
└── LICENSE                          # 开源协议
```

## Maven 配置 (pom.xml)

`pom.xml` 是项目的"package.json"，定义了依赖和构建配置：

```xml
<!-- pom.xml 核心依赖 -->
<dependencies>
    <!-- Spring Boot 核心 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Boot 测试 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    
    <!-- MyBatis -->
    <dependency>
        <groupId>org.mybatis.spring.boot</groupId>
        <artifactId>mybatis-spring-boot-starter</artifactId>
        <version>2.3.1</version>
    </dependency>
    
    <!-- MySQL 驱动 -->
    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Druid 连接池 -->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid-spring-boot-starter</artifactId>
        <version>1.2.20</version>
    </dependency>
    
    <!-- Shiro 安全框架 -->
    <dependency>
        <groupId>org.apache.shiro</groupId>
        <artifactId>shiro-spring</artifactId>
        <version>1.13.0</version>
    </dependency>
    
    <!-- Thymeleaf 模板引擎 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-thymeleaf</artifactId>
    </dependency>
    
    <!-- Quartz 定时任务 -->
    <dependency>
        <groupId>org.quartz-scheduler</groupId>
        <artifactId>quartz</artifactId>
    </dependency>
    
    <!-- 代码生成器模板引擎 -->
    <dependency>
        <groupId>org.apache.velocity</groupId>
        <artifactId>velocity-engine-core</artifactId>
        <version>2.3</version>
    </dependency>
</dependencies>
```

> [!TIP]
> Maven 依赖管理对比 npm：
> - `mvn clean install` ≈ `npm install`
> - `mvn spring-boot:run` ≈ `npm run dev`
> - `pom.xml` 的 `<dependencies>` ≈ `package.json` 的 `dependencies`

## 配置文件详解

### application.yml（主配置）

```yaml
# src/main/resources/application.yml
spring:
  # 环境配置
  profiles:
    active: druid
  
  # 文件上传限制
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 20MB
  
  # Thymeleaf 模板引擎
  thymeleaf:
    mode: HTML
    encoding: utf-8
    cache: false  # 开发环境关闭缓存
  
  # 静态资源
  web:
    resources:
      static-locations: classpath:/static/,classpath:/public/

# MyBatis 配置
mybatis:
  typeAliasesPackage: com.ruoyi.**.domain
  mapperLocations: classpath:mapper/**/*.xml
  configLocation: classpath:mybatis/mybatis-config.xml

# Shiro 配置
shiro:
  user:
    # 登录地址
    loginUrl: /login
    # 首页
    indexUrl: /index
    # 密码错误次数
    password:
      maxRetryCount: 5
      lockTime: 10  # 锁定时间（分钟）

# 项目相关配置
ruoyi:
  # 名称
  name: RuoYi
  # 版本
  version: 4.8.3
  # 版权年份
  copyrightYear: 2024
  # 实例演示开关
  demoEnabled: true
  # 文件路径（上传文件存储位置）
  profile: D:/ruoyi/uploadPath
  # 获取 IP 地址的 header 键
  addressEnabled: false
```

### application-druid.yml（数据源配置）

```yaml
# src/main/resources/application-druid.yml
spring:
  datasource:
    type: com.alibaba.druid.pool.DruidDataSource
    driverClassName: com.mysql.cj.jdbc.Driver
    druid:
      # 主库数据源
      master:
        url: jdbc:mysql://localhost:3306/ry?useUnicode=true&characterEncoding=utf8&zeroDateTimeBehavior=convertToNull&useSSL=true&serverTimezone=GMT%2B8
        username: root
        password: your_password
      # 从库数据源（可选）
      slave:
        enabled: false
        url: 
        username: 
        password: 
      # 初始连接数
      initialSize: 5
      # 最小连接池数量
      minIdle: 10
      # 最大连接池数量
      maxActive: 20
      # 配置获取连接等待超时的时间
      maxWait: 60000
      # 配置检测间隔时间
      timeBetweenEvictionRunsMillis: 60000
      # 配置连接最小生存时间
      minEvictableIdleTimeMillis: 300000
      # 配置检测连接是否有效
      validationQuery: SELECT 1 FROM DUAL
      testWhileIdle: true
      testOnBorrow: false
      testOnReturn: false
```

## 启动类

```java
// src/main/java/com/ruoyi/RuoYiApplication.java
package com.ruoyi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;

/**
 * 启动程序
 * 
 * @author ruoyi
 */
@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })
public class RuoYiApplication {
    public static void main(String[] args) {
        SpringApplication.run(RuoYiApplication.class, args);
        System.out.println("(♥◠‿◠)ﾉﾞ  RuoYi 启动成功   ლ(´ڡ`ლ)ﾞ");
    }
}
```

> [!IMPORTANT]
> `@SpringBootApplication` 是一个组合注解，包含：
> - `@SpringBootConfiguration`：标注配置类
> - `@EnableAutoConfiguration`：启用自动配置
> - `@ComponentScan`：组件扫描
> 
> `exclude = { DataSourceAutoConfiguration.class }` 排除了 Spring Boot 默认的数据源配置，因为 RuoYi 使用 Druid 自定义数据源。

## 数据库脚本导入

RuoYi 提供了两个 SQL 脚本：

| 脚本 | 说明 |
|:--|:--|
| `sql/ry_20240629.sql` | 主库脚本（用户、角色、菜单、部门等表）|
| `sql/quartz.sql` | 定时任务脚本（Quartz 相关表）|

### 导入步骤

```bash
# 1. 创建数据库
mysql -u root -p
CREATE DATABASE ry DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
EXIT;

# 2. 导入主库脚本
mysql -u root -p ry < sql/ry_20240629.sql

# 3. 导入定时任务脚本
mysql -u root -p ry < sql/quartz.sql

# 4. 验证
mysql -u root -p
USE ry;
SHOW TABLES;
# 应该看到 sys_user, sys_role, sys_menu, sys_dept 等表
```

### 核心数据表

| 表名 | 说明 |
|:--|:--|
| `sys_user` | 用户表 |
| `sys_role` | 角色表 |
| `sys_menu` | 菜单表 |
| `sys_dept` | 部门表 |
| `sys_post` | 岗位表 |
| `sys_dict_type` | 字典类型表 |
| `sys_dict_data` | 字典数据表 |
| `sys_config` | 参数配置表 |
| `sys_logininfor` | 登录日志表 |
| `sys_oper_log` | 操作日志表 |
| `sys_user_role` | 用户-角色关联表 |
| `sys_role_menu` | 角色-菜单关联表 |
| `sys_role_dept` | 角色-部门关联表 |
| `sys_user_post` | 用户-岗位关联表 |

## 启动与验证

### IDEA 启动

1. 用 IDEA 打开项目（选择 `pom.xml` 作为项目导入）
2. 等待 Maven 下载依赖
3. 修改 `application-druid.yml` 中的数据库密码
4. 运行 `RuoYiApplication.java`

### 命令行启动

```bash
# 编译项目
mvn clean install -DskipTests

# 启动
mvn spring-boot:run

# 或者打包后运行
mvn clean package -DskipTests
java -jar target/ruoyi.jar
```

### 访问验证

```
http://localhost:80
```

默认账号：
- 用户名：`admin`
- 密码：`admin123`

## 常见启动问题

### 1. 数据库连接失败

```
Communications link failure
```

**解决**：检查 `application-druid.yml` 中的数据库 URL、用户名、密码。

### 2. 端口被占用

```
Port 80 was already in use
```

**解决**：修改 `application.yml` 中的端口，或关闭占用端口的程序。

```yaml
server:
  port: 8080  # 改成其他端口
```

### 3. Maven 依赖下载慢

**解决**：配置阿里云镜像。

```xml
<!-- ~/.m2/settings.xml -->
<mirrors>
    <mirror>
        <id>aliyunmaven</id>
        <mirrorOf>*</mirrorOf>
        <name>阿里云公共仓库</name>
        <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
</mirrors>
```

### 4. Thymeleaf 模板找不到

```
Template might not exist or might not be accessible
```

**解决**：确保 `spring.thymeleaf.cache: false`（开发环境），并检查模板路径。

## 复习卡片

```java
// RuoYi 项目结构记忆口诀
// common  - 公共工具
// framework - 框架核心
// system  - 系统业务
// generator - 代码生成
// quartz  - 定时任务

// 启动类关键注解
@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })

// 配置文件加载顺序
// application.yml -> application-{profile}.yml

// 默认账号
// admin / admin123
```

| 文件 | 作用 |
|:--|:--|
| `pom.xml` | Maven 依赖管理 |
| `application.yml` | 主配置文件 |
| `application-druid.yml` | 数据源配置 |
| `RuoYiApplication.java` | 启动入口 |
| `sql/ry_20240629.sql` | 主库脚本 |
| `sql/quartz.sql` | 定时任务脚本 |

> [!TIP]
> 下一步：[阶段二：Spring Boot 基础与项目结构](/blog/posts/ruoyi-roadmap-02-springboot-basics/)
> 
> 在阶段二中，我们将深入理解 Spring Boot 的自动配置原理，以及 RuoYi 是如何利用 Spring Boot 的特性来简化开发的。
