const express = require("express");
const validate = require("../../middleware/validation.middleware");
const { authenticateToken } = require("../../middleware/auth.middleware");
const { isTechnician, isUser, isAdmin } = require("./fault-rbac.middleware");
const controller = require("./fault-ticketing.controller");
const { validateUpdateTicket } = require("./fault-ticketing.validation");

const router = express.Router();

/** 
 * User Routes (Student/Staff)
 * - POST /tickets (Report)
 * - GET /tickets/my (Track own)
 */
router.get("/my", authenticateToken, isUser, controller.listTickets);
router.post("/", authenticateToken, isUser, controller.createFault);

/**
 * Technician & Admin Routes
 * - GET /tickets (View all)
 * - PUT /tickets/:id/status
 * - PUT /tickets/:id/priority
 * - PUT /tickets/:id/assign
 */
router.get("/", authenticateToken, isTechnician, controller.listTickets);
router.get("/:id", authenticateToken, isUser, controller.getTicket);

router.put("/:id", authenticateToken, isTechnician, controller.updateTicket);
router.put("/:id/assign", authenticateToken, isTechnician, controller.assignTicket);
router.put("/:id/status", authenticateToken, isTechnician, controller.updateTicketStatus);
router.put("/:id/priority", authenticateToken, isTechnician, controller.updateTicketPriority);
router.put("/:id/escalate", authenticateToken, isTechnician, controller.escalateTicket);

/**
 * Administrative Routes
 */
router.delete("/:id", authenticateToken, isAdmin, controller.deleteTicket);

module.exports = router;
