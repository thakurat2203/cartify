const mongoose = require("mongoose");
const config = require("../config");

// Connect once at startup before the API begins handling real requests.
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
