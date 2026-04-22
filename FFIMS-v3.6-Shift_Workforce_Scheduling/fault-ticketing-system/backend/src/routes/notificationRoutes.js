const express = require("express");
const { getNotifications, markAsRead } = require("../controllers/notificationController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);
router.get("/", getNotifications);
router.put("/:id/read", markAsRead);

module.exports = router;
