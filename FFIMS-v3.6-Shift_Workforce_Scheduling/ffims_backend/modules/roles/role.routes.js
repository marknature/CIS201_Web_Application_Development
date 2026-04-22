const express = require("express");
const { authenticateToken } = require("../../middleware/auth.middleware");
const { authorizeRoles } = require("../../middleware/role.middleware");
const roleController = require("./role.controller");

const router = express.Router();

router.get("/", authenticateToken, authorizeRoles("Admin"), roleController.listRoles);

module.exports = router;
