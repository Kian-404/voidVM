<template>
  <div class="container-fluid">
    <!-- 页面标题 -->
    <div class="row">
      <div class="col-12">
        <h1 class="mb-4">虚拟机快照管理</h1>
        <p class="text-muted mt-2">管理虚拟机快照，包括创建、加载、删除等操作</p>
      </div>
    </div>

    <!-- 虚拟机选择和操作区域 -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">选择虚拟机</h5>
            <div class="mb-3">
              <select
                v-model="selectedVM"
                @change="loadSnapshots"
                class="form-select"
                :disabled="loading"
              >
                <option value="">请选择虚拟机</option>
                <option v-for="vm in vmList" :key="vm.name" :value="vm.name">
                  {{ vm.name }} ({{ vm.status }})
                </option>
              </select>
            </div>

            <!-- 快照统计信息 -->
            <div v-if="selectedVM && snapshotStats" class="row text-center">
              <div class="col-4">
                <div class="border rounded p-2">
                  <div class="fw-bold text-primary">{{ snapshotStats.total }}</div>
                  <small class="text-muted">总快照数</small>
                </div>
              </div>
              <div class="col-4">
                <div class="border rounded p-2">
                  <div class="fw-bold text-success">{{ snapshotStats.active }}</div>
                  <small class="text-muted">活跃快照</small>
                </div>
              </div>
              <div class="col-4">
                <div class="border rounded p-2">
                  <div class="fw-bold text-info">{{ formatFileSize(snapshotStats.totalSize) }}</div>
                  <small class="text-muted">总大小</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">创建新快照</h5>
            <form @submit.prevent="createSnapshot">
              <div class="mb-3">
                <input
                  v-model="newSnapshot.name"
                  type="text"
                  class="form-control"
                  placeholder="快照名称"
                  :disabled="!selectedVM || isCreating"
                  required
                  pattern="^[a-zA-Z0-9_-]+$"
                  title="只能包含字母、数字、下划线和连字符"
                />
              </div>
              <div class="mb-3">
                <textarea
                  v-model="newSnapshot.description"
                  class="form-control"
                  rows="2"
                  placeholder="快照描述（可选）"
                  :disabled="!selectedVM || isCreating"
                ></textarea>
              </div>
              <button
                type="submit"
                class="btn btn-primary w-100"
                :disabled="!selectedVM || !newSnapshot.name || isCreating"
              >
                <span v-if="isCreating" class="spinner-border spinner-border-sm me-2"></span>
                {{ isCreating ? '创建中...' : '创建快照' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- 快照列表 -->
    <div class="row" v-if="selectedVM">
      <div class="col-12">
        <div class="card">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">快照列表 - {{ selectedVM }}</h5>
            <div class="d-flex gap-2">
              <!-- 排序选择 -->
              <select
                v-model="sortBy"
                @change="loadSnapshots"
                class="form-select form-select-sm"
                style="width: auto"
              >
                <option value="createTime">按创建时间</option>
                <option value="name">按名称</option>
                <option value="size">按大小</option>
              </select>
              <select
                v-model="sortOrder"
                @change="loadSnapshots"
                class="form-select form-select-sm"
                style="width: auto"
              >
                <option value="desc">降序</option>
                <option value="asc">升序</option>
              </select>
              <button @click="loadSnapshots" class="btn btn-outline-secondary btn-sm">
                <i class="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>

          <div class="card-body">
            <!-- 加载状态 -->
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">加载中...</span>
              </div>
              <p class="mt-2 text-muted">正在加载快照列表...</p>
            </div>

            <!-- 无快照提示 -->
            <div v-else-if="snapshots.length === 0" class="text-center py-4">
              <i class="bi bi-camera text-muted" style="font-size: 3rem"></i>
              <p class="text-muted mt-2">暂无快照，创建第一个快照吧！</p>
            </div>

            <!-- 快照网格 -->
            <div v-else class="row g-3">
              <div v-for="snapshot in snapshots" :key="snapshot.id" class="col-lg-4 col-md-6">
                <SnapshotCard
                  :snapshot="snapshot"
                  @load="handleLoadSnapshot"
                  @delete="handleDeleteSnapshot"
                  @rename="handleRenameSnapshot"
                  @view-detail="handleViewDetail"
                  :loading="operationLoading[snapshot.id]"
                />
              </div>
            </div>

            <!-- 分页 -->
            <nav v-if="pagination && pagination.totalPages > 1" class="mt-4">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: pagination.page <= 1 }">
                  <button class="page-link" @click="changePage(pagination.page - 1)">上一页</button>
                </li>
                <li
                  v-for="page in getPageNumbers()"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === pagination.page }"
                >
                  <button class="page-link" @click="changePage(page)">{{ page }}</button>
                </li>
                <li
                  class="page-item"
                  :class="{ disabled: pagination.page >= pagination.totalPages }"
                >
                  <button class="page-link" @click="changePage(pagination.page + 1)">下一页</button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- 快照详情模态框 -->
    <SnapshotDetailModal
      v-if="selectedSnapshot"
      :snapshot="selectedSnapshot"
      @close="selectedSnapshot = null"
    />

    <!-- 重命名模态框 -->
    <RenameSnapshotModal
      v-if="renamingSnapshot"
      :snapshot="renamingSnapshot"
      @save="handleSaveRename"
      @close="renamingSnapshot = null"
    />

    <!-- 全局消息提示 -->
    <div v-if="message.text" class="toast-container position-fixed top-0 end-0 p-3">
      <div class="toast show" :class="`text-bg-${message.type}`" role="alert">
        <div class="toast-header">
          <i class="bi" :class="getMessageIcon(message.type)"></i>
          <strong class="me-auto ms-2">{{ getMessageTitle(message.type) }}</strong>
          <button type="button" class="btn-close" @click="clearMessage"></button>
        </div>
        <div class="toast-body">
          {{ message.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue'
  import { snapshotAPI } from '@/api/snapshot'
  import SnapshotCard from '@/components/SnapshotCard.vue'
  import SnapshotDetailModal from '@/components/SnapshotDetailModal.vue'
  import RenameSnapshotModal from '@/components/RenameSnapshotModal.vue'
  import { VirtualMachineAPI } from '../api/virtualMachine'

  // 响应式数据
  const selectedVM = ref('')
  const vmList: any = ref([])

  const snapshots: any = ref([])
  const pagination: any = ref(null)
  const loading = ref(false)
  const isCreating = ref(false)
  const operationLoading: any = reactive({})

  const newSnapshot = reactive({
    name: '',
    description: '',
  })

  const selectedSnapshot = ref(null)
  const renamingSnapshot = ref(null)

  const sortBy = ref('createTime')
  const sortOrder = ref('desc')
  const currentPage = ref(1)

  const message = reactive({
    text: '',
    type: 'info',
  })

  // 计算属性
  const snapshotStats = computed(() => {
    if (!snapshots.value.length) return null

    return {
      total: snapshots.value.length,
      active: snapshots.value.filter((s: { status: string }) => s.status === 'active').length,
      totalSize: snapshots.value.reduce((sum: any, s: { size: any }) => sum + (s.size || 0), 0),
    }
  })

  // 方法
  const loadSnapshots = async () => {
    if (!selectedVM.value) return

    loading.value = true
    try {
      const response = await snapshotAPI.getSnapshots(selectedVM.value, {
        page: currentPage.value,
        limit: 12,
        sortBy: sortBy.value,
        order: sortOrder.value,
      })
      snapshots.value = response.data.data.snapshots
      pagination.value = response.data.data.pagination
    } catch (error) {
      showMessage('获取快照列表失败', 'danger')
      console.error('获取快照列表失败:', error)
    } finally {
      loading.value = false
    }
  }

  const createSnapshot = async () => {
    if (!selectedVM.value || !newSnapshot.name) return

    isCreating.value = true
    try {
      await snapshotAPI.createSnapshot({
        vmName: selectedVM.value,
        snapshotName: newSnapshot.name,
        description: newSnapshot.description,
      })

      showMessage('快照创建成功', 'success')
      newSnapshot.name = ''
      newSnapshot.description = ''
      await loadSnapshots()
    } catch (error: any) {
      showMessage(error.response?.data?.error || '创建快照失败', 'danger')
    } finally {
      isCreating.value = false
    }
  }

  const handleLoadSnapshot = async (snapshot: { id: string | number; name: any }) => {
    operationLoading[snapshot.id] = 'loading'
    try {
      await snapshotAPI.loadSnapshot({
        vmName: selectedVM.value,
        snapshotName: snapshot.name,
      })
      showMessage(`快照 "${snapshot.name}" 加载成功`, 'success')
    } catch (error: any) {
      showMessage(error.response?.data?.error || '加载快照失败', 'danger')
    } finally {
      delete operationLoading[snapshot.id]
    }
  }

  const handleDeleteSnapshot = async (snapshot: { name: any; id: string | number }) => {
    if (!confirm(`确定要删除快照 "${snapshot.name}" 吗？此操作不可逆。`)) {
      return
    }

    operationLoading[snapshot.id] = 'deleting'
    try {
      await snapshotAPI.deleteSnapshot(selectedVM.value, snapshot.name)
      showMessage(`快照 "${snapshot.name}" 删除成功`, 'success')
      await loadSnapshots()
    } catch (error: any) {
      showMessage(error.response?.data?.error || '删除快照失败', 'danger')
    } finally {
      delete operationLoading[snapshot.id]
    }
  }

  const handleRenameSnapshot = (snapshot: any) => {
    renamingSnapshot.value = { ...snapshot }
  }

  const handleSaveRename = async (data: { oldName: any; newName: any; description: any }) => {
    try {
      await snapshotAPI.renameSnapshot(selectedVM.value, data.oldName, {
        newName: data.newName,
        description: data.description,
      })

      showMessage('快照重命名成功', 'success')
      renamingSnapshot.value = null
      await loadSnapshots()
    } catch (error: any) {
      showMessage(error.response?.data?.error || '重命名失败', 'danger')
    }
  }

  const handleViewDetail = async (snapshot: { name: any }) => {
    try {
      const response = await snapshotAPI.getSnapshotDetail(selectedVM.value, snapshot.name)
      selectedSnapshot.value = response.data.data
    } catch (error) {
      showMessage('获取快照详情失败', 'danger')
    }
  }

  const changePage = (page: number) => {
    if (page >= 1 && page <= pagination.value.totalPages) {
      currentPage.value = page
      loadSnapshots()
    }
  }

  const getPageNumbers = () => {
    const total = pagination.value.totalPages
    const current = pagination.value.page
    const delta = 2

    const range: any = []
    const rangeStart = Math.max(2, current - delta)
    const rangeEnd = Math.min(total - 1, current + delta)

    if (current - delta > 2) {
      range.push(1, '...')
    } else {
      range.push(1)
    }
    for (let i = rangeStart; i <= rangeEnd; i++) {
      range.push(i)
    }

    if (current + delta < total - 1) {
      range.push('...', total)
    } else if (total > 1) {
      range.push(total)
    }

    return range.filter((page: number) =>
      page !== 1 && page !== total ? true : !range.includes(page)
    )
  }

  const showMessage = (text: string, type = 'info') => {
    message.text = text
    message.type = type
    setTimeout(() => {
      clearMessage()
    }, 5000)
  }

  const clearMessage = () => {
    message.text = ''
    message.type = 'info'
  }

  const getMessageIcon = (type: string | number) => {
    const icons: any = {
      success: 'bi-check-circle-fill',
      danger: 'bi-exclamation-triangle-fill',
      warning: 'bi-exclamation-circle-fill',
      info: 'bi-info-circle-fill',
    }
    return icons[type] || icons.info
  }

  const getMessageTitle = (type: string | number) => {
    const titles: any = {
      success: '成功',
      danger: '错误',
      warning: '警告',
      info: '信息',
    }
    return titles[type] || titles.info
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const loadVMs = async () => {
    loading.value = true
    try {
      vmList.value = await VirtualMachineAPI.getVMList()
    } catch (error: any) {
      console.error('加载虚拟机错误:', error)
    } finally {
      loading.value = false
    }
  }
  // 生命周期
  onMounted(() => {
    // 可以在这里加载虚拟机列表
    loadVMs()
  })
</script>

<style scoped>
  /* 整体容器 - 与其他页面保持一致 */
  .container-fluid {
    /* background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); */
    min-height: 100vh;
    padding: 2rem 1rem;
  }

  /* 页面标题统一样式 */
  h1 {
    /* background: linear-gradient(135deg, #2c3e50, #3498db); */
    /* -webkit-background-clip: text; */
    /* -webkit-text-fill-color: transparent; */
    background-clip: text;
    font-weight: 800;
    font-size: 2.5rem;
    margin-bottom: 1rem !important;
    position: relative;
  }

  h1::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
  }

  /* 描述文字 */
  .text-muted {
    color: rgba(108, 117, 125, 0.8) !important;
    font-size: 1.1rem;
    line-height: 1.6;
  }

  /* 卡片统一样式 */
  .card {
    border: none !important;
    border-radius: 16px !important;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
  }

  /* 卡片头部 */
  .card-header {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef) !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
    border-radius: 16px 16px 0 0 !important;
    padding: 1.5rem 2rem !important;
  }

  .card-title {
    color: #2c3e50;
    font-weight: 700;
    margin-bottom: 0;
  }

  /* 卡片内容 */
  .card-body {
    padding: 2rem !important;
  }

  /* 按钮统一样式 */
  .btn {
    border-radius: 25px;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  .btn-outline-secondary {
    border: 2px solid #6c757d;
    color: #6c757d;
  }

  .btn-outline-secondary:hover {
    background: #6c757d;
    color: white;
    transform: translateY(-2px);
  }

  .btn-sm {
    padding: 0.5rem 1rem;
    border-radius: 20px;
  }

  .btn:disabled {
    opacity: 0.6;
    transform: none !important;
  }

  /* 表单控件 */
  .form-control,
  .form-select {
    border-radius: 12px;
    border: 2px solid rgba(102, 126, 234, 0.2);
    padding: 0.75rem 1rem;
    transition: all 0.3s ease;
  }

  .form-control:focus,
  .form-select:focus {
    border-color: #667eea;
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.2);
  }

  /* 统计卡片 */
  .border.rounded {
    border: 2px solid rgba(102, 126, 234, 0.2) !important;
    border-radius: 12px !important;
    background: rgba(102, 126, 234, 0.05);
    transition: all 0.3s ease;
  }

  .border.rounded:hover {
    border-color: #667eea !important;
    background: rgba(102, 126, 234, 0.1);
  }

  .fw-bold {
    font-weight: 700 !important;
    font-size: 1.25rem;
  }

  /* 分页 */
  .pagination .page-link {
    border-radius: 12px;
    margin: 0 0.2rem;
    border: 2px solid rgba(102, 126, 234, 0.2);
    color: #667eea;
    transition: all 0.3s ease;
  }

  .pagination .page-link:hover {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    transform: translateY(-2px);
  }

  .pagination .page-item.active .page-link {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-color: #667eea;
    color: white;
  }

  /* 通知系统 */
  .toast-container {
    z-index: 1100 !important;
  }

  .toast {
    border: none !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
    backdrop-filter: blur(10px);
  }

  .toast.text-bg-success {
    background: linear-gradient(135deg, rgba(40, 167, 69, 0.9), rgba(32, 201, 151, 0.8)) !important;
  }

  .toast.text-bg-danger {
    background: linear-gradient(135deg, rgba(220, 53, 69, 0.9), rgba(255, 0, 0, 0.8)) !important;
  }

  .toast-header {
    background: rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  /* 加载状态 */
  .spinner-border {
    border-width: 3px;
  }

  .spinner-border-sm {
    width: 1rem;
    height: 1rem;
    border-width: 2px;
  }

  /* 空状态 */
  .text-center.py-4 .bi {
    color: #6c757d;
    opacity: 0.7;
  }

  /* 响应式优化 */
  @media (max-width: 768px) {
    .container-fluid {
      padding: 1rem 0.5rem;
    }

    h1 {
      font-size: 2rem;
      text-align: center;
    }

    .card-body {
      padding: 1.5rem !important;
    }

    .btn {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .form-control,
    .form-select {
      padding: 0.5rem 0.75rem;
    }
  }

  /* 深色主题适配 */
  @media (prefers-color-scheme: dark) {
    .container-fluid {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    }

    .card {
      background: rgba(33, 37, 41, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .card-header {
      background: linear-gradient(135deg, #2d2d2d, #3d3d3d) !important;
    }

    .card-title {
      color: #f8f9fa;
    }

    .form-control,
    .form-select {
      background: rgba(33, 37, 41, 0.8);
      border-color: rgba(255, 255, 255, 0.2);
      color: #f8f9fa;
    }

    .border.rounded {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.2) !important;
    }
  }

  /* 简单动画 */
  .container-fluid {
    animation: fadeIn 0.5s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* 悬停效果 */
  .btn:hover {
    transform: translateY(-2px);
  }

  .btn:active {
    transform: translateY(0);
  }
</style>
