// routes/isos.js
const express = require('express')
const router = express.Router()

const IsoController = require('../controllers/IsoController')

/**
 * @swagger
 * /api/isos:
 *   get:
 *     summary: 获取可用的 ISO 镜像列表
 *     tags: [ISOs]
 *     responses:
 *       200:
 *         description: 成功获取 ISO 列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 isos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       path:
 *                         type: string
 *                       size:
 *                         type: string
 *                       lastModified:
 *                         type: string
 */
router.get('/', IsoController.getIsos)

module.exports = router
