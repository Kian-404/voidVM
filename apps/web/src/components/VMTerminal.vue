<template>
  <div class="card" :class="{'fullscreen-card': isFullscreen}" :style="{ '--terminal-height': isFullscreen ? '80vh' : '400px' }">
    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
      <h5 class="mb-0">
        <i class="bi bi-terminal me-2"></i>{{ vm.name }} 终端
      </h5>
      <div class="d-flex">
        <button v-if="showTerminal" class="btn btn-sm btn-light me-2" @click="toggleFullscreen">
          <i class="bi" :class="isFullscreen ? 'bi-fullscreen-exit' : 'bi-fullscreen'"></i>
        </button>
        <button v-if="showTerminal" class="btn btn-sm btn-light" @click="showTerminal = false">
          <i class="bi bi-arrow-left me-1"></i>返回
        </button>
      </div>
    </div>
    <!-- 全屏提示 -->
    <div v-if="isFullscreen && showTerminal" class="fullscreen-hint">
      <div class="alert alert-info alert-dismissible fade show" role="alert">
        <i class="bi bi-info-circle me-2"></i>按 <kbd>ESC</kbd> 或
        <kbd>F11</kbd> 退出全屏
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    </div>

    <div class="card-body">
      <!-- SSH 连接表单 -->
      <div v-if="!showTerminal">
        <p class="text-muted mb-3">
          <i class="bi bi-info-circle me-1"></i>
          请输入 SSH 连接信息以连接到虚拟机终端
        </p>
        <form @submit.prevent="connectToTerminal">
          <div class="mb-3">
            <label for="sshPort" class="form-label">SSH 端口</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-hdd-network"></i></span>
              <input type="number" class="form-control" id="sshPort" v-model.number="sshPort" placeholder="例如：22 或 2222"
                required />
            </div>
            <small class="form-text text-muted">虚拟机的 SSH 服务端口</small>
          </div>

          <div class="mb-3">
            <label for="sshUsername" class="form-label">用户名</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-person"></i></span>
              <input type="text" class="form-control" id="sshUsername" v-model="sshUsername" placeholder="例如：root"
                required />
            </div>
          </div>

          <div class="mb-3">
            <label for="sshPassword" class="form-label">密码</label>
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-key"></i></span>
              <input type="password" class="form-control" id="sshPassword" v-model="sshPassword" placeholder="输入 SSH 密码"
                required />
            </div>
            <small class="form-text text-muted">SSH 账户的密码</small>
          </div>

          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-primary">
              <i class="bi bi-terminal me-2"></i>连接 SSH 终端
            </button>
            <button type="button" class="btn btn-outline-secondary" @click="$emit('close')">
              <i class="bi bi-x-circle me-2"></i>取消
            </button>
          </div>
        </form>
      </div>

      <!-- SSH 终端 -->
      <SSHTerminal v-if="showTerminal" :vm-name="vm.name" :ssh-port="sshPort" :ssh-username="sshUsername"
        :ssh-password="sshPassword" :is-fullscreen="isFullscreen" @disconnect="showTerminal = false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import SSHTerminal from "./SSHTerminal.vue";

defineProps({
  vm: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const sshPort = ref(2222);
const sshUsername = ref("aaa");
const sshPassword = ref("123456");
const showTerminal = ref(false);
const isFullscreen = ref(false);

// 连接到终端
const connectToTerminal = () => {
  showTerminal.value = true;
};

// 切换全屏模式
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;

  // 如果是进入全屏模式，调整终端大小
  if (isFullscreen.value) {
    nextTick(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("resize"));
      }
    });
  }
};

// 添加键盘快捷键
onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

const handleKeyDown = (event: KeyboardEvent) => {
  // F11 或 Ctrl+Shift+F 切换全屏
  if (
    (event.key === "F11" ||
      (event.ctrlKey && event.shiftKey && event.key === "F")) &&
    showTerminal.value
  ) {
    event.preventDefault();
    toggleFullscreen();
  }
  // ESC 退出全屏
  else if (event.key === "Escape" && isFullscreen.value) {
    isFullscreen.value = false;
  }
};
</script>

<style scoped>
.card {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.fullscreen-card {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
  border-radius: 0;
  margin: 0 !important;
}

.fullscreen-card .terminal-container {
  height: calc(100vh - 120px) !important;
}

.card-header {
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.fullscreen-card .card-header {
  border-radius: 0;
}

.input-group-text {
  background-color: #f8f9fa;
}

.form-text {
  font-size: 0.8rem;
}

.fullscreen-hint {
  position: absolute;
  top: 60px;
  right: 20px;
  z-index: 1051;
  max-width: 300px;
  opacity: 0.9;
}

.fullscreen-hint .alert {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

kbd {
  background-color: #f8f9fa;
  color: #212529;
}
</style>
