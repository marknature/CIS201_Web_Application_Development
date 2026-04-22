const express = require("express");
const { body } = require("express-validator");
const { assignableUsers, register, login, me } = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { PUBLIC_REGISTRATION_ROLES } = require("../utils/registrationRoles");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("role")
      .optional()
      .customSanitizer((value) => String(value).trim().toLowerCase())
      .isIn(PUBLIC_REGISTRATION_ROLES)
      .withMessage("Public registration only supports user accounts")
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  validateRequest,
  login
);

router.get("/me", authenticate, me);
router.get("/assignable-users", authenticate, authorize("admin", "technician"), assignableUsers);

module.exports = router;
