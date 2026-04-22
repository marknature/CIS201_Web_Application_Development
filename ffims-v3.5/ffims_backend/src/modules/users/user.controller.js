const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/api-response");
const User = require("../../models/user.model");
const userService = require("./user.service");

const registerUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body, req.user, req);
  sendSuccess(res, {
    statusCode: 201,
    message: "User account created successfully.",
    data: user.toSafeObject(),
    user: User.serializeForApi(user),
  });
});

const updateStatus = asyncHandler(async (req, res) => {
  const user = await userService.updateUserStatus(
    req.params.id,
    req.body.status,
    req.user,
    req
  );

  sendSuccess(res, {
    message: "User status updated successfully.",
    data: user.toSafeObject(),
    user: User.serializeForApi(user),
  });
});

const updateRole = asyncHandler(async (req, res) => {
  const user = await userService.updateUserRole(
    req.params.id,
    req.body.role,
    req.user,
    req
  );

  sendSuccess(res, {
    message: "User role updated successfully.",
    data: user.toSafeObject(),
    user: User.serializeForApi(user),
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateOwnProfile(req.user._id, req.body);
  sendSuccess(res, {
    message: "Profile updated successfully.",
    data: user.toSafeObject(),
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  sendSuccess(res, {
    message: "Users retrieved successfully.",
    data: result.items,
    meta: result.meta,
  });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, {
    message: "User retrieved successfully.",
    data: user,
    user: User.serializeForApi(user),
  });
});

module.exports = {
  getUser,
  listUsers,
  registerUser,
  updateProfile,
  updateRole,
  updateStatus,
};
