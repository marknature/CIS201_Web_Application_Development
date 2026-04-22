const {
  TicketLogDocument,
  mapTicketLog,
  toObjectId
} = require("./mongoCollections");

const create = async ({ ticket_id, action, performed_by }) => {
  await TicketLogDocument.create({
    ticket_id: toObjectId(ticket_id),
    action,
    performed_by: toObjectId(performed_by)
  });
};

const getByTicketId = async (ticketId) => {
  const objectId = toObjectId(ticketId);
  if (!objectId) {
    return [];
  }

  const logs = await TicketLogDocument.find({ ticket_id: objectId })
    .populate("performed_by", "name")
    .sort({ timestamp: -1 })
    .lean();

  return logs.map((log) => mapTicketLog(log));
};

module.exports = { create, getByTicketId };
