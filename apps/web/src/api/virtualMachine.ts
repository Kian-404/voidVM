// apps/web/src/api/virtualMachine.ts
import axios from 'axios'
import { config } from '../utils/config'

const BASE_URL = config.baseUrl || 'http://localhost:3000'

/**
 * 虚拟机管理 API
 */
export class VirtualMachineAPI {
  /**
   * 获取虚拟机列表
   * @returns {Promise<Object[]>} 虚拟机列表
   */
  static async getVMList(): Promise<any[]> {
    const response = await axios.get(`${BASE_URL}/api/vms`)
    return response.data
  }

  /**
   * 启动虚拟机
   * @param {string} vmName - 虚拟机名称
   * @param {Object} vmData - 虚拟机数据
   * @returns {Promise<Object>} 启动响应
   */
  static async startVM(vmName: string, vmData: any): Promise<any> {
    const response = await axios.post(`${BASE_URL}/api/vms/${vmName}/start`, vmData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }

  /**
   * 停止虚拟机
   * @param {string} vmName - 虚拟机名称
   * @param {Object} vmData - 虚拟机数据
   * @returns {Promise<Object>} 停止响应
   */
  static async stopVM(vmName: string, vmData: any): Promise<any> {
    const response = await axios.post(`${BASE_URL}/api/vms/${vmName}/stop`, vmData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }

  /**
   * 重启虚拟机
   * @param {string} vmName - 虚拟机名称
   * @param {Object} vmData - 虚拟机数据
   * @returns {Promise<Object>} 重启响应
   */
  static async restartVM(vmName: string, vmData: any): Promise<any> {
    const response = await axios.post(`${BASE_URL}/api/vms/${vmName}/restart`, vmData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }

  /**
   * 删除虚拟机
   * @param {string} vmName - 虚拟机名称
   * @returns {Promise<Object>} 删除响应
   */
  static async deleteVM(vmName: string): Promise<any> {
    const response = await axios.delete(`${BASE_URL}/api/vms/${vmName}`)
    return response.data
  }

  /**
   * 启动 noVNC 连接
   * @param {Object} vncConfig - VNC 配置
   * @returns {Promise<Object>} VNC 连接响应
   */
  static async startNoVNC(vncConfig: { webPort: number; vncPort: number }): Promise<any> {
    const response = await axios.post(`${BASE_URL}/api/novnc`, vncConfig, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }

  /**
   * 切换 ISO 挂载状态
   * @param {string} vmName - 虚拟机名称
   * @param {boolean} mountStatus - 挂载状态
   * @returns {Promise<Object>} 挂载响应
   */
  static async toggleMountISO(vmName: string, mountStatus: boolean): Promise<any> {
    const response = await axios.post(
      `${BASE_URL}/api/vms/${vmName}/toggleMountIso`,
      { mountStatus },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  }
}
