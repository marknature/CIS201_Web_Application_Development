const express = require("express");
const validate = require("../../middleware/validation.middleware");
const { authenticateToken } = require("../../middleware/auth.middleware");
const faultTicketController = require("./fault-ticket.controller");
const {
  validateAssignmentCreate,
  validateAttachmentCreate,
  validateCommentCreate,
  validateCreateTicket,
  validatePriorityUpdate,
  validateStatusUpdate,
  validateUpdateTicket,
} = require("./fault-ticket.validation");

const router = express.Router();

router.use(authenticateToken);

router.get("/stats/summary", faultTicketController.getSummary);
router.get("/", faultTicketController.listTickets);
router.post("/", validate(validateCreateTicket), faultTicketController.createTicket);
router.get("/:ticketId", faultTicketController.getTicket);
router.patch("/:ticketId", validate(validateUpdateTicket), faultTicketController.updateTicket);
router.delete("/:ticketId", faultTicketController.deleteTicket);
router.patch(
  "/:ticketId/status",
  validate(validateStatusUpdate),
  faultTicketController.updateTicketStatus
);
router.patch(
  "/:ticketId/priority",
  validate(validatePriorityUpdate),
  faultTicketController.updateTicketPriority
);
router.get("/:ticketId/assignments", faultTicketController.listAssignments);
router.post(
  "/:ticketId/assignments",
  validate(validateAssignmentCreate),
  faultTicketController.createAssignment
);
router.delete("/:ticketId/assignments/:assignmentId", faultTicketController.removeAssignment);
router.get("/:ticketId/comments", faultTicketController.listComments);
router.post(
  "/:ticketId/comments",
  validate(validateCommentCreate),
  faultTicketController.createComment
);
router.post(
  "/:ticketId/attachments",
  validate(validateAttachmentCreate),
  faultTicketController.createAttachment
);

module.exports = router;
