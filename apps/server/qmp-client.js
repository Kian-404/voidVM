const net = require("net");
const EventEmitter = require("events");

class QMPClient extends EventEmitter {
  constructor() {
    super();
    this.socket = null;
    this.connected = false;
    this.commandId = 0;
    this.pendingCommands = new Map();
  }

  // 连接到QMP服务器
  connect(host = "localhost", port = 4444) {
    return new Promise((resolve, reject) => {
      this.socket = net.createConnection(port, host);

      this.socket.on("connect", () => {
        console.log("Connected to QMP server");
      });

      this.socket.on("data", (data) => {
        this.handleData(data);
      });

      this.socket.on("error", (err) => {
        console.error("Socket error:", err);
        reject(err);
      });

      this.socket.on("close", () => {
        console.log("Connection closed");
        this.connected = false;
        this.emit("disconnected");
      });

      // 等待QMP greeting消息
      this.once("greeting", () => {
        this.connected = true;
        resolve();
      });
    });
  }

  // 处理接收到的数据
  handleData(data) {
    const messages = data.toString().trim().split("\n");

    messages.forEach((message) => {
      if (message.trim()) {
        try {
          const json = JSON.parse(message);
          this.handleMessage(json);
        } catch (err) {
          console.error("Failed to parse JSON:", err);
        }
      }
    });
  }

  // 处理QMP消息
  handleMessage(message) {
    if (message.QMP) {
      // QMP greeting消息
      console.log("QMP Version:", message.QMP.version);
      this.emit("greeting", message.QMP);
    } else if (message.return !== undefined) {
      // 命令响应
      const commandId = message.id;
      if (this.pendingCommands.has(commandId)) {
        const { resolve } = this.pendingCommands.get(commandId);
        this.pendingCommands.delete(commandId);
        resolve(message.return);
      }
    } else if (message.error) {
      // 错误响应
      const commandId = message.id;
      if (this.pendingCommands.has(commandId)) {
        const { reject } = this.pendingCommands.get(commandId);
        this.pendingCommands.delete(commandId);
        reject(new Error(message.error.desc));
      }
    } else if (message.event) {
      // 事件消息
      this.emit("event", message.event, message.data);
    }
  }

  // 发送QMP命令
  sendCommand(command, args = {}) {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        reject(new Error("Not connected to QMP server"));
        return;
      }

      const commandId = ++this.commandId;
      const qmpCommand = {
        execute: command,
        arguments: args,
        id: commandId,
      };

      this.pendingCommands.set(commandId, { resolve, reject });

      const commandStr = JSON.stringify(qmpCommand) + "\n";
      this.socket.write(commandStr);
    });
  }

  // 关闭连接
  disconnect() {
    if (this.socket) {
      this.socket.end();
    }
  }
}

module.exports = QMPClient;
