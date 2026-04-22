const mongoose = require("mongoose");
const ApiError = require("../../utils/apiError");
const Vehicle = require("../../models/vehicle.model");
const User = require("../../models/user.model");
const VehicleDocument = require("../../models/vehicle-document.model");

const vehicleDocumentPopulate = [
  {
    path: "vehicleId",
    select: "registrationNumber make model year status",
  },
  {
    path: "uploadedBy",
    select: "firstName surname email role",
  },
];

const toVehicleDocumentResponse = (document) => ({
  id: document._id,
  vehicleId: document.vehicleId?._id || document.vehicleId,
  vehicle: document.vehicleId && typeof document.vehicleId === "object"
    ? {
        id: document.vehicleId._id,
        registrationNumber: document.vehicleId.registrationNumber,
        make: document.vehicleId.make,
        model: document.vehicleId.model,
        year: document.vehicleId.year,
        status: document.vehicleId.status,
      }
    : null,
  documentType: document.documentType,
  documentNumber: document.documentNumber,
  filePath: document.filePath,
  issueDate: document.issueDate,
  expiryDate: document.expiryDate,
  status: document.status,
  uploadedBy: document.uploadedBy && typeof document.uploadedBy === "object"
    ? {
        id: document.uploadedBy._id,
        fullName: `${document.uploadedBy.firstName || ""} ${document.uploadedBy.surname || ""}`.trim(),
        email: document.uploadedBy.email,
        role: document.uploadedBy.role,
      }
    : document.uploadedBy,
  createdAt: document.createdAt,
});

const assertValidObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(400, `${fieldName} must be a valid id.`);
  }
};

const ensureVehicleExists = async (vehicleId) => {
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    throw new ApiError(404, "Vehicle not found.");
  }
};

const ensureUserExists = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
};

const listVehicleDocuments = async ({ vehicleId }) => {
  const filter = {};

  if (vehicleId) {
    assertValidObjectId(vehicleId, "vehicleId");
    filter.vehicleId = vehicleId;
  }

  const documents = await VehicleDocument.find(filter)
    .populate(vehicleDocumentPopulate)
    .sort({ createdAt: -1 });

  return documents.map(toVehicleDocumentResponse);
};

const getVehicleDocumentById = async (id) => {
  assertValidObjectId(id, "id");

  const document = await VehicleDocument.findById(id).populate(vehicleDocumentPopulate);
  if (!document) {
    throw new ApiError(404, "Vehicle document not found.");
  }

  return toVehicleDocumentResponse(document);
};

const createVehicleDocument = async (payload, reqUserId) => {
  await ensureVehicleExists(payload.vehicleId);

  const uploadedBy = payload.uploadedBy || reqUserId;
  if (!uploadedBy) {
    throw new ApiError(400, "uploadedBy is required when no authenticated user is provided.");
  }
  await ensureUserExists(uploadedBy);

  const document = await VehicleDocument.create({
    vehicleId: payload.vehicleId,
    documentType: payload.documentType.trim(),
    documentNumber: payload.documentNumber?.trim() || "",
    filePath: payload.filePath?.trim() || "",
    issueDate: payload.issueDate || null,
    expiryDate: payload.expiryDate || null,
    status: payload.status?.trim() || "valid",
    uploadedBy,
  });

  const savedDocument = await VehicleDocument.findById(document._id).populate(vehicleDocumentPopulate);
  return toVehicleDocumentResponse(savedDocument);
};

const updateVehicleDocument = async (id, payload) => {
  assertValidObjectId(id, "id");

  const document = await VehicleDocument.findById(id);
  if (!document) {
    throw new ApiError(404, "Vehicle document not found.");
  }

  if (payload.vehicleId !== undefined) {
    await ensureVehicleExists(payload.vehicleId);
    document.vehicleId = payload.vehicleId;
  }

  if (payload.uploadedBy !== undefined) {
    await ensureUserExists(payload.uploadedBy);
    document.uploadedBy = payload.uploadedBy;
  }

  if (payload.documentType !== undefined) document.documentType = payload.documentType.trim();
  if (payload.documentNumber !== undefined) document.documentNumber = payload.documentNumber?.trim() || "";
  if (payload.filePath !== undefined) document.filePath = payload.filePath?.trim() || "";
  if (payload.issueDate !== undefined) document.issueDate = payload.issueDate || null;
  if (payload.expiryDate !== undefined) document.expiryDate = payload.expiryDate || null;
  if (payload.status !== undefined) document.status = payload.status.trim();

  await document.save();

  const updatedDocument = await VehicleDocument.findById(document._id).populate(vehicleDocumentPopulate);
  return toVehicleDocumentResponse(updatedDocument);
};

const deleteVehicleDocument = async (id) => {
  assertValidObjectId(id, "id");

  const document = await VehicleDocument.findByIdAndDelete(id);
  if (!document) {
    throw new ApiError(404, "Vehicle document not found.");
  }
};

module.exports = {
  createVehicleDocument,
  deleteVehicleDocument,
  getVehicleDocumentById,
  listVehicleDocuments,
  updateVehicleDocument,
};
