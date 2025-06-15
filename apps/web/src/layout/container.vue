<template>
  <div class="container">
    <div class="row mb-4">
      <div class="col-md-8">
        <h1>虚拟机管理</h1>
        <p class="lead">
          便捷管理您的 QEMU 虚拟机，支持创建、启动、停止和远程访问
        </p>
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
            <button type="button" class="btn-close" @click="closeUploadModal" aria-label="Close"></button>
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
import { onMounted, ref } from 'vue';
import createVMCom from '../components/createVM.vue';
import listVMCom from '../components/listVM.vue';
import noVNC from '../components/noVNC.vue';
// @ts-ignore
import FileUploader from '../components/FileUploader.vue';
import { Modal } from 'bootstrap';

const listVM = ref(listVMCom);

const showFileUploader = ref(false);
const uploadModal: any = ref(null);
// Methods
const loadVMs = async () => {
  listVM.value.loadVMs();
};

// 文件上传完成后的回调
const onUploadComplete = () => {
  showFileUploader.value = false;
  // 可以添加提示或其他操作
};
const openUploadModal = () => {
  uploadModal.value.show();
};

const closeUploadModal = () => {
  uploadModal.value.hide();
};
onMounted(() => {
  uploadModal.value = new Modal(document.getElementById('uploadModal') as HTMLElement);
});
</script>

<style scoped></style>
