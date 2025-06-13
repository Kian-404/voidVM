import axios from 'axios';

export interface Image {
  id: string;
  name: string;
  path: string;
  size: number;
  created: string;
  modified: string;
  type: 'iso' | 'disk';
  format?: string;
}

export interface ImageInfo extends Image {
  virtualSize: number;
  actualSize: number;
  clusterSize: number;
  backingFile?: string;
  fullInfo: any;
}
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

class ImageService {
  private apiUrl = `${BASE_URL}/api/images`;
  // 获取所有镜像
  async getAllImages(): Promise<Image[]> {
    const response = await axios.get(this.apiUrl);
    return response.data;
  }
  
  // 获取 ISO 镜像
  async getISOImages(): Promise<Image[]> {
    const response = await axios.get(`${this.apiUrl}/iso`);
    return response.data;
  }
  
  // 获取磁盘镜像
  async getDiskImages(): Promise<Image[]> {
    const response = await axios.get(`${this.apiUrl}/disk`);
    return response.data;
  }
  
  // 获取镜像详情
  async getImageInfo(id: string): Promise<ImageInfo> {
    const response = await axios.get(`${this.apiUrl}/${id}`);
    return response.data;
  }
  
  // 删除镜像
  async deleteImage(id: string): Promise<{ success: boolean; message: string }> {
    const response = await axios.delete(`${this.apiUrl}/${id}`);
    return response.data;
  }
  
  // 重命名镜像
  async renameImage(id: string, newName: string): Promise<{ success: boolean; message: string; newPath: string }> {
    const response = await axios.put(`${this.apiUrl}/${id}/rename`, { newName });
    return response.data;
  }
  
  // 创建磁盘镜像
  async createDiskImage(name: string, size: number, format: string = 'qcow2'): Promise<{ success: boolean; message: string; image: Image }> {
    const response = await axios.post(`${this.apiUrl}/disk/create`, { name, size, format });
    return response.data;
  }
  
  // 上传镜像
  async uploadImage(file: File, onProgress?: (progress: number) => void): Promise<{ success: boolean; message: string; image: Image }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${this.apiUrl}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    });
    
    return response.data;
  }
  
  // 格式化文件大小
   formatSize(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  
  // 格式化日期
   formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}

export const imageService = new ImageService();
export default imageService;
