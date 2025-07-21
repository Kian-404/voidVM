// routers/snapshot.js
const express = require('express')
const router = express.Router()
const snapshotController = require('../controllers/snapshotController')

/**
 * @swagger
 * components:
 *   schemas:
 *     Snapshot:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 快照唯一标识符
 *         name:
 *           type: string
 *           description: 快照名称
 *         vmName:
 *           type: string
 *           description: 虚拟机名称
 *         description:
 *           type: string
 *           description: 快照描述
 *         createTime:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         lastLoadTime:
 *           type: string
 *           format: date-time
 *           description: 最后加载时间
 *         status:
 *           type: string
 *           enum: [active, inactive, error]
 *           description: 快照状态
 *         size:
 *           type: number
 *           description: 快照大小（字节）
 *         metadata:
 *           type: object
 *           description: 元数据信息
 *       required:
 *         - id
 *         - name
 *         - vmName
 *         - createTime
 *         - status
 *       example:
 *         id: "snapshot_1640995200000_abc123"
 *         name: "before-update"
 *         vmName: "ubuntu-vm"
 *         description: "系统更新前的快照"
 *         createTime: "2024-01-01T10:00:00.000Z"
 *         status: "active"
 *         size: 1073741824
 *
 *     CreateSnapshotRequest:
 *       type: object
 *       properties:
 *         vmName:
 *           type: string
 *           description: 虚拟机名称
 *         snapshotName:
 *           type: string
 *           pattern: '^[a-zA-Z0-9_-]+$'
 *           description: 快照名称（只能包含字母、数字、下划线和连字符）
 *         description:
 *           type: string
 *           description: 快照描述
 *       required:
 *         - vmName
 *         - snapshotName
 *       example:
 *         vmName: "ubuntu-vm"
 *         snapshotName: "before-update"
 *         description: "系统更新前的快照"
 *
 *     LoadSnapshotRequest:
 *       type: object
 *       properties:
 *         vmName:
 *           type: string
 *           description: 虚拟机名称
 *         snapshotName:
 *           type: string
 *           description: 要加载的快照名称
 *       required:
 *         - vmName
 *         - snapshotName
 *       example:
 *         vmName: "ubuntu-vm"
 *         snapshotName: "before-update"
 *
 *     RenameSnapshotRequest:
 *       type: object
 *       properties:
 *         newName:
 *           type: string
 *           pattern: '^[a-zA-Z0-9_-]+$'
 *           description: 新的快照名称
 *         description:
 *           type: string
 *           description: 新的快照描述
 *       required:
 *         - newName
 *       example:
 *         newName: "system-backup"
 *         description: "系统备份快照"
 *
 *     SnapshotListResponse:
 *       type: object
 *       properties:
 *         snapshots:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Snapshot'
 *         pagination:
 *           type: object
 *           properties:
 *             total:
 *               type: number
 *               description: 总数量
 *             page:
 *               type: number
 *               description: 当前页码
 *             limit:
 *               type: number
 *               description: 每页数量
 *             totalPages:
 *               type: number
 *               description: 总页数
 *
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: 操作是否成功
 *         message:
 *           type: string
 *           description: 响应消息
 *         data:
 *           type: object
 *           description: 响应数据
 *         error:
 *           type: string
 *           description: 错误信息
 *       required:
 *         - success
 *       example:
 *         success: true
 *         message: "操作成功"
 *         data: {}
 *
 *   parameters:
 *     vmName:
 *       name: vmName
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *       description: 虚拟机名称
 *     snapshotName:
 *       name: snapshotName
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *       description: 快照名称
 *     page:
 *       name: page
 *       in: query
 *       schema:
 *         type: number
 *         minimum: 1
 *         default: 1
 *       description: 页码
 *     limit:
 *       name: limit
 *       in: query
 *       schema:
 *         type: number
 *         minimum: 1
 *         maximum: 100
 *         default: 20
 *       description: 每页数量
 *     sortBy:
 *       name: sortBy
 *       in: query
 *       schema:
 *         type: string
 *         enum: [createTime, name, size]
 *         default: createTime
 *       description: 排序字段
 *     order:
 *       name: order
 *       in: query
 *       schema:
 *         type: string
 *         enum: [asc, desc]
 *         default: desc
 *       description: 排序方式
 *
 * tags:
 *   name: Snapshots
 *   description: 虚拟机快照管理接口
 */

/**
 * @swagger
 * /api/snapshots/create:
 *   post:
 *     summary: 创建虚拟机快照
 *     description: 为指定的虚拟机创建一个新的快照
 *     tags: [Snapshots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSnapshotRequest'
 *     responses:
 *       200:
 *         description: 快照创建成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Snapshot'
 *             example:
 *               success: true
 *               message: "快照创建成功"
 *               data:
 *                 id: "snapshot_1640995200000_abc123"
 *                 name: "before-update"
 *                 vmName: "ubuntu-vm"
 *                 description: "系统更新前的快照"
 *                 createTime: "2024-01-01T10:00:00.000Z"
 *                 status: "active"
 *                 size: 1073741824
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "虚拟机名称和快照名称不能为空"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "创建快照失败"
 */
router.post('/create', snapshotController.createSnapshot)

/**
 * @swagger
 * /api/snapshots/load:
 *   post:
 *     summary: 加载虚拟机快照
 *     description: 将虚拟机恢复到指定快照的状态
 *     tags: [Snapshots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoadSnapshotRequest'
 *     responses:
 *       200:
 *         description: 快照加载成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         snapshotName:
 *                           type: string
 *                         loadTime:
 *                           type: string
 *                           format: date-time
 *             example:
 *               success: true
 *               message: "快照 \"before-update\" 加载成功"
 *               data:
 *                 snapshotName: "before-update"
 *                 loadTime: "2024-01-01T10:30:00.000Z"
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "虚拟机名称和快照名称不能为空"
 *       404:
 *         description: 快照或虚拟机不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "快照不存在"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "加载快照失败"
 */
router.post('/load', snapshotController.loadSnapshot)

/**
 * @swagger
 * /api/snapshots/{vmName}:
 *   get:
 *     summary: 获取虚拟机快照列表
 *     description: 分页获取指定虚拟机的所有快照
 *     tags: [Snapshots]
 *     parameters:
 *       - $ref: '#/components/parameters/vmName'
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/limit'
 *       - $ref: '#/components/parameters/sortBy'
 *       - $ref: '#/components/parameters/order'
 *     responses:
 *       200:
 *         description: 成功获取快照列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SnapshotListResponse'
 *             example:
 *               success: true
 *               data:
 *                 snapshots:
 *                   - id: "snapshot_1640995200000_abc123"
 *                     name: "before-update"
 *                     vmName: "ubuntu-vm"
 *                     description: "系统更新前的快照"
 *                     createTime: "2024-01-01T10:00:00.000Z"
 *                     status: "active"
 *                     size: 1073741824
 *                 pagination:
 *                   total: 5
 *                   page: 1
 *                   limit: 20
 *                   totalPages: 1
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "虚拟机名称不能为空"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "获取快照列表失败"
 */
router.get('/:vmName', snapshotController.getSnapshots)

/**
 * @swagger
 * /api/snapshots/{vmName}/{snapshotName}:
 *   get:
 *     summary: 获取快照详情
 *     description: 获取指定快照的详细信息
 *     tags: [Snapshots]
 *     parameters:
 *       - $ref: '#/components/parameters/vmName'
 *       - $ref: '#/components/parameters/snapshotName'
 *     responses:
 *       200:
 *         description: 成功获取快照详情
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Snapshot'
 *                         - type: object
 *                           properties:
 *                             qemuInfo:
 *                               type: object
 *                               description: QEMU相关信息
 *             example:
 *               success: true
 *               data:
 *                 id: "snapshot_1640995200000_abc123"
 *                 name: "before-update"
 *                 vmName: "ubuntu-vm"
 *                 description: "系统更新前的快照"
 *                 createTime: "2024-01-01T10:00:00.000Z"
 *                 status: "active"
 *                 size: 1073741824
 *                 qemuInfo:
 *                   id: "1"
 *                   tag: "before-update"
 *                   vmSize: "1024M"
 *                   date: "2024-01-01"
 *                   time: "10:00:00"
 *                   vmClock: "00:10:30.123"
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "虚拟机名称和快照名称不能为空"
 *       404:
 *         description: 快照不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "快照不存在"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "获取快照详情失败"
 *   delete:
 *     summary: 删除虚拟机快照
 *     description: 删除指定的虚拟机快照
 *     tags: [Snapshots]
 *     parameters:
 *       - $ref: '#/components/parameters/vmName'
 *       - $ref: '#/components/parameters/snapshotName'
 *     responses:
 *       200:
 *         description: 快照删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "快照 \"before-update\" 删除成功"
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "虚拟机名称和快照名称不能为空"
 *       404:
 *         description: 快照或虚拟机不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "快照不存在"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "删除快照失败"
 */
router.get('/:vmName/:snapshotName', snapshotController.getSnapshotDetail)
router.delete('/:vmName/:snapshotName', snapshotController.deleteSnapshot)

/**
 * @swagger
 * /api/snapshots/{vmName}/{snapshotName}/rename:
 *   put:
 *     summary: 重命名虚拟机快照
 *     description: 重命名指定的虚拟机快照并可选择更新描述
 *     tags: [Snapshots]
 *     parameters:
 *       - $ref: '#/components/parameters/vmName'
 *       - $ref: '#/components/parameters/snapshotName'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RenameSnapshotRequest'
 *     responses:
 *       200:
 *         description: 快照重命名成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Snapshot'
 *             example:
 *               success: true
 *               message: "快照重命名成功"
 *               data:
 *                 id: "snapshot_1640995200000_abc123"
 *                 name: "system-backup"
 *                 vmName: "ubuntu-vm"
 *                 description: "系统备份快照"
 *                 createTime: "2024-01-01T10:00:00.000Z"
 *                 updateTime: "2024-01-01T11:00:00.000Z"
 *                 status: "active"
 *                 size: 1073741824
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             examples:
 *               missing_params:
 *                 summary: 缺少必要参数
 *                 value:
 *                   success: false
 *                   error: "参数不完整"
 *               invalid_name:
 *                 summary: 快照名称格式错误
 *                 value:
 *                   success: false
 *                   error: "快照名称只能包含字母、数字、下划线和连字符"
 *               name_exists:
 *                 summary: 新名称已存在
 *                 value:
 *                   success: false
 *                   error: "新快照名称已存在"
 *       404:
 *         description: 快照或虚拟机不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "原快照不存在"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "重命名快照失败"
 */
router.put('/:vmName/:snapshotName/rename', snapshotController.renameSnapshot)

module.exports = router
