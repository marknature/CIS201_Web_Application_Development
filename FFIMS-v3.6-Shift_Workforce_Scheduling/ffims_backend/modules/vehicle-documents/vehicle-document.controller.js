const asyncHandler = require("../../utils/asyncHandler");
const vehicleDocumentService = require("./vehicle-document.service");

const listVehicleDocuments = asyncHandler(async (req, res) => {
  console.info(`[vehicle-documents] GET query ${JSON.stringify(req.query)}`);
  const documents = await vehicleDocumentService.listVehicleDocuments({
    vehicleId: req.query.vehicleId,
  });

  res.json({ documents });
});

const getVehicleDocument = asyncHandler(async (req, res) => {
  const document = await vehicleDocumentService.getVehicleDocumentById(req.params.id);
  res.json({ document });
});

const createVehicleDocument = asyncHandler(async (req, res) => {
  console.info(`[vehicle-documents] POST body ${JSON.stringify(req.body)}`);
  const document = await vehicleDocumentService.createVehicleDocument(req.body, req.user?._id || null);
  res.status(201).json({
    message: "Vehicle document created successfully.",
    document,
  });
});

const updateVehicleDocument = asyncHandler(async (req, res) => {
  const document = await vehicleDocumentService.updateVehicleDocument(req.params.id, req.body);
  res.json({
    message: "Vehicle document updated successfully.",
    document,
  });
});

const deleteVehicleDocument = asyncHandler(async (req, res) => {
  await vehicleDocumentService.deleteVehicleDocument(req.params.id);
  res.json({ message: "Vehicle document deleted successfully." });
});

module.exports = {
  createVehicleDocument,
  deleteVehicleDocument,
  getVehicleDocument,
  listVehicleDocuments,
  updateVehicleDocument,
};
