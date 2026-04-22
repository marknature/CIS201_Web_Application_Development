const mongoose = require("mongoose");

const requiredString = (value) => typeof value === "string" && value.trim().length > 0;
const optionalString = (value) => value === undefined || typeof value === "string";
const optionalObjectId = (value) =>
  value === undefined || value === null || mongoose.Types.ObjectId.isValid(value);

const validateCreatePowerUsage = (body) => {
  const errors = [];
  if (!optionalObjectId(body.buildingId) || body.buildingId === undefined || body.buildingId === null) {
    errors.push("buildingId is required and must be a valid id.");
  }
  if (!body.usageDate || Number.isNaN(Date.parse(body.usageDate))) errors.push("usageDate is required.");
  if (body.kilowattHours !== undefined && (!Number.isFinite(body.kilowattHours) || body.kilowattHours < 0)) {
    errors.push("kilowattHours must be a non-negative number.");
  }
  if (!optionalString(body.notes)) errors.push("notes must be a string.");
  return errors;
};

const validateUpdatePowerUsage = (body) => {
  const errors = validateCreatePowerUsage(body).filter(
    (error) =>
      error !== "buildingId is required and must be a valid id." &&
      error !== "usageDate is required."
  );

  if (Object.keys(body).length === 0) {
    errors.push("At least one field is required.");
  }

  return errors;
};

const validateCreateWaterUsage = (body) => {
  const errors = [];
  if (!optionalObjectId(body.buildingId) || body.buildingId === undefined || body.buildingId === null) {
    errors.push("buildingId is required and must be a valid id.");
  }
  if (!body.usageDate || Number.isNaN(Date.parse(body.usageDate))) errors.push("usageDate is required.");
  if (body.volumeLitres !== undefined && (!Number.isFinite(body.volumeLitres) || body.volumeLitres < 0)) {
    errors.push("volumeLitres must be a non-negative number.");
  }
  if (!optionalString(body.notes)) errors.push("notes must be a string.");
  return errors;
};

const validateUpdateWaterUsage = (body) => {
  const errors = validateCreateWaterUsage(body).filter(
    (error) =>
      error !== "buildingId is required and must be a valid id." &&
      error !== "usageDate is required."
  );

  if (Object.keys(body).length === 0) {
    errors.push("At least one field is required.");
  }

  return errors;
};

const validateCreateUtilityAlert = (body) => {
  const errors = [];
  if (!requiredString(body.alertType)) errors.push("alertType is required.");
  if (!requiredString(body.message)) errors.push("message is required.");
  if (body.severity !== undefined && !["low", "medium", "high", "critical"].includes(body.severity)) {
    errors.push("severity must be low, medium, high, or critical.");
  }
  if (body.status !== undefined && !["open", "monitoring", "resolved"].includes(body.status)) {
    errors.push("status must be open, monitoring, or resolved.");
  }
  if (!optionalObjectId(body.facilityId)) errors.push("facilityId must be a valid id.");
  if (!optionalObjectId(body.assignedTo)) errors.push("assignedTo must be a valid id.");
  return errors;
};

const validateUpdateUtilityAlert = (body) => {
  const errors = validateCreateUtilityAlert(body).filter(
    (error) => error !== "alertType is required." && error !== "message is required."
  );

  if (Object.keys(body).length === 0) {
    errors.push("At least one field is required.");
  }

  return errors;
};

const validateCreateAlertTicket = (body) => {
  const errors = [];
  if (body.reportedBy !== undefined && !optionalObjectId(body.reportedBy)) {
    errors.push("reportedBy must be a valid id.");
  }
  if (body.dueDate !== undefined && Number.isNaN(Date.parse(body.dueDate))) {
    errors.push("dueDate must be a valid date.");
  }
  return errors;
};

module.exports = {
  validateCreateAlertTicket,
  validateCreatePowerUsage,
  validateCreateUtilityAlert,
  validateCreateWaterUsage,
  validateUpdatePowerUsage,
  validateUpdateUtilityAlert,
  validateUpdateWaterUsage,
};
