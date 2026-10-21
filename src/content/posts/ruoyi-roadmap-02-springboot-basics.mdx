---
title: 'RuoYi 阶段二：Spring Boot 基础与项目结构'
published: 2026-09-07T12:00:00+08:00
description: '理解 Spring Boot 核心概念：IoC/DI、常用注解、自动配置原理，以及 RuoYi 中的实际应用。'
tags: [Java, SpringBoot, RuoYi, IoC, 注解]
category: RuoYi学习路线
draft: false
---

> [!NOTE]
> 本文是 RuoYi 学习路线的**阶段二**，聚焦 Spring Boot 基础。学完本篇你应该能：
> 1. 理解 IoC 和依赖注入的原理
> 2. 掌握 Spring Boot 常用注解
> 3. 知道 RuoYi 是如何组织代码的

## 前端视角：Spring Boot 像什么？

| Spring Boot | 前端类比 |
|:--|:--|
| IoC 容器 | React Context / Vue Provide-Inject |
| `@Autowired` | `useContext()` / `inject()` |
| `@Component` | 注册全局组件 |
| `@Service` | 业务逻辑层（类似 Redux actions）|
| `@Controller` | 路由处理器 |
| `@Configuration` | 配置文件 |
| 自动配置 | Vite 插件自动注入 |

## Spring Boot 核心概念

### 1. IoC（控制反转）与 DI（依赖注入）

**传统方式**（自己 new 对象）：

```java
// 传统方式：自己创建依赖
public class UserController {
    private UserService userService = new UserServiceImpl();  // 硬编码依赖
    
    public void getUser() {
        userService.findById(1);
    }
}
```

**Spring 方式**（容器管理对象）：

```java
// Spring 方式：容器注入依赖
@RestController
public class UserController {
    @Autowired
    private UserService userService;  // 容器自动注入
    
    @GetMapping("/user/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
}
```

> [!TIP]
> IoC 的核心思想：**不要自己创建对象，让容器帮你创建和管理**。
> 
> 类比前端：就像 React 的 Context，你不需要在每个组件里传递 props，而是从 Context 中获取。

### 2. Bean 的生命周期

```
实例化 -> 属性赋值 -> 初始化 -> 使用 -> 销毁
   ↑         ↑         ↑              ↑
   |         |         |              |
 new()   @Autowired  @PostConstruct  @PreDestroy
```

## Spring Boot 常用注解

### 组件注解

| 注解 | 说明 | RuoYi 中的使用 |
|:--|:--|:--|
| `@Component` | 通用组件 | 工具类 |
| `@Service` | 业务逻辑层 | `SysUserServiceImpl` |
| `@Repository` | 数据访问层 | MyBatis Mapper |
| `@Controller` | 控制器层 | `SysUserController` |
| `@RestController` | REST 控制器 | 返回 JSON 的接口 |

### 依赖注入注解

| 注解 | 说明 |
|:--|:--|
| `@Autowired` | 按类型自动注入 |
| `@Qualifier` | 按名称指定注入 |
| `@Resource` | JSR-250 标准注入 |
| `@Value` | 注入配置文件值 |

### Web 注解

| 注解 | 说明 |
|:--|:--|
| `@RequestMapping` | 通用请求映射 |
| `@GetMapping` | GET 请求 |
| `@PostMapping` | POST 请求 |
| `@PutMapping` | PUT 请求 |
| `@DeleteMapping` | DELETE 请求 |
| `@PathVariable` | 路径参数 |
| `@RequestParam` | 查询参数 |
| `@RequestBody` | 请求体 |

## RuoYi 中的实际应用

### Controller 层示例

```java
// src/main/java/com/ruoyi/web/controller/system/SysUserController.java
package com.ruoyi.web.controller.system;

import java.util.List;
import javax.servlet.http.HttpServletResponse;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.common.utils.ShiroUtils;
import com.ruoyi.system.domain.SysUser;
import com.ruoyi.system.service.ISysUserService;

/**
 * 用户信息
 * 
 * @author ruoyi
 */
@Controller
@RequestMapping("/system/user")
public class SysUserController extends BaseController {
    private String prefix = "system/user";

    @Autowired
    private ISysUserService userService;

    @RequiresPermissions("system:user:view")
    @GetMapping()
    public String user() {
        return prefix + "/user";
    }

    @RequiresPermissions("system:user:list")
    @PostMapping("/list")
    @ResponseBody
    public TableDataInfo list(SysUser user) {
        startPage();
        List<SysUser> list = userService.selectUserList(user);
        return getDataTable(list);
    }

    @Log(title = "用户管理", businessType = BusinessType.INSERT)
    @RequiresPermissions("system:user:add")
    @PostMapping("/add")
    @ResponseBody
    public AjaxResult addSave(@Validated SysUser user) {
        return toAjax(userService.insertUser(user));
    }

    @Log(title = "用户管理", businessType = BusinessType.UPDATE)
    @RequiresPermissions("system:user:edit")
    @PostMapping("/edit")
    @ResponseBody
    public AjaxResult editSave(@Validated SysUser user) {
        return toAjax(userService.updateUser(user));
    }

    @Log(title = "用户管理", businessType = BusinessType.DELETE)
    @RequiresPermissions("system:user:remove")
    @PostMapping("/remove")
    @ResponseBody
    public AjaxResult remove(String ids) {
        return toAjax(userService.deleteUserByIds(ids));
    }
}
```

### Service 层示例

```java
// src/main/java/com/ruoyi/system/service/impl/SysUserServiceImpl.java
package com.ruoyi.system.service.impl;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ruoyi.common.core.text.Convert;
import com.ruoyi.system.domain.SysUser;
import com.ruoyi.system.mapper.SysUserMapper;
import com.ruoyi.system.service.ISysUserService;

/**
 * 用户 业务层处理
 * 
 * @author ruoyi
 */
@Service
public class SysUserServiceImpl implements ISysUserService {
    @Autowired
    private SysUserMapper userMapper;

    @Override
    public List<SysUser> selectUserList(SysUser user) {
        return userMapper.selectUserList(user);
    }

    @Override
    public SysUser selectUserById(Long userId) {
        return userMapper.selectUserById(userId);
    }

    @Override
    @Transactional
    public int insertUser(SysUser user) {
        // 新增用户信息
        int rows = userMapper.insertUser(user);
        // 新增用户岗位关联
        insertUserPost(user);
        // 新增用户与角色管理
        insertUserRole(user);
        return rows;
    }

    @Override
    @Transactional
    public int updateUser(SysUser user) {
        // 删除用户与角色关联
        userMapper.deleteUserRoleByUserId(user.getUserId());
        // 新增用户和角色管理
        insertUserRole(user);
        // 删除用户与岗位关联
        userMapper.deleteUserPostByUserId(user.getUserId());
        // 新增用户与岗位管理
        insertUserPost(user);
        return userMapper.updateUser(user);
    }

    @Override
    @Transactional
    public int deleteUserByIds(String ids) {
        return userMapper.deleteUserByIds(Convert.toStrArray(ids));
    }
}
```

### 配置类示例

```java
// src/main/java/com/ruoyi/framework/config/ShiroConfig.java
package com.ruoyi.framework.config;

import java.util.LinkedHashMap;
import java.util.Map;
import javax.servlet.Filter;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.apache.shiro.web.mgt.DefaultWebSecurityManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Shiro 配置
 * 
 * @author ruoyi
 */
@Configuration
public class ShiroConfig {
    
    @Bean
    public DefaultWebSecurityManager securityManager() {
        DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager();
        // 设置 Realm
        securityManager.setRealm(userRealm());
        return securityManager;
    }
    
    @Bean
    public ShiroFilterFactoryBean shiroFilterFactoryBean(DefaultWebSecurityManager securityManager) {
        ShiroFilterFactoryBean factoryBean = new ShiroFilterFactoryBean();
        factoryBean.setSecurityManager(securityManager);
        
        // 配置过滤链
        Map<String, String> filterChainDefinitionMap = new LinkedHashMap<>();
        filterChainDefinitionMap.put("/login", "anon");
        filterChainDefinitionMap.put("/captcha/captchaImage**", "anon");
        filterChainDefinitionMap.put("/**", "authc");
        
        factoryBean.setFilterChainDefinitionMap(filterChainDefinitionMap);
        return factoryBean;
    }
}
```

## 自动配置原理

Spring Boot 的自动配置是通过 `@EnableAutoConfiguration` 实现的：

```java
// Spring Boot 启动时会扫描 META-INF/spring.factories
// 加载所有自动配置类

// 例如：DataSourceAutoConfiguration
@Configuration
@ConditionalOnClass({ DataSource.class, EmbeddedDatabaseType.class })
@EnableConfigurationProperties(DataSourceProperties.class)
public class DataSourceAutoConfiguration {
    // 自动配置数据源
}
```

RuoYi 排除了默认的数据源自动配置：

```java
@SpringBootApplication(exclude = { DataSourceAutoConfiguration.class })
public class RuoYiApplication {
    // 使用 Druid 自定义数据源
}
```

## 项目分层架构

```
┌─────────────────────────────────────────┐
│           Controller 层                  │
│    (接收请求、参数校验、返回响应)          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│            Service 层                    │
│    (业务逻辑、事务控制、数据组装)          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│            Mapper 层                     │
│    (数据库操作、SQL 执行)                │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│           Database                       │
│    (MySQL 数据存储)                      │
└─────────────────────────────────────────┘
```

## RuoYi 包结构规范

| 包名 | 职责 | 示例 |
|:--|:--|:--|
| `controller` | 接收 HTTP 请求 | `SysUserController` |
| `service` | 业务逻辑接口 | `ISysUserService` |
| `service.impl` | 业务逻辑实现 | `SysUserServiceImpl` |
| `mapper` | 数据库访问接口 | `SysUserMapper` |
| `domain` | 实体类 | `SysUser` |
| `domain.vo` | 视图对象 | `UserVO` |
| `domain.dto` | 数据传输对象 | `UserDTO` |

## 复习卡片

```java
// Spring Boot 核心注解记忆
// @SpringBootApplication - 启动类
// @RestController - REST 控制器
// @Service - 业务层
// @Repository - 数据层
// @Autowired - 自动注入
// @RequestMapping - 请求映射

// IoC 核心思想
// 不要自己 new，让容器帮你管理

// 分层架构
// Controller -> Service -> Mapper -> Database

// RuoYi 包结构
// com.ruoyi.system.controller
// com.ruoyi.system.service
// com.ruoyi.system.mapper
// com.ruoyi.system.domain
```

| 概念 | 说明 |
|:--|:--|
| IoC | 控制反转，对象由容器创建 |
| DI | 依赖注入，容器自动装配依赖 |
| Bean | Spring 管理的对象实例 |
| 自动配置 | Spring Boot 根据依赖自动配置 Bean |

> [!TIP]
> 下一步：[阶段三：MyBatis 与数据库操作](/blog/posts/ruoyi-roadmap-03-mybatis-database/)
> 
> 在阶段三中，我们将深入理解 MyBatis 的工作原理，以及 RuoYi 是如何进行数据库操作的。
