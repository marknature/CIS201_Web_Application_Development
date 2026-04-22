const mongoose = require("mongoose");
const ApiError = require("../../utils/apiError");
const FuelRecord = require("../../models/fuel-record.model");
const Vehicle = require("../../models/vehicle.model");
const { createAuditLog } = require("../../utils/audit");

const populate = [{ path: "vehicleId", select: "registrationNumber make model" }];

const toResponse = (r) => ({
  id: r._id,
  vehicleId: r.vehicleId?._id || r.vehicleId || null,
  vehicleReg: r.vehicleId?.registrationNumber || null,
  vehicle: r.vehicleId && typeof r.vehicleId === "object"
    ? { id: r.vehicleId._id, registrationNumber: r.vehicleId.registrationNumber }
    : null,
  requestedBy: r.requestedBy || "",
  litres: r.litres,
  costPerLitre: r.costPerLitre,
  cost: r.totalCost,
  odometer: r.odometer,
  date: r.fuelDate,
  status: r.status,
  notes: r.notes || "",
  stationName: r.stationName || "",
  createdAt: r.createdAt,
});

const listFuelRecords = async ({ status, vehicleId } = {}) => {
  const filter = {};
  if (status && status !== "all") filter.status = new RegExp(`^${status}$`, "i");
  if (vehicleId && mongoose.Types.ObjectId.isValid(vehicleId)) filter.vehicleId = vehicleId;
  return (await FuelRecord.find(filter).populate(populate).sort({ createdAt: -1 })).map(toResponse);
};

const createFuelRecord = async (payload, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(payload.vehicleId)) throw new ApiError(400, "Invalid vehicle id.");
  if (!(await Vehicle.findById(payload.vehicleId))) throw new ApiError(404, "Vehicle not found.");
  const litres = Number(payload.litres) || 0;
  const costPerLitre = Number(payload.costPerLitre) || 0;
  const r = await FuelRecord.create({
    vehicleId: payload.vehicleId,
    requestedBy: payload.requestedBy?.trim() || "",
    fuelDate: payload.date || new Date(),
    litres,
    costPerLitre,
    totalCost: litres * costPerLitre,
    odometer: Number(payload.odometer) || 0,
    stationName: payload.stationName?.trim() || "",
    status: "pending",
    recordedBy: userId || null,
  });
  await createAuditLog({ userId, moduleName: "FuelRecord", actionType: "CREATE", entityId: r._id, newValues: { vehicleId: payload.vehicleId, litres }, req });
  return toResponse(await FuelRecord.findById(r._id).populate(populate));
};

const updateFuelStatus = async (id, { status, notes }, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid fuel record id.");
  const r = await FuelRecord.findById(id);
  if (!r) throw new ApiError(404, "Fuel record not found.");
  const old = { status: r.status };
  r.status = status;
  if (notes !== undefined) r.notes = notes;
  await r.save();
  await createAuditLog({ userId, moduleName: "FuelRecord", actionType: "UPDATE_STATUS", entityId: id, oldValues: old, newValues: { status, notes }, req });
  return toResponse(await FuelRecord.findById(id).populate(populate));
};

module.exports = { listFuelRecords, createFuelRecord, updateFuelStatus };
