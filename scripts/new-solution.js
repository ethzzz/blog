/**
 * 创建一篇练习题解答的 markdown 骨架。
 *
 * 用法：
 *   npm run new-solution -- algo-02-ex01-reverse-string
 *
 * 文件名即访问路径：
 *   algo-02-ex01-reverse-string.md  →  /blog/solutions/algo-02-ex01-reverse-string/
 *
 * 文件名建议按 `<模块>-<篇章号>-ex<题号>-<英文短名>` 命名，
 * 脚本会自动从文件名里推断 module 和 order，不用手动填。
 */

import fs from "node:fs";
import path from "node:path";

function getDate() {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

const args = process.argv.slice(2);

if (args.length === 0) {
	console.error(`Error: No filename argument provided
Usage: npm run new-solution -- <filename>

Example: npm run new-solution -- algo-02-ex01-reverse-string`);
	process.exit(1);
}

const rawName = args[0];

// 补 .md 后缀
const fileExtensionRegex = /\.(md|mdx)$/i;
const fileName = fileExtensionRegex.test(rawName) ? rawName : `${rawName}.md`;
const slug = fileName.replace(fileExtensionRegex, "");

// 从文件名推断：<模块>-<篇章号>-ex<题号>-<短名>
// 例：algo-02-ex01-reverse-string → module=algo, order=1
const namePattern = /^([a-z0-9]+)-(\d+)-ex(\d+)-/i;
const matched = slug.match(namePattern);
let module = "";
let order = 0;
if (matched) {
	module = matched[1];
	order = Number(matched[3]);
}

const targetDir = "./src/content/solutions/";
const fullPath = path.join(targetDir, fileName);

if (fs.existsSync(fullPath)) {
	console.error(`Error: File ${fullPath} already exists`);
	process.exit(1);
}

const dirPath = path.dirname(fullPath);
if (!fs.existsSync(dirPath)) {
	fs.mkdirSync(dirPath, { recursive: true });
}

// relatedPost 需要手动填：所属路线文章的 slug（不含路径）
const content = `---
title: ${slug}
published: ${getDate()}
description: ''
module: ${module}
relatedPost: ''
order: ${order}
difficulty: 中等
tags: []
draft: false
lang: zh-CN
---

## 题目

## 思路

## 代码

## 复杂度

## 复盘
`;

fs.writeFileSync(fullPath, content);

console.log(`Solution created: ${fullPath}`);
console.log(`  URL: /blog/solutions/${slug}/`);
console.log(`  module=${module || "(未推断出，请手填)"}  order=${order}`);
console.log(
	"  ⚠️ 记得把 relatedPost 填成所属路线文章的 slug，否则聚合页会把它归到独立分组",
);
