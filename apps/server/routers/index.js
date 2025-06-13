// routes/index.js
const express = require("express");
const vmRoutes = require("./vms.js");
const isoRoutes = require("./isos.js");
const fileTransferRoutes = require("./fileTransfer");
const systemMonitorRoutes = require("./systemMonitor");
const imageRoutes = require("./imageRoute");
const readMeRoute = require("./readmeRoutes");

const router = express.Router();

// 挂载虚拟机路由
router.use("/api", vmRoutes);
router.use("/api", isoRoutes);
router.use("/api", fileTransferRoutes);
router.use("/api", systemMonitorRoutes);
router.use("/api/images", imageRoutes);
router.use("/api/readme", readMeRoute);

// 可以添加更多路由...

module.exports = router;
