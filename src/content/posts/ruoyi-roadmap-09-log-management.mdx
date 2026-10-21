---
title: 'RuoYi 阶段九：日志管理'
published: 2026-09-07T19:00:00+08:00
description: '学习操作日志和登录日志的实现，掌握 AOP 切面编程和 @Log 注解的使用。'
tags: [Java, RuoYi, 日志管理, AOP, 切面编程]
category: RuoYi学习路线
draft: false
---

> [!NOTE]
> 本文是 RuoYi 学习路线的**阶段九**，聚焦日志管理。学完本篇你应该能：
> 1. 理解操作日志和登录日志的区别
> 2. 掌握 AOP 切面编程记录日志
> 3. 知道 @Log 注解的使用方法

## 前端视角：日志管理像什么？

| RuoYi 日志 | 前端类比 |
|:--|:--|
| 操作日志 | 用户行为埋点 (Analytics) |
| 登录日志 | 登录历史记录 |
| `@Log` 注解 | 装饰器 (Decorator) |
| AOP 切面 | 拦截器 (Interceptor) |
| 异步记录 | Web Worker 后台处理 |

## 日志类型

### 操作日志 (sys_oper_log)

记录用户的增删改操作：

```sql
CREATE TABLE sys_oper_log (
  oper_id           BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '日志主键',
  title             VARCHAR(50)     DEFAULT ''                 COMMENT '模块标题',
  business_type     INT(2)          DEFAULT 0                  COMMENT '业务类型（0其它 1新增 2修改 3删除）',
  method            VARCHAR(100)    DEFAULT ''                 COMMENT '方法名称',
  request_method    VARCHAR(10)     DEFAULT ''                 COMMENT '请求方式',
  operator_type     INT(1)          DEFAULT 0                  COMMENT '操作类别（0其它 1后台用户 2手机端用户）',
  oper_name         VARCHAR(50)     DEFAULT ''                 COMMENT '操作人员',
  dept_name         VARCHAR(50)     DEFAULT ''                 COMMENT '部门名称',
  oper_url          VARCHAR(255)    DEFAULT ''                 COMMENT '请求URL',
  oper_ip           VARCHAR(128)    DEFAULT ''                 COMMENT '主机地址',
  oper_location     VARCHAR(255)    DEFAULT ''                 COMMENT '操作地点',
  oper_param        VARCHAR(2000)   DEFAULT ''                 COMMENT '请求参数',
  json_result       VARCHAR(2000)   DEFAULT ''                 COMMENT '返回参数',
  status            INT(1)          DEFAULT 0                  COMMENT '操作状态（0正常 1异常）',
  error_msg         VARCHAR(2000)   DEFAULT ''                 COMMENT '错误消息',
  oper_time         DATETIME                                   COMMENT '操作时间',
  cost_time         BIGINT(20)      DEFAULT 0                  COMMENT '消耗时间',
  PRIMARY KEY (oper_id)
) ENGINE=InnoDB AUTO_INCREMENT=100 COMMENT = '操作日志记录';
```

### 登录日志 (sys_logininfor)

记录用户登录登出：

```sql
CREATE TABLE sys_logininfor (
  info_id           BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '访问ID',
  login_name        VARCHAR(50)     DEFAULT ''                 COMMENT '登录账号',
  ipaddr            VARCHAR(128)    DEFAULT ''                 COMMENT '登录IP地址',
  login_location    VARCHAR(255)    DEFAULT ''                 COMMENT '登录地点',
  browser           VARCHAR(50)     DEFAULT ''                 COMMENT '浏览器类型',
  os                VARCHAR(50)     DEFAULT ''                 COMMENT '操作系统',
  status            CHAR(1)         DEFAULT '0'                COMMENT '登录状态（0成功 1失败）',
  msg               VARCHAR(255)    DEFAULT ''                 COMMENT '提示消息',
  login_time        DATETIME                                   COMMENT '访问时间',
  PRIMARY KEY (info_id)
) ENGINE=InnoDB AUTO_INCREMENT=100 COMMENT = '系统访问记录';
```

## 操作日志实体类

```java
// src/main/java/com/ruoyi/system/domain/SysOperLog.java
package com.ruoyi.system.domain;

import java.util.Date;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.annotation.Excel.ColumnType;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 操作日志记录表 oper_log
 * 
 * @author ruoyi
 */
public class SysOperLog extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /** 日志主键 */
    @Excel(name = "操作序号", cellType = ColumnType.NUMERIC)
    private Long operId;

    /** 操作模块 */
    @Excel(name = "操作模块")
    private String title;

    /** 业务类型（0其它 1新增 2修改 3删除） */
    @Excel(name = "业务类型", readConverterExp = "0=其它,1=新增,2=修改,3=删除,4=授权,5=导出,6=导入,7=强退,8=生成代码,9=清空数据")
    private Integer businessType;

    /** 请求方法 */
    @Excel(name = "请求方法")
    private String method;

    /** 请求方式 */
    @Excel(name = "请求方式")
    private String requestMethod;

    /** 操作类别（0其它 1后台用户 2手机端用户） */
    @Excel(name = "操作类别", readConverterExp = "0=其它,1=后台用户,2=手机端用户")
    private Integer operatorType;

    /** 操作人员 */
    @Excel(name = "操作人员")
    private String operName;

    /** 部门名称 */
    @Excel(name = "部门名称")
    private String deptName;

    /** 请求url */
    @Excel(name = "请求地址")
    private String operUrl;

    /** 操作地址 */
    @Excel(name = "操作地址")
    private String operIp;

    /** 操作地点 */
    @Excel(name = "操作地点")
    private String operLocation;

    /** 请求参数 */
    @Excel(name = "请求参数")
    private String operParam;

    /** 返回参数 */
    @Excel(name = "返回参数")
    private String jsonResult;

    /** 操作状态（0正常 1异常） */
    @Excel(name = "状态", readConverterExp = "0=正常,1=异常")
    private Integer status;

    /** 错误消息 */
    @Excel(name = "错误消息")
    private String errorMsg;

    /** 操作时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Excel(name = "操作时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss")
    private Date operTime;

    /** 消耗时间 */
    @Excel(name = "消耗时间", suffix = "毫秒")
    private Long costTime;

    // Getter 和 Setter 省略...
}
```

## @Log 注解

```java
// src/main/java/com/ruoyi/common/annotation/Log.java
package com.ruoyi.common.annotation;

import java.lang.annotation.*;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.common.enums.OperatorType;

/**
 * 自定义操作日志记录注解
 * 
 * @author ruoyi
 */
@Target({ ElementType.PARAMETER, ElementType.METHOD })
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Log {
    /**
     * 模块
     */
    public String title() default "";

    /**
     * 功能
     */
    public BusinessType businessType() default BusinessType.OTHER;

    /**
     * 操作人类别
     */
    public OperatorType operatorType() default OperatorType.MANAGE;

    /**
     * 是否保存请求的参数
     */
    public boolean isSaveRequestData() default true;

    /**
     * 是否保存响应的参数
     */
    public boolean isSaveResponseData() default true;

    /**
     * 排除指定的请求参数
     */
    public String[] excludeParamNames() default {};
}
```

## 业务类型枚举

```java
// src/main/java/com/ruoyi/common/enums/BusinessType.java
package com.ruoyi.common.enums;

/**
 * 业务操作类型
 * 
 * @author ruoyi
 */
public enum BusinessType {
    /** 其它 */
    OTHER,

    /** 新增 */
    INSERT,

    /** 修改 */
    UPDATE,

    /** 删除 */
    DELETE,

    /** 授权 */
    GRANT,

    /** 导出 */
    EXPORT,

    /** 导入 */
    IMPORT,

    /** 强退 */
    FORCE,

    /** 生成代码 */
    GENCODE,

    /** 清空数据 */
    CLEAN,
}
```

## AOP 切面实现

### 操作日志切面

```java
// src/main/java/com/ruoyi/framework/aspectj/LogAspect.java
package com.ruoyi.framework.aspectj;

import java.lang.reflect.Method;
import java.util.*;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.stereotype.Component;
import org.springframework.validation.BindingResult;
import org.springframework.web.multipart.MultipartFile;
import com.alibaba.fastjson.JSON;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.domain.entity.SysUser;
import com.ruoyi.common.enums.BusinessStatus;
import com.ruoyi.common.utils.*;
import com.ruoyi.framework.manager.AsyncManager;
import com.ruoyi.framework.manager.factory.AsyncFactory;
import com.ruoyi.system.domain.SysOperLog;

/**
 * 操作日志记录处理
 * 
 * @author ruoyi
 */
@Aspect
@Component
public class LogAspect {
    private static final Logger log = LoggerFactory.getLogger(LogAspect.class);

    /** 排除敏感属性字段 */
    public static final String[] EXCLUDE_PROPERTIES = { "password", "oldPassword", "newPassword", "confirmPassword" };

    /** 计算操作消耗时间 */
    private static final ThreadLocal<Long> TIME_THREADLOCAL = new ThreadLocal<>();

    @Autowired
    private AsyncTaskExecutor asyncTaskExecutor;

    /**
     * 配置织入点
     */
    @Pointcut("@annotation(com.ruoyi.common.annotation.Log)")
    public void logPointCut() {
    }

    /**
     * 处理请求前
     */
    @Before("logPointCut()")
    public void doBefore(JoinPoint joinPoint) {
        TIME_THREADLOCAL.set(System.currentTimeMillis());
    }

    /**
     * 处理完请求后执行
     */
    @AfterReturning(pointcut = "logPointCut()", returning = "jsonResult")
    public void doAfterReturning(JoinPoint joinPoint, Object jsonResult) {
        handleLog(joinPoint, null, jsonResult);
    }

    /**
     * 拦截异常操作
     */
    @AfterThrowing(value = "logPointCut()", throwing = "e")
    public void doAfterThrowing(JoinPoint joinPoint, Exception e) {
        handleLog(joinPoint, e, null);
    }

    protected void handleLog(final JoinPoint joinPoint, final Exception e, Object jsonResult) {
        try {
            // 获得注解
            Log controllerLog = getAnnotationLog(joinPoint);
            if (controllerLog == null) {
                return;
            }

            // 获取当前的用户
            SysUser currentUser = ShiroUtils.getSysUser();

            // 构建操作日志对象
            SysOperLog operLog = new SysOperLog();
            operLog.setStatus(BusinessStatus.SUCCESS.ordinal());
            // 请求的地址
            String ip = ShiroUtils.getIp();
            operLog.setOperIp(ip);
            operLog.setOperUrl(StringUtils.substring(ServletUtils.getRequest().getRequestURI(), 0, 255));

            if (currentUser != null) {
                operLog.setOperName(currentUser.getLoginName());
                if (StringUtils.isNotNull(currentUser.getDept()) 
                        && StringUtils.isNotEmpty(currentUser.getDept().getDeptName())) {
                    operLog.setDeptName(currentUser.getDept().getDeptName());
                }
            }

            if (e != null) {
                operLog.setStatus(BusinessStatus.FAIL.ordinal());
                operLog.setErrorMsg(StringUtils.substring(e.getMessage(), 0, 2000));
            }
            // 设置方法名称
            String className = joinPoint.getTarget().getClass().getName();
            String methodName = joinPoint.getSignature().getName();
            operLog.setMethod(className + "." + methodName + "()");
            // 设置请求方式
            operLog.setRequestMethod(ServletUtils.getRequest().getMethod());
            // 处理设置注解上的参数
            getControllerMethodDescription(joinPoint, controllerLog, operLog, jsonResult);
            // 设置消耗时间
            operLog.setCostTime(System.currentTimeMillis() - TIME_THREADLOCAL.get());

            // 保存数据库（异步）
            AsyncManager.me().execute(AsyncFactory.recordOper(operLog));
        } catch (Exception exp) {
            // 记录本地异常日志
            log.error("==前置通知异常==");
            log.error("异常信息:{}", exp.getMessage());
            exp.printStackTrace();
        } finally {
            TIME_THREADLOCAL.remove();
        }
    }

    /**
     * 获取注解中对方法的描述信息 用于Controller层注解
     */
    public void getControllerMethodDescription(JoinPoint joinPoint, Log log, SysOperLog operLog, Object jsonResult) {
        // 设置action动作
        operLog.setBusinessType(log.businessType().ordinal());
        // 设置标题
        operLog.setTitle(log.title());
        // 设置操作人类别
        operLog.setOperatorType(log.operatorType().ordinal());
        // 是否需要保存request，参数和值
        if (log.isSaveRequestData()) {
            // 获取参数的信息，传入到数据库中。
            setRequestValue(joinPoint, operLog, log.excludeParamNames());
        }
        // 是否需要保存response，参数和值
        if (log.isSaveResponseData() && StringUtils.isNotNull(jsonResult)) {
            operLog.setJsonResult(StringUtils.substring(JSON.toJSONString(jsonResult), 0, 2000));
        }
    }

    /**
     * 获取请求的参数，放到log中
     */
    private void setRequestValue(JoinPoint joinPoint, SysOperLog operLog, String[] excludeParamNames) {
        Map<String, String> map = ServletUtils.getRequest().getParameterMap();
        if (StringUtils.isNotEmpty(map)) {
            String params = JSONObject.toJSONString(map, excludePropertyPreFilter(excludeParamNames));
            operLog.setOperParam(StringUtils.substring(params, 0, 2000));
        } else {
            Object args = joinPoint.getArgs();
            if (StringUtils.isNotNull(args)) {
                List<Object> paramsList = new ArrayList<>();
                for (Object arg : args) {
                    if (StringUtils.isNull(arg) || arg instanceof ServletRequest 
                            || arg instanceof ServletResponse || arg instanceof MultipartFile
                            || arg instanceof BindingResult) {
                        continue;
                    }
                    paramsList.add(arg);
                }
                String params = JSONObject.toJSONString(paramsList, excludePropertyPreFilter(excludeParamNames));
                operLog.setOperParam(StringUtils.substring(params, 0, 2000));
            }
        }
    }

    /**
     * 是否存在注解，如果存在就获取
     */
    private Log getAnnotationLog(JoinPoint joinPoint) {
        try {
            Method method = ((MethodSignature) joinPoint.getSignature()).getMethod();
            if (method != null) {
                return method.getAnnotation(Log.class);
            }
        } catch (Exception e) {
            return null;
        }
        return null;
    }

    /**
     * 忽略敏感属性
     */
    public PropertyPreFilters.MySimplePropertyPreFilter excludePropertyPreFilter(String[] excludeParamNames) {
        PropertyPreFilters filters = new PropertyPreFilters();
        PropertyPreFilters.MySimplePropertyPreFilter excludefilter = filters.addFilter();
        excludefilter.addExcludes(ArrayUtils.addAll(EXCLUDE_PROPERTIES, excludeParamNames));
    }
}
```

## 异步日志记录

### 异步任务工厂

```java
// src/main/java/com/ruoyi/framework/manager/factory/AsyncFactory.java
package com.ruoyi.framework.manager.factory;

import java.util.TimerTask;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.ruoyi.common.constant.Constants;
import com.ruoyi.common.utils.AddressUtils;
import com.ruoyi.common.utils.ServletUtils;
import com.ruoyi.common.utils.spring.SpringUtils;
import com.ruoyi.system.domain.SysLogininfor;
import com.ruoyi.system.domain.SysOperLog;
import com.ruoyi.system.service.ISysLogininforService;
import com.ruoyi.system.service.ISysOperLogService;

/**
 * 异步工厂（产生任务用）
 * 
 * @author ruoyi
 */
public class AsyncFactory {
    private static final Logger sys_user_log = LoggerFactory.getLogger("sys-user");

    /**
     * 记录操作日志
     */
    public static TimerTask recordOper(final SysOperLog operLog) {
        return new TimerTask() {
            @Override
            public void run() {
                // 远程查询操作地点
                operLog.setOperLocation(AddressUtils.getRealAddressByIP(operLog.getOperIp()));
                SpringUtils.getBean(ISysOperLogService.class).insertOperlog(operLog);
            }
        };
    }

    /**
     * 记录登录信息
     */
    public static TimerTask recordLogininfor(final String username, final String status, 
            final String message, final Object... args) {
        final UserAgent userAgent = UserAgent.parseUserAgentString(ServletUtils.getRequest().getHeader("User-Agent"));
        final String ip = ShiroUtils.getIp();
        return new TimerTask() {
            @Override
            public void run() {
                String os = userAgent.getOperatingSystem().getName();
                String browser = userAgent.getBrowser().getName();
                // 打印信息到日志
                sys_user_log.info(s.toString(), args);
                // 获取客户端操作系统
                // 封装登录信息
                SysLogininfor logininfor = new SysLogininfor();
                logininfor.setLoginName(username);
                logininfor.setIpaddr(ip);
                logininfor.setBrowser(browser);
                logininfor.setOs(os);
                logininfor.setMsg(message);
                // 日志状态
                if (Constants.LOGIN_SUCCESS.equals(status) || Constants.LOGOUT.equals(status)) {
                    logininfor.setStatus(Constants.SUCCESS);
                } else if (Constants.LOGIN_FAIL.equals(status)) {
                    logininfor.setStatus(Constants.FAIL);
                }
                // 远程查询操作地点
                logininfor.setLoginLocation(AddressUtils.getRealAddressByIP(ip));
                // 插入数据
                SpringUtils.getBean(ISysLogininforService.class).insertLogininfor(logininfor);
            }
        };
    }
}
```

### 异步管理器

```java
// src/main/java/com/ruoyi/framework/manager/AsyncManager.java
package com.ruoyi.framework.manager;

import java.util.TimerTask;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import com.ruoyi.common.utils.Threads;
import com.ruoyi.common.utils.spring.SpringUtils;

/**
 * 异步任务管理器
 * 
 * @author liuhulu
 */
public class AsyncManager {
    /**
     * 操作延迟10毫秒
     */
    private final int OPERATE_DELAY_TIME = 10;

    /**
     * 异步操作任务调度线程池
     */
    private ScheduledExecutorService executor = SpringUtils.getBean("scheduledExecutorService");

    /**
     * 单例模式
     */
    private static AsyncManager me = new AsyncManager();

    public static AsyncManager me() {
        return me;
    }

    /**
     * 执行任务
     */
    public void execute(TimerTask task) {
        executor.schedule(task, OPERATE_DELAY_TIME, TimeUnit.MILLISECONDS);
    }

    /**
     * 停止任务线程池
     */
    public void shutdown() {
        Threads.shutdownAndAwaitTermination(executor);
    }
}
```

## 使用示例

### Controller 中添加日志

```java
// src/main/java/com/ruoyi/web/controller/system/SysUserController.java

/**
 * 新增保存用户
 */
@RequiresPermissions("system:user:add")
@Log(title = "用户管理", businessType = BusinessType.INSERT)
@PostMapping("/add")
@ResponseBody
public AjaxResult addSave(@Validated SysUser user) {
    // ... 业务逻辑
    return toAjax(userService.insertUser(user));
}

/**
 * 修改保存用户
 */
@RequiresPermissions("system:user:edit")
@Log(title = "用户管理", businessType = BusinessType.UPDATE)
@PostMapping("/edit")
@ResponseBody
public AjaxResult editSave(@Validated SysUser user) {
    // ... 业务逻辑
    return toAjax(userService.updateUser(user));
}

/**
 * 删除用户
 */
@RequiresPermissions("system:user:remove")
@Log(title = "用户管理", businessType = BusinessType.DELETE)
@PostMapping("/remove")
@ResponseBody
public AjaxResult remove(String ids) {
    return toAjax(userService.deleteUserByIds(ids));
}

/**
 * 导出用户
 */
@Log(title = "用户管理", businessType = BusinessType.EXPORT)
@PostMapping("/export")
@ResponseBody
public AjaxResult export(HttpServletResponse response, SysUser user) {
    // ... 导出逻辑
}
```

## 登录日志记录

```java
// src/main/java/com/ruoyi/framework/shiro/realm/UserRealm.java

@Override
protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) {
    UsernamePasswordToken upToken = (UsernamePasswordToken) token;
    SysUser user = userService.selectUserByLoginName(upToken.getUsername());
    
    if (StringUtils.isNull(user)) {
        // 记录登录失败日志
        AsyncManager.me().execute(AsyncFactory.recordLogininfor(
            upToken.getUsername(), Constants.LOGIN_FAIL, "用户不存在"));
        throw new UnknownAccountException("用户不存在");
    }
    
    if (!passwordService.matches(user, new String(upToken.getPassword()))) {
        // 记录登录失败日志
        AsyncManager.me().execute(AsyncFactory.recordLogininfor(
            upToken.getUsername(), Constants.LOGIN_FAIL, "密码错误"));
        throw new IncorrectCredentialsException("密码错误");
    }
    
    // 记录登录成功日志
    AsyncManager.me().execute(AsyncFactory.recordLogininfor(
        upToken.getUsername(), Constants.LOGIN_SUCCESS, "登录成功"));
    
    return new SimpleAuthenticationInfo(user, password, getName());
}
```

## 复习卡片

```java
// 日志管理核心流程
// 1. 添加 @Log 注解
@Log(title = "用户管理", businessType = BusinessType.INSERT)
public AjaxResult addSave(SysUser user);

// 2. AOP 切面拦截
@Pointcut("@annotation(com.ruoyi.common.annotation.Log)")
public void logPointCut() {}

// 3. 异步记录日志
AsyncManager.me().execute(AsyncFactory.recordOper(operLog));

// 4. 登录日志
AsyncManager.me().execute(AsyncFactory.recordLogininfor(
    username, Constants.LOGIN_SUCCESS, "登录成功"));
```

| 类名 | 职责 |
|:--|:--|
| `SysOperLog` | 操作日志实体 |
| `SysLogininfor` | 登录日志实体 |
| `@Log` | 日志注解 |
| `LogAspect` | 日志切面 |
| `AsyncFactory` | 异步任务工厂 |
| `AsyncManager` | 异步任务管理器 |
| `BusinessType` | 业务类型枚举 |

| 业务类型 | 说明 |
|:--|:--|
| OTHER | 其它 |
| INSERT | 新增 |
| UPDATE | 修改 |
| DELETE | 删除 |
| GRANT | 授权 |
| EXPORT | 导出 |
| IMPORT | 导入 |
| FORCE | 强退 |
| GENCODE | 生成代码 |
| CLEAN | 清空数据 |

> [!TIP]
> 下一步：[阶段十：定时任务](/blog/posts/ruoyi-roadmap-10-quartz-task/)
> 
> 在阶段十中，我们将学习 Quartz 定时任务的使用，包括任务配置、Cron 表达式和任务调度。
