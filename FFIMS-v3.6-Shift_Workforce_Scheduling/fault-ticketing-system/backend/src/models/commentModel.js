const { CommentDocument, mapComment, toObjectId } = require("./mongoCollections");

const populateAuthor = (query) => query.populate("author_id", "name");

const create = async ({ ticket_id, fault_id, author_id, body }) => {
  const comment = await CommentDocument.create({
    ticket_id: toObjectId(ticket_id),
    fault_id: fault_id ? toObjectId(fault_id) : null,
    author_id: toObjectId(author_id),
    body
  });

  return findById(comment._id);
};

const findById = async (id) => {
  const objectId = toObjectId(id);
  if (!objectId) {
    return null;
  }

  const comment = await populateAuthor(CommentDocument.findById(objectId)).lean();
  return mapComment(comment);
};

const getByTicketId = async (ticketId) => {
  const objectId = toObjectId(ticketId);
  if (!objectId) {
    return [];
  }

  const comments = await populateAuthor(CommentDocument.find({ ticket_id: objectId }).sort({ created_at: -1 })).lean();
  return comments.map((comment) => mapComment(comment));
};

const removeByTicketId = async (ticketId) => {
  const objectId = toObjectId(ticketId);
  if (!objectId) {
    return false;
  }

  await CommentDocument.deleteMany({ ticket_id: objectId });
  return true;
};

module.exports = {
  create,
  getByTicketId,
  removeByTicketId
};
