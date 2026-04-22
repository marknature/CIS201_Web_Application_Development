const express = require("express");
const { authenticateInternalRequest } = require("../middleware/internal-auth.middleware");
const { sendSuccess } = require("../utils/api-response");
const asyncHandler = require("../utils/asyncHandler");
const { verifyAccessToken } = require("../utils/token");
const User = require("../models/user.model");
const Role = require("../models/role.model");
const { createAuditLog } = require("../utils/audit");
const FaultTicket = require("../models/fault-ticket.model");
const Notification = require("../models/notification.model");

const router = express.Router();
router.use(authenticateInternalRequest);

router.post(
  "/auth/validate-token",
  asyncHandler(async (req, res) => {
    const payload = verifyAccessToken(req.body.token);
    const user = await User.findById(payload.sub);

    sendSuccess(res, {
      message: "Token validated successfully.",
      data: {
        valid: Boolean(user && user.isActive),
        user: user ? user.toSafeObject() : null,
      },
    });
  })
);

router.post(
  "/gateway/token-introspection",
  asyncHandler(async (req, res) => {
    const payload = verifyAccessToken(req.body.token);
    sendSuccess(res, {
      message: "Gateway token introspection completed successfully.",
      data: payload,
    });
  })
);

router.post(
  "/gateway/security/rate-limit-check",
  asyncHandler(async (req, res) => {
    sendSuccess(res, {
      message: "Rate limit check completed successfully.",
      data: {
        allowed: true,
        bucket: req.body.bucket || "default",
      },
    });
  })
);

router.get(
  "/auth/users/:userId/permissions",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);
    const role = user ? await Role.findOne({ name: user.role }) : null;

    sendSuccess(res, {
      message: "Permissions retrieved successfully.",
      data: {
        userId: req.params.userId,
        role: user?.role || null,
        permissions: role?.permissions || [],
      },
    });
  })
);

router.post(
  "/auth/audit-events",
  asyncHandler(async (req, res) => {
    await createAuditLog({
      userId: req.body.userId || null,
      moduleName: req.body.moduleName || "internal",
      action: req.body.action || "internal_event",
      entityName: req.body.entityName || null,
      entityId: req.body.entityId || null,
      oldValues: req.body.oldValues || null,
      newValues: req.body.newValues || null,
      req,
    });

    sendSuccess(res, {
      statusCode: 201,
      message: "Audit event recorded successfully.",
      data: null,
    });
  })
);

router.post(
  "/fault-tickets/escalations/run",
  asyncHandler(async (req, res) => {
    const result = await FaultTicket.updateMany(
      {
        dueDate: { $lt: new Date() },
        status: { $nin: ["resolved", "closed", "cancelled", "overdue"] },
        isDeleted: false,
      },
      { status: "overdue" }
    );

    sendSuccess(res, {
      message: "Ticket escalations processed successfully.",
      data: { modifiedCount: result.modifiedCount || 0 },
    });
  })
);

const createInternalTicket = async (body) =>
  FaultTicket.create({
    ticketNumber: body.ticketNumber || `INT-${Date.now()}`,
    title: body.title,
    description: body.description || "",
    ticketType: body.ticketType || "fault",
    priority: body.priority || "medium",
    status: "open",
    reportedBy: body.reportedBy,
    facilityId: body.facilityId || null,
    assetId: body.assetId || null,
    vehicleId: body.vehicleId || null,
    dueDate: body.dueDate || null,
  });

router.post(
  "/fault-tickets/from-facility-alert",
  asyncHandler(async (req, res) => {
    const ticket = await createInternalTicket(req.body);
    sendSuccess(res, {
      statusCode: 201,
      message: "Facility alert ticket created successfully.",
      data: ticket,
    });
  })
);

router.post(
  "/fault-tickets/from-maintenance-failure",
  asyncHandler(async (req, res) => {
    const ticket = await createInternalTicket(req.body);
    sendSuccess(res, {
      statusCode: 201,
      message: "Maintenance failure ticket created successfully.",
      data: ticket,
    });
  })
);

router.post(
  "/fault-tickets/:ticketId/notify",
  asyncHandler(async (req, res) => {
    const notification = await Notification.create({
      recipientId: req.body.recipientId,
      title: req.body.title || "Ticket Notification",
      message: req.body.message || `Update on ticket ${req.params.ticketId}`,
      notificationType: "ticket",
      entityType: "FaultTicket",
      entityId: req.params.ticketId,
      status: "unread",
    });

    sendSuccess(res, {
      statusCode: 201,
      message: "Ticket notification created successfully.",
      data: notification,
    });
  })
);

router.post(
  "/facilities/:facilityId/trigger-ticket",
  asyncHandler(async (req, res) => {
    const ticket = await createInternalTicket({
      ...req.body,
      facilityId: req.params.facilityId,
    });

    sendSuccess(res, {
      statusCode: 201,
      message: "Facility ticket triggered successfully.",
      data: ticket,
    });
  })
);

router.get(
  "/reports/summary",
  asyncHandler(async (req, res) => {
    const [tickets, users, notifications] = await Promise.all([
      FaultTicket.countDocuments({ isDeleted: false }),
      User.countDocuments(),
      Notification.countDocuments(),
    ]);

    sendSuccess(res, {
      message: "Internal report summary retrieved successfully.",
      data: { tickets, users, notifications },
    });
  })
);

module.exports = router;
