<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0, 0, 0, 0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-camera-fill me-2"></i>
            快照详情 - {{ snapshot.name }}
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>

        <div class="modal-body">
          <div class="row g-3">
            <!-- 基本信息 -->
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">基本信息</h6>
                </div>
                <div class="card-body">
                  <dl class="row mb-0">
                    <dt class="col-sm-4">快照ID:</dt>
                    <dd class="col-sm-8">
                      <code class="small">{{ snapshot.id }}</code>
                    </dd>

                    <dt class="col-sm-4">快照名称:</dt>
                    <dd class="col-sm-8">{{ snapshot.name }}</dd>

                    <dt class="col-sm-4">虚拟机:</dt>
                    <dd class="col-sm-8">{{ snapshot.vmName }}</dd>

                    <dt class="col-sm-4">状态:</dt>
                    <dd class="col-sm-8">
                      <span class="badge" :class="getStatusBadgeClass(snapshot.status)">
                        {{ getStatusText(snapshot.status) }}
                      </span>
                    </dd>

                    <dt class="col-sm-4">大小:</dt>
                    <dd class="col-sm-8">{{ formatFileSize(snapshot.size) }}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <!-- 时间信息 -->
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">时间信息</h6>
                </div>
                <div class="card-body">
                  <dl class="row mb-0">
                    <dt class="col-sm-5">创建时间:</dt>
                    <dd class="col-sm-7">{{ formatDate(snapshot.createTime) }}</dd>

                    <dt class="col-sm-5">最后加载:</dt>
                    <dd class="col-sm-7">
                      {{ snapshot.lastLoadTime ? formatDate(snapshot.lastLoadTime) : '从未加载' }}
                    </dd>

                    <dt class="col-sm-5">更新时间:</dt>
                    <dd class="col-sm-7">
                      {{ snapshot.updateTime ? formatDate(snapshot.updateTime) : '-' }}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            <!-- 描述信息 -->
            <div class="col-12" v-if="snapshot.description">
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">描述信息</h6>
                </div>
                <div class="card-body">
                  <p class="mb-0">{{ snapshot.description }}</p>
                </div>
              </div>
            </div>

            <!-- QEMU信息 -->
            <div class="col-12" v-if="snapshot.qemuInfo">
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">QEMU信息</h6>
                </div>
                <div class="card-body">
                  <dl class="row mb-0">
                    <dt class="col-sm-2">ID:</dt>
                    <dd class="col-sm-4">{{ snapshot.qemuInfo.id }}</dd>

                    <dt class="col-sm-2">标签:</dt>
                    <dd class="col-sm-4">{{ snapshot.qemuInfo.tag }}</dd>

                    <dt class="col-sm-2">VM大小:</dt>
                    <dd class="col-sm-4">{{ snapshot.qemuInfo.vmSize }}</dd>

                    <dt class="col-sm-2">日期:</dt>
                    <dd class="col-sm-4">{{ snapshot.qemuInfo.date }}</dd>

                    <dt class="col-sm-2">时间:</dt>
                    <dd class="col-sm-4">{{ snapshot.qemuInfo.time }}</dd>

                    <dt class="col-sm-2">VM时钟:</dt>
                    <dd class="col-sm-4">{{ snapshot.qemuInfo.vmClock }}</dd>
                  </dl>
                </div>
              </div>
            </div>

            <!-- 元数据 -->
            <div class="col-12" v-if="snapshot.metadata">
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">元数据</h6>
                </div>
                <div class="card-body">
                  <pre
                    class="mb-0"
                  ><code>{{ JSON.stringify(snapshot.metadata, null, 2) }}</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { defineProps, defineEmits } from 'vue'

  const props = defineProps({
    snapshot: {
      type: Object,
      required: true,
    },
  })

  const emit = defineEmits(['close'])

  const getStatusBadgeClass = status => {
    const classes = {
      active: 'bg-success',
      inactive: 'bg-secondary',
      error: 'bg-danger',
    }
    return classes[status] || 'bg-secondary'
  }

  const getStatusText = status => {
    const texts = {
      active: '活跃',
      inactive: '非活跃',
      error: '错误',
    }
    return texts[status] || '未知'
  }

  const formatDate = dateString => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
  }

  const formatFileSize = bytes => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
</script>

<style scoped>
  .modal {
    z-index: 1055;
  }

  code {
    font-size: 0.875em;
  }

  pre {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 0.375rem;
    padding: 0.75rem;
    font-size: 0.875em;
  }
</style>
