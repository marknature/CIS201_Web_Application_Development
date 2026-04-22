const mongoose = require("mongoose");
const ApiError = require("../../utils/apiError");
const VehicleMaintenance = require("../../models/vehicle-maintenance.model");
const InventoryItem = require("../../models/inventory-item.model");
const Vehicle = require("../../models/vehicle.model");
const { createAuditLog } = require("../../utils/audit");

const populate = [{ path: "vehicleId", select: "registrationNumber make model" }];

const toResponse = (m) => ({
  id: m._id,
  vehicleId: m.vehicleId?._id || m.vehicleId || null,
  vehicleReg: m.vehicleId?.registrationNumber || null,
  vehicle: m.vehicleId && typeof m.vehicleId === "object"
    ? { id: m.vehicleId._id, registrationNumber: m.vehicleId.registrationNumber }
    : null,
  type: m.maintenanceType,
  description: m.description,
  date: m.serviceDate,
  nextServiceDate: m.nextServiceDate,
  vendor: m.serviceProvider || "",
  cost: m.cost,
  mileageAtService: m.mileageAtService,
  status: m.status,
  partsUsed: m.partsUsed || [],
  createdAt: m.createdAt,
});

const listMaintenance = async ({ status, vehicleId } = {}) => {
  const filter = {};
  if (status && status !== "all") filter.status = new RegExp(`^${status}$`, "i");
  if (vehicleId && mongoose.Types.ObjectId.isValid(vehicleId)) filter.vehicleId = vehicleId;
  return (await VehicleMaintenance.find(filter).populate(populate).sort({ createdAt: -1 })).map(toResponse);
};

const createMaintenance = async (payload, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(payload.vehicleId)) throw new ApiError(400, "Invalid vehicle id.");
  if (!(await Vehicle.findById(payload.vehicleId))) throw new ApiError(404, "Vehicle not found.");
  const m = await VehicleMaintenance.create({
    vehicleId: payload.vehicleId,
    maintenanceType: payload.type?.trim() || payload.maintenanceType?.trim(),
    description: payload.description?.trim() || "",
    serviceDate: payload.date || payload.serviceDate || new Date(),
    serviceProvider: payload.vendor?.trim() || payload.serviceProvider?.trim() || "",
    cost: Number(payload.cost) || 0,
    mileageAtService: Number(payload.mileageAtService) || 0,
    status: "scheduled",
    createdBy: userId || null,
    partsUsed: [],
  });
  await createAuditLog({ userId, moduleName: "Maintenance", actionType: "CREATE", entityId: m._id, newValues: { vehicleId: payload.vehicleId, type: m.maintenanceType }, req });
  return toResponse(await VehicleMaintenance.findById(m._id).populate(populate));
};

const startMaintenance = async (id, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid maintenance id.");
  const m = await VehicleMaintenance.findById(id);
  if (!m) throw new ApiError(404, "Maintenance record not found.");
  m.status = "in-progress";
  await m.save();
  if (m.vehicleId) await Vehicle.findByIdAndUpdate(m.vehicleId, { status: "MAINTENANCE" });
  await createAuditLog({ userId, moduleName: "Maintenance", actionType: "START", entityId: id, req });
  return toResponse(await VehicleMaintenance.findById(id).populate(populate));
};

const completeMaintenance = async (id, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid maintenance id.");
  const m = await VehicleMaintenance.findById(id);
  if (!m) throw new ApiError(404, "Maintenance record not found.");
  m.status = "completed";
  await m.save();
  if (m.vehicleId) await Vehicle.findByIdAndUpdate(m.vehicleId, { status: "AVAILABLE" });
  await createAuditLog({ userId, moduleName: "Maintenance", actionType: "COMPLETE", entityId: id, req });
  return toResponse(await VehicleMaintenance.findById(id).populate(populate));
};

const addParts = async (id, { parts }, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid maintenance id.");
  const m = await VehicleMaintenance.findById(id);
  if (!m) throw new ApiError(404, "Maintenance record not found.");
  // Deduct stock for each part
  for (const part of parts) {
    if (part.inventoryItemId && mongoose.Types.ObjectId.isValid(part.inventoryItemId)) {
      const item = await InventoryItem.findById(part.inventoryItemId);
      if (item) {
        item.quantityInStock = Math.max(0, item.quantityInStock - (part.quantity || 1));
        await item.save();
      }
    }
  }
  if (!m.partsUsed) m.partsUsed = [];
  m.partsUsed.push(...parts);
  await m.save();
  await createAuditLog({ userId, moduleName: "Maintenance", actionType: "ADD_PARTS", entityId: id, newValues: { parts }, req });
  return toResponse(await VehicleMaintenance.findById(id).populate(populate));
};

module.exports = { listMaintenance, createMaintenance, startMaintenance, completeMaintenance, addParts };
