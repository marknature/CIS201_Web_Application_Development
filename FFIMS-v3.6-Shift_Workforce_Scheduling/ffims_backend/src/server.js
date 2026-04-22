require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(`\nServer running on http://localhost:${PORT}`);
    console.log("Swagger Docs:");
    console.log(`   UI     http://localhost:${PORT}/api/docs`);
    console.log(`   JSON   http://localhost:${PORT}/api/openapi.json`);
    console.log("API Endpoints:");
    console.log(`   GET    http://localhost:${PORT}/api/`);
    console.log(`   POST   http://localhost:${PORT}/api/auth/login`);
    console.log(`   POST   http://localhost:${PORT}/api/auth/register`);
    console.log(`   GET    http://localhost:${PORT}/api/auth/me`);
    console.log(`   POST   http://localhost:${PORT}/api/auth/change-password`);
    console.log(`   POST   http://localhost:${PORT}/api/auth/request-password-reset`);
    console.log(`   POST   http://localhost:${PORT}/api/auth/reset-password`);
    console.log(`   GET    http://localhost:${PORT}/api/fault-tickets`);
    console.log(`   GET    http://localhost:${PORT}/api/maintenance`);
    console.log(`   GET    http://localhost:${PORT}/api/utilities/alerts`);
    console.log(`   GET    http://localhost:${PORT}/api/health`);
    console.log(`   GET    http://localhost:${PORT}/health\n`);
    console.log(`MongoDB connected successfully to: ${process.env.MONGODB_URI}`);
    console.log(`Database: ${mongoose.connection.name}`);

    app.listen(PORT);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.error("Please make sure MongoDB is running on your system");
    process.exit(1);
  });
// ffims_backend/src/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const env = require("./config/env");
const { connectDb } = require("./config/db");
const { seedDemoFaultUsers } = require("./seeders/demo-fault-users.seeder");
const { seedDefaultAccounts } = require("./utils/user-seeder");
const routes = require("./routes/index");
const { errorHandler } = require("./middleware/error.middleware");

const app = express();
const PORT = env.port;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api", routes);

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "FFIMS Backend is running",
    mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.method} ${req.url} not found`,
  });
});

app.use(errorHandler);

async function start() {
  try {
    await connectDb();
    console.log("✅ MongoDB connected:", env.mongoUri.replace(/:([^:@/]+)@/, ":***@"));
    console.log("📊 Database:", mongoose.connection.name);

    if (env.seedDemoFaultUsersOnStart) {
      const result = await seedDemoFaultUsers();
      if (result.created > 0) {
        console.log(`👤 Seeded ${result.created} fault demo user(s) (User / Technician / Admin).`);
      }
    }

    await seedDefaultAccounts();
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(
      `📝 Auth: POST /api/auth/login  ·  POST /api/auth/register-open  ·  Fault demo users (see .env)`
    );
    console.log(`📝 Health: GET http://localhost:${PORT}/health\n`);
  });
}

start();
