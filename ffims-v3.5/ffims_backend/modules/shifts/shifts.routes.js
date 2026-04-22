const ShiftSchedule = require("../../models/shift-schedule.model");
const { buildCrudRouter } = require("../common/crud-router");

module.exports = buildCrudRouter({
  Model: ShiftSchedule,
  resourceName: "shift-schedules",
  writeRoles: ["Admin", "Operations Staff", "Facilities Staff"],
  createDefaults: (req) => ({ assignedBy: req.user._id }),
  defaultSort: "shiftDate",
});
