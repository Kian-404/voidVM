// routes/readmeRoutes.js
import express from 'express'
import { ReadmeService } from '../services/ReadmeService'

const readmeService = new ReadmeService()

/**
 * @swagger
 * /api/readme:
 *   get:
 *     summary: 获取所有README文件内容
 *     description: 获取项目主README和前端README的内容
 *     tags:
 *       - 项目文档
 *     responses:
 *       200:
 *         description: 成功获取README内容
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mainReadme:
 *                   type: string
 *                   description: 主项目README内容
 *                 frontendReadme:
 *                   type: string
 *                   description: 前端项目README内容
 *       500:
 *         description: 服务器错误
 */
router.get('/', async (req, res) => {
  try {
    const readmeContents = await readmeService.getReadmeContents()
    res.json(readmeContents)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/readme/main:
 *   get:
 *     summary: 获取主项目README内容
 *     description: 获取项目根目录下的README.md文件内容
 *     tags:
 *       - 项目文档
 *     responses:
 *       200:
 *         description: 成功获取主README内容
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                   description: README文件内容
 *       500:
 *         description: 服务器错误
 */
router.get('/main', async (req, res) => {
  try {
    const content = await readmeService.getMainReadme()
    res.json({ content })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /api/readme/frontend:
 *   get:
 *     summary: 获取前端项目README内容
 *     description: 获取前端目录下的README.md文件内容
 *     tags:
 *       - 项目文档
 *     responses:
 *       200:
 *         description: 成功获取前端README内容
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                   description: README文件内容
 *       500:
 *         description: 服务器错误
 */
router.get('/frontend', async (req, res) => {
  try {
    const content = await readmeService.getFrontendReadme()
    res.json({ content })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
