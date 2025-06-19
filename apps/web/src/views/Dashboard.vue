<template>
  <div class="container-fluid py-4">
    <div class="row">
      <div class="col">
        <h1 class="display-6 mb-4 fw-bold text-primary">
          <i class="bi bi-speedometer2 me-3"></i>系统控制台
        </h1>

        <!-- 连接状态提示 -->
        <div v-if="!wsService.connected.value" class="alert alert-warning d-flex align-items-center mb-4" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          <div class="flex-grow-1">正在连接到服务器...</div>
          <button @click="reconnect" class="btn btn-sm btn-outline-warning ms-3">
            <i class="bi bi-arrow-clockwise me-1"></i>重新连接
          </button>
        </div>

        <div v-if="wsService.error.value" class="alert alert-danger d-flex align-items-center mb-4" role="alert">
          <i class="bi bi-exclamation-circle-fill me-2"></i>
          <div>{{ wsService.error.value }}</div>
        </div>

        <!-- 系统概览卡片 -->
        <div class="row g-4 mb-5">
          <!-- CPU 卡片 -->
          <div class="col-xl-3 col-lg-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-4">
                <div class="d-flex align-items-center mb-3">
                  <div class="p-2 bg-primary bg-opacity-10 rounded-circle me-3">
                    <i class="bi bi-cpu-fill text-primary fs-4"></i>
                  </div>
                  <div>
                    <h5 class="card-title mb-0 fw-semibold">CPU</h5>
                    <small class="text-muted">处理器使用率</small>
                  </div>
                </div>

                <div v-if="systemData" class="mt-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-muted">使用率</span>
                    <span class="fw-bold fs-5">{{ systemData.cpu.usage }}%</span>
                  </div>
                  <div class="progress mb-3" style="height: 8px;">
                    <div class="progress-bar rounded-pill"
                         :style="`width: ${systemData.cpu.usage}%`"
                         :class="getCpuBarClass(systemData.cpu.usage)"
                         role="progressbar"
                         :aria-valuenow="systemData.cpu.usage"
                         aria-valuemin="0"
                         aria-valuemax="100">
                    </div>
                  </div>
                  <div class="small text-muted lh-sm">
                    <div class="mb-1">{{ systemData.cpu.model }}</div>
                    <div>{{ systemData.cpu.cores }} 核心 / {{ systemData.cpu.speed }} MHz</div>
                  </div>
                </div>

                <div v-else class="text-center py-5">
                  <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 内存卡片 -->
          <div class="col-xl-3 col-lg-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-4">
                <div class="d-flex align-items-center mb-3">
                  <div class="p-2 bg-success bg-opacity-10 rounded-circle me-3">
                    <i class="bi bi-memory text-success fs-4"></i>
                  </div>
                  <div>
                    <h5 class="card-title mb-0 fw-semibold">内存</h5>
                    <small class="text-muted">内存使用率</small>
                  </div>
                </div>

                <div v-if="systemData" class="mt-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-muted">使用率</span>
                    <span class="fw-bold fs-5">{{ systemData.memory.usagePercentage }}%</span>
                  </div>
                  <div class="progress mb-3" style="height: 8px;">
                    <div class="progress-bar bg-success rounded-pill"
                         :style="`width: ${systemData.memory.usagePercentage}%`"
                         role="progressbar"
                         :aria-valuenow="systemData.memory.usagePercentage"
                         aria-valuemin="0"
                         aria-valuemax="100">
                    </div>
                  </div>
                  <div class="small text-muted lh-sm">
                    <div class="d-flex justify-content-between mb-1">
                      <span>已用</span>
                      <span>{{ formatBytes(systemData.memory.used) }}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                      <span>总计</span>
                      <span>{{ formatBytes(systemData.memory.total) }}</span>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-5">
                  <div class="spinner-border spinner-border-sm text-success" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 磁盘卡片 -->
          <div class="col-xl-3 col-lg-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-4">
                <div class="d-flex align-items-center mb-3">
                  <div class="p-2 bg-info bg-opacity-10 rounded-circle me-3">
                    <i class="bi bi-hdd-fill text-info fs-4"></i>
                  </div>
                  <div>
                    <h5 class="card-title mb-0 fw-semibold">磁盘</h5>
                    <small class="text-muted">存储使用率</small>
                  </div>
                </div>

                <div v-if="systemData" class="mt-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-muted">使用率</span>
                    <span class="fw-bold fs-5">{{ systemData.disk.usagePercentage }}%</span>
                  </div>
                  <div class="progress mb-3" style="height: 8px;">
                    <div class="progress-bar bg-info rounded-pill"
                         :style="`width: ${systemData.disk.usagePercentage}%`"
                         role="progressbar"
                         :aria-valuenow="systemData.disk.usagePercentage"
                         aria-valuemin="0"
                         aria-valuemax="100">
                    </div>
                  </div>
                  <div class="small text-muted lh-sm">
                    <div class="d-flex justify-content-between mb-1">
                      <span>已用</span>
                      <span>{{ formatBytes(systemData.disk.used) }}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                      <span>总计</span>
                      <span>{{ formatBytes(systemData.disk.total) }}</span>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-5">
                  <div class="spinner-border spinner-border-sm text-info" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 虚拟机卡片 -->
          <div class="col-xl-3 col-lg-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body p-4">
                <div class="d-flex align-items-center mb-3">
                  <div class="p-2 bg-warning bg-opacity-10 rounded-circle me-3">
                    <i class="bi bi-pc-display text-warning fs-4"></i>
                  </div>
                  <div>
                    <h5 class="card-title mb-0 fw-semibold">虚拟机</h5>
                    <small class="text-muted">运行状态</small>
                  </div>
                </div>

                <div v-if="systemData" class="mt-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="text-muted">运行中</span>
                    <span class="fw-bold fs-5">{{ systemData.qemu.runningVMs }} / {{ systemData.qemu.totalVMs }}</span>
                  </div>
                  <div class="progress mb-3" style="height: 8px;">
                    <div class="progress-bar bg-warning rounded-pill"
                         :style="`width: ${systemData.qemu.totalVMs ? (systemData.qemu.runningVMs / systemData.qemu.totalVMs * 100) : 0}%`"
                         role="progressbar"
                         :aria-valuenow="systemData.qemu.runningVMs"
                         aria-valuemin="0"
                         :aria-valuemax="systemData.qemu.totalVMs">
                    </div>
                  </div>
                  <div class="small text-muted lh-sm">
                    <div class="d-flex justify-content-between mb-1">
                      <span>已分配 CPU</span>
                      <span>{{ systemData.qemu.cpuAllocation }} 核心</span>
                    </div>
                    <div class="d-flex justify-content-between">
                      <span>已分配内存</span>
                      <span>{{ formatBytes(systemData.qemu.memoryAllocation * 1024 * 1024) }}</span>
                    </div>
                  </div>
                </div>

                <div v-else class="text-center py-5">
                  <div class="spinner-border spinner-border-sm text-warning" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 详细信息卡片 -->
        <div class="row g-4">
          <!-- 系统信息 -->
          <div class="col-xl-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-transparent border-0 pb-0">
                <h5 class="card-title d-flex align-items-center mb-0 fw-semibold">
                  <i class="bi bi-info-circle-fill text-primary me-2"></i>系统信息
                </h5>
              </div>
              <div class="card-body pt-3 overflow-auto" style="max-height: 400px;">
                <div v-if="systemData">
                  <div class="table-responsive">
                    <table class="table table-hover table-borderless mb-0">
                      <tbody>
                        <tr class="border-bottom border-light">
                          <td class="fw-semibold text-muted border-0 py-3" style="width: 35%;">主机名</td>
                          <td class="border-0 py-3">{{ systemData.system.hostname }}</td>
                        </tr>
                        <tr class="border-bottom border-light">
                          <td class="fw-semibold text-muted border-0 py-3">平台</td>
                          <td class="border-0 py-3">
                            <span class="badge bg-light text-dark me-2">{{ systemData.system.platform }}</span>
                            <span class="badge bg-secondary">{{ systemData.system.arch }}</span>
                          </td>
                        </tr>
                        <tr class="border-bottom border-light">
                          <td class="fw-semibold text-muted border-0 py-3">运行时间</td>
                          <td class="border-0 py-3">{{ formatUptime(systemData.system.uptime) }}</td>
                        </tr>
                        <tr class="border-bottom border-light">
                          <td class="fw-semibold text-muted border-0 py-3">CPU 型号</td>
                          <td class="border-0 py-3 small">{{ systemData.cpu.model }}</td>
                        </tr>
                        <tr class="border-bottom border-light">
                          <td class="fw-semibold text-muted border-0 py-3">CPU 核心</td>
                          <td class="border-0 py-3">
                            <span class="badge bg-primary me-2">{{ systemData.cpu.cores }} 核心</span>
                            <span class="text-muted">{{ systemData.cpu.speed }} MHz</span>
                          </td>
                        </tr>
                        <tr>
                          <td class="fw-semibold text-muted border-0 py-3">总内存</td>
                          <td class="border-0 py-3">
                            <span class="badge bg-success">{{ formatBytes(systemData.memory.total) }}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div v-else class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 网络信息 -->
          <div class="col-xl-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-transparent border-0 pb-0">
                <h5 class="card-title d-flex align-items-center mb-0 fw-semibold">
                  <i class="bi bi-diagram-3-fill text-primary me-2"></i>网络信息
                </h5>
              </div>
              <div class="card-body pt-3 overflow-auto" style="max-height: 500px;">
                <div v-if="systemData">
                  <!-- 实时网速显示 -->
                  <div class="row g-3 mb-4">
                    <div class="col-6">
                      <div class="d-flex align-items-center">
                        <div class="me-2">
                          <span class="badge bg-success rounded-pill">
                            <i class="bi bi-arrow-down"></i>
                          </span>
                        </div>
                        <div class="flex-grow-1">
                          <div class="small text-muted">下载速度</div>
                          <div class="fw-bold">{{ formatBytes(systemData.network.stats.rx_sec) }}/s</div>
                        </div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="d-flex align-items-center">
                        <div class="me-2">
                          <span class="badge bg-primary rounded-pill">
                            <i class="bi bi-arrow-up"></i>
                          </span>
                        </div>
                        <div class="flex-grow-1">
                          <div class="small text-muted">上传速度</div>
                          <div class="fw-bold">{{ formatBytes(systemData.network.stats.tx_sec) }}/s</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 网速变化图表 -->
                  <div class="mb-4">
                    <h6 class="fw-semibold mb-3 text-muted">
                      <i class="bi bi-graph-up me-1"></i>网速变化趋势
                    </h6>
                    <div ref="networkChartRef" class="border rounded" style="height: 200px;"></div>
                  </div>

                  <!-- 网络接口表格 -->
                  <div>
                    <h6 class="fw-semibold mb-3 text-muted">
                      <i class="bi bi-ethernet me-1"></i>网络接口
                    </h6>
                    <div class="table-responsive" style="max-height: 120px;">
                      <table class="table table-hover table-borderless table-sm mb-0">
                        <thead class="table-light sticky-top">
                          <tr>
                            <th class="border-0 fw-semibold text-muted">接口名</th>
                            <th class="border-0 fw-semibold text-muted">IP 地址</th>
                            <th class="border-0 fw-semibold text-muted">MAC 地址</th>
                            <th class="border-0 fw-semibold text-muted">类型</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="iface in validNetworkInterfaces" :key="iface.name" class="border-bottom border-light">
                            <td class="border-0 py-2">
                              <span class="badge bg-light text-dark">{{ iface.name }}</span>
                            </td>
                            <td class="border-0 py-2 font-monospace small">{{ iface.ip }}</td>
                            <td class="border-0 py-2 font-monospace small text-muted">{{ iface.mac }}</td>
                            <td class="border-0 py-2">
                              <span class="badge bg-secondary">{{ iface.type }}</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 资源分配 -->
          <div class="col-xl-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-transparent border-0 pb-0">
                <h5 class="card-title d-flex align-items-center mb-0 fw-semibold">
                  <i class="bi bi-pie-chart-fill text-primary me-2"></i>资源分配
                </h5>
              </div>
              <div class="card-body pt-3 overflow-auto" style="max-height: 400px;">
                <div v-if="systemData">
                  <!-- CPU 分配 -->
                  <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="fw-semibold text-muted">CPU 分配率</span>
                      <span class="badge bg-primary fs-6">{{ calculateCpuAllocationPercentage() }}%</span>
                    </div>
                    <div class="progress mb-2" style="height: 12px;">
                      <div class="progress-bar bg-primary rounded-pill"
                           :style="`width: ${calculateCpuAllocationPercentage()}%`"
                           role="progressbar"
                           :aria-valuenow="calculateCpuAllocationPercentage()"
                           aria-valuemin="0"
                           aria-valuemax="100">
                      </div>
                    </div>
                    <div class="small text-muted">
                      已分配 <span class="fw-semibold">{{ systemData.qemu.cpuAllocation }}</span> 核心，
                      共 <span class="fw-semibold">{{ systemData.cpu.cores }}</span> 核心
                    </div>
                  </div>

                  <!-- 内存分配 -->
                  <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <span class="fw-semibold text-muted">内存分配率</span>
                      <span class="badge bg-success fs-6">{{ calculateMemoryAllocationPercentage() }}%</span>
                    </div>
                    <div class="progress mb-2" style="height: 12px;">
                      <div class="progress-bar bg-success rounded-pill"
                           :style="`width: ${calculateMemoryAllocationPercentage()}%`"
                           role="progressbar"
                           :aria-valuenow="calculateMemoryAllocationPercentage()"
                           aria-valuemin="0"
                           aria-valuemax="100">
                      </div>
                    </div>
                    <div class="small text-muted">
                      已分配 <span class="fw-semibold">{{ formatBytes(systemData.qemu.memoryAllocation * 1024 * 1024) }}</span>，
                      共 <span class="fw-semibold">{{ formatBytes(systemData.memory.total) }}</span>
                    </div>
                  </div>

                  <!-- 状态提示 -->
                  <div class="alert alert-info border-0 small mb-0" role="alert">
                    <div class="d-flex align-items-start">
                      <i class="bi bi-info-circle-fill me-2 mt-1"></i>
                      <div>
                        <span v-if="systemData.qemu.runningVMs > 0">
                          当前有 <span class="fw-semibold">{{ systemData.qemu.runningVMs }}</span> 台虚拟机正在运行，
                          占用了 <span class="fw-semibold">{{ calculateCpuAllocationPercentage() }}%</span> 的 CPU 资源和
                          <span class="fw-semibold">{{ calculateMemoryAllocationPercentage() }}%</span> 的内存资源。
                        </span>
                        <span v-else>
                          当前没有运行中的虚拟机。系统资源空闲。
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-5">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 磁盘使用情况 -->
          <div class="col-xl-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-transparent border-0 pb-0">
                <h5 class="card-title d-flex align-items-center mb-0 fw-semibold">
                  <i class="bi bi-hdd-stack-fill text-primary me-2"></i>磁盘使用情况
                </h5>
              </div>
              <div class="card-body pt-3 overflow-auto" style="max-height: 400px;">
                <div v-if="systemData">
                  <!-- 磁盘使用率 -->
                  <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <span class="fw-semibold text-muted">磁盘使用率</span>
                      <span class="badge fs-6" :class="getDiskBadgeClass(systemData.disk.usagePercentage)">
                        {{ systemData.disk.usagePercentage }}%
                      </span>
                    </div>
                    <div class="progress mb-3" style="height: 15px;">
                      <div class="progress-bar rounded-pill"
                           :style="`width: ${systemData.disk.usagePercentage}%`"
                           :class="getDiskBarClass(systemData.disk.usagePercentage)"
                           role="progressbar"
                           :aria-valuenow="systemData.disk.usagePercentage"
                           aria-valuemin="0"
                           aria-valuemax="100">
                      </div>
                    </div>
                  </div>

                  <!-- 磁盘容量统计 -->
                  <div class="row g-3">
                    <div class="col-4">
                      <div class="text-center p-3 bg-light rounded">
                        <div class="h5 mb-1 fw-bold text-primary">{{ formatBytes(systemData.disk.total) }}</div>
                        <div class="small text-muted">总容量</div>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="text-center p-3 bg-light rounded">
                        <div class="h5 mb-1 fw-bold text-danger">{{ formatBytes(systemData.disk.used) }}</div>
                        <div class="small text-muted">已使用</div>
                      </div>
                    </div>
                    <div class="col-4">
                      <div class="text-center p-3 bg-light rounded">
                        <div class="h5 mb-1 fw-bold text-success">{{ formatBytes(systemData.disk.free) }}</div>
                        <div class="small text-muted">可用空间</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-5">
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
const maxDataPoints = ref(30)

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
          let result = `时间: ${params[0].axisValue}<br/>`
          params.forEach(param => {
            result += `${param.seriesName}: ${formatBytes(param.value)}/s<br/>`
          })
          return result
        }
      },
      legend: {
        data: ['下载速度', '上传速度'],
        textStyle: { fontSize: 12 }
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
          formatter: (value: string) => value.split(' ')[1]
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          fontSize: 10,
          formatter: (value: any) => formatBytes(value) + '/s'
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
          lineStyle: { color: '#28a745', width: 2 },
          itemStyle: { color: '#28a745' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(40, 167, 69, 0.3)' },
                { offset: 1, color: 'rgba(40, 167,69, 0.1)' }
              ]
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
          lineStyle: { color: '#007bff', width: 2 },
          itemStyle: { color: '#007bff' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0, 123, 255, 0.3)' },
                { offset: 1, color: 'rgba(0, 123, 255, 0.1)' }
              ]
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

// 获取磁盘使用率徽章样式类
const getDiskBadgeClass = (usage: number) => {
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
/* 移除大部分自定义样式，使用Bootstrap原生类 */
.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

.progress {
  background-color: rgba(0, 0, 0, 0.05);
}

.table-responsive {
  border-radius: 0.375rem;
}

/* 保留必要的自定义样式 */
.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* ECharts 图表容器 */
.border {
  border: 1px solid rgba(0, 0, 0, 0.125) !important;
}
</style>


