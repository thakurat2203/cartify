const dotenv = require("dotenv");

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const getTrimmedEnv = (key, fallback = "") =>
  (process.env[key] || fallback).trim();

const requiredEnvVars = [
  "MONGO_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  ...(isProduction
    ? ["CLIENT_URL", "RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"]
    : []),
];

const missingEnvVars = requiredEnvVars.filter(
  (key) => !process.env[key]?.trim(),
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`,
  );
}

const accessTokenSecret = process.env.JWT_ACCESS_SECRET.trim();
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET.trim();

if (accessTokenSecret.length < 32 || refreshTokenSecret.length < 32) {
  throw new Error("JWT secrets must contain at least 32 characters");
}

if (accessTokenSecret === refreshTokenSecret) {
  throw new Error("Access and refresh token secrets must be different");
}

const parsePositiveInteger = (value, fallback, name) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return parsed;
};

const paymentReservationTtlMinutes = parsePositiveInteger(
  process.env.PAYMENT_RESERVATION_TTL_MINUTES,
  15,
  "PAYMENT_RESERVATION_TTL_MINUTES",
);

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",

  accessTokenSecret,
  refreshTokenSecret,
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRE || "15m",
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
  refreshSessionMaxAgeMs: 30 * 24 * 60 * 60 * 1000,
  accessTokenMaxAgeMs: 15 * 60 * 1000,

  accessCookieName: "cartify_access",
  refreshCookieName: "cartify_refresh",

  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",

  razorpay: {
    keyId: getTrimmedEnv("RAZORPAY_KEY_ID"),
    keySecret: getTrimmedEnv("RAZORPAY_KEY_SECRET"),
    currency: "INR",
    configured: Boolean(
      getTrimmedEnv("RAZORPAY_KEY_ID") &&
        getTrimmedEnv("RAZORPAY_KEY_SECRET"),
    ),
  },
  paymentReservationTtlMinutes,
  paymentReservationTtlMs: paymentReservationTtlMinutes * 60 * 1000,
};

module.exports = config;
