const express = require("express");
const ctrl = require("./fleet.controller");

const router = express.Router();

// ── VEHICLES ──────────────────────────────────────────────────────────────────
router.get("/vehicles", ctrl.listVehicles);
router.get("/vehicles/:id", ctrl.getVehicle);
router.post("/vehicles", ctrl.createVehicle);
router.patch("/vehicles/:id", ctrl.updateVehicle);
router.delete("/vehicles/:id", ctrl.deleteVehicle);
router.patch("/vehicles/:id/receive", ctrl.receiveVehicle);

// ── DRIVERS ───────────────────────────────────────────────────────────────────
router.get("/drivers", ctrl.listDrivers);
router.get("/drivers/:id", ctrl.getDriver);
router.post("/drivers", ctrl.createDriver);
router.patch("/drivers/:id", ctrl.updateDriver);
router.post("/drivers/:id/assign-vehicle", ctrl.assignVehicle);
router.post("/drivers/:id/assign-duty", ctrl.assignDuty);
router.delete("/drivers/:id/unassign-vehicle", ctrl.unassignVehicle);

// ── TRIPS ─────────────────────────────────────────────────────────────────────
router.get("/trips", ctrl.listTrips);
router.post("/trips/request", ctrl.requestTrip);
router.patch("/trips/:id/approve", ctrl.approveTrip);
router.patch("/trips/:id/reject", ctrl.rejectTrip);
router.patch("/trips/:id/start", ctrl.startTrip);
router.patch("/trips/:id/end", ctrl.endTrip);

// ── FUEL ──────────────────────────────────────────────────────────────────────
router.get("/fuel", ctrl.listFuelRecords);
router.post("/fuel", ctrl.createFuelRecord);
router.patch("/fuel/:id/status", ctrl.updateFuelStatus);

// ── MAINTENANCE ───────────────────────────────────────────────────────────────
router.get("/maintenance", ctrl.listMaintenance);
router.post("/maintenance", ctrl.createMaintenance);
router.patch("/maintenance/:id/start", ctrl.startMaintenance);
router.patch("/maintenance/:id/complete", ctrl.completeMaintenance);
router.post("/maintenance/:id/parts", ctrl.addMaintenanceParts);

// ── INCIDENTS ─────────────────────────────────────────────────────────────────
router.get("/incidents", ctrl.listIncidents);
router.post("/incidents", ctrl.createIncident);
router.patch("/incidents/:id/status", ctrl.updateIncidentStatus);

// ── INVENTORY ─────────────────────────────────────────────────────────────────
router.get("/inventory", ctrl.listInventory);
router.post("/inventory", ctrl.createInventoryItem);
router.patch("/inventory/:id/restock", ctrl.restockItem);
router.patch("/inventory/:id/deduct", ctrl.deductStock);

// ── AUDIT LOG ─────────────────────────────────────────────────────────────────
router.get("/audit-logs", ctrl.listAuditLogs);

// ── SETTINGS ──────────────────────────────────────────────────────────────────
router.get("/settings", ctrl.getSettings);
router.patch("/settings", ctrl.updateSettings);

module.exports = router;
