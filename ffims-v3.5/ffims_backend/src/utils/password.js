const bcrypt = require("bcryptjs");
const env = require("../config/env");

const PASSWORD_RULES =
  "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.";

const isStrongPassword = (password) =>
  typeof password === "string" &&
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password);

const hashPassword = async (password) =>
  bcrypt.hash(password, env.bcryptSaltRounds);

const comparePassword = async (password, passwordHash) =>
  bcrypt.compare(password, passwordHash);

module.exports = {
  PASSWORD_RULES,
  comparePassword,
  hashPassword,
  isStrongPassword,
};
