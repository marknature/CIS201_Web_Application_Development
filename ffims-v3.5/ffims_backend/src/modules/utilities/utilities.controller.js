const asyncHandler = require("../../utils/asyncHandler");
const utilitiesService = require("./utilities.service");

const listPowerUsage = asyncHandler(async (req, res) => {
  const records = await utilitiesService.listPowerUsage(req.query);
  res.json({ records });
});

const getPowerUsage = asyncHandler(async (req, res) => {
  const record = await utilitiesService.getPowerUsageById(req.params.id);
  res.json({ record });
});

const createPowerUsage = asyncHandler(async (req, res) => {
  const record = await utilitiesService.createPowerUsage(req.body, req.user, req);
  res.status(201).json({
    message: "Power usage record created successfully.",
    record,
  });
});

const updatePowerUsage = asyncHandler(async (req, res) => {
  const record = await utilitiesService.updatePowerUsage(req.params.id, req.body, req.user, req);
  res.json({
    message: "Power usage record updated successfully.",
    record,
  });
});

const deletePowerUsage = asyncHandler(async (req, res) => {
  await utilitiesService.deletePowerUsage(req.params.id);
  res.json({ message: "Power usage record deleted successfully." });
});

const getPowerUsageSummary = asyncHandler(async (req, res) => {
  const summary = await utilitiesService.getPowerUsageSummary();
  res.json({ summary });
});

const listWaterUsage = asyncHandler(async (req, res) => {
  const records = await utilitiesService.listWaterUsage(req.query);
  res.json({ records });
});

const getWaterUsage = asyncHandler(async (req, res) => {
  const record = await utilitiesService.getWaterUsageById(req.params.id);
  res.json({ record });
});

const createWaterUsage = asyncHandler(async (req, res) => {
  const record = await utilitiesService.createWaterUsage(req.body, req.user, req);
  res.status(201).json({
    message: "Water usage record created successfully.",
    record,
  });
});

const updateWaterUsage = asyncHandler(async (req, res) => {
  const record = await utilitiesService.updateWaterUsage(req.params.id, req.body, req.user, req);
  res.json({
    message: "Water usage record updated successfully.",
    record,
  });
});

const deleteWaterUsage = asyncHandler(async (req, res) => {
  await utilitiesService.deleteWaterUsage(req.params.id);
  res.json({ message: "Water usage record deleted successfully." });
});

const getWaterUsageSummary = asyncHandler(async (req, res) => {
  const summary = await utilitiesService.getWaterUsageSummary();
  res.json({ summary });
});

const listUtilityAlerts = asyncHandler(async (req, res) => {
  const alerts = await utilitiesService.listUtilityAlerts(req.query);
  res.json({ alerts });
});

const getUtilityAlert = asyncHandler(async (req, res) => {
  const alert = await utilitiesService.getUtilityAlertById(req.params.id);
  res.json({ alert });
});

const createUtilityAlert = asyncHandler(async (req, res) => {
  const alert = await utilitiesService.createUtilityAlert(req.body, req.user, req);
  res.status(201).json({
    message: "Utility alert created successfully.",
    alert,
  });
});

const updateUtilityAlert = asyncHandler(async (req, res) => {
  const alert = await utilitiesService.updateUtilityAlert(req.params.id, req.body, req.user, req);
  res.json({
    message: "Utility alert updated successfully.",
    alert,
  });
});

const deleteUtilityAlert = asyncHandler(async (req, res) => {
  await utilitiesService.deleteUtilityAlert(req.params.id);
  res.json({ message: "Utility alert deleted successfully." });
});

const getUtilityAlertSummary = asyncHandler(async (req, res) => {
  const summary = await utilitiesService.getUtilityAlertSummary();
  res.json({ summary });
});

const createFaultTicketFromAlert = asyncHandler(async (req, res) => {
  const result = await utilitiesService.createFaultTicketFromAlert(
    req.params.id,
    req.body,
    req.user,
    req
  );

  res.status(201).json({
    message: "Fault ticket created from utility alert successfully.",
    ...result,
  });
});

module.exports = {
  createFaultTicketFromAlert,
  createPowerUsage,
  createUtilityAlert,
  createWaterUsage,
  deletePowerUsage,
  deleteUtilityAlert,
  deleteWaterUsage,
  getPowerUsage,
  getPowerUsageSummary,
  getUtilityAlert,
  getUtilityAlertSummary,
  getWaterUsage,
  getWaterUsageSummary,
  listPowerUsage,
  listUtilityAlerts,
  listWaterUsage,
  updatePowerUsage,
  updateUtilityAlert,
  updateWaterUsage,
};
