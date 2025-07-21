# 快速开始

本指南将帮助你在 5 分钟内快速体验 VoidVM 的基本功能。

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
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
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

# 启动开发服务器
pnpm dev
```

::: tip 启动成功
如果一切正常，你将看到：

- 前端服务运行在: http://localhost:5173
- 后端服务运行在: http://localhost:3030
  :::

## 首次使用

### 1. 访问 Web 界面

打开浏览器，访问 `http://localhost:5173`，你将看到 VoidVM 的界面。

### 2. 创建第一个虚拟机

1. **上传镜像文件**

   点击左侧菜单的"镜像管理"，上传你的 ISO 镜像文件：

   ```bash
   # 示例：下载 Ubuntu Server 镜像
   wget https://releases.ubuntu.com/20.04/ubuntu-20.04.6-live-server-amd64.iso
   ```

2. **创建虚拟机**

   ```vue
   <!-- 虚拟机配置示例 -->
   <template>
     <el-form :model="vmConfig" label-width="120px">
       <el-form-item label="虚拟机名称">
         <el-input v-model="vmConfig.name" placeholder="my-first-vm" />
       </el-form-item>
       <el-form-item label="CPU 核数">
         <el-input-number v-model="vmConfig.cpu" :min="1" :max="8" />
       </el-form-item>
       <el-form-item label="内存大小">
         <el-input-number v-model="vmConfig.memory" :min="512" :max="8192" />
         <span style="margin-left: 10px;">MB</span>
       </el-form-item>
       <el-form-item label="磁盘大小">
         <el-input-number v-model="vmConfig.disk" :min="10" :max="500" />
         <span style="margin-left: 10px;">GB</span>
       </el-form-item>
     </el-form>
   </template>
   ```

3. **启动虚拟机**

   创建完成后，点击"启动"按钮，虚拟机将开始启动。

### 3. 连接到虚拟机

VoidVM 提供多种连接方式：

#### VNC 控制台

```javascript
// 打开 VNC 控制台
const openVncConsole = vmId => {
  window.open(`/console/vnc/${vmId}`, '_blank')
}
```

#### SSH 连接

```bash
# 通过端口转发连接
ssh user@localhost -p 2222
```

## 常见问题

### Q: 虚拟机启动失败？

A: 请检查以下几点：

1. 确认 KVM 模块已加载
2. 检查用户是否在 `kvm` 和 `libvirt` 组中
3. 确认镜像文件路径正确
4. 查看后端日志获取详细错误信息

```bash
# 检查日志
pnpm --filter server logs
```

### Q: 无法连接到 VNC 控制台？

A: 检查防火墙设置和端口转发：

```bash
# 检查 VNC 端口是否开放
netstat -tlnp | grep :590
```

### Q: 性能不佳？

A: 优化建议：

1. 启用 KVM 硬件加速
2. 增加虚拟机内存分配
3. 使用 virtio 驱动
4. 调整磁盘缓存策略

## 下一步

现在你已经成功运行了第一个虚拟机！接下来可以：

- 📖 [深入了解配置选项](/guide/configuration)
- 🔧 [学习高级虚拟机管理](/guide/vm-management)
- 🚀 [部署到生产环境](/guide/installation)
- 📚 [查看 API 文档](/api/)

## 获得帮助

如果遇到问题，可以通过以下方式获得帮助：

- 📖 查看[完整文档](/guide/)
- 🐛 提交 [GitHub Issue](https://github.com/Kian-404/voidVM/issues)
- 💬 加入我们的社区讨论
