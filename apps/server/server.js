const express = require("express");
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const QemuManager = require("./qemu-manager");

const qemuManager = new QemuManager({
  vmStoragePath: path.join(__dirname, "./vm-storage"),
});

// swagger
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require('./swagger.js')

const setupWebSockets = require('./services/webSocketService.js');

const app = express();
const server = http.createServer(app);
// const wss = new WebSocket.Server({ server });
const port = process.env.PORT || 3000;


app.use(cors());

// 中间件
app.use(bodyParser.json());
app.use(express.static("public"));

// 设置 Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 提供 swagger.json 端点
app.get("/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});


// websocket
setupWebSockets(server);



app.use('/', require('./routers/index.js'))
// 启动服务器
server.listen(port, "0.0.0.0", () => {
  console.log(`QEMU API server listening at http://localhost:${port}`);
});

// 优雅关闭
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  // 停止所有虚拟机
  console.log("listRunningVMs all VMs...",  qemuManager.listRunningVMs())
   qemuManager.listRunningVMs().forEach((vm) => {
    let vmName = JSON.parse(vm).name
    console.log("Stopping VM: ", vmName);
    qemuManager.stopVM(vmName);
  });
  process.exit(0);
});
