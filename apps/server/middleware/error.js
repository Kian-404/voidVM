// middleware/error.js
import config from '../config/index.js'

// 404 错误处理
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

// 全局错误处理中间件
const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // 记录错误日志
  console.error(err)

  // Mongoose 错误处理
  if (err.name === 'CastError') {
    const message = '资源未找到'
    error = { message, status: 404 }
  }

  // Mongoose 重复字段错误
  if (err.code === 11000) {
    const message = '重复的字段值'
    error = { message, status: 400 }
  }

  // Mongoose 验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ')
    error = { message, status: 400 }
  }

  // JWT 错误处理
  if (err.name === 'JsonWebTokenError') {
    const message = '无效的 Token'
    error = { message, status: 401 }
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token 已过期'
    error = { message, status: 401 }
  }

  res.status(error.status || 500).json({
    success: false,
    error: error.message || '服务器内部错误',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  })
}

// 异步错误处理包装器
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// 导出所有错误处理中间件
export { notFound, errorHandler, asyncHandler }
