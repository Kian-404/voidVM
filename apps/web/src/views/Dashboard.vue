<template>
  <div class="dashboard">
    <h1 class="mb-4">系统控制台</h1>

    <!-- 连接状态提示 -->
    <div v-if="!wsService.connected.value" class="alert alert-warning">
      <i class="bi bi-exclamation-triangle me-2"></i>
      正在连接到服务器...
      <button @click="reconnect" class="btn btn-sm btn-outline-dark ms-2">重新连接</button>
    </div>

    <div v-if="wsService.error.value" class="alert alert-danger">
      <i class="bi bi-x-circle me-2"></i>
      {{ wsService.error.value }}
    </div>

    <!-- 系统概览卡片 -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title text-primary"><i class="bi bi-cpu me-2"></i>CPU</h5>
            <div v-if="systemData">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span>使用率</span>
                <span class="fw-bold">{{ systemData.cpu.usage }}%</span>
              </div>
              <div class="progress mb-3" style="height: 10px">
                <div
                  class="progress-bar"
                  role="progressbar"
                  :style="`width: ${systemData.cpu.usage}%`"
                  :class="getCpuBarClass(systemData.cpu.usage)"
                  :aria-valuenow="systemData.cpu.usage"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <div class="small text-muted">
                <div>{{ systemData.cpu.model }}</div>
                <div>{{ systemData.cpu.cores }} 核心 / {{ systemData.cpu.speed }} MHz</div>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title text-success"><i class="bi bi-memory me-2"></i>内存</h5>
            <div v-if="systemData">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span>使用率</span>
                <span class="fw-bold">{{ systemData.memory.usagePercentage }}%</span>
              </div>
              <div class="progress mb-3" style="height: 10px">
                <div
                  class="progress-bar bg-success"
                  role="progressbar"
                  :style="`width: ${systemData.memory.usagePercentage}%`"
                  :aria-valuenow="systemData.memory.usagePercentage"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <div class="small text-muted">
                <div class="d-flex justify-content-between">
                  <span>已用</span>
                  <span>{{ formatBytes(systemData.memory.used) }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span>总计</span>
                  <span>{{ formatBytes(systemData.memory.total) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <div class="spinner-border spinner-border-sm text-success" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title text-info"><i class="bi bi-hdd me-2"></i>磁盘</h5>
            <div v-if="systemData">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span>使用率</span>
                <span class="fw-bold">{{ systemData.disk.usagePercentage }}%</span>
              </div>
              <div class="progress mb-3" style="height: 10px">
                <div
                  class="progress-bar bg-info"
                  role="progressbar"
                  :style="`width: ${systemData.disk.usagePercentage}%`"
                  :aria-valuenow="systemData.disk.usagePercentage"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <div class="small text-muted">
                <div class="d-flex justify-content-between">
                  <span>已用</span>
                  <span>{{ formatBytes(systemData.disk.used) }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span>总计</span>
                  <span>{{ formatBytes(systemData.disk.total) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <div class="spinner-border spinner-border-sm text-info" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body">
            <h5 class="card-title text-warning"><i class="bi bi-pc-display me-2"></i>虚拟机</h5>
            <div v-if="systemData">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span>运行中</span>
                <span class="fw-bold"
                  >{{ systemData.qemu.runningVMs }} / {{ systemData.qemu.totalVMs }}</span
                >
              </div>
              <div class="progress mb-3" style="height: 10px">
                <div
                  class="progress-bar bg-warning"
                  role="progressbar"
                  :style="`width: ${systemData.qemu.totalVMs ? (systemData.qemu.runningVMs / systemData.qemu.totalVMs) * 100 : 0}%`"
                  :aria-valuenow="systemData.qemu.runningVMs"
                  aria-valuemin="0"
                  :aria-valuemax="systemData.qemu.totalVMs"
                ></div>
              </div>
              <div class="small text-muted">
                <div class="d-flex justify-content-between">
                  <span>已分配 CPU</span>
                  <span>{{ systemData.qemu.cpuAllocation }} 核心</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span>已分配内存</span>
                  <span>{{ formatBytes(systemData.qemu.memoryAllocation * 1024 * 1024) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <div class="spinner-border spinner-border-sm text-warning" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 详细信息卡片 -->
    <div class="row">
      <!-- 系统信息 -->
      <div class="col-md-6 mb-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0"><i class="bi bi-info-circle me-2"></i>系统信息</h5>
          </div>
          <div class="card-body p-0" style="height: 400px; overflow-y: auto">
            <div class="p-3">
              <div v-if="systemData">
                <table class="table table-sm mb-0">
                  <tbody>
                    <tr>
                      <th scope="row" width="30%">主机名</th>
                      <td>{{ systemData.system.hostname }}</td>
                    </tr>
                    <tr>
                      <th scope="row">平台</th>
                      <td>{{ systemData.system.platform }} ({{ systemData.system.arch }})</td>
                    </tr>
                    <tr>
                      <th scope="row">运行时间</th>
                      <td>{{ formatUptime(systemData.system.uptime) }}</td>
                    </tr>
                    <tr>
                      <th scope="row">CPU 型号</th>
                      <td>{{ systemData.cpu.model }}</td>
                    </tr>
                    <tr>
                      <th scope="row">CPU 核心</th>
                      <td>{{ systemData.cpu.cores }} 核心 / {{ systemData.cpu.speed }} MHz</td>
                    </tr>
                    <tr>
                      <th scope="row">总内存</th>
                      <td>{{ formatBytes(systemData.memory.total) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 网络信息 -->
      <div class="col-md-6 mb-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0"><i class="bi bi-vignette me-2"></i>网络信息</h5>
          </div>
          <div class="card-body p-0" style="height: 500px">
            <div class="p-3">
              <div v-if="systemData">
                <!-- 实时网速显示 -->
                <div class="mb-3">
                  <div class="d-flex justify-content-between mb-2">
                    <div>
                      <span class="badge bg-success me-1">↓</span>
                      <span>下载速度</span>
                    </div>
                    <span class="fw-bold"
                      >{{ formatBytes(systemData.network.stats.rx_sec) }}/s</span
                    >
                  </div>
                  <div class="d-flex justify-content-between mb-3">
                    <div>
                      <span class="badge bg-primary me-1">↑</span>
                      <span>上传速度</span>
                    </div>
                    <span class="fw-bold"
                      >{{ formatBytes(systemData.network.stats.tx_sec) }}/s</span
                    >
                  </div>
                </div>

                <!-- 网速变化图表 -->
                <div class="mb-3">
                  <h6 class="mb-2">网速变化趋势</h6>
                  <div ref="networkChartRef" style="height: 200px"></div>
                </div>
              </div>
              <div v-else class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 虚拟机资源分配 -->
      <div class="col-md-6 mb-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0"><i class="bi bi-pie-chart me-2"></i>资源分配</h5>
          </div>
          <div class="card-body p-0" style="height: 400px; overflow-y: auto">
            <div class="p-3">
              <div v-if="systemData">
                <div class="mb-4">
                  <div class="d-flex justify-content-between mb-2">
                    <span>CPU 分配率</span>
                    <span class="fw-bold">{{ calculateCpuAllocationPercentage() }}%</span>
                  </div>
                  <div class="progress mb-1" style="height: 10px">
                    <div
                      class="progress-bar bg-primary"
                      role="progressbar"
                      :style="`width: ${calculateCpuAllocationPercentage()}%`"
                      :aria-valuenow="calculateCpuAllocationPercentage()"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <div class="small text-muted">
                    已分配 {{ systemData.qemu.cpuAllocation }} 核心，共
                    {{ systemData.cpu.cores }} 核心
                  </div>
                </div>

                <div class="mb-4">
                  <div class="d-flex justify-content-between mb-2">
                    <span>内存分配率</span>
                    <span class="fw-bold">{{ calculateMemoryAllocationPercentage() }}%</span>
                  </div>
                  <div class="progress mb-1" style="height: 10px">
                    <div
                      class="progress-bar bg-success"
                      role="progressbar"
                      :style="`width: ${calculateMemoryAllocationPercentage()}%`"
                      :aria-valuenow="calculateMemoryAllocationPercentage()"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                  <div class="small text-muted">
                    已分配 {{ formatBytes(systemData.qemu.memoryAllocation * 1024 * 1024) }}，共
                    {{ formatBytes(systemData.memory.total) }}
                  </div>
                </div>

                <div class="alert alert-info small mb-0">
                  <i class="bi bi-info-circle me-2"></i>
                  <span v-if="systemData.qemu.runningVMs > 0">
                    当前有 {{ systemData.qemu.runningVMs }} 台虚拟机正在运行，占用了
                    {{ calculateCpuAllocationPercentage() }}% 的 CPU 资源和
                    {{ calculateMemoryAllocationPercentage() }}% 的内存资源。
                  </span>
                  <span v-else> 当前没有运行中的虚拟机。系统资源空闲。 </span>
                </div>
              </div>
              <div v-else class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 磁盘使用情况 -->
      <div class="col-md-6 mb-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0"><i class="bi bi-hdd-stack me-2"></i>磁盘使用情况</h5>
          </div>
          <div class="card-body p-0" style="height: 400px; overflow-y: auto">
            <div class="p-3">
              <div v-if="systemData">
                <div class="mb-3">
                  <div class="d-flex justify-content-between mb-2">
                    <span>磁盘使用率</span>
                    <span class="fw-bold">{{ systemData.disk.usagePercentage }}%</span>
                  </div>
                  <div class="progress mb-1" style="height: 15px">
                    <div
                      class="progress-bar"
                      role="progressbar"
                      :style="`width: ${systemData.disk.usagePercentage}%`"
                      :class="getDiskBarClass(systemData.disk.usagePercentage)"
                      :aria-valuenow="systemData.disk.usagePercentage"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>

                <div class="row mt-4">
                  <div class="col-md-4 text-center">
                    <div class="h4 mb-0">{{ formatBytes(systemData.disk.total) }}</div>
                    <div class="small text-muted">总容量</div>
                  </div>
                  <div class="col-md-4 text-center">
                    <div class="h4 mb-0">{{ formatBytes(systemData.disk.used) }}</div>
                    <div class="small text-muted">已使用</div>
                  </div>
                  <div class="col-md-4 text-center">
                    <div class="h4 mb-0">{{ formatBytes(systemData.disk.free) }}</div>
                    <div class="small text-muted">可用空间</div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import {
    ref,
    computed,
    onMounted,
    onUnmounted,
    watch,
    nextTick,
    onBeforeUnmount,
    reactive,
  } from 'vue'
  import websocketService, { WebSocketService } from '../services/websocketService'
  import * as echarts from 'echarts'

  const wsService = websocketService
  const systemData = computed(() => wsService.systemData.value)
  // 响应式数据
  const networkChartRef = ref(null)
  const networkChart: any = ref(null)
  const maxDataPoints = ref(30) // 最多保留30个数据点

  const networkSpeedData: any = reactive({
    timestamps: [],
    downloadSpeeds: [],
    uploadSpeeds: [],
  })

  // 监听系统数据变化，更新图表
  watch(
    () => systemData.value?.network?.stats,
    newStats => {
      console.log('Network stats updated:', newStats)
      if (newStats) {
        updateNetworkChart(newStats)
      }
    },
    { deep: true }
  )

  // 初始化网络图表
  const initNetworkChart = async () => {
    if (networkChartRef.value) {
      networkChart.value = echarts.init(networkChartRef.value)

      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: (params: any[]) => {
            console.log('params', params)
            let result = `时间: ${params[0].axisValue}<br/>`
            params.forEach(param => {
              result += `${param.seriesName}: ${formatBytes(param.value)}/s<br/>`
            })
            return result
          },
        },
        legend: {
          data: ['下载速度', '上传速度'],
          textStyle: {
            fontSize: 12,
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: [],
          axisLabel: {
            fontSize: 10,
            formatter: (value: string) => {
              return value.split(' ')[1] // 只显示时间部分
            },
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            fontSize: 10,
            formatter: (value: any) => {
              return formatBytes(value) + '/s'
            },
          },
        },
        series: [
          {
            name: '下载速度',
            type: 'line',
            data: [],
            smooth: true,
            symbol: 'circle',
            symbolSize: 4,
            lineStyle: {
              color: '#28a745',
              width: 2,
            },
            itemStyle: {
              color: '#28a745',
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(40, 167, 69, 0.3)',
                  },
                  {
                    offset: 1,
                    color: 'rgba(40, 167, 69, 0.1)',
                  },
                ],
              },
            },
          },
          {
            name: '上传速度',
            type: 'line',
            data: [],
            smooth: true,
            symbol: 'circle',
            symbolSize: 4,
            lineStyle: {
              color: '#007bff',
              width: 2,
            },
            itemStyle: {
              color: '#007bff',
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(0, 123, 255, 0.3)',
                  },
                  {
                    offset: 1,
                    color: 'rgba(0, 123, 255, 0.1)',
                  },
                ],
              },
            },
          },
        ],
      }

      networkChart.value.setOption(option)

      // 监听窗口大小变化
      const handleResize = () => {
        if (networkChart.value) {
          networkChart.value.resize()
        }
      }

      window.addEventListener('resize', handleResize)

      // 返回清理函数
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }

  // 更新网络图表数据
  const updateNetworkChart = (stats: any) => {
    if (!networkChart.value) return

    const now = new Date()
    const timeStr: any = now.toLocaleTimeString()

    // 添加新数据点
    networkSpeedData.timestamps.push(timeStr)
    networkSpeedData.downloadSpeeds.push(stats.rx_sec)
    networkSpeedData.uploadSpeeds.push(stats.tx_sec)

    // 限制数据点数量
    if (networkSpeedData.timestamps.length > maxDataPoints.value) {
      networkSpeedData.timestamps.shift()
      networkSpeedData.downloadSpeeds.shift()
      networkSpeedData.uploadSpeeds.shift()
    }

    // 更新图表
    networkChart.value.setOption({
      xAxis: {
        data: networkSpeedData.timestamps,
      },
      series: [
        {
          data: networkSpeedData.downloadSpeeds,
        },
        {
          data: networkSpeedData.uploadSpeeds,
        },
      ],
    })
  }

  // 格式化字节数
  // const formatBytes = (bytes: any) => {
  //   if (!bytes || bytes === 0) return '0 B'

  //   const k = 1024
  //   const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  //   const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k))

  //   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  // }

  onBeforeUnmount(() => {
    if (networkChart.value) {
      networkChart.value.dispose()
    }
  })

  // 在组件挂载时连接 WebSocket
  onMounted(() => {
    wsService.connect()
    nextTick(() => {
      initNetworkChart()
    })
  })

  // // 在组件卸载时断开 WebSocket
  // onUnmounted(() => {
  //   wsService.disconnect();
  // });

  // 重新连接 WebSocket
  const reconnect = () => {
    wsService.connect()
  }

  // 格式化字节数
  const formatBytes = (bytes: number) => {
    return WebSocketService.formatBytes(bytes)
  }

  // 格式化运行时间
  const formatUptime = (seconds: number) => {
    return WebSocketService.formatUptime(seconds)
  }

  // 获取 CPU 使用率进度条的样式类
  const getCpuBarClass = (usage: number) => {
    if (usage < 60) return 'bg-success'
    if (usage < 85) return 'bg-warning'
    return 'bg-danger'
  }

  // 获取磁盘使用率进度条的样式类
  const getDiskBarClass = (usage: number) => {
    if (usage < 70) return 'bg-info'
    if (usage < 90) return 'bg-warning'
    return 'bg-danger'
  }

  // 计算 CPU 分配百分比
  const calculateCpuAllocationPercentage = () => {
    if (!systemData.value) return 0
    const { cpuAllocation } = systemData.value.qemu
    const { cores } = systemData.value.cpu
    return Math.min(Math.round((cpuAllocation / cores) * 100), 100)
  }

  // 计算内存分配百分比
  const calculateMemoryAllocationPercentage = () => {
    if (!systemData.value) return 0
    const memoryAllocationBytes = systemData.value.qemu.memoryAllocation * 1024 * 1024
    const { total } = systemData.value.memory
    return Math.min(Math.round((memoryAllocationBytes / total) * 100), 100)
  }
</script>

<style scoped>
  /* 整体容器优化 */
  .dashboard {
    /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
    min-height: 100vh;
    padding: 2rem 1rem;
    position: relative;
  }

  .dashboard::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    pointer-events: none;
  }

  /* 页面标题优化 */
  h1 {
    /* background: linear-gradient(135deg, #ffffff, #f8f9fa); */
    background: var(--bs-black);
    -webkit-background-clip: text;
    background-clip: text;
    font-weight: 800;
    font-size: 2.5rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem !important;
    position: relative;
    z-index: 1;
  }

  h1::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 60px;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
  }

  /* 警告提示优化 */
  .alert {
    border: none;
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 1;
  }

  .alert-warning {
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.9), rgba(255, 154, 0, 0.8));
    color: #856404;
  }

  .alert-danger {
    background: linear-gradient(135deg, rgba(220, 53, 69, 0.9), rgba(255, 0, 0, 0.8));
    color: #721c24;
  }

  .alert .btn {
    border-radius: 20px;
    padding: 0.5rem 1rem;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .alert .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  /* 卡片组件全面优化 */
  .card {
    border: none !important;
    border-radius: 20px !important;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 249, 250, 0.9));
    backdrop-filter: blur(15px);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1) !important;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
    position: relative;
  }

  /* .card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  } */

  .card:hover::before {
    transform: scaleX(1);
  }

  .card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
  }

  /* 卡片标题优化 */
  .card-title {
    font-weight: 700 !important;
    font-size: 1.1rem;
    margin-bottom: 1rem !important;
    display: flex;
    align-items: center;
  }

  .card-title.text-primary {
    background: linear-gradient(135deg, #007bff, #0056b3);
    -webkit-background-clip: text;
    background-clip: text;
  }

  .card-title.text-success {
    background: linear-gradient(135deg, #28a745, #20c997);
    -webkit-background-clip: text;
    background-clip: text;
  }

  .card-title.text-info {
    background: linear-gradient(135deg, #17a2b8, #20c997);
    -webkit-background-clip: text;
    background-clip: text;
  }

  .card-title.text-warning {
    background: linear-gradient(135deg, #ffc107, #fd7e14);
    -webkit-background-clip: text;
    background-clip: text;
  }

  /* 卡片头部优化 */
  .card-header {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef) !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
    border-radius: 20px 20px 0 0 !important;
    padding: 1.5rem 2rem 1rem !important;
  }

  .card-header .card-title {
    margin-bottom: 0 !important;
    font-size: 1.2rem;
    color: #2c3e50;
  }

  /* 卡片内容区域优化 */
  .card-body {
    padding: 2rem !important;
  }

  /* 进度条优化 */
  .progress {
    border-radius: 10px !important;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef) !important;
    height: 12px !important;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .progress-bar {
    border-radius: 10px !important;
    background: linear-gradient(135deg, currentColor, currentColor) !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    position: relative;
    overflow: hidden;
  }

  .progress-bar::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: progressShine 2s infinite;
  }

  @keyframes progressShine {
    0% {
      left: -100%;
    }

    100% {
      left: 100%;
    }
  }

  .bg-success {
    background: linear-gradient(135deg, #28a745, #20c997) !important;
  }

  .bg-warning {
    background: linear-gradient(135deg, #ffc107, #fd7e14) !important;
  }

  .bg-danger {
    background: linear-gradient(135deg, #dc3545, #c82333) !important;
  }

  .bg-info {
    background: linear-gradient(135deg, #17a2b8, #20c997) !important;
  }

  .bg-primary {
    background: linear-gradient(135deg, #007bff, #0056b3) !important;
  }

  /* 数据显示优化 */
  .fw-bold {
    font-weight: 700 !important;
    color: #2c3e50;
    font-size: 1.1rem;
  }

  .h4 {
    color: #2c3e50 !important;
    font-weight: 700 !important;
  }

  /* 表格优化 */
  .table {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  }

  .table th {
    font-weight: 700 !important;
    color: #2c3e50 !important;
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    border-top: none !important;
    padding: 1rem !important;
  }

  .table td {
    padding: 0.75rem 1rem !important;
    vertical-align: middle;
    border-top: 1px solid rgba(0, 0, 0, 0.05) !important;
  }

  .table-hover tbody tr:hover {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
    transform: scale(1.01);
    transition: all 0.2s ease;
  }

  /* 徽章优化 */
  .badge {
    padding: 0.5em 0.75em !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .badge.bg-success {
    background: linear-gradient(135deg, #28a745, #20c997) !important;
  }

  .badge.bg-primary {
    background: linear-gradient(135deg, #007bff, #0056b3) !important;
  }

  /* 图标优化 */
  .bi {
    filter: drop-shadow(0 0 2px rgba(102, 126, 234, 0.3));
    transition: all 0.3s ease;
  }

  .card:hover .bi {
    transform: scale(1.1);
  }

  /* 加载动画优化 */
  .spinner-border {
    border-width: 3px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  /* 信息提示优化 */
  .alert-info {
    background: linear-gradient(135deg, rgba(23, 162, 184, 0.1), rgba(32, 201, 151, 0.1));
    border: 1px solid rgba(23, 162, 184, 0.2);
    border-radius: 12px;
    padding: 1.5rem;
  }

  /* 滚动条优化 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #5a6fd8, #6b5b95);
  }

  /* 响应式优化 */
  @media (max-width: 768px) {
    .dashboard {
      padding: 1rem 0.5rem;
    }

    h1 {
      font-size: 2rem;
      text-align: center;
    }

    h1::after {
      left: 50%;
      transform: translateX(-50%);
    }

    .card-body {
      padding: 1.5rem !important;
    }

    .card-header {
      padding: 1rem 1.5rem 0.5rem !important;
    }

    .col-md-3,
    .col-md-6 {
      margin-bottom: 1rem;
    }
  }

  /* 深色主题适配 */
  @media (prefers-color-scheme: dark) {
    .dashboard {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    }

    .card {
      background: linear-gradient(135deg, rgba(33, 37, 41, 0.95), rgba(52, 58, 64, 0.9));
    }

    .card-header {
      background: linear-gradient(135deg, #2d2d2d, #3d3d3d) !important;
    }

    .fw-bold,
    .h4 {
      color: #f8f9fa !important;
    }

    .table {
      background: rgba(33, 37, 41, 0.8);
    }

    .table th {
      background: linear-gradient(135deg, #2d2d2d, #3d3d3d);
      color: #f8f9fa !important;
    }

    .table td {
      color: #f8f9fa;
      border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
    }
  }

  /* 页面进入动画 */
  .dashboard {
    animation: fadeInUp 0.8s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 卡片逐个出现动画 */
  .col-md-3:nth-child(1) .card,
  .col-md-6:nth-child(1) .card {
    animation: slideInUp 0.6s ease-out 0.1s both;
  }

  .col-md-3:nth-child(2) .card,
  .col-md-6:nth-child(2) .card {
    animation: slideInUp 0.6s ease-out 0.2s both;
  }

  .col-md-3:nth-child(3) .card,
  .col-md-6:nth-child(3) .card {
    animation: slideInUp 0.6s ease-out 0.3s both;
  }

  .col-md-3:nth-child(4) .card,
  .col-md-6:nth-child(4) .card {
    animation: slideInUp 0.6s ease-out 0.4s both;
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(50px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 统计数字动画 */
  .fw-bold,
  .h4 {
    animation: countUp 1s ease-out 0.5s both;
  }

  @keyframes countUp {
    from {
      opacity: 0;
      transform: scale(0.8);
    }

    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* 图表容器优化 */
  div[ref='networkChartRef'] {
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
    padding: 1rem;
    margin: 1rem 0;
  }

  /* 网络状态指示器 */
  .card-title .bi-diagram-3::before {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    background: #28a745;
    border-radius: 50%;
    top: 0;
    right: -12px;
    animation: networkPulse 2s infinite;
  }

  @keyframes networkPulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }

    50% {
      opacity: 0.5;
      transform: scale(1.2);
    }
  }

  /* 系统状态指示器 */
  .dashboard::after {
    content: '';
    position: absolute;
    top: 20px;
    right: 20px;
    width: 12px;
    height: 12px;
    background: #28a745;
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(40, 167, 69, 0.5);
    animation: systemStatus 3s infinite;
    z-index: 1000;
  }

  @keyframes systemStatus {
    0%,
    100% {
      opacity: 1;
    }

    50% {
      opacity: 0.3;
    }
  }

  /* 悬停时的数据高亮效果 */
  .card:hover .fw-bold {
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    background-clip: text;
    transform: scale(1.05);
    transition: all 0.3s ease;
  }

  /* 表格行悬停优化 */
  .table tbody tr {
    transition: all 0.2s ease;
  }

  .table tbody tr:hover {
    background: linear-gradient(
      135deg,
      rgba(102, 126, 234, 0.1),
      rgba(118, 75, 162, 0.05)
    ) !important;
    transform: translateX(5px);
    box-shadow: 4px 0 12px rgba(102, 126, 234, 0.1);
  }

  /* 小文本优化 */
  .small,
  .text-muted {
    color: #6c757d !important;
    font-weight: 500;
  }

  /* 分隔线优化 */
  hr {
    border: none;
    height: 2px;
    background: linear-gradient(90deg, transparent, #667eea, transparent);
    margin: 2rem 0;
  }

  /* 数据更新闪烁效果 */
  @keyframes dataUpdate {
    0%,
    100% {
      background-color: transparent;
    }

    50% {
      background-color: rgba(102, 126, 234, 0.1);
    }
  }

  .data-updated {
    animation: dataUpdate 0.5s ease-in-out;
  }

  /* 连接状态优化 */
  .alert .bi-exclamation-triangle,
  .alert .bi-x-circle {
    font-size: 1.2rem;
    margin-right: 0.5rem;
    vertical-align: middle;
  }

  /* 按钮在警告框中的优化 */
  .alert .btn-outline-dark {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(0, 0, 0, 0.3);
    color: #495057;
    backdrop-filter: blur(5px);
  }

  .alert .btn-outline-dark:hover {
    background: rgba(255, 255, 255, 0.4);
    border-color: rgba(0, 0, 0, 0.5);
    color: #212529;
  }

  /* 性能优化：减少重绘 */
  .card,
  .progress-bar,
  .btn {
    will-change: transform;
  }

  /* 打印样式优化 */
  @media print {
    .dashboard {
      background: white !important;
      color: black !important;
    }

    .card {
      background: white !important;
      box-shadow: none !important;
      border: 1px solid #dee2e6 !important;
    }

    .progress-bar {
      background: #6c757d !important;
    }

    .btn {
      display: none;
    }
  }
</style>
