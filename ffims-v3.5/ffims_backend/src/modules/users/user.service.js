const ApiError = require("../../utils/apiError");
const { createAuditLog } = require("../../utils/audit");
const Role = require("../../models/role.model");
const User = require("../../models/user.model");

const normalizeEmail = (email) => email.trim().toLowerCase();
const splitFullName = (fullName = "") => {
  const [firstName = "", ...rest] = fullName.trim().split(/\s+/);
  return {
    firstName,
    surname: rest.join(" "),
  };
};

const FAULT_PUBLIC_SIGNUP_ROLES = new Set([
  "general_university_staff",
  "operational_staff",
  "system_administrator",
]);

const createPublicFaultSignUpUser = async ({ email, password, firstName, surname, role }, req) => {
  if (!FAULT_PUBLIC_SIGNUP_ROLES.has(role)) {
    throw new ApiError(400, "Invalid role for public registration.");
  }

  const norm = normalizeEmail(email);
  const existingUser = await User.findOne({ email: norm });
  if (existingUser) {
    throw new ApiError(409, "A user with that email already exists.");
  }

  const user = await User.create({
    username: norm.split("@")[0],
    firstName: String(firstName || "").trim(),
    surname: String(surname || "").trim(),
    email: norm,
    phone: "",
    passwordHash: password,
    role,
    isActive: true,
  });

  const savedUser = await User.findById(user._id);

  await createAuditLog({
    userId: savedUser._id,
    moduleName: "authentication",
    action: "self_registration",
    entityName: "users",
    entityId: savedUser._id,
    newValues: {
      email: norm,
      role,
      outcome: "success",
    },
    req,
  });

  return savedUser;
};

const getRoleByName = async (roleName) => {
  const role = await Role.findOne({ name: roleName });
  if (!role) {
    throw new ApiError(400, `Role '${roleName}' does not exist.`);
  }

  return role;
};

const createUser = async (payload, reqUser, req) => {
  const email = normalizeEmail(payload.email);
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "A user with that email already exists.");
  }

  const role = await getRoleByName(payload.role);
  const derivedNames =
    payload.fullName && (!payload.firstName || !payload.surname)
      ? splitFullName(payload.fullName)
      : { firstName: payload.firstName, surname: payload.surname };

  const user = await User.create({
    username: payload.username?.trim() || email.split("@")[0],
    firstName: derivedNames.firstName?.trim(),
    surname: derivedNames.surname?.trim(),
    email,
    phone: payload.phone?.trim() || "",
    // Plain text: User model pre-save hashes passwordHash (do not pre-hash here).
    passwordHash: payload.password,
    role: role.name,
    isActive:
      payload.isActive !== undefined
        ? Boolean(payload.isActive)
        : payload.status
          ? payload.status === "active"
          : true,
  });

  const savedUser = await User.findById(user._id);

  await createAuditLog({
    userId: reqUser?._id || null,
    moduleName: "users",
    action: "account_creation",
    entityName: "users",
    entityId: user._id,
    newValues: {
      createdUserId: user._id.toString(),
      createdUserEmail: user.email,
      assignedRole: role.name,
      outcome: "success",
    },
    req,
  });

  return savedUser;
};

const findUserByIdOrFail = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return user;
};

const updateOwnProfile = async (userId, payload) => {
  const allowedFields = ["username", "firstName", "surname", "phone"];
  const updates = {};

  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      updates[field] = typeof payload[field] === "string" ? payload[field].trim() : payload[field];
    }
  }

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  return user;
};

const updateUserStatus = async (userId, status, reqUser, req) => {
  const user = await findUserByIdOrFail(userId);
  user.isActive = status === "active";
  await user.save();

  await createAuditLog({
    userId: reqUser._id,
    moduleName: "users",
    action: status === "active" ? "account_activation" : "account_deactivation",
    entityName: "users",
    entityId: user._id,
    newValues: {
      newStatus: status,
      outcome: "success",
    },
    req,
  });

  return user;
};

const updateUserRole = async (userId, roleName, reqUser, req) => {
  const user = await findUserByIdOrFail(userId);
  const role = await getRoleByName(roleName);

  user.role = role.name;
  await user.save();

  await createAuditLog({
    userId: reqUser._id,
    moduleName: "users",
    action: "role_change",
    entityName: "users",
    entityId: user._id,
    newValues: {
      newRole: role.name,
      outcome: "success",
    },
    req,
  });

  return user;
};

const listUsers = async ({ role, isActive, page = 1, pageSize = 20 }) => {
  const normalizedPage = Math.max(Number(page) || 1, 1);
  const normalizedPageSize = Math.min(Math.max(Number(pageSize) || 20, 1), 100);
  const query = {};

  if (role) {
    query.role = role;
  }

  if (isActive !== undefined) {
    query.isActive = String(isActive).toLowerCase() === "true";
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ firstName: 1, surname: 1 })
      .skip((normalizedPage - 1) * normalizedPageSize)
      .limit(normalizedPageSize),
    User.countDocuments(query),
  ]);

  return {
    items: users.map((user) => user.toSafeObject()),
    meta: {
      page: normalizedPage,
      pageSize: normalizedPageSize,
      total,
    },
  };
};

const getUserById = async (userId) => {
  const user = await findUserByIdOrFail(userId);
  return user.toSafeObject();
};

module.exports = {
  createPublicFaultSignUpUser,
  createUser,
  findUserByIdOrFail,
  getUserById,
  getRoleByName,
  listUsers,
  normalizeEmail,
  splitFullName,
  updateOwnProfile,
  updateUserRole,
  updateUserStatus,
};
