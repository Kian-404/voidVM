# API 文档

VoidVM 提供了完整的 RESTful API 和 WebSocket API，让你可以通过编程方式管理虚拟机。

## API 概览

### 基础信息

- **Base URL**: `http://localhost:3000/api/v1`
- **认证方式**: JWT Token
- **数据格式**: JSON
- **字符编码**: UTF-8

### 认证

所有 API 请求都需要在 Header 中包含认证 Token：

```http
Authorization: Bearer <your-jwt-token>
```

获取 Token：

```javascript
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123',
  }),
})

const { token } = await response.json()
```

## API 分类

### 🖥️ 虚拟机管理

- [虚拟机 API](/api/vm-api) - 创建、管理、监控虚拟机

### 🏢 系统管理

- [系统 API](/api/system-api) - 系统信息、用户管理、配置

### 🔌 实时通信

- [WebSocket API](/api/websocket-api) - 实时状态更新、控制台连接

## 响应格式

### 成功响应

```json
{
  "success": true,
  "data": {
    // 实际数据
  },
  "message": "操作成功",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "VM_NOT_FOUND",
    "message": "虚拟机不存在",
    "details": "Virtual machine with ID 'vm-001' was not found"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 状态码

| 状态码 | 含义                  | 说明             |
| ------ | --------------------- | ---------------- |
| 200    | OK                    | 请求成功         |
| 201    | Created               | 资源创建成功     |
| 400    | Bad Request           | 请求参数错误     |
| 401    | Unauthorized          | 未认证或认证失败 |
| 403    | Forbidden             | 权限不足         |
| 404    | Not Found             | 资源不存在       |
| 500    | Internal Server Error | 服务器内部错误   |

## 快速开始

### 1. 获取认证 Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 2. 获取虚拟机列表

```bash
curl -X GET http://localhost:3000/api/v1/vms \
  -H "Authorization: Bearer <your-token>"
```

### 3. 创建虚拟机

```bash
curl -X POST http://localhost:3000/api/v1/vms \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-vm",
    "cpu": 2,
    "memory": 2048,
    "disk": 20,
    "os": "ubuntu20.04"
  }'
```

## SDK 和示例

### JavaScript/TypeScript SDK

```typescript
import { VoidVMClient } from '@void-vm/sdk'

const client = new VoidVMClient({
  baseURL: 'http://localhost:3000/api/v1',
  token: 'your-jwt-token',
})

// 获取虚拟机列表
const vms = await client.vms.list()

// 创建虚拟机
const newVm = await client.vms.create({
  name: 'my-vm',
  cpu: 2,
  memory: 2048,
  disk: 20,
})

// 启动虚拟机
await client.vms.start(newVm.id)
```

### Python SDK

```python
from voidvm import VoidVMClient

client = VoidVMClient(
    base_url='http://localhost:3000/api/v1',
    token='your-jwt-token'
)

# 获取虚拟机列表
vms = client.vms.list()

# 创建虚拟机
new_vm = client.vms.create({
    'name': 'my-vm',
    'cpu': 2,
    'memory': 2048,
    'disk': 20
})

# 启动虚拟机
client.vms.start(new_vm['id'])
```

## 限流和配额

为了保护服务器资源，API 实施了以下限制：

- **请求频率**: 每分钟最多 100 次请求
- **并发连接**: 每个用户最多 10 个并发 WebSocket 连接
- **虚拟机数量**: 免费用户最多创建 5 个虚拟机

## 版本控制

API 使用语义版本控制，当前版本为 `v1`。

### 版本升级策略

- **主版本**: 不兼容的重大更改
- **次版本**: 向后兼容的功能添加
- **修订版本**: 向后兼容的错误修复

## 更多资源

- [虚拟机 API 详细文档](/api/vm-api)
- [系统 API 详细文档](/api/system-api)
- [WebSocket API 详细文档](/api/websocket-api)
- [SDK 下载和使用说明](https://github.com/Kian-404/voidVM-sdk)
