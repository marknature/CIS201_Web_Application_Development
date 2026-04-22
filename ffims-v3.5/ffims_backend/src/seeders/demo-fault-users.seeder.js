const mongoose = require("mongoose");
const env = require("../config/env");
const { connectDb } = require("../config/db");
const User = require("../models/user.model");

/** Must match `role` enum on User model and fault-ticketing.service RBAC. */
const DEMO_USERS = [
  {
    email: "fault-demo-admin@ffims.local",
    firstName: "Demo",
    surname: "Administrator",
    role: "system_administrator",
  },
  {
    email: "fault-demo-technician@ffims.local",
    firstName: "Demo",
    surname: "Technician",
    role: "operational_staff",
  },
  {
    email: "fault-demo-user@ffims.local",
    firstName: "Demo",
    surname: "Reporter",
    role: "general_university_staff",
  },
];

const seedDemoFaultUsers = async () => {
  if (mongoose.connection.readyState === 0) {
    await connectDb();
  }

  const plainPassword = env.demoFaultUsersPassword;
  if (!plainPassword || plainPassword.length < 8) {
    console.warn(
      "demo-fault-users: DEMO_FAULT_USERS_PASSWORD missing or too short; skipping demo user seed."
    );
    return { created: 0, existing: DEMO_USERS.length };
  }

  let created = 0;

  for (const demo of DEMO_USERS) {
    const email = demo.email.trim().toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) {
      continue;
    }

    // User model pre-save hashes `passwordHash` as plaintext — pass the demo password, not a bcrypt string.
    await User.create({
      username: email.split("@")[0],
      firstName: demo.firstName,
      surname: demo.surname,
      email,
      phone: "",
      passwordHash: plainPassword,
      role: demo.role,
      isActive: true,
    });
    created += 1;
  }

  return { created, existing: DEMO_USERS.length - created };
};

if (require.main === module) {
  seedDemoFaultUsers()
    .then((result) => {
      console.log(`Demo fault users: created ${result.created}, already present ${result.existing}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Demo fault user seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { DEMO_USERS, seedDemoFaultUsers };
