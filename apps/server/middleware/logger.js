// middleware/logger.js
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

// Get current directory path in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const LOG_DIR = path.join(__dirname, '../logs')
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

// Ensure log directory exists
const ensureLogDir = async () => {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true })
  } catch (err) {
    console.error('Failed to create log directory:', err)
  }
}

// Format today's date for log filenames
const getTodayDate = () => {
  const now = new Date()
  return DATE_FORMAT.format(now).replace(/\//g, '-')
}

// Write log to file helper
const writeLog = async (filename, data) => {
  try {
    const logFile = path.join(LOG_DIR, filename)
    await fs.appendFile(logFile, JSON.stringify(data) + '\n')
  } catch (err) {
    console.error('Failed to write log:', err)
  }
}

/**
 * Request logger middleware
 * Logs request details including method, URL, status code, and duration
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now()
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
      ...(req.method !== 'GET' && { body: req.body }),
    }

    // Write to access log
    const accessLogFile = `access-${getTodayDate()}.log`
    writeLog(accessLogFile, logData)

    // Console output
    console.log(`${logData.method} ${logData.url} ${logData.statusCode} - ${logData.duration}`)

    originalEnd.apply(this, args)
  }

  next()
}

/**
 * Error logger middleware
 * Logs error details including stack trace and request context
 */
export const errorLogger = (err, req, res, next) => {
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

  // Write to error log
  const errorLogFile = `error-${getTodayDate()}.log`
  writeLog(errorLogFile, errorData)

  next(err)
}

// Initialize log directory when module loads
ensureLogDir()

// Export all loggers
export default {
  requestLogger,
  errorLogger,
}
