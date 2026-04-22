const express = require("express");
const { authenticateToken } = require("../../middleware/auth.middleware");
const { authorizeRoles } = require("../../middleware/role.middleware");
const validate = require("../../middleware/validation.middleware");
const { validateRegistration, validateStatusUpdate, validateRoleUpdate, validateProfileUpdate } = require("../auth/auth.validation");
const userController = require("./user.controller");

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "system_administrator"),
  validate(validateRegistration),
  userController.registerUser
);

router.patch(
  "/me",
  authenticateToken,
  validate(validateProfileUpdate),
  userController.updateProfile
);

router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRoles("admin", "system_administrator"),
  validate(validateStatusUpdate),
  userController.updateStatus
);

router.patch(
  "/:id/role",
  authenticateToken,
  authorizeRoles("admin", "system_administrator"),
  validate(validateRoleUpdate),
  userController.updateRole
);

module.exports = router;
