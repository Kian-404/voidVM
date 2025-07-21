// apps/web/src/api/vmCreation.ts
import axios from 'axios'
import { config } from '../utils/config'

const BASE_URL = config.baseUrl || 'http://localhost:3000'

/**
 * 虚拟机创建相关 API
 */
export class VMCreationAPI {
  /**
   * 获取 ISO 镜像列表
   * @returns {Promise<Object>} ISO 列表响应
   */
  static async getISOList(): Promise<any> {
    const response = await axios.get(`${BASE_URL}/api/isos`)
    return response.data
  }

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
   * 创建虚拟机
   * @param {Object} vmData - 虚拟机配置
   * @returns {Promise<Object>} 创建响应
   */
  static async createVM(vmData: {
    vmName: string
    memory: string
    cpu: string
    disk: string
    cdrom?: string
    network: any[]
    vncPort: string
  }): Promise<any> {
    const response = await axios.post(`${BASE_URL}/api/vms`, vmData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }
}
