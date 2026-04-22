const express = require("express");
const validate = require("../../middleware/validation.middleware");
const { authenticateToken } = require("../../middleware/auth.middleware");
const { isUser, isAdmin } = require("./fault-rbac.middleware");
const controller = require("./fault-ticketing.controller");
const lookupController = require("../lookups/lookup.controller");
const { validateCreateFault } = require("./fault-ticketing.validation");

const router = express.Router();

router.post("/", authenticateToken, isUser, validate(validateCreateFault), controller.createFault);
router.get("/stats", authenticateToken, isUser, controller.getStats);
router.get("/recent", authenticateToken, isUser, controller.getRecentFaults);

router.get("/analytics", authenticateToken, isAdmin, controller.getStats); // Expanded later
router.get("/users", authenticateToken, isAdmin, lookupController.listUsers);

module.exports = router;
