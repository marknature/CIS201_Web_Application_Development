const express = require("express");
const { body } = require("express-validator");
const {
  createTicket,
  getTickets,
  getMyTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
  assignTicketToTechnician,
  updateStatus,
  updateTicketPriority
} = require("../controllers/ticketController");
const { addComment } = require("../controllers/commentController");
const { authenticate } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { validateRequest } = require("../middleware/validateRequest");

const router = express.Router();

router.use(authenticate);

router.post("/", createTicket);

router.get("/my", getMyTickets);
router.get("/", authorize("technician", "admin"), getTickets);
router.get("/:id", getTicketById);

router.put(
  "/:id",
  authorize("technician", "admin"),
  [
    body("title").optional().isString(),
    body("description").optional().isString(),
    body("category").optional().isString(),
    body("location").optional().isString(),
    body("resolution_notes").optional().isString(),
    body("due_at").optional().isISO8601(),
    body("maintenance_link").optional().isURL()
  ],
  validateRequest,
  updateTicket
);

router.delete("/:id", authorize("admin"), deleteTicket);

router.put(
  "/:id/assign",
  authorize("technician", "admin"),
  [
    body("technician_id")
      .exists({ checkFalsy: true })
      .bail()
      .customSanitizer((value) => String(value).trim())
      .notEmpty()
  ],
  validateRequest,
  assignTicketToTechnician
);

router.put(
  "/:id/status",
  authorize("technician", "admin"),
  [body("status").isIn(["Open", "Assigned", "In Progress", "Resolved", "Closed", "Escalated"])],
  validateRequest,
  updateStatus
);

// STRICT: Priority update endpoint - ONLY for technicians and admins
router.put(
  "/:id/priority",
  authorize("technician", "admin"),
  [
    body("priority").isIn(["Low", "Medium", "High", "Critical"])
      .withMessage("Priority must be Low, Medium, High, or Critical")
  ],
  validateRequest,
  updateTicketPriority
);

router.post(
  "/:id/comments",
  authorize("technician", "admin"),
  [body("body").trim().notEmpty().withMessage("Comment body is required")],
  validateRequest,
  addComment
);

module.exports = router;
