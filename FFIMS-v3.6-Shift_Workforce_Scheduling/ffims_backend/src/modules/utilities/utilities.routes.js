const express = require("express");
const validate = require("../../middleware/validation.middleware");
const { authenticateToken } = require("../../middleware/auth.middleware");
const { authorizeRoles } = require("../../middleware/role.middleware");
const utilitiesController = require("./utilities.controller");
const {
  validateCreateAlertTicket,
  validateCreatePowerUsage,
  validateCreateUtilityAlert,
  validateCreateWaterUsage,
  validateUpdatePowerUsage,
  validateUpdateUtilityAlert,
  validateUpdateWaterUsage,
} = require("./utilities.validation");

const router = express.Router();

router.use(authenticateToken);

router.get("/power-usage/summary", utilitiesController.getPowerUsageSummary);
router.get("/power-usage", utilitiesController.listPowerUsage);
router.get("/power-usage/:id", utilitiesController.getPowerUsage);
router.post(
  "/power-usage",
  authorizeRoles("Admin", "Facilities Staff", "Operations Staff"),
  validate(validateCreatePowerUsage),
  utilitiesController.createPowerUsage
);
router.patch(
  "/power-usage/:id",
  authorizeRoles("Admin", "Facilities Staff", "Operations Staff"),
  validate(validateUpdatePowerUsage),
  utilitiesController.updatePowerUsage
);
router.delete(
  "/power-usage/:id",
  authorizeRoles("Admin", "Facilities Staff", "Operations Staff"),
  utilitiesController.deletePowerUsage
);

router.get("/water-usage/summary", utilitiesController.getWaterUsageSummary);
router.get("/water-usage", utilitiesController.listWaterUsage);
router.get("/water-usage/:id", utilitiesController.getWaterUsage);
router.post(
  "/water-usage",
  authorizeRoles("Admin", "Facilities Staff", "Operations Staff"),
  validate(validateCreateWaterUsage),
  utilitiesController.createWaterUsage
);
router.patch(
  "/water-usage/:id",
  authorizeRoles("Admin", "Facilities Staff", "Operations Staff"),
  validate(validateUpdateWaterUsage),
  utilitiesController.updateWaterUsage
);
router.delete(
  "/water-usage/:id",
  authorizeRoles("Admin", "Facilities Staff", "Operations Staff"),
  utilitiesController.deleteWaterUsage
);

router.get("/alerts/summary", utilitiesController.getUtilityAlertSummary);
router.get("/alerts", utilitiesController.listUtilityAlerts);
router.get("/alerts/:id", utilitiesController.getUtilityAlert);
router.post(
  "/alerts",
  authorizeRoles("Admin", "Facilities Staff", "Operations Staff"),
  validate(validateCreateUtilityAlert),
  utilitiesController.createUtilityAlert
);
router.patch(
  "/alerts/:id",
  authorizeRoles("Admin", "Facilities Staff", "Operations Staff"),
  validate(validateUpdateUtilityAlert),
  utilitiesController.updateUtilityAlert
);
router.delete(
  "/alerts/:id",
  authorizeRoles("Admin", "Facilities Staff", "Operations Staff"),
  utilitiesController.deleteUtilityAlert
);
router.post(
  "/alerts/:id/create-ticket",
  authorizeRoles("Admin", "Facilities Staff", "Operations Staff"),
  validate(validateCreateAlertTicket),
  utilitiesController.createFaultTicketFromAlert
);

module.exports = router;
