const asyncHandler = require("../../utils/asyncHandler");
const faultTicketingService = require("./fault-ticketing.service");

const createFault = asyncHandler(async (req, res) => {
  const reqInfo = { ip: req.ip, userAgent: req.headers["user-agent"] };
  const ticket = await faultTicketingService.createFault(req.body, req.user, reqInfo);
  res.status(201).json({
    message: "Fault reported successfully.",
    ticket,
  });
});

const listTickets = asyncHandler(async (req, res) => {
  const result = await faultTicketingService.listTickets(req.query, req.user);
  res.json(result);
});

const getTicket = asyncHandler(async (req, res) => {
  const ticket = await faultTicketingService.getTicketById(req.params.id, req.user);
  res.json({ ticket });
});

const updateTicketStatus = asyncHandler(async (req, res) => {
  const reqInfo = { ip: req.ip, userAgent: req.headers["user-agent"] };
  const ticket = await faultTicketingService.updateTicketStatus(req.params.id, req.body, req.user, reqInfo);
  res.json({
    message: "Ticket status updated successfully.",
    ticket,
  });
});

const updateTicketPriority = asyncHandler(async (req, res) => {
  const reqInfo = { ip: req.ip, userAgent: req.headers["user-agent"] };
  const ticket = await faultTicketingService.updateTicketPriority(req.params.id, req.body, req.user, reqInfo);
  res.json({
    message: "Ticket priority updated successfully.",
    ticket,
  });
});

const assignTicket = asyncHandler(async (req, res) => {
  const reqInfo = { ip: req.ip, userAgent: req.headers["user-agent"] };
  const ticket = await faultTicketingService.assignTicket(req.params.id, req.body, req.user, reqInfo);
  res.json({
    message: "Ticket assignment updated successfully.",
    ticket,
  });
});

const escalateTicket = asyncHandler(async (req, res) => {
  const reqInfo = { ip: req.ip, userAgent: req.headers["user-agent"] };
  const ticket = await faultTicketingService.escalateTicket(req.params.id, req.user, reqInfo);
  res.json({
    message: "Ticket escalated successfully.",
    ticket,
  });
});

const deleteTicket = asyncHandler(async (req, res) => {
  const reqInfo = { ip: req.ip, userAgent: req.headers["user-agent"] };
  const result = await faultTicketingService.deleteTicket(req.params.id, req.user, reqInfo);
  res.json(result);
});

const createComment = asyncHandler(async (req, res) => {
  const reqInfo = { ip: req.ip, userAgent: req.headers["user-agent"] };
  const result = await faultTicketingService.addComment(req.body, req.user, reqInfo);
  res.status(201).json({
    message: "Comment added successfully.",
    ...result,
  });
});

const getStats = asyncHandler(async (req, res) => {
  const result = await faultTicketingService.getStats(req.user);
  res.json(result);
});

const getRecentFaults = asyncHandler(async (req, res) => {
  const result = await faultTicketingService.getRecentFaults(req.query, req.user);
  res.json({ tickets: result });
});

const updateTicket = asyncHandler(async (req, res) => {
  const reqInfo = { ip: req.ip, userAgent: req.headers["user-agent"] };
  const ticket = await faultTicketingService.updateTicket(req.params.id, req.body, req.user, reqInfo);
  res.json({
    message: "Ticket updated successfully.",
    ticket,
  });
});

module.exports = {
  createComment,
  createFault,
  deleteTicket,
  escalateTicket,
  getTicket,
  getStats,
  getRecentFaults,
  listTickets,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  updateTicket,
};
