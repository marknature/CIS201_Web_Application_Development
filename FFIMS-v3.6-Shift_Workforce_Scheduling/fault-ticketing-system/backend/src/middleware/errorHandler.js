const { fail } = require("../utils/apiResponse");

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === "production";
  const message = isProd ? "Internal server error" : err.message || "Internal server error";
  const errors = isProd
    ? null
    : {
        type: err.name || "Error",
        details: err.details || null
      };

  return fail(res, message, statusCode, errors);
};

module.exports = { errorHandler };
