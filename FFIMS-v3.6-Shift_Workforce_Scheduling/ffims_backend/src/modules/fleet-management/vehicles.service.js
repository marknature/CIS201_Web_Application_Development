const mongoose = require("mongoose");
const ApiError = require("../../utils/apiError");
const Vehicle = require("../../models/vehicle.model");
const Driver = require("../../models/driver.model");
const { createAuditLog } = require("../../utils/audit");

const populate = [{ path: "assignedDriverId", select: "name phone status" }];

const toResponse = (v) => ({
  id: v._id,
  registrationNumber: v.registrationNumber,
  make: v.make,
  model: v.model,
  type: v.type || "",
  year: v.year,
  color: v.color || "",
  fuelType: v.fuelType || "",
  mileage: v.mileage,
  department: v.department || "",
  status: v.status,
  assignedDriverId: v.assignedDriverId?._id || v.assignedDriverId || null,
  assignedDriver: v.assignedDriverId && typeof v.assignedDriverId === "object"
    ? { id: v.assignedDriverId._id, name: v.assignedDriverId.name, phone: v.assignedDriverId.phone }
    : null,
  createdAt: v.createdAt,
  updatedAt: v.updatedAt,
});

const listVehicles = async ({ status, department, search } = {}) => {
  const filter = {};
  if (status && status !== "all") filter.status = new RegExp(`^${status}$`, "i");
  if (department) filter.department = new RegExp(department, "i");
  if (search) filter.$or = [
    { registrationNumber: new RegExp(search, "i") },
    { make: new RegExp(search, "i") },
    { model: new RegExp(search, "i") },
  ];
  return (await Vehicle.find(filter).populate(populate).sort({ createdAt: -1 })).map(toResponse);
};

const getVehicleById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid vehicle id.");
  const v = await Vehicle.findById(id).populate(populate);
  if (!v) throw new ApiError(404, "Vehicle not found.");
  return toResponse(v);
};

const createVehicle = async (payload, userId, req) => {
  if (await Vehicle.findOne({ registrationNumber: payload.registrationNumber.trim() }))
    throw new ApiError(409, "A vehicle with this registration number already exists.");
  const v = await Vehicle.create({
    registrationNumber: payload.registrationNumber.trim(),
    make: payload.make.trim(),
    model: payload.model.trim(),
    type: payload.type?.trim() || "",
    year: payload.year,
    color: payload.color?.trim() || "",
    fuelType: payload.fuelType?.trim() || "",
    mileage: payload.mileage || 0,
    department: payload.department?.trim() || "",
    status: payload.status?.trim() || "AVAILABLE",
    createdBy: userId || null,
  });
  await createAuditLog({ userId, moduleName: "Vehicle", actionType: "CREATE", entityId: v._id, newValues: { registrationNumber: v.registrationNumber }, req });
  return toResponse(await Vehicle.findById(v._id).populate(populate));
};

const updateVehicle = async (id, payload, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid vehicle id.");
  const v = await Vehicle.findById(id);
  if (!v) throw new ApiError(404, "Vehicle not found.");
  const old = { status: v.status, mileage: v.mileage };
  ["registrationNumber", "make", "model", "type", "year", "color", "fuelType", "mileage", "department", "status", "assignedDriverId"].forEach(
    (f) => { if (payload[f] !== undefined) v[f] = payload[f] === "" ? null : payload[f]; }
  );
  await v.save();
  await createAuditLog({ userId, moduleName: "Vehicle", actionType: "UPDATE", entityId: id, oldValues: old, newValues: payload, req });
  return toResponse(await Vehicle.findById(id).populate(populate));
};

const deleteVehicle = async (id, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid vehicle id.");
  const v = await Vehicle.findByIdAndDelete(id);
  if (!v) throw new ApiError(404, "Vehicle not found.");
  await createAuditLog({ userId, moduleName: "Vehicle", actionType: "DELETE", entityId: id, oldValues: { registrationNumber: v.registrationNumber }, req });
};

const receiveVehicle = async (id, mileage, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid vehicle id.");
  const v = await Vehicle.findById(id);
  if (!v) throw new ApiError(404, "Vehicle not found.");
  if (mileage !== undefined && mileage < v.mileage) throw new ApiError(400, "New mileage cannot be less than current.");
  v.status = "AVAILABLE";
  if (mileage !== undefined) v.mileage = mileage;
  v.assignedDriverId = null;
  await v.save();
  await createAuditLog({ userId, moduleName: "Vehicle", actionType: "RECEIVE", entityId: id, newValues: { status: "AVAILABLE", mileage }, req });
  return toResponse(await Vehicle.findById(id).populate(populate));
};

module.exports = { listVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle, receiveVehicle };
