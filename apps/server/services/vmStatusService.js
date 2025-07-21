// src/services/vmStatus.ts
const path = require('path')
const QemuManager = require('../qemu-manager')
const qemuManager = new QemuManager({
  vmStoragePath: path.join(__dirname, '../vm-storage'),
})

const handleVMStatusConnection = (ws, qemuManager) => {
  console.log('Status client connected')

  // 发送当前 VM 状态
  const sendStatus = async () => {
    const vms = await qemuManager.listAllVMs()
    ws.send(JSON.stringify({ type: 'vmStatus', data: vms }))
  }

  // 初始状态
  sendStatus()

  // 设置定期更新
  const interval = setInterval(sendStatus, 5000)

  ws.on('close', () => {
    clearInterval(interval)
    console.log('Client disconnected')
  })
}
module.exports = handleVMStatusConnection
