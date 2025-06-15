<template>
  <div class="home">
    <!-- Hero Section -->
    <div class="bg-light p-5 rounded-3 mb-5">
      <div class="container-fluid py-5">
        <h1 class="display-5 fw-bold">{{ pageTitle }}</h1>
        <p class="col-md-8 fs-4">{{ pageDescription }}</p>

        <div v-if="user" class="mt-4">
          <p class="fs-5 mb-3">
            欢迎回来，<span class="fw-bold text-primary">{{
              user.user_metadata?.full_name || user.email
            }}</span>
          </p>
          <div class="d-flex flex-wrap gap-2">
            <router-link
              v-for="button in loggedInButtons"
              :key="button.to"
              :to="button.to"
              :class="button.class"
            >
              <i :class="button.icon + ' me-2'"></i>{{ button.text }}
            </router-link>
            <button @click="handleLogout" class="btn btn-outline-secondary" :disabled="loading">
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              <i v-else class="bi bi-box-arrow-right me-2"></i>
              退出登录
            </button>
          </div>
        </div>

        <div v-else class="mt-4">
          <p class="fs-5 mb-3">{{ guestMessage }}</p>
          <div class="d-flex flex-wrap gap-2">
            <router-link
              v-for="button in guestButtons"
              :key="button.to"
              :to="button.to"
              :class="button.class"
            >
              <i :class="button.icon + ' me-2'"></i>{{ button.text }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- 系统特点 -->
    <section class="mb-5">
      <h2 class="text-center mb-5 fw-bold">{{ featuresTitle }}</h2>

      <!-- 特点卡片 -->
      <div class="row g-4 mb-4">
        <div v-for="feature in features.slice(0, 3)" :key="feature.id" class="col-lg-4 col-md-6">
          <div class="card h-100 border-0 shadow-sm hover-lift">
            <div class="card-body text-center p-4">
              <div class="text-primary mb-3">
                <i :class="`bi ${feature.icon} display-4`"></i>
              </div>
              <h5 class="card-title fw-bold">{{ feature.title }}</h5>
              <p class="card-text text-muted">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二行特点 -->
      <div class="row g-4">
        <div v-for="feature in features.slice(3)" :key="feature.id" class="col-lg-4 col-md-6">
          <div class="card h-100 border-0 shadow-sm hover-lift">
            <div class="card-body text-center p-4">
              <div class="text-primary mb-3">
                <i :class="`bi ${feature.icon} display-4`"></i>
              </div>
              <h5 class="card-title fw-bold">{{ feature.title }}</h5>
              <p class="card-text text-muted">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 技术栈 -->
    <section class="mb-5">
      <h2 class="text-center mb-5 fw-bold">{{ techStackTitle }}</h2>
      <div class="row g-4">
        <div v-for="tech in techStack" :key="tech.id" class="col-lg-3 col-md-6">
          <div :class="`card h-100 border-${tech.color} border-opacity-25`">
            <div
              :class="`card-header bg-${tech.color} bg-opacity-10 border-${tech.color} border-opacity-25`"
            >
              <h5 :class="`card-title mb-0 text-${tech.color} fw-bold`">
                <i :class="`bi ${tech.icon} me-2`"></i>{{ tech.title }}
              </h5>
            </div>
            <div class="card-body">
              <ul class="list-unstyled mb-0">
                <li
                  v-for="(item, index) in tech.items"
                  :key="index"
                  :class="index < tech.items.length - 1 ? 'mb-2' : 'mb-0'"
                >
                  <i class="bi bi-check-circle-fill text-success me-2"></i>
                  <span class="fw-medium">{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 快速开始 -->
    <section class="bg-light rounded-3">
      <h2 class="text-center mb-5 fw-bold">{{ quickStartTitle }}</h2>

      <div class="row g-4">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <div v-for="(step, index) in quickStartSteps" :key="index" class="mb-3">
                <div
                  class="d-flex align-items-center p-3 bg-white rounded-3 border border-light-subtle"
                >
                  <span class="badge bg-primary rounded-pill me-3 flex-shrink-0">{{
                    index + 1
                  }}</span>
                  <div class="flex-grow-1">
                    <span class="fw-bold me-2">{{ step.title }}</span>
                    <span class="text-muted">{{ step.description }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 开始按钮 -->
      <div class="text-center mt-4">
        <button @click="handleStart" class="btn btn-primary btn-lg px-5 py-3">
          <i class="bi bi-rocket-takeoff me-2"></i>{{ startButtonText }}
        </button>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../utils/supabase'
import { useAuthStore } from '../stores/auth'

// 页面数据
const pageTitle = 'voidVM 虚拟机管理系统'
const pageDescription =
  '一个基于 Node.js 和 Vue 的现代化 QEMU 虚拟机管理平台，让虚拟机管理变得简单高效。'
const guestMessage = '请登录或注册以访问完整功能。'
const featuresTitle = '系统特点'
const techStackTitle = '技术栈'
const quickStartTitle = '快速开始'
const startButtonText = '立即开始'

// 按钮配置
const loggedInButtons = [
  {
    to: '/dashboard',
    class: 'btn btn-primary btn-lg',
    icon: 'bi bi-speedometer2',
    text: '进入控制台',
  },
  {
    to: '/profile',
    class: 'btn btn-outline-primary',
    icon: 'bi bi-person-gear',
    text: '个人设置',
  },
]

const guestButtons = [
  {
    to: '/login',
    class: 'btn btn-primary btn-lg',
    icon: 'bi bi-box-arrow-in-right',
    text: '登录',
  },
  {
    to: '/register',
    class: 'btn btn-outline-primary btn-lg',
    icon: 'bi bi-person-plus',
    text: '注册',
  },
]

// 系统特点数据
const features = [
  {
    id: 1,
    icon: 'bi-hdd-stack',
    title: '虚拟机生命周期管理',
    description: '轻松创建、启动、停止、重启和删除虚拟机，完整管理虚拟机的整个生命周期。',
  },
  {
    id: 2,
    icon: 'bi-display',
    title: '基于 Web 的远程访问',
    description: '通过集成的 NoVNC 技术，直接在浏览器中访问虚拟机的图形界面，无需安装额外软件。',
  },
  {
    id: 3,
    icon: 'bi-sliders',
    title: '灵活的配置选项',
    description: '自定义 CPU、内存、磁盘和网络设置，根据需求精确配置每台虚拟机。',
  },
  {
    id: 4,
    icon: 'bi-cloud-arrow-up',
    title: '文件上传与管理',
    description: '便捷地向虚拟机上传 ISO 镜像和其他文件，支持拖放操作和进度显示。',
  },
  {
    id: 5,
    icon: 'bi-shield-check',
    title: '安全的用户认证',
    description: '基于 Supabase 的安全认证系统，保护您的虚拟机免受未授权访问。',
  },
  {
    id: 6,
    icon: 'bi-graph-up',
    title: '资源监控',
    description: '实时监控虚拟机的 CPU、内存和磁盘使用情况，确保系统性能最优。',
  },
]

// 技术栈数据
const techStack = [
  {
    id: 1,
    title: '前端',
    icon: 'bi-palette',
    color: 'primary',
    items: ['Vue + TypeScript', 'Bootstrap 5', 'Pinia 状态管理', 'Vue Router'],
  },
  {
    id: 2,
    title: '后端',
    icon: 'bi-server',
    color: 'success',
    items: ['Node.js', 'Express', 'WebSocket', 'SSH2'],
  },
  {
    id: 3,
    title: '虚拟化',
    icon: 'bi-hdd-stack',
    color: 'warning',
    items: ['QEMU/KVM', 'NoVNC', 'WebSockify', 'VirtIO 驱动'],
  },
  {
    id: 4,
    title: '认证与存储',
    icon: 'bi-shield-lock',
    color: 'info',
    items: ['Supabase 认证', '文件系统存储', 'JSON 配置', '环境变量'],
  },
]

// 快速开始步骤
const quickStartSteps = [
  {
    title: '注册登录',
    description: '创建您的专属账户并登录系统',
  },
  {
    title: '创建虚拟机',
    description: '进入控制台，点击"创建虚拟机"按钮',
  },
  {
    title: '配置参数',
    description: '设置虚拟机的 CPU、内存、磁盘等参数',
  },
  {
    title: '上传镜像',
    description: '上传 ISO 镜像文件或选择已有镜像',
  },
  {
    title: '启动访问',
    description: '启动虚拟机并通过 NoVNC 在浏览器中访问',
  },
]

// 响应式数据
const router = useRouter()
const user = ref<any>(null)
const loading = ref(false)
const authStore = useAuthStore()

onMounted(async () => {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()
  user.value = authUser
})

// 方法
const handleLogout = async () => {
  loading.value = true
  try {
    await authStore.logout()
    user.value = null
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    loading.value = false
  }
}

const handleStart = () => {
  if (isLoggedIn()) {
    router.push('/vms')
  } else {
    router.push('/login')
  }
}

const isLoggedIn = () => {
  return authStore.isAuthenticated
}
</script>

<style scoped>
.hover-lift {
  transition:
    transform 0.2s ease-in-out,
    box-shadow 0.2s ease-in-out;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}

.bi {
  vertical-align: baseline;
}
</style>
