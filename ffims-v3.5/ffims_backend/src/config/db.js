const mongoose = require("mongoose");
const env = require("./env");

const connectDb = async () => {
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 15000,
    });
  } catch (error) {
    error.message = `MongoDB connection failed for '${env.mongoUri}'. Make sure MongoDB is running and your .env MONGODB_URI is correct. Original error: ${error.message}`;
    throw error;
  }
};

module.exports = { connectDb };
