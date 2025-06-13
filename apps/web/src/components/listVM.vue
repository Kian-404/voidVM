<template>
  <!-- 右侧虚拟机列表 -->
  <div class="col-lg-6">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3><i class="bi bi-pc-display me-2"></i>虚拟机列表</h3>
      <button @click="loadVMs" class="btn btn-outline-primary refresh-btn">
        <i class="bi bi-arrow-clockwise"></i> 刷新列表
      </button>
    </div>

    <!-- 加载中状态 -->
    <div v-if="loading" class="showToast showToast-info">
      <div class="d-flex align-items-center justify-content-center">
        <div class="loading-spinner me-2"></div>
        <span>正在加载虚拟机...</span>
      </div>
    </div>

    <!-- 无虚拟机状态 -->
    <div v-else-if="vms.length === 0" class="showToast showToast-secondary">
      <i class="bi bi-info-circle fs-4 mb-2"></i>
      <p>没有可用的虚拟机</p>
      <small class="text-muted">使用左侧表单创建您的第一个虚拟机</small>
    </div>

    <!-- 虚拟机列表 -->
    <div v-else>
      <div v-for="vm in vms" :key="vm.name" class="card vm-card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="card-title mb-0">
              <i class="bi bi-hdd me-2"></i>{{ vm.name }}
            </h5>
            <span :class="`badge bg-${vm.status === 'running' ? 'success' : 'secondary'} status-badge`">
              <i :class="`bi ${vm.status === 'running' ? 'bi-play-fill' : 'bi-stop-fill'} me-1`"></i>
              状态: {{ vm.status === 'running' ? '运行中' : '已停止' }}
            </span>
            <!-- ISO 状态显示 -->
            <span v-if="vm.metadata.isMountIso !== undefined" class="iso-badge"
              :class="vm.metadata.isMountIso ? 'iso-mounted' : 'iso-unmounted'">
              <i class="bi" :class="vm.metadata.isMountIso ? 'bi-disc' : 'bi-disc-fill'"></i>
              {{ vm.metadata.isMountIso ? 'ISO 已挂载' : 'ISO 未挂载' }}
            </span>
          </div>

          <div class="vm-info">
            <p v-if="vm.status === 'running'">
              <small>进程ID:</small>
              <small class="text-primary">{{ vm.pid }}</small>
            </p>
            <p>
              <small>VNC 端口:</small>
              <small class="text-primary">{{ vm.config.vncPort || '无' }}</small>
            </p>
            <p>
              <small>内存:</small>
              <small class="text-primary">{{ vm.config.memory || '无' }} MB</small>
            </p>
            <p>
              <small>CPU 核心数:</small>
              <small class="text-primary">{{ vm.config.cpuCores || '无' }}</small>
            </p>
          </div>

          <div class="vm-actions">
            <!-- 已停止状态的按钮 -->
            <button v-if="vm.status !== 'running'" class="btn btn-sm btn-success" @click="startVM(vm.name, vm)">
              <i class="bi bi-play-fill"></i> 启动
            </button>

            <!-- 运行中状态的按钮 -->
            <template v-else>
              <button class="btn btn-sm btn-danger" @click="stopVM(vm.name, vm)">
                <i class="bi bi-stop-fill"></i> 停止
              </button>
              <button class="btn btn-sm btn-warning" @click="restartVM(vm.name, vm)">
                <i class="bi bi-arrow-clockwise"></i> 重启
              </button>
              <button class="btn btn-sm btn-info text-white" @click="openVNC(vm.name, vm)">
                <i class="bi bi-display"></i> VNC
              </button>
              <button class="btn btn-sm btn-secondary" @click="openTerminal(vm)">
                <i class="bi bi-terminal"></i> 终端
              </button>
              <!-- 卸载 ISO 按钮 - 只在 ISO 已挂载且虚拟机运行时显示 -->
              <button v-if="vm.metadata.isMountIso && vm.status === 'running'" class="btn btn-sm btn-purple"
                @click="toggleMountISO(vm.name, vm, false)" :disabled="unmountingIso">
                <i class="bi bi-eject"></i>
                <span v-if="unmountingIso">
                  <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  卸载中...
                </span>
                <span v-else>卸载 ISO</span>
              </button>
              <button v-if="!vm.metadata.isMountIso && vm.status === 'running'" class="btn btn-sm btn-success"
                @click="toggleMountISO(vm.name, vm, true)">
                <i class="bi bi-disc"></i>
                <span>挂载 ISO</span>
              </button>
            </template>

            <!-- 编辑按钮 - 始终显示 -->
            <button class="btn btn-sm btn-outline-primary" @click="editVM(vm)">
              <i class="bi bi-pencil"></i> 编辑
            </button>

            <!-- 删除按钮 -->
            <button class="btn btn-sm btn-outline-danger" @click="deleteVM(vm.name)">
              <i class="bi bi-trash"></i> 删除
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <editVMModalCom @loadVMs="loadVMs" ref="editVMModal" />
   <!-- 终端模态框 -->
   <div class="modal fade" id="terminalModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-body p-0">
          <VMTerminal 
            v-if="selectedVM" 
            :vm="selectedVM" 
            @close="closeTerminalModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useShowToast } from '../composables/toast.ts'
import editVMModalCom from '../components/editVMModal.vue';
import VMTerminal from "../components/VMTerminal.vue";
import { Modal } from 'bootstrap';

const selectedVM = ref(null);
const terminalModal: any = ref(null);

onMounted(() => {
  terminalModal.value = new Modal(document.getElementById('terminalModal') as HTMLElement);
});

const openTerminal = (vm: any) => {
  selectedVM.value = vm;
  terminalModal.value.show();
};

const closeTerminalModal = () => {
  terminalModal.value.hide();
};

const { showToast } = useShowToast()
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
// State
const vms: any = ref([]);
const loading = ref(true);
let ws: WebSocket | null = null;

const unmountingIso = ref(false);

const editVMModal = ref(editVMModalCom);


// Methods
const loadVMs = async () => {
  loading.value = true;
  try {
    const response = await fetch(`${BASE_URL}/api/vms`);
    if (!response.ok) {
      throw new Error("获取虚拟机列表失败");
    }
    vms.value = await response.json();
  } catch (error: any) {
    console.error("加载虚拟机错误:", error);
    showToast(`加载虚拟机失败: ${error.message}`, "danger");
  } finally {
    loading.value = false;
  }
};



const startVM = async (vmName: any, vmItem: any) => {
  const vmData = {
    ...vmItem,
  };
  try {
    const response = await fetch(`${BASE_URL}/api/vms/${vmName}/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vmData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "启动虚拟机失败");
    }

    showToast(`虚拟机 ${vmName} 启动成功`, "success");
    loadVMs();
  } catch (error: any) {
    showToast(`错误: ${error.message}`, "danger");
  }
};

const stopVM = async (vmName: any, vmItem: any) => {
  const vmData = {
    ...vmItem,
  };
  try {
    const response = await fetch(`${BASE_URL}/api/vms/${vmName}/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vmData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "停止虚拟机失败");
    }

    showToast(`虚拟机 ${vmName} 停止成功`, "success");
    loadVMs();
  } catch (error: any) {
    showToast(`错误: ${error.message}`, "danger");
  }
};

const restartVM = async (vmName: any, vmItem: any) => {
  try {
    const vmData = {
      ...vmItem,
    };
    const response = await fetch(`${BASE_URL}/api/vms/${vmName}/restart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vmData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "重启虚拟机失败");
    }

    showToast(`虚拟机 ${vmName} 正在重启...`, "success");
    loadVMs();
  } catch (error: any) {
    showToast(`错误: ${error.message}`, "danger");
  }
};

const deleteVM = async (vmName: any) => {
  if (!confirm(`确定要删除虚拟机 "${vmName}" 吗？此操作无法撤销。`)) {
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/vms/${vmName}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "删除虚拟机失败");
    }

    showToast(`虚拟机 ${vmName} 删除成功`, "success");
    loadVMs();
  } catch (error: any) {
    showToast(`错误: ${error.message}`, "danger");
  }
};

const openVNC = async (_vmName: any, vmItem: { config: { vncPort: number; }; }) => {
  // 设置VNC端口
  const vmData = {
    webPort: 6080,
    vncPort: vmItem.config.vncPort === 0 ? 5900 : vmItem.config.vncPort,
  };

  try {
    const response = await fetch(`${BASE_URL}/api/novnc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vmData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "启动 noVNC 失败");
    }

    const result = await response.json();
    window.open(result.url, "_blank");
  } catch (error: any) {
    showToast(`打开 VNC 错误: ${error.message}`, "danger");
  }
};

// 卸载 ISO 镜像
const toggleMountISO = async (vmName: any, _vm: any, mountStatus: any) => {
  // 设置加载状态
  unmountingIso.value = true;
  try {
    const response = await fetch(`${BASE_URL}/api/vms/${vmName}/toggleMountIso`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mountStatus: mountStatus }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `卸载失败: ${response.statusText}`);
    }

    if (data.success) {
      // 更新 VM 状态
      showToast(
        `已成功从虚拟机 ${vmName} ${!mountStatus ? "卸载" : "挂载"
        }ISO 镜像`,
        "success"
      );

      // 刷新虚拟机列表
      loadVMs();
    } else {
      throw new Error(data.error || "卸载 ISO 失败");
    }
  } catch (error: any) {
    console.error("卸载 ISO 错误:", error);
    showToast(`卸载 ISO 失败: ${error.message}`, "warning");
  } finally {
    // 无论成功或失败，都重置加载状态
    unmountingIso.value = false;
  }
};

// WebSocket 连接，用于实时更新
const setupWebSocket = () => {
  ws = new WebSocket(`ws://${window.location.host}/api/vm-status`);

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === "vmStatus") {
      vms.value = message.data;
    }
  };

  ws.onclose = () => {
    // 尝试在连接关闭后重新连接
    setTimeout(setupWebSocket, 5000);
  };

  ws.onerror = (error) => {
    console.error("WebSocket 错误:", error);
  };
};

// 打开编辑模态框
const editVM = (vm: any) => {
  console.log("编辑VM:", vm); // 调试日志
  editVMModal.value?.showEditVMModal(vm)
};

// 生命周期钩子
onMounted(() => {
  loadVMs();
  setupWebSocket();
  // 初始化编辑模态框
});

onUnmounted(() => {
  if (ws) {
    ws.close();
  }
});

defineExpose({
  loadVMs,
})

</script>


<style scoped></style>