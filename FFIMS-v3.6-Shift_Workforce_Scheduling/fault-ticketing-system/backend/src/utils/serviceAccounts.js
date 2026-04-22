const bcrypt = require("bcryptjs");
const { UserDocument } = require("../models/mongoCollections");

const DEFAULT_SERVICE_ACCOUNTS = Object.freeze({
  user: {
    email: "demo.user@ffims.local",
    password: "DemoUser123!",
    defaultName: "Demo User"
  },
  technician: {
    email: "technician@ffims.local",
    password: "Technician123!",
    defaultName: "Default Technician"
  },
  admin: {
    email: "admin@ffims.local",
    password: "Admin123!",
    defaultName: "Default Admin"
  }
});

const normalizeCredential = (value) => String(value || "").trim().toLowerCase();

const seedAccountIfMissing = async ({ email, password, role, defaultName }) => {
  const normalizedEmail = normalizeCredential(email);
  const normalizedPassword = String(password || "").trim();

  if (!normalizedEmail || !normalizedPassword) {
    return null;
  }

  const existing = await UserDocument.findOne({ email: normalizedEmail });
  if (existing) {
    return existing;
  }

  const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
  return UserDocument.create({
    name: defaultName,
    email: normalizedEmail,
    password: hashedPassword,
    role
  });
};

const resolveServiceAccount = ({ envEmail, envPassword, fallbackAccount, role, allowFallbackDefaults }) => {
  const email = normalizeCredential(envEmail) || (allowFallbackDefaults ? fallbackAccount.email : "");
  const password = String(envPassword || "").trim() || (allowFallbackDefaults ? fallbackAccount.password : "");

  if (!email || !password) {
    return null;
  }

  return {
    email,
    password,
    role,
    defaultName: fallbackAccount.defaultName
  };
};

const seedServiceAccounts = async ({ allowFallbackDefaults = process.env.NODE_ENV !== "production" } = {}) => {
  const accounts = [
    resolveServiceAccount({
      envEmail: process.env.DEMO_USER_EMAIL,
      envPassword: process.env.DEMO_USER_PASSWORD,
      fallbackAccount: DEFAULT_SERVICE_ACCOUNTS.user,
      role: "user",
      allowFallbackDefaults
    }),
    resolveServiceAccount({
      envEmail: process.env.TECH_EMAIL,
      envPassword: process.env.TECH_PASSWORD,
      fallbackAccount: DEFAULT_SERVICE_ACCOUNTS.technician,
      role: "technician",
      allowFallbackDefaults
    }),
    resolveServiceAccount({
      envEmail: process.env.ADMIN_EMAIL,
      envPassword: process.env.ADMIN_PASSWORD,
      fallbackAccount: DEFAULT_SERVICE_ACCOUNTS.admin,
      role: "admin",
      allowFallbackDefaults
    })
  ].filter(Boolean);

  const seeded = await Promise.all(accounts.map((account) => seedAccountIfMissing(account)));
  return seeded.filter(Boolean);
};

module.exports = {
  DEFAULT_SERVICE_ACCOUNTS,
  seedServiceAccounts
};
