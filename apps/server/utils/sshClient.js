// utils/sshClient.js
const { Client } = require('ssh2')
const fs = require('fs-extra')
const path = require('path')
/**
 * 创建SSH连接
 * @param {Object} config - SSH连接配置
 * @returns {Promise<Client>} - SSH客户端实例
 */
function createSSHConnection(config) {
  return new Promise((resolve, reject) => {
    const conn = new Client()

    conn.on('ready', () => {
      console.log('SSH连接已建立')
      resolve(conn)
    })

    conn.on('error', err => {
      console.error('SSH连接错误:', err)
      reject(err)
    })

    conn.connect(config)
  })
}

/**
 * 通过SFTP上传文件到远程服务器
 * @param {Client} conn - SSH客户端实例
 * @param {string} localPath - 本地文件路径
 * @param {string} remotePath - 远程文件路径
 * @returns {Promise<void>}
 */
function uploadFile(conn, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    console.log(`开始SFTP上传: 本地路径=${localPath}, 远程路径=${remotePath}`)

    // 检查本地文件是否存在
    if (!fs.existsSync(localPath)) {
      return reject(new Error(`本地文件不存在: ${localPath}`))
    }

    const fileStats = fs.statSync(localPath)
    console.log(`本地文件大小: ${fileStats.size} 字节`)

    conn.sftp((err, sftp) => {
      if (err) {
        console.error('创建SFTP会话失败:', err)
        return reject(new Error(`创建SFTP会话失败: ${err.message}`))
      }

      console.log('SFTP会话已创建')

      // 首先尝试确保远程目录存在
      const remoteDir = path.dirname(remotePath)
      console.log(`确保远程目录存在: ${remoteDir}`)

      // 使用SFTP的mkdir方法创建目录
      sftp.mkdir(remoteDir, { mode: '0755' }, mkdirErr => {
        // 忽略目录已存在的错误
        if (mkdirErr && mkdirErr.code !== 4) {
          console.error(`创建远程目录失败: ${mkdirErr.message}, 代码: ${mkdirErr.code}`)
          // 尝试继续，因为目录可能已经存在
        }

        const readStream = fs.createReadStream(localPath)

        readStream.on('error', readErr => {
          console.error('读取本地文件失败:', readErr)
          sftp.end()
          reject(new Error(`读取本地文件失败: ${readErr.message}`))
        })

        console.log(`开始创建远程文件写入流: ${remotePath}`)
        const writeStream = sftp.createWriteStream(remotePath)

        writeStream.on('close', () => {
          console.log(`文件上传完成: ${remotePath}`)
          sftp.end()
          resolve()
        })

        writeStream.on('error', writeErr => {
          console.error('写入远程文件失败:', writeErr)
          sftp.end()

          // 提供更详细的错误信息
          let errorMessage = `写入远程文件失败: ${writeErr.message}`
          if (writeErr.code) {
            errorMessage += ` (错误代码: ${writeErr.code})`
          }

          reject(new Error(errorMessage))
        })

        // 添加数据传输日志
        let bytesUploaded = 0
        readStream.on('data', chunk => {
          bytesUploaded += chunk.length
          if (bytesUploaded % 1048576 === 0) {
            // 每MB记录一次
            console.log(`已上传 ${bytesUploaded / 1048576} MB...`)
          }
        })

        console.log('开始传输数据...')
        readStream.pipe(writeStream)
      })
    })
  })
}

/**
 * 执行远程命令
 * @param {Client} conn - SSH客户端实例
 * @param {string} command - 要执行的命令
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
function executeCommand(conn, command) {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err, stream) => {
      if (err) return reject(err)

      let stdout = ''
      let stderr = ''

      stream
        .on('close', code => {
          if (code !== 0) {
            reject(new Error(`命令执行失败，退出码: ${code}, stderr: ${stderr}`))
          } else {
            resolve({ stdout, stderr })
          }
        })
        .on('data', data => {
          stdout += data.toString()
        })
        .stderr.on('data', data => {
          stderr += data.toString()
        })
    })
  })
}

/**
 * 使用SCP方式上传文件（通过SSH执行命令）
 * @param {Client} conn - SSH客户端实例
 * @param {string} localPath - 本地文件路径
 * @param {string} remotePath - 远程文件路径
 * @returns {Promise<void>}
 */
async function uploadFileViaSCP(conn, localPath, remotePath) {
  // 首先将文件内容编码为base64
  const fileContent = await fs.readFile(localPath)
  const base64Content = fileContent.toString('base64')

  // 创建远程目录
  const remoteDir = path.dirname(remotePath)
  await executeCommand(conn, `mkdir -p "${remoteDir}"`)

  // 使用base64解码并写入文件
  const command = `echo "${base64Content}" | base64 -d > "${remotePath}"`
  await executeCommand(conn, command)

  console.log(`文件已通过SCP方式上传到 ${remotePath}`)
}

module.exports = {
  createSSHConnection,
  uploadFile,
  executeCommand,
  uploadFileViaSCP,
}
