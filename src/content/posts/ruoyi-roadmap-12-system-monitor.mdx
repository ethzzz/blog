---
title: 'RuoYi 阶段十二：系统监控'
published: 2026-09-07T22:00:00+08:00
description: '学习系统监控功能：服务监控、缓存监控、在线用户管理和数据监控，完成 RuoYi 学习路线。'
tags: [Java, RuoYi, 系统监控, Redis, Druid]
category: RuoYi学习路线
draft: false
---

> [!NOTE]
> 本文是 RuoYi 学习路线的**阶段十二**，聚焦系统监控。学完本篇你应该能：
> 1. 理解服务器监控的实现方式
> 2. 掌握缓存监控和在线用户管理
> 3. 完成 RuoYi 全部学习路线！

## 前端视角：系统监控像什么？

| RuoYi 系统监控 | 前端类比 |
|:--|:--|
| 服务监控 | 性能面板 (Performance) |
| 缓存监控 | 应用存储 (Application Storage) |
| 在线用户 | 活跃会话管理 |
| 数据监控 | 网络请求监控 (Network) |
| JVM 监控 | 浏览器内存使用 |

## 系统监控模块

RuoYi 提供四个监控功能：

| 模块 | 功能 |
|:--|:--|
| 在线用户 | 查看当前在线用户，可强退 |
| 定时任务 | 查看任务执行情况 |
| 数据监控 | Druid 连接池监控 |
| 服务监控 | CPU、内存、JVM、服务器信息 |
| 缓存监控 | Redis 缓存信息 |

## 服务监控

### 控制器

```java
// src/main/java/com/ruoyi/web/controller/monitor/ServerController.java
package com.ruoyi.web.controller.monitor;

import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.framework.web.domain.Server;

/**
 * 服务器监控
 * 
 * @author ruoyi
 */
@Controller
@RequestMapping("/monitor/server")
public class ServerController extends BaseController {
    private String prefix = "monitor/server";

    @RequiresPermissions("monitor:server:view")
    @GetMapping()
    public String server(ModelMap mmap) {
        Server server = new Server();
        server.copyTo();
        mmap.put("server", server);
        return prefix + "/server";
    }
}
```

### 服务器信息实体

```java
// src/main/java/com/ruoyi/framework/web/domain/Server.java
package com.ruoyi.framework.web.domain;

import java.net.UnknownHostException;
import java.util.LinkedList;
import java.util.List;
import java.util.Properties;
import com.ruoyi.common.utils.Arith;
import com.ruoyi.common.utils.IpUtils;
import com.ruoyi.framework.web.domain.server.*;

/**
 * 服务器相关信息
 * 
 * @author ruoyi
 */
public class Server {
    private static final int OSHI_WAIT_SECOND = 1000;

    /**
     * CPU相关信息
     */
    private Cpu cpu = new Cpu();

    /**
     * 内存相关信息
     */
    private Mem mem = new Mem();

    /**
     * JVM相关信息
     */
    private Jvm jvm = new Jvm();

    /**
     * 服务器相关信息
     */
    private Sys sys = new Sys();

    /**
     * 磁盘相关信息
     */
    private List<SysFile> sysFiles = new LinkedList<SysFile>();

    public Cpu getCpu() {
        return cpu;
    }

    public void setCpu(Cpu cpu) {
        this.cpu = cpu;
    }

    public Mem getMem() {
        return mem;
    }

    public void setMem(Mem mem) {
        this.mem = mem;
    }

    public Jvm getJvm() {
        return jvm;
    }

    public void setJvm(Jvm jvm) {
        this.jvm = jvm;
    }

    public Sys getSys() {
        return sys;
    }

    public void setSys(Sys sys) {
        this.sys = sys;
    }

    public List<SysFile> getSysFiles() {
        return sysFiles;
    }

    public void setSysFiles(List<SysFile> sysFiles) {
        this.sysFiles = sysFiles;
    }

    /**
     * 复制服务器信息
     */
    public void copyTo() {
        try {
            // CPU信息
            Cpu cpu = getCpu();
            CentralProcessor processor = SystemInfo.getInstance().getHardware().getProcessor();
            long[] prevTicks = processor.getSystemCpuLoadTicks();
            Thread.sleep(OSHI_WAIT_SECOND);
            long[] ticks = processor.getSystemCpuLoadTicks();
            long nice = ticks[TickType.NICE.getIndex()] - prevTicks[TickType.NICE.getIndex()];
            long irq = ticks[TickType.IRQ.getIndex()] - prevTicks[TickType.IRQ.getIndex()];
            long softirq = ticks[TickType.SOFTIRQ.getIndex()] - prevTicks[TickType.SOFTIRQ.getIndex()];
            long steal = ticks[TickType.STEAL.getIndex()] - prevTicks[TickType.STEAL.getIndex()];
            long cSys = ticks[TickType.SYSTEM.getIndex()] - prevTicks[TickType.SYSTEM.getIndex()];
            long user = ticks[TickType.USER.getIndex()] - prevTicks[TickType.USER.getIndex()];
            long iowait = ticks[TickType.IOWAIT.getIndex()] - prevTicks[TickType.IOWAIT.getIndex()];
            long idle = ticks[TickType.IDLE.getIndex()] - prevTicks[TickType.IDLE.getIndex()];
            long totalCpu = user + nice + cSys + idle + iowait + irq + softirq + steal;
            cpu.setCpuNum(processor.getLogicalProcessorCount());
            cpu.setTotal(totalCpu);
            cpu.setSys(cSys);
            cpu.setUsed(user);
            cpu.setWait(iowait);
            cpu.setFree(idle);

            // 内存信息
            Mem mem = getMem();
            GlobalMemory memory = SystemInfo.getInstance().getHardware().getMemory();
            long totalByte = memory.getTotal();
            long availableByte = memory.getAvailable();
            long usedByte = totalByte - availableByte;
            mem.setTotal(totalByte);
            mem.setUsed(usedByte);
            mem.setFree(availableByte);
            mem.setUsage(Arith.mul(Arith.div(usedByte, totalByte, 4), 100));

            // JVM信息
            Jvm jvm = getJvm();
            Properties props = System.getProperties();
            jvm.setTotal(Runtime.getRuntime().totalMemory());
            jvm.setMax(Runtime.getRuntime().maxMemory());
            jvm.setFree(Runtime.getRuntime().freeMemory());
            jvm.setVersion(props.getProperty("java.version"));
            jvm.setHome(props.getProperty("java.home"));
            jvm.setStartTime(DateUtils.parseDateToStr(DateUtils.YYYY_MM_DD_HH_MM_SS, 
                    Date.from(Instant.ofEpochMilli(ManagementFactory.getRuntimeMXBean().getStartTime()))));
            jvm.setRunTime(DateUtils.getDatePoor(DateUtils.getNowDate(), jvm.getStartTime()));
            jvm.setInputArgs(ManagementFactory.getRuntimeMXBean().getInputArguments());

            // 服务器信息
            Sys sys = getSys();
            InetAddress addr = InetAddress.getLocalHost();
            sys.setComputerName(addr.getHostName());
            sys.setComputerIp(IpUtils.getHostIp());
            sys.setOsName(props.getProperty("os.name"));
            sys.setOsArch(props.getProperty("os.arch"));
            sys.setUserDir(props.getProperty("user.dir"));

            // 磁盘信息
            List<SysFile> sysFiles = getSysFiles();
            FileSystem fileSystem = SystemInfo.getInstance().getOperatingSystem().getFileSystem();
            for (OSFileStore fs : fileSystem.getFileStores()) {
                SysFile sysFile = new SysFile();
                sysFile.setDirName(fs.getMount());
                sysFile.setSysTypeName(fs.getType());
                sysFile.setTypeName(fs.getName());
                sysFile.setTotal(fs.getTotalSpace());
                sysFile.setFree(fs.getUsableSpace());
                sysFile.setUsed(fs.getTotalSpace() - fs.getUsableSpace());
                sysFile.setUsage(Arith.mul(Arith.div(sysFile.getUsed(), sysFile.getTotal(), 4), 100));
                sysFiles.add(sysFile);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

### CPU 信息实体

```java
// src/main/java/com/ruoyi/framework/web/domain/server/Cpu.java
package com.ruoyi.framework.web.domain.server;

import com.ruoyi.common.utils.Arith;

/**
 * CPU相关信息
 * 
 * @author ruoyi
 */
public class Cpu {
    /**
     * 核心数
     */
    private int cpuNum;

    /**
     * CPU总的使用率
     */
    private double total;

    /**
     * CPU系统使用率
     */
    private double sys;

    /**
     * CPU用户使用率
     */
    private double used;

    /**
     * CPU当前等待率
     */
    private double wait;

    /**
     * CPU当前空闲率
     */
    private double free;

    public int getCpuNum() {
        return cpuNum;
    }

    public void setCpuNum(int cpuNum) {
        this.cpuNum = cpuNum;
    }

    public double getTotal() {
        return Arith.round(Arith.mul(total, 100), 2);
    }

    public void setTotal(long total) {
        this.total = total;
    }

    public double getSys() {
        return Arith.div(Arith.mul(sys, 100), total, 2);
    }

    public void setSys(double sys) {
        this.sys = sys;
    }

    public double getUsed() {
        return Arith.div(Arith.mul(used, 100), total, 2);
    }

    public void setUsed(double used) {
        this.used = used;
    }

    public double getWait() {
        return Arith.div(Arith.mul(wait, 100), total, 2);
    }

    public void setWait(double wait) {
        this.wait = wait;
    }

    public double getFree() {
        return Arith.div(Arith.mul(free, 100), total, 2);
    }

    public void setFree(double free) {
        this.free = free;
    }
}
```

## 缓存监控

### 控制器

```java
// src/main/java/com/ruoyi/web/controller/monitor/CacheController.java
package com.ruoyi.web.controller.monitor;

import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import com.ruoyi.common.constant.Constants;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.redis.RedisCache;

import java.util.*;

/**
 * 缓存监控
 * 
 * @author ruoyi
 */
@Controller
@RequestMapping("/monitor/cache")
public class CacheController extends BaseController {
    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    private final static List<CacheInfo> caches = new ArrayList<CacheInfo>();
    {
        caches.add(new CacheInfo(Constants.LOGIN_TOKEN_KEY, "用户信息"));
        caches.add(new CacheInfo(Constants.SYS_DICT_KEY, "配置信息"));
        caches.add(new CacheInfo(Constants.CAPTCHA_CODE_KEY, "验证码"));
        caches.add(new CacheInfo(Constants.REPEAT_SUBMIT_KEY, "防重提交"));
        caches.add(new CacheInfo(Constants.RATE_LIMIT_KEY, "限流处理"));
        caches.add(new CacheInfo(Constants.PWD_ERR_CNT_KEY, "密码错误次数"));
    }

    @RequiresPermissions("monitor:cache:view")
    @GetMapping()
    public String cache(ModelMap mmap) {
        mmap.put("caches", caches);
        return "monitor/cache/cache";
    }

    @RequiresPermissions("monitor:cache:view")
    @GetMapping("/getNames")
    public String getCacheNames(ModelMap mmap) {
        mmap.put("caches", caches);
        return "monitor/cache/cache :: cacheNames";
    }

    @RequiresPermissions("monitor:cache:view")
    @GetMapping("/getKeys/{cacheName}")
    public String getCacheKeys(@PathVariable String cacheName, ModelMap mmap) {
        List<String> cacheKeys = redisTemplate.keys(cacheName + "*");
        mmap.put("cacheKeys", cacheKeys);
        mmap.put("cacheName", cacheName);
        return "monitor/cache/cache :: cacheKeys";
    }

    @RequiresPermissions("monitor:cache:view")
    @GetMapping("/getValue/{cacheName}/{cacheKey}")
    public String getCacheValue(@PathVariable String cacheName, @PathVariable String cacheKey, ModelMap mmap) {
        String cacheValue = redisTemplate.opsForValue().get(cacheKey);
        CacheInfo cacheInfo = new CacheInfo();
        cacheInfo.setCacheName(cacheName);
        cacheInfo.setCacheKey(cacheKey);
        cacheInfo.setCacheValue(cacheValue);
        mmap.put("cache", cacheInfo);
        return "monitor/cache/cache :: cacheValue";
    }

    @RequiresPermissions("monitor:cache:view")
    @GetMapping("/clearCacheName/{cacheName}")
    public String clearCacheName(@PathVariable String cacheName, ModelMap mmap) {
        redisTemplate.delete(redisTemplate.keys(cacheName + "*"));
        return "monitor/cache/cache :: cacheNames";
    }

    @RequiresPermissions("monitor:cache:view")
    @GetMapping("/clearCacheKey/{cacheKey}")
    public String clearCacheKey(@PathVariable String cacheKey, ModelMap mmap) {
        redisTemplate.delete(cacheKey);
        return "monitor/cache/cache :: cacheKeys";
    }

    @RequiresPermissions("monitor:cache:view")
    @GetMapping("/clearCacheAll")
    public String clearCacheAll(ModelMap mmap) {
        redisTemplate.execute((RedisCallback<Boolean>) connection -> {
            connection.flushAll();
            return true;
        });
        return "monitor/cache/cache :: cacheNames";
    }

    static class CacheInfo {
        private String cacheName;
        private String cacheKey;
        private String cacheValue;
        private String remark;

        public CacheInfo() {}

        public CacheInfo(String cacheName, String remark) {
            this.cacheName = cacheName;
            this.remark = remark;
        }

        // Getter 和 Setter 省略...
    }
}
```

## 在线用户管理

### 控制器

```java
// src/main/java/com/ruoyi/web/controller/monitor/OnlineController.java
package com.ruoyi.web.controller.monitor;

import java.util.List;
import org.apache.shiro.session.Session;
import org.apache.shiro.session.mgt.eis.SessionDAO;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.core.text.Convert;
import com.ruoyi.common.utils.ShiroUtils;
import com.ruoyi.framework.shiro.session.OnlineSession;
import com.ruoyi.system.domain.SysUserOnline;
import com.ruoyi.system.service.ISysUserOnlineService;

/**
 * 在线用户监控
 * 
 * @author ruoyi
 */
@Controller
@RequestMapping("/monitor/online")
public class OnlineController extends BaseController {
    private String prefix = "monitor/online";

    @Autowired
    private ISysUserOnlineService userOnlineService;

    @Autowired
    private SessionDAO sessionDAO;

    @RequiresPermissions("monitor:online:view")
    @GetMapping()
    public String online() {
        return prefix + "/online";
    }

    @RequiresPermissions("monitor:online:list")
    @PostMapping("/list")
    @ResponseBody
    public TableDataInfo list(SysUserOnline userOnline) {
        startPage();
        List<SysUserOnline> list = userOnlineService.selectUserOnlineList(userOnline);
        return getDataTable(list);
    }

    @RequiresPermissions("monitor:online:batchForceLogout")
    @PostMapping("/batchForceLogout")
    @ResponseBody
    public AjaxResult batchForceLogout(@RequestParam("ids[]") String[] ids) {
        for (String sessionId : ids) {
            try {
                Session session = sessionDAO.readSession(sessionId);
                if (session != null) {
                    session.setTimeout(1000);
                    userOnlineService.deleteById(sessionId);
                }
            } catch (Exception e) {
                // 忽略异常
            }
        }
        return success();
    }

    @RequiresPermissions("monitor:online:forceLogout")
    @PostMapping("/forceLogout")
    @ResponseBody
    public AjaxResult forceLogout(String sessionId) {
        try {
            Session session = sessionDAO.readSession(sessionId);
            if (session != null) {
                session.setTimeout(1000);
                userOnlineService.deleteById(sessionId);
            }
        } catch (Exception e) {
            // 忽略异常
        }
        return success();
    }
}
```

## 数据监控 (Druid)

RuoYi 集成了 Druid 数据源监控：

### 配置

```java
// src/main/java/com/ruoyi/framework/config/DruidConfig.java
package com.ruoyi.framework.config;

import java.util.HashMap;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import com.alibaba.druid.pool.DruidDataSource;
import com.alibaba.druid.support.http.StatViewServlet;
import com.alibaba.druid.support.http.WebStatFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.ServletRegistrationBean;

/**
 * druid 配置多数据源
 * 
 * @author ruoyi
 */
@Configuration
public class DruidConfig {
    @Bean
    @ConfigurationProperties("spring.datasource.druid.master")
    public DataSource masterDataSource() {
        DruidDataSource dataSource = new DruidDataSource();
        return dataSource;
    }

    @Bean
    @ConfigurationProperties("spring.datasource.druid.slave")
    public DataSource slaveDataSource() {
        DruidDataSource dataSource = new DruidDataSource();
        return dataSource;
    }

    /**
     * Druid 监控页面
     */
    @Bean
    public ServletRegistrationBean<StatViewServlet> statViewServlet() {
        ServletRegistrationBean<StatViewServlet> bean = new ServletRegistrationBean<>(
                new StatViewServlet(), "/druid/*");
        // 配置监控页面访问登录名和密码
        Map<String, String> initParams = new HashMap<>();
        initParams.put("loginUsername", "admin");
        initParams.put("loginPassword", "123456");
        // 是否允许删除数据
        initParams.put("resetEnable", "false");
        bean.setInitParameters(initParams);
        return bean;
    }

    /**
     * Druid Web 监控过滤器
     */
    @Bean
    public FilterRegistrationBean<WebStatFilter> webStatFilter() {
        FilterRegistrationBean<WebStatFilter> bean = new FilterRegistrationBean<>(new WebStatFilter());
        Map<String, String> initParams = new HashMap<>();
        initParams.put("exclusions", "*.js,*.gif,*.jpg,*.png,*.css,*.ico,/druid/*");
        bean.setInitParameters(initParams);
        bean.addUrlPatterns("/*");
        return bean;
    }
}
```

### 访问地址

```
http://localhost/druid
用户名: admin
密码: 123456
```

## 复习卡片

```java
// 系统监控核心流程
// 1. 服务器信息获取
Server server = new Server();
server.copyTo();  // 获取 CPU、内存、JVM、磁盘信息

// 2. 缓存监控
List<String> cacheKeys = redisTemplate.keys(cacheName + "*");
String cacheValue = redisTemplate.opsForValue().get(cacheKey);

// 3. 在线用户
List<SysUserOnline> list = userOnlineService.selectUserOnlineList(userOnline);
Session session = sessionDAO.readSession(sessionId);

// 4. Druid 监控
// 访问 /druid 查看 SQL 执行情况
```

| 类名 | 职责 |
|:--|:--|
| `Server` | 服务器信息实体 |
| `Cpu` | CPU 信息 |
| `Mem` | 内存信息 |
| `Jvm` | JVM 信息 |
| `Sys` | 系统信息 |
| `SysFile` | 磁盘信息 |
| `CacheController` | 缓存监控控制器 |
| `OnlineController` | 在线用户控制器 |

| 监控项 | 说明 |
|:--|:--|
| CPU | 使用率、核心数、等待率 |
| 内存 | 总量、已用、可用 |
| JVM | 版本、内存、运行时间 |
| 磁盘 | 各分区使用情况 |
| 缓存 | Redis 键值对管理 |
| 在线用户 | 会话管理、强制退出 |
| 数据监控 | SQL 执行统计 |

> [!IMPORTANT]
> **恭喜完成 RuoYi 学习路线！**
> 
> 通过这 12 个阶段的学习，你已经掌握了：
> - Spring Boot 项目搭建与配置
> - MyBatis 数据库操作
> - Shiro 权限框架
> - RBAC 权限模型
> - 用户、角色、菜单管理
> - 部门、岗位组织架构
> - 字典、参数系统配置
> - AOP 日志管理
> - Quartz 定时任务
> - 代码生成器
> - 系统监控
> 
> 建议接下来：
> 1. **动手实践**：基于 RuoYi 开发一个自己的项目
> 2. **深入源码**：阅读更多 RuoYi 源码细节
> 3. **学习扩展**：了解 RuoYi-Vue（前后端分离版本）

> [!TIP]
> 返回：[RuoYi 学习路线总览](/blog/posts/ruoyi-roadmap-00-overview/)
