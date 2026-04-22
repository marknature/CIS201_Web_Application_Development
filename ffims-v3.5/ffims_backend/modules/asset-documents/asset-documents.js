const asyncHandler = require("../../utils/asyncHandler");
const assetDocumentService = require("./asset-document.service");

const listAssetDocuments = asyncHandler(async (req, res) => {
  const documents = await assetDocumentService.listAssetDocuments({
    assetId: req.query.assetId,
  });

  res.json({ documents });
});

const getAssetDocument = asyncHandler(async (req, res) => {
  const document = await assetDocumentService.getAssetDocumentById(req.params.id);
  res.json({ document });
});

const createAssetDocument = asyncHandler(async (req, res) => {
  const document = await assetDocumentService.createAssetDocument(req.body, req.user._id);
  res.status(201).json({
    message: "Asset document created successfully.",
    document,
  });
});

const updateAssetDocument = asyncHandler(async (req, res) => {
  const document = await assetDocumentService.updateAssetDocument(req.params.id, req.body);
  res.json({
    message: "Asset document updated successfully.",
    document,
  });
});

const deleteAssetDocument = asyncHandler(async (req, res) => {
  await assetDocumentService.deleteAssetDocument(req.params.id);
  res.json({ message: "Asset document deleted successfully." });
});

module.exports = {
  createAssetDocument,
  deleteAssetDocument,
  getAssetDocument,
  listAssetDocuments,
  updateAssetDocument,
};
