const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/config");
const User = require("../models/userModel");
const { fail } = require("../utils/apiResponse");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return fail(res, "Unauthorized", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    if (!userId || !decoded.role) {
      return fail(res, "Invalid token", 401);
    }

    const user = await User.findById(userId);

    if (!user) {
      return fail(res, "Invalid token user", 401);
    }

    if (user.role !== decoded.role) {
      return fail(res, "Invalid token role", 401);
    }

    req.auth = {
      userId: user.id,
      role: user.role
    };
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return fail(res, "Session expired, please login again", 401);
    }
    return fail(res, "Invalid token", 401);
  }
};

module.exports = { authenticate };
