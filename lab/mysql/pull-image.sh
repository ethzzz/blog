#!/usr/bin/env bash
# 拉 MySQL 镜像：Docker Hub 直连过慢（8.4 约 600MB，实测卡在下载层），
# 依次试公开镜像站，成功后 retag 成 mysql:8.4，让 compose 文件不用改。
#
# 为什么写成脚本而不是一行命令：`wsl.exe bash -lc 'for m in ...; do ... $m ...; done'`
# 这层传参把循环变量吃掉了（实测输出「试 」空值 + invalid reference format）。
# 凡是带循环、变量、嵌套引号的命令，一律落成脚本文件再执行。
set -uo pipefail

try() {
  local ref="$1"
  echo "→ 拉取 $ref"
  if timeout 420 docker pull "$ref"; then
    docker tag "$ref" mysql:8.4
    echo "OK：已 retag 为 mysql:8.4"
    return 0
  fi
  echo "× 失败：$ref"
  return 1
}

for ref in \
  docker.m.daocloud.io/library/mysql:8.4 \
  docker.1ms.run/library/mysql:8.4 \
  mysql:8.4
do
  if try "$ref"; then break; fi
done

docker images --format '{{.Repository}}:{{.Tag}}  {{.Size}}' | grep -i mysql || echo "仍然没有 mysql 镜像"
