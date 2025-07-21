<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0, 0, 0, 0.5)">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-pencil me-2"></i>
            重命名快照
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="mb-3">
              <label for="currentName" class="form-label">当前名称</label>
              <input
                id="currentName"
                type="text"
                class="form-control"
                :value="snapshot.name"
                disabled
              />
            </div>

            <div class="mb-3">
              <label for="newName" class="form-label"
                >新名称 <span class="text-danger">*</span></label
              >
              <input
                id="newName"
                v-model="formData.newName"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.newName }"
                placeholder="输入新的快照名称"
                pattern="^[a-zA-Z0-9_-]+$"
                required
              />
              <div v-if="errors.newName" class="invalid-feedback">
                {{ errors.newName }}
              </div>
              <div class="form-text">只能包含字母、数字、下划线和连字符</div>
            </div>

            <div class="mb-3">
              <label for="description" class="form-label">描述</label>
              <textarea
                id="description"
                v-model="formData.description"
                class="form-control"
                rows="3"
                placeholder="输入快照描述（可选）"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('close')">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="!isFormValid || loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { reactive, computed, ref } from 'vue'

  const props = defineProps({
    snapshot: {
      type: Object,
      required: true,
    },
  })

  const emit = defineEmits(['save', 'close'])

  const loading = ref(false)

  const formData = reactive({
    newName: props.snapshot.name,
    description: props.snapshot.description || '',
  })

  const errors = reactive({
    newName: '',
  })

  const isFormValid = computed(() => {
    return (
      formData.newName &&
      formData.newName !== props.snapshot.name &&
      /^[a-zA-Z0-9_-]+$/.test(formData.newName) &&
      !errors.newName
    )
  })

  const validateNewName = () => {
    errors.newName = ''

    if (!formData.newName) {
      errors.newName = '新名称不能为空'
      return false
    }

    if (formData.newName === props.snapshot.name) {
      errors.newName = '新名称不能与当前名称相同'
      return false
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(formData.newName)) {
      errors.newName = '名称格式不正确'
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateNewName()) {
      return
    }

    loading.value = true

    try {
      await emit('save', {
        oldName: props.snapshot.name,
        newName: formData.newName,
        description: formData.description,
      })
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
  .modal {
    z-index: 1055;
  }
</style>
