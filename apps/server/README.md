# QEMU 虚拟机管理系统

一个基于 Node.js 和 Express 的 Web 应用，用于管理 QEMU 虚拟机。该系统提供了直观的 Web 界面，允许用户创建、启动、停止和管理虚拟机，并通过 VNC 连接到虚拟机控制台。

![QEMU 虚拟机管理系统截图](https://placeholder-for-screenshot.png)

## 功能特点

- 🖥️ **虚拟机生命周期管理**：创建、启动、停止、重启和删除虚拟机
- 🔄 **ISO 镜像管理**：上传、选择和挂载 ISO 镜像
- 🌐 **VNC 远程访问**：通过浏览器直接访问虚拟机控制台
- 🔌 **网络配置**：支持用户模式和桥接模式网络，以及端口转发
- 📊 **资源监控**：监控虚拟机的 CPU、内存使用情况
- 🔒 **安全管理**：基于用户的访问控制
- 📚 **API 文档**：使用 Swagger 提供完整的 API 文档

## 系统要求

- Node.js 20.x 或更高版本
- QEMU 5.x 或更高版本
- Linux 操作系统（推荐 Ubuntu 20.04 或更高版本）
- 支持硬件虚拟化的 CPU（推荐启用 KVM 加速）

## 快速开始

### 安装依赖

1. 安装 QEMU 和相关工具：

```bash
sudo apt update
sudo apt install qemu-system-x86 qemu-utils
```

2. 克隆仓库并安装 Node.js 依赖：

```bash
git clone https://github.com/yourusername/qemu-manager.git
cd qemu-manager
npm install
```

### 配置

1. 创建配置文件：

```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，根据需要调整配置：

```
PORT=3000
VM_CONFIG_PATH=./vm_configs
ISO_PATH=./isos
DISK_PATH=./disks
VNC_BASE_PORT=5900
MONITOR_BASE_PORT=55000
```

### 运行

#### 开发模式

```bash
npm run dev
```

#### 生产模式

```bash
npm run build
npm start
```

#### 使用 PM2 部署

```bash
npm install pm2 -g
pm2 start ecosystem.config.js
```

### 访问管理界面

打开浏览器访问 `http://localhost:3000`

## API 文档

启动应用后，访问 `http://localhost:3000/api-docs` 查看完整的 API 文档。

## 项目结构

```
qemu-manager/
├── client/                 # 前端代码
│   ├── public/             # 静态资源
│   └── src/                # Vue 源代码
├── server/                 # 后端代码
│   ├── controllers/        # 控制器
│   ├── models/             # 数据模型
│   ├── routes/             # API 路由
│   └── services/           # 业务逻辑服务
├── isos/                   # ISO 镜像存储目录
├── disks/                  # 虚拟机磁盘存储目录
├── vm_configs/             # 虚拟机配置文件
├── logs/                   # 日志文件
├── .env                    # 环境变量配置
├── ecosystem.config.js     # PM2 配置文件
├── server.js               # 应用入口点
└── package.json            # 项目依赖
```

## 虚拟机管理

### 创建虚拟机

1. 在 Web 界面中，点击"创建虚拟机"按钮
2. 填写虚拟机名称、内存大小、CPU 核心数等信息
3. 选择磁盘大小和 ISO 镜像（用于安装操作系统）
4. 配置网络设置
5. 点击"创建"按钮

### 启动虚拟机

1. 在虚拟机列表中，找到要启动的虚拟机
2. 点击"启动"按钮

### 连接到虚拟机

1. 在虚拟机列表中，找到运行中的虚拟机
2. 点击"VNC"按钮，在浏览器中打开 VNC 控制台

### 卸载 ISO 镜像

1. 在虚拟机列表中，找到运行中的虚拟机
2. 点击"卸载 ISO"按钮，移除已挂载的 ISO 镜像

## 网络配置

### 用户模式网络

默认情况下，虚拟机使用用户模式网络，这种模式下虚拟机可以访问外部网络，但外部网络不能直接访问虚拟机。

### 端口转发

要从外部访问虚拟机中的服务，可以配置端口转发：

1. 在创建或编辑虚拟机时，添加端口转发规则
2. 指定主机端口和虚拟机端口
3. 保存配置

### 桥接模式网络

桥接模式允许虚拟机直接连接到物理网络：

1. 在创建或编辑虚拟机时，选择"桥接模式"
2. 选择要桥接的物理网络接口
3. 保存配置

## 故障排除

### 虚拟机无法启动

- 检查 QEMU 是否正确安装：`qemu-system-x86_64 --version`
- 检查磁盘镜像是否存在且可访问
- 查看应用日志：`pm2 logs` 或 `./logs/error.log`

### 无法连接到 VNC

- 确保虚拟机正在运行
- 检查防火墙设置，确保 VNC 端口（默认 5900+）开放
- 尝试使用其他 VNC 客户端连接

### 性能问题

- 确保启用了 KVM 加速：检查 `/dev/kvm` 是否存在且可访问
- 调整虚拟机内存和 CPU 配置，避免过度分配资源
- 使用 SSD 存储虚拟机磁盘镜像

## 贡献指南

欢迎贡献代码、报告问题或提出改进建议！请遵循以下步骤：

1. Fork 仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 致谢

- [QEMU](https://www.qemu.org/) - 强大的开源机器模拟器和虚拟化工具
- [Express](https://expressjs.com/) - 快速、unopinionated 的 Node.js Web 框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [noVNC](https://novnc.com/) - 基于 HTML5 的 VNC 客户端
- [Bootstrap](https://getbootstrap.com/) - 流行的前端组件库

---

**注意**：本项目仅用于教育和开发目的。在生产环境中使用前，请确保进行适当的安全配置。
