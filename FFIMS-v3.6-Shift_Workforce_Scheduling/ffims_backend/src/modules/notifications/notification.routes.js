const express = require("express");
const router = express.Router();
const notificationService = require("./notification.service");
const { authenticateToken } = require("../../middleware/auth.middleware");
const asyncHandler = require("../../utils/asyncHandler");

router.get(
  "/",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    res.status(200).json({ status: "success", data: notifications });
  })
);

router.patch(
  "/:id/read",
  authenticateToken,
  asyncHandler(async (req, res) => {
    await notificationService.markAsRead(req.params.id, req.user.id);
    res.status(200).json({ status: "success" });
  })
);

router.patch(
  "/read-all",
  authenticateToken,
  asyncHandler(async (req, res) => {
    await notificationService.markAllAsRead(req.user.id);
    res.status(200).json({ status: "success", message: "All notifications marked as read" });
  })
);

module.exports = router;
