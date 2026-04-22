const express = require("express");
const Booking = require("../../models/booking.model");
const BookingApproval = require("../../models/booking-approval.model");
const { buildCrudRouter } = require("../common/crud-router");

const router = express.Router();
const writeRoles = ["Admin", "Operations Staff", "Facilities Staff"];

router.use(
  "/approvals",
  buildCrudRouter({
    Model: BookingApproval,
    resourceName: "booking-approvals",
    writeRoles,
    createDefaults: (req) => ({ approverId: req.user._id, actionDate: new Date() }),
    defaultSort: "actionDate",
  })
);

router.use(
  "/",
  buildCrudRouter({
    Model: Booking,
    resourceName: "bookings",
    writeRoles,
    createDefaults: (req) => ({ requestedBy: req.user._id }),
    defaultSort: "bookingDate",
  })
);

module.exports = router;
