const Asset = require("../../models/asset.model");
const { buildCrudRouter } = require("../common/crud-router");

module.exports = buildCrudRouter({
  Model: Asset,
  resourceName: "assets",
  writeRoles: ["Admin", "Facilities Staff", "Operations Staff"],
  createDefaults: (req) => ({ createdBy: req.user._id }),
});
