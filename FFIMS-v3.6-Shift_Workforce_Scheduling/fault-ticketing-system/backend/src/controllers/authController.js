const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/config");
const { ok, fail } = require("../utils/apiResponse");
const { normalizePublicRole } = require("../utils/registrationRoles");

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findByEmail(email);
    if (existing) return fail(res, "Email already exists", 409);

    const publicRole = normalizePublicRole(role);
    if (!publicRole) {
      return fail(res, "Public registration only supports user accounts", 403);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: publicRole
    });

    return ok(res, "User registered successfully", user, 201);
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return fail(res, "Invalid credentials", 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return fail(res, "Invalid credentials", 401);

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    return ok(res, "Login successful", {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res) => ok(res, "Current user", req.user);
const assignableUsers = async (req, res, next) => {
  try {
    const users = await User.listAssignableUsers();
    return ok(res, "Assignable users fetched", users);
  } catch (error) {
    return next(error);
  }
};

module.exports = { assignableUsers, register, login, me };
