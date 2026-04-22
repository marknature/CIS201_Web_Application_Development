const InventoryItem = require("../../models/inventory-item.model");
const { buildCrudRouter } = require("../common/crud-router");

module.exports = buildCrudRouter({
  Model: InventoryItem,
  resourceName: "inventory-items",
  writeRoles: ["Admin", "Facilities Staff", "Operations Staff"],
  defaultSort: "itemName",
});
