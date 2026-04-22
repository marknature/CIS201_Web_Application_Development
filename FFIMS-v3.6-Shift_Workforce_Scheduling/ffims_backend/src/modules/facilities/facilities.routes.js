const express = require("express");
const Facility = require("../../models/facility.model");
const FacilityHealthRecord = require("../../models/facility-health-record.model");
const FacilityAssetCondition = require("../../models/facility-asset-condition.model");
const { buildCrudRouter } = require("../common/crud-router");

const router = express.Router();
const writeRoles = ["Admin", "Facilities Staff", "Operations Staff"];

router.use(
  "/health-records",
  buildCrudRouter({
    Model: FacilityHealthRecord,
    resourceName: "facility-health-records",
    writeRoles,
    defaultSort: "createdAt",
  })
);

router.use(
  "/conditions",
  buildCrudRouter({
    Model: FacilityAssetCondition,
    resourceName: "facility-conditions",
    writeRoles,
    defaultSort: "createdAt",
  })
);

router.use(
  "/",
  buildCrudRouter({
    Model: Facility,
    resourceName: "facilities",
    writeRoles,
    defaultSort: "facilityName",
  })
);

module.exports = router;
