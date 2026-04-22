const express = require("express");
const { authenticateToken } = require("../../middleware/auth.middleware");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/api-response");
const Vehicle = require("../../models/vehicle.model");
const FaultTicket = require("../../models/fault-ticket.model");
const Facility = require("../../models/facility.model");
const UtilityAlert = require("../../models/utility-alert.model");
const MaintenanceTask = require("../../models/maintenance-task.model");

const router = express.Router();
router.use(authenticateToken);

router.get(
  "/overview",
  asyncHandler(async (req, res) => {
    const [vehicles, facilities, openTickets, openAlerts, openMaintenance] = await Promise.all([
      Vehicle.countDocuments(),
      Facility.countDocuments(),
      FaultTicket.countDocuments({ status: { $in: ["open", "assigned", "in_progress", "overdue"] } }),
      UtilityAlert.countDocuments({ status: "open" }),
      MaintenanceTask.countDocuments({ status: { $in: ["open", "in_progress"] } }),
    ]);

    sendSuccess(res, {
      message: "Dashboard overview retrieved successfully.",
      data: { vehicles, facilities, openTickets, openAlerts, openMaintenance },
    });
  })
);

router.get(
  "/fleet",
  asyncHandler(async (req, res) => {
    const [vehicles, trips, fuelRecords] = await Promise.all([
      Vehicle.countDocuments(),
      require("../../models/trip.model").countDocuments(),
      require("../../models/fuel-record.model").countDocuments(),
    ]);

    sendSuccess(res, {
      message: "Fleet dashboard retrieved successfully.",
      data: { vehicles, trips, fuelRecords },
    });
  })
);

router.get(
  "/facilities",
  asyncHandler(async (req, res) => {
    const [facilities, alerts, tickets] = await Promise.all([
      Facility.countDocuments(),
      UtilityAlert.countDocuments(),
      FaultTicket.countDocuments({ facilityId: { $ne: null } }),
    ]);

    sendSuccess(res, {
      message: "Facilities dashboard retrieved successfully.",
      data: { facilities, alerts, tickets },
    });
  })
);

module.exports = router;
