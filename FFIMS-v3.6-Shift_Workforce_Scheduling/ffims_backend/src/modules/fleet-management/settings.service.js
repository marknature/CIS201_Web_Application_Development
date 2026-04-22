const SystemSetting = require("../../models/system-setting.model");

const FLEET_SETTINGS_KEY = "fleet-management";

const getSettings = async () => {
  const doc = await SystemSetting.findOne({ settingKey: FLEET_SETTINGS_KEY });
  if (!doc) {
    // Return defaults
    return {
      orgName: "Africa University",
      orgEmail: "fleet@africau.edu",
      orgPhone: "+263 20 260 1120",
      currency: "USD",
      distanceUnit: "km",
      fuelUnit: "litres",
      maintenanceInterval: 5000,
      licenseExpiryWarning: 60,
      insuranceExpiryWarning: 30,
      emailNotifications: true,
      maintenanceReminders: true,
      licenseExpiryAlerts: true,
      requireTripApproval: true,
      requireFuelApproval: true,
      maxFuelPerRequest: 100,
    };
  }
  return doc.settingValue;
};

const updateSettings = async (payload) => {
  const doc = await SystemSetting.findOneAndUpdate(
    { settingKey: FLEET_SETTINGS_KEY },
    { settingKey: FLEET_SETTINGS_KEY, settingValue: payload },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return doc.settingValue;
};

module.exports = { getSettings, updateSettings };
