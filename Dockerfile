# 使用自定义基础镜像
# FROM test-node-ubuntu:latest
FROM viod-vm-base:latest

RUN mkdir -p /app

# 设置工作目录
WORKDIR /app

# 阶段1: 构建前端
COPY apps/web/package*.json ./web/
RUN cd web && npm install

COPY apps/web ./web/
RUN cd web && npm run build

# 阶段2: 准备后端
COPY apps/server/package*.json ./server/
RUN cd server && npm install --production

COPY apps/server ./server/

# 创建public目录并复制前端构建文件
RUN mkdir -p ./server/public
RUN cp -r ./web/dist/* ./server/public/
# 如果前端输出是dist目录，则使用：
# RUN cp -r ./web/dist/* ./server/public/

# 设置工作目录到server
WORKDIR /app/server

# 设置环境变量
ENV NODE_ENV=production

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]

