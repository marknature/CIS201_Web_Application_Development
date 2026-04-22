const { API_VERSION, APP_NAME } = require("../config/config");

const buildMeta = (res) => ({
  requestId: res.req?.requestId || null,
  timestamp: res.req?.requestTimestamp || new Date().toISOString(),
  service: APP_NAME,
  version: API_VERSION
});

const ok = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: buildMeta(res)
  });
};

const fail = (res, message, statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    meta: buildMeta(res)
  });
};

module.exports = { ok, fail };
