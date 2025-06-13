<!-- src/components/ReadmeViewer.vue -->
<template>
  <div class="readme-viewer">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <button @click="fetchReadme">重试</button>
    </div>
    
    <div v-else class="readme-content">
      <!-- 使用v-html渲染markdown转换后的HTML -->
      <div v-html="renderedContent"></div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
export default {
  name: 'ReadmeViewer',
  props: {
    // 指定要获取的README类型：'all', 'main', 'frontend'
    type: {
      type: String,
      default: 'all',
      validator: (value) => ['all', 'main', 'frontend'].includes(value)
    }
  },
  data() {
    return {
      loading: true,
      error: null,
      readmeContent: null
    };
  },
  computed: {
    // 将Markdown转换为安全的HTML
    renderedContent() {
      if (!this.readmeContent) return '';
      
      // 如果是all类型，需要处理多个README
      if (this.type === 'all' && typeof this.readmeContent === 'object') {
        const mainHtml = this.readmeContent.mainReadme ? 
          DOMPurify.sanitize(marked.parse(this.readmeContent.mainReadme)) : '';
        
        const frontendHtml = this.readmeContent.frontendReadme ? 
          DOMPurify.sanitize(marked.parse(this.readmeContent.frontendReadme)) : '';
        
        return `
          <div class="readme-section">
            <h2>主项目 README</h2>
            <div class="readme-container">${mainHtml}</div>
          </div>
          <hr />
          <div class="readme-section">
            <h2>前端项目 README</h2>
            <div class="readme-container">${frontendHtml}</div>
          </div>
        `;
      }
      
      // 单个README的情况
      const content = typeof this.readmeContent === 'object' ? 
        this.readmeContent.content : this.readmeContent;
      
      return DOMPurify.sanitize(marked.parse(content));
    },
    
    // 根据type确定API端点
    apiEndpoint() {
      const baseUrl = '/api/readme';
      switch(this.type) {
        case 'main':
          return `${baseUrl}/main`;
        case 'frontend':
          return `${baseUrl}/frontend`;
        default:
          return baseUrl;
      }
    }
  },
  mounted() {
    this.fetchReadme();
  },
  methods: {
    async fetchReadme() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.get(`${BASE_URL}${this.apiEndpoint}`);
        this.readmeContent = response.data;
        
        // 如果返回的是带content字段的对象，则提取content
        if (this.type !== 'all' && response.data.content) {
          this.readmeContent = response.data.content;
        }
      } catch (error) {
        console.error('获取README失败:', error);
        this.error = error.response?.data?.error || '无法加载README内容，请稍后再试';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.readme-viewer {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 0;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid #3498db;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 30px;
  color: #e74c3c;
}

.error button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 15px;
}

.readme-content {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.readme-section {
  margin-bottom: 30px;
}

.readme-section h2 {
  padding: 10px 20px;
  background-color: #f5f5f5;
  margin: 0;
  border-bottom: 1px solid #e0e0e0;
}

.readme-container {
  padding: 20px;
}

/* 为渲染后的markdown内容添加样式 */
:deep(h1) {
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

:deep(pre) {
  background-color: #f6f8fa;
  border-radius: 3px;
  padding: 16px;
  overflow: auto;
}

:deep(code) {
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  padding: 0.2em 0.4em;
  font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
}

:deep(blockquote) {
  border-left: 4px solid #dfe2e5;
  color: #6a737d;
  padding: 0 1em;
  margin: 0;
}

:deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin-bottom: 16px;
}

:deep(table th), :deep(table td) {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
}

:deep(table tr:nth-child(2n)) {
  background-color: #f6f8fa;
}
</style>
