---
title: 'RuoYi 阶段六：角色与菜单管理'
published: 2026-09-07T16:00:00+08:00
description: '深入理解 RBAC 权限模型，掌握角色和菜单的关联关系，实现动态菜单树和权限分配。'
tags: [Java, RuoYi, RBAC, 角色管理, 菜单管理]
category: RuoYi学习路线
draft: false
---

> [!NOTE]
> 本文是 RuoYi 学习路线的**阶段六**，聚焦 RBAC 权限模型。学完本篇你应该能：
> 1. 理解 RBAC 权限模型的设计思想
> 2. 掌握角色和菜单的关联关系
> 3. 知道如何构建动态菜单树

## 前端视角：RBAC 像什么？

| RuoYi RBAC | 前端类比 |
|:--|:--|
| `SysRole` 角色 | 用户角色类型 (admin/user/guest) |
| `SysMenu` 菜单 | 路由配置 + 侧边栏菜单项 |
| 权限标识 | 按钮级别权限控制 (v-permission) |
| 菜单树 | TreeSelect 组件数据 |
| 角色关联菜单 | 角色权限配置面板 |

## RBAC 权限模型

RBAC (Role-Based Access Control) 基于角色的访问控制，核心思想：

```
用户 (User) → 角色 (Role) → 权限 (Permission/Menu)
```

### 数据表关系

```
sys_user ←→ sys_user_role ←→ sys_role ←→ sys_role_menu ←→ sys_menu
   |              |                |              |               |
 用户表        用户角色关联       角色表        角色菜单关联      菜单表
```

### 权限流程图

```
用户登录
    ↓
查询用户的角色列表
    ↓
查询角色关联的菜单列表
    ↓
提取权限标识 (如 system:user:add)
    ↓
Shiro 授权
    ↓
页面显示对应按钮/菜单
```

## 角色实体类 (SysRole)

```java
// src/main/java/com/ruoyi/common/core/domain/entity/SysRole.java
package com.ruoyi.common.core.domain.entity;

import javax.validation.constraints.*;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.annotation.Excel.ColumnType;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 角色表 sys_role
 * 
 * @author ruoyi
 */
public class SysRole extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /** 角色ID */
    @Excel(name = "角色序号", cellType = ColumnType.NUMERIC)
    private Long roleId;

    /** 角色名称 */
    @Excel(name = "角色名称")
    private String roleName;

    /** 角色权限字符串 */
    @Excel(name = "角色权限")
    private String roleKey;

    /** 角色排序 */
    @Excel(name = "角色排序", cellType = ColumnType.NUMERIC)
    private Integer roleSort;

    /** 数据范围（1：全部数据权限；2：自定义数据权限；3：本部门数据权限；4：本部门及以下数据权限；5：仅本人数据权限） */
    @Excel(name = "数据范围", readConverterExp = "1=所有数据权限,2=自定义数据权限,3=本部门数据权限,4=本部门及以下数据权限,5=仅本人数据权限")
    private String dataScope;

    /** 角色状态（0正常 1停用） */
    @Excel(name = "角色状态", readConverterExp = "0=正常,1=停用")
    private String status;

    /** 删除标志（0代表存在 2代表删除） */
    private String delFlag;

    /** 用户是否存在此角色标识 */
    private boolean flag = false;

    /** 菜单组 */
    private Long[] menuIds;

    /** 部门组（数据权限） */
    private Long[] deptIds;

    public SysRole() {
    }

    public SysRole(Long roleId) {
        this.roleId = roleId;
    }

    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }

    public boolean isAdmin() {
        return isAdmin(this.roleId);
    }

    public static boolean isAdmin(Long roleId) {
        return roleId != null && 1L == roleId;
    }

    @NotBlank(message = "角色名称不能为空")
    @Size(min = 0, max = 30, message = "角色名称长度不能超过30个字符")
    public String getRoleName() {
        return roleName;
    }

    @NotBlank(message = "权限字符不能为空")
    @Size(min = 0, max = 100, message = "权限字符长度不能超过100个字符")
    public String getRoleKey() {
        return roleKey;
    }

    @NotBlank(message = "显示顺序不能为空")
    public Integer getRoleSort() {
        return roleSort;
    }

    public String getDataScope() {
        return dataScope;
    }

    public void setDataScope(String dataScope) {
        this.dataScope = dataScope;
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

    public boolean isFlag() {
        return flag;
    }

    public void setFlag(boolean flag) {
        this.flag = flag;
    }

    public Long[] getMenuIds() {
        return menuIds;
    }

    public void setMenuIds(Long[] menuIds) {
        this.menuIds = menuIds;
    }

    public Long[] getDeptIds() {
        return deptIds;
    }

    public void setDeptIds(Long[] deptIds) {
        this.deptIds = deptIds;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("roleId", getRoleId())
            .append("roleName", getRoleName())
            .append("roleKey", getRoleKey())
            .append("roleSort", getRoleSort())
            .append("dataScope", getDataScope())
            .append("status", getStatus())
            .append("delFlag", getDelFlag())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .toString();
    }
}
```

## 菜单实体类 (SysMenu)

```java
// src/main/java/com/ruoyi/system/domain/SysMenu.java
package com.ruoyi.system.domain;

import java.util.ArrayList;
import java.util.List;
import javax.validation.constraints.*;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 菜单权限表 sys_menu
 * 
 * @author ruoyi
 */
public class SysMenu extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /** 菜单ID */
    private Long menuId;

    /** 菜单名称 */
    private String menuName;

    /** 父菜单名称 */
    private String parentName;

    /** 父菜单ID */
    private Long parentId;

    /** 显示顺序 */
    private Integer orderNum;

    /** 菜单URL */
    private String url;

    /** 打开方式（menuItem页签 menuBlank新窗口） */
    private String target;

    /** 类型（M目录 C菜单 F按钮） */
    private String menuType;

    /** 菜单状态（0显示 1隐藏） */
    private String visible;

    /** 是否刷新（0刷新 1不刷新） */
    private String isRefresh;

    /** 权限字符串 */
    private String perms;

    /** 菜单图标 */
    private String icon;

    /** 子菜单 */
    private List<SysMenu> children = new ArrayList<SysMenu>();

    public Long getMenuId() {
        return menuId;
    }

    public void setMenuId(Long menuId) {
        this.menuId = menuId;
    }

    @NotBlank(message = "菜单名称不能为空")
    @Size(min = 0, max = 50, message = "菜单名称长度不能超过50个字符")
    public String getMenuName() {
        return menuName;
    }

    public void setMenuName(String menuName) {
        this.menuName = menuName;
    }

    public String getParentName() {
        return parentName;
    }

    public void setParentName(String parentName) {
        this.parentName = parentName;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    @NotNull(message = "显示顺序不能为空")
    public Integer getOrderNum() {
        return orderNum;
    }

    public void setOrderNum(Integer orderNum) {
        this.orderNum = orderNum;
    }

    @Size(min = 0, max = 200, message = "请求地址不能超过200个字符")
    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    @NotBlank(message = "菜单类型不能为空")
    public String getMenuType() {
        return menuType;
    }

    public void setMenuType(String menuType) {
        this.menuType = menuType;
    }

    public String getVisible() {
        return visible;
    }

    public void setVisible(String visible) {
        this.visible = visible;
    }

    public String getIsRefresh() {
        return isRefresh;
    }

    public void setIsRefresh(String isRefresh) {
        this.isRefresh = isRefresh;
    }

    @Size(min = 0, max = 100, message = "权限标识长度不能超过100个字符")
    public String getPerms() {
        return perms;
    }

    public void setPerms(String perms) {
        this.perms = StringUtils.isEmpty(perms) ? "" : perms.trim();
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public List<SysMenu> getChildren() {
        return children;
    }

    public void setChildren(List<SysMenu> children) {
        this.children = children;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("menuId", getMenuId())
            .append("menuName", getMenuName())
            .append("parentId", getParentId())
            .append("orderNum", getOrderNum())
            .append("url", getUrl())
            .append("target", getTarget())
            .append("menuType", getMenuType())
            .append("visible", getVisible())
            .append("perms", getPerms())
            .append("icon", getIcon())
            .append("createBy", getCreateBy())
            .append("createTime", getCreateTime())
            .append("updateBy", getUpdateBy())
            .append("updateTime", getUpdateTime())
            .append("remark", getRemark())
            .toString();
    }
}
```

## 菜单类型

| 类型 | 值 | 说明 |
|:--|:--|:--|
| 目录 | M | 一级菜单，不直接访问页面 |
| 菜单 | C | 二级菜单，对应具体页面 |
| 按钮 | F | 按钮级权限，如新增/修改/删除 |

## 角色 Service 实现

### 接口定义

```java
// src/main/java/com/ruoyi/system/service/ISysRoleService.java
package com.ruoyi.system.service;

import java.util.List;
import java.util.Set;
import com.ruoyi.common.core.domain.entity.SysRole;
import com.ruoyi.system.domain.SysUserRole;

/**
 * 角色业务层
 * 
 * @author ruoyi
 */
public interface ISysRoleService {
    /**
     * 根据条件分页查询角色数据
     */
    public List<SysRole> selectRoleList(SysRole role);

    /**
     * 根据用户ID查询角色
     */
    public Set<SysRole> selectRolesByUserId(Long userId);

    /**
     * 查询所有角色
     */
    public List<SysRole> selectRoleAll();

    /**
     * 通过角色ID查询角色
     */
    public SysRole selectRoleById(Long roleId);

    /**
     * 通过角色ID删除角色
     */
    public boolean deleteRoleById(Long roleId);

    /**
     * 批量删除角色用户信息
     */
    public int deleteRoleByIds(String ids);

    /**
     * 新增保存角色信息
     */
    public int insertRole(SysRole role);

    /**
     * 修改保存角色信息
     */
    public int updateRole(SysRole role);

    /**
     * 修改数据权限信息
     */
    public int authDataScope(SysRole role);

    /**
     * 校验角色名称是否唯一
     */
    public String checkRoleNameUnique(SysRole role);

    /**
     * 校验角色权限是否唯一
     */
    public String checkRoleKeyUnique(SysRole role);

    /**
     * 校验角色是否允许操作
     */
    public void checkRoleAllowed(SysRole role);

    /**
     * 取消授权用户角色
     */
    public int deleteAuthUser(SysUserRole userRole);

    /**
     * 批量取消授权用户角色
     */
    public int deleteAuthUsers(Long roleId, String userIds);

    /**
     * 批量选择授权用户角色
     */
    public int insertAuthUsers(Long roleId, String userIds);
}
```

### 实现类核心方法

```java
// src/main/java/com/ruoyi/system/service/impl/SysRoleServiceImpl.java
package com.ruoyi.system.service.impl;

import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ruoyi.common.annotation.DataScope;
import com.ruoyi.common.constant.UserConstants;
import com.ruoyi.common.core.domain.entity.SysRole;
import com.ruoyi.common.core.domain.entity.SysUser;
import com.ruoyi.common.core.text.Convert;
import com.ruoyi.common.exception.ServiceException;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.common.utils.spring.SpringUtils;
import com.ruoyi.system.domain.SysRoleDept;
import com.ruoyi.system.domain.SysRoleMenu;
import com.ruoyi.system.domain.SysUserRole;
import com.ruoyi.system.mapper.*;
import com.ruoyi.system.service.ISysRoleService;

/**
 * 角色 业务层处理
 * 
 * @author ruoyi
 */
@Service
public class SysRoleServiceImpl implements ISysRoleService {
    @Autowired
    private SysRoleMapper roleMapper;

    @Autowired
    private SysRoleMenuMapper roleMenuMapper;

    @Autowired
    private SysUserRoleMapper userRoleMapper;

    @Autowired
    private SysRoleDeptMapper roleDeptMapper;

    /**
     * 根据条件分页查询角色数据
     */
    @Override
    @DataScope(deptAlias = "d")
    public List<SysRole> selectRoleList(SysRole role) {
        return roleMapper.selectRoleList(role);
    }

    /**
     * 根据用户ID查询角色
     */
    @Override
    public Set<SysRole> selectRolesByUserId(Long userId) {
        List<SysRole> userRoles = roleMapper.selectRolesByUserId(userId);
        List<SysRole> roles = selectRoleAll();
        for (SysRole role : roles) {
            for (SysRole userRole : userRoles) {
                if (role.getRoleId().longValue() == userRole.getRoleId().longValue()) {
                    role.setFlag(true);
                    break;
                }
            }
        }
        return new LinkedHashSet<SysRole>(roles);
    }

    /**
     * 查询所有角色
     */
    @Override
    public List<SysRole> selectRoleAll() {
        return SpringUtils.getAopProxy(this).selectRoleList(new SysRole());
    }

    /**
     * 新增保存角色信息
     */
    @Override
    @Transactional
    public int insertRole(SysRole role) {
        // 新增角色信息
        roleMapper.insertRole(role);
        return insertRoleMenu(role);
    }

    /**
     * 修改保存角色信息
     */
    @Override
    @Transactional
    public int updateRole(SysRole role) {
        // 修改角色信息
        roleMapper.updateRole(role);
        // 删除角色与菜单关联
        roleMenuMapper.deleteRoleMenuByRoleId(role.getRoleId());
        return insertRoleMenu(role);
    }

    /**
     * 新增角色菜单信息
     */
    public int insertRoleMenu(SysRole role) {
        int rows = 1;
        // 新增用户与角色管理
        List<SysRoleMenu> list = new ArrayList<SysRoleMenu>();
        for (Long menuId : role.getMenuIds()) {
            SysRoleMenu rm = new SysRoleMenu();
            rm.setRoleId(role.getRoleId());
            rm.setMenuId(menuId);
            list.add(rm);
        }
        if (list.size() > 0) {
            rows = roleMenuMapper.batchRoleMenu(list);
        }
        return rows;
    }

    /**
     * 修改数据权限信息
     */
    @Override
    @Transactional
    public int authDataScope(SysRole role) {
        // 修改角色信息
        roleMapper.updateRole(role);
        // 删除角色与部门关联
        roleDeptMapper.deleteRoleDeptByRoleId(role.getRoleId());
        // 新增角色和部门信息（数据权限）
        return insertRoleDept(role);
    }

    /**
     * 新增角色部门信息（数据权限）
     */
    public int insertRoleDept(SysRole role) {
        int rows = 1;
        // 新增角色与部门管理
        List<SysRoleDept> list = new ArrayList<SysRoleDept>();
        for (Long deptId : role.getDeptIds()) {
            SysRoleDept rd = new SysRoleDept();
            rd.setRoleId(role.getRoleId());
            rd.setDeptId(deptId);
            list.add(rd);
        }
        if (list.size() > 0) {
            rows = roleDeptMapper.batchRoleDept(list);
        }
        return rows;
    }

    /**
     * 校验角色名称是否唯一
     */
    @Override
    public String checkRoleNameUnique(SysRole role) {
        Long roleId = StringUtils.isNull(role.getRoleId()) ? -1L : role.getRoleId();
        SysRole info = roleMapper.checkRoleNameUnique(role.getRoleName());
        if (StringUtils.isNotNull(info) && info.getRoleId().longValue() != roleId.longValue()) {
            return UserConstants.NOT_UNIQUE;
        }
        return UserConstants.UNIQUE;
    }

    /**
     * 校验角色权限是否唯一
     */
    @Override
    public String checkRoleKeyUnique(SysRole role) {
        Long roleId = StringUtils.isNull(role.getRoleId()) ? -1L : role.getRoleId();
        SysRole info = roleMapper.checkRoleKeyUnique(role.getRoleKey());
        if (StringUtils.isNotNull(info) && info.getRoleId().longValue() != roleId.longValue()) {
            return UserConstants.NOT_UNIQUE;
        }
        return UserConstants.UNIQUE;
    }

    /**
     * 校验角色是否允许操作
     */
    @Override
    public void checkRoleAllowed(SysRole role) {
        if (StringUtils.isNotNull(role.getRoleId()) && role.isAdmin()) {
            throw new ServiceException("不允许操作超级管理员角色");
        }
    }

    /**
     * 批量删除角色信息
     */
    @Override
    public int deleteRoleByIds(String ids) {
        Long[] roleIds = Convert.toLongArray(ids);
        for (Long roleId : roleIds) {
            checkRoleAllowed(new SysRole(roleId));
            SysRole role = selectRoleById(roleId);
            if (countUserRoleByRoleId(roleId) > 0) {
                throw new ServiceException(String.format("%1$s已分配,不能删除", role.getRoleName()));
            }
        }
        // 删除角色与菜单关联
        roleMenuMapper.deleteRoleMenu(roleIds);
        // 删除角色与部门关联
        roleDeptMapper.deleteRoleDept(roleIds);
        return roleMapper.deleteRoleByIds(roleIds);
    }

    /**
     * 查询角色绑定用户数
     */
    public int countUserRoleByRoleId(Long roleId) {
        return userRoleMapper.countUserRoleByRoleId(roleId);
    }
}
```

## 菜单 Service 实现

### 接口定义

```java
// src/main/java/com/ruoyi/system/service/ISysMenuService.java
package com.ruoyi.system.service;

import java.util.List;
import java.util.Map;
import java.util.Set;
import com.ruoyi.common.core.domain.Ztree;
import com.ruoyi.system.domain.SysMenu;

/**
 * 菜单 业务层
 * 
 * @author ruoyi
 */
public interface ISysMenuService {
    /**
     * 根据用户查询系统菜单列表
     */
    public List<SysMenu> selectMenusByUser(SysUser user);

    /**
     * 查询系统菜单列表
     */
    public List<SysMenu> selectMenuList(SysMenu menu);

    /**
     * 查询菜单集合
     */
    public List<SysMenu> selectMenuAll();

    /**
     * 根据用户ID查询权限
     */
    public Set<String> selectPermsByUserId(Long userId);

    /**
     * 根据角色ID查询菜单
     */
    public List<Ztree> roleMenuTreeData(Long roleId);

    /**
     * 查询所有菜单信息
     */
    public List<Ztree> menuTreeData();

    /**
     * 根据菜单ID查询信息
     */
    public SysMenu selectMenuById(Long menuId);

    /**
     * 删除菜单信息
     */
    public int deleteMenuById(Long menuId);

    /**
     * 新增保存菜单信息
     */
    public int insertMenu(SysMenu menu);

    /**
     * 修改保存菜单信息
     */
    public int updateMenu(SysMenu menu);

    /**
     * 校验菜单名称是否唯一
     */
    public String checkMenuNameUnique(SysMenu menu);
}
```

### 构建菜单树

```java
/**
 * 构建前端需要的树结构
 */
public List<Ztree> initZtree(List<SysMenu> menus) {
    List<Ztree> ztrees = new ArrayList<Ztree>();
    boolean isChild = true;
    for (SysMenu menu : menus) {
        Ztree ztree = new Ztree();
        ztree.setId(menu.getMenuId());
        ztree.setpId(menu.getParentId());
        ztree.setName(transMenuName(menu, isChild));
        ztree.setTitle(menu.getMenuName());
        ztree.setChecked(menu.isVisible());
        ztree.setOpen(menu.isOpen());
        ztrees.add(ztree);
    }
    return ztrees;
}

/**
 * 转换菜单名称
 */
public String transMenuName(SysMenu menu, boolean isChild) {
    if (isChild) {
        return menu.getMenuName();
    }
    return menu.getMenuName() + "/" + menu.getPerms();
}

/**
 * 递归构建菜单树
 */
public List<SysMenu> getChildPerms(List<SysMenu> list, int parentId) {
    List<SysMenu> returnList = new ArrayList<SysMenu>();
    for (Iterator<SysMenu> iterator = list.iterator(); iterator.hasNext();) {
        SysMenu t = iterator.next();
        // 根据传入的parentId进行筛选
        if (t.getParentId() == parentId) {
            recursionFn(list, t);
            returnList.add(t);
        }
    }
    return returnList;
}

/**
 * 递归列表
 */
private void recursionFn(List<SysMenu> list, SysMenu t) {
    // 得到子节点列表
    List<SysMenu> childList = getChildList(list, t);
    t.setChildren(childList);
    for (SysMenu tChild : childList) {
        if (hasChild(list, tChild)) {
            // 判断子节点是否有下级
            recursionFn(list, tChild);
        }
    }
}

/**
 * 得到子节点列表
 */
private List<SysMenu> getChildList(List<SysMenu> list, SysMenu t) {
    List<SysMenu> tlist = new ArrayList<SysMenu>();
    Iterator<SysMenu> it = list.iterator();
    while (it.hasNext()) {
        SysMenu n = it.next();
        if (n.getParentId().longValue() == t.getMenuId().longValue()) {
            tlist.add(n);
        }
    }
    return tlist;
}

/**
 * 判断是否有子节点
 */
private boolean hasChild(List<SysMenu> list, SysMenu t) {
    return getChildList(list, t).size() > 0;
}
```

## 数据库表结构

### 角色表

```sql
CREATE TABLE sys_role (
  role_id           BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '角色ID',
  role_name         VARCHAR(30)     NOT NULL                   COMMENT '角色名称',
  role_key          VARCHAR(100)    NOT NULL                   COMMENT '角色权限字符串',
  role_sort         INT(4)          NOT NULL                   COMMENT '显示顺序',
  data_scope        CHAR(1)         DEFAULT '1'                COMMENT '数据范围',
  status            CHAR(1)         NOT NULL                   COMMENT '角色状态（0正常 1停用）',
  del_flag          CHAR(1)         DEFAULT '0'                COMMENT '删除标志',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME                                   COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME                                   COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT NULL               COMMENT '备注',
  PRIMARY KEY (role_id)
) ENGINE=InnoDB AUTO_INCREMENT=100 COMMENT = '角色信息表';
```

### 菜单表

```sql
CREATE TABLE sys_menu (
  menu_id           BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '菜单ID',
  menu_name         VARCHAR(50)     NOT NULL                   COMMENT '菜单名称',
  parent_id         BIGINT(20)      DEFAULT 0                  COMMENT '父菜单ID',
  order_num         INT(4)          DEFAULT 0                  COMMENT '显示顺序',
  url               VARCHAR(200)    DEFAULT '#'                COMMENT '请求地址',
  target            VARCHAR(20)     DEFAULT ''                 COMMENT '打开方式',
  menu_type         CHAR(1)         DEFAULT ''                 COMMENT '菜单类型（M目录 C菜单 F按钮）',
  visible           CHAR(1)         DEFAULT 0                  COMMENT '菜单状态（0显示 1隐藏）',
  is_refresh        CHAR(1)         DEFAULT 1                  COMMENT '是否刷新',
  perms             VARCHAR(100)    DEFAULT NULL               COMMENT '权限标识',
  icon              VARCHAR(100)    DEFAULT '#'                COMMENT '菜单图标',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME                                   COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME                                   COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT ''                 COMMENT '备注',
  PRIMARY KEY (menu_id)
) ENGINE=InnoDB AUTO_INCREMENT=2000 COMMENT = '菜单权限表';
```

### 角色菜单关联表

```sql
CREATE TABLE sys_role_menu (
  role_id           BIGINT(20) NOT NULL COMMENT '角色ID',
  menu_id           BIGINT(20) NOT NULL COMMENT '菜单ID',
  PRIMARY KEY(role_id, menu_id)
) ENGINE=InnoDB COMMENT = '角色和菜单关联表';
```

## 权限标识规范

RuoYi 采用模块化的权限标识命名规范：

```
模块:功能:操作
```

### 示例

| 权限标识 | 说明 |
|:--|:--|
| `system:user:list` | 用户列表查询 |
| `system:user:add` | 用户新增 |
| `system:user:edit` | 用户修改 |
| `system:user:remove` | 用户删除 |
| `system:user:export` | 用户导出 |
| `system:role:list` | 角色列表查询 |
| `system:menu:add` | 菜单新增 |

## 复习卡片

```java
// RBAC 核心关系
// 用户 → 用户角色关联 → 角色 → 角色菜单关联 → 菜单

// 1. 角色分配菜单
List<SysRoleMenu> list = new ArrayList<>();
for (Long menuId : role.getMenuIds()) {
    SysRoleMenu rm = new SysRoleMenu();
    rm.setRoleId(role.getRoleId());
    rm.setMenuId(menuId);
    list.add(rm);
}
roleMenuMapper.batchRoleMenu(list);

// 2. 查询用户角色
Set<SysRole> roles = roleService.selectRolesByUserId(userId);

// 3. 构建菜单树
List<Ztree> ztrees = menuService.roleMenuTreeData(roleId);

// 4. 菜单类型
// M = 目录
// C = 菜单
// F = 按钮

// 5. 数据权限
// 1 = 全部数据
// 2 = 自定义
// 3 = 本部门
// 4 = 本部门及以下
// 5 = 仅本人
```

| 类名 | 职责 |
|:--|:--|
| `SysRole` | 角色实体类 |
| `SysMenu` | 菜单实体类 |
| `SysRoleMenu` | 角色菜单关联 |
| `SysUserRole` | 用户角色关联 |
| `ISysRoleService` | 角色服务接口 |
| `ISysMenuService` | 菜单服务接口 |
| `Ztree` | 树形结构数据 |

> [!TIP]
> 下一步：[阶段七：部门与岗位管理](/blog/posts/ruoyi-roadmap-07-dept-post/)
> 
> 在阶段七中，我们将学习组织架构管理，包括部门树和岗位配置。
