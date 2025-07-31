// routes/vms.js
import express from 'express'
import vmsController from '../controllers/vmsController'
const router = express.Router()

/**
 * @swagger
 * /api/vms:
 *   post:
 *     summary: 创建新虚拟机
 *     tags: [VMs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VM'
 *     responses:
 *       201:
 *         description: 虚拟机创建成功
 *       400:
 *         description: 无效的请求参数
 */
router.post('/vms', vmsController.createVM)

/**
 * @swagger
 * /api/vms:
 *   get:
 *     summary: 获取所有虚拟机
 *     tags: [VMs]
 *     responses:
 *       200:
 *         description: 成功获取虚拟机列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 vms:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VM'
 */
router.get('/vms', vmsController.getAllVMs)

/**
 * @swagger
 * /api/vms/{name}/start:
 *   post:
 *     summary: 启动虚拟机
 *     tags: [VMs]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: 虚拟机名称
 *     responses:
 *       200:
 *         description: 虚拟机启动成功
 *       404:
 *         description: 虚拟机不存在
 *       400:
 *         description: 虚拟机已在运行或启动失败
 */
router.post('/vms/:name/start', vmsController.startVM)

/**
 * @swagger
 * /api/vms/{name}/stop:
 *   post:
 *     summary: 停止虚拟机
 *     tags: [VMs]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: 虚拟机名称
 *     responses:
 *       200:
 *         description: 虚拟机停止成功
 *       404:
 *         description: 虚拟机不存在
 *       400:
 *         description: 虚拟机未运行或停止失败
 */
router.post('/vms/:name/stop', vmsController.stopVM)
/**
 * @swagger
 * /api/vms/{name}/restart:
 *   post:
 *     summary: 重启虚拟机
 *     description: 重启指定的 QEMU 虚拟机
 *     tags: [VMs]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: 虚拟机名称
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - metadata
 *             properties:
 *               metadata:
 *                 type: object
 *                 required:
 *                   - lastPid
 *                 properties:
 *                   lastPid:
 *                     type: integer
 *                     description: 虚拟机当前的进程 ID
 *                     example: 12345
 *     responses:
 *       200:
 *         description: 虚拟机重启成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 虚拟机 test-vm 已成功重启
 *                 vm:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: test-vm
 *                     status:
 *                       type: string
 *                       example: running
 *                     pid:
 *                       type: integer
 *                       example: 12346
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-07-15T10:30:00.000Z
 *       404:
 *         description: 虚拟机未找到或重启失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 找不到虚拟机 test-vm 或无法重启
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 重启虚拟机时发生内部错误
 */
router.post('/vms/:name/restart', vmsController.restartVM)
/**
 * @swagger
 * /api/vms/{name}:
 *   delete:
 *     summary: 删除虚拟机
 *     description: 删除指定的 QEMU 虚拟机
 *     tags: [VMs]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: 虚拟机名称
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - metadata
 *             properties:
 *               metadata:
 *                 type: object
 *                 required:
 *                   - lastPid
 *                 properties:
 *                   lastPid:
 *                     type: integer
 *                     description: 虚拟机当前的进程 ID
 *                     example: 12345
 *     responses:
 *       200:
 *         description: 虚拟机重启成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 虚拟机 test-vm 已成功重启
 *                 vm:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: test-vm
 *                     status:
 *                       type: string
 *                       example: running
 *                     pid:
 *                       type: integer
 *                       example: 12346
 *                     startTime:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-07-15T10:30:00.000Z
 *       404:
 *         description: 虚拟机未找到或重启失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 找不到虚拟机 test-vm 或无法重启
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 重启虚拟机时发生内部错误
 */
router.delete('/vms/:name', vmsController.deleteVM)
// vnc
router.post('/novnc', vmsController.startNoVNC)
/**
 * @swagger
 * /api/novnc/{name}:
 *   post:
 *     summary: 启动 NoVNC 服务
 *     description: 为指定的虚拟机启动 NoVNC 服务，提供基于 Web 的 VNC 访问
 *     tags:  [VMs]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: 虚拟机名称
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vncPort
 *             properties:
 *               vncPort:
 *                 type: integer
 *                 description: QEMU VNC 服务的端口号
 *                 example: 5900
 *               webPort:
 *                 type: integer
 *                 description: NoVNC Web 服务的端口号 (可选，如不提供将使用默认端口)
 *                 example: 6080
 *     responses:
 *       200:
 *         description: NoVNC 服务启动成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 url:
 *                   type: string
 *                   description: NoVNC 访问 URL
 *                   example: http://localhost:6080/vnc.html?host=localhost&port=6080&path=websockify/?token=vm1
 *                 vncPort:
 *                   type: integer
 *                   description: QEMU VNC 端口
 *                   example: 5900
 *                 webPort:
 *                   type: integer
 *                   description: NoVNC Web 服务端口
 *                   example: 6080
 *                 token:
 *                   type: string
 *                   description: 用于连接的安全令牌
 *                   example: vm1
 *                 pid:
 *                   type: integer
 *                   description: NoVNC 进程 ID
 *                   example: 12345
 *       400:
 *         description: 请求错误或 NoVNC 启动失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 无法启动 NoVNC 服务：端口已被占用
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 内部服务器错误
 */
router.post('/novnc/:name', vmsController.startNoVNCForVM)

/**
 * @swagger
 * /vms/{name}/config:
 *   put:
 *     summary: 更新虚拟机配置
 *     description: 更新指定虚拟机的配置参数
 *     tags: [VMs]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: 虚拟机名称
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               memory:
 *                 type: integer
 *                 description: 内存大小 (MB)
 *                 example: 2048
 *               cpuCores:
 *                 type: integer
 *                 description: CPU 核心数
 *                 example: 2
 *               diskSize:
 *                 type: integer
 *                 description: 磁盘大小 (GB)
 *                 example: 20
 *               networkType:
 *                 type: string
 *                 description: 网络类型
 *                 enum: [user, bridge, nat]
 *                 example: user
 *               vncPort:
 *                 type: integer
 *                 description: VNC 端口
 *                 example: 5900
 *               bootOrder:
 *                 type: string
 *                 description: 启动顺序
 *                 example: cd,hd
 *               isoPath:
 *                 type: string
 *                 description: ISO 镜像路径
 *                 example: /path/to/image.iso
 *     responses:
 *       200:
 *         description: 配置更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 虚拟机 test-vm 配置已更新
 *                 requiresRestart:
 *                   type: boolean
 *                   description: 是否需要重启虚拟机才能应用更改
 *                   example: true
 *                 config:
 *                   type: object
 *                   description: 更新后的完整配置
 *                   properties:
 *                     memory:
 *                       type: integer
 *                       example: 2048
 *                     cpuCores:
 *                       type: integer
 *                       example: 2
 *                     diskSize:
 *                       type: integer
 *                       example: 20
 *                     networkType:
 *                       type: string
 *                       example: user
 *                     vncPort:
 *                       type: integer
 *                       example: 5900
 *                     bootOrder:
 *                       type: string
 *                       example: cd,hd
 *                     isoPath:
 *                       type: string
 *                       example: /path/to/image.iso
 *       404:
 *         description: 虚拟机未找到
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 找不到虚拟机 test-vm
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 更新配置时发生内部错误
 */
router.put('/vms/:name/config', vmsController.updateVMConfig)

/**
 * @swagger
 * /api/vms/{name}/toggleMountIso:
 *   post:
 *     summary: 切换虚拟机 ISO 镜像的挂载状态
 *     description: 根据请求参数挂载或卸载指定虚拟机的 ISO 镜像
 *     tags: [VMs]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: 虚拟机名称
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mountStatus
 *             properties:
 *               mountStatus:
 *                 type: boolean
 *                 description: 挂载状态，true 表示挂载 ISO，false 表示卸载 ISO
 *     responses:
 *       200:
 *         description: 操作成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: ISO successfully unmounted from VM 'test-vm'
 *                 vm:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: test-vm
 *                     isMountIso:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: 请求错误，如虚拟机名称缺失或虚拟机未运行
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: VM 'test-vm' is not running. Cannot unmount ISO from a stopped VM.
 *       404:
 *         description: 虚拟机未找到
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: VM 'test-vm' not found
 *       500:
 *         description: 服务器错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 */
router.post('/vms/:name/toggleMountIso', vmsController.toggleMountIso)

export default router
