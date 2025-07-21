<template>
  <!-- 虚拟机配置编辑模态框 -->
  <div
    class="modal fade"
    tabindex="-1"
    aria-labelledby="editVMModalLabel"
    aria-hidden="true"
    id="editVMModal"
  >
    <div class="modal-dialog modal-xl">
      <div class="modal-content" v-if="editingVM.name">
        <div class="modal-header">
          <h5 class="modal-title" id="editVMModalLabel">
            <i class="bi bi-pencil-square me-2"></i>编辑虚拟机配置
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <form id="editVMForm">
            <div class="mb-3">
              <label class="form-label">虚拟机名称</label>
              <input type="text" class="form-control" v-model="editingVM.name" disabled />
              <small class="text-muted">虚拟机名称不可更改</small>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">内存 (MB)</label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="editingVM.config.memory"
                />
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">CPU 核心数</label>
                <input
                  type="number"
                  class="form-control"
                  v-model.number="editingVM.config.cpuCores"
                />
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">VNC 端口</label>
              <input type="number" class="form-control" v-model.number="editingVM.config.vncPort" />
            </div>

            <div class="mb-3">
              <label class="form-label">ISO 镜像</label>
              <div class="input-group">
                <select
                  class="form-select"
                  v-model="editingVM.config.isoPath"
                  :disabled="isLoadingIsos"
                >
                  <option value="">-- 不使用 ISO 镜像 --</option>
                  <option v-if="isLoadingIsos" value="" disabled>加载中...</option>
                  <option v-for="iso in isoList" :key="iso.path" :value="iso.path">
                    {{ iso.name }} ({{ iso.size }})
                  </option>
                </select>
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  @click="refreshIsoList"
                  :disabled="isLoadingIsos"
                >
                  <i
                    class="bi"
                    :class="isLoadingIsos ? 'bi-arrow-repeat spin' : 'bi-arrow-repeat'"
                  ></i>
                </button>
              </div>
              <small class="form-text text-muted">
                选择要挂载的 ISO 镜像文件，用于安装操作系统
              </small>
            </div>

            <!-- 网络配置区域 -->
            <div class="network-config-section mb-4">
              <h5><i class="bi bi-ethernet me-2"></i>网络配置</h5>

              <!-- 网络接口列表 -->
              <div
                v-for="(network, index) in editingVM.config.networks"
                :key="index"
                class="network-interface mb-3 p-3 border rounded"
              >
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="mb-0">网络接口 {{ index + 1 }}</h6>
                  <button
                    type="button"
                    class="btn btn-sm btn-danger"
                    @click="removeEditNetwork(index)"
                    :disabled="editingVM.config.networks.length === 1"
                  >
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">网络类型</label>
                    <select
                      class="form-select"
                      v-model="network.type"
                      @change="onEditNetworkTypeChange(index)"
                    >
                      <option value="user">用户模式 (NAT)</option>
                      <option value="bridge">桥接模式</option>
                      <option value="tap">TAP 模式</option>
                    </select>
                  </div>

                  <div class="col-md-6 mb-3" v-if="network.type !== 'user'">
                    <label class="form-label">MAC 地址</label>
                    <div class="input-group">
                      <input
                        type="text"
                        class="form-control"
                        v-model="network.mac"
                        placeholder="52:54:00:xx:xx:xx"
                        pattern="^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$"
                      />
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="generateEditMacAddress(index)"
                        title="生成随机 MAC 地址"
                      >
                        <i class="bi bi-arrow-repeat"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 桥接模式配置 -->
                <div v-if="network.type === 'bridge'" class="bridge-config">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">桥接网络</label>
                      <select
                        class="form-select"
                        v-model="network.bridge"
                        :disabled="loadingBridges"
                      >
                        <option value="">-- 选择桥接网络 --</option>
                        <option
                          v-for="bridge in bridgeList"
                          :key="bridge.name"
                          :value="bridge.name"
                        >
                          {{ bridge.name }} ({{ bridge.ip || 'No IP' }})
                        </option>
                      </select>
                      <small class="form-text text-muted">
                        选择要连接的桥接网络，如果没有可用的桥接，请先创建一个
                      </small>
                    </div>
                    <div class="col-md-6 mb-3">
                      <button
                        type="button"
                        class="btn btn-outline-primary btn-sm"
                        @click="showCreateBridgeModal = true"
                      >
                        <i class="bi bi-plus-lg me-1"></i>创建桥接网络
                      </button>
                    </div>
                  </div>
                </div>

                <!-- TAP 模式配置 -->
                <div v-if="network.type === 'tap'" class="tap-config">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">TAP 接口名称</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="network.ifname"
                        placeholder="例如：tap0"
                      />
                      <small class="form-text text-muted"> 留空则自动生成接口名称 </small>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label">连接到桥接</label>
                      <select class="form-select" v-model="network.bridge">
                        <option value="">-- 不连接桥接 --</option>
                        <option
                          v-for="bridge in bridgeList"
                          :key="bridge.name"
                          :value="bridge.name"
                        >
                          {{ bridge.name }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">启动脚本</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="network.script"
                        placeholder="例如：/etc/qemu-ifup"
                      />
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label">关闭脚本</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="network.downscript"
                        placeholder="例如：/etc/qemu-ifdown"
                      />
                    </div>
                  </div>
                </div>

                <!-- 用户模式端口转发 -->
                <div v-if="network.type === 'user'" class="user-config">
                  <h6>端口转发</h6>
                  <div
                    v-for="(port, portIndex) in network.hostfwd"
                    :key="portIndex"
                    class="port-forwarding-entry mb-2 row"
                  >
                    <div class="col-md-2">
                      <select class="form-select" v-model="port.protocol">
                        <option value="tcp">TCP</option>
                        <option value="udp">UDP</option>
                      </select>
                    </div>
                    <div class="col-md-4">
                      <input
                        type="number"
                        class="form-control"
                        placeholder="主机端口"
                        v-model.number="port.hostPort"
                      />
                    </div>
                    <!-- <div class="col-md-3">
                      <input
                        type="text"
                        class="form-control"
                        placeholder="客户机IP"
                        v-model="port.guestIP"
                      />
                    </div> -->
                    <div class="col-md-4">
                      <input
                        type="number"
                        class="form-control"
                        placeholder="客户机端口"
                        v-model.number="port.guestPort"
                      />
                    </div>
                    <div class="col-md-1">
                      <button
                        type="button"
                        class="btn btn-danger btn-sm"
                        @click="removeEditPortForwarding(index, portIndex)"
                      >
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="btn btn-secondary btn-sm"
                    @click="addEditPortForwarding(index)"
                  >
                    <i class="bi bi-plus-lg me-1"></i>添加端口转发
                  </button>
                </div>
              </div>

              <!-- 添加网络接口按钮 -->
              <button type="button" class="btn btn-outline-primary btn-sm" @click="addEditNetwork">
                <i class="bi bi-plus-lg me-1"></i>添加网络接口
              </button>
            </div>

            <div class="alert alert-info mt-3">
              <i class="bi bi-info-circle me-2"></i>
              <small>注意：某些配置更改可能需要重启虚拟机才能生效。</small>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
          <button type="button" class="btn btn-primary" @click="saveVMConfig">
            <i class="bi bi-save me-1"></i>保存配置
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 创建桥接网络模态框 -->
  <Teleport to="body">
    <div
      class="modal fade"
      :class="{ show: showCreateBridgeModal }"
      :style="{ display: showCreateBridgeModal ? 'block' : 'none' }"
      v-if="showCreateBridgeModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">创建桥接网络</h5>
            <button type="button" class="btn-close" @click="showCreateBridgeModal = false"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createBridge">
              <div class="mb-3">
                <label class="form-label">桥接名称</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="newBridge.name"
                  placeholder="例如：br0"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">IP 地址</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="newBridge.ip"
                  placeholder="例如：192.168.100.1"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label">子网掩码</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="newBridge.netmask"
                  placeholder="例如：255.255.255.0"
                  required
                />
              </div>
              <div class="mb-3">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="newBridge.dhcp"
                    id="enableDHCP"
                  />
                  <label class="form-check-label" for="enableDHCP"> 启用 DHCP </label>
                </div>
              </div>
              <div v-if="newBridge.dhcp" class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">DHCP 起始地址</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="newBridge.dhcpStart"
                    placeholder="例如：192.168.100.10"
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">DHCP 结束地址</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="newBridge.dhcpEnd"
                    placeholder="例如：192.168.100.100"
                  />
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showCreateBridgeModal = false">
              取消
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="createBridge"
              :disabled="isCreatingBridge"
            >
              <i class="bi" :class="isCreatingBridge ? 'bi-arrow-repeat spin' : 'bi-plus-lg'"></i>
              {{ isCreatingBridge ? '创建中...' : '创建' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
  <!-- <div v-if="showCreateBridgeModal" class="modal-backdrop fade show"></div> -->
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useShowToast } from '../composables/toast.ts'
  import { Modal } from 'bootstrap'
  import { VMEditAPI } from '../api/vmEdit.ts'
  // 接口类型定义
  interface PortForward {
    protocol: string
    hostPort: number | null
    guestIP: string
    guestPort: number | null
  }

  interface NetworkConfig {
    type: string
    mac?: string
    bridge?: string
    ifname?: string
    script?: string
    downscript?: string
    hostfwd?: PortForward[]
  }

  interface BridgeInfo {
    name: string
    ip?: string
    status: string
  }

  interface PortForwardingType {
    hostPort: number | null
    guestPort: number | null
  }

  const { showToast } = useShowToast()
  const isLoadingIsos = ref(false)
  const isoList: any = ref([])

  // 桥接网络相关
  const newBridge = ref({
    name: '',
    ip: '',
    netmask: '255.255.255.0',
    dhcp: false,
    dhcpStart: '',
    dhcpEnd: '',
  })

  // 状态变量
  const bridgeList = ref<BridgeInfo[]>([])
  const loadingBridges = ref(false)
  const showCreateBridgeModal = ref(false)
  const isCreatingBridge = ref(false)

  // 编辑VM相关状态
  const editingVM = ref({
    name: '',
    config: {
      memory: 2048,
      cpuCores: 2,
      vncPort: 0,
      isoPath: '',
      networkType: 'user',
      portForwarding: [] as PortForwardingType[],
      networks: [
        {
          type: 'user',
          hostfwd: [
            {
              protocol: 'tcp',
              hostPort: null,
              guestIP: '10.0.2.15',
              guestPort: null,
            },
          ],
        },
      ] as NetworkConfig[],
    },
  })

  const emit = defineEmits(['loadVMs'])

  const editVMModal = ref<Modal>()

  // 网络配置相关方法
  const addEditNetwork = () => {
    editingVM.value.config.networks.push({
      type: 'user',
      hostfwd: [
        {
          protocol: 'tcp',
          hostPort: null,
          guestIP: '10.0.2.15',
          guestPort: null,
        },
      ],
    })
  }

  const removeEditNetwork = (index: number) => {
    if (editingVM.value.config.networks.length > 1) {
      editingVM.value.config.networks.splice(index, 1)
    }
  }

  const onEditNetworkTypeChange = (networkIndex: number) => {
    const network = editingVM.value.config.networks[networkIndex]

    // 清除之前的配置
    delete network.bridge
    delete network.ifname
    delete network.script
    delete network.downscript

    if (network.type === 'user') {
      // 用户模式：添加端口转发配置
      network.hostfwd = [
        {
          protocol: 'tcp',
          hostPort: null,
          guestIP: '10.0.2.15',
          guestPort: null,
        },
      ]
    } else {
      // 桥接或TAP模式：移除端口转发，生成MAC地址
      delete network.hostfwd
      if (!network.mac) {
        generateEditMacAddress(networkIndex)
      }
    }
  }

  const generateEditMacAddress = (networkIndex: number) => {
    const mac = ['52', '54', '00']
    for (let i = 0; i < 3; i++) {
      mac.push(
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, '0')
      )
    }
    editingVM.value.config.networks[networkIndex].mac = mac.join(':')
  }

  const addEditPortForwarding = (networkIndex: number) => {
    const network = editingVM.value.config.networks[networkIndex]
    if (network.hostfwd) {
      network.hostfwd.push({
        protocol: 'tcp',
        hostPort: null,
        guestIP: '10.0.2.15',
        guestPort: null,
      })
    }
  }

  const removeEditPortForwarding = (networkIndex: number, portIndex: number) => {
    const network = editingVM.value.config.networks[networkIndex]
    if (network.hostfwd && network.hostfwd.length > 1) {
      network.hostfwd.splice(portIndex, 1)
    }
  }

  // 桥接网络管理
  const loadBridgeList = async () => {
    loadingBridges.value = true
    try {
      const data = await VMEditAPI.getBridgeList()
      if (data.success) {
        bridgeList.value = data.data || []
      }
    } catch (error) {
      console.error('加载桥接网络列表失败:', error)
    } finally {
      loadingBridges.value = false
    }
  }

  const createBridge = async () => {
    isCreatingBridge.value = true
    try {
      const result = await VMEditAPI.createBridge(newBridge.value)
      showToast(`桥接网络 ${newBridge.value.name} 创建成功`, 'success')

      // 重置表单并刷新列表
      resetBridgeForm()
      showCreateBridgeModal.value = false
      await loadBridgeList()
    } catch (error: any) {
      showToast(`创建桥接网络失败: ${error.message}`, 'danger')
    } finally {
      isCreatingBridge.value = false
    }
  }

  const resetBridgeForm = () => {
    newBridge.value = {
      name: '',
      ip: '',
      netmask: '255.255.255.0',
      dhcp: false,
      dhcpStart: '',
      dhcpEnd: '',
    }
  }

  // 保存VM配置
  const saveVMConfig = async () => {
    console.log('保存VM配置:', editingVM.value) // 调试日志
    try {
      // 处理网络配置
      const networks = editingVM.value.config.networks.map(network => {
        const config: any = {
          type: network.type,
        }

        if (network.type === 'user') {
          // 用户模式：处理端口转发
          if (network.hostfwd) {
            config.hostfwd = network.hostfwd.filter(port => port.hostPort && port.guestPort)
            // .map(port => `${port.protocol}::${port.hostPort}-${port.guestIP}:${port.guestPort}`)
          }
        } else {
          // 桥接或TAP模式
          if (network.mac) config.mac = network.mac
          if (network.bridge) config.bridge = network.bridge

          if (network.type === 'tap') {
            if (network.ifname) config.ifname = network.ifname
            if (network.script) config.script = network.script
            if (network.downscript) config.downscript = network.downscript
          }
        }

        return config
      })

      // 保持原有的portForwarding字段以兼容旧版本
      const portForwarding = editingVM.value.config.portForwarding.filter(
        (port: any) => port.hostPort && port.guestPort
      )

      // 构建更新配置
      const updateConfig = {
        ...editingVM.value.config,
        network: networks,
        portForwarding: portForwarding,
      }

      await VMEditAPI.saveVMConfig(editingVM.value.name, updateConfig)
      // 关闭模态框
      editVMModal.value?.hide()

      // 显示成功消息
      showToast('虚拟机配置已成功更新', 'success')

      // 重新加载VM列表
      emit('loadVMs')
    } catch (error: any) {
      showToast(`更新配置失败: ${error.message}`, 'danger')
    }
  }

  const refreshIsoList = async () => {
    isLoadingIsos.value = true

    try {
      const data = await VMEditAPI.getISOList()
      console.log('ISO 列表:', data) // 调试日志
      if (data.success) {
        isoList.value = data.isos
      } else {
        throw new Error(data.error || '获取 ISO 列表失败')
      }
    } catch (error: any) {
      console.error('获取 ISO 列表错误:', error)
      showToast(`获取 ISO 列表失败: ${error.message}`, 'danger')
    } finally {
      isLoadingIsos.value = false
    }
  }

  // // 原有的端口转发方法保持不变以兼容旧版本
  // const addEditPortForwarding = () => {
  //   editingVM.value.config.portForwarding.push({
  //     hostPort: null,
  //     guestPort: null,
  //   })
  // }

  // const removeEditPortForwarding = (index: number) => {
  //   editingVM.value.config.portForwarding.splice(index, 1)
  //   if (editingVM.value.config.portForwarding.length === 0) {
  //     addEditPortForwarding()
  //   }
  // }

  // 生命周期钩子
  onMounted(() => {
    refreshIsoList()
    loadBridgeList()
    // 初始化编辑模态框
    // editVMModal.value = new Modal(document.getElementById('editVMModal') as HTMLElement)
    // 初始化编辑模态框
    const modalElement = document.getElementById('editVMModal') as HTMLElement
    editVMModal.value = new Modal(modalElement, {
      backdrop: true,
      keyboard: true,
    })

    // 清理事件监听
    modalElement.addEventListener('hidden.bs.modal', () => {
      // 确保backdrop被正确清理
      setTimeout(() => {
        const orphanedBackdrops = document.querySelectorAll('.modal-backdrop:not(.show)')
        orphanedBackdrops.forEach(backdrop => backdrop.remove())
      }, 100)
    })
  })

  const editVM = (vm: any) => {
    // 确保config对象存在
    const vmConfig = vm.config || {}

    // 创建一个完整的编辑对象，包含所有可能的字段
    editingVM.value = {
      name: vm.name,
      config: {
        memory: vmConfig.memory || 2048,
        cpuCores: vmConfig.cpuCores || 2,
        vncPort: vmConfig.vncPort || 0,
        isoPath: vmConfig.isoPath || '',
        networkType: vmConfig.networkType || 'user',
        portForwarding: Array.isArray(vmConfig.portForwarding)
          ? JSON.parse(JSON.stringify(vmConfig.portForwarding))
          : [],
        networks: Array.isArray(vmConfig.network)
          ? JSON.parse(JSON.stringify(vmConfig.network))
          : [
              {
                type: 'user',
                hostfwd: [
                  {
                    protocol: 'tcp',
                    hostPort: null,
                    guestIP: '10.0.2.15',
                    guestPort: null,
                  },
                ],
              },
            ],
      },
    }

    console.log('编辑对象:', editingVM.value) // 调试日志

    // 确保端口转发数组有内容（兼容旧版本）
    if (editingVM.value.config.portForwarding.length === 0) {
      editingVM.value.config.portForwarding.push({
        hostPort: null,
        guestPort: null,
      })
    }

    // 确保网络配置数组有内容
    if (editingVM.value.config.networks.length === 0) {
      editingVM.value.config.networks.push({
        type: 'user',
        hostfwd: [
          {
            protocol: 'tcp',
            hostPort: null,
            guestIP: '10.0.2.15',
            guestPort: null,
          },
        ],
      })
    }

    console.log('编辑对象:', editingVM.value) // 调试日志
  }

  const showEditVMModal = (vm: any) => {
    console.log('编辑VM:', vm) // 调试日志
    editVM(vm)
    refreshIsoList()
    loadBridgeList()
    editVMModal.value?.show()
  }

  defineExpose({
    showEditVMModal,
  })
</script>

<style scoped>
  .network-interface {
    background-color: #f8f9fa;
  }

  .network-config-section {
    border-top: 1px solid #dee2e6;
    padding-top: 1rem;
  }

  .port-forwarding-entry {
    background-color: #ffffff;
    padding: 0.5rem;
    border-radius: 0.25rem;
    border: 1px solid #dee2e6;
  }

  .bridge-config,
  .tap-config,
  .user-config {
    background-color: #ffffff;
    padding: 1rem;
    border-radius: 0.25rem;
    border: 1px solid #e9ecef;
    margin-top: 1rem;
  }

  /* 确保模态框有正确的z-index层级 */
  :global(#editVMModal) {
    z-index: 1055 !important;
  }

  :global(#editVMModal .modal-dialog) {
    z-index: 1056 !important;
  }

  :global(#editVMModal .modal-content) {
    z-index: 1057 !important;
    position: relative;
  }

  /* 确保backdrop不会覆盖模态框内容 */
  :global(.modal-backdrop) {
    z-index: 1050 !important;
  }

  .spin {
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
</style>
