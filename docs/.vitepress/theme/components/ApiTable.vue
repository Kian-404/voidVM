<template>
  <div class="api-table-container">
    <table class="api-table">
      <thead>
        <tr>
          <th>方法</th>
          <th>路径</th>
          <th>描述</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="api in apis" :key="api.path">
          <td>
            <code :class="`method-${api.method.toLowerCase()}`">
              {{ api.method }}
            </code>
          </td>
          <td>
            <code>{{ api.path }}</code>
          </td>
          <td>{{ api.description }}</td>
          <td>
            <span :class="`status-badge status-${api.status}`">
              {{ api.status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
  interface ApiEndpoint {
    method: string
    path: string
    description: string
    status: 'stable' | 'beta' | 'deprecated'
  }

  defineProps<{
    apis: ApiEndpoint[]
  }>()
</script>

<style scoped>
  .api-table-container {
    overflow-x: auto;
    margin: 20px 0;
  }

  .method-get {
    background-color: #10b981;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
  }

  .method-post {
    background-color: #3b82f6;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
  }

  .method-put {
    background-color: #f59e0b;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
  }

  .method-delete {
    background-color: #ef4444;
    color: white;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
  }

  .status-stable {
    background-color: var(--vp-c-void-success);
  }

  .status-beta {
    background-color: var(--vp-c-void-warning);
  }

  .status-deprecated {
    background-color: var(--vp-c-void-error);
  }
</style>
