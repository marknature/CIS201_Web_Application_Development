require("dotenv").config();

const isProd = process.env.NODE_ENV === "production";
const mongodbInMemory = process.env.MONGODB_IN_MEMORY === "true";

if (isProd) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret || jwtSecret === "change-this-secret") {
    throw new Error("Production misconfiguration: JWT_SECRET must be set to a non-default value.");
  }

  if (mongodbInMemory) {
    throw new Error("Production misconfiguration: MONGODB_IN_MEMORY must be false.");
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("Production misconfiguration: MONGODB_URI must be set.");
  }
}

const port = Number(process.env.PORT) || 5000;

module.exports = {
  APP_NAME: process.env.APP_NAME || "fault-ticketing-system",
  API_VERSION: process.env.API_VERSION || "1.0.0",
  PORT: port,
  MONGODB_URI: process.env.MONGODB_URI || "",
  // Optional. When unset, the database name comes from the URI path (e.g. .../ffims) or local fallback.
  MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || "",
  MONGODB_IN_MEMORY: mongodbInMemory,
  JWT_SECRET: process.env.JWT_SECRET || "change-this-secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  ASSET_API: process.env.ASSET_API || "http://localhost:4000/api/assets",
  PROCUREMENT_API: process.env.PROCUREMENT_API || "",
  PUBLIC_SERVICE_URL: process.env.PUBLIC_SERVICE_URL || `http://localhost:${port}`,
  FRONTEND_URL: process.env.FRONTEND_URL || ""
};
