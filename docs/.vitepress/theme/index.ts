import { h, onMounted, nextTick } from 'vue'
import DefaultTheme from 'vitepress/theme'
import './style/vars.css'
import VmDemo from './components/VmDemo.vue'
import ApiTable from './components/ApiTable.vue'
import MermaidZoom from './components/MermaidZoom.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    // 注册自定义组件
    app.component('VmDemo', VmDemo)
    app.component('ApiTable', ApiTable)
    app.component('MermaidZoom', MermaidZoom)
  },
  setup() {
    onMounted(() => {
      nextTick(() => {
        // 自动为所有 mermaid 图表添加缩放功能
        const autoEnhanceMermaid = () => {
          const mermaidElements = document.querySelectorAll('.mermaid')
          mermaidElements.forEach(element => {
            // 检查是否已经被包装
            if (!element.closest('.mermaid-zoom-wrapper')) {
              // 创建包装组件
              const wrapper = document.createElement('div')
              wrapper.setAttribute('is', 'mermaid-zoom')

              // 替换原始元素
              element.parentNode?.insertBefore(wrapper, element)
              wrapper.appendChild(element)
            }
          })
        }

        // 初始化
        setTimeout(autoEnhanceMermaid, 1000)

        // 监听页面变化
        const observer = new MutationObserver(() => {
          setTimeout(autoEnhanceMermaid, 500)
        })

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        })
      })
    })
  },
}
