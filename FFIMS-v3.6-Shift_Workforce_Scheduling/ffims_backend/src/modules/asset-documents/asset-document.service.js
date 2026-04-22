const mongoose = require("mongoose");
const ApiError = require("../../utils/apiError");
const Asset = require("../../models/asset.model");
const User = require("../../models/user.model");
const AssetDocument = require("../../models/asset-document.model");

const populateSpec = [
  {
    path: "assetId",
    select: "assetTag assetName model lifecycleStatus",
  },
  {
    path: "uploadedBy",
    select: "firstName surname email role",
  },
];

const toResponse = (document) => ({
  id: document._id,
  assetId: document.assetId?._id || document.assetId,
  asset: document.assetId && typeof document.assetId === "object"
    ? {
        id: document.assetId._id,
        assetTag: document.assetId.assetTag,
        assetName: document.assetId.assetName,
        model: document.assetId.model,
        lifecycleStatus: document.assetId.lifecycleStatus,
      }
    : null,
  documentType: document.documentType,
  filePath: document.filePath,
  fileName: document.fileName,
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

const ensureAssetExists = async (assetId) => {
  const asset = await Asset.findById(assetId);
  if (!asset) {
    throw new ApiError(404, "Asset not found.");
  }
};

const ensureUserExists = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
};

const listAssetDocuments = async ({ assetId }) => {
  const filter = {};

  if (assetId) {
    assertValidObjectId(assetId, "assetId");
    filter.assetId = assetId;
  }

  const documents = await AssetDocument.find(filter).populate(populateSpec).sort({ createdAt: -1 });
  return documents.map(toResponse);
};

const getAssetDocumentById = async (id) => {
  assertValidObjectId(id, "id");

  const document = await AssetDocument.findById(id).populate(populateSpec);
  if (!document) {
    throw new ApiError(404, "Asset document not found.");
  }

  return toResponse(document);
};

const createAssetDocument = async (payload, reqUserId) => {
  await ensureAssetExists(payload.assetId);

  const uploadedBy = payload.uploadedBy || reqUserId;
  if (!uploadedBy) {
    throw new ApiError(400, "uploadedBy is required when no authenticated user is provided.");
  }
  await ensureUserExists(uploadedBy);

  const document = await AssetDocument.create({
    assetId: payload.assetId,
    documentType: payload.documentType.trim(),
    filePath: payload.filePath?.trim() || "",
    fileName: payload.fileName?.trim() || "",
    uploadedBy,
  });

  const savedDocument = await AssetDocument.findById(document._id).populate(populateSpec);
  return toResponse(savedDocument);
};

const updateAssetDocument = async (id, payload) => {
  assertValidObjectId(id, "id");

  const document = await AssetDocument.findById(id);
  if (!document) {
    throw new ApiError(404, "Asset document not found.");
  }

  if (payload.assetId !== undefined) {
    await ensureAssetExists(payload.assetId);
    document.assetId = payload.assetId;
  }

  if (payload.uploadedBy !== undefined) {
    await ensureUserExists(payload.uploadedBy);
    document.uploadedBy = payload.uploadedBy;
  }

  if (payload.documentType !== undefined) document.documentType = payload.documentType.trim();
  if (payload.filePath !== undefined) document.filePath = payload.filePath?.trim() || "";
  if (payload.fileName !== undefined) document.fileName = payload.fileName?.trim() || "";

  await document.save();

  const updatedDocument = await AssetDocument.findById(document._id).populate(populateSpec);
  return toResponse(updatedDocument);
};

const deleteAssetDocument = async (id) => {
  assertValidObjectId(id, "id");

  const document = await AssetDocument.findByIdAndDelete(id);
  if (!document) {
    throw new ApiError(404, "Asset document not found.");
  }
};

module.exports = {
  createAssetDocument,
  deleteAssetDocument,
  getAssetDocumentById,
  listAssetDocuments,
  updateAssetDocument,
};
