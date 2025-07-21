// config.js
const path = require('path')
// 根据 NODE_ENV 加载对应的环境变量文件
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
require('dotenv').config({ path: path.resolve(process.cwd(), envFile) })

console.log('process.cwd()', process.cwd())
console.log('path', path.resolve(process.cwd(), envFile))
console.log('process.env', process.env.NODE_ENV)
module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  path: {
    ISOLISTPATH: process.env.ISO_LIST_PATH,
  },
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    name: process.env.DB_NAME,
  },
  apiKey: process.env.API_KEY,
}
