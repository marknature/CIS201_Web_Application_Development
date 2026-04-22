const express = require("express");
const validate = require("../../middleware/validation.middleware");
const vehicleDocumentController = require("./vehicle-document.controller");
const {
  validateCreateVehicleDocument,
  validateUpdateVehicleDocument,
} = require("./vehicle-document.validation");

const router = express.Router();

router.get("/", vehicleDocumentController.listVehicleDocuments);
router.get("/:id", vehicleDocumentController.getVehicleDocument);
router.post("/", validate(validateCreateVehicleDocument), vehicleDocumentController.createVehicleDocument);
router.patch("/:id", validate(validateUpdateVehicleDocument), vehicleDocumentController.updateVehicleDocument);
router.delete("/:id", vehicleDocumentController.deleteVehicleDocument);

module.exports = router;
