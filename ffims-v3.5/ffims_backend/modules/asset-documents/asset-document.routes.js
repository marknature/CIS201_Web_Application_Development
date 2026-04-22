const express = require("express");
const validate = require("../../middleware/validation.middleware");
const assetDocumentController = require("./asset-document.controller");
const {
  validateCreateAssetDocument,
  validateUpdateAssetDocument,
} = require("./asset-document.validation");

const router = express.Router();

router.get("/", assetDocumentController.listAssetDocuments);
router.get("/:id", assetDocumentController.getAssetDocument);
router.post("/", validate(validateCreateAssetDocument), assetDocumentController.createAssetDocument);
router.patch("/:id", validate(validateUpdateAssetDocument), assetDocumentController.updateAssetDocument);
router.delete("/:id", assetDocumentController.deleteAssetDocument);

module.exports = router;
