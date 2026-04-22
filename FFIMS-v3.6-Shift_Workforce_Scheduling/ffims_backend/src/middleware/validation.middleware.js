const ApiError = require("../utils/apiError");

const validate = (validator) => (req, res, next) => {
  const errors = validator(req.body);

  if (errors.length > 0) {
    console.warn(
      `[validation] ${req.method} ${req.originalUrl} failed with body ${JSON.stringify(req.body)} -> ${JSON.stringify(errors)}`
    );
    return next(new ApiError(400, "Validation failed.", errors));
  }

  next();
};

module.exports = validate;
