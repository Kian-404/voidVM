// /api/staticFiles.ts
import axios from 'axios'
import { config } from '../utils/config'

const BASE_URL = config.baseUrl || 'http://localhost:3000'

/**
 * 静态文件管理 API
 */
export class StaticFilesAPI {
  /**
   * 获取文件列表
   * @param {string} path - 目录路径
   * @returns {Promise<Object>} 文件列表响应
   */
  static async getFileList(path: string = ''): Promise<any> {
    const response = await axios.get(`${BASE_URL}/api/static-files/list`, {
      params: { path }
    })
    return response.data
  }

  /**
   * 上传文件
   * @param {FileList} files - 要上传的文件列表
   * @param {string} path - 上传目录路径
   * @returns {Promise<Object>} 上传响应
   */
  static async uploadFiles(files: FileList | File[], path: string = ''): Promise<any> {
    const formData = new FormData()
    Array.from(files).forEach((file: File) => {
      formData.append('files', file)
    })
    formData.append('path', path)

    const response = await axios.post(`${BASE_URL}/api/static-files/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 文件上传设置更长的超时时间
    })
    return response.data
  }

  /**
   * 创建文件夹
   * @param {string} path - 父目录路径
   * @param {string} name - 文件夹名称
   * @returns {Promise<Object>} 创建响应
   */
  static async createFolder(path: string, name: string): Promise<any> {
    const response = await axios.post(`${BASE_URL}/api/static-files/mkdir`, {
      path,
      name: name.trim(),
    })
    return response.data
  }

  /**
   * 获取文件内容
   * @param {string} filePath - 文件路径
   * @returns {Promise<Object>} 文件内容响应
   */
  static async getFileContent(filePath: string): Promise<any> {
    const response = await axios.get(`${BASE_URL}/api/static-files/content`, {
      params: { path: filePath }
    })
    return response.data
  }

  /**
   * 保存文件内容
   * @param {string} filePath - 文件路径
   * @param {string} content - 文件内容
   * @returns {Promise<Object>} 保存响应
   */
  static async saveFileContent(filePath: string, content: string): Promise<any> {
    const response = await axios.put(`${BASE_URL}/api/static-files/content`, {
      path: filePath,
      content,
    })
    return response.data
  }

  /**
   * 重命名文件或文件夹
   * @param {string} oldPath - 原路径
   * @param {string} newName - 新名称
   * @returns {Promise<Object>} 重命名响应
   */
  static async renameItem(oldPath: string, newName: string): Promise<any> {
    const response = await axios.put(`${BASE_URL}/api/static-files/rename`, {
      oldPath,
      newName: newName.trim(),
    })
    return response.data
  }

  /**
   * 删除文件或文件夹
   * @param {string} path - 文件路径
   * @returns {Promise<Object>} 删除响应
   */
  static async deleteItem(path: string): Promise<any> {
    const response = await axios.delete(`${BASE_URL}/api/static-files/delete`, {
      data: { path }
    })
    return response.data
  }

  /**
   * 批量删除文件或文件夹
   * @param {string[]} paths - 文件路径数组
   * @returns {Promise<Object[]>} 删除响应数组
   */
  static async batchDeleteItems(paths: string[]): Promise<any[]> {
    const deletePromises = paths.map(path => this.deleteItem(path))
    return await Promise.all(deletePromises)
  }

  /**
   * 生成下载链接
   * @param {string} filePath - 文件路径
   * @returns {string} 下载链接
   */
  static getDownloadUrl(filePath: string): string {
    return `${BASE_URL}/api/static-files/download?path=${encodeURIComponent(filePath)}`
  }

  /**
   * 下载文件 (使用 axios)
   * @param {string} filePath - 文件路径
   * @returns {Promise<Blob>} 文件 Blob 数据
   */
  static async downloadFile(filePath: string): Promise<Blob> {
    const response = await axios.get(`${BASE_URL}/api/static-files/download`, {
      params: { path: filePath },
      responseType: 'blob',
    })
    return response.data
  }
}
