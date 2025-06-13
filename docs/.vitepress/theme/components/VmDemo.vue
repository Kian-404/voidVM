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
              >状态: <span :class="`status-badge status-${vm.status}`">{{ vm.status }}</span></span
            >
          </div>
        </div>
        <div class="vm-actions">
          <el-button
            v-if="vm.status === 'stopped'"
            type="success"
            size="small"
            @click="startVm(vm.id)"
          >
            启动
          </el-button>
          <el-button
            v-if="vm.status === 'running'"
            type="warning"
            size="small"
            @click="stopVm(vm.id)"
          >
            停止
          </el-button>
          <el-button type="info" size="small" @click="openConsole(vm.id)"> 控制台 </el-button>
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
    status: 'running' | 'stopped' | 'pending'
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
      status: 'stopped',
    }
    demoVms.value.push(newVm)
  }

  const startVm = (vmId: string) => {
    const vm = demoVms.value.find(v => v.id === vmId)
    if (vm) {
      vm.status = 'pending'
      setTimeout(() => {
        vm.status = 'running'
      }, 1000)
    }
  }

  const stopVm = (vmId: string) => {
    const vm = demoVms.value.find(v => v.id === vmId)
    if (vm) {
      vm.status = 'pending'
      setTimeout(() => {
        vm.status = 'stopped'
      }, 1000)
    }
  }

  const openConsole = (vmId: string) => {
    window.open(`/console/${vmId}`, '_blank')
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
</style>
