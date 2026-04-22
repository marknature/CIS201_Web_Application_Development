const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A unique field value already exists.",
      error: {
        code: "DUPLICATE_KEY",
      },
    });
  }

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || "Internal server error.",
    error: {
      code: err.code || "REQUEST_FAILED",
    },
  };

  if (err.details) {
    response.error.details = err.details;
  }

  res.status(statusCode).json(response);
};

module.exports = { errorHandler };
