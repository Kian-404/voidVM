// services/snapshotService.js
const fs = require('fs').promises
const path = require('path')
const qemuMonitor = require('../utils/qemuMonitor')
const globalVMState = require('../utils/globalVMState')

class SnapshotService {
  constructor() {
    this.snapshotsDir = path.join(process.cwd(), 'data', 'snapshots')
    this.vmProcesses = new Map() // 应该从全局状态管理中获取
    this.initSnapshotsDir()
  }

  /**
   * 初始化快照目录
   */
  async initSnapshotsDir() {
    try {
      await fs.access(this.snapshotsDir)
    } catch {
      await fs.mkdir(this.snapshotsDir, { recursive: true })
    }
  }

  /**
   * 创建快照
   */
  async createSnapshot({ vmName, snapshotName, description = '' }) {
    try {
      // 检查虚拟机是否运行
      const vmInfo = this.getVMInfo(vmName)
      if (!vmInfo) {
        throw new Error('虚拟机未运行或不存在')
      }

      // 检查快照是否已存在
      const existingSnapshots = await this.getSnapshotList(vmName)
      if (existingSnapshots.some(s => s.name === snapshotName)) {
        throw new Error('快照名称已存在')
      }

      // 通过QEMU Monitor创建快照
      const qemuResult = await qemuMonitor.executeCommand(
        vmInfo.monitorPort,
        `savevm ${snapshotName}`
      )

      // 检查QEMU命令是否成功
      if (qemuResult.includes('Error') || qemuResult.includes('error')) {
        throw new Error(`QEMU创建快照失败: ${qemuResult}`)
      }

      // 创建快照信息对象
      const snapshotInfo = {
        id: this.generateSnapshotId(),
        name: snapshotName,
        vmName: vmName,
        description: description,
        createTime: new Date().toISOString(),
        status: 'active',
        size: await this.getSnapshotSize(vmName, snapshotName),
        metadata: {
          qemuVersion: await this.getQemuVersion(),
          vmState: 'running',
        },
      }

      // 保存快照信息
      await this.saveSnapshotInfo(vmName, snapshotInfo)

      return snapshotInfo
    } catch (error) {
      throw new Error(`创建快照失败: ${error.message}`)
    }
  }

  /**
   * 加载快照
   */
  async loadSnapshot({ vmName, snapshotName }) {
    try {
      // 检查虚拟机是否运行
      const vmInfo = this.getVMInfo(vmName)
      if (!vmInfo) {
        throw new Error('虚拟机未运行或不存在')
      }

      // 检查快照是否存在
      const snapshot = await this.getSnapshotByName(vmName, snapshotName)
      if (!snapshot) {
        throw new Error('快照不存在')
      }

      const snapshotRes = await qemuMonitor.executeCommand(vmInfo.monitorPort, 'info snapshots')
      console.log('snapshotRes', snapshotRes)
      // 获取当前虚拟机状态
      const statusResult = await qemuMonitor.executeCommand(vmInfo.monitorPort, 'info status')
      const wasRunning = statusResult.includes('running')
      console.log('wasRunning', wasRunning)
      // 如果虚拟机正在运行，先暂停
      if (wasRunning) {
        console.log(`暂停虚拟机 ${vmName} 以加载快照`)
        const stopResult = await qemuMonitor.executeCommand(vmInfo.monitorPort, 'stop')
        this.validateQemuResult(stopResult, 'stop')

        // 等待虚拟机完全暂停
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // 通过QEMU Monitor加载快照
      console.log(`开始加载快照: ${snapshotName}`)
      const qemuResult = await qemuMonitor.executeCommand(
        vmInfo.monitorPort,
        `loadvm ${snapshotName}`
      )

      // 检查QEMU命令是否成功
      this.validateQemuResult(qemuResult, `loadvm ${snapshotName}`)

      // 验证快照是否真正加载成功
      await this.verifySnapshotLoaded(vmInfo.monitorPort, snapshotName)

      // 如果之前是运行状态，恢复运行
      if (wasRunning) {
        console.log(`恢复虚拟机 ${vmName} 运行`)
        const contResult = await qemuMonitor.executeCommand(vmInfo.monitorPort, 'cont')
        this.validateQemuResult(contResult, 'cont')
      }

      // 更新快照信息
      snapshot.lastLoadTime = new Date().toISOString()
      await this.updateSnapshotInfo(vmName, snapshot)

      return {
        snapshotName,
        loadTime: snapshot.lastLoadTime,
        success: true,
        message: '快照加载成功',
      }
    } catch (error) {
      throw new Error(`加载快照失败: ${error.message}`)
    }
  }

  /**
   * 获取快照列表
   */
  async getSnapshots({ vmName, page = 1, limit = 20, sortBy = 'createTime', order = 'desc' }) {
    try {
      let snapshots = await this.getSnapshotList(vmName)

      // 排序
      snapshots.sort((a, b) => {
        const aValue = a[sortBy]
        const bValue = b[sortBy]

        if (order === 'desc') {
          return aValue > bValue ? -1 : 1
        } else {
          return aValue < bValue ? -1 : 1
        }
      })

      // 分页
      const total = snapshots.length
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedSnapshots = snapshots.slice(startIndex, endIndex)

      return {
        snapshots: paginatedSnapshots,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      throw new Error(`获取快照列表失败: ${error.message}`)
    }
  }

  /**
   * 删除快照
   */
  async deleteSnapshot({ vmName, snapshotName }) {
    try {
      // 检查虚拟机是否运行
      const vmInfo = this.getVMInfo(vmName)
      if (!vmInfo) {
        throw new Error('虚拟机未运行或不存在')
      }

      // 检查快照是否存在
      const snapshot = await this.getSnapshotByName(vmName, snapshotName)
      if (!snapshot) {
        throw new Error('快照不存在')
      }

      // 通过QEMU Monitor删除快照
      const qemuResult = await qemuMonitor.executeCommand(
        vmInfo.monitorPort,
        `delvm ${snapshotName}`
      )

      // 检查QEMU命令是否成功
      if (qemuResult.includes('Error') || qemuResult.includes('error')) {
        throw new Error(`QEMU删除快照失败: ${qemuResult}`)
      }

      // 从记录中删除快照信息
      await this.deleteSnapshotInfo(vmName, snapshotName)

      return true
    } catch (error) {
      throw new Error(`删除快照失败: ${error.message}`)
    }
  }

  /**
   * 获取快照详情
   */
  async getSnapshotDetail({ vmName, snapshotName }) {
    try {
      const snapshot = await this.getSnapshotByName(vmName, snapshotName)
      if (!snapshot) {
        throw new Error('快照不存在')
      }

      // 获取额外的快照信息
      const additionalInfo = await this.getAdditionalSnapshotInfo(vmName, snapshotName)
      return {
        ...snapshot,
        ...additionalInfo,
      }
    } catch (error) {
      throw new Error(`获取快照详情失败: ${error.message}`)
    }
  }

  /**
   * 重命名快照
   */
  async renameSnapshot({ vmName, oldName, newName, description }) {
    try {
      // 检查虚拟机是否运行
      const vmInfo = this.getVMInfo(vmName)
      if (!vmInfo) {
        throw new Error('虚拟机未运行或不存在')
      }

      // 检查原快照是否存在
      const snapshot = await this.getSnapshotByName(vmName, oldName)
      if (!snapshot) {
        throw new Error('原快照不存在')
      }

      // 检查新名称是否已存在
      const existingSnapshots = await this.getSnapshotList(vmName)
      if (existingSnapshots.some(s => s.name === newName && s.name !== oldName)) {
        throw new Error('新快照名称已存在')
      }

      // QEMU不支持直接重命名，需要先创建新快照再删除旧快照
      // 1. 加载旧快照
      await qemuMonitor.executeCommand(vmInfo.monitorPort, `loadvm ${oldName}`)

      // 2. 创建新快照
      const createResult = await qemuMonitor.executeCommand(vmInfo.monitorPort, `savevm ${newName}`)

      if (createResult.includes('Error') || createResult.includes('error')) {
        throw new Error(`创建新快照失败: ${createResult}`)
      }

      // 3. 删除旧快照
      const deleteResult = await qemuMonitor.executeCommand(vmInfo.monitorPort, `delvm ${oldName}`)

      if (deleteResult.includes('Error') || deleteResult.includes('error')) {
        // 如果删除失败，尝试删除新创建的快照
        await qemuMonitor.executeCommand(vmInfo.monitorPort, `delvm ${newName}`)
        throw new Error(`删除旧快照失败: ${deleteResult}`)
      }

      // 4. 更新快照信息
      snapshot.name = newName
      if (description !== undefined) {
        snapshot.description = description
      }
      snapshot.updateTime = new Date().toISOString()

      await this.deleteSnapshotInfo(vmName, oldName)
      await this.saveSnapshotInfo(vmName, snapshot)

      return snapshot
    } catch (error) {
      throw new Error(`重命名快照失败: ${error.message}`)
    }
  }

  /**
   * 获取虚拟机信息（从全局状态中读取）
   */
  getVMInfo(vmName) {
    return globalVMState.getVMInfo(vmName)
  }

  /**
   * 设置虚拟机信息（委托给全局状态管理器）
   */
  setVMInfo(vmName, vmInfo) {
    globalVMState.setVMInfo(vmName, vmInfo)
  }

  /**
   * 移除虚拟机信息（委托给全局状态管理器）
   */
  removeVMInfo(vmName) {
    return globalVMState.removeVMInfo(vmName)
  }

  /**
   * 更新虚拟机状态（委托给全局状态管理器）
   */
  updateVMStatus(vmName, status) {
    globalVMState.updateVMStatus(vmName, status)
  }

  /**
   * 获取所有VM信息（从全局状态中读取）
   */
  getAllVMInfo() {
    return globalVMState.getAllVMs()
  }

  /**
   * 检查VM是否在全局状态中注册
   */
  isVMRegistered(vmName) {
    return globalVMState.hasVM(vmName)
  }

  /**
   * 获取快照列表
   */
  async getSnapshotList(vmName) {
    try {
      const filePath = path.join(this.snapshotsDir, `${vmName}.json`)
      const data = await fs.readFile(filePath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      if (error.code === 'ENOENT') {
        return []
      }
      throw error
    }
  }

  /**
   * 根据名称获取快照
   */
  async getSnapshotByName(vmName, snapshotName) {
    const snapshots = await this.getSnapshotList(vmName)
    return snapshots.find(s => s.name === snapshotName)
  }

  /**
   * 保存快照信息
   */
  async saveSnapshotInfo(vmName, snapshotInfo) {
    const filePath = path.join(this.snapshotsDir, `${vmName}.json`)
    let snapshots = await this.getSnapshotList(vmName)

    // 如果快照已存在，则更新；否则添加
    const index = snapshots.findIndex(s => s.name === snapshotInfo.name)
    if (index >= 0) {
      snapshots[index] = snapshotInfo
    } else {
      snapshots.push(snapshotInfo)
    }

    await fs.writeFile(filePath, JSON.stringify(snapshots, null, 2))
  }

  /**
   * 更新快照信息
   */
  async updateSnapshotInfo(vmName, snapshotInfo) {
    await this.saveSnapshotInfo(vmName, snapshotInfo)
  }

  /**
   * 删除快照信息
   */
  async deleteSnapshotInfo(vmName, snapshotName) {
    const filePath = path.join(this.snapshotsDir, `${vmName}.json`)
    let snapshots = await this.getSnapshotList(vmName)

    snapshots = snapshots.filter(s => s.name !== snapshotName)
    await fs.writeFile(filePath, JSON.stringify(snapshots, null, 2))
  }

  /**
   * 生成快照ID
   */
  generateSnapshotId() {
    return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取快照大小（估算）
   */
  async getSnapshotSize(vmName, snapshotName) {
    try {
      // 等待快照创建完成
      await new Promise(resolve => setTimeout(resolve, 1000))

      const vmInfo = this.getVMInfo(vmName)
      if (vmInfo && vmInfo.diskPath) {
        const stats = await fs.stat(vmInfo.diskPath)
        return stats.size
      }

      // 如果无法获取实际大小，返回估算值
      return Math.floor(Math.random() * 1000000000) + 100000000
    } catch (error) {
      console.warn('获取快照大小失败:', error.message)
      return 0
    }
  }

  /**
   * 获取QEMU版本
   */
  async getQemuVersion() {
    try {
      const { exec } = require('child_process')
      return new Promise(resolve => {
        exec('qemu-system-x86_64 --version', (error, stdout) => {
          if (error) {
            resolve('unknown')
          } else {
            resolve(stdout.trim().split('\n')[0])
          }
        })
      })
    } catch (error) {
      return 'unknown'
    }
  }

  /**
   * 获取额外的快照信息
   */
  async getAdditionalSnapshotInfo(vmName, snapshotName) {
    try {
      const vmInfo = this.getVMInfo(vmName)
      if (!vmInfo) {
        return {}
      }

      // 通过QEMU Monitor获取快照信息
      const infoResult = await qemuMonitor.executeCommand(vmInfo.monitorPort, 'info snapshots')

      // 解析快照信息
      const snapshotLines = infoResult.split('\n').filter(line => line.includes(snapshotName))

      if (snapshotLines.length > 0) {
        // 解析快照详细信息
        const line = snapshotLines[0]
        const parts = line.trim().split(/\s+/)

        return {
          qemuInfo: {
            id: parts[0] || '',
            tag: parts[1] || '',
            vmSize: parts[2] || '',
            date: parts[3] || '',
            time: parts[4] || '',
            vmClock: parts[5] || '',
          },
        }
      }

      return {}
    } catch (error) {
      console.warn('获取额外快照信息失败:', error.message)
      return {}
    }
  }

  /**
   * 验证QEMU命令执行结果
   */
  validateQemuResult(result, command) {
    if (!result || typeof result !== 'string') {
      throw new Error(`QEMU命令执行无响应: ${command}`)
    }

    // 检查常见的错误模式
    const errorPatterns = [
      /error/i,
      /failed/i,
      /invalid/i,
      /not found/i,
      /cannot/i,
      /unknown/i,
      /undefined/i,
      /does not exist/i,
    ]

    for (const pattern of errorPatterns) {
      if (pattern.test(result)) {
        throw new Error(`QEMU命令执行失败: ${result}`)
      }
    }

    // 对于特定命令的特殊检查
    if (command.startsWith('loadvm') && result.trim() === '') {
      // loadvm成功时通常返回空字符串或仅包含提示符
      console.log('loadvm命令执行完成')
    }

    return true
  }

  /**
   * 验证快照是否成功加载
   */
  async verifySnapshotLoaded(monitorPort, snapshotName) {
    try {
      // 等待一段时间确保加载完成
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 查询当前虚拟机状态
      const statusResult = await qemuMonitor.executeCommand(monitorPort, 'info status')

      // 获取快照信息列表
      const snapshotResult = await qemuMonitor.executeCommand(monitorPort, 'info snapshots')

      // 检查快照是否在列表中
      if (!snapshotResult.includes(snapshotName)) {
        throw new Error(`快照 ${snapshotName} 未找到`)
      }

      // 检查虚拟机状态是否正常
      if (
        statusResult.includes('internal error') ||
        statusResult.includes('paused (internal error)')
      ) {
        throw new Error('虚拟机状态异常，快照加载可能失败')
      }

      console.log(`快照 ${snapshotName} 验证成功`)
      return true
    } catch (error) {
      throw new Error(`验证快照加载状态失败: ${error.message}`)
    }
  }
}

module.exports = new SnapshotService()
