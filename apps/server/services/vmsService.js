// services/vmsService.js
const QemuManager = require('../qemu-manager')
const path = require('path')
const globalVMState = require('../utils/globalVMState')

class VmsService {
  constructor() {
    // 创建 QEMU 管理器实例
    this.qemuManager = new QemuManager({
      vmStoragePath: path.join(__dirname, '../vm-storage'),
    })
  }

  /**
   * 创建新虚拟机
   * @param {Object} vmConfig - 虚拟机配置
   * @returns {Promise<Object>} 创建的虚拟机信息
   */
  async createVM(vmConfig) {
    try {
      const newVM = await this.qemuManager.createCompleteVM(vmConfig)
      return newVM
    } catch (error) {
      console.error('Service: Failed to create VM:', error)
      throw error
    }
  }

  /**
   * 获取所有虚拟机列表
   * @returns {Promise<Array>} 虚拟机列表
   */
  async getAllVMs() {
    try {
      const vmsList = await this.qemuManager.listAllVMs()
      return vmsList
    } catch (error) {
      console.error('Service: Failed to get VMs list:', error)
      throw error
    }
  }

  /**
   * 启动虚拟机
   * @param {Object} vmConfig - 虚拟机配置
   * @returns {Promise<Object>} 启动结果
   */
  async startVM(vmConfig) {
    try {
      const result = await this.qemuManager.startVM(vmConfig)
      globalVMState.setVMInfo(vmConfig.vmName, result)
      return result
    } catch (error) {
      console.error('Service: Failed to start VM:', error)
      globalVMState.removeVMInfo(vmConfig.vmName)
      throw error
    }
  }

  /**
   * 停止虚拟机
   * @param {string} vmName - 虚拟机名称
   * @param {number} lastPid - 虚拟机进程ID
   * @returns {Promise<Object>} 停止结果
   */
  async stopVM(vmName, lastPid) {
    try {
      const result = await this.qemuManager.stopVM(vmName, lastPid)
      globalVMState.removeVMInfo(vmName)
      return result
    } catch (error) {
      console.error('Service: Failed to stop VM:', error)
      throw error
    }
  }

  /**
   * 重启虚拟机
   * @param {string} vmName - 虚拟机名称
   * @param {number} lastPid - 虚拟机进程ID
   * @returns {Promise<Object>} 重启结果
   */
  async restartVM(vmName, lastPid) {
    try {
      const result = await this.qemuManager.restartVM(vmName, lastPid)
      return result
    } catch (error) {
      console.error('Service: Failed to restart VM:', error)
      throw error
    }
  }

  /**
   * 删除虚拟机
   * @param {string} vmName - 虚拟机名称
   * @param {boolean} forceDelete - 是否强制删除
   * @returns {Promise<Object>} 删除结果
   */
  async deleteVM(vmName, forceDelete = true) {
    try {
      const result = await this.qemuManager.deleteVM(vmName, forceDelete)
      return result
    } catch (error) {
      console.error('Service: Failed to delete VM:', error)
      throw error
    }
  }

  /**
   * 启动 NoVNC 服务
   * @param {number} vncPort - VNC端口
   * @param {number} webPort - Web端口
   * @returns {Promise<Object>} NoVNC服务信息
   */
  async startNoVNC(vncPort, webPort) {
    try {
      const novnc = await this.qemuManager.startNoVNC(vncPort, webPort)
      return novnc
    } catch (error) {
      console.error('Service: Failed to start NoVNC:', error)
      throw error
    }
  }

  /**
   * 获取虚拟机信息
   * @param {string} vmName - 虚拟机名称
   * @returns {Promise<Object>} 虚拟机信息
   */
  async getVMInfo(vmName) {
    try {
      const vmInfo = await this.qemuManager.getVMInfo(vmName)
      return vmInfo
    } catch (error) {
      console.error('Service: Failed to get VM info:', error)
      throw error
    }
  }

  /**
   * 更新虚拟机配置
   * @param {string} vmName - 虚拟机名称
   * @param {Object} newConfig - 新配置
   * @returns {Promise<Object>} 更新结果
   */
  async updateVMConfig(vmName, newConfig) {
    try {
      // 获取VM信息
      const vmInfo = await this.qemuManager.getVMInfo(vmName)

      if (!vmInfo) {
        throw new Error(`找不到虚拟机 ${vmName}`)
      }

      // 更新配置
      const updatedConfig = {
        ...vmInfo.config,
        ...newConfig,
      }

      // 保存更新后的配置
      await this.qemuManager.updateVMConfig(vmName, updatedConfig)

      // 如果VM正在运行，可能需要提醒用户某些更改需要重启才能生效
      const isRunning = vmInfo.status === 'running'

      return {
        success: true,
        message: `虚拟机 ${vmName} 配置已更新`,
        requiresRestart: isRunning,
        config: updatedConfig,
      }
    } catch (error) {
      console.error('Service: Failed to update VM config:', error)
      throw error
    }
  }

  /**
   * 检查虚拟机是否存在
   * @param {string} vmName - 虚拟机名称
   * @returns {Promise<boolean>} 是否存在
   */
  async checkVMExists(vmName) {
    try {
      const vmExists = await this.qemuManager.checkVMExists(vmName)
      return vmExists
    } catch (error) {
      console.error('Service: Failed to check VM exists:', error)
      throw error
    }
  }

  /**
   * 检查虚拟机是否正在运行
   * @param {string} vmName - 虚拟机名称
   * @returns {boolean} 是否正在运行
   */
  isVMRunning(vmName) {
    try {
      const isRunning = this.qemuManager.isVMRunning(vmName)
      return isRunning
    } catch (error) {
      console.error('Service: Failed to check VM running status:', error)
      throw error
    }
  }

  /**
   * 切换虚拟机 ISO 镜像的挂载状态
   * @param {string} vmName - 虚拟机名称
   * @param {boolean} mountStatus - 挂载状态
   * @returns {Promise<Object>} 操作结果
   */
  async toggleMountIso(vmName, mountStatus) {
    try {
      // 检查虚拟机是否存在
      const vmExists = await this.qemuManager.checkVMExists(vmName)
      if (!vmExists) {
        throw new Error(`VM '${vmName}' not found`)
      }

      // 检查虚拟机是否正在运行
      const isRunning = this.qemuManager.isVMRunning(vmName)
      if (!isRunning) {
        throw new Error(`VM '${vmName}' is not running. Cannot toggle ISO mount on a stopped VM.`)
      }

      // 调用 toggleMountIso 方法
      const result = await this.qemuManager.toggleMountIso(vmName, mountStatus)
      return result
    } catch (error) {
      console.error('Service: Failed to toggle ISO mount:', error)
      throw error
    }
  }
}

module.exports = new VmsService()
