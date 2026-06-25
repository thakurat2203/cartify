const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },
    familyId: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    revokeReason: {
      type: String,
      enum: [
        "rotated",
        "logout",
        "reuse-detected",
        "expired",
        "password-reset",
        "admin",
      ],
      default: null,
    },
    replacedByTokenHash: {
      type: String,
      default: null,
    },
    createdByIp: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// MongoDB automatically removes expired session records eventually.
// Authentication code will still check expiry immediately.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ user: 1, revokedAt: 1 });

module.exports = mongoose.model("Session", sessionSchema);