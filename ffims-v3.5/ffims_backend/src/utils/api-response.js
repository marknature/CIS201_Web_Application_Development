const sendSuccess = (res, { statusCode = 200, message, data = null, meta = undefined }) => {
  const payload = {
    success: true,
    message,
    data,
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

module.exports = { sendSuccess };
