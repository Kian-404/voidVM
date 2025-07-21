<template>
  <div class="card h-100 snapshot-card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h6 class="mb-0 text-truncate" :title="snapshot.name">
        <i class="bi bi-camera-fill me-2"></i>
        {{ snapshot.name }}
      </h6>
      <span class="badge" :class="getStatusBadgeClass(snapshot.status)">
        {{ getStatusText(snapshot.status) }}
      </span>
    </div>

    <div class="card-body">
      <p class="card-text text-muted small mb-2" v-if="snapshot.description">
        {{ snapshot.description }}
      </p>

      <div class="row g-2 mb-3">
        <div class="col-6">
          <div class="text-center">
            <div class="text-muted small">创建时间</div>
            <div class="fw-bold small">{{ formatDate(snapshot.createTime) }}</div>
          </div>
        </div>
        <div class="col-6">
          <div class="text-center">
            <div class="text-muted small">大小</div>
            <div class="fw-bold small">{{ formatFileSize(snapshot.size) }}</div>
          </div>
        </div>
      </div>

      <div v-if="snapshot.lastLoadTime" class="mb-2">
        <small class="text-muted">
          <i class="bi bi-clock-history me-1"></i>
          最后加载: {{ formatDate(snapshot.lastLoadTime) }}
        </small>
      </div>
    </div>

    <div class="card-footer bg-transparent">
      <div class="btn-group w-100" role="group">
        <button
          class="btn btn-outline-success btn-sm"
          @click="$emit('load', snapshot)"
          :disabled="loading === 'loading'"
        >
          <span v-if="loading === 'loading'" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="bi bi-play-fill me-1"></i>
          {{ loading === 'loading' ? '加载中' : '加载' }}
        </button>

        <button class="btn btn-outline-primary btn-sm" @click="$emit('view-detail', snapshot)">
          <i class="bi bi-info-circle me-1"></i>
          详情
        </button>

        <div class="btn-group" role="group">
          <button
            class="btn btn-outline-secondary btn-sm dropdown-toggle"
            data-bs-toggle="dropdown"
          >
            <i class="bi bi-three-dots"></i>
          </button>
          <ul class="dropdown-menu">
            <li>
              <button class="dropdown-item" @click="$emit('rename', snapshot)">
                <i class="bi bi-pencil me-2"></i>
                重命名
              </button>
            </li>
            <li><hr class="dropdown-divider" /></li>
            <li>
              <button
                class="dropdown-item text-danger"
                @click="$emit('delete', snapshot)"
                :disabled="loading === 'deleting'"
              >
                <span
                  v-if="loading === 'deleting'"
                  class="spinner-border spinner-border-sm me-2"
                ></span>
                <i v-else class="bi bi-trash me-2"></i>
                {{ loading === 'deleting' ? '删除中' : '删除' }}
              </button>
            </li>
          </ul>
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
    loading: {
      type: String,
      default: null,
    },
  })

  const emit = defineEmits(['load', 'delete', 'rename', 'view-detail'])

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
  .snapshot-card {
    transition: transform 0.2s ease-in-out;
  }

  .snapshot-card:hover {
    transform: translateY(-2px);
  }

  .card-footer {
    border-top: 1px solid rgba(0, 0, 0, 0.125);
  }

  .text-truncate {
    max-width: 200px;
  }
</style>
