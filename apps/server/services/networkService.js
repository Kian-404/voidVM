// src/services/networkService.js
const { exec, spawn } = require('child_process')
const { promisify } = require('util')
const fs = require('fs').promises
const path = require('path')
const EventEmitter = require('events')

const execAsync = promisify(exec)

class NetworkService extends EventEmitter {
  constructor() {
    super()
    this.bridges = new Map()
    this.tapInterfaces = new Map()
    this.networkConfigs = new Map()
  }

  // 创建桥接网络
  async createBridge(bridgeName, options = {}) {
    try {
      const { ip = '192.168.100.1', netmask = '255.255.255.0', dhcp = false } = options

      // 检查桥接是否已存在
      const existingBridge = await this.getBridgeInfo(bridgeName)
      if (existingBridge) {
        throw new Error(`Bridge ${bridgeName} already exists`)
      }

      // 创建桥接
      await execAsync(` ip link add name ${bridgeName} type bridge`)
      await execAsync(` ip addr add ${ip}/${this.cidrFromNetmask(netmask)} dev ${bridgeName}`)
      await execAsync(` ip link set ${bridgeName} up`)

      // 配置 DHCP（如果需要）
      if (dhcp) {
        await this.setupDHCP(bridgeName, options)
      }

      const bridgeConfig = {
        name: bridgeName,
        ip,
        netmask,
        dhcp,
        created: new Date(),
        status: 'active',
      }

      this.bridges.set(bridgeName, bridgeConfig)

      this.emit('bridge-created', bridgeConfig)
      return bridgeConfig
    } catch (error) {
      throw new Error(`Failed to create bridge ${bridgeName}: ${error.message}`)
    }
  }

  // 删除桥接网络
  async deleteBridge(bridgeName) {
    try {
      await execAsync(` ip link delete ${bridgeName}`)
      this.bridges.delete(bridgeName)

      this.emit('bridge-deleted', { name: bridgeName })
      return true
    } catch (error) {
      throw new Error(`Failed to delete bridge ${bridgeName}: ${error.message}`)
    }
  }

  // 创建 TAP 接口
  async createTapInterface(tapName, bridgeName = null) {
    try {
      // 检查 TAP 接口是否已存在
      const existingTap = await this.getAllInterfaces()
        .then(interfaces => interfaces.find(iface => iface.name === tapName))
        .catch(() => null)

      if (existingTap) {
        throw new Error(`TAP interface ${tapName} already exists`)
      }

      // 创建 TAP 接口
      await execAsync(`ip tuntap add dev ${tapName} mode tap`)
      await execAsync(`ip link set ${tapName} up`)

      // 将 TAP 接口添加到桥接
      if (bridgeName) {
        // 检查桥接是否存在
        const bridgeExists = await this.getBridgeInfo(bridgeName)
        if (!bridgeExists) {
          throw new Error(`Bridge ${bridgeName} does not exist`)
        }

        await execAsync(`ip link set ${tapName} master ${bridgeName}`)
      }

      const tapConfig = {
        name: tapName,
        bridge: bridgeName,
        created: new Date(),
        status: 'active',
      }

      this.tapInterfaces.set(tapName, tapConfig)

      this.emit('tap-created', tapConfig)
      return tapConfig
    } catch (error) {
      throw new Error(`Failed to create TAP interface ${tapName}: ${error.message}`)
    }
  }

  // 删除 TAP 接口
  async deleteTapInterface(tapName) {
    try {
      await execAsync(` ip link delete ${tapName}`)
      this.tapInterfaces.delete(tapName)

      this.emit('tap-deleted', { name: tapName })
      return true
    } catch (error) {
      throw new Error(`Failed to delete TAP interfaceNet ${tapName}: ${error.message}`)
    }
  }

  // 获取所有 TAP 接口
  async getTapInterfaces() {
    try {
      // 获取所有网络接口（现在包含地址信息）
      const allInterfaces = await this.getAllInterfaces()

      // 筛选出 TAP 类型的接口
      const tapInterfaces = allInterfaces.filter(
        iface =>
          iface.type === 'tap' || iface.name.startsWith('tap') || iface.name.startsWith('tun')
      )

      // 获取详细信息并合并本地存储的配置
      const detailedTapList = []

      for (const tapInterface of tapInterfaces) {
        try {
          // 检查是否连接到桥接
          const bridgeInfo = await this.getTapBridgeInfo(tapInterface.name)

          // 合并本地存储的配置信息
          const storedConfig = this.tapInterfaces.get(tapInterface.name)

          // 提取主要IP地址
          const primaryIP = this.extractPrimaryIP(tapInterface.addresses)

          const tapInfo = {
            name: tapInterface.name,
            type: tapInterface.type,
            status: tapInterface.status,
            bridge: bridgeInfo || storedConfig?.bridge || null,
            ip: primaryIP,
            addresses: tapInterface.addresses, // 完整的地址列表
            mac: tapInterface.mac,
            mtu: tapInterface.mtu,
            created: storedConfig?.created || null,
            flags: tapInterface.flags,
          }

          detailedTapList.push(tapInfo)
        } catch (error) {
          console.warn(
            `Failed to get details for TAP interface ${tapInterface.name}:`,
            error.message
          )
          detailedTapList.push({
            name: tapInterface.name,
            type: tapInterface.type,
            status: tapInterface.status,
            bridge: this.tapInterfaces.get(tapInterface.name)?.bridge || null,
            addresses: tapInterface.addresses || [],
            error: error.message,
          })
        }
      }

      this.emit('tap-list-retrieved', detailedTapList)
      return detailedTapList
    } catch (error) {
      throw new Error(`Failed to get TAP interfaces: ${error.message}`)
    }
  }

  // 获取 TAP 接口的桥接信息
  async getTapBridgeInfo(tapName) {
    try {
      // 使用 bridge 命令查看接口是否连接到桥接
      const { stdout } = await execAsync(
        `bridge link show dev ${tapName} 2>/dev/null || echo "no bridge"`
      )

      if (stdout && !stdout.includes('no bridge') && stdout.trim()) {
        // 解析桥接信息
        const bridgeMatch = stdout.match(/master (\w+)/)
        if (bridgeMatch) {
          return bridgeMatch[1]
        }
      }

      // 如果 bridge 命令不可用，尝试使用 ip 命令
      const { stdout: ipOutput } = await execAsync(`ip link show ${tapName}`)
      const masterMatch = ipOutput.match(/master (\w+)/)
      if (masterMatch) {
        return masterMatch[1]
      }

      return null
    } catch (error) {
      // 如果命令执行失败，返回 null 而不是抛出错误
      return null
    }
  }

  // 获取单个 TAP 接口的详细信息
  async getTapInterfaceDetails(tapName) {
    try {
      // 检查接口是否存在
      const allInterfaces = await this.getAllInterfaces()
      const tapInterface = allInterfaces.find(iface => iface.name === tapName)

      if (!tapInterface) {
        throw new Error(`TAP interface ${tapName} not found`)
      }

      // 获取详细信息
      const { stdout: addrInfo } = await execAsync(`ip addr show ${tapName}`)
      const { stdout: linkInfo } = await execAsync(`ip link show ${tapName}`)

      const details = this.parseInterfaceDetails(linkInfo, addrInfo)
      const bridgeInfo = await this.getTapBridgeInfo(tapName)
      const storedConfig = this.tapInterfaces.get(tapName)

      const tapDetails = {
        name: tapName,
        type: tapInterface.type,
        status: details.status,
        bridge: bridgeInfo || storedConfig?.bridge || null,
        ip: details.ip,
        mac: details.mac,
        mtu: details.mtu || tapInterface.mtu,
        created: storedConfig?.created || null,
        flags: tapInterface.flags,
        statistics: await this.getNetworkStats(tapName).catch(() => null),
      }

      this.emit('tap-details-retrieved', tapDetails)
      return tapDetails
    } catch (error) {
      throw new Error(`Failed to get TAP interface details for ${tapName}: ${error.message}`)
    }
  }

  // 获取桥接信息
  async getBridgeInfo(bridgeName) {
    try {
      const { stdout } = await execAsync(`ip link show ${bridgeName}`)
      if (stdout) {
        const { stdout: addrInfo } = await execAsync(`ip addr show ${bridgeName}`)
        return this.parseBridgeInfo(stdout, addrInfo)
      }
      return null
    } catch (error) {
      return null
    }
  }

  // 获取所有网络接口
  async getAllInterfaces() {
    try {
      const { stdout: linkOutput } = await execAsync('ip link show')
      const { stdout: addrOutput } = await execAsync('ip addr show')
      return this.parseInterfaceList(linkOutput, addrOutput)
    } catch (error) {
      throw new Error(`Failed to get interfaces: ${error.message}`)
    }
  }

  // 设置端口转发
  async setupPortForward(hostPort, guestIP, guestPort, protocol = 'tcp') {
    try {
      const rule = `PREROUTING -t nat -p ${protocol} --dport ${hostPort} -j DNAT --to ${guestIP}:${guestPort}`
      await execAsync(` iptables -A ${rule}`)

      const forwardRule = {
        hostPort,
        guestIP,
        guestPort,
        protocol,
        created: new Date(),
      }

      this.emit('port-forward-created', forwardRule)
      return forwardRule
    } catch (error) {
      throw new Error(`Failed to setup port forward: ${error.message}`)
    }
  }

  // 移除端口转发
  async removePortForward(hostPort, guestIP, guestPort, protocol = 'tcp') {
    try {
      const rule = `PREROUTING -t nat -p ${protocol} --dport ${hostPort} -j DNAT --to ${guestIP}:${guestPort}`
      await execAsync(` iptables -D ${rule}`)

      this.emit('port-forward-removed', { hostPort, guestIP, guestPort, protocol })
      return true
    } catch (error) {
      throw new Error(`Failed to remove port forward: ${error.message}`)
    }
  }

  // 配置网络流量控制
  async setupTrafficControl(interfaceNet, options = {}) {
    const { bandwidth = '100mbit', delay = '0ms', loss = '0%' } = options

    try {
      // 删除现有规则
      await execAsync(` tc qdisc del dev ${interfaceNet} root 2>/dev/null || true`)

      // 添加根队列
      await execAsync(` tc qdisc add dev ${interfaceNet} root handle 1: htb default 30`)

      // 添加类别
      await execAsync(
        ` tc class add dev ${interfaceNet} parent 1: classid 1:1 htb rate ${bandwidth}`
      )

      // 添加延迟和丢包
      if (delay !== '0ms' || loss !== '0%') {
        await execAsync(
          ` tc qdisc add dev ${interfaceNet} parent 1:1 handle 10: netem delay ${delay} loss ${loss}`
        )
      }

      return { interfaceNet, bandwidth, delay, loss }
    } catch (error) {
      throw new Error(`Failed to setup traffic control: ${error.message}`)
    }
  }

  // 工具方法
  cidrFromNetmask(netmask) {
    const parts = netmask.split('.')
    let cidr = 0
    for (let part of parts) {
      cidr += (parseInt(part).toString(2).match(/1/g) || []).length
    }
    return cidr
  }

  parseBridgeInfo(linkInfo, addrInfo) {
    // 解析桥接信息的实现
    const nameMatch = linkInfo.match(/(\w+):/)
    const name = nameMatch ? nameMatch[1] : null

    const ipMatch = addrInfo.match(/inet (\d+\.\d+\.\d+\.\d+\/\d+)/)
    const ip = ipMatch ? ipMatch[1] : null

    return { name, ip, status: 'active' }
  }

  parseInterfaceList(linkOutput, addrOutput = null) {
    const interfaces = []
    const linkLines = linkOutput.split('\n')

    // 解析地址信息到Map中以便快速查找
    const addressMap = new Map()
    if (addrOutput) {
      this.parseAddressInfo(addrOutput, addressMap)
    }

    for (let i = 0; i < linkLines.length; i++) {
      const line = linkLines[i].trim()
      const match = line.match(/^\d+: ([^:@]+)[@:]?\s*<([^>]*)>.*mtu (\d+)/)

      if (match) {
        const name = match[1]
        const flags = match[2]
        const mtu = parseInt(match[3])

        // 判断接口类型
        const type = this.determineInterfaceType(name, flags, line)

        // 判断状态
        const status = flags.includes('UP') ? 'up' : 'down'

        // 获取MAC地址（从当前行或下一行）
        let mac = null
        const macMatch = line.match(/link\/ether ([a-fA-F0-9:]{17})/)
        if (macMatch) {
          mac = macMatch[1]
        } else if (i + 1 < linkLines.length) {
          const nextLine = linkLines[i + 1].trim()
          const nextMacMatch = nextLine.match(/link\/ether ([a-fA-F0-9:]{17})/)
          if (nextMacMatch) {
            mac = nextMacMatch[1]
          }
        }

        // 从地址映射中获取IP地址信息
        const addresses = addressMap.get(name) || []

        interfaces.push({
          name,
          type,
          status,
          mtu,
          addresses,
          mac,
          flags,
        })
      }
    }

    return interfaces
  }
  // 提取主要IP地址
  extractPrimaryIP(addresses) {
    if (!addresses || addresses.length === 0) {
      return null
    }

    // 优先返回IPv4地址，且不是回环地址
    const ipv4Address = addresses.find(
      addr => addr.family === 'IPv4' && !addr.address.startsWith('127.') && addr.scope === 'global'
    )

    if (ipv4Address) {
      return ipv4Address.address
    }

    // 如果没有合适的IPv4地址，返回第一个非回环地址
    const nonLoopback = addresses.find(
      addr => !addr.address.startsWith('127.') && !addr.address.startsWith('::1')
    )

    return nonLoopback ? nonLoopback.address : addresses[0].address
  }

  // 解析地址信息
  parseAddressInfo(addrOutput, addressMap) {
    const lines = addrOutput.split('\n')
    let currentInterface = null

    for (const line of lines) {
      const trimmedLine = line.trim()

      // 检查是否是接口定义行
      const interfaceMatch = trimmedLine.match(/^\d+: ([^:@]+)[@:]/)
      if (interfaceMatch) {
        currentInterface = interfaceMatch[1]
        if (!addressMap.has(currentInterface)) {
          addressMap.set(currentInterface, [])
        }
        continue
      }

      // 解析IP地址信息
      if (currentInterface && trimmedLine.startsWith('inet')) {
        const inetMatch = trimmedLine.match(/inet6?\s+([^\s]+)/)
        if (inetMatch) {
          const address = inetMatch[1]
          const isIPv6 = trimmedLine.startsWith('inet6')

          // 解析其他属性
          const scope = this.extractScope(trimmedLine)
          const flags = this.extractAddressFlags(trimmedLine)

          const addressInfo = {
            address,
            family: isIPv6 ? 'IPv6' : 'IPv4',
            scope,
            flags,
            raw: trimmedLine,
          }

          addressMap.get(currentInterface).push(addressInfo)
        }
      }
    }
  }

  // 提取地址作用域
  extractScope(line) {
    const scopeMatch = line.match(/scope\s+(\w+)/)
    return scopeMatch ? scopeMatch[1] : 'global'
  }

  // 提取地址标志
  extractAddressFlags(line) {
    const flags = []

    if (line.includes('temporary')) flags.push('temporary')
    if (line.includes('deprecated')) flags.push('deprecated')
    if (line.includes('tentative')) flags.push('tentative')
    if (line.includes('duplicated')) flags.push('duplicated')
    if (line.includes('permanent')) flags.push('permanent')
    if (line.includes('dynamic')) flags.push('dynamic')

    return flags
  }

  // 判断接口类型
  determineInterfaceType(name, flags, line) {
    // 根据接口名称和特征判断类型
    if (name.startsWith('br') || line.includes('bridge')) {
      return 'bridge'
    } else if (name.startsWith('tap') || name.startsWith('tun')) {
      return 'tap'
    } else if (name === 'lo') {
      return 'loopback'
    } else if (name.startsWith('wl') || name.startsWith('wifi')) {
      return 'wireless'
    } else if (name.startsWith('eth') || name.startsWith('en')) {
      return 'ethernet'
    } else if (name.startsWith('docker') || name.startsWith('veth')) {
      return 'virtual'
    } else {
      return 'unknown'
    }
  }
  async setupDHCP(bridgeName, options) {
    // DHCP 配置实现
    const { dhcpStart = '192.168.100.10', dhcpEnd = '192.168.100.100', lease = '12h' } = options

    // 这里可以配置 dnsmasq 或其他 DHCP 服务
    const dhcpConfig = `
interfaceNet=${bridgeName}
dhcp-range=${dhcpStart},${dhcpEnd},${lease}
dhcp-option=3,${options.ip}
dhcp-option=6,8.8.8.8
`

    await fs.writeFile(`/tmp/dnsmasq-${bridgeName}.conf`, dhcpConfig)
    // 启动 dnsmasq
    // await execAsync(` dnsmasq --conf-file=/tmp/dnsmasq-${bridgeName}.conf`);
  }

  async getNetworkStats(interfaceName) {
    try {
      // 如果没有指定接口名，获取所有接口的统计信息
      if (!interfaceName) {
        return await this.getAllNetworkStats()
      }

      // 检查接口是否存在
      const interfaces = await this.getAllInterfaces()
      const targetInterface = interfaces.find(iface => iface.name === interfaceName)
      if (!targetInterface) {
        throw new Error(`Interface ${interfaceName} not found`)
      }

      // 从 /proc/net/dev 获取网络统计信息
      const statsData = await fs.readFile('/proc/net/dev', 'utf8')
      const stats = this.parseNetworkStats(statsData, interfaceName)

      if (!stats) {
        throw new Error(`No statistics found for interface ${interfaceName}`)
      }

      // 获取接口详细信息
      const { stdout: linkInfo } = await execAsync(`ip link show ${interfaceName}`)
      const { stdout: addrInfo } = await execAsync(`ip addr show ${interfaceName}`)

      // 解析接口状态和IP信息
      const interfaceDetails = this.parseInterfaceDetails(linkInfo, addrInfo)

      // 获取实时速率（如果可能）
      const rateInfo = await this.getInterfaceRates(interfaceName)

      const result = {
        interface: interfaceName,
        status: interfaceDetails.status,
        ip: interfaceDetails.ip,
        mac: interfaceDetails.mac,
        mtu: interfaceDetails.mtu,
        statistics: {
          rx: {
            bytes: stats.rx_bytes,
            packets: stats.rx_packets,
            errors: stats.rx_errors,
            dropped: stats.rx_dropped,
            fifo: stats.rx_fifo,
            frame: stats.rx_frame,
            compressed: stats.rx_compressed,
            multicast: stats.rx_multicast,
          },
          tx: {
            bytes: stats.tx_bytes,
            packets: stats.tx_packets,
            errors: stats.tx_errors,
            dropped: stats.tx_dropped,
            fifo: stats.tx_fifo,
            collisions: stats.tx_collisions,
            carrier: stats.tx_carrier,
            compressed: stats.tx_compressed,
          },
          total: {
            rx_bytes: stats.rx_bytes,
            tx_bytes: stats.tx_bytes,
            total_bytes: stats.rx_bytes + stats.tx_bytes,
            rx_packets: stats.rx_packets,
            tx_packets: stats.tx_packets,
            total_packets: stats.rx_packets + stats.tx_packets,
          },
        },
        rates: rateInfo,
        timestamp: new Date().toISOString(),
      }

      // 格式化字节数为人类可读格式
      result.formatted = {
        rx_bytes: this.formatBytes(stats.rx_bytes),
        tx_bytes: this.formatBytes(stats.tx_bytes),
        total_bytes: this.formatBytes(stats.rx_bytes + stats.tx_bytes),
      }

      return result
    } catch (error) {
      throw new Error(`Failed to get network stats for ${interfaceName}: ${error.message}`)
    }
  }

  // 获取所有接口的网络统计信息
  async getAllNetworkStats() {
    try {
      const interfaces = await this.getAllInterfaces()
      const allStats = {}

      for (const iface of interfaces) {
        try {
          allStats[iface.name] = await this.getNetworkStats(iface.name)
        } catch (error) {
          // 如果某个接口获取失败，继续处理其他接口
          allStats[iface.name] = { error: error.message }
        }
      }

      return allStats
    } catch (error) {
      throw new Error(`Failed to get all network stats: ${error.message}`)
    }
  }

  // 解析 /proc/net/dev 中的网络统计信息
  parseNetworkStats(data, interfaceName) {
    const lines = data.split('\n')

    for (let line of lines) {
      line = line.trim()
      if (line.startsWith(interfaceName + ':')) {
        // 移除接口名和冒号
        const statsLine = line.substring(interfaceName.length + 1).trim()
        const values = statsLine.split(/\s+/).map(val => parseInt(val) || 0)

        if (values.length >= 16) {
          return {
            // 接收统计
            rx_bytes: values[0],
            rx_packets: values[1],
            rx_errors: values[2],
            rx_dropped: values[3],
            rx_fifo: values[4],
            rx_frame: values[5],
            rx_compressed: values[6],
            rx_multicast: values[7],
            // 发送统计
            tx_bytes: values[8],
            tx_packets: values[9],
            tx_errors: values[10],
            tx_dropped: values[11],
            tx_fifo: values[12],
            tx_collisions: values[13],
            tx_carrier: values[14],
            tx_compressed: values[15],
          }
        }
      }
    }

    return null
  }

  // 解析接口详细信息
  parseInterfaceDetails(linkInfo, addrInfo) {
    const details = {
      status: 'down',
      ip: null,
      mac: null,
      mtu: null,
    }

    // 解析状态
    if (linkInfo.includes('state UP')) {
      details.status = 'up'
    }

    // 解析MTU
    const mtuMatch = linkInfo.match(/mtu (\d+)/)
    if (mtuMatch) {
      details.mtu = parseInt(mtuMatch[1])
    }

    // 解析MAC地址
    const macMatch = linkInfo.match(/link\/ether ([a-fA-F0-9:]{17})/)
    if (macMatch) {
      details.mac = macMatch[1]
    }

    // 解析IP地址
    const ipMatch = addrInfo.match(/inet (\d+\.\d+\.\d+\.\d+\/\d+)/)
    if (ipMatch) {
      details.ip = ipMatch[1]
    }

    return details
  }

  // 获取接口实时速率信息
  async getInterfaceRates(interfaceName) {
    try {
      // 获取两次统计数据来计算速率
      const stats1 = await this.getSingleInterfaceStats(interfaceName)

      // 等待1秒
      await new Promise(resolve => setTimeout(resolve, 1000))

      const stats2 = await this.getSingleInterfaceStats(interfaceName)

      if (stats1 && stats2) {
        const timeDiff = 1 // 1秒间隔
        const rxRate = (stats2.rx_bytes - stats1.rx_bytes) / timeDiff
        const txRate = (stats2.tx_bytes - stats1.tx_bytes) / timeDiff

        return {
          rx_rate_bps: rxRate,
          tx_rate_bps: txRate,
          rx_rate_formatted: this.formatBytes(rxRate) + '/s',
          tx_rate_formatted: this.formatBytes(txRate) + '/s',
        }
      }

      return null
    } catch (error) {
      // 如果获取速率失败，返回null而不是抛出错误
      return null
    }
  }

  // 获取单个接口的统计信息（用于计算速率）
  async getSingleInterfaceStats(interfaceName) {
    try {
      const statsData = await fs.readFile('/proc/net/dev', 'utf8')
      return this.parseNetworkStats(statsData, interfaceName)
    } catch (error) {
      return null
    }
  }

  // 格式化字节数为人类可读格式
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

module.exports = NetworkService
