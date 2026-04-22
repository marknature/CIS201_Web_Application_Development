const express = require("express");
const { authenticateToken } = require("../../middleware/auth.middleware");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/api-response");
const FaultTicket = require("../../models/fault-ticket.model");
const Vehicle = require("../../models/vehicle.model");
const Facility = require("../../models/facility.model");
const Notification = require("../../models/notification.model");

const router = express.Router();
router.use(authenticateToken);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const resources = req.body.resources || {};
    const data = {};

    if (resources.faultTickets) {
      data.faultTickets = await FaultTicket.find({})
        .sort({ createdAt: -1 })
        .limit(resources.faultTickets.limit || 10);
    }

    if (resources.vehicles) {
      data.vehicles = await Vehicle.find({})
        .sort({ createdAt: -1 })
        .limit(resources.vehicles.limit || 10);
    }

    if (resources.facilities) {
      data.facilities = await Facility.find({})
        .sort({ createdAt: -1 })
        .limit(resources.facilities.limit || 10);
    }

    if (resources.notifications) {
      data.notifications = await Notification.find({ recipientId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(resources.notifications.limit || 10);
    }

    sendSuccess(res, {
      message: "Unified data query completed successfully.",
      data,
    });
  })
);

module.exports = router;
