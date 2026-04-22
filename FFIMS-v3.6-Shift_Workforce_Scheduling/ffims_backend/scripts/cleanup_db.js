const mongoose = require("mongoose");
const env = require("../src/config/env");

const cleanDb = async () => {
  await mongoose.connect(env.mongoUri);
  console.log("Connected to MongoDB for cleanup");

  const Vehicle = require("../src/models/vehicle.model");
  const Staff = require("../src/models/staff.model");
  const Regulation = require("../src/models/regulation.model");
  const PpeItem = require("../src/models/ppe-item.model");
  const Facility = require("../src/models/facility.model");
  const Building = require("../src/models/building.model");

  await Vehicle.updateMany({ vinNumber: "" }, { $unset: { vinNumber: 1 } });
  await Staff.updateMany({ staffId: "" }, { $unset: { staffId: 1 } });
  await Regulation.updateMany({ regulationCode: "" }, { $unset: { regulationCode: 1 } });
  await PpeItem.updateMany({ itemCode: "" }, { $unset: { itemCode: 1 } });
  await Facility.updateMany({ facilityCode: "" }, { $unset: { facilityCode: 1 } });
  await Building.updateMany({ buildingCode: "" }, { $unset: { buildingCode: 1 } });

  console.log("Cleaned all legacy blank strings from sparse DB fields!");
  process.exit(0);
};

cleanDb().catch(console.error);
