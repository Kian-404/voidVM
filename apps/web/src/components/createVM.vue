<template>
  <div class="form-section">
    <h3><i class="bi bi-plus-circle me-2"></i>创建新虚拟机</h3>
    <form @submit.prevent="createVM">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="vmName" class="form-label">虚拟机名称</label>
          <input type="text" class="form-control" id="vmName" v-model="newVM.vmName" placeholder="输入虚拟机名称" required />
        </div>
        <div class="col-md-6 mb-3">
          <label for="diskSize" class="form-label">磁盘大小</label>
          <input type="text" class="form-control" id="diskSize" v-model="newVM.diskSize" placeholder="例如：20G" />
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="memory" class="form-label">内存 (MB)</label>
          <input type="number" class="form-control" id="memory" v-model.number="newVM.memory" placeholder="例如：2048" />
        </div>
        <div class="col-md-6 mb-3">
          <label for="cpuCores" class="form-label">CPU 核心数</label>
          <input type="number" class="form-control" id="cpuCores" v-model.number="newVM.cpuCores" placeholder="例如：2" />
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">ISO 镜像</label>
        <div class="input-group">
          <select class="form-select" v-model="newVM.isoPath" :disabled="isLoadingIsos">
            <option value="">-- 不使用 ISO 镜像 --</option>
            <option v-if="isLoadingIsos" value="" disabled>
              加载中...
            </option>
            <option v-for="iso in isoList" :key="iso.path" :value="iso.path">
              {{ iso.name }} ({{ iso.size }})
            </option>
          </select>
          <button class="btn btn-outline-secondary" type="button" @click="refreshIsoList" :disabled="isLoadingIsos">
            <i class="bi" :class="isLoadingIsos ? 'bi-arrow-repeat spin' : 'bi-arrow-repeat'"></i>
          </button>
        </div>
        <small class="form-text text-muted">
          选择要挂载的 ISO 镜像文件，用于安装操作系统,
          添加新镜像,请把ISO文件放到 项目/iso 目录下
        </small>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="vncPort" class="form-label">VNC 端口</label>
          <input type="number" class="form-control" id="vncPort" v-model.number="newVM.vncPort" placeholder="例如：0" />
        </div>
        <div class="col-md-6 mb-3">
          <label for="networkType" class="form-label">网络类型</label>
          <select class="form-control" id="networkType" v-model="newVM.networkType">
            <option value="user">用户模式 (NAT)</option>
            <option value="bridge">桥接模式</option>
          </select>
        </div>
      </div>

      <div id="portForwardingSection">
        <h5><i class="bi bi-arrow-left-right me-1"></i>端口转发</h5>
        <div v-for="(port, index) in newVM.portForwarding" :key="index" class="port-forwarding-entry mb-2 row">
          <div class="col">
            <input type="number" class="form-control" placeholder="主机端口" v-model.number="port.hostPort" />
          </div>
          <div class="col">
            <input type="number" class="form-control" placeholder="客户机端口" v-model.number="port.guestPort" />
          </div>
          <div class="col-auto">
            <button type="button" class="btn btn-danger" @click="removePortForwarding(index)">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" @click="addPortForwarding">
          <i class="bi bi-plus-lg me-1"></i>添加端口转发
        </button>
      </div>

      <div class="d-grid mt-4">
        <button type="submit" class="btn btn-primary">
          <i class="bi bi-hdd-network me-1"></i>创建虚拟机
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
import { useShowToast } from '../composables/toast.ts'
const { showToast } = useShowToast();
// Form data
const newVM = ref({
  vmName: `VM_${new Date().getTime()}`,
  diskSize: "20G",
  memory: 2048,
  cpuCores: 2,
  isoPath: "",
  vncPort: 0,
  networkType: "user",
  portForwarding: [{ hostPort: null, guestPort: null }],
});
const isoList: any = ref([]);
const isLoadingIsos = ref(false);

// emit refreshVMs event to parent component
const emit = defineEmits(['loadVMs']);

const createVM = async () => {
  try {
    // 过滤掉空的端口转发条目
    const portForwarding = newVM.value.portForwarding.filter(
      (port) => port.hostPort && port.guestPort
    );
    const vncPort = newVM.value.vncPort + 5900;
    const vmData = {
      ...newVM.value,
      portForwarding,
      vncPort,
    };

    const response = await fetch(`${BASE_URL}/api/vms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(vmData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "创建虚拟机失败");
    }

    const result = await response.json();
    showToast(
      `虚拟机创建成功。VNC 端口: ${result.config.vncPort}`,
      "success"
    );

    // 重置表单并重新加载虚拟机列表
    resetNewVMForm();
    emit('loadVMs');
  } catch (error: any) {
    showToast(`错误: ${error.message}`, "danger");
  }

};
const resetNewVMForm = () => {
  newVM.value = {
    vmName: `VM_${new Date().getTime()}`,
    diskSize: "20G",
    memory: 2048,
    cpuCores: 2,
    isoPath: "",
    vncPort: 0,
    networkType: "user",
    portForwarding: [{ hostPort: null, guestPort: null }],
  };
};
const addPortForwarding = () => {
  newVM.value.portForwarding.push({
    hostPort: null,
    guestPort: null,
  });
};

const removePortForwarding = (index: number) => {
  newVM.value.portForwarding.splice(index, 1);
  // 确保至少有一个端口转发条目
  if (newVM.value.portForwarding.length === 0) {
    addPortForwarding();
  }
};
const refreshIsoList = async () => {
  isLoadingIsos.value = true;
  try {
    const response = await fetch(`${BASE_URL}/api/isos`);

    if (!response.ok) {
      throw new Error(`获取 ISO 列表失败: ${response.statusText}`);
    }

    const data = await response.json();

    console.log("ISO 列表:", data); // 调试日志
    if (data.success) {
      isoList.value = data.isos;
    } else {
      throw new Error(data.error || "获取 ISO 列表失败");
    }
  } catch (error: any) {
    console.error("获取 ISO 列表错误:", error);
    showToast(`获取 ISO 列表失败: ${error.message}`, "danger");
  } finally {
    isLoadingIsos.value = false;
  }
};

onMounted(() => {
  refreshIsoList();
});
</script>

<style scoped></style>