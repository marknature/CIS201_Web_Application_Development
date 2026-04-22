const express = require("express");
const Bill = require("../../models/bill.model");
const Payment = require("../../models/payment.model");
const { buildCrudRouter } = require("../common/crud-router");

const router = express.Router();
const writeRoles = ["Admin", "Operations Staff"];

router.use(
  "/bills",
  buildCrudRouter({
    Model: Bill,
    resourceName: "bills",
    writeRoles,
    createDefaults: (req) => ({ createdBy: req.user._id }),
    defaultSort: "billDate",
  })
);

router.use(
  "/payments",
  buildCrudRouter({
    Model: Payment,
    resourceName: "payments",
    writeRoles,
    createDefaults: (req) => ({ receivedBy: req.user._id }),
    defaultSort: "paymentDate",
  })
);

module.exports = router;
