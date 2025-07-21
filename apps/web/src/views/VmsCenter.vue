<template>
  <div class="container">
    <div class="row mb-4">
      <div class="col-md-8">
        <h1>虚拟机管理</h1>
        <p class="lead">便捷管理您的 QEMU 虚拟机，支持创建、启动、停止和远程访问</p>
      </div>
      <div class="col-md-4 d-flex align-items-center justify-content-end">
        <button class="btn btn-primary" @click="openUploadModal">
          <i class="bi bi-upload me-2"></i>上传文件
        </button>
      </div>

      <div class="row">
        <!-- 左侧表单区域 -->
        <div class="col-lg-6 mb-4">
          <!-- 创建新虚拟机表单 -->
          <createVMCom @loadVMs="loadVMs" />
          <noVNC />
        </div>

        <!-- 右侧虚拟机列表 -->
        <listVMCom ref="listVM" />
      </div>
    </div>
    <!-- 文件上传弹窗 -->
    <div class="modal fade" id="uploadModal" tabindex="-1" aria-hidden="true" role="dialog">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">上传文件到虚拟机</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeUploadModal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <FileUploader @upload-complete="onUploadComplete" />
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show" v-if="showFileUploader" @click="closeUploadModal"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import createVMCom from '../components/createVM.vue'
  import listVMCom from '../components/listVM.vue'
  import noVNC from '../components/noVNC.vue'
  // @ts-ignore
  import FileUploader from '../components/FileUploader.vue'
  import { Modal } from 'bootstrap'

  const listVM = ref(listVMCom)

  const showFileUploader = ref(false)
  const uploadModal: any = ref(null)
  // Methods
  const loadVMs = async () => {
    listVM.value.loadVMs()
  }

  // 文件上传完成后的回调
  const onUploadComplete = () => {
    showFileUploader.value = false
    // 可以添加提示或其他操作
  }
  const openUploadModal = () => {
    uploadModal.value.show()
  }

  const closeUploadModal = () => {
    uploadModal.value.hide()
  }
  onMounted(() => {
    uploadModal.value = new Modal(document.getElementById('uploadModal') as HTMLElement)
  })
</script>

<style scoped>
  /* 整体容器优化 */
  .container {
    /* background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); */
    min-height: 100vh;
    padding: 2rem 1rem;
    border-radius: 0;
  }

  /* 页面标题区域优化 */
  .row.mb-4 {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 249, 250, 0.9));
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 2rem !important;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  h1 {
    /* background: linear-gradient(135deg, #2c3e50, #3498db); */
    /* -webkit-background-clip: text; */
    /* -webkit-text-fill-color: transparent; */
    background-clip: text;
    font-weight: 800;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
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

  .lead {
    color: #6c757d;
    font-size: 1.1rem;
    line-height: 1.6;
    font-weight: 400;
  }

  /* 上传按钮优化 */
  .btn-primary {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border: none;
    border-radius: 25px;
    padding: 0.75rem 2rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    position: relative;
    overflow: hidden;
  }

  .btn-primary::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  .btn-primary:hover::before {
    left: 100%;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    background: linear-gradient(135deg, #5a6fd8, #6b5b95);
  }

  .btn-primary:active {
    transform: translateY(0);
  }

  /* 主要内容区域布局优化 */
  .row:not(.mb-4) {
    gap: 2rem;
  }

  .col-lg-6 {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  /* 组件容器通用样式 */
  .col-lg-6 > *,
  .col-lg-6 + * {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .col-lg-6 > *:hover,
  .col-lg-6 + *:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  }

  /* 模态框优化 */
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

  .btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    opacity: 0.6;
    transition: all 0.3s ease;
  }

  .btn-close:hover {
    opacity: 1;
    transform: scale(1.1);
  }

  /* 模态框背景优化 */
  .modal-backdrop {
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
  }

  /* 图标优化 */
  .bi {
    filter: drop-shadow(0 0 2px rgba(102, 126, 234, 0.3));
    transition: all 0.3s ease;
  }

  .btn:hover .bi {
    transform: scale(1.1);
  }

  /* 响应式优化 */
  @media (max-width: 992px) {
    .container {
      padding: 1rem 0.5rem;
    }

    .row.mb-4 {
      padding: 1.5rem;
      margin-bottom: 1.5rem !important;
    }

    h1 {
      font-size: 2rem;
    }

    .col-lg-6 {
      margin-bottom: 1rem;
    }

    .col-lg-6 > *,
    .col-lg-6 + * {
      padding: 1.5rem;
      margin-bottom: 1rem;
    }

    .btn-primary {
      padding: 0.6rem 1.5rem;
      font-size: 0.9rem;
    }
  }

  @media (max-width: 768px) {
    .d-flex.align-items-center.justify-content-end {
      justify-content: center !important;
      margin-top: 1rem;
    }

    .col-md-8,
    .col-md-4 {
      text-align: center;
    }

    h1::after {
      left: 50%;
      transform: translateX(-50%);
    }

    .modal-dialog {
      margin: 1rem;
    }

    .modal-header,
    .modal-body {
      padding: 1.5rem;
    }
  }

  /* 深色主题适配 */
  @media (prefers-color-scheme: dark) {
    .container {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    }

    .row.mb-4,
    .col-lg-6 > *,
    .col-lg-6 + * {
      background: rgba(33, 37, 41, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .lead {
      color: #adb5bd;
    }

    .modal-content {
      background: rgba(33, 37, 41, 0.95);
    }

    .modal-header {
      background: linear-gradient(135deg, #2d2d2d, #3d3d3d);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
  }

  /* 页面加载动画 */
  .container {
    animation: fadeInUp 0.8s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 组件区域动画 */
  .col-lg-6 > *:nth-child(1) {
    animation: slideInLeft 0.6s ease-out 0.2s both;
  }

  .col-lg-6 > *:nth-child(2) {
    animation: slideInLeft 0.6s ease-out 0.4s both;
  }

  .col-lg-6 + * {
    animation: slideInRight 0.6s ease-out 0.3s both;
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(50px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* 模态框动画增强 */
  .modal.show .modal-dialog {
    animation: modalSlideIn 0.3s ease-out;
  }

  @keyframes modalSlideIn {
    from {
      transform: translateY(-50px) scale(0.95);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }
</style>
