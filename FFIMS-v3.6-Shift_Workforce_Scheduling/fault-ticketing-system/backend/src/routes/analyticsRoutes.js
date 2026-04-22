const express = require("express");
const { getTicketAnalytics } = require("../controllers/analyticsController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", authenticate, authorizeRoles("admin"), getTicketAnalytics);

module.exports = router;
