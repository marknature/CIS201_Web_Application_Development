const asyncHandler = require("../../utils/asyncHandler");
const faultTicketService = require("./fault-ticket.service");

const listFaultTickets = asyncHandler(async (req, res) => {
  const tickets = await faultTicketService.listFaultTickets(req.query, req.user);
  res.json({ tickets });
});

const getFaultTicket = asyncHandler(async (req, res) => {
  const ticket = await faultTicketService.getFaultTicketById(req.params.id, req.user);
  res.json({ ticket });
});

const createFaultTicket = asyncHandler(async (req, res) => {
  const ticket = await faultTicketService.createFaultTicket(req.body, req.user, req);
  res.status(201).json({
    message: "Fault ticket created successfully.",
    ticket,
  });
});

const updateFaultTicket = asyncHandler(async (req, res) => {
  const ticket = await faultTicketService.updateFaultTicket(req.params.id, req.body, req.user, req);
  res.json({
    message: "Fault ticket updated successfully.",
    ticket,
  });
});

const deleteFaultTicket = asyncHandler(async (req, res) => {
  await faultTicketService.deleteFaultTicket(req.params.id);
  res.json({ message: "Fault ticket deleted successfully." });
});

module.exports = {
  createFaultTicket,
  deleteFaultTicket,
  getFaultTicket,
  listFaultTickets,
  updateFaultTicket,
};
