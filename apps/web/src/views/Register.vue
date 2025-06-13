<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card shadow">
        <div class="card-body">
          <h2 class="text-center mb-4">Register</h2>

          <div v-if="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="alert alert-success">
            {{ successMessage }}
          </div>

          <form @submit.prevent="handleRegister">
            <div class="mb-3">
              <label for="fullName" class="form-label">Full Name</label>
              <input type="text" class="form-control" id="fullName" v-model="fullName" required>
            </div>

            <div class="mb-3">
              <label for="email" class="form-label">Email address</label>
              <input type="email" class="form-control" id="email" v-model="email" required>
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input type="password" class="form-control" id="password" v-model="password" required minlength="6">
              <div class="form-text">Password must be at least 6 characters long</div>
            </div>

            <div class="mb-3">
              <label for="confirmPassword" class="form-label">Confirm Password</label>
              <input type="password" class="form-control" id="confirmPassword" v-model="confirmPassword" required>
              <div v-if="passwordMismatch" class="text-danger mt-1">
                Passwords do not match
              </div>
            </div>

            <button type="submit" class="btn btn-primary w-100" :disabled="loading || passwordMismatch">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Register
            </button>

            <div class="mt-3 text-center">
              Already have an account? <router-link to="/login">Login</router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../utils/supabase';

export default defineComponent({
  name: 'RegisterView',
  setup() {
    const router = useRouter();

    const fullName = ref('');
    const email = ref('');
    const password = ref('');
    const confirmPassword = ref('');
    const loading = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');

    const passwordMismatch = computed(() => {
      return password.value && confirmPassword.value && password.value !== confirmPassword.value;
    });

    const handleRegister = async () => {
      // Reset messages
      errorMessage.value = '';
      successMessage.value = '';

      // Validate form
      if (passwordMismatch.value) {
        errorMessage.value = 'Passwords do not match';
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

        // Check if email confirmation is required
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          errorMessage.value = 'This email is already registered';
        } else {
          successMessage.value = 'Registration successful! Please check your email to confirm your account.';

          // Reset form
          fullName.value = '';
          email.value = '';
          password.value = '';
          confirmPassword.value = '';

          // Redirect to login after a delay
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }
      } catch (error: any) {
        errorMessage.value = error.message || 'An error occurred during registration';
        console.error('Registration error:', error);
      } finally {
        loading.value = false;
      }
    };

    return {
      fullName,
      email,
      password,
      confirmPassword,
      loading,
      errorMessage,
      successMessage,
      passwordMismatch,
      handleRegister
    };
  }
});
</script>
