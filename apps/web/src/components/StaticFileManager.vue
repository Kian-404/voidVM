<template>
  <div class="container-fluid">
    <!-- 页面标题 -->
    <div class="row">
      <h1 class="mb-4">静态资源管理</h1>
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb mb-0">
                <li class="breadcrumb-item">
                  <a href="#" @click.prevent="navigateToPath('')" class="text-decoration-none">
                    <i class="bi bi-house-fill"></i> 根目录
                  </a>
                </li>
                <li
                  v-for="(segment, index) in pathSegments"
                  :key="index"
                  class="breadcrumb-item"
                  :class="{ active: index === pathSegments.length - 1 }"
                >
                  <a
                    v-if="index < pathSegments.length - 1"
                    href="#"
                    @click.prevent="navigateToSegment(index)"
                    class="text-decoration-none"
                  >
                    {{ segment }}
                  </a>
                  <span v-else>{{ segment }}</span>
                </li>
              </ol>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- 工具栏 -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <div class="d-flex flex-wrap gap-2 align-items-center">
              <!-- 上传文件 -->
              <div class="btn-group">
                <input
                  ref="fileInput"
                  type="file"
                  multiple
                  class="d-none"
                  @change="handleFileUpload"
                />
                <button
                  class="btn btn-primary"
                  @click="$refs.fileInput.click()"
                  :disabled="loading"
                >
                  <i class="bi bi-cloud-upload me-1"></i>
                  上传文件
                </button>
              </div>

              <!-- 创建文件夹 -->
              <button class="btn btn-success" @click="showCreateFolderModal" :disabled="loading">
                <i class="bi bi-folder-plus me-1"></i>
                新建文件夹
              </button>

              <!-- 刷新 -->
              <button class="btn btn-outline-secondary" @click="loadFileList" :disabled="loading">
                <i class="bi bi-arrow-clockwise me-1"></i>
                刷新
              </button>

              <!-- 返回上级 -->
              <button
                v-if="currentPath"
                class="btn btn-outline-secondary"
                @click="navigateToParent"
                :disabled="loading"
              >
                <i class="bi bi-arrow-up me-1"></i>
                返回上级
              </button>

              <!-- 搜索框 -->
              <div class="ms-auto">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input
                    v-model="searchQuery"
                    type="text"
                    class="form-control"
                    placeholder="搜索文件..."
                    style="width: 200px"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件列表 -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-body">
            <!-- 加载状态 -->
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">加载中...</span>
              </div>
              <p class="mt-2 text-muted">正在加载文件列表...</p>
            </div>

            <!-- 文件表格 -->
            <div v-else-if="filteredFiles.length > 0" class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th style="width: 40px">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        v-model="selectAll"
                        @change="toggleSelectAll"
                      />
                    </th>
                    <th>
                      <a
                        href="#"
                        @click.prevent="sortBy('name')"
                        class="text-decoration-none text-dark"
                      >
                        名称
                        <i class="bi" :class="getSortIcon('name')"></i>
                      </a>
                    </th>
                    <th style="width: 100px">类型</th>
                    <th style="width: 120px">
                      <a
                        href="#"
                        @click.prevent="sortBy('size')"
                        class="text-decoration-none text-dark"
                      >
                        大小
                        <i class="bi" :class="getSortIcon('size')"></i>
                      </a>
                    </th>
                    <th style="width: 180px">
                      <a
                        href="#"
                        @click.prevent="sortBy('modifiedTime')"
                        class="text-decoration-none text-dark"
                      >
                        修改时间
                        <i class="bi" :class="getSortIcon('modifiedTime')"></i>
                      </a>
                    </th>
                    <th style="width: 200px">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="file in filteredFiles" :key="file.path">
                    <td>
                      <input
                        type="checkbox"
                        class="form-check-input"
                        v-model="selectedFiles"
                        :value="file.path"
                      />
                    </td>
                    <td>
                      <div class="d-flex align-items-center">
                        <i
                          class="bi me-2"
                          :class="
                            file.isDirectory
                              ? 'bi-folder-fill text-warning'
                              : getFileIcon(file.mimeType)
                          "
                        ></i>
                        <a
                          v-if="file.isDirectory"
                          href="#"
                          @click.prevent="navigateToPath(file.path)"
                          class="text-decoration-none fw-semibold"
                        >
                          {{ file.name }}
                        </a>
                        <span v-else class="fw-semibold">{{ file.name }}</span>
                      </div>
                    </td>
                    <td>
                      <span v-if="file.isDirectory" class="badge bg-warning">文件夹</span>
                      <span v-else class="badge bg-info">{{
                        getFileTypeDisplay(file.mimeType)
                      }}</span>
                    </td>
                    <td>
                      <span v-if="!file.isDirectory">{{ formatFileSize(file.size) }}</span>
                      <span v-else class="text-muted">-</span>
                    </td>
                    <td>
                      <small class="text-muted">{{ formatDate(file.modifiedTime) }}</small>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <!-- 复制下载链接 -->
                        <button
                          class="btn btn-outline-secondary"
                          @click="copyDownloadLink(file)"
                          title="复制下载链接"
                        >
                          <i class="bi bi-link-45deg"></i>
                        </button>
                        <!-- 下载 -->
                        <button
                          class="btn btn-outline-primary"
                          @click="downloadFile(file)"
                          title="下载"
                        >
                          <i class="bi bi-download"></i>
                        </button>

                        <!-- 编辑（仅文本文件） -->
                        <button
                          v-if="!file.isDirectory && isTextFile(file.mimeType)"
                          class="btn btn-outline-info"
                          @click="editFile(file)"
                          title="编辑"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>

                        <!-- 重命名 -->
                        <button
                          class="btn btn-outline-warning"
                          @click="showRenameModal(file)"
                          title="重命名"
                        >
                          <i class="bi bi-pencil-square"></i>
                        </button>

                        <!-- 删除 -->
                        <button
                          class="btn btn-outline-danger"
                          @click="showDeleteModal(file)"
                          title="删除"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- 批量操作 -->
              <div v-if="selectedFiles.length > 0" class="border-top pt-3">
                <div class="d-flex align-items-center gap-2">
                  <span class="text-muted">已选择 {{ selectedFiles.length }} 个项目</span>
                  <button class="btn btn-sm btn-outline-danger" @click="batchDelete">
                    <i class="bi bi-trash me-1"></i>
                    批量删除
                  </button>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="text-center py-5">
              <i class="bi bi-folder2-open display-1 text-muted"></i>
              <h5 class="mt-3 text-muted">此文件夹为空</h5>
              <p class="text-muted">拖拽文件到此处或点击上传按钮来添加文件</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建文件夹模态框 -->
    <div class="modal fade" id="createFolderModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">创建新文件夹</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="folderName" class="form-label">文件夹名称</label>
              <input
                id="folderName"
                v-model="newFolderName"
                type="text"
                class="form-control"
                placeholder="输入文件夹名称"
                @keyup.enter="createFolder"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="createFolder"
              :disabled="!newFolderName.trim()"
            >
              创建
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 重命名模态框 -->
    <div class="modal fade" id="renameModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">重命名</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="newName" class="form-label">新名称</label>
              <input
                id="newName"
                v-model="renameForm.newName"
                type="text"
                class="form-control"
                @keyup.enter="renameFile"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button
              type="button"
              class="btn btn-primary"
              @click="renameFile"
              :disabled="!renameForm.newName.trim()"
            >
              重命名
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 文件编辑模态框 -->
    <div class="modal fade" id="editModal" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">编辑文件: {{ editForm.fileName }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <textarea
              v-model="editForm.content"
              class="form-control"
              rows="20"
              style="font-family: 'Courier New', monospace"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" @click="saveFile">保存</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div class="modal fade" id="deleteModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">确认删除</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>确定要删除以下项目吗？此操作无法撤销。</p>
            <ul class="list-unstyled">
              <li v-for="item in deleteForm.items" :key="item" class="text-break">
                <i class="bi bi-file-earmark me-1"></i>
                {{ item }}
              </li>
            </ul>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-danger" @click="confirmDelete">
              <i class="bi bi-trash me-1"></i>
              确认删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast 通知 -->
    <div class="toast-container position-fixed top-0 end-0 p-3">
      <div v-for="toast in toasts" :key="toast.id" class="toast show" role="alert">
        <div class="toast-header">
          <i
            class="bi me-2"
            :class="{
              'bi-check-circle-fill text-success': toast.type === 'success',
              'bi-exclamation-triangle-fill text-warning': toast.type === 'warning',
              'bi-x-circle-fill text-danger': toast.type === 'error',
              'bi-info-circle-fill text-info': toast.type === 'info',
            }"
          ></i>
          <strong class="me-auto">{{ toast.title }}</strong>
          <button type="button" class="btn-close" @click="removeToast(toast.id)"></button>
        </div>
        <div class="toast-body">
          {{ toast.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, computed, onMounted, nextTick } from 'vue'
  import { Modal } from 'bootstrap'
  import { config } from '../utils/config'
  import { StaticFilesAPI } from '../api/staticFiles'
  // 响应式数据
  const loading = ref(false)
  const files = ref([])
  const currentPath = ref('')
  const searchQuery = ref('')
  const selectedFiles = ref([])
  const selectAll = ref(false)
  const sortField = ref('name')
  const sortDirection = ref('asc')
  const toasts = ref([])
  // 表单数据
  const newFolderName = ref('')
  const renameForm = reactive({
    file: null,
    newName: '',
  })
  const editForm = reactive({
    file: null,
    fileName: '',
    content: '',
  })
  const deleteForm = reactive({
    items: [],
    paths: [],
  })

  // 模态框引用
  let createFolderModal = null
  let renameModal = null
  let editModal = null
  let deleteModal = null

  // 计算属性
  const pathSegments = computed(() => {
    if (!currentPath.value) return []
    return currentPath.value.split('/').filter(segment => segment)
  })

  const filteredFiles = computed(() => {
    let result = [...files.value]

    // 搜索过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(file => file.name.toLowerCase().includes(query))
    }

    // 排序
    result.sort((a, b) => {
      let aValue, bValue

      // 目录优先
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1

      switch (sortField.value) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'size':
          aValue = a.size || 0
          bValue = b.size || 0
          break
        case 'modifiedTime':
          aValue = new Date(a.modifiedTime)
          bValue = new Date(b.modifiedTime)
          break
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
      }

      if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
      return 0
    })

    return result
  })

  // 初始化
  onMounted(() => {
    initModals()
    loadFileList()
  })

  // 初始化模态框
  const initModals = () => {
    nextTick(() => {
      const createFolderEl = document.getElementById('createFolderModal')
      const renameEl = document.getElementById('renameModal')
      const editEl = document.getElementById('editModal')
      const deleteEl = document.getElementById('deleteModal')

      if (createFolderEl) createFolderModal = new Modal(createFolderEl)
      if (renameEl) renameModal = new Modal(renameEl)
      if (editEl) editModal = new Modal(editEl)
      if (deleteEl) deleteModal = new Modal(deleteEl)
    })
  }

  // API 调用
  const loadFileList = async () => {
    loading.value = true
    try {
      const data = await StaticFilesAPI.getFileList(currentPath.value)

      if (data.success) {
        files.value = data.files
        selectedFiles.value = []
        selectAll.value = false
      } else {
        showToast('error', '错误', data.error)
      }
    } catch (error) {
      showToast('error', '错误', '加载文件列表失败')
    } finally {
      loading.value = false
    }
  }

  const handleFileUpload = async event => {
    const files_ = Array.from(event.target.files)
    if (files_.length === 0) return

    const formData = new FormData()
    files_.forEach(file => {
      formData.append('files', file)
    })
    formData.append('path', currentPath.value)

    loading.value = true
    try {
      const data = await StaticFilesAPI.uploadFiles(files_, currentPath.value)

      if (data.success) {
        showToast('success', '成功', data.message)
        loadFileList()
      } else {
        showToast('error', '错误', data.error)
      }
    } catch (error) {
      showToast('error', '错误', '文件上传失败')
    } finally {
      loading.value = false
      event.target.value = ''
    }
  }

  const createFolder = async () => {
    if (!newFolderName.value.trim()) return

    try {
      const data = await StaticFilesAPI.createFolder(currentPath.value, newFolderName.value)

      if (data.success) {
        showToast('success', '成功', data.message)
        loadFileList()
        createFolderModal?.hide()
        newFolderName.value = ''
      } else {
        showToast('error', '错误', data.error)
      }
    } catch (error) {
      showToast('error', '错误', '创建文件夹失败')
    }
  }
  // 复制下载链接到剪贴板
  const copyDownloadLink = async file => {
    const downloadUrl = await StaticFilesAPI.getDownloadUrl(file.path)
    try {
      // 构建下载链接 - 根据你的实际 API 结构调整
      // 或者如果有直接的下载链接属性：
      // const downloadUrl = file.downloadUrl;

      await navigator.clipboard.writeText(downloadUrl)

      // 显示成功提示
      showToast('success', '成功', '下载链接已复制到剪贴板')
      // 或者使用其他提示方式
      // this.$message.success('下载链接已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error)
      console.log('downloadUrl', downloadUrl)
      // 降级方案：使用传统的复制方法
      fallbackCopyToClipboard(downloadUrl)
    }
  }
  // 降级复制方法（兼容老版本浏览器）
  const fallbackCopyToClipboard = text => {
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      const successful = document.execCommand('copy')
      document.body.removeChild(textArea)

      if (successful) {
        showToast('success', '成功', '下载链接已复制到剪贴板')
      } else {
        showToast('error', '错误', '复制失败，请手动复制')
      }
    } catch (error) {
      console.error('降级复制也失败:', error)
      showToast('error', '错误', '复制失败，请手动复制')
    }
  }
  const downloadFile = file => {
    const url = StaticFilesAPI.getDownloadUrl(file.path)
    console.log('url', url)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const editFile = async file => {
    try {
      const data = await StaticFilesAPI.getFileContent(file.path)

      if (data.success) {
        editForm.file = file
        editForm.fileName = file.name
        editForm.content = data.content
        editModal?.show()
      } else {
        showToast('error', '错误', data.error)
      }
    } catch (error) {
      showToast('error', '错误', '读取文件内容失败')
    }
  }

  const saveFile = async () => {
    try {
      const data = await StaticFilesAPI.saveFileContent(editForm.file.path, editForm.content)

      if (data.success) {
        showToast('success', '成功', data.message)
        editModal?.hide()
        loadFileList()
      } else {
        showToast('error', '错误', data.error)
      }
    } catch (error) {
      showToast('error', '错误', '保存文件失败')
    }
  }

  const renameFile = async () => {
    if (!renameForm.newName.trim()) return

    try {
      const data = await StaticFilesAPI.renameFile(renameForm.path, renameForm.newName)

      if (data.success) {
        showToast('success', '成功', data.message)
        renameModal?.hide()
        loadFileList()
      } else {
        showToast('error', '错误', data.error)
      }
    } catch (error) {
      showToast('error', '错误', '重命名失败')
    }
  }

  const confirmDelete = async () => {
    try {
      const results = await StaticFilesAPI.batchDeleteItems(deleteForm.paths)

      const failures = results.filter(r => !r.success)
      if (failures.length === 0) {
        showToast('success', '成功', `成功删除 ${deleteForm.items.length} 个项目`)
      } else {
        showToast(
          'warning',
          '部分失败',
          `${results.length - failures.length} 个项目删除成功，${failures.length} 个失败`
        )
      }

      deleteModal?.hide()
      loadFileList()
      selectedFiles.value = []
    } catch (error) {
      showToast('error', '错误', '删除操作失败')
    }
  }

  // 导航方法
  const navigateToPath = path => {
    currentPath.value = path
    loadFileList()
  }

  const navigateToParent = () => {
    const parentPath = currentPath.value.split('/').slice(0, -1).join('/')
    navigateToPath(parentPath)
  }

  const navigateToSegment = index => {
    const path = pathSegments.value.slice(0, index + 1).join('/')
    navigateToPath(path)
  }

  // 排序方法
  const sortBy = field => {
    if (sortField.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortDirection.value = 'asc'
    }
  }

  const getSortIcon = field => {
    if (sortField.value !== field) return 'bi-chevron-expand'
    return sortDirection.value === 'asc' ? 'bi-chevron-up' : 'bi-chevron-down'
  }

  // 选择方法
  const toggleSelectAll = () => {
    if (selectAll.value) {
      selectedFiles.value = filteredFiles.value.map(f => f.path)
    } else {
      selectedFiles.value = []
    }
  }

  // 模态框显示方法
  const showCreateFolderModal = () => {
    newFolderName.value = ''
    createFolderModal?.show()
  }

  const showRenameModal = file => {
    renameForm.file = file
    renameForm.newName = file.name
    renameModal?.show()
  }

  const showDeleteModal = file => {
    deleteForm.items = [file.name]
    deleteForm.paths = [file.path]
    deleteModal?.show()
  }

  const batchDelete = () => {
    const selectedItems = files.value.filter(f => selectedFiles.value.includes(f.path))
    deleteForm.items = selectedItems.map(f => f.name)
    deleteForm.paths = selectedItems.map(f => f.path)
    deleteModal?.show()
  }

  // 工具方法
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = dateString => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const getFileIcon = mimeType => {
    if (!mimeType) return 'bi-file-earmark text-secondary'

    if (mimeType.startsWith('image/')) return 'bi-file-earmark-image text-success'
    if (mimeType.startsWith('video/')) return 'bi-file-earmark-play text-danger'
    if (mimeType.startsWith('audio/')) return 'bi-file-earmark-music text-info'
    if (mimeType.startsWith('text/')) return 'bi-file-earmark-text text-primary'
    if (mimeType.includes('pdf')) return 'bi-file-earmark-pdf text-danger'
    if (mimeType.includes('zip') || mimeType.includes('rar'))
      return 'bi-file-earmark-zip text-warning'

    return 'bi-file-earmark text-secondary'
  }

  const getFileTypeDisplay = mimeType => {
    if (!mimeType) return '未知'

    const typeMap = {
      'image/': '图片',
      'video/': '视频',
      'audio/': '音频',
      'text/': '文本',
      'application/pdf': 'PDF',
      'application/zip': 'ZIP',
      'application/json': 'JSON',
      'application/javascript': 'JS',
    }

    for (const [key, value] of Object.entries(typeMap)) {
      if (mimeType.includes(key)) return value
    }

    return mimeType.split('/')[0].toUpperCase()
  }

  const isTextFile = mimeType => {
    if (!mimeType) return false
    const textTypes = [
      'text/',
      'application/json',
      'application/javascript',
      'application/xml',
      'application/x-yaml',
    ]
    return textTypes.some(type => mimeType.includes(type))
  }

  const showToast = (type, title, message) => {
    const toast = {
      id: Date.now(),
      type,
      title,
      message,
    }

    toasts.value.push(toast)

    // 3秒后自动移除
    setTimeout(() => {
      removeToast(toast.id)
    }, 3000)
  }

  const removeToast = id => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  // 拖拽上传支持
  const handleDragOver = event => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = event => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)

    if (files.length > 0) {
      const fileInput = document.createElement('input')
      fileInput.type = 'file'
      fileInput.multiple = true

      // 模拟文件选择事件
      Object.defineProperty(fileInput, 'files', {
        value: event.dataTransfer.files,
        writable: false,
      })

      handleFileUpload({ target: fileInput })
    }
  }

  // 在组件挂载时添加拖拽事件监听
  onMounted(() => {
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)
  })

  // 在组件卸载时移除事件监听
  import { onUnmounted } from 'vue'
  onUnmounted(() => {
    document.removeEventListener('dragover', handleDragOver)
    document.removeEventListener('drop', handleDrop)
  })
</script>

<style scoped>
  .table th a {
    color: inherit;
  }

  .table th a:hover {
    color: #0d6efd;
  }

  .breadcrumb-item + .breadcrumb-item::before {
    content: '›';
    color: #6c757d;
  }

  .toast-container {
    z-index: 1055;
  }

  .btn-group-sm > .btn {
    padding: 0.25rem 0.5rem;
  }

  .table-responsive {
    border-radius: 0.375rem;
  }

  .card {
    border: none;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }

  .modal-xl {
    max-width: 90%;
  }

  /* 拖拽区域样式 */
  .card-body {
    position: relative;
  }

  .card-body.drag-over {
    background-color: #f8f9fa;
    border: 2px dashed #0d6efd;
  }

  .drag-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(13, 110, 253, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: #0d6efd;
    z-index: 10;
  }
</style>
