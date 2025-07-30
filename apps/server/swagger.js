import swaggerJsdoc from 'swagger-jsdoc'
import config from './config/index.js'

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'QEMU 虚拟机管理 API',
      version: '1.0.0',
      description: '用于管理 QEMU 虚拟机的 RESTful API',
      contact: {
        name: '开发团队',
        url: 'https://yourwebsite.com',
        email: 'dev@yourwebsite.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port || 3000}`, // 开发环境
        description: '开发服务器',
      },
      {
        url: 'http://10.64.60.185:3030', // 你的实际服务器地址
        description: '生产服务器',
      },
    ],
  },
  // 指定包含 API 注释的文件路径
  apis: ['./routers/*.js', './swagger.js'], // 包含路由文件和当前文件
}

// 在当前文件中定义通用的 Swagger 组件
/**
 * @swagger
 * components:
 *   schemas:
 *     VM:
 *       type: object
 *       required:
 *         - name
 *         - diskPath
 *       properties:
 *         name:
 *           type: string
 *           description: 虚拟机名称
 *         memory:
 *           type: integer
 *           description: 内存大小 (MB)
 *         cpuCores:
 *           type: integer
 *           description: CPU 核心数
 *         diskPath:
 *           type: string
 *           description: 磁盘镜像路径
 *         isoPath:
 *           type: string
 *           description: ISO 镜像路径
 *         vncPort:
 *           type: integer
 *           description: VNC 端口
 *         status:
 *           type: string
 *           description: 虚拟机状态
 *         isMountIso:
 *           type: boolean
 *           description: ISO 是否已挂载
 *
 *   responses:
 *     NotFound:
 *       description: 资源未找到
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: 资源未找到
 *
 *     BadRequest:
 *       description: 无效的请求参数
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: string
 *                 example: 无效的请求参数
 */

/**
 * @swagger
 * tags:
 *   name: VMs
 *   description: 虚拟机管理 API
 */

const swaggerSpec = swaggerJsdoc(swaggerOptions)

export default swaggerSpec
