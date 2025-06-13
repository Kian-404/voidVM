# 虚拟机 API

虚拟机 API 提供了完整的虚拟机生命周期管理功能。

## 端点概览

<ApiTable :apis="vmApis" />

## 虚拟机列表

### GET /api/v1/vms

获取虚拟机列表，支持分页和过滤。

**请求参数**

| 参数   | 类型   | 必需 | 默认值 | 描述       |
| ------ | ------ | ---- | ------ | ---------- |
| page   | number | 否   | 1      | 页码       |
| limit  | number | 否   | 10     | 每页数量   |
| status | string | 否   | -      | 按状态过滤 |
| search | string | 否   | -      | 搜索关键词 |

**响应示例**

```json
{
  "success": true,
  "data": {
    "vms": [
      {
        "id": "vm-001",
        "name": "Web Server",
        "status": "running",
        "cpu": 2,
        "memory": 2048,
        "disk": 20,
        "os": "ubuntu20.04",
        "ip": "192.168.1.100",
        "createdAt": "2024-01-01T12:00:00Z",
        "updatedAt": "2024-01-01T12:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

## 创建虚拟机

### POST /api/v1/vms

创建新的虚拟机。

**请求体**

```json
{
  "name": "my-vm",
  "template": "ubuntu20.04",
  "cpu": 2,
  "memory": 2048,
  "disk": 20,
  "network": {
    "type": "bridge",
    "bridge": "br0"
  },
  "autoStart": false
}
```

**字段说明**

| 字段      | 类型    | 必需 | 描述         |
| --------- | ------- | ---- | ------------ |
| name      | string  | 是   | 虚拟机名称   |
| template  | string  | 是   | 模板ID       |
| cpu       | number  | 是   | CPU核数      |
| memory    | number  | 是   | 内存大小(MB) |
| disk      | number  | 是   | 磁盘大小(GB) |
| network   | object  | 否   | 网络配置     |
| autoStart | boolean | 否   | 是否自动启动 |

**响应示例**

```json
{
  "success": true,
  "data": {
    "id": "vm-002",
    "name": "my-vm",
    "status": "creating",
    "progress": 0
  }
}
```

## 虚拟机控制

### POST /api/v1/vms/{id}/start

启动虚拟机。

### POST /api/v1/vms/{id}/stop

停止虚拟机。

**请求体**

```json
{
  "force": false
}
```

### POST /api/v1/vms/{id}/restart

重启虚拟机。

### POST /api/v1/vms/{id}/pause

暂停虚拟机。

### POST /api/v1/vms/{id}/resume

恢复虚拟机。

## 快照管理

### GET /api/v1/vms/{id}/snapshots

获取虚拟机快照列表。

### POST /api/v1/vms/{id}/snapshots

创建快照。

```json
{
  "name": "backup-2024-01-01",
  "description": "系统更新前的备份"
}
```

### POST /api/v1/vms/{id}/snapshots/{snapshotId}/restore

恢复快照。

### DELETE /api/v1/vms/{id}/snapshots/{snapshotId}

删除快照。

<script setup>
const vmApis = [
  { method: 'GET', path: '/api/v1/vms', description: '获取虚拟机列表', status: 'stable' },
  { method: 'POST', path: '/api/v1/vms', description: '创建虚拟机', status: 'stable' },
  { method: 'GET', path: '/api/v1/vms/{id}', description: '获取虚拟机详情', status: 'stable' },
  { method: 'PUT', path: '/api/v1/vms/{id}', description: '更新虚拟机配置', status: 'stable' },
  { method: 'DELETE', path: '/api/v1/vms/{id}', description: '删除虚拟机', status: 'stable' },
  { method: 'POST', path: '/api/v1/vms/{id}/start', description: '启动虚拟机', status: 'stable' },
  { method: 'POST', path: '/api/v1/vms/{id}/stop', description: '停止虚拟机', status: 'stable' },
  { method: 'POST', path: '/api/v1/vms/{id}/restart', description: '重启虚拟机', status: 'stable' },
  { method: 'GET', path: '/api/v1/vms/{id}/status', description: '获取虚拟机状态', status: 'stable' },
  { method: 'GET', path: '/api/v1/vms/{id}/snapshots', description: '获取快照列表', status: 'beta' },
  { method: 'POST', path: '/api/v1/vms/{id}/snapshots', description: '创建快照', status: 'beta' }
]
</script>

## 虚拟机监控

### GET /api/v1/vms/{id}/metrics

获取虚拟机性能指标。

**查询参数**

| 参数     | 类型   | 必需 | 描述                  |
| -------- | ------ | ---- | --------------------- |
| from     | string | 否   | 开始时间 (ISO 8601)   |
| to       | string | 否   | 结束时间 (ISO 8601)   |
| interval | string | 否   | 数据间隔 (1m, 5m, 1h) |

**响应示例**

```json
{
  "success": true,
  "data": {
    "cpu": {
      "usage": 45.2,
      "history": [
        { "timestamp": "2024-01-01T12:00:00Z", "value": 42.1 },
        { "timestamp": "2024-01-01T12:01:00Z", "value": 45.2 }
      ]
    },
    "memory": {
      "used": 1536,
      "total": 2048,
      "usage": 75.0
    },
    "disk": {
      "read": 1024000,
      "write": 512000,
      "usage": 60.5
    },
    "network": {
      "rx": 1048576,
      "tx": 524288
    }
  }
}
```

## 虚拟机控制台

### GET /api/v1/vms/{id}/console

获取控制台连接信息。

**响应示例**

```json
{
  "success": true,
  "data": {
    "type": "vnc",
    "host": "localhost",
    "port": 5900,
    "password": "console123",
    "url": "ws://localhost:3000/console/vm-001"
  }
}
```

## 错误码

| 错误码                 | HTTP状态码 | 描述           |
| ---------------------- | ---------- | -------------- |
| VM_NOT_FOUND           | 404        | 虚拟机不存在   |
| VM_ALREADY_RUNNING     | 400        | 虚拟机已在运行 |
| VM_ALREADY_STOPPED     | 400        | 虚拟机已停止   |
| INSUFFICIENT_RESOURCES | 400        | 资源不足       |
| SNAPSHOT_NOT_FOUND     | 404        | 快照不存在     |
| OPERATION_IN_PROGRESS  | 409        | 操作正在进行中 |

## 使用示例

### JavaScript

```javascript
class VmManager {
  constructor(apiBase, token) {
    this.apiBase = apiBase
    this.token = token
  }

  async getVms(filters = {}) {
    const params = new URLSearchParams(filters)
    const response = await fetch(`${this.apiBase}/vms?${params}`, {
      headers: { Authorization: `Bearer ${this.token}` },
    })
    return response.json()
  }

  async createVm(config) {
    const response = await fetch(`${this.apiBase}/vms`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    })
    return response.json()
  }

  async startVm(vmId) {
    const response = await fetch(`${this.apiBase}/vms/${vmId}/start`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}` },
    })
    return response.json()
  }
}

// 使用示例
const vmManager = new VmManager('http://localhost:3000/api/v1', 'your-token')

// 创建虚拟机
const newVm = await vmManager.createVm({
  name: 'web-server',
  template: 'ubuntu20.04',
  cpu: 2,
  memory: 2048,
  disk: 20,
})

// 启动虚拟机
await vmManager.startVm(newVm.data.id)
```

### Python

```python
import asyncio
import aiohttp

class VmManager:
    def __init__(self, api_base, token):
        self.api_base = api_base
        self.token = token
        self.headers = {'Authorization': f'Bearer {token}'}

    async def get_vms(self, filters=None):
        async with aiohttp.ClientSession() as session:
            params = filters or {}
            async with session.get(
                f'{self.api_base}/vms',
                headers=self.headers,
                params=params
            ) as response:
                return await response.json()

    async def create_vm(self, config):
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f'{self.api_base}/vms',
                headers={**self.headers, 'Content-Type': 'application/json'},
                json=config
            ) as response:
                return await response.json()

    async def start_vm(self, vm_id):
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f'{self.api_base}/vms/{vm_id}/start',
                headers=self.headers
            ) as response:
                return await response.json()

# 使用示例
async def main():
    vm_manager = VmManager('http://localhost:3000/api/v1', 'your-token')

    # 创建虚拟机
    new_vm = await vm_manager.create_vm({
        'name': 'web-server',
        'template': 'ubuntu20.04',
        'cpu': 2,
        'memory': 2048,
        'disk': 20
    })

    # 启动虚拟机
    await vm_manager.start_vm(new_vm['data']['id'])

asyncio.run(main())
```
