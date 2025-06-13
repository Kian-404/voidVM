<template>
  <div class="home">
    <div class="jumbotron bg-light p-5 rounded">
      <h1 class="display-4">QEMU 虚拟机管理系统</h1>
      <p class="lead">
        一个基于 Node.js 和 Vue 的现代化 QEMU 虚拟机管理平台，让虚拟机管理变得简单高效。
      </p>
      <hr class="my-4" />

      <div v-if="user">
        <p>
          欢迎回来，<strong>{{ user.user_metadata?.full_name || user.email }}</strong>
        </p>
        <div class="d-grid gap-2 d-md-flex justify-content-md-start">
          <router-link to="/dashboard" class="btn btn-primary me-md-2">进入控制台</router-link>
          <router-link to="/profile" class="btn btn-outline-primary me-md-2">个人设置</router-link>
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

    <!-- 系统特点 -->
    <h2 class="text-center my-5">系统特点</h2>
    <div class="row mt-4">
      <div class="col-md-4 mb-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="mb-3">
              <i class="bi bi-hdd-stack fs-1 text-primary"></i>
            </div>
            <h5 class="card-title">虚拟机生命周期管理</h5>
            <p class="card-text">
              轻松创建、启动、停止、重启和删除虚拟机，完整管理虚拟机的整个生命周期。
            </p>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="mb-3">
              <i class="bi bi-display fs-1 text-primary"></i>
            </div>
            <h5 class="card-title">基于 Web 的远程访问</h5>
            <p class="card-text">
              通过集成的 NoVNC 技术，直接在浏览器中访问虚拟机的图形界面，无需安装额外软件。
            </p>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="mb-3">
              <i class="bi bi-sliders fs-1 text-primary"></i>
            </div>
            <h5 class="card-title">灵活的配置选项</h5>
            <p class="card-text">自定义 CPU、内存、磁盘和网络设置，根据需求精确配置每台虚拟机。</p>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-md-4 mb-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="mb-3">
              <i class="bi bi-cloud-arrow-up fs-1 text-primary"></i>
            </div>
            <h5 class="card-title">文件上传与管理</h5>
            <p class="card-text">便捷地向虚拟机上传 ISO 镜像和其他文件，支持拖放操作和进度显示。</p>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="mb-3">
              <i class="bi bi-shield-check fs-1 text-primary"></i>
            </div>
            <h5 class="card-title">安全的用户认证</h5>
            <p class="card-text">基于 Supabase 的安全认证系统，保护您的虚拟机免受未授权访问。</p>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body text-center">
            <div class="mb-3">
              <i class="bi bi-graph-up fs-1 text-primary"></i>
            </div>
            <h5 class="card-title">资源监控</h5>
            <p class="card-text">实时监控虚拟机的 CPU、内存和磁盘使用情况，确保系统性能最优。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 技术栈 -->
    <h2 class="text-center my-5">技术栈</h2>
    <div class="row mt-4">
      <div class="col-md-3 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">前端</h5>
            <ul class="list-unstyled">
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>Vue + TypeScript</li>
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>Bootstrap 5</li>
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>Pinia 状态管理</li>
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>Vue Router</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">后端</h5>
            <ul class="list-unstyled">
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>Node.js</li>
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>Express</li>
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>WebSocket</li>
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>SSH2</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">虚拟化</h5>
            <ul class="list-unstyled">
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>QEMU/KVM</li>
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>NoVNC</li>
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>WebSockify</li>
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>VirtIO 驱动</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">认证与存储</h5>
            <ul class="list-unstyled">
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>Supabase 认证</li>
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>文件系统存储</li>
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>JSON 配置</li>
              <li><i class="bi bi-check-circle-fill text-success me-2"></i>环境变量</li>
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
                <li class="mb-3">注册账户并登录系统</li>
                <li class="mb-3">进入控制台，点击"创建虚拟机"</li>
                <li class="mb-3">配置虚拟机参数（CPU、内存、磁盘等）</li>
                <li class="mb-3">上传 ISO 镜像或选择已有镜像</li>
                <li class="mb-3">启动虚拟机并通过 NoVNC 访问</li>
              </ol>
              <div class="text-center mt-4">
                <!-- <router-link to="/register" class="btn btn-primary">立即开始</router-link> -->
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
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { supabase } from '../utils/supabase'
  import { useAuthStore } from '../stores/auth'

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
    // 方式1: 检查 localStorage
    // const token = localStorage.getItem('token')
    // return !!token

    // 方式2: 使用 Pinia store
    return authStore.isAuthenticated
  }
</script>

<style scoped>
  .card {
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
  }

  .bi {
    line-height: 1;
  }
</style>
