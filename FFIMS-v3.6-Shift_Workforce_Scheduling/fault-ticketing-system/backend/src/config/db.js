const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server-core");
const {
  MONGODB_URI,
  MONGODB_DB_NAME,
  MONGODB_IN_MEMORY
} = require("./config");

mongoose.set("strictQuery", true);
mongoose.set("bufferCommands", false);

let memoryServer = null;
let connectionPromise = null;

const shouldUseInMemoryDatabase = () => MONGODB_IN_MEMORY;

const localDatabaseName = () => MONGODB_DB_NAME || "fault_ticketing";

const getDatabaseUri = async () => {
  if (shouldUseInMemoryDatabase()) {
    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: localDatabaseName()
        }
      });
    }

    return memoryServer.getUri();
  }

  return MONGODB_URI || `mongodb://127.0.0.1:27017/${localDatabaseName()}`;
};

const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    const uri = await getDatabaseUri();
    const connectOptions = { serverSelectionTimeoutMS: 5000 };
    // Only override DB name when explicitly set; otherwise use the name in the URI (Atlas: .../ffims/...).
    if (MONGODB_DB_NAME) {
      connectOptions.dbName = MONGODB_DB_NAME;
    }
    await mongoose.connect(uri, connectOptions);
    return mongoose.connection;
  })();

  try {
    return await connectionPromise;
  } finally {
    connectionPromise = null;
  }
};

const disconnectFromDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

const checkDatabaseConnection = async () => {
  try {
    await connectToDatabase();
    await mongoose.connection.db.admin().command({ ping: 1 });
    return { status: "up" };
  } catch (error) {
    return {
      status: "down",
      message: process.env.NODE_ENV === "production" ? "Database unreachable" : error.message
    };
  }
};

module.exports = {
  mongoose,
  connectToDatabase,
  disconnectFromDatabase,
  checkDatabaseConnection,
  isUsingInMemoryDatabase: shouldUseInMemoryDatabase
};
