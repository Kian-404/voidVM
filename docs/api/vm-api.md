# 虚拟机 API 文档

虚拟机 API 提供了完整的 QEMU 虚拟机生命周期管理功能，包括创建、启动、停止、重启、删除虚拟机以及 VNC 远程访问等功能。

## 端点概览

<ApiTable :apis="vmApis" />

## 虚拟机管理

### GET /api/vms

获取所有虚拟机列表。

**响应示例**

```json
{
  "success": true,
  "vms": [
    {
      "name": "test-vm",
      "status": "running",
      "pid": 12345,
      "memory": 2048,
      "cpuCores": 2,
      "diskSize": 20,
      "vncPort": 5900,
      "startTime": "2023-07-15T10:30:00.000Z"
    }
  ]
}
```

### POST /api/vms

创建新虚拟机。

**请求体**

```json
{
  "name": "my-vm",
  "memory": 2048,
  "cpuCores": 2,
  "diskSize": 20,
  "networkType": "user",
  "vncPort": 5900,
  "bootOrder": "cd,hd",
  "isoPath": "/path/to/image.iso"
}
```

**响应示例**

```json
{
  "success": true,
  "message": "虚拟机创建成功",
  "vm": {
    "name": "my-vm",
    "status": "stopped",
    "memory": 2048,
    "cpuCores": 2
  }
}
```

## 虚拟机控制操作

### POST /api/vms/{name}/start

启动指定虚拟机。

**路径参数**

| 参数 | 类型   | 必需 | 描述       |
| ---- | ------ | ---- | ---------- |
| name | string | 是   | 虚拟机名称 |

**响应示例**

```json
{
  "success": true,
  "message": "虚拟机启动成功",
  "vm": {
    "name": "test-vm",
    "status": "running",
    "pid": 12345
  }
}
```

**错误响应**

- `404` - 虚拟机不存在
- `400` - 虚拟机已在运行或启动失败

### POST /api/vms/{name}/stop

停止指定虚拟机。

**路径参数**

| 参数 | 类型   | 必需 | 描述       |
| ---- | ------ | ---- | ---------- |
| name | string | 是   | 虚拟机名称 |

**响应示例**

```json
{
  "success": true,
  "message": "虚拟机停止成功"
}
```

**错误响应**

- `404` - 虚拟机不存在
- `400` - 虚拟机未运行或停止失败

### POST /api/vms/{name}/restart

重启指定虚拟机。

**路径参数**

| 参数 | 类型   | 必需 | 描述       |
| ---- | ------ | ---- | ---------- |
| name | string | 是   | 虚拟机名称 |

**请求体**

```json
{
  "metadata": {
    "lastPid": 12345
  }
}
```

**响应示例**

```json
{
  "success": true,
  "message": "虚拟机 test-vm 已成功重启",
  "vm": {
    "name": "test-vm",
    "status": "running",
    "pid": 12346,
    "startTime": "2023-07-15T10:30:00.000Z"
  }
}
```

### DELETE /api/vms/{name}

删除指定虚拟机。

**路径参数**

| 参数 | 类型   | 必需 | 描述       |
| ---- | ------ | ---- | ---------- |
| name | string | 是   | 虚拟机名称 |

**请求体**

```json
{
  "metadata": {
    "lastPid": 12345
  }
}
```

**响应示例**

```json
{
  "success": true,
  "message": "虚拟机已成功删除"
}
```

## 虚拟机配置管理

### PUT /vms/{name}/config

更新虚拟机配置参数。

**路径参数**

| 参数 | 类型   | 必需 | 描述       |
| ---- | ------ | ---- | ---------- |
| name | string | 是   | 虚拟机名称 |

**请求体**

```json
{
  "memory": 2048,
  "cpuCores": 2,
  "diskSize": 20,
  "networkType": "user",
  "vncPort": 5900,
  "bootOrder": "cd,hd",
  "isoPath": "/path/to/image.iso"
}
```

**字段说明**

| 字段        | 类型    | 描述                       |
| ----------- | ------- | -------------------------- |
| memory      | integer | 内存大小 (MB)              |
| cpuCores    | integer | CPU 核心数                 |
| diskSize    | integer | 磁盘大小 (GB)              |
| networkType | string  | 网络类型 (user/bridge/nat) |
| vncPort     | integer | VNC 端口                   |
| bootOrder   | string  | 启动顺序                   |
| isoPath     | string  | ISO 镜像路径               |

**响应示例**

```json
{
  "success": true,
  "message": "虚拟机 test-vm 配置已更新",
  "requiresRestart": true,
  "config": {
    "memory": 2048,
    "cpuCores": 2,
    "diskSize": 20,
    "networkType": "user",
    "vncPort": 5900,
    "bootOrder": "cd,hd",
    "isoPath": "/path/to/image.iso"
  }
}
```

## ISO 镜像管理

### POST /api/vms/{name}/toggleMountIso

切换虚拟机 ISO 镜像的挂载状态。

**路径参数**

| 参数 | 类型   | 必需 | 描述       |
| ---- | ------ | ---- | ---------- |
| name | string | 是   | 虚拟机名称 |

**请求体**

```json
{
  "mountStatus": true
}
```

**字段说明**

| 字段        | 类型    | 必需 | 描述                                    |
| ----------- | ------- | ---- | --------------------------------------- |
| mountStatus | boolean | 是   | 挂载状态，true 表示挂载，false 表示卸载 |

**响应示例**

```json
{
  "success": true,
  "message": "ISO successfully mounted to VM 'test-vm'",
  "vm": {
    "name": "test-vm",
    "isMountIso": true
  }
}
```

## VNC 远程访问

### POST /api/novnc

启动 NoVNC 服务（通用接口）。

### POST /api/novnc/{name}

为指定虚拟机启动 NoVNC 服务。

**路径参数**

| 参数 | 类型   | 必需 | 描述       |
| ---- | ------ | ---- | ---------- |
| name | string | 是   | 虚拟机名称 |

**请求体**

```json
{
  "vncPort": 5900,
  "webPort": 6080
}
```

**字段说明**

| 字段    | 类型    | 必需 | 描述                           |
| ------- | ------- | ---- | ------------------------------ |
| vncPort | integer | 是   | QEMU VNC 服务的端口号          |
| webPort | integer | 否   | NoVNC Web 服务的端口号（可选） |

**响应示例**

```json
{
  "success": true,
  "url": "http://localhost:6080/vnc.html?host=localhost&port=6080&path=websockify/?token=vm1",
  "vncPort": 5900,
  "webPort": 6080,
  "token": "vm1",
  "pid": 12345
}
```

<script setup>
const vmApis = [
  { method: 'GET', path: '/api/vms', description: '获取所有虚拟机', status: 'stable' },
  { method: 'POST', path: '/api/vms', description: '创建虚拟机', status: 'stable' },
  { method: 'POST', path: '/api/vms/{name}/start', description: '启动虚拟机', status: 'stable' },
  { method: 'POST', path: '/api/vms/{name}/stop', description: '停止虚拟机', status: 'stable' },
  { method: 'POST', path: '/api/vms/{name}/restart', description: '重启虚拟机', status: 'stable' },
  { method: 'DELETE', path: '/api/vms/{name}', description: '删除虚拟机', status: 'stable' },
  { method: 'PUT', path: '/vms/{name}/config', description: '更新虚拟机配置', status: 'stable' },
  { method: 'POST', path: '/api/vms/{name}/toggleMountIso', description: '切换ISO挂载状态', status: 'stable' },
  { method: 'POST', path: '/api/novnc', description: '启动NoVNC服务', status: 'stable' },
  { method: 'POST', path: '/api/novnc/{name}', description: '为虚拟机启动NoVNC', status: 'stable' }
]
</script>

## 错误码

| 错误码                 | HTTP状态码 | 描述           |
| ---------------------- | ---------- | -------------- |
| VM_NOT_FOUND           | 404        | 虚拟机不存在   |
| VM_ALREADY_RUNNING     | 400        | 虚拟机已在运行 |
| VM_ALREADY_STOPPED     | 400        | 虚拟机已停止   |
| VM_NOT_RUNNING         | 400        | 虚拟机未运行   |
| INVALID_REQUEST_PARAMS | 400        | 无效的请求参数 |
| NOVNC_START_FAILED     | 400        | NoVNC 启动失败 |
| INTERNAL_SERVER_ERROR  | 500        | 服务器内部错误 |

## 使用示例

### JavaScript

```javascript
class VmManager {
  constructor(apiBase) {
    this.apiBase = apiBase
  }

  async getAllVms() {
    const response = await fetch(`${this.apiBase}/vms`)
    return response.json()
  }

  async createVm(config) {
    const response = await fetch(`${this.apiBase}/vms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    return response.json()
  }

  async startVm(vmName) {
    const response = await fetch(`${this.apiBase}/vms/${vmName}/start`, {
      method: 'POST',
    })
    return response.json()
  }

  async stopVm(vmName) {
    const response = await fetch(`${this.apiBase}/vms/${vmName}/stop`, {
      method: 'POST',
    })
    return response.json()
  }

  async startNoVNC(vmName, vncPort, webPort = 6080) {
    const response = await fetch(`${this.apiBase}/novnc/${vmName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vncPort, webPort }),
    })
    return response.json()
  }
}

// 使用示例
const vmManager = new VmManager('http://localhost:3000/api')

// 创建虚拟机
const newVm = await vmManager.createVm({
  name: 'web-server',
  memory: 2048,
  cpuCores: 2,
  diskSize: 20,
  vncPort: 5900,
})

// 启动虚拟机
await vmManager.startVm('web-server')

// 启动 NoVNC 服务
const vncInfo = await vmManager.startNoVNC('web-server', 5900)
console.log('VNC URL:', vncInfo.url)
```
