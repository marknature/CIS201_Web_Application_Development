const express = require("express");
const PowerUsage = require("../../models/power-usage.model");
const WaterUsage = require("../../models/water-usage.model");
const UtilityAlert = require("../../models/utility-alert.model");
const { buildCrudRouter } = require("../common/crud-router");

const router = express.Router();
const writeRoles = ["Admin", "Facilities Staff", "Operations Staff"];

router.use(
  "/power-usage",
  buildCrudRouter({
    Model: PowerUsage,
    resourceName: "power-usage-records",
    writeRoles,
    createDefaults: (req) => ({ recordedBy: req.user._id }),
    defaultSort: "usageDate",
  })
);

router.use(
  "/water-usage",
  buildCrudRouter({
    Model: WaterUsage,
    resourceName: "water-usage-records",
    writeRoles,
    createDefaults: (req) => ({ recordedBy: req.user._id }),
    defaultSort: "usageDate",
  })
);

router.use(
  "/alerts",
  buildCrudRouter({
    Model: UtilityAlert,
    resourceName: "utility-alerts",
    writeRoles,
    defaultSort: "detectedAt",
  })
);

module.exports = router;
