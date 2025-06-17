const { spawn, exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const util = require('util')

const execPromise = util.promisify(exec)
const fsPromise = {
  mkdir: util.promisify(fs.mkdir),
  access: util.promisify(fs.access),
  writeFile: util.promisify(fs.writeFile),
  readFile: util.promisify(fs.readFile),
  stat: util.promisify(fs.stat),
  unlink: util.promisify(fs.unlink),
  readdir: util.promisify(fs.readdir),
  rmdir: util.promisify(fs.rmdir),
}

class QemuManager {
  constructor(options = {}) {
    this.vmStoragePath = options.vmStoragePath || path.join(__dirname, 'vms')
    this.processes = new Map()
    this.init()
  }

  async init() {
    try {
      await fsPromise.access(this.vmStoragePath)
    } catch (error) {
      await fsPromise.mkdir(this.vmStoragePath, { recursive: true })
      console.log(`Created VM storage directory: ${this.vmStoragePath}`)
    }
  }

  /**
   * 创建VM目录结构和配置文件
   * @param {string} vmName - 虚拟机名称
   * @param {Object} config - 虚拟机配置
   */
  async createVMDirectory(vmName, config = {}) {
    // 创建VM专用目录
    const vmDir = path.join(this.vmStoragePath, vmName)

    try {
      await fsPromise.access(vmDir)
      console.log(`VM directory already exists: ${vmDir}`)
    } catch (error) {
      // 目录不存在，创建新的
      await fsPromise.mkdir(vmDir, { recursive: true })
      console.log(`Created VM directory: ${vmDir}`)
    }

    // 创建config.json
    const configPath = path.join(vmDir, 'config.json')
    const configData = {
      name: vmName,
      memory: config.memory || 2048,
      cpuCores: config.cpuCores || 2,
      diskPath: config.diskPath,
      diskSize: config.diskSize || '20G',
      diskFormat: config.diskFormat || 'qcow2',
      vncPort: config.vncPort || 0,
      networkType: config.networkType || 'user',
      portForwarding: config.portForwarding || [],
      isoPath: config.isoPath || null,
      bootOrder: config.bootOrder || 'c',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    }

    await fsPromise.writeFile(configPath, JSON.stringify(configData, null, 2))
    console.log(`Created VM config file: ${configPath}`)

    // 创建metadata.json
    const metadataPath = path.join(vmDir, 'metadata.json')
    const metadataData = {
      status: 'created',
      lastRunTime: null,
      totalRunTime: 0,
      lastPid: null,
      lastCommand: null,
      lastError: null,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      isMountIso: true, // 默认首次启动挂载 ISO
      installed: false,
    }

    await fsPromise.writeFile(metadataPath, JSON.stringify(metadataData, null, 2))
    console.log(`Created VM metadata file: ${metadataPath}`)

    return {
      vmDir,
      configPath,
      metadataPath,
      config: configData,
      metadata: metadataData,
    }
  }

  /**
   * 更新VM元数据
   * @param {string} vmName - 虚拟机名称
   * @param {Object} updates - 要更新的元数据字段
   */
  async updateVMMetadata(vmName, updates = {}) {
    const metadataPath = path.join(this.vmStoragePath, vmName, 'metadata.json')

    try {
      // 读取现有元数据
      const metadataStr = await fsPromise.readFile(metadataPath, 'utf8')
      const metadata = JSON.parse(metadataStr)

      // 更新元数据
      const updatedMetadata = {
        ...metadata,
        ...updates,
        modified: new Date().toISOString(),
      }

      // 写入更新后的元数据
      await fsPromise.writeFile(metadataPath, JSON.stringify(updatedMetadata, null, 2))
      console.log(`Updated VM metadata: ${metadataPath}`)

      return updatedMetadata
    } catch (error) {
      console.error(`Failed to update VM metadata: ${error.message}`)
      throw error
    }
  }

  /**
   * 获取VM配置和元数据
   * @param {string} vmName - 虚拟机名称
   */
  async getVMInfo(vmName) {
    const vmDir = path.join(this.vmStoragePath, vmName)
    const configPath = path.join(vmDir, 'config.json')
    const metadataPath = path.join(vmDir, 'metadata.json')

    try {
      // 检查目录是否存在
      await fsPromise.access(vmDir)

      // 读取配置文件
      let config = null
      try {
        const configStr = await fsPromise.readFile(configPath, 'utf8')
        config = JSON.parse(configStr)
      } catch (error) {
        console.warn(`VM config file not found or invalid: ${configPath}`)
      }

      // 读取元数据文件
      let metadata = null
      try {
        const metadataStr = await fsPromise.readFile(metadataPath, 'utf8')
        metadata = JSON.parse(metadataStr)
      } catch (error) {
        console.warn(`VM metadata file not found or invalid: ${metadataPath}`)
      }

      // 检查VM是否正在运行
      const isRunning = this.processes.has(vmName)
      const status = isRunning ? 'running' : metadata?.status || 'unknown'

      return {
        name: vmName,
        config,
        metadata,
        status,
        isRunning,
        vmDir,
      }
    } catch (error) {
      console.error(`Failed to get VM info: ${error.message}`)
      return null
    }
  }

  /**
   * 列出所有VM（包括运行中和已停止的）
   */
  async listAllVMs() {
    try {
      // 获取所有VM目录
      const entries = await fsPromise.readdir(this.vmStoragePath, {
        withFileTypes: true,
      })
      const vmDirs = entries.filter(entry => entry.isDirectory()).map(dir => dir.name)

      // 获取每个VM的信息
      const vms = await Promise.all(
        vmDirs.map(async vmName => {
          const vmInfo = await this.getVMInfo(vmName)
          if (!vmInfo) return null
          // 如果VM正在运行，添加进程信息
          if (vmInfo.status === 'running') {
            this.processes.set(vmName, JSON.stringify({ ...vmInfo.metadata, name: vmName }))
            const process = this.processes.get(vmName)
            vmInfo.pid = process.lastPid
          }

          return vmInfo
        })
      )

      // 过滤掉无效的VM
      return vms.filter(vm => vm !== null)
    } catch (error) {
      console.error(`Failed to list all VMs: ${error.message}`)
      throw error
    }
  }
  // 获取正在运行的VM列表
  listRunningVMs() {
    const runningVMs = this.processes.values()
    return Array.from(runningVMs)
  }
  async startVM(options) {
    const {
      vmName,
      memory,
      cpuCores,
      diskPath,
      isoPath,
      vncPort,
      networkType,
      portForwarding,
      monitorPort = 55555,
    } = options

    if (!vmName) {
      throw new Error('VM name is required')
    }

    if (!diskPath) {
      throw new Error('Disk path is required')
    }

    // 检查VM是否已经在运行
    if (this.processes.has(vmName)) {
      throw new Error(`VM ${vmName} is already running`)
    }

    // 获取虚拟机元数据
    let config = await this.getVMInfo(vmName)
    let metadata = config.metadata
    // 如果没有元数据，创建一个新的
    if (!metadata) {
      metadata = {
        vmName,
        created: new Date().toISOString(),
        isMountIso: true, // 默认首次启动挂载 ISO
        installed: false,
      }
    }

    // 检查QEMU是否已安装
    try {
      const { stdout } = await execPromise('qemu-system-x86_64 --version')
      console.log(`QEMU version: ${stdout.trim()}`)
    } catch (error) {
      throw new Error(`QEMU is not installed or not in PATH: ${error.message}`)
    }

    // 检查磁盘文件
    try {
      await fsPromise.access(diskPath, fs.constants.R_OK | fs.constants.W_OK)
      console.log(`Disk image accessible: ${diskPath}`)
    } catch (error) {
      throw new Error(`Cannot access disk image: ${error.message}`)
    }

    // 构建 QEMU 命令
    const qemuArgs = [
      '-name',
      vmName,
      '-m',
      `${memory || 2048}`,
      '-smp',
      `${cpuCores || 2}`,
      '-drive',
      `file=${diskPath},format=qcow2`,
      '-vnc',
      `:${vncPort - 5900 || 0}`,
      // "-monitor",
      // `tcp:127.0.0.1:${monitorPort},server,nowait`,
      '-daemonize',
    ]

    // 决定是否挂载 ISO
    console.log(`metadata isMoutIso`, metadata.isMountIso)
    const shouldMountIso = metadata.isMountIso !== false
    console.log(`ISO will be mounted: ${shouldMountIso}`)
    if (shouldMountIso && isoPath) {
      // 检查 ISO 文件
      try {
        await fsPromise.access(isoPath, fs.constants.R_OK)
        console.log(`ISO image accessible: ${isoPath}`)

        // 添加 ISO 挂载参数
        qemuArgs.push('-cdrom', isoPath)
        qemuArgs.push('-boot', 'd')

        console.log(`ISO will be mounted: ${isoPath}`)
      } catch (error) {
        throw new Error(`Cannot access ISO image: ${error.message}`)
      }
    } else {
      // 如果不挂载 ISO，明确从硬盘启动
      qemuArgs.push('-boot', 'c')
      console.log('No ISO will be mounted, booting from disk')
    }

    // 配置网络
    let netdevArgs = `id=net0`

    if (networkType === 'user') {
      netdevArgs += ',type=user'

      // 添加端口转发
      if (portForwarding && portForwarding.length > 0) {
        portForwarding.forEach(({ hostPort, guestPort, protocol = 'tcp' }) => {
          netdevArgs += `,hostfwd=${protocol}::${hostPort}-:${guestPort}`
        })
      }

      qemuArgs.push('-netdev', netdevArgs)
      qemuArgs.push('-device', 'virtio-net-pci,netdev=net0')
    } else if (networkType === 'bridge') {
      qemuArgs.push('-netdev', `bridge,id=net0,br=br0`)
      qemuArgs.push('-device', 'virtio-net-pci,netdev=net0')
    }

    // 启用 KVM 加速（如果可用）
    try {
      await fsPromise.access('/dev/kvm')
      qemuArgs.push('-enable-kvm')
      console.log('KVM acceleration enabled')
    } catch (error) {
      console.warn('KVM acceleration not available, running in emulation mode')
    }

    // 打印完整命令
    const qemuCommand = `qemu-system-x86_64 ${qemuArgs.join(' ')}`
    console.log(`Starting VM with command: ${qemuCommand}`)

    try {
      console.log('Starting VM...')
      const { stdout, stderr } = await execPromise(qemuCommand)

      if (stdout) console.log(`[${vmName}] stdout: ${stdout}`)
      if (stderr) console.error(`[${vmName}] stderr: ${stderr}`)

      // 获取QEMU进程的PID
      const { stdout: pidOutput } = await execPromise(`pgrep -f "qemu-system-x86_64.*${vmName}"`)
      const pid = parseInt(pidOutput.trim())

      if (!pid) {
        throw new Error('Failed to get PID of QEMU process')
      }

      console.log(`QEMU process started with PID: ${pid}`)

      // 创建进程对象
      const mockProcess = {
        pid,
        diskPath,
        monitorPort,
        kill: () => {
          try {
            execPromise(`kill ${pid}`)
            return true
          } catch (e) {
            return false
          }
        },
      }

      this.processes.set(vmName, JSON.stringify(mockProcess))

      // 更新VM元数据
      metadata = {
        status: 'running',
        lastPid: pid,
        lastCommand: qemuCommand,
        lastRunTime: new Date().toISOString(),
        monitorPort,
        vncPort: 5900 + (vncPort || 0),
        // 如果是首次启动且挂载了ISO，标记为安装中
        installing: shouldMountIso && !metadata.installed,
      }

      await this.updateVMMetadata(vmName, metadata)

      console.log(`VM ${vmName} started successfully`)

      return {
        vmName,
        pid,
        vncPort: 5900 + (vncPort || 0),
        monitorPort,
        status: 'running',
        isMountIso: shouldMountIso,
      }
    } catch (error) {
      console.error(`Failed to start VM: ${error.message}`)
      throw error
    }
  }

  async stopVM(vmName, PID) {
    // 使用JSON.stringify打印Map内容

    // if (!process) {
    //   return {
    //     vmName,
    //     status: `VM not found or not running: ${vmName}`,
    //   };
    //   throw new Error(`VM not found or not running: ${vmName}`);
    // }
    try {
      await execPromise(`kill ${PID}`)
      console.log(`Stopped VM: ${vmName}`)
      // 更新VM元数据
      await this.updateVMMetadata(vmName, {
        status: 'stopped',
        lastRunTime: new Date().toISOString(),
      })
      this.processes.delete(vmName)
      return { vmName, status: 'stopped' }
    } catch (e) {
      await this.updateVMMetadata(vmName, {
        status: 'stopped',
        lastRunTime: new Date().toISOString(),
      })
      this.processes.delete(vmName)
      return false
    }
  }
  async restartVM(vmName, pid) {
    try {
      console.log(`Restarting VM: ${vmName} (PID: ${pid})`)

      // 1. 检查VM是否存在
      const vmInfo = await this.getVMInfo(vmName)

      if (!vmInfo) {
        throw new Error(`VM ${vmName} not found`)
      }

      // 2. 检查VM是否正在运行
      let isRunning = false
      if (pid) {
        try {
          await execPromise(`ps -p ${pid}`)
          isRunning = true
        } catch (psError) {
          console.warn(`VM ${vmName} with PID ${pid} is not running, will try to start it`)
        }
      }

      // 3. 如果VM正在运行，先停止它
      if (isRunning) {
        console.log(`Stopping VM ${vmName} with PID ${pid}`)
        const stopResult = await this.stopVM(vmName, pid)

        if (!stopResult) {
          console.warn(`Failed to gracefully stop VM ${vmName}, will try to force kill`)
          try {
            await execPromise(`kill -9 ${pid}`)
            console.log(`Force killed VM ${vmName} with PID ${pid}`)
          } catch (killError) {
            console.error(`Failed to force kill VM ${vmName}:`, killError)
            // 继续尝试启动，即使强制终止失败
          }
        }

        // 等待一小段时间确保VM完全停止
        await new Promise(resolve => setTimeout(resolve, 3000))
      }

      // 4. 确保我们有VM配置
      if (!vmInfo.config) {
        throw new Error(`Could not find configuration for VM ${vmName}`)
      }

      const { config } = vmInfo

      // 5. 检查必要的配置是否存在
      if (!config.diskPath) {
        throw new Error(`VM ${vmName} configuration is missing diskPath`)
      }

      // 检查磁盘文件是否存在
      try {
        await fsPromise.access(config.diskPath)
      } catch (diskError) {
        throw new Error(`Disk image for VM ${vmName} not found at ${config.diskPath}`)
      }

      // 6. 重新启动VM
      console.log(`Starting VM ${vmName} with configuration:`, config)

      const startOptions = {
        vmName,
        memory: config.memory || 2048,
        cpuCores: config.cpuCores || 2,
        diskPath: config.diskPath,
        vncPort: config.vncPort || 0,
      }

      // 添加可选配置
      if (config.isoPath) startOptions.isoPath = config.isoPath
      if (config.networkType) startOptions.networkType = config.networkType
      if (config.portForwarding) startOptions.portForwarding = config.portForwarding

      const startResult = await this.startVM(startOptions)

      console.log(`VM ${vmName} restarted successfully with PID: ${startResult.pid}`)

      // 7. 更新VM元数据
      await this.updateVMMetadata(vmName, {
        status: 'running',
        lastPid: startResult.pid,
        lastRestart: new Date().toISOString(),
      })

      return {
        vmName,
        status: 'restarted',
        pid: startResult.pid,
        vncPort: startResult.vncPort,
        monitorPort: startResult.monitorPort,
      }
    } catch (error) {
      console.error(`Error restarting VM ${vmName}:`, error)

      // 尝试更新VM元数据以反映错误状态
      try {
        await this.updateVMMetadata(vmName, {
          status: 'error',
          lastError: error.message,
          lastErrorTime: new Date().toISOString(),
        })
      } catch (metadataError) {
        console.error(`Failed to update metadata after restart error:`, metadataError)
      }

      throw error
    }
  }

  async deleteVM(name, deleteVMDir = true) {
    const imagePath = path.join(this.vmStoragePath, name)
    const vmName = path.basename(name, path.extname(name))
    const vmDir = path.join(this.vmStoragePath, vmName)

    console.log('imagePath', imagePath)
    console.log('vmName', vmName)
    console.log('vmDir', vmDir)

    try {
      // await fsPromise.unlink(imagePath);
      // console.log(`Deleted image: ${imagePath}`);

      // 如果需要删除VM目录
      if (deleteVMDir) {
        try {
          // 检查VM目录是否存在
          await fsPromise.access(vmDir)

          // 读取目录内容
          const files = await fsPromise.readdir(vmDir)

          // 删除目录中的所有文件
          for (const file of files) {
            await fsPromise.unlink(path.join(vmDir, file))
          }

          // 删除目录
          await fsPromise.rmdir(vmDir)
          console.log(`Deleted VM directory: ${vmDir}`)
        } catch (error) {
          console.warn(`Failed to delete VM directory: ${error.message}`)
        }
      }

      return {
        name,
        path: imagePath,
        deleted: true,
        vmDirDeleted: deleteVMDir,
      }
    } catch (error) {
      console.error(`Failed to delete image: ${error.message}`)
      throw error
    }
  }

  /**
   * 切换虚拟机的 ISO 镜像并更新配置
   * @param {string} vmName - 虚拟机名称
   * @returns {Promise<Object>} - 返回更新后的虚拟机元数据
   */
  async toggleMountIso(vmName, mountStatus) {
    if (!vmName) {
      throw new Error('VM name is required')
    }

    console.log(`Unmounting ISO for VM: ${vmName}`)

    // 检查虚拟机是否存在
    const metadata = await this.getVMInfo(vmName)
    if (!metadata) {
      throw new Error(`VM ${vmName} not found`)
    }

    // 检查虚拟机是否正在运行
    const isRunning = this.processes.has(vmName)

    if (isRunning) {
      // 如果虚拟机正在运行，使用 QEMU Monitor 命令卸载 ISO
      try {
        const processInfo = JSON.parse(this.processes.get(vmName))
        const monitorPort = metadata.monitorPort || 55555

        // 使用 nc (netcat) 发送 QEMU Monitor 命令卸载 ISO
        const command = `echo "eject -f ide1-cd0" | nc localhost ${monitorPort}`

        console.log(`Executing monitor command: ${command}`)
        const { stdout, stderr } = await execPromise(command)

        if (stderr && stderr.trim()) {
          console.warn(`Warning during ISO unmount: ${stderr}`)
        }

        console.log(`ISO unmount result: ${stdout || 'Success'}`)
      } catch (error) {
        console.error(`Failed to unmount ISO via monitor: ${error.message}`)
        throw new Error(`Failed to unmount ISO: ${error.message}`)
      }
    }

    // 更新虚拟机元数据，标记 ISO 已卸载
    const updatedMetadata = {
      isMountIso: mountStatus,
      isoUnmountTime: new Date().toISOString(),
      installed: true,
    }

    // 保存更新后的元数据
    await this.updateVMMetadata(vmName, updatedMetadata)
    // await this.stopVM(vmName, metadata.metadata.lastPid);
    // await this.startVM({...metadata.config, vmName: metadata.config.name});
    console.log(`ISO unmounted and configuration updated for VM: ${vmName}`)

    return updatedMetadata
  }

  async startNoVNC(vncPort = 5900, webPort = 6080) {
    try {
      // 获取服务器IP地址
      const serverIP = this.getServerIP()
      console.log(`Using server IP: ${serverIP}`)

      // 为每个VNC端口分配一个唯一的Web端口
      // 这样每个VNC连接都有自己的noVNC实例
      const dedicatedWebPort = webPort + (vncPort - 5900)

      // 构建VNC链接URL
      const vncUrl = `http://${serverIP}:${dedicatedWebPort}/vnc.html?autoconnect=true&resize=scale&reconnect=1`

      // 检查是否已经有为这个VNC端口启动的noVNC实例
      const checkResult = await this.isPortInUse(dedicatedWebPort)

      if (checkResult.inUse) {
        console.log(`noVNC for VNC port ${vncPort} already running on web port ${dedicatedWebPort}`)

        return {
          webPort: dedicatedWebPort,
          vncPort,
          url: vncUrl,
          alreadyRunning: true,
        }
      }

      // 启动专用的noVNC实例
      const { exec } = require('child_process')
      const util = require('util')
      const execPromise = util.promisify(exec)

      // 使用最基本的novnc_proxy命令，直接指定VNC端口和Web端口
      const command = `nohup /root/test/noVNC/utils/novnc_proxy --vnc localhost:${vncPort} --listen ${dedicatedWebPort} --web /root/test/noVNC > /tmp/novnc_${vncPort}.log 2>&1 & echo $!`

      console.log(`Starting dedicated noVNC for VNC port ${vncPort} with command: ${command}`)

      const { stdout } = await execPromise(command)
      const pid = parseInt(stdout.trim())

      if (!pid) {
        throw new Error(`Failed to get PID of noVNC process for VNC port ${vncPort}`)
      }

      console.log(
        `Dedicated noVNC for VNC port ${vncPort} started with PID: ${pid} on web port ${dedicatedWebPort}`
      )

      // 等待一小段时间确保进程启动
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 检查进程是否真的在运行
      try {
        await execPromise(`ps -p ${pid}`)
        console.log(`Confirmed noVNC process ${pid} is running`)

        // 检查端口是否真的在监听
        const { stdout: netstatOutput } = await execPromise(
          `netstat -tuln | grep :${dedicatedWebPort}`
        )
        if (!netstatOutput.trim()) {
          throw new Error(`Web port ${dedicatedWebPort} is not listening after noVNC start`)
        }
        console.log(`Confirmed web port ${dedicatedWebPort} is listening`)
      } catch (error) {
        throw new Error(`Failed to verify noVNC startup: ${error.message}`)
      }

      return {
        webPort: dedicatedWebPort,
        vncPort,
        pid,
        url: vncUrl,
        alreadyRunning: false,
      }
    } catch (error) {
      console.error(`Failed to start noVNC for VNC port ${vncPort}: ${error.message}`)

      // 即使启动失败，也尝试返回URL
      const serverIP = this.getServerIP()
      const dedicatedWebPort = webPort + (vncPort - 5900)
      const vncUrl = `http://${serverIP}:${dedicatedWebPort}/vnc.html?autoconnect=true&resize=scale&reconnect=1`

      return {
        webPort: dedicatedWebPort,
        vncPort,
        url: vncUrl,
        error: error.message,
      }
    }
  }

  // 辅助方法：检查端口是否在使用中
  async isPortInUse(port) {
    const { exec } = require('child_process')
    const util = require('util')
    const execPromise = util.promisify(exec)

    try {
      const { stdout } = await execPromise(`netstat -tuln | grep :${port}`)
      return { inUse: stdout.trim().length > 0 }
    } catch (error) {
      return { inUse: false }
    }
  }

  getServerIP() {
    const os = require('os')
    const networkInterfaces = os.networkInterfaces()

    // 尝试找到一个非内部的IPv4地址
    for (const interfaceName in networkInterfaces) {
      const interfaces = networkInterfaces[interfaceName]

      for (const iface of interfaces) {
        // 跳过内部地址和非IPv4地址
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address
        }
      }
    }

    // 如果没有找到合适的地址，回退到localhost
    return 'localhost'
  }

  async getVMStats(vmName) {
    const process = this.processes.get(vmName)

    if (!process) {
      throw new Error(`VM not found or not running: ${vmName}`)
    }

    try {
      // 使用 ps 命令获取 CPU 和内存使用情况
      const { stdout } = await execPromise(`ps -p ${process.pid} -o %cpu,%mem,rss`)
      const lines = stdout.trim().split('\n')

      if (lines.length < 2) {
        throw new Error('Failed to get process stats')
      }

      const [cpu, mem, rss] = lines[1].trim().split(/\s+/)

      // 使用 QEMU Monitor 获取更多信息
      let diskStats = {}
      let netStats = {}

      try {
        if (process.monitorPort) {
          const infoBlockResponse = await this.sendMonitorCommand(vmName, 'info block')
          // 解析磁盘信息...

          const netdevStatsResponse = await this.sendMonitorCommand(vmName, 'info network')
          // 解析网络信息...
        }
      } catch (monitorError) {
        console.warn(`Failed to get monitor stats: ${monitorError.message}`)
      }

      return {
        vmName,
        pid: process.pid,
        cpu: parseFloat(cpu),
        memory: {
          percentage: parseFloat(mem),
          rss: parseInt(rss) * 1024, // 转换为字节
        },
        disk: diskStats,
        network: netStats,
        timestamp: new Date(),
      }
    } catch (error) {
      console.error(`Failed to get VM stats: ${error.message}`)
      throw error
    }
  }

  // 检查镜像是否正在被使用
  isImageInUse(imagePath) {
    for (const [vmName, process] of this.processes.entries()) {
      if (process.diskPath === imagePath) {
        return true
      }
    }
    return false
  }

  // 创建完整的VM（包括磁盘、配置和元数据）
  async createCompleteVM(options) {
    const {
      vmName,
      diskSize = '20G',
      memory = 2048,
      cpuCores = 2,
      diskFormat = 'qcow2',
      vncPort,
      networkType = 'user',
      portForwarding = [],
      isoPath = null,
      bootOrder = 'c',
      startAfterCreation = false,
    } = options

    if (!vmName) {
      return {
        error: 'VM name is required',
      }
      throw new Error('VM name is required')
    }

    try {
      // 1. 创建VM目录
      const vmDir = path.join(this.vmStoragePath, vmName)

      try {
        await fsPromise.access(vmDir)
        // throw new Error(`VM directory already exists: ${vmDir}`);
        return {
          vmName,
          vmDir,
          error: 'VM directory already exists',
        }
      } catch (error) {
        // 目录不存在，可以继续创建
        if (error.code !== 'ENOENT') {
          throw error
        }

        await fsPromise.mkdir(vmDir, { recursive: true })
        console.log(`Created VM directory: ${vmDir}`)
      }

      // 2. 创建磁盘镜像
      const diskName = `${vmName}.${diskFormat}`
      const diskPath = path.join(vmDir, diskName)

      console.log(`Creating disk image: ${diskPath} (${diskSize})`)
      const command = `qemu-img create -f ${diskFormat} "${diskPath}" ${diskSize}`
      await execPromise(command)

      // 获取创建的磁盘信息
      const { stdout: diskInfoJson } = await execPromise(
        `qemu-img info --output=json "${diskPath}"`
      )
      const diskInfo = JSON.parse(diskInfoJson)

      // 3. 创建VM配置和元数据
      const vmDirInfo = await this.createVMDirectory(vmName, {
        diskPath,
        diskSize,
        diskFormat,
        memory,
        cpuCores,
        vncPort,
        networkType,
        portForwarding,
        isoPath,
        bootOrder,
        virtualDiskSize: diskInfo.virtual_size,
        actualDiskSize: diskInfo.actual_size || 0,
      })

      // 4. 如果需要，启动VM
      let startResult = null
      if (startAfterCreation) {
        startResult = await this.startVM({
          vmName,
          memory,
          cpuCores,
          diskPath,
          isoPath,
          vncPort,
          networkType,
          portForwarding,
        })
      }

      return {
        vmName,
        diskPath,
        diskInfo,
        config: vmDirInfo.config,
        metadata: vmDirInfo.metadata,
        vmDir,
        startResult,
      }
    } catch (error) {
      console.error(`Failed to create complete VM: ${error.message}`)
      throw error
    }
  }

  /**
   * 更新VM配置
   * @param {string} vmName - 虚拟机名称
   * @param {Object} config - 新配置
   */
  async updateVMConfig(vmName, config) {
    try {
      const vmDir = path.join(this.vmStoragePath, vmName)
      const configPath = path.join(vmDir, 'config.json')

      // 确保目录存在
      if (!fs.existsSync(vmDir)) {
        throw new Error(`虚拟机目录不存在: ${vmDir}`)
      }

      // 更新配置文件
      await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2))

      // 更新元数据
      await this.updateVMMetadata(vmName, {
        configUpdated: new Date().toISOString(),
      })

      return config
    } catch (error) {
      console.error(`更新VM配置失败: ${error.message}`)
      throw error
    }
  }

  // 发送QEMU监视器命令
  async sendMonitorCommand(vmName, command) {
    const process = this.processes.get(vmName)

    if (!process) {
      throw new Error(`VM not found or not running: ${vmName}`)
    }

    if (!process.monitorPort) {
      throw new Error(`Monitor port not available for VM: ${vmName}`)
    }

    try {
      // 使用netcat发送命令到QEMU监视器
      const { stdout } = await execPromise(
        `echo "${command}" | nc localhost ${process.monitorPort}`
      )
      return stdout
    } catch (error) {
      console.error(`Failed to send monitor command: ${error.message}`)
      throw error
    }
  }

  /**
   * 检查虚拟机是否存在的辅助方法
   * 可以添加到 vmManager 类中
   */
  async checkVMExists(vmName) {
    try {
      const metadata = await this.getVMInfo(vmName)
      return metadata !== null
    } catch (error) {
      console.error(`Error checking if VM exists: ${error.message}`)
      return false
    }
  }

  /**
   * 检查虚拟机是否正在运行的辅助方法
   * 可以添加到 vmManager 类中
   */
  async isVMRunning(vmName) {
    const config = await this.getVMInfo(vmName)
    return config && config.status
  }
}

module.exports = QemuManager
