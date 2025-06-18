// 全局错误处理
const errorHandler = (err, req, res, next) => {
  let error = { ...err }
  error.message = err.message

  // 记录错误日志
  console.error(err)

  // Mongoose重复键错误
  if (err.code === 11000) {
    const message = '资源已存在'
    error = { message, statusCode: 400 }
  }

  // Mongoose验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(val => val.message)
      .join(', ')
    error = { message, statusCode: 400 }
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    const message = '无效的令牌'
    error = { message, statusCode: 401 }
  }

  // JWT过期错误
  if (err.name === 'TokenExpiredError') {
    const message = '令牌已过期'
    error = { message, statusCode: 401 }
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

module.exports = {
  errorHandler,
}
