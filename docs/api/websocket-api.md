# WebSocket API

WebSocket API 提供实时通信功能，包括虚拟机状态更新、控制台连接、实时监控等。

## 连接地址

```
ws://localhost:3000/ws
```

## 认证

WebSocket 连接需要在查询参数中提供认证 token：

```
ws://localhost:3000/ws?token=your-jwt-token
```

或在连接建立后发送认证消息：

```json
{
  "type": "auth",
  "data": {
    "token": "your-jwt-token"
  }
}
```

## 消息格式

### 发送消息格式

```json
{
  "type": "message_type",
  "data": {
    // 消息数据
  },
  "id": "unique-message-id"
}
```

### 接收消息格式

```json
{
  "type": "message_type",
  "data": {
    // 响应数据
  },
  "id": "original-message-id",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 虚拟机状态订阅

### 订阅虚拟机状态

**发送**

```json
{
  "type": "subscribe",
  "data": {
    "topic": "vm-status",
    "vmId": "vm-001"
  }
}
```

**接收状态更新**

```json
{
  "type": "vm-status",
  "data": {
    "vmId": "vm-001",
    "status": "running",
    "cpu": 45.2,
    "memory": 75.0,
    "network": {
      "rx": 1024,
      "tx": 512
    }
  }
}
```

### 订阅所有虚拟机状态

**发送**

```json
{
  "type": "subscribe",
  "data": {
    "topic": "vm-status-all"
  }
}
```

## 虚拟机控制

### 启动虚拟机

**发送**

```json
{
  "type": "vm-control",
  "data": {
    "vmId": "vm-001",
    "action": "start"
  },
  "id": "req-001"
}
```

**响应**

```json
{
  "type": "vm-control-response",
  "data": {
    "vmId": "vm-001",
    "action": "start",
    "status": "success"
  },
  "id": "req-001"
}
```

### 支持的控制操作

- `start` - 启动虚拟机
- `stop` - 停止虚拟机
- `restart` - 重启虚拟机
- `pause` - 暂停虚拟机
- `resume` - 恢复虚拟机
- `reset` - 重置虚拟机

## VNC 控制台

### 连接 VNC 控制台

**发送**

```json
{
  "type": "vnc-connect",
  "data": {
    "vmId": "vm-001"
  }
}
```

**VNC 数据传输**

```json
{
  "type": "vnc-data",
  "data": {
    "vmId": "vm-001",
    "data": "base64-encoded-vnc-data"
  }
}
```

### VNC 输入事件

**鼠标事件**

```json
{
  "type": "vnc-input",
  "data": {
    "vmId": "vm-001",
    "inputType": "mouse",
    "x": 100,
    "y": 200,
    "buttons": 1
  }
}
```

**键盘事件**

```json
{
  "type": "vnc-input",
  "data": {
    "vmId": "vm-001",
    "inputType": "keyboard",
    "key": "Enter",
    "down": true
  }
}
```

## Web 终端

### 连接终端

**发送**

```json
{
  "type": "terminal-connect",
  "data": {
    "vmId": "vm-001",
    "type": "ssh",
    "credentials": {
      "username": "root",
      "password": "password"
    }
  }
}
```

### 终端数据

**发送命令**

```json
{
  "type": "terminal-input",
  "data": {
    "vmId": "vm-001",
    "input": "ls -la\n"
  }
}
```

**接收输出**

```json
{
  "type": "terminal-output",
  "data": {
    "vmId": "vm-001",
    "output": "total 16\ndrwxr-xr-x 4 root root 4096 Jan  1 12:00 .\n"
  }
}
```

### 调整终端大小

```json
{
  "type": "terminal-resize",
  "data": {
    "vmId": "vm-001",
    "cols": 80,
    "rows": 24
  }
}
```

## 系统监控

### 订阅系统资源监控

**发送**

```json
{
  "type": "subscribe",
  "data": {
    "topic": "system-monitor",
    "interval": 5000
  }
}
```

**接收监控数据**

```json
{
  "type": "system-monitor",
  "data": {
    "cpu": {
      "usage": 25.6,
      "cores": [15.2, 30.1, 20.5, 35.8]
    },
    "memory": {
      "total": 16777216,
      "used": 4194304,
      "usage": 25.0
    },
    "disk": {
      "read": 1024000,
      "write": 512000
    },
    "network": {
      "rx": 1048576,
      "tx": 524288
    }
  }
}
```

## 事件通知

### 系统事件

```json
{
  "type": "system-event",
  "data": {
    "event": "vm-created",
    "vmId": "vm-001",
    "userId": "user-001",
    "message": "虚拟机创建成功",
    "level": "info"
  }
}
```

### 错误通知

```json
{
  "type": "error",
  "data": {
    "code": "VM_START_FAILED",
    "message": "虚拟机启动失败",
    "vmId": "vm-001",
    "details": "Insufficient memory available"
  }
}
```

## 完整示例

### JavaScript 客户端

```javascript
class VoidVMWebSocket {
  constructor(url, token) {
    this.url = url
    this.token = token
    this.ws = null
    this.messageId = 0
    this.callbacks = new Map()
    this.eventHandlers = new Map()
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${this.url}?token=${this.token}`)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        resolve()
      }

      this.ws.onmessage = event => {
        const message = JSON.parse(event.data)
        this.handleMessage(message)
      }

      this.ws.onerror = error => {
        console.error('WebSocket error:', error)
        reject(error)
      }

      this.ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.reconnect()
      }
    })
  }

  send(type, data) {
    return new Promise((resolve, reject) => {
      const id = `msg-${++this.messageId}`
      const message = { type, data, id }

      this.callbacks.set(id, { resolve, reject })
      this.ws.send(JSON.stringify(message))

      // 超时处理
      setTimeout(() => {
        if (this.callbacks.has(id)) {
          this.callbacks.delete(id)
          reject(new Error('Request timeout'))
        }
      }, 30000)
    })
  }

  subscribe(topic, handler) {
    this.eventHandlers.set(topic, handler)
    return this.send('subscribe', { topic })
  }

  handleMessage(message) {
    const { type, data, id } = message

    // 处理响应
    if (id && this.callbacks.has(id)) {
      const { resolve } = this.callbacks.get(id)
      this.callbacks.delete(id)
      resolve(data)
      return
    }

    // 处理事件
    if (this.eventHandlers.has(type)) {
      this.eventHandlers.get(type)(data)
    }
  }

  // 虚拟机控制方法
  async startVm(vmId) {
    return this.send('vm-control', { vmId, action: 'start' })
  }

  async stopVm(vmId) {
    return this.send('vm-control', { vmId, action: 'stop' })
  }

  // 订阅虚拟机状态
  subscribeVmStatus(vmId, handler) {
    return this.subscribe('vm-status', handler)
  }

  // VNC 连接
  async connectVnc(vmId) {
    return this.send('vnc-connect', { vmId })
  }

  sendVncInput(vmId, inputType, inputData) {
    this.send('vnc-input', { vmId, inputType, ...inputData })
  }

  // 终端连接
  async connectTerminal(vmId, credentials) {
    return this.send('terminal-connect', { vmId, type: 'ssh', credentials })
  }

  sendTerminalInput(vmId, input) {
    this.send('terminal-input', { vmId, input })
  }

  reconnect() {
    setTimeout(() => {
      console.log('Attempting to reconnect...')
      this.connect()
    }, 5000)
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
    }
  }
}

// 使用示例
const wsClient = new VoidVMWebSocket('ws://localhost:3000/ws', 'your-token')

await wsClient.connect()

// 订阅虚拟机状态
wsClient.subscribeVmStatus('vm-001', data => {
  console.log('VM Status:', data)
})

// 启动虚拟机
await wsClient.startVm('vm-001')

// 连接 VNC
await wsClient.connectVnc('vm-001')

// 发送鼠标点击
wsClient.sendVncInput('vm-001', 'mouse', { x: 100, y: 200, buttons: 1 })
```
