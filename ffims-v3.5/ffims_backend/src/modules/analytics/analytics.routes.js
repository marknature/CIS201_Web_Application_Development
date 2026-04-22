const express = require("express");
const router = express.Router();
const analyticsController = require("./analytics.controller");
const { authenticateToken } = require("../../middleware/auth.middleware");
const { authorizeRoles } = require("../../middleware/role.middleware");

router.get(
  "/faults",
  authenticateToken,
  authorizeRoles("admin", "system_administrator"),
  analyticsController.getFaultAnalytics
);

module.exports = router;
