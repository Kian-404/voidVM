<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card shadow">
        <div class="card-body">
          <h2 class="text-center mb-4">Login</h2>

          <div v-if="errorMessage" class="alert alert-danger">
            {{ errorMessage }}
          </div>

          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label for="email" class="form-label">Email address</label>
              <input type="email" class="form-control" id="email" v-model="email" required />
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Password</label>
              <input
                type="password"
                class="form-control"
                id="password"
                v-model="password"
                required
              />
            </div>

            <div class="mb-3 text-end">
              <router-link to="/reset-password">Forgot password?</router-link>
            </div>

            <button type="submit" class="btn btn-primary w-100" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Login
            </button>

            <div class="mt-3 text-center">
              Don't have an account? <router-link to="/register">Register</router-link>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '../stores/auth'

  const router = useRouter()
  const authStore = useAuthStore()

  const email = ref('0gi6ekh745@iwatermail.com')
  const password = ref('123qwe')
  const loading = ref(false)
  const errorMessage = ref('')

  const handleLogin = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
      const { success, error } = await authStore.login(email.value, password.value)

      if (success) {
        router.push('/dashboard')
      } else {
        errorMessage.value = error || 'Login failed. Please try again.'
      }
    } catch (error) {
      errorMessage.value = error.message || 'An unexpected error occurred'
    } finally {
      loading.value = false
    }
  }
</script>
