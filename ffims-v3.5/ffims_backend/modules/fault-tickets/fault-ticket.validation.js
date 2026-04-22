const mongoose = require("mongoose");

const ALLOWED_PRIORITIES = ["low", "medium", "high", "critical"];
const ALLOWED_STATUSES = [
  "open",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
  "cancelled",
  "overdue",
];

const requiredString = (value) => typeof value === "string" && value.trim().length > 0;
const optionalString = (value) => value === undefined || typeof value === "string";
const optionalObjectId = (value) =>
  value === undefined || value === null || mongoose.Types.ObjectId.isValid(value);

const validateCreateTicket = (body) => {
  const errors = [];

  if (!requiredString(body.title)) errors.push("title is required.");
  if (!optionalString(body.description)) errors.push("description must be a string.");
  if (body.priority !== undefined && !ALLOWED_PRIORITIES.includes(body.priority)) {
    errors.push("priority must be one of low, medium, high, critical.");
  }
  if (body.status !== undefined && !ALLOWED_STATUSES.includes(body.status)) {
    errors.push(
      "status must be one of open, assigned, in_progress, resolved, closed, cancelled, overdue."
    );
  }

  const relationFields = [
    "facilityId",
    "roomId",
    "assetId",
    "vehicleId",
    "bookingId",
    "projectId",
    "workOrderId",
  ];

  for (const field of relationFields) {
    if (!optionalObjectId(body[field])) {
      errors.push(`${field} must be a valid id.`);
    }
  }

  if (body.dueDate !== undefined && Number.isNaN(Date.parse(body.dueDate))) {
    errors.push("dueDate must be a valid ISO date.");
  }

  return errors;
};

const validateUpdateTicket = (body) => {
  const errors = [];
  const allowedFields = [
    "title",
    "description",
    "ticketType",
    "priority",
    "status",
    "facilityId",
    "roomId",
    "assetId",
    "vehicleId",
    "bookingId",
    "projectId",
    "workOrderId",
    "dueDate",
  ];

  const hasAllowedField = allowedFields.some((field) => body[field] !== undefined);
  if (!hasAllowedField) {
    errors.push("At least one updatable ticket field must be provided.");
  }

  return errors.concat(validateCreateTicket(body).filter((error) => error !== "title is required."));
};

const validateAssignmentCreate = (body) => {
  const errors = [];
  if (!optionalObjectId(body.userId) || body.userId === undefined || body.userId === null) {
    errors.push("userId is required and must be a valid id.");
  }
  if (body.assignedRole !== undefined && !requiredString(body.assignedRole)) {
    errors.push("assignedRole must be a non-empty string.");
  }
  return errors;
};

const validateStatusUpdate = (body) => {
  const errors = [];
  if (!ALLOWED_STATUSES.includes(body.status)) {
    errors.push(
      "status must be one of open, assigned, in_progress, resolved, closed, cancelled, overdue."
    );
  }
  return errors;
};

const validatePriorityUpdate = (body) => {
  const errors = [];
  if (!ALLOWED_PRIORITIES.includes(body.priority)) {
    errors.push("priority must be one of low, medium, high, critical.");
  }
  return errors;
};

const validateCommentCreate = (body) => {
  const errors = [];
  if (!requiredString(body.comment)) errors.push("comment is required.");
  return errors;
};

const validateAttachmentCreate = (body) => {
  const errors = [];
  if (!requiredString(body.fileName)) errors.push("fileName is required.");
  if (!requiredString(body.fileUrl)) errors.push("fileUrl is required.");
  if (body.mimeType !== undefined && !optionalString(body.mimeType)) {
    errors.push("mimeType must be a string.");
  }
  if (body.fileSize !== undefined && (!Number.isFinite(body.fileSize) || body.fileSize < 0)) {
    errors.push("fileSize must be a non-negative number.");
  }
  return errors;
};

module.exports = {
  ALLOWED_PRIORITIES,
  ALLOWED_STATUSES,
  validateAssignmentCreate,
  validateAttachmentCreate,
  validateCommentCreate,
  validateCreateTicket,
  validatePriorityUpdate,
  validateStatusUpdate,
  validateUpdateTicket,
};
