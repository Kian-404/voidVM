# 安装部署

## 环境要求

在开始之前，请确保你的系统满足以下要求：

::: tip 系统要求

- **操作系统**: Linux (推荐 Ubuntu 20.04+, CentOS 8+)
- **CPU**: 支持虚拟化扩展 (Intel VT-x 或 AMD-V)
- **内存**: 至少 4GB RAM (推荐 8GB+)
- **存储**: 至少 20GB 可用空间
- **网络**: 稳定的网络连接
  :::

### 软件依赖

- Docker 20.10+
- Docker Compose 1.29.2+
- Node.js 18+ (可选)
- pnpm 7+ (可选)

## 安装步骤

### 1. 检查虚拟化支持

```bash
# 检查 CPU 是否支持虚拟化
egrep -c '(vmx|svm)' /proc/cpuinfo

# 检查 KVM 模块
lsmod | grep kvm
```

### 2. 安装 Docker 和 Docker Compose

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl enable docker
sudo systemctl start docker

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose


```

### 3. 部署启动

```bash
#脚本一键启动(recommended)
./build.sh

#或者手动启动

#构建基础镜像
docker build -f Dockerfile.base -t vm-base:latest .

#使用docker-compose启动
docker-compose up -d

```

::: tip 启动成功
如果一切正常，打开访问浏览器你将看到：

- 服务运行在: http://localhost:3030

:::
