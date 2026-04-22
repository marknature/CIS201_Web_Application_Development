const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/api-response");
const authService = require("./auth.service");
const userService = require("../users/user.service");

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, req);
  sendSuccess(res, {
    message: "Login successful.",
    data: result,
  });
});

const register = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body, req.user, req);
  sendSuccess(res, {
    statusCode: 201,
    message: "User account created successfully.",
    data: user.toSafeObject(),
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  sendSuccess(res, {
    message: "Authenticated user retrieved successfully.",
    data: user,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(
    {
      userId: req.user._id,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    },
    req
  );

  sendSuccess(res, {
    message: "Password changed successfully.",
  });
});

const requestPasswordReset = asyncHandler(async (req, res) => {
  const result = await authService.requestPasswordReset(req.body, req);
  sendSuccess(res, {
    message: result.message,
    data: {
      resetToken: result.resetToken,
      expiresAt: result.expiresAt,
    },
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body, req);
  sendSuccess(res, {
    message: "Password reset successfully.",
  });
});

const logout = asyncHandler(async (req, res) => {
  sendSuccess(res, {
    message: "Logout successful.",
    data: {
      loggedOut: true,
      userId: req.user._id,
    },
  });
});

module.exports = {
  changePassword,
  login,
  logout,
  me,
  register,
  requestPasswordReset,
  resetPassword,
};
