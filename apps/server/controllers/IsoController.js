const fs = require('fs').promises
const path = require('path')

class IsoController {
  // GET /iso
  async getIsos(req, res) {
    try {
      // ISO 文件夹路径，根据你的项目结构调整
      const isoDir = path.join(__dirname, '../iso')

      // 确保目录存在
      try {
        await fs.access(isoDir)
      } catch (error) {
        // 如果目录不存在，创建它
        if (error.code === 'ENOENT') {
          await fs.mkdir(isoDir, { recursive: true })
        } else {
          throw error
        }
      }

      // 读取目录内容
      const files = await fs.readdir(isoDir)

      // 过滤出 ISO 文件并获取详细信息
      const isoFiles = []

      for (const file of files) {
        // 只处理 .iso 文件
        if (file.toLowerCase().endsWith('.iso')) {
          const filePath = path.join(isoDir, file)
          const stats = await fs.stat(filePath)

          // 格式化文件大小
          const sizeInMB = stats.size / (1024 * 1024)
          let sizeStr

          if (sizeInMB < 1024) {
            sizeStr = `${sizeInMB.toFixed(2)} MB`
          } else {
            sizeStr = `${(sizeInMB / 1024).toFixed(2)} GB`
          }

          isoFiles.push({
            name: file,
            path: filePath,
            size: sizeStr,
            lastModified: stats.mtime.toISOString(),
          })
        }
      }

      // 按文件名排序
      isoFiles.sort((a, b) => a.name.localeCompare(b.name))

      res.status(200).json({
        success: true,
        isos: isoFiles,
      })
    } catch (error) {
      console.error('获取 ISO 列表错误:', error)
      res.status(500).json({
        success: false,
        error: `获取 ISO 列表失败: ${error.message}`,
      })
    }
  }
}

module.exports = new IsoController()
