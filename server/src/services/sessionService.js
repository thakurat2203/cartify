const Session = require("../models/Session");
const User = require("../models/User");
const createError = require("../utils/createError");
const toPublicUser = require("../utils/publicUser");
const {
  createTokenPair,
  hashToken,
  getTokenExpiry,
  verifyRefreshToken,
} = require("../utils/authTokens");

const invalidSessionError = () =>
  createError("Invalid or expired refresh session", 401);

const getSessionMetadata = (metadata = {}) => ({
  createdByIp: metadata.ip || "",
  userAgent: (metadata.userAgent || "").slice(0, 500),
});

const markFamilyCompromised = async (familyId) => {
  await Session.updateMany(
    { familyId },
    {
      $set: {
        revokedAt: new Date(),
        revokeReason: "reuse-detected",
      },
    },
  );
};

class SessionService {
  async createSession(user, metadata = {}) {
    const tokens = createTokenPair(user);
    const refreshTokenHash = hashToken(tokens.refreshToken);

    await Session.create({
      user: user._id || user.id,
      tokenHash: refreshTokenHash,
      familyId: tokens.familyId,
      expiresAt: getTokenExpiry(tokens.refreshToken),
      ...getSessionMetadata(metadata),
    });

    return tokens;
  }

  async rotateSession(refreshToken, metadata = {}) {
    if (!refreshToken) {
      throw invalidSessionError();
    }

    let decoded;

    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      // Record an expired session when its expired token is presented.
      if (error.name === "TokenExpiredError") {
        await Session.findOneAndUpdate(
          {
            tokenHash: hashToken(refreshToken),
            revokedAt: null,
          },
          {
            $set: {
              revokedAt: new Date(),
              revokeReason: "expired",
            },
          },
        );
      }

      throw invalidSessionError();
    }

    const currentTokenHash = hashToken(refreshToken);
    const currentSession = await Session.findOne({
      tokenHash: currentTokenHash,
    });

    if (!currentSession) {
      throw invalidSessionError();
    }

    const sessionDoesNotMatchToken =
      String(currentSession.user) !== String(decoded.userId) ||
      currentSession.familyId !== decoded.familyId;

    if (sessionDoesNotMatchToken) {
      await markFamilyCompromised(currentSession.familyId);
      throw invalidSessionError();
    }

    if (currentSession.revokedAt) {
      await markFamilyCompromised(currentSession.familyId);
      throw createError(
        "Refresh token reuse detected. Please log in again.",
        401,
      );
    }

    if (currentSession.expiresAt <= new Date()) {
      currentSession.revokedAt = new Date();
      currentSession.revokeReason = "expired";
      await currentSession.save();

      throw invalidSessionError();
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      await markFamilyCompromised(currentSession.familyId);
      throw invalidSessionError();
    }

    const nextTokens = createTokenPair(user, currentSession.familyId);
    const nextTokenHash = hashToken(nextTokens.refreshToken);
    const now = new Date();

    // Only one request may rotate this active session.
    const rotatedSession = await Session.findOneAndUpdate(
      {
        _id: currentSession._id,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: now,
          revokeReason: "rotated",
          replacedByTokenHash: nextTokenHash,
          lastUsedAt: now,
        },
      },
    );

    if (!rotatedSession) {
      await markFamilyCompromised(currentSession.familyId);
      throw createError(
        "Refresh token reuse detected. Please log in again.",
        401,
      );
    }

    await Session.create({
      user: user._id,
      tokenHash: nextTokenHash,
      familyId: currentSession.familyId,
      expiresAt: getTokenExpiry(nextTokens.refreshToken),
      ...getSessionMetadata(metadata),
    });

    // Covers the case where two refresh requests raced each other.
    const compromised = await Session.exists({
      _id: currentSession._id,
      revokeReason: "reuse-detected",
    });

    if (compromised) {
      await markFamilyCompromised(currentSession.familyId);

      throw createError(
        "Refresh token reuse detected. Please log in again.",
        401,
      );
    }

    return {
      tokens: nextTokens,
      user: toPublicUser(user),
    };
  }

  async revokeSession(refreshToken) {
    if (!refreshToken) {
      return;
    }

    const session = await Session.findOne({
      tokenHash: hashToken(refreshToken),
    });

    if (!session) {
      return;
    }

    await Session.updateMany(
      {
        familyId: session.familyId,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
          revokeReason: "logout",
        },
      },
    );
  }

  async revokeUserSessions(userId, reason = "admin") {
    await Session.updateMany(
      {
        user: userId,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
          revokeReason: reason,
        },
      },
    );
  }
}

module.exports = new SessionService();
