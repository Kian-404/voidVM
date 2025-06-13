# 开发文档

欢迎参与 VoidVM 的开发！这里包含了开发环境搭建、代码规范、架构设计等信息。

## 技术栈

### 前端技术栈

- **框架**: Vue + TypeScript
- **构建工具**: Vite
- **UI 组件库**: BootStrap
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: SCSS + CSS Variables

### 后端技术栈

- **运行环境**: Node.js 18+
- **框架**: Express.js
- **语言**: TypeScript
- **虚拟化**: QEMU/KVM
- **数据库**: SQLite / PostgreSQL
- **WebSocket**: ws

### 开发工具

- **包管理**: pnpm
- **代码规范**: ESLint + Prettier
- **提交规范**: Conventional Commits
- **测试框架**: Vitest + Playwright
- **文档**: VitePress

## 开发环境搭建

### 系统要求

::: tip 开发环境要求

- **操作系统**: Linux (推荐 Ubuntu 20.04+)
- **Node.js**: 18.0.0+
- **pnpm**: 8.0.0+
- **Git**: 2.30.0+
- **QEMU/KVM**: 7.0.0+
  :::

### 1. 克隆项目

```bash
git clone https://github.com/Kian-404/voidVM.git
cd void-vm
```

### 2. 安装依赖

```bash
# 安装所有依赖
pnpm install

# 验证安装
pnpm --version
node --version
```

### 3. 环境配置

```bash
# 复制环境配置文件
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env

# 编辑配置文件
nano apps/server/.env
```

**服务端环境变量配置**

```bash
# apps/server/.env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-jwt-secret-key
DB_TYPE=sqlite
DB_PATH=./data/voidvm.db

# QEMU 配置
QEMU_BINARY_PATH=/usr/bin/qemu-system-x86_64
VM_STORAGE_PATH=./data/vms
ISO_STORAGE_PATH=./data/isos

# 网络配置
DEFAULT_BRIDGE=virbr0
VNC_BASE_PORT=5900

# 日志配置
LOG_LEVEL=debug
LOG_FILE=./logs/voidvm.log
```

**前端环境变量配置**

```bash
# apps/web/.env.development
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_WS_URL=ws://localhost:3000/ws
VITE_APP_TITLE=VoidVM Development

VITE_BASE_URL="http://localhost:3000"
VITE_BASE_VNC_PATH ="/"
VITE_SUPABASE_URL="https://your-supabase-url.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 4. 启动开发服务器

```bash
# 启动所有服务
pnpm dev

# 或分别启动
pnpm dev:server  # 后端服务 - http://localhost:3000
pnpm dev:web     # 前端服务 - http://localhost:5173
pnpm dev:docs    # 文档服务 - http://localhost:5174
```

## 项目结构详解

```
void-vm/
├── apps/                        # 应用程序
│   ├── web/                     # Vue 前端应用
│   │   ├── src/
│   │   │   ├── components/      # 组件
│   │   │   │   ├── common/      # 通用组件
│   │   │   │   ├── vm/          # 虚拟机相关组件
│   │   │   │   └── layout/      # 布局组件
│   │   │   ├── views/           # 页面组件
│   │   │   ├── stores/          # Pinia 状态管理
│   │   │   ├── composables/     # 组合式函数
│   │   │   ├── utils/           # 工具函数
│   │   │   └── types/           # 类型定义
│   │   └── vite.config.ts       # Vite 配置
│   │
│   ├── server/                  # Node.js 后端应用
│   │   ├── src/
│   │   │   ├── controllers/     # 控制器层
│   │   │   ├── services/        # 业务逻辑层
│   │   │   ├── models/          # 数据模型层
│   │   │   ├── middlewares/     # 中间件
│   │   │   ├── routes/          # 路由定义
│   │   │   ├── utils/           # 工具函数
│   │   │   └── config/          # 配置文件
│   │   └── tests/               # 测试文件
│   │
│   └── docs/                    # VitePress 文档
│       ├── .vitepress/          # VitePress 配置
│       └── guide/               # 文档内容
│
├── packages/                    # 共享包
│   ├── shared/                  # 共享工具和常量
│   ├── core/                    # 核心业务逻辑
│   └── types/                   # 共享类型定义
│
└── configs/                     # 配置文件
    ├── docker/                  # Docker 配置
    └── nginx/                   # Nginx 配置
```

## 开发规范

### 代码规范

#### TypeScript 规范

```typescript
// 接口定义
interface VirtualMachine {
  id: string
  name: string
  status: VmStatus
  config: VmConfig
  createdAt: Date
  updatedAt: Date
}

// 枚举定义
enum VmStatus {
  STOPPED = 'stopped',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  PAUSED = 'paused',
}

// 类定义
class VmManager {
  private vms: Map<string, VirtualMachine> = new Map()

  async createVm(config: VmCreateConfig): Promise<VirtualMachine> {
    // 实现逻辑
  }

  async startVm(vmId: string): Promise<void> {
    // 实现逻辑
  }
}
```

#### Vue 组件规范

```vue
<template>
  <div class="vm-list">
    <VmCard
      v-for="vm in virtualMachines"
      :key="vm.id"
      :vm="vm"
      @start="handleStartVm"
      @stop="handleStopVm"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useVmStore } from '@/stores/vm'
  import type { VirtualMachine } from '@void-vm/types'

  // Props 定义
  interface Props {
    filter?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    filter: '',
  })

  // Emits 定义
  interface Emits {
    (e: 'vm-selected', vm: VirtualMachine): void
  }

  const emit = defineEmits<Emits>()

  // 状态管理
  const vmStore = useVmStore()

  // 响应式数据
  const virtualMachines = computed(() =>
    vmStore.vms.filter(vm => vm.name.toLowerCase().includes(props.filter.toLowerCase()))
  )

  // 方法
  const handleStartVm = async (vmId: string) => {
    try {
      await vmStore.startVm(vmId)
    } catch (error) {
      console.error('Failed to start VM:', error)
    }
  }

  const handleStopVm = async (vmId: string) => {
    try {
      await vmStore.stopVm(vmId)
    } catch (error) {
      console.error('Failed to stop VM:', error)
    }
  }

  // 生命周期
  onMounted(() => {
    vmStore.fetchVms()
  })
</script>

<style scoped>
  .vm-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    padding: 16px;
  }
</style>
```

### Git 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
# 格式
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### 提交类型

| 类型       | 描述      | 示例                                             |
| ---------- | --------- | ------------------------------------------------ |
| `feat`     | 新功能    | `feat(vm): add virtual machine creation wizard`  |
| `fix`      | 修复 Bug  | `fix(api): resolve memory leak in vm monitoring` |
| `docs`     | 文档更新  | `docs: update installation guide`                |
| `style`    | 代码格式  | `style: fix eslint warnings`                     |
| `refactor` | 重构      | `refactor(server): extract vm service logic`     |
| `perf`     | 性能优化  | `perf(web): optimize vm list rendering`          |
| `test`     | 测试相关  | `test: add unit tests for vm controller`         |
| `chore`    | 构建/工具 | `chore: update dependencies`                     |
| `ci`       | CI/CD     | `ci: add automated testing workflow`             |

#### 提交示例

```bash
# 功能开发
git commit -m "feat(vm): implement vm snapshot functionality

- Add snapshot creation API endpoint
- Add snapshot management UI components
- Support snapshot restoration
- Add snapshot deletion with confirmation

Closes #123"

# Bug 修复
git commit -m "fix(websocket): prevent connection memory leak

The WebSocket connections were not being properly cleaned up
when clients disconnected, causing memory usage to grow over time.

Fixes #456"

# 文档更新
git commit -m "docs(api): add WebSocket API documentation

- Document all WebSocket message types
- Add connection examples
- Include error handling patterns"
```

### 分支管理策略

```bash
main                    # 主分支，生产环境代码
├── develop            # 开发分支，集成最新功能
├── feature/vm-wizard  # 功能分支
├── feature/api-auth   # 功能分支
├── hotfix/security    # 热修复分支
└── release/v1.1.0     # 发布分支
```

#### 分支命名规范

- `feature/功能名称` - 新功能开发
- `fix/bug描述` - Bug 修复
- `hotfix/紧急修复` - 紧急修复
- `release/版本号` - 发布准备
- `docs/文档更新` - 文档更新

## 测试指南

### 单元测试

#### 后端测试示例

```typescript
// apps/server/tests/unit/vm.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VmService } from '@/services/vm.service'
import { QemuManager } from '@/services/qemu.manager'

// Mock 依赖
vi.mock('@/services/qemu.manager')

describe('VmService', () => {
  let vmService: VmService
  let mockQemuManager: jest.Mocked<QemuManager>

  beforeEach(() => {
    mockQemuManager = new QemuManager() as jest.Mocked<QemuManager>
    vmService = new VmService(mockQemuManager)
  })

  describe('createVm', () => {
    it('should create a virtual machine successfully', async () => {
      // Arrange
      const vmConfig = {
        name: 'test-vm',
        cpu: 2,
        memory: 2048,
        disk: 20,
      }

      mockQemuManager.createVm.mockResolvedValue({
        id: 'vm-001',
        ...vmConfig,
        status: 'stopped',
      })

      // Act
      const result = await vmService.createVm(vmConfig)

      // Assert
      expect(result).toEqual({
        id: 'vm-001',
        name: 'test-vm',
        cpu: 2,
        memory: 2048,
        disk: 20,
        status: 'stopped',
      })
      expect(mockQemuManager.createVm).toHaveBeenCalledWith(vmConfig)
    })

    it('should throw error when vm name already exists', async () => {
      // Arrange
      const vmConfig = { name: 'existing-vm', cpu: 1, memory: 1024, disk: 10 }
      mockQemuManager.createVm.mockRejectedValue(new Error('VM name already exists'))

      // Act & Assert
      await expect(vmService.createVm(vmConfig)).rejects.toThrow('VM name already exists')
    })
  })

  describe('startVm', () => {
    it('should start vm successfully', async () => {
      // Arrange
      const vmId = 'vm-001'
      mockQemuManager.startVm.mockResolvedValue(undefined)

      // Act
      await vmService.startVm(vmId)

      // Assert
      expect(mockQemuManager.startVm).toHaveBeenCalledWith(vmId)
    })
  })
})
```

#### 前端测试示例

```typescript
// apps/web/src/components/__tests__/VmCard.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import VmCard from '@/components/vm/VmCard.vue'
import type { VirtualMachine } from '@void-vm/types'

describe('VmCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  const mockVm: VirtualMachine = {
    id: 'vm-001',
    name: 'Test VM',
    status: 'stopped',
    cpu: 2,
    memory: 2048,
    disk: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  it('renders vm information correctly', () => {
    const wrapper = mount(VmCard, {
      props: { vm: mockVm },
    })

    expect(wrapper.text()).toContain('Test VM')
    expect(wrapper.text()).toContain('2 CPU')
    expect(wrapper.text()).toContain('2048 MB')
    expect(wrapper.text()).toContain('20 GB')
  })

  it('shows start button when vm is stopped', () => {
    const wrapper = mount(VmCard, {
      props: { vm: mockVm },
    })

    const startButton = wrapper.find('[data-test="start-button"]')
    expect(startButton.exists()).toBe(true)
    expect(startButton.text()).toBe('启动')
  })

  it('emits start event when start button clicked', async () => {
    const wrapper = mount(VmCard, {
      props: { vm: mockVm },
    })

    await wrapper.find('[data-test="start-button"]').trigger('click')

    expect(wrapper.emitted('start')).toBeTruthy()
    expect(wrapper.emitted('start')?.[0]).toEqual([mockVm.id])
  })

  it('shows stop button when vm is running', () => {
    const runningVm = { ...mockVm, status: 'running' as const }
    const wrapper = mount(VmCard, {
      props: { vm: runningVm },
    })

    const stopButton = wrapper.find('[data-test="stop-button"]')
    expect(stopButton.exists()).toBe(true)
    expect(stopButton.text()).toBe('停止')
  })
})
```

### 集成测试

```typescript
// apps/server/tests/integration/vm.api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '@/app'
import { setupTestDatabase, cleanupTestDatabase } from './helpers/database'

describe('VM API Integration Tests', () => {
  let authToken: string

  beforeAll(async () => {
    await setupTestDatabase()

    // 获取认证 token
    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      username: 'testuser',
      password: 'testpass',
    })

    authToken = loginResponse.body.data.token
  })

  afterAll(async () => {
    await cleanupTestDatabase()
  })

  describe('POST /api/v1/vms', () => {
    it('should create a new virtual machine', async () => {
      const vmConfig = {
        name: 'integration-test-vm',
        cpu: 1,
        memory: 1024,
        disk: 10,
        template: 'ubuntu20.04',
      }

      const response = await request(app)
        .post('/api/v1/vms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(vmConfig)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toMatchObject({
        name: 'integration-test-vm',
        cpu: 1,
        memory: 1024,
        disk: 10,
        status: 'stopped',
      })
      expect(response.body.data.id).toBeDefined()
    })

    it('should return 400 for invalid vm configuration', async () => {
      const invalidConfig = {
        name: '', // 空名称
        cpu: 0, // 无效 CPU 数量
        memory: -1, // 无效内存
      }

      const response = await request(app)
        .post('/api/v1/vms')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidConfig)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /api/v1/vms', () => {
    it('should return list of virtual machines', async () => {
      const response = await request(app)
        .get('/api/v1/vms')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data.vms)).toBe(true)
      expect(response.body.data.pagination).toBeDefined()
    })

    it('should filter vms by status', async () => {
      const response = await request(app)
        .get('/api/v1/vms?status=running')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      response.body.data.vms.forEach((vm: any) => {
        expect(vm.status).toBe('running')
      })
    })
  })
})
```

### E2E 测试

```typescript
// apps/web/tests/e2e/vm-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Virtual Machine Management', () => {
  test.beforeEach(async ({ page }) => {
    // 登录
    await page.goto('http://localhost:5173/login')
    await page.fill('[data-test="username"]', 'admin')
    await page.fill('[data-test="password"]', 'admin123')
    await page.click('[data-test="login-button"]')

    // 等待跳转到仪表板
    await expect(page).toHaveURL('http://localhost:5173/dashboard')
  })

  test('should create a new virtual machine', async ({ page }) => {
    // 导航到虚拟机列表
    await page.click('[data-test="nav-vms"]')
    await expect(page).toHaveURL('http://localhost:5173/vms')

    // 点击创建按钮
    await page.click('[data-test="create-vm-button"]')

    // 填写虚拟机信息
    await page.fill('[data-test="vm-name"]', 'E2E Test VM')
    await page.selectOption('[data-test="vm-template"]', 'ubuntu20.04')
    await page.fill('[data-test="vm-cpu"]', '2')
    await page.fill('[data-test="vm-memory"]', '2048')
    await page.fill('[data-test="vm-disk"]', '20')

    // 提交创建表单
    await page.click('[data-test="create-submit"]')

    // 验证虚拟机创建成功
    await expect(page.locator('[data-test="success-message"]')).toBeVisible()
    await expect(page.locator('text=E2E Test VM')).toBeVisible()
  })

  test('should start and stop virtual machine', async ({ page }) => {
    await page.goto('http://localhost:5173/vms')

    // 找到测试虚拟机
    const vmCard = page.locator('[data-test="vm-card"]').filter({ hasText: 'E2E Test VM' })

    // 启动虚拟机
    await vmCard.locator('[data-test="start-button"]').click()

    // 等待状态更新
    await expect(vmCard.locator('[data-test="vm-status"]')).toHaveText('running')

    // 停止虚拟机
    await vmCard.locator('[data-test="stop-button"]').click()

    // 确认停止对话框
    await page.click('[data-test="confirm-stop"]')

    // 等待状态更新
    await expect(vmCard.locator('[data-test="vm-status"]')).toHaveText('stopped')
  })

  test('should open vm console', async ({ page, context }) => {
    await page.goto('http://localhost:5173/vms')

    const vmCard = page.locator('[data-test="vm-card"]').filter({ hasText: 'E2E Test VM' })

    // 启动虚拟机（如果未启动）
    const status = await vmCard.locator('[data-test="vm-status"]').textContent()
    if (status !== 'running') {
      await vmCard.locator('[data-test="start-button"]').click()
      await expect(vmCard.locator('[data-test="vm-status"]')).toHaveText('running')
    }

    // 点击控制台按钮
    const pagePromise = context.waitForEvent('page')
    await vmCard.locator('[data-test="console-button"]').click()
    const consolePage = await pagePromise

    // 验证控制台页面
    await expect(consolePage).toHaveTitle(/Console - E2E Test VM/)
    await expect(consolePage.locator('[data-test="vnc-canvas"]')).toBeVisible()
  })
})
```

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行单元测试
pnpm test:unit

# 运行集成测试
pnpm test:integration

# 运行 E2E 测试
pnpm test:e2e

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 监听模式运行测试
pnpm test:watch

# 运行特定测试文件
pnpm test vm.service.test.ts

# 运行特定测试套件
pnpm test --grep "VmService"
```

## 调试指南

### 后端调试

#### VS Code 调试配置

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/server/src/server.ts",
      "outFiles": ["${workspaceFolder}/apps/server/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      },
      "runtimeArgs": ["--loader", "tsx/esm"],
      "console": "integratedTerminal",
      "restart": true,
      "sourceMaps": true
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "--reporter=verbose"],
      "cwd": "${workspaceFolder}/apps/server",
      "console": "integratedTerminal"
    }
  ]
}
```

#### 日志调试

```typescript
// apps/server/src/utils/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'voidvm-server' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
})

export { logger }

// 使用示例
import { logger } from '@/utils/logger'

export class VmService {
  async startVm(vmId: string): Promise<void> {
    logger.info(`Starting VM: ${vmId}`)

    try {
      await this.qemuManager.startVm(vmId)
      logger.info(`VM started successfully: ${vmId}`)
    } catch (error) {
      logger.error(`Failed to start VM: ${vmId}`, { error })
      throw error
    }
  }
}
```

### 前端调试

#### Vue DevTools

```vue
<template>
  <div class="vm-dashboard">
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { useVmStore } from '@/stores/vm'

  const vmStore = useVmStore()

  // 调试数据
  const debugInfo = ref({
    storeState: computed(() => vmStore.$state),
    actions: computed(() => Object.keys(vmStore)),
  })

  // 开发环境下暴露调试信息到全局
  if (import.meta.env.DEV) {
    window.__VM_DEBUG__ = debugInfo
  }

  onMounted(() => {
    console.log('VmDashboard mounted')
    console.log('Store state:', vmStore.$state)
  })
</script>
```

#### 网络请求调试

```typescript
// apps/web/src/utils/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      })
    }

    const token = localStorage.getItem('auth-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.url}`, {
        status: response.status,
        data: response.data,
      })
    }
    return response
  },
  error => {
    console.error('❌ Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    })
    return Promise.reject(error)
  }
)

export { api }
```

## 性能优化

### 前端性能优化

#### 1. 代码分割和懒加载

```typescript
// apps/web/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
    },
    {
      path: '/vms',
      name: 'VmList',
      component: () => import('@/views/VmList.vue'),
    },
    {
      path: '/vms/create',
      name: 'VmCreate',
      component: () => import('@/views/VmCreate.vue'),
    },
    {
      path: '/console/:vmId',
      name: 'VmConsole',
      component: () => import('@/views/VmConsole.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

export default router
```

#### 2. 组件性能优化

```vue
<template>
  <div class="vm-list">
    <!-- 使用 v-memo 优化列表渲染 -->
    <VmCard
      v-for="vm in virtualMachines"
      v-memo="[vm.id, vm.status, vm.cpu, vm.memory]"
      :key="vm.id"
      :vm="vm"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, shallowRef } from 'vue'
  import { useVmStore } from '@/stores/vm'

  const vmStore = useVmStore()

  // 使用 shallowRef 优化大对象的响应性
  const vmMetrics = shallowRef<Map<string, VmMetrics>>(new Map())

  // 使用 computed 缓存计算结果
  const virtualMachines = computed(() => {
    return vmStore.vms.filter(vm => vm.status !== 'deleted')
  })

  // 防抖处理频繁更新
  import { debounce } from 'lodash-es'

  const updateMetrics = debounce((vmId: string, metrics: VmMetrics) => {
    vmMetrics.value.set(vmId, metrics)
  }, 1000)
</script>
```

#### 3. Vite 构建优化

```typescript
// apps/web/vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 将第三方库分离到单独的 chunk
          'element-plus': ['element-plus'],
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          utils: ['lodash-es', 'dayjs'],
        },
      },
    },

    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  // 开发服务器优化
  server: {
    hmr: {
      overlay: false,
    },
  },

  // 依赖预构建
  optimizeDeps: {
    include: ['element-plus', 'lodash-es'],
  },
})
```

### 后端性能优化

#### 1. 数据库查询优化

```typescript
// apps/server/src/services/vm.service.ts
export class VmService {
  // 使用连接池
  private db = new Database('voidvm.db', {
    poolSize: 10,
    connectionTimeout: 5000,
  })

  async getVms(filters: VmFilters): Promise<VmListResponse> {
    // 构建优化的查询
    const query = this.buildOptimizedQuery(filters)

    // 使用索引优化查询
    const vms = await this.db.query(
      `
      SELECT v.*, 
             vm.cpu_usage,
             vm.memory_usage,
             vm.disk_usage
      FROM vms v
      LEFT JOIN vm_metrics vm ON v.id = vm.vm_id 
        AND vm.timestamp = (
          SELECT MAX(timestamp) 
          FROM vm_metrics 
          WHERE vm_id = v.id
        )
      WHERE v.deleted_at IS NULL
      ${filters.status ? 'AND v.status = ?' : ''}
      ORDER BY v.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [filters.status, filters.limit, filters.offset]
    )

    return {
      vms,
      pagination: await this.getPagination(filters),
    }
  }

  // 批量操作优化
  async batchUpdateVmStatus(updates: VmStatusUpdate[]): Promise<void> {
    const transaction = await this.db.beginTransaction()

    try {
      // 使用批量更新减少数据库访问
      const updateQuery = `
        UPDATE vms 
        SET status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `

      await Promise.all(
        updates.map(update => transaction.run(updateQuery, [update.status, update.vmId]))
      )

      await transaction.commit()
    } catch (error) {
      await transaction.rollback()
      throw error
    }
  }
}
```

#### 2. 缓存策略

```typescript
// apps/server/src/utils/cache.ts
import NodeCache from 'node-cache'

class CacheManager {
  private cache = new NodeCache({
    stdTTL: 300, // 5分钟默认过期时间
    checkperiod: 60, // 每分钟清理过期缓存
  })

  // 虚拟机状态缓存
  private vmStatusCache = new NodeCache({ stdTTL: 30 }) // 30秒过期

  async getVmStatus(vmId: string): Promise<VmStatus> {
    const cacheKey = `vm-status-${vmId}`
    const cached = this.vmStatusCache.get<VmStatus>(cacheKey)

    if (cached) {
      return cached
    }

    const status = await this.qemuManager.getVmStatus(vmId)
    this.vmStatusCache.set(cacheKey, status)

    return status
  }

  // 系统信息缓存
  async getSystemInfo(): Promise<SystemInfo> {
    const cacheKey = 'system-info'
    const cached = this.cache.get<SystemInfo>(cacheKey)

    if (cached) {
      return cached
    }

    const systemInfo = await this.collectSystemInfo()
    this.cache.set(cacheKey, systemInfo, 60) // 1分钟缓存

    return systemInfo
  }

  // 缓存失效
  invalidateVmCache(vmId: string): void {
    const patterns = [`vm-status-${vmId}`, `vm-metrics-${vmId}`, `vm-details-${vmId}`]

    patterns.forEach(pattern => {
      this.cache.del(pattern)
      this.vmStatusCache.del(pattern)
    })
  }
}

export const cacheManager = new CacheManager()
```

#### 3. WebSocket 连接优化

```typescript
// apps/server/src/services/websocket.service.ts
import WebSocket from 'ws'
import { EventEmitter } from 'events'

export class WebSocketService extends EventEmitter {
  private connections = new Map<string, WebSocket>()
  private roomSubscriptions = new Map<string, Set<string>>()

  // 连接池管理
  private maxConnections = 1000
  private connectionCount = 0

  handleConnection(ws: WebSocket, userId: string) {
    // 连接数限制
    if (this.connectionCount >= this.maxConnections) {
      ws.close(1013, 'Server overloaded')
      return
    }

    this.connectionCount++
    this.connections.set(userId, ws)

    // 心跳检测
    const heartbeat = this.setupHeartbeat(ws)

    ws.on('close', () => {
      this.connectionCount--
      this.connections.delete(userId)
      this.cleanupSubscriptions(userId)
      clearInterval(heartbeat)
    })

    // 消息处理优化
    ws.on('message', data => {
      this.handleMessage(ws, userId, data)
    })
  }

  // 广播优化 - 批量发送
  broadcastToRoom(room: string, message: any): void {
    const subscribers = this.roomSubscriptions.get(room)
    if (!subscribers || subscribers.size === 0) return

    const messageStr = JSON.stringify(message)
    const batch: WebSocket[] = []

    subscribers.forEach(userId => {
      const ws = this.connections.get(userId)
      if (ws && ws.readyState === WebSocket.OPEN) {
        batch.push(ws)
      }
    })

    // 批量发送减少系统调用
    batch.forEach(ws => {
      try {
        ws.send(messageStr)
      } catch (error) {
        console.error('Failed to send message:', error)
      }
    })
  }

  private setupHeartbeat(ws: WebSocket): NodeJS.Timer {
    return setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping()
      }
    }, 30000) // 30秒心跳
  }

  private handleMessage(ws: WebSocket, userId: string, data: Buffer): void {
    try {
      const message = JSON.parse(data.toString())

      // 消息限流
      if (!this.rateLimiter.checkLimit(userId)) {
        ws.send(
          JSON.stringify({
            type: 'error',
            message: 'Rate limit exceeded',
          })
        )
        return
      }

      this.processMessage(ws, userId, message)
    } catch (error) {
      console.error('Invalid message format:', error)
    }
  }
}
```
