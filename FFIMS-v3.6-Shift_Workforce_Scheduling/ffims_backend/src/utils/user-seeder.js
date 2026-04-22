const User = require("../models/user.model");

/**
 * Seeds production-ready accounts for the Fault Reporting & Ticketing system.
 * This ensures the system is always accessible after deployment.
 */
async function seedDefaultAccounts() {
  const defaults = [
    {
      email: "admin@ffims.com",
      username: "admin_ffims",
      firstName: "System",
      surname: "Administrator",
      passwordHash: "Admin@123", // Will be hashed by pre-save hook
      role: "admin",
    },
    {
      email: "tech@ffims.com",
      username: "tech_ffims",
      firstName: "Lead",
      surname: "Technician",
      passwordHash: "Tech@123", // Will be hashed by pre-save hook
      role: "technician",
    },
  ];

  let createdCount = 0;

  for (const account of defaults) {
    const exists = await User.findOne({ email: account.email });
    if (!exists) {
      await User.create(account);
      createdCount++;
    }
  }

  if (createdCount > 0) {
    console.log(`✅ Seeded ${createdCount} production user accounts (Fault Ticketing).`);
  }
}

module.exports = { seedDefaultAccounts };
