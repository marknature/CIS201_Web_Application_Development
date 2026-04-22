const { createFaultTicket } = require("../services/faultTicketService");
const { fail, ok } = require("../utils/apiResponse");

const createFault = async (req, res, next) => {
  try {
    const result = await createFaultTicket({
      payload: req.body,
      reporterId: req.user.id,
      files: req.files || []
    });

    return ok(
      res,
      "Fault reported successfully",
      result,
      201
    );
  } catch (error) {
    if (error.statusCode) {
      return fail(res, error.message, error.statusCode);
    }

    return next(error);
  }
};

module.exports = { createFault };
