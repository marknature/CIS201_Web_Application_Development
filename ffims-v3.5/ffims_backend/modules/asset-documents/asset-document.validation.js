const mongoose = require("mongoose");

const requiredString = (value) => typeof value === "string" && value.trim().length > 0;
const optionalString = (value) => value === undefined || value === null || typeof value === "string";
const optionalObjectId = (value) =>
  value === undefined || value === null || mongoose.Types.ObjectId.isValid(value);

const validateCreateAssetDocument = (body) => {
  const errors = [];

  if (!requiredString(body.assetId) || !mongoose.Types.ObjectId.isValid(body.assetId)) {
    errors.push("assetId must be a valid id.");
  }

  if (!requiredString(body.documentType)) {
    errors.push("documentType is required.");
  }

  if (!optionalString(body.filePath)) {
    errors.push("filePath must be a string.");
  }

  if (!optionalString(body.fileName)) {
    errors.push("fileName must be a string.");
  }

  if (!optionalObjectId(body.uploadedBy)) {
    errors.push("uploadedBy must be a valid id.");
  }

  return errors;
};

const validateUpdateAssetDocument = (body) => {
  const errors = [];
  const allowedFields = ["assetId", "documentType", "filePath", "fileName", "uploadedBy"];
  const hasAnyAllowedField = allowedFields.some((field) => body[field] !== undefined);

  if (!hasAnyAllowedField) {
    errors.push("At least one updatable field must be provided.");
  }

  if (body.assetId !== undefined && !optionalObjectId(body.assetId)) {
    errors.push("assetId must be a valid id.");
  }

  if (body.documentType !== undefined && !requiredString(body.documentType)) {
    errors.push("documentType must be a non-empty string.");
  }

  if (!optionalString(body.filePath)) {
    errors.push("filePath must be a string.");
  }

  if (!optionalString(body.fileName)) {
    errors.push("fileName must be a string.");
  }

  if (body.uploadedBy !== undefined && !optionalObjectId(body.uploadedBy)) {
    errors.push("uploadedBy must be a valid id.");
  }

  return errors;
};

module.exports = {
  validateCreateAssetDocument,
  validateUpdateAssetDocument,
};
