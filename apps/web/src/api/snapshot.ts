import axios from 'axios'
import { config } from '../utils/config'
const BASE_URL = config.baseUrl || 'http://localhost:3000'
const API_BASE_URL = `${BASE_URL}/api/snapshots`

export const snapshotAPI = {
  /**
   * 创建快照
   */
  async createSnapshot(data: any) {
    return await axios.post(`${API_BASE_URL}/create`, data)
  },

  /**
   * 加载快照
   */
  async loadSnapshot(data: any) {
    return await axios.post(`${API_BASE_URL}/load`, data)
  },

  /**
   * 获取快照列表
   */
  async getSnapshots(vmName: string, params = {}) {
    return await axios.get(`${API_BASE_URL}/${vmName}`, { params })
  },

  /**
   * 获取快照详情
   */
  async getSnapshotDetail(vmName: string, snapshotName: string) {
    return await axios.get(`${API_BASE_URL}/${vmName}/${snapshotName}`)
  },

  /**
   * 删除快照
   */
  async deleteSnapshot(vmName: string, snapshotName: string) {
    return await axios.delete(`${API_BASE_URL}/${vmName}/${snapshotName}`)
  },

  /**
   * 重命名快照
   */
  async renameSnapshot(vmName: string, snapshotName: string, data: any) {
    return await axios.put(`${API_BASE_URL}/${vmName}/${snapshotName}/rename`, data)
  },
}
