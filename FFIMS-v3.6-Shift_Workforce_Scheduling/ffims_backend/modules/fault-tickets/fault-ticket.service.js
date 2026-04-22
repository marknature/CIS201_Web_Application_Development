const ApiError = require("../../utils/apiError");
const { createAuditLog } = require("../../utils/audit");
const FaultTicket = require("../../models/fault-ticket.model");
const TicketAssignment = require("../../models/ticket-assignment.model");
const TicketComment = require("../../models/ticket-comment.model");
const TicketAttachment = require("../../models/ticket-attachment.model");
const User = require("../../models/user.model");

const ADMIN_ROLES = ["Admin"];
const STAFF_ROLES = ["Admin", "Technician", "Facilities Staff", "Operations Staff", "Fleet Staff"];

const isAdmin = (user) => ADMIN_ROLES.includes(user?.role);
const isStaff = (user) => STAFF_ROLES.includes(user?.role);
const toIdString = (value) => (value ? value.toString() : null);

const formatTicket = (ticket) => ({
  id: ticket._id,
  ticketNumber: ticket.ticketNumber,
  title: ticket.title,
  description: ticket.description,
  ticketType: ticket.ticketType,
  priority: ticket.priority,
  status: ticket.status,
  reportedBy: toIdString(ticket.reportedBy?._id || ticket.reportedBy),
  facilityId: toIdString(ticket.facilityId),
  roomId: toIdString(ticket.roomId),
  assetId: toIdString(ticket.assetId),
  vehicleId: toIdString(ticket.vehicleId),
  bookingId: toIdString(ticket.bookingId),
  projectId: toIdString(ticket.projectId),
  workOrderId: toIdString(ticket.workOrderId),
  dueDate: ticket.dueDate,
  resolvedAt: ticket.resolvedAt,
  closedAt: ticket.closedAt,
  createdAt: ticket.createdAt,
  updatedAt: ticket.updatedAt,
});

const formatAssignment = (assignment) => ({
  id: assignment._id,
  ticketId: toIdString(assignment.ticketId),
  userId: toIdString(assignment.userId?._id || assignment.userId),
  assignedRole: assignment.assignedRole,
  assignedAt: assignment.assignedAt,
  assignedBy: toIdString(assignment.assignedBy),
  status: assignment.status,
});

const formatComment = (comment) => ({
  id: comment._id,
  ticketId: toIdString(comment.ticketId),
  userId: toIdString(comment.userId?._id || comment.userId),
  comment: comment.comment,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
});

const formatAttachment = (attachment) => ({
  id: attachment._id,
  ticketId: toIdString(attachment.ticketId),
  uploadedBy: toIdString(attachment.uploadedBy),
  fileName: attachment.fileName,
  fileUrl: attachment.fileUrl,
  mimeType: attachment.mimeType,
  fileSize: attachment.fileSize,
  createdAt: attachment.createdAt,
  updatedAt: attachment.updatedAt,
});

const generateTicketNumber = async () => {
  const prefix = `FT-${new Date().getFullYear()}`;
  const lastTicket = await FaultTicket.findOne({
    ticketNumber: new RegExp(`^${prefix}-`),
  })
    .sort({ createdAt: -1 })
    .select("ticketNumber");

  const lastSequence = lastTicket?.ticketNumber
    ? Number(lastTicket.ticketNumber.split("-").pop())
    : 0;

  return `${prefix}-${String(lastSequence + 1).padStart(4, "0")}`;
};

const buildListQuery = async (filters, user) => {
  const query = { isDeleted: false };

  if (filters.status) query.status = filters.status;
  if (filters.priority) query.priority = filters.priority;
  if (filters.facilityId) query.facilityId = filters.facilityId;
  if (filters.reportedBy && filters.reportedBy !== "me") query.reportedBy = filters.reportedBy;
  if (filters.reportedBy === "me") query.reportedBy = user._id;

  if (!isStaff(user)) {
    query.reportedBy = user._id;
    return query;
  }

  if (user.role === "Technician") {
    const assignments = await TicketAssignment.find({ userId: user._id }).select("ticketId");
    query._id = { $in: assignments.map((assignment) => assignment.ticketId) };
  } else if (filters.assignedTo) {
    const assignments = await TicketAssignment.find({ userId: filters.assignedTo }).select("ticketId");
    query._id = { $in: assignments.map((assignment) => assignment.ticketId) };
  }

  return query;
};

const getTicketOrFail = async (ticketId) => {
  const ticket = await FaultTicket.findOne({ _id: ticketId, isDeleted: false });
  if (!ticket) throw new ApiError(404, "Ticket not found.");
  return ticket;
};

const assertCanViewTicket = async (ticket, user) => {
  if (isAdmin(user) || ["Facilities Staff", "Operations Staff", "Fleet Staff"].includes(user.role)) {
    return;
  }

  if (toIdString(ticket.reportedBy) === toIdString(user._id)) return;

  if (user.role === "Technician") {
    const assignment = await TicketAssignment.findOne({ ticketId: ticket._id, userId: user._id });
    if (assignment) return;
  }

  throw new ApiError(403, "You do not have permission to access this ticket.");
};

const assertCanModifyTicket = async (ticket, user) => {
  if (isAdmin(user) || ["Facilities Staff", "Operations Staff", "Fleet Staff"].includes(user.role)) {
    return;
  }

  if (user.role === "Technician") {
    const assignment = await TicketAssignment.findOne({ ticketId: ticket._id, userId: user._id });
    if (assignment) return;
  }

  if (toIdString(ticket.reportedBy) === toIdString(user._id) && ["open", "assigned"].includes(ticket.status)) {
    return;
  }

  throw new ApiError(403, "You do not have permission to modify this ticket.");
};

const listTickets = async (filters, user) => {
  const page = Math.max(Number(filters.page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(filters.pageSize) || 20, 1), 100);
  const sortField = filters.sortBy || "createdAt";
  const sortOrder = filters.sortOrder === "asc" ? 1 : -1;
  const query = await buildListQuery(filters, user);

  const [tickets, total] = await Promise.all([
    FaultTicket.find(query)
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    FaultTicket.countDocuments(query),
  ]);

  return {
    items: tickets.map(formatTicket),
    meta: { page, pageSize, total },
  };
};

const createTicket = async (payload, user, req) => {
  const ticket = await FaultTicket.create({
    ticketNumber: await generateTicketNumber(),
    title: payload.title.trim(),
    description: payload.description?.trim() || "",
    ticketType: payload.ticketType?.trim() || "fault",
    priority: payload.priority || "medium",
    status: payload.status || "open",
    reportedBy: user._id,
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
    userId: user._id,
    moduleName: "fault-tickets",
    action: "ticket_create",
    entityName: "faulttickets",
    entityId: ticket._id,
    newValues: { ticketNumber: ticket.ticketNumber, outcome: "success" },
    req,
  });

  return formatTicket(ticket);
};

const getTicketById = async (ticketId, user) => {
  const ticket = await getTicketOrFail(ticketId);
  await assertCanViewTicket(ticket, user);
  return formatTicket(ticket);
};

const updateTicket = async (ticketId, payload, user, req) => {
  const ticket = await getTicketOrFail(ticketId);
  await assertCanModifyTicket(ticket, user);

  const oldValues = formatTicket(ticket);
  const fields = [
    "title",
    "description",
    "ticketType",
    "priority",
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

  if (payload.status !== undefined) {
    ticket.status = payload.status;
    if (payload.status === "resolved") ticket.resolvedAt = new Date();
    if (payload.status === "closed") ticket.closedAt = new Date();
  }

  await ticket.save();

  await createAuditLog({
    userId: user._id,
    moduleName: "fault-tickets",
    action: "ticket_update",
    entityName: "faulttickets",
    entityId: ticket._id,
    oldValues,
    newValues: formatTicket(ticket),
    req,
  });

  return formatTicket(ticket);
};

const deleteTicket = async (ticketId, user, req) => {
  if (!isAdmin(user)) throw new ApiError(403, "Only admins can delete tickets.");

  const ticket = await getTicketOrFail(ticketId);
  ticket.isDeleted = true;
  ticket.deletedAt = new Date();
  await ticket.save();

  await createAuditLog({
    userId: user._id,
    moduleName: "fault-tickets",
    action: "ticket_delete",
    entityName: "faulttickets",
    entityId: ticket._id,
    newValues: { isDeleted: true, outcome: "success" },
    req,
  });
};

const updateTicketStatus = async (ticketId, status, user, req) => {
  const ticket = await getTicketOrFail(ticketId);
  await assertCanModifyTicket(ticket, user);

  if (user.role === "Technician") {
    const assignment = await TicketAssignment.findOne({ ticketId: ticket._id, userId: user._id });
    if (!assignment) throw new ApiError(403, "Technicians can only update assigned tickets.");
  }

  const previousStatus = ticket.status;
  ticket.status = status;
  if (status === "resolved") ticket.resolvedAt = new Date();
  if (status === "closed") ticket.closedAt = new Date();
  await ticket.save();

  await createAuditLog({
    userId: user._id,
    moduleName: "fault-tickets",
    action: "ticket_status_update",
    entityName: "faulttickets",
    entityId: ticket._id,
    oldValues: { status: previousStatus },
    newValues: { status },
    req,
  });

  return formatTicket(ticket);
};

const updateTicketPriority = async (ticketId, priority, user, req) => {
  if (!isStaff(user)) {
    throw new ApiError(403, "You do not have permission to update ticket priority.");
  }

  const ticket = await getTicketOrFail(ticketId);
  const previousPriority = ticket.priority;
  ticket.priority = priority;
  await ticket.save();

  await createAuditLog({
    userId: user._id,
    moduleName: "fault-tickets",
    action: "ticket_priority_update",
    entityName: "faulttickets",
    entityId: ticket._id,
    oldValues: { priority: previousPriority },
    newValues: { priority },
    req,
  });

  return formatTicket(ticket);
};

const createAssignment = async (ticketId, payload, user, req) => {
  if (!isStaff(user)) throw new ApiError(403, "You do not have permission to assign tickets.");

  const ticket = await getTicketOrFail(ticketId);
  const assignee = await User.findById(payload.userId);
  if (!assignee || !assignee.isActive) throw new ApiError(404, "Assignee user not found.");

  const assignment = await TicketAssignment.create({
    ticketId: ticket._id,
    userId: assignee._id,
    assignedRole: payload.assignedRole?.trim() || assignee.role,
    assignedBy: user._id,
    status: "assigned",
  });

  if (ticket.status === "open") {
    ticket.status = "assigned";
    await ticket.save();
  }

  await createAuditLog({
    userId: user._id,
    moduleName: "fault-tickets",
    action: "ticket_assignment_create",
    entityName: "ticketassignments",
    entityId: assignment._id,
    newValues: {
      ticketId: ticket._id.toString(),
      assignedUserId: assignee._id.toString(),
      outcome: "success",
    },
    req,
  });

  return formatAssignment(assignment);
};

const listAssignments = async (ticketId, user) => {
  const ticket = await getTicketOrFail(ticketId);
  await assertCanViewTicket(ticket, user);
  const assignments = await TicketAssignment.find({ ticketId }).sort({ assignedAt: -1 });
  return assignments.map(formatAssignment);
};

const removeAssignment = async (ticketId, assignmentId, user, req) => {
  if (!isStaff(user)) {
    throw new ApiError(403, "You do not have permission to remove assignments.");
  }

  const assignment = await TicketAssignment.findOne({ _id: assignmentId, ticketId });
  if (!assignment) throw new ApiError(404, "Assignment not found.");
  await TicketAssignment.deleteOne({ _id: assignment._id });

  await createAuditLog({
    userId: user._id,
    moduleName: "fault-tickets",
    action: "ticket_assignment_remove",
    entityName: "ticketassignments",
    entityId: assignment._id,
    newValues: { outcome: "success" },
    req,
  });
};

const listComments = async (ticketId, user) => {
  const ticket = await getTicketOrFail(ticketId);
  await assertCanViewTicket(ticket, user);
  const comments = await TicketComment.find({ ticketId }).sort({ createdAt: 1 });
  return comments.map(formatComment);
};

const createComment = async (ticketId, commentText, user, req) => {
  const ticket = await getTicketOrFail(ticketId);
  await assertCanViewTicket(ticket, user);

  const comment = await TicketComment.create({
    ticketId: ticket._id,
    userId: user._id,
    comment: commentText.trim(),
  });

  await createAuditLog({
    userId: user._id,
    moduleName: "fault-tickets",
    action: "ticket_comment_create",
    entityName: "ticketcomments",
    entityId: comment._id,
    newValues: { ticketId: ticket._id.toString(), outcome: "success" },
    req,
  });

  return formatComment(comment);
};

const createAttachment = async (ticketId, payload, user, req) => {
  const ticket = await getTicketOrFail(ticketId);
  await assertCanModifyTicket(ticket, user);

  const attachment = await TicketAttachment.create({
    ticketId: ticket._id,
    uploadedBy: user._id,
    fileName: payload.fileName.trim(),
    fileUrl: payload.fileUrl.trim(),
    mimeType: payload.mimeType?.trim() || "",
    fileSize: payload.fileSize || 0,
  });

  await createAuditLog({
    userId: user._id,
    moduleName: "fault-tickets",
    action: "ticket_attachment_create",
    entityName: "ticketattachments",
    entityId: attachment._id,
    newValues: { ticketId: ticket._id.toString(), outcome: "success" },
    req,
  });

  return formatAttachment(attachment);
};

const getTicketSummary = async (user) => {
  const query = await buildListQuery({}, user);
  const [total, open, inProgress, resolved, overdue] = await Promise.all([
    FaultTicket.countDocuments(query),
    FaultTicket.countDocuments({ ...query, status: "open" }),
    FaultTicket.countDocuments({ ...query, status: "in_progress" }),
    FaultTicket.countDocuments({ ...query, status: "resolved" }),
    FaultTicket.countDocuments({ ...query, status: "overdue" }),
  ]);

  return { total, open, inProgress, resolved, overdue };
};

module.exports = {
  createAssignment,
  createAttachment,
  createComment,
  createTicket,
  deleteTicket,
  getTicketById,
  getTicketSummary,
  listAssignments,
  listComments,
  listTickets,
  removeAssignment,
  updateTicket,
  updateTicketPriority,
  updateTicketStatus,
};
