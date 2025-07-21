# 部署指南

## Docker 部署

### 1. Dockerfile 配置

```dockerfile
# Dockerfile.base
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Shanghai


# 安装基础工具和编译依赖
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    unzip \
    git \
    websockify \
    build-essential \
    python3 \
    python3-pip \
    ninja-build \
    libglib2.0-dev \
    libfdt-dev \
    libpixman-1-dev \
    zlib1g-dev \
    libnfs-dev \
    libiscsi-dev \
    pkg-config \
    meson \
    libslirp-dev \
    device-tree-compiler \
    flex \
    bison \
    net-tools \
    netcat-openbsd \
    iproute2 \
    iptables \
    && rm -rf /var/lib/apt/lists/*

RUN pip3 install tomli --break-system-packages -i https://pypi.tuna.tsinghua.edu.cn/simple
RUN pip3 install sphinx --break-system-packages -i https://pypi.tuna.tsinghua.edu.cn/simple
RUN pip3 install ninja --break-system-packages -i https://pypi.tuna.tsinghua.edu.cn/simple
# 安装Node.js 23.x
RUN curl -fsSL https://nodejs.org/dist/v23.6.0/node-v23.6.0-linux-x64.tar.xz -o node.tar.xz \
    && tar -xJf node.tar.xz -C /usr/local --strip-components=1 \
    && rm node.tar.xz

# 验证Node.js安装
RUN node --version && npm --version

# 下载并编译QEMU (10.0.2)
RUN cd /tmp \
    && wget https://download.qemu.org/qemu-10.0.2.tar.xz \
    && tar xvf qemu-10.0.2.tar.xz \
    && cd qemu-10.0.2 \
    && ./configure --target-list=x86_64-softmmu,i386-softmmu,aarch64-softmmu --enable-slirp \
    && make -j$(nproc) \
    && make install \
    && cd / \
    && rm -rf /tmp/qemu-10.0.2*

# 验证QEMU版本
RUN qemu-system-x86_64 --version

# 安装npm工具
RUN npm install -g yarn pm2 nodemon
RUN npm config set registry https://registry.npmmirror.com/


# 克隆 noVNC
RUN mkdir -p /root/test

# 下载 noVNC 压缩包
WORKDIR /opt
RUN wget https://bgithub.xyz/novnc/noVNC/archive/refs/heads/master.zip -O novnc.zip \
    && unzip novnc.zip \
    && mv noVNC-master noVNC \
    && rm novnc.zip

RUN ln -s /opt/noVNC /root/test/noVNC


CMD ["/bin/bash"]


```

```dockerfile
# Dockerfile
# 使用自定义基础镜像
FROM vm-base:latest

# 设置工作目录
RUN mkdir -p /app
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

# 安装和配置 nginx
RUN apt-get update && apt-get install -y nginx && \
    rm -rf /var/lib/apt/lists/*

# 创建 nginx 配置文件
RUN mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

# 复制前端构建文件到 nginx 目录
RUN mkdir -p /var/www/html
RUN cp -r ./web/dist/* /var/www/html/

# 复制 nginx 配置文件
COPY nginx.conf /etc/nginx/sites-available/vm-manager

# 启用站点配置
RUN ln -s /etc/nginx/sites-available/vm-manager /etc/nginx/sites-enabled/
RUN rm -f /etc/nginx/sites-enabled/default

# 设置工作目录到server
WORKDIR /app/server

# 设置环境变量
ENV NODE_ENV=production

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh
# 暴露端口 (nginx 监听 5173，后端服务内部通信)
EXPOSE 5173
# 启动应用
CMD ["/app/start.sh"]

```

### 2. Docker Compose 配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  # VoidVM 主应用
  vm-app:
    build:
      context: .
      dockerfile: Dockerfile10
    container_name: vm-app
    # 使用host网络模式时，移除ports配置
    # ports:
    #   - '3030:3030' # API 服务端口
    #   - '6080:6080' # VNC/WebSocket 端口
    volumes:
      - /root/app/iso:/app/server/iso
      - /root/app/vm-storage:/app/server/vm-storage
      - /root/app/vm-snapshots:/app/server/data/snapshots
    network_mode: host # 使用 host 网络模式
    restart: unless-stopped
    privileged: true
  network-service:
    build: .
    cap_add:
      - NET_ADMIN
      - NET_RAW
    devices:
      - /dev/net/tun:/dev/net/tun
```

### 3. 环境变量配置

```bash
# .env.production
# 数据库配置
DB_USER=voidvm
DB_PASSWORD=secure_password_here
DB_HOST=database
DB_PORT=5432
DB_NAME=voidvm

# JWT 配置
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Redis 配置
REDIS_URL=redis://redis:6379

# 应用配置
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# QEMU 配置
QEMU_BINARY_PATH=/usr/bin/qemu-system-x86_64
VM_STORAGE_PATH=/data/vms
ISO_STORAGE_PATH=/data/isos
```

## Kubernetes 部署

### 1. Namespace 和 ConfigMap

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: voidvm

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: voidvm-config
  namespace: voidvm
data:
  NODE_ENV: 'production'
  LOG_LEVEL: 'info'
  DB_HOST: 'postgres-service'
  DB_PORT: '5432'
  DB_NAME: 'voidvm'
  REDIS_URL: 'redis://redis-service:6379'
  QEMU_BINARY_PATH: '/usr/bin/qemu-system-x86_64'
  VM_STORAGE_PATH: '/data/vms'
  ISO_STORAGE_PATH: '/data/isos'
```

### 2. 后端服务部署

```yaml
# k8s/server-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: voidvm-server
  namespace: voidvm
spec:
  replicas: 3
  selector:
    matchLabels:
      app: voidvm-server
  template:
    metadata:
      labels:
        app: voidvm-server
    spec:
      containers:
        - name: server
          image: voidvm/server:latest
          ports:
            - containerPort: 3000
          env:
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: voidvm-secrets
                  key: jwt-secret
            - name: DB_USER
              valueFrom:
                secretKeyRef:
                  name: voidvm-secrets
                  key: db-user
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: voidvm-secrets
                  key: db-password
          envFrom:
            - configMapRef:
                name: voidvm-config
          volumeMounts:
            - name: vm-storage
              mountPath: /data/vms
            - name: iso-storage
              mountPath: /data/isos
          resources:
            requests:
              memory: '512Mi'
              cpu: '250m'
            limits:
              memory: '2Gi'
              cpu: '1000m'
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
      volumes:
        - name: vm-storage
          persistentVolumeClaim:
            claimName: vm-storage-pvc
        - name: iso-storage
          persistentVolumeClaim:
            claimName: iso-storage-pvc
      securityContext:
        privileged: true

---
apiVersion: v1
kind: Service
metadata:
  name: voidvm-server-service
  namespace: voidvm
spec:
  selector:
    app: voidvm-server
  ports:
    - protocol: TCP
      port: 3000
      targetPort: 3000
  type: ClusterIP
```

### 3. 前端服务部署

```yaml
# k8s/web-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: voidvm-web
  namespace: voidvm
spec:
  replicas: 2
  selector:
    matchLabels:
      app: voidvm-web
  template:
    metadata:
      labels:
        app: voidvm-web
    spec:
      containers:
        - name: web
          image: voidvm/web:latest
          ports:
            - containerPort: 80
          resources:
            requests:
              memory: '64Mi'
              cpu: '50m'
            limits:
              memory: '128Mi'
              cpu: '100m'

---
apiVersion: v1
kind: Service
metadata:
  name: voidvm-web-service
  namespace: voidvm
spec:
  selector:
    app: voidvm-web
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP
```

### 4. Ingress 配置

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: voidvm-ingress
  namespace: voidvm
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: 'true'
    cert-manager.io/cluster-issuer: 'letsencrypt-prod'
spec:
  tls:
    - hosts:
        - voidvm.example.com
      secretName: voidvm-tls
  rules:
    - host: voidvm.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: voidvm-server-service
                port:
                  number: 3000
          - path: /ws
            pathType: Prefix
            backend:
              service:
                name: voidvm-server-service
                port:
                  number: 3000
          - path: /
            pathType: Prefix
            backend:
              service:
                name: voidvm-web-service
                port:
                  number: 80
```

## 持续集成/持续部署

### GitHub Actions 配置

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run linting
        run: pnpm lint

      - name: Run type checking
        run: pnpm type-check

      - name: Run unit tests
        run: pnpm test:unit

      - name: Run integration tests
        run: pnpm test:integration

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push server image
        uses: docker/build-push-action@v4
        with:
          context: ./apps/server
          push: true
          tags: voidvm/server:latest,voidvm/server:${{ github.sha }}

      - name: Build and push web image
        uses: docker/build-push-action@v4
        with:
          context: ./apps/web
          push: true
          tags: voidvm/web:latest,voidvm/web:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to staging
        run: |
          echo "Deploying to staging environment..."
          # 部署到测试环境的脚本

      - name: Run E2E tests
        run: |
          echo "Running E2E tests against staging..."
          # E2E 测试脚本

      - name: Deploy to production
        if: success()
        run: |
          echo "Deploying to production environment..."
          # 部署到生产环境的脚本
```

## 监控和日志

### Prometheus 监控配置

```yaml
# configs/prometheus/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'voidvm-server'
    static_configs:
      - targets: ['voidvm-server-service:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

### Grafana 仪表板配置

```json
{
  "dashboard": {
    "title": "VoidVM Monitoring",
    "panels": [
      {
        "title": "Virtual Machines Status",
        "type": "stat",
        "targets": [
          {
            "expr": "voidvm_vms_total",
            "legendFormat": "Total VMs"
          },
          {
            "expr": "voidvm_vms_running",
            "legendFormat": "Running VMs"
          }
        ]
      },
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ]
      },
      {
        "title": "System Resources",
        "type": "graph",
        "targets": [
          {
            "expr": "voidvm_cpu_usage_percent",
            "legendFormat": "CPU Usage %"
          },
          {
            "expr": "voidvm_memory_usage_percent",
            "legendFormat": "Memory Usage %"
          }
        ]
      }
    ]
  }
}
```
