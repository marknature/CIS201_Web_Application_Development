const mongoose = require("mongoose");
const ApiError = require("../../utils/apiError");
const Driver = require("../../models/driver.model");
const Vehicle = require("../../models/vehicle.model");
const DutyAssignment = require("../../models/duty-assignment.model");
const { createAuditLog } = require("../../utils/audit");

const vehiclePopulate = { path: "assignedVehicleId", select: "registrationNumber make model status" };

const toResponse = (d) => ({
  id: d._id,
  name: d.name,
  employeeId: d.employeeId,
  licenseNumber: d.licenseNumber,
  licenseExpiry: d.licenseExpiry,
  licenseClass: d.licenseClass,
  phone: d.phone,
  address: d.address,
  status: d.status,
  notes: d.notes,
  assignedVehicleId: d.assignedVehicleId?._id || d.assignedVehicleId || null,
  assignedVehicleReg: d.assignedVehicleId?.registrationNumber || null,
  assignedVehicleMake: d.assignedVehicleId?.make || null,
  assignedVehicleModel: d.assignedVehicleId?.model || null,
  createdAt: d.createdAt,
  updatedAt: d.updatedAt,
});

const listDrivers = async ({ status, search } = {}) => {
  const filter = {};
  if (status && status !== "all") filter.status = new RegExp(`^${status}$`, "i");
  if (search) filter.$or = [
    { name: new RegExp(search, "i") },
    { employeeId: new RegExp(search, "i") },
    { licenseNumber: new RegExp(search, "i") },
  ];
  return (await Driver.find(filter).populate(vehiclePopulate).sort({ createdAt: -1 })).map(toResponse);
};

const getDriverById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid driver id.");
  const d = await Driver.findById(id).populate(vehiclePopulate);
  if (!d) throw new ApiError(404, "Driver not found.");
  return toResponse(d);
};

const createDriver = async (payload, userId, req) => {
  if (await Driver.findOne({ employeeId: payload.employeeId.trim() }))
    throw new ApiError(409, "A driver with this employee ID already exists.");
  if (await Driver.findOne({ licenseNumber: payload.licenseNumber.trim() }))
    throw new ApiError(409, "A driver with this license number already exists.");
  const d = await Driver.create({
    name: payload.name.trim(),
    employeeId: payload.employeeId.trim(),
    licenseNumber: payload.licenseNumber.trim(),
    licenseExpiry: payload.licenseExpiry,
    licenseClass: payload.licenseClass?.trim() || "Class 4",
    phone: payload.phone?.trim() || "",
    address: payload.address?.trim() || "",
    status: "ACTIVE",
    notes: "",
    createdBy: userId || null,
  });
  await createAuditLog({ userId, moduleName: "Driver", actionType: "CREATE", entityId: d._id, newValues: { name: d.name, employeeId: d.employeeId }, req });
  return toResponse(await Driver.findById(d._id).populate(vehiclePopulate));
};

const updateDriver = async (id, payload, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid driver id.");
  const d = await Driver.findById(id);
  if (!d) throw new ApiError(404, "Driver not found.");
  const old = { status: d.status };
  ["name", "employeeId", "licenseNumber", "licenseExpiry", "licenseClass", "phone", "address", "status", "notes"].forEach(
    (f) => { if (payload[f] !== undefined) d[f] = payload[f]; }
  );
  await d.save();
  await createAuditLog({ userId, moduleName: "Driver", actionType: "UPDATE", entityId: id, oldValues: old, newValues: payload, req });
  return toResponse(await Driver.findById(id).populate(vehiclePopulate));
};

const assignVehicle = async (driverId, vehicleId, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(driverId)) throw new ApiError(400, "Invalid driver id.");
  if (!mongoose.Types.ObjectId.isValid(vehicleId)) throw new ApiError(400, "Invalid vehicle id.");
  const driver = await Driver.findById(driverId);
  if (!driver) throw new ApiError(404, "Driver not found.");
  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) throw new ApiError(404, "Vehicle not found.");
  // Unassign previous vehicle if any
  if (driver.assignedVehicleId) {
    await Vehicle.findByIdAndUpdate(driver.assignedVehicleId, { assignedDriverId: null, status: "AVAILABLE" });
  }
  driver.assignedVehicleId = vehicleId;
  driver.status = "ON_TRIP";
  await driver.save();
  vehicle.assignedDriverId = driverId;
  vehicle.status = "ASSIGNED";
  await vehicle.save();
  await createAuditLog({ userId, moduleName: "Driver", actionType: "ASSIGN_VEHICLE", entityId: driverId, newValues: { vehicleId }, req });
  return toResponse(await Driver.findById(driverId).populate(vehiclePopulate));
};

const unassignVehicle = async (driverId, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(driverId)) throw new ApiError(400, "Invalid driver id.");
  const driver = await Driver.findById(driverId);
  if (!driver) throw new ApiError(404, "Driver not found.");
  if (driver.assignedVehicleId) {
    await Vehicle.findByIdAndUpdate(driver.assignedVehicleId, { assignedDriverId: null, status: "AVAILABLE" });
  }
  driver.assignedVehicleId = null;
  driver.status = "ACTIVE";
  await driver.save();
  await createAuditLog({ userId, moduleName: "Driver", actionType: "UNASSIGN_VEHICLE", entityId: driverId, req });
  return toResponse(await Driver.findById(driverId).populate(vehiclePopulate));
};

const assignDuty = async (driverId, payload, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(driverId)) throw new ApiError(400, "Invalid driver id.");
  const driver = await Driver.findById(driverId);
  if (!driver) throw new ApiError(404, "Driver not found.");

  const { vehicleId, dutyType, startDate, endDate, notes } = payload;

  // 1. Create Duty Assignment record
  const duty = await DutyAssignment.create({
    driverId,
    vehicleId: vehicleId || driver.assignedVehicleId,
    assignedBy: userId,
    startDate,
    endDate: endDate || null,
    purpose: dutyType + (notes ? `: ${notes}` : ""),
    status: "assigned"
  });

  // 2. Update Driver status
  driver.status = "ON_TRIP";
  if (vehicleId) {
    // If a new vehicle was chosen during duty assignment, unassign the old one first
    if (driver.assignedVehicleId && driver.assignedVehicleId.toString() !== vehicleId) {
       await Vehicle.findByIdAndUpdate(driver.assignedVehicleId, { assignedDriverId: null, status: "AVAILABLE" });
    }
    driver.assignedVehicleId = vehicleId;
  }
  await driver.save();

  // 3. Update Vehicle status if linked
  const targetVehicleId = vehicleId || driver.assignedVehicleId;
  if (targetVehicleId) {
    await Vehicle.findByIdAndUpdate(targetVehicleId, {
      assignedDriverId: driverId,
      status: "ASSIGNED"
    });
  }

  await createAuditLog({ userId, moduleName: "Driver", actionType: "ASSIGN_DUTY", entityId: driverId, newValues: payload, req });
  return toResponse(await Driver.findById(driverId).populate(vehiclePopulate));
};

module.exports = { listDrivers, getDriverById, createDriver, updateDriver, assignVehicle, unassignVehicle, assignDuty };
