const express = require("express");
const ProcurementRequest = require("../../models/procurement-request.model");
const Supplier = require("../../models/supplier.model");
const { buildCrudRouter } = require("../common/crud-router");

const router = express.Router();
const writeRoles = ["Admin", "Operations Staff", "Facilities Staff"];

router.use(
  "/requests",
  buildCrudRouter({
    Model: ProcurementRequest,
    resourceName: "procurement-requests",
    writeRoles,
    createDefaults: (req) => ({ requestedBy: req.user._id }),
    defaultSort: "requestDate",
  })
);

router.use(
  "/suppliers",
  buildCrudRouter({
    Model: Supplier,
    resourceName: "suppliers",
    writeRoles,
    defaultSort: "supplierName",
  })
);

module.exports = router;
