const express = require("express");
const validate = require("../../middleware/validation.middleware");
const { authenticateToken } = require("../../middleware/auth.middleware");
const { authorizeRoles } = require("../../middleware/role.middleware");
const faultTicketController = require("./fault-ticket.controller");
const {
  validateCreateFaultTicket,
  validateUpdateFaultTicket,
} = require("./fault-ticket.validation");

const router = express.Router();

router.use(authenticateToken);

router.get("/", faultTicketController.listFaultTickets);
router.get("/:id", faultTicketController.getFaultTicket);
router.post(
  "/",
  authorizeRoles("Admin", "Facilities Staff", "Operations Staff", "General Staff"),
  validate(validateCreateFaultTicket),
  faultTicketController.createFaultTicket
);
router.patch(
  "/:id",
  authorizeRoles("Admin", "Facilities Staff", "Operations Staff", "General Staff"),
  validate(validateUpdateFaultTicket),
  faultTicketController.updateFaultTicket
);
router.delete("/:id", authorizeRoles("Admin"), faultTicketController.deleteFaultTicket);

module.exports = router;
