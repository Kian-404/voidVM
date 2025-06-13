<template>
  <!-- 虚拟机配置编辑模态框 -->
  <div class="modal fade" tabindex="-1" aria-labelledby="editVMModalLabel" aria-hidden="true" id="editVMModal">
    <div class="modal-dialog modal-lg">
      <div class="modal-content" v-if="editingVM.name">
        <div class="modal-header">
          <h5 class="modal-title" id="editVMModalLabel">
            <i class="bi bi-pencil-square me-2"></i>编辑虚拟机配置
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form id="editVMForm">
            <div class="mb-3">
              <label class="form-label">虚拟机名称</label>
              <input type="text" class="form-control" v-model="editingVM.name" disabled />
              <small class="text-muted">虚拟机名称不可更改</small>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">内存 (MB)</label>
                <input type="number" class="form-control" v-model.number="editingVM.config.memory" />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">CPU 核心数</label>
                <input type="number" class="form-control" v-model.number="editingVM.config.cpuCores" />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">VNC 端口</label>
              <input type="number" class="form-control" v-model.number="editingVM.config.vncPort" />
            </div>

            <div class="mb-3">
              <label class="form-label">ISO 镜像</label>
              <div class="input-group">
                <select class="form-select" v-model="editingVM.config.isoPath" :disabled="isLoadingIsos">
                  <option value="">-- 不使用 ISO 镜像 --</option>
                  <option v-if="isLoadingIsos" value="" disabled>
                    加载中...
                  </option>
                  <option v-for="iso in isoList" :key="iso.path" :value="iso.path">
                    {{ iso.name }} ({{ iso.size }})
                  </option>
                </select>
                <button class="btn btn-outline-secondary" type="button" @click="refreshIsoList"
                  :disabled="isLoadingIsos">
                  <i class="bi" :class="isLoadingIsos ? 'bi-arrow-repeat spin' : 'bi-arrow-repeat'"></i>
                </button>
              </div>
              <small class="form-text text-muted">
                选择要挂载的 ISO 镜像文件，用于安装操作系统
              </small>
            </div>

            <div class="mb-3">
              <label class="form-label">网络类型</label>
              <select class="form-control" v-model="editingVM.config.networkType">
                <option value="user">用户模式 (NAT)</option>
                <option value="bridge">桥接模式</option>
              </select>
            </div>

            <div id="editPortForwardingSection">
              <h5 class="mb-3">
                <i class="bi bi-arrow-left-right me-1"></i>端口转发
              </h5>
              <div v-for="(port, index) in editingVM.config.portForwarding" :key="index"
                class="port-forwarding-entry mb-2 row">
                <div class="col">
                  <input type="number" class="form-control" placeholder="主机端口" v-model.number="port.hostPort" />
                </div>
                <div class="col">
                  <input type="number" class="form-control" placeholder="客户机端口" v-model.number="port.guestPort" />
                </div>
                <div class="col-auto">
                  <button type="button" class="btn btn-danger" @click="removeEditPortForwarding(index)">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" @click="addEditPortForwarding">
                <i class="bi bi-plus-lg me-1"></i>添加端口转发
              </button>
            </div>

            <div class="alert alert-info mt-3">
              <i class="bi bi-info-circle me-2"></i>
              <small>注意：某些配置更改可能需要重启虚拟机才能生效。</small>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            取消
          </button>
          <button type="button" class="btn btn-primary" @click="saveVMConfig">
            <i class="bi bi-save me-1"></i>保存配置
          </button>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useShowToast } from '../composables/toast.ts'
import { Modal } from 'bootstrap';

// import {useShowToast} from './utils/index.ts'

interface PortForwardingType {
  hostPort: number | null;
  guestPort: number | null;
}

const { showToast } = useShowToast()
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
const isLoadingIsos = ref(false);
const isoList: any = ref([]);

// 编辑VM相关状态
const editingVM = ref({
  name: "",
  config: {
    memory: 2048,
    cpuCores: 2,
    vncPort: 0,
    isoPath: "",
    networkType: "user",
    portForwarding: [] as PortForwardingType[],
  },
});

const emit = defineEmits(['loadVMs'])

const editVMModal = ref<Modal>();
// 保存VM配置
const saveVMConfig = async () => {
  console.log("保存VM配置:", editingVM.value); // 调试日志
  try {
    // 过滤掉空的端口转发条目
    const portForwarding = editingVM.value.config.portForwarding.filter(
      (port: any) => port.hostPort && port.guestPort
    );

    // 更新端口转发
    editingVM.value.config.portForwarding = portForwarding;

    // 发送更新请求
    const response = await fetch(
      `${BASE_URL}/api/vms/${editingVM.value.name}/config`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingVM.value.config),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "更新虚拟机配置失败");
    }

    // 关闭模态框
    editVMModal.value?.hide();
    // 关闭模态框

    // 显示成功消息
    showToast("虚拟机配置已成功更新", "success");

    // 重新加载VM列表
    emit('loadVMs')
  } catch (error: any) {
    showToast(`更新配置失败: ${error.message}`, "danger");
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
// 添加端口转发
const addEditPortForwarding = () => {
  editingVM.value.config.portForwarding.push({
    hostPort: null,
    guestPort: null,
  });
};

// 移除端口转发
const removeEditPortForwarding = (index: number) => {
  editingVM.value.config.portForwarding.splice(index, 1);
  // 确保至少有一个端口转发条目
  if (editingVM.value.config.portForwarding.length === 0) {
    addEditPortForwarding();
  }
};
// 生命周期钩子
onMounted(() => {
  refreshIsoList();
  // 初始化编辑模态框
  editVMModal.value = new Modal(document.getElementById("editVMModal") as HTMLElement);
});
const editVM = (vm: any) => {

  // 确保config对象存在
  const vmConfig = vm.config || {};

  // 创建一个完整的编辑对象，包含所有可能的字段
  editingVM.value = {
    name: vm.name,
    config: {
      memory: vmConfig.memory || 2048,
      cpuCores: vmConfig.cpuCores || 2,
      vncPort: vmConfig.vncPort || 0,
      isoPath: vmConfig.isoPath || "",
      networkType: vmConfig.networkType || "user",
      portForwarding: Array.isArray(vmConfig.portForwarding)
        ? JSON.parse(JSON.stringify(vmConfig.portForwarding))
        : [],
    },
  };
  console.log("编辑对象:", editingVM.value); // 调试日志
  // 确保端口转发数组有内容
  if (editingVM.value.config.portForwarding.length === 0) {
    editingVM.value.config.portForwarding.push({
      hostPort: null,
      guestPort: null,
    });
  }

  console.log("编辑对象:", editingVM.value); // 调试日志
}
const showEditVMModal = (vm: any) => {
  console.log("编辑VM:", vm); // 调试日志
  editVM(vm);
  editVMModal.value?.show()
}
defineExpose({
  showEditVMModal
})
</script>

<style scoped></style>