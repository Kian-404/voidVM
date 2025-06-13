import { ref } from "vue";

export interface SystemData {
  cpu: {
    usage: number;
    cores: number;
    model: string;
    speed: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    usagePercentage: number;
  };
  disk: {
    total: number;
    free: number;
    used: number;
    usagePercentage: number;
  };
  network: {
    interfaces: Array<{
      name: string;
      ip: string;
      mac: string;
      type: string;
    }>;
    stats: {
      rx_bytes: number;
      tx_bytes: number;
      rx_sec: number;
      tx_sec: number;
    };
  };
  system: {
    platform: string;
    arch: string;
    hostname: string;
    uptime: number;
  };
  qemu: {
    runningVMs: number;
    totalVMs: number;
    cpuAllocation: number;
    memoryAllocation: number;
  };
}

// const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
export class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectInterval: number = 5000; // 重连间隔 5 秒
  private reconnectTimer: number | null = null;
  private url: string;

  // 响应式数据
  public systemData = ref<SystemData | null>(null);
  public connected = ref(false);
  public error = ref<string | null>(null);
    constructor(url: string = `ws://${window.location.host}/api/system-monitor`) {
    this.url = url;
  }

  public connect(): void {
    if (this.socket) {
      this.disconnect();
    }

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = this.onOpen.bind(this);
      this.socket.onmessage = this.onMessage.bind(this);
      this.socket.onerror = this.onError.bind(this);
      this.socket.onclose = this.onClose.bind(this);
    } catch (err) {
      this.error.value = `WebSocket connection error: ${err}`;
      this.scheduleReconnect();
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.connected.value = false;
  }

  public subscribe(topic: string): void {
    if (this.socket && this.connected.value) {
      this.socket.send(
        JSON.stringify({
          type: "subscribe",
          topic,
        })
      );
    }
  }

  private onOpen(): void {
    this.connected.value = true;
    this.error.value = null;
    console.log("WebSocket connected");

    // 订阅系统数据
    this.subscribe("systemData");
  }

  private onMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);

      if (message.type === "systemData") {
        this.systemData.value = message.data;
      }
    } catch (err) {
      console.error("Error parsing WebSocket message:", err);
    }
  }

  private onError(event: Event): void {
    this.error.value = "WebSocket error occurred";
    console.error("WebSocket error:", event);
  }

  private onClose(event: CloseEvent): void {
    this.connected.value = false;
    console.log(`WebSocket closed: ${event.code} ${event.reason}`);

    // 如果不是正常关闭，尝试重连
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer === null) {
      console.log(`Scheduling reconnect in ${this.reconnectInterval}ms`);
      this.reconnectTimer = window.setTimeout(() => {
        this.reconnectTimer = null;
        this.connect();
      }, this.reconnectInterval);
    }
  }

  // 格式化工具方法
  public static formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  public static formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) {
      return `${days}天 ${hours}小时 ${minutes}分钟`;
    } else if (hours > 0) {
      return `${hours}小时 ${minutes}分钟 ${secs}秒`;
    } else if (minutes > 0) {
      return `${minutes}分钟 ${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  }
}

// 创建单例实例
export const websocketService = new WebSocketService();
export default websocketService;
