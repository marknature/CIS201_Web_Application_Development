const express = require("express");
const authController = require("./auth.controller");
const validate = require("../../middleware/validation.middleware");
const { authenticateToken } = require("../../middleware/auth.middleware");
const { authorizeRoles } = require("../../middleware/role.middleware");
const {
  validateChangePassword,
  validateLogin,
  validatePasswordResetRequest,
  validateRegistration,
  validateResetPassword,
  validateSelfRegister,
} = require("./auth.validation");

const router = express.Router();

router.post("/login", validate(validateLogin), authController.login);
router.post(
  "/register-open",
  validate(validateSelfRegister),
  authController.selfRegister
);
router.post(
  "/register",
  authenticateToken,
  authorizeRoles("system_administrator"),
  validate(validateRegistration),
  authController.register
);
router.get("/me", authenticateToken, authController.me);
router.post(
  "/change-password",
  authenticateToken,
  validate(validateChangePassword),
  authController.changePassword
);
router.post(
  "/request-password-reset",
  validate(validatePasswordResetRequest),
  authController.requestPasswordReset
);
router.post(
  "/reset-password",
  validate(validateResetPassword),
  authController.resetPassword
);

module.exports = router;
