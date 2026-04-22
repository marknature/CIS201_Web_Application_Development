/**
 * Initializes MongoDB connectivity, syncs indexes, and seeds the demo
 * service accounts and sample tickets used by the live workspace.
 *
 * Usage:
 *   npm run db:init
 */

require("dotenv").config();
const { connectToDatabase, disconnectFromDatabase } = require("../config/db");
const { seedDemoData } = require("./seedDemoData");
const { seedServiceAccounts } = require("./serviceAccounts");
const {
  UserDocument,
  FaultDocument,
  TicketDocument,
  CommentDocument,
  TicketImageDocument,
  TicketLogDocument,
  NotificationDocument
} = require("../models/mongoCollections");

async function main() {
  await connectToDatabase();

  await Promise.all([
    UserDocument.syncIndexes(),
    FaultDocument.syncIndexes(),
    TicketDocument.syncIndexes(),
    CommentDocument.syncIndexes(),
    TicketImageDocument.syncIndexes(),
    TicketLogDocument.syncIndexes(),
    NotificationDocument.syncIndexes()
  ]);

  await seedServiceAccounts();
  const seededDemoTickets = await seedDemoData();

  if (seededDemoTickets.some((entry) => entry.created)) {
    console.log(
      `MongoDB connection verified, indexes synced, and ${seededDemoTickets.filter((entry) => entry.created).length} demo ticket(s) seeded.`
    );
  } else {
    console.log("MongoDB connection verified and indexes synced.");
  }
  await disconnectFromDatabase();
}

main().catch(async (error) => {
  console.error("DB init failed:", error);
  await disconnectFromDatabase().catch(() => {});
  process.exit(1);
});
