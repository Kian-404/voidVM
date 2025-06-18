const cors = require('cors')

// CORS配置
const corsOptions = {
  origin: '*',
  credentials: true, // 允许携带cookie
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}

module.exports = cors(corsOptions)
