# 小熊英语小屋 —— 静态站点镜像
#
# 只打包**已经构建好**的 dist/，不在镜像里跑 Vite。先跑 scripts/build-image.sh。
#
# 为什么不做成多阶段、在镜像里构建？因为 muvee 要 linux/amd64，而开发机是
# Apple Silicon。在 arm64 上用 QEMU 模拟 amd64 执行 esbuild（Go 写的）会稳定
# 崩在 `lfstack.push invalid packing` —— Go 运行时的指针打包假设在 QEMU 下不成立。
# 静态站点的产物与架构无关，所以在宿主机原生构建、镜像里只做打包，
# 既绕开模拟，也让镜像层只剩 nginx + 静态文件。
#
# （如果将来放到原生 amd64 的 CI 上构建，可以再把 node 构建阶段加回来。）

FROM nginx:1.27-alpine

# 整份换掉默认站点：它监听 80，而 muvee 约定容器内监听 8080。
# 直接覆盖 default.conf 而不是先 RUN rm —— 构建期一条 amd64 指令都不执行。
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf

COPY dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
