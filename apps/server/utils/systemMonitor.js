const si = require('systeminformation');
const os = require('os');

class SystemMonitor {
  constructor() {
    this.data = {
      cpu: {
        usage: 0,
        cores: os.cpus().length,
        model: os.cpus()[0].model,
        speed: os.cpus()[0].speed
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usagePercentage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2)
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        uptime: os.uptime()
      },
      disk: {
        total: 0,
        free: 0,
        used: 0,
        usagePercentage: 0
      },
      network: {
        interfaces: [],
        stats: {
          rx_bytes: 0,
          tx_bytes: 0,
          rx_sec: 0,
          tx_sec: 0
        }
      },
      qemu: {
        runningVMs: 0,
        totalVMs: 0,
        cpuAllocation: 0,
        memoryAllocation: 0
      }
    };
    
    this.lastNetworkStats = null;
    this.lastNetworkTime = Date.now();
  }

  async updateData() {
    try {
      // 更新 CPU 使用率
      const cpuLoad = await si.currentLoad();
      this.data.cpu.usage = cpuLoad.currentLoad.toFixed(2);
      
      // 更新内存信息
      this.data.memory.free = os.freemem();
      this.data.memory.used = os.totalmem() - os.freemem();
      this.data.memory.usagePercentage = ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2);
      
      // 更新系统信息
      this.data.system.uptime = os.uptime();
      
      // 更新磁盘信息
      const fsSize = await si.fsSize();
      if (fsSize.length > 0) {
        const rootFs = fsSize.find(fs => fs.mount === '/') || fsSize[0];
        this.data.disk.total = rootFs.size;
        this.data.disk.free = rootFs.available;
        this.data.disk.used = rootFs.used;
        this.data.disk.usagePercentage = rootFs.use.toFixed(2);
      }
      
      // 更新网络信息
      const networkInterfaces = await si.networkInterfaces();
      this.data.network.interfaces = networkInterfaces.map(iface => ({
        name: iface.iface,
        ip: iface.ip4,
        mac: iface.mac,
        type: iface.type
      }));
      
      const networkStats = await si.networkStats();
      const currentTime = Date.now();
      
      if (this.lastNetworkStats) {
        const timeDiff = (currentTime - this.lastNetworkTime) / 1000; // 转换为秒
        const totalRx = networkStats.reduce((sum, iface) => sum + iface.rx_bytes, 0);
        const totalTx = networkStats.reduce((sum, iface) => sum + iface.tx_bytes, 0);
        const lastTotalRx = this.lastNetworkStats.reduce((sum, iface) => sum + iface.rx_bytes, 0);
        const lastTotalTx = this.lastNetworkStats.reduce((sum, iface) => sum + iface.tx_bytes, 0);
        
        this.data.network.stats.rx_bytes = totalRx;
        this.data.network.stats.tx_bytes = totalTx;
        this.data.network.stats.rx_sec = ((totalRx - lastTotalRx) / timeDiff).toFixed(2);
        this.data.network.stats.tx_sec = ((totalTx - lastTotalTx) / timeDiff).toFixed(2);
      }
      
      this.lastNetworkStats = networkStats;
      this.lastNetworkTime = currentTime;
      
      return this.data;
    } catch (error) {
      console.error('Error updating system data:', error);
      return this.data;
    }
  }
  
  // 更新 QEMU 相关信息
  async updateQemuData(qemuManager) {
    if (!qemuManager) return;
    
    try {
      const vms = await qemuManager.listAllVMs() || [];
      const runningVMs = vms.filter(vm => vm.status === 'running');
      
      this.data.qemu.runningVMs = runningVMs.length;
      this.data.qemu.totalVMs = vms.length;
      
      // 计算已分配的 CPU 和内存
      let cpuAllocation = 0;
      let memoryAllocation = 0;
      
      runningVMs.forEach(vm => {
        cpuAllocation += vm.config?.cpuCores || 1;
        memoryAllocation += vm.config?.memory || 0;
      });
      
      this.data.qemu.cpuAllocation = cpuAllocation;
      this.data.qemu.memoryAllocation = memoryAllocation;
    } catch (error) {
      console.error('Error updating QEMU data:', error);
    }
  }
}

const systemMonitor = new SystemMonitor();
module.exports = systemMonitor;
