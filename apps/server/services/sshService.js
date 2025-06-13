// src/services/sshService.ts
const WebSocket = require("ws");
const url = require("url");
const { Client } = require("ssh2");

const handleSSHConnection = (ws, req) => {
  const query = url.parse(req.url || "", true).query;
  const vmName = query.vmName;
  const port = parseInt(query.port) || 22;
  const username = query.username || "root";
  const password = query.password || "";

  console.log(`SSH connection request for VM: ${vmName}, port: ${port}`);

  const sshClient = new Client();

  sshClient.on("ready", () => {
    ws.send("SSH connection established\r\n");

    sshClient.shell((err, stream) => {
      if (err) {
        ws.send(`SSH shell error: ${err.message}\r\n`);
        ws.close();
        return;
      }

      // 从 SSH 流向 WebSocket 传输数据
      stream.on("data", (data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      });

      stream.on("close", () => {
        ws.close();
        sshClient.end();
      });

      // 从 WebSocket 向 SSH 流传输数据
      ws.on("message", (message) => {
        stream.write(message);
      });

      ws.on("close", () => {
        stream.close();
        sshClient.end();
      });
    });
  });

  sshClient.on("error", (err) => {
    ws.send(`SSH connection error: ${err.message}\r\n`);
    ws.close();
  });

  // 连接到 SSH 服务器
  sshClient.connect({
    host: "localhost", // 或者使用 VM 的 IP 地址
    port: port,
    username: username,
    password: password,
    // 如果使用密钥认证，可以添加以下配置
    // privateKey: require('fs').readFileSync('/path/to/key')
  });
};

module.exports = handleSSHConnection;
