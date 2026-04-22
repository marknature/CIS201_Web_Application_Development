const mongoose = require("mongoose");
const ApiError = require("../../utils/apiError");
const { createAuditLog } = require("../../utils/audit");
const FaultTicket = require("../../models/fault-ticket.model");
const User = require("../../models/user.model");

const assertValidObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(400, `${fieldName} must be a valid id.`);
  }
};

const ensureUserExists = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
};

const toResponse = (ticket) => ({
  id: ticket._id,
  ticketNumber: ticket.ticketNumber,
  title: ticket.title,
  description: ticket.description,
  ticketType: ticket.ticketType,
  priority: ticket.priority,
  status: ticket.status,
  reportedBy: ticket.reportedBy,
  facilityId: ticket.facilityId,
  roomId: ticket.roomId,
  assetId: ticket.assetId,
  vehicleId: ticket.vehicleId,
  bookingId: ticket.bookingId,
  projectId: ticket.projectId,
  workOrderId: ticket.workOrderId,
  dueDate: ticket.dueDate,
  resolvedAt: ticket.resolvedAt,
  closedAt: ticket.closedAt,
  createdAt: ticket.createdAt,
  updatedAt: ticket.updatedAt,
});

const getNextTicketNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `FT-${year}-`;
  const lastTicket = await FaultTicket.findOne({
    ticketNumber: new RegExp(`^${prefix}`),
  }).sort({ createdAt: -1 });

  const lastNumber = lastTicket?.ticketNumber
    ? Number(lastTicket.ticketNumber.split("-").pop())
    : 0;

  return `${prefix}${String(lastNumber + 1).padStart(4, "0")}`;
};

const listFaultTickets = async (filters, currentUser) => {
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.facilityId) {
    assertValidObjectId(filters.facilityId, "facilityId");
    query.facilityId = filters.facilityId;
  }

  if (currentUser.role === "General Staff") {
    query.reportedBy = currentUser._id;
  }

  const tickets = await FaultTicket.find(query).sort({ createdAt: -1 });
  return tickets.map(toResponse);
};

const getFaultTicketById = async (id, currentUser) => {
  assertValidObjectId(id, "id");
  const ticket = await FaultTicket.findById(id);
  if (!ticket) {
    throw new ApiError(404, "Fault ticket not found.");
  }

  if (currentUser.role === "General Staff" && String(ticket.reportedBy) !== String(currentUser._id)) {
    throw new ApiError(403, "You do not have permission to view this ticket.");
  }

  return toResponse(ticket);
};

const createFaultTicket = async (payload, currentUser, req) => {
  const reportedBy = payload.reportedBy || currentUser._id;
  await ensureUserExists(reportedBy);

  const ticket = await FaultTicket.create({
    ticketNumber: await getNextTicketNumber(),
    title: payload.title.trim(),
    description: payload.description?.trim() || "",
    ticketType: payload.ticketType?.trim() || "fault",
    priority: payload.priority || "medium",
    status: payload.status || "open",
    reportedBy,
    facilityId: payload.facilityId || null,
    roomId: payload.roomId || null,
    assetId: payload.assetId || null,
    vehicleId: payload.vehicleId || null,
    bookingId: payload.bookingId || null,
    projectId: payload.projectId || null,
    workOrderId: payload.workOrderId || null,
    dueDate: payload.dueDate || null,
  });

  await createAuditLog({
    userId: currentUser._id,
    moduleName: "fault-tickets",
    action: "ticket_create",
    entityName: "faulttickets",
    entityId: ticket._id,
    newValues: { title: ticket.title, ticketNumber: ticket.ticketNumber },
    req,
  });

  return toResponse(ticket);
};

const updateFaultTicket = async (id, payload, currentUser, req) => {
  assertValidObjectId(id, "id");
  const ticket = await FaultTicket.findById(id);
  if (!ticket) {
    throw new ApiError(404, "Fault ticket not found.");
  }

  if (currentUser.role === "General Staff" && String(ticket.reportedBy) !== String(currentUser._id)) {
    throw new ApiError(403, "You do not have permission to update this ticket.");
  }

  if (payload.reportedBy !== undefined) {
    await ensureUserExists(payload.reportedBy);
    ticket.reportedBy = payload.reportedBy;
  }

  const fields = [
    "title",
    "description",
    "ticketType",
    "priority",
    "status",
    "facilityId",
    "roomId",
    "assetId",
    "vehicleId",
    "bookingId",
    "projectId",
    "workOrderId",
    "dueDate",
  ];

  for (const field of fields) {
    if (payload[field] !== undefined) {
      ticket[field] = typeof payload[field] === "string" ? payload[field].trim() : payload[field];
    }
  }

  if (ticket.status === "resolved" && !ticket.resolvedAt) {
    ticket.resolvedAt = new Date();
  }

  if (ticket.status === "closed" && !ticket.closedAt) {
    ticket.closedAt = new Date();
  }

  await ticket.save();

  await createAuditLog({
    userId: currentUser._id,
    moduleName: "fault-tickets",
    action: "ticket_update",
    entityName: "faulttickets",
    entityId: ticket._id,
    newValues: { status: ticket.status, priority: ticket.priority },
    req,
  });

  return toResponse(ticket);
};

const deleteFaultTicket = async (id) => {
  assertValidObjectId(id, "id");
  const ticket = await FaultTicket.findByIdAndDelete(id);
  if (!ticket) {
    throw new ApiError(404, "Fault ticket not found.");
  }
};

module.exports = {
  createFaultTicket,
  deleteFaultTicket,
  getFaultTicketById,
  listFaultTickets,
  toResponse,
  updateFaultTicket,
};
