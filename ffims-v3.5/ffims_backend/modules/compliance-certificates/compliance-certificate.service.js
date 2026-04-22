const mongoose = require("mongoose");
const ApiError = require("../../utils/apiError");
const Regulation = require("../../models/regulation.model");
const Facility = require("../../models/facility.model");
const ComplianceCertificate = require("../../models/compliance-certificate.model");

const populateSpec = [
  {
    path: "regulationId",
    select: "title regulationCode status",
  },
  {
    path: "facilityId",
    select: "facilityName facilityCode facilityType",
  },
];

const toResponse = (certificate) => ({
  id: certificate._id,
  regulationId: certificate.regulationId?._id || certificate.regulationId,
  regulation: certificate.regulationId && typeof certificate.regulationId === "object"
    ? {
        id: certificate.regulationId._id,
        title: certificate.regulationId.title,
        regulationCode: certificate.regulationId.regulationCode,
        status: certificate.regulationId.status,
      }
    : null,
  facilityId: certificate.facilityId?._id || certificate.facilityId || null,
  facility: certificate.facilityId && typeof certificate.facilityId === "object"
    ? {
        id: certificate.facilityId._id,
        facilityName: certificate.facilityId.facilityName,
        facilityCode: certificate.facilityId.facilityCode,
        facilityType: certificate.facilityId.facilityType,
      }
    : null,
  certificateNumber: certificate.certificateNumber,
  certificateName: certificate.certificateName,
  issuedDate: certificate.issuedDate,
  expiryDate: certificate.expiryDate,
  status: certificate.status,
  fileUrl: certificate.fileUrl,
  issuedBy: certificate.issuedBy,
  createdAt: certificate.createdAt,
  updatedAt: certificate.updatedAt,
});

const assertValidObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(400, `${fieldName} must be a valid id.`);
  }
};

const ensureRegulationExists = async (regulationId) => {
  const regulation = await Regulation.findById(regulationId);
  if (!regulation) {
    throw new ApiError(404, "Regulation not found.");
  }
};

const ensureFacilityExists = async (facilityId) => {
  const facility = await Facility.findById(facilityId);
  if (!facility) {
    throw new ApiError(404, "Facility not found.");
  }
};

const listComplianceCertificates = async ({ regulationId, facilityId }) => {
  const filter = {};

  if (regulationId) {
    assertValidObjectId(regulationId, "regulationId");
    filter.regulationId = regulationId;
  }

  if (facilityId) {
    assertValidObjectId(facilityId, "facilityId");
    filter.facilityId = facilityId;
  }

  const certificates = await ComplianceCertificate.find(filter)
    .populate(populateSpec)
    .sort({ createdAt: -1 });

  return certificates.map(toResponse);
};

const getComplianceCertificateById = async (id) => {
  assertValidObjectId(id, "id");

  const certificate = await ComplianceCertificate.findById(id).populate(populateSpec);
  if (!certificate) {
    throw new ApiError(404, "Compliance certificate not found.");
  }

  return toResponse(certificate);
};

const createComplianceCertificate = async (payload) => {
  await ensureRegulationExists(payload.regulationId);

  if (payload.facilityId) {
    await ensureFacilityExists(payload.facilityId);
  }

  const certificate = await ComplianceCertificate.create({
    regulationId: payload.regulationId,
    facilityId: payload.facilityId || null,
    certificateNumber: payload.certificateNumber.trim(),
    certificateName: payload.certificateName?.trim() || "",
    issuedDate: payload.issuedDate || null,
    expiryDate: payload.expiryDate || null,
    status: payload.status?.trim() || "valid",
    fileUrl: payload.fileUrl?.trim() || "",
    issuedBy: payload.issuedBy?.trim() || "",
  });

  const savedCertificate = await ComplianceCertificate.findById(certificate._id).populate(populateSpec);
  return toResponse(savedCertificate);
};

const updateComplianceCertificate = async (id, payload) => {
  assertValidObjectId(id, "id");

  const certificate = await ComplianceCertificate.findById(id);
  if (!certificate) {
    throw new ApiError(404, "Compliance certificate not found.");
  }

  if (payload.regulationId !== undefined) {
    await ensureRegulationExists(payload.regulationId);
    certificate.regulationId = payload.regulationId;
  }

  if (payload.facilityId !== undefined) {
    if (payload.facilityId) {
      await ensureFacilityExists(payload.facilityId);
      certificate.facilityId = payload.facilityId;
    } else {
      certificate.facilityId = null;
    }
  }

  if (payload.certificateNumber !== undefined) certificate.certificateNumber = payload.certificateNumber.trim();
  if (payload.certificateName !== undefined) certificate.certificateName = payload.certificateName?.trim() || "";
  if (payload.issuedDate !== undefined) certificate.issuedDate = payload.issuedDate || null;
  if (payload.expiryDate !== undefined) certificate.expiryDate = payload.expiryDate || null;
  if (payload.status !== undefined) certificate.status = payload.status.trim();
  if (payload.fileUrl !== undefined) certificate.fileUrl = payload.fileUrl?.trim() || "";
  if (payload.issuedBy !== undefined) certificate.issuedBy = payload.issuedBy?.trim() || "";

  await certificate.save();

  const updatedCertificate = await ComplianceCertificate.findById(certificate._id).populate(populateSpec);
  return toResponse(updatedCertificate);
};

const deleteComplianceCertificate = async (id) => {
  assertValidObjectId(id, "id");

  const certificate = await ComplianceCertificate.findByIdAndDelete(id);
  if (!certificate) {
    throw new ApiError(404, "Compliance certificate not found.");
  }
};

module.exports = {
  createComplianceCertificate,
  deleteComplianceCertificate,
  getComplianceCertificateById,
  listComplianceCertificates,
  updateComplianceCertificate,
};
