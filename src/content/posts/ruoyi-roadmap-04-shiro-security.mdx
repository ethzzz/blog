---
title: 'RuoYi 阶段四：Shiro 权限框架'
published: 2026-09-07T14:00:00+08:00
description: '理解 Shiro 核心概念：认证、授权、Session 管理、Realm 配置，以及 RuoYi 中的权限控制实现。'
tags: [Java, Shiro, RuoYi, 权限, 安全]
category: RuoYi学习路线
draft: false
---

> [!NOTE]
> 本文是 RuoYi 学习路线的**阶段四**，聚焦 Shiro 权限框架。学完本篇你应该能：
> 1. 理解 Shiro 的认证和授权机制
> 2. 掌握 Realm 的配置和使用
> 3. 知道 RuoYi 是如何实现权限控制的

## 前端视角：Shiro 像什么？

| Shiro | 前端类比 |
|:--|:--|
| Authentication（认证）| 登录验证（username/password）|
| Authorization（授权）| 路由守卫 + 按钮级权限 |
| Session | LocalStorage / SessionStorage |
| Realm | 用户数据源（API 接口）|
| `@RequiresPermissions` | `v-if="hasPermission('xxx')"` |

## Shiro 核心概念

### 1. 四大核心功能

```
┌─────────────────────────────────────────────────────────┐
│                      Shiro 架构                          │
├─────────────────────────────────────────────────────────┤
│  Authentication（认证）  │  用户登录验证                  │
│  Authorization（授权）   │  权限检查                      │
│  Session Management     │  会话管理                      │
│  Cryptography           │  加密解密                      │
└─────────────────────────────────────────────────────────┘
```

### 2. 核心组件

| 组件 | 说明 |
|:--|:--|
| `Subject` | 当前用户（主体）|
| `SecurityManager` | 安全管理器（核心）|
| `Realm` | 数据源（连接数据库）|
| `Session` | 会话管理 |
| `Cache` | 缓存管理 |

## RuoYi 中的 Shiro 配置

### 1. ShiroConfig 配置类

```java
// src/main/java/com/ruoyi/framework/config/ShiroConfig.java
package com.ruoyi.framework.config;

import java.util.LinkedHashMap;
import java.util.Map;
import javax.servlet.Filter;
import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.spring.security.interceptor.AuthorizationAttributeSourceAdvisor;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.apache.shiro.web.mgt.DefaultWebSecurityManager;
import org.apache.shiro.web.servlet.SimpleCookie;
import org.apache.shiro.web.session.mgt.DefaultWebSessionManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.ruoyi.framework.shiro.realm.UserRealm;
import com.ruoyi.framework.shiro.session.OnlineSessionDAO;
import com.ruoyi.framework.shiro.session.OnlineSessionFactory;
import com.ruoyi.framework.shiro.web.filter.LogoutFilter;
import com.ruoyi.framework.shiro.web.filter.captcha.CaptchaValidateFilter;
import com.ruoyi.framework.shiro.web.filter.kickout.KickoutSessionFilter;
import com.ruoyi.framework.shiro.web.filter.online.OnlineSessionFilter;
import com.ruoyi.framework.shiro.web.filter.sync.SyncOnlineSessionFilter;

/**
 * Shiro 配置
 * 
 * @author ruoyi
 */
@Configuration
public class ShiroConfig {
    
    /**
     * 安全管理器
     */
    @Bean
    public SecurityManager securityManager(UserRealm userRealm) {
        DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager();
        // 设置 Realm
        securityManager.setRealm(userRealm);
        // 设置 Session 管理器
        securityManager.setSessionManager(sessionManager());
        return securityManager;
    }
    
    /**
     * Shiro 过滤器配置
     */
    @Bean
    public ShiroFilterFactoryBean shiroFilterFactoryBean(SecurityManager securityManager) {
        ShiroFilterFactoryBean factoryBean = new ShiroFilterFactoryBean();
        factoryBean.setSecurityManager(securityManager);
        
        // 配置过滤链
        Map<String, String> filterChainDefinitionMap = new LinkedHashMap<>();
        
        // 匿名访问（不需要登录）
        filterChainDefinitionMap.put("/login", "anon");
        filterChainDefinitionMap.put("/logout", "logout");
        filterChainDefinitionMap.put("/captcha/captchaImage**", "anon");
        filterChainDefinitionMap.put("/css/**", "anon");
        filterChainDefinitionMap.put("/js/**", "anon");
        filterChainDefinitionMap.put("/img/**", "anon");
        filterChainDefinitionMap.put("/ajax/**", "anon");
        filterChainDefinitionMap.put("/fonts/**", "anon");
        filterChainDefinitionMap.put("/druid/**", "anon");
        
        // 需要认证访问
        filterChainDefinitionMap.put("/**", "authc");
        
        factoryBean.setFilterChainDefinitionMap(filterChainDefinitionMap);
        
        // 自定义过滤器
        Map<String, Filter> filters = new LinkedHashMap<>();
        filters.put("onlineSession", onlineSessionFilter());
        filters.put("syncOnlineSession", syncOnlineSessionFilter());
        filters.put("captchaValidate", captchaValidateFilter());
        filters.put("kickout", kickoutSessionFilter());
        factoryBean.setFilters(filters);
        
        return factoryBean;
    }
    
    /**
     * Session 管理器
     */
    @Bean
    public DefaultWebSessionManager sessionManager() {
        DefaultWebSessionManager sessionManager = new DefaultWebSessionManager();
        // 设置 Session 超时时间（毫秒）
        sessionManager.setGlobalSessionTimeout(1800000);  // 30 分钟
        // 设置 Session DAO
        sessionManager.setSessionDAO(onlineSessionDAO());
        // 设置 Session 工厂
        sessionManager.setSessionFactory(onlineSessionFactory());
        // 设置 Cookie
        sessionManager.setSessionIdCookie(sessionIdCookie());
        // 禁用 URL 重写（防止 JSESSIONID 暴露在 URL 中）
        sessionManager.setSessionIdUrlRewritingEnabled(false);
        return sessionManager;
    }
    
    /**
     * 开启 Shiro 注解支持
     */
    @Bean
    public AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor(SecurityManager securityManager) {
        AuthorizationAttributeSourceAdvisor advisor = new AuthorizationAttributeSourceAdvisor();
        advisor.setSecurityManager(securityManager);
        return advisor;
    }
}
```

### 2. UserRealm 数据源

Realm 是 Shiro 连接数据库的桥梁：

```java
// src/main/java/com/ruoyi/framework/shiro/realm/UserRealm.java
package com.ruoyi.framework.shiro.realm;

import java.util.HashSet;
import java.util.Set;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.ExcessiveAttemptsException;
import org.apache.shiro.authc.IncorrectCredentialsException;
import org.apache.shiro.authc.LockedAccountException;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.authc.UnknownAccountException;
import org.apache.shiro.authc.UsernamePasswordToken;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import com.ruoyi.common.constant.ShiroConstants;
import com.ruoyi.common.core.domain.entity.SysRole;
import com.ruoyi.common.core.domain.entity.SysUser;
import com.ruoyi.common.utils.ShiroUtils;
import com.ruoyi.framework.shiro.service.PasswordService;
import com.ruoyi.system.service.ISysMenuService;
import com.ruoyi.system.service.ISysRoleService;

/**
 * 自定义 Realm 处理登录 权限
 * 
 * @author ruoyi
 */
public class UserRealm extends AuthorizingRealm {
    private static final Logger log = LoggerFactory.getLogger(UserRealm.class);

    @Autowired
    private ISysMenuService menuService;
    
    @Autowired
    private ISysRoleService roleService;
    
    @Autowired
    private PasswordService passwordService;

    /**
     * 授权（权限检查）
     */
    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection arg0) {
        SysUser user = ShiroUtils.getSysUser();
        SimpleAuthorizationInfo info = new SimpleAuthorizationInfo();
        
        // 角色加载
        Set<String> roles = roleService.selectRoleKeys(user.getUserId());
        // 权限加载
        Set<String> menus = menuService.selectPermsByUserId(user.getUserId());
        
        info.setRoles(roles);
        info.setStringPermissions(menus);
        
        return info;
    }

    /**
     * 认证（登录验证）
     */
    @Override
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) 
            throws AuthenticationException {
        UsernamePasswordToken upToken = (UsernamePasswordToken) token;
        String username = upToken.getUsername();
        String password = new String(upToken.getPassword());

        // 1. 查询用户
        SysUser user = passwordService.loginPreCheck(username, password);
        
        // 2. 验证用户状态
        if (user == null) {
            throw new UnknownAccountException("用户不存在");
        }
        if (UserStatus.DELETED.getCode().equals(user.getDelFlag())) {
            throw new UnknownAccountException("用户已被删除");
        }
        if (UserStatus.DISABLE.getCode().equals(user.getStatus())) {
            throw new LockedAccountException("用户已被停用");
        }
        
        // 3. 验证密码
        if (!passwordService.matches(user, password)) {
            throw new IncorrectCredentialsException("密码错误");
        }
        
        // 4. 返回认证信息
        return new SimpleAuthenticationInfo(user, password, getName());
    }
}
```

## 认证流程

```
用户提交登录表单
    ↓
Shiro 拦截请求
    ↓
调用 UserRealm.doGetAuthenticationInfo()
    ↓
查询数据库验证用户
    ↓
验证密码（加密对比）
    ↓
创建 Session
    ↓
登录成功，跳转到首页
```

### 登录 Controller

```java
// src/main/java/com/ruoyi/web/controller/common/SysLoginController.java
@Controller
public class SysLoginController {
    
    @Autowired
    private ISysMenuService menuService;
    
    @Autowired
    private PasswordService passwordService;

    @GetMapping("/login")
    public String login(HttpServletRequest request, HttpServletResponse response) {
        // 如果已经登录，直接跳转到首页
        if (ShiroUtils.isLogin()) {
            return "redirect:/index";
        }
        return "login";
    }

    @PostMapping("/login")
    @ResponseBody
    public AjaxResult ajaxLogin(String username, String password, String rememberMe) {
        // 1. 验证码检查
        String captcha = ServletUtils.getParameter("validateCode");
        if (StringUtils.isNotEmpty(captcha) && !validateCaptcha(captcha)) {
            return error("验证码错误");
        }
        
        // 2. Shiro 认证
        UsernamePasswordToken token = new UsernamePasswordToken(username, password);
        Subject subject = SecurityUtils.getSubject();
        try {
            subject.login(token);
            return success();
        } catch (AuthenticationException e) {
            return error(e.getMessage());
        }
    }
}
```

## 授权流程

```
用户访问受保护资源
    ↓
Shiro 拦截请求
    ↓
调用 UserRealm.doGetAuthorizationInfo()
    ↓
查询用户角色和权限
    ↓
检查是否有权限
    ↓
有权限：放行；无权限：抛出异常
```

### 权限注解使用

```java
// Controller 中使用 @RequiresPermissions
@RestController
@RequestMapping("/system/user")
public class SysUserController {
    
    // 需要 system:user:view 权限
    @RequiresPermissions("system:user:view")
    @GetMapping()
    public String user() {
        return "system/user/user";
    }
    
    // 需要 system:user:list 权限
    @RequiresPermissions("system:user:list")
    @PostMapping("/list")
    @ResponseBody
    public TableDataInfo list(SysUser user) {
        startPage();
        List<SysUser> list = userService.selectUserList(user);
        return getDataTable(list);
    }
    
    // 需要 system:user:add 权限
    @RequiresPermissions("system:user:add")
    @Log(title = "用户管理", businessType = BusinessType.INSERT)
    @PostMapping("/add")
    @ResponseBody
    public AjaxResult addSave(SysUser user) {
        return toAjax(userService.insertUser(user));
    }
}
```

### 权限标识规范

RuoYi 的权限标识格式：`模块:功能:操作`

| 权限标识 | 说明 |
|:--|:--|
| `system:user:view` | 查看用户列表 |
| `system:user:list` | 查询用户数据 |
| `system:user:add` | 新增用户 |
| `system:user:edit` | 修改用户 |
| `system:user:remove` | 删除用户 |
| `system:user:export` | 导出用户 |
| `system:user:import` | 导入用户 |
| `system:user:resetPwd` | 重置密码 |

## Session 管理

### 1. 在线用户管理

```java
// src/main/java/com/ruoyi/web/controller/monitor/ServerController.java
@Controller
@RequestMapping("/monitor/online")
public class SysUserOnlineController extends BaseController {
    
    @Autowired
    private ISysUserOnlineService userOnlineService;

    // 查询在线用户列表
    @RequiresPermissions("monitor:online:view")
    @GetMapping()
    public String online() {
        return prefix + "/online";
    }

    // 强退用户
    @RequiresPermissions("monitor:online:forceLogout")
    @Log(title = "在线用户", businessType = BusinessType.FORCE)
    @PostMapping("/forceLogout")
    @ResponseBody
    public AjaxResult forceLogout(String sessionId) {
        userOnlineService.forceLogout(sessionId);
        return success();
    }
}
```

### 2. Session 踢人功能

防止同一账号多地登录：

```java
// src/main/java/com/ruoyi/framework/shiro/web/filter/kickout/KickoutSessionFilter.java
public class KickoutSessionFilter extends AccessControlFilter {
    
    // 同一个用户最大 Session 数
    private int maxSession = 1;
    
    // 被踢出后跳转的 URL
    private String kickoutUrl;
    
    @Override
    protected boolean isAccessAllowed(ServletRequest request, ServletResponse response, 
            Object mappedValue) throws Exception {
        Subject subject = getSubject(request, response);
        if (!subject.isAuthenticated() && !subject.isRemembered()) {
            return true;
        }
        
        Session session = subject.getSession();
        Serializable sessionId = session.getId();
        
        // 检查是否超出最大 Session 数
        List<Serializable> sessionIds = cache.get(sessionId);
        if (sessionIds != null && sessionIds.size() >= maxSession) {
            // 踢出最早的 Session
            subject.logout();
            return false;
        }
        
        return true;
    }
}
```

## 密码加密

RuoYi 使用 MD5 + Salt 加密：

```java
// src/main/java/com/ruoyi/framework/shiro/service/PasswordService.java
@Service
public class PasswordService {
    
    // 加密算法
    private static final String ALGORITHM_NAME = "md5";
    // 加密次数
    private static final int HASH_ITERATIONS = 2;
    
    /**
     * 加密密码
     */
    public String encryptPassword(String salt, String password) {
        return new SimpleHash(ALGORITHM_NAME, password, salt, HASH_ITERATIONS).toString();
    }
    
    /**
     * 验证密码
     */
    public boolean matches(SysUser user, String newPassword) {
        return user.getPassword().equals(encryptPassword(user.getSalt(), newPassword));
    }
}
```

## RBAC 权限模型

RuoYi 使用经典的 RBAC（Role-Based Access Control）模型：

```
用户 (User) ←→ 角色 (Role) ←→ 权限 (Permission/Menu)
   ↑              ↑                  ↑
   |              |                  |
sys_user    sys_role          sys_menu
   ↓              ↓                  ↓
sys_user_role  sys_role_menu
```

### 权限加载流程

1. 用户登录时，查询用户的角色
2. 根据角色查询对应的权限（菜单）
3. 将权限缓存到 Session 中
4. 后续请求直接从 Session 获取权限

## 复习卡片

```java
// Shiro 核心 API
Subject subject = SecurityUtils.getSubject();  // 获取当前用户
subject.login(token);                          // 登录
subject.logout();                              // 登出
subject.isAuthenticated();                     // 是否已登录
subject.hasRole("admin");                      // 是否有角色
subject.isPermitted("system:user:view");       // 是否有权限

// 常用注解
@RequiresAuthentication    // 需要已登录
@RequiresUser              // 需要用户存在
@RequiresRoles("admin")    // 需要角色
@RequiresPermissions("system:user:view")  // 需要权限

// Realm 核心方法
doGetAuthenticationInfo()  // 认证（登录）
doGetAuthorizationInfo()   // 授权（权限）

// RBAC 模型
用户 -> 角色 -> 权限（菜单）
```

| 概念 | 说明 |
|:--|:--|
| Subject | 当前用户主体 |
| SecurityManager | 安全管理器 |
| Realm | 数据源（连接数据库）|
| Authentication | 认证（登录验证）|
| Authorization | 授权（权限检查）|
| Session | 会话管理 |
| RBAC | 基于角色的访问控制 |

> [!TIP]
> 下一步：[阶段五：用户管理模块](/blog/posts/ruoyi-roadmap-05-user-management/)
> 
> 在阶段五中，我们将深入分析用户管理模块的完整实现，包括实体类、Service、Controller 和前端页面。
