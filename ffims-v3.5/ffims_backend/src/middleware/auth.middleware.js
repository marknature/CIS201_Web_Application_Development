const ApiError = require("../utils/apiError");
const { verifyAccessToken } = require("../utils/token");
const User = require("../models/user.model");

/** Validates Bearer JWT from modules/auth (utils/token) and attaches the User document. */
const authenticateToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new ApiError(401, "Authentication token is required.");
    }

    const payload = verifyAccessToken(token);
    const userId = payload.sub || payload.id;
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(401, "Invalid authentication token.");
    }

    if (!user.isActive) {
      throw new ApiError(403, "This account is not active.");
    }

    req.user = user;
    next();
  } catch (error) {
    const status = error.statusCode || 401;
    const message = error.statusCode ? error.message : "Invalid or expired authentication token.";
    return res.status(status).json({ message });
  }
};

const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      message: "Insufficient permissions",
      required: allowedRoles,
      yourRole: req.user.role,
    });
  };

module.exports = {
  authenticateToken,
  authorize,
};
