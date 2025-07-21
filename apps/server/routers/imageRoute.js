const express = require('express')
const router = express.Router()
const {
  uploadImageFile,
  imageController: ImageController,
} = require('../controllers/ImageController')

/**
 * @swagger
 * /api/images:
 *   get:
 *     summary: 获取所有镜像
 *     description: 获取所有 ISO 和磁盘镜像
 *     tags:
 *       - 镜像管理
 *     responses:
 *       200:
 *         description: 成功获取镜像列表
 */
router.get('/', ImageController.getAllImages)

/**
 * @swagger
 * /api/images/iso:
 *   get:
 *     summary: 获取所有 ISO 镜像
 *     description: 获取所有 ISO 镜像文件
 *     tags:
 *       - 镜像管理
 *     responses:
 *       200:
 *         description: 成功获取 ISO 镜像列表
 */
router.get('/iso', ImageController.getISOImages)

/**
 * @swagger
 * /api/images/disk:
 *   get:
 *     summary: 获取所有磁盘镜像
 *     description: 获取所有磁盘镜像文件
 *     tags:
 *       - 镜像管理
 *     responses:
 *       200:
 *         description: 成功获取磁盘镜像列表
 */
router.get('/disk', ImageController.getDiskImages)

/**
 * @swagger
 * /api/images/{id}:
 *   get:
 *     summary: 获取镜像详细信息
 *     description: 根据镜像 ID 获取详细信息
 *     tags:
 *       - 镜像管理
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 镜像 ID
 *     responses:
 *       200:
 *         description: 成功获取镜像信息
 *       404:
 *         description: 镜像不存在
 */
router.get('/:id', ImageController.getImageById)

/**
 * @swagger
 * /api/images/{id}:
 *   delete:
 *     summary: 删除镜像
 *     description: 根据镜像 ID 删除镜像文件
 *     tags:
 *       - 镜像管理
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 镜像 ID
 *     responses:
 *       200:
 *         description: 成功删除镜像
 *       404:
 *         description: 镜像不存在
 */
router.delete('/:id', ImageController.deleteImageById)

/**
 * @swagger
 * /api/images/{id}/rename:
 *   put:
 *     summary: 重命名镜像
 *     description: 根据镜像 ID 重命名镜像文件
 *     tags:
 *       - 镜像管理
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 镜像 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newName:
 *                 type: string
 *                 description: 新的镜像名称
 *     responses:
 *       200:
 *         description: 成功重命名镜像
 *       404:
 *         description: 镜像不存在
 */
router.put('/:id/rename', ImageController.renameImageById)

/**
 * @swagger
 * /api/images/disk/create:
 *   post:
 *     summary: 创建新的磁盘镜像
 *     description: 创建指定大小和格式的新磁盘镜像
 *     tags:
 *       - 镜像管理
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 镜像名称
 *               size:
 *                 type: number
 *                 description: 镜像大小 (GB)
 *               format:
 *                 type: string
 *                 description: 镜像格式 (qcow2, raw, img)
 *     responses:
 *       200:
 *         description: 成功创建磁盘镜像
 *       400:
 *         description: 参数错误
 */
router.post('/disk/create', ImageController.createDiskImage)

/**
 * @swagger
 * /api/images/upload:
 *   post:
 *     summary: 上传镜像文件
 *     description: 上传 ISO 或磁盘镜像文件
 *     tags:
 *       - 镜像管理
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: 成功上传镜像
 *       400:
 *         description: 上传失败
 */
router.post('/upload', uploadImageFile, ImageController.uploadImage)

module.exports = router
