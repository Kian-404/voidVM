// middleware/index.js
import cors from './cors.js'
import error from './error.js'
import logger from './logger.js'
import rateLimiter from './rateLimiter.js'
import security from './security.js'

// Configuration constants
const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:3000']

// Middleware compositions
const middlewareCompositions = {
  common: [
    cors.customCors(),
    security.hideServerInfo,
    logger.requestLogger,
    security.sqlInjectionProtection,
  ],

  api: [
    security.hideServerInfo,
    cors.customCors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || DEFAULT_ALLOWED_ORIGINS,
    }),
    logger.requestLogger,
    rateLimiter.apiLimiter,
    security.xssProtection,
  ],

  admin: null, // Will be initialized below
}

// Initialize admin middlewares (same as api for now)
middlewareCompositions.admin = [...middlewareCompositions.api]

/**
 * Setup common middlewares on an Express app
 * @param {import('express').Application} app - Express application instance
 */
export const setupCommonMiddlewares = app => {
  middlewareCompositions.common.forEach(middleware => {
    app.use(middleware)
  })

  // Error handling middlewares should be last
  app.use(logger.errorLogger)
  app.use(error.errorHandler)
}

/**
 * Setup API-specific middlewares on an Express router
 * @param {import('express').Router} router - Express router instance
 */
export const setupApiMiddlewares = router => {
  middlewareCompositions.api.forEach(middleware => {
    router.use(middleware)
  })
}

// Export individual middleware modules
export { cors, error, logger, rateLimiter, security }

// Export middleware compositions
export const commonMiddlewares = middlewareCompositions.common
export const apiMiddlewares = middlewareCompositions.api
export const adminMiddlewares = middlewareCompositions.admin

// Default export containing all exports
export default {
  cors,
  error,
  logger,
  rateLimiter,
  security,
  commonMiddlewares,
  apiMiddlewares,
  adminMiddlewares,
  setupCommonMiddlewares,
  setupApiMiddlewares,
}
