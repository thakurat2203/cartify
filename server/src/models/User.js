const mongoose = require("mongoose");

// User role drives admin access in both the API middleware and client navigation.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["guest", "shopper", "admin"],
      default: "shopper",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
