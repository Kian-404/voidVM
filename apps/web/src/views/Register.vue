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
                  <i class="bi bi-person-plus text-primary display-4"></i>
                </div>
                <h2 class="fw-bold mb-2">{{ pageTitle }}</h2>
                <p class="text-muted">{{ pageSubtitle }}</p>
              </div>

              <!-- 错误提示 -->
              <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{{ errorMessage }}</div>
              </div>

              <!-- 成功提示 -->
              <div v-if="successMessage" class="alert alert-success d-flex align-items-center" role="alert">
                <i class="bi bi-check-circle-fill me-2"></i>
                <div>{{ successMessage }}</div>
              </div>

              <!-- 注册表单 -->
              <form @submit.prevent="handleRegister">
                <!-- 全名输入 -->
                <div class="mb-3">
                  <label for="fullName" class="form-label fw-medium">
                    <i class="bi bi-person me-2"></i>{{ fullNameLabel }}
                  </label>
                  <input
                    type="text"
                    class="form-control form-control-lg"
                    id="fullName"
                    v-model="fullName"
                    :placeholder="fullNamePlaceholder"
                    required
                  >
                </div>

                <!-- 邮箱输入 -->
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

                <!-- 密码输入 -->
                <div class="mb-3">
                  <label for="password" class="form-label fw-medium">
                    <i class="bi bi-key me-2"></i>{{ passwordLabel }}
                  </label>
                  <div class="input-group">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      :class="['form-control', 'form-control-lg', getPasswordValidationClass()]"
                      id="password"
                      v-model="password"
                      :placeholder="passwordPlaceholder"
                      required
                      minlength="6"
                      @input="validatePassword"
                    >
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="togglePassword"
                    >
                      <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                  </div>

                  <!-- 密码强度指示器 -->
                  <div v-if="password" class="mt-2">
                    <div class="progress" style="height: 4px;">
                      <div
                        class="progress-bar"
                        :class="getPasswordStrengthColor()"
                        :style="{ width: passwordStrength + '%' }"
                      ></div>
                    </div>
                    <small :class="getPasswordStrengthTextColor()">
                      {{ getPasswordStrengthText() }}
                    </small>
                  </div>

                  <!-- 密码要求 -->
                  <div class="mt-2">
                    <small class="text-muted">{{ passwordRequirements }}</small>
                    <ul class="list-unstyled mt-1">
                      <li v-for="requirement in passwordChecks" :key="requirement.text" class="small">
                        <i :class="requirement.valid ? 'bi bi-check-circle-fill text-success' : 'bi bi-x-circle-fill text-danger'" class="me-1"></i>
                        {{ requirement.text }}
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- 确认密码输入 -->
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label fw-medium">
                    <i class="bi bi-shield-check me-2"></i>{{ confirmPasswordLabel }}
                  </label>
                  <div class="input-group">
                    <input
                      :type="showConfirmPassword ? 'text' : 'password'"
                      :class="['form-control', 'form-control-lg', getConfirmPasswordValidationClass()]"
                      id="confirmPassword"
                      v-model="confirmPassword"
                      :placeholder="confirmPasswordPlaceholder"
                      required
                    >
                    <button
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="toggleConfirmPassword"
                    >
                      <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                    </button>
                  </div>
                  <div v-if="passwordMismatch && confirmPassword" class="text-danger mt-1 small">
                    <i class="bi bi-exclamation-circle me-1"></i>{{ passwordMismatchText }}
                  </div>
                  <div v-if="passwordsMatch && confirmPassword" class="text-success mt-1 small">
                    <i class="bi bi-check-circle me-1"></i>{{ passwordsMatchText }}
                  </div>
                </div>

                <!-- 服务条款 -->
                <div class="mb-4">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="agreeTerms" v-model="agreeTerms" required>
                    <label class="form-check-label small" for="agreeTerms">
                      {{ agreeTermsText }}
                      <a href="#" class="text-decoration-none">{{ termsLinkText }}</a>
                      {{ andText }}
                      <a href="#" class="text-decoration-none">{{ privacyLinkText }}</a>
                    </label>
                  </div>
                </div>

                <!-- 注册按钮 -->
                <button
                  type="submit"
                  class="btn btn-primary btn-lg w-100 mb-3"
                  :disabled="loading || passwordMismatch || !isFormValid"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i v-else class="bi bi-person-plus me-2"></i>
                  {{ loading ? loadingText : registerButtonText }}
                </button>

                <!-- 分割线 -->
                <div class="text-center mb-3">
                  <div class="d-flex align-items-center">
                    <hr class="flex-grow-1">
                    <span class="px-3 text-muted small">{{ orText }}</span>
                    <hr class="flex-grow-1">
                  </div>
                </div>

                <!-- 第三方注册 -->
                <div class="d-grid gap-2 mb-4">
                  <button type="button" class="btn btn-outline-dark btn-lg" @click="handleGoogleRegister">
                    <i class="bi bi-google me-2"></i>{{ googleRegisterText }}
                  </button>
                </div>

                <!-- 登录链接 -->
                <div class="text-center">
                  <span class="text-muted">{{ hasAccountText }}</span>
                  <router-link to="/login" class="text-decoration-none fw-medium">
                    {{ loginLinkText }}
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../utils/supabase';

// 页面文本内容
const pageTitle = '创建账户';
const pageSubtitle = '注册您的 voidVM 账户';
const fullNameLabel = '姓名';
const fullNamePlaceholder = '请输入您的姓名';
const emailLabel = '邮箱地址';
const emailPlaceholder = '请输入您的邮箱地址';
const passwordLabel = '密码';
const passwordPlaceholder = '请输入您的密码';
const confirmPasswordLabel = '确认密码';
const confirmPasswordPlaceholder = '请再次输入您的密码';
const passwordRequirements = '密码要求：';
const passwordMismatchText = '两次输入的密码不匹配';
const passwordsMatchText = '密码匹配';
const agreeTermsText = '我已阅读并同意';
const termsLinkText = '服务条款';
const andText = '和';
const privacyLinkText = '隐私政策';
const registerButtonText = '注册';
const loadingText = '注册中...';
const orText = '或';
const googleRegisterText = '使用 Google 账户注册';
const hasAccountText = '已有账户？';
const loginLinkText = '立即登录';
const footerText = '注册即表示您同意我们的服务条款和隐私政策';

// 响应式数据
const router = useRouter();

const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const agreeTerms = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// 密码验证规则
const passwordChecks = computed(() => [
  { text: '至少 8 个字符', valid: password.value.length >= 8 },
  { text: '包含大写字母', valid: /[A-Z]/.test(password.value) },
  { text: '包含小写字母', valid: /[a-z]/.test(password.value) },
  { text: '包含数字', valid: /\d/.test(password.value) },
  { text: '包含特殊字符', valid: /[!@#$%^&*(),.?":{}|<>]/.test(password.value) }
]);

// 密码强度计算
const passwordStrength = computed(() => {
  const validChecks = passwordChecks.value.filter(check => check.valid).length;
  return (validChecks / passwordChecks.value.length) * 100;
});

// 密码匹配验证
const passwordMismatch = computed(() => {
  return password.value && confirmPassword.value && password.value !== confirmPassword.value;
});

const passwordsMatch = computed(() => {
  return password.value && confirmPassword.value && password.value === confirmPassword.value;
});

// 表单验证
const isFormValid = computed(() => {
  return fullName.value &&
    email.value &&
    password.value &&
    confirmPassword.value &&
    !passwordMismatch.value &&
    agreeTerms.value &&
    passwordChecks.value.filter(check => check.valid).length >= 3; // 至少满足3个密码要求
});

// 方法
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const validatePassword = () => {
  // 可以添加实时密码验证逻辑
};

const getPasswordValidationClass = () => {
  if (!password.value) return '';
  const strength = passwordStrength.value;
  if (strength >= 80) return 'is-valid';
  if (strength >= 60) return '';
  return 'is-invalid';
};

const getConfirmPasswordValidationClass = () => {
  if (!confirmPassword.value) return '';
  return passwordsMatch.value ? 'is-valid' : 'is-invalid';
};

const getPasswordStrengthColor = () => {
  const strength = passwordStrength.value;
  if (strength >= 80) return 'bg-success';
  if (strength >= 60) return 'bg-warning';
  if (strength >= 40) return 'bg-info';
  return 'bg-danger';
};

const getPasswordStrengthTextColor = () => {
  const strength = passwordStrength.value;
  if (strength >= 80) return 'text-success';
  if (strength >= 60) return 'text-warning';
  if (strength >= 40) return 'text-info';
  return 'text-danger';
};

const getPasswordStrengthText = () => {
  const strength = passwordStrength.value;
  if (strength >= 80) return '强';
  if (strength >= 60) return '中等';
  if (strength >= 40) return '一般';
  return '弱';
};

const handleRegister = async () => {
  // 重置消息
  errorMessage.value = '';
  successMessage.value = '';

  // 验证表单
  if (passwordMismatch.value) {
    errorMessage.value = '两次输入的密码不匹配';
    return;
  }

  if (!isFormValid.value) {
    errorMessage.value = '请填写所有必填字段并满足密码要求';
    return;
  }

  loading.value = true;

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: fullName.value
        }
      }
    });

    if (error) {
      throw error;
    }

    // 检查是否需要邮箱确认
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      errorMessage.value = '此邮箱已被注册';
    } else {
      successMessage.value = '注册成功！请检查您的邮箱以确认账户。';

      // 重置表单
      fullName.value = '';
      email.value = '';
      password.value = '';
      confirmPassword.value = '';
      agreeTerms.value = false;

      // 延迟跳转到登录页面
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  } catch (error: any) {
    errorMessage.value = error.message || '注册过程中发生错误';
    console.error('Registration error:', error);
  } finally {
    loading.value = false;
  }
};

const handleGoogleRegister = async () => {
  try {
    // 这里可以实现 Google 注册逻辑
    console.log('Google register clicked');
    // await supabase.auth.signInWithOAuth({ provider: 'google' });
  } catch (error: any) {
    errorMessage.value = error.message || 'Google 注册失败';
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

.progress {
  border-radius: 0.25rem;
}

.form-check-input:checked {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
}

/* 自定义验证样式 */
.is-valid {
  border-color: #198754;
}

.is-invalid {
  border-color: #dc3545;
}

.is-valid:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.25);
}

.is-invalid:focus {
  border-color: #dc3545;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}
</style>

