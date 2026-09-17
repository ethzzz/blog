---
title: 'RuoYi 阶段十一：代码生成器'
published: 2026-09-07T21:00:00+08:00
description: '学习代码生成器的实现，掌握 Velocity 模板引擎、表结构解析和自动化代码生成。'
tags: [Java, RuoYi, 代码生成器, Velocity, 模板引擎]
category: RuoYi学习路线
draft: false
---

> [!NOTE]
> 本文是 RuoYi 学习路线的**阶段十一**，聚焦代码生成器。学完本篇你应该能：
> 1. 理解代码生成器的工作原理
> 2. 掌握 Velocity 模板引擎的使用
> 3. 知道如何自定义代码模板

## 前端视角：代码生成器像什么？

| RuoYi 代码生成器 | 前端类比 |
|:--|:--|
| Velocity 模板 | Handlebars / EJS 模板引擎 |
| 表结构解析 | Schema 解析 |
| 代码生成 | 脚手架工具 (create-react-app) |
| 模板配置 | 代码片段 (Snippets) |
| 批量生成 | 代码模板批量应用 |

## 代码生成器架构

```
┌─────────────────┐
│   数据库表      │
└────────┬────────┘
         │ 解析
         ▼
┌─────────────────┐
│   GenTable      │
│   GenTableColumn│
└────────┬────────┘
         │ 配置
         ▼
┌─────────────────┐
│  Velocity 模板  │
│  (vm 文件)      │
└────────┬────────┘
         │ 渲染
         ▼
┌─────────────────┐
│  生成的代码     │
│  Domain/Mapper/ │
│  Service/Controller│
└─────────────────┘
```

## 生成表实体类

```java
// src/main/java/com/ruoyi/generator/domain/GenTable.java
package com.ruoyi.generator.domain;

import java.util.List;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import org.apache.commons.lang3.ArrayUtils;
import com.ruoyi.common.constant.GenConstants;
import com.ruoyi.common.core.domain.BaseEntity;
import com.ruoyi.common.utils.StringUtils;

/**
 * 业务表 gen_table
 * 
 * @author ruoyi
 */
public class GenTable extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /** 编号 */
    private Long tableId;

    /** 表名称 */
    @NotBlank(message = "表名称不能为空")
    private String tableName;

    /** 表描述 */
    @NotBlank(message = "表描述不能为空")
    private String tableComment;

    /** 关联父表的表名 */
    private String subTableName;

    /** 本表与关联父表的外键名 */
    private String subTableFkName;

    /** 实体类名称(首字母大写) */
    @NotBlank(message = "实体类名称不能为空")
    private String className;

    /** 使用的模板（crud单表操作 tree树表操作 sub主子表操作） */
    private String tplCategory;

    /** 生成包路径 */
    @NotBlank(message = "生成包路径不能为空")
    private String packageName;

    /** 生成模块名 */
    @NotBlank(message = "生成模块名不能为空")
    private String moduleName;

    /** 生成业务名 */
    @NotBlank(message = "生成业务名不能为空")
    private String businessName;

    /** 生成功能名 */
    @NotBlank(message = "生成功能名不能为空")
    private String functionName;

    /** 生成作者 */
    @NotBlank(message = "作者不能为空")
    private String functionAuthor;

    /** 生成代码方式（0zip压缩包 1自定义路径） */
    private String genType;

    /** 生成路径（不填默认项目路径） */
    private String genPath;

    /** 主键信息 */
    private GenTableColumn pkColumn;

    /** 子表信息 */
    private GenTable subTable;

    /** 表列信息 */
    @Valid
    private List<GenTableColumn> columns;

    /** 其它生成选项 */
    private String options;

    /** 树编码字段 */
    private String treeCode;

    /** 树父编码字段 */
    private String treeParentCode;

    /** 树名称字段 */
    private String treeName;

    /** 上级菜单ID字段 */
    private String parentMenuId;

    /** 上级菜单名称字段 */
    private String parentMenuName;

    // Getter 和 Setter 省略...

    public boolean isSub() {
        return isSub(this.tplCategory);
    }

    public static boolean isSub(String tplCategory) {
        return tplCategory != null && StringUtils.equals(GenConstants.TPL_SUB, tplCategory);
    }

    public boolean isTree() {
        return isTree(this.tplCategory);
    }

    public static boolean isTree(String tplCategory) {
        return tplCategory != null && StringUtils.equals(GenConstants.TPL_TREE, tplCategory);
    }

    public boolean isCrud() {
        return isCrud(this.tplCategory);
    }

    public static boolean isCrud(String tplCategory) {
        return tplCategory != null && StringUtils.equals(GenConstants.TPL_CRUD, tplCategory);
    }

    public String getPermissionPrefix() {
        return getModuleName() + ":" + getBusinessName();
    }
}
```

## 生成列实体类

```java
// src/main/java/com/ruoyi/generator/domain/GenTableColumn.java
package com.ruoyi.generator.domain;

import javax.validation.constraints.NotBlank;
import com.ruoyi.common.core.domain.BaseEntity;
import com.ruoyi.common.utils.StringUtils;

/**
 * 代码生成业务字段表 gen_table_column
 * 
 * @author ruoyi
 */
public class GenTableColumn extends BaseEntity {
    private static final long serialVersionUID = 1L;

    /** 编号 */
    private Long columnId;

    /** 归属表编号 */
    private Long tableId;

    /** 列名称 */
    private String columnName;

    /** 列描述 */
    private String columnComment;

    /** 列类型 */
    private String columnType;

    /** JAVA类型 */
    private String javaType;

    /** JAVA字段名 */
    @NotBlank(message = "Java属性不能为空")
    private String javaField;

    /** 是否主键（1是） */
    private String isPk;

    /** 是否自增（1是） */
    private String isIncrement;

    /** 是否必填（1是） */
    private String isRequired;

    /** 是否为插入字段（1是） */
    private String isInsert;

    /** 是否编辑字段（1是） */
    private String isEdit;

    /** 是否列表字段（1是） */
    private String isList;

    /** 是否查询字段（1是） */
    private String isQuery;

    /** 查询方式（EQ等于、NE不等于、GT大于、LT小于、LIKE模糊、BETWEEN范围） */
    private String queryType;

    /** 显示类型（input文本框、textarea文本域、select下拉框、checkbox复选框、radio单选框、datetime日期控件、upload上传控件、editor富文本控件） */
    private String htmlType;

    /** 字典类型 */
    private String dictType;

    /** 排序 */
    private Integer sort;

    // Getter 和 Setter 省略...

    public boolean isPk() {
        return isPk(this.isPk);
    }

    public boolean isPk(String isPk) {
        return isPk != null && StringUtils.equals("1", isPk);
    }

    public boolean isIncrement() {
        return isIncrement(this.isIncrement);
    }

    public boolean isIncrement(String isIncrement) {
        return isIncrement != null && StringUtils.equals("1", isIncrement);
    }

    public boolean isRequired() {
        return isRequired(this.isRequired);
    }

    public boolean isRequired(String isRequired) {
        return isRequired != null && StringUtils.equals("1", isRequired);
    }

    public boolean isInsert() {
        return isInsert(this.isInsert);
    }

    public boolean isInsert(String isInsert) {
        return isInsert != null && StringUtils.equals("1", isInsert);
    }

    public boolean isEdit() {
        return isEdit(this.isEdit);
    }

    public boolean isEdit(String isEdit) {
        return isEdit != null && StringUtils.equals("1", isEdit);
    }

    public boolean isList() {
        return isList(this.isList);
    }

    public boolean isList(String isList) {
        return isList != null && StringUtils.equals("1", isList);
    }

    public boolean isQuery() {
        return isQuery(this.isQuery);
    }

    public boolean isQuery(String isQuery) {
        return isQuery != null && StringUtils.equals("1", isQuery);
    }

    public boolean isSuperColumn() {
        return isSuperColumn(this.javaField);
    }

    public static boolean isSuperColumn(String javaField) {
        return StringUtils.equalsAnyIgnoreCase(javaField,
                // BaseEntity
                "createBy", "createTime", "updateBy", "updateTime", "remark",
                // TreeEntity
                "parentName", "parentId", "orderNum", "ancestors");
    }

    public boolean isUsableColumn() {
        return isUsableColumn(javaField);
    }

    public static boolean isUsableColumn(String javaField) {
        // isSuperColumn()中的名单用于避免生成多余Domain属性，若下列属性在BaseEntity/TreeEntity中已存在，
        // 则不需要在此处重复生成，因此排除
        return StringUtils.equalsAnyIgnoreCase(javaField, "parentId", "orderNum", "remark");
    }

    public String readConverterExp() {
        String remarks = StringUtils.substringBetween(this.columnComment, "（", "）");
        StringBuffer sb = new StringBuffer();
        if (StringUtils.isNotEmpty(remarks)) {
            for (String value : remarks.split(" ")) {
                if (StringUtils.isNotEmpty(value)) {
                    Object startStr = value.subSequence(0, 1);
                    String endStr = value.substring(1);
                    sb.append("").append(startStr).append("=").append(endStr).append(",");
                }
            }
            return sb.deleteCharAt(sb.length() - 1).toString();
        } else {
            return this.columnComment;
        }
    }
}
```

## Velocity 模板引擎

### 模板配置

```java
// src/main/java/com/ruoyi/generator/config/GenConfig.java
package com.ruoyi.generator.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Component;

/**
 * 读取代码生成相关配置
 * 
 * @author ruoyi
 */
@Component
@ConfigurationProperties(prefix = "gen")
@PropertySource(value = { "classpath:generator.yml" })
public class GenConfig {
    /** 作者 */
    public static String author;

    /** 生成包路径 */
    public static String packageName;

    /** 自动去除表前缀，默认是true */
    public static boolean autoRemovePre;

    /** 表前缀(类名不会包含表前缀) */
    public static String tablePrefix;

    /** 是否允许生成文件覆盖到本地（自定义路径），默认是false */
    public static boolean allowOverwrite;

    public static String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        GenConfig.author = author;
    }

    public static String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        GenConfig.packageName = packageName;
    }

    public static boolean getAutoRemovePre() {
        return autoRemovePre;
    }

    public void setAutoRemovePre(boolean autoRemovePre) {
        GenConfig.autoRemovePre = autoRemovePre;
    }

    public static String getTablePrefix() {
        return tablePrefix;
    }

    public void setTablePrefix(String tablePrefix) {
        GenConfig.tablePrefix = tablePrefix;
    }

    public static boolean isAllowOverwrite() {
        return allowOverwrite;
    }

    public void setAllowOverwrite(boolean allowOverwrite) {
        GenConfig.allowOverwrite = allowOverwrite;
    }
}
```

### generator.yml 配置

```yaml
# generator.yml
gen:
  # 作者
  author: ruoyi
  # 默认生成包路径 system 需改成自己的模块名称 如 system monitor tool
  packageName: com.ruoyi.system
  # 自动去除表前缀，默认是true
  autoRemovePre: true
  # 表前缀(类名不会包含表前缀)
  tablePrefix: sys_
  # 是否允许生成文件覆盖到本地（自定义路径），默认是false
  allowOverwrite: false
```

## 模板文件

RuoYi 的代码模板位于 `src/main/resources/vm` 目录：

```
vm/
├── java/
│   ├── controller.java.vm      # Controller 模板
│   ├── domain.java.vm          # Domain 实体模板
│   ├── mapper.java.vm          # Mapper 接口模板
│   └── service.java.vm         # Service 接口模板
│   └── serviceImpl.java.vm     # Service 实现模板
├── xml/
│   └── mapper.xml.vm           # Mapper XML 模板
├── html/
│   ├── add.html.vm             # 新增页面模板
│   ├── edit.html.vm            # 编辑页面模板
│   └── list.html.vm            # 列表页面模板
└── sql/
    └── menu.sql.vm             # 菜单 SQL 模板
```

### Controller 模板示例

```velocity
## src/main/resources/vm/java/controller.java.vm
package ${packageName}.controller;

import java.util.List;
import javax.servlet.http.HttpServletResponse;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.*;
import com.ruoyi.common.annotation.Log;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.common.enums.BusinessType;
import com.ruoyi.common.utils.poi.ExcelUtil;
import ${packageName}.domain.${ClassName};
import ${packageName}.service.I${ClassName}Service;

/**
 * ${functionName}Controller
 * 
 * @author ${author}
 * @date ${datetime}
 */
@Controller
@RequestMapping("/${moduleName}/${businessName}")
public class ${ClassName}Controller extends BaseController {
    private String prefix = "${moduleName}/${businessName}";

    @Autowired
    private I${ClassName}Service ${className}Service;

    @RequiresPermissions("${permissionPrefix}:view")
    @GetMapping()
    public String ${businessName}() {
        return prefix + "/${businessName}";
    }

    /**
     * 查询${functionName}列表
     */
    @RequiresPermissions("${permissionPrefix}:list")
    @PostMapping("/list")
    @ResponseBody
    public TableDataInfo list(${ClassName} ${className}) {
        startPage();
        List<${ClassName}> list = ${className}Service.select${ClassName}List(${className});
        return getDataTable(list);
    }

    /**
     * 导出${functionName}列表
     */
    @RequiresPermissions("${permissionPrefix}:export")
    @Log(title = "${functionName}", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    @ResponseBody
    public AjaxResult export(HttpServletResponse response, ${ClassName} ${className}) {
        List<${ClassName}> list = ${className}Service.select${ClassName}List(${className});
        ExcelUtil<${ClassName}> util = new ExcelUtil<${ClassName}>(${ClassName}.class);
        return util.exportExcel(response, list, "${functionName}数据");
    }

    /**
     * 新增${functionName}
     */
    @GetMapping("/add")
    public String add() {
        return prefix + "/add";
    }

    /**
     * 新增保存${functionName}
     */
    @RequiresPermissions("${permissionPrefix}:add")
    @Log(title = "${functionName}", businessType = BusinessType.INSERT)
    @PostMapping("/add")
    @ResponseBody
    public AjaxResult addSave(${ClassName} ${className}) {
        return toAjax(${className}Service.insert${ClassName}(${className}));
    }

    /**
     * 修改${functionName}
     */
    @GetMapping("/edit/{${pkColumn.javaField}}")
    public String edit(@PathVariable("${pkColumn.javaField}") ${pkColumn.javaType} ${pkColumn.javaField}, ModelMap mmap) {
        ${ClassName} ${className} = ${className}Service.select${ClassName}ById(${pkColumn.javaField});
        mmap.put("${className}", ${className});
        return prefix + "/edit";
    }

    /**
     * 修改保存${functionName}
     */
    @RequiresPermissions("${permissionPrefix}:edit")
    @Log(title = "${functionName}", businessType = BusinessType.UPDATE)
    @PostMapping("/edit")
    @ResponseBody
    public AjaxResult editSave(${ClassName} ${className}) {
        return toAjax(${className}Service.update${ClassName}(${className}));
    }

    /**
     * 删除${functionName}
     */
    @RequiresPermissions("${permissionPrefix}:remove")
    @Log(title = "${functionName}", businessType = BusinessType.DELETE)
    @PostMapping("/remove")
    @ResponseBody
    public AjaxResult remove(String ids) {
        return toAjax(${className}Service.delete${ClassName}ByIds(ids));
    }
}
```

### Domain 模板示例

```velocity
## src/main/resources/vm/java/domain.java.vm
package ${packageName}.domain;

#foreach ($import in $importList)
import ${import};
#end
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * ${functionName}对象 ${tableName}
 * 
 * @author ${author}
 * @date ${datetime}
 */
public class ${ClassName} extends BaseEntity {
    private static final long serialVersionUID = 1L;

#foreach ($column in $columns)
#if(!$table.isSuperColumn($column.javaField))
    /** ${column.columnComment} */
#if($column.list)
    @Excel(name = "${column.columnComment}"#if($column.readConverterExp), readConverterExp = "$column.readConverterExp()"#end)
#end
    private $column.javaType $column.javaField;

#end
#end
#foreach ($column in $columns)
#if(!$table.isSuperColumn($column.javaField))
    public void set${column.javaField.capitalize()}($column.javaType $column.javaField) {
        this.$column.javaField = $column.javaField;
    }

    public $column.javaType get${column.javaField.capitalize()}() {
        return $column.javaField;
    }

#end
#end
    @Override
    public String toString() {
        return new ToStringBuilder(this, ToStringStyle.MULTI_LINE_STYLE)
#foreach ($column in $columns)
            .append("${column.javaField}", get${column.javaField.capitalize()}())
#end
            .toString();
    }
}
```

## 代码生成 Service

```java
// src/main/java/com/ruoyi/generator/service/GenTableServiceImpl.java
package com.ruoyi.generator.service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.apache.commons.io.IOUtils;
import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.Velocity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.alibaba.fastjson.JSON;
import com.ruoyi.common.constant.Constants;
import com.ruoyi.common.constant.GenConstants;
import com.ruoyi.common.core.text.CharsetKit;
import com.ruoyi.common.exception.ServiceException;
import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.generator.domain.GenTable;
import com.ruoyi.generator.domain.GenTableColumn;
import com.ruoyi.generator.mapper.GenTableColumnMapper;
import com.ruoyi.generator.mapper.GenTableMapper;
import com.ruoyi.generator.util.GenUtils;
import com.ruoyi.generator.util.VelocityInitializer;
import com.ruoyi.generator.util.VelocityUtils;

/**
 * 业务 服务层实现
 * 
 * @author ruoyi
 */
@Service
public class GenTableServiceImpl implements IGenTableService {
    private static final Logger log = LoggerFactory.getLogger(GenTableServiceImpl.class);

    @Autowired
    private GenTableMapper genTableMapper;

    @Autowired
    private GenTableColumnMapper genTableColumnMapper;

    /**
     * 获取代码生成信息
     */
    @Override
    public GenTable selectGenTableById(Long tableId) {
        GenTable genTable = genTableMapper.selectGenTableById(tableId);
        setTableFromOptions(genTable);
        return genTable;
    }

    /**
     * 查询业务信息
     */
    @Override
    public List<GenTable> selectGenTableList(GenTable genTable) {
        return genTableMapper.selectGenTableList(genTable);
    }

    /**
     * 查询据库列表
     */
    @Override
    public List<GenTable> selectDbTableList(GenTable genTable) {
        return genTableMapper.selectDbTableList(genTable);
    }

    /**
     * 导入表结构
     */
    @Override
    @Transactional
    public void importGenTable(List<String> tableList) {
        String operName = SecurityUtils.getUsername();
        for (String tableName : tableList) {
            // 查询表信息
            GenTable table = genTableMapper.selectDbTableListByName(tableName);
            // 验证表是否已存在
            if (StringUtils.isNotNull(table)) {
                throw new ServiceException("表 " + tableName + " 已存在");
            }
            // 初始化表信息
            table = genTableMapper.selectDbTableByName(tableName);
            GenUtils.initTable(table, operName);
            int row = genTableMapper.insertGenTable(table);
            if (row > 0) {
                // 保存列信息
                List<GenTableColumn> genTableColumns = genTableColumnMapper.selectDbTableColumnsByName(tableName);
                for (GenTableColumn column : genTableColumns) {
                    GenUtils.initColumnField(column, table);
                    genTableColumnMapper.insertGenTableColumn(column);
                }
            }
        }
    }

    /**
     * 预览代码
     */
    @Override
    public Map<String, String> previewCode(Long tableId) {
        Map<String, String> dataMap = new LinkedHashMap<>();
        // 查询表信息
        GenTable table = genTableMapper.selectGenTableById(tableId);
        List<GenTableColumn> columns = genTableColumnMapper.selectGenTableColumnListByTableId(tableId);
        setPkColumn(table, columns);
        VelocityInitializer.initVelocity();

        VelocityContext context = VelocityUtils.prepareContext(table);

        // 获取模板列表
        List<String> templates = VelocityUtils.getTemplateList(table.getTplCategory());
        for (String template : templates) {
            // 渲染模板
            StringWriter sw = new StringWriter();
            Template tpl = Velocity.getTemplate(template, Constants.UTF8);
            tpl.merge(context, sw);
            dataMap.put(template, sw.toString());
        }
        return dataMap;
    }

    /**
     * 生成代码（下载方式）
     */
    @Override
    public byte[] downloadCode(String tableName) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ZipOutputStream zip = new ZipOutputStream(outputStream);
        generatorCode(tableName, zip, true);
        IOUtils.closeQuietly(zip);
        return outputStream.toByteArray();
    }

    /**
     * 生成代码（自定义路径）
     */
    @Override
    public void generatorCode(String tableName) {
        generatorCode(tableName, null, false);
    }

    /**
     * 查询表信息并生成代码
     */
    private void generatorCode(String tableName, ZipOutputStream zip, boolean download) {
        // 查询表信息
        GenTable table = genTableMapper.selectGenTableByName(tableName);
        List<GenTableColumn> columns = genTableColumnMapper.selectGenTableColumnListByTableId(table.getTableId());
        setPkColumn(table, columns);

        VelocityInitializer.initVelocity();

        VelocityContext context = VelocityUtils.prepareContext(table);

        // 获取模板列表
        List<String> templates = VelocityUtils.getTemplateList(table.getTplCategory());
        for (String template : templates) {
            // 渲染模板
            StringWriter sw = new StringWriter();
            Template tpl = Velocity.getTemplate(template, Constants.UTF8);
            tpl.merge(context, sw);
            try {
                if (download) {
                    // 添加到zip
                    zip.putNextEntry(new ZipEntry(VelocityUtils.getFileName(template, table)));
                    IOUtils.write(sw.toString(), zip, Constants.UTF8);
                    IOUtils.closeQuietly(sw);
                    zip.closeEntry();
                } else {
                    // 写入文件
                    String path = getGenPath(table, template);
                    GenUtils.writeToFile(path, sw.toString());
                }
            } catch (IOException e) {
                log.error("渲染模板失败，表名：" + table.getTableName(), e);
            }
        }
    }

    /**
     * 修改保存参数校验
     */
    @Override
    public void validateEdit(GenTable genTable) {
        if (GenConstants.TPL_TREE.equals(genTable.getTplCategory())) {
            String options = JSON.toJSONString(genTable.getParams());
            TreeTable treeTable = JSON.parseObject(options, TreeTable.class);
            if (StringUtils.isEmpty(treeTable.getTreeCode())) {
                throw new ServiceException("树编码字段不能为空");
            } else if (StringUtils.isEmpty(treeTable.getTreeParentCode())) {
                throw new ServiceException("树父编码字段不能为空");
            } else if (StringUtils.isEmpty(treeTable.getTreeName())) {
                throw new ServiceException("树名称字段不能为空");
            }
        } else if (GenConstants.TPL_SUB.equals(genTable.getTplCategory())) {
            if (StringUtils.isEmpty(genTable.getSubTableName())) {
                throw new ServiceException("子表名称不能为空");
            } else if (StringUtils.isEmpty(genTable.getSubTableFkName())) {
                throw new ServiceException("子表外键名称不能为空");
            }
        }
    }
}
```

## Velocity 工具类

```java
// src/main/java/com/ruoyi/generator/util/VelocityUtils.java
package com.ruoyi.generator.util;

import java.util.*;
import org.apache.velocity.VelocityContext;
import com.alibaba.fastjson.JSONObject;
import com.ruoyi.common.constant.GenConstants;
import com.ruoyi.common.utils.DateUtils;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.generator.domain.GenTable;
import com.ruoyi.generator.domain.GenTableColumn;

/**
 * 模板工具类
 * 
 * @author ruoyi
 */
public class VelocityUtils {
    /** 项目空间路径 */
    private static final String PROJECT_PATH = "main/java";

    /** mybatis空间路径 */
    private static final String MYBATIS_PATH = "main/resources/mapper";

    /** html空间路径 */
    private static final String TEMPLATES_PATH = "main/resources/templates";

    /**
     * 设置模板变量信息
     */
    public static VelocityContext prepareContext(GenTable genTable) {
        String moduleName = genTable.getModuleName();
        String businessName = genTable.getBusinessName();
        String packageName = genTable.getPackageName();
        String tplCategory = genTable.getTplCategory();
        String functionName = genTable.getFunctionName();

        VelocityContext velocityContext = new VelocityContext();
        velocityContext.put("tplCategory", genTable.getTplCategory());
        velocityContext.put("tableName", genTable.getTableName());
        velocityContext.put("functionName", StringUtils.isNotEmpty(functionName) ? functionName : "【请填写功能名称】");
        velocityContext.put("ClassName", genTable.getClassName());
        velocityContext.put("className", StringUtils.uncapitalize(genTable.getClassName()));
        velocityContext.put("moduleName", genTable.getModuleName());
        velocityContext.put("businessName", genTable.getBusinessName());
        velocityContext.put("basePackage", getPackagePrefix(packageName));
        velocityContext.put("packageName", packageName);
        velocityContext.put("author", genTable.getFunctionAuthor());
        velocityContext.put("datetime", DateUtils.getDate());
        velocityContext.put("pkColumn", genTable.getPkColumn());
        velocityContext.put("importList", getImportList(genTable.getColumns()));
        velocityContext.put("permissionPrefix", getPermissionPrefix(moduleName, businessName));
        velocityContext.put("columns", genTable.getColumns());
        velocityContext.put("table", genTable);

        if (GenConstants.TPL_TREE.equals(tplCategory)) {
            setTreeVelocityContext(velocityContext, genTable);
        }

        if (GenConstants.TPL_SUB.equals(tplCategory)) {
            setSubVelocityContext(velocityContext, genTable);
        }

        return velocityContext;
    }

    /**
     * 获取模板信息
     */
    public static List<String> getTemplateList(String tplCategory) {
        List<String> templates = new ArrayList<String>();
        templates.add("vm/java/domain.java.vm");
        templates.add("vm/java/mapper.java.vm");
        templates.add("vm/java/service.java.vm");
        templates.add("vm/java/serviceImpl.java.vm");
        templates.add("vm/java/controller.java.vm");
        templates.add("vm/xml/mapper.xml.vm");
        templates.add("vm/html/list.html.vm");
        templates.add("vm/html/add.html.vm");
        templates.add("vm/html/edit.html.vm");
        templates.add("vm/sql/menu.sql.vm");
        return templates;
    }

    /**
     * 获取文件名
     */
    public static String getFileName(String template, GenTable genTable) {
        // 文件名称
        String fileName = "";
        // 包路径
        String packageName = genTable.getPackageName();
        // 模块名
        String moduleName = genTable.getModuleName();
        // 大写类名
        String className = genTable.getClassName();
        // 业务名称
        String businessName = genTable.getBusinessName();

        String javaPath = PROJECT_PATH + "/" + StringUtils.replace(packageName, ".", "/");
        String mybatisPath = MYBATIS_PATH + "/" + moduleName;
        String htmlPath = TEMPLATES_PATH + "/" + moduleName + "/" + businessName;

        if (template.contains("domain.java.vm")) {
            fileName = StringUtils.format("{}/domain/{}.java", javaPath, className);
        } else if (template.contains("mapper.java.vm")) {
            fileName = StringUtils.format("{}/mapper/{}Mapper.java", javaPath, className);
        } else if (template.contains("service.java.vm")) {
            fileName = StringUtils.format("{}/service/I{}Service.java", javaPath, className);
        } else if (template.contains("serviceImpl.java.vm")) {
            fileName = StringUtils.format("{}/service/impl/{}ServiceImpl.java", javaPath, className);
        } else if (template.contains("controller.java.vm")) {
            fileName = StringUtils.format("{}/controller/{}Controller.java", javaPath, className);
        } else if (template.contains("mapper.xml.vm")) {
            fileName = StringUtils.format("{}/{}Mapper.xml", mybatisPath, className);
        } else if (template.contains("list.html.vm")) {
            fileName = StringUtils.format("{}/{}.html", htmlPath, businessName);
        } else if (template.contains("add.html.vm")) {
            fileName = StringUtils.format("{}/add.html", htmlPath);
        } else if (template.contains("edit.html.vm")) {
            fileName = StringUtils.format("{}/edit.html", htmlPath);
        } else if (template.contains("menu.sql.vm")) {
            fileName = businessName + "Menu.sql";
        }
        return fileName;
    }

    /**
     * 获取权限前缀
     */
    public static String getPermissionPrefix(String moduleName, String businessName) {
        return StringUtils.format("{}:{}", moduleName, businessName);
    }
}
```

## 复习卡片

```java
// 代码生成核心流程
// 1. 导入表结构
GenTable table = genTableMapper.selectDbTableByName(tableName);
GenUtils.initTable(table, operName);
genTableMapper.insertGenTable(table);

// 2. 初始化 Velocity
VelocityInitializer.initVelocity();

// 3. 准备模板上下文
VelocityContext context = VelocityUtils.prepareContext(table);

// 4. 渲染模板
Template tpl = Velocity.getTemplate(template, Constants.UTF8);
tpl.merge(context, sw);

// 5. 生成文件
zip.putNextEntry(new ZipEntry(fileName));
IOUtils.write(sw.toString(), zip, Constants.UTF8);
```

| 类名 | 职责 |
|:--|:--|
| `GenTable` | 生成表实体 |
| `GenTableColumn` | 生成列实体 |
| `GenConfig` | 代码生成配置 |
| `VelocityUtils` | Velocity 工具类 |
| `GenUtils` | 代码生成工具类 |
| `IGenTableService` | 生成表服务接口 |

| 模板类型 | 说明 |
|:--|:--|
| crud | 单表增删改查 |
| tree | 树表（带层级） |
| sub | 主子表（一对多） |

> [!TIP]
> 下一步：[阶段十二：系统监控](/blog/posts/ruoyi-roadmap-12-system-monitor/)
> 
> 在阶段十二中，我们将学习系统监控功能，包括服务监控、缓存监控和在线用户管理。
