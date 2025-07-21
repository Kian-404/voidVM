const helmet = require('helmet')
const xss = require('xss')

// 基础安全配置
const basicSecurity = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
})

// XSS 防护中间件
const xssProtection = (req, res, next) => {
  // 清理请求体中的 XSS
  if (req.body) {
    req.body = sanitizeObject(req.body)
  }

  // 清理查询参数中的 XSS
  if (req.query) {
    req.query = sanitizeObject(req.query)
  }

  next()
}

// 递归清理对象中的 XSS
const sanitizeObject = obj => {
  if (typeof obj === 'string') {
    return xss(obj)
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item))
  }

  if (obj && typeof obj === 'object') {
    const sanitized = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key])
      }
    }
    return sanitized
  }

  return obj
}

// IP 白名单中间件
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress

    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        error: '访问被拒绝：IP地址不在允许列表中',
      })
    }

    next()
  }
}

// 请求大小限制中间件
const requestSizeLimit = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'])
    const maxBytes = parseSize(maxSize)

    if (contentLength > maxBytes) {
      return res.status(413).json({
        error: '请求体过大',
      })
    }

    next()
  }
}

// 解析大小字符串为字节数
const parseSize = size => {
  const units = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  }

  const match = size
    .toString()
    .toLowerCase()
    .match(/^(\d+(?:\.\d+)?)\s*([kmg]?b)$/)
  if (!match) return 0

  return parseFloat(match[1]) * units[match[2]]
}

// SQL 注入防护中间件
const sqlInjectionProtection = (req, res, next) => {
  const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi

  const checkForSQLInjection = obj => {
    if (typeof obj === 'string' && sqlPattern.test(obj)) {
      return true
    }

    if (Array.isArray(obj)) {
      return obj.some(item => checkForSQLInjection(item))
    }

    if (obj && typeof obj === 'object') {
      return Object.values(obj).some(value => checkForSQLInjection(value))
    }

    return false
  }

  if (checkForSQLInjection(req.body) || checkForSQLInjection(req.query)) {
    return res.status(400).json({
      error: '检测到潜在的 SQL 注入攻击',
    })
  }

  next()
}

// 隐藏服务器信息中间件
const hideServerInfo = (req, res, next) => {
  res.removeHeader('X-Powered-By')
  res.setHeader('Server', 'Unknown')
  next()
}

module.exports = {
  basicSecurity,
  xssProtection,
  ipWhitelist,
  requestSizeLimit,
  sqlInjectionProtection,
  hideServerInfo,
}
