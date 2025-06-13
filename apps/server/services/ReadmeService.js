// services/ReadmeService.js
const fs = require('fs').promises;
const path = require('path');

/**
 * @class ReadmeService
 * @description 处理项目README文件的服务类
 */
class ReadmeService {
  /**
   * 创建ReadmeService实例
   * @param {string} [rootDir=process.cwd()] - 项目根目录路径
   */
  constructor(rootDir = process.cwd()) {
    this.rootDir = rootDir;
    this.mainReadmePath = path.join(this.rootDir, 'README.md');
    this.frontendReadmePath = path.join(this.rootDir, 'front-end', 'README.md');
  }

  /**
   * 读取指定路径的README文件
   * @param {string} filePath - README文件的路径
   * @returns {Promise<string>} - README文件的内容
   * @private
   */
  async _readReadmeFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return `无法读取文件 ${filePath}: ${error.message}`;
    }
  }

  /**
   * 获取项目中的README文件内容
   * @returns {Promise<Object>} - 包含主README和前端README的对象
   */
  async getReadmeContents() {
    try {
      const [mainReadme, frontendReadme] = await Promise.all([
        this._readReadmeFile(this.mainReadmePath),
        this._readReadmeFile(this.frontendReadmePath)
      ]);
      
      return {
        mainReadme,
        frontendReadme
      };
    } catch (error) {
      console.error('Error getting README contents:', error);
      throw error;
    }
  }

  /**
   * 获取主项目README内容
   * @returns {Promise<string>} - 主项目README内容
   */
  async getMainReadme() {
    return this._readReadmeFile(this.mainReadmePath);
  }

  /**
   * 获取前端项目README内容
   * @returns {Promise<string>} - 前端项目README内容
   */
  async getFrontendReadme() {
    return this._readReadmeFile(this.frontendReadmePath);
  }
}

module.exports = ReadmeService;
