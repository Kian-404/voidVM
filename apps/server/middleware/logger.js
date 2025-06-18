const morgan = require('morgan')
const fs = require('fs')
const path = require('path')

// 创建日志目录
const logDir = path.join(__dirname, '../logs')
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

// 自定义日志格式
morgan.format(
  'custom',
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms'
)

// 访问日志流
const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' })

// 错误日志流
const errorLogStream = fs.createWriteStream(path.join(logDir, 'error.log'), { flags: 'a' })

// 访问日志中间件
const accessLogger = morgan('custom', {
  stream: accessLogStream,
  skip: (req, res) => res.statusCode >= 400,
})

// 错误日志中间件
const errorLogger = morgan('custom', {
  stream: errorLogStream,
  skip: (req, res) => res.statusCode < 400,
})

// 开发环境日志
const devLogger = morgan('dev')

module.exports = {
  accessLogger,
  errorLogger,
  devLogger,
}
