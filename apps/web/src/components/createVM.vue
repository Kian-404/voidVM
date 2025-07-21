<template>
  <div class="form-section">
    <h3><i class="bi bi-plus-circle me-2"></i>创建新虚拟机</h3>
    <form @submit.prevent="createVM">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="vmName" class="form-label">虚拟机名称</label>
          <input
            type="text"
            class="form-control"
            id="vmName"
            v-model="newVM.vmName"
            placeholder="输入虚拟机名称"
            required
          />
        </div>
        <div class="col-md-6 mb-3">
          <label for="diskSize" class="form-label">磁盘大小</label>
          <input
            type="text"
            class="form-control"
            id="diskSize"
            v-model="newVM.diskSize"
            placeholder="例如：20G"
          />
        </div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="memory" class="form-label">内存 (MB)</label>
          <input
            type="number"
            class="form-control"
            id="memory"
            v-model.number="newVM.memory"
            placeholder="例如：2048"
          />
        </div>
        <div class="col-md-6 mb-3">
          <label for="cpuCores" class="form-label">CPU 核心数</label>
          <input
            type="number"
            class="form-control"
            id="cpuCores"
            v-model.number="newVM.cpuCores"
            placeholder="例如：2"
          />
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">ISO 镜像</label>
        <div class="input-group">
          <select class="form-select" v-model="newVM.isoPath" :disabled="isLoadingIsos">
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
            <i class="bi" :class="isLoadingIsos ? 'bi-arrow-repeat spin' : 'bi-arrow-repeat'"></i>
          </button>
        </div>
        <small class="form-text text-muted"> 选择要挂载的 ISO 镜像文件，用于安装操作系统 </small>
      </div>

      <div class="row">
        <div class="col-md-12 mb-3">
          <label for="vncPort" class="form-label">VNC 端口</label>
          <input
            type="number"
            class="form-control"
            id="vncPort"
            v-model.number="newVM.vncPort"
            placeholder="例如：0"
          />
        </div>
      </div>

      <!-- 网络配置区域 -->
      <div class="network-config-section mb-4">
        <h5><i class="bi bi-ethernet me-2"></i>网络配置</h5>

        <!-- 网络接口列表 -->
        <div
          v-for="(network, index) in newVM.networks"
          :key="index"
          class="network-interface mb-3 p-3 border rounded"
        >
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="mb-0">网络接口 {{ index + 1 }}</h6>
            <button
              type="button"
              class="btn btn-sm btn-danger"
              @click="removeNetwork(index)"
              :disabled="newVM.networks.length === 1"
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
                @change="onNetworkTypeChange(index)"
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
                  @click="generateMacAddress(index)"
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
                <select class="form-select" v-model="network.bridge" :disabled="loadingBridges">
                  <option value="">-- 选择桥接网络 --</option>
                  <option v-for="bridge in bridgeList" :key="bridge.name" :value="bridge.name">
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
                  <option v-for="bridge in bridgeList" :key="bridge.name" :value="bridge.name">
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
              <div class="col-md-3">
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
                  value="10.0.2.15"
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
                  @click="removePortForwarding(index, portIndex)"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
            <button
              type="button"
              class="btn btn-secondary btn-sm"
              @click="addPortForwarding(index)"
            >
              <i class="bi bi-plus-lg me-1"></i>添加端口转发
            </button>
          </div>
        </div>

        <!-- 添加网络接口按钮 -->
        <button type="button" class="btn btn-outline-primary btn-sm" @click="addNetwork">
          <i class="bi bi-plus-lg me-1"></i>添加网络接口
        </button>
      </div>

      <div class="d-grid mt-4">
        <button type="submit" class="btn btn-primary" :disabled="isCreating">
          <i class="bi" :class="isCreating ? 'bi-arrow-repeat spin' : 'bi-hdd-network'"></i>
          {{ isCreating ? '创建中...' : '创建虚拟机' }}
        </button>
      </div>
    </form>

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
              <button
                type="button"
                class="btn-close"
                @click="showCreateBridgeModal = false"
              ></button>
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
              <button
                type="button"
                class="btn btn-secondary"
                @click="showCreateBridgeModal = false"
              >
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
      <div v-if="showCreateBridgeModal" class="modal-backdrop fade show"></div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { VMCreationAPI } from '../api/vmCreation.ts'
  import { useShowToast } from '../composables/toast.ts'
  const { showToast } = useShowToast()

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

  // Form data
  const newVM = ref({
    vmName: `VM_${new Date().getTime()}`,
    diskSize: '20G',
    memory: 2048,
    cpuCores: 2,
    isoPath: '',
    vncPort: 0,
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
  })

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
  const isoList: any = ref([])
  const bridgeList = ref<BridgeInfo[]>([])
  const isLoadingIsos = ref(false)
  const loadingBridges = ref(false)
  const showCreateBridgeModal = ref(false)
  const isCreatingBridge = ref(false)
  const isCreating = ref(false)

  // emit事件
  const emit = defineEmits(['loadVMs'])

  // 网络配置相关方法
  const addNetwork = () => {
    newVM.value.networks.push({
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

  const removeNetwork = (index: number) => {
    if (newVM.value.networks.length > 1) {
      newVM.value.networks.splice(index, 1)
    }
  }

  const onNetworkTypeChange = (networkIndex: number) => {
    const network = newVM.value.networks[networkIndex]

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
        generateMacAddress(networkIndex)
      }
    }
  }

  const generateMacAddress = (networkIndex: number) => {
    const mac = ['52', '54', '00']
    for (let i = 0; i < 3; i++) {
      mac.push(
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, '0')
      )
    }
    newVM.value.networks[networkIndex].mac = mac.join(':')
  }

  const addPortForwarding = (networkIndex: number) => {
    const network = newVM.value.networks[networkIndex]
    if (network.hostfwd) {
      network.hostfwd.push({
        protocol: 'tcp',
        hostPort: null,
        guestIP: '10.0.2.15',
        guestPort: null,
      })
    }
  }

  const removePortForwarding = (networkIndex: number, portIndex: number) => {
    const network = newVM.value.networks[networkIndex]
    if (network.hostfwd && network.hostfwd.length > 1) {
      network.hostfwd.splice(portIndex, 1)
    }
  }

  // 桥接网络管理
  const loadBridgeList = async () => {
    loadingBridges.value = true
    try {
      const data = await VMCreationAPI.getBridgeList()
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
      await VMCreationAPI.createBridge(newBridge.value)
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

  // 虚拟机创建
  const createVM = async () => {
    isCreating.value = true
    try {
      // 构建网络配置
      const networks = newVM.value.networks.map(network => {
        const config: any = {
          type: network.type,
        }

        if (network.type === 'user') {
          // 用户模式：处理端口转发
          if (network.hostfwd) {
            config.hostfwd = network.hostfwd.filter(port => port.hostPort && port.guestPort)
            // .map(port => `${port.protocol}::${port.hostPort}-:${port.guestPort}`)
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

      const vmData = {
        vmName: newVM.value.vmName,
        memory: `${newVM.value.memory}`,
        cpu: newVM.value.cpuCores.toString(),
        disk: newVM.value.diskSize,
        cdrom: newVM.value.isoPath || undefined,
        network: networks,
        vncPort: newVM.value.vncPort ? `${newVM.value.vncPort}` : '1',
      }
      console.log('虚拟机数据:', vmData)
      await VMCreationAPI.createVM(vmData)
      showToast(`虚拟机 ${newVM.value.vmName} 创建成功`, 'success')

      // 重置表单并通知父组件刷新
      resetNewVMForm()
      emit('loadVMs')
    } catch (error: any) {
      showToast(`创建虚拟机失败: ${error.message}`, 'danger')
    } finally {
      isCreating.value = false
    }
  }

  const resetNewVMForm = () => {
    newVM.value = {
      vmName: `VM_${new Date().getTime()}`,
      diskSize: '20G',
      memory: 2048,
      cpuCores: 2,
      isoPath: '',
      vncPort: 0,
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
      ],
    }
  }

  // ISO 管理
  const refreshIsoList = async () => {
    isLoadingIsos.value = true
    try {
      const data = await VMCreationAPI.getISOList()
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

  // 生命周期
  onMounted(() => {
    refreshIsoList()
    loadBridgeList()
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

  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1040;
    width: 100vw;
    height: 100vh;
    background-color: #000;
    opacity: 0.5;
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1050;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    outline: 0;
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
