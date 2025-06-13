const systemMonitor = require('../utils/systemMonitor')

class SystemMonitorController {
  // GET systemMonitorInfo
  async getSystemMonitorInfo(req, res) {
    try {
      await systemMonitor.updateData()
      res.json(systemMonitor.data)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

module.exports = new SystemMonitorController()
