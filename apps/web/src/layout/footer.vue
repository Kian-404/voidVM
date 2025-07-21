<template>
  <!-- 页脚 -->
  <footer class="mt-5 pt-4 pb-4 text-center text-muted border-top">
    <small>{{ title }} </small>
  </footer>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const title = ref('QEMU 虚拟机管理器')
</script>

<style scoped></style>
