// middleware/rateLimiter.js
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'

/**
 * 基础请求限流配置
 * 15分钟内每个IP最多100个请求
 */
const basicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟窗口期
  max: 100, // 每个IP的最大请求数
  message: {
    error: '请求过于频繁，请稍后再试',
  },
  standardHeaders: true, // 返回标准化的速率限制头信息
  legacyHeaders: false, // 禁用旧的X-RateLimit头
})

/**
 * 认证请求限流配置
 * 专门用于登录等认证接口
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟窗口期
  max: 5, // 每个IP最多5次登录尝试
  message: {
    error: '登录尝试过于频繁，请15分钟后再试',
  },
  skipSuccessfulRequests: true, // 仅限制失败的登录尝试
})

/**
 * API请求限流配置
 * 1分钟内每个IP最多60个API请求
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分钟窗口期
  max: 60, // 每个IP的最大API请求数
  message: {
    error: 'API调用过于频繁，请稍后再试',
  },
})

/**
 * 慢速响应中间件
 * 在大量请求后开始延迟响应
 */
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15分钟窗口期
  delayAfter: 50, // 50个请求后开始延迟
  delayMs: () => 500, // 每个请求增加500ms延迟
  maxDelayMs: 20000, // 最大延迟20秒
})

/**
 * 自定义限流中间件
 * 提供更灵活的限流配置选项
 * @param {Object} options 自定义配置选项
 * @returns {Function} 限流中间件函数
 */
const customRateLimiter = (options = {}) => {
  // 使用Map存储请求记录
  const store = new Map()

  // 默认配置
  const defaultOptions = {
    windowMs: 60 * 1000, // 1分钟窗口期
    max: 60, // 默认最大请求数
    message: '请求过于频繁',
  }

  // 合并默认配置和自定义配置
  const config = { ...defaultOptions, ...options }

  return (req, res, next) => {
    const key = req.ip // 使用IP作为键
    const now = Date.now()
    const windowStart = now - config.windowMs

    // 清理过期请求记录
    if (store.has(key)) {
      const requests = store.get(key).filter(time => time > windowStart)
      store.set(key, requests)
    }

    const requests = store.get(key) || []

    // 检查是否超过限制
    if (requests.length >= config.max) {
      return res.status(429).json({
        error: config.message,
        retryAfter: Math.ceil(config.windowMs / 1000), // 返回重试等待时间(秒)
      })
    }

    // 记录当前请求
    requests.push(now)
    store.set(key, requests)

    next()
  }
}

// 导出所有限流中间件
export { basicLimiter, authLimiter, apiLimiter, speedLimiter, customRateLimiter }

// 默认导出
export default {
  basicLimiter,
  authLimiter,
  apiLimiter,
  speedLimiter,
  customRateLimiter,
}
