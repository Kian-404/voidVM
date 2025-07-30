// controllers/vmsController.js
import vmsService from '../services/vmsService.js'

class VmsController {
  /**
   * 创建新虚拟机
   */
  async createVM(req, res) {
    try {
      const {
        vmName,
        diskSize,
        memory,
        cpuCores,
        isoPath,
        vncPort,
        networkType,
        network,
        portForwarding,
      } = req.body

      const vmConfig = {
        vmName: vmName,
        diskSize: diskSize || '20G',
        memory: memory || 2048,
        cpuCores: cpuCores || 2,
        vncPort: vncPort || 0,
        networkType: networkType || 'user',
        network: network,
        portForwarding: portForwarding || [
          { hostPort: 2222, guestPort: 22 },
          { hostPort: 8080, guestPort: 80 },
        ],
        isoPath: isoPath || '',
        bootOrder: 'd',
        startAfterCreation: false,
      }

      const newVM = await vmsService.createVM(vmConfig)
      res.status(201).json(newVM)
      console.log('VM created successfully:', newVM)
    } catch (error) {
      console.error('Failed to create VM:', error)
      res.status(400).json({ error: error.message || '创建虚拟机失败' })
    }
  }

  /**
   * 获取所有虚拟机
   */
  async getAllVMs(req, res) {
    try {
      const vmsList = await vmsService.getAllVMs()
      res.json(vmsList)
    } catch (error) {
      console.error('Failed to get VMs:', error)
      res.status(500).json({ error: error.message || '获取虚拟机列表失败' })
    }
  }

  /**
   * 启动虚拟机
   */
  async startVM(req, res) {
    try {
      const vmName = req.params.name
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
        network,
      } = req.body.config

      console.log('req.body.config', req.body.config)

      const vmConfig = {
        vmName: name || vmName,
        diskSize: diskSize || '20G',
        diskPath: diskPath || '',
        isoPath: isoPath || '',
        memory: memory || 2048,
        cpuCores: cpuCores || 2,
        vncPort: vncPort || 0,
        networkType: networkType || 'user',
        network: network,
        portForwarding: portForwarding || [
          { hostPort: 2222, guestPort: 22 },
          { hostPort: 8080, guestPort: 80 },
        ],
        bootOrder: 'd',
      }

      const result = await vmsService.startVM(vmConfig)
      res.json(result)
    } catch (error) {
      console.error('Failed to start VM:', error)
      res.status(404).json({ error: error.message || '虚拟机未找到' })
    }
  }

  /**
   * 停止虚拟机
   */
  async stopVM(req, res) {
    try {
      const vmName = req.params.name
      const { lastPid } = req.body.metadata

      console.log('Stopping VM:', vmName)
      const result = await vmsService.stopVM(vmName, lastPid)
      res.json(result)
    } catch (error) {
      console.error('Failed to stop VM:', error)
      res.status(404).json({ error: error.message || '虚拟机未找到' })
    }
  }

  /**
   * 重启虚拟机
   */
  async restartVM(req, res) {
    try {
      const vmName = req.params.name
      const { lastPid } = req.body.metadata

      console.log('Restarting VM:', vmName)
      const result = await vmsService.restartVM(vmName, lastPid)
      res.json(result)
    } catch (error) {
      console.error('Failed to restart VM:', error)
      res.status(404).json({ error: error.message || '虚拟机未找到' })
    }
  }

  /**
   * 删除虚拟机
   */
  async deleteVM(req, res) {
    try {
      const vmName = req.params.name
      const result = await vmsService.deleteVM(vmName, true)
      res.json(result)
    } catch (error) {
      console.error('Failed to delete VM:', error)
      res.status(404).json({ error: error.message || '虚拟机未找到' })
    }
  }

  /**
   * 启动 NoVNC 服务
   */
  async startNoVNC(req, res) {
    try {
      const { vncPort, webPort } = req.body

      console.log('vncPort', vncPort)
      console.log('webPort', webPort)

      const novnc = await vmsService.startNoVNC(vncPort, webPort)
      res.json(novnc)
    } catch (error) {
      console.error('Failed to start NoVNC:', error)
      res.status(400).json({ error: error.message || '启动 NoVNC 服务失败' })
    }
  }

  /**
   * 为指定 VM 启动 NoVNC 服务
   */
  async startNoVNCForVM(req, res) {
    try {
      const vmName = req.params.name
      const { vncPort, webPort } = req.body

      console.log(`Starting NoVNC for VM: ${vmName}`)
      console.log('vncPort', vncPort)
      console.log('webPort', webPort)

      const novnc = await vmsService.startNoVNC(vncPort, webPort)
      res.json(novnc)
    } catch (error) {
      console.error(`Failed to start NoVNC for VM: ${vmName}`, error)
      res.status(400).json({ error: error.message || '启动 NoVNC 服务失败' })
    }
  }

  /**
   * 更新虚拟机配置
   */
  async updateVMConfig(req, res) {
    try {
      const vmName = req.params.name
      const newConfig = req.body

      const result = await vmsService.updateVMConfig(vmName, newConfig)
      res.json(result)
    } catch (error) {
      console.error('Failed to update VM config:', error)
      if (error.message.includes('找不到虚拟机')) {
        res.status(404).json({ error: error.message || '虚拟机未找到' })
      } else {
        res.status(500).json({ error: error.message || '更新虚拟机配置失败' })
      }
    }
  }

  /**
   * 切换虚拟机 ISO 镜像的挂载状态
   */
  async toggleMountIso(req, res) {
    try {
      const vmName = req.params.name
      const { mountStatus } = req.body

      if (!vmName) {
        return res.status(400).json({
          success: false,
          error: 'VM name is required',
        })
      }

      console.log(`Received request to toggle ISO mount for VM: ${vmName}`)

      const result = await vmsService.toggleMountIso(vmName, mountStatus)

      return res.json({
        success: true,
        message: `ISO successfully ${mountStatus ? 'mounted to' : 'unmounted from'} VM '${vmName}'`,
        vm: {
          name: vmName,
          isMountIso: mountStatus,
          ...result,
        },
      })
    } catch (error) {
      console.error(`Error toggling ISO mount: ${error.message}`)
      console.error(error.stack)

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          error: error.message || '虚拟机未找到',
        })
      }

      if (error.message.includes('not running')) {
        return res.status(400).json({
          success: false,
          error: error.message || '虚拟机未运行',
        })
      }

      return res.status(500).json({
        success: false,
        error: `Failed to toggle ISO mount: ${error.message || '未知错误'}`,
      })
    }
  }
}

// 创建 VmsController 实例并导出
const vmsController = new VmsController()

export default vmsController
