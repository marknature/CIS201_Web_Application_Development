const ApiError = require("../utils/apiError");
const env = require("../config/env");

const authenticateInternalRequest = (req, res, next) => {
  const token = req.headers["x-internal-api-key"];

  if (!token || token !== env.internalApiToken) {
    return next(new ApiError(401, "Invalid internal API token."));
  }

  next();
};

module.exports = { authenticateInternalRequest };
