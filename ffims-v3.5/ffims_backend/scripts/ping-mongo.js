/**
 * Quick check: can we reach the database in MONGODB_URI? (Atlas or local)
 * Usage: node scripts/ping-mongo.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.log("No MONGODB_URI in .env");
  process.exit(1);
}

const redacted = uri.replace(/:([^:@/]+)@/, ":***@");
const isAtlas = uri.startsWith("mongodb+srv");

console.log("Redacted URI:", redacted);
console.log("Target type:", isAtlas ? "MongoDB Atlas (mongodb+srv)" : "Standard MongoDB URI (often local)");

mongoose
  .connect(uri, { serverSelectionTimeoutMS: 12000 })
  .then(() => {
    const st = mongoose.connection.readyState;
    const name = mongoose.connection.name;
    console.log("Result: CONNECTED (readyState=%s, db=%s)", st, name || "(default)");
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.log("Result: NOT REACHABLE —", err.message);
    process.exit(2);
  });
