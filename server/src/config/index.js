const dotenv = require("dotenv");

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  ...(isProduction ? ["CLIENT_URL"] : []),
];
const missingEnvVars = requiredEnvVars.filter(
  (key) => !process.env[key]?.trim(),
);

// Fail fast when secrets/config needed by production flows are missing.
if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`,
  );
}

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || "1d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
};

module.exports = config;
