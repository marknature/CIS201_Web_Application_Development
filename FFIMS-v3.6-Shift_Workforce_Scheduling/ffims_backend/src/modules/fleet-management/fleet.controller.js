const asyncHandler = require("../../utils/asyncHandler");
const vehiclesService = require("./vehicles.service");
const driversService = require("./drivers.service");
const tripsService = require("./trips.service");
const fuelService = require("./fuel.service");
const maintenanceService = require("./maintenance.service");
const incidentsService = require("./incidents.service");
const inventoryService = require("./inventory.service");
const auditLogService = require("./audit-log.service");
const settingsService = require("./settings.service");

// ── VEHICLES ─────────────────────────────────────────────────────────────────
const listVehicles = asyncHandler(async (req, res) => {
  const vehicles = await vehiclesService.listVehicles(req.query);
  res.json({ vehicles });
});

const getVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehiclesService.getVehicleById(req.params.id);
  res.json({ vehicle });
});

const createVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehiclesService.createVehicle(req.body, req.user?._id, req);
  res.status(201).json({ message: "Vehicle registered successfully.", vehicle });
});

const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehiclesService.updateVehicle(req.params.id, req.body, req.user?._id, req);
  res.json({ message: "Vehicle updated.", vehicle });
});

const deleteVehicle = asyncHandler(async (req, res) => {
  await vehiclesService.deleteVehicle(req.params.id, req.user?._id, req);
  res.json({ message: "Vehicle deleted." });
});

const receiveVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehiclesService.receiveVehicle(req.params.id, req.body.mileage, req.user?._id, req);
  res.json({ message: "Vehicle received and marked available.", vehicle });
});

// ── DRIVERS ──────────────────────────────────────────────────────────────────
const listDrivers = asyncHandler(async (req, res) => {
  const drivers = await driversService.listDrivers(req.query);
  res.json({ drivers });
});

const getDriver = asyncHandler(async (req, res) => {
  const driver = await driversService.getDriverById(req.params.id);
  res.json({ driver });
});

const createDriver = asyncHandler(async (req, res) => {
  const driver = await driversService.createDriver(req.body, req.user?._id, req);
  res.status(201).json({ message: "Driver registered successfully.", driver });
});

const updateDriver = asyncHandler(async (req, res) => {
  const driver = await driversService.updateDriver(req.params.id, req.body, req.user?._id, req);
  res.json({ message: "Driver updated.", driver });
});

const assignVehicle = asyncHandler(async (req, res) => {
  const driver = await driversService.assignVehicle(req.params.id, req.body.vehicleId, req.user?._id, req);
  res.json({ message: "Vehicle assigned to driver.", driver });
});

const unassignVehicle = asyncHandler(async (req, res) => {
  const driver = await driversService.unassignVehicle(req.params.id, req.user?._id, req);
  res.json({ message: "Vehicle unassigned.", driver });
});

const assignDuty = asyncHandler(async (req, res) => {
  const driver = await driversService.assignDuty(req.params.id, req.body, req.user?._id, req);
  res.json({ message: "Duty assigned successfully.", driver });
});

// ── TRIPS ─────────────────────────────────────────────────────────────────────
const listTrips = asyncHandler(async (req, res) => {
  const trips = await tripsService.listTrips(req.query);
  res.json({ trips });
});

const requestTrip = asyncHandler(async (req, res) => {
  const trip = await tripsService.requestTrip(req.body, req.user?._id, req);
  res.status(201).json({ message: "Trip requested.", trip });
});

const approveTrip = asyncHandler(async (req, res) => {
  const trip = await tripsService.approveTrip(req.params.id, req.body, req.user?._id, req);
  res.json({ message: "Trip approved.", trip });
});

const rejectTrip = asyncHandler(async (req, res) => {
  const trip = await tripsService.rejectTrip(req.params.id, req.user?._id, req);
  res.json({ message: "Trip rejected.", trip });
});

const startTrip = asyncHandler(async (req, res) => {
  const trip = await tripsService.startTrip(req.params.id, req.body, req.user?._id, req);
  res.json({ message: "Trip started.", trip });
});

const endTrip = asyncHandler(async (req, res) => {
  const trip = await tripsService.endTrip(req.params.id, req.body, req.user?._id, req);
  res.json({ message: "Trip completed.", trip });
});

// ── FUEL ──────────────────────────────────────────────────────────────────────
const listFuelRecords = asyncHandler(async (req, res) => {
  const records = await fuelService.listFuelRecords(req.query);
  res.json({ records });
});

const createFuelRecord = asyncHandler(async (req, res) => {
  const record = await fuelService.createFuelRecord(req.body, req.user?._id, req);
  res.status(201).json({ message: "Fuel request submitted.", record });
});

const updateFuelStatus = asyncHandler(async (req, res) => {
  const record = await fuelService.updateFuelStatus(req.params.id, req.body, req.user?._id, req);
  res.json({ message: "Fuel record status updated.", record });
});

// ── MAINTENANCE ───────────────────────────────────────────────────────────────
const listMaintenance = asyncHandler(async (req, res) => {
  const records = await maintenanceService.listMaintenance(req.query);
  res.json({ records });
});

const createMaintenance = asyncHandler(async (req, res) => {
  const record = await maintenanceService.createMaintenance(req.body, req.user?._id, req);
  res.status(201).json({ message: "Maintenance scheduled.", record });
});

const startMaintenance = asyncHandler(async (req, res) => {
  const record = await maintenanceService.startMaintenance(req.params.id, req.user?._id, req);
  res.json({ message: "Maintenance started.", record });
});

const completeMaintenance = asyncHandler(async (req, res) => {
  const record = await maintenanceService.completeMaintenance(req.params.id, req.user?._id, req);
  res.json({ message: "Maintenance completed.", record });
});

const addMaintenanceParts = asyncHandler(async (req, res) => {
  const record = await maintenanceService.addParts(req.params.id, req.body, req.user?._id, req);
  res.json({ message: "Parts recorded.", record });
});

// ── INCIDENTS ─────────────────────────────────────────────────────────────────
const listIncidents = asyncHandler(async (req, res) => {
  const incidents = await incidentsService.listIncidents(req.query);
  res.json({ incidents });
});

const createIncident = asyncHandler(async (req, res) => {
  const incident = await incidentsService.createIncident(req.body, req.user?._id, req);
  res.status(201).json({ message: "Incident reported.", incident });
});

const updateIncidentStatus = asyncHandler(async (req, res) => {
  const incident = await incidentsService.updateIncidentStatus(req.params.id, req.body.status, req.user?._id, req);
  res.json({ message: "Incident status updated.", incident });
});

// ── INVENTORY ─────────────────────────────────────────────────────────────────
const listInventory = asyncHandler(async (req, res) => {
  const items = await inventoryService.listInventory(req.query);
  res.json({ items });
});

const createInventoryItem = asyncHandler(async (req, res) => {
  const item = await inventoryService.createInventoryItem(req.body, req.user?._id, req);
  res.status(201).json({ message: "Inventory item added.", item });
});

const restockItem = asyncHandler(async (req, res) => {
  const item = await inventoryService.restockItem(req.params.id, req.body, req.user?._id, req);
  res.json({ message: "Stock updated.", item });
});

const deductStock = asyncHandler(async (req, res) => {
  const item = await inventoryService.deductStock(req.params.id, req.body, req.user?._id, req);
  res.json({ message: "Stock deducted.", item });
});

// ── AUDIT LOG ─────────────────────────────────────────────────────────────────
const listAuditLogs = asyncHandler(async (req, res) => {
  const logs = await auditLogService.listAuditLogs(req.query);
  res.json({ logs });
});

// ── SETTINGS ──────────────────────────────────────────────────────────────────
const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSettings();
  res.json({ settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateSettings(req.body);
  res.json({ message: "Settings saved.", settings });
});

module.exports = {
  // vehicles
  listVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle, receiveVehicle,
  // drivers
  listDrivers, getDriver, createDriver, updateDriver, assignVehicle, unassignVehicle, assignDuty,
  // trips
  listTrips, requestTrip, approveTrip, rejectTrip, startTrip, endTrip,
  // fuel
  listFuelRecords, createFuelRecord, updateFuelStatus,
  // maintenance
  listMaintenance, createMaintenance, startMaintenance, completeMaintenance, addMaintenanceParts,
  // incidents
  listIncidents, createIncident, updateIncidentStatus,
  // inventory
  listInventory, createInventoryItem, restockItem, deductStock,
  // audit
  listAuditLogs,
  // settings
  getSettings, updateSettings,
};
