// apps/web/src/api/vmEdit.ts
import axios from 'axios'
import { config } from '../utils/config'

const BASE_URL = config.baseUrl || 'http://localhost:3000'

/**
 * 虚拟机编辑相关 API
 */
export class VMEditAPI {
  /**
   * 获取桥接网络列表
   * @returns {Promise<Object>} 桥接网络列表响应
   */
  static async getBridgeList(): Promise<any> {
    const response = await axios.get(`${BASE_URL}/api/network/bridges`)
    return response.data
  }

  /**
   * 创建桥接网络
   * @param {Object} bridgeData - 桥接网络配置
   * @returns {Promise<Object>} 创建响应
   */
  static async createBridge(bridgeData: {
    name: string
    ip: string
    netmask: string
    dhcp: boolean
    dhcpStart?: string
    dhcpEnd?: string
  }): Promise<any> {
    const response = await axios.post(`${BASE_URL}/api/network/bridges`, bridgeData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }

  /**
   * 保存虚拟机配置
   * @param {string} vmName - 虚拟机名称
   * @param {Object} vmConfig - 虚拟机配置
   * @returns {Promise<Object>} 保存响应
   */
  static async saveVMConfig(vmName: string, vmConfig: any): Promise<any> {
    const response = await axios.put(`${BASE_URL}/api/vms/${vmName}/config`, vmConfig, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }

  /**
   * 获取 ISO 镜像列表
   * @returns {Promise<Object>} ISO 列表响应
   */
  static async getISOList(): Promise<any> {
    const response = await axios.get(`${BASE_URL}/api/isos`)
    return response.data
  }
}
