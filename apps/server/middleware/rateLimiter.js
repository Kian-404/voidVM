const rateLimit = require('express-rate-limit')
// const RedisStore = require('rate-limit-redis')
// const Redis = require('ioredis')

// Redis客户端（可选，不用Redis就注释掉）
// const redisClient = new Redis(process.env.REDIS_URL);

// 通用限流
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP每15分钟最多100个请求
  message: {
    error: '请求过于频繁，请稍后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // store: new RedisStore({
  //   sendCommand: (...args) => redisClient.call(...args),
  // }),
})

// 严格限流（用于登录等敏感操作）
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 限制每个IP每15分钟最多5个请求
  message: {
    error: '请求过于频繁，请15分钟后再试',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// API限流
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1分钟
  max: 60, // 限制每个IP每分钟最多60个请求
  message: {
    error: 'API请求过于频繁，请稍后再试',
  },
})

module.exports = {
  generalLimiter,
  strictLimiter,
  apiLimiter,
}
