const mongoose = require("mongoose");

const requiredString = (value) => typeof value === "string" && value.trim().length > 0;
const optionalString = (value) => value === undefined || value === null || typeof value === "string";
const optionalDate = (value) => value === undefined || value === null || !Number.isNaN(Date.parse(value));
const optionalObjectId = (value) =>
  value === undefined || value === null || mongoose.Types.ObjectId.isValid(value);

const validateCreateComplianceCertificate = (body) => {
  const errors = [];

  if (!requiredString(body.regulationId) || !mongoose.Types.ObjectId.isValid(body.regulationId)) {
    errors.push("regulationId must be a valid id.");
  }

  if (body.facilityId !== undefined && !optionalObjectId(body.facilityId)) {
    errors.push("facilityId must be a valid id.");
  }

  if (!requiredString(body.certificateNumber)) {
    errors.push("certificateNumber is required.");
  }

  if (!optionalString(body.certificateName)) {
    errors.push("certificateName must be a string.");
  }

  if (!optionalDate(body.issuedDate)) {
    errors.push("issuedDate must be a valid date.");
  }

  if (!optionalDate(body.expiryDate)) {
    errors.push("expiryDate must be a valid date.");
  }

  if (!optionalString(body.status)) {
    errors.push("status must be a string.");
  }

  if (!optionalString(body.fileUrl)) {
    errors.push("fileUrl must be a string.");
  }

  if (!optionalString(body.issuedBy)) {
    errors.push("issuedBy must be a string.");
  }

  return errors;
};

const validateUpdateComplianceCertificate = (body) => {
  const errors = [];
  const allowedFields = [
    "regulationId",
    "facilityId",
    "certificateNumber",
    "certificateName",
    "issuedDate",
    "expiryDate",
    "status",
    "fileUrl",
    "issuedBy",
  ];
  const hasAnyAllowedField = allowedFields.some((field) => body[field] !== undefined);

  if (!hasAnyAllowedField) {
    errors.push("At least one updatable field must be provided.");
  }

  if (body.regulationId !== undefined && !optionalObjectId(body.regulationId)) {
    errors.push("regulationId must be a valid id.");
  }

  if (body.facilityId !== undefined && !optionalObjectId(body.facilityId)) {
    errors.push("facilityId must be a valid id.");
  }

  if (body.certificateNumber !== undefined && !requiredString(body.certificateNumber)) {
    errors.push("certificateNumber must be a non-empty string.");
  }

  if (!optionalString(body.certificateName)) {
    errors.push("certificateName must be a string.");
  }

  if (!optionalDate(body.issuedDate)) {
    errors.push("issuedDate must be a valid date.");
  }

  if (!optionalDate(body.expiryDate)) {
    errors.push("expiryDate must be a valid date.");
  }

  if (body.status !== undefined && !requiredString(body.status)) {
    errors.push("status must be a non-empty string.");
  }

  if (!optionalString(body.fileUrl)) {
    errors.push("fileUrl must be a string.");
  }

  if (!optionalString(body.issuedBy)) {
    errors.push("issuedBy must be a string.");
  }

  return errors;
};

module.exports = {
  validateCreateComplianceCertificate,
  validateUpdateComplianceCertificate,
};
