const express = require("express");
const { authenticateToken } = require("../../middleware/auth.middleware");
const { authorizeRoles } = require("../../middleware/role.middleware");
const { sendSuccess } = require("../../utils/api-response");

const router = express.Router();

router.get(
  "/routes",
  authenticateToken,
  authorizeRoles("Admin"),
  (req, res) => {
    sendSuccess(res, {
      message: "Gateway routes retrieved successfully.",
      data: [
        "/auth",
        "/roles",
        "/users",
        "/fleet",
        "/assets",
        "/maintenance",
        "/fault-tickets",
        "/inventory",
        "/procurement",
        "/projects",
        "/facilities",
        "/utilities",
        "/compliance",
        "/shifts",
        "/bookings",
        "/billing",
        "/dashboards",
        "/reports",
        "/approvals",
        "/notifications",
        "/graphql",
      ],
    });
  }
);

module.exports = router;
