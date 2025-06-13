// routes/vms.js
const express = require('express');
const router = express.Router();
const QemuManager = require("../qemu-manager");
const path = require("path");
// API 路由
// 创建 QEMU 管理器实例
const qemuManager = new QemuManager({
  vmStoragePath: path.join(__dirname, "../vm-storage"),
});


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
router.post("/vms", async (req, res) => {
  try {
    const {
      vmName,
      diskSize,
      memory,
      cpuCores,
      isoPath,
      vncPort,
      networkType,
      portForwarding,
    } = req.body;
    const newVM = await qemuManager.createCompleteVM({
      vmName: vmName,
      diskSize: diskSize || "20G",
      memory: memory || 2048,
      cpuCores: cpuCores || 2,
      vncPort: vncPort || 0,
      networkType: networkType || "user",
      portForwarding: portForwarding || [
        { hostPort: 2222, guestPort: 22 },
        { hostPort: 8080, guestPort: 80 },
      ],
      isoPath: isoPath || "",
      bootOrder: "d",
      startAfterCreation: false,
    });
    res.status(201).json(newVM);
    console.log("VM created successfully:", newVM);
  } catch (error) {
    console.error("Failed to create VM:", error);
  }
});

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
router.get("/vms", async (req, res) => {
  const vmsList = await qemuManager.listAllVMs();
  res.json(vmsList);
});

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
router.post("/vms/:name/start", async (req, res) => {
  try {
    const {
      name,
      diskSize,
      memory,
      cpuCores,
      isoPath,
      vncPort,
      networkType,
      portForwarding,
      diskPath,
    } = req.body.config;
    console.log("req.body", req.body);

    const result = await qemuManager.startVM({
      vmName: name,
      diskSize: diskSize || "20G",
      diskPath: diskPath || "",
      isoPath: isoPath || "",
      memory: memory || 2048,
      cpuCores: cpuCores || 2,
      vncPort: vncPort || 0,
      networkType: networkType || "user",
      portForwarding: portForwarding || [
        { hostPort: 2222, guestPort: 22 },
        { hostPort: 8080, guestPort: 80 },
      ],
      isoPath: isoPath || "",
      bootOrder: "d",
    });
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

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
router.post("/vms/:name/stop", async (req, res) => {
  try {
    const { lastPid } = req.body.metadata;
    const name = req.params.name;
    console.log("name", name);
    const result = await qemuManager.stopVM(name, lastPid);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});
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
router.post("/vms/:name/restart", async (req, res) => {
  try {
    const { lastPid } = req.body.metadata;
    const name = req.params.name;
    console.log("name", name);
    const result = await qemuManager.restartVM(req.params.name, lastPid);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});
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
router.delete("/vms/:name", (req, res) => {
  try {
    const result = qemuManager.deleteVM(req.params.name, true);
    res.json(result);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});
// vnc
router.post("/novnc", async (req, res) => {
  try {
    const { vncPort, webPort } = req.body;
    console.log("vncPort", vncPort);
    console.log("webPort", webPort);
    // const novnc = await qemuManager.startNoVNC(vncPort, webPort);
    const novnc = await qemuManager.startNoVNC(vncPort, webPort);
    res.json(novnc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
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
router.post("/novnc/:name", async (req, res) => {
  try {
    const { vncPort, webPort } = req.body;
    // const novnc = await qemuManager.startNoVNC(vncPort, webPort);
    const novnc = await qemuManager.startNoVNC(vncPort, webPort);
    res.json(novnc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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
router.put("/vms/:name/config", async (req, res) => {
  try {
    const vmName = req.params.name;
    const newConfig = req.body;

    // 获取VM信息
    const vmInfo = await qemuManager.getVMInfo(vmName);

    if (!vmInfo) {
      return res.status(404).json({ error: `找不到虚拟机 ${vmName}` });
    }

    // 更新配置
    const updatedConfig = {
      ...vmInfo.config,
      ...newConfig,
    };

    // 保存更新后的配置
    await qemuManager.updateVMConfig(vmName, updatedConfig);

    // 如果VM正在运行，可能需要提醒用户某些更改需要重启才能生效
    const isRunning = vmInfo.status === "running";

    res.json({
      success: true,
      message: `虚拟机 ${vmName} 配置已更新`,
      requiresRestart: isRunning,
      config: updatedConfig,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
router.post("/vms/:name/toggleMountIso", async (req, res) => {
  try {
    const vmName = req.params.name;
    const { mountStatus } = req.body;

    if (!vmName) {
      return res.status(400).json({
        success: false,
        error: "VM name is required",
      });
    }

    console.log(`Received request to unmount ISO for VM: ${vmName}`);

    // 检查虚拟机是否存在
    const vmExists = await qemuManager.checkVMExists(vmName);
    if (!vmExists) {
      return res.status(404).json({
        success: false,
        error: `VM '${vmName}' not found`,
      });
    }

    // 检查虚拟机是否正在运行
    const isRunning = qemuManager.isVMRunning(vmName);

    // 如果虚拟机没有运行，返回错误
    if (!isRunning) {
      return res.status(400).json({
        success: false,
        error: `VM '${vmName}' is not running. Cannot unmount ISO from a stopped VM.`,
      });
    }

    // 调用 toggleMountIso 方法
    const result = await qemuManager.toggleMountIso(vmName, mountStatus);

    // 返回成功响应
    return res.json({
      success: true,
      message: `ISO successfully unmounted from VM '${vmName}'`,
      vm: {
        name: vmName,
        isMountIso: mountStatus,
        ...result,
      },
    });
  } catch (error) {
    console.error(`Error unmounting ISO: ${error.message}`);
    console.error(error.stack);

    // 返回错误响应
    return res.json({
      success: false,
      error: `Failed to unmount ISO: ${error.message}`,
    });
  }
});

module.exports = router;