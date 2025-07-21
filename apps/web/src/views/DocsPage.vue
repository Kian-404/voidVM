<!-- src/views/DocsPage.vue -->
<template>
  <div class="docs-page">
    <header class="docs-header">
      <h1>项目文档</h1>
      <div class="tabs">
        <button :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
          <span class="icon">📚</span>
          所有文档
        </button>
        <button :class="{ active: activeTab === 'main' }" @click="activeTab = 'main'">
          <span class="icon">📄</span>
          主项目
        </button>
        <button :class="{ active: activeTab === 'frontend' }" @click="activeTab = 'frontend'">
          <span class="icon">🖥️</span>
          前端项目
        </button>
      </div>
    </header>

    <main class="docs-content">
      <ReadmeViewer :type="activeTab" :key="activeTab" />
    </main>

    <footer class="docs-footer">
      <p>© {{ currentYear }} 项目文档中心</p>
    </footer>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import ReadmeViewer from '@/components/ReadmeViewer.vue'

  // 当前活动的标签页
  const activeTab = ref('all')

  // 获取当前年份
  const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
  .docs-page {
    min-height: 100vh;
    background-color: #f8fafc;
    display: flex;
    flex-direction: column;
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
      'Helvetica Neue', sans-serif;
  }

  .docs-header {
    background: linear-gradient(135deg, #4a6cf7 0%, #3a5be0 100%);
    color: white;
    padding: 40px 20px 30px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(74, 108, 247, 0.2);
  }

  .docs-header h1 {
    margin: 0 0 25px 0;
    font-size: 2.2rem;
    font-weight: 700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    letter-spacing: 0.5px;
  }

  .tabs {
    display: flex;
    justify-content: center;
    gap: 15px;
    margin-bottom: 10px;
    max-width: 600px;
    margin: 0 auto;
  }

  .tabs button {
    background-color: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-width: 120px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .tabs button:hover {
    background-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .tabs button.active {
    background-color: white;
    color: #3a5be0;
    border-color: white;
    font-weight: 600;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .tabs button .icon {
    margin-right: 8px;
    font-size: 1.1rem;
  }

  .docs-content {
    flex: 1;
    padding: 30px 20px 50px;
    background-color: #f8fafc;
    position: relative;
  }

  .docs-content::before {
    content: '';
    position: absolute;
    top: -50px;
    left: 0;
    right: 0;
    height: 50px;
    background: linear-gradient(to bottom, rgba(74, 108, 247, 0), #f8fafc);
    z-index: 1;
  }

  .docs-footer {
    background-color: #f1f5f9;
    color: #64748b;
    text-align: center;
    padding: 20px;
    border-top: 1px solid #e2e8f0;
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    .docs-header {
      padding: 30px 15px 25px;
    }

    .docs-header h1 {
      font-size: 1.8rem;
      margin-bottom: 20px;
    }

    .tabs {
      flex-direction: column;
      gap: 10px;
      width: 100%;
      max-width: 250px;
    }

    .tabs button {
      width: 100%;
      padding: 10px 15px;
    }

    .docs-content {
      padding: 20px 15px 40px;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .tabs button {
      padding: 10px 15px;
      font-size: 0.95rem;
    }
  }
</style>
