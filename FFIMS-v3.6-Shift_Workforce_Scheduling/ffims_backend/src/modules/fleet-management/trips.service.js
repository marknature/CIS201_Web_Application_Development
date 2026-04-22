const mongoose = require("mongoose");
const ApiError = require("../../utils/apiError");
const Trip = require("../../models/trip.model");
const Vehicle = require("../../models/vehicle.model");
const Driver = require("../../models/driver.model");
const { createAuditLog } = require("../../utils/audit");

const populate = [
  { path: "vehicleId", select: "registrationNumber make model" },
  { path: "driverId", select: "name phone" },
];

const toResponse = (t) => ({
  id: t._id,
  destination: t.destination,
  origin: t.origin || "",
  purpose: t.purpose,
  requestedBy: t.requestedByName || "",
  department: t.department || "",
  status: t.status,
  startDate: t.tripDate,
  startMileage: t.startMileage,
  endMileage: t.endMileage,
  vehicleId: t.vehicleId?._id || t.vehicleId || null,
  vehicle: t.vehicleId && typeof t.vehicleId === "object"
    ? { id: t.vehicleId._id, registrationNumber: t.vehicleId.registrationNumber }
    : null,
  driverId: t.driverId?._id || t.driverId || null,
  driver: t.driverId && typeof t.driverId === "object"
    ? { id: t.driverId._id, name: t.driverId.name }
    : null,
  createdAt: t.createdAt,
});

const listTrips = async ({ status, search } = {}) => {
  const filter = {};
  if (status && status !== "all") filter.status = new RegExp(`^${status}$`, "i");
  if (search) filter.$or = [
    { destination: new RegExp(search, "i") },
    { requestedByName: new RegExp(search, "i") },
    { department: new RegExp(search, "i") },
  ];
  return (await Trip.find(filter).populate(populate).sort({ createdAt: -1 })).map(toResponse);
};

const requestTrip = async (payload, userId, req) => {
  const t = await Trip.create({
    destination: payload.destination.trim(),
    origin: payload.origin?.trim() || "",
    purpose: payload.purpose.trim(),
    requestedByName: payload.requestedBy?.trim() || "",
    department: payload.department?.trim() || "",
    tripDate: payload.startDate || new Date(),
    status: "pending",
    requestedBy: userId || null,
    vehicleId: null,
    driverId: null,
  });
  await createAuditLog({ userId, moduleName: "Trip", actionType: "REQUEST", entityId: t._id, newValues: { destination: t.destination }, req });
  return toResponse(await Trip.findById(t._id).populate(populate));
};

const approveTrip = async (id, { vehicleId, driverId }, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid trip id.");
  const t = await Trip.findById(id);
  if (!t) throw new ApiError(404, "Trip not found.");
  if (t.status !== "pending") throw new ApiError(400, "Only pending trips can be approved.");
  if (!mongoose.Types.ObjectId.isValid(vehicleId)) throw new ApiError(400, "Invalid vehicle id.");
  if (!mongoose.Types.ObjectId.isValid(driverId)) throw new ApiError(400, "Invalid driver id.");
  t.vehicleId = vehicleId;
  t.driverId = driverId;
  t.vehicleId = vehicleId;
  t.driverId = driverId;
  t.status = "approved";
  await t.save();

  // Update Driver status and assigned vehicle
  await Driver.findByIdAndUpdate(driverId, { 
    status: "ON_TRIP", 
    assignedVehicleId: vehicleId 
  });
  
  // Update Vehicle assigned driver
  await Vehicle.findByIdAndUpdate(vehicleId, {
    assignedDriverId: driverId
  });

  await createAuditLog({ userId, moduleName: "Trip", actionType: "APPROVE", entityId: id, newValues: { vehicleId, driverId }, req });
  return toResponse(await Trip.findById(id).populate(populate));
};

const rejectTrip = async (id, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid trip id.");
  const t = await Trip.findById(id);
  if (!t) throw new ApiError(404, "Trip not found.");
  t.status = "rejected";
  await t.save();
  await createAuditLog({ userId, moduleName: "Trip", actionType: "REJECT", entityId: id, req });
  return toResponse(t);
};

const startTrip = async (id, { startMileage }, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid trip id.");
  const t = await Trip.findById(id);
  if (!t) throw new ApiError(404, "Trip not found.");
  if (t.status !== "approved") throw new ApiError(400, "Only approved trips can be started.");
  t.startMileage = startMileage || 0;
  t.startTime = new Date();
  t.status = "in-progress";
  await t.save();
  // Update vehicle status
  if (t.vehicleId) await Vehicle.findByIdAndUpdate(t.vehicleId, { status: "ASSIGNED" });
  // Ensure driver status is ON_TRIP
  if (t.driverId) await Driver.findByIdAndUpdate(t.driverId, { status: "ON_TRIP" });
  
  await createAuditLog({ userId, moduleName: "Trip", actionType: "START", entityId: id, newValues: { startMileage }, req });
  return toResponse(await Trip.findById(id).populate(populate));
};

const endTrip = async (id, { endMileage }, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid trip id.");
  const t = await Trip.findById(id);
  if (!t) throw new ApiError(404, "Trip not found.");
  if (t.status !== "in-progress") throw new ApiError(400, "Only active trips can be completed.");
  t.endMileage = endMileage || 0;
  t.endTime = new Date();
  t.status = "completed";
  await t.save();
  // Update vehicle mileage and status
  if (t.vehicleId) {
    await Vehicle.findByIdAndUpdate(t.vehicleId, { 
       mileage: endMileage || t.startMileage, 
       status: "AVAILABLE",
       assignedDriverId: null
    });
  }
  // Update driver status
  if (t.driverId) {
    await Driver.findByIdAndUpdate(t.driverId, { 
      status: "ACTIVE", 
      assignedVehicleId: null 
    });
  }

  await createAuditLog({ userId, moduleName: "Trip", actionType: "COMPLETE", entityId: id, newValues: { endMileage }, req });
  return toResponse(await Trip.findById(id).populate(populate));
};

module.exports = { listTrips, requestTrip, approveTrip, rejectTrip, startTrip, endTrip };
