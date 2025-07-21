#!/bin/bash

# 启动 nginx
service nginx start

# 启动后端服务
cd /app/server
node server.js &

# 保持容器运行
wait