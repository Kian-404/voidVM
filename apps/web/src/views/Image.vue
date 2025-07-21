<template>
  <div class="images-page">
    <h1 class="mb-4">镜像管理</h1>

    <!-- 操作按钮 -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <button class="btn btn-primary me-2" @click="toggleDialog(true, showUploadModal)">
          <i class="bi bi-cloud-upload me-1"></i> 上传镜像
        </button>
        <button class="btn btn-outline-primary" @click="toggleDialog(true, showCreateDiskModal)">
          <i class="bi bi-plus-circle me-1"></i> 创建磁盘镜像
        </button>
      </div>
      <div class="d-flex align-items-center flex-nowrap">
        <div class="input-group me-2">
          <input type="text" class="form-control" placeholder="搜索镜像..." v-model="searchQuery" />
          <button
            class="btn btn-outline-secondary"
            type="button"
            @click="searchQuery = ''"
            v-if="searchQuery"
          >
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="btn-group flex-shrink-0">
          <button
            class="btn"
            :class="activeTab === 'all' ? 'btn-primary' : 'btn-outline-primary'"
            @click="activeTab = 'all'"
          >
            全部
          </button>
          <button
            class="btn"
            :class="activeTab === 'iso' ? 'btn-primary' : 'btn-outline-primary'"
            @click="activeTab = 'iso'"
          >
            ISO 镜像
          </button>
          <button
            class="btn"
            :class="activeTab === 'disk' ? 'btn-primary' : 'btn-outline-primary'"
            @click="activeTab = 'disk'"
          >
            磁盘镜像
          </button>
        </div>
      </div>
    </div>

    <!-- 加载中提示 -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">加载镜像中...</p>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="loadImages">重试</button>
    </div>

    <!-- 空状态提示 -->
    <div v-else-if="filteredImages.length === 0" class="text-center py-5">
      <div class="mb-3">
        <i class="bi bi-hdd-stack fs-1 text-muted"></i>
      </div>
      <h4 class="text-muted">没有找到镜像</h4>
      <p class="text-muted" v-if="searchQuery">没有找到与 "{{ searchQuery }}" 匹配的镜像</p>
      <p class="text-muted" v-else-if="activeTab === 'iso'">
        没有找到 ISO 镜像，请上传一个 ISO 文件
      </p>
      <p class="text-muted" v-else-if="activeTab === 'disk'">
        没有找到磁盘镜像，请创建或上传一个磁盘镜像
      </p>
      <p class="text-muted" v-else>没有找到任何镜像，请上传或创建一个镜像</p>
      <div class="mt-3">
        <button class="btn btn-primary me-2" @click="toggleDialog(true, showUploadModal)">
          <i class="bi bi-cloud-upload me-1"></i> 上传镜像
        </button>
        <button
          class="btn btn-outline-primary"
          @click="toggleDialog(true, showCreateDiskModal)"
          v-if="activeTab !== 'iso'"
        >
          <i class="bi bi-plus-circle me-1"></i> 创建磁盘镜像
        </button>
      </div>
    </div>

    <!-- 镜像列表 -->
    <div v-else class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>大小</th>
              <th>创建时间</th>
              <th>修改时间</th>
              <th class="text-end">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="image in filteredImages" :key="image.id">
              <td>
                <div class="d-flex align-items-center">
                  <i
                    class="bi me-2"
                    :class="image.type === 'iso' ? 'bi-disc text-success' : 'bi-hdd text-primary'"
                  ></i>
                  <span>{{ image.name }}</span>
                </div>
              </td>
              <td>
                <span class="badge" :class="image.type === 'iso' ? 'bg-success' : 'bg-primary'">
                  {{ image.type === 'iso' ? 'ISO 镜像' : `磁盘镜像 (${image.format})` }}
                </span>
              </td>
              <td>{{ formatSize(image.size) }}</td>
              <td>{{ formatDate(image.created) }}</td>
              <td>{{ formatDate(image.modified) }}</td>
              <td class="text-end">
                <button
                  class="btn btn-sm btn-outline-secondary me-1"
                  @click="showImageDetails(image)"
                  title="查看详情"
                >
                  <i class="bi bi-info-circle"></i>
                </button>
                <button
                  class="btn btn-sm btn-outline-primary me-1"
                  @click="showRenameModal(image)"
                  title="重命名"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="confirmDelete(image)"
                  title="删除"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 上传镜像模态框 -->
    <div class="modal fade" id="showUploadModal" tabindex="-1" aria-hidden="true" role="dialog">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">上传镜像</h5>
            <button
              type="button"
              class="btn-close"
              @click="toggleDialog(false, showUploadModal)"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="!uploadingFile">
              <div class="mb-3">
                <label class="form-label">选择镜像文件</label>
                <input
                  type="file"
                  class="form-control"
                  @change="handleFileSelect"
                  accept=".iso,.qcow2,.img,.raw"
                />
                <div class="form-text">支持的格式: ISO, QCOW2, IMG, RAW</div>
              </div>

              <div class="mb-3" v-if="selectedFile">
                <div class="d-flex justify-content-between">
                  <span>文件名:</span>
                  <span>{{ selectedFile.name }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span>大小:</span>
                  <span>{{ formatSize(selectedFile.size) }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span>类型:</span>
                  <span>{{ getFileType(selectedFile.name) }}</span>
                </div>
              </div>
            </div>

            <div v-else>
              <div class="text-center mb-3">
                <div class="mb-2">上传中... {{ uploadProgress }}%</div>
                <div class="progress">
                  <div
                    class="progress-bar progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    :style="`width: ${uploadProgress}%`"
                    :aria-valuenow="uploadProgress"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
              <div class="text-center text-muted small">请勿关闭此窗口，上传完成后会自动关闭</div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="toggleDialog(false, showUploadModal)"
              :disabled="uploadingFile"
            >
              取消
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="uploadImage"
              :disabled="!selectedFile || uploadingFile"
            >
              上传
            </button>
          </div>
        </div>
      </div>
      <!-- <div class="modal-backdrop fade show" ></div> -->
    </div>

    <!-- 创建磁盘镜像模态框 -->
    <div class="modal fade" id="showCreateDiskModal" tabindex="-1" aria-hidden="true" role="dialog">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">创建磁盘镜像</h5>
            <button
              type="button"
              class="btn-close"
              @click="toggleDialog(false, showCreateDiskModal)"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createDiskImage">
              <div class="mb-3">
                <label for="diskName" class="form-label">镜像名称</label>
                <input
                  type="text"
                  class="form-control"
                  id="diskName"
                  v-model="newDisk.name"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="diskSize" class="form-label">镜像大小 (GB)</label>
                <input
                  type="number"
                  class="form-control"
                  id="diskSize"
                  v-model="newDisk.size"
                  min="1"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="diskFormat" class="form-label">镜像格式</label>
                <select class="form-select" id="diskFormat" v-model="newDisk.format">
                  <option value="qcow2">QCOW2 (推荐)</option>
                  <option value="raw">RAW</option>
                  <option value="img">IMG</option>
                </select>
                <div class="form-text">QCOW2 格式支持快照和压缩，推荐使用</div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="toggleDialog(false, showCreateDiskModal)"
              :disabled="creatingDisk"
            >
              取消
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="createDiskImage"
              :disabled="!newDisk.name || !newDisk.size || creatingDisk"
            >
              <span v-if="creatingDisk" class="spinner-border spinner-border-sm me-2"></span>
              创建
            </button>
          </div>
        </div>
      </div>
      <!-- <div class="modal-backdrop fade show" v-if="showCreateDiskModal"></div> -->
    </div>

    <!-- 重命名镜像模态框 -->
    <div
      class="modal fade"
      id="showRenameImageModal"
      tabindex="-1"
      aria-hidden="true"
      role="dialog"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">重命名镜像</h5>
            <button
              type="button"
              class="btn-close"
              @click="toggleDialog(false, showRenameImageModal)"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedImage">
              <div class="mb-3">
                <label class="form-label">当前名称</label>
                <input type="text" class="form-control" :value="selectedImage.name" disabled />
              </div>

              <div class="mb-3">
                <label for="newImageName" class="form-label">新名称</label>
                <input
                  type="text"
                  class="form-control"
                  id="newImageName"
                  v-model="newImageName"
                  required
                />
                <div class="form-text">不需要包含文件扩展名，将自动保留原扩展名</div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="toggleDialog(false, showRenameImageModal)"
              :disabled="renamingImage"
            >
              取消
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="renameImage"
              :disabled="!newImageName || renamingImage"
            >
              <span v-if="renamingImage" class="spinner-border spinner-border-sm me-2"></span>
              重命名
            </button>
          </div>
        </div>
      </div>
      <!-- <div class="modal-backdrop fade show" v-if="showRenameImageModal"></div> -->
    </div>

    <!-- 镜像详情模态框 -->
    <div
      class="modal fade"
      id="showImageDetailsModal"
      tabindex="-1"
      aria-hidden="true"
      role="dialog"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">镜像详情</h5>
            <button
              type="button"
              class="btn-close"
              @click="toggleDialog(false, showImageDetailsModal)"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="loadingImageDetails" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">加载镜像详情...</p>
            </div>

            <div v-else-if="imageDetails">
              <div class="row mb-4">
                <div class="col-md-6">
                  <h6 class="mb-3">基本信息</h6>
                  <table class="table table-sm">
                    <tbody>
                      <tr>
                        <th scope="row">名称</th>
                        <td>{{ imageDetails.name }}</td>
                      </tr>
                      <tr>
                        <th scope="row">类型</th>
                        <td>
                          {{
                            imageDetails.type === 'iso'
                              ? 'ISO 镜像'
                              : `磁盘镜像 (${imageDetails.format})`
                          }}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row">路径</th>
                        <td>{{ imageDetails.path }}</td>
                      </tr>
                      <tr>
                        <th scope="row">创建时间</th>
                        <td>{{ formatDate(imageDetails.created) }}</td>
                      </tr>
                      <tr>
                        <th scope="row">修改时间</th>
                        <td>{{ formatDate(imageDetails.modified) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="col-md-6">
                  <h6 class="mb-3">大小信息</h6>
                  <table class="table table-sm">
                    <tbody>
                      <tr>
                        <th scope="row">实际大小</th>
                        <td>{{ formatSize(imageDetails.actualSize) }}</td>
                      </tr>
                      <tr v-if="imageDetails.virtualSize">
                        <th scope="row">虚拟大小</th>
                        <td>{{ formatSize(imageDetails.virtualSize) }}</td>
                      </tr>
                      <tr v-if="imageDetails.clusterSize">
                        <th scope="row">簇大小</th>
                        <td>{{ formatSize(imageDetails.clusterSize) }}</td>
                      </tr>
                      <tr v-if="imageDetails.backingFile">
                        <th scope="row">基础镜像</th>
                        <td>{{ imageDetails.backingFile }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-if="imageDetails.fullInfo">
                <h6 class="mb-3">详细信息</h6>
                <pre
                  class="bg-light p-3 rounded"
                ><code>{{ JSON.stringify(imageDetails.fullInfo, null, 2) }}</code></pre>
              </div>
            </div>

            <div v-else-if="imageDetailsError" class="alert alert-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ imageDetailsError }}
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="toggleDialog(false, showImageDetailsModal)"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
      <!-- <div class="modal-backdrop fade show" v-if="showImageDetailsModal"></div> -->
    </div>

    <!-- 删除确认模态框 -->
    <div
      class="modal fade"
      id="showDeleteConfirmModal"
      tabindex="-1"
      aria-hidden="true"
      role="dialog"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">确认删除</h5>
            <button
              type="button"
              class="btn-close"
              @click="toggleDialog(false, showDeleteConfirmModal)"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedImage" class="alert alert-warning">
              <i class="bi bi-exclamation-triangle me-2"></i>
              您确定要删除镜像 <strong>{{ selectedImage.name }}</strong> 吗？
            </div>
            <p class="text-danger">
              <i class="bi bi-exclamation-circle me-2"></i>
              此操作不可逆，删除后无法恢复！
            </p>
            <div v-if="selectedImage && selectedImage.type === 'disk'" class="form-check mt-3">
              <input
                class="form-check-input"
                type="checkbox"
                id="confirmDiskDelete"
                v-model="confirmDiskDelete"
              />
              <label class="form-check-label" for="confirmDiskDelete">
                我了解删除磁盘镜像可能会导致依赖此镜像的虚拟机无法启动
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="toggleDialog(false, showDeleteConfirmModal)"
              :disabled="deletingImage"
            >
              取消
            </button>
            <button
              type="button"
              class="btn btn-danger"
              @click="deleteImage"
              :disabled="
                (selectedImage && selectedImage.type === 'disk' && !confirmDiskDelete) ||
                deletingImage
              "
            >
              <span v-if="deletingImage" class="spinner-border spinner-border-sm me-2"></span>
              删除
            </button>
          </div>
        </div>
      </div>
      <!-- <div class="modal-backdrop fade show" v-if="showDeleteConfirmModal"></div> -->
    </div>

    <!-- 全局通知 -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1100">
      <div
        class="toast show"
        v-if="notification.show"
        :class="{
          'bg-success text-white': notification.type === 'success',
          'bg-danger text-white': notification.type === 'error',
          'bg-warning': notification.type === 'warning',
          'bg-info text-white': notification.type === 'info',
        }"
      >
        <div class="toast-header">
          <i
            class="bi me-2"
            :class="{
              'bi-check-circle-fill text-success': notification.type === 'success',
              'bi-x-circle-fill text-danger': notification.type === 'error',
              'bi-exclamation-triangle-fill text-warning': notification.type === 'warning',
              'bi-info-circle-fill text-info': notification.type === 'info',
            }"
          ></i>
          <strong class="me-auto">{{ notification.title }}</strong>
          <button type="button" class="btn-close" @click="hideNotification"></button>
        </div>
        <div class="toast-body">
          {{ notification.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import imageService, { type Image, type ImageInfo } from '../services/imageService'
  import { Modal } from 'bootstrap'

  // 状态变量
  const images = ref<Image[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const activeTab = ref<'all' | 'iso' | 'disk'>('all')
  const searchQuery = ref('')

  // 模态框状态
  const showUploadModal: any = ref(null)
  const showCreateDiskModal: any = ref(null)
  const showRenameImageModal: any = ref(null)
  const showImageDetailsModal: any = ref(null)
  const showDeleteConfirmModal: any = ref(null)

  const toggleDialog = (isShow: boolean, modal: any) => {
    if (isShow) {
      modal.show()
    } else {
      modal.hide()
    }
  }
  // 上传状态
  const selectedFile = ref<File | null>(null)
  const uploadingFile = ref(false)
  const uploadProgress = ref(0)

  // 创建磁盘状态
  const newDisk = ref({
    name: '',
    size: 10,
    format: 'qcow2',
  })
  const creatingDisk = ref(false)

  // 重命名状态
  const selectedImage = ref<Image | null>(null)
  const newImageName = ref('')
  const renamingImage = ref(false)

  // 删除状态
  const confirmDiskDelete = ref(false)
  const deletingImage = ref(false)

  // 镜像详情状态
  const imageDetails = ref<ImageInfo | null>(null)
  const loadingImageDetails = ref(false)
  const imageDetailsError = ref<string | null>(null)

  // 通知状态
  const notification = ref({
    show: false,
    type: 'info',
    title: '',
    message: '',
    timeout: null as number | null,
  })

  // 计算属性：过滤后的镜像列表
  const filteredImages = computed(() => {
    let result = images.value

    // 按类型过滤
    if (activeTab.value !== 'all') {
      result = result.filter(image => image.type === activeTab.value)
    }

    // 按搜索词过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(
        image =>
          image.name.toLowerCase().includes(query) ||
          image.type.toLowerCase().includes(query) ||
          (image.format && image.format.toLowerCase().includes(query))
      )
    }

    return result
  })

  // 加载镜像列表
  const loadImages = async () => {
    loading.value = true
    error.value = null

    try {
      images.value = await imageService.getAllImages()
    } catch (err: any) {
      error.value = err.message || '加载镜像失败'
      console.error('Error loading images:', err)
    } finally {
      loading.value = false
    }
  }

  // 处理文件选择
  const handleFileSelect = (event: Event) => {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      selectedFile.value = input.files[0]
    } else {
      selectedFile.value = null
    }
  }

  // 获取文件类型
  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    if (ext === 'iso') {
      return 'ISO 镜像'
    } else if (['qcow2', 'img', 'raw'].includes(ext || '')) {
      return `磁盘镜像 (${ext})`
    }
    return '未知类型'
  }

  // 上传镜像
  const uploadImage = async () => {
    if (!selectedFile.value) return

    uploadingFile.value = true
    uploadProgress.value = 0

    try {
      const result = await imageService.uploadImage(selectedFile.value, progress => {
        uploadProgress.value = progress
      })

      // 上传成功后重新加载镜像列表
      await loadImages()

      // 显示成功通知
      showNotification('success', '上传成功', `镜像 ${result.image.name} 已成功上传`)

      // 关闭模态框
      showUploadModal.value.hide()
      selectedFile.value = null
    } catch (err: any) {
      showNotification('error', '上传失败', err.message || '上传镜像时发生错误')
    } finally {
      uploadingFile.value = false
    }
  }

  // 创建磁盘镜像
  const createDiskImage = async () => {
    if (!newDisk.value.name || !newDisk.value.size) return

    creatingDisk.value = true

    try {
      const result = await imageService.createDiskImage(
        newDisk.value.name,
        newDisk.value.size,
        newDisk.value.format
      )

      // 创建成功后重新加载镜像列表
      await loadImages()

      // 显示成功通知
      showNotification('success', '创建成功', `磁盘镜像 ${result.image.name} 已成功创建`)

      // 关闭模态框
      showCreateDiskModal.value.hide()

      // 重置表单
      newDisk.value = {
        name: '',
        size: 10,
        format: 'qcow2',
      }
    } catch (err: any) {
      showNotification('error', '创建失败', err.message || '创建磁盘镜像时发生错误')
    } finally {
      creatingDisk.value = false
    }
  }

  // 显示重命名模态框
  const showRenameModal = (image: Image) => {
    selectedImage.value = image
    newImageName.value = image.name.split('.')[0] // 去掉扩展名
    showRenameImageModal.value.show()
  }

  // 重命名镜像
  const renameImage = async () => {
    if (!selectedImage.value || !newImageName.value) return

    renamingImage.value = true

    try {
      const result = await imageService.renameImage(selectedImage.value.id, newImageName.value)

      // 重命名成功后重新加载镜像列表
      await loadImages()

      // 显示成功通知
      showNotification('success', '重命名成功', `镜像已重命名为 ${newImageName.value}`)

      // 关闭模态框
      showRenameImageModal.value.hide()
      selectedImage.value = null
      newImageName.value = ''
    } catch (err: any) {
      showNotification('error', '重命名失败', err.message || '重命名镜像时发生错误')
    } finally {
      renamingImage.value = false
    }
  }

  // 显示删除确认模态框
  const confirmDelete = (image: Image) => {
    selectedImage.value = image
    confirmDiskDelete.value = false
    showDeleteConfirmModal.value.show()
  }

  // 删除镜像
  const deleteImage = async () => {
    if (!selectedImage.value) return

    deletingImage.value = true

    try {
      const result = await imageService.deleteImage(selectedImage.value.id)

      // 删除成功后重新加载镜像列表
      await loadImages()

      // 显示成功通知
      showNotification('success', '删除成功', `镜像 ${selectedImage.value.name} 已成功删除`)

      // 关闭模态框
      showDeleteConfirmModal.value.hide()
      selectedImage.value = null
    } catch (err: any) {
      showNotification('error', '删除失败', err.message || '删除镜像时发生错误')
    } finally {
      deletingImage.value = false
    }
  }

  // 显示镜像详情
  const showImageDetails = async (image: Image) => {
    selectedImage.value = image
    showImageDetailsModal.value.show()
    loadingImageDetails.value = true
    imageDetailsError.value = null
    imageDetails.value = null

    try {
      imageDetails.value = await imageService.getImageInfo(image.id)
    } catch (err: any) {
      imageDetailsError.value = err.message || '加载镜像详情失败'
    } finally {
      loadingImageDetails.value = false
    }
  }

  // 显示通知
  const showNotification = (
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    message: string
  ) => {
    // 清除之前的定时器
    if (notification.value.timeout) {
      clearTimeout(notification.value.timeout)
    }

    // 设置新通知
    notification.value = {
      show: true,
      type,
      title,
      message,
      timeout: window.setTimeout(() => {
        notification.value.show = false
      }, 5000) as unknown as number,
    }
  }

  // 隐藏通知
  const hideNotification = () => {
    notification.value.show = false
    if (notification.value.timeout) {
      clearTimeout(notification.value.timeout)
    }
  }

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    return imageService.formatSize(bytes)
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return imageService.formatDate(dateString)
  }

  // 组件挂载时加载镜像列表
  onMounted(() => {
    loadImages()
    getDOMList()
  })
  const getDOMList = () => {
    showUploadModal.value = new Modal(document.getElementById('showUploadModal') as HTMLElement)
    showCreateDiskModal.value = new Modal(
      document.getElementById('showCreateDiskModal') as HTMLElement
    )
    showRenameImageModal.value = new Modal(
      document.getElementById('showRenameImageModal') as HTMLElement
    )
    showImageDetailsModal.value = new Modal(
      document.getElementById('showImageDetailsModal') as HTMLElement
    )
    showDeleteConfirmModal.value = new Modal(
      document.getElementById('showDeleteConfirmModal') as HTMLElement
    )
  }

  // 监听模态框关闭事件，重置状态
  watch(showUploadModal, newVal => {
    if (!newVal) {
      selectedFile.value = null
      uploadingFile.value = false
      uploadProgress.value = 0
    }
  })

  watch(showCreateDiskModal, newVal => {
    if (!newVal) {
      newDisk.value = {
        name: '',
        size: 10,
        format: 'qcow2',
      }
      creatingDisk.value = false
    }
  })
</script>

<style scoped>
  /* 整体容器优化 - 与其他页面保持一致 */
  .images-page {
    /* background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); */
    min-height: 100vh;
    padding: 2rem 1rem;
  }

  /* 页面标题 - 统一样式 */
  h1 {
    /* background: linear-gradient(135deg, #2c3e50, #3498db); */
    /* -webkit-background-clip: text; */
    /* -webkit-text-fill-color: transparent; */
    background-clip: text;
    font-weight: 800;
    font-size: 2.5rem;
    margin-bottom: 2rem !important;
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

  /* 顶部操作栏 - 简洁设计 */
  .d-flex.justify-content-between.align-items-center.mb-4 {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 1.5rem 2rem;
    margin-bottom: 2rem !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
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

  .btn-outline-primary {
    border: 2px solid #667eea;
    color: #667eea;
  }

  .btn-outline-primary:hover {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    transform: translateY(-2px);
  }

  .btn-outline-secondary:hover,
  .btn-outline-danger:hover {
    transform: translateY(-2px);
  }

  .btn-sm {
    padding: 0.5rem 1rem;
    border-radius: 20px;
  }

  /* 搜索框简洁优化 */
  .input-group .form-control {
    border-radius: 25px 0 0 25px;
    border: 2px solid rgba(102, 126, 234, 0.3);
    background: rgba(255, 255, 255, 0.9);
    padding: 0.75rem 1.5rem;
  }

  .input-group .form-control:focus {
    border-color: #667eea;
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.2);
  }

  .input-group .btn {
    border-radius: 0 25px 25px 0;
  }

  /* 按钮组优化 */
  .btn-group .btn {
    border-radius: 0;
  }

  .btn-group .btn:first-child {
    border-radius: 25px 0 0 25px;
  }

  .btn-group .btn:last-child {
    border-radius: 0 25px 25px 0;
  }

  /* 加载和错误状态 */
  .text-center.py-5,
  .alert {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .alert {
    border: none;
    padding: 1.5rem 2rem;
  }

  .alert-danger {
    background: linear-gradient(135deg, rgba(220, 53, 69, 0.1), rgba(255, 0, 0, 0.05));
    border-left: 4px solid #dc3545;
  }

  /* 主表格卡片 - 与其他页面统一 */
  .card {
    border: none !important;
    border-radius: 20px !important;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
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
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
  }

  /* 表格优化 */
  .table {
    margin-bottom: 0 !important;
  }

  .table-light {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  }

  .table th {
    font-weight: 700 !important;
    color: #2c3e50;
    border-top: none !important;
    border-bottom: 2px solid rgba(102, 126, 234, 0.2) !important;
    padding: 1.25rem 1rem !important;
  }

  .table td {
    padding: 1rem !important;
    vertical-align: middle;
    border-top: 1px solid rgba(0, 0, 0, 0.05) !important;
  }

  .table-hover tbody tr:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.02));
    transform: scale(1.01);
    transition: all 0.2s ease;
  }

  /* 徽章简洁设计 */
  .badge {
    padding: 0.5em 1em !important;
    border-radius: 12px !important;
    font-weight: 600 !important;
    font-size: 0.8rem;
  }

  .badge.bg-success {
    background: linear-gradient(135deg, #28a745, #20c997) !important;
  }

  .badge.bg-primary {
    background: linear-gradient(135deg, #007bff, #0056b3) !important;
  }

  /* 模态框统一样式 */
  .modal-content {
    border: none;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.95);
  }

  .modal-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    padding: 2rem 2rem 1rem;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-radius: 20px 20px 0 0;
  }

  .modal-title {
    background: linear-gradient(135deg, #2c3e50, #3498db);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
    font-size: 1.5rem;
  }

  .modal-body {
    padding: 2rem;
  }

  .modal-footer {
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    padding: 1rem 2rem 2rem;
  }

  /* 表单控件简洁优化 */
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

  .form-label {
    color: #2c3e50;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  /* 进度条简洁设计 */
  .progress {
    height: 12px;
    border-radius: 10px;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    overflow: hidden;
  }

  .progress-bar {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 10px;
  }

  /* 通知系统简洁优化 */
  .toast-container {
    min-width: 350px !important;
  }

  .toast {
    opacity: 1 !important;
    border: none;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(10px);
    margin-bottom: 1rem;
  }

  .toast.bg-success {
    background: linear-gradient(135deg, rgba(40, 167, 69, 0.9), rgba(32, 201, 151, 0.8));
  }

  .toast.bg-danger {
    background: linear-gradient(135deg, rgba(220, 53, 69, 0.9), rgba(255, 0, 0, 0.8));
  }

  .toast-header {
    background: rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  .toast-body {
    padding: 1rem;
    font-weight: 500;
  }

  /* 响应式优化 */
  @media (max-width: 768px) {
    .images-page {
      padding: 1rem 0.5rem;
    }

    h1 {
      font-size: 2rem;
      text-align: center;
    }

    .d-flex.justify-content-between.align-items-center.mb-4 {
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }

    .d-flex.align-items-center.flex-nowrap {
      flex-direction: column;
      width: 100%;
      gap: 1rem;
    }

    .btn-group {
      width: 100%;
    }

    .btn-group .btn {
      flex: 1;
    }

    .modal-dialog {
      margin: 1rem;
    }

    .table th,
    .table td {
      padding: 0.75rem 0.5rem !important;
      font-size: 0.9rem;
    }
  }

  /* 深色主题适配 */
  @media (prefers-color-scheme: dark) {
    .images-page {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    }

    .d-flex.justify-content-between.align-items-center.mb-4,
    .card,
    .text-center.py-5 {
      background: rgba(33, 37, 41, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .modal-content {
      background: rgba(33, 37, 41, 0.95);
    }

    .table th {
      color: #f8f9fa;
    }

    .table td {
      color: #f8f9fa;
      border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
    }

    .form-control,
    .form-select {
      background: rgba(33, 37, 41, 0.8);
      border-color: rgba(255, 255, 255, 0.2);
      color: #f8f9fa;
    }
  }

  /* 简单的进入动画 */
  .images-page {
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

  /* 图标简洁优化 */
  .bi {
    transition: all 0.3s ease;
  }

  .table tbody tr:hover .bi {
    transform: scale(1.1);
  }

  /* 删除确认特殊样式 */
  .alert-warning {
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 154, 0, 0.05));
    border-left: 4px solid #ffc107;
  }

  /* 文件上传区域 */
  input[type='file'] {
    border: 2px dashed rgba(102, 126, 234, 0.3);
    border-radius: 12px;
    background: rgba(102, 126, 234, 0.05);
    transition: all 0.3s ease;
  }

  input[type='file']:hover {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }

  /* 简洁的按钮悬停效果 */
  .btn:hover {
    transform: translateY(-2px);
  }

  .btn:active {
    transform: translateY(0);
  }

  /* 加载动画简化 */
  .spinner-border {
    width: 2rem;
    height: 2rem;
    border-width: 3px;
  }

  .spinner-border-sm {
    width: 1rem;
    height: 1rem;
    border-width: 2px;
  }

  /* 操作按钮组简洁设计 */
  .text-end .btn-sm {
    margin: 0 0.1rem;
  }

  /* 表格数据对齐 */
  .table .d-flex.align-items-center {
    gap: 0.5rem;
  }

  /* 搜索清除按钮 */
  .input-group .btn-outline-secondary {
    border-left: none;
    background: rgba(108, 117, 125, 0.1);
  }

  /* 预格式化文本简洁设计 */
  pre {
    max-height: 300px;
    overflow-y: auto;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1rem;
    font-size: 0.875rem;
  }

  /* 模态框背景 */
  .modal-backdrop {
    background: rgba(0, 0, 0, 0.5);
  }

  /* 确认复选框 */
  .form-check-input {
    border-radius: 4px;
    border: 2px solid #667eea;
  }

  .form-check-input:checked {
    background: #667eea;
    border-color: #667eea;
  }

  /* 表单文本说明 */
  .form-text {
    color: #6c757d;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  /* 空状态图标 */
  .text-center.py-5 .bi-hdd-stack {
    color: #6c757d;
    opacity: 0.7;
  }

  /* 数据统计简洁显示 */
  .d-flex.justify-content-between span:last-child {
    font-family: 'Monaco', 'Consolas', monospace;
    font-weight: 600;
    color: #495057;
  }

  /* 警告状态简化 */
  .text-danger {
    color: #dc3545 !important;
    font-weight: 500;
  }

  /* 成功状态简化 */
  .text-success {
    color: #28a745 !important;
  }

  /* 按钮禁用状态 */
  .btn:disabled {
    opacity: 0.6;
    transform: none !important;
    cursor: not-allowed;
  }

  /* 表格滚动条简洁设计 */
  .table-responsive::-webkit-scrollbar {
    height: 6px;
  }

  .table-responsive::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .table-responsive::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .table-responsive::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* 焦点状态简化 */
  .btn:focus,
  .form-control:focus,
  .form-select:focus {
    outline: 2px solid rgba(102, 126, 234, 0.25);
    outline-offset: 2px;
  }

  /* 列表项间距 */
  .mb-3:last-child {
    margin-bottom: 0 !important;
  }

  /* 模态框关闭按钮 */
  .btn-close {
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }

  .btn-close:hover {
    opacity: 1;
  }

  /* 简化的表格行状态 */
  .table tbody tr {
    transition:
      background-color 0.2s ease,
      transform 0.2s ease;
  }

  /* 上传进度区域 */
  .text-center.mb-3 {
    padding: 1.5rem;
    background: rgba(102, 126, 234, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(102, 126, 234, 0.1);
  }

  /* 危险操作确认 */
  .btn-danger {
    background: #dc3545;
    border-color: #dc3545;
  }

  .btn-danger:hover {
    background: #c82333;
    border-color: #bd2130;
    transform: translateY(-2px);
  }

  /* 次要按钮 */
  .btn-secondary {
    background: #6c757d;
    border-color: #6c757d;
  }

  .btn-secondary:hover {
    background: #5a6268;
    border-color: #545b62;
    transform: translateY(-2px);
  }

  /* 文件类型图标颜色保持 */
  .bi-disc.text-success {
    color: #28a745 !important;
  }

  .bi-hdd.text-primary {
    color: #007bff !important;
  }

  /* 减少动画模式适配 */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* 打印样式 */
  @media print {
    .images-page {
      background: white !important;
    }

    .btn,
    .modal,
    .toast-container {
      display: none !important;
    }

    .card {
      box-shadow: none !important;
      border: 1px solid #dee2e6 !important;
    }
  }
</style>
