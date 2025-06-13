---
layout: home

hero:
  name: 'VoidVM'
  text: '现代化虚拟机管理平台'
  tagline: 基于 Vue + Node.js + QEMU 的强大虚拟机管理解决方案
  image:
    src: /logo.svg
    alt: VoidVM
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看 GitHub
      link: https://github.com/Kian-404/voidVM

features:
  - icon: 🚀
    title: 现代化界面
    details: 基于 Vue + BootStrap 构建的现代化 Web 界面，提供直观的操作体验

  - icon: ⚡
    title: 高性能
    details: 基于 QEMU/KVM 虚拟化技术，提供接近原生的性能表现

  - icon: 🛠️
    title: 易于管理
    details: 提供完整的虚拟机生命周期管理，包括创建、启动、停止、快照等功能

  - icon: 🔧
    title: 可扩展
    details: 采用 pnpm workspace 单体仓库架构，支持插件化扩展

  - icon: 📱
    title: 响应式设计
    details: 支持桌面端和移动端访问，随时随地管理你的虚拟机

  - icon: 🔒
    title: 安全可靠
    details: 内置用户认证和权限管理，确保虚拟机资源的安全访问
---

## 快速体验

::: code-group

```bash [pnpm]
# 克隆项目
git clone https://github.com/Kian-404/voidVM.git
cd void-vm

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

```bash [npm]
# 克隆项目
git clone https://github.com/Kian-404/voidVM.git
cd void-vm

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

:::

## 技术栈

<div class="tech-stack">
  <img src="https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue.js">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" alt="Express">
  <img src="https://img.shields.io/badge/QEMU-FF6600?style=for-the-badge&logo=qemu&logoColor=white" alt="QEMU">
</div>

<style>
.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0;
}

.tech-stack img {
height: 28px;
}
</style>
