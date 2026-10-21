---
title: '办公自动化与图像处理'
published: 2026-09-18T11:30:00+08:00
description: 'Python 办公自动化实战：openpyxl 读写 Excel 与生成图表、python-docx/pptx 操作 Word 与 PPT、PyPDF 处理 PDF（提取/合并/加水印/加密）、Pillow 图像处理、发送邮件与短信。'
tags: [Python, 办公自动化, Excel, PDF, Pillow, 邮件]
category: Python学习路线
draft: false
---

> [!NOTE]
> 本文对应仓库 **Day24~29**：用 Python 处理 Office 文档（Excel/Word/PPT）、PDF、图像，以及发送邮件短信。这是 Python "胶水语言" 优势最直观的体现——把重复的办公工作自动化。

---

## 常用库一览

| 任务 | 库 | 安装 |
|:--|:--|:--|
| Excel (.xlsx) | openpyxl | `pip install openpyxl` |
| Word (.docx) | python-docx | `pip install python-docx` |
| PPT (.pptx) | python-pptx | `pip install python-pptx` |
| PDF | PyPDF / pdfplumber | `pip install pypdf` |
| 图像 | Pillow | `pip install Pillow` |
| 邮件 | smtplib（标准库） | 内置 |

---

## 一、Excel 处理（openpyxl）

### 读 Excel

```python
from openpyxl import load_workbook

wb = load_workbook("data.xlsx")           # 加载工作簿
ws = wb.active                            # 当前活动工作表
# ws = wb["Sheet1"]                        # 或按名字取

# 读单元格（两种定位方式）
print(ws["A1"].value)                     # 坐标方式
print(ws.cell(row=1, column=1).value)     # 行列方式（1-based）

# 遍历所有行
for row in ws.iter_rows(values_only=True):
    print(row)                            # 每行是一个元组

# 维度信息
print(ws.max_row, ws.max_column)          # 最大行/列
```

### 写 Excel

```python
from openpyxl import Workbook

wb = Workbook()                # 新建工作簿
ws = wb.active
ws.title = "成绩单"

# 写表头
ws.append(["姓名", "语文", "数学", "总分"])

# 写数据行
data = [["Ethan", 90, 95], ["Tom", 85, 88]]
for row in data:
    ws.append(row + [row[1] + row[2]])    # 追加总分

# 直接写单元格
ws["A1"] = "姓名"
ws.cell(row=2, column=2, value=90)

# 用公式
ws["D2"] = "=B2+C2"

wb.save("output.xlsx")         # 保存
```

### 调整样式

```python
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side

cell = ws["A1"]
cell.font = Font(name="Arial", size=14, bold=True, color="FF0000")
cell.alignment = Alignment(horizontal="center", vertical="center")
cell.fill = PatternFill(start_color="FFFF00", end_color="FFFF00", fill_type="solid")

# 边框
thin = Side(border_style="thin", color="000000")
cell.border = Border(left=thin, right=thin, top=thin, bottom=thin)

# 列宽 / 行高
ws.column_dimensions["A"].width = 20
ws.row_dimensions[1].height = 30

# 合并单元格
ws.merge_cells("A1:D1")
```

### 生成统计图表

```python
from openpyxl.chart import BarChart, LineChart, PieChart, Reference

# 柱状图
chart = BarChart()
chart.title = "成绩对比"
chart.x_axis.title = "姓名"
chart.y_axis.title = "分数"

# 数据范围（min_col, min_row, max_col, max_row）
data = Reference(ws, min_col=2, min_row=1, max_col=3, max_row=3)
cats = Reference(ws, min_col=1, min_row=2, max_row=3)
chart.add_data(data, titles_from_data=True)
chart.set_categories(cats)

ws.add_chart(chart, "F2")       # 图表锚定到 F2 单元格
wb.save("chart.xlsx")
```

---

## 二、Word 文档（python-docx）

```python
from docx import Document
from docx.shared import Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

# 创建文档
doc = Document()

# 添加标题（0-9 级）
doc.add_heading("项目报告", level=0)
doc.add_heading("一、概述", level=1)

# 添加段落
p = doc.add_paragraph("这是正文内容。")
p.alignment = WD_ALIGN_PARAGRAPH.CENTER    # 居中

# 设置文字样式（run 是段落中格式统一的一段文字）
run = p.add_run("加粗红字")
run.bold = True
run.font.size = Pt(14)
run.font.color.rgb = RGBColor(0xFF, 0x00, 0x00)

# 添加列表
doc.add_paragraph("第一项", style="List Bullet")
doc.add_paragraph("第二项", style="List Number")

# 添加表格
table = doc.add_table(rows=2, cols=3)
table.style = "Table Grid"
table.rows[0].cells[0].text = "姓名"
table.rows[1].cells[0].text = "Ethan"

# 添加图片
doc.add_picture("logo.png")

doc.save("report.docx")

# 读取已有文档
doc = Document("report.docx")
for para in doc.paragraphs:
    print(para.text)
```

---

## 三、PPT 演示文稿（python-pptx）

```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()

# 用版式添加幻灯片（0=标题页，1=标题+内容，5=纯标题，6=空白）
slide_layout = prs.slide_layouts[1]
slide = prs.slides.add_slide(slide_layout)

# 设置标题和正文
slide.shapes.title.text = "Python 办公自动化"
slide.placeholders[1].text = "用代码解放双手"

# 添加文本框
from pptx.util import Inches
left, top = Inches(1), Inches(3)
txbox = slide.shapes.add_textbox(left, top, Inches(8), Inches(1))
txbox.text_frame.text = "这是自定义文本框"

# 添加图片
slide.shapes.add_picture("chart.png", Inches(1), Inches(4))

prs.save("presentation.pptx")
```

---

## 四、PDF 处理

### 提取文本

```python
# 方式1：pypdf
from pypdf import PdfReader

reader = PdfReader("doc.pdf")
print(f"共 {len(reader.pages)} 页")
for page in reader.pages:
    text = page.extract_text()
    print(text)

# 方式2：pdfplumber（表格提取更强）
import pdfplumber
with pdfplumber.open("doc.pdf") as pdf:
    for page in pdf.pages:
        print(page.extract_text())
        for table in page.extract_tables():   # 提取表格
            print(table)
```

### 合并、拆分、旋转

```python
from pypdf import PdfReader, PdfWriter

# 合并多个 PDF
writer = PdfWriter()
for filename in ["a.pdf", "b.pdf"]:
    reader = PdfReader(filename)
    for page in reader.pages:
        writer.add_page(page)
with open("merged.pdf", "wb") as f:
    writer.write(f)

# 拆分（每页存一个文件）
reader = PdfReader("doc.pdf")
for i, page in enumerate(reader.pages):
    w = PdfWriter()
    w.add_page(page)
    with open(f"page_{i}.pdf", "wb") as f:
        w.write(f)

# 旋转页面
reader = PdfReader("doc.pdf")
writer = PdfWriter()
for page in reader.pages:
    page.rotate(90)          # 顺时针旋转 90 度
    writer.add_page(page)
```

### 加密与加水印

```python
from pypdf import PdfReader, PdfWriter

# 加密 PDF
writer = PdfWriter()
reader = PdfReader("doc.pdf")
for page in reader.pages:
    writer.add_page(page)
writer.encrypt("password123")     # 设置密码
with open("encrypted.pdf", "wb") as f:
    writer.write(f)

# 批量加水印（把水印 PDF 叠加到每页）
watermark = PdfReader("watermark.pdf").pages[0]
writer = PdfWriter()
for page in PdfReader("doc.pdf").pages:
    page.merge_page(watermark)     # 叠加水印
    writer.add_page(page)
with open("watermarked.pdf", "wb") as f:
    writer.write(f)
```

### 从 HTML/文本创建 PDF

```python
# reportlab（可生成带中文的 PDF，需注册中文字体）
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(TTFont("SimHei", "simhei.ttf"))   # 注册中文字体
c = canvas.Canvas("created.pdf")
c.setFont("SimHei", 16)
c.drawString(100, 750, "你好，PDF！")
c.save()
```

---

## 五、图像处理（Pillow）

```python
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# 打开图像
img = Image.open("photo.jpg")
print(img.size, img.mode)        # (宽,高) 模式(RGB/RGBA/L)

# 基本操作
img.resize((400, 300))           # 缩放
img.rotate(90)                   # 旋转
img.crop((100, 100, 400, 400))   # 裁剪 (left, upper, right, lower)
img.transpose(Image.FLIP_LEFT_RIGHT)   # 水平翻转
img.convert("L")                 # 转灰度
img.thumbnail((200, 200))        # 生成缩略图（保持比例）

# 滤镜
img.filter(ImageFilter.BLUR)             # 模糊
img.filter(ImageFilter.CONTOUR)          # 轮廓
img.filter(ImageFilter.SHARPEN)          # 锐化

# 保存
img.save("output.png")           # 靠扩展名决定格式（可 jpg→png）
img.save("quality.jpg", quality=85)   # JPEG 质量
```

### 绘图与添加水印

```python
from PIL import Image, ImageDraw, ImageFont

img = Image.open("photo.jpg").convert("RGBA")
draw = ImageDraw.Draw(img)

# 画图形
draw.line([(0, 0), (200, 200)], fill="red", width=3)
draw.rectangle([50, 50, 150, 150], outline="blue", width=2)
draw.ellipse([200, 50, 300, 150], fill="green")

# 写文字（含中文需指定字体）
font = ImageFont.truetype("arial.ttf", 36)
draw.text((10, 10), "Hello", fill="white", font=font)

# 图片水印（把 logo 半透明叠加）
logo = Image.open("logo.png").convert("RGBA")
logo.putalpha(128)               # 设置透明度 0-255
img.paste(logo, (10, 10), logo)  # 第三个参数是 mask

img.save("watermarked.png")
```

---

## 六、发送邮件和短信

### 发送电子邮件（smtplib）

```python
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.header import Header

# 1. 构造邮件内容
msg = MIMEMultipart()
msg["From"] = "sender@qq.com"
msg["To"] = "receiver@example.com"
msg["Subject"] = Header("测试邮件", "utf-8")

# 正文（HTML 格式）
body = "<h1>标题</h1><p>这是一封 <b>HTML</b> 邮件</p>"
msg.attach(MIMEText(body, "html", "utf-8"))

# 添加附件
with open("report.pdf", "rb") as f:
    attachment = MIMEText(f.read(), "base64", "utf-8")
    attachment["Content-Type"] = "application/octet-stream"
    attachment["Content-Disposition"] = 'attachment; filename="report.pdf"'
    msg.attach(attachment)

# 2. 通过 SMTP 发送（以 QQ 邮箱为例，用授权码而非登录密码）
try:
    server = smtplib.SMTP_SSL("smtp.qq.com", 465)   # SSL 端口 465
    server.login("sender@qq.com", "授权码")
    server.sendmail("sender@qq.com", ["receiver@example.com"], msg.as_string())
    server.quit()
    print("发送成功")
except smtplib.SMTPException as e:
    print(f"发送失败：{e}")
```

> [!WARNING]
> 邮箱登录用的是 **SMTP 授权码**（在邮箱设置里开启 SMTP 服务后获取），不是网页登录密码。授权码属于敏感信息，务必放环境变量或配置文件，不要硬编码进代码或提交到 Git。

### 发送短信

```python
# 短信需要第三方服务商（阿里云、腾讯云等），这里以阿里云 SDK 为例
from alibabacloud_dysmsapi20170525.client import Client
from alibabacloud_dysmsapi20170525 import models
from alibabacloud_tea_openapi import models as open_api_models

def send_sms(phone, code):
    config = open_api_models.Config(
        access_key_id="你的AK",
        access_key_secret="你的SK",
    )
    config.endpoint = "dysmsapi.aliyuncs.com"
    client = Client(config)
    request = models.SendSmsRequest(
        phone_numbers=phone,
        sign_name="你的签名",
        template_code="SMS_xxx",
        template_param=f'{{"code":"{code}"}}',
    )
    response = client.send_sms(request)
    return response.body.code == "OK"

# 调用
send_sms("13800138000", "123456")
```

---

## 常见问题 Q&A

**Q1：处理旧的 `.xls`（Excel 97-2003）用什么？**
A：openpyxl 只支持 `.xlsx`。老的 `.xls` 用 `xlrd`（读）和 `xlwt`（写）。现在基本都用 `.xlsx` 了。

**Q2：Excel 里写的公式，openpyxl 能算出结果吗？**
A：不能。openpyxl 只写入公式字符串（如 `"=B2+C2"`），不会计算。需要计算结果得用 Excel/WPS 打开触发计算，或用 `formulas` 库，或干脆用 Python 算好再写入值。

**Q3：中文 PDF 提取出来是乱码或空白？**
A：`pypdf` 对某些 PDF（尤其扫描件、特殊编码）支持有限。表格和复杂版式推荐用 `pdfplumber`；扫描件（图片型 PDF）需要先 OCR（如 `pytesseract`）。

**Q4：Pillow 处理中文文字显示方块？**
A：默认字体不含中文。必须用 `ImageFont.truetype("中文字体.ttf", size)` 指定一个中文字体文件（如 simhei.ttf、msyh.ttf）。

**Q5：这些库需要装 Office 吗？**
A：不需要。openpyxl/python-docx/python-pptx 都是纯 Python 操作文件，跨平台，服务器上没装 Office 也能跑，这也是自动化批处理的优势。

**Q6：发邮件端口怎么选？**
A：`465` 用 SSL（`SMTP_SSL`），`587` 用 STARTTLS（`SMTP` + `starttls()`），`25` 常被运营商封禁。推荐 465 SSL。

---

## 复习卡片

> [!TIP]
> **办公自动化速记**
>
> 1. **Excel**：`load_workbook` 读 / `Workbook` 写，`ws.append()` 加行，`iter_rows` 遍历，`openpyxl.chart` 画图
> 2. **Word**：`Document()`，`add_heading/add_paragraph/add_table/add_picture`，`run` 控样式
> 3. **PPT**：`Presentation()`，`slide_layouts` 选版式，`shapes.title` / `placeholders` 填内容
> 4. **PDF**：`pypdf` 合并拆分旋转加密，`pdfplumber` 提文本表格，水印用 `merge_page`
> 5. **图像**：`Image.open`，`resize/rotate/crop/thumbnail/filter`，`ImageDraw` 绘图，`putalpha` 调透明度
> 6. **邮件**：`smtplib` + `MIMEMultipart`，用 SMTP 授权码，465 端口走 SSL
> 7. **安全**：授权码/AK-SK 放环境变量，绝不硬编码进 Git
> 8. **通用优势**：纯 Python 操作，无需装 Office，跨平台可批处理

---

> [!TIP]
> 下一篇：[正则表达式与 Linux](/blog/posts/python-roadmap-06-regex-linux/) 将讲解正则表达式的语法规则和在 Python 中的应用（输入验证、内容提取、替换、拆分），以及 Linux 操作系统的基础命令、文件系统和 Shell 编程。
>
> 返回 [Python 学习路线总览](/blog/posts/python-roadmap-00-overview/) | [合集页](/blog/python-roadmap/)
