# 小熊英语小屋 —— 静态站点镜像
#
# 产物是纯静态的（Vite build + 132 个音频文件），所以运行期只需要一个静态服务器。
# muvee 的约定：容器内必须用 **HTTP** 监听 **8080**，TLS 由 Traefik 终结。

# ── 构建 ────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# corepack 让 pnpm 版本跟着 package.json 的 packageManager 字段走，
# 避免镜像里装出与 pnpm-lock.yaml 不匹配的版本。
# 关掉下载确认提示——非交互构建里它会让 corepack 直接失败而不是自动下载。
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# 先只拷依赖清单，让这一层在源码变动时仍能命中缓存
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ── 运行 ────────────────────────────────────────────────
FROM nginx:1.27-alpine

# 默认站点监听 80，muvee 要 8080，所以整份换掉
RUN rm /etc/nginx/conf.d/default.conf
COPY deploy/nginx.conf /etc/nginx/conf.d/app.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

# nginx 官方镜像的 entrypoint 会跑 /docker-entrypoint.d/ 里的脚本再启动，
# 显式写出前台启动，免得将来换基础镜像时行为变化
CMD ["nginx", "-g", "daemon off;"]
