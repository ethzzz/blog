---
title: 'RuoYi 阶段五：用户管理模块'
published: 2026-09-07T15:00:00+08:00
description: '深入分析用户管理模块的完整实现：实体类、Service、Controller、密码加密、状态管理。'
tags: [Java, RuoYi, 用户管理, RBAC, SpringBoot]
category: RuoYi学习路线
draft: false
---

> [!NOTE]
> 本文是 RuoYi 学习路线的**阶段五**，聚焦用户管理模块。学完本篇你应该能：
> 1. 理解用户实体类的设计
> 2. 掌握用户 CRUD 的完整流程
> 3. 知道密码加密和用户状态管理的实现

## 前端视角：用户管理像什么？

| RuoYi 用户管理 | 前端类比 |
|:--|:--|
| `SysUser` 实体类 | User 类型定义 (TypeScript interface) |
| `ISysUserService` | 用户 API 封装 (axios) |
| `SysUserController` | 用户页面路由处理器 |
| 密码加密 | bcrypt / crypto-js |
| 用户状态 | 账户启用/禁用状态 |

## 用户实体类 (SysUser)

```java
// src/main/java/com/ruoyi/common/core/domain/entity/SysUser.java
package com.ruoyi.common.core.domain.entity;

import java.util.Date;
import java.util.List;
import javax.validation.constraints.*;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.annotation.Excel.ColumnType;
import com.ruoyi.common.annotation.Excel.Type;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 用户对象 sys_user
 * 
 * @author ruoyi
 */
public class SysUser extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /** 用户ID */
    @Excel(name = "用户序号", cellType = ColumnType.NUMERIC, prompt = "用户编号")
    private Long userId;

    /** 部门ID */
    @Excel(name = "部门编号", type = Type.IMPORT)
    private Long deptId;

    /** 部门父ID */
    private Long parentId;

    /** 角色ID */
    private Long roleId;

    /** 登录名称 */
    @Excel(name = "登录名称")
    private String loginName;

    /** 用户名称 */
    @Excel(name = "用户名称")
    private String userName;

    /** 用户邮箱 */
    @Excel(name = "用户邮箱")
    private String email;

    /** 手机号码 */
    @Excel(name = "手机号码")
    private String phonenumber;

    /** 用户性别 */
    @Excel(name = "用户性别", readConverterExp = "0=男,1=女,2=未知")
    private String sex;

    /** 用户头像 */
    private String avatar;

    /** 密码 */
    private String password;

    /** 盐加密 */
    private String salt;

    /** 帐号状态（0正常 1停用） */
    @Excel(name = "帐号状态", readConverterExp = "0=正常,1=停用")
    private String status;

    /** 删除标志（0代表存在 2代表删除） */
    private String delFlag;

    /** 最后登陆IP */
    @Excel(name = "最后登陆IP", type = Type.EXPORT)
    private String loginIp;

    /** 最后登陆时间 */
    @Excel(name = "最后登陆时间", width = 30, dateFormat = "yyyy-MM-dd HH:mm:ss", type = Type.EXPORT)
    private Date loginDate;

    /** 部门对象 */
    @Excel(name = "部门名称", targetAttr = "deptName", type = Type.EXPORT)
    private SysDept dept;

    /** 角色集合 */
    private List<SysRole> roles;

    /** 岗位ID列表 */
    private Long[] postIds;

    /** 角色ID列表 */
    private Long[] roleIds;

    // Getter 和 Setter 省略...

    public boolean isAdmin() {
        return isAdmin(this.userId);
    }

    public static boolean isAdmin(Long userId) {
        return userId != null && 1L == userId;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("userId", getUserId())
            .append("deptId", getDeptId())
            .append("loginName", getLoginName())
            .append("userName", getUserName())
            .append("email", getEmail())
            .append("phonenumber", getPhonenumber())
            .append("sex", getSex())
            .append("avatar", getAvatar())
            .append("password", getPassword())
            .append("salt", getSalt())
            .append("status", getStatus())
            .append("delFlag", getDelFlag())
            .append("loginIp", getLoginIp())
            .append("loginDate", getLoginDate())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .append("dept", getDept())
            .toString();
    }
}
```

### 实体类设计要点

| 特性 | 说明 |
|:--|:--|
| `@Excel` | 用于导入导出 Excel |
| `@NotBlank` | 参数校验（非空）|
| `@Email` | 邮箱格式校验 |
| `BaseEntity` | 基类，包含 createBy、createTime 等公共字段 |
| `delFlag` | 逻辑删除标志（0 存在，2 删除）|
| `salt` | 密码加密盐值 |

## 数据库表结构

```sql
-- sys_user 用户表
CREATE TABLE sys_user (
  user_id           BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '用户ID',
  dept_id           BIGINT(20)      DEFAULT NULL               COMMENT '部门ID',
  login_name        VARCHAR(30)     NOT NULL                   COMMENT '登录账号',
  user_name         VARCHAR(30)     NOT NULL                   COMMENT '用户昵称',
  user_type         VARCHAR(2)      DEFAULT '00'               COMMENT '用户类型（00系统用户）',
  email             VARCHAR(50)     DEFAULT ''                 COMMENT '用户邮箱',
  phonenumber       VARCHAR(11)     DEFAULT ''                 COMMENT '手机号码',
  sex               CHAR(1)         DEFAULT '0'                COMMENT '用户性别（0男 1女 2未知）',
  avatar            VARCHAR(100)    DEFAULT ''                 COMMENT '头像路径',
  password          VARCHAR(50)     DEFAULT ''                 COMMENT '密码',
  salt              VARCHAR(20)     DEFAULT ''                 COMMENT '盐加密',
  status            CHAR(1)         DEFAULT '0'                COMMENT '帐号状态（0正常 1停用）',
  del_flag          CHAR(1)         DEFAULT '0'                COMMENT '删除标志（0代表存在 2代表删除）',
  login_ip          VARCHAR(100)    DEFAULT ''                 COMMENT '最后登录IP',
  login_date        DATETIME                                   COMMENT '最后登录时间',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME                                   COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME                                   COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT NULL               COMMENT '备注',
  PRIMARY KEY (user_id)
) ENGINE=InnoDB AUTO_INCREMENT=100 COMMENT = '用户信息表';
```

## Service 层实现

### 接口定义

```java
// src/main/java/com/ruoyi/system/service/ISysUserService.java
package com.ruoyi.system.service;

import java.util.List;
import com.ruoyi.common.core.domain.entity.SysUser;

/**
 * 用户 业务层
 * 
 * @author ruoyi
 */
public interface ISysUserService {
    /**
     * 根据条件分页查询用户列表
     */
    public List<SysUser> selectUserList(SysUser user);

    /**
     * 通过用户名查询用户
     */
    public SysUser selectUserByLoginName(String loginName);

    /**
     * 通过手机号码查询用户
     */
    public SysUser selectUserByPhoneNumber(String phoneNumber);

    /**
     * 通过邮箱查询用户
     */
    public SysUser selectUserByEmail(String email);

    /**
     * 通过用户ID查询用户
     */
    public SysUser selectUserById(Long userId);

    /**
     * 通过用户ID删除用户
     */
    public int deleteUserById(Long userId);

    /**
     * 批量删除用户信息
     */
    public int deleteUserByIds(String ids);

    /**
     * 保存用户信息
     */
    public int insertUser(SysUser user);

    /**
     * 保存用户信息
     */
    public int updateUser(SysUser user);

    /**
     * 修改用户详细信息
     */
    public int updateUserInfo(SysUser user);

    /**
     * 修改用户密码信息
     */
    public int resetUserPwd(SysUser user);

    /**
     * 校验用户名称是否唯一
     */
    public String checkLoginNameUnique(String loginName);

    /**
     * 校验手机号码是否唯一
     */
    public String checkPhoneUnique(SysUser user);

    /**
     * 校验email是否唯一
     */
    public String checkEmailUnique(SysUser user);

    /**
     * 导入用户数据
     */
    public String importUser(List<SysUser> userList, Boolean isUpdateSupport, String operName);
}
```

### 实现类

```java
// src/main/java/com/ruoyi/system/service/impl/SysUserServiceImpl.java
package com.ruoyi.system.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import javax.validation.Validator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import com.ruoyi.common.annotation.DataScope;
import com.ruoyi.common.constant.ShiroConstants;
import com.ruoyi.common.constant.UserConstants;
import com.ruoyi.common.core.domain.entity.SysRole;
import com.ruoyi.common.core.domain.entity.SysUser;
import com.ruoyi.common.core.text.Convert;
import com.ruoyi.common.exception.ServiceException;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.common.utils.spring.SpringUtils;
import com.ruoyi.system.mapper.*;
import com.ruoyi.system.service.ISysConfigService;
import com.ruoyi.system.service.ISysUserService;

/**
 * 用户 业务层处理
 * 
 * @author ruoyi
 */
@Service
public class SysUserServiceImpl implements ISysUserService {
    private static final Logger log = LoggerFactory.getLogger(SysUserServiceImpl.class);

    @Autowired
    private SysUserMapper userMapper;

    @Autowired
    private SysRoleMapper roleMapper;

    @Autowired
    private SysPostMapper postMapper;

    @Autowired
    private SysUserPostMapper userPostMapper;

    @Autowired
    private SysUserRoleMapper userRoleMapper;

    @Autowired
    private ISysConfigService configService;

    @Autowired
    protected Validator validator;

    /**
     * 根据条件分页查询用户列表
     */
    @Override
    @DataScope(deptAlias = "d", userAlias = "u")
    public List<SysUser> selectUserList(SysUser user) {
        return userMapper.selectUserList(user);
    }

    /**
     * 通过用户名查询用户
     */
    @Override
    public SysUser selectUserByLoginName(String userName) {
        return userMapper.selectUserByLoginName(userName);
    }

    /**
     * 通过用户ID查询用户
     */
    @Override
    public SysUser selectUserById(Long userId) {
        return userMapper.selectUserById(userId);
    }

    /**
     * 新增保存用户信息
     */
    @Override
    @Transactional
    public int insertUser(SysUser user) {
        // 新增用户信息
        int rows = userMapper.insertUser(user);
        // 新增用户岗位关联
        insertUserPost(user);
        // 新增用户与角色管理
        insertUserRole(user.getUserId(), user.getRoleIds());
        return rows;
    }

    /**
     * 修改保存用户信息
     */
    @Override
    @Transactional
    public int updateUser(SysUser user) {
        Long userId = user.getUserId();
        // 删除用户与角色关联
        userRoleMapper.deleteUserRoleByUserId(userId);
        // 新增用户和角色管理
        insertUserRole(user.getUserId(), user.getRoleIds());
        // 删除用户与岗位关联
        userPostMapper.deleteUserPostByUserId(userId);
        // 新增用户与岗位管理
        insertUserPost(user);
        return userMapper.updateUser(user);
    }

    /**
     * 修改用户个人详细信息
     */
    @Override
    public int updateUserInfo(SysUser user) {
        return userMapper.updateUser(user);
    }

    /**
     * 重置用户密码
     */
    @Override
    public int resetUserPwd(SysUser user) {
        return updateUserInfo(user);
    }

    /**
     * 新增用户角色信息
     */
    public void insertUserRole(Long userId, Long[] roleIds) {
        if (StringUtils.isNotNull(roleIds)) {
            // 新增用户与角色管理
            List<SysUserRole> list = new ArrayList<SysUserRole>();
            for (Long roleId : roleIds) {
                SysUserRole ur = new SysUserRole();
                ur.setUserId(userId);
                ur.setRoleId(roleId);
                list.add(ur);
            }
            if (list.size() > 0) {
                userRoleMapper.batchUserRole(list);
            }
        }
    }

    /**
     * 新增用户岗位信息
     */
    public void insertUserPost(SysUser user) {
        Long[] posts = user.getPostIds();
        if (StringUtils.isNotNull(posts)) {
            // 新增用户与岗位管理
            List<SysUserPost> list = new ArrayList<SysUserPost>();
            for (Long postId : posts) {
                SysUserPost up = new SysUserPost();
                up.setUserId(user.getUserId());
                up.setPostId(postId);
                list.add(up);
            }
            if (list.size() > 0) {
                userPostMapper.batchUserPost(list);
            }
        }
    }

    /**
     * 校验登录名称是否唯一
     */
    @Override
    public String checkLoginNameUnique(String loginName) {
        int count = userMapper.checkLoginNameUnique(loginName);
        if (count > 0) {
            return UserConstants.NOT_UNIQUE;
        }
        return UserConstants.UNIQUE;
    }

    /**
     * 校验手机号码是否唯一
     */
    @Override
    public String checkPhoneUnique(SysUser user) {
        Long userId = StringUtils.isNull(user.getUserId()) ? -1L : user.getUserId();
        SysUser info = userMapper.checkPhoneUnique(user.getPhonenumber());
        if (StringUtils.isNotNull(info) && info.getUserId().longValue() != userId.longValue()) {
            return UserConstants.NOT_UNIQUE;
        }
        return UserConstants.UNIQUE;
    }

    /**
     * 校验邮箱是否唯一
     */
    @Override
    public String checkEmailUnique(SysUser user) {
        Long userId = StringUtils.isNull(user.getUserId()) ? -1L : user.getUserId();
        SysUser info = userMapper.checkEmailUnique(user.getEmail());
        if (StringUtils.isNotNull(info) && info.getUserId().longValue() != userId.longValue()) {
            return UserConstants.NOT_UNIQUE;
        }
        return UserConstants.UNIQUE;
    }

    /**
     * 删除用户信息
     */
    @Override
    public int deleteUserById(Long userId) {
        // 删除用户与角色关联
        userRoleMapper.deleteUserRoleByUserId(userId);
        // 删除用户与岗位表
        userPostMapper.deleteUserPostByUserId(userId);
        return userMapper.deleteUserById(userId);
    }

    /**
     * 批量删除用户信息
     */
    @Override
    public int deleteUserByIds(String ids) {
        Long[] userIds = Convert.toLongArray(ids);
        // 校验用户是否有数据权限
        checkUserAllowed(new SysUser(userIds[0]));
        // 删除用户与角色关联
        userRoleMapper.deleteUserRole(userIds);
        // 删除用户与岗位关联
        userPostMapper.deleteUserPost(userIds);
        return userMapper.deleteUserByIds(userIds);
    }

    /**
     * 校验用户是否允许操作
     */
    public void checkUserAllowed(SysUser user) {
        if (StringUtils.isNotNull(user.getUserId()) && user.isAdmin()) {
            throw new ServiceException("不允许操作超级管理员用户");
        }
    }
}
```

### 关键注解说明

| 注解 | 说明 |
|:--|:--|
| `@DataScope` | 数据权限过滤（只能看到自己部门的数据）|
| `@Transactional` | 事务管理（失败时回滚）|
| `@Service` | 标注为 Service 层组件 |

## Controller 层实现

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
import org.springframework.web.multipart.MultipartFile;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.domain.entity.SysRole;
import com.ruoyi.common.core.domain.entity.SysUser;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.common.utils.ShiroUtils;
import com.ruoyi.common.utils.poi.ExcelUtil;
import com.ruoyi.framework.shiro.service.PasswordService;
import com.ruoyi.framework.shiro.util.AuthorizationUtils;
import com.ruoyi.system.service.ISysPostService;
import com.ruoyi.system.service.ISysRoleService;
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

    @Autowired
    private ISysRoleService roleService;

    @Autowired
    private ISysPostService postService;

    @Autowired
    private PasswordService passwordService;

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

    @Log(title = "用户管理", businessType = BusinessType.EXPORT)
    @RequiresPermissions("system:user:export")
    @PostMapping("/export")
    @ResponseBody
    public AjaxResult export(HttpServletResponse response, SysUser user) {
        List<SysUser> list = userService.selectUserList(user);
        ExcelUtil<SysUser> util = new ExcelUtil<SysUser>(SysUser.class);
        return util.exportExcel(response, list, "用户数据");
    }

    @Log(title = "用户管理", businessType = BusinessType.IMPORT)
    @RequiresPermissions("system:user:import")
    @PostMapping("/importData")
    @ResponseBody
    public AjaxResult importData(MultipartFile file, boolean updateSupport) throws Exception {
        ExcelUtil<SysUser> util = new ExcelUtil<SysUser>(SysUser.class);
        List<SysUser> userList = util.importExcel(file.getInputStream());
        String operName = ShiroUtils.getLoginName();
        String message = userService.importUser(userList, updateSupport, operName);
        return success(message);
    }

    @GetMapping("/importTemplate")
    @ResponseBody
    public AjaxResult importTemplate(HttpServletResponse response) {
        ExcelUtil<SysUser> util = new ExcelUtil<SysUser>(SysUser.class);
        return util.importTemplateExcel(response, "用户数据");
    }

    /**
     * 新增用户
     */
    @GetMapping("/add")
    public String add(ModelMap mmap) {
        mmap.put("roles", roleService.selectRoleAll().stream()
                .filter(r -> !r.isAdmin()).collect(Collectors.toList()));
        mmap.put("posts", postService.selectPostAll());
        return prefix + "/add";
    }

    /**
     * 新增保存用户
     */
    @RequiresPermissions("system:user:add")
    @Log(title = "用户管理", businessType = BusinessType.INSERT)
    @PostMapping("/add")
    @ResponseBody
    public AjaxResult addSave(@Validated SysUser user) {
        if (UserConstants.NOT_UNIQUE.equals(userService.checkLoginNameUnique(user.getLoginName()))) {
            return error("新增用户'" + user.getLoginName() + "'失败，登录账号已存在");
        }
        if (StringUtils.isNotEmpty(user.getPhonenumber())
                && UserConstants.NOT_UNIQUE.equals(userService.checkPhoneUnique(user))) {
            return error("新增用户'" + user.getLoginName() + "'失败，手机号码已存在");
        }
        if (StringUtils.isNotEmpty(user.getEmail())
                && UserConstants.NOT_UNIQUE.equals(userService.checkEmailUnique(user))) {
            return error("新增用户'" + user.getLoginName() + "'失败，邮箱账号已存在");
        }
        
        // 密码加密
        user.setSalt(ShiroUtils.randomSalt());
        user.setPassword(passwordService.encryptPassword(user.getLoginName(), 
                user.getPassword(), user.getSalt()));
        user.setPwdUpdateDate(DateUtils.getNowDate());
        user.setCreateBy(getLoginName());
        
        return toAjax(userService.insertUser(user));
    }

    /**
     * 修改用户
     */
    @GetMapping("/edit/{userId}")
    public String edit(@PathVariable("userId") Long userId, ModelMap mmap) {
        userService.checkUserDataScope(userId);
        List<SysRole> roles = roleService.selectRolesByUserId(userId);
        mmap.put("user", userService.selectUserById(userId));
        mmap.put("roles", roles.stream().filter(r -> !r.isAdmin()).collect(Collectors.toList()));
        mmap.put("posts", postService.selectPostsByUserId(userId));
        return prefix + "/edit";
    }

    /**
     * 修改保存用户
     */
    @RequiresPermissions("system:user:edit")
    @Log(title = "用户管理", businessType = BusinessType.UPDATE)
    @PostMapping("/edit")
    @ResponseBody
    public AjaxResult editSave(@Validated SysUser user) {
        userService.checkUserAllowed(user);
        userService.checkUserDataScope(user.getUserId());
        
        if (StringUtils.isNotEmpty(user.getPhonenumber())
                && UserConstants.NOT_UNIQUE.equals(userService.checkPhoneUnique(user))) {
            return error("修改用户'" + user.getLoginName() + "'失败，手机号码已存在");
        }
        if (StringUtils.isNotEmpty(user.getEmail())
                && UserConstants.NOT_UNIQUE.equals(userService.checkEmailUnique(user))) {
            return error("修改用户'" + user.getLoginName() + "'失败，邮箱账号已存在");
        }
        
        user.setUpdateBy(getLoginName());
        AuthorizationUtils.clearAllCachedAuthorizationInfo();
        
        return toAjax(userService.updateUser(user));
    }

    /**
     * 重置密码
     */
    @GetMapping("/resetPwd/{userId}")
    public String resetPwd(@PathVariable("userId") Long userId, ModelMap mmap) {
        mmap.put("user", userService.selectUserById(userId));
        return prefix + "/resetPwd";
    }

    /**
     * 重置密码提交
     */
    @RequiresPermissions("system:user:resetPwd")
    @Log(title = "用户管理", businessType = BusinessType.UPDATE)
    @PostMapping("/resetPwd")
    @ResponseBody
    public AjaxResult resetPwdSave(SysUser user) {
        userService.checkUserAllowed(user);
        userService.checkUserDataScope(user.getUserId());
        user.setSalt(ShiroUtils.randomSalt());
        user.setPassword(passwordService.encryptPassword(user.getLoginName(), 
                user.getPassword(), user.getSalt()));
        if (userService.resetUserPwd(user) > 0) {
            // 更新缓存中的密码
            ShiroUtils.setSysUser(userService.selectUserById(user.getUserId()));
            return success();
        }
        return error();
    }

    /**
     * 修改状态
     */
    @RequiresPermissions("system:user:edit")
    @Log(title = "用户管理", businessType = BusinessType.UPDATE)
    @PostMapping("/changeStatus")
    @ResponseBody
    public AjaxResult changeStatus(SysUser user) {
        userService.checkUserAllowed(user);
        userService.checkUserDataScope(user.getUserId());
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
     * 校验登录名
     */
    @PostMapping("/checkLoginNameUnique")
    @ResponseBody
    public boolean checkLoginNameUnique(SysUser user) {
        return userService.checkLoginNameUnique(user.getLoginName()) 
                .equals(UserConstants.UNIQUE);
    }
}
```

## 密码加密机制

### 加密流程

```
用户输入密码
    ↓
生成随机盐值 (Salt)
    ↓
MD5(密码 + 盐值)
    ↓
迭代加密 2 次
    ↓
存入数据库
```

### 密码服务

```java
// src/main/java/com/ruoyi/framework/shiro/service/PasswordService.java
package com.ruoyi.framework.shiro.service;

import java.util.concurrent.atomic.AtomicInteger;
import javax.annotation.PostConstruct;
import org.apache.shiro.cache.Cache;
import org.apache.shiro.cache.CacheManager;
import org.apache.shiro.crypto.hash.Md5Hash;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import com.ruoyi.common.constant.Constants;
import com.ruoyi.common.constant.ShiroConstants;
import com.ruoyi.common.core.domain.entity.SysUser;
import com.ruoyi.common.utils.MessageUtils;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.common.exception.user.*;

/**
 * 登录密码方法
 * 
 * @author ruoyi
 */
@Component
public class PasswordService {
    @Autowired
    private CacheManager cacheManager;

    private Cache<String, AtomicInteger> loginRecordCache;

    @Value("${user.password.maxRetryCount}")
    private int maxRetryCount;

    @Value("${user.password.lockTime}")
    private int lockTime;

    @PostConstruct
    public void init() {
        loginRecordCache = cacheManager.getCache(ShiroConstants.LOGIN_RECORD_CACHE);
    }

    /**
     * 加密密码
     */
    public String encryptPassword(String loginName, String password, String salt) {
        return new Md5Hash(loginName + password, salt, 2).toString();
    }

    /**
     * 验证密码
     */
    public boolean matches(SysUser user, String newPassword) {
        String encryptedPassword = encryptPassword(user.getLoginName(), 
                newPassword, user.getSalt());
        return user.getPassword().equals(encryptedPassword);
    }

    /**
     * 登录前检查
     */
    public SysUser loginPreCheck(String username, String password) {
        // 1. 检查用户是否存在
        SysUser user = userService.selectUserByLoginName(username);
        if (StringUtils.isNull(user)) {
            throw new UserNotExistsException();
        }
        
        // 2. 检查用户状态
        if (UserStatus.DELETED.getCode().equals(user.getDelFlag())) {
            throw new UserPasswordDeleteException();
        }
        if (UserStatus.DISABLE.getCode().equals(user.getStatus())) {
            throw new UserBlockedException();
        }
        
        // 3. 检查密码错误次数
        AtomicInteger retryCount = loginRecordCache.get(username);
        if (retryCount != null && retryCount.get() >= maxRetryCount) {
            throw new UserPasswordNotMatchException();
        }
        
        return user;
    }

    /**
     * 记录登录失败次数
     */
    public void recordLoginInfo(SysUser user) {
        String loginName = user.getLoginName();
        AtomicInteger retryCount = loginRecordCache.get(loginName);
        if (retryCount == null) {
            retryCount = new AtomicInteger(0);
        }
        retryCount.incrementAndGet();
        loginRecordCache.put(loginName, retryCount);
    }

    /**
     * 清除登录失败次数
     */
    public void clearLoginRecordCache(String loginName) {
        if (loginRecordCache.containsKey(loginName)) {
            loginRecordCache.remove(loginName);
        }
    }
}
```

## 用户状态管理

### 状态枚举

```java
// src/main/java/com/ruoyi/common/enums/UserStatus.java
package com.ruoyi.common.enums;

/**
 * 用户状态
 * 
 * @author ruoyi
 */
public enum UserStatus {
    OK("0", "正常"), 
    DISABLE("1", "停用"), 
    DELETED("2", "删除");

    private final String code;
    private final String info;

    UserStatus(String code, String info) {
        this.code = code;
        this.info = info;
    }

    public String getCode() {
        return code;
    }

    public String getInfo() {
        return info;
    }
}
```

### 状态流转

```
正常 (0) ←→ 停用 (1)
    ↓
删除 (2)  [逻辑删除]
```

## 数据权限 (@DataScope)

RuoYi 实现了灵活的数据权限控制：

```java
// src/main/java/com/ruoyi/common/annotation/DataScope.java
package com.ruoyi.common.annotation;

import java.lang.annotation.*;

/**
 * 数据权限过滤注解
 * 
 * @author ruoyi
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface DataScope {
    /**
     * 部门表的别名
     */
    public String deptAlias() default "";

    /**
     * 用户表的别名
     */
    public String userAlias() default "";
}
```

### 数据权限类型

| 类型 | 说明 |
|:--|:--|
| 全部数据权限 | 可以看到所有数据 |
| 自定义数据权限 | 只能看到指定部门的数据 |
| 本部门数据权限 | 只能看到本部门的数据 |
| 本部门及以下数据权限 | 可以看到本部门及下级部门的数据 |
| 仅本人数据权限 | 只能看到自己的数据 |

## 复习卡片

```java
// 用户管理核心流程
// 1. 新增用户
user.setSalt(ShiroUtils.randomSalt());
user.setPassword(passwordService.encryptPassword(...));
userService.insertUser(user);

// 2. 验证密码
passwordService.matches(user, inputPassword);

// 3. 数据权限
@DataScope(deptAlias = "d", userAlias = "u")
public List<SysUser> selectUserList(SysUser user);

// 4. 用户状态
// 0 = 正常
// 1 = 停用
// 2 = 删除（逻辑删除）

// 5. 密码加密
// MD5(loginName + password + salt) 迭代 2 次
```

| 类名 | 职责 |
|:--|:--|
| `SysUser` | 用户实体类 |
| `ISysUserService` | 用户服务接口 |
| `SysUserServiceImpl` | 用户服务实现 |
| `SysUserController` | 用户控制器 |
| `PasswordService` | 密码加密服务 |
| `UserStatus` | 用户状态枚举 |

> [!TIP]
> 下一步：[阶段六：角色与菜单管理](/blog/posts/ruoyi-roadmap-06-role-menu/)
> 
> 在阶段六中，我们将深入理解 RBAC 权限模型，以及角色和菜单的关联关系。
