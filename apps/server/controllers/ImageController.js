import multer from 'multer'
import path from 'path'
import fs from 'fs-extra'
import ImageManager from '../utils/imageManager.js'
import crypto from 'crypto'

const imageManager = new ImageManager()

class ImageController {
  // GET /images
  async getAllImages(req, res) {
    try {
      const images = await imageManager.getAllImages()
      res.json(images)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  // GET ISO
  async getISOImages(req, res) {
    try {
      const images = await imageManager.getISOImages()
      res.json(images)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  // GET DISK
  async getDiskImages(req, res) {
    try {
      const images = await imageManager.getDiskImages()
      res.json(images)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  // GET /images/:id
  async getImageById(req, res) {
    try {
      const images = await imageManager.getAllImages()
      const image = images.find(img => img.id === req.params.id)

      if (!image) {
        return res.status(404).json({ error: '镜像不存在' })
      }

      const imageInfo = await imageManager.getImageInfo(image.path)
      res.json(imageInfo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  // DELETE /images/:id
  async deleteImageById(req, res) {
    try {
      const images = await imageManager.getAllImages()
      const image = images.find(img => img.id === req.params.id)

      if (!image) {
        return res.status(404).json({ error: '镜像不存在' })
      }

      const result = await imageManager.deleteImage(image.path)
      res.json(result)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  // PUT rename image
  async renameImageById(req, res) {
    try {
      const { newName } = req.body

      if (!newName) {
        return res.status(400).json({ error: '新名称不能为空' })
      }

      const images = await imageManager.getAllImages()
      const image = images.find(img => img.id === req.params.id)

      if (!image) {
        return res.status(404).json({ error: '镜像不存在' })
      }

      const result = await imageManager.renameImage(image.path, newName)
      res.json(result)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  // POST create disk image
  async createDiskImage(req, res) {
    try {
      const { name, size, format } = req.body

      if (!name || !size) {
        return res.status(400).json({ error: '名称和大小不能为空' })
      }

      const result = await imageManager.createDiskImage(name, size, format)
      res.json(result)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  // POST upload image
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: '没有文件被上传' })
      }

      // 获取上传的文件信息
      const filePath = req.file.path
      const stats = await fs.stat(filePath)

      // 判断文件类型
      const isISO = req.file.originalname.toLowerCase().endsWith('.iso')
      const type = isISO ? 'iso' : 'disk'

      // 返回文件信息
      res.json({
        success: true,
        message: '文件上传成功',
        image: {
          id: crypto.createHash('md5').update(filePath).digest('hex'),
          name: req.file.originalname,
          path: filePath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          type: type,
          format: type === 'disk' ? path.extname(req.file.originalname).substring(1) : undefined,
        },
      })
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 根据文件类型选择目标目录
    const isISO = file.originalname.toLowerCase().endsWith('.iso')
    const destDir = isISO ? imageManager.isoDir : imageManager.diskDir
    cb(null, destDir)
  },
  filename: (req, file, cb) => {
    // 使用原始文件名
    cb(null, file.originalname)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 * 1024 }, // 10GB 限制
})

const imageController = new ImageController()

export default { uploadImageFile: upload.single('file'), imageController }
