const AuditLog = require("../../models/audit-log.model");

const toResponse = (a) => ({
  id: a._id,
  action: a.actionType,
  module: a.moduleName,
  severity: a.severity || "info",
  details: a.newValues ? JSON.stringify(a.newValues) : a.oldValues ? JSON.stringify(a.oldValues) : "",
  timestamp: a.createdAt,
  user: a.userId?.firstName ? `${a.userId.firstName} ${a.userId.surname || ""}`.trim() : "System",
  role: a.userId?.role || "System",
  entityId: a.entityId,
  entityName: a.entityName,
  oldValues: a.oldValues,
  newValues: a.newValues,
  ipAddress: a.ipAddress,
});

const listAuditLogs = async ({ search, module, severity, limit = 100 } = {}) => {
  const filter = {};
  if (module && module !== "all") filter.moduleName = new RegExp(`^${module}$`, "i");
  // severity is not in the model — we handle it via actionType mapping
  const docs = await AuditLog.find(filter)
    .populate({ path: "userId", select: "firstName surname role" })
    .sort({ createdAt: -1 })
    .limit(Number(limit));

  let results = docs.map(toResponse);

  if (search) {
    const s = search.toLowerCase();
    results = results.filter(
      (r) =>
        r.action?.toLowerCase().includes(s) ||
        r.details?.toLowerCase().includes(s) ||
        r.user?.toLowerCase().includes(s) ||
        r.module?.toLowerCase().includes(s)
    );
  }

  if (severity && severity !== "all") {
    // Map actionTypes to severity levels
    const criticalActions = ["DELETE", "DEACTIVATE", "REJECT", "BLOCK"];
    const warningActions = ["UPDATE", "UPDATE_STATUS", "ASSIGN_VEHICLE", "UNASSIGN_VEHICLE", "DEDUCT", "ADD_PARTS"];
    results = results.filter((r) => {
      if (severity === "critical") return criticalActions.some((a) => r.action?.includes(a));
      if (severity === "warning") return warningActions.some((a) => r.action?.includes(a));
      if (severity === "info") return !criticalActions.some((a) => r.action?.includes(a)) && !warningActions.some((a) => r.action?.includes(a));
      return true;
    });
  }

  return results;
};

module.exports = { listAuditLogs };
