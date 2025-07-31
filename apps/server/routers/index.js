// routes/index.js
import express from 'express'
import vmRoutes from './vms.js'
import isoRoutes from './isos.js'
import fileTransferRoutes from './fileTransfer'
import systemMonitorRoutes from './systemMonitor'
import imageRoutes from './imageRoute'
import readMeRoute from './readmeRoutes'
import networkRoutes from './network'
import staticFilesRoutes from './staticFiles'
import snapshotRoutes from './snapshot'

const router = express.Router()

// 挂载虚拟机路由
router.use('/api', vmRoutes)
router.use('/api/isos', isoRoutes)
router.use('/api', fileTransferRoutes)
router.use('/api/systemMonitor', systemMonitorRoutes)
router.use('/api/images', imageRoutes)
router.use('/api/readme', readMeRoute)
router.use('/api/network', networkRoutes)
router.use('/api/static-files', staticFilesRoutes)
router.use('/api/snapshots', snapshotRoutes)

// 可以添加更多路由...

export default router
