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
