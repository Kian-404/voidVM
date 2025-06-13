module.exports = {
  apps: [{
    name: "qemu-manager",              // 应用名称
    script: "./server.js",             // 入口文件
    instances: "max",                  // 实例数量，"max" 表示根据 CPU 核心数自动调整
    exec_mode: "cluster",              // 执行模式：cluster 或 fork
    watch: false,                      // 是否监视文件变化
    ignore_watch: ["node_modules", "logs"], // 忽略监视的文件夹
    max_memory_restart: "1G",          // 内存使用超过此值时自动重启
    env: {                             // 默认环境变量
      NODE_ENV: "production",
      PORT: 3000
    },
    env_development: {                 // 开发环境变量
      NODE_ENV: "development",
      PORT: 3000
    },
    log_date_format: "YYYY-MM-DD HH:mm:ss", // 日志日期格式
    error_file: "./logs/error.log",    // 错误日志文件
    out_file: "./logs/out.log",        // 输出日志文件
    merge_logs: true,                  // 合并集群实例的日志
    log_type: "json",                  // 日志类型
  }]
};
