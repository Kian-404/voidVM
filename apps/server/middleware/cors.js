// middleware/cors.js
require('../config/index')
const cors = require('cors')

// 基础 CORS 配置 - 允许所有来源
const basicCors = () => {
  return cors({
    origin: true, // 允许所有来源
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400, // 24小时
    optionsSuccessStatus: 200, // 兼容旧版浏览器
  })
}

// 自定义 CORS 配置
const customCors = (options = {}) => {
  // const defaultOptions = {
  //   origin: true, // 默认允许所有来源
  //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  //   allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With'],
  //   credentials: false,
  //   maxAge: 86400, // 24小时
  //   optionsSuccessStatus: 200,
  // }

  // const config = { ...defaultOptions, ...options }

  return cors()
}

// 开发环境 CORS - 允许所有来源
const developmentCors = () => {
  return cors({
    origin: true, // 允许所有来源
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'Cache-Control',
    ],
    maxAge: 86400,
  })
}

// 生产环境 CORS - 限制特定来源
const productionCors = (allowedOrigins = []) => {
  return cors({
    origin: (origin, callback) => {
      // 允许没有 origin 的请求（如移动应用、Postman 等）
      if (!origin) return callback(null, true)

      // 检查来源是否在允许列表中
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      // 记录被阻止的请求
      console.warn(`CORS blocked request from origin: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    maxAge: 86400,
  })
}

// API 专用 CORS - 更严格的配置
const apiCors = (options = {}) => {
  const defaultApiOptions = {
    origin:
      process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') || [] : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400,
  }

  return cors({ ...defaultApiOptions, ...options })
}

// 文件上传专用 CORS
const uploadCors = () => {
  return cors({
    origin: true,
    credentials: true,
    methods: ['POST', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'Content-Length'],
    maxAge: 3600, // 1小时
  })
}

// 动态 CORS 配置函数
const dynamicCors = () => {
  return cors((req, callback) => {
    let corsOptions

    // 根据请求路径动态设置 CORS
    if (req.path.startsWith('/api/public')) {
      // 公共 API 允许所有来源
      corsOptions = {
        origin: true,
        credentials: false,
      }
    } else if (req.path.startsWith('/api/admin')) {
      // 管理员 API 只允许特定来源
      corsOptions = {
        origin: process.env.ADMIN_ORIGINS?.split(',') || ['http://localhost:3000'],
        credentials: true,
      }
    } else {
      // 默认配置
      corsOptions = {
        origin: true,
        credentials: true,
      }
    }

    callback(null, corsOptions)
  })
}

module.exports = {
  // 基础配置
  basicCors,
  customCors,

  // 环境特定配置
  developmentCors,
  productionCors,

  // 用途特定配置
  apiCors,
  uploadCors,
  dynamicCors,

  // // 便捷方法
  // getAllowAllCors: () =>
  //   cors({
  //     origin: true,
  //     credentials: true,
  //     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  //     allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  //   }),

  // // 根据环境自动选择配置
  // getEnvironmentCors: () => {
  //   return process.env.NODE_ENV === 'production'
  //     ? productionCors(process.env.ALLOWED_ORIGINS?.split(',') || [])
  //     : developmentCors()
  // },
}
