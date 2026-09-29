---
title: '网络爬虫'
published: 2026-09-18T14:30:00+08:00
description: 'Python 网络爬虫全面讲解：爬虫原理与 robots 协议、requests 请求、BeautifulSoup/lxml 解析、正则与 XPath 提取、Selenium 处理动态渲染页面、Scrapy 框架、并发抓取、数据持久化与反爬应对及合规。'
tags: [Python, 爬虫, requests, Scrapy, Selenium, BeautifulSoup]
category: Python学习路线
draft: false
---

> [!NOTE]
> 本文对应仓库 **Day61~65**：网络爬虫原理、抓取动态内容、并发下载、Scrapy 框架、分布式爬虫。爬虫是数据采集的核心技能，广泛用于数据分析、舆情监控、比价、SEO 等场景。但务必**合法合规、尊重目标站点**。

---

## 一、爬虫原理与合规

### 爬虫工作流程

```
1. 获取 URL（种子页面）
2. 发送 HTTP 请求，下载页面内容（HTML/JSON）
3. 解析页面，提取数据 + 提取新 URL
4. 数据持久化（文件/数据库）
5. 对新 URL 重复上述过程（广度/深度优先）
```

### robots 协议

`robots.txt` 是网站的"君子协定"，声明哪些路径允许/禁止爬虫访问。

```
# 访问 https://example.com/robots.txt 查看
User-agent: *              # 对所有爬虫
Disallow: /admin/          # 禁止爬 /admin/
Disallow: /private/
Allow: /public/            # 允许爬 /public/
Crawl-delay: 10            # 爬取间隔 10 秒
```

```python
# Python 内置检查 robots 协议
from urllib.robotparser import RobotFileParser

rp = RobotFileParser()
rp.set_url("https://example.com/robots.txt")
rp.read()
print(rp.can_fetch("*", "https://example.com/data/"))   # True/False
```

> [!WARNING]
> **爬虫合规红线**（务必遵守，否则可能触犯法律）：
> 1. 遵守 robots.txt 协议
> 2. 不爬取需要登录/付费/个人隐私的数据
> 3. 控制频率，不给目标服务器造成压力（加延时、限并发）
> 4. 不爬取受版权保护的内容用于商业牟利
> 5. 抓取的数据合法使用，注明来源
> 6. 反爬措施有明确的法律边界，绕过技术防护可能违法

---

## 二、requests 发起请求

`requests` 是最人性化的 HTTP 库，爬虫第一步。

```bash
pip install requests
```

```python
import requests

# GET 请求
resp = requests.get("https://httpbin.org/get")
print(resp.status_code)          # 200
print(resp.text)                 # 响应文本（HTML/字符串）
print(resp.json())               # 响应 JSON（自动解析为 dict）
print(resp.encoding)             # 编码
print(resp.content)              # 原始字节（下载图片/文件用）

# 带参数
resp = requests.get("https://api.example.com/search",
                    params={"q": "python", "page": 1})   # ?q=python&page=1

# POST 请求
resp = requests.post("https://httpbin.org/post",
                     data={"user": "tom"})               # 表单
resp = requests.post(url, json={"user": "tom"})         # JSON

# 请求头（伪装浏览器，反爬基础）
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    "Referer": "https://www.google.com/",
}
resp = requests.get(url, headers=headers)

# 超时、Cookie、代理
resp = requests.get(url, timeout=10)                    # 超时（必设！）
resp = requests.get(url, cookies={"session": "xxx"})    # 带 Cookie
resp = requests.get(url, proxies={"http": "http://1.2.3.4:8080"})  # 代理
```

### Session 保持会话

```python
# Session 自动管理 Cookie，登录后的请求都复用
session = requests.Session()
session.get("https://example.com/login")
session.post("https://example.com/login", data={"user": "tom", "pwd": "123"})
resp = session.get("https://example.com/profile")   # 已登录状态
```

### 下载文件

```python
# 下载图片/文件（用 content 二进制流式写入）
def download_image(url, filename):
    resp = requests.get(url, timeout=10)
    if resp.status_code == 200:
        with open(filename, "wb") as f:
            f.write(resp.content)

# 大文件流式下载（避免占满内存）
with requests.get(big_file_url, stream=True) as r:
    with open("file.zip", "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            f.write(chunk)
```

> [!TIP]
> 请求失败要**重试 + 异常处理**。用 `requests.adapters.HTTPAdapter` 配合 `urllib3.Retry` 实现自动重试；`resp.raise_for_status()` 在非 2xx 时抛异常。

---

## 三、解析 HTML：BeautifulSoup 与 lxml

拿到 HTML 后要提取数据，两大主流解析库。

### BeautifulSoup（bs4，易用）

```bash
pip install beautifulsoup4 lxml
```

```python
from bs4 import BeautifulSoup

html = """
<div class="articles">
    <h2 id="title">文章标题</h2>
    <a href="/post/1" class="link">链接1</a>
    <a href="/post/2" class="link">链接2</a>
    <p>段落内容</p>
</div>
"""
soup = BeautifulSoup(html, "lxml")      # lxml 解析器（快）

# 查找节点
print(soup.title)                        # 标签
print(soup.find("h2", id="title").text)  # 按标签+属性找单个 → 文章标题
print(soup.find_all("a"))                # 找所有 a 标签

# CSS 选择器（select）
links = soup.select("div.articles a.link")    # 类选择器
for a in links:
    print(a.text, a["href"])             # 文本 + href 属性

# 获取属性
a = soup.find("a")
print(a.get("href"))                     # /post/1
print(a.attrs)                           # {'href': '/post/1', 'class': ['link']}

# 遍历
for child in soup.div.children:          # 直接子节点
    print(child)
```

### CSS 选择器速查

```
tag              标签（div）
.class           类（.article）
#id              ID（#title）
div p            后代（div 内所有 p）
div > p          直接子级
div, span        多个选择器
a[href]          有 href 属性
a[href="/x"]     属性等于
a[href^="http"]  属性以...开头
li:nth-child(2)  第 2 个子元素
```

### lxml + XPath（高效，Scrapy 用）

```python
from lxml import etree

tree = etree.HTML(html)

# XPath 提取
titles = tree.xpath('//h2[@id="title"]/text()')      # 按 id 取文本
links = tree.xpath('//a[@class="link"]/@href')       # 取属性
items = tree.xpath('//div[@class="articles"]/a')     # 取节点

for item in items:
    print(item.xpath('./text()')[0])                 # 相对路径
    print(item.xpath('./@href')[0])
```

```
XPath 语法速查：
//node           任意位置的 node
/node            根下的 node
.                当前节点
..               父节点
@attr            属性
text()           文本
[条件]           过滤（//a[@href]、//li[1]）
*                通配符
|                或
```

> [!NOTE]
> **三种提取方式对比**：正则表达式（`re`）适合简单文本，但对嵌套 HTML 无能为力；BeautifulSoup 用 CSS 选择器最直观易学；XPath 功能最强、性能最好，Scrapy 默认用它。复杂结构优先 XPath/bs4，别用正则解析 HTML。

---

## 四、抓取动态内容（Day62）

很多网站用 JavaScript 动态渲染，`requests` 拿到的是空壳 HTML，数据靠 Ajax 加载。

### 方法1：直接分析 Ajax 接口（首选）

```python
# 打开浏览器 F12 → Network → XHR/Fetch，找到返回数据的接口
# 很多"动态页面"其实是请求 JSON 接口再渲染，直接爬接口最高效！
import requests

api = "https://example.com/api/articles?page=1"
resp = requests.get(api, headers=headers)
data = resp.json()                        # 直接拿到结构化 JSON
for item in data["results"]:
    print(item["title"])
```

### 方法2：Selenium 模拟浏览器（万能但慢）

```bash
pip install selenium
# 还需下载浏览器驱动（ChromeDriver），新版 Selenium 4.6+ 自动管理
```

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# 启动浏览器
options = webdriver.ChromeOptions()
options.add_argument("--headless")        # 无头模式（不显示界面）
driver = webdriver.Chrome(options=options)

try:
    driver.get("https://example.com")

    # 显式等待（等元素出现，比 sleep 可靠）
    element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, ".article-title"))
    )

    # 查找元素
    titles = driver.find_elements(By.CSS_SELECTOR, ".article-title")
    for t in titles:
        print(t.text)

    # 模拟交互
    driver.find_element(By.ID, "load-more").click()      # 点击
    driver.find_element(By.NAME, "q").send_keys("python") # 输入
    driver.execute_script("window.scrollTo(0, 10000)")   # 滚动到底部（触发懒加载）

    # 获取渲染后的 HTML
    print(driver.page_source)
finally:
    driver.quit()                         # 关闭浏览器
```

```
requests vs Selenium：
┌──────────┬────────────────┬────────────────┐
│          │ requests       │ Selenium       │
├──────────┼────────────────┼────────────────┤
│ 执行 JS  │ 否             │ 是（真实浏览器）│
│ 速度     │ 快             │ 慢             │
│ 资源占用 │ 低             │ 高（开浏览器） │
│ 动态页面 │ 需找接口       │ 直接渲染       │
│ 适用     │ 静态/JSON 接口 │ 复杂交互/验证码│
└──────────┴────────────────┴────────────────┘
原则：能爬接口就别用 Selenium，性能差几十倍。
```

> [!TIP]
> 还有更轻量的方案：`Playwright`（微软出品，比 Selenium 快、API 现代）、`requests-html`。处理 JS 渲染优先考虑直接调 Ajax 接口，其次 Playwright/Selenium。

---

## 五、Scrapy 框架（Day63）

Scrapy 是专业的**异步爬虫框架**，适合大规模、结构化抓取，自带调度、去重、管道、中间件。

### 架构与安装

```bash
pip install scrapy
```

```
Scrapy 架构（五大组件）：
       ┌──────────────────────────────────────┐
       │              ENGINE（引擎）            │  总调度
       └──────────────────────────────────────┘
          │          │          │          │
   SCHEDULER     SPIDERS    PIPELINES  DOWNLOADER
   （调度器）    （爬虫）    （管道）    （下载器）
   管理待爬 URL  解析提取    处理数据    发请求下页面
                    │
              DOWNLOADER MIDDLEWARES（下载器中间件：代理、UA、重试）
```

### 创建项目与爬虫

```bash
scrapy startproject myspider          # 创建项目
cd myspider
scrapy genspider quotes quotes.toscrape.com   # 创建爬虫
scrapy crawl quotes                    # 运行爬虫
```

```python
# myspider/spiders/quotes_spider.py
import scrapy

class QuotesSpider(scrapy.Spider):
    name = "quotes"                    # 爬虫名（唯一）
    allowed_domains = ["quotes.toscrape.com"]
    start_urls = ["https://quotes.toscrape.com/page/1/"]

    def parse(self, response):         # 默认回调，解析响应
        # 提取数据
        for quote in response.css("div.quote"):
            yield {                    # yield 字典 → 交给 Pipeline
                "text": quote.css("span.text::text").get(),
                "author": quote.css("small.author::text").get(),
                "tags": quote.css("div.tags a.tag::text").getall(),
            }

        # 翻页：yield Request 继续爬
        next_page = response.css("li.next a::attr(href)").get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)
```

### Item 与 Pipeline

```python
# items.py：定义数据结构（可选，也可直接 yield dict）
import scrapy

class QuoteItem(scrapy.Item):
    text = scrapy.Field()
    author = scrapy.Field()
    tags = scrapy.Field()

# pipelines.py：处理数据（清洗、去重、存库）
class MySpiderPipeline:
    def process_item(self, item, spider):
        item["text"] = item["text"].strip()      # 清洗
        return item

    def open_spider(self, spider):               # 爬虫启动时（连数据库）
        pass
    def close_spider(self, spider):              # 爬虫关闭时（关连接）
        pass
```

```python
# settings.py
ITEM_PIPELINES = {
    "myspider.pipelines.MySpiderPipeline": 300,   # 数字越小越先执行
}
ROBOTSTXT_OBEY = True            # 遵守 robots
DOWNLOAD_DELAY = 1               # 下载延时（防封）
CONCURRENT_REQUESTS = 16         # 并发请求数
DEFAULT_REQUEST_HEADERS = {"User-Agent": "Mozilla/5.0 ..."}
```

### 存储结果

```bash
# 导出为 JSON/CSV
scrapy crawl quotes -o quotes.json
scrapy crawl quotes -o quotes.csv

# 存 MongoDB / MySQL 在 Pipeline 的 process_item 里写库
```

> [!NOTE]
> Scrapy 内置**去重**（同样的请求不重复发）、**异步并发**（Twisted 引擎）、**自动重试**、**限流**，比自己用 requests 循环强大得多。大规模结构化抓取首选 Scrapy；简单小任务用 requests + bs4 即可。

---

## 六、并发抓取与反爬应对

### 并发加速（多线程 / 异步）

```python
# 多线程并发下载
from concurrent.futures import ThreadPoolExecutor

def fetch(url):
    return requests.get(url, headers=headers, timeout=10).text

urls = [f"https://example.com/page/{i}" for i in range(1, 50)]
with ThreadPoolExecutor(max_workers=10) as pool:
    results = list(pool.map(fetch, urls))

# 异步（aiohttp，高并发首选，见语言进阶篇）
# import aiohttp, asyncio
```

### 常见反爬手段与应对

| 反爬手段 | 应对策略 |
|:--|:--|
| 检查 User-Agent | 请求头伪装成浏览器，随机切换 UA |
| 检查 Referer/IP | 带 Referer，使用 IP 代理池 |
| 频率限制 | 加 `DOWNLOAD_DELAY` 延时，控制并发 |
| 登录/验证码 | 带 Cookie/Session，验证码可打码平台或人工 |
| 动态渲染 JS | Selenium/Playwright，或直接爬 Ajax 接口 |
| 数据加密/字体混淆 | 逆向 JS，破解加密参数（有法律风险，谨慎） |

```python
# 随机 User-Agent
import random
UA_LIST = [
    "Mozilla/5.0 ... Chrome/120.0",
    "Mozilla/5.0 ... Firefox/121.0",
    "Mozilla/5.0 ... Safari/605.1",
]
headers = {"User-Agent": random.choice(UA_LIST)}

# 代理池（IP 被封时切换）
proxies = {"http": "http://proxy1:8080", "https": "https://proxy1:8080"}
resp = requests.get(url, headers=headers, proxies=proxies, timeout=10)
```

> [!WARNING]
> 反爬与反反爬是持续的博弈，但**绕过技术防护措施可能违反《反不正当竞争法》《数据安全法》甚至《刑法》**。爬虫的底线是：不碰个人隐私、不破坏系统、不恶意占用资源、不侵犯版权。学习和正当数据采集用，切勿用于非法用途。

---

## 七、爬虫数据存储

```python
# 存 CSV
import csv
with open("data.csv", "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.writer(f)
    writer.writerow(["标题", "作者"])       # 表头
    writer.writerow(["文章1", "张三"])

# 存 JSON
import json
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(items, f, ensure_ascii=False, indent=2)

# 存 MySQL（用 pymysql，见数据库篇）
# 存 MongoDB（适合非结构化，Schema 灵活）
# from pymongo import MongoClient
# client = MongoClient("mongodb://localhost:27017/")
# db = client["spider"]
# db["quotes"].insert_one({"text": "...", "author": "..."})
```

---

## 常见问题 Q&A

**Q1：requests 拿到的是空页面/没有数据？**
A：多半是**动态渲染**——页面数据由 JavaScript 加载。解决：① 打开 F12 → Network → XHR，找返回数据的 Ajax 接口直接爬（首选）；② 用 Selenium/Playwright 执行 JS 渲染后再解析。

**Q2：BeautifulSoup、lxml、正则怎么选？**
A：正则适合从纯文本提取简单模式（如所有邮箱），不适合解析嵌套 HTML；BeautifulSoup 用 CSS 选择器最直观；lxml + XPath 性能最好、功能最强。解析 HTML 优先 bs4/XPath。

**Q3：什么时候用 Scrapy，什么时候用 requests？**
A：小任务、几十个页面、逻辑简单 → requests + bs4 足够；大规模、需翻页/去重/并发/存库、结构化抓取 → Scrapy（自带调度、管道、去重、限流）。

**Q4：`get()` 和 `getall()` 的区别（Scrapy 选择器）？**
A：`get()`（等价 `extract_first()`）返回**第一个**匹配（无匹配返回 None）；`getall()`（等价 `extract()`）返回**所有**匹配的列表。

**Q5：IP 被封了怎么办？**
A：① 降低频率（加延时、减并发）；② 用代理 IP 池轮换；③ 分布式部署在不同机器；④ 遵守 robots、错峰抓取。根本上还是别把人家服务器爬崩，控制速率最重要。

**Q6：如何处理需要登录的网站？**
A：用 `requests.Session()` 保持会话：先请求登录接口（带上 CSRF token、账号密码），登录成功后 Session 自动携带 Cookie，后续请求都是登录态。或用 Selenium 模拟登录后导出 Cookie。注意别爬隐私数据。

**Q7：爬虫合法吗？**
A：爬虫技术本身中立，合法与否看**用途和方式**。遵守 robots、不爬隐私/版权数据、不影响服务器正常运行、数据合法使用，一般没问题；恶意抓取、绕过防护牟利、爬个人隐私可能违法。商用前务必咨询法律意见。

---

## 复习卡片

> [!TIP]
> **网络爬虫速记**
>
> 1. **流程**：获取 URL → 发请求 → 解析 → 存数据 → 提取新 URL 循环
> 2. **合规**：遵守 robots.txt、不碰隐私版权、控频率、不破坏系统
> 3. **requests**：get/post、headers 伪装 UA、Session 保持登录、content 下载、timeout 必设
> 4. **解析三剑客**：正则（纯文本）、BeautifulSoup（CSS 选择器易学）、lxml+XPath（高性能）
> 5. **动态页面**：优先爬 Ajax/JSON 接口；其次 Selenium/Playwright 渲染
> 6. **Scrapy 架构**：Engine/Scheduler/Spiders/Pipelines/Downloader + 中间件
> 7. **Scrapy 用法**：`yield` 数据给 Pipeline，`yield Request/follow` 翻页，`-o` 导出
> 8. **并发**：ThreadPoolExecutor 多线程、aiohttp 异步、Scrapy 自带异步
> 9. **反爬应对**：随机 UA、代理池、延时、Cookie、破解 JS（有法律风险）
> 10. **存储**：CSV/JSON（简单）、MySQL（结构化）、MongoDB（灵活 Schema）

---

> [!TIP]
> 下一篇：[数据分析：NumPy 与 pandas](/blog/posts/python-roadmap-12-data-analysis/) 将进入数据科学赛道，讲解 NumPy 数组运算、pandas 的 Series/DataFrame、数据清洗、分组聚合、合并重塑与时间序列处理。
>
> 返回 [Python 学习路线总览](/blog/posts/python-roadmap-00-overview/) | [合集页](/blog/python-roadmap/)
