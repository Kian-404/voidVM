const helmet = require('helmet')
const hpp = require('hpp')

// Helmet安全配置
const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
})

// 防止NoSQL注入

// 防止HTTP参数污染
const preventParamPollution = hpp({
  whitelist: ['tags', 'categories'], // 允许这些参数重复
})

// IP过滤中间件
const ipFilter = (blacklist = []) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress

    if (blacklist.includes(clientIP)) {
      return res.status(403).json({ error: 'IP地址被禁止访问' })
    }

    next()
  }
}

// 用户代理检查
const userAgentCheck = (req, res, next) => {
  const userAgent = req.get('User-Agent')

  // 阻止空的或可疑的User-Agent
  if (!userAgent || userAgent.includes('bot') || userAgent.includes('crawler')) {
    return res.status(403).json({ error: '请求被拒绝' })
  }

  next()
}

module.exports = {
  helmetConfig,
  preventParamPollution,
  ipFilter,
  userAgentCheck,
}
