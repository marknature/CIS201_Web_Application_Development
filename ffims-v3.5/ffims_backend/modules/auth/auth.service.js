const crypto = require("crypto");
const ApiError = require("../../utils/apiError");
const { createAuditLog } = require("../../utils/audit");
const { comparePassword, hashPassword } = require("../../utils/password");
const { signAccessToken } = require("../../utils/token");
const env = require("../../config/env");
const PasswordResetToken = require("../../models/password-reset-token.model");
const User = require("../../models/user.model");
const { normalizeEmail } = require("../users/user.service");

const getUserForAuthByEmail = async (email) =>
  User.findOne({ email: normalizeEmail(email) });

const assertAccountCanLogin = (user) => {
  if (!user || !user.passwordHash) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account is not allowed to log in.");
  }
};

const buildLoginResponse = (user) => {
  const safeUser = user.toSafeObject();

  return {
    accessToken: signAccessToken({
      _id: user._id,
      email: user.email,
      roleName: user.role,
    }),
    user: safeUser,
  };
};

const login = async ({ email, password }, req) => {
  const user = await getUserForAuthByEmail(email);

  try {
    assertAccountCanLogin(user);
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password.");
    }

    user.lastLogin = new Date();
    await user.save();

    await createAuditLog({
      userId: user._id,
      moduleName: "authentication",
      action: "login",
      entityName: "users",
      entityId: user._id,
      newValues: { outcome: "success" },
      req,
    });

    return buildLoginResponse(user);
  } catch (error) {
    await createAuditLog({
      userId: user?._id || null,
      moduleName: "authentication",
      action: "login",
      entityName: "users",
      entityId: user?._id || null,
      newValues: {
        outcome: "failure",
        emailAttempted: normalizeEmail(email),
      },
      req,
    });

    throw error;
  }
};

const getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return user.toSafeObject();
};

const changePassword = async ({ userId, currentPassword, newPassword }, req) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const isCurrentPasswordValid = await comparePassword(
    currentPassword,
    user.passwordHash
  );

  if (!isCurrentPasswordValid) {
    await createAuditLog({
      userId,
      moduleName: "authentication",
      action: "password_change",
      entityName: "users",
      entityId: userId,
      newValues: { outcome: "failure" },
      req,
    });

    throw new ApiError(400, "Current password is incorrect.");
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  await PasswordResetToken.updateMany({ userId, used: false }, { used: true });

  await createAuditLog({
    userId,
    moduleName: "authentication",
    action: "password_change",
    entityName: "users",
    entityId: userId,
    newValues: { outcome: "success" },
    req,
  });
};

const requestPasswordReset = async ({ email }, req) => {
  const user = await getUserForAuthByEmail(email);

  if (!user) {
    await createAuditLog({
      moduleName: "authentication",
      action: "password_reset_request",
      entityName: "users",
      newValues: {
        outcome: "failure",
        emailAttempted: normalizeEmail(email),
      },
      req,
    });

    return {
      message:
        "If an account exists for that email, a password reset token has been generated.",
    };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(
    Date.now() + env.passwordResetTokenExpiresMinutes * 60 * 1000
  );

  await PasswordResetToken.updateMany({ userId: user._id, used: false }, { used: true });
  await PasswordResetToken.create({
    userId: user._id,
    token: hashedToken,
    expiresAt,
  });

  await createAuditLog({
    userId: user._id,
    moduleName: "authentication",
    action: "password_reset_request",
    entityName: "users",
    entityId: user._id,
    newValues: { outcome: "success" },
    req,
  });

  return {
    message:
      "If an account exists for that email, a password reset token has been generated.",
    resetToken: rawToken,
    expiresAt,
  };
};

const resetPassword = async ({ token, newPassword }, req) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const resetToken = await PasswordResetToken.findOne({
    token: hashedToken,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!resetToken) {
    await createAuditLog({
      moduleName: "authentication",
      action: "password_reset",
      entityName: "passwordresettokens",
      newValues: { outcome: "failure" },
      req,
    });

    throw new ApiError(400, "The password reset token is invalid or expired.");
  }

  const user = await User.findById(resetToken.userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  resetToken.used = true;
  await resetToken.save();
  await PasswordResetToken.updateMany(
    { userId: user._id, used: false },
    { used: true }
  );

  await createAuditLog({
    userId: user._id,
    moduleName: "authentication",
    action: "password_reset",
    entityName: "users",
    entityId: user._id,
    newValues: { outcome: "success" },
    req,
  });
};

module.exports = {
  changePassword,
  getMe,
  login,
  requestPasswordReset,
  resetPassword,
};
