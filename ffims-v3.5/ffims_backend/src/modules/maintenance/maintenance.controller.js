const asyncHandler = require("../../utils/asyncHandler");
const maintenanceService = require("./maintenance.service");

const listMaintenanceTasks = asyncHandler(async (req, res) => {
  const tasks = await maintenanceService.listMaintenanceTasks(req.query);
  res.json({ tasks });
});

const getMaintenanceTask = asyncHandler(async (req, res) => {
  const task = await maintenanceService.getMaintenanceTaskById(req.params.id);
  res.json({ task });
});

const createMaintenanceTask = asyncHandler(async (req, res) => {
  const task = await maintenanceService.createMaintenanceTask(req.body, req.user, req);
  res.status(201).json({
    message: "Maintenance task created successfully.",
    task,
  });
});

const updateMaintenanceTask = asyncHandler(async (req, res) => {
  const task = await maintenanceService.updateMaintenanceTask(req.params.id, req.body, req.user, req);
  res.json({
    message: "Maintenance task updated successfully.",
    task,
  });
});

const deleteMaintenanceTask = asyncHandler(async (req, res) => {
  await maintenanceService.deleteMaintenanceTask(req.params.id);
  res.json({ message: "Maintenance task deleted successfully." });
});

const createTaskFromFaultTicket = asyncHandler(async (req, res) => {
  const result = await maintenanceService.createTaskFromFaultTicket(
    req.params.ticketId,
    req.body,
    req.user,
    req
  );

  res.status(201).json({
    message: "Maintenance task created from fault ticket successfully.",
    ...result,
  });
});

module.exports = {
  createMaintenanceTask,
  createTaskFromFaultTicket,
  deleteMaintenanceTask,
  getMaintenanceTask,
  listMaintenanceTasks,
  updateMaintenanceTask,
};
