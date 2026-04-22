const mongoose = require("mongoose");
const ApiError = require("../../utils/apiError");
const { createAuditLog } = require("../../utils/audit");
const MaintenanceTask = require("../../models/maintenance-task.model");
const FaultTicket = require("../../models/fault-ticket.model");
const Asset = require("../../models/asset.model");
const User = require("../../models/user.model");

const assertValidObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(400, `${fieldName} must be a valid id.`);
  }
};

const ensureAssetExists = async (assetId) => {
  const asset = await Asset.findById(assetId);
  if (!asset) {
    throw new ApiError(404, "Asset not found.");
  }
};

const ensureUserExists = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }
};

const toResponse = (task) => ({
  id: task._id,
  assetId: task.assetId,
  facilityId: task.facilityId,
  vehicleId: task.vehicleId,
  workOrderId: task.workOrderId,
  faultTicketId: task.faultTicketId,
  projectTaskId: task.projectTaskId,
  taskName: task.taskName,
  description: task.description,
  priorityLevel: task.priorityLevel,
  dateCreated: task.dateCreated,
  createdBy: task.createdBy,
  assignedTo: task.assignedTo,
  supervisorId: task.supervisorId,
  status: task.status,
});

const listMaintenanceTasks = async (filters) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  if (filters.assetId) {
    assertValidObjectId(filters.assetId, "assetId");
    query.assetId = filters.assetId;
  }
  if (filters.faultTicketId) {
    assertValidObjectId(filters.faultTicketId, "faultTicketId");
    query.faultTicketId = filters.faultTicketId;
  }

  const tasks = await MaintenanceTask.find(query).sort({ dateCreated: -1 });
  return tasks.map(toResponse);
};

const getMaintenanceTaskById = async (id) => {
  assertValidObjectId(id, "id");
  const task = await MaintenanceTask.findById(id);
  if (!task) {
    throw new ApiError(404, "Maintenance task not found.");
  }
  return toResponse(task);
};

const createMaintenanceTask = async (payload, currentUser, req) => {
  await ensureAssetExists(payload.assetId);
  if (payload.assignedTo) await ensureUserExists(payload.assignedTo);
  if (payload.supervisorId) await ensureUserExists(payload.supervisorId);

  const task = await MaintenanceTask.create({
    ...payload,
    createdBy: payload.createdBy || currentUser._id,
  });

  await createAuditLog({
    userId: currentUser._id,
    moduleName: "maintenance",
    action: "maintenance_task_create",
    entityName: "maintenancetasks",
    entityId: task._id,
    newValues: { taskName: task.taskName, status: task.status },
    req,
  });

  return toResponse(task);
};

const updateMaintenanceTask = async (id, payload, currentUser, req) => {
  assertValidObjectId(id, "id");
  const task = await MaintenanceTask.findById(id);
  if (!task) {
    throw new ApiError(404, "Maintenance task not found.");
  }

  if (payload.assetId !== undefined) {
    await ensureAssetExists(payload.assetId);
    task.assetId = payload.assetId;
  }

  if (payload.assignedTo !== undefined) {
    if (payload.assignedTo) await ensureUserExists(payload.assignedTo);
    task.assignedTo = payload.assignedTo;
  }

  if (payload.supervisorId !== undefined) {
    if (payload.supervisorId) await ensureUserExists(payload.supervisorId);
    task.supervisorId = payload.supervisorId;
  }

  const fields = [
    "facilityId",
    "vehicleId",
    "workOrderId",
    "faultTicketId",
    "projectTaskId",
    "taskName",
    "description",
    "priorityLevel",
    "status",
  ];

  for (const field of fields) {
    if (payload[field] !== undefined) {
      task[field] = typeof payload[field] === "string" ? payload[field].trim() : payload[field];
    }
  }

  await task.save();

  await createAuditLog({
    userId: currentUser._id,
    moduleName: "maintenance",
    action: "maintenance_task_update",
    entityName: "maintenancetasks",
    entityId: task._id,
    newValues: { status: task.status, assignedTo: task.assignedTo },
    req,
  });

  return toResponse(task);
};

const deleteMaintenanceTask = async (id) => {
  assertValidObjectId(id, "id");
  const task = await MaintenanceTask.findByIdAndDelete(id);
  if (!task) {
    throw new ApiError(404, "Maintenance task not found.");
  }
};

const createTaskFromFaultTicket = async (ticketId, payload, currentUser, req) => {
  assertValidObjectId(ticketId, "ticketId");

  const ticket = await FaultTicket.findById(ticketId);
  if (!ticket) {
    throw new ApiError(404, "Fault ticket not found.");
  }

  if (!ticket.assetId) {
    throw new ApiError(400, "Fault ticket must reference an asset before creating a maintenance task.");
  }

  await ensureAssetExists(ticket.assetId);
  if (payload.assignedTo) await ensureUserExists(payload.assignedTo);
  if (payload.supervisorId) await ensureUserExists(payload.supervisorId);

  const task = await MaintenanceTask.create({
    assetId: ticket.assetId,
    facilityId: ticket.facilityId || null,
    vehicleId: ticket.vehicleId || null,
    faultTicketId: ticket._id,
    taskName: payload.taskName?.trim() || `Maintenance for ${ticket.ticketNumber}`,
    description: payload.description?.trim() || ticket.description || ticket.title,
    priorityLevel: payload.priorityLevel || ticket.priority || "medium",
    createdBy: currentUser._id,
    assignedTo: payload.assignedTo || null,
    supervisorId: payload.supervisorId || null,
    status: payload.status || "open",
  });

  if (ticket.status === "open") {
    ticket.status = "assigned";
    await ticket.save();
  }

  await createAuditLog({
    userId: currentUser._id,
    moduleName: "maintenance",
    action: "maintenance_task_create_from_ticket",
    entityName: "maintenancetasks",
    entityId: task._id,
    newValues: { faultTicketId: ticket._id.toString(), taskName: task.taskName },
    req,
  });

  return {
    task: toResponse(task),
    ticket: {
      id: ticket._id,
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
    },
  };
};

module.exports = {
  createMaintenanceTask,
  createTaskFromFaultTicket,
  deleteMaintenanceTask,
  getMaintenanceTaskById,
  listMaintenanceTasks,
  updateMaintenanceTask,
};
