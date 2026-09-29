---
title: '11 · Monorepo 实战'
published: 2026-09-31T13:00:00+08:00
description: 'Monorepo 把多个关联包/应用放在一个仓库统一管理：pnpm workspace 做依赖提升与过滤，Turborepo 做任务编排与远程缓存。讲清它解决什么、又带来什么，以及"小团队该不该上"。'
tags: [前端工程化, Monorepo, pnpm-workspace, Turborepo, 任务编排]
category: 前端工程化学习路线
draft: false
---

## 多仓库的痛

公司有 `ui-lib`、`utils`、`web-app`、`admin` 四个包，分散四个仓库：改了 `utils` 的 API，要发版 → 另三个仓库逐个升级 → 版本对不齐，一天耗在"对齐版本"。**Monorepo 让它们在同一仓库、共享一份代码、原子化改动**。

---

## pnpm workspace：依赖与过滤

`pnpm-workspace.yaml` 声明包含哪些包：

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- **依赖提升**：公共依赖只在根装一份，各包共享，磁盘与安装速度双优。
- **跨包引用**：`packages/utils` 可直接被 `apps/web` 以 workspace 协议引用，改了立刻生效，无需发版。
- **过滤执行**：`pnpm --filter web... build` 只构建 `web` 及其依赖。

---

## Turborepo：任务编排 + 缓存

```json
// turbo.json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] }
  }
}
```

- `^build` 表示"先构建我依赖的包"。
- **缓存**：任务输入（源码、配置）不变就直接复用上次产物（本地 + 远程缓存），CI 大幅提速。
- 只跑受影响的包，无关包跳过。

---

## 收益与代价

收益：原子改动跨包、统一工具链、共享类型、一致规范。
代价：**仓库变大、CI 更复杂、需要工具约束**（否则所有人改同一 repo 易冲突）。小团队（<5 人、包间耦合低）往往用多仓库 + 清晰的发版流程更轻。

---

## 小结

- Monorepo 解决"多关联包版本对齐、原子改动"的协作痛。
- pnpm workspace 管依赖与过滤；Turborepo 管任务编排与缓存。
- 适合中大型、包耦合高的团队；小团队先评估是否过度。

---

## 练习

1. 用 pnpm workspace 建 `packages/utils` 和 `apps/web`，让 web 引用 utils 的 workspace 版本。
2. 配 `turbo.json` 的 `build` pipeline，体验 `dependsOn: ["^build"]` 的依赖顺序。
3. 列出你团队"是否该上 Monorepo"的判定项，给出结论与理由。
