// utils/qemuMonitor.js
const net = require('net')

class QemuMonitor {
  /**
   * 执行QEMU监控命令
   */
  executeCommand(monitorPort, command, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const client = new net.Socket()
      let response = ''
      let isConnected = false
      let isInitialized = false
      let commandSent = false

      // 解析监控端口
      const portInfo = this.parseMonitorPort(monitorPort)

      // 先注册所有事件监听器，再建立连接
      client.on('data', data => {
        const dataStr = data.toString()
        response += dataStr
        console.log(`收到数据: ${JSON.stringify(dataStr)}`)

        // 检查是否收到初始提示符（QEMU Monitor就绪）
        if (!isInitialized && response.includes('(qemu)')) {
          isInitialized = true
          console.log('QEMU Monitor初始化完成，发送命令')
          // 清空响应，准备接收命令的响应
          response = ''
          setTimeout(() => {
            commandSent = true
            client.write(command + '\n')
            console.log(`发送命令: ${command}`)
          }, 200)
          return
        }

        // 只有在命令发送后才处理响应
        if (!commandSent) {
          return
        }

        // 检查命令执行是否完成
        if (this.isCommandComplete(response, command)) {
          client.destroy()
          const cleanResponse = this.cleanResponse(response, command)
          console.log(`命令执行完成，清理后响应: ${JSON.stringify(cleanResponse)}`)
          resolve(cleanResponse)
        }
      })

      client.on('connect', () => {
        isConnected = true
        console.log(`已连接到QEMU Monitor: ${portInfo.host}:${portInfo.port}`)
      })

      client.on('error', err => {
        console.log(`连接错误: ${err.message}`)
        reject(new Error(`QEMU监控连接失败: ${err.message}`))
      })

      client.on('close', () => {
        console.log('连接已关闭')
        if (!isConnected) {
          reject(new Error('无法连接到QEMU监控器'))
        }
      })

      // 设置超时
      const timeoutId = setTimeout(() => {
        if (!client.destroyed) {
          console.log('连接超时，关闭连接')
          client.destroy()
          reject(new Error('QEMU命令执行超时'))
        }
      }, timeout)

      // 清理超时定时器
      client.on('close', () => {
        clearTimeout(timeoutId)
      })

      // 最后建立连接
      console.log(`尝试连接到 ${portInfo.host}:${portInfo.port}`)
      client.connect(portInfo.port, portInfo.host)
    })
  }

  /**
   * 解析监控端口配置
   */
  parseMonitorPort(monitorPort) {
    // 处理格式：tcp:localhost:4444,server,nowait
    if (typeof monitorPort === 'string' && monitorPort.includes('tcp:')) {
      const parts = monitorPort.split(',')[0].split(':')
      return {
        host: parts[1] || 'localhost',
        port: parseInt(parts[2]) || 4444,
      }
    }

    // 处理数字端口
    if (typeof monitorPort === 'number') {
      return {
        host: 'localhost',
        port: monitorPort,
      }
    }

    // 默认值
    return {
      host: 'localhost',
      port: 4444,
    }
  }

  /**
   * 清理响应内容
   */
  cleanResponse(response, command) {
    // 移除命令回显
    let cleaned = response.replace(new RegExp(this.escapeRegExp(command), 'g'), '')

    // 移除所有提示符
    cleaned = cleaned.replace(/\(qemu\)\s*/g, '')

    // 移除ANSI转义序列
    cleaned = cleaned.replace(/\x1b\[[0-9;]*m/g, '')

    // 清理多余的空白字符
    cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

    // 移除开头和结尾的空白，但保留中间的换行
    cleaned = cleaned.trim()

    return cleaned
  }

  /**
   * 转义正则表达式特殊字符
   */
  escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  /**
   * 检查QEMU监控器连接
   */
  async checkConnection(monitorPort) {
    try {
      await this.executeCommand(monitorPort, 'info version', 5000)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 获取所有快照列表
   */
  async getSnapshotList(monitorPort) {
    try {
      const response = await this.executeCommand(monitorPort, 'info snapshots')
      return this.parseSnapshotList(response)
    } catch (error) {
      throw new Error(`获取快照列表失败: ${error.message}`)
    }
  }

  /**
   * 解析快照列表响应
   */
  parseSnapshotList(response) {
    const snapshots = []
    const lines = response.split('\n')

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.includes('Snapshot list:') && trimmedLine.length > 0) {
        const parts = trimmedLine.split(/\s+/)
        if (parts.length >= 6) {
          snapshots.push({
            id: parts[0],
            tag: parts[1],
            vmSize: parts[2],
            date: parts[3],
            time: parts[4],
            vmClock: parts[5],
          })
        }
      }
    }

    return snapshots
  }

  /**
   * 判断是否为长耗时命令
   */
  isLongRunningCommand(command) {
    const longRunningCommands = ['loadvm', 'savevm', 'delvm', 'migrate']
    return longRunningCommands.some(cmd => command.trim().startsWith(cmd))
  }

  /**
   * 判断命令是否执行完成
   */
  isCommandComplete(response, command) {
    // 检查是否包含提示符
    if (!response.includes('(qemu)')) {
      return false
    }

    // 对于长耗时命令的特殊处理
    if (this.isLongRunningCommand(command)) {
      // 检查是否有错误信息
      if (response.includes('Error') || response.includes('error')) {
        return true
      }

      // 检查是否有明确的完成信号
      const lines = response.split('\n')
      const lastLine = lines[lines.length - 1] || lines[lines.length - 2]

      // 如果最后一行是提示符，说明命令执行完成
      return lastLine && lastLine.trim().endsWith('(qemu)')
    } else {
      // 对于普通命令，检查是否至少有一个完整的响应
      const qemuCount = (response.match(/\(qemu\)/g) || []).length
      return qemuCount >= 1
    }
  }
}

module.exports = new QemuMonitor()
