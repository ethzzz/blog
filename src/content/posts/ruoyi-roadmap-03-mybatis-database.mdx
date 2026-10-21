---
title: 'RuoYi 阶段三：MyBatis 与数据库操作'
published: 2026-09-07T13:00:00+08:00
description: '理解 MyBatis 工作原理：Mapper 接口、XML 映射、动态 SQL、分页查询，以及 RuoYi 中的实际应用。'
tags: [Java, MyBatis, RuoYi, 数据库, SQL]
category: RuoYi学习路线
draft: false
---

> [!NOTE]
> 本文是 RuoYi 学习路线的**阶段三**，聚焦 MyBatis 数据库操作。学完本篇你应该能：
> 1. 理解 MyBatis 的 Mapper 接口和 XML 映射
> 2. 掌握动态 SQL 的编写
> 3. 知道 RuoYi 是如何进行分页查询的

## 前端视角：MyBatis 像什么？

| MyBatis | 前端类比 |
|:--|:--|
| Mapper 接口 | API 接口定义 |
| XML 映射文件 | GraphQL Schema / SQL 模板 |
| `#{param}` | 模板字符串 `${param}` |
| 动态 SQL | 条件渲染 `{condition && <Component />}` |
| ResultMap | 数据转换/序列化 |

## MyBatis 核心概念

### 1. Mapper 接口

Mapper 接口定义了数据库操作方法，不需要写实现类：

```java
// src/main/java/com/ruoyi/system/mapper/SysUserMapper.java
package com.ruoyi.system.mapper;

import java.util.List;
import com.ruoyi.system.domain.SysUser;

/**
 * 用户表 数据层
 * 
 * @author ruoyi
 */
public interface SysUserMapper {
    /**
     * 根据条件分页查询用户列表
     */
    public List<SysUser> selectUserList(SysUser user);

    /**
     * 通过用户名查询用户
     */
    public SysUser selectUserByUserName(String userName);

    /**
     * 通过用户ID查询用户
     */
    public SysUser selectUserById(Long userId);

    /**
     * 新增用户信息
     */
    public int insertUser(SysUser user);

    /**
     * 修改用户信息
     */
    public int updateUser(SysUser user);

    /**
     * 删除用户信息
     */
    public int deleteUserById(Long userId);

    /**
     * 批量删除用户信息
     */
    public int deleteUserByIds(String[] userIds);
}
```

### 2. XML 映射文件

XML 文件定义了 SQL 语句和结果映射：

```xml
<!-- src/main/resources/mapper/system/SysUserMapper.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
"http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.ruoyi.system.mapper.SysUserMapper">

    <resultMap type="SysUser" id="SysUserResult">
        <id     property="userId"       column="user_id"      />
        <result property="deptId"       column="dept_id"      />
        <result property="loginName"    column="login_name"   />
        <result property="userName"     column="user_name"    />
        <result property="email"        column="email"        />
        <result property="phonenumber"  column="phonenumber"  />
        <result property="sex"          column="sex"          />
        <result property="avatar"       column="avatar"       />
        <result property="password"     column="password"     />
        <result property="salt"         column="salt"         />
        <result property="status"       column="status"       />
        <result property="delFlag"      column="del_flag"     />
        <result property="loginIp"      column="login_ip"     />
        <result property="loginDate"    column="login_date"   />
        <result property="createBy"     column="create_by"    />
        <result property="createTime"   column="create_time"  />
        <result property="updateBy"     column="update_by"    />
        <result property="updateTime"   column="update_time"  />
        <result property="remark"       column="remark"       />
        <association property="dept"    column="dept_id" javaType="SysDept" resultMap="deptResult" />
        <collection  property="roles"   javaType="java.util.List"           resultMap="RoleResult" />
    </resultMap>

    <resultMap id="deptResult" type="SysDept">
        <id     property="deptId"   column="dept_id"     />
        <result property="parentId" column="parent_id"   />
        <result property="deptName" column="dept_name"   />
        <result property="orderNum" column="order_num"   />
        <result property="leader"   column="leader"      />
        <result property="status"   column="dept_status" />
    </resultMap>

    <resultMap id="RoleResult" type="SysRole">
        <id     property="roleId"       column="role_id"        />
        <result property="roleName"     column="role_name"      />
        <result property="roleKey"      column="role_key"       />
        <result property="roleSort"     column="role_sort"      />
        <result property="dataScope"     column="data_scope"    />
        <result property="status"       column="role_status"    />
    </resultMap>

    <sql id="selectUserVo">
        select u.user_id, u.dept_id, u.login_name, u.user_name, u.email, u.phonenumber, 
               u.sex, u.avatar, u.password, u.salt, u.status, u.del_flag, 
               u.login_ip, u.login_date, u.create_by, u.create_time, u.update_by, 
               u.update_time, u.remark,
               d.dept_id, d.parent_id, d.dept_name, d.order_num, d.leader, d.status as dept_status,
               r.role_id, r.role_name, r.role_key, r.role_sort, r.data_scope, r.status as role_status
        from sys_user u
        left join sys_dept d on u.dept_id = d.dept_id
        left join sys_user_role ur on u.user_id = ur.user_id
        left join sys_role r on r.role_id = ur.role_id
    </sql>

    <select id="selectUserList" parameterType="SysUser" resultMap="SysUserResult">
        <include refid="selectUserVo"/>
        where u.del_flag = '0'
        <if test="loginName != null and loginName != ''">
            AND u.login_name like concat('%', #{loginName}, '%')
        </if>
        <if test="status != null and status != ''">
            AND u.status = #{status}
        </if>
        <if test="phonenumber != null and phonenumber != ''">
            AND u.phonenumber like concat('%', #{phonenumber}, '%')
        </if>
        <if test="beginTime != null and beginTime != ''">
            AND date_format(u.create_time,'%y%m%d') &gt;= date_format(#{beginTime},'%y%m%d')
        </if>
        <if test="endTime != null and endTime != ''">
            AND date_format(u.create_time,'%y%m%d') &lt;= date_format(#{endTime},'%y%m%d')
        </if>
        <if test="deptId != null and deptId != 0">
            AND (u.dept_id = #{deptId} OR u.dept_id IN ( 
                SELECT t.dept_id FROM sys_dept t 
                WHERE find_in_set(#{deptId}, ancestors) 
            ))
        </if>
    </select>

    <select id="selectUserById" parameterType="Long" resultMap="SysUserResult">
        <include refid="selectUserVo"/>
        where u.user_id = #{userId}
    </select>

    <insert id="insertUser" parameterType="SysUser" useGeneratedKeys="true" keyProperty="userId">
        insert into sys_user(
            <if test="userId != null and userId != 0">user_id,</if>
            <if test="deptId != null and deptId != 0">dept_id,</if>
            <if test="loginName != null and loginName != ''">login_name,</if>
            <if test="userName != null and userName != ''">user_name,</if>
            <if test="email != null and email != ''">email,</if>
            <if test="phonenumber != null and phonenumber != ''">phonenumber,</if>
            <if test="sex != null and sex != ''">sex,</if>
            <if test="avatar != null and avatar != ''">avatar,</if>
            <if test="password != null and password != ''">password,</if>
            <if test="salt != null and salt != ''">salt,</if>
            <if test="status != null and status != ''">status,</if>
            <if test="createBy != null and createBy != ''">create_by,</if>
            <if test="remark != null and remark != ''">remark,</if>
            create_time
        )values(
            <if test="userId != null and userId != 0">#{userId},</if>
            <if test="deptId != null and deptId != 0">#{deptId},</if>
            <if test="loginName != null and loginName != ''">#{loginName},</if>
            <if test="userName != null and userName != ''">#{userName},</if>
            <if test="email != null and email != ''">#{email},</if>
            <if test="phonenumber != null and phonenumber != ''">#{phonenumber},</if>
            <if test="sex != null and sex != ''">#{sex},</if>
            <if test="avatar != null and avatar != ''">#{avatar},</if>
            <if test="password != null and password != ''">#{password},</if>
            <if test="salt != null and salt != ''">#{salt},</if>
            <if test="status != null and status != ''">#{status},</if>
            <if test="createBy != null and createBy != ''">#{createBy},</if>
            <if test="remark != null and remark != ''">#{remark},</if>
            sysdate()
        )
    </insert>

    <update id="updateUser" parameterType="SysUser">
        update sys_user
        <set>
            <if test="deptId != null and deptId != 0">dept_id = #{deptId},</if>
            <if test="loginName != null and loginName != ''">login_name = #{loginName},</if>
            <if test="userName != null and userName != ''">user_name = #{userName},</if>
            <if test="email != null and email != ''">email = #{email},</if>
            <if test="phonenumber != null and phonenumber != ''">phonenumber = #{phonenumber},</if>
            <if test="sex != null and sex != ''">sex = #{sex},</if>
            <if test="avatar != null and avatar != ''">avatar = #{avatar},</if>
            <if test="password != null and password != ''">password = #{password},</if>
            <if test="salt != null and salt != ''">salt = #{salt},</if>
            <if test="status != null and status != ''">status = #{status},</if>
            <if test="loginIp != null and loginIp != ''">login_ip = #{loginIp},</if>
            <if test="loginDate != null">login_date = #{loginDate},</if>
            <if test="updateBy != null and updateBy != ''">update_by = #{updateBy},</if>
            <if test="remark != null">remark = #{remark},</if>
            update_time = sysdate()
        </set>
        where user_id = #{userId}
    </update>

    <delete id="deleteUserById" parameterType="Long">
        delete from sys_user where user_id = #{userId}
    </delete>

    <delete id="deleteUserByIds" parameterType="Long">
        update sys_user set del_flag = '2' where user_id in
        <foreach collection="array" item="userId" open="(" separator="," close=")">
            #{userId}
        </foreach>
    </delete>

</mapper>
```

## 动态 SQL

MyBatis 提供了强大的动态 SQL 功能：

### 1. if 条件判断

```xml
<if test="name != null and name != ''">
    AND name = #{name}
</if>
```

### 2. where 标签

自动处理 `WHERE` 和 `AND/OR`：

```xml
<select id="selectUser" resultMap="UserResult">
    SELECT * FROM sys_user
    <where>
        <if test="name != null">
            AND name = #{name}
        </if>
        <if test="status != null">
            AND status = #{status}
        </if>
    </where>
</select>
```

### 3. set 标签

自动处理 `SET` 和逗号：

```xml
<update id="updateUser">
    UPDATE sys_user
    <set>
        <if test="name != null">name = #{name},</if>
        <if test="status != null">status = #{status},</if>
    </set>
    WHERE user_id = #{userId}
</update>
```

### 4. foreach 循环

```xml
<select id="selectUserByIds">
    SELECT * FROM sys_user WHERE user_id IN
    <foreach collection="array" item="id" open="(" separator="," close=")">
        #{id}
    </foreach>
</select>
```

### 5. choose/when/otherwise

类似 Java 的 switch：

```xml
<choose>
    <when test="order == 'asc'">
        ORDER BY create_time ASC
    </when>
    <otherwise>
        ORDER BY create_time DESC
    </otherwise>
</choose>
```

## 分页查询

RuoYi 使用 PageHelper 实现分页：

### 1. 配置 PageHelper

```yaml
# application.yml
pagehelper:
  helperDialect: mysql
  reasonable: true
  supportMethodsArguments: true
  params: count=countSql
```

### 2. Controller 中使用

```java
// BaseController.java
protected void startPage() {
    PageDomain pageDomain = TableSupport.buildPageRequest();
    Integer pageNum = pageDomain.getPageNum();
    Integer pageSize = pageDomain.getPageSize();
    if (StringUtils.isNotNull(pageNum) && StringUtils.isNotNull(pageSize)) {
        String orderBy = SqlUtil.escapeOrderBySql(pageDomain.getOrderBy());
        PageHelper.startPage(pageNum, pageSize, orderBy);
    }
}

// SysUserController.java
@PostMapping("/list")
@ResponseBody
public TableDataInfo list(SysUser user) {
    startPage();  // 开启分页
    List<SysUser> list = userService.selectUserList(user);
    return getDataTable(list);  // 封装分页结果
}
```

### 3. 分页结果封装

```java
// TableDataInfo.java
public class TableDataInfo {
    private long total;        // 总记录数
    private List<?> rows;      // 列表数据
    private int code;          // 状态码
    private String msg;        // 消息

    public TableDataInfo(List<?> list, int total) {
        this.rows = list;
        this.total = total;
    }
}
```

## 事务管理

RuoYi 使用 `@Transactional` 注解管理事务：

```java
@Service
public class SysUserServiceImpl implements ISysUserService {
    
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
        // 如果任何一步失败，整个事务回滚
    }
}
```

## ResultMap 详解

ResultMap 用于映射数据库字段和 Java 对象属性：

```xml
<resultMap type="SysUser" id="SysUserResult">
    <!-- 主键映射 -->
    <id property="userId" column="user_id" />
    
    <!-- 普通字段映射 -->
    <result property="userName" column="user_name" />
    
    <!-- 一对一关联 -->
    <association property="dept" javaType="SysDept" resultMap="deptResult" />
    
    <!-- 一对多关联 -->
    <collection property="roles" javaType="java.util.List" resultMap="RoleResult" />
</resultMap>
```

## RuoYi 中的 MyBatis 配置

```yaml
# application.yml
mybatis:
  # 实体类包路径（自动扫描）
  typeAliasesPackage: com.ruoyi.**.domain
  # Mapper XML 文件位置
  mapperLocations: classpath:mapper/**/*.xml
  # MyBatis 配置文件
  configLocation: classpath:mybatis/mybatis-config.xml
```

```xml
<!-- mybatis-config.xml -->
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
"http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>
    <settings>
        <!-- 开启驼峰命名转换 -->
        <setting name="mapUnderscoreToCamelCase" value="true"/>
        <!-- 开启延迟加载 -->
        <setting name="lazyLoadingEnabled" value="true"/>
        <!-- 设置超时时间 -->
        <setting name="defaultStatementTimeout" value="25000"/>
    </settings>
</configuration>
```

## 复习卡片

```xml
<!-- MyBatis 核心标签记忆 -->
<!-- 查询 -->
<select id="selectUser" resultMap="UserResult">
<!-- 插入 -->
<insert id="insertUser" useGeneratedKeys="true" keyProperty="userId">
<!-- 更新 -->
<update id="updateUser">
<!-- 删除 -->
<delete id="deleteUser">

<!-- 动态 SQL -->
<if test="name != null">AND name = #{name}</if>
<where>...</where>
<set>...</set>
<foreach collection="array" item="id">...</foreach>
<choose><when>...</when><otherwise>...</otherwise></choose>

<!-- 结果映射 -->
<resultMap type="User" id="UserResult">
    <id property="id" column="user_id"/>
    <result property="name" column="user_name"/>
    <association property="dept" javaType="Dept"/>
    <collection property="roles" javaType="List"/>
</resultMap>
```

| 概念 | 说明 |
|:--|:--|
| Mapper 接口 | 定义数据库操作方法 |
| XML 映射 | 编写 SQL 语句 |
| `#{param}` | 预编译参数（防 SQL 注入）|
| `${param}` | 字符串替换（慎用）|
| ResultMap | 字段映射配置 |
| 动态 SQL | 条件拼接 SQL |
| PageHelper | 分页插件 |

> [!TIP]
> 下一步：[阶段四：Shiro 权限框架](/blog/posts/ruoyi-roadmap-04-shiro-security/)
> 
> 在阶段四中，我们将深入理解 Shiro 的认证和授权机制，以及 RuoYi 是如何实现权限控制的。
