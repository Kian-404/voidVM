import express from 'express'
import path from 'path'
import fs from 'fs/promises'
import multer from 'multer'
import archiver from 'archiver'
import mime from 'mime-types'
import { fileURLToPath } from 'url'

const router = express.Router()

// 配置文件存储路径
// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置文件存储路径
const STATIC_FILES_DIR = path.join(__dirname, '../static-files')

// 确保静态文件目录存在
const ensureDirectoryExists = async dirPath => {
  try {
    await fs.access(dirPath)
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true })
  }
}

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = req.body.path ? path.join(STATIC_FILES_DIR, req.body.path) : STATIC_FILES_DIR
    try {
      await ensureDirectoryExists(uploadPath)
      cb(null, uploadPath)
    } catch (error) {
      cb(error)
    }
  },
  filename: (req, file, cb) => {
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8')
    cb(null, originalName)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
})

// 获取文件列表
router.get('/list', async (req, res) => {
  try {
    const relativePath = req.query.path || ''
    const fullPath = path.join(STATIC_FILES_DIR, relativePath)

    // 确保路径安全性
    if (!fullPath.startsWith(STATIC_FILES_DIR)) {
      return res.status(400).json({ error: '无效的路径' })
    }

    await ensureDirectoryExists(STATIC_FILES_DIR)

    const items = await fs.readdir(fullPath, { withFileTypes: true })
    const fileList = []

    for (const item of items) {
      const itemPath = path.join(fullPath, item.name)
      const stats = await fs.stat(itemPath)

      fileList.push({
        name: item.name,
        isDirectory: item.isDirectory(),
        size: item.isDirectory() ? null : stats.size,
        modifiedTime: stats.mtime,
        path: path.join(relativePath, item.name).replace(/\\/g, '/'),
        mimeType: item.isDirectory() ? null : mime.lookup(item.name) || 'application/octet-stream',
      })
    }

    // 排序：目录在前，文件在后，按名称排序
    fileList.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1
      if (!a.isDirectory && b.isDirectory) return 1
      return a.name.localeCompare(b.name)
    })

    res.json({
      success: true,
      currentPath: relativePath,
      parentPath: relativePath ? path.dirname(relativePath).replace(/\\/g, '/') : null,
      files: fileList,
    })
  } catch (error) {
    res.status(500).json({ error: '读取文件列表失败', details: error.message })
  }
})

// 上传文件
router.post('/upload', upload.array('files'), async (req, res) => {
  try {
    const targetPath = req.body.path || ''
    const targetDir = path.join(STATIC_FILES_DIR, targetPath)

    // 确保目标目录存在
    await ensureDirectoryExists(targetDir)

    const uploadedFiles = []

    for (const file of req.files) {
      const originalName = file.filename.replace(/^temp_\d+_/, '')
      const finalPath = path.join(targetDir, originalName)

      // 移动文件到目标位置
      await fs.rename(file.path, finalPath)

      uploadedFiles.push({
        name: originalName,
        size: file.size,
        path: path.join(targetPath, originalName).replace(/\\/g, '/'),
      })
    }

    res.json({
      success: true,
      message: `成功上传 ${uploadedFiles.length} 个文件`,
      files: uploadedFiles,
    })
  } catch (error) {
    // 清理临时文件
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path)
        } catch (e) {
          // 忽略清理错误
        }
      }
    }
    res.status(500).json({ error: '文件上传失败', details: error.message })
  }
})

// 下载文件
router.get('/download', async (req, res) => {
  try {
    const filePath = req.query.path
    if (!filePath) {
      return res.status(400).json({ error: '缺少文件路径参数' })
    }

    const fullPath = path.join(STATIC_FILES_DIR, filePath)

    // 安全性检查
    if (!fullPath.startsWith(STATIC_FILES_DIR)) {
      return res.status(400).json({ error: '无效的文件路径' })
    }

    const stats = await fs.stat(fullPath)

    if (stats.isDirectory()) {
      // 如果是目录，创建ZIP压缩包
      const fileName = path.basename(fullPath) + '.zip'
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
      res.setHeader('Content-Type', 'application/zip')

      const archive = archiver('zip', { zlib: { level: 9 } })
      archive.pipe(res)
      archive.directory(fullPath, false)
      await archive.finalize()
    } else {
      // 单个文件下载
      const fileName = path.basename(fullPath)
      const mimeType = mime.lookup(fullPath) || 'application/octet-stream'

      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`)
      res.setHeader('Content-Type', mimeType)
      res.setHeader('Content-Length', stats.size)

      const fileStream = require('fs').createReadStream(fullPath)
      fileStream.pipe(res)
    }
  } catch (error) {
    res.status(500).json({ error: '文件下载失败', details: error.message })
  }
})

// 删除文件或目录
router.delete('/delete', async (req, res) => {
  try {
    const filePath = req.body.path
    if (!filePath) {
      return res.status(400).json({ error: '缺少文件路径参数' })
    }

    const fullPath = path.join(STATIC_FILES_DIR, filePath)

    // 安全性检查
    if (!fullPath.startsWith(STATIC_FILES_DIR)) {
      return res.status(400).json({ error: '无效的文件路径' })
    }

    const stats = await fs.stat(fullPath)

    if (stats.isDirectory()) {
      await fs.rmdir(fullPath, { recursive: true })
    } else {
      await fs.unlink(fullPath)
    }

    res.json({
      success: true,
      message: `成功删除 ${stats.isDirectory() ? '目录' : '文件'}: ${path.basename(filePath)}`,
    })
  } catch (error) {
    res.status(500).json({ error: '删除失败', details: error.message })
  }
})

// 创建目录
router.post('/mkdir', async (req, res) => {
  try {
    const { path: dirPath, name } = req.body
    if (!name) {
      return res.status(400).json({ error: '缺少目录名称' })
    }

    const fullPath = path.join(STATIC_FILES_DIR, dirPath || '', name)

    // 安全性检查
    if (!fullPath.startsWith(STATIC_FILES_DIR)) {
      return res.status(400).json({ error: '无效的路径' })
    }

    await fs.mkdir(fullPath, { recursive: true })

    res.json({
      success: true,
      message: `成功创建目录: ${name}`,
    })
  } catch (error) {
    res.status(500).json({ error: '创建目录失败', details: error.message })
  }
})

// 重命名文件或目录
router.put('/rename', async (req, res) => {
  try {
    const { oldPath, newName } = req.body
    if (!oldPath || !newName) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    const oldFullPath = path.join(STATIC_FILES_DIR, oldPath)
    const newFullPath = path.join(path.dirname(oldFullPath), newName)

    // 安全性检查
    if (!oldFullPath.startsWith(STATIC_FILES_DIR) || !newFullPath.startsWith(STATIC_FILES_DIR)) {
      return res.status(400).json({ error: '无效的路径' })
    }

    await fs.rename(oldFullPath, newFullPath)

    res.json({
      success: true,
      message: `成功重命名为: ${newName}`,
    })
  } catch (error) {
    res.status(500).json({ error: '重命名失败', details: error.message })
  }
})

// 获取文件内容（用于文本文件编辑）
router.get('/content', async (req, res) => {
  try {
    const filePath = req.query.path
    if (!filePath) {
      return res.status(400).json({ error: '缺少文件路径参数' })
    }

    const fullPath = path.join(STATIC_FILES_DIR, filePath)

    // 安全性检查
    if (!fullPath.startsWith(STATIC_FILES_DIR)) {
      return res.status(400).json({ error: '无效的文件路径' })
    }

    const stats = await fs.stat(fullPath)

    if (stats.isDirectory()) {
      return res.status(400).json({ error: '不能读取目录内容' })
    }

    // 检查文件大小，避免读取过大的文件
    if (stats.size > 1024 * 1024) {
      // 1MB
      return res.status(400).json({ error: '文件过大，无法在线编辑' })
    }

    const content = await fs.readFile(fullPath, 'utf8')

    res.json({
      success: true,
      content: content,
      size: stats.size,
      mimeType: mime.lookup(fullPath) || 'text/plain',
    })
  } catch (error) {
    res.status(500).json({ error: '读取文件内容失败', details: error.message })
  }
})

// 保存文件内容
router.put('/content', async (req, res) => {
  try {
    const { path: filePath, content } = req.body
    if (!filePath || content === undefined) {
      return res.status(400).json({ error: '缺少必要参数' })
    }

    const fullPath = path.join(STATIC_FILES_DIR, filePath)

    // 安全性检查
    if (!fullPath.startsWith(STATIC_FILES_DIR)) {
      return res.status(400).json({ error: '无效的文件路径' })
    }

    await fs.writeFile(fullPath, content, 'utf8')

    res.json({
      success: true,
      message: '文件保存成功',
    })
  } catch (error) {
    res.status(500).json({ error: '保存文件失败', details: error.message })
  }
})

export default router
