const asyncHandler = require("../../utils/asyncHandler");
const complianceCertificateService = require("./compliance-certificate.service");

const listComplianceCertificates = asyncHandler(async (req, res) => {
  console.info(`[compliance-certificates] GET query ${JSON.stringify(req.query)}`);
  const certificates = await complianceCertificateService.listComplianceCertificates({
    regulationId: req.query.regulationId,
    facilityId: req.query.facilityId,
  });

  res.json({ certificates });
});

const getComplianceCertificate = asyncHandler(async (req, res) => {
  const certificate = await complianceCertificateService.getComplianceCertificateById(req.params.id);
  res.json({ certificate });
});

const createComplianceCertificate = asyncHandler(async (req, res) => {
  console.info(`[compliance-certificates] POST body ${JSON.stringify(req.body)}`);
  const certificate = await complianceCertificateService.createComplianceCertificate(req.body);
  res.status(201).json({
    message: "Compliance certificate created successfully.",
    certificate,
  });
});

const updateComplianceCertificate = asyncHandler(async (req, res) => {
  const certificate = await complianceCertificateService.updateComplianceCertificate(req.params.id, req.body);
  res.json({
    message: "Compliance certificate updated successfully.",
    certificate,
  });
});

const deleteComplianceCertificate = asyncHandler(async (req, res) => {
  await complianceCertificateService.deleteComplianceCertificate(req.params.id);
  res.json({ message: "Compliance certificate deleted successfully." });
});

module.exports = {
  createComplianceCertificate,
  deleteComplianceCertificate,
  getComplianceCertificate,
  listComplianceCertificates,
  updateComplianceCertificate,
};
