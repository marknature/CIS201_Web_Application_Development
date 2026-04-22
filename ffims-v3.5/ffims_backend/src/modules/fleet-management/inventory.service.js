const mongoose = require("mongoose");
const ApiError = require("../../utils/apiError");
const InventoryItem = require("../../models/inventory-item.model");
const { createAuditLog } = require("../../utils/audit");

const toResponse = (i) => ({
  id: i._id,
  partName: i.itemName,
  itemCode: i.itemCode,
  category: i.category,
  quantity: i.quantityInStock,
  lowStockThreshold: i.reorderLevel,
  unitCost: i.unitCost,
  supplier: i.supplierName || "",
  status: i.status,
  createdAt: i.createdAt,
});

const listInventory = async ({ category, search } = {}) => {
  const filter = {};
  if (category && category !== "all") filter.category = new RegExp(`^${category}$`, "i");
  if (search) filter.$or = [
    { itemName: new RegExp(search, "i") },
    { itemCode: new RegExp(search, "i") },
    { category: new RegExp(search, "i") },
  ];
  return (await InventoryItem.find(filter).sort({ createdAt: -1 })).map(toResponse);
};

const createInventoryItem = async (payload, userId, req) => {
  // Auto-generate itemCode if not provided
  const itemCode = payload.itemCode?.trim() || `PART-${Date.now()}`;
  if (await InventoryItem.findOne({ itemCode })) throw new ApiError(409, "An item with this code already exists.");
  const item = await InventoryItem.create({
    itemName: payload.partName?.trim() || payload.itemName?.trim(),
    itemCode,
    category: payload.category?.trim() || "",
    quantityInStock: Number(payload.quantity) || 0,
    reorderLevel: Number(payload.lowStockThreshold) || 0,
    unitCost: Number(payload.unitCost) || 0,
    supplierName: payload.supplier?.trim() || "",
    status: "available",
  });
  await createAuditLog({ userId, moduleName: "Inventory", actionType: "CREATE", entityId: item._id, newValues: { itemName: item.itemName }, req });
  return toResponse(item);
};

const restockItem = async (id, { quantityToAdd }, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid inventory item id.");
  const item = await InventoryItem.findById(id);
  if (!item) throw new ApiError(404, "Inventory item not found.");
  const old = { quantity: item.quantityInStock };
  item.quantityInStock += Number(quantityToAdd) || 0;
  await item.save();
  await createAuditLog({ userId, moduleName: "Inventory", actionType: "RESTOCK", entityId: id, oldValues: old, newValues: { quantityAdded: quantityToAdd }, req });
  return toResponse(item);
};

const deductStock = async (id, { quantity }, userId, req) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid inventory item id.");
  const item = await InventoryItem.findById(id);
  if (!item) throw new ApiError(404, "Inventory item not found.");
  const qty = Number(quantity) || 1;
  if (item.quantityInStock < qty) throw new ApiError(400, "Insufficient stock.");
  const old = { quantity: item.quantityInStock };
  item.quantityInStock -= qty;
  await item.save();
  await createAuditLog({ userId, moduleName: "Inventory", actionType: "DEDUCT", entityId: id, oldValues: old, newValues: { deducted: qty }, req });
  return toResponse(item);
};

module.exports = { listInventory, createInventoryItem, restockItem, deductStock };
