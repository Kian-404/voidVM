import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

// 根据 NODE_ENV 加载对应的环境变量文件
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
config({ path: path.resolve(__dirname, envFile) })

console.log('process.cwd()', process.cwd())
console.log('path', path.resolve(__dirname, envFile))
console.log('process.env', process.env.NODE_ENV)

export default {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  paths: {
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
