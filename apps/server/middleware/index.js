// 导入所有中间件模块
const cors = require('./cors')
const error = require('./error')
const logger = require('./logger')
const rateLimiter = require('./rateLimiter')
const security = require('./security')

// 常用中间件组合
const commonMiddlewares = [
  cors.customCors(),
  security.hideServerInfo,
  // security.basicSecurity,
  logger.requestLogger,
  // rateLimiter.basicLimiter,
  // security.xssProtection,
  security.sqlInjectionProtection,
]

// API 中间件组合
const apiMiddlewares = [
  security.hideServerInfo,
  cors.customCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  }),
  logger.requestLogger,
  rateLimiter.apiLimiter,
  security.xssProtection,
]

// 管理员中间件组合
const adminMiddlewares = [...apiMiddlewares]

module.exports = {
  // 按模块导出
  cors,
  error,
  logger,
  rateLimiter,
  security,

  // 组合中间件
  commonMiddlewares,
  apiMiddlewares,
  adminMiddlewares,

  // 快捷使用函数
  setupCommonMiddlewares: app => {
    commonMiddlewares.forEach(middleware => {
      app.use(middleware)
    })

    // 错误处理中间件需要放在最后
    // app.use(error.notFound)
    app.use(logger.errorLogger)
    app.use(error.errorHandler)
  },

  setupApiMiddlewares: router => {
    apiMiddlewares.forEach(middleware => {
      router.use(middleware)
    })
  },
}
