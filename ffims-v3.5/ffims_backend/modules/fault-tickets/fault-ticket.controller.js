const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/api-response");
const faultTicketService = require("./fault-ticket.service");

const listTickets = asyncHandler(async (req, res) => {
  const result = await faultTicketService.listTickets(req.query, req.user);
  sendSuccess(res, {
    message: "Tickets retrieved successfully.",
    data: result.items,
    meta: result.meta,
  });
});

const createTicket = asyncHandler(async (req, res) => {
  const ticket = await faultTicketService.createTicket(req.body, req.user, req);
  sendSuccess(res, {
    statusCode: 201,
    message: "Ticket created successfully.",
    data: ticket,
  });
});

const getTicket = asyncHandler(async (req, res) => {
  const ticket = await faultTicketService.getTicketById(req.params.ticketId, req.user);
  sendSuccess(res, {
    message: "Ticket retrieved successfully.",
    data: ticket,
  });
});

const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await faultTicketService.updateTicket(
    req.params.ticketId,
    req.body,
    req.user,
    req
  );
  sendSuccess(res, {
    message: "Ticket updated successfully.",
    data: ticket,
  });
});

const deleteTicket = asyncHandler(async (req, res) => {
  await faultTicketService.deleteTicket(req.params.ticketId, req.user, req);
  sendSuccess(res, {
    message: "Ticket deleted successfully.",
    data: null,
  });
});

const updateTicketStatus = asyncHandler(async (req, res) => {
  const ticket = await faultTicketService.updateTicketStatus(
    req.params.ticketId,
    req.body.status,
    req.user,
    req
  );
  sendSuccess(res, {
    message: "Ticket status updated successfully.",
    data: ticket,
  });
});

const updateTicketPriority = asyncHandler(async (req, res) => {
  const ticket = await faultTicketService.updateTicketPriority(
    req.params.ticketId,
    req.body.priority,
    req.user,
    req
  );
  sendSuccess(res, {
    message: "Ticket priority updated successfully.",
    data: ticket,
  });
});

const createAssignment = asyncHandler(async (req, res) => {
  const assignment = await faultTicketService.createAssignment(
    req.params.ticketId,
    req.body,
    req.user,
    req
  );
  sendSuccess(res, {
    statusCode: 201,
    message: "Ticket assignment created successfully.",
    data: assignment,
  });
});

const listAssignments = asyncHandler(async (req, res) => {
  const assignments = await faultTicketService.listAssignments(req.params.ticketId, req.user);
  sendSuccess(res, {
    message: "Ticket assignments retrieved successfully.",
    data: assignments,
  });
});

const removeAssignment = asyncHandler(async (req, res) => {
  await faultTicketService.removeAssignment(
    req.params.ticketId,
    req.params.assignmentId,
    req.user,
    req
  );
  sendSuccess(res, {
    message: "Ticket assignment removed successfully.",
    data: null,
  });
});

const listComments = asyncHandler(async (req, res) => {
  const comments = await faultTicketService.listComments(req.params.ticketId, req.user);
  sendSuccess(res, {
    message: "Ticket comments retrieved successfully.",
    data: comments,
  });
});

const createComment = asyncHandler(async (req, res) => {
  const comment = await faultTicketService.createComment(
    req.params.ticketId,
    req.body.comment,
    req.user,
    req
  );
  sendSuccess(res, {
    statusCode: 201,
    message: "Ticket comment created successfully.",
    data: comment,
  });
});

const createAttachment = asyncHandler(async (req, res) => {
  const attachment = await faultTicketService.createAttachment(
    req.params.ticketId,
    req.body,
    req.user,
    req
  );
  sendSuccess(res, {
    statusCode: 201,
    message: "Ticket attachment created successfully.",
    data: attachment,
  });
});

const getSummary = asyncHandler(async (req, res) => {
  const summary = await faultTicketService.getTicketSummary(req.user);
  sendSuccess(res, {
    message: "Ticket summary retrieved successfully.",
    data: summary,
  });
});

module.exports = {
  createAssignment,
  createAttachment,
  createComment,
  createTicket,
  deleteTicket,
  getSummary,
  getTicket,
  listAssignments,
  listComments,
  listTickets,
  removeAssignment,
  updateTicket,
  updateTicketPriority,
  updateTicketStatus,
};
