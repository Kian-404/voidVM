// controllers/systemMonitorController.js
import SystemMonitor from '../utils/systemMonitor.js'

class SystemMonitorController {
  constructor() {
    this.systemMonitor = new SystemMonitor()
  }

  // GET systemMonitorInfo
  async getSystemMonitorInfo(req, res) {
    try {
      await this.systemMonitor.updateData()
      res.json(this.systemMonitor.data)
    } catch (error) {
      console.error('获取系统监控信息失败:', error)
      res.status(500).json({ error: error.message || '获取系统监控信息失败' })
    }
  }
}

// 创建 SystemMonitorController 实例并导出
const systemMonitorController = new SystemMonitorController()

export { systemMonitorController }
