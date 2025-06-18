const corsHandler = require('./cors')
const { accessLogger, errorLogger, devLogger } = require('./logger')
const { generalLimiter, strictLimiter, apiLimiter } = require('./rateLimiter')
const { errorHandler } = require('./errorHandler')
const { helmetConfig, preventParamPollution, ipFilter, userAgentCheck } = require('./security')

module.exports = {
  // CORS
  corsHandler,

  // 日志
  accessLogger,
  errorLogger,
  devLogger,

  // 限流
  generalLimiter,
  strictLimiter,
  apiLimiter,

  // 错误处理
  errorHandler,

  // 安全
  helmetConfig,
  preventParamPollution,
  ipFilter,
  userAgentCheck,
}
