const express = require("express");
const authRoutes = require("./authRoutes");
const faultRoutes = require("./faultRoutes");
const ticketRoutes = require("./ticketRoutes");
const assetRoutes = require("./assetRoutes");
const notificationRoutes = require("./notificationRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const integrationRoutes = require("./integrationRoutes");
const userRoutes = require("./userRoutes");
const reportRoutes = require("./reportRoutes");

const router = express.Router();

router.use("/integration", integrationRoutes);
router.use("/auth", authRoutes);
router.use("/faults", faultRoutes);
router.use("/tickets", ticketRoutes);
router.use("/assets", assetRoutes);
router.use("/notifications", notificationRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/users", userRoutes);
router.use("/reports", reportRoutes);

module.exports = router;
