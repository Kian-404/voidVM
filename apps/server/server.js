const express = require('express')
const http = require('http')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')
const QemuManager = require('./qemu-manager')
const {
  corsHandler,
  devLogger,
  helmetConfig,
  preventParamPollution,
  generalLimiter,
  errorHandler,
} = require('./middleware')

const app = express()

// 基础中间件
app.use(helmetConfig)
app.use(corsHandler)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(preventParamPollution)
// 日志中间件
if (process.env.NODE_ENV === 'development') {
  app.use(devLogger)
}

// 限流中间件
app.use(generalLimiter)

const qemuManager = new QemuManager({
  vmStoragePath: path.join(__dirname, './vm-storage'),
})

// swagger
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger.js')

const setupWebSockets = require('./services/webSocketService.js')

const server = http.createServer(app)
// const wss = new WebSocket.Server({ server });
const port = process.env.PORT || 3000

// 中间件
app.use(bodyParser.json())
app.use(express.static('public'))

// 设置 Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// 提供 swagger.json 端点
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

app.use(errorHandler)
// websocket
setupWebSockets(server)

app.use('/', require('./routers/index.js'))
// 启动服务器
server.listen(port, '0.0.0.0', () => {
  console.log(`QEMU API server listening at http://localhost:${port}`)
})

// 优雅关闭
process.on('SIGINT', () => {
  console.log('Shutting down server...')
  // 停止所有虚拟机
  console.log('listRunningVMs all VMs...', qemuManager.listRunningVMs())
  qemuManager.listRunningVMs().forEach(vm => {
    let vmName = JSON.parse(vm).name
    console.log('Stopping VM: ', vmName)
    qemuManager.stopVM(vmName)
  })
  process.exit(0)
})
