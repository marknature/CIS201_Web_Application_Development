const express = require("express");
const Vehicle = require("../../models/vehicle.model");
const Trip = require("../../models/trip.model");
const FuelRecord = require("../../models/fuel-record.model");
const { buildCrudRouter } = require("../common/crud-router");

const router = express.Router();
const staffRoles = ["Admin", "Fleet Staff", "Operations Staff"];

router.use(
  "/vehicles",
  buildCrudRouter({
    Model: Vehicle,
    resourceName: "vehicles",
    writeRoles: staffRoles,
    createDefaults: (req) => ({ createdBy: req.user._id }),
  })
);

router.use(
  "/trips",
  buildCrudRouter({
    Model: Trip,
    resourceName: "trips",
    writeRoles: staffRoles,
    createDefaults: (req) => ({ requestedBy: req.user._id }),
    defaultSort: "tripDate",
  })
);

router.use(
  "/fuel-records",
  buildCrudRouter({
    Model: FuelRecord,
    resourceName: "fuel-records",
    writeRoles: staffRoles,
    createDefaults: (req) => ({ recordedBy: req.user._id }),
    defaultSort: "fuelDate",
  })
);

module.exports = router;
