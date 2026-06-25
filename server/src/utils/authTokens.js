const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config");

const getUserId = (user) => String(user._id || user.id);

const createAccessToken = (user) => {
  return jwt.sign(
    {
      userId: getUserId(user),
      role: user.role,
      tokenType: "access",
    },
    config.accessTokenSecret,
    {
      expiresIn: config.accessTokenExpiresIn,
    },
  );
};

const createRefreshToken = (user, familyId = crypto.randomUUID()) => {
  const token = jwt.sign(
    {
      userId: getUserId(user),
      familyId,
      tokenType: "refresh",
    },
    config.refreshTokenSecret,
    {
      expiresIn: config.refreshTokenExpiresIn,
      jwtid: crypto.randomUUID(),
    },
  );

  return { token, familyId };
};

const createTokenPair = (user, familyId) => {
  const accessToken = createAccessToken(user);
  const refreshResult = createRefreshToken(user, familyId);

  return {
    accessToken,
    refreshToken: refreshResult.token,
    familyId: refreshResult.familyId,
  };
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const getTokenExpiry = (token) => {
  const decoded = jwt.decode(token);

  if (!decoded?.exp) {
    throw new Error("Token does not contain an expiry");
  }

  return new Date(decoded.exp * 1000);
};

const verifyAccessToken = (token) => {
  const decoded = jwt.verify(token, config.accessTokenSecret);

  if (decoded.tokenType !== "access") {
    throw new Error("Invalid access token type");
  }

  return decoded;
};

const verifyRefreshToken = (token) => {
  const decoded = jwt.verify(token, config.refreshTokenSecret);

  if (decoded.tokenType !== "refresh") {
    throw new Error("Invalid refresh token type");
  }

  return decoded;
};

module.exports = {
  createTokenPair,
  hashToken,
  getTokenExpiry,
  verifyAccessToken,
  verifyRefreshToken,
};