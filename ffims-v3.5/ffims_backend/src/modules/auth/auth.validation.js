const { PASSWORD_RULES, isStrongPassword } = require("../../utils/password");

const isEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const requiredString = (value) => typeof value === "string" && value.trim().length > 0;

const validateRegistration = (body) => {
  const errors = [];

  if (!requiredString(body.firstName) && !requiredString(body.fullName)) {
    errors.push("firstName is required.");
  }
  if (!requiredString(body.surname) && !requiredString(body.fullName)) {
    errors.push("surname is required.");
  }
  if (!isEmail(body.email)) errors.push("A valid email is required.");
  if (!requiredString(body.role)) errors.push("role is required.");
  if (!requiredString(body.password)) {
    errors.push("password is required.");
  } else if (!isStrongPassword(body.password)) {
    errors.push(PASSWORD_RULES);
  }

  if (
    body.status !== undefined &&
    !["active", "inactive", "suspended"].includes(body.status)
  ) {
    errors.push("status must be active, inactive, or suspended.");
  }

  return errors;
};

const validateLogin = (body) => {
  const errors = [];

  if (!isEmail(body.email)) errors.push("A valid email is required.");
  if (!requiredString(body.password)) errors.push("password is required.");

  return errors;
};

/** Public fault-module sign-up: User / Technician / Admin → User schema roles. */
const validateSelfRegister = (body) => {
  const errors = [];

  if (!["user", "technician", "admin"].includes(body.accountType)) {
    errors.push("accountType must be user, technician, or admin.");
  }

  if (!requiredString(body.firstName) && !requiredString(body.fullName)) {
    errors.push("firstName or fullName is required.");
  }
  if (!requiredString(body.surname) && !requiredString(body.fullName)) {
    errors.push("surname or fullName is required.");
  }

  if (!isEmail(body.email)) errors.push("A valid email is required.");
  if (!requiredString(body.password)) {
    errors.push("password is required.");
  } else if (!isStrongPassword(body.password)) {
    errors.push(PASSWORD_RULES);
  }
  if (!requiredString(body.confirmPassword)) {
    errors.push("confirmPassword is required.");
  } else if (body.password !== body.confirmPassword) {
    errors.push("Password and confirmPassword must match.");
  }

  return errors;
};

const validateChangePassword = (body) => {
  const errors = [];

  if (!requiredString(body.currentPassword)) {
    errors.push("currentPassword is required.");
  }

  if (!requiredString(body.newPassword)) {
    errors.push("newPassword is required.");
  } else if (!isStrongPassword(body.newPassword)) {
    errors.push(PASSWORD_RULES);
  }

  return errors;
};

const validatePasswordResetRequest = (body) => {
  const errors = [];
  if (!isEmail(body.email)) errors.push("A valid email is required.");
  return errors;
};

const validateResetPassword = (body) => {
  const errors = [];

  if (!requiredString(body.token)) errors.push("token is required.");
  if (!requiredString(body.newPassword)) {
    errors.push("newPassword is required.");
  } else if (!isStrongPassword(body.newPassword)) {
    errors.push(PASSWORD_RULES);
  }

  return errors;
};

const validateStatusUpdate = (body) => {
  const errors = [];
  if (!["active", "inactive", "suspended"].includes(body.status)) {
    errors.push("status must be active, inactive, or suspended.");
  }

  return errors;
};

const validateRoleUpdate = (body) => {
  const errors = [];
  if (!requiredString(body.role)) errors.push("role is required.");
  return errors;
};

const validateProfileUpdate = (body) => {
  const errors = [];
  const allowedFields = ["username", "firstName", "surname", "phone"];
  const hasAnyAllowedField = allowedFields.some((field) => body[field] !== undefined);

  if (!hasAnyAllowedField) {
    errors.push("At least one profile field must be provided.");
  }

  for (const field of allowedFields) {
    if (body[field] !== undefined && typeof body[field] !== "string") {
      errors.push(`${field} must be a string.`);
    }
  }

  return errors;
};

module.exports = {
  validateChangePassword,
  validateLogin,
  validatePasswordResetRequest,
  validateProfileUpdate,
  validateRegistration,
  validateResetPassword,
  validateRoleUpdate,
  validateSelfRegister,
  validateStatusUpdate,
};
