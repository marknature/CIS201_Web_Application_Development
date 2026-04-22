const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/api-response");
const userService = require("./user.service");

const registerUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body, req.user, req);
  sendSuccess(res, {
    statusCode: 201,
    message: "User account created successfully.",
    data: user.toSafeObject(),
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
