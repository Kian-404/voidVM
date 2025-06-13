// routes/fileTransfer.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
require("../config/index");
const {
  createSSHConnection,
  uploadFile,
  executeCommand,
  uploadFileViaSCP,
} = require("../utils/sshClient");

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

/**
 * @swagger
 * /files/upload-to-vm:
 *   post:
 *     summary: 上传文件到 QEMU 虚拟机
 *     description: 通过 SSH/SFTP 将文件上传到指定的 QEMU 虚拟机
 *     tags:
 *       - 文件管理
 *     consumes:
 *       - multipart/form-data
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: 要上传的文件
 *       - in: formData
 *         name: remotePath
 *         type: string
 *         required: false
 *         description: 远程目标目录路径，如不提供则使用用户主目录
 *       - in: formData
 *         name: host
 *         type: string
 *         required: false
 *         description: 虚拟机主机地址，默认使用环境变量中的配置
 *       - in: formData
 *         name: port
 *         type: integer
 *         required: false
 *         description: SSH 端口，默认为 22 或环境变量中的配置
 *       - in: formData
 *         name: username
 *         type: string
 *         required: false
 *         description: SSH 用户名，默认使用环境变量中的配置
 *       - in: formData
 *         name: password
 *         type: string
 *         format: password
 *         required: false
 *         description: SSH 密码，默认使用环境变量中的配置
 *       - in: formData
 *         name: executeCommand
 *         type: string
 *         required: false
 *         description: 文件上传后要执行的命令，例如修改权限
 *       - in: formData
 *         name: cleanupLocal
 *         type: boolean
 *         required: false
 *         description: 上传完成后是否删除本地临时文件
 *     responses:
 *       200:
 *         description: 文件上传成功
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: 文件成功上传到虚拟机
 *             localPath:
 *               type: string
 *               example: /tmp/uploads/1234567890-example.txt
 *             remotePath:
 *               type: string
 *               example: /home/user/example.txt
 *       400:
 *         description: 请求错误，如未提供文件
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               example: 没有文件被上传
 *       500:
 *         description: 服务器错误，如连接失败或权限问题
 *         schema:
 *           type: object
 *           properties:
 *             error:
 *               type: string
 *               example: 文件上传失败
 *             details:
 *               type: string
 *               example: 权限被拒绝。请确保用户有权限写入目录
 */
router.post("/files/upload-to-vm", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "没有文件被上传" });
  }

  const localFilePath = req.file.path;
  const remoteFilePath = req.body.remotePath
    ? `${req.body.remotePath}/${req.file.originalname}`
    : `/home/${process.env.VM_USER}/${req.file.originalname}`;

  let conn;
  const sshConfig = {
    host: req.body.host || process.env.VM_HOST,
    port: parseInt(req.body.port || process.env.VM_PORT || "22"),
    username: req.body.username || process.env.VM_USER,
    password: req.body.password || process.env.VM_PASSWORD,
    // 如果使用密钥认证，取消下面的注释
    // privateKey: fs.readFileSync(process.env.SSH_PRIVATE_KEY_PATH)
  };
  try {
    // 从环境变量或请求中获取SSH连接信息

    // 建立SSH连接
    conn = await createSSHConnection(sshConfig);
    console.log("localFilePath:", localFilePath);
    console.log("remoteFilePath:", remoteFilePath);

    // 上传文件
    await uploadFile(conn, localFilePath, remoteFilePath);

    // 如果需要，执行额外的命令（例如设置权限）
    if (req.body.executeCommand) {
      const { stdout, stderr } = await executeCommand(
        conn,
        req.body.executeCommand
      );
      console.log("命令执行结果:", stdout);
      if (stderr) console.error("命令错误输出:", stderr);
    }

    // 成功响应
    res.status(200).json({
      message: "文件成功上传到虚拟机",
      localPath: localFilePath,
      remotePath: remoteFilePath,
    });
  } catch (error) {
    console.log("文件上传失败:", error);
    // 提供更详细的错误信息
    // 在uploadFile失败后尝试SCP方式
    try {
      console.log("SFTP上传失败，尝试使用SCP方式...");
      await uploadFileViaSCP(conn, localFilePath, remoteFilePath);
      console.log("SCP上传成功");
    } catch (scpError) {
      console.error("SCP上传也失败:", scpError);
      // throw error; // 抛出原始SFTP错误
      res.status(500).json({
        error: "文件上传失败",
        details: error.message,
      });
    }
  } finally {
    // 关闭连接
    if (conn) conn.end();

    // 可选：清理上传的临时文件
    if (req.body.cleanupLocal) {
      try {
        await fs.remove(localFilePath);
        console.log("本地临时文件已删除");
      } catch (err) {
        console.error("删除本地文件失败:", err);
      }
    }
  }
});

module.exports = router;
