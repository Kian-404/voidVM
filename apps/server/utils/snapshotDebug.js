// utils/snapshotDebug.js - 快照调试工具
class SnapshotDebug {
  constructor() {
    this.qemuMonitor = require('./qemuMonitor')
  }

  /**
   * 完整的快照测试流程
   */
  async testSnapshotWorkflow(vmInfo, testName = 'debug_test') {
    console.log('=== 开始快照功能测试 ===')

    try {
      // 1. 检查虚拟机状态
      console.log('1. 检查虚拟机状态...')
      // const status = await this.getVMStatus(vmInfo)
      // console.log(`   虚拟机状态: ${status}`)

      // if (status !== 'running') {
      //   throw new Error('虚拟机必须处于运行状态')
      // }

      // 2. 清理可能存在的测试快照
      // console.log('2. 清理旧的测试快照...')
      // await this.cleanupTestSnapshot(vmInfo, testName)

      // 3. 创建快照前获取当前快照列表
      console.log('3. 获取创建前的快照列表...')
      const beforeSnapshots = await this.listSnapshots(vmInfo)
      console.log(`   创建前快照数量: ${beforeSnapshots.length}`)
      beforeSnapshots.forEach(s => console.log(`   - ${s.tag} (${s.date} ${s.time})`))

      // 4. 创建快照
      console.log('4. 创建快照...')
      const createResult = await this.createSnapshotWithVerify(vmInfo, testName)
      console.log(`   创建结果: ${createResult.success ? '成功' : '失败'}`)

      // 5. 验证快照已创建
      console.log('5. 验证快照已创建...')
      const afterCreateSnapshots = await this.listSnapshots(vmInfo)
      console.log(`   创建后快照数量: ${afterCreateSnapshots.length}`)

      const newSnapshot = afterCreateSnapshots.find(s => s.tag === testName)
      if (!newSnapshot) {
        throw new Error('快照创建后在列表中找不到')
      }
      console.log(`   ✅ 找到新快照: ${newSnapshot.tag}`)

      // 6. 等待用户手动操作提示
      console.log('6. 现在请手动在虚拟机中进行一些操作（如创建文件、修改设置等）')
      console.log('   操作完成后，快照将被加载以验证是否恢复到之前状态')

      // 可以添加延时或交互式确认
      await this.waitForUserConfirmation()

      // 7. 加载快照
      console.log('7. 加载快照...')
      const loadResult = await this.loadSnapshotWithVerify(vmInfo, testName)
      console.log(`   加载结果: ${loadResult.success ? '成功' : '失败'}`)

      // 8. 验证快照加载
      console.log('8. 验证快照加载...')
      const finalStatus = await this.getVMStatus(vmInfo)
      console.log(`   加载后虚拟机状态: ${finalStatus}`)

      console.log('=== 快照功能测试完成 ===')
      console.log('请检查虚拟机内部是否已恢复到快照创建时的状态')

      return {
        success: true,
        snapshotCreated: !!newSnapshot,
        snapshotLoaded: loadResult.success,
        vmStatus: finalStatus,
      }
    } catch (error) {
      console.error('快照测试失败:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  async createSnapshotWithVerify(vmInfo, snapshotName) {
    try {
      console.log(`   正在创建快照: ${snapshotName}`)

      const result = await this.qemuMonitor.executeCommand(
        vmInfo.monitorPort,
        `savevm ${snapshotName}`
      )

      console.log(`   QEMU响应: ${result}`)

      // 检查是否有错误
      if (this.isErrorResponse(result)) {
        throw new Error(`创建快照失败: ${result}`)
      }

      // 等待快照创建完成
      await new Promise(resolve => setTimeout(resolve, 10000))

      return { success: true, result }
    } catch (error) {
      console.error(`   创建快照失败: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  async loadSnapshotWithVerify(vmInfo, snapshotName) {
    try {
      console.log(`   正在加载快照: ${snapshotName}`)

      const result = await this.qemuMonitor.executeCommand(
        vmInfo.monitorPort,
        `loadvm ${snapshotName}`
      )

      console.log(`   QEMU响应: ${result}`)

      if (this.isErrorResponse(result)) {
        throw new Error(`加载快照失败: ${result}`)
      }

      // 等待快照加载完成
      await new Promise(resolve => setTimeout(resolve, 10000))

      return { success: true, result }
    } catch (error) {
      console.error(`   加载快照失败: ${error.message}`)
      return { success: false, error: error.message }
    }
  }

  async getVMStatus(vmInfo) {
    try {
      const result = await this.qemuMonitor.executeCommand(vmInfo.monitorPort, 'info status')

      console.log(`   状态查询响应: ${result}`)

      if (result.includes('running')) return 'running'
      if (result.includes('paused')) return 'paused'
      if (result.includes('stopped')) return 'stopped'

      return 'unknown'
    } catch (error) {
      console.error(`   状态查询失败: ${error.message}`)
      return 'error'
    }
  }

  async listSnapshots(vmInfo) {
    try {
      const result = await this.qemuMonitor.executeCommand(vmInfo.monitorPort, 'info snapshots')

      console.log(`   快照列表响应: ${result}`)

      return this.qemuMonitor.parseSnapshotList(result)
    } catch (error) {
      console.error(`   获取快照列表失败: ${error.message}`)
      return []
    }
  }

  async cleanupTestSnapshot(vmInfo, snapshotName) {
    try {
      const snapshots = await this.listSnapshots(vmInfo)
      const existingSnapshot = snapshots.find(s => s.tag === snapshotName)

      if (existingSnapshot) {
        console.log(`   删除已存在的测试快照: ${snapshotName}`)
        await this.qemuMonitor.executeCommand(vmInfo.monitorPort, `delvm ${snapshotName}`)
      }
    } catch (error) {
      console.warn(`   清理测试快照时出错: ${error.message}`)
    }
  }

  isErrorResponse(response) {
    const errorPatterns = [
      /error/i,
      /failed/i,
      /cannot/i,
      /invalid/i,
      /not found/i,
      /permission denied/i,
      /no such/i,
    ]
    return errorPatterns.some(pattern => pattern.test(response))
  }

  async waitForUserConfirmation() {
    console.log('\n   >>> 请在虚拟机中进行以下测试操作:')
    console.log('       1. 创建一个新文件夹，如: mkdir /tmp/test_folder')
    console.log('       2. 创建一个文件，如: echo "test" > /tmp/test_file')
    console.log('       3. 修改一些系统设置或配置')
    console.log('   >>> 完成后按任意键继续测试快照加载...\n')

    // 在生产环境中，这里可以使用交互式输入
    // 或者简单延时
    await new Promise(resolve => setTimeout(resolve, 10000)) // 等待10秒
  }
}

module.exports = new SnapshotDebug()
