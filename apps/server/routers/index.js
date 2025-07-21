// routes/index.js
const express = require('express')
const vmRoutes = require('./vms.js')
const isoRoutes = require('./isos.js')
const fileTransferRoutes = require('./fileTransfer')
const systemMonitorRoutes = require('./systemMonitor')
const imageRoutes = require('./imageRoute')
const readMeRoute = require('./readmeRoutes')
const networkRoutes = require('./network')
const staticFilesRoutes = require('./staticFiles') // 新增
const snapshotRoutes = require('./snapshot')

const router = express.Router()

// 挂载虚拟机路由
router.use('/api', vmRoutes)
router.use('/api/isos', isoRoutes)
router.use('/api', fileTransferRoutes)
router.use('/api/systemMonitor', systemMonitorRoutes)
router.use('/api/images', imageRoutes)
router.use('/api/readme', readMeRoute)
router.use('/api/network', networkRoutes)
router.use('/api/static-files', staticFilesRoutes) // 新增
router.use('/api/snapshots', snapshotRoutes)

// 可以添加更多路由...

module.exports = router
