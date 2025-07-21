const QMPClient = require('./qmp-client')

class VMManager {
  constructor() {
    this.qmp = new QMPClient()
    this.setupEventHandlers()
  }

  setupEventHandlers() {
    this.qmp.on('event', (event, data) => {
      console.log(`Event: ${event}`, data)
      this.handleVMEvent(event, data)
    })
  }

  // 连接到虚拟机
  async connect(host = 'localhost', port = 4444) {
    try {
      await this.qmp.connect(host, port)

      // 发送qmp_capabilities命令启用QMP功能
      await this.qmp.sendCommand('qmp_capabilities')
      console.log('QMP capabilities negotiated')

      return true
    } catch (error) {
      console.error('Failed to connect:', error)
      return false
    }
  }

  // 获取虚拟机状态
  async getVMStatus() {
    try {
      const status = await this.qmp.sendCommand('query-status')
      return status
    } catch (error) {
      console.error('Failed to get VM status:', error)
      throw error
    }
  }
  async getQueryCommand() {
    try {
      const status = await this.qmp.sendCommand('query-commands')
      return status
    } catch (error) {
      console.error('Failed to get VM status:', error)
      throw error
    }
  }
  // 启动虚拟机
  async startVM() {
    try {
      await this.qmp.sendCommand('cont')
      console.log('VM started')
      return true
    } catch (error) {
      console.error('Failed to start VM:', error)
      return false
    }
  }

  // 暂停虚拟机
  async pauseVM() {
    try {
      await this.qmp.sendCommand('stop')
      console.log('VM paused')
      return true
    } catch (error) {
      console.error('Failed to pause VM:', error)
      return false
    }
  }

  // 重启虚拟机
  async resetVM() {
    try {
      await this.qmp.sendCommand('system_reset')
      console.log('VM reset')
      return true
    } catch (error) {
      console.error('Failed to reset VM:', error)
      return false
    }
  }

  // 关闭虚拟机
  async shutdownVM() {
    try {
      await this.qmp.sendCommand('system_powerdown')
      console.log('VM shutdown initiated')
      return true
    } catch (error) {
      console.error('Failed to shutdown VM:', error)
      return false
    }
  }

  // 获取虚拟机信息
  async getVMInfo() {
    try {
      const [status, version, kvm] = await Promise.all([
        this.qmp.sendCommand('query-status'),
        this.qmp.sendCommand('query-version'),
        this.qmp.sendCommand('query-kvm'),
      ])

      return {
        status,
        version,
        kvm,
      }
    } catch (error) {
      console.error('Failed to get VM info:', error)
      throw error
    }
  }

  // 获取块设备信息
  async getBlockDevices() {
    try {
      const devices = await this.qmp.sendCommand('query-block')
      return devices
    } catch (error) {
      console.error('Failed to get block devices:', error)
      throw error
    }
  }

  // 获取网络设备信息
  async getNetworkDevices() {
    try {
      const devices = await this.qmp.sendCommand('query-network')
      return devices
    } catch (error) {
      console.error('Failed to get network devices:', error)
      throw error
    }
  }

  // 创建快照
  async createSnapshot(name) {
    try {
      await this.qmp.sendCommand('snapshot-save', { name })
      console.log(`Snapshot '${name}' created`)
      return true
    } catch (error) {
      console.error('Failed to create snapshot:', error)
      return false
    }
  }

  // 恢复快照
  async loadSnapshot(name) {
    try {
      await this.qmp.sendCommand('loadvm', { name })
      console.log(`Snapshot '${name}' loaded`)
      return true
    } catch (error) {
      console.error('Failed to load snapshot:', error)
      return false
    }
  }

  // 处理虚拟机事件
  handleVMEvent(event, data) {
    switch (event) {
      case 'POWERDOWN':
        console.log('VM is powering down')
        break
      case 'RESET':
        console.log('VM has been reset')
        break
      case 'STOP':
        console.log('VM has been stopped')
        break
      case 'RESUME':
        console.log('VM has been resumed')
        break
      case 'BLOCK_JOB_COMPLETED':
        console.log('Block job completed:', data)
        break
      default:
        console.log(`Unhandled event: ${event}`, data)
    }
  }

  // 断开连接
  disconnect() {
    this.qmp.disconnect()
  }
}

module.exports = VMManager
