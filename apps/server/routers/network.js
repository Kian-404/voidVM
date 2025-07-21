// src/routes/network.js
const express = require('express')
const NetworkController = require('../controllers/networkController')
const router = express.Router()
const networkController = new NetworkController()

/**
 * @swagger
 * components:
 *   schemas:
 *     BridgeConfig:
 *       type: object
 *       required:
 *         - name
 *         - ip
 *       properties:
 *         name:
 *           type: string
 *           description: 桥接网络名称
 *           example: "br0"
 *         ip:
 *           type: string
 *           format: ipv4
 *           description: 桥接网络IP地址
 *           example: "192.168.100.1"
 *         netmask:
 *           type: string
 *           format: ipv4
 *           description: 子网掩码
 *           default: "255.255.255.0"
 *           example: "255.255.255.0"
 *         dhcp:
 *           type: boolean
 *           description: 是否启用DHCP服务
 *           default: false
 *         dhcpStart:
 *           type: string
 *           format: ipv4
 *           description: DHCP起始地址
 *           example: "192.168.100.10"
 *         dhcpEnd:
 *           type: string
 *           format: ipv4
 *           description: DHCP结束地址
 *           example: "192.168.100.100"
 *
 *     BridgeInfo:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: 桥接名称
 *         ip:
 *           type: string
 *           description: IP地址
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: 桥接状态
 *         created:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *
 *     TapConfig:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: TAP接口名称
 *           example: "tap0"
 *         bridge:
 *           type: string
 *           description: 要连接的桥接名称
 *           example: "br0"
 *
 *     PortForwardRule:
 *       type: object
 *       required:
 *         - hostPort
 *         - guestIP
 *         - guestPort
 *       properties:
 *         hostPort:
 *           type: integer
 *           minimum: 1
 *           maximum: 65535
 *           description: 主机端口
 *           example: 8080
 *         guestIP:
 *           type: string
 *           format: ipv4
 *           description: 客户机IP地址
 *           example: "192.168.100.10"
 *         guestPort:
 *           type: integer
 *           minimum: 1
 *           maximum: 65535
 *           description: 客户机端口
 *           example: 80
 *         protocol:
 *           type: string
 *           enum: [tcp, udp]
 *           default: tcp
 *           description: 协议类型
 *
 *     TrafficControlConfig:
 *       type: object
 *       required:
 *         - interface
 *       properties:
 *         interface:
 *           type: string
 *           description: 网络接口名称
 *           example: "eth0"
 *         bandwidth:
 *           type: string
 *           pattern: '^\d+(kbit|mbit|gbit)$'
 *           default: "100mbit"
 *           description: 带宽限制
 *           example: "100mbit"
 *         delay:
 *           type: string
 *           pattern: '^\d+(ms|s)$'
 *           default: "0ms"
 *           description: 延迟时间
 *           example: "10ms"
 *         loss:
 *           type: string
 *           pattern: '^\d+(\.\d+)?%$'
 *           default: "0%"
 *           description: 丢包率
 *           example: "1%"
 *
 *     NetworkInterface:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: 接口名称
 *         status:
 *           type: string
 *           enum: [up, down]
 *           description: 接口状态
 *         type:
 *           type: string
 *           description: 接口类型
 *         mtu:
 *           type: integer
 *           description: 最大传输单元
 *         addresses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               family:
 *                 type: string
 *                 enum: [inet, inet6]
 *               local:
 *                 type: string
 *               prefixlen:
 *                 type: integer
 *
 *     NetworkStats:
 *       type: object
 *       properties:
 *         interface:
 *           type: string
 *           description: 接口名称
 *         rx:
 *           type: object
 *           properties:
 *             bytes:
 *               type: integer
 *               description: 接收字节数
 *             packets:
 *               type: integer
 *               description: 接收包数
 *             errors:
 *               type: integer
 *               description: 接收错误数
 *             dropped:
 *               type: integer
 *               description: 接收丢弃数
 *             rate:
 *               type: integer
 *               description: 接收速率(字节/秒)
 *         tx:
 *           type: object
 *           properties:
 *             bytes:
 *               type: integer
 *               description: 发送字节数
 *             packets:
 *               type: integer
 *               description: 发送包数
 *             errors:
 *               type: integer
 *               description: 发送错误数
 *             dropped:
 *               type: integer
 *               description: 发送丢弃数
 *             rate:
 *               type: integer
 *               description: 发送速率(字节/秒)
 *         timestamp:
 *           type: integer
 *           description: 统计时间戳
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
 */

/**
 * @swagger
 * tags:
 *   name: Network
 *   description: 网络管理相关API
 */

/**
 * @swagger
 * /api/network/bridges:
 *   post:
 *     summary: 创建桥接网络
 *     description: 创建一个新的桥接网络，可以配置IP地址、子网掩码和DHCP服务
 *     tags: [Network]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BridgeConfig'
 *           example:
 *             name: "br-vm"
 *             ip: "192.168.100.1"
 *             netmask: "255.255.255.0"
 *             dhcp: true
 *             dhcpStart: "192.168.100.10"
 *             dhcpEnd: "192.168.100.100"
 *     responses:
 *       201:
 *         description: 桥接网络创建成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/BridgeInfo'
 *             example:
 *               success: true
 *               message: "Bridge br-vm created successfully"
 *               data:
 *                 name: "br-vm"
 *                 ip: "192.168.100.1/24"
 *                 status: "active"
 *                 created: "2024-01-01T10:00:00Z"
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "Bridge name is required"
 *       409:
 *         description: 桥接网络已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "Bridge br-vm already exists"
 */
router.post('/bridges', networkController.createBridge.bind(networkController))

/**
 * @swagger
 * /api/network/bridges/{name}:
 *   delete:
 *     summary: 删除桥接网络
 *     description: 删除指定名称的桥接网络
 *     tags: [Network]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: 桥接网络名称
 *         example: "br0"
 *     responses:
 *       200:
 *         description: 桥接网络删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Bridge br0 deleted successfully"
 *       400:
 *         description: 删除失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "Failed to delete bridge br0: bridge is in use"
 *       404:
 *         description: 桥接网络不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "Bridge br0 not found"
 */
router.delete('/bridges/:name', networkController.deleteBridge.bind(networkController))

/**
 * @swagger
 * /api/network/bridges:
 *   get:
 *     summary: 获取所有网络接口
 *     description: 获取系统中所有可用的网络接口信息，包括桥接、TAP等
 *     tags: [Network]
 *     responses:
 *       200:
 *         description: 成功获取网络接口列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NetworkInterface'
 *             example:
 *               success: true
 *               data:
 *                 - name: "br0"
 *                   status: "up"
 *                   type: "bridge"
 *                   mtu: 1500
 *                   addresses:
 *                     - family: "inet"
 *                       local: "192.168.100.1"
 *                       prefixlen: 24
 *                 - name: "tap0"
 *                   status: "up"
 *                   type: "tap"
 *                   mtu: 1500
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "Failed to get network interfaces"
 */
router.get('/bridges', networkController.getInterfaces.bind(networkController))

/**
 * @swagger
 * /api/network/tap:
 *   post:
 *     summary: 创建TAP接口
 *     description: 创建一个新的TAP网络接口，可选择连接到指定的桥接网络
 *     tags: [Network]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TapConfig'
 *           example:
 *             name: "tap-vm1"
 *             bridge: "br0"
 *     responses:
 *       201:
 *         description: TAP接口创建成功
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
 *                         name:
 *                           type: string
 *                         bridge:
 *                           type: string
 *                         status:
 *                           type: string
 *                         created:
 *                           type: string
 *                           format: date-time
 *             example:
 *               success: true
 *               message: "TAP interface tap-vm1 created successfully"
 *               data:
 *                 name: "tap-vm1"
 *                 bridge: "br0"
 *                 status: "active"
 *                 created: "2024-01-01T10:00:00Z"
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "TAP interface name is required"
 */
router.post('/tap', networkController.createTap.bind(networkController))
/**
 * @swagger
 * /api/network/port-forward:
 *   post:
 *     summary: 设置端口转发规则
 *     description: 创建一个新的端口转发规则，将主机端口流量转发到虚拟机
 *     tags: [Network]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PortForwardRule'
 *           example:
 *             hostPort: 8080
 *             guestIP: "192.168.100.10"
 *             guestPort: 80
 *             protocol: "tcp"
 *     responses:
 *       201:
 *         description: 端口转发规则创建成功
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
 *                         hostPort:
 *                           type: integer
 *                         guestIP:
 *                           type: string
 *                         guestPort:
 *                           type: integer
 *                         protocol:
 *                           type: string
 *                         created:
 *                           type: string
 *                           format: date-time
 *             example:
 *               success: true
 *               message: "Port forward rule created successfully"
 *               data:
 *                 hostPort: 8080
 *                 guestIP: "192.168.100.10"
 *                 guestPort: 80
 *                 protocol: "tcp"
 *                 created: "2024-01-01T10:00:00Z"
 *       400:
 *         description: 请求参数错误或端口冲突
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "Port 8080 is already in use"
 *       422:
 *         description: 参数验证失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "Invalid IP address format"
 */
router.post('/port-forward', networkController.setupPortForward.bind(networkController))

/**
 * @swagger
 * /api/network/traffic-control:
 *   post:
 *     summary: 配置网络流量控制
 *     description: 为指定网络接口配置带宽限制、延迟和丢包率等流量控制参数
 *     tags: [Network]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TrafficControlConfig'
 *           example:
 *             interface: "tap0"
 *             bandwidth: "50mbit"
 *             delay: "10ms"
 *             loss: "0.1%"
 *     responses:
 *       200:
 *         description: 流量控制配置成功
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
 *                         interface:
 *                           type: string
 *                         bandwidth:
 *                           type: string
 *                         delay:
 *                           type: string
 *                         loss:
 *                           type: string
 *                         applied:
 *                           type: string
 *                           format: date-time
 *             example:
 *               success: true
 *               message: "Traffic control configured successfully"
 *               data:
 *                 interface: "tap0"
 *                 bandwidth: "50mbit"
 *                 delay: "10ms"
 *                 loss: "0.1%"
 *                 applied: "2024-01-01T10:00:00Z"
 *       400:
 *         description: 配置参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "Invalid bandwidth format"
 *       404:
 *         description: 网络接口不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "Network interface tap0 not found"
 */
router.post('/traffic-control', networkController.setupTrafficControl.bind(networkController))

/**
 * @swagger
 * /api/network/stats/{interface}:
 *   get:
 *     summary: 获取网络接口统计信息
 *     description: 获取指定网络接口的详细统计信息，包括收发包数、字节数、错误数等
 *     tags: [Network]
 *     parameters:
 *       - in: path
 *         name: interface
 *         required: true
 *         schema:
 *           type: string
 *         description: 网络接口名称
 *         example: "eth0"
 *       - in: query
 *         name: realtime
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否获取实时统计信息
 *         example: true
 *     responses:
 *       200:
 *         description: 成功获取网络统计信息
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/NetworkStats'
 *             example:
 *               success: true
 *               data:
 *                 interface: "eth0"
 *                 rx:
 *                   bytes: 1048576
 *                   packets: 1024
 *                   errors: 0
 *                   dropped: 0
 *                   rate: 1024
 *                 tx:
 *                   bytes: 524288
 *                   packets: 512
 *                   errors: 0
 *                   dropped: 0
 *                   rate: 512
 *                 timestamp: 1704110400000
 *       404:
 *         description: 网络接口不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "Network interface eth0 not found"
 *       500:
 *         description: 获取统计信息失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "Failed to get network statistics"
 */
router.get('/stats/:interface', networkController.getNetworkStats.bind(networkController))
/**
 * @swagger
 * /api/network/tap:
 *   get:
 *     summary: 获取所有TAP接口
 *     description: 获取系统中所有TAP接口的列表，包括详细配置信息
 *     tags: [Network]
 *     responses:
 *       200:
 *         description: 成功获取TAP接口列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: TAP接口名称
 *                           type:
 *                             type: string
 *                             description: 接口类型
 *                           status:
 *                             type: string
 *                             enum: [up, down]
 *                             description: 接口状态
 *                           bridge:
 *                             type: string
 *                             description: 连接的桥接名称
 *                           ip:
 *                             type: string
 *                             description: IP地址
 *                           mac:
 *                             type: string
 *                             description: MAC地址
 *                           mtu:
 *                             type: integer
 *                             description: 最大传输单元
 *                           created:
 *                             type: string
 *                             format: date-time
 *                             description: 创建时间
 *             example:
 *               success: true
 *               data:
 *                 - name: "tap0"
 *                   type: "tap"
 *                   status: "up"
 *                   bridge: "br0"
 *                   ip: null
 *                   mac: "52:54:00:12:34:56"
 *                   mtu: 1500
 *                   created: "2024-01-01T10:00:00Z"
 *                 - name: "tap1"
 *                   type: "tap"
 *                   status: "up"
 *                   bridge: null
 *                   ip: null
 *                   mac: "52:54:00:12:34:57"
 *                   mtu: 1500
 *                   created: "2024-01-01T11:00:00Z"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "Failed to get TAP interfaces"
 */
router.get('/tap', networkController.getTapInterfaces.bind(networkController))
/**
 * @swagger
 * /api/network/tap/{name}:
 *   get:
 *     summary: 获取TAP接口详细信息
 *     description: 获取指定TAP接口的详细信息，包括网络统计数据
 *     tags: [Network]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: TAP接口名称
 *         example: "tap0"
 *     responses:
 *       200:
 *         description: 成功获取TAP接口详细信息
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
 *                         name:
 *                           type: string
 *                         type:
 *                           type: string
 *                         status:
 *                           type: string
 *                         bridge:
 *                           type: string
 *                         ip:
 *                           type: string
 *                         mac:
 *                           type: string
 *                         mtu:
 *                           type: integer
 *                         created:
 *                           type: string
 *                           format: date-time
 *                         statistics:
 *                           $ref: '#/components/schemas/NetworkStats'
 *             example:
 *               success: true
 *               data:
 *                 name: "tap0"
 *                 type: "tap"
 *                 status: "up"
 *                 bridge: "br0"
 *                 ip: null
 *                 mac: "52:54:00:12:34:56"
 *                 mtu: 1500
 *                 created: "2024-01-01T10:00:00Z"
 *                 statistics:
 *                   rx:
 *                     bytes: 1024
 *                     packets: 10
 *                     errors: 0
 *                     dropped: 0
 *                   tx:
 *                     bytes: 512
 *                     packets: 5
 *                     errors: 0
 *                     dropped: 0
 *       404:
 *         description: TAP接口不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "TAP interface tap0 not found"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "Failed to get TAP interface details"
 */
router.get('/tap/:name', networkController.getTapInterfaceDetails.bind(networkController))
/**
 * @swagger
 * /api/network/tap/{name}:
 *   delete:
 *     summary: 删除TAP接口
 *     description: 删除指定名称的TAP网络接口
 *     tags: [Network]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: TAP接口名称
 *         example: "tap0"
 *     responses:
 *       200:
 *         description: TAP接口删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "TAP interface tap0 deleted successfully"
 *       400:
 *         description: 删除失败
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "Failed to delete TAP interface tap0: interface is in use"
 *       404:
 *         description: TAP接口不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "TAP interface tap0 not found"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "Internal server error"
 */
router.delete('/tap/:name', networkController.deleteTapInterface.bind(networkController))
/**
 * @swagger
 * /api/network/info:
 *   get:
 *     summary: 获取完整网络信息
 *     description: 获取系统中所有网络相关信息的汇总，包括所有接口、TAP接口、桥接网络等
 *     tags: [Network]
 *     responses:
 *       200:
 *         description: 成功获取完整网络信息
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
 *                         interfaces:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/NetworkInterface'
 *                         taps:
 *                           type: array
 *                           items:
 *                             type: object
 *                         bridges:
 *                           type: array
 *                           items:
 *                             type: object
 *                         summary:
 *                           type: object
 *                           properties:
 *                             totalInterfaces:
 *                               type: integer
 *                             tapCount:
 *                               type: integer
 *                             bridgeCount:
 *                               type: integer
 *                             activeInterfaces:
 *                               type: integer
 *             example:
 *               success: true
 *               data:
 *                 interfaces:
 *                   - name: "eth0"
 *                     status: "up"
 *                     type: "ethernet"
 *                 taps:
 *                   - name: "tap0"
 *                     status: "up"
 *                     bridge: "br0"
 *                 bridges:
 *                   - name: "br0"
 *                     status: "up"
 *                     type: "bridge"
 *                 summary:
 *                   totalInterfaces: 5
 *                   tapCount: 2
 *                   bridgeCount: 1
 *                   activeInterfaces: 4
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               error: "Failed to get network info"
 */
router.get('/info', networkController.getAllNetworkInfo.bind(networkController))

module.exports = router
