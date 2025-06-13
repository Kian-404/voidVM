<template>
  <div class="app-container">
    <Navbar />
    <div class="container mt-4">
      <div v-if="authStore.loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <router-view v-else />
    </div>
    <Toast />
  </div>
</template>

<script setup>
  import { onMounted } from 'vue'
  import { useAuthStore } from './stores/auth'
  import Navbar from './components/Navbar.vue'
  import Toast from './components/Toast.vue'

  const authStore = useAuthStore()

  onMounted(async () => {
    await authStore.initialize()
  })
</script>
