<template>
  <div class="min-vh-100 d-flex align-items-center bg-light">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8 col-md-7 col-sm-9">
          <div class="card border-0 shadow-lg">
            <div class="card-body p-5">
              <!-- 页面标题 -->
              <div class="text-center mb-4">
                <div class="mb-3">
                  <i class="bi bi-shield-lock text-primary display-4"></i>
                </div>
                <h2 class="fw-bold mb-2">{{ pageTitle }}</h2>
                <p class="text-muted">{{ pageSubtitle }}</p>
              </div>

              <!-- 错误提示 -->
              <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{{ errorMessage }}</div>
              </div>

              <!-- 登录表单 -->
              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label for="email" class="form-label fw-medium">
                    <i class="bi bi-envelope me-2"></i>{{ emailLabel }}
                  </label>
                  <input
                    type="email"
                    class="form-control form-control-lg"
                    id="email"
                    v-model="email"
                    :placeholder="emailPlaceholder"
                    required
                  >
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label fw-medium">
                    <i class="bi bi-key me-2"></i>{{ passwordLabel }}
                  </label>
                  <div class="input-group">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      class="form-control form-control-lg"
                      id="password"
                      v-model="password"
                      :placeholder="passwordPlaceholder"
                      required
                    >
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="togglePassword"
                    >
                      <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                  </div>
                </div>

                <!-- 记住我和忘记密码 -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="rememberMe" v-model="rememberMe">
                    <label class="form-check-label" for="rememberMe">
                      {{ rememberMeLabel }}
                    </label>
                  </div>
                  <router-link to="/reset-password" class="text-decoration-none">
                    {{ forgotPasswordLabel }}
                  </router-link>
                </div>

                <!-- 登录按钮 -->
                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-100 mb-3"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i v-else class="bi bi-box-arrow-in-right me-2"></i>
                  {{ loading ? loadingText : loginButtonText }}
                </button>

                <!-- 分割线 -->
                <div class="text-center mb-3">
                  <div class="d-flex align-items-center">
                    <hr class="flex-grow-1">
                    <span class="px-3 text-muted small">{{ orText }}</span>
                    <hr class="flex-grow-1">
                  </div>
                </div>

                <!-- 第三方登录 -->
                <div class="d-grid gap-2 mb-4">
                  <button type="button" class="btn btn-outline-dark btn-lg" @click="handleGoogleLogin">
                    <i class="bi bi-google me-2"></i>{{ googleLoginText }}
                  </button>
                </div>

                <!-- 注册链接 -->
                <div class="text-center">
                  <span class="text-muted">{{ noAccountText }}</span>
                  <router-link to="/register" class="text-decoration-none fw-medium">
                    {{ registerLinkText }}
                  </router-link>
                </div>
              </form>
            </div>
          </div>

          <!-- 底部信息 -->
          <div class="text-center mt-4">
            <p class="text-muted small mb-0">
              {{ footerText }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// 页面文本内容
const pageTitle = '欢迎回来';
const pageSubtitle = '登录您的 voidVM 账户';
const emailLabel = '邮箱地址';
const emailPlaceholder = '请输入您的邮箱地址';
const passwordLabel = '密码';
const passwordPlaceholder = '请输入您的密码';
const rememberMeLabel = '记住我';
const forgotPasswordLabel = '忘记密码？';
const loginButtonText = '登录';
const loadingText = '登录中...';
const orText = '或';
const googleLoginText = '使用 Google 账户登录';
const noAccountText = '还没有账户？';
const registerLinkText = '立即注册';
const footerText = '登录即表示您同意我们的服务条款和隐私政策';

// 响应式数据
const router = useRouter();
const authStore = useAuthStore();

const email = ref('0gi6ekh745@iwatermail.com');
const password = ref('123qwe');
const rememberMe = ref(false);
const showPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');

// 方法
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const { success, error } = await authStore.login(email.value, password.value);

    if (success) {
      // 如果勾选了记住我，可以在这里处理相关逻辑
      if (rememberMe.value) {
        localStorage.setItem('rememberMe', 'true');
      }

      router.push('/dashboard');
    } else {
      errorMessage.value = error || '登录失败，请重试。';
    }
  } catch (error: any) {
    errorMessage.value = error.message || '发生意外错误';
  } finally {
    loading.value = false;
  }
};

const handleGoogleLogin = async () => {
  try {
    // 这里可以实现 Google 登录逻辑
    console.log('Google login clicked');
    // await authStore.loginWithGoogle();
  } catch (error: any) {
    errorMessage.value = error.message || 'Google 登录失败';
  }
};
</script>

<style scoped>
.min-vh-100 {
  min-height: 100vh;
}

.card {
  border-radius: 1rem;
}

.form-control:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
}

.btn:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease-in-out;
}
</style>
