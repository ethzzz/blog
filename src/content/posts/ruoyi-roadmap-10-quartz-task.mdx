---
title: 'RuoYi 阶段十：定时任务'
published: 2026-09-07T20:00:00+08:00
description: '学习 Quartz 定时任务的使用，掌握任务配置、Cron 表达式和任务调度实现。'
tags: [Java, RuoYi, Quartz, 定时任务, Cron]
category: RuoYi学习路线
draft: false
---

> [!NOTE]
> 本文是 RuoYi 学习路线的**阶段十**，聚焦定时任务。学完本篇你应该能：
> 1. 理解 Quartz 定时任务的工作原理
> 2. 掌握 Cron 表达式的语法
> 3. 知道如何创建和管理定时任务

## 前端视角：定时任务像什么？

| RuoYi 定时任务 | 前端类比 |
|:--|:--|
| `SysJob` 任务 | setInterval / setTimeout |
| Cron 表达式 | crontab 语法 |
| 任务调度 | 任务队列 (Queue) |
| 任务日志 | console.log 记录 |
| 暂停/恢复 | clearTimeout / setInterval |

## Quartz 简介

Quartz 是一个功能强大的任务调度框架，支持：

- **持久化**：任务信息存储在数据库中，重启后自动恢复
- **集群支持**：多个节点协同执行任务
- **灵活的触发器**：Cron 表达式、简单触发器
- **任务监听**：执行前后监听

### 核心组件

| 组件 | 说明 |
|:--|:--|
| Scheduler | 任务调度器 |
| Job | 任务接口 |
| JobDetail | 任务详情 |
| Trigger | 触发器 |
| CronTrigger | Cron 表达式触发器 |

## 任务实体类

```java
// src/main/java/com/ruoyi/quartz/domain/SysJob.java
package com.ruoyi.quartz.domain;

import java.io.Serializable;
import java.util.Date;
import javax.validation.constraints.*;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;
import com.ruoyi.common.annotation.Excel;
import com.ruoyi.common.annotation.Excel.ColumnType;
import com.ruoyi.common.constant.ScheduleConstants;
import com.ruoyi.common.core.domain.BaseEntity;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.quartz.util.CronUtils;

/**
 * 定时任务调度表 sys_job
 * 
 * @author ruoyi
 */
public class SysJob extends BaseEntity implements Serializable {
    private static final long serialVersionUID = 1L;

    /** 任务ID */
    @Excel(name = "任务序号", cellType = ColumnType.NUMERIC)
    private Long jobId;

    /** 任务名称 */
    @Excel(name = "任务名称")
    private String jobName;

    /** 任务组名 */
    @Excel(name = "任务组名")
    private String jobGroup;

    /** 调用目标字符串 */
    @Excel(name = "调用目标字符串")
    private String invokeTarget;

    /** cron执行表达式 */
    @Excel(name = "cron执行表达式")
    private String cronExpression;

    /** cron计划策略 */
    @Excel(name = "cron计划策略", readConverterExp = "0=立即执行,1=执行一次,2=放弃执行")
    private String misfirePolicy = ScheduleConstants.MISFIRE_DEFAULT;

    /** 是否并发执行（0允许 1禁止） */
    @Excel(name = "并发执行", readConverterExp = "0=允许,1=禁止")
    private String concurrent;

    /** 任务状态（0正常 1暂停） */
    @Excel(name = "任务状态", readConverterExp = "0=正常,1=暂停")
    private String status;

    /** 备注 */
    private String remark;

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    @NotBlank(message = "任务名称不能为空")
    @Size(min = 0, max = 64, message = "任务名称不能超过64个字符")
    public String getJobName() {
        return jobName;
    }

    public void setJobName(String jobName) {
        this.jobName = jobName;
    }

    public String getJobGroup() {
        return jobGroup;
    }

    public void setJobGroup(String jobGroup) {
        this.jobGroup = jobGroup;
    }

    @NotBlank(message = "调用目标字符串不能为空")
    @Size(min = 0, max = 500, message = "调用目标字符串长度不能超过500个字符")
    public String getInvokeTarget() {
        return invokeTarget;
    }

    public void setInvokeTarget(String invokeTarget) {
        this.invokeTarget = invokeTarget;
    }

    @NotBlank(message = "Cron执行表达式不能为空")
    @Size(min = 0, max = 255, message = "Cron执行表达式长度不能超过255个字符")
    public String getCronExpression() {
        return cronExpression;
    }

    public void setCronExpression(String cronExpression) {
        this.cronExpression = cronExpression;
    }

    public Date getNextValidTime() {
        if (StringUtils.isNotEmpty(cronExpression)) {
            return CronUtils.getNextExecution(cronExpression);
        }
        return null;
    }

    public String getMisfirePolicy() {
        return misfirePolicy;
    }

    public void setMisfirePolicy(String misfirePolicy) {
        this.misfirePolicy = misfirePolicy;
    }

    public String getConcurrent() {
        return concurrent;
    }

    public void setConcurrent(String concurrent) {
        this.concurrent = concurrent;
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
            .append("jobId", getJobId())
            .append("jobName", getJobName())
            .append("jobGroup", getJobGroup())
            .append("cronExpression", getCronExpression())
            .append("nextValidTime", getNextValidTime())
            .append("misfirePolicy", getMisfirePolicy())
            .append("concurrent", getConcurrent())
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

### 任务表

```sql
CREATE TABLE sys_job (
  job_id            BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '任务ID',
  job_name          VARCHAR(64)     NOT NULL                   COMMENT '任务名称',
  job_group         VARCHAR(64)     NOT NULL                   COMMENT '任务组名',
  invoke_target     VARCHAR(500)    NOT NULL                   COMMENT '调用目标字符串',
  cron_expression   VARCHAR(255)    DEFAULT ''                 COMMENT 'cron执行表达式',
  misfire_policy    VARCHAR(20)     DEFAULT '3'                COMMENT '计划执行错误策略',
  concurrent        CHAR(1)         DEFAULT '1'                COMMENT '是否并发执行（0允许 1禁止）',
  status            CHAR(1)         DEFAULT '0'                COMMENT '状态（0正常 1暂停）',
  create_by         VARCHAR(64)     DEFAULT ''                 COMMENT '创建者',
  create_time       DATETIME                                   COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''                 COMMENT '更新者',
  update_time       DATETIME                                   COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT ''                 COMMENT '备注信息',
  PRIMARY KEY (job_id, job_name, job_group)
) ENGINE=InnoDB AUTO_INCREMENT=100 COMMENT = '定时任务调度表';
```

### 任务日志表

```sql
CREATE TABLE sys_job_log (
  job_log_id        BIGINT(20)      NOT NULL AUTO_INCREMENT    COMMENT '任务日志ID',
  job_name          VARCHAR(64)     NOT NULL                   COMMENT '任务名称',
  job_group         VARCHAR(64)     NOT NULL                   COMMENT '任务组名',
  invoke_target     VARCHAR(500)    NOT NULL                   COMMENT '调用目标字符串',
  job_message       VARCHAR(500)    DEFAULT NULL               COMMENT '日志信息',
  status            CHAR(1)         DEFAULT '0'                COMMENT '执行状态（0正常 1失败）',
  exception_info    VARCHAR(2000)   DEFAULT ''                 COMMENT '异常信息',
  create_time       DATETIME                                   COMMENT '创建时间',
  PRIMARY KEY (job_log_id)
) ENGINE=InnoDB COMMENT = '定时任务调度日志表';
```

## Cron 表达式

### 语法结构

```
┌───────────── 秒 (0 - 59)
│ ┌───────────── 分 (0 - 59)
│ │ ┌───────────── 小时 (0 - 23)
│ │ │ ┌───────────── 日期 (1 - 31)
│ │ │ │ ┌───────────── 月份 (1 - 12)
│ │ │ │ │ ┌───────────── 星期 (0 - 7, 0和7都表示周日)
│ │ │ │ │ │
* * * * * *
```

### 特殊字符

| 字符 | 说明 | 示例 |
|:--|:--|:--|
| `*` | 所有值 | `* * * * * ?` 每秒执行 |
| `?` | 不指定值（用于日期和星期） | `0 0 12 * * ?` 每天12点 |
| `-` | 范围 | `0 0-5 12 * * ?` 12点0分到5分 |
| `,` | 列表 | `0 0,15,30 12 * * ?` 12点的0分、15分、30分 |
| `/` | 增量 | `0 0/5 12 * * ?` 12点开始每5分钟 |
| `L` | 最后 | `0 0 12 L * ?` 每月最后一天12点 |
| `W` | 工作日 | `0 0 12 ? * 2-6` 工作日12点 |
| `#` | 第几个星期几 | `0 0 12 ? * 6#3` 第3个星期五12点 |

### 常用表达式

| 表达式 | 说明 |
|:--|:--|
| `0 0 2 * * ?` | 每天凌晨2点执行 |
| `0 0/5 * * * ?` | 每5分钟执行一次 |
| `0 0 0 1 * ?` | 每月1号0点执行 |
| `0 0 12 ? * MON-FRI` | 工作日中午12点执行 |
| `0 0 0 1,15 * ?` | 每月1号和15号0点执行 |
| `0 15 10 ? * *` | 每天上午10:15执行 |
| `0 0 0 L * ?` | 每月最后一天0点执行 |

### 在线工具

推荐使用在线 Cron 表达式生成器：
- https://cron.qqe2.com/
- https://www.bejson.com/othertools/cron/

## 任务 Service 实现

```java
// src/main/java/com/ruoyi/quartz/service/impl/SysJobServiceImpl.java
package com.ruoyi.quartz.service.impl;

import java.util.List;
import javax.annotation.PostConstruct;
import org.quartz.JobDataMap;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ruoyi.common.constant.ScheduleConstants;
import com.ruoyi.common.core.text.Convert;
import com.ruoyi.common.exception.ServiceException;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.quartz.domain.SysJob;
import com.ruoyi.quartz.mapper.SysJobMapper;
import com.ruoyi.quartz.service.ISysJobService;
import com.ruoyi.quartz.util.CronUtils;
import com.ruoyi.quartz.util.ScheduleUtils;

/**
 * 定时任务调度信息 服务层
 * 
 * @author ruoyi
 */
@Service
public class SysJobServiceImpl implements ISysJobService {
    @Autowired
    private Scheduler scheduler;

    @Autowired
    private SysJobMapper jobMapper;

    /**
     * 项目启动时，初始化调度器 主要是防止手动修改数据库导致未同步到定时任务处理
     */
    @PostConstruct
    public void init() throws SchedulerException {
        scheduler.clear();
        List<SysJob> jobList = jobMapper.selectJobAll();
        for (SysJob job : jobList) {
            ScheduleUtils.createScheduleJob(scheduler, job);
        }
    }

    /**
     * 获取quartz调度器的计划任务列表
     */
    @Override
    public List<SysJob> selectJobList(SysJob job) {
        return jobMapper.selectJobList(job);
    }

    /**
     * 通过调度任务ID查询调度信息
     */
    @Override
    public SysJob selectJobById(Long jobId) {
        return jobMapper.selectJobById(jobId);
    }

    /**
     * 暂停任务
     */
    @Override
    @Transactional
    public int pauseJob(SysJob job) throws SchedulerException {
        Long jobId = job.getJobId();
        String jobGroup = job.getJobGroup();
        SysJob properties = selectJobById(jobId);
        // 暂停任务
        scheduler.pauseJob(ScheduleUtils.getJobKey(jobId, jobGroup));
        properties.setStatus(ScheduleConstants.Status.PAUSE.getValue());
        return jobMapper.updateJob(properties);
    }

    /**
     * 恢复任务
     */
    @Override
    @Transactional
    public int resumeJob(SysJob job) throws SchedulerException {
        Long jobId = job.getJobId();
        String jobGroup = job.getJobGroup();
        SysJob properties = selectJobById(jobId);
        // 恢复任务
        scheduler.resumeJob(ScheduleUtils.getJobKey(jobId, jobGroup));
        properties.setStatus(ScheduleConstants.Status.NORMAL.getValue());
        return jobMapper.updateJob(properties);
    }

    /**
     * 删除任务后，所对应的trigger也将被删除
     */
    @Override
    @Transactional
    public int deleteJob(SysJob job) throws SchedulerException {
        Long jobId = job.getJobId();
        String jobGroup = job.getJobGroup();
        // 删除任务
        scheduler.deleteJob(ScheduleUtils.getJobKey(jobId, jobGroup));
        return jobMapper.deleteJobById(jobId);
    }

    /**
     * 批量删除调度信息
     */
    @Override
    @Transactional
    public void deleteJobByIds(String ids) throws SchedulerException {
        Long[] jobIds = Convert.toLongArray(ids);
        for (Long jobId : jobIds) {
            SysJob job = jobMapper.selectJobById(jobId);
            deleteJob(job);
        }
    }

    /**
     * 任务调度状态修改
     */
    @Override
    @Transactional
    public int changeStatus(SysJob job) throws SchedulerException {
        int rows = 0;
        String status = job.getStatus();
        if (ScheduleConstants.Status.NORMAL.getValue().equals(status)) {
            rows = resumeJob(job);
        } else if (ScheduleConstants.Status.PAUSE.getValue().equals(status)) {
            rows = pauseJob(job);
        }
        return rows;
    }

    /**
     * 立即运行任务
     */
    @Override
    @Transactional
    public void run(SysJob job) throws SchedulerException {
        Long jobId = job.getJobId();
        SysJob tmpObj = selectJobById(jobId);
        // 参数
        JobDataMap dataMap = new JobDataMap();
        dataMap.put(ScheduleConstants.TASK_PROPERTIES, tmpObj);
        scheduler.triggerJob(ScheduleUtils.getJobKey(jobId, tmpObj.getJobGroup()), dataMap);
    }

    /**
     * 新增任务
     */
    @Override
    @Transactional
    public int insertJob(SysJob job) throws SchedulerException {
        job.setStatus(ScheduleConstants.Status.PAUSE.getValue());
        int rows = jobMapper.insertJob(job);
        if (rows > 0) {
            ScheduleUtils.createScheduleJob(scheduler, job);
        }
        return rows;
    }

    /**
     * 更新任务的时间表达式
     */
    @Override
    @Transactional
    public int updateJob(SysJob job) throws SchedulerException {
        SysJob properties = selectJobById(job.getJobId());
        int rows = jobMapper.updateJob(job);
        if (rows > 0) {
            updateSchedulerJob(job, properties.getJobGroup());
        }
        return rows;
    }

    /**
     * 更新任务
     */
    public void updateSchedulerJob(SysJob job, String jobGroup) throws SchedulerException {
        Long jobId = job.getJobId();
        // 判断是否存在
        JobKey jobKey = ScheduleUtils.getJobKey(jobId, jobGroup);
        if (scheduler.checkExists(jobKey)) {
            // 防止创建时触发器还未开始就删除了
            scheduler.deleteJob(jobKey);
        }
        ScheduleUtils.createScheduleJob(scheduler, job);
    }

    /**
     * 校验cron表达式是否有效
     */
    @Override
    public boolean checkCronExpressionIsValid(SysJob job) {
        return CronUtils.isValid(job.getCronExpression());
    }
}
```

## 任务调度工具类

```java
// src/main/java/com/ruoyi/quartz/util/ScheduleUtils.java
package com.ruoyi.quartz.util;

import org.quartz.*;
import com.ruoyi.common.constant.ScheduleConstants;
import com.ruoyi.common.exception.ServiceException;
import com.ruoyi.common.utils.StringUtils;
import com.ruoyi.quartz.domain.SysJob;

/**
 * 定时任务工具类
 * 
 * @author ruoyi
 */
public class ScheduleUtils {
    /**
     * 得到quartz任务类
     */
    private static Class<? extends Job> getQuartzJobClass(SysJob sysJob) {
        boolean isConcurrent = "0".equals(sysJob.getConcurrent());
        return isConcurrent ? QuartzJobExecution.class : QuartzDisallowConcurrentExecution.class;
    }

    /**
     * 构建任务触发对象
     */
    public static TriggerKey getTriggerKey(Long jobId, String jobGroup) {
        return TriggerKey.triggerKey(ScheduleConstants.TASK_CLASS_NAME + jobId, jobGroup);
    }

    /**
     * 构建任务键对象
     */
    public static JobKey getJobKey(Long jobId, String jobGroup) {
        return JobKey.jobKey(ScheduleConstants.TASK_CLASS_NAME + jobId, jobGroup);
    }

    /**
     * 创建定时任务
     */
    public static void createScheduleJob(Scheduler scheduler, SysJob job) {
        try {
            Class<? extends Job> jobClass = getQuartzJobClass(job);
            // 构建job信息
            Long jobId = job.getJobId();
            String jobGroup = job.getJobGroup();
            JobDetail jobDetail = JobBuilder.newJob(jobClass)
                    .withIdentity(getJobKey(jobId, jobGroup))
                    .build();

            // 表达式调度构建器
            CronScheduleBuilder cronScheduleBuilder = CronScheduleBuilder
                    .cronSchedule(job.getCronExpression());
            cronScheduleBuilder = handleCronScheduleMisfirePolicy(job, cronScheduleBuilder);

            // 按新的cronExpression表达式构建一个新的trigger
            CronTrigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity(getTriggerKey(jobId, jobGroup))
                    .withSchedule(cronScheduleBuilder)
                    .build();

            // 放入参数，运行时的方法可以获取
            jobDetail.getJobDataMap().put(ScheduleConstants.TASK_PROPERTIES, job);

            // 判断是否存在
            if (scheduler.checkExists(getJobKey(jobId, jobGroup))) {
                // 防止创建时触发器还未开始就删除了
                scheduler.deleteJob(getJobKey(jobId, jobGroup));
            }

            scheduler.scheduleJob(jobDetail, trigger);

            // 暂停任务
            if (job.getStatus().equals(ScheduleConstants.Status.PAUSE.getValue())) {
                scheduler.pauseJob(getJobKey(jobId, jobGroup));
            }
        } catch (SchedulerException e) {
            throw new ServiceException("创建定时任务失败");
        }
    }

    /**
     * 设置定时任务策略
     */
    public static CronScheduleBuilder handleCronScheduleMisfirePolicy(SysJob job, 
            CronScheduleBuilder cb) throws ServiceException {
        switch (job.getMisfirePolicy()) {
            case ScheduleConstants.MISFIRE_DEFAULT:
                return cb;
            case ScheduleConstants.MISFIRE_IGNORE_MISFIRES:
                return cb.withMisfireHandlingInstructionIgnoreMisfires();
            case ScheduleConstants.MISFIRE_FIRE_AND_PROCEED:
                return cb.withMisfireHandlingInstructionFireAndProceed();
            case ScheduleConstants.MISFIRE_DO_NOTHING:
                return cb.withMisfireHandlingInstructionDoNothing();
            default:
                throw new ServiceException("未知任务策略");
        }
    }
}
```

## 任务执行类

```java
// src/main/java/com/ruoyi/quartz/util/QuartzJobExecution.java
package com.ruoyi.quartz.util;

import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import com.ruoyi.quartz.domain.SysJob;

/**
 * 定时任务处理（允许并发执行）
 * 
 * @author ruoyi
 */
public class QuartzJobExecution extends AbstractQuartzJob {
    @Override
    protected void doExecute(JobExecutionContext context, SysJob sysJob) throws Exception {
        JobInvokeUtil.invokeMethod(sysJob);
    }
}

// src/main/java/com/ruoyi/quartz/util/QuartzDisallowConcurrentExecution.java
package com.ruoyi.quartz.util;

import org.quartz.DisallowConcurrentExecution;
import org.quartz.JobExecutionContext;
import com.ruoyi.quartz.domain.SysJob;

/**
 * 定时任务处理（禁止并发执行）
 * 
 * @author ruoyi
 */
@DisallowConcurrentExecution
public class QuartzDisallowConcurrentExecution extends AbstractQuartzJob {
    @Override
    protected void doExecute(JobExecutionContext context, SysJob sysJob) throws Exception {
        JobInvokeUtil.invokeMethod(sysJob);
    }
}
```

## 复习卡片

```java
// 定时任务核心流程
// 1. 项目启动时初始化
@PostConstruct
public void init() throws SchedulerException {
    scheduler.clear();
    List<SysJob> jobList = jobMapper.selectJobAll();
    for (SysJob job : jobList) {
        ScheduleUtils.createScheduleJob(scheduler, job);
    }
}

// 2. 创建任务
JobDetail jobDetail = JobBuilder.newJob(jobClass)
    .withIdentity(getJobKey(jobId, jobGroup))
    .build();

CronTrigger trigger = TriggerBuilder.newTrigger()
    .withIdentity(getTriggerKey(jobId, jobGroup))
    .withSchedule(CronScheduleBuilder.cronSchedule(cronExpression))
    .build();

scheduler.scheduleJob(jobDetail, trigger);

// 3. 暂停/恢复任务
scheduler.pauseJob(getJobKey(jobId, jobGroup));
scheduler.resumeJob(getJobKey(jobId, jobGroup));

// 4. 立即执行
scheduler.triggerJob(getJobKey(jobId, jobGroup), dataMap);
```

| 类名 | 职责 |
|:--|:--|
| `SysJob` | 任务实体类 |
| `SysJobLog` | 任务日志实体 |
| `ISysJobService` | 任务服务接口 |
| `ScheduleUtils` | 任务调度工具类 |
| `CronUtils` | Cron 表达式工具类 |
| `QuartzJobExecution` | 允许并发执行的任务 |
| `QuartzDisallowConcurrentExecution` | 禁止并发执行的任务 |

| 任务策略 | 说明 |
|:--|:--|
| MISFIRE_DEFAULT | 默认策略 |
| MISFIRE_IGNORE_MISFIRES | 立即执行所有错过的任务 |
| MISFIRE_FIRE_AND_PROCEED | 执行一次后按原计划执行 |
| MISFIRE_DO_NOTHING | 不执行错过的任务 |

> [!TIP]
> 下一步：[阶段十一：代码生成器](/blog/posts/ruoyi-roadmap-11-code-generator/)
> 
> 在阶段十一中，我们将学习代码生成器的实现，包括 Velocity 模板引擎和自动化代码生成。
