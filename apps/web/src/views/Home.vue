<template>
  <div class="home">
    <div class="jumbotron bg-light p-5 rounded">
      <h1 class="display-4">VM 虚拟机管理系统</h1>
      <p class="lead">
        一个基于 Node.js 和 Vue 3 的现代化 QEMU 虚拟机管理平台，让虚拟机管理变得简单高效。
      </p>
      <hr class="my-4" />
      <div class="user" v-if="config.isOpenAuth">
        <div v-if="user">
          <p>
            欢迎回来，<strong>{{ displayName }}</strong>
          </p>
          <div class="d-grid gap-2 d-md-flex justify-content-md-start">
            <router-link to="/dashboard" class="btn btn-primary me-md-2">进入控制台</router-link>
            <router-link to="/profile" class="btn btn-outline-primary me-md-2"
              >个人设置</router-link
            >
            <button @click="handleLogout" class="btn btn-outline-secondary" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              退出登录
            </button>
          </div>
        </div>

        <div v-else>
          <p>请登录或注册以访问完整功能。</p>
          <div class="d-grid gap-2 d-md-flex justify-content-md-start">
            <router-link to="/login" class="btn btn-primary me-md-2">登录</router-link>
            <router-link to="/register" class="btn btn-outline-primary">注册</router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统特点 -->
    <h2 class="text-center my-5">系统特点</h2>
    <div class="row mt-4">
      <div v-for="feature in features" :key="feature.id" class="col-md-4 mb-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="mb-3">
              <i :class="feature.iconClass"></i>
            </div>
            <h5 class="card-title">{{ feature.title }}</h5>
            <p class="card-text">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 技术栈 -->
    <h2 class="text-center my-5">技术栈</h2>
    <div class="row mt-4">
      <div v-for="tech in techStack" :key="tech.id" class="col-md-3 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ tech.category }}</h5>
            <ul class="list-unstyled">
              <li v-for="item in tech.items" :key="item">
                <i class="bi bi-check-circle-fill text-success me-2"></i>{{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速开始 -->
    <div class="mt-5 p-5 bg-light rounded">
      <h2 class="text-center mb-4">快速开始</h2>
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-body">
              <ol>
                <li v-for="step in quickStartSteps" :key="step.id" class="mb-3">
                  {{ step.text }}
                </li>
              </ol>
              <div class="text-center mt-4">
                <button @click="handleStart" class="btn btn-primary">立即开始</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { supabase } from '../utils/supabase'
  import { useAuthStore } from '../stores/auth'
  import { config } from '../utils/config'
  // 接口定义
  interface Feature {
    id: number
    title: string
    description: string
    iconClass: string
  }

  interface TechStack {
    id: number
    category: string
    items: string[]
  }

  interface QuickStartStep {
    id: number
    text: string
  }

  // 响应式数据
  const router = useRouter()
  const authStore = useAuthStore()
  const user = ref<any>(null)
  const loading = ref(false)

  // 计算属性
  const displayName = computed(() => {
    if (!user.value) return ''
    return user.value.user_metadata?.full_name || user.value.email
  })

  // 系统特点数据
  const features = ref<Feature[]>([
    {
      id: 1,
      title: '虚拟机生命周期管理',
      description: '轻松创建、启动、停止、重启和删除虚拟机，完整管理虚拟机的整个生命周期。',
      iconClass: 'bi bi-hdd-stack fs-1 text-primary',
    },
    {
      id: 2,
      title: '基于 Web 的远程访问',
      description: '通过集成的 NoVNC 技术，直接在浏览器中访问虚拟机的图形界面，无需安装额外软件。',
      iconClass: 'bi bi-display fs-1 text-primary',
    },
    {
      id: 3,
      title: '灵活的配置选项',
      description: '自定义 CPU、内存、磁盘和网络设置，根据需求精确配置每台虚拟机。',
      iconClass: 'bi bi-sliders fs-1 text-primary',
    },
    {
      id: 4,
      title: '文件上传与管理',
      description: '便捷地向虚拟机上传 ISO 镜像和其他文件，支持拖放操作和进度显示。',
      iconClass: 'bi bi-cloud-arrow-up fs-1 text-primary',
    },
    {
      id: 5,
      title: '安全的用户认证',
      description: '基于 Supabase 的安全认证系统，保护您的虚拟机免受未授权访问。',
      iconClass: 'bi bi-shield-check fs-1 text-primary',
    },
    {
      id: 6,
      title: '资源监控',
      description: '实时监控虚拟机的 CPU、内存和磁盘使用情况，确保系统性能最优。',
      iconClass: 'bi bi-graph-up fs-1 text-primary',
    },
  ])

  // 技术栈数据
  const techStack = ref<TechStack[]>([
    {
      id: 1,
      category: '前端',
      items: ['Vue 3 + TypeScript', 'Bootstrap 5', 'Pinia 状态管理', 'Vue Router'],
    },
    {
      id: 2,
      category: '后端',
      items: ['Node.js', 'Express', 'WebSocket', 'SSH2'],
    },
    {
      id: 3,
      category: '虚拟化',
      items: ['QEMU/KVM', 'NoVNC', 'WebSockify', 'VirtIO 驱动'],
    },
    {
      id: 4,
      category: '认证与存储',
      items: ['Supabase 认证', '文件系统存储', 'JSON 配置', '环境变量'],
    },
  ])

  // 快速开始步骤
  const quickStartSteps = ref<QuickStartStep[]>([
    { id: 1, text: '注册账户并登录系统' },
    { id: 2, text: '进入控制台，点击"创建虚拟机"' },
    { id: 3, text: '配置虚拟机参数（CPU、内存、磁盘等）' },
    { id: 4, text: '上传 ISO 镜像或选择已有镜像' },
    { id: 5, text: '启动虚拟机并通过 NoVNC 访问' },
  ])

  // 工具函数
  const isLoggedIn = (): boolean => {
    return authStore.isAuthenticated
  }

  const initializeUser = async (): Promise<void> => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      user.value = authUser
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  // 事件处理函数
  const handleLogout = async (): Promise<void> => {
    loading.value = true
    try {
      await authStore.logout()
      user.value = null
      router.push('/login')
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      loading.value = false
    }
  }

  const handleStart = (): void => {
    if (config.isOpenAuth) {
      const targetRoute = isLoggedIn() ? '/vms' : '/login'
      router.push(targetRoute)
    } else {
      router.push('/vms')
    }
  }

  // 生命周期钩子
  onMounted(() => {
    initializeUser()
  })
</script>

<style scoped>
  /* 整体容器优化 */
  .home {
    min-height: 100vh;
    padding: 0;
  }

  /* 主要介绍区域（Jumbotron）优化 */
  .jumbotron {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.95),
      rgba(248, 249, 250, 0.9)
    ) !important;
    backdrop-filter: blur(10px);
    border-radius: 20px !important;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    margin: 2rem 0;
    position: relative;
    overflow: hidden;
  }

  .jumbotron::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(180deg);
    }
  }

  .jumbotron h1 {
    background-color: var(--bs-black);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 800;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 1;
  }

  .jumbotron p.lead {
    color: var(--bs-gray-700);
    font-size: 1.1rem;
    line-height: 1.8;
    position: relative;
    z-index: 1;
  }

  /* 按钮组优化 */
  .btn {
    border-radius: 25px;
    padding: 0.75rem 2rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  .btn:hover::before {
    left: 100%;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  .btn-outline-primary {
    border: 2px solid #667eea;
    color: #667eea;
  }

  .btn-outline-primary:hover {
    background: linear-gradient(135deg, #667eea, #764ba2);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }

  /* 卡片组件优化 */
  .card {
    border: none;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    position: relative;
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }

  .card:hover::before {
    transform: scaleX(1);
  }

  .card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }

  .card-body {
    padding: 2rem;
  }

  .card-title {
    color: #2c3e50;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .card-text {
    color: #6c757d;
    line-height: 1.6;
  }

  /* 图标优化 */
  .bi {
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(2px 2px 4px rgba(102, 126, 234, 0.2));
    transition: all 0.3s ease;
  }

  .card:hover .bi {
    transform: scale(1.1) rotate(5deg);
  }

  /* 章节标题优化 */
  h2 {
    background: linear-gradient(135deg, #2c3e50, #3498db);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 800;
    position: relative;
    padding-bottom: 1rem;
  }

  h2::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
  }

  /* 技术栈列表优化 */
  .list-unstyled li {
    padding: 0.5rem 0;
    transition: all 0.2s ease;
    border-radius: 8px;
    padding-left: 1rem;
  }

  .list-unstyled li:hover {
    background: linear-gradient(90deg, rgba(102, 126, 234, 0.1), transparent);
    transform: translateX(5px);
  }

  .text-success {
    color: #28a745 !important;
    filter: drop-shadow(0 0 2px rgba(40, 167, 69, 0.3));
  }

  /* 快速开始区域优化 */
  .bg-light {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.9),
      rgba(248, 249, 250, 0.8)
    ) !important;
    backdrop-filter: blur(10px);
    border-radius: 20px !important;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  ol li {
    padding: 1rem 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    font-weight: 500;
    color: #495057;
  }

  ol li:last-child {
    border-bottom: none;
  }

  ol li:hover {
    color: #667eea;
    transform: translateX(10px);
    background: rgba(102, 126, 234, 0.05);
    border-radius: 8px;
    padding-left: 1rem;
  }

  /* 加载动画 */
  .spinner-border-sm {
    width: 1rem;
    height: 1rem;
  }

  /* 响应式优化 */
  @media (max-width: 768px) {
    .home {
      padding: 1rem;
    }

    .jumbotron {
      margin: 1rem 0;
      padding: 2rem !important;
    }

    .display-4 {
      font-size: 2rem;
    }

    .btn {
      padding: 0.5rem 1.5rem;
      margin-bottom: 0.5rem;
    }

    .card-body {
      padding: 1.5rem;
    }
  }

  /* 深色主题适配 */
  @media (prefers-color-scheme: dark) {
    .jumbotron {
      background: linear-gradient(135deg, rgba(33, 37, 41, 0.95), rgba(52, 58, 64, 0.9)) !important;
      color: white;
    }

    .card {
      background: rgba(33, 37, 41, 0.95);
      color: white;
    }

    .card-title {
      color: #f8f9fa;
    }

    .bg-light {
      background: linear-gradient(135deg, rgba(33, 37, 41, 0.9), rgba(52, 58, 64, 0.8)) !important;
      color: white;
    }
  }

  /* 页面进入动画 */
  .home {
    animation: fadeInUp 0.8s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 卡片逐个出现动画 */
  .card {
    animation: slideInUp 0.6s ease-out forwards;
    opacity: 0;
  }

  .card:nth-child(1) {
    animation-delay: 0.1s;
  }
  .card:nth-child(2) {
    animation-delay: 0.2s;
  }
  .card:nth-child(3) {
    animation-delay: 0.3s;
  }
  .card:nth-child(4) {
    animation-delay: 0.4s;
  }
  .card:nth-child(5) {
    animation-delay: 0.5s;
  }
  .card:nth-child(6) {
    animation-delay: 0.6s;
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
