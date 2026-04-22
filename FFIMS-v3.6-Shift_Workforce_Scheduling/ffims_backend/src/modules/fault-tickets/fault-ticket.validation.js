const mongoose = require("mongoose");

const requiredString = (value) => typeof value === "string" && value.trim().length > 0;
const optionalString = (value) => value === undefined || typeof value === "string";
const optionalObjectId = (value) =>
  value === undefined || value === null || mongoose.Types.ObjectId.isValid(value);

const validateCreateFaultTicket = (body) => {
  const errors = [];

  if (!requiredString(body.title)) errors.push("title is required.");
  if (!optionalString(body.description)) errors.push("description must be a string.");
  if (body.priority !== undefined && !["low", "medium", "high", "critical"].includes(body.priority)) {
    errors.push("priority must be low, medium, high, or critical.");
  }
  if (body.status !== undefined && !["open", "assigned", "in_progress", "resolved", "closed"].includes(body.status)) {
    errors.push("status must be open, assigned, in_progress, resolved, or closed.");
  }

  const idFields = ["reportedBy", "facilityId", "roomId", "assetId", "vehicleId", "bookingId", "projectId", "workOrderId"];
  for (const field of idFields) {
    if (!optionalObjectId(body[field])) {
      errors.push(`${field} must be a valid id.`);
    }
  }

  if (body.dueDate !== undefined && Number.isNaN(Date.parse(body.dueDate))) {
    errors.push("dueDate must be a valid date.");
  }

  return errors;
};

const validateUpdateFaultTicket = (body) => {
  const errors = validateCreateFaultTicket(body).filter((error) => error !== "title is required.");
  if (Object.keys(body).length === 0) {
    errors.push("At least one field is required.");
  }
  return errors;
};

module.exports = {
  validateCreateFaultTicket,
  validateUpdateFaultTicket,
};
