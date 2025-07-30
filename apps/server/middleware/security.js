// middleware/security.js
import helmet from 'helmet'
import xss from 'xss'

/**
 * 基础安全配置
 * 使用Helmet提供多种安全HTTP头
 */
const basicSecurity = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], // 默认只允许同源加载
      styleSrc: ["'self'", "'unsafe-inline'"], // 允许内联样式
      scriptSrc: ["'self'"], // 只允许同源脚本
      imgSrc: ["'self'", 'data:', 'https:'], // 允许data URL和HTTPS图片
    },
  },
  hsts: {
    // HTTP严格传输安全
    maxAge: 31536000, // 1年有效期
    includeSubDomains: true, // 包含子域名
    preload: true, // 允许预加载
  },
})

/**
 * XSS防护中间件
 * 清理请求体和查询参数中的XSS攻击
 */
const xssProtection = (req, res, next) => {
  // 清理请求体
  if (req.body) {
    req.body = sanitizeObject(req.body)
  }

  // 清理查询参数
  if (req.query) {
    req.query = sanitizeObject(req.query)
  }

  next()
}

/**
 * 递归清理对象中的XSS
 * @param {Object|Array|string} obj 需要清理的对象
 * @returns {Object|Array|string} 清理后的对象
 */
const sanitizeObject = obj => {
  // 处理字符串
  if (typeof obj === 'string') {
    return xss(obj)
  }

  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item))
  }

  // 处理对象
  if (obj && typeof obj === 'object') {
    const sanitized = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key])
      }
    }
    return sanitized
  }

  return obj
}

/**
 * IP白名单中间件
 * @param {Array<string>} allowedIPs 允许的IP地址列表
 * @returns {Function} 中间件函数
 */
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

/**
 * 请求大小限制中间件
 * @param {string} maxSize 最大请求大小，如'10mb'
 * @returns {Function} 中间件函数
 */
const requestSizeLimit = (maxSize = '10mb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'], 10)
    const maxBytes = parseSize(maxSize)

    if (contentLength > maxBytes) {
      return res.status(413).json({
        error: '请求体过大',
      })
    }

    next()
  }
}

/**
 * 解析大小字符串为字节数
 * @param {string} size 大小字符串，如'10mb'
 * @returns {number} 字节数
 */
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

/**
 * SQL注入防护中间件
 * 检测并阻止常见的SQL注入攻击
 */
const sqlInjectionProtection = (req, res, next) => {
  const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi

  /**
   * 递归检查对象中是否包含SQL注入
   * @param {Object|Array|string} obj 待检查对象
   * @returns {boolean} 是否检测到SQL注入
   */
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
      error: '检测到潜在的SQL注入攻击',
    })
  }

  next()
}

/**
 * 隐藏服务器信息中间件
 * 移除敏感HTTP头信息
 */
const hideServerInfo = (req, res, next) => {
  res.removeHeader('X-Powered-By')
  res.setHeader('Server', 'Unknown')
  next()
}

// 导出所有安全中间件
export {
  basicSecurity,
  xssProtection,
  ipWhitelist,
  requestSizeLimit,
  sqlInjectionProtection,
  hideServerInfo,
}

// 默认导出
export default {
  basicSecurity,
  xssProtection,
  ipWhitelist,
  requestSizeLimit,
  sqlInjectionProtection,
  hideServerInfo,
}
