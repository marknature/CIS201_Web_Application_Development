const Comment = require("../models/commentModel");
const Ticket = require("../models/ticketModel");
const { canCommentOnTicket } = require("../security/rbac");
const { fail, ok } = require("../utils/apiResponse");

const addComment = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return fail(res, "Ticket not found", 404);
    }

    if (!canCommentOnTicket(req.user)) {
      return fail(res, "Access denied", 403);
    }

    const comment = await Comment.create({
      ticket_id: ticket.id,
      fault_id: ticket.fault_id,
      author_id: req.user.id,
      body: req.body.body
    });

    return ok(res, "Comment added", comment, 201);
  } catch (error) {
    return next(error);
  }
};

module.exports = { addComment };
