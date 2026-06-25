const config = require("../config");
const { verifyAccessToken } = require("../utils/authTokens");
const sendErrorResponse = require("../utils/errorResponse");

// Attach verified access-token claims for controllers and role checks.
const protect = (req, res, next) => {
  const accessToken = req.cookies?.[config.accessCookieName];

  if (!accessToken) {
    sendErrorResponse(res, {
      statusCode: 401,
      message: "Not authorized, access token missing",
      code: "AUTH_TOKEN_MISSING",
    });
    return;
  }

  try {
    const decoded = verifyAccessToken(accessToken);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    const tokenExpired = err.name === "TokenExpiredError";

    sendErrorResponse(res, {
      statusCode: 401,
      message: tokenExpired
        ? "Not authorized, access token expired"
        : "Not authorized, access token invalid",
      code: tokenExpired
        ? "AUTH_TOKEN_EXPIRED"
        : "AUTH_TOKEN_INVALID",
    });
  }
};

// Keep route-level authorization explicit beside each protected admin endpoint.
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendErrorResponse(res, {
        statusCode: 403,
        message: "Forbidden: insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
      });
      return;
    }

    next();
  };
};

module.exports = { protect, authorizeRoles };