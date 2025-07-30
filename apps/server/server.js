import express from 'express'
import http from 'http'
import path from 'path'
import bodyParser from 'body-parser'
import QemuManager from './qemu-manager.js'
import { setupCommonMiddlewares } from './middleware/index.js'
import setupWebSockets from './services/webSocketService.js'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './swagger.js'
import config from './config/index.js'

const qemuManager = new QemuManager({
  vmStoragePath: path.join(path.dirname(new URL(import.meta.url).pathname), './vm-storage'),
})

const port = process.env.PORT || config.port || 3000

const app = express()
const server = http.createServer(app)
setupCommonMiddlewares(app)

// 中间件
app.use(bodyParser.json())
app.use(express.static('public'))

if (process.env.NODE_ENV === 'development') {
  // 设置 Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

  // 提供 swagger.json 端点
  app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })
}

// websocket
setupWebSockets(server)

// 路由
app.use('/', (await import('./routers/index.js')).default)

// 启动服务器
server.listen(port, '0.0.0.0', () => {
  console.log(`QEMU API server listening at http://localhost:${port}`)
})

// 关闭程序时，停止所有虚拟机
process.on('SIGINT', async () => {
  console.log('Shutting down server...')

  // 停止所有虚拟机
  const runningVMs = qemuManager.listRunningVMs()
  console.log('listRunningVMs all VMs...', runningVMs)

  for (const vm of runningVMs) {
    let vmName = JSON.parse(vm).name
    console.log('Stopping VM: ', vmName)
    await qemuManager.stopVM(vmName)
  }

  process.exit(0)
})
