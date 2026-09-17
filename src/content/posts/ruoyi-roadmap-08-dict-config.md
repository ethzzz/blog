---
title: 'RuoYi 阶段八：字典与参数管理'
published: 2026-09-07T18:00:00+08:00
description: '学习系统配置管理：字典类型、字典数据、参数配置，理解缓存机制在配置管理中的应用。'
tags: [Java, RuoYi, 字典管理, 参数配置, 缓存]
category: RuoYi学习路线
draft: false
---

> [!NOTE]
> 本文是 RuoYi 学习路线的**阶段八**，聚焦系统配置管理。学完本篇你应该能：
> 1. 理解字典与参数的区别和用途
> 2. 掌握字典缓存的实现机制
> 3. 知道如何在前端使用字典数据

## 前端视角：字典管理像什么？

| RuoYi 字典 | 前端类比 |
|:--|:--|
| `SysDictType` 字典类型 | 枚举类型定义 (enum) |
| `SysDictData` 字典数据 | 枚举值列表 |
| 参数配置 | 系统设置项 |
| 字典缓存 | localStorage / Vuex |
| 字典标签 | Select 下拉选项 |

## 字典 vs 参数

| 特性 | 字典 (Dict) | 参数 (Config) |
|:--|:--|:--|
| 用途 | 枚举值翻译（如性别、状态） | 系统配置项（如密码策略） |
| 结构 | 一对多（类型 → 数据列表） | 键值对 |
| 示例 | sys_user_sex → [男, 女, 未知] | sys.account.registerUser → true |
| 前端使用 | 下拉框、标签翻译 | 系统设置页面 |

## 字典类型实体类

```java
// src/main/java/com/ruoyi/system/domain/SysDictType.java
package com.ruoyi.system.domain;

import javax.validation.constraints.*;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.annotation.Excel.ColumnType;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 字典类型表 sys_dict_type
 * 
 * @author ruoyi
 */
public class SysDictType extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /** 字典主键 */
    @Excel(name = "字典主键", cellType = ColumnType.NUMERIC)
    private Long dictId;

    /** 字典名称 */
    @Excel(name = "字典名称")
    private String dictName;

    /** 字典类型 */
    @Excel(name = "字典类型")
    private String dictType;

    /** 状态（0正常 1停用） */
    @Excel(name = "状态", readConverterExp = "0=正常,1=停用")
    private String status;

    public Long getDictId() {
        return dictId;
    }

    public void setDictId(Long dictId) {
        this.dictId = dictId;
    }

    @NotBlank(message = "字典名称不能为空")
    @Size(min = 0, max = 100, message = "字典类型名称长度不能超过100个字符")
    public String getDictName() {
        return dictName;
    }

    public void setDictName(String dictName) {
        this.dictName = dictName;
    }

    @NotBlank(message = "字典类型不能为空")
    @Size(min = 0, max = 100, message = "字典类型长度不能超过100个字符")
    public String getDictType() {
        return dictType;
    }

    public void setDictType(String dictType) {
        this.dictType = StringUtils.isEmpty(dictType) ? "" : dictType.trim();
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("dictId", getDictId())
            .append("dictName", getDictName())
            .append("dictType", getDictType())
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

## 字典数据实体类

```java
// src/main/java/com/ruoyi/system/domain/SysDictData.java
package com.ruoyi.system.domain;

import javax.validation.constraints.*;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.annotation.Excel.ColumnType;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 字典数据表 sys_dict_data
 * 
 * @author ruoyi
 */
public class SysDictData extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /** 字典编码 */
    @Excel(name = "字典编码", cellType = ColumnType.NUMERIC)
    private Long dictCode;

    /** 字典排序 */
    @Excel(name = "字典排序", cellType = ColumnType.NUMERIC)
    private Long dictSort;

    /** 字典标签 */
    @Excel(name = "字典标签")
    private String dictLabel;

    /** 字典键值 */
    @Excel(name = "字典键值")
    private String dictValue;

    /** 字典类型 */
    @Excel(name = "字典类型")
    private String dictType;

    /** 样式属性（其他样式扩展） */
    private String cssClass;

    /** 表格字典样式 */
    private String listClass;

    /** 是否默认（Y是 N否） */
    @Excel(name = "是否默认", readConverterExp = "Y=是,N=否")
    private String isDefault;

    /** 状态（0正常 1停用） */
    @Excel(name = "状态", readConverterExp = "0=正常,1=停用")
    private String status;

    public Long getDictCode() {
        return dictCode;
    }

    public void setDictCode(Long dictCode) {
        this.dictCode = dictCode;
    }

    public Long getDictSort() {
        return dictSort;
    }

    public void setDictSort(Long dictSort) {
        this.dictSort = dictSort;
    }

    @NotBlank(message = "字典标签不能为空")
    @Size(min = 0, max = 100, message = "字典标签长度不能超过100个字符")
    public String getDictLabel() {
        return dictLabel;
    }

    public void setDictLabel(String dictLabel) {
        this.dictLabel = dictLabel;
    }

    @NotBlank(message = "字典键值不能为空")
    @Size(min = 0, max = 100, message = "字典键值长度不能超过100个字符")
    public String getDictValue() {
        return dictValue;
    }

    public void setDictValue(String dictValue) {
        this.dictValue = dictValue;
    }

    @NotBlank(message = "字典类型不能为空")
    @Size(min = 0, max = 100, message = "字典类型长度不能超过100个字符")
    public String getDictType() {
        return dictType;
    }

    public void setDictType(String dictType) {
        this.dictType = dictType;
    }

    @Size(min = 0, max = 100, message = "样式属性长度不能超过100个字符")
    public String getCssClass() {
        return cssClass;
    }

    public void setCssClass(String cssClass) {
        this.cssClass = cssClass;
    }

    public String getListClass() {
        return listClass;
    }

    public void setListClass(String listClass) {
        this.listClass = listClass;
    }

    public String getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(String isDefault) {
        this.isDefault = isDefault;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("dictCode", getDictCode())
            .append("dictSort", getDictSort())
            .append("dictLabel", getDictLabel())
            .append("dictValue", getDictValue())
            .append("dictType", getDictType())
            .append("cssClass", getCssClass())
            .append("listClass", getListClass())
            .append("isDefault", getIsDefault())
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

## 参数配置实体类

```java
// src/main/java/com/ruoyi/system/domain/SysConfig.java
package com.ruoyi.system.domain;

import javax.validation.constraints.*;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.annotation.Excel.ColumnType;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 参数配置表 sys_config
 * 
 * @author ruoyi
 */
public class SysConfig extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /** 参数主键 */
    @Excel(name = "参数主键", cellType = ColumnType.NUMERIC)
    private Long configId;

    /** 参数名称 */
    @Excel(name = "参数名称")
    private String configName;

    /** 参数键名 */
    @Excel(name = "参数键名")
    private String configKey;

    /** 参数键值 */
    @Excel(name = "参数键值")
    private String configValue;

    /** 系统内置（Y是 N否） */
    @Excel(name = "系统内置", readConverterExp = "Y=是,N=否")
    private String configType;

    public Long getConfigId() {
        return configId;
    }

    public void setConfigId(Long configId) {
        this.configId = configId;
    }

    @NotBlank(message = "参数名称不能为空")
    @Size(min = 0, max = 100, message = "参数名称不能超过100个字符")
    public String getConfigName() {
        return configName;
    }

    public void setConfigName(String configName) {
        this.configName = configName;
    }

    @NotBlank(message = "参数键名不能为空")
    @Size(min = 0, max = 100, message = "参数键名长度不能超过100个字符")
    public String getConfigKey() {
        return configKey;
    }

    public void setConfigKey(String configKey) {
        this.configKey = configKey;
    }

    @NotBlank(message = "参数键值不能为空")
    @Size(min = 0, max = 500, message = "参数键值长度不能超过500个字符")
    public String getConfigValue() {
        return configValue;
    }

    public void setConfigValue(String configValue) {
        this.configValue = configValue;
    }

    public String getConfigType() {
        return configType;
    }

    public void setConfigType(String configType) {
        this.configType = configType;
    }

    @Override
    public String toString() {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
            .append("configId", getConfigId())
            .append("configName", getConfigName())
            .append("configKey", getConfigKey())
            .append("configValue", getConfigValue())
            .append("configType", getConfigType())
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

### 字典类型表

```sql
CREATE TABLE sys_dict_type (
  dict_id           BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '字典主键',
  dict_name         VARCHAR(100)    DEFAULT ''                 COMMENT '字典名称',
  dict_type         VARCHAR(100)    DEFAULT ''                 COMMENT '字典类型',
  status            CHAR(1)         DEFAULT '0'                COMMENT '状态（0正常 1停用）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME                                   COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME                                   COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT NULL               COMMENT '备注',
  PRIMARY KEY (dict_id),
  UNIQUE (dict_type)
) ENGINE=InnoDB AUTO_INCREMENT=100 COMMENT = '字典类型表';
```

### 字典数据表

```sql
CREATE TABLE sys_dict_data (
  dict_code         BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '字典编码',
  dict_sort         INT(4)          DEFAULT 0                  COMMENT '字典排序',
  dict_label        VARCHAR(100)    DEFAULT ''                 COMMENT '字典标签',
  dict_value        VARCHAR(100)    DEFAULT ''                 COMMENT '字典键值',
  dict_type         VARCHAR(100)    DEFAULT ''                 COMMENT '字典类型',
  css_class         VARCHAR(100)    DEFAULT NULL               COMMENT '样式属性',
  list_class        VARCHAR(100)    DEFAULT NULL               COMMENT '表格回显样式',
  is_default        CHAR(1)         DEFAULT 'N'                COMMENT '是否默认（Y是 N否）',
  status            CHAR(1)         DEFAULT '0'                COMMENT '状态（0正常 1停用）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME                                   COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME                                   COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT NULL               COMMENT '备注',
  PRIMARY KEY (dict_code)
) ENGINE=InnoDB AUTO_INCREMENT=100 COMMENT = '字典数据表';
```

### 参数配置表

```sql
CREATE TABLE sys_config (
  config_id         BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '参数主键',
  config_name       VARCHAR(100)    DEFAULT ''                 COMMENT '参数名称',
  config_key        VARCHAR(100)    DEFAULT ''                 COMMENT '参数键名',
  config_value      VARCHAR(500)    DEFAULT ''                 COMMENT '参数键值',
  config_type       CHAR(1)         DEFAULT 'N'                COMMENT '系统内置（Y是 N否）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME                                   COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME                                   COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT NULL               COMMENT '备注',
  PRIMARY KEY (config_id)
) ENGINE=InnoDB AUTO_INCREMENT=100 COMMENT = '参数配置表';
```

## 字典缓存机制

RuoYi 使用 Redis 缓存字典数据，提高查询性能：

### 字典 Service 实现

```java
// src/main/java/com/ruoyi/system/service/impl/SysDictTypeServiceImpl.java
package com.ruoyi.system.service.impl;

import java.util.List;
import javax.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ruoyi.common.constant.UserConstants;
import com.ruoyi.common.core.domain.entity.SysDictData;
import com.ruoyi.common.core.text.Convert;
import com.ruoyi.common.exception.ServiceException;
import com.ruoyi.common.utils.DictUtils;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.system.domain.SysDictType;
import com.ruoyi.system.mapper.SysDictDataMapper;
import com.ruoyi.system.mapper.SysDictTypeMapper;
import com.ruoyi.system.service.ISysDictTypeService;

/**
 * 字典 业务层处理
 * 
 * @author ruoyi
 */
@Service
public class SysDictTypeServiceImpl implements ISysDictTypeService {
    @Autowired
    private SysDictTypeMapper dictTypeMapper;

    @Autowired
    private SysDictDataMapper dictDataMapper;

    /**
     * 项目启动时，初始化字典 主要是防止手动修改数据库导致未同步到定时任务处理
     */
    @PostConstruct
    public void init() {
        loadingDictCache();
    }

    /**
     * 加载字典缓存
     */
    public void loadingDictCache() {
        List<SysDictType> dictTypeList = dictTypeMapper.selectDictTypeAll();
        for (SysDictType dictType : dictTypeList) {
            List<SysDictData> dictDatas = dictDataMapper.selectDictDataByType(dictType.getDictType());
            DictUtils.setDictCache(dictType.getDictType(), dictDatas);
        }
    }

    /**
     * 清空字典缓存
     */
    public void clearDictCache() {
        DictUtils.clearDictCache();
    }

    /**
     * 根据字典类型查询字典数据
     */
    @Override
    public List<SysDictData> selectDictDataByType(String dictType) {
        List<SysDictData> dictDatas = DictUtils.getDictCache(dictType);
        if (StringUtils.isNull(dictDatas)) {
            dictDatas = dictDataMapper.selectDictDataByType(dictType);
            DictUtils.setDictCache(dictType, dictDatas);
        }
        return dictDatas;
    }

    /**
     * 新增保存字典类型信息
     */
    @Override
    public int insertDictType(SysDictType dictType) {
        int row = dictTypeMapper.insertDictType(dictType);
        if (row > 0) {
            DictUtils.setDictCache(dictType.getDictType(), null);
        }
        return row;
    }

    /**
     * 修改保存字典类型信息
     */
    @Override
    @Transactional
    public int updateDictType(SysDictType dictType) {
        SysDictType oldDict = dictTypeMapper.selectDictTypeById(dictType.getDictId());
        List<SysDictData> dictDatas = dictDataMapper.selectDictDataByType(oldDict.getDictType());
        // 删除旧字典缓存
        DictUtils.removeDictCache(oldDict.getDictType());
        // 更新字典类型
        int row = dictTypeMapper.updateDictType(dictType);
        if (row > 0) {
            // 更新字典数据中的字典类型
            for (SysDictData dictData : dictDatas) {
                dictData.setDictType(dictType.getDictType());
            }
            dictDataMapper.updateDictDataType(dictDatas);
            // 设置新字典缓存
            DictUtils.setDictCache(dictType.getDictType(), dictDatas);
        }
        return row;
    }

    /**
     * 批量删除字典类型信息
     */
    @Override
    public int deleteDictTypeByIds(String ids) {
        Long[] dictIds = Convert.toLongArray(ids);
        for (Long dictId : dictIds) {
            SysDictType dictType = selectDictTypeById(dictId);
            if (dictDataMapper.countDictDataByType(dictType.getDictType()) > 0) {
                throw new ServiceException(String.format("%1$s已分配,不能删除", dictType.getDictName()));
            }
            // 清空字典缓存
            DictUtils.removeDictCache(dictType.getDictType());
        }
        return dictTypeMapper.deleteDictTypeByIds(dictIds);
    }

    /**
     * 校验字典类型称是否唯一
     */
    @Override
    public String checkDictTypeUnique(SysDictType dictType) {
        Long dictId = StringUtils.isNull(dictType.getDictId()) ? -1L : dictType.getDictId();
        SysDictType dictTypeUnique = dictTypeMapper.checkDictTypeUnique(dictType.getDictType());
        if (StringUtils.isNotNull(dictTypeUnique) && dictTypeUnique.getDictId().longValue() != dictId.longValue()) {
            return UserConstants.NOT_UNIQUE;
        }
        return UserConstants.UNIQUE;
    }
}
```

### 字典工具类

```java
// src/main/java/com/ruoyi/common/utils/DictUtils.java
package com.ruoyi.common.utils;

import java.util.List;
import com.ruoyi.common.constant.Constants;
import com.ruoyi.common.core.domain.entity.SysDictData;
import com.ruoyi.common.utils.spring.SpringUtils;
import com.ruoyi.system.service.ISysDictDataService;

/**
 * 字典工具类
 * 
 * @author ruoyi
 */
public class DictUtils {
    /**
     * 设置字典缓存
     */
    public static void setDictCache(String key, List<SysDictData> dictDatas) {
        SpringUtils.getBean(RedisCache.class).setCacheObject(getCacheKey(key), dictDatas);
    }

    /**
     * 获取字典缓存
     */
    public static List<SysDictData> getDictCache(String key) {
        Object cacheObj = SpringUtils.getBean(RedisCache.class).getCacheObject(getCacheKey(key));
        if (StringUtils.isNotNull(cacheObj)) {
            return (List<SysDictData>) cacheObj;
        }
        return null;
    }

    /**
     * 删除字典缓存
     */
    public static void removeDictCache(String key) {
        SpringUtils.getBean(RedisCache.class).deleteObject(getCacheKey(key));
    }

    /**
     * 清空字典缓存
     */
    public static void clearDictCache() {
        SpringUtils.getBean(RedisCache.class).deleteKeys(Constants.SYS_DICT_KEY + "*");
    }

    /**
     * 获取cache key
     */
    public static String getCacheKey(String key) {
        return Constants.SYS_DICT_KEY + key;
    }
}
```

## 参数配置 Service

```java
// src/main/java/com/ruoyi/system/service/impl/SysConfigServiceImpl.java
package com.ruoyi.system.service.impl;

import java.util.List;
import javax.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ruoyi.common.constant.UserConstants;
import com.ruoyi.common.core.text.Convert;
import com.ruoyi.common.exception.ServiceException;
import com.ruoyi.common.utils.CacheUtils;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.system.domain.SysConfig;
import com.ruoyi.system.mapper.SysConfigMapper;
import com.ruoyi.system.service.ISysConfigService;

/**
 * 参数配置 服务层实现
 * 
 * @author ruoyi
 */
@Service
public class SysConfigServiceImpl implements ISysConfigService {
    @Autowired
    private SysConfigMapper configMapper;

    /**
     * 项目启动时，初始化参数 主要是防止手动修改数据库导致未同步到定时任务处理
     */
    @PostConstruct
    public void init() {
        loadingConfigCache();
    }

    /**
     * 加载参数缓存数据
     */
    public void loadingConfigCache() {
        List<SysConfig> configsList = configMapper.selectConfigList(new SysConfig());
        for (SysConfig config : configsList) {
            CacheUtils.put(getCacheName(), config.getConfigKey(), config.getConfigValue());
        }
    }

    /**
     * 清空参数缓存数据
     */
    public void clearConfigCache() {
        CacheUtils.clear(getCacheName());
    }

    /**
     * 查询参数配置信息
     */
    @Override
    public SysConfig selectConfigById(Long configId) {
        SysConfig config = new SysConfig();
        config.setConfigId(configId);
        return configMapper.selectConfig(config);
    }

    /**
     * 根据键名查询参数配置信息
     */
    @Override
    public String selectConfigByKey(String configKey) {
        String configValue = Convert.toStr(CacheUtils.get(getCacheName(), configKey));
        if (StringUtils.isNotEmpty(configValue)) {
            return configValue;
        }
        SysConfig config = new SysConfig();
        config.setConfigKey(configKey);
        SysConfig retConfig = configMapper.selectConfig(config);
        if (StringUtils.isNotNull(retConfig)) {
            CacheUtils.put(getCacheName(), configKey, retConfig.getConfigValue());
            return retConfig.getConfigValue();
        }
        return StringUtils.EMPTY;
    }

    /**
     * 新增参数配置
     */
    @Override
    public int insertConfig(SysConfig config) {
        int row = configMapper.insertConfig(config);
        if (row > 0) {
            CacheUtils.put(getCacheName(), config.getConfigKey(), config.getConfigValue());
        }
        return row;
    }

    /**
     * 修改参数配置
     */
    @Override
    public int updateConfig(SysConfig config) {
        int row = configMapper.updateConfig(config);
        if (row > 0) {
            CacheUtils.put(getCacheName(), config.getConfigKey(), config.getConfigValue());
        }
        return row;
    }

    /**
     * 批量删除参数配置信息
     */
    @Override
    public int deleteConfigByIds(String ids) {
        Long[] configIds = Convert.toLongArray(ids);
        for (Long configId : configIds) {
            SysConfig config = selectConfigById(configId);
            if (UserConstants.YES.equals(config.getConfigType())) {
                throw new ServiceException("内置参数【" + config.getConfigName() + "】不能删除 ");
            }
            configMapper.deleteConfigById(configId);
            CacheUtils.remove(getCacheName(), config.getConfigKey());
        }
        return configIds.length;
    }

    /**
     * 获取cache name
     */
    @Override
    public String getCacheName() {
        return UserConstants.SYS_CONFIG_KEY;
    }
}
```

## 前端使用字典

### 方式一：Thymeleaf 模板

```html
<!-- 使用字典标签翻译 -->
<span th:text="${@dict.getLabel('sys_user_sex', user.sex)}">未知</span>

<!-- 使用字典数据构建下拉框 -->
<select th:field="*{sex}">
    <option th:each="dict : ${@dict.getType('sys_user_sex')}" 
            th:value="${dict.dictValue}" 
            th:text="${dict.dictLabel}"></option>
</select>
```

### 方式二：JavaScript

```javascript
// 获取字典数据
$.getDict("sys_user_sex", function(data) {
    // data 是字典数据列表
    $.each(data, function(i, dict) {
        $("#sexSelect").append(
            '<option value="' + dict.dictValue + '">' + dict.dictLabel + '</option>'
        );
    });
});

// 翻译字典值
var sexLabel = $.getDictLabel("sys_user_sex", "0");  // 返回 "男"
```

## 常用字典类型

| 字典类型 | 说明 | 示例值 |
|:--|:--|:--|
| `sys_user_sex` | 用户性别 | 0=男, 1=女, 2=未知 |
| `sys_normal_disable` | 系统开关 | 0=正常, 1=停用 |
| `sys_show_hide` | 显示状态 | 0=显示, 1=隐藏 |
| `sys_yes_no` | 是否 | Y=是, N=否 |
| `sys_job_status` | 任务状态 | 0=正常, 1=暂停 |
| `sys_job_group` | 任务分组 | DEFAULT=默认, SYSTEM=系统 |
| `sys_oper_type` | 操作类型 | 0=其它, 1=新增, 2=修改, 3=删除 |
| `sys_common_status` | 登录状态 | 0=成功, 1=失败 |

## 复习卡片

```java
// 字典管理核心流程
// 1. 初始化加载字典缓存
@PostConstruct
public void init() {
    loadingDictCache();
}

// 2. 查询字典数据（优先从缓存获取）
List<SysDictData> dictDatas = DictUtils.getDictCache(dictType);
if (StringUtils.isNull(dictDatas)) {
    dictDatas = dictDataMapper.selectDictDataByType(dictType);
    DictUtils.setDictCache(dictType, dictDatas);
}

// 3. 参数配置缓存
CacheUtils.put(getCacheName(), configKey, configValue);
String value = CacheUtils.get(getCacheName(), configKey);

// 4. 前端使用字典
${@dict.getLabel('sys_user_sex', user.sex)}
${@dict.getType('sys_user_sex')}
```

| 类名 | 职责 |
|:--|:--|
| `SysDictType` | 字典类型实体 |
| `SysDictData` | 字典数据实体 |
| `SysConfig` | 参数配置实体 |
| `DictUtils` | 字典缓存工具类 |
| `CacheUtils` | 通用缓存工具类 |
| `ISysDictTypeService` | 字典类型服务 |
| `ISysConfigService` | 参数配置服务 |

| 缓存策略 | 说明 |
|:--|:--|
| 启动加载 | @PostConstruct 初始化时加载 |
| 查询缓存 | 优先从缓存获取，未命中则查询数据库 |
| 更新缓存 | 新增/修改/删除时同步更新缓存 |
| 清空缓存 | 可手动刷新字典缓存 |

> [!TIP]
> 下一步：[阶段九：日志管理](/blog/posts/ruoyi-roadmap-09-log-management/)
> 
> 在阶段九中，我们将学习操作日志和登录日志的实现，包括 AOP 切面编程的应用。
