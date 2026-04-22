const AuditLog = require("../../models/audit-log.model");

class AuditService {
  /**
   * Log an administrative or state-changing action.
   */
  async log({ 
    userId, 
    moduleName, 
    actionType, 
    entityName, 
    entityId, 
    oldValues = null, 
    newValues = null, 
    message = "", 
    reqInfo = {} 
  }) {
    try {
      const log = new AuditLog({
        userId,
        moduleName,
        actionType,
        entityName,
        entityId,
        oldValues,
        newValues,
        message,
        ipAddress: reqInfo.ip || null,
        userAgent: reqInfo.userAgent || null,
      });
      await log.save();
      return log;
    } catch (error) {
      console.error("Audit log failure:", error);
      // Silent failure to avoid blocking
      return null;
    }
  }

  /**
   * Get logs for a specific entity or module.
   */
  async getLogs({ moduleName, entityId, limit = 100 }) {
    const filter = {};
    if (moduleName) filter.moduleName = moduleName;
    if (entityId) filter.entityId = entityId;

    return AuditLog.find(filter)
      .populate("userId", "firstName surname email role")
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = new AuditService();
