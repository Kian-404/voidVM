<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow">
    <div class="container">
      <!-- 品牌Logo -->
      <router-link class="navbar-brand fw-bold d-flex align-items-center" to="/">
        <i class="bi bi-hdd-network me-2 fs-4"></i>
        <span>{{ brandName }}</span>
      </router-link>

      <!-- 移动端切换按钮 -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <!-- 主导航菜单 -->
        <ul class="navbar-nav me-auto">
          <li v-for="item in mainNavItems" :key="item.name" class="nav-item">
            <router-link
              v-if="!item.requireAuth || authStore.isAuthenticated"
              class="nav-link"
              :to="item.path"
              active-class="active"
              :exact-active-class="item.exact ? 'active' : ''"
            >
              <i :class="item.icon + ' me-1'"></i>{{ item.name }}
            </router-link>
          </li>
        </ul>

        <!-- 右侧用户区域 -->
        <ul class="navbar-nav">
          <template v-if="authStore.isAuthenticated">
            <!-- 通知菜单 -->
            <li class="nav-item dropdown me-2">
              <a
                class="nav-link position-relative"
                href="#"
                id="notificationsDropdown"
                role="button"
                data-bs-toggle="dropdown"
              >
                <i class="bi bi-bell"></i>
                <span
                  v-if="notificationCount > 0"
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger small"
                >
                  {{ notificationCount }}
                </span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end shadow" style="min-width: 300px">
                <li>
                  <h6 class="dropdown-header d-flex justify-content-between">
                    <span><i class="bi bi-bell me-2"></i>{{ notificationsHeader }}</span>
                    <small class="text-muted">{{ notificationCount }} 条新消息</small>
                  </h6>
                </li>
                <li><hr class="dropdown-divider" /></li>

                <div style="max-height: 250px; overflow-y: auto">
                  <li v-if="notifications.length === 0" class="px-3 py-2">
                    <div class="text-center text-muted py-2">
                      <i class="bi bi-bell-slash fs-4"></i>
                      <div class="small">{{ noNotificationsText }}</div>
                    </div>
                  </li>

                  <li v-for="(notification, index) in notifications" :key="index">
                    <a class="dropdown-item" href="#" @click.prevent="markAsRead(index)">
                      <div class="d-flex align-items-start">
                        <i
                          :class="getNotificationIcon(notification.type)"
                          class="me-2 mt-1"
                          :style="{ color: getNotificationColor(notification.type) }"
                        ></i>
                        <div class="flex-grow-1">
                          <div class="fw-medium small">{{ notification.message }}</div>
                          <small class="text-muted">{{ notification.time }}</small>
                        </div>
                        <span
                          v-if="!notification.read"
                          class="badge bg-primary rounded-circle p-1"
                        ></span>
                      </div>
                    </a>
                  </li>
                </div>
              </ul>
            </li>

            <!-- 用户菜单 -->
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                id="userDropdown"
                role="button"
                data-bs-toggle="dropdown"
              >
                <span
                  class="user-avatar bg-light text-primary rounded-circle d-flex align-items-center justify-content-center me-2 fw-bold"
                >
                  {{ getUserInitials() }}
                </span>
                <span class="d-none d-md-inline">{{ getUserDisplayName() }}</span>
              </a>

              <ul class="dropdown-menu dropdown-menu-end shadow">
                <li>
                  <div class="dropdown-header">
                    <div class="d-flex align-items-center">
                      <span
                        class="user-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2 fw-bold"
                      >
                        {{ getUserInitials() }}
                      </span>
                      <div>
                        <div class="fw-medium">{{ getUserDisplayName() }}</div>
                        <small class="text-muted">{{ getUserEmail() }}</small>
                      </div>
                    </div>
                  </div>
                </li>
                <li><hr class="dropdown-divider" /></li>

                <li v-for="item in userMenuItems" :key="item.name">
                  <router-link class="dropdown-item" :to="item.path">
                    <i :class="item.icon + ' me-2'"></i>{{ item.name }}
                  </router-link>
                </li>

                <li><hr class="dropdown-divider" /></li>
                <li>
                  <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
                    <i class="bi bi-box-arrow-right me-2"></i>{{ logoutText }}
                  </a>
                </li>
              </ul>
            </li>
          </template>

          <!-- 未登录用户菜单 -->
          <template v-else>
            <li class="nav-item">
              <router-link class="nav-link" to="/login" active-class="active">
                <i class="bi bi-box-arrow-in-right me-1"></i>{{ loginText }}
              </router-link>
            </li>
            <li class="nav-item">
              <router-link class="btn btn-outline-light btn-sm ms-2" to="/register">
                <i class="bi bi-person-plus me-1"></i>{{ registerText }}
              </router-link>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

// 文本内容
const brandName = 'voidVM'
const notificationsHeader = '通知'
const noNotificationsText = '暂无新通知'
const loginText = '登录'
const registerText = '注册'
const logoutText = '退出登录'

// 主导航菜单配置
const mainNavItems = [
  {
    name: '首页',
    path: '/',
    icon: 'bi bi-house-door',
    exact: true,
    requireAuth: false,
  },
  {
    name: '控制台',
    path: '/dashboard',
    icon: 'bi bi-speedometer2',
    exact: false,
    requireAuth: true,
  },
  {
    name: '虚拟机',
    path: '/vms',
    icon: 'bi bi-pc-display',
    exact: false,
    requireAuth: true,
  },
  {
    name: '镜像管理',
    path: '/images',
    icon: 'bi bi-disc',
    exact: false,
    requireAuth: true,
  },
]

// 用户菜单配置
const userMenuItems = [
  {
    name: '个人资料',
    path: '/profile',
    icon: 'bi bi-person',
  },
  {
    name: '系统设置',
    path: '/settings',
    icon: 'bi bi-gear',
  },
]

// 响应式数据
const authStore = useAuthStore()
const router = useRouter()

// 通知数据
const notifications = ref([
  {
    message: '虚拟机 "Ubuntu-Server" 已成功启动',
    time: '10分钟前',
    type: 'success',
    read: false,
  },
  {
    message: '镜像上传完成',
    time: '25分钟前',
    type: 'info',
    read: false,
  },
  {
    message: '系统将于今晚进行维护',
    time: '1小时前',
    type: 'warning',
    read: true,
  },
])

// 计算属性
const notificationCount = computed(() => notifications.value.filter(n => !n.read).length)

// 方法
const getUserDisplayName = () => {
  if (!authStore.user) return ''
  return authStore.user.user_metadata?.full_name || authStore.user.email?.split('@')[0] || '用户'
}

const getUserEmail = () => {
  if (!authStore.user) return ''
  return authStore.user.email || ''
}

const getUserInitials = () => {
  if (!authStore.user) return 'U'

  const fullName = authStore.user.user_metadata?.full_name
  if (fullName) {
    const names = fullName.split(' ')
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return fullName[0].toUpperCase()
  }

  const email = authStore.user.email
  return email ? email[0].toUpperCase() : 'U'
}

const getNotificationIcon = (type: string) => {
  const icons = {
    success: 'bi bi-check-circle-fill',
    info: 'bi bi-info-circle-fill',
    warning: 'bi bi-exclamation-triangle-fill',
    danger: 'bi bi-x-circle-fill',
  }
  return icons[type as keyof typeof icons] || 'bi bi-bell-fill'
}

const getNotificationColor = (type: string) => {
  const colors = {
    success: '#198754',
    info: '#0dcaf0',
    warning: '#ffc107',
    danger: '#dc3545',
  }
  return colors[type as keyof typeof colors] || '#6c757d'
}

const markAsRead = (index: number) => {
  notifications.value[index].read = true
}

const handleLogout = async () => {
  try {
    const data = await authStore.logout()
    if (data !== undefined) {
      router.push('/login')
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error('Logout error:', error)
    router.push('/login')
  }
}
</script>

<style scoped>
.user-avatar {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.nav-link.active {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 0.375rem;
  font-weight: 500;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
}

.dropdown-item:hover {
  background-color: var(--bs-primary);
  color: white;
}

.dropdown-item:hover i {
  color: white;
}
</style>
