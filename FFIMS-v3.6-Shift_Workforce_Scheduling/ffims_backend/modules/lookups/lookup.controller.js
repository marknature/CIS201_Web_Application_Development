const asyncHandler = require("../../utils/asyncHandler");
const Asset = require("../../models/asset.model");
const Facility = require("../../models/facility.model");
const Regulation = require("../../models/regulation.model");
const User = require("../../models/user.model");
const Vehicle = require("../../models/vehicle.model");

const listVehicles = asyncHandler(async (req, res) => {
  const items = await Vehicle.find({}, "registrationNumber make model status").sort({ registrationNumber: 1 }).lean();
  res.json({ items });
});

const listAssets = asyncHandler(async (req, res) => {
  const items = await Asset.find({}, "assetTag assetName lifecycleStatus").sort({ assetTag: 1 }).lean();
  res.json({ items });
});

const listUsers = asyncHandler(async (req, res) => {
  const items = await User.find({}, "firstName surname email role isActive").sort({ firstName: 1, surname: 1 }).lean();
  res.json({ items });
});

const listRegulations = asyncHandler(async (req, res) => {
  const items = await Regulation.find({}, "title regulationCode status").sort({ title: 1 }).lean();
  res.json({ items });
});

const listFacilities = asyncHandler(async (req, res) => {
  const items = await Facility.find({}, "facilityName facilityCode facilityType").sort({ facilityName: 1 }).lean();
  res.json({ items });
});

module.exports = {
  listAssets,
  listFacilities,
  listRegulations,
  listUsers,
  listVehicles,
};
