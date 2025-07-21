const rateLimit = require('express-rate-limit')
const slowDown = require('express-slow-down')

// 基础限流配置
const basicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 15分钟内最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// 登录限流配置
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 限制每个IP 15分钟内最多5次登录尝试
  message: {
    error: '登录尝试过于频繁，请15分钟后再试',
  },
  skipSuccessfulRequests: true, // 成功的请求不计入限制
})

// API 限流配置
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 60, // 限制每个IP 1分钟内最多60个API请求
  message: {
    error: 'API调用过于频繁，请稍后再试',
  },
})

// 慢速响应中间件
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15分钟
  delayAfter: 50, // 50个请求后开始延迟
  delayMs: () => 500, // 每个请求延迟500ms
  maxDelayMs: 20000, // 最大延迟20秒
})

// 自定义限流中间件
const customRateLimiter = options => {
  const store = new Map()

  const defaultOptions = {
    windowMs: 60 * 1000, // 1分钟
    max: 60,
    message: '请求过于频繁',
  }

  const config = { ...defaultOptions, ...options }

  return (req, res, next) => {
    const key = req.ip
    const now = Date.now()
    const windowStart = now - config.windowMs

    // 清理过期记录
    if (store.has(key)) {
      const requests = store.get(key).filter(time => time > windowStart)
      store.set(key, requests)
    }

    const requests = store.get(key) || []

    if (requests.length >= config.max) {
      return res.status(429).json({
        error: config.message,
        retryAfter: Math.ceil(config.windowMs / 1000),
      })
    }

    requests.push(now)
    store.set(key, requests)

    next()
  }
}

module.exports = {
  basicLimiter,
  authLimiter,
  apiLimiter,
  speedLimiter,
  customRateLimiter,
}
