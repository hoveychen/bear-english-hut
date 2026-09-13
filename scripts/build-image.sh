#!/usr/bin/env bash
#
# 构建并（可选）推送部署镜像。
#
#   scripts/build-image.sh           # 只构建
#   scripts/build-image.sh --push    # 构建并推送到 ghcr
#
# 两步走是有原因的：先在宿主机原生构建静态产物，再打包进 linux/amd64 镜像。
# 详见 Dockerfile 顶部——在 Apple Silicon 上用 QEMU 模拟 amd64 跑 esbuild 会崩。
set -euo pipefail

cd "$(dirname "$0")/.."

IMAGE="${IMAGE:-ghcr.io/hoveychen/bear-english-hut}"
TAG="${TAG:-latest}"
PUSH=0
[ "${1:-}" = "--push" ] && PUSH=1

echo "==> 构建静态产物"
pnpm build

echo "==> 校验音频完整性"
# 音频缺了不会让构建失败，但会让线上有些句子变回浏览器 TTS，值得在打包前看一眼
node scripts/verify-audio.ts

test -f dist/index.html || { echo "✗ dist/index.html 不在，构建没产出"; exit 1; }
echo "    dist: $(find dist -type f | wc -l | tr -d ' ') 个文件，$(du -sh dist | cut -f1)"

echo "==> 构建镜像 ${IMAGE}:${TAG} (linux/amd64)"
if [ "$PUSH" = "1" ]; then
  docker buildx build --platform linux/amd64 -t "${IMAGE}:${TAG}" --push .
  echo "✓ 已推送 ${IMAGE}:${TAG}"
else
  docker buildx build --platform linux/amd64 -t "${IMAGE}:${TAG}" --load .
  echo "✓ 已构建到本地（加 --push 可推送）"
fi
