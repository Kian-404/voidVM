<template>
  <!-- 右侧虚拟机列表 -->
  <div class="vm-list col-lg-6 col-md-12">
    <div class="vm-list-container">
      <!-- 头部区域 -->
      <div class="vm-list-header">
        <div class="d-flex justify-content-between align-items-center">
          <h3 class="mb-0">
            <i class="bi bi-pc-display me-2"></i>虚拟机列表
            <span v-if="vms.length > 0" class="badge bg-primary ms-2">{{ vms.length }}</span>
          </h3>
          <button @click="loadVMs" class="btn btn-outline-primary refresh-btn" :disabled="loading">
            <i class="bi bi-arrow-clockwise" :class="{ spin: loading }"></i> 刷新
          </button>
        </div>

        <!-- 搜索和筛选 -->
        <div v-if="vms.length > 0" class="vm-filters mt-3">
          <div class="row g-2">
            <div class="col-md-8">
              <div class="input-group input-group-sm">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control"
                  placeholder="搜索虚拟机名称..."
                />
              </div>
            </div>
            <div class="col-md-4">
              <select v-model="statusFilter" class="form-select form-select-sm">
                <option value="all">全部状态</option>
                <option value="running">运行中</option>
                <option value="stopped">已停止</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载中状态 -->
      <div v-if="loading" class="vm-list-loading">
        <div class="d-flex align-items-center justify-content-center">
          <div class="loading-spinner me-2"></div>
          <span>正在加载虚拟机...</span>
        </div>
      </div>

      <!-- 无虚拟机状态 -->
      <div v-else-if="vms.length === 0" class="vm-list-empty">
        <div class="text-center py-5">
          <i class="bi bi-pc-display-horizontal display-1 text-muted mb-3"></i>
          <h5 class="text-muted">暂无虚拟机</h5>
          <p class="text-muted mb-3">使用左侧表单创建您的第一个虚拟机</p>
          <small class="text-muted">支持多种操作系统和自定义配置</small>
        </div>
      </div>

      <!-- 虚拟机列表 -->
      <div v-else class="vm-list-content">
        <div class="vm-list-scroll">
          <div v-if="filteredVMs.length === 0" class="no-results">
            <div class="text-center py-4">
              <i class="bi bi-search fs-1 text-muted mb-2"></i>
              <p class="text-muted mb-0">未找到匹配的虚拟机</p>
              <small class="text-muted">尝试修改搜索条件</small>
            </div>
          </div>

          <div v-else class="vm-grid">
            <div v-for="vm in filteredVMs" :key="vm.name" class="vm-card-wrapper">
              <div class="card vm-card h-100" :class="{ 'vm-running': vm.status === 'running' }">
                <div class="card-body p-3">
                  <!-- 卡片头部 -->
                  <div class="vm-card-header">
                    <div class="vm-title-section">
                      <h6 class="card-title mb-1"><i class="bi bi-hdd me-2"></i>{{ vm.name }}</h6>
                      <div class="vm-status-badges">
                        <span :class="`badge ${getStatusBadgeClass(vm.status)} status-badge`">
                          <i :class="`bi ${getStatusIcon(vm.status)} me-1`"></i>
                          {{ getStatusText(vm.status) }}
                        </span>
                        <span
                          v-if="vm.metadata.isMountIso !== undefined"
                          class="badge iso-badge"
                          :class="vm.metadata.isMountIso ? 'bg-info' : 'bg-secondary'"
                        >
                          <i
                            class="bi"
                            :class="vm.metadata.isMountIso ? 'bi-disc' : 'bi-disc-fill'"
                          ></i>
                          {{ vm.metadata.isMountIso ? 'ISO已挂载' : 'ISO未挂载' }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- 虚拟机信息 -->
                  <div class="vm-info mt-2">
                    <div class="row g-1 text-sm">
                      <div class="col-6" v-if="vm.status === 'running'">
                        <small class="text-muted">PID:</small>
                        <small class="text-primary fw-medium">{{ vm.pid }}</small>
                      </div>
                      <div class="col-6">
                        <small class="text-muted">VNC:</small>
                        <small class="text-primary fw-medium">{{ vm.config.vncPort || '-' }}</small>
                      </div>
                      <div class="col-6">
                        <small class="text-muted">内存:</small>
                        <small class="text-primary fw-medium"
                          >{{ vm.config.memory || '-' }}MB</small
                        >
                      </div>
                      <div class="col-6">
                        <small class="text-muted">CPU:</small>
                        <small class="text-primary fw-medium"
                          >{{ vm.config.cpuCores || '-' }}核</small
                        >
                      </div>
                    </div>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="vm-actions mt-3">
                    <div class="btn-group-vertical w-100" role="group">
                      <!-- 第一行按钮 -->
                      <div class="btn-group btn-group-sm mb-1" role="group">
                        <!-- 基础控制按钮 -->
                        <template v-if="vm.status !== 'running'">
                          <button class="btn btn-success flex-fill" @click="startVM(vm.name, vm)">
                            <i class="bi bi-play-fill"></i> 启动
                          </button>
                        </template>
                        <template v-else>
                          <button class="btn btn-danger" @click="stopVM(vm.name, vm)">
                            <i class="bi bi-stop-fill"></i> 停止
                          </button>
                          <button class="btn btn-warning" @click="restartVM(vm.name, vm)">
                            <i class="bi bi-arrow-clockwise"></i> 重启
                          </button>
                        </template>
                      </div>

                      <!-- 第二行按钮 - 仅运行时显示 -->
                      <div
                        v-if="vm.status === 'running'"
                        class="btn-group btn-group-sm mb-1"
                        role="group"
                      >
                        <button class="btn btn-info text-white" @click="openVNC(vm.name, vm)">
                          <i class="bi bi-display"></i> VNC
                        </button>
                        <button class="btn btn-secondary" @click="openTerminal(vm)">
                          <i class="bi bi-terminal"></i> 终端
                        </button>
                      </div>

                      <!-- ISO 控制按钮 -->
                      <div
                        v-if="vm.status === 'running'"
                        class="btn-group btn-group-sm mb-1"
                        role="group"
                      >
                        <button
                          v-if="vm.metadata.isMountIso"
                          class="btn btn-outline-warning flex-fill"
                          @click="toggleMountISO(vm.name, vm, false)"
                          :disabled="unmountingIso"
                        >
                          <template v-if="unmountingIso">
                            <span class="spinner-border spinner-border-sm me-1"></span>
                            卸载中...
                          </template>
                          <template v-else> <i class="bi bi-eject"></i> 卸载ISO </template>
                        </button>
                        <button
                          v-else
                          class="btn btn-outline-success flex-fill"
                          @click="toggleMountISO(vm.name, vm, true)"
                        >
                          <i class="bi bi-disc"></i> 挂载ISO
                        </button>
                      </div>

                      <!-- 管理按钮 -->
                      <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-primary" @click="editVM(vm)">
                          <i class="bi bi-pencil"></i> 编辑
                        </button>
                        <button class="btn btn-outline-danger" @click="deleteVM(vm.name)">
                          <i class="bi bi-trash"></i> 删除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 模态框组件 -->
  <Teleport to="body">
    <editVMModalCom @loadVMs="loadVMs" ref="editVMModal" />
  </Teleport>
  <!-- 终端模态框 -->
  <Teleport to="body">
    <div class="modal fade" id="terminalModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-body p-0">
            <VMTerminal v-if="selectedVM" :vm="selectedVM" @close="closeTerminalModal" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { useShowToast } from '../composables/toast'
  import editVMModalCom from '../components/editVMModal.vue'
  import VMTerminal from '../components/VMTerminal.vue'
  import { Modal } from 'bootstrap'
  import { VirtualMachineAPI } from '../api/virtualMachine'
  import { config } from '../utils/config'

  const selectedVM = ref(null)
  const terminalModal: any = ref(null)

  onMounted(() => {
    terminalModal.value = new Modal(document.getElementById('terminalModal') as HTMLElement)
  })

  const openTerminal = (vm: any) => {
    selectedVM.value = vm
    terminalModal.value.show()
  }

  const closeTerminalModal = () => {
    terminalModal.value.hide()
  }

  const { showToast } = useShowToast()
  // State
  const vms: any = ref([])
  const loading = ref(true)
  let ws: WebSocket | null = null

  const unmountingIso = ref(false)

  const editVMModal = ref(editVMModalCom)

  // 添加搜索和筛选功能
  const searchQuery = ref('')
  const statusFilter = ref('all')

  // 计算属性：过滤后的虚拟机列表
  const filteredVMs = computed(() => {
    let filtered = vms.value

    // 按搜索关键词过滤
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(vm => vm.name.toLowerCase().includes(query))
    }

    // 按状态过滤
    if (statusFilter.value !== 'all') {
      const targetStatus = statusFilter.value === 'running' ? 'running' : 'stopped'
      filtered = filtered.filter(vm => {
        if (targetStatus === 'running') {
          return vm.status === 'running'
        } else {
          return vm.status !== 'running'
        }
      })
    }

    return filtered
  })

  // 工具函数
  const getStatusBadgeClass = (status: string) => {
    return status === 'running' ? 'bg-success' : 'bg-secondary'
  }

  const getStatusIcon = (status: string) => {
    return status === 'running' ? 'bi-play-fill' : 'bi-stop-fill'
  }

  const getStatusText = (status: string) => {
    return status === 'running' ? '运行中' : '已停止'
  }

  // Methods
  const loadVMs = async () => {
    loading.value = true
    try {
      vms.value = await VirtualMachineAPI.getVMList()
    } catch (error: any) {
      console.error('加载虚拟机错误:', error)
      showToast(`加载虚拟机失败: ${error.message}`, 'danger')
    } finally {
      loading.value = false
    }
  }

  const startVM = async (vmName: any, vmItem: any) => {
    const vmData = {
      ...vmItem,
    }
    try {
      await VirtualMachineAPI.startVM(vmName, vmData)
      showToast(`虚拟机 ${vmName} 启动成功`, 'success')
      loadVMs()
    } catch (error: any) {
      showToast(`错误: ${error.message}`, 'danger')
    }
  }

  const stopVM = async (vmName: any, vmItem: any) => {
    const vmData = {
      ...vmItem,
    }
    try {
      await VirtualMachineAPI.stopVM(vmName, vmData)

      showToast(`虚拟机 ${vmName} 停止成功`, 'success')
      loadVMs()
    } catch (error: any) {
      showToast(`错误: ${error.message}`, 'danger')
    }
  }

  const restartVM = async (vmName: any, vmItem: any) => {
    try {
      const vmData = {
        ...vmItem,
      }
      await VirtualMachineAPI.restartVM(vmName, vmData)

      showToast(`虚拟机 ${vmName} 正在重启...`, 'success')
      loadVMs()
    } catch (error: any) {
      showToast(`错误: ${error.message}`, 'danger')
    }
  }

  const deleteVM = async (vmName: any) => {
    if (!confirm(`确定要删除虚拟机 "${vmName}" 吗？此操作无法撤销。`)) {
      return
    }

    try {
      await VirtualMachineAPI.deleteVM(vmName)
      showToast(`虚拟机 ${vmName} 删除成功`, 'success')
      loadVMs()
    } catch (error: any) {
      showToast(`错误: ${error.message}`, 'danger')
    }
  }

  const openVNC = async (_vmName: any, vmItem: { config: { vncPort: number } }) => {
    // 设置VNC端口
    const vmData = {
      webPort: 6080,
      vncPort: vmItem.config.vncPort === 0 ? 5900 : vmItem.config.vncPort,
    }

    try {
      const result = await VirtualMachineAPI.startNoVNC(vmData)
      window.open(result.url, '_blank')
    } catch (error: any) {
      showToast(`打开 VNC 错误: ${error.message}`, 'danger')
    }
  }

  // 卸载 ISO 镜像
  const toggleMountISO = async (vmName: any, _vm: any, mountStatus: any) => {
    // 设置加载状态
    unmountingIso.value = true
    try {
      const data = await VirtualMachineAPI.toggleMountISO(vmName, mountStatus)
      if (data.success) {
        // 更新 VM 状态
        showToast(
          `已成功从虚拟机 ${vmName} ${
            !mountStatus ? '卸载' : '挂载'
          }ISO 镜像, 需重新停止，启动生效!`,
          'success'
        )

        // 刷新虚拟机列表
        loadVMs()
      } else {
        throw new Error(data.error || '卸载 ISO 失败')
      }
    } catch (error: any) {
      console.error('卸载 ISO 错误:', error)
      showToast(`卸载 ISO 失败: ${error.message}`, 'warning')
    } finally {
      // 无论成功或失败，都重置加载状态
      unmountingIso.value = false
    }
  }

  // WebSocket 连接，用于实时更新
  const setupWebSocket = () => {
    const wsURL = config.wsUrl
    ws = new WebSocket(`${wsURL}/api/vm-status`)

    ws.onmessage = event => {
      const message = JSON.parse(event.data)

      if (message.type === 'vmStatus') {
        vms.value = message.data
      }
    }

    ws.onclose = () => {
      // 尝试在连接关闭后重新连接
      setTimeout(setupWebSocket, 5000)
    }

    ws.onerror = error => {
      console.error('WebSocket 错误:', error)
    }
  }

  // 打开编辑模态框
  const editVM = (vm: any) => {
    console.log('编辑VM:', vm) // 调试日志
    editVMModal.value?.showEditVMModal(vm)
  }

  // 生命周期钩子
  onMounted(() => {
    loadVMs()
    setupWebSocket()
    // 初始化编辑模态框
  })

  onUnmounted(() => {
    if (ws) {
      ws.close()
    }
  })

  defineExpose({
    loadVMs,
  })
</script>

<style scoped>
  .vm-list {
    flex: 1;
  }
  .vm-list-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .vm-list-header {
    flex-shrink: 0;
    background: white;
    border-radius: 0.375rem;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .vm-filters {
    border-top: 1px solid #e9ecef;
    padding-top: 1rem;
  }

  .vm-list-loading,
  .vm-list-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 0.375rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .vm-list-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .vm-list-scroll {
    flex: 1;
    overflow-y: auto;
    background: white;
    border-radius: 0.375rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    /* max-height: calc(100vh - 200px); */
    max-height: 1400px;
  }

  /* 自定义滚动条 */
  .vm-list-scroll::-webkit-scrollbar {
    width: 6px;
  }

  .vm-list-scroll::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .vm-list-scroll::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .vm-list-scroll::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  .vm-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1rem;
  }

  @media (max-width: 768px) {
    .vm-grid {
      grid-template-columns: 1fr;
    }
  }

  .vm-card-wrapper {
    min-height: 300px;
  }

  .vm-card {
    border: 1px solid #e9ecef;
    transition: all 0.3s ease;
    position: relative;
    background: white;
  }

  .vm-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-color: #007bff;
  }

  .vm-card.vm-running {
    border-left: 4px solid #198754;
    background: linear-gradient(135deg, #ffffff 0%, #f8fff9 100%);
  }

  .vm-card.vm-running::before {
    content: '';
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    background: #198754;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(25, 135, 84, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(25, 135, 84, 0);
    }
  }

  .vm-card-header {
    border-bottom: 1px solid #f8f9fa;
    padding-bottom: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .vm-title-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .vm-status-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .status-badge {
    font-size: 0.75rem;
    font-weight: 500;
  }

  .iso-badge {
    font-size: 0.7rem;
  }

  .vm-info {
    background: #f8f9fa;
    border-radius: 0.25rem;
    padding: 0.5rem;
  }

  .vm-info .row {
    font-size: 0.8rem;
  }

  .vm-info .text-muted {
    font-size: 0.7rem;
  }

  .vm-info .fw-medium {
    font-weight: 500;
  }

  .vm-actions {
    margin-top: auto;
  }

  .vm-actions .btn {
    font-size: 0.8rem;
    padding: 0.375rem 0.5rem;
  }

  .vm-actions .btn-group {
    width: 100%;
  }

  .vm-actions .btn i {
    font-size: 0.9rem;
  }

  /* 刷新按钮动画 */
  .refresh-btn .bi-arrow-clockwise.spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* 加载状态 */
  .loading-spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  /* 空状态优化 */
  .no-results {
    background: #f8f9fa;
    border-radius: 0.375rem;
    margin: 1rem 0;
  }

  /* 响应式优化 */
  @media (max-width: 576px) {
    .vm-list-header {
      padding: 0.75rem;
    }

    .vm-list-scroll {
      padding: 0.75rem;
    }

    .vm-card-wrapper {
      min-height: auto;
    }

    .vm-actions .btn-group-sm .btn {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
    }
  }

  /* 搜索框优化 */
  .input-group-text {
    background: #f8f9fa;
    border-color: #ced4da;
  }

  .form-control:focus,
  .form-select:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  /* 按钮组优化 */
  .btn-group-vertical .btn-group {
    border-radius: 0.25rem;
  }

  .btn-group-vertical .btn-group:not(:last-child) {
    margin-bottom: 0.25rem;
  }

  /* 特殊按钮颜色 */
  .btn-purple {
    background-color: #6f42c1;
    border-color: #6f42c1;
    color: white;
  }

  .btn-purple:hover {
    background-color: #5a359a;
    border-color: #5a359a;
  }

  /* 工具提示样式 */
  .vm-card [data-bs-toggle='tooltip'] {
    cursor: help;
  }

  /* 过渡动画 */
  .vm-grid > * {
    animation: fadeInUp 0.3s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 状态指示器 */
  .vm-card.vm-running .card-title::before {
    content: '●';
    color: #198754;
    margin-right: 0.5rem;
    font-size: 0.8rem;
  }

  /* 高度限制和滚动优化 */
  /* .vm-list-container {
    max-height: calc(100vh);
  } */

  /* 网格布局优化 */
  @media (min-width: 1200px) {
    .vm-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
  }

  @media (min-width: 1400px) {
    .vm-grid {
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    }
  }
</style>
