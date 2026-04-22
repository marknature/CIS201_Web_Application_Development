const express = require("express");
const ComplianceRecord = require("../../models/compliance-record.model");
const ComplianceCertificate = require("../../models/compliance-certificate.model");
const { buildCrudRouter } = require("../common/crud-router");

const router = express.Router();
const writeRoles = ["Admin", "Facilities Staff", "Operations Staff"];

router.use(
  "/records",
  buildCrudRouter({
    Model: ComplianceRecord,
    resourceName: "compliance-records",
    writeRoles,
    createDefaults: (req) => ({ createdBy: req.user._id }),
    defaultSort: "createdAt",
  })
);

router.use(
  "/certificates",
  buildCrudRouter({
    Model: ComplianceCertificate,
    resourceName: "compliance-certificates",
    writeRoles,
    defaultSort: "createdAt",
  })
);

module.exports = router;
