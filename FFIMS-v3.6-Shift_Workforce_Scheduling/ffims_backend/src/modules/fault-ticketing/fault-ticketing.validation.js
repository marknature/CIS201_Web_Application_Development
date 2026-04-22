const mongoose = require("mongoose");

const requiredString = (value) => typeof value === "string" && value.trim().length > 0;
const optionalString = (value) => value === undefined || value === null || typeof value === "string";
const optionalObjectId = (value) =>
  value === undefined ||
  value === null ||
  value === "" ||
  mongoose.Types.ObjectId.isValid(value);
const allowedPriorities = new Set(["low", "medium", "high", "critical"]);
const allowedStatuses = new Set(["open", "assigned", "in_progress", "resolved", "closed"]);

const validateCreateFault = (body) => {
  const errors = [];

  if (!requiredString(body.title)) errors.push("title is required.");
  if (!requiredString(body.description)) errors.push("description is required.");
  if (!requiredString(body.location)) errors.push("location is required.");

  if (body.priority !== undefined) {
    const normalized = String(body.priority || "").trim().toLowerCase();
    if (!allowedPriorities.has(normalized)) {
      errors.push("priority must be one of: low, medium, high, critical.");
    }
  }

  if (!optionalString(body.imageName)) errors.push("imageName must be a string.");
  if (!optionalString(body.imageUrl)) errors.push("imageUrl must be a string.");
  if (!optionalObjectId(body.assignedTechnicianId)) {
    errors.push("assignedTechnicianId must be a valid id.");
  }

  return errors;
};

const validateUpdateTicket = (body) => {
  const errors = [];
  const allowedFields = [
    "status",
    "priority",
    "assignedTechnicianId",
    "title",
    "description",
    "location",
    "imageName",
    "imageUrl",
  ];
  const hasAnyAllowedField = allowedFields.some((field) => body[field] !== undefined);

  if (!hasAnyAllowedField) {
    errors.push("At least one updatable field must be provided.");
  }

  if (body.status !== undefined) {
    const normalized = String(body.status || "").trim().toLowerCase();
    if (!allowedStatuses.has(normalized)) {
      errors.push("status must be one of: open, assigned, in_progress, resolved, closed.");
    }
  }

  if (body.priority !== undefined) {
    const normalized = String(body.priority || "").trim().toLowerCase();
    if (!allowedPriorities.has(normalized)) {
      errors.push("priority must be one of: low, medium, high, critical.");
    }
  }

  if (body.title !== undefined && !requiredString(body.title)) {
    errors.push("title must be a non-empty string.");
  }

  if (body.description !== undefined && !requiredString(body.description)) {
    errors.push("description must be a non-empty string.");
  }

  if (body.location !== undefined && !requiredString(body.location)) {
    errors.push("location must be a non-empty string.");
  }

  if (!optionalString(body.imageName)) errors.push("imageName must be a string.");
  if (!optionalString(body.imageUrl)) errors.push("imageUrl must be a string.");
  if (body.assignedTechnicianId !== undefined && !optionalObjectId(body.assignedTechnicianId)) {
    errors.push("assignedTechnicianId must be a valid id.");
  }

  return errors;
};

const validateCreateComment = (body) => {
  const errors = [];

  if (!requiredString(body.ticketId) || !mongoose.Types.ObjectId.isValid(body.ticketId)) {
    errors.push("ticketId must be a valid id.");
  }

  if (!requiredString(body.comment)) {
    errors.push("comment is required.");
  }

  return errors;
};

module.exports = {
  validateCreateComment,
  validateCreateFault,
  validateUpdateTicket,
};
