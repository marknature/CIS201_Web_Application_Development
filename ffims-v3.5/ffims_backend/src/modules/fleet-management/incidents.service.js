const mongoose = require("mongoose");
const ApiError = require("../../utils/apiError");
const Incident = require("../../models/incident.model");
const Vehicle = require("../../models/vehicle.model");
const Driver = require("../../models/driver.model");
const { createAuditLog } = require("../../utils/audit");

const populate = [
  { path: "vehicleId", select: "registrationNumber make model" },
  { path: "driverId", select: "name phone" },
];

const toResponse = (i) => ({
  id: i._id,
  vehicleId: i.vehicleId?._id || i.vehicleId || null,
  vehicleReg: i.vehicleId?.registrationNumber || null,
  vehicle: i.vehicleId && typeof i.vehicleId === "object"
    ? { id: i.vehicleId._id, registrationNumber: i.vehicleId.registrationNumber }
    : null,
  driverId: i.driverId?._id || i.driverId || null,
  driver: i.driverId && typeof i.driverId === "object" ? { id: i.driverId._id, name: i.driverId.name } : null,
  type: i.type || "accident",
  location: i.location,
  description: i.description,
  severity: i.severity,
  damageEstimate: i.damageEstimate || 0,
  status: i.status,
  reportedBy: i.reportedByName || "",
  date: i.incidentDate,
  resolutionNotes: i.resolutionNotes,
  createdAt: i.createdAt,
});

const listIncidents = async ({ status, type, vehicleId } = {}) => {
  const filter = {};
  if (status && status !== "all") filter.status = new RegExp(`^${status}$`, "i");
  if (type && type !== "all") filter.type = type;
  if (vehicleId && mongoose.Types.ObjectId.isValid(vehicleId)) filter.vehicleId = vehicleId;
  return (await Incident.find(filter).populate(populate).sort({ createdAt: -1 })).map(toResponse);
};

const createIncident = async (payload, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(payload.vehicleId)) throw new ApiError(400, "Invalid vehicle id.");
  if (!(await Vehicle.findById(payload.vehicleId))) throw new ApiError(404, "Vehicle not found.");
  const i = await Incident.create({
    vehicleId: payload.vehicleId,
    driverId: payload.driverId && mongoose.Types.ObjectId.isValid(payload.driverId) ? payload.driverId : null,
    type: payload.type?.trim() || "accident",
    incidentDate: payload.date || new Date(),
    location: payload.location?.trim() || "",
    description: payload.description.trim(),
    severity: payload.severity?.trim() || "minor",
    damageEstimate: Number(payload.damageEstimate) || 0,
    reportedByName: payload.reportedBy?.trim() || "",
    reportedBy: userId || null,
    status: "open",
  });
  await createAuditLog({ userId, moduleName: "Incident", actionType: "CREATE", entityId: i._id, newValues: { type: i.type, severity: i.severity }, req });
  return toResponse(await Incident.findById(i._id).populate(populate));
};

const updateIncidentStatus = async (id, status, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid incident id.");
  const i = await Incident.findById(id);
  if (!i) throw new ApiError(404, "Incident not found.");
  const old = { status: i.status };
  i.status = status;
  await i.save();
  await createAuditLog({ userId, moduleName: "Incident", actionType: "UPDATE_STATUS", entityId: id, oldValues: old, newValues: { status }, req });
  return toResponse(await Incident.findById(id).populate(populate));
};

module.exports = { listIncidents, createIncident, updateIncidentStatus };
