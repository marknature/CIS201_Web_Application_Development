const express = require("express");
const validate = require("../../middleware/validation.middleware");
const complianceCertificateController = require("./compliance-certificate.controller");
const {
  validateCreateComplianceCertificate,
  validateUpdateComplianceCertificate,
} = require("./compliance-certificate.validation");

const router = express.Router();

router.get("/", complianceCertificateController.listComplianceCertificates);
router.get("/:id", complianceCertificateController.getComplianceCertificate);
router.post(
  "/",
  validate(validateCreateComplianceCertificate),
  complianceCertificateController.createComplianceCertificate
);
router.patch(
  "/:id",
  validate(validateUpdateComplianceCertificate),
  complianceCertificateController.updateComplianceCertificate
);
router.delete("/:id", complianceCertificateController.deleteComplianceCertificate);

module.exports = router;
