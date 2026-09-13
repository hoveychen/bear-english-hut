# 小熊英语小屋 —— 静态站点镜像
#
# muvee 的约定：容器内用 **HTTP** 监听 **8080**，TLS 由 Traefik 终结。
#
# 关于架构：这份 Dockerfile 自包含，在**原生 amd64**（GitHub Actions runner）
# 上构建。不要在 Apple Silicon 上加 `--platform linux/amd64` 构建——
# QEMU 模拟 amd64 执行 esbuild（Go 写的）会稳定崩在
# `lfstack.push invalid packing`，那是 Go 运行时的指针打包假设在 QEMU 下不成立。
# 本地想验证就直接 `docker build -t bear .`，用原生 arm64 跑，一切正常。

# ── 构建 ────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# corepack 让 pnpm 版本跟着 package.json 的 packageManager 字段走，
# 避免装出与 pnpm-lock.yaml 不匹配的版本。
# 关掉下载确认提示——非交互构建里它会让 corepack 直接失败而不是自动下载。
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# 先只拷依赖清单，让这一层在源码变动时仍能命中缓存。
# pnpm-workspace.yaml 必须一起拷：它带着 allowBuilds 白名单，
# 缺了它 pnpm 会因 ERR_PNPM_IGNORED_BUILDS 直接失败——
# 本地这只是个警告，非交互环境里是硬错误。
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ── 运行 ────────────────────────────────────────────────
FROM nginx:1.27-alpine

# 整份换掉默认站点：它监听 80，而 muvee 约定容器内监听 8080
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
