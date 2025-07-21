const WebSocket = require('ws')
const path = require('path')
const handleVMStatusConnection = require('./vmStatusService')
const handleSSHConnection = require('./sshService')
const handleSystemMonitorConnection = require('./systemMonitorService')
const QemuManager = require('../qemu-manager')
const qemuManager = new QemuManager({
  vmStoragePath: path.join(__dirname, '../vm-storage'),
})

function setupWebSockets(server) {
  const wss = new WebSocket.Server({ server })

  wss.on('connection', (ws, req) => {
    console.log('Client connected')

    // 解析请求路径
    const url = new URL(req.url, `http://${req.headers.host}`)
    const path = url.pathname

    // 根据路径分发到不同的处理程序
    if (path === '/api/ssh') {
      handleSSHConnection(ws, req, url)
    } else if (path === '/api/vm-status') {
      handleVMStatusConnection(ws, qemuManager)
    } else if (path === '/api/system-monitor') {
      handleSystemMonitorConnection(ws, qemuManager)
    } else {
      console.log(`Unknown WebSocket path: ${path}`)
      ws.close(1008, 'Unsupported path')
    }
  })
}

module.exports = setupWebSockets
