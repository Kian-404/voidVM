// src/controllers/networkController.js
import NetworkService from '../services/networkService.js'

class NetworkController {
  constructor() {
    this.networkService = new NetworkService()
  }

  // 创建桥接网络
  async createBridge(req, res) {
    try {
      const { name, ip, netmask, dhcp, dhcpStart, dhcpEnd } = req.body

      const bridge = await this.networkService.createBridge(name, {
        ip,
        netmask,
        dhcp,
        dhcpStart,
        dhcpEnd,
      })

      res.status(201).json({
        success: true,
        data: bridge,
        message: `Bridge ${name} created successfully`,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  }

  // 删除桥接网络
  async deleteBridge(req, res) {
    try {
      const { name } = req.params
      await this.networkService.deleteBridge(name)

      res.json({
        success: true,
        message: `Bridge ${name} deleted successfully`,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  }

  // 获取所有网络接口
  async getInterfaces(req, res) {
    try {
      const interfaces = await this.networkService.getAllInterfaces()

      res.json({
        success: true,
        data: interfaces,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  // 创建 TAP 接口
  async createTap(req, res) {
    try {
      const { name, bridge } = req.body

      const tap = await this.networkService.createTapInterface(name, bridge)

      res.status(201).json({
        success: true,
        data: tap,
        message: `TAP interface ${name} created successfully`,
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  }

  // 设置端口转发
  async setupPortForward(req, res) {
    try {
      const { hostPort, guestIP, guestPort, protocol } = req.body

      const rule = await this.networkService.setupPortForward(
        hostPort,
        guestIP,
        guestPort,
        protocol
      )

      res.status(201).json({
        success: true,
        data: rule,
        message: 'Port forward rule created successfully',
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  }

  // 配置流量控制
  async setupTrafficControl(req, res) {
    try {
      const { interfaceNet, bandwidth, delay, loss } = req.body

      const tc = await this.networkService.setupTrafficControl(interfaceNet, {
        bandwidth,
        delay,
        loss,
      })

      res.json({
        success: true,
        data: tc,
        message: 'Traffic control configured successfully',
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      })
    }
  }

  // 获取网络统计信息
  async getNetworkStats(req, res) {
    try {
      const { interfaceNet } = req.params

      const stats = await this.networkService.getNetworkStats(interfaceNet)

      res.json({
        success: true,
        data: stats,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  // 获取所有 TAP 接口
  async getTapInterfaces(req, res) {
    try {
      const tapInterfaces = await this.networkService.getTapInterfaces()

      res.json({
        success: true,
        data: tapInterfaces,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }

  // 获取单个 TAP 接口详细信息
  async getTapInterfaceDetails(req, res) {
    try {
      const { name } = req.params
      const tapDetails = await this.networkService.getTapInterfaceDetails(name)

      res.json({
        success: true,
        data: tapDetails,
      })
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 500).json({
        success: false,
        error: error.message,
      })
    }
  }

  // 删除 TAP 接口
  async deleteTapInterface(req, res) {
    try {
      const { name } = req.params
      await this.networkService.deleteTapInterface(name)

      res.json({
        success: true,
        message: `TAP interface ${name} deleted successfully`,
      })
    } catch (error) {
      res.status(error.message.includes('not found') ? 404 : 400).json({
        success: false,
        error: error.message,
      })
    }
  }

  // 获取完整网络信息
  async getAllNetworkInfo(req, res) {
    try {
      const networkInfo = await this.networkService.getAllNetworkInfo()

      res.json({
        success: true,
        data: networkInfo,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      })
    }
  }
}

// 创建 NetworkController 实例并导出
const networkController = new NetworkController()

export { networkController }
