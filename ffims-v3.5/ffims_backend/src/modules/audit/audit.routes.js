const express = require("express");
const router = express.Router();
const auditService = require("./audit.service");
const { authenticateToken } = require("../../middleware/auth.middleware");
const { authorizeRoles } = require("../../middleware/role.middleware");
const asyncHandler = require("../../utils/asyncHandler");

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "system_administrator"),
  asyncHandler(async (req, res) => {
    const logs = await auditService.getLogs(req.query);
    res.status(200).json({ status: "success", data: logs });
  })
);

module.exports = router;
