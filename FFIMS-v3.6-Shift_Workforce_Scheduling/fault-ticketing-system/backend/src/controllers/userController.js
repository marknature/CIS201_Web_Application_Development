const User = require("../models/userModel");
const { canAccessUserManagement } = require("../security/rbac");
const { fail, ok } = require("../utils/apiResponse");

const getUsers = async (req, res, next) => {
  try {
    if (!canAccessUserManagement(req.user)) {
      return fail(res, "Access denied", 403);
    }

    const users = await User.listAll();
    return ok(res, "Users fetched", users);
  } catch (error) {
    return next(error);
  }
};

module.exports = { getUsers };
