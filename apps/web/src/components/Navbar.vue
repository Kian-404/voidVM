<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <router-link class="navbar-brand d-flex align-items-center" to="/">
        <i class="bi bi-hdd-network me-2"></i>
        VM 虚拟机管理系统
      </router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/" active-class="active" exact-active-class="active">
              <i class="bi bi-house-door me-1"></i> 首页
            </router-link>
          </li>

          <!-- 仅对已认证用户显示的导航项 -->
          <!-- <template v-if="authStore.isAuthenticated"> -->
          <!-- <template> -->
          <li class="nav-item">
            <router-link class="nav-link" to="/dashboard" active-class="active">
              <i class="bi bi-speedometer2 me-1"></i> 控制台
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/vms" active-class="active">
              <i class="bi bi-pc-display me-1"></i> 虚拟机
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/images" active-class="active">
              <i class="bi bi-disc me-1"></i> 镜像管理
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/network" active-class="active">
              <i class="bi bi-globe me-1"></i> 网络管理
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/files" active-class="active">
              <i class="bi bi-folder me-1"></i> 文件管理
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/snapshots" active-class="active">
              <i class="bi bi-camera-fill me-1"></i> 快照管理
            </router-link>
          </li>
          <!-- <li class="nav-item">
              <router-link
                class="nav-link"
                to="/profile"
                active-class="active">
                <i class="bi bi-person me-1"></i> 个人资料
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/settings"
                active-class="active">
                <i class="bi bi-gear me-1"></i> 系统设置
              </router-link>
            </li> -->
          <!-- </template> -->
        </ul>

        <!-- 用户认证区域 -->
        <ul class="navbar-nav" v-if="config.isOpenAuth">
          <template v-if="authStore.isAuthenticated">
            <!-- 通知图标 -->
            <li class="nav-item dropdown">
              <a
                class="nav-link position-relative"
                href="#"
                id="notificationsDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i class="bi bi-bell"></i>
                <span
                  v-if="notificationCount > 0"
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                >
                  {{ notificationCount }}
                  <span class="visually-hidden">未读通知</span>
                </span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="notificationsDropdown">
                <li v-if="notifications.length === 0">
                  <span class="dropdown-item text-muted">暂无通知</span>
                </li>
                <li v-for="(notification, index) in notifications" :key="index">
                  <a class="dropdown-item" href="#">
                    <small class="text-muted">{{ notification.time }}</small>
                    <div>{{ notification.message }}</div>
                  </a>
                </li>
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
                aria-expanded="false"
              >
                <span class="avatar-circle me-2">
                  {{ getUserInitials() }}
                </span>
                <span class="d-none d-md-inline">{{ getUserDisplayName() }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li>
                  <router-link class="dropdown-item" to="/profile">
                    <i class="bi bi-person me-2"></i> 个人资料
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/settings">
                    <i class="bi bi-gear me-2"></i> 系统设置
                  </router-link>
                </li>
                <li>
                  <hr class="dropdown-divider" />
                </li>
                <li>
                  <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
                    <i class="bi bi-box-arrow-right me-2"></i> 退出登录
                  </a>
                </li>
              </ul>
            </li>
          </template>

          <template v-else>
            <li class="nav-item">
              <router-link class="nav-link" to="/login" active-class="active">
                <i class="bi bi-box-arrow-in-right me-1"></i> 登录
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link btn btn-sm btn-outline-light ms-2"
                to="/register"
                active-class="btn-light text-dark"
              >
                注册
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
  import { config } from '../utils/config'

  const authStore = useAuthStore()
  const router = useRouter()

  // 模拟通知数据
  const notifications = ref([
    { message: '虚拟机 "Ubuntu-Server" 已成功启动', time: '10分钟前' },
    { message: '系统更新可用', time: '1小时前' },
  ])

  const notificationCount = computed(() => notifications.value.length)

  // 获取用户显示名称
  const getUserDisplayName = () => {
    if (!authStore.user) return ''
    return authStore.user.user_metadata?.full_name || authStore.user.email?.split('@')[0] || '用户'
  }

  // 获取用户名首字母作为头像
  const getUserInitials = () => {
    if (!authStore.user) return ''

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

  // 退出登录
  const handleLogout = async () => {
    try {
      const data = await authStore.logout()
      console.log('data', data)
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
  .navbar {
    position: sticky;
    top: 0px;
    z-index: 1000;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    background: linear-gradient(135deg, #343a40 0%, #495057 100%) !important;
  }

  .navbar-brand {
    font-weight: 700;
    font-size: 1.25rem;
    transition: all 0.3s ease;
  }

  .navbar-brand:hover {
    transform: translateY(-1px);
    color: #ffffff !important;
  }

  .navbar-brand i {
    font-size: 1.5rem;
    color: #007bff;
    filter: drop-shadow(0 0 4px rgba(0, 123, 255, 0.3));
  }

  /* 导航链接优化 */
  .nav-link {
    padding: 0.75rem 1rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 8px;
    margin: 0 2px;
    position: relative;
    overflow: hidden;
  }

  .nav-link::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }

  .nav-link:hover::before {
    left: 100%;
  }

  .nav-link:hover {
    color: #ffffff !important;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .nav-link.active {
    color: #ffffff !important;
    background: linear-gradient(135deg, #007bff, #0056b3);
    border-radius: 8px;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
    transform: translateY(-1px);
  }

  .nav-link.active i {
    color: #ffffff;
    filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
  }

  /* 用户头像优化 */
  .avatar-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: linear-gradient(135deg, #007bff, #0056b3);
    color: white;
    border-radius: 50%;
    font-size: 14px;
    font-weight: bold;
    box-shadow: 0 2px 10px rgba(0, 123, 255, 0.3);
    transition: all 0.3s ease;
  }

  .avatar-circle:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.4);
  }

  /* 下拉菜单优化 */
  .dropdown-menu {
    border: none;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.95);
    margin-top: 8px;
  }

  .dropdown-item {
    padding: 0.75rem 1.25rem;
    border-radius: 8px;
    margin: 4px 8px;
    transition: all 0.2s ease;
  }

  .dropdown-item:hover {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    transform: translateX(4px);
  }

  .dropdown-item.text-danger:hover {
    background: linear-gradient(135deg, #dc3545, #c82333);
    color: white !important;
  }

  /* 通知徽章优化 */
  .badge {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }

  /* 注册按钮优化 */
  .btn-outline-light {
    border-radius: 25px;
    padding: 0.5rem 1.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
    border: 2px solid rgba(255, 255, 255, 0.5);
  }

  .btn-outline-light:hover {
    background-color: #ffffff;
    color: #343a40 !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.3);
  }

  /* 响应式优化 */
  @media (max-width: 992px) {
    .navbar-nav .nav-item {
      padding: 0.25rem 0;
      margin: 2px 0;
    }

    .nav-link {
      margin: 2px 0;
    }

    .navbar-brand {
      font-size: 1.1rem;
    }
  }

  /* 深色主题下的进一步优化 */
  @media (prefers-color-scheme: dark) {
    .dropdown-menu {
      background-color: rgba(33, 37, 41, 0.95);
      color: white;
    }

    .dropdown-item {
      color: rgba(255, 255, 255, 0.9);
    }

    .dropdown-item:hover {
      background: linear-gradient(135deg, #495057, #6c757d);
      color: white;
    }
  }

  /* 加载动画 */
  .navbar {
    animation: slideDown 0.5s ease-out;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
