---
title: '实战 04 · 图片理解、语音转写和结果复用'
published: 2026-11-27T09:15:00+08:00
description: 'Day 7：上传截图做识图、上传 WAV 做转写，处理文件限额和模型响应，并把结果带回文字对话。'
tags: [AI应用, 项目实战, 多模态, 语音]
category: AI应用开发学习路线
draft: false
---

> [!NOTE]
> [上一篇：Agent 与 MCP](/blog/posts/ai-app-workshop-03-agent-mcp/) · [下一篇：评测与部署](/blog/posts/ai-app-workshop-05-release/) · [路线合集](/blog/ai-app-roadmap/)

将测试环境的截图交给识图模型提取报错，或将一段 WAV 录音转成文字。检查结果后点「填入对话」，继续让助手整理问题。文件选择、模型响应和对话发送是三个独立的操作。

### 文件地图

| 文件 | 负责什么 |
| --- | --- |
| `media.mjs` | 文件大小、媒体类型、签名与能力分发 |
| `model.mjs` | 视觉请求的 `image_url`、转写请求的 multipart |
| `app.mjs` | 文件提交、结果展示、把结果填回消息输入框 |

## Day 7 从文件到文本

### 1. 跑通两个入口

停掉旧服务后执行：

```bash
node setup.mjs 4
node --env-file=.env server.mjs 4
```

用 Alice 登录，选一张不含敏感信息的 PNG 或 JPEG，填入「只读图中报错文字」。小于 2 MiB 时应看到「演练识图」和问题。再选一段小于 2 MiB 的 WAV，看到「演练转写」。测试脚本自带 PNG 和 WAV 头部样例，可在没准备文件时验证接口分流。

### 2. 检查从浏览器到上游的变化

1. 浏览器将文件字节发给 `POST /api/media`，图片问题经过编码放在 `X-Media-Question` 请求头，避免出现在常见代理的 URL 访问日志里。读 `bytes`，确认请求有长度声明时可以提前拒绝，实际读取时仍会累计字节。把文本文件改名为 PNG，提交应得到 415。签名校验是格式预检，完整解码仍由处理媒体的服务验证。
2. 在第 1 章的 `.env` 增加 `AI_VISION_MODEL` 和 `AI_AUDIO_MODEL`，填上兼容端点分别支持的视觉模型、转写模型 ID，再运行 `node --env-file=.env server.mjs 4`。识图请求将图片编码进聊天消息，转写请求使用 multipart。应用不把媒体原件写入数据库。 [Chat Completions 接口](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create) · [音频转写接口](https://developers.openai.com/api/reference/resources/audio/subresources/transcriptions/methods/create)
3. 真机用一张含明确测试文字的图和一段朗读「请查看团队发布流程」的录音。检查识图和读音的准确性，编辑结果后再发给聊天模型。测试材料同样适用于后面的质量集。
4. 在 Network 中查看 413、415 和正常响应。模拟上游模型异常时，保留原始文件选择，让用户能调整文件或配置后手动重试。
5. 把 `media.mjs` 中的读取上限改成分别限制图片和语音，例如 `audio ? 2 * 1024 * 1024 : 512 * 1024`。用超过 512 KiB 的图片和 512 KiB 以下的图片复测两个分支，再恢复教程默认的 2 MiB。

## 验收

- [ ] 另开终端运行 `node --env-file=.env smoke.mjs 4`，应输出 `PASS 04`。伪造图片和超限请求会被拒绝。
- [ ] 点击「填入对话」只填表单。能修正识别结果，再由自己按发送。
- [ ] 有模型密钥时验证图片与 WAV 各一条，记录识别偏差和耗时。

图像、视频生成通常需要异步任务。可以沿用这个项目的媒体入口，练习提交任务、保存任务 ID、查询进度、处理终态和过期结果。 [多模态应用专题](/blog/posts/ai-app-roadmap-08-multimodal/)

参考实现。 [media.mjs](/blog/ai-app-workshop/media.mjs)
