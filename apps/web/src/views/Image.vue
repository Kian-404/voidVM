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
          <input type="text" class="form-control" placeholder="搜索镜像..." v-model="searchQuery">
          <button class="btn btn-outline-secondary" type="button" @click="searchQuery = ''" v-if="searchQuery">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="btn-group flex-shrink-0">
          <button class="btn" :class="activeTab === 'all' ? 'btn-primary' : 'btn-outline-primary'"
            @click="activeTab = 'all'">
            全部
          </button>
          <button class="btn" :class="activeTab === 'iso' ? 'btn-primary' : 'btn-outline-primary'"
            @click="activeTab = 'iso'">
            ISO 镜像
          </button>
          <button class="btn" :class="activeTab === 'disk' ? 'btn-primary' : 'btn-outline-primary'"
            @click="activeTab = 'disk'">
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
      <p class="text-muted" v-if="searchQuery">
        没有找到与 "{{ searchQuery }}" 匹配的镜像
      </p>
      <p class="text-muted" v-else-if="activeTab === 'iso'">
        没有找到 ISO 镜像，请上传一个 ISO 文件
      </p>
      <p class="text-muted" v-else-if="activeTab === 'disk'">
        没有找到磁盘镜像，请创建或上传一个磁盘镜像
      </p>
      <p class="text-muted" v-else>
        没有找到任何镜像，请上传或创建一个镜像
      </p>
      <div class="mt-3">
        <button class="btn btn-primary me-2" @click="toggleDialog(true, showUploadModal)">
          <i class="bi bi-cloud-upload me-1"></i> 上传镜像
        </button>
        <button class="btn btn-outline-primary" @click="toggleDialog(true, showCreateDiskModal)"
          v-if="activeTab !== 'iso'">
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
                  <i class="bi me-2" :class="image.type === 'iso' ? 'bi-disc text-success' : 'bi-hdd text-primary'"></i>
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
                <button class="btn btn-sm btn-outline-secondary me-1" @click="showImageDetails(image)" title="查看详情">
                  <i class="bi bi-info-circle"></i>
                </button>
                <button class="btn btn-sm btn-outline-primary me-1" @click="showRenameModal(image)" title="重命名">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(image)" title="删除">
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
            <button type="button" class="btn-close" @click="toggleDialog(false, showUploadModal)"></button>
          </div>
          <div class="modal-body">
            <div v-if="!uploadingFile">
              <div class="mb-3">
                <label class="form-label">选择镜像文件</label>
                <input type="file" class="form-control" @change="handleFileSelect" accept=".iso,.qcow2,.img,.raw">
                <div class="form-text">
                  支持的格式: ISO, QCOW2, IMG, RAW
                </div>
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
                  <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar"
                    :style="`width: ${uploadProgress}%`" :aria-valuenow="uploadProgress" aria-valuemin="0"
                    aria-valuemax="100"></div>
                </div>
              </div>
              <div class="text-center text-muted small">
                请勿关闭此窗口，上传完成后会自动关闭
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="toggleDialog(false, showUploadModal)"
              :disabled="uploadingFile">
              取消
            </button>
            <button type="button" class="btn btn-primary" @click="uploadImage"
              :disabled="!selectedFile || uploadingFile">
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
            <button type="button" class="btn-close" @click="toggleDialog(false, showCreateDiskModal)"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createDiskImage">
              <div class="mb-3">
                <label for="diskName" class="form-label">镜像名称</label>
                <input type="text" class="form-control" id="diskName" v-model="newDisk.name" required>
              </div>

              <div class="mb-3">
                <label for="diskSize" class="form-label">镜像大小 (GB)</label>
                <input type="number" class="form-control" id="diskSize" v-model="newDisk.size" min="1" required>
              </div>

              <div class="mb-3">
                <label for="diskFormat" class="form-label">镜像格式</label>
                <select class="form-select" id="diskFormat" v-model="newDisk.format">
                  <option value="qcow2">QCOW2 (推荐)</option>
                  <option value="raw">RAW</option>
                  <option value="img">IMG</option>
                </select>
                <div class="form-text">
                  QCOW2 格式支持快照和压缩，推荐使用
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="toggleDialog(false, showCreateDiskModal)"
              :disabled="creatingDisk">
              取消
            </button>
            <button type="button" class="btn btn-primary" @click="createDiskImage"
              :disabled="!newDisk.name || !newDisk.size || creatingDisk">
              <span v-if="creatingDisk" class="spinner-border spinner-border-sm me-2"></span>
              创建
            </button>
          </div>
        </div>
      </div>
      <!-- <div class="modal-backdrop fade show" v-if="showCreateDiskModal"></div> -->
    </div>

    <!-- 重命名镜像模态框 -->
    <div class="modal fade" id="showRenameImageModal" tabindex="-1" aria-hidden="true" role="dialog">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">重命名镜像</h5>
            <button type="button" class="btn-close" @click="toggleDialog(false, showRenameImageModal)"></button>
          </div>
          <div class="modal-body">
            <div v-if="selectedImage">
              <div class="mb-3">
                <label class="form-label">当前名称</label>
                <input type="text" class="form-control" :value="selectedImage.name" disabled>
              </div>

              <div class="mb-3">
                <label for="newImageName" class="form-label">新名称</label>
                <input type="text" class="form-control" id="newImageName" v-model="newImageName" required>
                <div class="form-text">
                  不需要包含文件扩展名，将自动保留原扩展名
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="toggleDialog(false, showRenameImageModal)"
              :disabled="renamingImage">
              取消
            </button>
            <button type="button" class="btn btn-primary" @click="renameImage"
              :disabled="!newImageName || renamingImage">
              <span v-if="renamingImage" class="spinner-border spinner-border-sm me-2"></span>
              重命名
            </button>
          </div>
        </div>
      </div>
      <!-- <div class="modal-backdrop fade show" v-if="showRenameImageModal"></div> -->
    </div>

    <!-- 镜像详情模态框 -->
    <div class="modal fade" id="showImageDetailsModal" tabindex="-1" aria-hidden="true" role="dialog">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">镜像详情</h5>
            <button type="button" class="btn-close" @click="toggleDialog(false, showImageDetailsModal)"></button>
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
                          {{ imageDetails.type === 'iso' ? 'ISO 镜像' : `磁盘镜像 (${imageDetails.format})` }}
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
                  class="bg-light p-3 rounded"><code>{{ JSON.stringify(imageDetails.fullInfo, null, 2) }}</code></pre>
              </div>
            </div>

            <div v-else-if="imageDetailsError" class="alert alert-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ imageDetailsError }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="toggleDialog(false, showImageDetailsModal)">
              关闭
            </button>
          </div>
        </div>
      </div>
      <!-- <div class="modal-backdrop fade show" v-if="showImageDetailsModal"></div> -->
    </div>

    <!-- 删除确认模态框 -->
    <div class="modal fade" id="showDeleteConfirmModal" tabindex="-1" aria-hidden="true" role="dialog">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">确认删除</h5>
            <button type="button" class="btn-close" @click="toggleDialog(false, showDeleteConfirmModal)"></button>
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
              <input class="form-check-input" type="checkbox" id="confirmDiskDelete" v-model="confirmDiskDelete">
              <label class="form-check-label" for="confirmDiskDelete">
                我了解删除磁盘镜像可能会导致依赖此镜像的虚拟机无法启动
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="toggleDialog(false, showDeleteConfirmModal)"
              :disabled="deletingImage">
              取消
            </button>
            <button type="button" class="btn btn-danger" @click="deleteImage"
              :disabled="(selectedImage && selectedImage.type === 'disk' && !confirmDiskDelete) || deletingImage">
              <span v-if="deletingImage" class="spinner-border spinner-border-sm me-2"></span>
              删除
            </button>
          </div>
        </div>
      </div>
      <!-- <div class="modal-backdrop fade show" v-if="showDeleteConfirmModal"></div> -->
    </div>

    <!-- 全局通知 -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1100;">
      <div class="toast show" v-if="notification.show" :class="{
        'bg-success text-white': notification.type === 'success',
        'bg-danger text-white': notification.type === 'error',
        'bg-warning': notification.type === 'warning',
        'bg-info text-white': notification.type === 'info'
      }">
        <div class="toast-header">
          <i class="bi me-2" :class="{
            'bi-check-circle-fill text-success': notification.type === 'success',
            'bi-x-circle-fill text-danger': notification.type === 'error',
            'bi-exclamation-triangle-fill text-warning': notification.type === 'warning',
            'bi-info-circle-fill text-info': notification.type === 'info'
          }"></i>
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
import { ref, computed, onMounted, watch } from 'vue';
import imageService, { type Image, type ImageInfo } from '../services/imageService';
import { Modal } from 'bootstrap';

// 状态变量
const images = ref<Image[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const activeTab = ref<'all' | 'iso' | 'disk'>('all');
const searchQuery = ref('');

// 模态框状态
const showUploadModal: any = ref(null);
const showCreateDiskModal: any = ref(null);
const showRenameImageModal: any = ref(null);
const showImageDetailsModal: any = ref(null);
const showDeleteConfirmModal: any = ref(null);

const toggleDialog = (isShow: boolean, modal: any) => {
  if (isShow) {
    modal.show();
  } else {
    modal.hide();
  }
};
// 上传状态
const selectedFile = ref<File | null>(null);
const uploadingFile = ref(false);
const uploadProgress = ref(0);

// 创建磁盘状态
const newDisk = ref({
  name: '',
  size: 10,
  format: 'qcow2'
});
const creatingDisk = ref(false);

// 重命名状态
const selectedImage = ref<Image | null>(null);
const newImageName = ref('');
const renamingImage = ref(false);

// 删除状态
const confirmDiskDelete = ref(false);
const deletingImage = ref(false);

// 镜像详情状态
const imageDetails = ref<ImageInfo | null>(null);
const loadingImageDetails = ref(false);
const imageDetailsError = ref<string | null>(null);

// 通知状态
const notification = ref({
  show: false,
  type: 'info',
  title: '',
  message: '',
  timeout: null as number | null
});

// 计算属性：过滤后的镜像列表
const filteredImages = computed(() => {
  let result = images.value;

  // 按类型过滤
  if (activeTab.value !== 'all') {
    result = result.filter(image => image.type === activeTab.value);
  }

  // 按搜索词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(image =>
      image.name.toLowerCase().includes(query) ||
      image.type.toLowerCase().includes(query) ||
      (image.format && image.format.toLowerCase().includes(query))
    );
  }

  return result;
});

// 加载镜像列表
const loadImages = async () => {
  loading.value = true;
  error.value = null;

  try {
    images.value = await imageService.getAllImages();
  } catch (err: any) {
    error.value = err.message || '加载镜像失败';
    console.error('Error loading images:', err);
  } finally {
    loading.value = false;
  }
};

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0];
  } else {
    selectedFile.value = null;
  }
};

// 获取文件类型
const getFileType = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'iso') {
    return 'ISO 镜像';
  } else if (['qcow2', 'img', 'raw'].includes(ext || '')) {
    return `磁盘镜像 (${ext})`;
  }
  return '未知类型';
};

// 上传镜像
const uploadImage = async () => {
  if (!selectedFile.value) return;

  uploadingFile.value = true;
  uploadProgress.value = 0;

  try {
    const result = await imageService.uploadImage(selectedFile.value, (progress) => {
      uploadProgress.value = progress;
    });

    // 上传成功后重新加载镜像列表
    await loadImages();

    // 显示成功通知
    showNotification('success', '上传成功', `镜像 ${result.image.name} 已成功上传`);

    // 关闭模态框
    showUploadModal.value.hide();
    selectedFile.value = null;
  } catch (err: any) {
    showNotification('error', '上传失败', err.message || '上传镜像时发生错误');
  } finally {
    uploadingFile.value = false;
  }
};

// 创建磁盘镜像
const createDiskImage = async () => {
  if (!newDisk.value.name || !newDisk.value.size) return;

  creatingDisk.value = true;

  try {
    const result = await imageService.createDiskImage(
      newDisk.value.name,
      newDisk.value.size,
      newDisk.value.format
    );

    // 创建成功后重新加载镜像列表
    await loadImages();

    // 显示成功通知
    showNotification('success', '创建成功', `磁盘镜像 ${result.image.name} 已成功创建`);

    // 关闭模态框
    showCreateDiskModal.value.hide();

    // 重置表单
    newDisk.value = {
      name: '',
      size: 10,
      format: 'qcow2'
    };
  } catch (err: any) {
    showNotification('error', '创建失败', err.message || '创建磁盘镜像时发生错误');
  } finally {
    creatingDisk.value = false;
  }
};

// 显示重命名模态框
const showRenameModal = (image: Image) => {
  selectedImage.value = image;
  newImageName.value = image.name.split('.')[0]; // 去掉扩展名
  showRenameImageModal.value.show();
};

// 重命名镜像
const renameImage = async () => {
  if (!selectedImage.value || !newImageName.value) return;

  renamingImage.value = true;

  try {
    const result = await imageService.renameImage(selectedImage.value.id, newImageName.value);

    // 重命名成功后重新加载镜像列表
    await loadImages();

    // 显示成功通知
    showNotification('success', '重命名成功', `镜像已重命名为 ${newImageName.value}`);

    // 关闭模态框
    showRenameImageModal.value.hide();
    selectedImage.value = null;
    newImageName.value = '';
  } catch (err: any) {
    showNotification('error', '重命名失败', err.message || '重命名镜像时发生错误');
  } finally {
    renamingImage.value = false;
  }
};

// 显示删除确认模态框
const confirmDelete = (image: Image) => {
  selectedImage.value = image;
  confirmDiskDelete.value = false;
  showDeleteConfirmModal.value.show();
};

// 删除镜像
const deleteImage = async () => {
  if (!selectedImage.value) return;

  deletingImage.value = true;

  try {
    const result = await imageService.deleteImage(selectedImage.value.id);

    // 删除成功后重新加载镜像列表
    await loadImages();

    // 显示成功通知
    showNotification('success', '删除成功', `镜像 ${selectedImage.value.name} 已成功删除`);

    // 关闭模态框
    showDeleteConfirmModal.value.hide();
    selectedImage.value = null;
  } catch (err: any) {
    showNotification('error', '删除失败', err.message || '删除镜像时发生错误');
  } finally {
    deletingImage.value = false;
  }
};

// 显示镜像详情
const showImageDetails = async (image: Image) => {
  selectedImage.value = image;
  showImageDetailsModal.value.show();
  loadingImageDetails.value = true;
  imageDetailsError.value = null;
  imageDetails.value = null;

  try {
    imageDetails.value = await imageService.getImageInfo(image.id);
  } catch (err: any) {
    imageDetailsError.value = err.message || '加载镜像详情失败';
  } finally {
    loadingImageDetails.value = false;
  }
};

// 显示通知
const showNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
  // 清除之前的定时器
  if (notification.value.timeout) {
    clearTimeout(notification.value.timeout);
  }

  // 设置新通知
  notification.value = {
    show: true,
    type,
    title,
    message,
    timeout: window.setTimeout(() => {
      notification.value.show = false;
    }, 5000) as unknown as number
  };
};

// 隐藏通知
const hideNotification = () => {
  notification.value.show = false;
  if (notification.value.timeout) {
    clearTimeout(notification.value.timeout);
  }
};

// 格式化文件大小
const formatSize = (bytes: number) => {
  return imageService.formatSize(bytes);
};

// 格式化日期
const formatDate = (dateString: string) => {
  return imageService.formatDate(dateString);
};

// 组件挂载时加载镜像列表
onMounted(() => {
  loadImages();
  getDOMList();
});
const getDOMList = () => {
  showUploadModal.value = new Modal(document.getElementById('showUploadModal') as HTMLElement);
  showCreateDiskModal.value = new Modal(document.getElementById('showCreateDiskModal') as HTMLElement);
  showRenameImageModal.value = new Modal(document.getElementById('showRenameImageModal') as HTMLElement);
  showImageDetailsModal.value = new Modal(document.getElementById('showImageDetailsModal') as HTMLElement);
  showDeleteConfirmModal.value = new Modal(document.getElementById('showDeleteConfirmModal') as HTMLElement);
}

// 监听模态框关闭事件，重置状态
watch(showUploadModal, (newVal) => {
  if (!newVal) {
    selectedFile.value = null;
    uploadingFile.value = false;
    uploadProgress.value = 0;
  }
});

watch(showCreateDiskModal, (newVal) => {
  if (!newVal) {
    newDisk.value = {
      name: '',
      size: 10,
      format: 'qcow2'
    };
    creatingDisk.value = false;
  }
});

</script>

<style scoped>
.table th {
  font-weight: 600;
}

.badge {
  font-weight: 500;
}

.modal-backdrop {
  opacity: 0.5;
}

pre {
  max-height: 300px;
  overflow-y: auto;
}

.toast-container {
  min-width: 300px;
}

.toast {
  opacity: 1;
}
</style>
