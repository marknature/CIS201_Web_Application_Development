const express = require("express");
const { getSystemReports } = require("../controllers/reportController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);
router.get("/", authorizeRoles("admin"), getSystemReports);

module.exports = router;
