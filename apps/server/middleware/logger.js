const fs = require('fs')
const path = require('path')

// 确保日志目录存在
const logDir = path.join(__dirname, '../logs')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

// 请求日志中间件
const requestLogger = (req, res, next) => {
  const start = Date.now()

  // 保存原始的 res.end 方法
  const originalEnd = res.end

  res.end = function (...args) {
    const duration = Date.now() - start
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      body: req.method !== 'GET' ? req.body : undefined,
    }

    // 写入日志文件
    const logString = JSON.stringify(logData) + '\n'
    const logFile = path.join(logDir, `access-${new Date().toISOString().split('T')[0]}.log`)

    fs.appendFile(logFile, logString, err => {
      if (err) console.error('日志写入失败:', err)
    })

    // 控制台输出
    console.log(`${logData.method} ${logData.url} ${logData.statusCode} - ${logData.duration}`)

    // 调用原始的 end 方法
    originalEnd.apply(this, args)
  }

  next()
}

// 错误日志中间件
const errorLogger = (err, req, res, next) => {
  const errorData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    error: {
      message: err.message,
      stack: err.stack,
      status: err.status || 500,
    },
    body: req.body,
    params: req.params,
    query: req.query,
  }

  const logString = JSON.stringify(errorData) + '\n'
  const logFile = path.join(logDir, `error-${new Date().toISOString().split('T')[0]}.log`)

  fs.appendFile(logFile, logString, writeErr => {
    if (writeErr) console.error('错误日志写入失败:', writeErr)
  })

  next(err)
}

module.exports = {
  requestLogger,
  errorLogger,
}
