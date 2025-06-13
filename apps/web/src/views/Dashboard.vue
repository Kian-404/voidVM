<template>
  <div class="dashboard">
    <h1 class="mb-4">系统控制台</h1>

    <!-- 连接状态提示 -->
    <div v-if="!wsService.connected.value" class="alert alert-warning">
      <i class="bi bi-exclamation-triangle me-2"></i>
      正在连接到服务器...
      <button @click="reconnect" class="btn btn-sm btn-outline-dark ms-2">
        重新连接
      </button>
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
            <h5 class="card-title text-primary">
              <i class="bi bi-cpu me-2"></i>CPU
            </h5>
            <div v-if="systemData">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span>使用率</span>
                <span class="fw-bold">{{ systemData.cpu.usage }}%</span>
              </div>
              <div class="progress mb-3" style="height: 10px">
                <div class="progress-bar" role="progressbar" :style="`width: ${systemData.cpu.usage}%`"
                  :class="getCpuBarClass(systemData.cpu.usage)" :aria-valuenow="systemData.cpu.usage" aria-valuemin="0"
                  aria-valuemax="100"></div>
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
            <h5 class="card-title text-success">
              <i class="bi bi-memory me-2"></i>内存
            </h5>
            <div v-if="systemData">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span>使用率</span>
                <span class="fw-bold">{{ systemData.memory.usagePercentage }}%</span>
              </div>
              <div class="progress mb-3" style="height: 10px">
                <div class="progress-bar bg-success" role="progressbar"
                  :style="`width: ${systemData.memory.usagePercentage}%`"
                  :aria-valuenow="systemData.memory.usagePercentage" aria-valuemin="0" aria-valuemax="100"></div>
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
            <h5 class="card-title text-info">
              <i class="bi bi-hdd me-2"></i>磁盘
            </h5>
            <div v-if="systemData">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span>使用率</span>
                <span class="fw-bold">{{ systemData.disk.usagePercentage }}%</span>
              </div>
              <div class="progress mb-3" style="height: 10px">
                <div class="progress-bar bg-info" role="progressbar"
                  :style="`width: ${systemData.disk.usagePercentage}%`" :aria-valuenow="systemData.disk.usagePercentage"
                  aria-valuemin="0" aria-valuemax="100"></div>
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
            <h5 class="card-title text-warning">
              <i class="bi bi-pc-display me-2"></i>虚拟机
            </h5>
            <div v-if="systemData">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span>运行中</span>
                <span class="fw-bold">{{ systemData.qemu.runningVMs }} / {{ systemData.qemu.totalVMs }}</span>
              </div>
              <div class="progress mb-3" style="height: 10px">
                <div class="progress-bar bg-warning" role="progressbar"
                  :style="`width: ${systemData.qemu.totalVMs ? (systemData.qemu.runningVMs / systemData.qemu.totalVMs * 100) : 0}%`"
                  :aria-valuenow="systemData.qemu.runningVMs" aria-valuemin="0"
                  :aria-valuemax="systemData.qemu.totalVMs"></div>
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
            <h5 class="card-title mb-0">
              <i class="bi bi-info-circle me-2"></i>系统信息
            </h5>
          </div>
          <div class="card-body p-0" style="height: 400px; overflow-y: auto;">
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
      <!-- <div class="col-md-6 mb-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-diagram-3 me-2"></i>网络信息
            </h5>
          </div>
          <div class="card-body p-0" style="height: 400px; overflow-y: auto;">
            <div class="p-3">
              <div v-if="systemData">
                <div class="mb-3">
                  <div class="d-flex justify-content-between mb-2">
                    <div>
                      <span class="badge bg-success me-1">↓</span>
                      <span>下载速度</span>
                    </div>
                    <span class="fw-bold">{{ formatBytes(systemData.network.stats.rx_sec) }}/s</span>
                  </div>
                  <div class="d-flex justify-content-between mb-3">
                    <div>
                      <span class="badge bg-primary me-1">↑</span>
                      <span>上传速度</span>
                    </div>
                    <span class="fw-bold">{{ formatBytes(systemData.network.stats.tx_sec) }}/s</span>
                  </div>
                  <div class="d-flex justify-content-between small text-muted">
                    <span>总接收</span>
                    <span>{{ formatBytes(systemData.network.stats.rx_bytes) }}</span>
                  </div>
                  <div class="d-flex justify-content-between small text-muted">
                    <span>总发送</span>
                    <span>{{ formatBytes(systemData.network.stats.tx_bytes) }}</span>
                  </div>
                </div>

                <h6 class="mt-4 mb-3">网络接口</h6>
                <div class="table-responsive">
                  <table class="table table-sm table-hover mb-0">
                    <thead>
                      <tr>
                        <th>接口名</th>
                        <th>IP 地址</th>
                        <th>MAC 地址</th>
                        <th>类型</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="iface in systemData.network.interfaces" :key="iface.name">
                        <td>{{ iface.name }}</td>
                        <td>{{ iface.ip || '-' }}</td>
                        <td>{{ iface.mac }}</td>
                        <td>{{ iface.type }}</td>
                      </tr>
                    </tbody>
                  </table>
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
      </div> -->

      <!-- 网络信息 -->
      <div class="col-md-6 mb-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-white">
            <h5 class="card-title mb-0">
              <i class="bi bi-diagram-3 me-2"></i>网络信息
            </h5>
          </div>
          <div class="card-body p-0" style="height: 500px;">
            <div class="p-3">
              <div v-if="systemData">
                <!-- 实时网速显示 -->
                <div class="mb-3">
                  <div class="d-flex justify-content-between mb-2">
                    <div>
                      <span class="badge bg-success me-1">↓</span>
                      <span>下载速度</span>
                    </div>
                    <span class="fw-bold">{{ formatBytes(systemData.network.stats.rx_sec) }}/s</span>
                  </div>
                  <div class="d-flex justify-content-between mb-3">
                    <div>
                      <span class="badge bg-primary me-1">↑</span>
                      <span>上传速度</span>
                    </div>
                    <span class="fw-bold">{{ formatBytes(systemData.network.stats.tx_sec) }}/s</span>
                  </div>
                </div>

                <!-- 网速变化图表 -->
                <div class="mb-3">
                  <h6 class="mb-2">网速变化趋势</h6>
                  <div ref="networkChartRef" style="height: 200px;"></div>
                </div>

                <!-- 有效网络接口表格 -->
                <h6 class="mb-3">网络接口</h6>
                <div class="table-responsive" style="max-height: 120px; overflow-y: auto;">
                  <table class="table table-sm table-hover mb-0">
                    <thead class="sticky-top bg-white">
                      <tr>
                        <th>接口名</th>
                        <th>IP 地址</th>
                        <th>MAC 地址</th>
                        <th>类型</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="iface in validNetworkInterfaces" :key="iface.name">
                        <td>{{ iface.name }}</td>
                        <td>{{ iface.ip }}</td>
                        <td>{{ iface.mac }}</td>
                        <td>{{ iface.type }}</td>
                      </tr>
                    </tbody>
                  </table>
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
            <h5 class="card-title mb-0">
              <i class="bi bi-pie-chart me-2"></i>资源分配
            </h5>
          </div>
          <div class="card-body p-0" style="height: 400px; overflow-y: auto;">
            <div class="p-3">
              <div v-if="systemData">
                <div class="mb-4">
                  <div class="d-flex justify-content-between mb-2">
                    <span>CPU 分配率</span>
                    <span class="fw-bold">{{ calculateCpuAllocationPercentage() }}%</span>
                  </div>
                  <div class="progress mb-1" style="height: 10px">
                    <div class="progress-bar bg-primary" role="progressbar"
                      :style="`width: ${calculateCpuAllocationPercentage()}%`"
                      :aria-valuenow="calculateCpuAllocationPercentage()" aria-valuemin="0" aria-valuemax="100"></div>
                  </div>
                  <div class="small text-muted">
                    已分配 {{ systemData.qemu.cpuAllocation }} 核心，共 {{ systemData.cpu.cores }} 核心
                  </div>
                </div>

                <div class="mb-4">
                  <div class="d-flex justify-content-between mb-2">
                    <span>内存分配率</span>
                    <span class="fw-bold">{{ calculateMemoryAllocationPercentage() }}%</span>
                  </div>
                  <div class="progress mb-1" style="height: 10px">
                    <div class="progress-bar bg-success" role="progressbar"
                      :style="`width: ${calculateMemoryAllocationPercentage()}%`"
                      :aria-valuenow="calculateMemoryAllocationPercentage()" aria-valuemin="0" aria-valuemax="100">
                    </div>
                  </div>
                  <div class="small text-muted">
                    已分配 {{ formatBytes(systemData.qemu.memoryAllocation * 1024 * 1024) }}，共 {{
                      formatBytes(systemData.memory.total) }}
                  </div>
                </div>

                <div class="alert alert-info small mb-0">
                  <i class="bi bi-info-circle me-2"></i>
                  <span v-if="systemData.qemu.runningVMs > 0">
                    当前有 {{ systemData.qemu.runningVMs }} 台虚拟机正在运行，占用了 {{ calculateCpuAllocationPercentage() }}% 的 CPU
                    资源和
                    {{ calculateMemoryAllocationPercentage() }}% 的内存资源。
                  </span>
                  <span v-else>
                    当前没有运行中的虚拟机。系统资源空闲。
                  </span>
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
            <h5 class="card-title mb-0">
              <i class="bi bi-hdd-stack me-2"></i>磁盘使用情况
            </h5>
          </div>
          <div class="card-body p-0" style="height: 400px; overflow-y: auto;">
            <div class="p-3">
              <div v-if="systemData">
                <div class="mb-3">
                  <div class="d-flex justify-content-between mb-2">
                    <span>磁盘使用率</span>
                    <span class="fw-bold">{{ systemData.disk.usagePercentage }}%</span>
                  </div>
                  <div class="progress mb-1" style="height: 15px">
                    <div class="progress-bar" role="progressbar" :style="`width: ${systemData.disk.usagePercentage}%`"
                      :class="getDiskBarClass(systemData.disk.usagePercentage)"
                      :aria-valuenow="systemData.disk.usagePercentage" aria-valuemin="0" aria-valuemax="100"></div>
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
import { ref, computed, onMounted, onUnmounted, watch, nextTick, onBeforeUnmount, reactive } from 'vue';
import websocketService, { WebSocketService } from '../services/websocketService';
import * as echarts from 'echarts';


const wsService = websocketService;
const systemData = computed(() => wsService.systemData.value);
// 响应式数据
const networkChartRef = ref(null)
const networkChart: any = ref(null)
const maxDataPoints = ref(30) // 最多保留30个数据点

const networkSpeedData: any = reactive({
  timestamps: [],
  downloadSpeeds: [],
  uploadSpeeds: []
})

const validNetworkInterfaces = computed(() => {
  if (!systemData.value?.network?.interfaces) return []
  return systemData.value.network.interfaces.filter(iface => 
    iface.ip && iface.ip.trim() !== '' && iface.ip !== '-'
  )
})

// 监听系统数据变化，更新图表
watch(() => systemData.value?.network?.stats, (newStats) => {
  console.log('Network stats updated:', newStats)
  if (newStats) {
    updateNetworkChart(newStats)
  }
}, { deep: true })

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
        }
      },
      legend: {
        data: ['下载速度', '上传速度'],
        textStyle: {
          fontSize: 12
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: [],
        axisLabel: {
          fontSize: 10,
          formatter: (value: string) => {
            return value.split(' ')[1] // 只显示时间部分
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 10,
          formatter: (value: any) => {
            return formatBytes(value) + '/s'
          }
        }
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
            width: 2
          },
          itemStyle: {
            color: '#28a745'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(40, 167, 69, 0.3)'
              }, {
                offset: 1, color: 'rgba(40, 167, 69, 0.1)'
              }]
            }
          }
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
            width: 2
          },
          itemStyle: {
            color: '#007bff'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(0, 123, 255, 0.3)'
              }, {
                offset: 1, color: 'rgba(0, 123, 255, 0.1)'
              }]
            }
          }
        }
      ]
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
      data: networkSpeedData.timestamps
    },
    series: [
      {
        data: networkSpeedData.downloadSpeeds
      },
      {
        data: networkSpeedData.uploadSpeeds
      }
    ]
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
  wsService.connect();
  nextTick(() => {
    initNetworkChart()

  })

});

// // 在组件卸载时断开 WebSocket
// onUnmounted(() => {
//   wsService.disconnect();
// });

// 重新连接 WebSocket
const reconnect = () => {
  wsService.connect();
};

// 格式化字节数
const formatBytes = (bytes: number) => {
  return WebSocketService.formatBytes(bytes);
};

// 格式化运行时间
const formatUptime = (seconds: number) => {
  return WebSocketService.formatUptime(seconds);
};

// 获取 CPU 使用率进度条的样式类
const getCpuBarClass = (usage: number) => {
  if (usage < 60) return 'bg-success';
  if (usage < 85) return 'bg-warning';
  return 'bg-danger';
};

// 获取磁盘使用率进度条的样式类
const getDiskBarClass = (usage: number) => {
  if (usage < 70) return 'bg-info';
  if (usage < 90) return 'bg-warning';
  return 'bg-danger';
};

// 计算 CPU 分配百分比
const calculateCpuAllocationPercentage = () => {
  if (!systemData.value) return 0;
  const { cpuAllocation } = systemData.value.qemu;
  const { cores } = systemData.value.cpu;
  return Math.min(Math.round((cpuAllocation / cores) * 100), 100);
};

// 计算内存分配百分比
const calculateMemoryAllocationPercentage = () => {
  if (!systemData.value) return 0;
  const memoryAllocationBytes = systemData.value.qemu.memoryAllocation * 1024 * 1024;
  const { total } = systemData.value.memory;
  return Math.min(Math.round((memoryAllocationBytes / total) * 100), 100);
};

</script>

<style scoped>
.card {
  transition: box-shadow 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.progress {
  border-radius: 0.5rem;
  background-color: #f0f0f0;
}

.progress-bar {
  border-radius: 0.5rem;
}

.table th {
  font-weight: 600;
  color: #555;
}

.badge {
  padding: 0.25em 0.5em;
}

.table thead th {
  border-top: none;
  font-weight: 600;
  font-size: 0.875rem;
}

.table-responsive {
  border-radius: 0.375rem;
}

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}
</style>
