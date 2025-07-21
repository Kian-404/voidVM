// apps/web/src/api/network.ts
import axios from 'axios'
import { config } from '../utils/config'

const BASE_URL = config.baseUrl || 'http://localhost:3000'

/**
 * 网络管理 API
 */
export class NetworkAPI {
  /**
   * 获取网络接口列表
   * @returns {Promise<Object>} 网络接口列表响应
   */
  static async getNetworkInterfaces(): Promise<any> {
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
   * 删除桥接网络
   * @param {string} name - 桥接网络名称
   * @returns {Promise<Object>} 删除响应
   */
  static async deleteBridge(name: string): Promise<any> {
    const response = await axios.delete(`${BASE_URL}/api/network/bridges/${name}`)
    return response.data
  }
  /**
   * 获取所有 TAP 接口
   * @returns {Promise<Object>} TAP 接口列表响应
   */
  static async getTapInterfaces(): Promise<any> {
    const response = await axios.get(`${BASE_URL}/api/network/tap`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }
  /**
   * 获取单个 TAP 接口详细信息
   * @param {string} name - TAP 接口名称
   * @returns {Promise<Object>} TAP 接口详情响应
   */
  static async getTapInterfaceDetails(name: string): Promise<any> {
    const response = await axios.get(`${BASE_URL}/api/network/tap/${name}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }

  /**
   * 创建 TAP 接口
   * @param {Object} tapData - TAP 接口配置
   * @returns {Promise<Object>} 创建响应
   */
  static async createTap(tapData: { name: string; bridge?: string }): Promise<any> {
    const response = await axios.post(`${BASE_URL}/api/network/tap`, tapData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }

  /**
   * 删除 TAP 接口
   * @param {string} name - TAP 接口名称
   * @returns {Promise<Object>} 删除响应
   */
  static async deleteTap(name: string): Promise<any> {
    const response = await axios.delete(`${BASE_URL}/api/network/tap/${name}`)
    return response.data
  }
  /**
   * 获取完整网络信息
   * @returns {Promise<Object>} 完整网络信息响应
   */
  static async getAllNetworkInfo(): Promise<any> {
    const response = await axios.get(`${BASE_URL}/api/network/info`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }

  /**
   * 创建端口转发规则
   * @param {Object} portForwardData - 端口转发配置
   * @returns {Promise<Object>} 创建响应
   */
  static async createPortForward(portForwardData: {
    hostPort: number
    guestIP: string
    guestPort: number
    protocol: 'tcp' | 'udp'
  }): Promise<any> {
    const response = await axios.post(`${BASE_URL}/api/network/port-forward`, portForwardData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }

  /**
   * 删除端口转发规则
   * @param {Object} rule - 端口转发规则
   * @returns {Promise<void>} 删除响应
   */
  static async deletePortForward(rule: { hostPort: number; protocol: string }): Promise<void> {
    // 注意：这里可能需要根据实际 API 调整删除方式
    const response = await axios.delete(`${BASE_URL}/api/network/port-forward`, {
      data: rule,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.data
  }

  /**
   * 设置流量控制
   * @param {Object} trafficControlData - 流量控制配置
   * @returns {Promise<Object>} 设置响应
   */
  static async setupTrafficControl(trafficControlData: {
    interfaceItem: string
    bandwidth: string
    delay: string
    loss: string
  }): Promise<any> {
    const response = await axios.post(
      `${BASE_URL}/api/network/traffic-control`,
      trafficControlData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    return response.data
  }

  /**
   * 获取网络统计信息
   * @param {string} interfaceName - 网络接口名称
   * @param {boolean} realtime - 是否实时获取
   * @returns {Promise<Object>} 统计信息响应
   */
  static async getNetworkStats(interfaceName: string, realtime: boolean = false): Promise<any> {
    const response = await axios.get(`${BASE_URL}/api/network/stats/${interfaceName}`, {
      params: {
        realtime,
        interfaceNet: interfaceName,
      },
    })
    return response.data
  }
}
