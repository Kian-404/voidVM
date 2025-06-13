# 系统 API

系统 API 提供系统信息查询、用户管理、配置管理等功能。

## 端点概览

<ApiTable :apis="systemApis" />

## 系统信息

### GET /api/v1/system/info

获取系统基本信息。

**响应示例**

```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "buildTime": "2024-01-01T12:00:00Z",
    "uptime": 86400,
    "system": {
      "os": "Linux",
      "arch": "x86_64",
      "kernel": "5.15.0-generic",
      "hostname": "voidvm-server"
    },
    "resources": {
      "cpu": {
        "cores": 8,
        "model": "Intel(R) Core(TM) i7-8700K",
        "usage": 25.6
      },
      "memory": {
        "total": 16777216,
        "used": 4194304,
        "free": 12582912,
        "usage": 25.0
      },
      "disk": {
        "total": 1073741824,
        "used": 536870912,
        "free": 536870912,
        "usage": 50.0
      }
    },
    "qemu": {
      "version": "7.2.0",
      "kvmSupport": true,
      "supportedArchs": ["x86_64", "aarch64"]
    }
  }
}
```

### GET /api/v1/system/stats

获取系统统计信息。

**查询参数**

| 参数   | 类型   | 必需 | 描述                        |
| ------ | ------ | ---- | --------------------------- |
| period | string | 否   | 统计周期 (1h, 24h, 7d, 30d) |

**响应示例**

```json
{
  "success": true,
  "data": {
    "vms": {
      "total": 15,
      "running": 8,
      "stopped": 5,
      "paused": 2
    },
    "resources": {
      "cpuUsage": [
        { "timestamp": "2024-01-01T12:00:00Z", "value": 25.6 },
        { "timestamp": "2024-01-01T12:05:00Z", "value": 28.3 }
      ],
      "memoryUsage": [
        { "timestamp": "2024-01-01T12:00:00Z", "value": 65.2 },
        { "timestamp": "2024-01-01T12:05:00Z", "value": 67.1 }
      ]
    },
    "events": {
      "total": 150,
      "errors": 3,
      "warnings": 12
    }
  }
}
```

## 用户管理

### GET /api/v1/users

获取用户列表。

**查询参数**

| 参数   | 类型   | 必需 | 描述       |
| ------ | ------ | ---- | ---------- |
| page   | number | 否   | 页码       |
| limit  | number | 否   | 每页数量   |
| role   | string | 否   | 按角色过滤 |
| status | string | 否   | 按状态过滤 |

**响应示例**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-001",
        "username": "admin",
        "email": "admin@voidvm.com",
        "role": "admin",
        "status": "active",
        "lastLogin": "2024-01-01T12:00:00Z",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

### POST /api/v1/users

创建新用户。

**请求体**

```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "securePassword123",
  "role": "user",
  "permissions": ["vm:read", "vm:create"]
}
```

### PUT `/api/v1/users/{id}`

更新用户信息。

### DELETE `/api/v1/users/{id}`

删除用户。

## 权限管理

### GET /api/v1/permissions

获取权限列表。

**响应示例**

```json
{
  "success": true,
  "data": {
    "permissions": [
      {
        "id": "vm:create",
        "name": "创建虚拟机",
        "description": "允许创建新的虚拟机",
        "category": "虚拟机管理"
      },
      {
        "id": "vm:delete",
        "name": "删除虚拟机",
        "description": "允许删除虚拟机",
        "category": "虚拟机管理"
      },
      {
        "id": "system:admin",
        "name": "系统管理",
        "description": "系统管理员权限",
        "category": "系统管理"
      }
    ]
  }
}
```

### GET /api/v1/roles

获取角色列表。

**响应示例**

```json
{
  "success": true,
  "data": {
    "roles": [
      {
        "id": "admin",
        "name": "管理员",
        "description": "系统管理员，拥有所有权限",
        "permissions": ["*"]
      },
      {
        "id": "user",
        "name": "普通用户",
        "description": "普通用户，只能管理自己的虚拟机",
        "permissions": ["vm:read", "vm:create", "vm:start", "vm:stop"]
      }
    ]
  }
}
```

## 配置管理

### GET /api/v1/config

获取系统配置。

**响应示例**

```json
{
  "success": true,
  "data": {
    "system": {
      "maxVmsPerUser": 10,
      "defaultVmMemory": 1024,
      "defaultVmCpu": 1,
      "autoBackup": true,
      "backupRetention": 7
    },
    "network": {
      "defaultBridge": "br0",
      "dhcpRange": "192.168.100.100-192.168.100.200"
    },
    "storage": {
      "defaultPool": "default",
      "maxDiskSize": 100,
      "compressionEnabled": true
    }
  }
}
```

### PUT /api/v1/config

更新系统配置。

**请求体**

```json
{
  "system": {
    "maxVmsPerUser": 15,
    "autoBackup": false
  }
}
```

## 日志管理

### GET /api/v1/logs

获取系统日志。

**查询参数**

| 参数  | 类型   | 必需 | 描述                                |
| ----- | ------ | ---- | ----------------------------------- |
| level | string | 否   | 日志级别 (debug, info, warn, error) |
| from  | string | 否   | 开始时间                            |
| to    | string | 否   | 结束时间                            |
| page  | number | 否   | 页码                                |
| limit | number | 否   | 每页数量                            |

**响应示例**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log-001",
        "timestamp": "2024-01-01T12:00:00Z",
        "level": "info",
        "message": "Virtual machine vm-001 started successfully",
        "source": "vm-manager",
        "userId": "user-001",
        "metadata": {
          "vmId": "vm-001",
          "action": "start"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1250,
      "pages": 25
    }
  }
}
```

<script setup>
const systemApis = [
  { method: 'GET', path: '/api/v1/system/info', description: '获取系统信息', status: 'stable' },
  { method: 'GET', path: '/api/v1/system/stats', description: '获取系统统计', status: 'stable' },
  { method: 'GET', path: '/api/v1/users', description: '获取用户列表', status: 'stable' },
  { method: 'POST', path: '/api/v1/users', description: '创建用户', status: 'stable' },
  { method: 'PUT', path: '/api/v1/users/{id}', description: '更新用户', status: 'stable' },
  { method: 'DELETE', path: '/api/v1/users/{id}', description: '删除用户', status: 'stable' },
  { method: 'GET', path: '/api/v1/permissions', description: '获取权限列表', status: 'stable' },
  { method: 'GET', path: '/api/v1/roles', description: '获取角色列表', status: 'stable' },
  { method: 'GET', path: '/api/v1/config', description: '获取系统配置', status: 'stable' },
  { method: 'PUT', path: '/api/v1/config', description: '更新系统配置', status: 'stable' },
  { method: 'GET', path: '/api/v1/logs', description: '获取系统日志', status: 'stable' }
]
</script>
