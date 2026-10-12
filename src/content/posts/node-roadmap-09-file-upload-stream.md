---
title: '09 · 文件上传与大文件处理'
published: 2026-10-13T18:00:00+08:00
description: 'Node 文件上传全链路：multer 处理 multipart 表单、文件类型与大小校验、流式写入防内存爆炸、OSS 直传与预签名 URL，图片服务从 0 到可用。'
tags: [Node.js, multer, OSS, 上传]
category: Node全栈学习路线
draft: false
---

> [!NOTE]
> 文件上传是我见过的"新手翻车重灾区"：内存被打爆的（没做大小限制）、目录穿越漏洞的（文件名直接用用户传的）、磁盘被塞满的（没清理策略）。这一篇把"图片上传"这个博客 API 的必备功能做对——从 multer 到流式处理再到 OSS 直传。

---

## 1. multipart 表单：上传的本质

文件上传用的是 `multipart/form-data` 编码——一个 body 里混着普通字段和二进制文件块，用 boundary 分隔。`express.json()` 解析不了它，需要 multer（底层是 busboy 流式解析器）：

```ts
import multer from 'multer';

const upload = multer({
  dest: 'uploads/',                    // 最简形态：临时目录
  limits: { fileSize: 5 * 1024 * 1024 },  // ⚠️ 必配：5MB 上限，防内存/磁盘打爆
});

@Post('avatar')
@UseInterceptors(FileInterceptor('file'))
upload(@UploadedFile() file: Express.Multer.File) {
  // file: { originalname, mimetype, size, buffer/path }
}
```

第一课就是 `limits.fileSize`。没有它， multer 默认无限——用户传一个 10GB 文件，Node 进程内存（buffer 模式）或磁盘立刻遭殃。这是我给所有新项目 checklist 的第一条。

## 2. 四道防线：文件校验的正确姿势

只限制大小远远不够，我总结四道防线，缺一道都有事故案例：

**第一道：大小限制**（上面已配）。

**第二道：类型校验——不要信扩展名和 mimetype**。它们都来自客户端，随便改。正确做法是读文件头（magic bytes）：

```ts
import { fileTypeFromFile } from 'file-type';

const type = await fileTypeFromFile(file.path);   // 读文件头判断真实类型
const ALLOW = new Set(['image/jpeg', 'image/png', 'image/webp']);
if (!type || !ALLOW.has(type.mime)) {
  await fsPromises.unlink(file.path);             // 立刻删掉恶意文件
  throw new BizException(40002, '仅支持 jpg/png/webp');
}
```

真实案例：有人上传 `shell.php` 改名 `cat.jpg`，如果服务器目录可执行或直接提供下载链接带 Content-Type 推断，就是攻击入口。

**第三道：文件名重写**。`originalname` 绝不直接用作存储文件名——它可能带 `../`（目录穿越）或特殊字符。标准做法：

```ts
import path from 'node:path';
import crypto from 'node:crypto';

const ext = path.extname(file.originalname).slice(0, 8);  // 限制长度防怪后缀
const key = crypto.randomUUID() + ext;                     // 服务端生成文件名
```

**第四道：存储位置与访问方式**。上传目录放 Web 根之外或明确不可执行；对外访问走单独的静态域名/CDN，响应头固定 `Content-Type` 并加 `Content-Disposition: attachment`（不可信类型时），杜绝浏览器把上传内容当 HTML 执行（存储型 XSS）。

## 3. 流式处理：大文件不进内存

multer 两种模式，选择直接决定内存模型：

```ts
// 模式 A：buffer（默认 dest 或 memoryStorage）——整个文件进内存，适合 <10MB
// 模式 B：diskStorage——multer 边收边写磁盘，内存恒定
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/tmp'),
    filename: (req, file, cb) => cb(null, crypto.randomUUID()),
  }),
  limits: { fileSize: 200 * 1024 * 1024 },   // 大文件场景
});
```

如果还要二次加工（转码、压缩），别读整个文件再处理——用第 02 篇的 Stream：

```ts
// 边读边算：例如生成文件哈希做秒传/去重
import { createHash } from 'node:crypto';
const hash = createHash('sha256');
await pipeline(
  fs.createReadStream(file.path),
  async function* (source) {
    for await (const chunk of source) {
      hash.update(chunk);
      yield chunk;
    }
  },
  fs.createWriteStream(finalPath),
);
const sha256 = hash.digest('hex');
```

200MB 视频转码这种重 CPU 活，记得回到第 02 篇的 worker_threads，别堵主线程。

## 4. OSS 直传：生产环境的主流方案

自建磁盘存储的三大痛：磁盘有限、没有 CDN、服务器迁移要搬文件。生产环境标准答案是对象存储（阿里云 OSS / 腾讯云 COS / S3）。而**直传**是其中最有价值的架构——文件不经过你的 Node 服务器：

```text
传统链路：浏览器 → Node（内存/磁盘）→ OSS   ← 服务器带宽和内存双重承压
直传链路：浏览器 → Node 要签名 → 浏览器 → OSS 直接上传 → 回调通知 Node
```

服务端只需要签发预签名 URL：

```ts
import OSS from 'ali-oss';
const client = new OSS({ ...config });

async function signUpload(filename: string, userId: number) {
  const key = `avatar/${userId}/${crypto.randomUUID()}`;
  const url = client.signatureUrl(key, {
    method: 'PUT',
    expires: 600,                        // 10 分钟内有效
    'content-type': 'image/jpeg',
  });
  return { uploadUrl: url, key };        // 前端拿 uploadUrl 直接 PUT
}
```

收益立竿见影：**服务器带宽零占用、内存零占用、支持大文件分片**。我的实战清单：签名 URL 要限定目录前缀（防越权覆盖他人文件）、限定 method 和 content-type、设置短过期；文件可访问性靠后端入库登记（key → 业务对象），而不是猜 URL。前端工程师对这套流程会很有共鸣——它本质就是把"上传"这个重活从服务端卸载到云端，和"构建产物直接传 CDN"一个思路。

## 5. 收尾：清理与生命周期

上传功能的最后一块拼图是清理：临时文件（multer 的中间产物）处理完立即删；用户删文章时，其图片进入"待删除"状态，配合第 10 篇的延迟队列 T+1 真正清理（防止误删恢复）；磁盘监控告警（85% 水位）。没有清理的上传功能，就是一颗定时炸弹——我接手过一个项目磁盘 100% 后整个服务写入失败，排查到 uploads 目录 300GB 无人认领。

---

## 小结

- `limits.fileSize` 必配，multer diskStorage 模式内存恒定。
- 校验四道防线：大小、magic bytes 类型、服务端重命名、存储不可执行。
- 大文件处理全链路 Stream，重 CPU 加工进 worker。
- OSS 直传（预签名 URL）让文件绕过服务器，签名限定前缀/方法/过期。
- 临时文件即用即删，删除业务文件走延迟队列，防误删也防堆积。

---

## 练习

1. 实现头像上传接口：5MB 限制 + magic bytes 校验 + UUID 重命名，用 curl 上传一个改名为 .jpg 的 .txt 文件验证拦截。
2. 写脚本生成一个 50MB 文件，分别用 buffer 模式和 diskStorage 模式上传，观察 `process.memoryUsage().rss` 差异。
3. 用阿里云 OSS 或 MinIO（本地 Docker 一行起）实现预签名直传，抓包确认文件流量没有经过你的 Node 进程。
4. 给上传记录设计"软删除 + 延迟清理"：删除接口只标记，思考在第 10 篇学完队列后如何实现 T+1 清理。
