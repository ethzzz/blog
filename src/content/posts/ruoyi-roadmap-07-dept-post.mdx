---
title: 'RuoYi 阶段七：部门与岗位管理'
published: 2026-09-07T17:00:00+08:00
description: '学习组织架构管理：部门树结构、岗位配置、用户关联，掌握递归构建树形数据的方法。'
tags: [Java, RuoYi, 部门管理, 岗位管理, 树形结构]
category: RuoYi学习路线
draft: false
---

> [!NOTE]
> 本文是 RuoYi 学习路线的**阶段七**，聚焦组织架构管理。学完本篇你应该能：
> 1. 理解部门树的递归构建方法
> 2. 掌握岗位与用户的关联关系
> 3. 知道数据权限在部门中的应用

## 前端视角：组织架构像什么？

| RuoYi 组织架构 | 前端类比 |
|:--|:--|
| `SysDept` 部门 | 组织树组件 (TreeSelect) |
| `SysPost` 岗位 | 职位标签 / 角色配置 |
| 部门树 | 级联选择器 (Cascader) |
| 用户关联部门 | 用户信息中的部门字段 |
| 数据权限 | 根据部门过滤数据 |

## 组织架构关系

```
        ┌─────────┐
        │  部门   │
        └────┬────┘
             │
    ┌────────┼────────┐
    │        │        │
┌───▼───┐ ┌─▼───┐ ┌─▼───┐
│ 岗位  │ │ 用户 │ │子部门│
└───────┘ └─────┘ └─────┘
```

## 部门实体类 (SysDept)

```java
// src/main/java/com/ruoyi/common/core/domain/entity/SysDept.java
package com.ruoyi.common.core.domain.entity;

import javax.validation.constraints.*;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 部门表 sys_dept
 * 
 * @author ruoyi
 */
public class SysDept extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /** 部门ID */
    private Long deptId;

    /** 父部门ID */
    private Long parentId;

    /** 祖级列表 */
    private String ancestors;

    /** 部门名称 */
    private String deptName;

    /** 显示顺序 */
    private Integer orderNum;

    /** 负责人 */
    private String leader;

    /** 联系电话 */
    private String phone;

    /** 邮箱 */
    private String email;

    /** 部门状态（0正常 1停用） */
    private String status;

    /** 删除标志（0代表存在 2代表删除） */
    private String delFlag;

    /** 父部门名称 */
    private String parentName;

    public Long getDeptId() {
        return deptId;
    }

    public void setDeptId(Long deptId) {
        this.deptId = deptId;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public String getAncestors() {
        return ancestors;
    }

    public void setAncestors(String ancestors) {
        this.ancestors = ancestors;
    }

    @NotBlank(message = "部门名称不能为空")
    @Size(min = 0, max = 30, message = "部门名称长度不能超过30个字符")
    public String getDeptName() {
        return deptName;
    }

    public void setDeptName(String deptName) {
        this.deptName = deptName;
    }

    @NotNull(message = "显示顺序不能为空")
    public Integer getOrderNum() {
        return orderNum;
    }

    public void setOrderNum(Integer orderNum) {
        this.orderNum = orderNum;
    }

    public String getLeader() {
        return leader;
    }

    public void setLeader(String leader) {
        this.leader = leader;
    }

    @Size(min = 0, max = 11, message = "联系电话长度不能超过11个字符")
    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    @Email(message = "邮箱格式不正确")
    @Size(min = 0, max = 50, message = "邮箱长度不能超过50个字符")
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDelFlag() {
        return delFlag;
    }

    public void setDelFlag(String delFlag) {
        this.delFlag = delFlag;
    }

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("deptId", getDeptId())
            .append("parentId", getParentId())
            .append("deptName", getDeptName())
            .append("orderNum", getOrderNum())
            .append("leader", getLeader())
            .append("phone", getPhone())
            .append("email", getEmail())
            .append("status", getStatus())
            .append("delFlag", getDelFlag())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .toString();
    }
}
```

## 祖级列表 (Ancestors)

`ancestors` 字段用于快速查询某个部门的所有下级部门：

```
部门层级：总公司 → 研发中心 → 前端组
ancestors：0,100,101

含义：该部门的所有父级ID，用逗号分隔
```

### 查询所有下级部门

```sql
-- 查询研发中心（dept_id=101）的所有下级部门
SELECT * FROM sys_dept 
WHERE find_in_set(101, ancestors)
```

## 岗位实体类 (SysPost)

```java
// src/main/java/com/ruoyi/system/domain/SysPost.java
package com.ruoyi.system.domain;

import javax.validation.constraints.*;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.annotation.Excel.ColumnType;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 岗位表 sys_post
 * 
 * @author ruoyi
 */
public class SysPost extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /** 岗位序号 */
    @Excel(name = "岗位序号", cellType = ColumnType.NUMERIC)
    private Long postId;

    /** 岗位编码 */
    @Excel(name = "岗位编码")
    private String postCode;

    /** 岗位名称 */
    @Excel(name = "岗位名称")
    private String postName;

    /** 岗位排序 */
    @Excel(name = "岗位排序", cellType = ColumnType.NUMERIC)
    private Integer postSort;

    /** 状态（0正常 1停用） */
    @Excel(name = "状态", readConverterExp = "0=正常,1=停用")
    private String status;

    /** 用户是否存在此岗位标识 */
    private boolean flag = false;

    public Long getPostId() {
        return postId;
    }

    public void setPostId(Long postId) {
        this.postId = postId;
    }

    @NotBlank(message = "岗位编码不能为空")
    @Size(min = 0, max = 64, message = "岗位编码长度不能超过64个字符")
    public String getPostCode() {
        return postCode;
    }

    public void setPostCode(String postCode) {
        this.postCode = postCode;
    }

    @NotBlank(message = "岗位名称不能为空")
    @Size(min = 0, max = 50, message = "岗位名称长度不能超过50个字符")
    public String getPostName() {
        return postName;
    }

    public void setPostName(String postName) {
        this.postName = postName;
    }

    @NotNull(message = "显示顺序不能为空")
    public Integer getPostSort() {
        return postSort;
    }

    public void setPostSort(Integer postSort) {
        this.postSort = postSort;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isFlag() {
        return flag;
    }

    public void setFlag(boolean flag) {
        this.flag = flag;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("postId", getPostId())
            .append("postCode", getPostCode())
            .append("postName", getPostName())
            .append("postSort", getPostSort())
            .append("status", getStatus())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .toString();
    }
}
```

## 数据库表结构

### 部门表

```sql
CREATE TABLE sys_dept (
  dept_id           BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '部门id',
  parent_id         BIGINT(20)      DEFAULT 0                  COMMENT '父部门id',
  ancestors         VARCHAR(50)     DEFAULT ''                 COMMENT '祖级列表',
  dept_name         VARCHAR(30)     DEFAULT ''                 COMMENT '部门名称',
  order_num         INT(4)          DEFAULT 0                  COMMENT '显示顺序',
  leader            VARCHAR(20)     DEFAULT NULL               COMMENT '负责人',
  phone             VARCHAR(11)     DEFAULT NULL               COMMENT '联系电话',
  email             VARCHAR(50)     DEFAULT NULL               COMMENT '邮箱',
  status            CHAR(1)         DEFAULT '0'                COMMENT '部门状态（0正常 1停用）',
  del_flag          CHAR(1)         DEFAULT '0'                COMMENT '删除标志',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME                                   COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME                                   COMMENT '更新时间',
  PRIMARY KEY (dept_id)
) ENGINE=InnoDB AUTO_INCREMENT=200 COMMENT = '部门表';
```

### 岗位表

```sql
CREATE TABLE sys_post (
  post_id           BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '岗位ID',
  post_code         VARCHAR(64)     NOT NULL                   COMMENT '岗位编码',
  post_name         VARCHAR(50)     NOT NULL                   COMMENT '岗位名称',
  post_sort         INT(4)          NOT NULL                   COMMENT '显示顺序',
  status            CHAR(1)         NOT NULL                   COMMENT '状态（0正常 1停用）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME                                   COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME                                   COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT NULL               COMMENT '备注',
  PRIMARY KEY (post_id)
) ENGINE=InnoDB AUTO_INCREMENT=10 COMMENT = '岗位信息表';
```

### 用户岗位关联表

```sql
CREATE TABLE sys_user_post (
  user_id           BIGINT(20) NOT NULL COMMENT '用户ID',
  post_id           BIGINT(20) NOT NULL COMMENT '岗位ID',
  PRIMARY KEY(user_id, post_id)
) ENGINE=InnoDB COMMENT = '用户与岗位关联表';
```

## Service 层实现

### 部门 Service 接口

```java
// src/main/java/com/ruoyi/system/service/ISysDeptService.java
package com.ruoyi.system.service;

import java.util.List;
import com.ruoyi.common.core.domain.Ztree;
import com.ruoyi.common.core.domain.entity.SysDept;
import com.ruoyi.common.core.domain.entity.SysRole;

/**
 * 部门管理 服务层
 * 
 * @author ruoyi
 */
public interface ISysDeptService {
    /**
     * 查询部门管理数据
     */
    public List<SysDept> selectDeptList(SysDept dept);

    /**
     * 查询部门管理树
     */
    public List<Ztree> selectDeptTree(SysDept dept);

    /**
     * 根据角色ID查询部门树
     */
    public List<Ztree> roleDeptTreeData(Long roleId);

    /**
     * 根据部门ID查询信息
     */
    public SysDept selectDeptById(Long deptId);

    /**
     * 根据ID查询所有子部门
     */
    public int selectDeptCount(Long deptId);

    /**
     * 是否存在子节点
     */
    public boolean hasChildByDeptId(Long deptId);

    /**
     * 查询部门是否存在用户
     */
    public boolean checkDeptExistUser(Long deptId);

    /**
     * 删除部门管理信息
     */
    public int deleteDeptById(Long deptId);

    /**
     * 新增保存部门信息
     */
    public int insertDept(SysDept dept);

    /**
     * 修改保存部门信息
     */
    public int updateDept(SysDept dept);

    /**
     * 校验部门名称是否唯一
     */
    public String checkDeptNameUnique(SysDept dept);

    /**
     * 根据部门ID查询角色数据权限
     */
    public List<Long> selectRoleDeptIds(Long roleId);
}
```

### 部门 Service 实现

```java
// src/main/java/com/ruoyi/system/service/impl/SysDeptServiceImpl.java
package com.ruoyi.system.service.impl;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import org.apache.commons.lang3.ArrayUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ruoyi.common.annotation.DataScope;
import com.ruoyi.common.constant.UserConstants;
import com.ruoyi.common.core.domain.Ztree;
import com.ruoyi.common.core.domain.entity.SysDept;
import com.ruoyi.common.core.domain.entity.SysRole;
import com.ruoyi.common.exception.ServiceException;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.system.mapper.SysDeptMapper;
import com.ruoyi.system.mapper.SysRoleMapper;
import com.ruoyi.system.service.ISysDeptService;

/**
 * 部门管理 服务实现
 * 
 * @author ruoyi
 */
@Service
public class SysDeptServiceImpl implements ISysDeptService {
    @Autowired
    private SysDeptMapper deptMapper;

    @Autowired
    private SysRoleMapper roleMapper;

    /**
     * 查询部门管理数据
     */
    @Override
    @DataScope(deptAlias = "d")
    public List<SysDept> selectDeptList(SysDept dept) {
        return deptMapper.selectDeptList(dept);
    }

    /**
     * 查询部门管理树
     */
    @Override
    public List<Ztree> selectDeptTree(SysDept dept) {
        List<SysDept> deptList = deptMapper.selectDeptList(dept);
        List<Ztree> ztrees = initZtree(deptList);
        return ztrees;
    }

    /**
     * 构建前端需要的树结构
     */
    public List<Ztree> initZtree(List<SysDept> depts) {
        List<Ztree> ztrees = new ArrayList<Ztree>();
        boolean isCheck = StringUtils.isNotNull(depts) && depts.size() > 0;
        for (SysDept dept : depts) {
            Ztree ztree = new Ztree();
            ztree.setId(dept.getDeptId());
            ztree.setpId(dept.getParentId());
            ztree.setName(dept.getDeptName());
            ztree.setTitle(dept.getDeptName());
            ztree.setChecked(isCheck && dept.isChecked());
            ztrees.add(ztree);
        }
        return ztrees;
    }

    /**
     * 根据角色ID查询部门树
     */
    @Override
    public List<Ztree> roleDeptTreeData(Long roleId) {
        List<SysDept> deptList = selectDeptList(new SysDept());
        SysRole role = roleMapper.selectRoleById(roleId);
        List<Ztree> ztrees = new ArrayList<Ztree>();
        for (SysDept dept : deptList) {
            Ztree ztree = new Ztree();
            ztree.setId(dept.getDeptId());
            ztree.setpId(dept.getParentId());
            ztree.setName(dept.getDeptName());
            ztree.setTitle(dept.getDeptName());
            // 判断角色是否拥有该部门权限
            if (StringUtils.isNotNull(role.getDeptIds()) 
                    && ArrayUtils.contains(role.getDeptIds(), dept.getDeptId())) {
                ztree.setChecked(true);
            }
            ztrees.add(ztree);
        }
        return ztrees;
    }

    /**
     * 新增保存部门信息
     */
    @Override
    public int insertDept(SysDept dept) {
        SysDept info = deptMapper.selectDeptById(dept.getParentId());
        // 如果父节点不为"正常"状态,则不允许新增子节点
        if (!UserConstants.DEPT_NORMAL.equals(info.getStatus())) {
            throw new ServiceException("部门停用，不允许新增");
        }
        dept.setAncestors(info.getAncestors() + "," + dept.getParentId());
        return deptMapper.insertDept(dept);
    }

    /**
     * 修改保存部门信息
     */
    @Override
    public int updateDept(SysDept dept) {
        SysDept newParentDept = deptMapper.selectDeptById(dept.getParentId());
        SysDept oldDept = selectDeptById(dept.getDeptId());
        if (StringUtils.isNotNull(newParentDept) && StringUtils.isNotNull(oldDept)) {
            String newAncestors = newParentDept.getAncestors() + "," + newParentDept.getDeptId();
            String oldAncestors = oldDept.getAncestors();
            dept.setAncestors(newAncestors);
            updateDeptChildren(dept.getDeptId(), newAncestors, oldAncestors);
        }
        int result = deptMapper.updateDept(dept);
        if (UserConstants.DEPT_NORMAL.equals(dept.getStatus()) 
                && StringUtils.isNotEmpty(dept.getAncestors()) 
                && !StringUtils.equals("0", dept.getAncestors())) {
            // 如果该部门是启用状态，则启用该部门的上级部门
            updateParentDeptStatusNormal(dept);
        }
        return result;
    }

    /**
     * 修改该部门的父级部门状态
     */
    private void updateParentDeptStatusNormal(SysDept dept) {
        String ancestors = dept.getAncestors();
        Long[] deptIds = Convert.toLongArray(ancestors);
        deptMapper.updateDeptStatusNormal(deptIds);
    }

    /**
     * 修改子元素关系
     */
    private void updateDeptChildren(Long deptId, String newAncestors, String oldAncestors) {
        List<SysDept> children = deptMapper.selectChildrenDeptById(deptId);
        for (SysDept child : children) {
            child.setAncestors(child.getAncestors().replaceFirst(oldAncestors, newAncestors));
        }
        if (children.size() > 0) {
            deptMapper.updateDeptChildren(children);
        }
    }

    /**
     * 删除部门管理信息
     */
    @Override
    public int deleteDeptById(Long deptId) {
        return deptMapper.deleteDeptById(deptId);
    }

    /**
     * 校验部门名称是否唯一
     */
    @Override
    public String checkDeptNameUnique(SysDept dept) {
        Long deptId = StringUtils.isNull(dept.getDeptId()) ? -1L : dept.getDeptId();
        SysDept info = deptMapper.checkDeptNameUnique(dept.getDeptName(), dept.getParentId());
        if (StringUtils.isNotNull(info) && info.getDeptId().longValue() != deptId.longValue()) {
            return UserConstants.NOT_UNIQUE;
        }
        return UserConstants.UNIQUE;
    }

    /**
     * 是否存在子节点
     */
    @Override
    public boolean hasChildByDeptId(Long deptId) {
        int result = deptMapper.hasChildByDeptId(deptId);
        return result > 0;
    }

    /**
     * 查询部门是否存在用户
     */
    @Override
    public boolean checkDeptExistUser(Long deptId) {
        int result = deptMapper.checkDeptExistUser(deptId);
        return result > 0;
    }
}
```

## 岗位 Service 实现

```java
// src/main/java/com/ruoyi/system/service/impl/SysPostServiceImpl.java
package com.ruoyi.system.service.impl;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.common.constant.UserConstants;
import com.ruoyi.common.core.text.Convert;
import com.ruoyi.common.exception.ServiceException;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.system.domain.SysPost;
import com.ruoyi.system.mapper.SysPostMapper;
import com.ruoyi.system.mapper.SysUserPostMapper;
import com.ruoyi.system.service.ISysPostService;

/**
 * 岗位信息 服务层实现
 * 
 * @author ruoyi
 */
@Service
public class SysPostServiceImpl implements ISysPostService {
    @Autowired
    private SysPostMapper postMapper;

    @Autowired
    private SysUserPostMapper userPostMapper;

    /**
     * 查询岗位信息集合
     */
    @Override
    public List<SysPost> selectPostList(SysPost post) {
        return postMapper.selectPostList(post);
    }

    /**
     * 查询所有岗位
     */
    @Override
    public List<SysPost> selectPostAll() {
        return postMapper.selectPostAll();
    }

    /**
     * 根据用户ID查询岗位
     */
    @Override
    public List<SysPost> selectPostsByUserId(Long userId) {
        List<SysPost> userPosts = postMapper.selectPostsByUserId(userId);
        List<SysPost> posts = postMapper.selectPostAll();
        for (SysPost post : posts) {
            for (SysPost userPost : userPosts) {
                if (post.getPostId().longValue() == userPost.getPostId().longValue()) {
                    post.setFlag(true);
                    break;
                }
            }
        }
        return posts;
    }

    /**
     * 新增保存岗位信息
     */
    @Override
    public int insertPost(SysPost post) {
        return postMapper.insertPost(post);
    }

    /**
     * 修改保存岗位信息
     */
    @Override
    public int updatePost(SysPost post) {
        return postMapper.updatePost(post);
    }

    /**
     * 批量删除岗位信息
     */
    @Override
    public int deletePostByIds(String ids) {
        Long[] postIds = Convert.toLongArray(ids);
        for (Long postId : postIds) {
            SysPost post = selectPostById(postId);
            if (countUserPostById(postId) > 0) {
                throw new ServiceException(String.format("%1$s已分配,不能删除", post.getPostName()));
            }
        }
        return postMapper.deletePostByIds(postIds);
    }

    /**
     * 查询岗位绑定用户数
     */
    public int countUserPostById(Long postId) {
        return userPostMapper.countUserPostById(postId);
    }

    /**
     * 校验岗位名称是否唯一
     */
    @Override
    public String checkPostNameUnique(SysPost post) {
        Long postId = StringUtils.isNull(post.getPostId()) ? -1L : post.getPostId();
        SysPost info = postMapper.checkPostNameUnique(post.getPostName());
        if (StringUtils.isNotNull(info) && info.getPostId().longValue() != postId.longValue()) {
            return UserConstants.NOT_UNIQUE;
        }
        return UserConstants.UNIQUE;
    }

    /**
     * 校验岗位编码是否唯一
     */
    @Override
    public String checkPostCodeUnique(SysPost post) {
        Long postId = StringUtils.isNull(post.getPostId()) ? -1L : post.getPostId();
        SysPost info = postMapper.checkPostCodeUnique(post.getPostCode());
        if (StringUtils.isNotNull(info) && info.getPostId().longValue() != postId.longValue()) {
            return UserConstants.NOT_UNIQUE;
        }
        return UserConstants.UNIQUE;
    }
}
```

## 数据权限实现

### @DataScope 注解处理

```java
// src/main/java/com/ruoyi/framework/aspectj/DataScopeAspect.java
package com.ruoyi.framework.aspectj;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;
import com.ruoyi.common.annotation.DataScope;
import com.ruoyi.common.constant.UserConstants;
import com.ruoyi.common.core.domain.BaseEntity;
import com.ruoyi.common.core.domain.entity.SysRole;
import com.ruoyi.common.core.domain.entity.SysUser;
import com.ruoyi.common.utils.ShiroUtils;
import com.ruoyi.common.utils.StringUtils;

/**
 * 数据过滤处理
 * 
 * @author ruoyi
 */
@Aspect
@Component
public class DataScopeAspect {
    /**
     * 全部数据权限
     */
    public static final String DATA_SCOPE_ALL = "1";

    /**
     * 自定义数据权限
     */
    public static final String DATA_SCOPE_CUSTOM = "2";

    /**
     * 部门数据权限
     */
    public static final String DATA_SCOPE_DEPT = "3";

    /**
     * 部门及以下数据权限
     */
    public static final String DATA_SCOPE_DEPT_AND_CHILD = "4";

    /**
     * 仅本人数据权限
     */
    public static final String DATA_SCOPE_SELF = "5";

    @Before("@annotation(dataScope)")
    public void doBefore(JoinPoint point, DataScope dataScope) {
        handleDataScope(point, dataScope);
    }

    protected void handleDataScope(JoinPoint joinPoint, DataScope dataScope) {
        // 获取当前的用户
        SysUser currentUser = ShiroUtils.getSysUser();
        if (StringUtils.isNotNull(currentUser)) {
            // 如果是超级管理员，则不过滤数据
            if (!currentUser.isAdmin()) {
                filterDataScope(joinPoint, currentUser, dataScope);
            }
        }
    }

    /**
     * 数据范围过滤
     */
    private void filterDataScope(JoinPoint joinPoint, SysUser user, DataScope dataScope) {
        StringBuilder sqlString = new StringBuilder();
        List<SysRole> roles = user.getRoles();
        for (SysRole role : roles) {
            String scopeType = role.getDataScope();
            if (DATA_SCOPE_ALL.equals(scopeType)) {
                sqlString = new StringBuilder();
                break;
            } else if (DATA_SCOPE_CUSTOM.equals(scopeType)) {
                sqlString.append(StringUtils.format(
                    " OR {}.dept_id IN ( SELECT dept_id FROM sys_role_dept WHERE role_id = {} )",
                    dataScope.deptAlias(), role.getRoleId()));
            } else if (DATA_SCOPE_DEPT.equals(scopeType)) {
                sqlString.append(StringUtils.format(
                    " OR {}.dept_id = {}", dataScope.deptAlias(), user.getDeptId()));
            } else if (DATA_SCOPE_DEPT_AND_CHILD.equals(scopeType)) {
                String deptChild = user.getDeptId() + "";
                sqlString.append(StringUtils.format(
                    " OR {}.dept_id IN ( SELECT dept_id FROM sys_dept WHERE dept_id = {} or find_in_set( {} , ancestors ) )",
                    dataScope.deptAlias(), user.getDeptId(), deptChild));
            } else if (DATA_SCOPE_SELF.equals(scopeType)) {
                sqlString.append(StringUtils.format(
                    " OR {}.user_id = {}", dataScope.userAlias(), user.getUserId()));
            }
        }
        if (StringUtils.isEmpty(sqlString.toString())) {
            sqlString = new StringBuilder(StringUtils.format(" OR {}.user_id = {}", 
                    dataScope.userAlias(), user.getUserId()));
        }
        // 将sql拼接到BaseEntity的params中
        BaseEntity baseEntity = (BaseEntity) joinPoint.getArgs()[0];
        baseEntity.getParams().put("dataScope", sqlString.toString());
    }
}
```

## 复习卡片

```java
// 部门管理核心流程
// 1. 新增部门
dept.setAncestors(parentDept.getAncestors() + "," + parentId);
deptMapper.insertDept(dept);

// 2. 修改部门（更新子部门的 ancestors）
updateDeptChildren(deptId, newAncestors, oldAncestors);

// 3. 查询所有下级部门
SELECT * FROM sys_dept WHERE find_in_set(101, ancestors);

// 4. 数据权限过滤
@DataScope(deptAlias = "d")
public List<SysDept> selectDeptList(SysDept dept);

// 5. 岗位关联用户
List<SysPost> posts = postService.selectPostsByUserId(userId);
```

| 类名 | 职责 |
|:--|:--|
| `SysDept` | 部门实体类 |
| `SysPost` | 岗位实体类 |
| `SysUserPost` | 用户岗位关联 |
| `ISysDeptService` | 部门服务接口 |
| `ISysPostService` | 岗位服务接口 |
| `DataScopeAspect` | 数据权限切面 |
| `Ztree` | 树形结构数据 |

| 数据权限类型 | 值 | 说明 |
|:--|:--|:--|
| 全部数据 | 1 | 超级管理员 |
| 自定义数据 | 2 | 指定部门 |
| 本部门数据 | 3 | 当前部门 |
| 本部门及以下 | 4 | 当前部门及子部门 |
| 仅本人数据 | 5 | 只能看自己的 |

> [!TIP]
> 下一步：[阶段八：字典与参数管理](/blog/posts/ruoyi-roadmap-08-dict-config/)
> 
> 在阶段八中，我们将学习系统配置管理，包括数据字典和参数配置。
