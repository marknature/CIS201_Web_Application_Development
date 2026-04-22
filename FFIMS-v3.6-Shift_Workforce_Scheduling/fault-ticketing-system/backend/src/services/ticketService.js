const Ticket = require("../models/ticketModel");
const TicketLog = require("../models/ticketLogModel");
const Fault = require("../models/faultModel");
const { PRIORITIES } = require("../models/mongoCollections");
const { notify } = require("./notificationService");
const { ADMIN_OVERRIDE_STATUSES, STATUS, canTransition } = require("../utils/ticketWorkflow");

const faultStatusByTicketStatus = Object.freeze({
  Open: "Reported",
  Assigned: "Triaged",
  "In Progress": "In Progress",
  Resolved: "Resolved",
  Closed: "Closed",
  Escalated: "Escalated"
});

const assignTicket = async ({ ticketId, technicianId, performedBy }) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    const error = new Error("Ticket not found");
    error.statusCode = 404;
    throw error;
  }

  const updated = await Ticket.updateById(ticketId, {
    assigned_to: technicianId,
    status: ticket.status === STATUS.OPEN ? STATUS.ASSIGNED : ticket.status
  });

  await TicketLog.create({
    ticket_id: ticketId,
    action: `Assigned ticket to technician #${technicianId}`,
    performed_by: performedBy
  });

  if (ticket.fault_id) {
    await Fault.updateById(ticket.fault_id, {
      status: faultStatusByTicketStatus[updated.status] || "Triaged"
    });
  }

<<<<<<< HEAD
  await notify(technicianId, `A ticket (#${ticketId}) has been assigned to you.`);
=======
  await notify(technicianId, `A ticket (#${ticketId}) has been assigned to you.`, ticketId);
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
  return updated;
};

const updatePriority = async ({ ticketId, nextPriority, performedBy }) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    const error = new Error("Ticket not found");
    error.statusCode = 404;
    throw error;
  }

  if (!PRIORITIES.includes(nextPriority)) {
    const error = new Error("Invalid priority value");
    error.statusCode = 400;
    throw error;
  }

  if (ticket.priority === nextPriority) {
    return ticket;
  }

  const updated = await Ticket.updateById(ticketId, { priority: nextPriority });
  await TicketLog.create({
    ticket_id: ticketId,
    action: `Priority changed from ${ticket.priority} to ${nextPriority}`,
    performed_by: performedBy
  });

<<<<<<< HEAD
  await notify(ticket.created_by, `Ticket #${ticketId} priority is now "${nextPriority}".`);
=======
  await notify(ticket.created_by, `Ticket #${ticketId} priority is now "${nextPriority}".`, ticketId);
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
  return updated;
};

const canRoleChangeStatus = ({ currentStatus, nextStatus, role }) => {
  if (role === "admin") {
    return ADMIN_OVERRIDE_STATUSES.includes(nextStatus) && currentStatus !== nextStatus;
  }

  return canTransition(currentStatus, nextStatus);
};

const changeStatus = async ({ ticketId, nextStatus, performedBy, resolutionNotes, role }) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket) {
    const error = new Error("Ticket not found");
    error.statusCode = 404;
    throw error;
  }

  if (!canRoleChangeStatus({ currentStatus: ticket.status, nextStatus, role })) {
    const error = new Error(`Invalid status transition: ${ticket.status} -> ${nextStatus}`);
    error.statusCode = 400;
    throw error;
  }

  const payload = { status: nextStatus };
  if (nextStatus === STATUS.RESOLVED) {
    payload.resolved_at = new Date();
    payload.resolution_notes = resolutionNotes || ticket.resolution_notes;
  }

  if (nextStatus !== STATUS.RESOLVED) {
    payload.resolved_at = nextStatus === STATUS.CLOSED ? ticket.resolved_at : null;
  }

  const updated = await Ticket.updateById(ticketId, payload);
  await TicketLog.create({
    ticket_id: ticketId,
    action: `Status changed from ${ticket.status} to ${nextStatus}`,
    performed_by: performedBy
  });

  if (ticket.fault_id) {
    await Fault.updateById(ticket.fault_id, {
      status: faultStatusByTicketStatus[nextStatus] || "Reported"
    });
  }

<<<<<<< HEAD
  await notify(ticket.created_by, `Ticket #${ticketId} moved to "${nextStatus}".`);
=======
  await notify(ticket.created_by, `Ticket #${ticketId} moved to "${nextStatus}".`, ticketId);
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
  return updated;
};

const escalateTicket = async ({ ticketId, performedBy }) => {
  const ticket = await Ticket.findById(ticketId);
  if (!ticket || ticket.status === STATUS.ESCALATED) return null;

  const updated = await Ticket.updateById(ticketId, { status: STATUS.ESCALATED });
  await TicketLog.create({
    ticket_id: ticketId,
    action: "Auto escalated due to SLA threshold",
    performed_by: performedBy
  });

  if (ticket.fault_id) {
    await Fault.updateById(ticket.fault_id, { status: "Escalated" });
  }

<<<<<<< HEAD
  await notify(ticket.created_by, `Ticket #${ticketId} has been escalated.`);
=======
  await notify(ticket.created_by, `Ticket #${ticketId} has been escalated.`, ticketId);
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
  if (ticket.assigned_to) {
    await notify(ticket.assigned_to, `Assigned ticket #${ticketId} has been escalated.`, ticketId);
  }
  return updated;
};

module.exports = {
  assignTicket,
  changeStatus,
  escalateTicket,
  updatePriority
};
