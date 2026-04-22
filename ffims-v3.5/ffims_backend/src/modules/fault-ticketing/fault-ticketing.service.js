const mongoose = require("mongoose");
const ApiError = require("../../utils/apiError");
const FaultTicket = require("../../models/fault-ticket.model");
const TicketActivity = require("../../models/ticket-activity.model");
const TicketAssignment = require("../../models/ticket-assignment.model");
const TicketComment = require("../../models/ticket-comment.model");
const User = require("../../models/user.model");

const AuditService = require("../audit/audit.service");
const NotificationService = require("../notifications/notification.service");

const ROLE_GROUPS = {
  ADMIN: new Set(["admin", "system_administrator"]),
  TECHNICIAN: new Set([
    "technician",
    "transport_manager",
    "facility_manager",
    "supervisor",
    "operational_staff",
  ]),
  USER: new Set(["user", "general_university_staff"]),
};

const TICKET_STATUSES = new Set([
  "open",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
  "escalated",
]);
const TICKET_PRIORITIES = new Set(["low", "medium", "high", "critical"]);
const ticketPopulate = [
  { path: "reportedBy", select: "firstName surname email role" },
  { path: "assignedTo", select: "firstName surname email role" },
];
const commentPopulate = [{ path: "authorId", select: "firstName surname email role" }];
const activityPopulate = [{ path: "actorId", select: "firstName surname email role" }];

const normalizeRole = (role) => String(role || "").trim().toLowerCase();
const isAdmin = (role) => ROLE_GROUPS.ADMIN.has(normalizeRole(role));
const isTechnician = (role) => ROLE_GROUPS.TECHNICIAN.has(normalizeRole(role)) || isAdmin(role);
const isStandardUser = (role) => ROLE_GROUPS.USER.has(normalizeRole(role));

const normalizeStatus = (status) => String(status || "").trim().toLowerCase();
const normalizePriority = (priority) => String(priority || "").trim().toLowerCase();

const formatStatusLabel = (status) =>
  String(status || "")
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const assertValidObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(400, `${fieldName} must be a valid id.`);
  }
};

const toUserSummary = (user) => {
  if (!user || typeof user !== "object") return null;

  // Handle both Mongoose document and plain object
  const idValue = user._id || user.id || null;
  if (!idValue) return null;

  return {
    id: String(idValue),
    fullName: user.fullName || `${user.firstName || ""} ${user.surname || ""}`.trim() || "System User",
    email: user.email || "",
    role: user.role || "user",
  };
};

const toCommentResponse = (comment) => ({
  id: comment._id,
  ticketId: comment.ticketId,
  comment: comment.comment,
  author: toUserSummary(comment.authorId),
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
});

const toActivityResponse = (activity) => ({
  id: activity._id,
  ticketId: activity.ticketId,
  action: activity.action,
  field: activity.field,
  previousValue: activity.previousValue,
  newValue: activity.newValue,
  message: activity.message,
  actor: toUserSummary(activity.actorId),
  createdAt: activity.createdAt,
});

const toTicketResponse = (ticket, extras = {}) => ({
  id: ticket._id,
  ticketNumber: ticket.ticketNumber,
  title: ticket.title,
  description: ticket.description,
  location: ticket.location || "",
  ticketType: ticket.ticketType,
  priority: ticket.priority,
  priorityLabel: formatStatusLabel(ticket.priority),
  status: ticket.status,
  statusLabel: formatStatusLabel(ticket.status),
  imageName: ticket.imageName || "",
  imageUrl: ticket.imageUrl || "",
  reportedBy: toUserSummary(ticket.reportedBy),
  assignedTechnician: toUserSummary(ticket.assignedTo),
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
  commentsCount: extras.commentsCount ?? 0,
  latestActivityAt: extras.latestActivityAt ?? ticket.updatedAt,
  comments: extras.comments ?? [],
  activityLog: extras.activityLog ?? [],
});

const buildAccessFilter = (reqUser) => {
  const userId = reqUser._id || reqUser.id;
  const role = normalizeRole(reqUser.role);

  // Users are reporters only: view own tickets
  if (isStandardUser(role)) {
    return { reportedBy: userId };
  }

  // Technicians and Admins: view all tickets
  if (isTechnician(role) || isAdmin(role)) {
    return {};
  }

  // Default to nothing if role unknown
  return { reportedBy: userId };
};

const ensureTicketVisible = async (ticketId, reqUser) => {
  assertValidObjectId(ticketId, "ticketId");

  const ticket = await FaultTicket.findOne({
    _id: ticketId,
    ...buildAccessFilter(reqUser),
  }).populate(ticketPopulate);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found.");
  }

  return ticket;
};

const ensureTechnicianAssignable = async (userId) => {
  if (!userId) return null;

  assertValidObjectId(userId, "assignedTechnicianId");
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "Assigned technician not found.");
  }

  if (!(isTechnician(user.role) || isAdmin(user.role))) {
    throw new ApiError(400, "Assigned technician must belong to a technician-capable role.");
  }

  return user;
};

const ensureCanUpdateTicket = (ticket, reqUser, payload) => {
  if (isAdmin(reqUser.role)) return;

  if (!isTechnician(reqUser.role)) {
    throw new ApiError(403, "You do not have permission to update tickets.");
  }

  // Technicians can update ANY ticket (including assignment logic) as per new requirements
  // We allow fields like priority and assignment if they are Technicians
};

const ensureCanDeleteTicket = (reqUser) => {
  if (!isAdmin(reqUser.role)) {
    throw new ApiError(403, "Only administrators can delete tickets.");
  }
};

const logAuditAction = async ({
  reqUser,
  actionType,
  entityId,
  oldValues = null,
  newValues = null,
  message = "",
  reqInfo = {},
}) => {
  await AuditService.log({
    userId: reqUser._id || reqUser.id,
    moduleName: "FAULT_TICKETING",
    actionType,
    entityName: "FaultTicket",
    entityId,
    oldValues,
    newValues,
    message,
    reqInfo,
  });
};

const checkEscalationStatus = (ticket) => {
  if (ticket.status === "escalated") return true;

  // 72-hour logic for Critical tickets
  if (ticket.priority === "critical" && (ticket.status === "assigned" || ticket.status === "in_progress")) {
    const updatedAt = new Date(ticket.updatedAt);
    const now = new Date();
    const hoursSinceUpdate = (now - updatedAt) / (1000 * 60 * 60);
    if (hoursSinceUpdate >= 72) return true;
  }

  return false;
};

const createActivity = async ({
  ticketId,
  actorId,
  action,
  field = "",
  previousValue = "",
  newValue = "",
  message,
}) => {
  await TicketActivity.create({
    ticketId,
    actorId,
    action,
    field,
    previousValue: previousValue ? String(previousValue) : "",
    newValue: newValue ? String(newValue) : "",
    message,
  });
};

const buildTicketNumber = async () => {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = Math.floor(Math.random() * 9000) + 1000;
    const candidate = `FLT-${datePart}-${suffix}`;
    const existing = await FaultTicket.exists({ ticketNumber: candidate });
    if (!existing) return candidate;
  }

  throw new ApiError(500, "Unable to generate a unique ticket number.");
};

const buildSearchFilter = (query) => {
  const search = String(query || "").trim();
  if (!search) return {};

  return {
    $or: [
      { ticketNumber: { $regex: search, $options: "i" } },
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ],
  };
};

const buildSummary = async (accessFilter) => {
  const [totalTickets, openTickets, inProgressTickets, resolvedTickets] = await Promise.all([
    FaultTicket.countDocuments(accessFilter),
    FaultTicket.countDocuments({ ...accessFilter, status: "open" }),
    FaultTicket.countDocuments({ ...accessFilter, status: "in_progress" }),
    FaultTicket.countDocuments({ ...accessFilter, status: "resolved" }),
  ]);

  return {
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
  };
};

const createFault = async (payload, reqUser, reqInfo = {}) => {
  const assignedTechnician = await ensureTechnicianAssignable(payload.assignedTechnicianId);
  const ticketNumber = await buildTicketNumber();

  const ticket = await FaultTicket.create({
    ticketNumber,
    title: payload.title.trim(),
    description: payload.description.trim(),
    location: payload.location.trim(),
    priority: normalizePriority(payload.priority || "medium"),
    status: assignedTechnician ? "assigned" : "open",
    reportedBy: reqUser._id || reqUser.id,
    assignedTo: assignedTechnician?._id || null,
    images: Array.isArray(payload.images) ? payload.images : [],
    imageUrl: payload.imageUrl?.trim() || "",
  });

  if (assignedTechnician) {
    await TicketAssignment.updateOne(
      { ticketId: ticket._id, userId: assignedTechnician._id },
      {
        ticketId: ticket._id,
        userId: assignedTechnician._id,
        assignedRole: assignedTechnician.role,
        assignedBy: reqUser._id,
        status: "assigned",
      },
      { upsert: true }
    );

    // NOTIFICATION for Technician
    await NotificationService.send({
      recipientId: assignedTechnician._id,
      senderId: reqUser._id,
      ticketId: ticket._id,
      type: "assignment",
      message: `You have been assigned to a new ticket: ${ticketNumber}`,
    });
  }

  await createActivity({
    ticketId: ticket._id,
    actorId: reqUser._id || reqUser.id,
    action: "ticket_created",
    message: `Ticket ${ticketNumber} was reported.`,
  });

  await logAuditAction({
    reqUser,
    actionType: "CREATE_TICKET",
    entityId: ticket._id,
    newValues: { ticketNumber, title: ticket.title, status: ticket.status },
    message: `Ticket ${ticketNumber} created by ${reqUser.fullName || reqUser.firstName}.`,
    reqInfo,
  });

  const savedTicket = await FaultTicket.findById(ticket._id).populate(ticketPopulate);
  return toTicketResponse(savedTicket);
};

const listTickets = async (query, reqUser) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 50);
  const accessFilter = buildAccessFilter(reqUser);
  const status = query.status ? normalizeStatus(query.status) : "";
  const priority = query.priority ? normalizePriority(query.priority) : "";
  const filters = {
    ...accessFilter,
    ...buildSearchFilter(query.search),
  };

  if (status) {
    if (!TICKET_STATUSES.has(status)) throw new ApiError(400, "Invalid status filter.");
    filters.status = status;
  }

  if (priority) {
    if (!TICKET_PRIORITIES.has(priority)) throw new ApiError(400, "Invalid priority filter.");
    filters.priority = priority;
  }

  const [tickets, totalItems, summary] = await Promise.all([
    FaultTicket.find(filters)
      .populate(ticketPopulate)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    FaultTicket.countDocuments(filters),
    buildSummary(accessFilter),
  ]);

  const ticketIds = tickets.map((ticket) => ticket._id);
  const [commentCounts, latestActivities] = await Promise.all([
    TicketComment.aggregate([
      { $match: { ticketId: { $in: ticketIds } } },
      { $group: { _id: "$ticketId", count: { $sum: 1 } } },
    ]),
    TicketActivity.aggregate([
      { $match: { ticketId: { $in: ticketIds } } },
      { $group: { _id: "$ticketId", latestActivityAt: { $max: "$createdAt" } } },
    ]),
  ]);

  const commentCountMap = new Map(commentCounts.map((item) => [String(item._id), item.count]));
  const latestActivityMap = new Map(
    latestActivities.map((item) => [String(item._id), item.latestActivityAt])
  );

  return {
    tickets: tickets.map((ticket) =>
      toTicketResponse(ticket, {
        commentsCount: commentCountMap.get(String(ticket._id)) || 0,
        latestActivityAt: latestActivityMap.get(String(ticket._id)) || ticket.updatedAt,
      })
    ),
    summary,
    meta: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(Math.ceil(totalItems / limit), 1),
    },
  };
};

const getTicketById = async (ticketId, reqUser) => {
  const ticket = await ensureTicketVisible(ticketId, reqUser);

  const [comments, activityLog] = await Promise.all([
    TicketComment.find({ ticketId }).populate(commentPopulate).sort({ createdAt: -1 }),
    TicketActivity.find({ ticketId }).populate(activityPopulate).sort({ createdAt: -1 }),
  ]);

  return toTicketResponse(ticket, {
    commentsCount: comments.length,
    comments: comments.map(toCommentResponse),
    activityLog: activityLog.map(toActivityResponse),
    latestActivityAt: activityLog[0]?.createdAt || ticket.updatedAt,
  });
};

const updateTicketStatus = async (ticketId, { status, resolutionNotes }, reqUser, reqInfo = {}) => {
  const ticket = await ensureTicketVisible(ticketId, reqUser);
  if (!isTechnician(reqUser.role) && !isAdmin(reqUser.role)) {
    throw new ApiError(403, "Only technicians or admins can update ticket status.");
  }

  const nextStatus = normalizeStatus(status);
  if (!TICKET_STATUSES.has(nextStatus)) throw new ApiError(400, "Invalid status.");

  if (ticket.status !== nextStatus || resolutionNotes !== undefined) {
    const oldStatus = ticket.status;
    ticket.status = nextStatus;
    if (nextStatus === "resolved") ticket.resolvedAt = new Date();
    if (nextStatus === "closed") ticket.closedAt = new Date();
    if (resolutionNotes !== undefined) ticket.resolutionNotes = resolutionNotes.trim();
    
    await ticket.save();

    const msg = `Status changed from ${formatStatusLabel(oldStatus)} to ${formatStatusLabel(nextStatus)}.`;
    await createActivity({
      ticketId: ticket._id,
      actorId: reqUser._id,
      action: "status_changed",
      field: "status",
      previousValue: formatStatusLabel(oldStatus),
      newValue: formatStatusLabel(nextStatus),
      message: msg,
    });

    // NOTIFICATION for Reporter
    await NotificationService.send({
      recipientId: ticket.reportedBy._id || ticket.reportedBy,
      senderId: reqUser._id,
      ticketId: ticket._id,
      type: "status_update",
      message: `Your ticket ${ticket.ticketNumber} status has been updated to ${formatStatusLabel(nextStatus)}.`,
    });

    await logAuditAction({
      reqUser,
      actionType: "UPDATE_STATUS",
      entityId: ticket._id,
      oldValues: { status: oldStatus },
      newValues: { status: nextStatus, resolutionNotes },
      message: msg,
      reqInfo,
    });
  }

  return getTicketById(ticket._id, reqUser);
};

const updateTicketPriority = async (ticketId, { priority }, reqUser, reqInfo = {}) => {
  const ticket = await ensureTicketVisible(ticketId, reqUser);
  if (!isTechnician(reqUser.role) && !isAdmin(reqUser.role)) {
    throw new ApiError(403, "Only technicians or admins can update ticket priority.");
  }

  const nextPriority = normalizePriority(priority);
  if (!TICKET_PRIORITIES.has(nextPriority)) throw new ApiError(400, "Invalid priority.");

  if (ticket.priority !== nextPriority) {
    const oldPriority = ticket.priority;
    ticket.priority = nextPriority;
    await ticket.save();

    const msg = `Priority changed from ${formatStatusLabel(oldPriority)} to ${formatStatusLabel(nextPriority)}.`;
    await createActivity({
      ticketId: ticket._id,
      actorId: reqUser._id,
      action: "priority_changed",
      field: "priority",
      previousValue: formatStatusLabel(oldPriority),
      newValue: formatStatusLabel(nextPriority),
      message: msg,
    });

    // NOTIFICATION for Reporter (Operational visibility)
    await NotificationService.send({
      recipientId: ticket.reportedBy._id || ticket.reportedBy,
      senderId: reqUser._id,
      ticketId: ticket._id,
      type: "status_update",
      message: `The priority of your ticket ${ticket.ticketNumber} has been updated to ${formatStatusLabel(nextPriority)}.`,
    });

    await logAuditAction({
      reqUser,
      actionType: "UPDATE_PRIORITY",
      entityId: ticket._id,
      oldValues: { priority: oldPriority },
      newValues: { priority: nextPriority },
      message: msg,
      reqInfo,
    });
  }

  return getTicketById(ticket._id, reqUser);
};

const escalateTicket = async (ticketId, reqUser, reqInfo = {}) => {
  const ticket = await ensureTicketVisible(ticketId, reqUser);
  if (!isTechnician(reqUser.role) && !isAdmin(reqUser.role)) {
    throw new ApiError(403, "Only technicians or admins can escalate tickets.");
  }

  if (ticket.status === "escalated") {
    throw new ApiError(400, "Ticket is already escalated.");
  }

  const oldStatus = ticket.status;
  ticket.status = "escalated";
  ticket.escalatedAt = new Date();
  ticket.escalatedBy = reqUser._id;
  await ticket.save();

  const msg = `Ticket escalated by ${reqUser.fullName || reqUser.firstName}.`;
  await createActivity({
    ticketId: ticket._id,
    actorId: reqUser._id,
    action: "status_changed",
    field: "status",
    previousValue: formatStatusLabel(oldStatus),
    newValue: "Escalated",
    message: msg,
  });

  // NOTIFICATION for Admin
  const admins = await User.find({ role: { $in: ["admin", "system_administrator"] } });
  for (const admin of admins) {
    await NotificationService.send({
      recipientId: admin._id,
      senderId: reqUser._id,
      ticketId: ticket._id,
      type: "escalation",
      message: `CRITICAL: Ticket ${ticket.ticketNumber} has been escalated.`,
    });
  }

  await logAuditAction({
    reqUser,
    actionType: "ESCALATE_TICKET",
    entityId: ticket._id,
    oldValues: { status: oldStatus },
    newValues: { status: "escalated" },
    message: msg,
    reqInfo,
  });

  return getTicketById(ticket._id, reqUser);
};

const updateTicket = async (ticketId, payload, reqUser, reqInfo = {}) => {
  const ticket = await ensureTicketVisible(ticketId, reqUser);
  ensureCanUpdateTicket(ticket, reqUser, payload);

  const updates = {};
  const activities = [];

  // Status Update
  if (payload.status && payload.status !== ticket.status) {
    const nextStatus = normalizeStatus(payload.status);
    if (!TICKET_STATUSES.has(nextStatus)) throw new ApiError(400, "Invalid status.");
    
    updates.status = nextStatus;
    if (nextStatus === "resolved") updates.resolvedAt = new Date();
    if (nextStatus === "closed") updates.closedAt = new Date();
    
    activities.push({
      action: "status_changed",
      field: "status",
      previousValue: formatStatusLabel(ticket.status),
      newValue: formatStatusLabel(nextStatus),
      message: `Status changed to ${formatStatusLabel(nextStatus)}.`,
    });

    // Notify Reporter
    await NotificationService.send({
      recipientId: ticket.reportedBy._id || ticket.reportedBy,
      senderId: reqUser._id,
      ticketId: ticket._id,
      type: "status_update",
      message: `Ticket ${ticket.ticketNumber} status updated to ${formatStatusLabel(nextStatus)}.`,
    });
  }

  // Priority Update
  if (payload.priority && payload.priority !== ticket.priority) {
    const nextPriority = normalizePriority(payload.priority);
    if (!TICKET_PRIORITIES.has(nextPriority)) throw new ApiError(400, "Invalid priority.");
    
    updates.priority = nextPriority;
    activities.push({
      action: "priority_changed",
      field: "priority",
      previousValue: formatStatusLabel(ticket.priority),
      newValue: formatStatusLabel(nextPriority),
      message: `Priority updated to ${formatStatusLabel(nextPriority)}.`,
    });
  }

  // Assignment Update
  if (payload.assignedTechnicianId !== undefined) {
    const currentAssignedId = String(ticket.assignedTo?._id || ticket.assignedTo || "");
    const nextAssignedId = String(payload.assignedTechnicianId || "");

    if (currentAssignedId !== nextAssignedId) {
      const nextAssignedUser = await ensureTechnicianAssignable(payload.assignedTechnicianId);
      updates.assignedTo = nextAssignedUser?._id || null;
      
      const nextAssigneeName = nextAssignedUser ? nextAssignedUser.fullName || `${nextAssignedUser.firstName} ${nextAssignedUser.surname}` : "Unassigned";
      
      activities.push({
        action: "assignment_changed",
        field: "assignedTechnician",
        previousValue: ticket.assignedTo ? "Assigned" : "Unassigned",
        newValue: nextAssigneeName,
        message: `Ticket assigned to ${nextAssigneeName}.`,
      });

      if (nextAssignedUser) {
        if (!updates.status && ticket.status === "open") updates.status = "assigned";
        
        await NotificationService.send({
          recipientId: nextAssignedUser._id,
          senderId: reqUser._id,
          ticketId: ticket._id,
          type: "assignment",
          message: `You have been assigned to ticket ${ticket.ticketNumber}.`,
        });
      }
    }
  }

  // Resolution Notes
  if (payload.resolutionNotes !== undefined) {
    updates.resolutionNotes = payload.resolutionNotes.trim();
  }

  if (Object.keys(updates).length > 0) {
    Object.assign(ticket, updates);
    await ticket.save();

    for (const act of activities) {
      await createActivity({
        ticketId: ticket._id,
        actorId: reqUser._id,
        ...act,
      });
    }

    await logAuditAction({
      reqUser,
      actionType: "UPDATE_TICKET",
      entityId: ticket._id,
      oldValues: updates, // Simplified for brevity in audit
      message: `Ticket ${ticket.ticketNumber} updated by staff.`,
      reqInfo,
    });
  }

  return getTicketById(ticket._id, reqUser);
};

const assignTicket = async (ticketId, { assignedTechnicianId }, reqUser, reqInfo = {}) => {
  const ticket = await ensureTicketVisible(ticketId, reqUser);
  if (!isTechnician(reqUser.role) && !isAdmin(reqUser.role)) {
    throw new ApiError(403, "Only technicians or admins can manage ticket assignments.");
  }

  const nextAssignedUser =
    assignedTechnicianId === null || assignedTechnicianId === ""
      ? null
      : await ensureTechnicianAssignable(assignedTechnicianId);

  const currentAssignedId = String(ticket.assignedTo?._id || ticket.assignedTo || "");
  const nextAssignedId = String(nextAssignedUser?._id || "");

  if (currentAssignedId !== nextAssignedId) {
    const previousAssigneeName = ticket.assignedTo
      ? `${ticket.assignedTo.firstName || ""} ${ticket.assignedTo.surname || ""}`.trim()
      : "Unassigned";
    const nextAssigneeName = nextAssignedUser ? nextAssignedUser.fullName || `${nextAssignedUser.firstName} ${nextAssignedUser.surname}` : "Unassigned";

    const msg = `Assignment updated from ${previousAssigneeName} to ${nextAssigneeName}.`;
    
    await createActivity({
      ticketId: ticket._id,
      actorId: reqUser._id,
      action: "assignment_changed",
      field: "assignedTechnician",
      previousValue: previousAssigneeName,
      newValue: nextAssigneeName,
      message: msg,
    });

    if (ticket.assignedTo) {
      await TicketAssignment.updateMany(
        { ticketId: ticket._id, status: "assigned" },
        { status: "reassigned" }
      );
    }

    ticket.assignedTo = nextAssignedUser?._id || null;
    if (nextAssignedUser) {
      ticket.status = ticket.status === "open" ? "assigned" : ticket.status;
      await TicketAssignment.updateOne(
        { ticketId: ticket._id, userId: nextAssignedUser._id },
        {
          ticketId: ticket._id,
          userId: nextAssignedUser._id,
          assignedRole: nextAssignedUser.role,
          assignedBy: reqUser._id,
          status: "assigned",
        },
        { upsert: true }
      );

      // NOTIFICATION for New Assignee
      await NotificationService.send({
        recipientId: nextAssignedUser._id,
        senderId: reqUser._id,
        ticketId: ticket._id,
        type: "assignment",
        message: `You have been assigned to ticket ${ticket.ticketNumber} by ${reqUser.fullName || reqUser.firstName}.`,
      });
    }

    // NOTIFICATION for Reporter
    await NotificationService.send({
      recipientId: ticket.reportedBy._id || ticket.reportedBy,
      senderId: reqUser._id,
      ticketId: ticket._id,
      type: "status_update",
      message: `A technician has been assigned to your ticket: ${ticket.ticketNumber}`,
    });

    await ticket.save();

    await logAuditAction({
      reqUser,
      actionType: "UPDATE_ASSIGNMENT",
      entityId: ticket._id,
      oldValues: { assignedTo: currentAssignedId },
      newValues: { assignedTo: nextAssignedId },
      message: msg,
      reqInfo,
    });
  }

  return getTicketById(ticket._id, reqUser);
};

const addComment = async ({ ticketId, comment }, reqUser, reqInfo = {}) => {
  const ticket = await ensureTicketVisible(ticketId, reqUser);

  const savedComment = await TicketComment.create({
    ticketId: ticket._id,
    authorId: reqUser._id,
    comment: comment.trim(),
  });

  await createActivity({
    ticketId: ticket._id,
    actorId: reqUser._id,
    action: "comment_added",
    message: "Comment added to the ticket.",
  });

  // NOTIFICATION for Assignee
  if (ticket.assignedTo && String(ticket.assignedTo) !== String(reqUser._id)) {
    await NotificationService.send({
      recipientId: ticket.assignedTo,
      senderId: reqUser._id,
      ticketId: ticket._id,
      type: "comment",
      message: `A new comment was added to ticket ${ticket.ticketNumber}.`,
    });
  }

  await logAuditAction({
    reqUser,
    actionType: "ADD_COMMENT",
    entityId: ticket._id,
    newValues: { commentId: savedComment._id },
    message: `User ${reqUser.fullName || reqUser.firstName} added a comment.`,
    reqInfo,
  });

  const populatedComment = await TicketComment.findById(savedComment._id).populate(commentPopulate);

  return {
    comment: toCommentResponse(populatedComment),
    ticket: await getTicketById(ticket._id, reqUser),
  };
};

const deleteTicket = async (ticketId, reqUser, reqInfo = {}) => {
  ensureCanDeleteTicket(reqUser);
  const ticket = await ensureTicketVisible(ticketId, reqUser);

  await Promise.all([
    TicketComment.deleteMany({ ticketId: ticket._id }),
    TicketActivity.deleteMany({ ticketId: ticket._id }),
    TicketAssignment.deleteMany({ ticketId: ticket._id }),
    FaultTicket.deleteOne({ _id: ticket._id }),
  ]);

  await logAuditAction({
    reqUser,
    actionType: "DELETE_TICKET",
    entityId: ticket._id,
    message: `Ticket ${ticket.ticketNumber} was deleted by ${reqUser.fullName || reqUser.firstName}.`,
    reqInfo,
  });

  return {
    message: `Ticket ${ticket.ticketNumber} deleted successfully.`,
    deletedTicketId: String(ticket._id),
    deletedTicketNumber: ticket.ticketNumber,
  };
};

const getStats = async (reqUser) => {
  const accessFilter = buildAccessFilter(reqUser);
  return buildSummary(accessFilter);
};

const getRecentFaults = async (query, reqUser) => {
  const accessFilter = buildAccessFilter(reqUser);
  const tickets = await FaultTicket.find(accessFilter)
    .populate(ticketPopulate)
    .sort({ createdAt: -1 })
    .limit(Number.parseInt(query.limit, 10) || 5);

  return tickets.map((t) => toTicketResponse(t));
};

module.exports = {
  addComment,
  createFault,
  deleteTicket,
  getTicketById,
  getStats,
  getRecentFaults,
  listTickets,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  escalateTicket,
};
