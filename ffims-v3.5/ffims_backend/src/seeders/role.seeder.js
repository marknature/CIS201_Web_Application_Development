const mongoose = require("mongoose");
const env = require("../config/env");
const { connectDb } = require("../config/db");
const Role = require("../models/role.model");

const defaultRoles = [
  {
    name: "Admin",
    description: "System administrator with full user and role management access.",
    permissions: [
      "users:create",
      "users:update",
      "users:status",
      "users:role",
      "maintenance:manage",
      "requests:approve",
    ],
  },
  {
    name: "Fleet Staff",
    description: "Manages vehicles, fleet requests, and maintenance records.",
    permissions: ["fleet:manage", "maintenance:manage", "requests:view"],
  },
  {
    name: "Facilities Staff",
    description: "Manages facilities, buildings, and maintenance records.",
    permissions: ["facilities:manage", "maintenance:manage", "requests:view"],
  },
  {
    name: "Operations Staff",
    description: "Coordinates operational workflows and approvals.",
    permissions: ["operations:manage", "requests:approve", "reports:view"],
  },
  {
    name: "General Staff",
    description: "Can submit requests and view their own activity.",
    permissions: ["requests:create", "requests:view:own"],
  },
];

const seedRoles = async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDb();
  }

  for (const role of defaultRoles) {
    await Role.updateOne({ name: role.name }, role, { upsert: true });
  }
};

if (require.main === module) {
  seedRoles()
    .then(async () => {
      console.log(`Seeded ${defaultRoles.length} roles into ${env.mongoUri}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Role seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { defaultRoles, seedRoles };
