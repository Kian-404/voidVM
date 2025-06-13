<template>
  <div class="file-uploader">
     <!-- 结果显示 -->
     <div class="mb-4" v-if="result">
      <div class="card" :class="{'border-success': result.success, 'border-danger': !result.success}">
        <div class="card-header" :class="{'bg-success text-white': result.success, 'bg-danger text-white': !result.success}">
          {{ result.success ? '上传成功!' : '上传失败' }}
        </div>
        <div class="card-body">
          <p v-if="result.message" class="card-text">{{ result.message }}</p>
          <p v-if="result.localPath" class="card-text"><strong>本地路径:</strong> {{ result.localPath }}</p>
          <p v-if="result.remotePath" class="card-text"><strong>远程路径:</strong> {{ result.remotePath }}</p>
          <p v-if="result.error" class="card-text text-danger"><strong>错误:</strong> {{ result.error }}</p>
          <p v-if="result.details" class="card-text text-danger"><strong>详情:</strong> {{ result.details }}</p>
        </div>
      </div>
    </div>
    <h2 class="mb-4">向 QEMU 虚拟机传输文件</h2>

    <div class="card">
      <div class="card-body">
        <form @submit.prevent="uploadFile">
          <!-- 文件选择 -->
          <div class="mb-3">
            <label for="file" class="form-label">选择文件</label>
            <input
              type="file"
              class="form-control"
              id="file"
              ref="fileInput"
              required
            >
          </div>

          <!-- 连接信息 -->
          <div class="mb-3">
            <div class="card bg-light">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span>SSH 连接信息 (可选)</span>
                <button
                  type="button"
                  class="btn btn-sm btn-link"
                  @click="showConnectionInfo = !showConnectionInfo"
                >
                  {{ showConnectionInfo ? '隐藏' : '显示' }}
                </button>
              </div>
              <div class="card-body" v-if="showConnectionInfo">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="host" class="form-label">主机地址</label>
                    <input
                      type="text"
                      class="form-control"
                      id="host"
                      v-model="formData.host"
                      placeholder="默认使用环境变量"
                    >
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="port" class="form-label">SSH 端口</label>
                    <input
                      type="number"
                      class="form-control"
                      id="port"
                      v-model="formData.port"
                      placeholder="默认 22"
                    >
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="username" class="form-label">用户名</label>
                    <input
                      type="text"
                      class="form-control"
                      id="username"
                      v-model="formData.username"
                      placeholder="默认使用环境变量"
                    >
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="password" class="form-label">密码</label>
                    <input
                      type="password"
                      class="form-control"
                      id="password"
                      v-model="formData.password"
                      placeholder="默认使用环境变量"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 文件目标 -->
          <div class="mb-3">
            <label for="remotePath" class="form-label">远程路径 (可选)</label>
            <input
              type="text"
              class="form-control"
              id="remotePath"
              v-model="formData.remotePath"
              placeholder="默认为远程用户主目录"
            >
          </div>

          <!-- 执行命令 -->
          <div class="mb-3">
            <label for="executeCommand" class="form-label">上传后执行命令 (可选)</label>
            <textarea
              class="form-control"
              id="executeCommand"
              v-model="formData.executeCommand"
              placeholder="例如: chmod +x /path/to/file"
              rows="3"
            ></textarea>
          </div>

          <!-- 提交按钮 -->
          <div class="d-grid gap-2">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isUploading"
            >
              <span v-if="isUploading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ isUploading ? '上传中...' : '上传文件' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script>
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
export default {
  name: 'FileUploader',
  data() {
    return {
      formData: {
        host: 'localhost',
        port: '2222',
        username: 'aaa',
        password: '123456',
        remotePath: '',
        executeCommand: ''
      },
      showConnectionInfo: false,
      isUploading: false,
      result: null
    };
  },
  methods: {
    async uploadFile() {
      if (!this.$refs.fileInput.files.length) {
        alert('请选择文件');
        return;
      }

      this.isUploading = true;
      this.result = null;

      const formData = new FormData();
      formData.append('file', this.$refs.fileInput.files[0]);

      // 添加其他表单字段
      Object.keys(this.formData).forEach(key => {
        if (this.formData[key]) {
          formData.append(key, this.formData[key]);
        }
      });

      try {
        const response = await fetch(`${BASE_URL}/api/files/upload-to-vm`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          this.result = {
            success: true,
            message: data.message,
            localPath: data.localPath,
            remotePath: data.remotePath
          };
        } else {
          this.result = {
            success: false,
            error: data.error,
            details: data.details || '无详细信息'
          };
        }
      } catch (error) {
        this.result = {
          success: false,
          error: '请求错误',
          details: error.message
        };
      } finally {
        this.isUploading = false;

        // 滚动到结果区域
        setTimeout(() => {
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }
};
</script>

<style scoped>
.file-uploader {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>
