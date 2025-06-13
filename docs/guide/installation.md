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

- Node.js 18+
- pnpm 8+
- QEMU/KVM
- 现代浏览器

## 安装步骤

### 1. 检查虚拟化支持

```bash
# 检查 CPU 是否支持虚拟化
egrep -c '(vmx|svm)' /proc/cpuinfo

# 检查 KVM 模块
lsmod | grep kvm
```

### 2. 安装 QEMU/KVM

::: code-group

```bash [Ubuntu/Debian]
sudo apt update
sudo apt install qemu-kvm libvirt-daemon-system libvirt-clients bridge-utils
sudo usermod -aG libvirt $USER
sudo usermod -aG kvm $USER
sudo systemctl enable libvirtd
sudo systemctl start libvirtd
```

```bash [CentOS/RHEL]
sudo yum install qemu-kvm libvirt virt-install bridge-utils
sudo usermod -aG libvirt $USER
sudo usermod -aG kvm $USER
sudo systemctl enable libvirtd
sudo systemctl start libvirtd
```

:::

### 3. 安装 Node.js 和 pnpm

```bash
# 安装 Node.js (使用 NodeSource)
curl -fsSL https://deb.nodesource.com/setup_23.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 pnpm
npm install -g pnpm
```

### 4. 下载并启动 VoidVM

```bash
# 克隆项目
git clone https://github.com/Kian-404/voidVM.git
cd void-vm

# 安装依赖
pnpm install

# 复制环境配置
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env

# 启动开发服务器
pnpm dev
```

::: tip 启动成功
如果一切正常，你将看到：

- 前端服务运行在: http://localhost:5173
- 后端服务运行在: http://localhost:3000
  :::
