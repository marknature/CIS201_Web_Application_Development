const { DEFAULT_PRIORITY, FaultDocument, mapFault, toObjectId } = require("./mongoCollections");

const populateReporter = (query) => query.populate("reported_by", "name");

const create = async ({ title, description, asset_id, asset_name, category, location, priority, reported_by, ticket_id, status }) => {
  const created = await FaultDocument.create({
    title,
    description,
    asset_id: String(asset_id),
    asset_name: asset_name || "",
    category: category || "",
    location: location || "",
    priority: priority || DEFAULT_PRIORITY,
    status: status || "Reported",
    reported_by: toObjectId(reported_by),
    ticket_id: toObjectId(ticket_id)
  });

  return findById(created._id);
};

const findById = async (id) => {
  const objectId = toObjectId(id);
  if (!objectId) {
    return null;
  }

  const fault = await populateReporter(FaultDocument.findById(objectId)).lean();
  return mapFault(fault);
};

const findByTicketId = async (ticketId) => {
  const objectId = toObjectId(ticketId);
  if (!objectId) {
    return null;
  }

  const fault = await populateReporter(FaultDocument.findOne({ ticket_id: objectId })).lean();
  return mapFault(fault);
};

const updateById = async (id, data) => {
  const objectId = toObjectId(id);
  if (!objectId) {
    return null;
  }

  const updateData = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) {
      continue;
    }

    if (key === "reported_by" || key === "ticket_id") {
      updateData[key] = value ? toObjectId(value) : null;
      continue;
    }

    updateData[key] = value;
  }

  const fault = await populateReporter(
    FaultDocument.findByIdAndUpdate(objectId, updateData, {
      returnDocument: "after",
      runValidators: true
    })
  ).lean();

  return mapFault(fault);
};

const removeByTicketId = async (ticketId) => {
  const objectId = toObjectId(ticketId);
  if (!objectId) {
    return false;
  }

  const result = await FaultDocument.deleteOne({ ticket_id: objectId });
  return result.deletedCount > 0;
};

module.exports = {
  create,
  findById,
  findByTicketId,
  removeByTicketId,
  updateById
};
