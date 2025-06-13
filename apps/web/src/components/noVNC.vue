<template>
  <!-- noVNC 启动表单 -->
  <div class="form-section">
    <h3><i class="bi bi-display me-2"></i>启动 noVNC</h3>
    <form @submit.prevent="startNoVNC">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="novncVncPort" class="form-label">VNC 端口</label>
          <input type="number" class="form-control" id="novncVncPort" v-model.number="noVNC.vncPort"
            placeholder="例如：5900" required />
        </div>
        <div class="col-md-6 mb-3">
          <label for="novncWebPort" class="form-label">Web 端口</label>
          <input type="number" class="form-control" id="novncWebPort" v-model.number="noVNC.webPort"
            placeholder="例如：6080" />
        </div>
      </div>
      <div class="d-grid">
        <button type="submit" class="btn btn-success">
          <i class="bi bi-play-fill me-1"></i>启动 noVNC
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useShowToast } from '../composables/toast';
const { showToast } = useShowToast();
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

const noVNC = ref({
  vncPort: 5900,
  webPort: 6080,
});
const startNoVNC = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/novnc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(noVNC.value),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "启动 noVNC 失败");
    }

    const result = await response.json();
    showToast(
      `noVNC 启动成功。正在新标签页中打开 ${result.url}`,
      "success"
    );
    window.open(result.url, "_blank");
  } catch (error: any) {
    showToast(`错误: ${error.message}`, "danger");
  }
};
</script>

<style scoped></style>