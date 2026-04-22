const ApiError = require("../utils/apiError");

const authorizeRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    const roleName = req.user?.role;

    if (!roleName || !allowedRoles.includes(roleName)) {
      return next(new ApiError(403, "You do not have permission to perform this action."));
    }

    next();
  };

module.exports = { authorizeRoles };
