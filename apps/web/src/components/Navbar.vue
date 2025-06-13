<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <router-link class="navbar-brand d-flex align-items-center" to="/">
        <i class="bi bi-hdd-network me-2"></i>
        QEMU 虚拟机管理系统
      </router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link 
              class="nav-link" 
              to="/"
              active-class="active"
              exact-active-class="active">
              <i class="bi bi-house-door me-1"></i> 首页
            </router-link>
          </li>

          <!-- 仅对已认证用户显示的导航项 -->
          <template v-if="authStore.isAuthenticated">
            <li class="nav-item">
              <router-link 
                class="nav-link" 
                to="/dashboard"
                active-class="active">
                <i class="bi bi-speedometer2 me-1"></i> 控制台
              </router-link>
            </li>
            <li class="nav-item">
              <router-link 
                class="nav-link" 
                to="/vms"
                active-class="active">
                <i class="bi bi-pc-display me-1"></i> 虚拟机
              </router-link>
            </li>
            <li class="nav-item">
              <router-link 
                class="nav-link" 
                to="/images"
                active-class="active">
                <i class="bi bi-disc me-1"></i> 镜像管理
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
          </template>
        </ul>

        <!-- 用户认证区域 -->
        <ul class="navbar-nav">
          <template v-if="authStore.isAuthenticated">
            <!-- 通知图标 -->
            <li class="nav-item dropdown">
              <a class="nav-link position-relative" href="#" id="notificationsDropdown" role="button"
                data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-bell"></i>
                <span v-if="notificationCount > 0"
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
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
              <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" role="button"
                data-bs-toggle="dropdown" aria-expanded="false">
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
                  <hr class="dropdown-divider">
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
              <router-link class="nav-link btn btn-sm btn-outline-light ms-2" to="/register"
                active-class="btn-light text-dark">
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
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

// 模拟通知数据
const notifications = ref([
  { message: '虚拟机 "Ubuntu-Server" 已成功启动', time: '10分钟前' },
  { message: '系统更新可用', time: '1小时前' }
]);

const notificationCount = computed(() => notifications.value.length);

// 获取用户显示名称
const getUserDisplayName = () => {
  if (!authStore.user) return '';
  return authStore.user.user_metadata?.full_name || authStore.user.email?.split('@')[0] || '用户';
};

// 获取用户名首字母作为头像
const getUserInitials = () => {
  if (!authStore.user) return '';

  const fullName = authStore.user.user_metadata?.full_name;
  if (fullName) {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName[0].toUpperCase();
  }

  const email = authStore.user.email;
  return email ? email[0].toUpperCase() : 'U';
};

// 退出登录
const handleLogout = async () => {
  try {
    const data = await authStore.logout();
    console.log('data', data);
    if (data !== undefined) {
      router.push('/login');
    } else {
      router.push('/');
    }
  } catch (error) {
    console.error('Logout error:', error);
    router.push('/login');
  }

};
</script>

<style scoped>
.navbar {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 激活状态样式 */
.nav-link.active {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.375rem;
  font-weight: 500;
}

.nav-link.active i {
  color: #ffffff;
}

/* 悬停效果 */
.nav-link:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 0.375rem;
}

/* 注册按钮激活状态 */
.btn-outline-light.active {
  background-color: #f8f9fa !important;
  color: #212529 !important;
  border-color: #f8f9fa !important;
}

/* 其他样式保持不变 */
.avatar-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background-color: #007bff;
  color: white;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
}

.nav-link {
  padding: 0.5rem 1rem;
  transition: all 0.15s ease-in-out;
}

.dropdown-item {
  padding: 0.5rem 1rem;
}

.dropdown-item i {
  width: 1rem;
  text-align: center;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .navbar-nav .nav-item {
    padding: 0.25rem 0;
  }
}
</style>
