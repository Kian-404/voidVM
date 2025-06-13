<template>
  <div class="mermaid-zoom-wrapper">
    <div ref="mermaidContainer" class="mermaid-container" @click="openZoomModal">
      <slot />
    </div>

    <!-- 缩放提示 -->
    <div class="zoom-hint">
      <svg width="16" height="16" viewBox="0 0 16 16">
        <path
          d="M6.5 1a5.5 5.5 0 0 1 4.383 8.823l2.647 2.647a.75.75 0 1 1-1.06 1.06l-2.647-2.646A5.5 5.5 0 1 1 6.5 1zM2 6.5a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0z"
        />
        <path
          d="M6.5 4.75a.75.75 0 0 1 .75.75v1h1a.75.75 0 0 1 0 1.5h-1v1a.75.75 0 0 1-1.5 0v-1h-1a.75.75 0 0 1 0-1.5h1v-1a.75.75 0 0 1 .75-.75z"
        />
      </svg>
      点击放大
    </div>

    <!-- 模态框 -->
    <Teleport to="body">
      <div v-if="showModal" class="mermaid-modal" @click="closeModal">
        <div class="modal-overlay">
          <div class="modal-content" @click.stop>
            <!-- 控制栏 -->
            <div class="modal-header">
              <div class="modal-title">图表查看器</div>
              <div class="modal-controls">
                <button class="control-btn" @click="zoomIn" :disabled="scale >= maxScale">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path
                      d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
                    />
                  </svg>
                  放大
                </button>
                <button class="control-btn" @click="zoomOut" :disabled="scale <= minScale">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z" />
                  </svg>
                  缩小
                </button>
                <button class="control-btn" @click="resetZoom">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path
                      d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"
                    />
                  </svg>
                  还原
                </button>
                <button class="control-btn fit-btn" @click="fitToScreen">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path
                      d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5z"
                    />
                  </svg>
                  适应
                </button>
                <span class="scale-info">{{ Math.round(scale * 100) }}%</span>
                <button class="control-btn close-btn" @click="closeModal">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path
                      d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854z"
                    />
                  </svg>
                  关闭
                </button>
              </div>
            </div>

            <!-- 图表容器 -->
            <div
              class="modal-body"
              ref="modalBody"
              @wheel="handleWheel"
              @mousedown="startPan"
              @mousemove="handlePan"
              @mouseup="endPan"
              @mouseleave="endPan"
            >
              <div class="mermaid-zoom-content" ref="zoomContent" :style="transformStyle">
                <div v-html="mermaidContent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, nextTick } from 'vue'

  // 响应式数据
  const showModal = ref(false)
  const scale = ref(3)
  const translateX = ref(0)
  const translateY = ref(0)
  const mermaidContent = ref('')
  const mermaidContainer = ref(null)
  const modalBody = ref(null)
  const zoomContent = ref(null)

  // 配置
  const minScale = 0.1
  const maxScale = 5
  const zoomStep = 0.2

  // 拖拽相关
  const isPanning = ref(false)
  const lastMouseX = ref(0)
  const lastMouseY = ref(0)

  // 计算样式
  const transformStyle = computed(() => ({
    transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
    transformOrigin: 'center center',
    transition: isPanning.value ? 'none' : 'transform 0.3s ease',
  }))

  // 获取 Mermaid 内容
  const getMermaidContent = () => {
    const mermaidEl = mermaidContainer.value?.querySelector('.mermaid')
    if (mermaidEl) {
      return mermaidEl.innerHTML
    }
    return ''
  }

  // 打开模态框
  const openZoomModal = () => {
    mermaidContent.value = getMermaidContent()
    showModal.value = true
    resetZoom()

    // 禁止页面滚动
    document.body.style.overflow = 'hidden'
  }

  // 关闭模态框
  const closeModal = () => {
    showModal.value = false
    document.body.style.overflow = ''
  }

  // 缩放操作
  const zoomIn = () => {
    if (scale.value < maxScale) {
      scale.value = Math.min(maxScale, scale.value + zoomStep)
    }
  }

  const zoomOut = () => {
    if (scale.value > minScale) {
      scale.value = Math.max(minScale, scale.value - zoomStep)
    }
  }

  const resetZoom = () => {
    scale.value = 2
    translateX.value = 0
    translateY.value = 0
  }

  // 适应屏幕
  const fitToScreen = () => {
    nextTick(() => {
      if (!modalBody.value || !zoomContent.value) return

      const container = modalBody.value
      const content = zoomContent.value.firstElementChild

      if (!content) return

      const containerRect = container.getBoundingClientRect()
      const contentRect = content.getBoundingClientRect()

      const scaleX = (containerRect.width - 40) / contentRect.width
      const scaleY = (containerRect.height - 40) / contentRect.height
      const optimalScale = Math.min(scaleX, scaleY, 2)

      scale.value = Math.max(minScale, Math.min(maxScale, optimalScale))
      translateX.value = 0
      translateY.value = 0
    })
  }

  // 鼠标滚轮缩放
  const handleWheel = e => {
    e.preventDefault()

    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newScale = Math.max(minScale, Math.min(maxScale, scale.value + delta))

    if (newScale !== scale.value) {
      scale.value = newScale
    }
  }

  // 拖拽功能
  const startPan = e => {
    if (e.button === 0) {
      // 左键
      isPanning.value = true
      lastMouseX.value = e.clientX
      lastMouseY.value = e.clientY
      document.body.style.cursor = 'grabbing'
    }
  }

  const handlePan = e => {
    if (!isPanning.value) return

    const deltaX = e.clientX - lastMouseX.value
    const deltaY = e.clientY - lastMouseY.value

    translateX.value += deltaX
    translateY.value += deltaY

    lastMouseX.value = e.clientX
    lastMouseY.value = e.clientY
  }

  const endPan = () => {
    isPanning.value = false
    document.body.style.cursor = ''
  }

  // 键盘事件
  const handleKeydown = e => {
    if (showModal.value) {
      switch (e.key) {
        case 'Escape':
          closeModal()
          break
        case '+':
        case '=':
          e.preventDefault()
          zoomIn()
          break
        case '-':
          e.preventDefault()
          zoomOut()
          break
        case '0':
          e.preventDefault()
          resetZoom()
          break
        case 'f':
        case 'F':
          e.preventDefault()
          fitToScreen()
          break
      }
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })
</script>

<style scoped>
  .mermaid-zoom-wrapper {
    position: relative;
    display: inline-block;
    margin: 16px 0;
    width: 100%;
  }

  .mermaid-container {
    cursor: zoom-in;
    border: 1px solid #e1e5e9;
    border-radius: 6px;
    padding: 16px;
    background-color: #fafbfc;
    transition: all 0.3s ease;
    position: relative;
  }

  .mermaid-container:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .zoom-hint {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .mermaid-container:hover .zoom-hint {
    opacity: 1;
  }

  /* 模态框样式 */
  .mermaid-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
  }

  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal-content {
    background: white;
    border-radius: 8px;
    width: 95vw;
    height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    flex-shrink: 0;
  }

  .modal-title {
    font-weight: 600;
    font-size: 16px;
    color: #212529;
  }

  .modal-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .control-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border: 1px solid #d0d7de;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s ease;
    color: #24292f;
  }

  .control-btn:hover:not(:disabled) {
    background-color: #f6f8fa;
    border-color: #8c959f;
  }

  .control-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .control-btn svg {
    fill: currentColor;
  }

  .fit-btn {
    background-color: #0969da;
    color: white;
    border-color: #0969da;
  }

  .fit-btn:hover {
    background-color: #0550ae;
    border-color: #0550ae;
  }

  .close-btn {
    background-color: #da3633;
    color: white;
    border-color: #da3633;
  }

  .close-btn:hover {
    background-color: #b91c1c !important;
    border-color: #b91c1c !important;
  }

  .scale-info {
    padding: 6px 12px;
    background-color: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    color: #24292f;
    min-width: 50px;
    text-align: center;
  }

  .modal-body {
    flex: 1;
    overflow: hidden;
    background-color: #ffffff;
    position: relative;
    cursor: grab;
  }

  .modal-body:active {
    cursor: grabbing;
  }

  .mermaid-zoom-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: center center;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .modal-content {
      width: 100vw;
      height: 100vh;
      border-radius: 0;
    }

    .modal-controls {
      flex-wrap: wrap;
      gap: 4px;
    }

    .control-btn {
      padding: 4px 8px;
      font-size: 11px;
    }

    .modal-title {
      font-size: 14px;
    }
  }

  /* 键盘快捷键提示 */
  .modal-header::after {
    content: '快捷键: ESC 关闭 | +/- 缩放 | 0 还原 | F 适应 | 拖拽移动';
    position: absolute;
    bottom: -20px;
    left: 16px;
    font-size: 11px;
    color: #6c757d;
    opacity: 0.8;
  }
</style>
