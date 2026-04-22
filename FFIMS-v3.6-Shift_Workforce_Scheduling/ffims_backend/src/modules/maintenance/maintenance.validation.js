const mongoose = require("mongoose");

const requiredString = (value) => typeof value === "string" && value.trim().length > 0;
const optionalString = (value) => value === undefined || typeof value === "string";
const optionalObjectId = (value) =>
  value === undefined || value === null || mongoose.Types.ObjectId.isValid(value);

const validateCreateMaintenanceTask = (body) => {
  const errors = [];

  if (!requiredString(body.taskName)) errors.push("taskName is required.");
  if (!optionalString(body.description)) errors.push("description must be a string.");
  if (!optionalObjectId(body.assetId) || body.assetId === undefined || body.assetId === null) {
    errors.push("assetId is required and must be a valid id.");
  }

  const idFields = ["facilityId", "vehicleId", "workOrderId", "faultTicketId", "projectTaskId", "assignedTo", "supervisorId"];
  for (const field of idFields) {
    if (!optionalObjectId(body[field])) {
      errors.push(`${field} must be a valid id.`);
    }
  }

  if (body.priorityLevel !== undefined && !["low", "medium", "high", "critical"].includes(body.priorityLevel)) {
    errors.push("priorityLevel must be low, medium, high, or critical.");
  }

  return errors;
};

const validateUpdateMaintenanceTask = (body) => {
  const errors = validateCreateMaintenanceTask(body).filter(
    (error) => error !== "taskName is required." && error !== "assetId is required and must be a valid id."
  );

  if (Object.keys(body).length === 0) {
    errors.push("At least one field is required.");
  }

  return errors;
};

const validateCreateTaskFromTicket = (body) => {
  const errors = [];
  if (body.assignedTo !== undefined && !optionalObjectId(body.assignedTo)) {
    errors.push("assignedTo must be a valid id.");
  }
  if (body.supervisorId !== undefined && !optionalObjectId(body.supervisorId)) {
    errors.push("supervisorId must be a valid id.");
  }
  if (body.taskName !== undefined && !requiredString(body.taskName)) {
    errors.push("taskName must be a non-empty string.");
  }
  return errors;
};

module.exports = {
  validateCreateMaintenanceTask,
  validateCreateTaskFromTicket,
  validateUpdateMaintenanceTask,
};
