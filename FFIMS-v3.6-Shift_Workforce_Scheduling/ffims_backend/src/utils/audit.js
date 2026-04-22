const AuditLog = require("../models/audit-log.model");

const createAuditLog = async ({
  userId = null,
  moduleName = "authentication",
  action,
  actionType,
  entityName = null,
  entityId = null,
  oldValues = null,
  newValues = null,
  req = null,
}) => {
  await AuditLog.create({
    userId,
    moduleName,
    actionType: actionType || action || "unknown",
    entityName,
    entityId,
    oldValues,
    newValues,
    ipAddress: req?.ip || req?.headers?.["x-forwarded-for"] || null,
    userAgent: typeof req?.get === "function" ? req.get("user-agent") : req?.headers?.["user-agent"] || null,
  });
};

module.exports = { createAuditLog };
