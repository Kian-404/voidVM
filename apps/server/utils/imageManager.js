const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

class ImageManager {
  constructor(config) {
    this.config = config || {};
    this.isoDir = this.config.isoDir || path.join(process.cwd(), 'iso');
    this.diskDir = this.config.diskDir || path.join(process.cwd(), 'disk-images');
    
    // 确保目录存在
    this.ensureDirectories();
  }
  
  ensureDirectories() {
    fs.ensureDirSync(this.isoDir);
    fs.ensureDirSync(this.diskDir);
  }
  
  // 获取所有 ISO 镜像
  async getISOImages() {
    try {
      const files = await fs.readdir(this.isoDir);
      const images = [];
      
      for (const file of files) {
        if (file.endsWith('.iso')) {
          const filePath = path.join(this.isoDir, file);
          const stats = await fs.stat(filePath);
          
          images.push({
            id: crypto.createHash('md5').update(filePath).digest('hex'),
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            type: 'iso'
          });
        }
      }
      
      return images;
    } catch (error) {
      console.error('Error getting ISO images:', error);
      throw error;
    }
  }
  
  // 获取所有磁盘镜像
  async getDiskImages() {
    try {
      const files = await fs.readdir(this.diskDir);
      const images = [];
      
      for (const file of files) {
        if (file.endsWith('.qcow2') || file.endsWith('.img') || file.endsWith('.raw')) {
          const filePath = path.join(this.diskDir, file);
          const stats = await fs.stat(filePath);
          
          images.push({
            id: crypto.createHash('md5').update(filePath).digest('hex'),
            name: file,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            type: 'disk',
            format: path.extname(file).substring(1)
          });
        }
      }
      
      return images;
    } catch (error) {
      console.error('Error getting disk images:', error);
      throw error;
    }
  }
  
  // 获取所有镜像
  async getAllImages() {
    const [isoImages, diskImages] = await Promise.all([
      this.getISOImages(),
      this.getDiskImages()
    ]);
    
    return [...isoImages, ...diskImages];
  }
  
  // 删除镜像
  async deleteImage(imagePath) {
    try {
      // 检查文件是否存在
      await fs.access(imagePath);
      
      // 删除文件
      await fs.unlink(imagePath);
      
      return { success: true, message: '镜像已成功删除' };
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
  
  // 重命名镜像
  async renameImage(oldPath, newName) {
    try {
      // 检查文件是否存在
      await fs.access(oldPath);
      
      const dirPath = path.dirname(oldPath);
      const extension = path.extname(oldPath);
      const newPath = path.join(dirPath, newName + extension);
      
      // 检查新文件名是否已存在
      try {
        await fs.access(newPath);
        throw new Error('目标文件名已存在');
      } catch (err) {
        // 如果文件不存在，继续重命名
        if (err.code === 'ENOENT') {
          await fs.rename(oldPath, newPath);
          return {
            success: true,
            message: '镜像已成功重命名',
            newPath
          };
        }
        throw err;
      }
    } catch (error) {
      console.error('Error renaming image:', error);
      throw error;
    }
  }
  
  // 创建新的磁盘镜像
  async createDiskImage(name, size, format = 'qcow2') {
    try {
      const { execSync } = require('child_process');
      
      // 验证参数
      if (!name) throw new Error('镜像名称不能为空');
      if (!size || isNaN(size)) throw new Error('镜像大小必须是有效数字');
      if (!['qcow2', 'raw', 'img'].includes(format)) {
        throw new Error('不支持的镜像格式，支持的格式有：qcow2, raw, img');
      }
      
      // 构建文件路径
      let filename = name;
      if (!filename.endsWith(`.${format}`)) {
        filename += `.${format}`;
      }
      
      const filePath = path.join(this.diskDir, filename);
      
      // 检查文件是否已存在
      try {
        await fs.access(filePath);
        throw new Error('镜像文件已存在');
      } catch (err) {
        // 如果文件不存在，继续创建
        if (err.code !== 'ENOENT') throw err;
      }
      
      // 使用 qemu-img 创建磁盘镜像
      const command = `qemu-img create -f ${format} "${filePath}" ${size}G`;
      execSync(command);
      
      // 获取创建的文件信息
      const stats = await fs.stat(filePath);
      
      return {
        success: true,
        message: '磁盘镜像创建成功',
        image: {
          id: crypto.createHash('md5').update(filePath).digest('hex'),
          name: filename,
          path: filePath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          type: 'disk',
          format
        }
      };
    } catch (error) {
      console.error('Error creating disk image:', error);
      throw error;
    }
  }
  
  // 获取镜像信息
  async getImageInfo(imagePath) {
    try {
      const { execSync } = require('child_process');
      
      // 检查文件是否存在
      await fs.access(imagePath);
      
      // 使用 qemu-img info 获取镜像信息
      const command = `qemu-img info --output=json "${imagePath}"`;
      const output = execSync(command).toString();
      
      // 解析 JSON 输出
      const info = JSON.parse(output);
      
      // 获取文件基本信息
      const stats = await fs.stat(imagePath);
      const filename = path.basename(imagePath);
      
      return {
        id: crypto.createHash('md5').update(imagePath).digest('hex'),
        name: filename,
        path: imagePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        type: filename.endsWith('.iso') ? 'iso' : 'disk',
        format: info.format,
        virtualSize: info.virtual_size,
        actualSize: info.actual_size || stats.size,
        clusterSize: info.cluster_size,
        backingFile: info.backing_file,
        fullInfo: info
      };
    } catch (error) {
      console.error('Error getting image info:', error);
      throw error;
    }
  }
}

module.exports = ImageManager;
