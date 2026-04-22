const { randomUUID } = require("crypto");
const { APP_NAME, API_VERSION } = require("../config/config");

const requestContext = (req, res, next) => {
  const externalRequestId = req.get("x-request-id");
  const requestId = externalRequestId && externalRequestId.trim()
    ? externalRequestId.trim()
    : randomUUID();
  const timestamp = new Date().toISOString();

  req.requestId = requestId;
  req.requestTimestamp = timestamp;

  res.setHeader("X-Request-Id", requestId);
  res.setHeader("X-Service-Name", APP_NAME);
  res.setHeader("X-Service-Version", API_VERSION);

  next();
};

module.exports = { requestContext };
