const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const fs = require("fs");
const path = require("path");
const { PORT } = require("./src/config/config");
const {
  connectToDatabase,
  disconnectFromDatabase,
  checkDatabaseConnection,
  isUsingInMemoryDatabase
} = require("./src/config/db");
const { seedServiceAccounts } = require("./src/utils/serviceAccounts");
const { seedDemoData } = require("./src/utils/seedDemoData");
const routes = require("./src/routes");
const { errorHandler } = require("./src/middleware/errorHandler");
const { requestContext } = require("./src/middleware/requestContext");
const { buildOpenApiSpec } = require("./src/integration/openApiSpec");
const { startEscalationJob } = require("./src/jobs/escalationJob");
const { ok, fail } = require("./src/utils/apiResponse");

const app = express();

app.disable("x-powered-by");

if (!fs.existsSync(path.join(__dirname, "uploads"))) {
  fs.mkdirSync(path.join(__dirname, "uploads"));
}

// In production, avoid permissive CORS. In dev, keep the default behavior.
const isProd = process.env.NODE_ENV === "production";
const corsOrigin = process.env.CORS_ORIGIN;
const corsOptions = isProd
  ? corsOrigin
    ? { origin: corsOrigin.split(",").map((s) => s.trim()), credentials: true }
    : { origin: false }
  : {};
app.use(cors(corsOptions));
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-7",
    legacyHeaders: false
  })
);
app.use(requestContext);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (req, res) => {
  return ok(res, "Fault Ticket API is healthy", {
    status: "alive",
    database: isUsingInMemoryDatabase() ? "mongodb-memory-server" : "mongodb"
  });
});

app.get("/ready", async (req, res) => {
  const dependencyChecks = {
    database: await checkDatabaseConnection()
  };

  const ready = dependencyChecks.database.status === "up";
  if (!ready) {
    return fail(res, "Service is not ready", 503, dependencyChecks);
  }

  return ok(res, "Service is ready", dependencyChecks);
});

app.get("/.well-known/ffims-fault-ticketing.json", (req, res) => {
  return res.json({
    spec: buildOpenApiSpec(),
    discovery: {
      health: "/health",
      readiness: "/ready",
      capabilities: "/api/integration/capabilities",
      openApi: "/api/integration/openapi.json"
    }
  });
});

app.use("/api", routes);
app.use(errorHandler);

const start = async () => {
  await connectToDatabase();
  await seedServiceAccounts();
  const seededDemoTickets = await seedDemoData();

  if (seededDemoTickets.some((entry) => entry.created)) {
    console.log(
      `Seeded ${seededDemoTickets.filter((entry) => entry.created).length} demo ticket(s) for the live workspace.`
    );
  }

  const server = app.listen(PORT, () => {
    console.log(
      `Fault Ticket API running on port ${PORT} (${isUsingInMemoryDatabase() ? "in-memory MongoDB" : "MongoDB"})`
    );
    startEscalationJob();
  });

  const shutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down...`);
    server.close(async () => {
      await disconnectFromDatabase().catch(() => {});
      process.exit(0);
    });

    // Force shutdown if connections don't close.
    setTimeout(() => process.exit(1), 10_000).unref?.();
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

start().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
