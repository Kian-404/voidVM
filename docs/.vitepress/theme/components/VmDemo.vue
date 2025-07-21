<template>
  <div class="vm-demo">
    <div class="demo-header">
      <h3>虚拟机演示</h3>
      <el-button type="primary" @click="createDemoVm">创建演示虚拟机</el-button>
    </div>

    <div class="vm-list">
      <div v-for="vm in demoVms" :key="vm.id" class="vm-card">
        <div class="vm-info">
          <h4>{{ vm.name }}</h4>
          <p>{{ vm.description }}</p>
          <div class="vm-specs">
            <span>CPU: {{ vm.cpu }} 核</span>
            <span>内存: {{ vm.memory }}MB</span>
            <span
              >状态:
              <span :class="`status-badge status-${vm.status}`">{{
                getStatusText(vm.status)
              }}</span></span
            >
          </div>
        </div>
        <div class="vm-actions">
          <!-- 启动按钮 -->
          <el-button
            v-if="vm.status === 'stopped'"
            type="success"
            size="small"
            @click="startVm(vm.id)"
            :loading="false"
          >
            启动
          </el-button>

          <!-- 停止按钮 -->
          <el-button
            v-if="vm.status === 'running'"
            type="danger"
            size="small"
            @click="stopVm(vm.id)"
          >
            停止
          </el-button>

          <!-- 暂停按钮 -->
          <el-button
            v-if="vm.status === 'running'"
            type="warning"
            size="small"
            @click="pauseVm(vm.id)"
          >
            暂停
          </el-button>

          <!-- 恢复按钮 -->
          <el-button
            v-if="vm.status === 'paused'"
            type="success"
            size="small"
            @click="resumeVm(vm.id)"
          >
            恢复
          </el-button>

          <!-- 重启按钮 -->
          <el-button
            v-if="vm.status === 'running'"
            type="primary"
            size="small"
            @click="rebootVm(vm.id)"
          >
            重启
          </el-button>

          <!-- 删除按钮 -->
          <el-button
            v-if="vm.status === 'stopped'"
            type="danger"
            size="small"
            @click="deleteVm(vm.id)"
            plain
          >
            删除
          </el-button>

          <!-- 进行中状态显示 -->
          <el-button
            v-if="
              [
                'creating',
                'starting',
                'stopping',
                'pausing',
                'resuming',
                'rebooting',
                'deleting',
              ].includes(vm.status)
            "
            size="small"
            loading
            disabled
          >
            {{ getStatusText(vm.status) }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'

  interface DemoVM {
    id: string
    name: string
    description: string
    cpu: number
    memory: number
    status:
      | 'creating'
      | 'stopped'
      | 'starting'
      | 'running'
      | 'stopping'
      | 'pausing'
      | 'paused'
      | 'resuming'
      | 'rebooting'
      | 'deleting'
  }

  const demoVms = ref<DemoVM[]>([
    {
      id: 'demo-ubuntu',
      name: 'Ubuntu 20.04 Demo',
      description: 'Ubuntu Server 演示虚拟机',
      cpu: 2,
      memory: 2048,
      status: 'stopped',
    },
    {
      id: 'demo-centos',
      name: 'CentOS 8 Demo',
      description: 'CentOS 演示虚拟机',
      cpu: 1,
      memory: 1024,
      status: 'running',
    },
  ])

  const createDemoVm = () => {
    const newVm: DemoVM = {
      id: `demo-${Date.now()}`,
      name: `Demo VM ${demoVms.value.length + 1}`,
      description: '新创建的演示虚拟机',
      cpu: 1,
      memory: 1024,
      status: 'creating',
    }
    demoVms.value.push(newVm)

    // 模拟创建过程
    setTimeout(() => {
      const vm = demoVms.value.find(v => v.id === newVm.id)
      if (vm) {
        vm.status = 'stopped'
      }
    }, 2000)
  }

  const startVm = (vmId: string) => {
    const vm = demoVms.value.find(v => v.id === vmId)
    if (vm && vm.status === 'stopped') {
      vm.status = 'starting'
      setTimeout(() => {
        vm.status = 'running'
      }, 1500)
    }
  }

  const stopVm = (vmId: string) => {
    const vm = demoVms.value.find(v => v.id === vmId)
    if (vm && vm.status === 'running') {
      vm.status = 'stopping'
      setTimeout(() => {
        vm.status = 'stopped'
      }, 1500)
    }
  }

  const pauseVm = (vmId: string) => {
    const vm = demoVms.value.find(v => v.id === vmId)
    if (vm && vm.status === 'running') {
      vm.status = 'pausing'
      setTimeout(() => {
        vm.status = 'paused'
      }, 800)
    }
  }

  const resumeVm = (vmId: string) => {
    const vm = demoVms.value.find(v => v.id === vmId)
    if (vm && vm.status === 'paused') {
      vm.status = 'resuming'
      setTimeout(() => {
        vm.status = 'running'
      }, 800)
    }
  }

  const rebootVm = (vmId: string) => {
    const vm = demoVms.value.find(v => v.id === vmId)
    if (vm && vm.status === 'running') {
      vm.status = 'rebooting'
      setTimeout(() => {
        vm.status = 'running'
      }, 2000)
    }
  }

  const deleteVm = (vmId: string) => {
    const vm = demoVms.value.find(v => v.id === vmId)
    if (vm && vm.status === 'stopped') {
      vm.status = 'deleting'
      setTimeout(() => {
        const index = demoVms.value.findIndex(v => v.id === vmId)
        if (index > -1) {
          demoVms.value.splice(index, 1)
        }
      }, 1000)
    }
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      creating: '创建中',
      stopped: '已停止',
      starting: '启动中',
      running: '运行中',
      stopping: '停止中',
      pausing: '暂停中',
      paused: '已暂停',
      resuming: '恢复中',
      rebooting: '重启中',
      deleting: '删除中',
    }
    return statusMap[status] || status
  }
</script>

<style scoped>
  .vm-demo {
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
    background-color: var(--vp-c-bg-soft);
  }

  .demo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .vm-list {
    display: grid;
    gap: 16px;
  }

  .vm-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 6px;
    background-color: var(--vp-c-bg);
  }

  .vm-info h4 {
    margin: 0 0 8px 0;
    color: var(--vp-c-text-1);
  }

  .vm-info p {
    margin: 0 0 8px 0;
    color: var(--vp-c-text-2);
    font-size: 14px;
  }

  .vm-specs {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: var(--vp-c-text-2);
  }

  .vm-actions {
    display: flex;
    gap: 8px;
  }
  .status-badge {
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
  }

  .status-creating,
  .status-starting,
  .status-stopping,
  .status-pausing,
  .status-resuming,
  .status-rebooting,
  .status-deleting {
    background-color: #e6f7ff;
    color: #1890ff;
  }

  .status-stopped {
    background-color: #f6f6f6;
    color: #666;
  }

  .status-running {
    background-color: #f6ffed;
    color: #52c41a;
  }

  .status-paused {
    background-color: #fff7e6;
    color: #fa8c16;
  }

  .vm-actions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .vm-actions .el-button {
    min-width: 60px;
  }
</style>
