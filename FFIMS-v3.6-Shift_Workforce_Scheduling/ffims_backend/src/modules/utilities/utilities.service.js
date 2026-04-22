const mongoose = require("mongoose");
const ApiError = require("../../utils/apiError");
const { createAuditLog } = require("../../utils/audit");
const PowerUsage = require("../../models/power-usage.model");
const WaterUsage = require("../../models/water-usage.model");
const UtilityAlert = require("../../models/utility-alert.model");
const faultTicketService = require("../fault-tickets/fault-ticket.service");

const assertValidObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(400, `${fieldName} must be a valid id.`);
  }
};

const toPowerUsageResponse = (record) => ({
  id: record._id,
  buildingId: record.buildingId,
  facilityId: record.facilityId,
  energySourceId: record.energySourceId,
  usageDate: record.usageDate,
  kilowattHours: record.kilowattHours,
  peakDemand: record.peakDemand,
  costAmount: record.costAmount,
  recordedBy: record.recordedBy,
  notes: record.notes,
  createdAt: record.createdAt,
});

const toWaterUsageResponse = (record) => ({
  id: record._id,
  buildingId: record.buildingId,
  facilityId: record.facilityId,
  tankId: record.tankId,
  usageDate: record.usageDate,
  volumeLitres: record.volumeLitres,
  costAmount: record.costAmount,
  sourceType: record.sourceType,
  recordedBy: record.recordedBy,
  notes: record.notes,
  createdAt: record.createdAt,
});

const toUtilityAlertResponse = (alert) => ({
  id: alert._id,
  buildingId: alert.buildingId,
  facilityId: alert.facilityId,
  alertType: alert.alertType,
  alertCategory: alert.alertCategory,
  severity: alert.severity,
  message: alert.message,
  status: alert.status,
  detectedAt: alert.detectedAt,
  resolvedAt: alert.resolvedAt,
  assignedTo: alert.assignedTo,
  linkedFaultTicketId: alert.linkedFaultTicketId,
});

const getPowerUsageById = async (id) => {
  assertValidObjectId(id, "id");
  const record = await PowerUsage.findById(id);
  if (!record) {
    throw new ApiError(404, "Power usage record not found.");
  }
  return toPowerUsageResponse(record);
};

const listPowerUsage = async (filters) => {
  const query = {};
  if (filters.facilityId) {
    assertValidObjectId(filters.facilityId, "facilityId");
    query.facilityId = filters.facilityId;
  }
  const records = await PowerUsage.find(query).sort({ usageDate: -1 });
  return records.map(toPowerUsageResponse);
};

const createPowerUsage = async (payload, currentUser, req) => {
  const record = await PowerUsage.create({
    ...payload,
    recordedBy: payload.recordedBy || currentUser._id,
  });

  await createAuditLog({
    userId: currentUser._id,
    moduleName: "utilities",
    action: "power_usage_create",
    entityName: "powerusage",
    entityId: record._id,
    newValues: { kilowattHours: record.kilowattHours },
    req,
  });

  return toPowerUsageResponse(record);
};

const updatePowerUsage = async (id, payload, currentUser, req) => {
  assertValidObjectId(id, "id");
  const record = await PowerUsage.findById(id);
  if (!record) {
    throw new ApiError(404, "Power usage record not found.");
  }

  Object.assign(record, payload);
  await record.save();

  await createAuditLog({
    userId: currentUser._id,
    moduleName: "utilities",
    action: "power_usage_update",
    entityName: "powerusage",
    entityId: record._id,
    newValues: { kilowattHours: record.kilowattHours, costAmount: record.costAmount },
    req,
  });

  return toPowerUsageResponse(record);
};

const deletePowerUsage = async (id) => {
  assertValidObjectId(id, "id");
  const record = await PowerUsage.findByIdAndDelete(id);
  if (!record) {
    throw new ApiError(404, "Power usage record not found.");
  }
};

const getPowerUsageSummary = async () => {
  const [summary] = await PowerUsage.aggregate([
    {
      $group: {
        _id: null,
        totalKilowattHours: { $sum: "$kilowattHours" },
        totalCostAmount: { $sum: "$costAmount" },
        peakDemand: { $max: "$peakDemand" },
        recordCount: { $sum: 1 },
      },
    },
  ]);

  return summary || {
    totalKilowattHours: 0,
    totalCostAmount: 0,
    peakDemand: 0,
    recordCount: 0,
  };
};

const getWaterUsageById = async (id) => {
  assertValidObjectId(id, "id");
  const record = await WaterUsage.findById(id);
  if (!record) {
    throw new ApiError(404, "Water usage record not found.");
  }
  return toWaterUsageResponse(record);
};

const listWaterUsage = async (filters) => {
  const query = {};
  if (filters.facilityId) {
    assertValidObjectId(filters.facilityId, "facilityId");
    query.facilityId = filters.facilityId;
  }
  const records = await WaterUsage.find(query).sort({ usageDate: -1 });
  return records.map(toWaterUsageResponse);
};

const createWaterUsage = async (payload, currentUser, req) => {
  const record = await WaterUsage.create({
    ...payload,
    recordedBy: payload.recordedBy || currentUser._id,
  });

  await createAuditLog({
    userId: currentUser._id,
    moduleName: "utilities",
    action: "water_usage_create",
    entityName: "waterusage",
    entityId: record._id,
    newValues: { volumeLitres: record.volumeLitres },
    req,
  });

  return toWaterUsageResponse(record);
};

const updateWaterUsage = async (id, payload, currentUser, req) => {
  assertValidObjectId(id, "id");
  const record = await WaterUsage.findById(id);
  if (!record) {
    throw new ApiError(404, "Water usage record not found.");
  }

  Object.assign(record, payload);
  await record.save();

  await createAuditLog({
    userId: currentUser._id,
    moduleName: "utilities",
    action: "water_usage_update",
    entityName: "waterusage",
    entityId: record._id,
    newValues: { volumeLitres: record.volumeLitres, costAmount: record.costAmount },
    req,
  });

  return toWaterUsageResponse(record);
};

const deleteWaterUsage = async (id) => {
  assertValidObjectId(id, "id");
  const record = await WaterUsage.findByIdAndDelete(id);
  if (!record) {
    throw new ApiError(404, "Water usage record not found.");
  }
};

const getWaterUsageSummary = async () => {
  const [summary] = await WaterUsage.aggregate([
    {
      $group: {
        _id: null,
        totalVolumeLitres: { $sum: "$volumeLitres" },
        totalCostAmount: { $sum: "$costAmount" },
        recordCount: { $sum: 1 },
      },
    },
  ]);

  return summary || {
    totalVolumeLitres: 0,
    totalCostAmount: 0,
    recordCount: 0,
  };
};

const getUtilityAlertById = async (id) => {
  assertValidObjectId(id, "id");
  const alert = await UtilityAlert.findById(id);
  if (!alert) {
    throw new ApiError(404, "Utility alert not found.");
  }
  return toUtilityAlertResponse(alert);
};

const listUtilityAlerts = async (filters) => {
  const query = {};
  if (filters.facilityId) {
    assertValidObjectId(filters.facilityId, "facilityId");
    query.facilityId = filters.facilityId;
  }
  if (filters.status) query.status = filters.status;
  const alerts = await UtilityAlert.find(query).sort({ detectedAt: -1 });
  return alerts.map(toUtilityAlertResponse);
};

const createUtilityAlert = async (payload, currentUser, req) => {
  const alert = await UtilityAlert.create({
    ...payload,
  });

  await createAuditLog({
    userId: currentUser._id,
    moduleName: "utilities",
    action: "utility_alert_create",
    entityName: "utilityalerts",
    entityId: alert._id,
    newValues: { alertType: alert.alertType, severity: alert.severity },
    req,
  });

  return toUtilityAlertResponse(alert);
};

const updateUtilityAlert = async (id, payload, currentUser, req) => {
  assertValidObjectId(id, "id");
  const alert = await UtilityAlert.findById(id);
  if (!alert) {
    throw new ApiError(404, "Utility alert not found.");
  }

  Object.assign(alert, payload);
  await alert.save();

  await createAuditLog({
    userId: currentUser._id,
    moduleName: "utilities",
    action: "utility_alert_update",
    entityName: "utilityalerts",
    entityId: alert._id,
    newValues: { status: alert.status, severity: alert.severity },
    req,
  });

  return toUtilityAlertResponse(alert);
};

const deleteUtilityAlert = async (id) => {
  assertValidObjectId(id, "id");
  const alert = await UtilityAlert.findByIdAndDelete(id);
  if (!alert) {
    throw new ApiError(404, "Utility alert not found.");
  }
};

const getUtilityAlertSummary = async () => {
  const [openAlerts, monitoringAlerts, resolvedAlerts, criticalAlerts] = await Promise.all([
    UtilityAlert.countDocuments({ status: "open" }),
    UtilityAlert.countDocuments({ status: "monitoring" }),
    UtilityAlert.countDocuments({ status: "resolved" }),
    UtilityAlert.countDocuments({ severity: "critical" }),
  ]);

  return {
    openAlerts,
    monitoringAlerts,
    resolvedAlerts,
    criticalAlerts,
  };
};

const createFaultTicketFromAlert = async (alertId, payload, currentUser, req) => {
  assertValidObjectId(alertId, "alertId");
  const alert = await UtilityAlert.findById(alertId);

  if (!alert) {
    throw new ApiError(404, "Utility alert not found.");
  }

  if (alert.linkedFaultTicketId) {
    throw new ApiError(409, "This utility alert is already linked to a fault ticket.");
  }

  const ticket = await faultTicketService.createFaultTicket(
    {
      title: payload.title || `${alert.alertType} alert`,
      description: payload.description || alert.message,
      priority: payload.priority || (alert.severity === "critical" ? "critical" : "high"),
      facilityId: payload.facilityId || alert.facilityId || null,
      reportedBy: payload.reportedBy || currentUser._id,
      dueDate: payload.dueDate || null,
      ticketType: "utility_alert",
    },
    currentUser,
    req
  );

  alert.linkedFaultTicketId = ticket.id;
  alert.status = alert.status === "resolved" ? alert.status : "monitoring";
  await alert.save();

  await createAuditLog({
    userId: currentUser._id,
    moduleName: "utilities",
    action: "utility_alert_ticket_link",
    entityName: "utilityalerts",
    entityId: alert._id,
    newValues: { linkedFaultTicketId: ticket.id },
    req,
  });

  return {
    alert: toUtilityAlertResponse(alert),
    ticket,
  };
};

module.exports = {
  createFaultTicketFromAlert,
  createPowerUsage,
  createUtilityAlert,
  createWaterUsage,
  deletePowerUsage,
  deleteUtilityAlert,
  deleteWaterUsage,
  getPowerUsageById,
  getPowerUsageSummary,
  getUtilityAlertById,
  getUtilityAlertSummary,
  getWaterUsageById,
  getWaterUsageSummary,
  listPowerUsage,
  listUtilityAlerts,
  listWaterUsage,
  updatePowerUsage,
  updateUtilityAlert,
  updateWaterUsage,
};
