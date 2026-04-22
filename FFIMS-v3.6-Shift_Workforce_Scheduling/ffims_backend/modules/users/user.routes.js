const express = require("express");
const { authenticateToken } = require("../../middleware/auth.middleware");
const { authorizeRoles } = require("../../middleware/role.middleware");
const validate = require("../../middleware/validation.middleware");
const { validateRegistration, validateStatusUpdate, validateRoleUpdate, validateProfileUpdate } = require("../auth/auth.validation");
const userController = require("./user.controller");

const router = express.Router();

router.get("/", authenticateToken, authorizeRoles("Admin"), userController.listUsers);
router.get("/:id", authenticateToken, authorizeRoles("Admin"), userController.getUser);
router.post(
  "/",
  authenticateToken,
  authorizeRoles("Admin"),
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
  authorizeRoles("Admin"),
  validate(validateStatusUpdate),
  userController.updateStatus
);

router.patch(
  "/:id/role",
  authenticateToken,
  authorizeRoles("Admin"),
  validate(validateRoleUpdate),
  userController.updateRole
);

module.exports = router;
