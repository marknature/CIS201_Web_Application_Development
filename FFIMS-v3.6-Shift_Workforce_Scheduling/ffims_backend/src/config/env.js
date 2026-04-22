const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ffims",
  jwtSecret: process.env.JWT_SECRET || "change-me-to-a-long-random-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  passwordResetTokenExpiresMinutes:
    Number(process.env.PASSWORD_RESET_TOKEN_EXPIRES_MINUTES) || 15,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  /** Shared by demo User / Technician / Admin fault-module logins (must match VITE_FAULT_DEMO_PASSWORD on frontend). */
  demoFaultUsersPassword: process.env.DEMO_FAULT_USERS_PASSWORD || "DemoSwitch123!",

  /**
   * After Mongo connects, create demo fault accounts if missing.
   * Default on in non-production; set SEED_DEMO_FAULT_USERS=false to skip.
   * In production, set SEED_DEMO_FAULT_USERS=true to enable.
   */
  seedDemoFaultUsersOnStart:
    process.env.SEED_DEMO_FAULT_USERS === "true" ||
    (process.env.NODE_ENV !== "production" &&
      process.env.SEED_DEMO_FAULT_USERS !== "false"),

  /**
   * POST /api/auth/register-open (fault module self-signup).
   * Production: set ALLOW_PUBLIC_FAULT_SIGNUP=true to enable.
   * Non-production: enabled unless ALLOW_PUBLIC_FAULT_SIGNUP=false.
   */
  allowPublicFaultSignup:
    process.env.ALLOW_PUBLIC_FAULT_SIGNUP === "true" ||
    (process.env.NODE_ENV !== "production" &&
      process.env.ALLOW_PUBLIC_FAULT_SIGNUP !== "false"),

  /**
   * Allows accountType "admin" (system_administrator) on register-open.
   * Production: set ALLOW_PUBLIC_ADMIN_SIGNUP=true explicitly.
   */
  allowPublicAdminSignUp:
    process.env.ALLOW_PUBLIC_ADMIN_SIGNUP === "true" ||
    (process.env.NODE_ENV !== "production" &&
      process.env.ALLOW_PUBLIC_ADMIN_SIGNUP !== "false"),
};
