const express = require("express");
const { authenticateToken } = require("../../middleware/auth.middleware");
const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/api-response");
const FaultTicket = require("../../models/fault-ticket.model");
const MaintenanceTask = require("../../models/maintenance-task.model");
const Vehicle = require("../../models/vehicle.model");
const PowerUsage = require("../../models/power-usage.model");
const WaterUsage = require("../../models/water-usage.model");

const router = express.Router();
router.use(authenticateToken);

router.get(
  "/fault-tickets",
  asyncHandler(async (req, res) => {
    const [total, open, resolved, overdue] = await Promise.all([
      FaultTicket.countDocuments({ isDeleted: false }),
      FaultTicket.countDocuments({ status: "open", isDeleted: false }),
      FaultTicket.countDocuments({ status: "resolved", isDeleted: false }),
      FaultTicket.countDocuments({ status: "overdue", isDeleted: false }),
    ]);

    sendSuccess(res, {
      message: "Fault ticket report retrieved successfully.",
      data: { total, open, resolved, overdue },
    });
  })
);

router.get(
  "/maintenance",
  asyncHandler(async (req, res) => {
    const [total, open, completed] = await Promise.all([
      MaintenanceTask.countDocuments(),
      MaintenanceTask.countDocuments({ status: "open" }),
      require("../../models/maintenance-history.model").countDocuments(),
    ]);

    sendSuccess(res, {
      message: "Maintenance report retrieved successfully.",
      data: { total, open, completed },
    });
  })
);

router.get(
  "/fleet",
  asyncHandler(async (req, res) => {
    const [vehicles, trips, activeVehicles] = await Promise.all([
      Vehicle.countDocuments(),
      require("../../models/trip.model").countDocuments(),
      Vehicle.countDocuments({ status: "available" }),
    ]);

    sendSuccess(res, {
      message: "Fleet report retrieved successfully.",
      data: { vehicles, trips, activeVehicles },
    });
  })
);

router.get(
  "/utilities",
  asyncHandler(async (req, res) => {
    const [powerRecords, waterRecords] = await Promise.all([
      PowerUsage.countDocuments(),
      WaterUsage.countDocuments(),
    ]);

    sendSuccess(res, {
      message: "Utilities report retrieved successfully.",
      data: { powerRecords, waterRecords },
    });
  })
);

module.exports = router;
