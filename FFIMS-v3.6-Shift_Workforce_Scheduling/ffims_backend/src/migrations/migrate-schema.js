const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const env = require("../config/env");
const { connectDb } = require("../config/db");
const { seedRoles } = require("../seeders/role.seeder");
const Role = require("../models/role.model");
const User = require("../models/user.model");
const AuditLog = require("../models/audit-log.model");

const modelsDir = path.resolve(__dirname, "../models");

const splitFullName = (fullName = "") => {
  const [firstName = "", ...rest] = String(fullName).trim().split(/\s+/);
  return { firstName, surname: rest.join(" ") };
};

const loadModels = () => {
  for (const file of fs.readdirSync(modelsDir)) {
    if (file.endsWith(".model.js")) {
      require(path.join(modelsDir, file));
    }
  }
};

const normalizeUsers = async () => {
  const roles = await Role.find({}, { _id: 1, name: 1 }).lean();
  const roleMap = new Map(roles.map((role) => [String(role._id), role.name]));
  const users = await User.collection.find({}).toArray();
  let updated = 0;

  for (const user of users) {
    const set = {};
    const unset = {
      fullName: "",
      employeeId: "",
      department: "",
      roleId: "",
      status: "",
      lastLoginAt: "",
    };

    if (!user.username) {
      set.username = user.email ? String(user.email).split("@")[0] : `user_${user._id}`;
    }

    if (!user.firstName || !user.surname) {
      const derived = splitFullName(user.fullName);
      if (!user.firstName) {
        set.firstName = derived.firstName || "User";
      }
      if (!user.surname) {
        set.surname = derived.surname || "";
      }
    }

    if (!user.role) {
      const roleName = user.roleId ? roleMap.get(String(user.roleId)) : null;
      set.role = roleName || "General Staff";
    }

    if (typeof user.isActive !== "boolean") {
      set.isActive = user.status ? user.status === "active" : true;
    }

    if (user.lastLoginAt && !user.lastLogin) {
      set.lastLogin = user.lastLoginAt;
    }

    const hasSet = Object.keys(set).length > 0;
    if (hasSet || user.fullName !== undefined || user.employeeId !== undefined ||
      user.department !== undefined || user.roleId !== undefined ||
      user.status !== undefined || user.lastLoginAt !== undefined) {
      await User.collection.updateOne({ _id: user._id }, { ...(hasSet ? { $set: set } : {}), $unset: unset });
      updated += 1;
    }
  }

  return updated;
};

const normalizeAuditLogs = async () => {
  const logs = await AuditLog.collection.find({}).toArray();
  let updated = 0;

  for (const log of logs) {
    const set = {};
    const unset = {
      action: "",
      status: "",
      metadata: "",
    };

    if (!log.moduleName) {
      set.moduleName = "authentication";
    }

    if (!log.actionType) {
      set.actionType = log.action || "unknown";
    }

    if (log.entityName === undefined) {
      set.entityName = null;
    }

    if (log.entityId === undefined) {
      set.entityId = null;
    }

    if (log.oldValues === undefined) {
      set.oldValues = null;
    }

    if (log.newValues === undefined) {
      const metadata = log.metadata && typeof log.metadata === "object" ? log.metadata : null;
      const outcome = log.status || null;
      set.newValues = metadata || outcome ? { ...(metadata || {}), ...(outcome ? { outcome } : {}) } : null;
    }

    const hasSet = Object.keys(set).length > 0;
    if (hasSet || log.action !== undefined || log.status !== undefined || log.metadata !== undefined) {
      await AuditLog.collection.updateOne({ _id: log._id }, { ...(hasSet ? { $set: set } : {}), $unset: unset });
      updated += 1;
    }
  }

  return updated;
};

const initializeCollections = async () => {
  const tasks = mongoose.modelNames().map(async (name) => {
    const model = mongoose.model(name);
    await model.createCollection().catch(() => { });
    await model.init();
  });

  await Promise.all(tasks);
};

const run = async () => {
  await connectDb();
  loadModels();
  await seedRoles();

  const migratedUsers = await normalizeUsers();
  const migratedAuditLogs = await normalizeAuditLogs();
  await initializeCollections();

  console.log(`Migration complete for ${env.mongoUri}`);
  console.log(`Users normalized: ${migratedUsers}`);
  console.log(`Audit logs normalized: ${migratedAuditLogs}`);
};

run()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Migration failed:", error);
    await mongoose.disconnect().catch(() => { });
    process.exit(1);
  });
