---
title: '正则表达式与 Linux'
published: 2026-09-18T12:00:00+08:00
description: '正则表达式语法与 Python re 模块实战（输入验证、内容提取、替换、拆分），以及 Linux 操作系统基础：常用命令、文件系统、Vim、环境变量、Shell 编程与网络管理。'
tags: [Python, 正则表达式, Linux, Shell, re模块]
category: Python学习路线
draft: false
---

> [!NOTE]
> 本文对应仓库 **Day30（正则表达式）和 Day33（玩转 Linux）**。正则是文本处理的利器（爬虫、数据清洗必备），Linux 是后端/运维的操作系统基础。两者都是 Python 开发者的必修课。

---

# 第一部分：正则表达式

## 一、正则语法基础

正则表达式（Regular Expression）是用来**匹配字符串模式**的强大工具。

### 元字符与字符类

| 符号 | 含义 | 示例 |
|:--|:--|:--|
| `.` | 任意单个字符（除换行） | `a.c` 匹配 abc、aXc |
| `\d` | 数字 [0-9] | `\d\d` 匹配 12 |
| `\D` | 非数字 | - |
| `\w` | 单词字符 [a-zA-Z0-9_] | - |
| `\W` | 非单词字符 | - |
| `\s` | 空白（空格/制表/换行） | - |
| `\S` | 非空白 | - |
| `[abc]` | 字符集，匹配其中之一 | `[aeiou]` 匹配元音 |
| `[^abc]` | 取反，不匹配集合内 | - |
| `[a-z]` | 范围 | - |

### 量词（重复次数）

| 符号 | 含义 |
|:--|:--|
| `*` | 0 次或多次 |
| `+` | 1 次或多次 |
| `?` | 0 次或 1 次 |
| `{n}` | 恰好 n 次 |
| `{n,}` | 至少 n 次 |
| `{n,m}` | n 到 m 次 |

### 位置锚点与分组

| 符号 | 含义 |
|:--|:--|
| `^` | 字符串开头 |
| `$` | 字符串结尾 |
| `\b` | 单词边界 |
| `()` | 分组（捕获） |
| `(?:)` | 非捕获分组 |
| `\|` | 或（a\|b） |
| `\` | 转义（`\\.` 匹配点号） |

> [!NOTE]
> **贪婪 vs 非贪婪**：量词默认贪婪（尽量多匹配），加 `?` 变非贪婪（尽量少匹配）。如 `<.+>` 匹配整个 `<a><b>`，而 `<.+?>` 分别匹配 `<a>` 和 `<b>`。

---

## 二、Python re 模块

```python
import re

# match：从字符串开头匹配
m = re.match(r"\d+", "123abc")
print(m.group() if m else None)     # 123

# search：搜索整个字符串，返回第一个匹配
m = re.search(r"\d+", "abc123def")
print(m.group())                    # 123

# findall：返回所有匹配的列表
nums = re.findall(r"\d+", "a1b22c333")
print(nums)                         # ['1', '22', '333']

# finditer：返回迭代器（大量匹配时更省内存）
for m in re.finditer(r"\d+", "a1b2"):
    print(m.group(), m.span())      # 1 (1,2)  2 (3,4)

# sub：替换
result = re.sub(r"\d+", "#", "a1b2")
print(result)                       # a#b#

# subn：替换并返回次数
result, count = re.subn(r"\d", "#", "a1b2")   # ('a#b#', 2)

# split：按模式拆分
parts = re.split(r"[,\s]+", "a, b   c,d")
print(parts)                        # ['a', 'b', 'c', 'd']

# compile：预编译（重复使用同一模式时更高效）
pattern = re.compile(r"\d+")
print(pattern.findall("1a2b3"))     # ['1', '2', '3']
```

### 分组提取

```python
# 用 () 分组，group(n) 取第 n 组
text = "2026-09-18"
m = re.match(r"(\d{4})-(\d{2})-(\d{2})", text)
print(m.group())      # 2026-09-18（整体，group(0)）
print(m.group(1))     # 2026（年）
print(m.group(2))     # 09（月）
print(m.groups())     # ('2026', '09', '18')

# 命名分组 (?P<name>...)
m = re.match(r"(?P<year>\d{4})-(?P<month>\d{2})", text)
print(m.group("year"))       # 2026
print(m.groupdict())         # {'year': '2026', 'month': '09'}
```

### 常用标志（flags）

```python
re.IGNORECASE  # re.I  忽略大小写
re.MULTILINE   # re.M  多行模式（^ $ 匹配每行）
re.DOTALL      # re.S  让 . 也匹配换行
re.VERBOSE     # re.X  允许正则中写注释和空白

# 用法
re.findall(r"python", text, re.IGNORECASE)
```

---

## 三、正则实战例子

### 例1：输入验证

```python
import re

def is_valid_phone(s):
    """中国大陆手机号：1 开头，第二位 3-9，共 11 位"""
    return bool(re.fullmatch(r"1[3-9]\d{9}", s))

def is_valid_email(s):
    """邮箱"""
    return bool(re.fullmatch(r"[\w.-]+@[\w-]+(\.[\w-]+)+", s))

def is_valid_id_card(s):
    """18 位身份证（最后一位可能是 X）"""
    return bool(re.fullmatch(r"\d{17}[\dXx]", s))

def is_strong_password(s):
    """强密码：至少 8 位，含大小写字母和数字"""
    return bool(re.fullmatch(r"(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}", s))

print(is_valid_phone("13800138000"))    # True
print(is_valid_email("a@b.com"))        # True
```

> [!TIP]
> `fullmatch` 要求整个字符串完全匹配；`match` 只要求开头匹配；`search` 找任意位置。做输入验证优先用 `fullmatch`。

### 例2：内容提取

```python
# 从 HTML 提取所有链接
html = '<a href="http://a.com">A</a><a href="http://b.com">B</a>'
links = re.findall(r'href="(.*?)"', html)
print(links)     # ['http://a.com', 'http://b.com']

# 从日志提取 IP 和时间
log = '192.168.1.1 - - [18/Sep/2026:10:00:00] "GET /index"'
m = re.search(r"(\d+\.\d+\.\d+\.\d+).*?\[(.*?)\]", log)
if m:
    print(m.group(1), m.group(2))    # 192.168.1.1  18/Sep/2026:10:00:00
```

### 例3：内容替换（脱敏）

```python
# 手机号中间四位脱敏
phone = "联系电话 13800138000"
safe = re.sub(r"(1[3-9]\d)\d{4}(\d{4})", r"\1****\2", phone)
print(safe)     # 联系电话 138****8000

# 用函数做替换（更灵活）
def double(m):
    return str(int(m.group()) * 2)
result = re.sub(r"\d+", double, "a1b2c3")   # a2b4c6
```

### 例4：长句拆分

```python
# 按多种标点拆分句子
text = "你好。今天天气不错！我们去公园吧？好啊,走。"
sentences = re.split(r"[。！？，,]+", text)
print([s for s in sentences if s])   # 过滤空串
# ['你好', '今天天气不错', '我们去公园吧', '好啊', '走']
```

---

# 第二部分：玩转 Linux

## 四、Linux 基础命令

### 文件与目录操作

```bash
pwd                     # 显示当前目录
ls -l                   # 详细列出文件（-a 显示隐藏，-h 人类可读大小）
cd /home                # 切换目录（cd ~ 回家目录，cd - 回上一个）

mkdir project           # 创建目录（mkdir -p a/b/c 递归创建）
touch file.txt          # 创建空文件
cp src dst              # 复制（cp -r 目录递归复制）
mv old new              # 移动/重命名
rm file                 # 删除（rm -r 目录，rm -f 强制，慎用 rm -rf）

cat file                # 查看全部内容
head -n 20 file         # 看前 20 行
tail -n 20 file         # 看后 20 行（tail -f 实时跟踪日志）
less file               # 分页查看（q 退出）
wc -l file              # 统计行数
```

### 查找与文本处理

```bash
find /path -name "*.py"              # 按名字查找文件
find . -type f -mtime -1             # 找 1 天内修改的文件
grep "error" app.log                 # 在文件中搜索文本
grep -r "TODO" ./src                 # 递归搜索目录
grep -i "error" log                  # 忽略大小写
grep -n "pattern" file               # 显示行号

# 管道组合（Linux 精髓）
ps aux | grep python                 # 找 python 进程
cat access.log | grep 404 | wc -l    # 统计 404 次数
ls -l | sort -k5 -n                  # 按文件大小排序
```

### 进程与权限

```bash
ps aux                  # 查看所有进程
top                     # 实时进程监控（htop 更好用）
kill -9 PID             # 强制杀进程
killall python          # 按名字杀

chmod 755 file          # 改权限（r=4 w=2 x=1，755=rwxr-xr-x）
chmod +x script.sh      # 加执行权限
chown user:group file   # 改属主
```

### 权限数字速记

```
r(读)=4  w(写)=2  x(执行)=1
755 = rwx(7) r-x(5) r-x(5) = 属主全权，组和其他读+执行
644 = rw-(6) r--(4) r--(4) = 属主读写，其他只读（常见文件权限）
600 = rw-(6) ---(0) ---(0) = 仅属主读写（密钥文件）
```

---

## 五、文件系统

```
/               根目录
├── /home       普通用户家目录
├── /root       超级用户家目录
├── /etc        系统配置文件
├── /var        可变数据（/var/log 日志、/var/www 网站）
├── /usr        用户程序和资源
├── /bin        基本命令
├── /tmp        临时文件
├── /opt        第三方软件
└── /proc       系统信息（虚拟文件系统）
```

```bash
# 绝对路径 vs 相对路径
cd /var/www/blog        # 绝对路径（从 / 开始）
cd ./src                # 相对路径（. 当前，.. 上级）

# 磁盘与挂载
df -h                   # 查看磁盘使用
du -sh /var/www         # 查看目录大小
mount /dev/sdb1 /mnt    # 挂载
```

---

## 六、Vim 编辑器

```
Vim 三种模式：
- 普通模式（Normal）：打开即是，用于移动/删除/复制
- 插入模式（Insert）：按 i 进入，编辑文本，按 Esc 退出
- 命令模式（Command）：按 : 进入，执行命令

常用操作：
i        进入插入模式
Esc      回到普通模式
:w       保存
:q       退出
:wq      保存并退出
:q!      不保存强制退出
dd       删除当前行
yy       复制当前行
p        粘贴
u        撤销
/word    搜索
:n       跳到第 n 行
```

---

## 七、环境变量与 Shell 编程

### 环境变量

```bash
echo $PATH              # 查看 PATH
export MY_VAR="hello"   # 设置环境变量（当前会话）
env                     # 查看所有环境变量

# 永久生效：写入 ~/.bashrc 或 ~/.zshrc
echo 'export PATH=$PATH:/my/bin' >> ~/.bashrc
source ~/.bashrc        # 重新加载
```

### Shell 脚本基础

```bash
#!/bin/bash
# 保存到 script.sh，chmod +x script.sh，./script.sh 运行

# 变量（无类型，$ 引用）
name="Ethan"
echo "Hello, $name"
echo "当前时间：$(date)"      # 命令替换

# 接收参数
echo "脚本名：$0"
echo "第一个参数：$1"
echo "参数个数：$#"
echo "所有参数：$@"

# 条件判断
if [ -f "file.txt" ]; then        # -f 文件存在，-d 目录，-z 空串
    echo "文件存在"
else
    echo "文件不存在"
fi

# 循环
for i in 1 2 3; do
    echo "数字 $i"
done

for file in *.py; do
    echo "找到 $file"
done

count=0
while [ $count -lt 3 ]; do        # -lt 小于, -gt 大于, -eq 等于
    echo $count
    count=$((count + 1))
done

# 函数
greet() {
    echo "Hello, $1"
}
greet "World"
```

---

## 八、软件安装与网络

```bash
# 包管理（Debian/Ubuntu）
sudo apt update                # 更新软件源
sudo apt install python3       # 安装
sudo apt remove python3        # 卸载

# CentOS/RHEL 用 yum / dnf
sudo yum install nginx

# 网络命令
ping baidu.com                 # 测试连通
curl -I https://example.com    # 查看 HTTP 头
wget https://example.com/f.zip # 下载文件
netstat -tlnp                  # 查看监听端口（或 ss -tlnp）
ssh user@host                  # 远程登录
scp file user@host:/path       # 远程复制
```

---

## 常见问题 Q&A

**Q1：`match`、`search`、`findall`、`fullmatch` 区别？**
A：`match` 从头匹配（不匹配开头就失败）；`search` 全文找第一个；`findall` 找全部返回列表；`fullmatch` 要求整个字符串完全匹配。验证输入用 `fullmatch`，提取用 `search`/`findall`。

**Q2：正则里为什么要写 `r"..."`（原始字符串）？**
A：因为正则大量使用反斜杠（`\d`、`\s`），而 Python 字符串里 `\` 是转义符。加 `r` 前缀让 `\` 不被 Python 转义，直接传给正则引擎。不写 `r` 就得写 `\\d`，很麻烦。

**Q3：`\d+` 和 `\d+?` 区别？**
A：`\d+` 贪婪（尽量多匹配数字），`\d+?` 非贪婪（尽量少匹配，只匹配 1 个）。提取 HTML 标签、成对分隔符时常用非贪婪。

**Q4：Linux 下 `rm -rf` 为什么危险？**
A：`-r` 递归删目录，`-f` 强制不提示。`rm -rf /` 会删整个系统。生产环境操作前务必确认路径，别在变量为空时 `rm -rf $VAR/`。

**Q5：Shell 里 `[ ]` 判断为什么两边要空格？**
A：`[` 本身是个命令（等价 `test`），`]` 是它的参数，命令和参数之间必须有空格。`[ -f file ]` 对，`[-f file]` 错。

**Q6：`chmod 755` 和 `chmod +x` 有何区别？**
A：`+x` 只是加执行权限（保留其他）；`755` 是精确设置所有权限位（属主 rwx、组 r-x、其他 r-x）。脚本一般 `chmod +x`，部署产物常设 `755`。

---

## 复习卡片

> [!TIP]
> **本篇速记**
>
> **正则**
> 1. 字符类：`\d` 数字 `\w` 单词 `\s` 空白 `.` 任意 `[abc]` 集 `[^abc]` 反
> 2. 量词：`*`0+ `+`1+ `?`0/1 `{n,m}`n到m，加 `?` 变非贪婪
> 3. 锚点：`^` 开头 `$` 结尾 `\b` 词边界
> 4. re 方法：`match`(头) `search`(首个) `findall`(全部) `sub`(替换) `split`(拆) `fullmatch`(全匹配)
> 5. 分组：`()` 捕获 `group(n)`，`(?P<名>)` 命名分组
> 6. 用 `r"..."` 原始字符串写正则
>
> **Linux**
> 7. 文件：`ls/cd/pwd/cp/mv/rm/mkdir/touch/cat/head/tail/grep/find`
> 8. 权限：`chmod 755`（rwx=7/5/4）、`chown`；644 文件、755 目录/脚本、600 密钥
> 9. 进程：`ps aux`、`top`、`kill -9`
> 10. 管道 `|` 组合命令是精髓
> 11. Shell：`$1` 参数、`if [ -f x ]`、`for/while`、`#!/bin/bash`

---

> [!TIP]
> 下一篇：[Python 语言进阶](/blog/posts/python-roadmap-07-advanced/) 将讲解数据结构与算法基础、迭代器与生成器、并发编程（多线程/多进程/异步 IO），以及 Web 前端入门知识。
>
> 返回 [Python 学习路线总览](/blog/posts/python-roadmap-00-overview/) | [合集页](/blog/python-roadmap/)
