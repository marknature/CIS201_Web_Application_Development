const express = require("express");
const validate = require("../../middleware/validation.middleware");
const { authenticateToken } = require("../../middleware/auth.middleware");
const { authorizeRoles } = require("../../middleware/role.middleware");
const maintenanceController = require("./maintenance.controller");
const {
  validateCreateMaintenanceTask,
  validateCreateTaskFromTicket,
  validateUpdateMaintenanceTask,
} = require("./maintenance.validation");

const router = express.Router();

router.use(authenticateToken);

router.get("/", maintenanceController.listMaintenanceTasks);
router.get("/:id", maintenanceController.getMaintenanceTask);
router.post(
  "/",
  authorizeRoles("Admin", "Facilities Staff", "Operations Staff", "Fleet Staff"),
  validate(validateCreateMaintenanceTask),
  maintenanceController.createMaintenanceTask
);
router.patch(
  "/:id",
  authorizeRoles("Admin", "Facilities Staff", "Operations Staff", "Fleet Staff", "Technician"),
  validate(validateUpdateMaintenanceTask),
  maintenanceController.updateMaintenanceTask
);
router.delete("/:id", authorizeRoles("Admin"), maintenanceController.deleteMaintenanceTask);
router.post(
  "/from-ticket/:ticketId",
  authorizeRoles("Admin", "Facilities Staff", "Operations Staff", "Fleet Staff"),
  validate(validateCreateTaskFromTicket),
  maintenanceController.createTaskFromFaultTicket
);

module.exports = router;
