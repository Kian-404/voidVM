<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card shadow">
        <div class="card-body">
          <h2 class="text-center mb-4">Reset Password</h2>

          <div v-if="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>

          <template v-if="resetMode">
            <!-- Password reset form (after clicking email link) -->
            <form @submit.prevent="handlePasswordReset">
              <div class="mb-3">
                <label for="newPassword" class="form-label">New Password</label>
                <input type="password" class="form-control" id="newPassword" v-model="newPassword" required
                  minlength="6">
                <div class="form-text">Password must be at least 6 characters long</div>
              </div>

              <div class="mb-3">
                <label for="confirmPassword" class="form-label">Confirm New Password</label>
                <input type="password" class="form-control" id="confirmPassword" v-model="confirmPassword" required>
                <div v-if="passwordMismatch" class="text-danger mt-1">
                  Passwords do not match
                </div>
              </div>

              <button type="submit" class="btn btn-primary w-100" :disabled="loading || passwordMismatch">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Update Password
              </button>
            </form>
          </template>

          <template v-else>
            <!-- Request password reset form -->
            <form @submit.prevent="handleResetRequest">
              <div class="mb-3">
                <label for="email" class="form-label">Email address</label>
                <input type="email" class="form-control" id="email" v-model="email" required>
              </div>

              <button type="submit" class="btn btn-primary w-100" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Send Reset Link
              </button>
            </form>
          </template>

          <div class="mt-3 text-center">
            <router-link to="/login">Back to Login</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { supabase } from '../utils/supabase';

export default defineComponent({
  name: 'ResetPasswordView',
  setup() {
    const router = useRouter();
    const route = useRoute();

    const email = ref('');
    const newPassword = ref('');
    const confirmPassword = ref('');
    const loading = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');
    const resetMode = ref(false);

    const passwordMismatch = computed(() => {
      return newPassword.value && confirmPassword.value && newPassword.value !== confirmPassword.value;
    });

    // Check if we're in password reset mode (after clicking email link)
    onMounted(async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');

      if (type === 'recovery') {
        resetMode.value = true;
      }
    });

    // Request password reset
    const handleResetRequest = async () => {
      errorMessage.value = '';
      successMessage.value = '';
      loading.value = true;

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
          redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) throw error;

        successMessage.value = 'Password reset link has been sent to your email';
        email.value = '';
      } catch (error: any) {
        errorMessage.value = error.message || 'Failed to send reset link';
        console.error('Reset request error:', error);
      } finally {
        loading.value = false;
      }
    };

    // Update password after reset
    const handlePasswordReset = async () => {
      if (passwordMismatch.value) {
        errorMessage.value = 'Passwords do not match';
        return;
      }

      errorMessage.value = '';
      successMessage.value = '';
      loading.value = true;

      try {
        const { error } = await supabase.auth.updateUser({
          password: newPassword.value
        });

        if (error) throw error;

        successMessage.value = 'Password has been updated successfully';

        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } catch (error: any) {
        errorMessage.value = error.message || 'Failed to update password';
        console.error('Password update error:', error);
      } finally {
        loading.value = false;
      }
    };

    return {
      email,
      newPassword,
      confirmPassword,
      loading,
      errorMessage,
      successMessage,
      resetMode,
      passwordMismatch,
      handleResetRequest,
      handlePasswordReset
    };
  }
});
</script>
