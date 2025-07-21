const systemMonitor = require('../utils/systemMonitor')
const WebSocket = require('ws')
const path = require('path')
class SystemMonitorServer {
  constructor(ws, qemuManager) {
    this.clients = new Set()
    this.qemuManager = qemuManager
    this.monitorInterval = null

    this.init(ws) // 初始化 WebSocket 服务
  }

  init(ws) {
    this.clients.add(ws)
    console.log('WebSocket client connected')

    // 立即发送一次数据
    this.sendSystemData(ws)

    ws.on('message', message => {
      try {
        const data = JSON.parse(message)
        this.handleMessage(ws, data)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    })

    ws.on('close', () => {
      this.clients.delete(ws)
      console.log('WebSocket client disconnected')
    })

    // 启动系统监控
    this.startMonitoring()
  }

  handleMessage(ws, data) {
    if (data.type === 'subscribe') {
      // 处理订阅请求
      ws.subscriptions = ws.subscriptions || []
      if (data.topic && !ws.subscriptions.includes(data.topic)) {
        ws.subscriptions.push(data.topic)
      }
    }
  }

  async sendSystemData(ws) {
    try {
      // 更新系统数据
      await systemMonitor.updateData()

      // 更新 QEMU 数据
      systemMonitor.updateQemuData(this.qemuManager)

      // 发送数据
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'systemData',
            data: systemMonitor.data,
          })
        )
      }
    } catch (error) {
      console.error('Error sending system data:', error)
    }
  }

  startMonitoring() {
    // 每 2 秒更新一次系统数据并广播
    this.monitorInterval = setInterval(() => {
      this.broadcastSystemData()
    }, 2000)
  }

  async broadcastSystemData() {
    if (this.clients.size === 0) return

    try {
      // 更新系统数据
      await systemMonitor.updateData()

      // 更新 QEMU 数据
      systemMonitor.updateQemuData(this.qemuManager)

      // 广播数据给所有客户端
      const data = JSON.stringify({
        type: 'systemData',
        data: systemMonitor.data,
      })

      this.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data)
        }
      })
    } catch (error) {
      console.error('Error broadcasting system data:', error)
    }
  }

  stop() {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval)
    }
  }
}

const handleSystemMonitorConnection = (ws, qemuManager) => {
  const webSocketServer = new SystemMonitorServer(ws, qemuManager)
  return webSocketServer
}
module.exports = handleSystemMonitorConnection
