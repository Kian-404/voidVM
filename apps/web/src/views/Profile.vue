<template>
  <div class="container-fluid py-4">
    <div class="row justify-content-center">
      <div class="col-xl-8 col-lg-10">
        <!-- 页面标题 -->
        <div class="d-flex align-items-center mb-4">
          <i class="bi bi-person-gear text-primary fs-2 me-3"></i>
          <div>
            <h2 class="mb-1 fw-bold">{{ pageTitle }}</h2>
            <p class="text-muted mb-0">{{ pageSubtitle }}</p>
          </div>
        </div>

        <!-- 用户信息卡片 -->
        <div class="row g-4">
          <!-- 基本信息 -->
          <div class="col-lg-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center p-4">
                <div class="mb-3">
                  <div class="avatar-placeholder bg-primary bg-opacity-10 rounded-circle mx-auto d-flex align-items-center justify-content-center" style="width: 80px; height: 80px;">
                    <i class="bi bi-person-fill text-primary fs-1"></i>
                  </div>
                </div>
                <h5 class="fw-bold mb-1">{{ displayName }}</h5>
                <p class="text-muted small mb-3">{{ email }}</p>
                <div class="d-flex justify-content-center gap-2">
                  <span class="badge bg-success bg-opacity-10 text-success">
                    <i class="bi bi-check-circle me-1"></i>已验证
                  </span>
                  <span class="badge bg-primary bg-opacity-10 text-primary">
                    <i class="bi bi-shield-check me-1"></i>活跃用户
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 设置表单 -->
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-4">
                <!-- 错误和成功提示 -->
                <div v-if="errorMessage" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>{{ errorMessage }}</div>
                </div>

                <div v-if="successMessage" class="alert alert-success d-flex align-items-center mb-4" role="alert">
                  <i class="bi bi-check-circle-fill me-2"></i>
                  <div>{{ successMessage }}</div>
                </div>

                <!-- 加载状态 -->
                <div v-if="loading && !email" class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">{{ loadingText }}</span>
                  </div>
                  <p class="mt-3 text-muted">{{ loadingProfileText }}</p>
                </div>

                <!-- 设置表单 -->
                <form v-else @submit.prevent="updateProfile">
                  <!-- 基本信息部分 -->
                  <div class="mb-4">
                    <h5 class="fw-bold mb-3 text-primary">
                      <i class="bi bi-person me-2"></i>{{ basicInfoTitle }}
                    </h5>

                    <div class="row g-3">
                      <div class="col-md-12">
                        <label for="email" class="form-label fw-medium">
                          <i class="bi bi-envelope me-2"></i>{{ emailLabel }}
                        </label>
                        <input
                          type="email"
                          class="form-control form-control-lg"
                          id="email"
                          v-model="email"
                          disabled
                        >
                        <div class="form-text">
                          <i class="bi bi-info-circle me-1"></i>{{ emailHelpText }}
                        </div>
                      </div>

                      <div class="col-md-12">
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
                    </div>
                  </div>

                  <hr class="my-4">

                  <!-- 密码更改部分 -->
                  <div class="mb-4">
                    <h5 class="fw-bold mb-3 text-primary">
                      <i class="bi bi-key me-2"></i>{{ passwordSectionTitle }}
                    </h5>

                    <div class="row g-3">
                      <div class="col-md-12">
                        <label for="currentPassword" class="form-label fw-medium">
                          <i class="bi bi-shield-lock me-2"></i>{{ currentPasswordLabel }}
                        </label>
                        <div class="input-group">
                          <input
                            :type="showCurrentPassword ? 'text' : 'password'"
                            class="form-control form-control-lg"
                            id="currentPassword"
                            v-model="currentPassword"
                            :placeholder="currentPasswordPlaceholder"
                          >
                          <button
                            class="btn btn-outline-secondary"
                            type="button"
                            @click="toggleCurrentPassword"
                          >
                            <i :class="showCurrentPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                          </button>
                        </div>
                      </div>

                      <div class="col-md-12">
                        <label for="newPassword" class="form-label fw-medium">
                          <i class="bi bi-key me-2"></i>{{ newPasswordLabel }}
                        </label>
                        <div class="input-group">
                          <input
                            :type="showNewPassword ? 'text' : 'password'"
                            :class="['form-control', 'form-control-lg', getNewPasswordValidationClass()]"
                            id="newPassword"
                            v-model="newPassword"
                            :placeholder="newPasswordPlaceholder"
                            :disabled="!currentPassword"
                            minlength="6"
                            @input="validateNewPassword"
                          >
                          <button
                            class="btn btn-outline-secondary"
                            type="button"
                            @click="toggleNewPassword"
                            :disabled="!currentPassword"
                          >
                            <i :class="showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                          </button>
                        </div>

                        <!-- 新密码强度指示器 -->
                        <div v-if="newPassword && currentPassword" class="mt-2">
                          <div class="progress" style="height: 4px;">
                            <div
                              class="progress-bar"
                              :class="getPasswordStrengthColor()"
                              :style="{ width: newPasswordStrength + '%' }"
                            ></div>
                          </div>
                          <small :class="getPasswordStrengthTextColor()">
                            {{ passwordStrengthPrefix }}{{ getPasswordStrengthText() }}
                          </small>
                        </div>
                      </div>

                      <div class="col-md-12">
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
                            :disabled="!currentPassword"
                          >
                          <button
                            class="btn btn-outline-secondary"
                            type="button"
                            @click="toggleConfirmPassword"
                            :disabled="!currentPassword"
                          >
                            <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                          </button>
                        </div>

                        <!-- 密码匹配提示 -->
                        <div v-if="confirmPassword && currentPassword" class="mt-1">
                          <small v-if="passwordMismatch" class="text-danger">
                            <i class="bi bi-exclamation-circle me-1"></i>{{ passwordMismatchText }}
                          </small>
                          <small v-else-if="newPassword && confirmPassword" class="text-success">
                            <i class="bi bi-check-circle me-1"></i>{{ passwordsMatchText }}
                          </small>
                        </div>
                      </div>
                    </div>

                    <!-- 密码要求提示 -->
                    <div v-if="currentPassword" class="mt-3 p-3 bg-light rounded-3">
                      <small class="text-muted fw-medium">{{ passwordRequirementsTitle }}</small>
                      <ul class="list-unstyled mt-2 mb-0">
                        <li v-for="requirement in passwordChecks" :key="requirement.text" class="small mb-1">
                          <i :class="requirement.valid ? 'bi bi-check-circle-fill text-success' : 'bi bi-circle text-muted'" class="me-2"></i>
                          {{ requirement.text }}
                        </li>
                      </ul>
                    </div>
                  </div>

                  <!-- 提交按钮 -->
                  <div class="d-flex gap-3 justify-content-end">
                    <button
                      type="button"
                      class="btn btn-outline-secondary btn-lg px-4"
                      @click="resetForm"
                      :disabled="loading"
                    >
                      <i class="bi bi-arrow-clockwise me-2"></i>{{ resetButtonText }}
                    </button>
                    <button
                      type="submit"
                      class="btn btn-primary btn-lg px-4"
                      :disabled="loading || (newPassword && passwordMismatch) || !isFormValid"
                    >
                      <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                      <i v-else class="bi bi-check-lg me-2"></i>
                      {{ loading ? updatingText : updateButtonText }}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- 账户操作 -->
        <!-- <div class="row g-4 mt-0">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-3 text-danger">
                  <i class="bi bi-exclamation-triangle me-2"></i>{{ dangerZoneTitle }}
                </h5>
                <p class="text-muted mb-3">{{ dangerZoneDescription }}</p>

                <div class="d-flex flex-wrap gap-2">
                  <button class="btn btn-outline-warning" @click="showLogoutAllModal">
                    <i class="bi bi-box-arrow-right me-2"></i>{{ logoutAllDevicesText }}
                  </button>
                  <button class="btn btn-outline-danger" @click="showDeleteAccountModal">
                    <i class="bi bi-trash me-2"></i>{{ deleteAccountText }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../utils/supabase';

// 页面文本内容
const pageTitle = '个人设置';
const pageSubtitle = '管理您的账户信息和安全设置';
const basicInfoTitle = '基本信息';
const emailLabel = '邮箱地址';
const emailHelpText = '邮箱地址无法更改';
const fullNameLabel = '姓名';
const fullNamePlaceholder = '请输入您的姓名';
const passwordSectionTitle = '更改密码';
const currentPasswordLabel = '当前密码';
const currentPasswordPlaceholder = '请输入当前密码';
const newPasswordLabel = '新密码';
const newPasswordPlaceholder = '请输入新密码';
const confirmPasswordLabel = '确认新密码';
const confirmPasswordPlaceholder = '请再次输入新密码';
const passwordMismatchText = '两次输入的密码不匹配';
const passwordsMatchText = '密码匹配';
const passwordRequirementsTitle = '密码要求：';
const passwordStrengthPrefix = '密码强度：';
const resetButtonText = '重置';
const updateButtonText = '更新资料';
const updatingText = '更新中...';
const loadingText = '加载中...';
const loadingProfileText = '正在加载个人资料...';
const dangerZoneTitle = '危险操作';
const dangerZoneDescription = '这些操作可能会影响您的账户安全，请谨慎操作。';
const logoutAllDevicesText = '退出所有设备';
const deleteAccountText = '删除账户';

// 响应式数据
const email = ref('');
const fullName = ref('');
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(true);
const errorMessage = ref('');
const successMessage = ref('');

// 计算属性
const displayName = computed(() => {
  return fullName.value || '未设置姓名';
});

const passwordMismatch = computed(() => {
  return newPassword.value && confirmPassword.value && newPassword.value !== confirmPassword.value;
});

const passwordChecks = computed(() => [
  { text: '至少 8 个字符', valid: newPassword.value.length >= 8 },
  { text: '包含大写字母', valid: /[A-Z]/.test(newPassword.value) },
  { text: '包含小写字母', valid: /[a-z]/.test(newPassword.value) },
  { text: '包含数字', valid: /\d/.test(newPassword.value) },
  { text: '包含特殊字符', valid: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword.value) }
]);

const newPasswordStrength = computed(() => {
  const validChecks = passwordChecks.value.filter(check => check.valid).length;
  return (validChecks / passwordChecks.value.length) * 100;
});

const isFormValid = computed(() => {
  const hasBasicInfo = fullName.value.trim();
  const hasPasswordChange = currentPassword.value && newPassword.value && confirmPassword.value;

  if (hasPasswordChange) {
    return hasBasicInfo && !passwordMismatch.value && newPasswordStrength.value >= 60;
  }

  return hasBasicInfo;
});

// 方法
const toggleCurrentPassword = () => {
  showCurrentPassword.value = !showCurrentPassword.value;
};

const toggleNewPassword = () => {
  showNewPassword.value = !showNewPassword.value;
};

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const validateNewPassword = () => {
  // 实时密码验证逻辑
};

const getNewPasswordValidationClass = () => {
  if (!newPassword.value || !currentPassword.value) return '';
  const strength = newPasswordStrength.value;
  if (strength >= 80) return 'is-valid';
  if (strength >= 60) return '';
  return 'is-invalid';
};

const getConfirmPasswordValidationClass = () => {
  if (!confirmPassword.value || !currentPassword.value) return '';
  if (!newPassword.value) return '';
  return !passwordMismatch.value ? 'is-valid' : 'is-invalid';
};

const getPasswordStrengthColor = () => {
  const strength = newPasswordStrength.value;
  if (strength >= 80) return 'bg-success';
  if (strength >= 60) return 'bg-warning';
  if (strength >= 40) return 'bg-info';
  return 'bg-danger';
};

const getPasswordStrengthTextColor = () => {
  const strength = newPasswordStrength.value;
  if (strength >= 80) return 'text-success';
  if (strength >= 60) return 'text-warning';
  if (strength >= 40) return 'text-info';
  return 'text-danger';
};

const getPasswordStrengthText = () => {
  const strength = newPasswordStrength.value;
  if (strength >= 80) return '强';
  if (strength >= 60) return '中等';
  if (strength >= 40) return '一般';
  return '弱';
};

const resetForm = () => {
  currentPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  errorMessage.value = '';
  successMessage.value = '';
};

const showLogoutAllModal = () => {
  // 实现退出所有设备的模态框
  console.log('Show logout all devices modal');
};

const showDeleteAccountModal = () => {
  // 实现删除账户的模态框
  console.log('Show delete account modal');
};

// 加载用户数据
onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      email.value = user.email || '';
      fullName.value = user.user_metadata?.full_name || '';
    }
  } catch (error: any) {
    errorMessage.value = error.message || '加载用户数据失败';
    console.error('Profile load error:', error);
  } finally {
    loading.value = false;
  }
});

// 更新资料
const updateProfile = async () => {
  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  try {
    // 准备更新数据
    const updates: any = {
      data: { full_name: fullName.value.trim() }
    };

    // 如果要更改密码
    if (currentPassword.value && newPassword.value) {
      if (passwordMismatch.value) {
        errorMessage.value = '新密码两次输入不匹配';
        loading.value = false;
        return;
      }

      if (newPasswordStrength.value < 60) {
        errorMessage.value = '新密码强度不够，请选择更强的密码';
        loading.value = false;
        return;
      }

      // 验证当前密码
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: currentPassword.value
      });

      if (signInError) {
        throw new Error('当前密码不正确');
      }

      updates.password = newPassword.value;
    }

    // 更新用户信息
    const { error } = await supabase.auth.updateUser(updates);

    if (error) throw error;

    successMessage.value = currentPassword.value ?
      '资料和密码更新成功！' : '资料更新成功！';

    // 重置密码字段
    if (currentPassword.value) {
      resetForm();
    }

    // 滚动到顶部显示成功消息
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (error: any) {
    errorMessage.value = error.message || '更新资料失败';
    console.error('Profile update error:', error);

    // 滚动到顶部显示错误消息
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.avatar-placeholder {
  transition: all 0.3s ease;
}

.avatar-placeholder:hover {
  transform: scale(1.05);
}

.card {
  border-radius: 1rem;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.form-control:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  transition: transform 0.2s ease-in-out;
}

.progress {
  border-radius: 0.25rem;
}

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

/* 响应式优化 */
@media (max-width: 768px) {
  .container-fluid {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .card-body {
    padding: 1.5rem !important;
  }
}
</style>

