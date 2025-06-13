// routes/isos.js
const express = require('express')
const router = express.Router()
const SystemMonitorController = require('../controllers/systemMonitorController')

/**
 * @swagger
 * /api/systemMonitor/info:
 *   get:
 *     summary: 获取系统资源信息
 *     description: 获取当前系统的 CPU、内存、磁盘和网络使用情况
 *     tags:
 *       - 系统监控
 *     responses:
 *       200:
 *         description: 成功获取系统信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cpu:
 *                   type: object
 *                 memory:
 *                   type: object
 *                 disk:
 *                   type: object
 *                 network:
 *                   type: object
 *                 system:
 *                   type: object
 *                 qemu:
 *                   type: object
 */
router.get('/systemMonitor/info', SystemMonitorController.getSystemMonitorInfo)

module.exports = router
