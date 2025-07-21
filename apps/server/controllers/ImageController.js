const multer = require('multer')
const path = require('path')
const fs = require('fs-extra')
const imageManager = require('../utils/imageManager')

const ImageManager = new imageManager()

class ImageController {
  // GET /images
  async getAllImages(req, res) {
    try {
      const images = await ImageManager.getAllImages()
      res.json(images)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  // GET ISO
  async getISOImages(req, res) {
    try {
      const images = await ImageManager.getISOImages()
      res.json(images)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  // GET DISK
  async getDiskImages(req, res) {
    try {
      const images = await ImageManager.getDiskImages()
      res.json(images)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  // GET /images/:id
  async getImageById(req, res) {
    try {
      const images = await ImageManager.getAllImages()
      const image = images.find(img => img.id === req.params.id)

      if (!image) {
        return res.status(404).json({ error: '镜像不存在' })
      }

      const imageInfo = await ImageManager.getImageInfo(image.path)
      res.json(imageInfo)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  // DELETE /images/:id
  async deleteImageById(req, res) {
    try {
      const images = await ImageManager.getAllImages()
      const image = images.find(img => img.id === req.params.id)

      if (!image) {
        return res.status(404).json({ error: '镜像不存在' })
      }

      const result = await ImageManager.deleteImage(image.path)
      res.json(result)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  //PUT rename image
  async renameImageById(req, res) {
    try {
      const { newName } = req.body

      if (!newName) {
        return res.status(400).json({ error: '新名称不能为空' })
      }

      const images = await ImageManager.getAllImages()
      const image = images.find(img => img.id === req.params.id)

      if (!image) {
        return res.status(404).json({ error: '镜像不存在' })
      }

      const result = await ImageManager.renameImage(image.path, newName)
      res.json(result)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  //POST create disk image
  async createDiskImage(req, res) {
    try {
      const { name, size, format } = req.body

      if (!name || !size) {
        return res.status(400).json({ error: '名称和大小不能为空' })
      }

      const result = await ImageManager.createDiskImage(name, size, format)
      res.json(result)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }

  //POST upload image
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
          id: require('crypto').createHash('md5').update(filePath).digest('hex'),
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
    const destDir = isISO ? ImageManager.isoDir : ImageManager.diskDir
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

module.exports = {
  uploadImageFile: upload.single('file'),
  imageController,
}
