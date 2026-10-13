---
title: '08 · 多模态应用'
published: 2026-10-12T17:00:00+08:00
description: '多模态应用前端接入：图片理解 API 的报文与编码、语音输入录音与转写、文生图/文生视频 API 的任务轮询模式与前端展示优化。'
tags: [AI应用, 多模态, 文生图]
category: AI应用开发学习路线
draft: false
---

> [!NOTE]
> 多模态听上去神秘，落到 API 层面就是三种模式：**图片理解是"报文里塞图片"**，语音转写是"上传文件拿文本"，文生图/视频是"提交任务然后轮询"。这篇把我接过的多模态功能——截图识别、语音便签、文章配图生成——的前端工程经验一次讲完。

---

## 知识地图

- 图片理解：base64 与 URL 两种传图方式
- 语音输入：MediaRecorder 录音 + 转写 API
- 文生图/文生视频：异步任务模式与轮询
- 多模态交互的前端细节

---

## 1. 图片理解：往 messages 里塞图片

视觉模型（Qwen-VL、GPT-4o 等）的报文把 content 从字符串升级为数组：

```ts
const body = {
  model: "qwen-vl-plus",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "image_url",
          image_url: { url: "data:image/png;base64,..." }, // 或 https URL
        },
        { type: "text", text: "这张截图里的报错是什么？怎么修？" },
      ],
    },
  ],
};
```

两种传图方式的选择：

| 方式 | 优点 | 缺点 |
| --- | --- | --- |
| base64 内联 | 无需公网可访问 | 报文体积大（约 +33%），编码耗时 |
| URL 直链 | 报文小 | 模型服务端要能访问到；私有图必须先传 OSS |

**图片 token 计费比文本贵得多**，且和分辨率相关（不少平台按"图块"计价）。我的截图识别功能上线前没看计费文档，一个用户连传 10 张高清截图，单次请求就是几毛钱。所以现在我都会在客户端先做两件事：

1. **压缩**：Canvas 重绘，长边压到 1280px、JPEG 质量 0.8，绝大多数场景无损体验：

```ts
async function compressImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  const canvas = new OffscreenCanvas(
    bitmap.width * scale,
    bitmap.height * scale,
  );
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
  const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.8 });
  const buf = await blob.arrayBuffer();
  return `data:image/jpeg;base64,${btoa(
    String.fromCharCode(...new Uint8Array(buf)),
  )}`;
}
```

2. **限流与提示**：多图请求限制张数，前端提示"每张图会消耗较多 token"。

另一个实战点：**多模态 Prompt 要更明确**。"看看这张图"得到的回答泛泛而谈；"提取图中的表格为 markdown"能拿到精准结果。图片理解任务里，具体化的收益比纯文本任务更大。

## 2. 语音输入：录音 + 转写

浏览器录音用 MediaRecorder，转写调 ASR 接口（Qwen ASR、Whisper API 等，通常是 multipart 上传）：

```ts
async function recordVoice(onStop: (blob: Blob) => void) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = () => {
    stream.getTracks().forEach((t) => t.stop()); // 别忘了释放麦克风
    onStop(new Blob(chunks, { type: "audio/webm" }));
  };
  recorder.start();
  return () => recorder.stop();
}
```

然后上传转写：

```ts
const form = new FormData();
form.append("file", audioBlob, "voice.webm");
form.append("model", "qwen-audio-asr");
const res = await fetch("/api/asr", { method: "POST", body: form });
const { text } = await res.json();
```

我语音便签功能踩过的坑：

- **格式兼容**：浏览器录出来是 webm/opus，部分转写服务只收 wav/mp3，要在服务端转码（ffmpeg 一行的事，但要记得部署）。方案确认后再开发，别学我上线才发现。
- **权限与降级**：用户拒绝麦克风授权要有明确引导；非 HTTPS 环境整个 API 不可用。
- **分段显示**：长录音边录边转（部分平台支持流式 ASR）体验远好于录完等 10 秒出全稿，但复杂度高一个量级，v1 先做整段转写即可。
- **语音便签的正确产品形态**：转写结果直接可编辑再入库——ASR 在专业术语上的识别错误需要用户自己改，别做成"录音即入库"的一锤子买卖。

## 3. 文生图与文生视频：异步任务模式

文本生成图像/视频和 chat 完全不同：**生成耗时 10s~几分钟，无法同步返回**，平台普遍采用"提交任务 → 轮询取结果"模式（Qwen 万相、各家视频模型皆如此）：

```ts
// 1. 提交任务，拿到 task_id
const { output: { task_id } } = await postJSON("/api/image-gen", {
  prompt: "水彩风格的城市夜景，暖色调",
  size: "1024x1024",
});

// 2. 轮询状态
async function pollTask(taskId: string): Promise<string> {
  for (let i = 0; i < 60; i++) {
    const task = await getJSON(`/api/task/${taskId}`);
    if (task.status === "SUCCEEDED") return task.output.url;
    if (task.status === "FAILED") throw new Error(task.output.message);
    await sleep(3000); // 3s 一次，别太密
  }
  throw new Error("任务超时");
}
```

前端体验设计比后端轮询更重要：

- **骨架屏 + 进度提示**："生成中，约需 30 秒"，给出预期比转圈圈好
- **图片渐进展示**：文生图返回的常是 1~4 张，到一张展示一张
- **任务状态持久化**：页面刷新后任务还在跑，把 task_id 存 localStorage，回来继续轮询。我在配图功能里没做这个，用户一刷新就以为失败重新提交，白花两倍钱——这是花钱买的教训
- **Prompt 模板化**：给用户"风格/色调/比例"的结构化选项拼 Prompt，比裸文本输入框的出图质量稳定得多

文生视频同理，只是耗时更长（1~5 分钟），**必须做服务端任务队列 + 客户端可离开**：提交后任务入库，用户随时回来查看，而不是挂着一个不许关的页面。

## 4. 多模态的统一心智

回看三种模式，其实都能映射回你熟悉的工程模型：

| 模式 | 类比 | 关键工程点 |
| --- | --- | --- |
| 图片理解 | 带 attachment 的 chat | 压缩、限流、计费提示 |
| 语音转写 | 文件上传接口 | 格式兼容、权限降级 |
| 文生图/视频 | 异步任务队列 | 轮询、状态持久化、防重复提交 |

没有新范式，全是老工程问题的变体。这也是我这条路线反复强调的观点：前端工程师做 AI 应用，核心竞争力就是这些"看起来不 AI"的工程基本功。

## 5. 多图与对比任务：视觉模型的进阶用法

单图理解只是入门，多模态真正出活的场景是**多图对比与交叉理解**。我实际用过的三个模式：

**模式一：多图对比**。一次传 2-4 张图（content 数组里放多个 image_url，各自带序号文本），让模型"对比这三张设计稿的差异"。实测要点：必须在文本里明确引用图片顺序（"第 1 张图 / 第 2 张图"），否则模型的指代容易混乱；图片数量超过 4 张后准确率明显下滑，再多就该拆成多次调用。

**模式二：图文混合问答**。content 数组里图片和文本交替出现，适合"逐段讲稿 + 对应配图"的结构。我做过"面试题截图 + 我自己的作答"的批改功能，模型能同时理解题目和手写内容——注意手写识别的准确率显著低于印刷体，预期要放低。

**模式三：视频抽帧**。平台级的视频理解 API 还很贵，但"前端抽帧 + 多图理解"是廉价平替：`<video>` 元素配合 Canvas 按 N 秒间隔截帧（`drawImage` + `toBlob`），把关键帧当多图任务发给模型。我给知识库的视频笔记做过"每 10 秒一帧 + 汇总讲解"，20 分钟的视频取 120 帧压到 30 帧（相似帧丢弃），效果可用且成本可控。抽帧间隔是精度与成本的核心旋钮，从 10 秒起步按效果调。

多图任务的计费是单图的线性叠加，成本意识要更强：4 张 1280px 图的一次请求轻松超过 5000 token 的文本请求。我的做法是除了压缩，还要求"对比类任务的图片统一降采样到 800px"——对比任务看的是结构差异，不需要视网膜级分辨率。

## 6. 浏览器本地能力的边界：什么时候不需要云端模型

多模态不等于全走云端 API。浏览器本地已经有一批"够用"的多模态能力，在正确的场景用它们能同时省成本、降延迟、避开隐私问题：

- **Web Speech API**：`SpeechRecognition` 在 Chrome 上可直接做语音转文字，免费且低延迟。我的语音便签 v1 就用它做了前端预览转写，确认后的最终文本才走云端 ASR 精转——用户按键松开前就能看到文字，体验差异巨大。
- **本地图片处理**：压缩（上文 Canvas 方案）、裁剪、朝向校正、缩略图，全部在端上完成，只把处理后的最终产物发给模型。
- **条码/简单 OCR 类任务**：部分场景用 `BarcodeDetector` 或轻量端侧 OCR 就够，不必动用视觉大模型。

判断标准还是那条成本-收益线：**任务的"理解"成分越高越依赖云端模型，"采集与预处理"成分越高越应该留在端上**。端侧做预处理还有一个常被忽略的安全收益——用户还没确认发送的图片和语音，根本不必离开设备，12 篇的隐私分级里它们属于"不出门"级别。

当然，端侧能力的天花板也必须诚实面对：Web Speech 的浏览器兼容性参差（Firefox/Safari 支持度差）、端侧 OCR 对复杂版面无能为力。我的策略是端侧能力做"体验层"，云端模型做"能力层"，两层各司其职，而不是互相替代。

### 3.1 轮询的工程细节

轮询代码看着简单，三个细节决定它是工具还是麻烦：**轮询间隔的自适应**——固定 3 秒对 10 秒的图生成没问题，对 3 分钟的视频生成就是 60 次无谓请求，我的做法是前 30 秒每 2 秒一次，之后指数放宽到 5 秒、10 秒；**轮询也要有超时与取消**——用户关掉弹层后轮询必须停止，否则后台一堆僵尸定时器持续打接口；**状态机与 UI 解耦**——轮询器只负责抛出状态变化事件，弹层、列表页、通知都各自订阅，这样用户切走再切回时 UI 能从任务存储恢复而不是重新轮询。这三点做齐，异步任务功能才算闭环；漏掉任何一点，都会在用户量上来后以"偶发怪问题"的形式还债。

---

## 小结

- 图片理解 = content 数组塞 image_url；客户端压缩分辨率能同时省 token 和提速。
- 语音 = MediaRecorder + multipart 上传转写，先确认音频格式兼容性，转写结果要可编辑。
- 文生图/视频 = 提交任务 + 轮询，前端要管理任务状态持久化，防刷新丢任务重复扣费。
- 多模态没有新范式，全是压缩、上传、异步任务的旧工程问题的变体。

---

## 练习

1. 实现 `compressImage`，对同一张 4MB 截图压缩前后分别调视觉模型，对比 token 用量和回答质量。
2. 做一个语音便签 demo：录音 → 转写 → 显示可编辑文本。
3. 接入一个文生图 API，实现"提交 + 轮询 + localStorage 恢复任务"完整流程。
4. 给你产品的图片输入加张数限制与 token 消耗预估提示。
