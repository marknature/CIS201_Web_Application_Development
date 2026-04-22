const {
  TicketImageDocument,
  mapTicketImage,
  toObjectId
} = require("./mongoCollections");

const createMany = async (ticketId, files = []) => {
  const objectId = toObjectId(ticketId);
  if (!objectId || !files.length) {
    return [];
  }

  const created = await TicketImageDocument.insertMany(
    files.map((filePath) => ({
      ticket_id: objectId,
      file_path: filePath
    }))
  );

  return created.map((image) => mapTicketImage(image));
};

module.exports = { createMany };
