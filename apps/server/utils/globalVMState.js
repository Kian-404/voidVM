// utils/globalVMState.js
class GlobalVMState {
  constructor() {
    this.vmProcesses = new Map()
    this.listeners = new Map() // 事件监听器
  }

  /**
   * 设置VM信息
   * @param {string} vmName - 虚拟机名称
   * @param {Object} vmInfo - 虚拟机信息
   */
  setVMInfo(vmName, vmInfo) {
    const previousInfo = this.vmProcesses.get(vmName)
    this.vmProcesses.set(vmName, {
      ...vmInfo,
      updateTime: new Date().toISOString(),
    })

    // 触发状态变更事件
    this.emitEvent('vm-updated', { vmName, vmInfo, previousInfo })

    console.log(`全局状态已更新VM信息: ${vmName}`)
  }

  /**
   * 获取VM信息
   * @param {string} vmName - 虚拟机名称
   * @returns {Object|null} 虚拟机信息
   */
  getVMInfo(vmName) {
    const result = this.vmProcesses.get(vmName) || null
    return result
  }

  /**
   * 移除VM信息
   * @param {string} vmName - 虚拟机名称
   */
  removeVMInfo(vmName) {
    const vmInfo = this.vmProcesses.get(vmName)
    const success = this.vmProcesses.delete(vmName)

    if (success) {
      // 触发移除事件
      this.emitEvent('vm-removed', { vmName, vmInfo })
      console.log(`全局状态已移除VM信息: ${vmName}`)
    }

    return success
  }

  /**
   * 更新VM状态
   * @param {string} vmName - 虚拟机名称
   * @param {string} status - 新状态
   */
  updateVMStatus(vmName, status) {
    const vmInfo = this.vmProcesses.get(vmName)
    if (vmInfo) {
      const oldStatus = vmInfo.status
      vmInfo.status = status
      vmInfo.statusUpdateTime = new Date().toISOString()

      // 触发状态变更事件
      this.emitEvent('vm-status-changed', { vmName, oldStatus, newStatus: status })

      console.log(`全局状态已更新VM状态: ${vmName} -> ${status}`)
    }
  }

  /**
   * 获取所有VM信息
   * @returns {Array} 所有虚拟机信息
   */
  getAllVMs() {
    return Array.from(this.vmProcesses.entries()).map(([name, info]) => ({
      name,
      ...info,
    }))
  }

  /**
   * 检查VM是否存在
   * @param {string} vmName - 虚拟机名称
   * @returns {boolean} 是否存在
   */
  hasVM(vmName) {
    return this.vmProcesses.has(vmName)
  }

  /**
   * 获取运行中的VM列表
   * @returns {Array} 运行中的虚拟机列表
   */
  getRunningVMs() {
    return this.getAllVMs().filter(vm => vm.status === 'running')
  }

  /**
   * 添加事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  /**
   * 移除事件监听器
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   * @param {string} event - 事件名称
   * @param {Object} data - 事件数据
   */
  emitEvent(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`事件监听器执行错误 [${event}]:`, error)
        }
      })
    }
  }

  /**
   * 清空所有VM信息（用于测试或重置）
   */
  clear() {
    this.vmProcesses.clear()
    this.emitEvent('vm-state-cleared', {})
    console.log('全局VM状态已清空')
  }
}

// 创建单例实例
const globalVMState = new GlobalVMState()

module.exports = globalVMState
