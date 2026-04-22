const Comment = require("../models/commentModel");
const Fault = require("../models/faultModel");
const TicketLog = require("../models/ticketLogModel");
const Ticket = require("../models/ticketModel");
const User = require("../models/userModel");
const {
  buildOwnTicketFilter,
  buildVisibleTicketFilter,
  canDeleteTicket,
  canManageTicket,
  canViewTicket,
  canViewTicketList,
  canSetTicketPriority,
  getEditableTicketFields,
  getCreatableTicketFields,
  getAllowedPriorities,
  getAllowedStatusTransitions
} = require("../security/rbac");
const { assignTicket, changeStatus, updatePriority } = require("../services/ticketService");
const { fail, ok } = require("../utils/apiResponse");

const createTicket = async (req, res, next) => {
  try {
    return fail(res, "Use POST /api/faults to create a fault report and linked ticket", 405);
  } catch (error) {
    return next(error);
  }
};

const getTickets = async (req, res, next) => {
  try {
    // STRICT: Only technicians and admins can view all tickets
    if (!canViewTicketList(req.user)) {
      return fail(res, "Access denied: Users can only view their own tickets", 403);
    }

    const filters = buildVisibleTicketFilter(req.user, { ...req.query });
    const tickets = await Ticket.getAll(filters);
    return ok(res, "Tickets fetched", tickets);
  } catch (error) {
    return next(error);
  }
};

const getMyTickets = async (req, res, next) => {
  try {
    const filters = buildOwnTicketFilter(req.user, { ...req.query });
    const tickets = await Ticket.getAll(filters);
    return ok(res, "My tickets fetched", tickets);
  } catch (error) {
    return next(error);
  }
};

const getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return fail(res, "Ticket not found", 404);
    }

    if (!canViewTicket(req.user, ticket)) {
      return fail(res, "Access denied", 403);
    }

    const [logs, fault, comments] = await Promise.all([
      TicketLog.getByTicketId(ticket.id),
      Fault.findById(ticket.fault_id),
      Comment.getByTicketId(ticket.id)
    ]);

    return ok(res, "Ticket fetched", { ...ticket, fault, comments, logs });
  } catch (error) {
    return next(error);
  }
};

const updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return fail(res, "Ticket not found", 404);
    }

    // STRICT: Users CANNOT update tickets - only view their own
    if (req.user.role === "user") {
      return fail(res, "Access denied: Users cannot update tickets", 403);
    }

    if (!canManageTicket(req.user)) {
      return fail(res, "Access denied", 403);
    }

    // STRICT: Block unauthorized field modifications
    if (req.body.assigned_to !== undefined || req.body.status !== undefined) {
      return fail(res, "Use the dedicated assignment or status endpoints", 403);
    }

    // CRITICAL: Users CANNOT set priority - block this completely
    if (req.body.priority !== undefined) {
      if (!canSetTicketPriority(req.user)) {
        return fail(res, "Access denied: Users cannot set ticket priority", 403);
      }
<<<<<<< HEAD
      
=======

>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
      const allowedPriorities = getAllowedPriorities(req.user.role);
      if (!allowedPriorities.includes(req.body.priority)) {
        return fail(res, `Invalid priority for role ${req.user.role}`, 400);
      }
    }

    const editableFields = getEditableTicketFields(req.user.role);
    const safePayload = {};
    for (const key of editableFields) {
      if (req.body[key] !== undefined) {
        safePayload[key] = req.body[key];
      }
    }

    if (!Object.keys(safePayload).length) {
      return fail(res, "No permitted ticket fields provided for this role", 400);
    }

    await Ticket.updateById(req.params.id, safePayload);
    await TicketLog.create({
      ticket_id: req.params.id,
      action: "Ticket details updated",
      performed_by: req.user.id
    });

    const updated = await Ticket.findById(req.params.id);
    return ok(res, "Ticket updated", updated);
  } catch (error) {
    return next(error);
  }
};

const deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return fail(res, "Ticket not found", 404);
    }

    if (!canDeleteTicket(req.user)) {
      return fail(res, "Access denied", 403);
    }

    await Ticket.removeById(req.params.id);
    await Promise.all([Fault.removeByTicketId(req.params.id), Comment.removeByTicketId(req.params.id)]);

    return ok(res, "Ticket deleted");
  } catch (error) {
    return next(error);
  }
};

const assignTicketToTechnician = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return fail(res, "Ticket not found", 404);
    }

    if (!canManageTicket(req.user) || !canViewTicket(req.user, ticket)) {
      return fail(res, "Access denied", 403);
    }

    const { technician_id } = req.body;
    const technicians = await User.listAssignableUsers();
    const validTechnician = technicians.find((item) => item.id === technician_id);
    if (!validTechnician) {
      return fail(res, "Invalid technician_id", 400);
    }

    const updated = await assignTicket({
      ticketId: req.params.id,
      technicianId: technician_id,
      performedBy: req.user.id
    });

    return ok(res, "Ticket assigned", updated);
  } catch (error) {
    return next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return fail(res, "Ticket not found", 404);
    }

    // STRICT: Users CANNOT update status
    if (req.user.role === "user") {
      return fail(res, "Access denied: Users cannot update ticket status", 403);
    }

    if (!canManageTicket(req.user) || !canViewTicket(req.user, ticket)) {
      return fail(res, "Access denied", 403);
    }

    // STRICT: Validate status transitions by role
    const allowedStatuses = getAllowedStatusTransitions(req.user.role);
    if (!allowedStatuses.includes(req.body.status)) {
      return fail(res, `Invalid status transition for role ${req.user.role}`, 400);
    }

    const updated = await changeStatus({
      ticketId: req.params.id,
      nextStatus: req.body.status,
      performedBy: req.user.id,
      resolutionNotes: req.body.resolution_notes,
      role: req.user.role
    });

    return ok(res, "Ticket status updated", updated);
  } catch (error) {
    return next(error);
  }
};

const updateTicketPriority = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return fail(res, "Ticket not found", 404);
    }

    // CRITICAL: Users CANNOT update priority - only technicians and admins
    if (!canSetTicketPriority(req.user)) {
      return fail(res, "Access denied: Only technicians and admins can set priority", 403);
    }

    if (!canManageTicket(req.user) || !canViewTicket(req.user, ticket)) {
      return fail(res, "Access denied", 403);
    }

    // STRICT: Validate priority is allowed for this role
    const allowedPriorities = getAllowedPriorities(req.user.role);
    if (!allowedPriorities.includes(req.body.priority)) {
      return fail(res, `Invalid priority for role ${req.user.role}`, 400);
    }

    const updated = await updatePriority({
      ticketId: req.params.id,
      nextPriority: req.body.priority,
      performedBy: req.user.id
    });
    return ok(res, "Ticket priority updated", updated);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  assignTicketToTechnician,
  createTicket,
  deleteTicket,
  getTicketById,
  getMyTickets,
  getTickets,
  updateStatus,
  updateTicket,
  updateTicketPriority
};
